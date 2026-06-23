const db = require('../config/db');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [[revenue]]   = await db.execute(`SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE status != 'Cancelled'`);
    const [[orders]]    = await db.execute(`SELECT COUNT(*) AS total_orders FROM orders`);
    const [[products]]  = await db.execute(`SELECT COUNT(*) AS total_products FROM products`);
    const [[customers]] = await db.execute(`SELECT COUNT(*) AS total_customers FROM customers`);

    // Monthly revenue (last 6 months)
    const [monthly] = await db.execute(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
             DATE_FORMAT(created_at, '%b')    AS label,
             COALESCE(SUM(total_amount), 0)   AS revenue,
             COUNT(*)                         AS order_count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status != 'Cancelled'
      GROUP BY month, label
      ORDER BY month ASC
    `);

    // Recent 5 orders
    const [recentOrders] = await db.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             c.name AS customer_name, c.city AS customer_city
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC LIMIT 5
    `);

    // Status breakdown
    const [statusBreakdown] = await db.execute(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        total_revenue:   Number(revenue.total_revenue),
        total_orders:    orders.total_orders,
        total_products:  products.total_products,
        total_customers: customers.total_customers,
        monthly_sales:   monthly,
        recent_orders:   recentOrders,
        status_breakdown: statusBreakdown,
      },
    });
  } catch (err) { next(err); }
};
