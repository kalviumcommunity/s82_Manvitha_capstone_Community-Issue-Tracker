const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/posts.controller');

router.use(auth);
router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.one);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/like', c.like);
router.post('/:id/comment', c.comment);

module.exports = router;
