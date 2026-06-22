import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/dashboard.css';

const API = '';

function getToken() { return localStorage.getItem('fw_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('fw_user')); } catch { return null; }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [stats, setStats] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!getToken()) { navigate('/login'); return; }
    Promise.all([
      fetch(`${API}/api/dashboard`, { headers }).then(r => r.json()),
      fetch(`${API}/api/workouts`, { headers }).then(r => r.json()),
      fetch(`${API}/api/diet/meals`, { headers }).then(r => r.json()),
    ]).then(([dash, wks, mls]) => {
      setStats(dash);
      setWorkouts(Array.isArray(wks) ? wks : []);
      setMeals(Array.isArray(mls) ? mls : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading your fitness data…</p>
    </div>
  );

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="dash-sidebar" id="appSidebar">
        <div className="dash-brand">
          <span>⚡</span> FitWave
        </div>
        <nav className="dash-nav">
          <Link to="/dashboard" className="nav-link active" id="navDashboard">📊 Dashboard</Link>
          <Link to="/workout"   className="nav-link" id="navWorkout">💪 Workouts</Link>
          <Link to="/login"     className="nav-link" id="navProfile">👤 Profile</Link>
        </nav>
        <div className="dash-user-info">
          <div className="dash-avatar">{user?.name?.[0] || 'U'}</div>
          <div>
            <div className="dash-user-name" id="sidebarUserName">{user?.name || 'Athlete'}</div>
            <div className="dash-user-role">{user?.role || 'member'}</div>
          </div>
        </div>
        <button className="btn-logout" id="navLogout" onClick={logout}>🚪 Logout</button>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 id="welcomeUserName">Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}! 👋</h1>
            <p>Your fitness summary for today</p>
          </div>
          <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="dash-stats-grid" id="statsGrid">
            {[
              { label: 'Steps',      value: stats.steps?.toLocaleString(),   icon: '🚶', color: 'blue'   },
              { label: 'Calories',   value: `${stats.calories} kcal`,         icon: '🔥', color: 'orange' },
              { label: 'Active Min', value: `${stats.minutes} min`,           icon: '⏱️', color: 'green'  },
              { label: 'Heart Rate', value: `${stats.heartRate} bpm`,         icon: '❤️', color: 'red'    },
              { label: 'Sleep',      value: `${stats.sleepHours} hrs`,        icon: '😴', color: 'purple' },
              { label: 'Hydration',  value: `${stats.hydration} L`,           icon: '💧', color: 'cyan'   },
            ].map(s => (
              <div className={`stat-card stat-${s.color}`} key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content Grid */}
        <div className="dash-content-grid">
          {/* Workouts */}
          <section className="dash-card" id="workoutsSection">
            <div className="dash-card-header">
              <h2>Recent Workouts</h2>
              <Link to="/workout" className="btn-link">View All →</Link>
            </div>
            {workouts.length === 0
              ? <p className="empty-msg" id="noWorkoutsMsg">No workouts yet. Add your first one!</p>
              : (
                <div className="workout-list" id="workoutList">
                  {workouts.map(w => (
                    <div className="workout-item" key={w.id} id={`workout-${w.id}`}>
                      <div className="workout-icon">💪</div>
                      <div className="workout-info">
                        <div className="workout-name">{w.name}</div>
                        <div className="workout-meta">{w.duration} min · {w.calories} kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

          {/* Meals */}
          <section className="dash-card" id="mealsSection">
            <div className="dash-card-header">
              <h2>Today's Nutrition</h2>
            </div>
            {meals.length === 0
              ? <p className="empty-msg">No meals tracked today.</p>
              : (
                <div className="meal-list">
                  {meals.map(m => (
                    <div className="meal-item" key={m.id}>
                      <div className="meal-icon">🍽️</div>
                      <div className="meal-info">
                        <div className="meal-name">{m.name}</div>
                        <div className="meal-meta">{m.calories} kcal · P:{m.protein}g C:{m.carbs}g F:{m.fat}g</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            <div className="total-calories" id="totalCalories">
              <strong>Total: {meals.reduce((a,m) => a + (m.calories||0), 0)} kcal</strong>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
