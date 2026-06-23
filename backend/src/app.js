require("dotenv").config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const adminRoutes = require('./routes/adminRoutes');
const charityRoutes = require('./routes/charityRoutes');
const drawRoutes = require('./routes/drawRoutes');          // NEW
const winnerRoutes = require('./routes/winnerRoutes');      // NEW
const subscriptionRoutes = require('./routes/subscriptionRoutes'); // NEW

const subscriptionController = require('./controllers/subscriptionController');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

const _dirname = path.resolve()


app.post('/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);                // NEW
app.use('/api/winners', winnerRoutes);            // NEW
app.use('/api/subscriptions', subscriptionRoutes); // NEW

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});


app.use(express.static(path.join(_dirname, "frontend", "dist")))

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"))
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});



// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});


app.get('/api/test-profiles', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
    res.json({
      success: true,
      data,
      error: error || null,
      message: error ? 'Error accessing profiles' : 'Profiles accessible!'
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
    res.json({
      success: true,
      data: data || [],
      error: error || null,
      hasData: data && data.length > 0
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});





module.exports = app;