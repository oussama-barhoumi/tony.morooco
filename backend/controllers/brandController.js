const Brand = require('../models/Brand');
const { uploadImage } = require('../utils/cloudinary');

// GET /api/brands
exports.getAll = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (err) { next(err); }
};

// GET /api/brands/:slugOrId
exports.getOne = async (req, res, next) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId };

    const brand = await Brand.findOne(query);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: brand });
  } catch (err) { next(err); }
};

// POST /api/brands
exports.create = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Brand.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Brand already exists' });

    let logo_url = null;
    if (req.file) {
      logo_url = await uploadImage(req.file);
    }

    const brand = await Brand.create({
      name,
      slug,
      description,
      logo_url,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, data: brand });
  } catch (err) { next(err); }
};

// PUT /api/brands/:id
exports.update = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    const updates = { description };

    if (is_active !== undefined) updates.is_active = is_active;
    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    if (req.file) {
      updates.logo_url = await uploadImage(req.file);
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    res.json({ success: true, data: brand });
  } catch (err) { next(err); }
};

// DELETE /api/brands/:id
exports.remove = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) { next(err); }
};
