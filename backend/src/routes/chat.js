const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/private', chatController.createOrGetPrivateChat);
router.post('/group', chatController.createGroup);
router.get('/', chatController.getUserChats);
router.get('/search', chatController.searchUsers);

module.exports = router;
