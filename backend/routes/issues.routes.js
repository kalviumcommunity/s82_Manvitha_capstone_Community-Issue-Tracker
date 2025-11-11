const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/issues.controller');

router.use(auth);
router.post('/', c.create);
router.get('/', c.list);
router.get('/my', c.my);
router.get('/:id', c.one);
router.put('/:id', rbac('PRESIDENT','SECRETARY'), c.update);
router.delete('/:id', rbac('PRESIDENT','SECRETARY'), c.remove);
router.post('/:id/status', rbac('PRESIDENT','SECRETARY'), c.status);
router.post('/:id/assign', rbac('PRESIDENT','SECRETARY'), c.assign);
router.post('/:id/comment', c.comment);
router.get('/:id/comments', c.comments);
router.post('/:id/rating', c.rating);

module.exports = router;
