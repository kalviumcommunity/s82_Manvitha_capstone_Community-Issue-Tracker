const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/complaints.controller');

router.use(auth);

// Any logged-in user can create & view their complaints
router.post('/', c.create);
router.get('/my', c.mine);
router.get('/:id', c.one);

// Admin-only actions
router.get('/', rbac('PRESIDENT'), c.list);
router.post('/:id/status', rbac('PRESIDENT'), c.status);
router.delete('/:id', rbac('PRESIDENT'), c.remove);

module.exports = router;
