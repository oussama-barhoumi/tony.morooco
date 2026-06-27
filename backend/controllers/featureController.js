const Feature = require('../models/Feature');

// GET /api/features
exports.getAll = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const features = await Feature.find(filter).sort({ sort_order: 1, createdAt: -1 });
    res.json({ success: true, data: features });
  } catch (err) { next(err); }
};

// GET /api/features/:id
exports.getOne = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
    res.json({ success: true, data: feature });
  } catch (err) { next(err); }
};

// POST /api/features
exports.create = async (req, res, next) => {
  try {
    const { title, description, icon, sort_order, is_active } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and Description are required' });

    const feature = await Feature.create({
      title,
      description,
      icon: icon || 'Sparkles',
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, data: feature });
  } catch (err) { next(err); }
};

// PUT /api/features/:id
exports.update = async (req, res, next) => {
  try {
    const { title, description, icon, sort_order, is_active } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (is_active !== undefined) updates.is_active = is_active;

    const feature = await Feature.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });

    res.json({ success: true, data: feature });
  } catch (err) { next(err); }
};

// DELETE /api/features/:id
exports.remove = async (req, res, next) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
    res.json({ success: true, message: 'Feature deleted' });
  } catch (err) { next(err); }
};
