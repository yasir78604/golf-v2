const express = require('express');
const router = express.Router();

// ✅ Correct paths for your structure
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');      // ✅ Exists
const validate = require('../middleware/validate');        // ✅ Now exists
const schemas = require('../schemas/validation');          // ✅ Now exists

// Routes
router.post('/signup', validate(schemas.signup), authController.signup);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;