const Banner = require('../models/Banner');
const Testimonial = require('../models/Testimonial');
const { uploadImage } = require('../utils/cloudinary');

// ─── Banners CRUD ─────────────────────────────────────────────

// GET /api/content/banners
exports.getBanners = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const banners = await Banner.find(filter).sort({ sort_order: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) { next(err); }
};

// POST /api/content/banners
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, cta_text, cta_link, is_active, sort_order } = req.body;
    
    let image_url = null;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    if (!title || !image_url) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      image_url,
      cta_text,
      cta_link,
      sort_order: sort_order ? Number(sort_order) : 0,
      is_active: is_active === 'true' || is_active === true || is_active === 1 || is_active === '1'
    });

    res.status(201).json({ success: true, banner });
  } catch (err) { next(err); }
};

// PUT /api/content/banners/:id
exports.updateBanner = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    
    if (req.file) {
      updates.image_url = await uploadImage(req.file);
    }
    
    if (updates.is_active !== undefined) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true || updates.is_active === 1 || updates.is_active === '1';
    }

    if (updates.sort_order !== undefined) {
      updates.sort_order = Number(updates.sort_order);
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    
    res.json({ success: true, banner });
  } catch (err) { next(err); }
};

// DELETE /api/content/banners/:id
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
};


// ─── Testimonials CRUD ────────────────────────────────────────

// GET /api/content/testimonials
exports.getTestimonials = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) { next(err); }
};

// POST /api/content/testimonials
exports.createTestimonial = async (req, res, next) => {
  try {
    const { author_name, content, rating, is_active } = req.body;
    if (!author_name || !content) {
      return res.status(400).json({ success: false, message: 'Author name and content are required' });
    }

    const testimonial = await Testimonial.create({
      author_name,
      content,
      rating: rating ? Number(rating) : 5,
      is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : true
    });

    res.status(201).json({ success: true, testimonial });
  } catch (err) { next(err); }
};

// PUT /api/content/testimonials/:id
exports.updateTestimonial = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.is_active !== undefined) {
      updates.is_active = updates.is_active === 'true' || updates.is_active === true;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    res.json({ success: true, testimonial });
  } catch (err) { next(err); }
};

// DELETE /api/content/testimonials/:id
exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) { next(err); }
};
