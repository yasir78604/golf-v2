const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../config/multer');
const winnerController = require('../controllers/winnerController');

// User routes
router.use(authMiddleware);
router.get('/my-winnings', winnerController.getMyWinnings);
router.post('/:winnerId/proof', upload.single('proof'), winnerController.uploadProof);

// Admin routes
router.get('/all', adminMiddleware, winnerController.getAllWinners);
router.put('/:winnerId/status', adminMiddleware, winnerController.updateWinnerStatus);
router.put('/:winnerId/pay', adminMiddleware, winnerController.markAsPaid);

module.exports = router;