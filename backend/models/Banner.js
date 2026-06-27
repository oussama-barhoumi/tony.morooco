const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  subtitle:   { type: String },
  image_url:  { type: String, required: true },
  cta_text:   { type: String },
  cta_link:   { type: String },
  sort_order: { type: Number, default: 0 },
  is_active:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
