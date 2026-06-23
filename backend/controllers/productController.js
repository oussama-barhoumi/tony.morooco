const db = require('../config/db');

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const { category, status, featured, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (category)  { conditions.push('c.slug = ?');        params.push(category); }
    if (status)    { conditions.push('p.status = ?');       params.push(status); }
    if (featured)  { conditions.push('p.is_featured = 1'); }
    if (search)    { conditions.push('p.name LIKE ?');      params.push(`%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [products] = await db.execute(
      `SELECT p.*, c.name AS category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: products });
  } catch (err) { next(err); }
};

// GET /api/products/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const [images] = await db.execute('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order', [req.params.id]);
    const [reviews] = await db.execute(
      `SELECT r.*, cu.name AS customer_name FROM reviews r
       JOIN customers cu ON r.customer_id = cu.id
       WHERE r.product_id = ? AND r.status = 'approved'`, [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], images, reviews } });
  } catch (err) { next(err); }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    const { category_id, name, description, price, original_price, stock, sizes, is_featured, status } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });

    const slug = slugify(name) + '-' + Date.now();
    const [result] = await db.execute(
      `INSERT INTO products (category_id, name, slug, description, price, original_price, stock, sizes, is_featured, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id || null, name, slug, description || '', price, original_price || null, stock || 0, sizes || 'S,M,L,XL', is_featured ? 1 : 0, status || 'active']
    );

    // Handle uploaded images
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
          [result.insertId, `/uploads/${req.files[i].filename}`, i === 0 ? 1 : 0, i]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Product created', id: result.insertId });
  } catch (err) { next(err); }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    const { name, description, price, original_price, stock, sizes, is_featured, status, category_id } = req.body;
    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Product not found' });

    await db.execute(
      `UPDATE products SET category_id=?, name=?, description=?, price=?, original_price=?, stock=?, sizes=?, is_featured=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [category_id || null, name, description, price, original_price || null, stock, sizes, is_featured ? 1 : 0, status, req.params.id]
    );

    // Append new images if uploaded
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        await db.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 0, ?)',
          [req.params.id, `/uploads/${req.files[i].filename}`, i]
        );
      }
    }

    res.json({ success: true, message: 'Product updated' });
  } catch (err) { next(err); }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Product not found' });
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};

// GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const [cats] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};
