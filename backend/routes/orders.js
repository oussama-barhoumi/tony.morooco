const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get   ('/',          protect, ctrl.getAll);
router.get   ('/:id',       protect, ctrl.getOne);
router.post  ('/',                   ctrl.create);       // public: customers place orders
router.put   ('/:id/status',protect, ctrl.updateStatus);
router.delete('/:id',       protect, ctrl.remove);

module.exports = router;
