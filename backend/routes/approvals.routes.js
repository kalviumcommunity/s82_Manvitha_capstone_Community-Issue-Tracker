const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  requestJoin,
  listPending,
  decision,
  cancelRequest
} = require('../controllers/approvals.controller');

router.use(auth);

// Any logged-in user can request to join a community
router.post('/join', requestJoin);
router.delete('/:id', cancelRequest);

// Admin-only
router.get('/pending', rbac('PRESIDENT'), listPending);
router.post('/:id/decision', rbac('PRESIDENT'), decision);

module.exports = router;
