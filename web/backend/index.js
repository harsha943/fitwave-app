/**
 * FitWave Backend — index.js
 * Express server with JWT authentication, RBAC, rate limiting,
 * and structured API routes to satisfy DAST security tests.
 */
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const crypto  = require('crypto');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fitwave-super-secret-key-2024';

app.use(cors());
app.use(express.json());

// ─── Simple rate-limiter (per IP, sliding window) ─────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW  = 60 * 1000; // 1 minute
const RATE_LIMIT   = 20;        // max 20 requests per window per IP

function rateLimit(req, res, next) {
  const ip  = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - rec.start > RATE_WINDOW) {
    rec.count = 1; rec.start = now;
  } else {
    rec.count += 1;
  }
  rateLimitMap.set(ip, rec);

  if (rec.count > RATE_LIMIT) {
    return res.status(429).json({
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: Math.ceil((RATE_WINDOW - (now - rec.start)) / 1000),
    });
  }
  next();
}

// ─── JWT helpers (no external dependency) ─────────────────────────────────────
function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signJwt(payload) {
  const header  = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const sig     = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Re-sign with our secret and compare signatures
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    if (expectedSig !== parts[2]) return null; // signature mismatch

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Provide a valid Bearer token.' });
  }
  const token   = authHeader.slice(7);
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  req.user = payload;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    const userRole = req.user.role || '';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}.` });
    }
    next();
  };
}

// ─── In-memory user store (demo) ──────────────────────────────────────────────
const USERS = [
  { id: 1, email: 'admin@fitwave.com',   password: 'Admin@1234',  role: 'admin',  name: 'Admin User' },
  { id: 2, email: 'user@fitwave.com',    password: 'User@1234',   role: 'user',   name: 'Regular User' },
  { id: 3, email: 'guest@fitwave.com',   password: 'Guest@1234',  role: 'guest',  name: 'Guest User' },
];

// ─── Health (public) ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitWave backend is running', version: '1.0.0' });
});

// ─── Auth routes (public) ─────────────────────────────────────────────────────
app.post('/api/auth/login', rateLimit, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signJwt({
    sub:   String(user.id),
    email: user.email,
    role:  user.role,
    name:  user.name,
    exp:   Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
  });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/register', rateLimit, (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (USERS.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  const newUser = { id: USERS.length + 1, email, password, role: 'user', name };
  USERS.push(newUser);
  const token = signJwt({ sub: String(newUser.id), email, role: 'user', name, exp: Math.floor(Date.now() / 1000) + 86400 });
  res.status(201).json({ token, user: { id: newUser.id, name, email, role: 'user' } });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// ─── User routes (requires-auth) ──────────────────────────────────────────────
app.get('/api/users/me', requireAuth, (req, res) => {
  const user = USERS.find(u => String(u.id) === String(req.user.sub));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.put('/api/users/me', requireAuth, (req, res) => {
  const user = USERS.find(u => String(u.id) === String(req.user.sub));
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { name } = req.body || {};
  if (name) user.name = name;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ─── Workout routes (requires-auth) ───────────────────────────────────────────
const workouts = [
  { id: 1, userId: 2, name: 'HIIT Hyper-Drive',      duration: 45, calories: 520 },
  { id: 2, userId: 2, name: 'Endurance Run Level 4',  duration: 32, calories: 310 },
  { id: 3, userId: 2, name: 'Flow Yoga Recovery',     duration: 20, calories: 180 },
];

app.get('/api/workouts', requireAuth, (req, res) => {
  const userId = String(req.user.sub);
  const mine   = workouts.filter(w => String(w.userId) === userId);
  res.json(mine);
});

app.post('/api/workouts', requireAuth, (req, res) => {
  const { name, duration, calories } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Workout name is required.' });
  const w = { id: workouts.length + 1, userId: Number(req.user.sub), name, duration: duration || 0, calories: calories || 0 };
  workouts.push(w);
  res.status(201).json(w);
});

app.get('/api/workouts/:id', requireAuth, (req, res) => {
  const workout = workouts.find(w => String(w.id) === req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found.' });
  // Only owner can access their workout
  if (String(workout.userId) !== String(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(workout);
});

app.put('/api/workouts/:id', requireAuth, (req, res) => {
  const workout = workouts.find(w => String(w.id) === req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found.' });
  if (String(workout.userId) !== String(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  Object.assign(workout, req.body);
  res.json(workout);
});

app.delete('/api/workouts/:id', requireAuth, (req, res) => {
  const idx = workouts.findIndex(w => String(w.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Workout not found.' });
  if (String(workouts[idx].userId) !== String(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  workouts.splice(idx, 1);
  res.status(204).send();
});

// ─── Diet / Nutrition routes (requires-auth) ──────────────────────────────────
const meals = [
  { id: 1, userId: 2, name: 'Oatmeal & Berries',  calories: 320, protein: 12, carbs: 58, fat: 6 },
  { id: 2, userId: 2, name: 'Grilled Chicken',     calories: 410, protein: 52, carbs: 8,  fat: 14 },
];

app.get('/api/diet/meals', requireAuth, (req, res) => {
  const mine = meals.filter(m => String(m.userId) === String(req.user.sub));
  res.json(mine);
});

app.post('/api/diet/meals', requireAuth, (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Meal name is required.' });
  const m = { id: meals.length + 1, userId: Number(req.user.sub), name, calories: calories || 0, protein: protein || 0, carbs: carbs || 0, fat: fat || 0 };
  meals.push(m);
  res.status(201).json(m);
});

app.get('/api/diet/meals/:id', requireAuth, (req, res) => {
  const meal = meals.find(m => String(m.id) === req.params.id);
  if (!meal) return res.status(404).json({ error: 'Meal not found.' });
  if (String(meal.userId) !== String(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(meal);
});

// ─── Dashboard / Analytics (requires-auth) ────────────────────────────────────
app.get('/api/dashboard', requireAuth, (req, res) => {
  res.json({
    steps: 8432, calories: 612, minutes: 48,
    heartRate: 72, sleepHours: 8.2, hydration: 1.8,
    bodyWeight: 74.2,
    message: `Welcome back, ${req.user.name || 'Athlete'}!`,
  });
});

app.get('/api/analytics/summary', requireAuth, (req, res) => {
  res.json({ weeklySteps: 52000, weeklyCalories: 3800, workoutsCompleted: 5, avgHeartRate: 74 });
});

// ─── Profile routes (requires-auth) ───────────────────────────────────────────
app.get('/api/profile', requireAuth, (req, res) => {
  const user = USERS.find(u => String(u.id) === String(req.user.sub));
  if (!user) return res.status(404).json({ error: 'Profile not found.' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, bio: '', avatar: null });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const user = USERS.find(u => String(u.id) === String(req.user.sub));
  if (!user) return res.status(404).json({ error: 'Profile not found.' });
  const { name, bio } = req.body || {};
  if (name) user.name = name;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ─── Admin-only routes (role-restricted) ──────────────────────────────────────
app.get('/api/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  res.json(USERS.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.get('/api/admin/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const user = USERS.find(u => String(u.id) === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.put('/api/admin/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const user = USERS.find(u => String(u.id) === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { name, role } = req.body || {};
  if (name) user.name = name;
  if (role) user.role = role;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.delete('/api/admin/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const idx = USERS.findIndex(u => String(u.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  USERS.splice(idx, 1);
  res.status(204).send();
});

app.get('/api/admin/analytics', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ totalUsers: USERS.length, totalWorkouts: workouts.length, totalMeals: meals.length });
});

app.get('/api/admin/reports', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ reports: [] });
});

// ─── Plans / subscriptions (requires-auth) ────────────────────────────────────
app.get('/api/plans', requireAuth, (req, res) => {
  res.json([
    { id: 'free',  name: 'Free',    price: 0,   features: ['Basic tracking'] },
    { id: 'pro',   name: 'Pro',     price: 9.99, features: ['AI insights', 'Advanced analytics'] },
    { id: 'elite', name: 'Elite',   price: 19.99, features: ['All Pro features', '1-on-1 coaching'] },
  ]);
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 FitWave backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   POST /api/auth/login`);
  console.log(`   Admin:  GET  /api/admin/users  (admin role required)`);
});
