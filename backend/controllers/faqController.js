const FAQ = require('../models/FAQ');

// GET /api/faqs
exports.getAll = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.is_active = true;

    const faqs = await FAQ.find(filter).sort({ sort_order: 1, createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (err) { next(err); }
};

// GET /api/faqs/:id
exports.getOne = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, data: faq });
  } catch (err) { next(err); }
};

// POST /api/faqs
exports.create = async (req, res, next) => {
  try {
    const { question, answer, sort_order, is_active } = req.body;
    if (!question || !answer) return res.status(400).json({ success: false, message: 'Question and Answer are required' });

    const faq = await FAQ.create({
      question,
      answer,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ success: true, data: faq });
  } catch (err) { next(err); }
};

// PUT /api/faqs/:id
exports.update = async (req, res, next) => {
  try {
    const { question, answer, sort_order, is_active } = req.body;
    const updates = {};
    if (question !== undefined) updates.question = question;
    if (answer !== undefined) updates.answer = answer;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (is_active !== undefined) updates.is_active = is_active;

    const faq = await FAQ.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });

    res.json({ success: true, data: faq });
  } catch (err) { next(err); }
};

// DELETE /api/faqs/:id
exports.remove = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) { next(err); }
};
