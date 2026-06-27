const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalRevenue, totalOrders, totalProducts, recentOrders, monthlySales, statusBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            label: { $first: { $dateToString: { format: '%b', date: '$createdAt' } } },
            revenue: { $sum: '$total_amount' },
            order_count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Count unique customers (unique phone numbers)
    const uniqueCustomers = await Order.distinct('customer_phone');

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue[0]?.total || 0,
        total_orders: totalOrders,
        total_products: totalProducts,
        total_customers: uniqueCustomers.length,
        monthly_sales: monthlySales,
        recent_orders: recentOrders,
        status_breakdown: statusBreakdown,
      },
    });
  } catch (err) { next(err); }
};
