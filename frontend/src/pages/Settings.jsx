import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import groupService from '../services/groupService';

function Settings() {
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await authService.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.userId === user.userId);
      if (exists) {
        return prev.filter(u => u.userId !== user.userId);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Guruh nomini kiriting');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Kamida 1 ta a\'zo qo\'shing');
      return;
    }

    setCreating(true);
    try {
      const memberIds = selectedUsers.map(u => u.userId);
      const response = await groupService.createGroup(
        groupName.trim(),
        groupDescription.trim(),
        memberIds
      );
      
      toast.success('Guruh yaratildi!');
      
      // Reset form
      setShowCreateGroup(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      
      // Navigate to the new group chat
      navigate(`/chat/${response.chatId}`);
    } catch (error) {
      console.error('Create group error:', error);
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Guruh yaratishda xatolik');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Tizimdan chiqdingiz');
      navigate('/login');
    } catch (error) {
      toast.error('Chiqishda xatolik');
    }
  };

  return (
    <div className="telegram-profile">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/chat')}>
          ←
        </button>
        <h1>Sozlamalar</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Settings Sections */}
      <div className="settings-container">
        {/* Account Section */}
        <div className="profile-info-section">
          <div className="profile-section-title">Akkaunt</div>

          <div className="profile-item clickable" onClick={() => navigate('/profile')}>
            <div className="profile-item-label">
              <span className="settings-icon">👤</span>
              Profil
            </div>
            <div className="profile-item-value">
              <span className="profile-item-arrow">›</span>
            </div>
          </div>

          <div className="profile-item clickable" onClick={() => navigate('/chat')}>
            <div className="profile-item-label">
              <span className="settings-icon">💬</span>
              Chatlar
            </div>
            <div className="profile-item-value">
              <span className="profile-item-arrow">›</span>
            </div>
          </div>
        </div>

        {/* Groups Section */}
        <div className="profile-info-section">
          <div className="profile-section-title">Guruhlar</div>

          <div className="profile-item clickable" onClick={() => setShowCreateGroup(true)}>
            <div className="profile-item-label">
              <span className="settings-icon">➕</span>
              Yangi guruh yaratish
            </div>
            <div className="profile-item-value">
              <span className="profile-item-arrow">›</span>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="profile-info-section">
          <div className="profile-section-title">Maxfiylik va Xavfsizlik</div>

          <div className="profile-item">
            <div className="profile-item-label">
              <span className="settings-icon">🔒</span>
              Maxfiylik
            </div>
            <div className="profile-item-value">
              <span className="profile-item-hint">Tez orada</span>
            </div>
          </div>

          <div className="profile-item">
            <div className="profile-item-label">
              <span className="settings-icon">🔐</span>
              Ikki bosqichli autentifikatsiya
            </div>
            <div className="profile-item-value">
              <span className="profile-item-hint">Tez orada</span>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="profile-info-section">
          <div className="profile-section-title">Bildirishnomalar</div>

          <div className="profile-item">
            <div className="profile-item-label">
              <span className="settings-icon">🔔</span>
              Bildirishnomalar
            </div>
            <div className="profile-item-value">
              <span className="profile-item-hint">Tez orada</span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="profile-info-section">
          <div className="profile-section-title">Yordam</div>

          <div className="profile-item">
            <div className="profile-item-label">
              <span className="settings-icon">❓</span>
              Savol-Javob
            </div>
            <div className="profile-item-value">
              <span className="profile-item-arrow">›</span>
            </div>
          </div>

          <div className="profile-item">
            <div className="profile-item-label">
              <span className="settings-icon">📱</span>
              Telegram Clone haqida
            </div>
            <div className="profile-item-value">
              <span className="profile-item-hint">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="profile-info-section">
          <div className="profile-item clickable logout-item" onClick={handleLogout}>
            <div className="profile-item-label">
              <span className="settings-icon">🚪</span>
              <span style={{ color: '#e53935' }}>Chiqish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="edit-modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="create-group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <button onClick={() => setShowCreateGroup(false)}>Bekor qilish</button>
              <h3>Yangi Guruh</h3>
              <button onClick={handleCreateGroup} disabled={creating}>
                {creating ? '...' : 'Yaratish'}
              </button>
            </div>

            <div className="create-group-body">
              {/* Group Info */}
              <div className="group-info-section">
                <div className="group-avatar-placeholder">
                  <span className="group-avatar-icon">📷</span>
                </div>
                <div className="group-inputs">
                  <input
                    type="text"
                    placeholder="Guruh nomi"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength="128"
                    className="group-name-input"
                  />
                  <input
                    type="text"
                    placeholder="Tavsif (ixtiyoriy)"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    maxLength="255"
                    className="group-description-input"
                  />
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="selected-users-section">
                  <div className="selected-users-title">
                    {selectedUsers.length} a'zo tanlandi
                  </div>
                  <div className="selected-users-list">
                    {selectedUsers.map(user => (
                      <div key={user.userId} className="selected-user-chip">
                        <span>{user.firstName}</span>
                        <button onClick={() => toggleUserSelection(user)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Users */}
              <div className="group-search-section">
                <div className="search-header">A'zolarni qo'shish</div>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="group-search-input"
                />

                <div className="group-search-results">
                  {searching ? (
                    <div className="search-loading">Qidirilmoqda...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(user => {
                      const isSelected = selectedUsers.find(u => u.userId === user.userId);
                      return (
                        <div
                          key={user.userId}
                          className={`group-user-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleUserSelection(user)}
                        >
                          <div className="user-avatar-small">
                            {user.firstName[0]}{user.lastName?.[0] || ''}
                          </div>
                          <div className="user-info-small">
                            <div className="user-name-small">
                              {user.firstName} {user.lastName || ''}
                            </div>
                            {user.username && (
                              <div className="user-username-small">{user.username}</div>
                            )}
                          </div>
                          {isSelected && <span className="check-icon">✓</span>}
                        </div>
                      );
                    })
                  ) : searchQuery.length >= 2 ? (
                    <div className="search-empty">Foydalanuvchi topilmadi</div>
                  ) : (
                    <div className="search-hint">Foydalanuvchilarni qidiring</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
