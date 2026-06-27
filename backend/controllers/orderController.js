const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/orders
exports.getAll = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customer_name: { $regex: search, $options: 'i' } },
        { order_number: { $regex: search, $options: 'i' } },
        { shipping_city: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOne = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image_url');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// POST /api/orders
exports.create = async (req, res, next) => {
  try {
    const { customer_name, customer_phone, customer_email, shipping_address, shipping_city, notes, items } = req.body;
    if (!customer_name || !customer_phone || !shipping_address || !items?.length)
      return res.status(400).json({ success: false, message: 'Customer info, address, and items are required' });

    const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const order = await Order.create({
      customer_name, customer_phone, customer_email, shipping_address,
      shipping_city, shipping_phone: customer_phone, notes,
      items, total_amount: total,
    });

    // Decrease stock
    for (const item of items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    res.status(201).json({ success: true, message: 'Order created', orderId: order._id });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) { next(err); }
};

// DELETE /api/orders/:id
exports.remove = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) { next(err); }
};
