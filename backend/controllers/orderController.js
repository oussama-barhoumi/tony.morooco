const db = require('../config/db');

const genOrderNumber = () => 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// GET /api/orders
exports.getAll = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (search) { conditions.push('(c.name LIKE ? OR o.order_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [orders] = await db.execute(
      `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM orders o JOIN customers c ON o.customer_id = c.id ${where}`,
      params
    );

    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email, c.city AS customer_city
       FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const [items] = await db.execute(
      'SELECT oi.*, p.name AS product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], items } });
  } catch (err) { next(err); }
};

// POST /api/orders
exports.create = async (req, res, next) => {
  try {
    const { customer_name, customer_phone, customer_email, shipping_address, shipping_city, notes, items } = req.body;
    if (!customer_name || !customer_phone || !shipping_address || !items?.length)
      return res.status(400).json({ success: false, message: 'Customer info, address, and items are required' });

    // Upsert customer
    let customerId;
    const [existingCustomer] = await db.execute('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
    if (existingCustomer.length) {
      customerId = existingCustomer[0].id;
    } else {
      const [cResult] = await db.execute(
        'INSERT INTO customers (name, email, phone, city, address) VALUES (?, ?, ?, ?, ?)',
        [customer_name, customer_email || null, customer_phone, shipping_city || null, shipping_address]
      );
      customerId = cResult.insertId;
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const [orderResult] = await db.execute(
      `INSERT INTO orders (customer_id, order_number, total_amount, status, shipping_address, shipping_phone, shipping_city, notes)
       VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?)`,
      [customerId, genOrderNumber(), total, shipping_address, customer_phone, shipping_city || null, notes || null]
    );

    for (const item of items) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size) VALUES (?, ?, ?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.product_name, item.quantity, item.price, item.size || null]
      );
      // Decrease stock
      await db.execute('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, item.product_id]);
    }

    res.status(201).json({ success: true, message: 'Order created', orderId: orderResult.insertId });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, tracking_number } = req.body;
    const valid = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    await db.execute(
      'UPDATE orders SET status = ?, tracking_number = COALESCE(?, tracking_number), updated_at = NOW() WHERE id = ?',
      [status, tracking_number || null, req.params.id]
    );
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) { next(err); }
};

// DELETE /api/orders/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id FROM orders WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Order not found' });
    await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) { next(err); }
};
