import { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import chatService from '../services/chatService';

function UserSearch({ onChatCreated }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.error('Kamida 3 ta belgi kiriting');
      return;
    }

    setSearching(true);
    try {
      const data = await authService.searchUsers(searchQuery);
      setSearchResults(data.users);
      if (data.users.length === 0) {
        toast.info('Foydalanuvchi topilmadi');
      }
    } catch (error) {
      toast.error('Qidiruvda xatolik');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateChat = async (phone) => {
    try {
      const data = await chatService.createPrivateChat(phone);
      toast.success('Chat yaratildi');
      setShowModal(false);
      setSearchQuery('');
      setSearchResults([]);
      if (onChatCreated) {
        onChatCreated(data.chat);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chat yaratishda xatolik');
    }
  };

  return (
    <>
      <button
        className="new-chat-btn"
        onClick={() => setShowModal(true)}
        title="Yangi chat"
      >
        ✏️
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Yangi Chat</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Telefon raqamini kiriting (+998...)"
                className="modal-input"
                autoFocus
              />
              <button
                type="submit"
                className="search-btn"
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? 'Qidirilmoqda...' : 'Qidirish'}
              </button>
            </form>

            <div className="quick-create">
              <p className="help-text">
                Yoki to'g'ridan-to'g'ri telefon raqami bilan chat yarating:
              </p>
              <button
                className="create-chat-btn"
                onClick={() => handleCreateChat(searchQuery)}
                disabled={!searchQuery.trim()}
              >
                Chat yaratish
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    className="search-result-item"
                    onClick={() => handleCreateChat(user.phone)}
                  >
                    <div className="result-avatar">
                      {user.firstName?.[0] || 'U'}
                    </div>
                    <div className="result-info">
                      <div className="result-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="result-phone">{user.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default UserSearch;
