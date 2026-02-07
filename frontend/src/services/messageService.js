import api from './api';

class MessageService {
  async sendMessage(chatId, content, messageType = 'text') {
    const response = await api.post('/messages', {
      chatId,
      content,
      messageType
    });
    return response.data;
  }

  async getChatMessages(chatId, limit = 50, before = null) {
    const response = await api.get(`/messages/${chatId}`, {
      params: { limit, before }
    });
    return response.data;
  }

  async markAsRead(messageId) {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  }
}

export default new MessageService();
