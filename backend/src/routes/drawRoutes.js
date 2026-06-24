const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const drawController = require('../controllers/drawController');

// Public routes
router.get('/current', drawController.getCurrentDraw);
router.get('/past', drawController.getPastDraws);

// Admin routes
router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/all', drawController.getAllDraws);
router.post('/simulate', drawController.simulateDraw);
router.put('/:drawId/publish', drawController.publishDraw);

module.exports = router;