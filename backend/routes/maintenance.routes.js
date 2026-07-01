const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/maintenance.controller');

router.use(auth);

// Admin-only (billing control)
router.post('/generate', rbac('PRESIDENT'), c.generate);
router.get('/', rbac('PRESIDENT'), c.list);
router.post('/:id/mark-paid', rbac('PRESIDENT'), c.markPaid);
router.post('/:id/waive', rbac('PRESIDENT'), c.waive);

// Resident-accessible
router.get('/my', c.my);
router.get('/:id', c.one);

module.exports = router;
