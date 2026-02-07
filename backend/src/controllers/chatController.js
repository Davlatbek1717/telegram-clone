const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

async function createOrGetPrivateChat(req, res) {
  try {
    const { userId: otherUserId } = req.body;
    const currentUserId = req.user.userId;

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        error: 'INVALID_USER',
        message: 'O\'zingiz bilan chat yarata olmaysiz'
      });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Foydalanuvchi topilmadi'
      });
    }

    let chat = await Chat.findPrivateChat(currentUserId, otherUserId);
    
    if (!chat) {
      chat = await Chat.create({
        type: 'private',
        createdBy: currentUserId
      });
      
      await Chat.addMember(chat._id, currentUserId);
      await Chat.addMember(chat._id, otherUserId);
    }

    return res.status(200).json({
      chatId: chat._id,
      type: chat.type,
      user: {
        userId: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        status: otherUser.status
      }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Chat yaratishda xatolik'
    });
  }
}

async function createGroup(req, res) {
  try {
    const { name, memberIds } = req.body;
    const currentUserId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'INVALID_NAME',
        message: 'Guruh nomi bo\'sh bo\'lmasligi kerak'
      });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        error: 'INVALID_MEMBERS',
        message: 'Kamida bitta a\'zo qo\'shish kerak'
      });
    }

    if (memberIds.length > 199) {
      return res.status(400).json({
        error: 'TOO_MANY_MEMBERS',
        message: 'Guruhda maksimal 200 ta a\'zo bo\'lishi mumkin'
      });
    }

    // Verify all members exist
    for (const memberId of memberIds) {
      const user = await User.findById(memberId);
      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: `Foydalanuvchi topilmadi: ${memberId}`
        });
      }
    }

    const chat = await Chat.create({
      type: 'group',
      name: name.trim(),
      createdBy: currentUserId
    });

    // Add creator as admin
    await Chat.addMember(chat._id, currentUserId, 'admin');

    // Add other members
    for (const memberId of memberIds) {
      if (memberId !== currentUserId) {
        await Chat.addMember(chat._id, memberId, 'member');
      }
    }

    const members = await Chat.getMembers(chat._id);

    return res.status(201).json({
      chatId: chat._id,
      type: chat.type,
      name: chat.name,
      memberCount: members.length,
      createdAt: chat.createdAt
    });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Guruh yaratishda xatolik'
    });
  }
}

async function getUserChats(req, res) {
  try {
    const userId = req.user.userId;
    const chats = await Chat.getUserChats(userId);

    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const members = await Chat.getMembers(chat._id);
        const messages = await Message.getChatMessages(chat._id, 1);
        const lastMessage = messages[0] || null;

        if (chat.type === 'private') {
          const otherMember = members.find(m => m.userId !== userId);
          const otherUser = await User.findById(otherMember.userId);
          
          return {
            chatId: chat._id,
            type: chat.type,
            user: {
              userId: otherUser._id,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
              status: otherUser.status
            },
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt
            } : null,
            updatedAt: chat.updatedAt
          };
        }

        return {
          chatId: chat._id,
          type: chat.type,
          name: chat.name,
          memberCount: members.length,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.createdAt
          } : null,
          updatedAt: chat.updatedAt
        };
      })
    );

    return res.status(200).json({
      chats: chatsWithDetails.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Chatlarni olishda xatolik'
    });
  }
}

async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const currentUserId = req.user.userId;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Qidiruv so\'rovi kamida 2 ta belgidan iborat bo\'lishi kerak'
      });
    }

    // Search in all users
    const allUsers = await User.findAll();
    const searchLower = q.toLowerCase();
    
    const results = allUsers.filter(user => {
      if (user._id === currentUserId) return false;
      
      const phoneMatch = user.phone && user.phone.includes(q);
      const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(searchLower);
      const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(searchLower);
      const usernameMatch = user.username && user.username.toLowerCase().includes(searchLower);
      const emailMatch = user.email && user.email.toLowerCase().includes(searchLower);
      
      return phoneMatch || firstNameMatch || lastNameMatch || usernameMatch || emailMatch;
    });
    
    return res.status(200).json({
      users: results.map(user => ({
        userId: user._id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        profilePhoto: user.profilePhotoUrl,
        status: user.status
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Qidiruvda xatolik'
    });
  }
}

module.exports = {
  createOrGetPrivateChat,
  createGroup,
  getUserChats,
  searchUsers
};
