const Category = require('../models/Category');
const { uploadImage } = require('../utils/cloudinary');

// GET /api/categories
exports.getAll = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

// GET /api/categories/:slugOrId
exports.getOne = async (req, res, next) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId };

    const category = await Category.findOne(query);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

// POST /api/categories
exports.create = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    let image_url = null;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image_url,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
};

// PUT /api/categories/:id
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
      updates.image_url = await uploadImage(req.file);
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id
exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};
