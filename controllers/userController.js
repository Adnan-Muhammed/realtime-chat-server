// ═══════════════════════════════════════════════════════════════
// controllers/userController.js — User & Friend Logic
//
// Handles:
//   getUsers          → Fetch all users for the Discover page
//   getFriends        → Fetch current user's accepted friends
//   handleConnection  → Send/accept/reject/withdraw friend requests
// ═══════════════════════════════════════════════════════════════

import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

// ─── Get All Users (Discover Page) ──────────────────────────
// Returns all users except the current user, with their
// connection status relative to the current user:
//   "none"             → No relationship
//   "connected"        → Already friends
//   "pending_sent"     → Current user sent them a request
//   "pending_received" → They sent current user a request
export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all users except self
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('name photoUrl friends friendRequestsSent friendRequestsReceived');

    // Calculate connection status for each user
    const formattedUsers = users.map(user => {
      let status = 'none';

      if (user.friends.includes(currentUserId)) {
        status = 'connected';
      } else if (user.friendRequestsReceived.includes(currentUserId)) {
        status = 'pending_sent';       // We sent THEM a request
      } else if (user.friendRequestsSent.includes(currentUserId)) {
        status = 'pending_received';   // THEY sent US a request
      }

      return {
        id: user._id,
        name: user.name,
        photoUrl: user.photoUrl,
        status
      };
    });

    res.status(200).json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// ─── Get Friends List ────────────────────────────────────────
// Returns the current user's accepted friends with their profile info.
// Uses .populate() to fetch friend details from the User collection.
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId)
      .populate('friends', 'name photoUrl');

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format for frontend display
    const formattedFriends = currentUser.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      photoUrl: friend.photoUrl,
      lastMessage: '',  // TODO: Integrate with message history
      time: '',
      unread: 0
    }));

    res.status(200).json({ success: true, friends: formattedFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch friends' });
  }
};

// ─── Handle Friend Connection Actions ────────────────────────
// Supports 4 actions via req.body.action:
//
//   "connect"  → Send a friend request
//   "withdraw" → Cancel a sent friend request
//   "accept"   → Accept a received friend request
//   "reject"   → Reject a received friend request
//
// After the action, creates a notification and emits socket events.
export const handleConnection = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId, action } = req.body;

    // Validate input
    if (!targetUserId || !action) {
      return res.status(400).json({ success: false, message: 'Target user ID and action are required' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // ─── Execute the requested action ──────────────────────────
    switch (action) {
      case 'connect':
        // Add to pending lists (current → sent, target → received)
        if (!currentUser.friendRequestsSent.includes(targetUserId)) {
          currentUser.friendRequestsSent.push(targetUserId);
        }
        if (!targetUser.friendRequestsReceived.includes(currentUserId)) {
          targetUser.friendRequestsReceived.push(currentUserId);
        }
        break;

      case 'withdraw':
        // Remove from pending lists
        currentUser.friendRequestsSent = currentUser.friendRequestsSent
          .filter(id => id.toString() !== targetUserId.toString());
        targetUser.friendRequestsReceived = targetUser.friendRequestsReceived
          .filter(id => id.toString() !== currentUserId.toString());
        break;

      case 'accept':
        // Move from pending → friends (both sides)
        if (currentUser.friendRequestsReceived.includes(targetUserId)) {
          // Remove from pending
          currentUser.friendRequestsReceived = currentUser.friendRequestsReceived
            .filter(id => id.toString() !== targetUserId.toString());
          targetUser.friendRequestsSent = targetUser.friendRequestsSent
            .filter(id => id.toString() !== currentUserId.toString());

          // Add to friends (both sides)
          if (!currentUser.friends.includes(targetUserId)) currentUser.friends.push(targetUserId);
          if (!targetUser.friends.includes(currentUserId)) targetUser.friends.push(currentUserId);
        }
        break;

      case 'reject':
        // Remove from pending lists (no friendship created)
        currentUser.friendRequestsReceived = currentUser.friendRequestsReceived
          .filter(id => id.toString() !== targetUserId.toString());
        targetUser.friendRequestsSent = targetUser.friendRequestsSent
          .filter(id => id.toString() !== currentUserId.toString());
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Save both users
    await currentUser.save();
    await targetUser.save();

    // ─── Create Notification & Emit Socket Events ──────────────
    const io = getIO();
    let notif;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'connect') {
      notif = await Notification.create({
        userId: targetUserId,
        senderId: currentUserId,
        type: 'request',
        name: currentUser.name,
        detail: 'sent you a connect request',
        time: timeNow
      });
    } else if (action === 'accept') {
      notif = await Notification.create({
        userId: targetUserId,
        senderId: currentUserId,
        type: 'accepted',
        name: currentUser.name,
        detail: 'accepted your connect request',
        time: timeNow
      });
    }

    // Send real-time notification to the target user
    if (notif) {
      io.to(targetUserId.toString()).emit('new_notification', notif);
    }

    // Tell target user's frontend to refresh their user list
    io.to(targetUserId.toString()).emit('connection_update');

    res.status(200).json({ success: true, message: `Action '${action}' successful` });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ success: false, message: 'Failed to process connection action' });
  }
};
