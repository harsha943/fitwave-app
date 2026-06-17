const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup upload folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// In-memory state for mock application
let workouts = [
  { id: 1, name: 'Morning Cardio Blast', category: 'Cardio', duration: 30, difficulty: 'Medium' },
  { id: 2, name: 'Heavy Squat Session', category: 'Strength', duration: 45, difficulty: 'Hard' },
  { id: 3, name: 'Yoga Flow & Flexibility', category: 'Flexibility', duration: 60, difficulty: 'Easy' }
];

let notifications = [
  { id: 1, message: 'Welcome to Fitwave! Start adding your workout routine.', read: false },
  { id: 2, message: 'Reminder: Weekly Fitness Report is ready to download.', read: false }
];

let currentUser = {
  name: 'Harsha Vardhan',
  email: 'admin@fitwave.com',
  phone: '+15550199',
  avatar: '/uploads/default-avatar.png'
};

// Default styling variables inside HTML templates for premium look
const headerHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fitwave - Premium Fitness Workspace</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-card: #151c2c;
      --bg-input: #1e293b;
      --border-color: #2e3c56;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #10b981;
      --accent-hover: #059669;
      --danger: #ef4444;
      --danger-hover: #dc2626;
      --primary: #3b82f6;
      --glass: rgba(21, 28, 44, 0.7);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
    }
    
    body {
      background-color: var(--bg-main);
      color: var(--text-main);
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .glass-card {
      background: var(--glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    
    input, select, textarea {
      background-color: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.3s ease;
      outline: none;
      width: 100%;
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }
    
    .btn-primary {
      background-color: var(--accent);
      color: #0b0f19;
    }
    
    .btn-primary:hover {
      background-color: var(--accent-hover);
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }
    
    .btn-secondary:hover {
      background-color: var(--border-color);
    }
    
    .btn-danger {
      background-color: var(--danger);
      color: white;
    }
    
    .btn-danger:hover {
      background-color: var(--danger-hover);
    }
    
    /* Layout */
    .app-container {
      display: flex;
      flex: 1;
    }
    
    .sidebar {
      width: 260px;
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      transition: all 0.3s ease;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 36px;
      padding-left: 8px;
    }
    
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      list-style: none;
    }
    
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .nav-links a:hover, .nav-links li.active a {
      color: var(--text-main);
      background-color: var(--border-color);
      border-left: 4px solid var(--accent);
    }
    
    .main-content {
      flex: 1;
      padding: 36px;
      background-color: var(--bg-main);
      overflow-y: auto;
    }
    
    /* Responsive Navigation */
    .mobile-header {
      display: none;
      background-color: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 16px;
      justify-content: space-between;
      align-items: center;
    }
    
    .menu-toggle {
      background: none;
      border: none;
      color: var(--text-main);
      font-size: 24px;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .app-container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        display: none;
      }
      .sidebar.active {
        display: flex;
      }
      .mobile-header {
        display: flex;
      }
      .main-content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
`;

const footerHTML = `
  <script>
    function toggleSidebar() {
      const sidebar = document.getElementById('appSidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
      }
    }
  </script>
</body>
</html>
`;

// Helper to wrap dashboard template
function renderDashboardLayout(title, contentHTML) {
  return `
    ${headerHTML}
    <div class="mobile-header">
      <div style="font-size: 20px; font-weight:700; color:var(--accent);">Fitwave</div>
      <button class="menu-toggle" id="menuToggle" onclick="toggleSidebar()">☰</button>
    </div>
    <div class="app-container">
      <aside class="sidebar" id="appSidebar">
        <div class="brand">
          <span style="font-size: 28px;">⚡</span> Fitwave
        </div>
        <ul class="nav-links">
          <li class="${title === 'Dashboard' ? 'active' : ''}"><a href="/dashboard" id="navDashboard">📊 Dashboard</a></li>
          <li class="${title === 'Profile' ? 'active' : ''}"><a href="/profile" id="navProfile">👤 Profile</a></li>
          <li class="${title === 'Settings' ? 'active' : ''}"><a href="/settings" id="navSettings">⚙️ Settings</a></li>
          <li><a href="/logout" id="navLogout">🚪 Logout</a></li>
        </ul>
        <div style="margin-top: auto; padding: 16px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display:flex; align-items:center; justify-content:center; font-weight:bold; color:#0b0f19;">HV</div>
          <div>
            <div style="font-size: 14px; font-weight: 600;" id="sidebarUserName">${currentUser.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Premium Member</div>
          </div>
        </div>
      </aside>
      <main class="main-content">
        ${contentHTML}
      </main>
    </div>
    ${footerHTML}
  `;
}

// API Reset Route to clear in-memory state between tests
app.get('/api/reset', (req, res) => {
  workouts = [
    { id: 1, name: 'Morning Cardio Blast', category: 'Cardio', duration: 30, difficulty: 'Medium' },
    { id: 2, name: 'Heavy Squat Session', category: 'Strength', duration: 45, difficulty: 'Hard' },
    { id: 3, name: 'Yoga Flow & Flexibility', category: 'Flexibility', duration: 60, difficulty: 'Easy' }
  ];

  notifications = [
    { id: 1, message: 'Welcome to Fitwave! Start adding your workout routine.', read: false },
    { id: 2, message: 'Reminder: Weekly Fitness Report is ready to download.', read: false }
  ];

  currentUser = {
    name: 'Harsha Vardhan',
    email: 'admin@fitwave.com',
    phone: '+15550199',
    avatar: '/uploads/default-avatar.png'
  };

  res.send('State reset complete.');
});

// 1. Login Page
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.send(`
    ${headerHTML}
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
      <div class="glass-card" style="width:100%; max-width:420px; padding: 40px;">
        <div style="text-align:center; margin-bottom: 30px;">
          <h1 style="font-size:32px; font-weight:700; color:var(--accent); margin-bottom:8px;">Welcome Back</h1>
          <p style="color:var(--text-muted);">Access your premium fitness hub</p>
        </div>
        
        <form action="/login" method="POST" id="loginForm">
          <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:var(--text-muted);">Email Address</label>
            <input type="email" name="username" id="loginEmail" placeholder="name@domain.com" required value="">
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:var(--text-muted);">Password</label>
            <input type="password" name="password" id="loginPassword" placeholder="••••••••" required value="">
          </div>
          
          <button type="submit" class="btn btn-primary" id="loginSubmitBtn" style="width:100%;">Sign In</button>
        </form>
        
        <div style="text-align:center; margin-top:24px;">
          <p style="color:var(--text-muted); font-size:14px;">Don't have an account? <a href="/register" id="linkToRegister" style="color:var(--accent); text-decoration:none; font-weight:600;">Create one</a></p>
        </div>
      </div>
    </div>
    ${footerHTML}
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // SQL Injection simulation
  if (username.includes("'") || username.includes("OR")) {
    return res.status(400).send(`
      ${headerHTML}
      <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
        <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; border-color: var(--danger);">
          <h2 style="color: var(--danger); margin-bottom:12px;" id="loginErrorMsg">Security Exception</h2>
          <p style="margin-bottom:20px;">SQL Injection Attempt Detected or Malformed characters in Username field.</p>
          <a href="/login" class="btn btn-secondary">Try Again</a>
        </div>
      </div>
      ${footerHTML}
    `);
  }

  if (username === 'admin@fitwave.com' && password === 'AdminPassword123!') {
    res.redirect('/dashboard');
  } else {
    res.status(401).send(`
      ${headerHTML}
      <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
        <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; border-color: var(--danger);">
          <h2 style="color: var(--danger); margin-bottom:12px;" id="loginErrorMsg">Authentication Failure</h2>
          <p style="margin-bottom:20px;">Invalid email or password parameters provided.</p>
          <a href="/login" class="btn btn-secondary">Try Again</a>
        </div>
      </div>
      ${footerHTML}
    `);
  }
});

// 2. Register Page
app.get('/register', (req, res) => {
  res.send(`
    ${headerHTML}
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
      <div class="glass-card" style="width:100%; max-width:420px; padding: 40px;">
        <div style="text-align:center; margin-bottom: 30px;">
          <h1 style="font-size:32px; font-weight:700; color:var(--accent); margin-bottom:8px;">Start Today</h1>
          <p style="color:var(--text-muted);">Register to begin your fitness path</p>
        </div>
        
        <form action="/register" method="POST" id="registerForm">
          <div style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:var(--text-muted);">Full Name</label>
            <input type="text" name="name" id="regName" placeholder="John Doe" required>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:var(--text-muted);">Email Address</label>
            <input type="email" name="email" id="regEmail" placeholder="name@domain.com" required>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:var(--text-muted);">Password</label>
            <input type="password" name="password" id="regPassword" placeholder="Minimum 8 characters" required>
          </div>
          
          <button type="submit" class="btn btn-primary" id="registerSubmitBtn" style="width:100%;">Create Account</button>
        </form>
        
        <div style="text-align:center; margin-top:24px;">
          <p style="color:var(--text-muted); font-size:14px;">Already have an account? <a href="/login" id="linkToLogin" style="color:var(--accent); text-decoration:none; font-weight:600;">Sign In</a></p>
        </div>
      </div>
    </div>
    ${footerHTML}
  `);
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  // Security Password Validation
  const minLengthRegex = /.{8,}/;
  const complexityRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
  
  if (!minLengthRegex.test(password)) {
    return res.status(400).send(`
      ${headerHTML}
      <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
        <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; border-color: var(--danger);">
          <h2 style="color: var(--danger); margin-bottom:12px;" id="regErrorMsg">Weak Password</h2>
          <p style="margin-bottom:20px;">Password must be at least 8 characters long.</p>
          <a href="/register" class="btn btn-secondary">Try Again</a>
        </div>
      </div>
      ${footerHTML}
    `);
  }
  
  if (!complexityRegex.test(password)) {
    return res.status(400).send(`
      ${headerHTML}
      <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
        <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; border-color: var(--danger);">
          <h2 style="color: var(--danger); margin-bottom:12px;" id="regErrorMsg">Complexity Violation</h2>
          <p style="margin-bottom:20px;">Password must contain uppercase, lowercase, digits, and a special character.</p>
          <a href="/register" class="btn btn-secondary">Try Again</a>
        </div>
      </div>
      ${footerHTML}
    `);
  }
  
  // Registration success
  res.send(`
    ${headerHTML}
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
      <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; text-align:center; border-color: var(--accent);">
        <h2 style="color: var(--accent); margin-bottom:12px;" id="regSuccessMsg">Success!</h2>
        <p style="margin-bottom:20px;">Account registered successfully. Proceed to login.</p>
        <a href="/login" class="btn btn-primary" id="btnGoToLogin">Go to Login</a>
      </div>
    </div>
    ${footerHTML}
  `);
});

// 3. Dashboard
app.get('/dashboard', (req, res) => {
  const { search = '', category = '', duration = '' } = req.query;
  
  // Filtering & Search implementation
  let filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
                          w.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? w.category === category : true;
    let matchesDuration = true;
    if (duration) {
      if (duration === 'short') matchesDuration = w.duration <= 30;
      else if (duration === 'medium') matchesDuration = w.duration > 30 && w.duration <= 45;
      else if (duration === 'long') matchesDuration = w.duration > 45;
    }
    return matchesSearch && matchesCategory && matchesDuration;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const dashboardContent = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px; flex-wrap:wrap; gap:16px;">
      <div>
        <h1 style="font-size:36px; font-weight:700;">Dashboard</h1>
        <p style="color:var(--text-muted);">Welcome back, <span id="welcomeUserName">${currentUser.name}</span>!</p>
      </div>
      <div style="display:flex; gap:12px; align-items:center; position:relative;">
        <!-- Notifications bell -->
        <button class="btn btn-secondary" id="btnNotifications" onclick="toggleNotifications()" style="position:relative;">
          🔔 Notifications <span id="notifBadge" style="background:var(--danger); color:white; border-radius:50%; padding: 2px 6px; font-size:11px; margin-left:4px; display:${unreadCount > 0 ? 'inline' : 'none'};">${unreadCount}</span>
        </button>
        
        <div id="notificationsDropdown" class="glass-card" style="display:none; position:absolute; right:0; top:52px; width:320px; padding:16px; z-index:100; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:between; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px; width:100%;">
            <strong style="flex-grow:1;">Notifications</strong>
            <a href="#" id="clearNotificationsBtn" onclick="clearNotifications()" style="color:var(--accent); text-decoration:none; font-size:12px; font-weight:600;">Clear All</a>
          </div>
          <div id="notificationsList" style="display:flex; flex-direction:column; gap:8px;">
            ${notifications.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;" id="noNotifMsg">No notifications</p>' : 
              notifications.map(n => `
                <div class="notification-item" id="notif-item-${n.id}" style="font-size:13px; padding:6px; border-radius:4px; background:rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                  <span>${n.message}</span>
                  <button onclick="readSingleNotif(${n.id})" style="border:none; background:none; cursor:pointer; color:var(--accent);">✓</button>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:30px;">
      <div class="glass-card" style="padding: 24px;">
        <div style="font-size: 14px; color:var(--text-muted); margin-bottom: 8px;">Active Workouts</div>
        <div style="font-size: 32px; font-weight:700; color:var(--accent);" id="activeWorkoutsCount">${workouts.length}</div>
      </div>
      <div class="glass-card" style="padding: 24px;">
        <div style="font-size: 14px; color:var(--text-muted); margin-bottom: 8px;">Total Minutes</div>
        <div style="font-size: 32px; font-weight:700; color:var(--primary);" id="totalDurationCount">${workouts.reduce((acc, w) => acc + w.duration, 0)}m</div>
      </div>
      <div class="glass-card" style="padding: 24px;">
        <div style="font-size: 14px; color:var(--text-muted); margin-bottom: 8px;">Notifications Alert</div>
        <div style="font-size: 32px; font-weight:700; color:var(--danger);">${unreadCount} Unread</div>
      </div>
    </div>
    
    <!-- CRUD & List Grid -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom: 30px;" id="dashboardGrid">
      
      <!-- Workouts Section -->
      <div class="glass-card" style="padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:12px;">
          <h2>Workout Routines</h2>
          
          <form action="/dashboard" method="GET" style="display:flex; gap:8px; flex-grow:1; max-width:400px;" id="filterForm">
            <input type="text" name="search" id="searchBar" placeholder="Search..." value="${search}" style="padding:8px 12px; font-size:14px;">
            <select name="category" id="categoryFilter" style="padding:8px 12px; font-size:14px; width:120px;" onchange="this.form.submit()">
              <option value="">Category</option>
              <option value="Cardio" ${category === 'Cardio' ? 'selected' : ''}>Cardio</option>
              <option value="Strength" ${category === 'Strength' ? 'selected' : ''}>Strength</option>
              <option value="Flexibility" ${category === 'Flexibility' ? 'selected' : ''}>Flexibility</option>
            </select>
            <button type="submit" class="btn btn-secondary" style="padding: 8px 16px; font-size:14px;" id="btnApplySearch">Find</button>
            <a href="/dashboard" class="btn btn-secondary" style="padding: 8px 16px; font-size:14px;" id="btnClearFilters">Reset</a>
          </form>
        </div>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom: 20px;" id="workoutTable">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align:left; color:var(--text-muted);">
              <th style="padding:12px;">Workout ID</th>
              <th style="padding:12px;">Name</th>
              <th style="padding:12px;">Category</th>
              <th style="padding:12px;">Duration</th>
              <th style="padding:12px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="workoutTableBody">
            ${filteredWorkouts.length === 0 ? '<tr><td colspan="5" style="padding:20px; text-align:center; color:var(--text-muted);" id="noWorkoutsMsg">No workouts match criteria</td></tr>' : 
              filteredWorkouts.map(w => `
                <tr style="border-bottom: 1px solid var(--border-color);" class="workout-row">
                  <td style="padding:12px;">WK-${String(w.id).padStart(3, '0')}</td>
                  <td style="padding:12px; font-weight:600;">${w.name}</td>
                  <td style="padding:12px;"><span style="padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; background:rgba(255,255,255,0.05);">${w.category}</span></td>
                  <td style="padding:12px;">${w.duration} mins</td>
                  <td style="padding:12px; text-align:right; display:flex; justify-content:flex-end; gap:8px;">
                    <a href="/workout/edit/${w.id}" class="btn btn-secondary edit-workout-btn" id="edit-wk-${w.id}" style="padding:6px 12px; font-size:13px;">Edit</a>
                    <form action="/workout/delete/${w.id}" method="POST" onsubmit="return confirm('Delete this routine?')">
                      <button type="submit" class="btn btn-danger delete-workout-btn" id="delete-wk-${w.id}" style="padding:6px 12px; font-size:13px;">Delete</button>
                    </form>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
      
      <!-- Management and File Section -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        <!-- Create Workout -->
        <div class="glass-card" style="padding:24px;">
          <h3>Add Workout</h3>
          <form action="/workout/create" method="POST" id="createWorkoutForm" style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
            <div>
              <label style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:4px;">Workout Name</label>
              <input type="text" name="name" id="workoutNameInput" placeholder="Sprint training..." required>
            </div>
            <div>
              <label style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:4px;">Category</label>
              <select name="category" id="workoutCategoryInput" required>
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Flexibility">Flexibility</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:4px;">Duration (minutes)</label>
              <input type="number" name="duration" id="workoutDurationInput" placeholder="30" required min="1">
            </div>
            <button type="submit" class="btn btn-primary" id="btnSubmitWorkout" style="margin-top:8px;">Add Exercise</button>
          </form>
        </div>
        
        <!-- Files Utilities -->
        <div class="glass-card" style="padding:24px;">
          <h3>File Management</h3>
          
          <form action="/upload" method="POST" enctype="multipart/form-data" id="uploadForm" style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
            <label style="font-size:12px; color:var(--text-muted); display:block;">Upload Workout Tracker (.pdf, .png, .jpg)</label>
            <input type="file" name="trackerFile" id="fileUploadInput" required style="padding:6px 12px;">
            <button type="submit" class="btn btn-secondary" id="btnUploadFile">Upload File</button>
          </form>
          
          <div style="margin-top:20px; border-top: 1px solid var(--border-color); padding-top:20px; display:flex; flex-direction:column; gap:12px;">
            <label style="font-size:12px; color:var(--text-muted); display:block;">Export Health Reports</label>
            <a href="/download/report" class="btn btn-secondary" id="btnDownloadReport" style="width:100%;">📥 Download Excel Report</a>
            <a href="/download/backup" class="btn btn-secondary" id="btnDownloadBackup" style="width:100%;">📥 Export JSON Backup</a>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      function toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      }
      
      async function clearNotifications() {
        await fetch('/api/notifications/clear', { method: 'POST' });
        document.getElementById('notificationsList').innerHTML = '<p style="color:var(--text-muted); font-size:13px;" id="noNotifMsg">No notifications</p>';
        document.getElementById('notifBadge').style.display = 'none';
      }
      
      async function readSingleNotif(id) {
        await fetch('/api/notifications/read/' + id, { method: 'POST' });
        const item = document.getElementById('notif-item-' + id);
        if (item) item.remove();
        
        // Update badge
        const badge = document.getElementById('notifBadge');
        let count = parseInt(badge.textContent, 10) - 1;
        if (count > 0) {
          badge.textContent = count;
        } else {
          badge.style.display = 'none';
          document.getElementById('notificationsList').innerHTML = '<p style="color:var(--text-muted); font-size:13px;" id="noNotifMsg">No notifications</p>';
        }
      }
    </script>
  `;
  res.send(renderDashboardLayout('Dashboard', dashboardContent));
});

// Notifications APIs
app.post('/api/notifications/clear', (req, res) => {
  notifications = [];
  res.json({ success: true });
});

app.post('/api/notifications/read/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  notifications = notifications.filter(n => n.id !== id);
  res.json({ success: true });
});

// CRUD Workout Create
app.post('/workout/create', (req, res) => {
  const { name, category, duration } = req.body;
  const newWorkout = {
    id: workouts.length > 0 ? Math.max(...workouts.map(w => w.id)) + 1 : 1,
    name,
    category,
    duration: parseInt(duration, 10) || 30
  };
  workouts.push(newWorkout);
  res.redirect('/dashboard');
});

// CRUD Workout Edit Form
app.get('/workout/edit/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const workout = workouts.find(w => w.id === id);
  if (!workout) {
    return res.status(404).send('Workout not found');
  }

  res.send(`
    ${headerHTML}
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
      <div class="glass-card" style="width:100%; max-width:480px; padding: 40px;">
        <h2 style="margin-bottom:20px; color:var(--accent);">Edit Workout Routine</h2>
        <form action="/workout/edit/${id}" method="POST" id="editWorkoutForm" style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Workout Name</label>
            <input type="text" name="name" id="editNameInput" value="${workout.name}" required>
          </div>
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Category</label>
            <select name="category" id="editCategoryInput" required>
              <option value="Cardio" ${workout.category === 'Cardio' ? 'selected' : ''}>Cardio</option>
              <option value="Strength" ${workout.category === 'Strength' ? 'selected' : ''}>Strength</option>
              <option value="Flexibility" ${workout.category === 'Flexibility' ? 'selected' : ''}>Flexibility</option>
            </select>
          </div>
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Duration (minutes)</label>
            <input type="number" name="duration" id="editDurationInput" value="${workout.duration}" required min="1">
          </div>
          <div style="display:flex; gap:12px; margin-top:8px;">
            <button type="submit" class="btn btn-primary" id="btnUpdateWorkout" style="flex:1;">Save Changes</button>
            <a href="/dashboard" class="btn btn-secondary" id="btnCancelEdit" style="flex:1; text-align:center;">Cancel</a>
          </div>
        </form>
      </div>
    </div>
    ${footerHTML}
  `);
});

app.post('/workout/edit/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, category, duration } = req.body;
  const index = workouts.findIndex(w => w.id === id);
  if (index !== -1) {
    workouts[index] = {
      ...workouts[index],
      name,
      category,
      duration: parseInt(duration, 10) || 30
    };
  }
  res.redirect('/dashboard');
});

// CRUD Workout Delete
app.post('/workout/delete/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  workouts = workouts.filter(w => w.id !== id);
  res.redirect('/dashboard');
});

// 4. Profile Page
app.get('/profile', (req, res) => {
  const contentHTML = `
    <h1 style="font-size:36px; font-weight:700; margin-bottom:30px;">User Profile</h1>
    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:24px; max-width:900px;" id="profileGrid">
      
      <!-- Avatar Card -->
      <div class="glass-card" style="padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px;">
        <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--accent); display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:bold; color:#0b0f19;" id="profileAvatarText">HV</div>
        <div>
          <h3 id="profileCardName">${currentUser.name}</h3>
          <p style="color:var(--text-muted); font-size:14px;" id="profileCardEmail">${currentUser.email}</p>
        </div>
        <div style="border-top:1px solid var(--border-color); width:100%; padding-top:16px;">
          <form action="/profile/avatar" method="POST" enctype="multipart/form-data" id="avatarForm">
            <label style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:8px;">Change Profile Pic</label>
            <input type="file" name="avatarFile" id="avatarUploadInput" required style="padding:4px 8px; font-size:12px; margin-bottom:8px;">
            <button type="submit" class="btn btn-secondary" style="padding:6px 12px; font-size:12px; width:100%;" id="btnUploadAvatar">Upload Photo</button>
          </form>
        </div>
      </div>
      
      <!-- Profile Details Form -->
      <div class="glass-card" style="padding:24px;">
        <h2>Update Details</h2>
        <form action="/profile/update" method="POST" id="profileUpdateForm" style="margin-top:20px; display:flex; flex-direction:column; gap:16px;">
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Full Name</label>
            <input type="text" name="name" id="profileNameInput" value="${currentUser.name}" required>
          </div>
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Email Address</label>
            <input type="email" name="email" id="profileEmailInput" value="${currentUser.email}" required>
          </div>
          <div>
            <label style="font-size:14px; color:var(--text-muted); display:block; margin-bottom:8px;">Phone Number</label>
            <input type="text" name="phone" id="profilePhoneInput" value="${currentUser.phone}">
          </div>
          <button type="submit" class="btn btn-primary" id="btnSaveProfile" style="align-self:flex-start;">Save Settings</button>
        </form>
      </div>
    </div>
  `;
  res.send(renderDashboardLayout('Profile', contentHTML));
});

app.post('/profile/update', (req, res) => {
  const { name, email, phone } = req.body;
  currentUser.name = name;
  currentUser.email = email;
  currentUser.phone = phone;
  res.redirect('/profile');
});

app.post('/profile/avatar', upload.single('avatarFile'), (req, res) => {
  if (req.file) {
    currentUser.avatar = `/uploads/${req.file.filename}`;
  }
  res.redirect('/profile');
});

// 5. Settings Page
app.get('/settings', (req, res) => {
  const contentHTML = `
    <h1 style="font-size:36px; font-weight:700; margin-bottom:30px;">System Settings</h1>
    <div class="glass-card" style="padding:30px; max-width:600px;">
      <h2>Configurations</h2>
      <form action="/settings/save" method="POST" id="settingsForm" style="margin-top:20px; display:flex; flex-direction:column; gap:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
          <div>
            <strong>Interface Theme</strong>
            <p style="font-size:12px; color:var(--text-muted);">Toggle interface between light and dark mode</p>
          </div>
          <select name="theme" id="settingsTheme" style="width:140px;">
            <option value="dark" selected>Dark Slate</option>
            <option value="light">Glass Light</option>
          </select>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
          <div>
            <strong>Email Alerts</strong>
            <p style="font-size:12px; color:var(--text-muted);">Get notifications in email box</p>
          </div>
          <select name="emailAlerts" id="settingsEmailAlerts" style="width:140px;">
            <option value="enabled" selected>Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
          <div>
            <strong>Weekly Summary</strong>
            <p style="font-size:12px; color:var(--text-muted);">Generate automatic fitness summaries</p>
          </div>
          <select name="weeklySummary" id="settingsWeeklySummary" style="width:140px;">
            <option value="yes" selected>Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        
        <div style="display:flex; gap:12px; margin-top:8px;">
          <button type="submit" class="btn btn-primary" id="btnSaveSettings" style="flex:1;">Save Configurations</button>
          <a href="/dashboard" class="btn btn-secondary" id="btnCancelSettings" style="flex:1; text-align:center;">Cancel Settings</a>
        </div>
      </form>
    </div>
  `;
  res.send(renderDashboardLayout('Settings', contentHTML));
});

app.post('/settings/save', (req, res) => {
  res.redirect('/settings');
});

// 6. File Uploads
app.post('/upload', upload.single('trackerFile'), (req, res) => {
  if (req.file) {
    res.send(`
      ${headerHTML}
      <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
        <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; text-align:center; border-color: var(--accent);">
          <h2 style="color: var(--accent); margin-bottom:12px;" id="uploadSuccessMsg">Upload Succeeded</h2>
          <p style="margin-bottom:20px;">File ${req.file.originalname} uploaded to storage successfully.</p>
          <a href="/dashboard" class="btn btn-primary" id="uploadSuccessBackBtn">Back to Dashboard</a>
        </div>
      </div>
      ${footerHTML}
    `);
  } else {
    res.status(400).send('Upload failed.');
  }
});

// 7. File Downloads
app.get('/download/report', (req, res) => {
  const reportPath = path.join(__dirname, 'uploads', 'sample-report.xlsx');
  // Create a fake excel report on the fly if it doesn't exist
  if (!fs.existsSync(reportPath)) {
    fs.writeFileSync(reportPath, 'MOCK EXCEL HEALTH DATA');
  }
  res.download(reportPath, 'Fitwave_Export_Report.xlsx');
});

app.get('/download/backup', (req, res) => {
  const backupData = JSON.stringify(workouts, null, 2);
  res.setHeader('Content-disposition', 'attachment; filename=fitwave_backup.json');
  res.setHeader('Content-type', 'application/json');
  res.write(backupData);
  res.end();
});

// 8. Logout Page
app.get('/logout', (req, res) => {
  res.send(`
    ${headerHTML}
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; padding: 20px;">
      <div class="glass-card" style="width:100%; max-width:420px; padding: 40px; text-align:center;">
        <h2 style="margin-bottom:12px;" id="logoutMsg">Signed Out</h2>
        <p style="color:var(--text-muted); margin-bottom:24px;">You have closed your active session successfully.</p>
        <a href="/login" class="btn btn-primary" id="btnLogoutBackBtn" style="width:100%;">Sign In Again</a>
      </div>
    </div>
    ${footerHTML}
  `);
});

// Start listening
const serverInstance = app.listen(PORT, () => {
  console.log(`Fitwave Mock Web Application is listening on port ${PORT}...`);
});

module.exports = serverInstance;
