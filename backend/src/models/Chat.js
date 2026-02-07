const { db } = require('../config/database');

// In-memory storage
const chats = new Map();
const chatMembers = new Map();

class Chat {
  static async create({ type, name, createdBy }) {
    const chat = {
      _id: Date.now().toString() + Math.random(),
      type, // 'private' or 'group'
      name: name || null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    chats.set(chat._id, chat);
    return chat;
  }

  static async findById(id) {
    return chats.get(id) || null;
  }

  static async addMember(chatId, userId, role = 'member') {
    const key = `${chatId}:${userId}`;
    const member = {
      chatId,
      userId,
      role,
      joinedAt: new Date(),
      lastReadMessageId: null
    };
    chatMembers.set(key, member);
    return member;
  }

  static async getMembers(chatId) {
    const members = [];
    for (const [key, member] of chatMembers.entries()) {
      if (member.chatId === chatId) {
        members.push(member);
      }
    }
    return members;
  }

  static async getUserChats(userId) {
    const userChats = [];
    for (const [key, member] of chatMembers.entries()) {
      if (member.userId === userId) {
        const chat = chats.get(member.chatId);
        if (chat) {
          userChats.push(chat);
        }
      }
    }
    return userChats;
  }

  static async findPrivateChat(user1Id, user2Id) {
    for (const chat of chats.values()) {
      if (chat.type === 'private') {
        const members = await this.getMembers(chat._id);
        const memberIds = members.map(m => m.userId);
        if (memberIds.includes(user1Id) && memberIds.includes(user2Id)) {
          return chat;
        }
      }
    }
    return null;
  }
}

module.exports = Chat;
