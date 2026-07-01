const router = require('express').Router();
const auth = require('../middlewares/auth');
const aiController = require('../controllers/ai.controller');

// Protected route for AI suggestions
router.post('/autocomplete', auth, aiController.generateSuggestion);

module.exports = router;
