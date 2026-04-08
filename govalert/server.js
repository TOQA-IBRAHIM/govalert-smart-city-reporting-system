const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  port: 3306,
  database: 'gov_alert',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Test database connection
pool.query("SELECT 1 + 1 AS solution", (err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Database connected successfully!");
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with email:', email);
  pool.query(
    "SELECT id, password FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error('Login database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        console.log('No user found for email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match);
      if (match) {
        req.session.userId = user.id;
        console.log('Session set with userId:', req.session.userId);
        res.json({ success: true, redirect: 'profile.html' });
      } else {
        console.log('Password mismatch for email:', email);
        res.status(401).json({ error: 'Invalid email or password' });
      }
    }
  );
});

// Get current user
app.get('/api/current-user', (req, res) => {
  if (!req.session.userId) {
    console.log('No session userId found');
    return res.status(401).json({ error: 'Not logged in' });
  }
  console.log('Fetching user with ID:', req.session.userId);
  pool.query(
    'SELECT id, name, email, phone_num FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error('Current user database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        console.log('No user found for ID:', req.session.userId);
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    }
  );
});

// Get user by ID
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  console.log('Fetching user with ID:', userId);
  pool.query(
    'SELECT id, name, email, phone_num FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('User by ID database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        console.log('No user found for ID:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    }
  );
});

// Get total reports submitted by user
app.get('/api/reports/count/:user_id', (req, res) => {
  const userId = req.params.user_id;
  console.log('Fetching total reports for userId:', userId);
  pool.query(
    'SELECT COUNT(*) as total_reports FROM reports WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Total reports database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results[0]);
    }
  );
});

// Get solved reports count for user
app.get('/api/reports/solved/:user_id', (req, res) => {
  const userId = req.params.user_id;
  console.log('Fetching solved reports for userId:', userId);
  pool.query(
    'SELECT COUNT(*) as solved_reports FROM reports WHERE user_id = ? AND status = "solved"',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Solved reports database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results[0]);
    }
  );
});

// Update user profile
app.post('/api/user/update', (req, res) => {
  if (!req.session.userId) {
    console.log('No session userId for update');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, email, phone_num } = req.body;
  console.log('Updating user with ID:', req.session.userId, 'Data:', { name, email, phone_num });
  pool.query(
    'UPDATE users SET name = ?, email = ?, phone_num = ? WHERE id = ?',
    [name, email, phone_num, req.session.userId],
    (err, results) => {
      if (err) {
        console.error('Update user database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.affectedRows === 0) {
        console.log('No user found for update ID:', req.session.userId);
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true });
    }
  );
});

// Simulate sending email
app.post('/api/send-email', (req, res) => {
  const { email, message } = req.body;
  console.log(`Simulated email to ${email}: ${message}`);
  res.json({ success: true });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, redirect: 'index.html' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});