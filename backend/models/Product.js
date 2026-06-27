const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand:          { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  name:           { type: String, required: true },
  slug:           { type: String, required: true, unique: true, lowercase: true },
  description:    { type: String },
  price:          { type: Number, required: true },
  original_price: { type: Number },
  discount:       { type: Number, default: 0 },
  stock:          { type: Number, default: 0 },
  sizes:          { type: String, default: 'S,M,L,XL' },
  specifications: { type: Map, of: String },
  is_featured:    { type: Boolean, default: false },
  is_bestseller:  { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: false },
  is_active:      { type: Boolean, default: true },
  status:         { type: String, enum: ['active', 'out_of_stock', 'draft'], default: 'active' },
  image_url:      { type: String },
  images:         { type: [String], default: [] },
}, { timestamps: true });

// Sync first image to image_url on save
productSchema.pre('save', function() {
  if (this.images && this.images.length > 0) {
    this.image_url = this.images[0];
  }
});

// Virtual for category info on queries
productSchema.virtual('category_name').get(function() {
  return this.category?.name;
});

module.exports = mongoose.model('Product', productSchema);
