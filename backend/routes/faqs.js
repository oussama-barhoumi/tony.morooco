const router = require('express').Router();
const ctrl = require('../controllers/faqController');
const { protect, superAdmin } = require('../middleware/auth');

router.route('/')
  .get(ctrl.getAll)
  .post(protect, superAdmin, ctrl.create);

router.route('/:id')
  .get(ctrl.getOne)
  .put(protect, superAdmin, ctrl.update)
  .delete(protect, superAdmin, ctrl.remove);

module.exports = router;
