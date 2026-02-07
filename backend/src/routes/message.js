const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/:chatId', messageController.getChatMessages);
router.put('/:messageId/read', messageController.markAsRead);

module.exports = router;
