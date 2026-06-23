const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// ============================================
// WEBHOOK - Stripe sends raw body (must be before express.json())
// ============================================
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

// ============================================
// USER ROUTES (require authentication)
// ============================================

// Create checkout session
router.post(
  '/create-checkout',
  authMiddleware,
  subscriptionController.createCheckoutSession
);

// Activate subscription (manual trigger after payment success)
router.post(
  '/activate',
  authMiddleware,
  subscriptionController.activateSubscription
);

// Get subscription status
router.get(
  '/status',
  authMiddleware,
  subscriptionController.getSubscriptionStatus
);

module.exports = router;