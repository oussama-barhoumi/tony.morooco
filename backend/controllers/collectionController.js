const Collection = require('../models/Collection');
const { uploadImage } = require('../utils/cloudinary');

// GET /api/collections
exports.getAll = async (req, res, next) => {
  try {
    const { activeOnly, featuredOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;
    if (featuredOnly === 'true') filter.is_featured = true;

    const collections = await Collection.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: collections });
  } catch (err) { next(err); }
};

// GET /api/collections/:slugOrId
exports.getOne = async (req, res, next) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId };

    const collection = await Collection.findOne(query);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.json({ success: true, data: collection });
  } catch (err) { next(err); }
};

// POST /api/collections
exports.create = async (req, res, next) => {
  try {
    const { name, description, is_featured, is_active } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Collection.findOne({ slug });
    if (existing) return res.status(409).json({ success: false, message: 'Collection already exists' });

    let image_url = null;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const collection = await Collection.create({
      name,
      slug,
      description,
      image_url,
      is_featured: is_featured !== undefined ? is_featured : false,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, data: collection });
  } catch (err) { next(err); }
};

// PUT /api/collections/:id
exports.update = async (req, res, next) => {
  try {
    const { name, description, is_featured, is_active } = req.body;
    const updates = { description };

    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (is_active !== undefined) updates.is_active = is_active;
    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    if (req.file) {
      updates.image_url = await uploadImage(req.file);
    }

    const collection = await Collection.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    res.json({ success: true, data: collection });
  } catch (err) { next(err); }
};

// DELETE /api/collections/:id
exports.remove = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) { next(err); }
};
