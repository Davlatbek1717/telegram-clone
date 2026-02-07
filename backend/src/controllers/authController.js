const User = require('../models/User');
const Session = require('../models/Session');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateToken, hashToken, getTokenExpiration } = require('../utils/jwt');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const ACCOUNT_LOCK_TIME = parseInt(process.env.ACCOUNT_LOCK_TIME) || 900000;

async function register(req, res) {
  try {
    const { phone, email, password, firstName, lastName, username } = req.validatedData;
    
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'PASSWORD_TOO_WEAK',
        message: passwordValidation.message
      });
    }
    
    // Check if phone already exists
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(409).json({
        error: 'PHONE_EXISTS',
        message: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan'
      });
    }
    
    // Check if email already exists
    if (email) {
      const allUsers = await User.findAll();
      const existingUserByEmail = allUsers.find(u => u.email === email);
      if (existingUserByEmail) {
        return res.status(409).json({
          error: 'EMAIL_EXISTS',
          message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
        });
      }
    }
    
    // Check if username already exists
    if (username) {
      const allUsers = await User.findAll();
      const existingUserByUsername = allUsers.find(u => u.username === username);
      if (existingUserByUsername) {
        return res.status(409).json({
          error: 'USERNAME_EXISTS',
          message: 'Bu username allaqachon band'
        });
      }
    }
    
    const passwordHash = await hashPassword(password);
    
    const user = await User.create({
      phone,
      email: email || null,
      passwordHash,
      firstName,
      lastName: lastName || undefined,
      username: username || null
    });
    
    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone
    });
    
    const tokenHash = hashToken(token);
    const expiresAt = getTokenExpiration();
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await Session.create({
      userId: user._id,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt
    });
    
    user.status = 'online';
    await User.save(user);
    
    return res.status(201).json({
      userId: user._id,
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        userId: user._id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        profilePhoto: user.profilePhotoUrl,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Ro\'yxatdan o\'tishda xatolik yuz berdi'
    });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.validatedData; // identifier = phone, username yoki email
    
    // Find user by phone, username or email
    let user = null;
    const allUsers = await User.findAll();
    
    for (const u of allUsers) {
      if (u.phone === identifier || 
          u.username === identifier || 
          u.email === identifier) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Username, telefon yoki parol noto\'g\'ri'
      });
    }
    
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return res.status(403).json({
        error: 'ACCOUNT_LOCKED',
        message: 'Akkaunt vaqtincha bloklangan. 15 daqiqadan keyin qayta urinib ko\'ring'
      });
    }
    
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.accountLockedUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME);
        await User.save(user);
        return res.status(403).json({
          error: 'ACCOUNT_LOCKED',
          message: 'Akkaunt 15 daqiqaga bloklandi (5 marta noto\'g\'ri parol)'
        });
      }
      
      await User.save(user);
      
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Username, telefon yoki parol noto\'g\'ri',
        attemptsLeft: MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts
      });
    }
    
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    
    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone
    });
    
    const tokenHash = hashToken(token);
    const expiresAt = getTokenExpiration();
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await Session.create({
      userId: user._id,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt
    });
    
    user.status = 'online';
    await User.save(user);
    
    return res.status(200).json({
      userId: user._id,
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        userId: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profilePhotoUrl,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Tizimga kirishda xatolik yuz berdi'
    });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);
    const tokenHash = hashToken(token);
    
    await Session.deleteOne({ tokenHash });
    
    await User.findByIdAndUpdate(req.user.userId, {
      status: 'offline',
      lastSeen: new Date()
    });
    
    return res.status(200).json({
      message: 'Tizimdan muvaffaqiyatli chiqildi'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Tizimdan chiqishda xatolik yuz berdi'
    });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Foydalanuvchi topilmadi'
      });
    }
    
    return res.status(200).json({
      userId: user._id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      bio: user.bio,
      profilePhoto: user.profilePhotoUrl,
      status: user.status,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Profil ma\'lumotlarini olishda xatolik yuz berdi'
    });
  }
}

async function updateProfile(req, res) {
  try {
    const { firstName, lastName, username, bio } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (firstName && (firstName.length < 1 || firstName.length > 64)) {
      return res.status(400).json({
        error: 'INVALID_FIRSTNAME',
        message: 'Ism 1 dan 64 belgigacha bo\'lishi kerak'
      });
    }

    if (lastName && lastName.length > 64) {
      return res.status(400).json({
        error: 'INVALID_LASTNAME',
        message: 'Familiya 64 belgidan oshmasligi kerak'
      });
    }

    if (bio && bio.length > 70) {
      return res.status(400).json({
        error: 'INVALID_BIO',
        message: 'Bio 70 belgidan oshmasligi kerak'
      });
    }

    // Check username uniqueness
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id !== userId) {
        return res.status(409).json({
          error: 'USERNAME_EXISTS',
          message: 'Bu username allaqachon band'
        });
      }
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;

    await User.findByIdAndUpdate(userId, updates);
    
    // Get updated user data
    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Foydalanuvchi topilmadi'
      });
    }

    return res.status(200).json({
      message: 'Profil muvaffaqiyatli yangilandi',
      user: {
        userId: updatedUser._id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePhoto: updatedUser.profilePhotoUrl,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Profilni yangilashda xatolik yuz berdi'
    });
  }
}

async function updateProfilePhoto(req, res) {
  try {
    const { photoUrl } = req.body;
    const userId = req.user.userId;

    if (!photoUrl) {
      return res.status(400).json({
        error: 'INVALID_PHOTO',
        message: 'Rasm URL manzili talab qilinadi'
      });
    }

    // In production, you would validate the photo size (max 5MB)
    // and upload to a storage service like AWS S3, Cloudinary, etc.

    await User.findByIdAndUpdate(userId, {
      profilePhotoUrl: photoUrl
    });
    
    // Get updated user
    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Foydalanuvchi topilmadi'
      });
    }

    return res.status(200).json({
      message: 'Profil rasmi muvaffaqiyatli yangilandi',
      profilePhoto: updatedUser.profilePhotoUrl,
      user: {
        userId: updatedUser._id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePhoto: updatedUser.profilePhotoUrl,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Update profile photo error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Profil rasmini yangilashda xatolik yuz berdi'
    });
  }
}

async function searchUsers(req, res) {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Qidiruv so\'rovi kamida 3 belgidan iborat bo\'lishi kerak'
      });
    }
    
    const users = await User.search(query);
    
    const results = users
      .filter(user => user._id.toString() !== req.user.userId)
      .map(user => ({
        userId: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profilePhoto: user.profilePhotoUrl,
        status: user.status
      }));
    
    return res.status(200).json({
      users: results
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Foydalanuvchilarni qidirishda xatolik yuz berdi'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updateProfilePhoto,
  searchUsers
};
