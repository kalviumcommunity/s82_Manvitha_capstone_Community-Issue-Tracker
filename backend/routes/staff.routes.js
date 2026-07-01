const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/staff.controller');

router.use(auth);

// Admin-only staff management
router.post('/', rbac('PRESIDENT'), c.create);
router.put('/:id', rbac('PRESIDENT'), c.update);
router.delete('/:id', rbac('PRESIDENT'), c.remove);

// Any logged-in user can view staff
router.get('/', c.list);
router.get('/:id', c.one);

module.exports = router;
