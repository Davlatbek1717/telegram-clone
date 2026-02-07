const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

async function sendMessage(req, res) {
  try {
    const { chatId, content, messageType = 'text', replyToId } = req.body;
    const senderId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: 'INVALID_CONTENT',
        message: 'Xabar bo\'sh bo\'lmasligi kerak'
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        error: 'CHAT_NOT_FOUND',
        message: 'Chat topilmadi'
      });
    }

    const message = await Message.create({
      chatId,
      senderId,
      content,
      messageType,
      replyToId
    });

    const sender = await User.findById(senderId);

    return res.status(201).json({
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
      status: message.status
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Xabar yuborishda xatolik'
    });
  }
}

async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await Message.getChatMessages(chatId, parseInt(limit), before);
    
    const messagesWithSenders = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId);
        return {
          messageId: msg._id,
          chatId: msg.chatId,
          sender: {
            userId: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName
          },
          content: msg.content,
          messageType: msg.messageType,
          timestamp: msg.createdAt,
          status: msg.status
        };
      })
    );

    return res.status(200).json({
      messages: messagesWithSenders.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Xabarlarni olishda xatolik'
    });
  }
}

async function markAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    await Message.updateStatus(messageId, userId, 'read');

    return res.status(200).json({
      messageId,
      status: 'read',
      readAt: new Date()
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Xabarni o\'qilgan deb belgilashda xatolik'
    });
  }
}

module.exports = {
  sendMessage,
  getChatMessages,
  markAsRead
};
