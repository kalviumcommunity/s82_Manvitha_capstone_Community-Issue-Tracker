const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/posts.controller');

router.use(auth);

// Any logged-in user
router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.one);
router.post('/:id/like', c.like);
router.post('/:id/comment', c.comment);

// Admin-only moderation
router.put('/:id', rbac('PRESIDENT'), c.update);
router.delete('/:id', rbac('PRESIDENT'), c.remove);

module.exports = router;
