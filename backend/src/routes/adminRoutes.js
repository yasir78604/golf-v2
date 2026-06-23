const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(adminMiddleware);

// User Management (no activation)
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
// router.put('/users/:id/activate', adminController.activateUser); // REMOVED

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);
router.get('/winners/recent', adminController.getRecentWinners);

// Draw Management
router.get('/draws/all', adminController.getAllDraws);
router.post('/draw/simulate', adminController.simulateDraw);
router.put('/draw/:drawId/publish', adminController.publishDraw);

// Charity Management
router.post('/charities', adminController.createCharity);
router.put('/charities/:id', adminController.updateCharity);
router.delete('/charities/:id', adminController.deleteCharity);

// Winner Verification
router.get('/winners/all', adminController.getAllWinners);
router.put('/winners/:winnerId/status', adminController.updateWinnerStatus);
router.put('/winners/:winnerId/pay', adminController.markAsPaid);




module.exports = router;