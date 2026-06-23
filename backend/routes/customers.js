const router = require('express').Router();
const ctrl   = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.get('/',    protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);

module.exports = router;
