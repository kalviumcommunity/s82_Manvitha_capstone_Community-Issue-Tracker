const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/issues.controller');

router.use(auth);

// Any logged-in user
router.post('/', c.create);
router.get('/', rbac('PRESIDENT'), c.list);
router.get('/my', c.my);
router.get('/:id', c.one);
router.post('/:id/comment', c.comment);
router.get('/:id/comments', c.comments);
router.post('/:id/rating', c.rating);

// Creator or Admin actions
router.put('/:id', c.update);
router.delete('/:id', c.remove);

// Admin-only actions
router.post('/:id/status', rbac('PRESIDENT'), c.status);
router.post('/:id/assign', rbac('PRESIDENT'), c.assign);

module.exports = router;
