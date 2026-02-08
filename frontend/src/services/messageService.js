import api from './api';

class MessageService {
  _getCachedMessages(chatId) {
    const cached = localStorage.getItem(`cached_messages_${chatId}`);
    return cached ? JSON.parse(cached) : [];
  }

  _setCachedMessages(chatId, messages) {
    localStorage.setItem(`cached_messages_${chatId}`, JSON.stringify(messages));
  }

  _addCachedMessage(chatId, message) {
    const messages = this._getCachedMessages(chatId);
    messages.push(message);
    this._setCachedMessages(chatId, messages);
  }

  async sendMessage(chatId, content, messageType = 'text') {
    try {
      const response = await api.post('/messages', {
        chatId,
        content,
        messageType
      });
      this._addCachedMessage(chatId, response.data);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        const user = JSON.parse(localStorage.getItem('user'));
        const newMessage = {
          messageId: 'local_' + Date.now(),
          chatId: chatId,
          sender: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName
          },
          content: content,
          messageType: messageType,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        this._addCachedMessage(chatId, newMessage);
        return newMessage;
      }
      throw error;
    }
  }

  async getChatMessages(chatId, limit = 50, before = null) {
    try {
      const response = await api.get(`/messages/${chatId}`, {
        params: { limit, before }
      });
      this._setCachedMessages(chatId, response.data.messages || []);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        return { 
          messages: this._getCachedMessages(chatId),
          hasMore: false
        };
      }
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, localStorage fallback');
        return { messageId, status: 'read', readAt: new Date() };
      }
      throw error;
    }
  }
}

export default new MessageService();
