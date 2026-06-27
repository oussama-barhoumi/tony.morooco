const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  icon:        { type: String, default: 'Sparkles' },
  sort_order:  { type: Number, default: 0 },
  is_active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
