const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question:   { type: String, required: true },
  answer:     { type: String, required: true },
  sort_order: { type: Number, default: 0 },
  is_active:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
