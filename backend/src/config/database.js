// In-memory database (mock) - MongoDB muammosi uchun
const users = new Map();
const sessions = new Map();
const chats = new Map();
const messages = new Map();

// Mock database functions
const db = {
  users: {
    create: async (userData) => {
      const user = {
        _id: Date.now().toString(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.set(user._id, user);
      return user;
    },
    
    findOne: async (query) => {
      for (const user of users.values()) {
        if (query.phone && user.phone === query.phone) return user;
        if (query._id && user._id === query._id) return user;
      }
      return null;
    },
    
    findById: async (id) => {
      return users.get(id) || null;
    },
    
    findAll: async () => {
      return Array.from(users.values());
    },
    
    update: async (id, updates) => {
      const user = users.get(id);
      if (user) {
        Object.assign(user, updates, { updatedAt: new Date() });
        users.set(id, user);
      }
      return user;
    }
  },
  
  sessions: {
    create: async (sessionData) => {
      const session = {
        _id: Date.now().toString(),
        ...sessionData,
        createdAt: new Date()
      };
      sessions.set(session.tokenHash, session);
      return session;
    },
    
    findOne: async (query) => {
      if (query.tokenHash) {
        const session = sessions.get(query.tokenHash);
        if (session && new Date(session.expiresAt) > new Date()) {
          return session;
        }
      }
      return null;
    },
    
    deleteOne: async (query) => {
      if (query.tokenHash) {
        sessions.delete(query.tokenHash);
      }
    },
    
    update: async (tokenHash, updates) => {
      const session = sessions.get(tokenHash);
      if (session) {
        Object.assign(session, updates);
        sessions.set(tokenHash, session);
      }
      return session;
    }
  },
  
  chats: {
    create: async (chatData) => {
      const chat = {
        _id: Date.now().toString(),
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      chats.set(chat._id, chat);
      return chat;
    },
    
    findById: async (id) => {
      return chats.get(id) || null;
    },
    
    findAll: async () => {
      return Array.from(chats.values());
    },
    
    update: async (id, updates) => {
      const chat = chats.get(id);
      if (chat) {
        Object.assign(chat, updates, { updatedAt: new Date() });
        chats.set(id, chat);
      }
      return chat;
    }
  },
  
  messages: {
    create: async (messageData) => {
      const message = {
        _id: Date.now().toString(),
        ...messageData,
        createdAt: new Date()
      };
      messages.set(message._id, message);
      return message;
    },
    
    findById: async (id) => {
      return messages.get(id) || null;
    },
    
    findAll: async () => {
      return Array.from(messages.values());
    },
    
    update: async (id, updates) => {
      const message = messages.get(id);
      if (message) {
        Object.assign(message, updates);
        messages.set(id, message);
      }
      return message;
    }
  }
};

async function connectDatabase() {
  console.log('✅ Using in-memory database (mock mode)');
  console.log('💡 Data will be lost on server restart');
  
  // Create some test users for search
  const testUsers = [
    {
      phone: '+998901111111',
      passwordHash: '$2b$10$test',
      firstName: 'Ali',
      lastName: 'Valiyev',
      username: '@ali',
      bio: 'Dasturchi',
      status: 'online'
    },
    {
      phone: '+998902222222',
      passwordHash: '$2b$10$test',
      firstName: 'Sardor',
      lastName: 'Karimov',
      username: '@sardor',
      bio: 'Dizayner',
      status: 'offline'
    },
    {
      phone: '+998903333333',
      passwordHash: '$2b$10$test',
      firstName: 'Nodira',
      lastName: 'Aliyeva',
      username: '@nodira',
      bio: 'Menejer',
      status: 'online'
    },
    {
      phone: '+998904444444',
      passwordHash: '$2b$10$test',
      firstName: 'Jasur',
      lastName: 'Toshmatov',
      username: '@jasur',
      bio: 'Developer',
      status: 'online'
    },
    {
      phone: '+998905555555',
      passwordHash: '$2b$10$test',
      firstName: 'Malika',
      lastName: 'Rahimova',
      username: '@malika',
      bio: 'Marketing',
      status: 'offline'
    }
  ];

  testUsers.forEach(userData => {
    const user = {
      _id: Date.now().toString() + Math.random(),
      ...userData,
      profilePhotoUrl: null,
      lastSeen: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.set(user._id, user);
  });
  
  console.log(`📝 Created ${testUsers.length} test users for search`);
}

module.exports = { connectDatabase, db };
