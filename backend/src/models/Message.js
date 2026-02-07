const messages = new Map();
const messageStatus = new Map();

class Message {
  static async create({ chatId, senderId, content, messageType = 'text', replyToId = null }) {
    const message = {
      _id: Date.now().toString() + Math.random(),
      chatId,
      senderId,
      content,
      messageType,
      replyToId,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    messages.set(message._id, message);
    return message;
  }

  static async findById(id) {
    return messages.get(id) || null;
  }

  static async getChatMessages(chatId, limit = 50, before = null) {
    const chatMessages = [];
    for (const message of messages.values()) {
      if (message.chatId === chatId && !message.deletedAt) {
        if (!before || new Date(message.createdAt) < new Date(before)) {
          chatMessages.push(message);
        }
      }
    }
    return chatMessages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  static async updateStatus(messageId, userId, status) {
    const key = `${messageId}:${userId}`;
    messageStatus.set(key, {
      messageId,
      userId,
      status,
      timestamp: new Date()
    });
  }

  static async getMessageStatus(messageId) {
    const statuses = [];
    for (const [key, status] of messageStatus.entries()) {
      if (status.messageId === messageId) {
        statuses.push(status);
      }
    }
    return statuses;
  }

  static async delete(messageId) {
    const message = messages.get(messageId);
    if (message) {
      message.deletedAt = new Date();
      message.content = '';
      messages.set(messageId, message);
    }
    return message;
  }
}

module.exports = Message;
