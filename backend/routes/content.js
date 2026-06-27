const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, superAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Banners
router.route('/banners')
  .get(contentController.getBanners)
  .post(protect, superAdmin, upload.single('image'), contentController.createBanner);

router.route('/banners/:id')
  .put(protect, superAdmin, upload.single('image'), contentController.updateBanner)
  .delete(protect, superAdmin, contentController.deleteBanner);

// Testimonials
router.route('/testimonials')
  .get(contentController.getTestimonials)
  .post(protect, superAdmin, contentController.createTestimonial);

router.route('/testimonials/:id')
  .put(protect, superAdmin, contentController.updateTestimonial)
  .delete(protect, superAdmin, contentController.deleteTestimonial);

// General upload utility for settings/rich-text
router.post('/upload', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const { uploadImage } = require('../utils/cloudinary');
    const url = await uploadImage(req.file);
    res.json({ success: true, url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
