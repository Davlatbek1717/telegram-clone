import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import chatService from '../services/chatService';

function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
    
    // Focus search input
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await authService.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Qidirishda xatolik');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    // Save to recent searches
    const recent = [user, ...recentSearches.filter(u => u.userId !== user.userId)].slice(0, 10);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    // Create or open chat with user
    try {
      const chat = await chatService.createChat(user.userId);
      navigate(`/chat/${chat.chatId}`);
    } catch (error) {
      console.error('Create chat error:', error);
      toast.error('Chatni ochishda xatolik');
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast.success('So\'nggi qidiruvlar tozalandi');
  };

  const removeRecentSearch = (userId) => {
    const recent = recentSearches.filter(u => u.userId !== userId);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  return (
    <div className="search-page">
      {/* Header */}
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input-main"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="search-content">
        {searchQuery.length < 3 ? (
          // Recent searches
          recentSearches.length > 0 ? (
            <div className="recent-searches">
              <div className="section-header">
                <span>So'nggi qidiruvlar</span>
                <button className="clear-all-btn" onClick={clearRecentSearches}>
                  Tozalash
                </button>
              </div>
              <div className="user-list">
                {recentSearches.map((user) => (
                  <div key={user.userId} className="user-item">
                    <div className="user-avatar">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.firstName} />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName?.[0] || ''}</span>
                      )}
                    </div>
                    <div className="user-info" onClick={() => handleUserClick(user)}>
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                        {user.status === 'online' && <span className="online-badge">🟢</span>}
                      </div>
                      {user.username && (
                        <div className="user-username">{user.username}</div>
                      )}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(user.userId);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">Foydalanuvchilarni qidiring</div>
              <div className="empty-hint">Ism, username yoki telefon raqami bo'yicha</div>
            </div>
          )
        ) : loading ? (
          // Loading
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Qidirilmoqda...</div>
          </div>
        ) : searchResults.length > 0 ? (
          // Search results
          <div className="search-results">
            <div className="section-header">
              <span>{searchResults.length} ta natija topildi</span>
            </div>
            <div className="user-list">
              {searchResults.map((user) => (
                <div
                  key={user.userId}
                  className="user-item clickable"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="user-avatar">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.firstName} />
                    ) : (
                      <span>{user.firstName[0]}{user.lastName?.[0] || ''}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.lastName}
                      {user.status === 'online' && <span className="online-badge">🟢</span>}
                    </div>
                    {user.username && (
                      <div className="user-username">{user.username}</div>
                    )}
                    {user.bio && (
                      <div className="user-bio">{user.bio}</div>
                    )}
                  </div>
                  <div className="user-action">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // No results
          <div className="empty-state">
            <div className="empty-icon">😕</div>
            <div className="empty-text">Hech narsa topilmadi</div>
            <div className="empty-hint">Boshqa so'z bilan qidiring</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
