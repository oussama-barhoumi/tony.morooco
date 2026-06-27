const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String, required: true },
  quantity:     { type: Number, required: true, default: 1 },
  price:        { type: Number, required: true },
  size:         { type: String },
});

const orderSchema = new mongoose.Schema({
  order_number:     { type: String, unique: true },
  customer_name:    { type: String, required: true },
  customer_phone:   { type: String, required: true },
  customer_email:   { type: String },
  shipping_address: { type: String, required: true },
  shipping_city:    { type: String },
  shipping_phone:   { type: String },
  notes:            { type: String },
  items:            [orderItemSchema],
  total_amount:     { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  tracking_number: { type: String },
}, { timestamps: true });

orderSchema.pre('save', function() {
  if (!this.order_number) {
    this.order_number = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model('Order', orderSchema);
