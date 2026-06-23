// Central error handler — must be registered last in Express
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ success: false, message: 'Duplicate entry — record already exists' });

  // JWT errors
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, message: 'Invalid token' });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
