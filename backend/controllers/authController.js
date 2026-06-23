const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

    const [existing] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role || 'admin']
    );

    const token = signToken(result.insertId, role || 'admin');
    res.status(201).json({ success: true, message: 'Admin registered', token, admin: { id: result.insertId, name, email, role: role || 'admin' } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const [rows] = await db.execute('SELECT * FROM admins WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(admin.id, admin.role);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};
