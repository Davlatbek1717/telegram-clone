import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import chatService from '../services/chatService';

function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const response = await authService.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (user) => {
    const isSelected = selectedMembers.some(m => m.userId === user.userId);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.userId !== user.userId));
    } else {
      if (selectedMembers.length >= 199) {
        toast.error('Maksimal 199 ta a\'zo qo\'shish mumkin');
        return;
      }
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Guruh nomini kiriting');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Kamida bitta a\'zo qo\'shing');
      return;
    }

    setCreating(true);
    try {
      const memberIds = selectedMembers.map(m => m.userId);
      const response = await chatService.createGroup(groupName, memberIds);
      toast.success('Guruh yaratildi!');
      onGroupCreated(response);
      handleClose();
    } catch (error) {
      console.error('Create group error:', error);
      toast.error(error.response?.data?.message || 'Guruh yaratishda xatolik');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMembers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yangi Guruh</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Group Name */}
          <div className="input-group">
            <label className="input-label">Guruh nomi</label>
            <input
              type="text"
              className="input"
              placeholder="Guruh nomini kiriting..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={64}
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="selected-members">
              <div className="selected-members-label">
                Tanlangan: {selectedMembers.length}
              </div>
              <div className="selected-members-list">
                {selectedMembers.map((member) => (
                  <div key={member.userId} className="selected-member-chip">
                    <span>{member.firstName} {member.lastName}</span>
                    <button onClick={() => toggleMember(member)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div className="input-group">
            <label className="input-label">A'zolarni qidirish</label>
            <input
              type="text"
              className="input"
              placeholder="Ism yoki username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results */}
          <div className="search-results-list">
            {loading ? (
              <div className="loading-text">Qidirilmoqda...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isSelected = selectedMembers.some(m => m.userId === user.userId);
                return (
                  <div
                    key={user.userId}
                    className={`user-result-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMember(user)}
                  >
                    <div className="user-avatar-small">
                      {user.firstName[0]}{user.lastName?.[0] || ''}
                    </div>
                    <div className="user-result-info">
                      <div className="user-result-name">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.username && (
                        <div className="user-result-username">{user.username}</div>
                      )}
                    </div>
                    {isSelected && <span className="checkmark">✓</span>}
                  </div>
                );
              })
            ) : searchQuery.length >= 2 ? (
              <div className="empty-text">Foydalanuvchi topilmadi</div>
            ) : (
              <div className="hint-text">Qidirish uchun kamida 2 ta belgi kiriting</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Bekor qilish
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateGroup}
            disabled={creating || !groupName.trim() || selectedMembers.length === 0}
          >
            {creating ? 'Yaratilmoqda...' : 'Guruh yaratish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
