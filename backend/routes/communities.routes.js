const router = require('express').Router();
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const {
  create,
  publicList,
  details,
  update,
  stats,
  listResidents,
  transferOwnership,
  removeResident
} = require('../controllers/communities.controller');

// Public route
router.get('/public', publicList);

// Authenticated routes
router.use(auth);

// Admin-only
router.post('/', rbac('PRESIDENT'), create);
router.put('/:id', rbac('PRESIDENT'), update);

// Accessible to any logged-in user
router.get('/:id', auth, details);
router.patch('/:id', auth, update);
router.get('/:id/stats', stats);
router.get('/:id/residents', auth, listResidents);

// President Only
router.post('/transfer-ownership', rbac('PRESIDENT'), transferOwnership);
router.delete('/:id/residents/:residentId', rbac('PRESIDENT'), removeResident);

module.exports = router;
