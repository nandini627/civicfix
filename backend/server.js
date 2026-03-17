const express = require('express');
const path = require('path');
console.log('>>> SERVER.JS STARTING - VERSION 2.1 <<<');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const userRoutes = require('./routes/users');
console.log('User routes loaded:', !!userRoutes, typeof userRoutes === 'function');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);

// ─── Production Setup ────────────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log('Serving frontend from:', frontendPath);
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ message: 'CivicFix API is running 🚀' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  }
  next();
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Connect to MongoDB & start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
