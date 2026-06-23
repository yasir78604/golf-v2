const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const scoreController = require('../controllers/scoreController');

router.use(authMiddleware);

router.get('/', scoreController.getMyScores);
router.post('/', scoreController.createScore);
router.put('/:id', scoreController.updateScore);
router.delete('/:id', scoreController.deleteScore);

module.exports = router;