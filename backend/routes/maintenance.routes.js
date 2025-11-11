const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/maintenance.controller');

router.use(auth);
router.post('/generate', rbac('PRESIDENT','SECRETARY'), c.generate);
router.get('/', rbac('PRESIDENT','SECRETARY'), c.list);
router.get('/my', c.my);
router.get('/:id', c.one);
router.post('/:id/mark-paid', rbac('PRESIDENT','SECRETARY'), c.markPaid);
router.post('/:id/waive', rbac('PRESIDENT','SECRETARY'), c.waive);

module.exports = router;
