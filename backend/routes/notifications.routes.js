const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/notifications.controller');

router.use(auth);
router.get('/', c.list);
router.post('/mark-read', c.markAllRead);
router.patch('/:id/read', c.markRead);
router.delete('/:id', c.remove);

module.exports = router;
