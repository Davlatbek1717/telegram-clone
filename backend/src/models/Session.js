const { db } = require('../config/database');

class Session {
  static async create(sessionData) {
    return await db.sessions.create(sessionData);
  }

  static async findOne(query) {
    return await db.sessions.findOne(query);
  }

  static async deleteOne(query) {
    return await db.sessions.deleteOne(query);
  }

  static async update(tokenHash, updates) {
    return await db.sessions.update(tokenHash, updates);
  }
}

module.exports = Session;
