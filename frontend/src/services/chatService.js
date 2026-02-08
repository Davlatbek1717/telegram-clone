import api from './api';

class ChatService {
  _getCachedChats() {
    const cached = localStorage.getItem('cached_chats');
    return cached ? JSON.parse(cached) : [];
  }

  _setCachedChats(chats) {
    localStorage.setItem('cached_chats', JSON.stringify(chats));
  }

  _addCachedChat(chat) {
    const chats = this._getCachedChats();
    const existing = chats.find(c => c.chatId === chat.chatId);
    if (!existing) {
      chats.push(chat);
      this._setCachedChats(chats);
    }
    return chat;
  }

  async createChat(userId) {
    try {
      const response = await api.post('/chats/private', { userId });
      this._addCachedChat(response.data);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        const newChat = {
          chatId: 'local_' + Date.now(),
          type: 'private',
          userId: userId,
          createdAt: new Date().toISOString()
        };
        this._addCachedChat(newChat);
        return newChat;
      }
      throw error;
    }
  }

  async createPrivateChat(userId) {
    return this.createChat(userId);
  }

  async createGroup(name, memberIds) {
    try {
      const response = await api.post('/chats/group', { name, memberIds });
      this._addCachedChat(response.data);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        const newChat = {
          chatId: 'local_' + Date.now(),
          type: 'group',
          name: name,
          memberIds: memberIds,
          createdAt: new Date().toISOString()
        };
        this._addCachedChat(newChat);
        return newChat;
      }
      throw error;
    }
  }

  async getUserChats() {
    try {
      const response = await api.get('/chats');
      this._setCachedChats(response.data.chats || []);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        return { chats: this._getCachedChats() };
      }
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const response = await api.get('/chats/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        // Search in cached users
        const authService = require('./authService').default;
        const allUsers = authService._getAllCachedUsers();
        const results = Object.values(allUsers).filter(user => 
          user.firstName?.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(query.toLowerCase()) ||
          user.phone?.includes(query) ||
          user.username?.toLowerCase().includes(query.toLowerCase())
        );
        return { users: results };
      }
      throw error;
    }
  }
}

export default new ChatService();
