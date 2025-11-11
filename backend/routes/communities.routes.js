const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const { create, publicList, details, update, stats } = require('../controllers/communities.controller');

router.get('/public', publicList);
router.use(auth);
router.post('/', rbac('PRESIDENT'), create);
router.get('/:id', details);
router.put('/:id', rbac('PRESIDENT','SECRETARY'), update);
router.get('/:id/stats', stats);

module.exports = router;
