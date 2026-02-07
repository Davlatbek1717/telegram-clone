import api from './api';

class ChatService {
  async createChat(userId) {
    const response = await api.post('/chats/private', { userId });
    return response.data;
  }

  async createPrivateChat(userId) {
    const response = await api.post('/chats/private', { userId });
    return response.data;
  }

  async createGroup(name, memberIds) {
    const response = await api.post('/chats/group', { name, memberIds });
    return response.data;
  }

  async getUserChats() {
    const response = await api.get('/chats');
    return response.data;
  }

  async searchUsers(query) {
    const response = await api.get('/chats/search', { params: { q: query } });
    return response.data;
  }
}

export default new ChatService();
