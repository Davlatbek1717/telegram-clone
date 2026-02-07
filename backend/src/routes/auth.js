const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../utils/validation');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.put('/me/update', authenticate, authController.updateProfile);
router.put('/me/photo', authenticate, authController.updateProfilePhoto);
router.get('/profile', authenticate, authController.getProfile);
router.get('/search', authenticate, authController.searchUsers);

module.exports = router;
