const jwt = require('jsonwebtoken');
const db  = require('../config/db');

// ─── Protect Route (any valid JWT) ───────────────────────────
exports.protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows]  = await db.execute('SELECT id, name, email, role FROM admins WHERE id = ? AND is_active = 1', [decoded.id]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Admin not found' });
    req.admin = rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─── Restrict to Super Admin ──────────────────────────────────
exports.superAdmin = (req, res, next) => {
  if (req.admin?.role !== 'super_admin')
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  next();
};
