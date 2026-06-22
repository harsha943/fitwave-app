import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const API = '';   // proxied via Vite → http://localhost:5000

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('fw_token', data.token);
      localStorage.setItem('fw_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div className="auth-root">
      <div className="auth-bg-gradient" />
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">⚡</span>
          <span className="auth-logo-text">FitWave</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your premium fitness hub</p>

        {error && <div className="auth-error" id="loginErrorMsg">{error}</div>}

        <form onSubmit={handleSubmit} id="loginForm" autoComplete="on">
          <div className="form-group">
            <label htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              name="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            id="loginSubmitBtn"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-creds">
          <p className="demo-label">Demo credentials:</p>
          <div className="demo-chips">
            <button className="demo-chip" onClick={() => demoLogin('admin@fitwave.com', 'Admin@1234')}>Admin</button>
            <button className="demo-chip" onClick={() => demoLogin('user@fitwave.com', 'User@1234')}>User</button>
            <button className="demo-chip" onClick={() => demoLogin('guest@fitwave.com', 'Guest@1234')}>Guest</button>
          </div>
        </div>

        <p className="auth-footer-link">
          Don't have an account?{' '}
          <Link to="/" id="linkToRegister">Get Started</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
