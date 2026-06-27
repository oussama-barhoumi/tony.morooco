require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const connectDB  = require('./config/db');

const errorHandler = require('./middleware/errorHandler');

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, process.env.FRONTEND_URL || 'http://localhost:5173');
    }
  },
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','OPTIONS'],
}));

// ─── Rate Limiting ───────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests, try again later' } }));
app.use('/api',      rateLimit({ windowMs: 60 * 1000, max: 200 }));

// ─── Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (Uploaded Images) ──────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Tony Original Morocco API is running', timestamp: new Date().toISOString() }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/customers',   require('./routes/customers'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/settings',    require('./routes/settings'));
app.use('/api/content',     require('./routes/content'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/brands',      require('./routes/brands'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/faqs',        require('./routes/faqs'));
app.use('/api/features',    require('./routes/features'));
app.use('/api/users',       require('./routes/users'));

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` }));

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🟢 Tony Original Morocco API`);
  console.log(`   Running on  : http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
