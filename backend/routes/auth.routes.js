const router = require('express').Router();
const { signup, login, me, updateMe } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);
router.patch('/me', auth, updateMe);


module.exports = router;
