const Setting = require('../models/Setting');

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const rows = await Setting.find();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) { next(err); }
};
