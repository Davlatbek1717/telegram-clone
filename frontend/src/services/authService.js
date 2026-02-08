import api from './api';

class AuthService {
  // Cache users in localStorage for offline/fallback
  _cacheUser(user) {
    const allUsers = this._getAllCachedUsers();
    allUsers[user.phone] = user;
    localStorage.setItem('cached_users', JSON.stringify(allUsers));
  }

  _getAllCachedUsers() {
    const cached = localStorage.getItem('cached_users');
    return cached ? JSON.parse(cached) : {};
  }

  _getCachedUser(phone) {
    const allUsers = this._getAllCachedUsers();
    return allUsers[phone] || null;
  }

  async register(data) {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Cache for fallback
        this._cacheUser({ ...response.data.user, password: data.password });
      }
      return response.data;
    } catch (error) {
      // If backend fails, try localStorage fallback
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        
        // Check if user already exists in cache
        const existingUser = this._getCachedUser(data.phone);
        if (existingUser) {
          throw new Error('Bu telefon raqami allaqachon ro\'yxatdan o\'tgan');
        }
        
        // Create user in localStorage
        const newUser = {
          userId: Date.now().toString(),
          phone: data.phone,
          email: data.email || null,
          firstName: data.firstName,
          lastName: data.lastName || null,
          username: data.username || null,
          bio: null,
          profilePhoto: null,
          status: 'online',
          password: data.password // Store for login (not secure, but fallback)
        };
        
        const token = 'local_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        this._cacheUser(newUser);
        
        return { token, user: newUser };
      }
      throw error;
    }
  }

  async login(data) {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // If backend fails, try localStorage fallback
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('Backend unavailable, using localStorage fallback');
        
        // Find user in cache
        const cachedUser = this._getCachedUser(data.identifier);
        if (!cachedUser) {
          throw new Error('Username, telefon yoki parol noto\'g\'ri');
        }
        
        // Check password
        if (cachedUser.password !== data.password) {
          throw new Error('Username, telefon yoki parol noto\'g\'ri');
        }
        
        const token = 'local_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(cachedUser));
        
        return { token, user: cachedUser };
      }
      throw error;
    }
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
