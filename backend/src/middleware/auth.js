const { verifyToken, hashToken } = require('../utils/jwt');
const Session = require('../models/Session');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'TOKEN_INVALID',
        message: 'Token topilmadi'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'TOKEN_INVALID',
        message: 'Noto\'g\'ri yoki muddati o\'tgan token'
      });
    }
    
    const tokenHash = hashToken(token);
    const session = await Session.findOne({ tokenHash });
    
    if (!session || new Date(session.expiresAt) <= new Date()) {
      return res.status(401).json({
        error: 'TOKEN_INVALID',
        message: 'Sessiya topilmadi'
      });
    }
    
    await Session.update(session.tokenHash, { lastActivity: new Date() });
    
    const user = await User.findById(session.userId);
    
    req.user = {
      userId: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Autentifikatsiya xatoligi'
    });
  }
}

module.exports = { authenticate };
