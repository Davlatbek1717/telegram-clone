const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' };
  }
  
  // Simplified validation - just check length
  // In production, you can add more complex rules
  
  return { valid: true };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
