import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import messageService from '../services/messageService';
import chatService from '../services/chatService';
import authService from '../services/authService';
import socketService from '../services/socketService';

function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = authService.getUser();

  useEffect(() => {
    // Connect to WebSocket
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    loadChats();

    // Setup WebSocket listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);
    socketService.onUserStatusChanged(handleUserStatusChanged);
    socketService.onMessageRead(handleMessageRead);

    return () => {
      // Cleanup
      if (chatId) {
        socketService.leaveChat(chatId);
      }
      socketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (chatId) {
      loadChatMessages(chatId);
      socketService.joinChat(chatId);
    }

    return () => {
      if (chatId) {
        socketService.leaveChat(chatId);
      }
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket event handlers
  const handleNewMessage = (message) => {
    // Add message to current chat if it matches
    if (message.chatId === chatId) {
      setMessages(prev => [...prev, message]);
    }

    // Update chat list with new last message
    setChats(prev => prev.map(chat => {
      if (chat.chatId === message.chatId) {
        return {
          ...chat,
          lastMessage: {
            content: message.content,
            timestamp: message.timestamp
          },
          updatedAt: message.timestamp
        };
      }
      return chat;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  };

  const handleUserTyping = ({ chatId: typingChatId, userId, firstName }) => {
    if (typingChatId === chatId && userId !== currentUser?.userId) {
      setTypingUsers(prev => new Set(prev).add(firstName));
    }
  };

  const handleUserStopTyping = ({ chatId: typingChatId, userId }) => {
    if (typingChatId === chatId) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        // Remove by userId (we need to track userId->name mapping for this)
        return newSet;
      });
    }
  };

  const handleUserStatusChanged = ({ userId, status }) => {
    // Update chat list with new status
    setChats(prev => prev.map(chat => {
      if (chat.type === 'private' && chat.user.userId === userId) {
        return {
          ...chat,
          user: { ...chat.user, status }
        };
      }
      return chat;
    }));

    // Update current chat status
    if (currentChat?.type === 'private' && currentChat.user.userId === userId) {
      setCurrentChat(prev => ({
        ...prev,
        user: { ...prev.user, status }
      }));
    }
  };

  const handleMessageRead = ({ messageId }) => {
    setMessages(prev => prev.map(msg => {
      if (msg.messageId === messageId) {
        return { ...msg, status: 'read' };
      }
      return msg;
    }));
  };

  const loadChats = async () => {
    try {
      const response = await chatService.getUserChats();
      setChats(response.chats || []);
      
      // If no chatId in URL but we have chats, select first one
      if (!chatId && response.chats && response.chats.length > 0) {
        navigate(`/chat/${response.chats[0].chatId}`, { replace: true });
      }
    } catch (error) {
      console.error('Load chats error:', error);
      toast.error('Chatlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (id) => {
    try {
      setLoading(true);
      const response = await messageService.getChatMessages(id);
      setMessages(response.messages || []);
      
      // Find current chat info
      const chat = chats.find(c => c.chatId === id);
      setCurrentChat(chat);
    } catch (error) {
      console.error('Load messages error:', error);
      toast.error('Xabarlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatId) return;

    try {
      // Send via WebSocket
      socketService.sendMessage(chatId, messageInput);
      setMessageInput('');
      
      // Stop typing indicator
      socketService.stopTyping(chatId);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Xabar yuborishda xatolik');
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Send typing indicator
    if (chatId && socketService.isConnected()) {
      socketService.startTyping(chatId);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(chatId);
      }, 3000);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="telegram-container">
      {/* Sidebar */}
      <div className="telegram-sidebar">
        <div className="sidebar-header">
          <button className="menu-btn" onClick={() => navigate('/profile')} title="Profil">
            👤
          </button>
          <input
            type="text"
            placeholder="Qidiruv"
            className="search-input"
            onClick={() => navigate('/search')}
            readOnly
          />
        </div>

        <div className="chats-list">
          {loading && chats.length === 0 ? (
            <div className="loading-state">Yuklanmoqda...</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-text">Chatlar yo'q</div>
              <div className="empty-hint">Qidiruvdan foydalanuvchi toping</div>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chatId}
                className={`chat-item ${chatId === chat.chatId ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
              >
                <div className="chat-avatar">
                  {chat.type === 'private' 
                    ? (chat.user.firstName[0] + (chat.user.lastName?.[0] || ''))
                    : chat.name?.[0] || 'G'
                  }
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-name">
                      {chat.type === 'private' 
                        ? `${chat.user.firstName} ${chat.user.lastName || ''}`
                        : chat.name
                      }
                    </span>
                    {chat.lastMessage && (
                      <span className="chat-time">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="chat-preview">
                    {chat.lastMessage?.content || 'Xabar yo\'q'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/settings')} className="logout-btn">
            ⚙️ Sozlamalar
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="telegram-chat">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              {currentChat?.type === 'private' 
                ? (currentChat.user.firstName[0] + (currentChat.user.lastName?.[0] || ''))
                : currentChat?.name?.[0] || 'C'
              }
            </div>
            <div>
              <div className="chat-title">
                {currentChat?.type === 'private' 
                  ? `${currentChat.user.firstName} ${currentChat.user.lastName || ''}`
                  : currentChat?.name || 'Chat'
                }
              </div>
              <div className="chat-status">
                {currentChat?.type === 'private' && currentChat.user.status === 'online' 
                  ? 'onlayn' 
                  : currentChat?.type === 'group' 
                  ? `${currentChat.memberCount} a'zo`
                  : ''
                }
              </div>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {loading && messages.length === 0 ? (
            <div className="loading-state">Yuklanmoqda...</div>
          ) : messages.length === 0 ? (
            <div className="empty-chat-state">
              <div className="empty-chat-icon">💬</div>
              <div className="empty-chat-text">Xabar yo'q</div>
              <div className="empty-chat-hint">Birinchi xabarni yuboring</div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwn = message.sender.userId === currentUser?.userId;
                return (
                  <div
                    key={message.messageId}
                    className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                  >
                    {!isOwn && (
                      <div className="message-sender">
                        {message.sender.firstName}
                      </div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {isOwn && message.status === 'sending' && ' ⏳'}
                        {isOwn && message.status === 'sent' && ' ✓'}
                        {isOwn && message.status === 'read' && ' ✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingUsers.size > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">yozmoqda...</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-container">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Xabar yozing..."
            className="message-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!messageInput.trim()}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
