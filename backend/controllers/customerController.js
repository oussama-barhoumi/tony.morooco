const db = require('../config/db');

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const conditions = search ? ['(name LIKE ? OR phone LIKE ? OR city LIKE ?)'] : [];
    const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [customers] = await db.execute(
      `SELECT c.*,
              COUNT(o.id)    AS total_orders,
              COALESCE(SUM(o.total_amount), 0) AS total_spent,
              MAX(o.created_at) AS last_order_date
       FROM customers c
       LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'Cancelled'
       ${where}
       GROUP BY c.id
       ORDER BY total_spent DESC`,
      params
    );
    res.json({ success: true, total: customers.length, data: customers });
  } catch (err) { next(err); }
};

// GET /api/customers/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Customer not found' });

    const [orders] = await db.execute(
      `SELECT o.*, GROUP_CONCAT(oi.product_name SEPARATOR ', ') AS products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.params.id]
    );

    const [[stats]] = await db.execute(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount),0) AS total_spent
       FROM orders WHERE customer_id = ? AND status != 'Cancelled'`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], orders, ...stats } });
  } catch (err) { next(err); }
};
