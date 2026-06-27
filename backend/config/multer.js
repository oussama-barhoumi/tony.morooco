const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure upload directory exists
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadDir = isVercel ? '/tmp' : (process.env.UPLOAD_PATH || './uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext     = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime    = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
