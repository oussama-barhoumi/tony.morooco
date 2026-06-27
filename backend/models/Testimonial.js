const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  author_name: { type: String, required: true },
  content:     { type: String, required: true },
  rating:      { type: Number, default: 5 },
  is_active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
