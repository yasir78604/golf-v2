const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const drawController = require('../controllers/drawController');

// Public routes (users can view draws – no auth required for current/past)
router.get('/current', drawController.getCurrentDraw);
router.get('/past', drawController.getPastDraws);

// Admin routes – require auth + admin
router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/all', drawController.getAllDraws);
router.post('/simulate', drawController.simulateDraw);
router.put('/:drawId/publish', drawController.publishDraw);

module.exports = router;