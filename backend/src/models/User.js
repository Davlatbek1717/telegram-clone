const { db } = require('../config/database');

class User {
  static async create({ phone, email, passwordHash, firstName, lastName, username }) {
    return await db.users.create({
      phone,
      email: email || null,
      passwordHash,
      firstName,
      lastName: lastName || null,
      username: username || null,
      bio: null,
      profilePhotoUrl: null,
      status: 'offline',
      lastSeen: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null
    });
  }

  static async findOne(query) {
    return await db.users.findOne(query);
  }

  static async findById(id) {
    return await db.users.findById(id);
  }

  static async findAll() {
    return await db.users.findAll();
  }

  static async findByIdAndUpdate(id, updates) {
    return await db.users.update(id, updates);
  }

  static async update(id, updates) {
    return await db.users.update(id, updates);
  }

  static async save(user) {
    return await db.users.update(user._id, user);
  }

  static async search(query) {
    const allUsers = await db.users.findAll();
    const searchLower = query.toLowerCase();
    
    return allUsers.filter(user => {
      const phoneMatch = user.phone && user.phone.includes(query);
      const firstNameMatch = user.firstName && user.firstName.toLowerCase().includes(searchLower);
      const lastNameMatch = user.lastName && user.lastName.toLowerCase().includes(searchLower);
      const usernameMatch = user.username && user.username.toLowerCase().includes(searchLower);
      
      return phoneMatch || firstNameMatch || lastNameMatch || usernameMatch;
    });
  }
}

module.exports = User;
