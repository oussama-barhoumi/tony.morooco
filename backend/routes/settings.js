const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, superAdmin } = require('../middleware/auth');

router.route('/')
  .get(settingsController.getSettings)
  .put(protect, superAdmin, settingsController.updateSettings);

module.exports = router;
