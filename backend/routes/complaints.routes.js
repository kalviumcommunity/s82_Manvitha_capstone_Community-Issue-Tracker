const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/complaints.controller');

router.use(auth);
router.post('/', c.create);
router.get('/', rbac('PRESIDENT','SECRETARY'), c.list);
router.get('/my', c.mine);
router.get('/:id', c.one);
router.post('/:id/status', rbac('PRESIDENT','SECRETARY'), c.status);
router.delete('/:id', rbac('PRESIDENT','SECRETARY'), c.remove);

module.exports = router;
