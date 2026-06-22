import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/workout.css';

const API = '';

function getToken() { return localStorage.getItem('fw_token'); }

const Workout = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: '', duration: '', calories: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const headers = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };

  const fetchWorkouts = () =>
    fetch(`${API}/api/workouts`, { headers })
      .then(r => r.json())
      .then(d => setWorkouts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!getToken()) { navigate('/login'); return; }
    fetchWorkouts();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const res = await fetch(`${API}/api/workouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: form.name, duration: Number(form.duration), calories: Number(form.calories) }),
      });
      if (!res.ok) { setMsg('Failed to add workout.'); return; }
      setForm({ name: '', duration: '', calories: '' });
      setMsg('Workout added! ✅');
      fetchWorkouts();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/api/workouts/${id}`, { method: 'DELETE', headers });
    fetchWorkouts();
  };

  return (
    <div className="workout-root">
      <aside className="dash-sidebar">
        <div className="dash-brand"><span>⚡</span> FitWave</div>
        <nav className="dash-nav">
          <Link to="/dashboard" className="nav-link" id="navDashboard">📊 Dashboard</Link>
          <Link to="/workout"   className="nav-link active" id="navWorkout">💪 Workouts</Link>
        </nav>
        <button className="btn-logout" onClick={() => { localStorage.clear(); navigate('/'); }}>🚪 Logout</button>
      </aside>

      <main className="workout-main">
        <div className="dash-header">
          <h1>💪 Workout Manager</h1>
          <p>Track and manage all your workout sessions</p>
        </div>

        {/* Add Workout Form */}
        <section className="dash-card" id="addWorkoutCard">
          <h2>Add New Workout</h2>
          {msg && <div className="auth-success">{msg}</div>}
          <form onSubmit={handleAdd} id="createWorkoutForm" className="workout-form">
            <div className="form-group">
              <label>Workout Name</label>
              <input
                id="workoutNameInput"
                type="text"
                name="name"
                placeholder="e.g. HIIT Cardio Blast"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="workout-form-row">
              <div className="form-group">
                <label>Duration (mins)</label>
                <input
                  id="workoutDurationInput"
                  type="number"
                  name="duration"
                  placeholder="45"
                  value={form.duration}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Calories Burned</label>
                <input
                  id="workoutCaloriesInput"
                  type="number"
                  name="calories"
                  placeholder="320"
                  value={form.calories}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" id="btnSubmitWorkout" disabled={saving}>
              {saving ? 'Adding…' : '➕ Add Workout'}
            </button>
          </form>
        </section>

        {/* Workout List */}
        <section className="dash-card" id="workoutListCard">
          <div className="dash-card-header">
            <h2>Your Workouts</h2>
            <span className="badge">{workouts.length} sessions</span>
          </div>
          {loading
            ? <div className="dash-loading"><div className="dash-spinner" /></div>
            : workouts.length === 0
              ? <p className="empty-msg" id="noWorkoutsMsg">No workouts yet. Add your first session above!</p>
              : (
                <div className="workout-table" id="workoutTable">
                  <div className="workout-table-header">
                    <span>Workout ID</span>
                    <span>Name</span>
                    <span>Duration</span>
                    <span>Calories</span>
                    <span>Actions</span>
                  </div>
                  {workouts.map((w, i) => (
                    <div className="workout-row" key={w.id} id={`workout-row-${w.id}`}>
                      <span className="workout-id">WK-{String(i+1).padStart(3,'0')}</span>
                      <span className="workout-name-cell">{w.name}</span>
                      <span>{w.duration} min</span>
                      <span>{w.calories} kcal</span>
                      <button
                        className="btn-delete"
                        id={`delete-wk-${w.id}`}
                        onClick={() => handleDelete(w.id)}
                      >🗑️ Delete</button>
                    </div>
                  ))}
                </div>
              )
          }
        </section>
      </main>
    </div>
  );
};

export default Workout;
