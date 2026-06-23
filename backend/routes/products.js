const router  = require('express').Router();
const ctrl    = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload  = require('../config/multer');

router.get ('/',              ctrl.getAll);
router.get ('/categories',    ctrl.getCategories);
router.get ('/:id',           ctrl.getOne);
router.post('/',              protect, upload.array('images', 5), ctrl.create);
router.put ('/:id',           protect, upload.array('images', 5), ctrl.update);
router.delete('/:id',         protect, ctrl.remove);

module.exports = router;
