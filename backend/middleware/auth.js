const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// ─── Protect Route (any valid JWT) ───────────────────────────
exports.protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.is_active) return res.status(401).json({ success: false, message: 'Admin not found' });
    req.admin = admin;
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
