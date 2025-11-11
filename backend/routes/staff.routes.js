const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/staff.controller');

router.use(auth);
router.post('/', rbac('PRESIDENT','SECRETARY'), c.create);
router.get('/', c.list);
router.get('/:id', c.one);
router.put('/:id', rbac('PRESIDENT','SECRETARY'), c.update);
router.delete('/:id', rbac('PRESIDENT','SECRETARY'), c.remove);

module.exports = router;
