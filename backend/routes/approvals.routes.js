const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const { requestJoin, listPending, decision } = require('../controllers/approvals.controller');

router.use(auth);
router.post('/join', requestJoin);
router.get('/pending', rbac('PRESIDENT','SECRETARY'), listPending);
router.post('/:id/decision', rbac('PRESIDENT','SECRETARY'), decision);

module.exports = router;
