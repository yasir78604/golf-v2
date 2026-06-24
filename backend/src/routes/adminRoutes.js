const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminController = require('../controllers/adminController');
const drawController = require('../controllers/drawController');  // ✅ Import drawController

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);
router.get('/winners/recent', adminController.getRecentWinners);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);

// Draw Management
router.get('/draws/all', adminController.getAllDraws);                    // ✅ Admin draws list
router.post('/draw/simulate', drawController.simulateDraw);              // ✅ Simulate route
router.put('/draw/:drawId/publish', drawController.publishDraw);         // ✅ Publish route
router.post('/draws/:drawId/force-winners', adminController.forceMatchWinners); // Fallback

// Charity Management
router.post('/charities', adminController.createCharity);
router.put('/charities/:id', adminController.updateCharity);
router.delete('/charities/:id', adminController.deleteCharity);

// Winner Management
router.get('/winners/all', adminController.getAllWinners);
router.put('/winners/:winnerId/status', adminController.updateWinnerStatus);
router.put('/winners/:winnerId/pay', adminController.markAsPaid);

module.exports = router;