const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/auth');

router.route('/')
  .get(protect, superAdmin, ctrl.getAll)
  .post(protect, superAdmin, ctrl.create);

router.route('/:id')
  .put(protect, superAdmin, ctrl.update)
  .delete(protect, superAdmin, ctrl.remove);

module.exports = router;
