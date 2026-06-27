const router = require('express').Router();
const ctrl = require('../controllers/collectionController');
const { protect, superAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

router.route('/')
  .get(ctrl.getAll)
  .post(protect, superAdmin, upload.single('image'), ctrl.create);

router.route('/:slugOrId')
  .get(ctrl.getOne);

router.route('/:id')
  .put(protect, superAdmin, upload.single('image'), ctrl.update)
  .delete(protect, superAdmin, ctrl.remove);

module.exports = router;
