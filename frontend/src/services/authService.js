import api from './api';

class AuthService {
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async login(data) {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.put('/auth/me/update', data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async updateProfilePhoto(photoUrl) {
    const response = await api.put('/auth/me/photo', { photoUrl });
    
    // Update localStorage with full user data if available
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      // Fallback: update only photo field
      const user = this.getUser();
      if (user) {
        user.profilePhoto = response.data.profilePhoto;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    
    return response.data;
  }

  async searchUsers(query) {
    const response = await api.get(`/auth/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
