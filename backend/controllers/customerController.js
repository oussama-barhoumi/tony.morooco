const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    // Aggregate unique customers from orders
    const customers = await Order.aggregate([
      {
        $group: {
          _id: '$customer_phone',
          name: { $last: '$customer_name' },
          email: { $last: '$customer_email' },
          phone: { $last: '$customer_phone' },
          city: { $last: '$shipping_city' },
          total_orders: { $sum: 1 },
          total_spent: { $sum: '$total_amount' },
          created_at: { $min: '$createdAt' },
        }
      },
      { $sort: { total_spent: -1 } }
    ]);

    const normalized = customers.map(c => ({
      id: c._id,
      name: c.name,
      email: c.email || 'N/A',
      phone: c.phone,
      city: c.city || 'N/A',
      total_orders: c.total_orders,
      total_spent: c.total_spent,
      created_at: c.created_at,
    }));

    res.json({ success: true, data: normalized });
  } catch (err) { next(err); }
};

// GET /api/customers/:phone  (order history for a customer)
exports.getOne = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer_phone: req.params.phone }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};
