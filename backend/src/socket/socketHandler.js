const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Store active user connections
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

function initializeSocket(io) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId}`);

    // Store user connection
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Update user status to online
    User.findById(userId).then(user => {
      if (user) {
        User.findByIdAndUpdate(userId, { status: 'online' });
        // Notify all user's contacts about online status
        broadcastUserStatus(io, userId, 'online');
      }
    });

    // Join user's chat rooms
    Chat.getUserChats(userId).then(chats => {
      chats.forEach(chat => {
        socket.join(`chat:${chat._id}`);
      });
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', replyToId } = data;

        // Create message
        const message = await Message.create({
          chatId,
          senderId: userId,
          content,
          messageType,
          replyToId
        });

        // Get sender info
        const sender = await User.findById(userId);

        const messageData = {
          messageId: message._id,
          chatId: message.chatId,
          sender: {
            userId: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName
          },
          content: message.content,
          messageType: message.messageType,
          timestamp: message.createdAt,
          status: 'sent'
        };

        // Send to all users in the chat room
        io.to(`chat:${chatId}`).emit('new_message', messageData);

        // Update chat's last message time
        await Chat.findById(chatId).then(chat => {
          if (chat) {
            chat.updatedAt = new Date();
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', async (data) => {
      try {
        const { chatId } = data;
        const user = await User.findById(userId);
        
        if (user) {
          socket.to(`chat:${chatId}`).emit('user_typing', {
            chatId,
            userId,
            firstName: user.firstName
          });
        }
      } catch (error) {
        console.error('Typing start error:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { chatId } = data;
        socket.to(`chat:${chatId}`).emit('user_stop_typing', {
          chatId,
          userId
        });
      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });

    // Handle message read
    socket.on('mark_read', async (data) => {
      const { messageId, chatId } = data;
      
      try {
        await Message.updateStatus(messageId, userId, 'read');
        
        // Notify sender about read status
        socket.to(`chat:${chatId}`).emit('message_read', {
          messageId,
          userId,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle join chat (when user opens a chat)
    socket.on('join_chat', (data) => {
      const { chatId } = data;
      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Handle leave chat
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${userId}`);
      
      // Remove from active connections
      userSockets.delete(userId);
      socketUsers.delete(socket.id);

      // Update user status to offline
      await User.findByIdAndUpdate(userId, { 
        status: 'offline',
        lastSeen: new Date()
      });

      // Notify all user's contacts about offline status
      broadcastUserStatus(io, userId, 'offline');
    });
  });
}

// Broadcast user status to all their contacts
async function broadcastUserStatus(io, userId, status) {
  try {
    // Get all chats where this user is a member
    const chats = await Chat.getUserChats(userId);
    
    // Get all unique users from these chats
    const contactIds = new Set();
    for (const chat of chats) {
      const members = await Chat.getMembers(chat._id);
      members.forEach(member => {
        if (member.userId !== userId) {
          contactIds.add(member.userId);
        }
      });
    }

    // Send status update to each contact
    contactIds.forEach(contactId => {
      const socketId = userSockets.get(contactId);
      if (socketId) {
        io.to(socketId).emit('user_status_changed', {
          userId,
          status,
          lastSeen: status === 'offline' ? new Date() : null
        });
      }
    });
  } catch (error) {
    console.error('Broadcast status error:', error);
  }
}

module.exports = { initializeSocket };
