const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const c = require('../controllers/comments.controller');

router.use(auth);
router.delete('/:id', rbac('PRESIDENT','SECRETARY'), c.delete);

module.exports = router;
