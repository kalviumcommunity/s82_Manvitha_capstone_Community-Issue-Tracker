const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/announcements.controller');

router.use(auth);

// Admin-only actions
router.post('/', rbac('PRESIDENT'), c.create);
router.put('/:id', rbac('PRESIDENT'), c.update);
router.delete('/:id', rbac('PRESIDENT'), c.remove);
router.patch('/:id/pin', rbac('PRESIDENT'), c.pin);

// Accessible to all logged-in users
router.get('/', c.list);
router.get('/:id', c.one);

module.exports = router;
