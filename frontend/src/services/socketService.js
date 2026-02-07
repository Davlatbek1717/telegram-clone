import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  // Send message
  sendMessage(chatId, content, messageType = 'text', replyToId = null) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send_message', {
      chatId,
      content,
      messageType,
      replyToId
    });
  }

  // Typing indicators
  startTyping(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // Mark message as read
  markAsRead(messageId, chatId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { messageId, chatId });
    }
  }

  // Join/leave chat rooms
  joinChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
      this.listeners.set('user_stop_typing', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read', callback);
      this.listeners.set('message_read', callback);
    }
  }

  onUserStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('user_status_changed', callback);
      this.listeners.set('user_status_changed', callback);
    }
  }

  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message_error', callback);
      this.listeners.set('message_error', callback);
    }
  }

  // Remove listeners
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      const callback = this.listeners.get(event);
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
