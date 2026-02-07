import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Always fetch from API to get latest data
      const profile = await authService.getProfile();
      setUser(profile);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Profile load error:', error);
      
      // Try to use cached data if API fails
      const cachedUser = authService.getUser();
      if (cachedUser) {
        setUser(cachedUser);
      } else {
        toast.error('Profilni yuklashda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    // Validate input
    if (editingField === 'firstName' && (!editValue || editValue.trim().length === 0)) {
      toast.error('Ism bo\'sh bo\'lmasligi kerak');
      return;
    }

    if (editingField === 'username' && editValue && !editValue.startsWith('@')) {
      setEditValue('@' + editValue);
      return;
    }

    setSaving(true);
    try {
      const updates = { [editingField]: editValue.trim() };
      const response = await authService.updateProfile(updates);
      
      // Update local state with response data
      setUser(response.user);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Saqlandi');
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5 MB dan oshmasligi kerak');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllarini yuklash mumkin');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const photoUrl = reader.result;
          const response = await authService.updateProfilePhoto(photoUrl);
          
          // Update local state with response data
          if (response.user) {
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            setUser({ ...user, profilePhoto: response.profilePhoto });
            const updatedUser = { ...user, profilePhoto: response.profilePhoto };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          toast.success('Profil rasmi yangilandi');
        } catch (error) {
          console.error('Photo upload error:', error);
          toast.error('Rasmni yuklashda xatolik');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Rasmni yuklashda xatolik');
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

  if (loading) {
    return (
      <div className="telegram-profile">
        <div className="profile-loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="telegram-profile">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/chat')}>
          ←
        </button>
        <h1>Profil</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Chiqish
        </button>
      </div>

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-circle">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" />
            ) : (
              <span className="avatar-initials">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <label htmlFor="avatar-upload" className="avatar-upload-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </label>
        </div>
      </div>

      {/* Info Section */}
      <div className="profile-info-section">
        <div className="profile-section-title">Akkaunt</div>

        {/* Phone */}
        <div className="profile-item">
          <div className="profile-item-label">Telefon</div>
          <div className="profile-item-value">{user?.phone}</div>
        </div>

        {/* First Name */}
        <div className="profile-item clickable" onClick={() => handleEditField('firstName', user?.firstName)}>
          <div className="profile-item-label">Ism</div>
          <div className="profile-item-value">
            {user?.firstName || 'Ism kiriting'}
            <span className="profile-item-arrow">›</span>
          </div>
        </div>

        {/* Last Name */}
        <div className="profile-item clickable" onClick={() => handleEditField('lastName', user?.lastName)}>
          <div className="profile-item-label">Familiya</div>
          <div className="profile-item-value">
            {user?.lastName || 'Familiya kiriting'}
            <span className="profile-item-arrow">›</span>
          </div>
        </div>

        {/* Username */}
        <div className="profile-item clickable" onClick={() => handleEditField('username', user?.username)}>
          <div className="profile-item-label">Username</div>
          <div className="profile-item-value">
            {user?.username || '@username'}
            <span className="profile-item-arrow">›</span>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-item clickable" onClick={() => handleEditField('bio', user?.bio)}>
          <div className="profile-item-label">Bio</div>
          <div className="profile-item-value">
            {user?.bio || 'O\'zingiz haqingizda...'}
            <span className="profile-item-arrow">›</span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="profile-info-section">
        <div className="profile-section-title">Sozlamalar</div>

        <div className="profile-item clickable" onClick={() => navigate('/settings')}>
          <div className="profile-item-label">⚙️ Sozlamalar</div>
          <div className="profile-item-value">
            <span className="profile-item-arrow">›</span>
          </div>
        </div>

        <div className="profile-item clickable" onClick={() => navigate('/chat')}>
          <div className="profile-item-label">💬 Chatlar</div>
          <div className="profile-item-value">
            <span className="profile-item-arrow">›</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <button onClick={handleCancelEdit}>Bekor qilish</button>
              <h3>
                {editingField === 'firstName' && 'Ism'}
                {editingField === 'lastName' && 'Familiya'}
                {editingField === 'username' && 'Username'}
                {editingField === 'bio' && 'Bio'}
              </h3>
              <button onClick={handleSaveField} disabled={saving}>
                {saving ? '...' : 'Saqlash'}
              </button>
            </div>
            <div className="edit-modal-body">
              {editingField === 'bio' ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="O'zingiz haqingizda..."
                  maxLength="70"
                  rows="4"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={
                    editingField === 'firstName' ? 'Ism' :
                    editingField === 'lastName' ? 'Familiya' :
                    '@username'
                  }
                  maxLength={editingField === 'username' ? 32 : 64}
                  autoFocus
                />
              )}
              {editingField === 'bio' && (
                <div className="char-counter">{editValue.length}/70</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
