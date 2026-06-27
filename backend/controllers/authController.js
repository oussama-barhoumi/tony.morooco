const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const admin = await Admin.create({ name, email, password, role: role || 'admin' });
    const token = signToken(admin._id, admin.role);
    res.status(201).json({ success: true, token, admin: { id: admin._id, name, email, role: admin.role } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const admin = await Admin.findOne({ email, is_active: true });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await admin.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(admin._id, admin.role);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};
