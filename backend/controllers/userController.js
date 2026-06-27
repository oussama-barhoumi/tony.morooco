const Admin = require('../models/Admin');

// GET /api/users
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await Admin.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// POST /api/users
exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, is_active } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
      is_active: is_active !== undefined ? is_active : true
    });

    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ success: true, data: userObject });
  } catch (err) { next(err); }
};

// PUT /api/users/:id
exports.update = async (req, res, next) => {
  try {
    const { name, email, password, role, is_active } = req.body;
    const user = await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    res.json({ success: true, data: userObject });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id
exports.remove = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await Admin.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};
