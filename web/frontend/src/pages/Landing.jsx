import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Landing = () => {
  return (
    <div className="landing-root">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <span>⚡</span> FitWave
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#plans">Plans</a>
          <Link to="/login" className="btn btn-outline">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">🏆 #1 Fitness Platform</div>
        <h1 className="hero-title">
          Elevate Your <span className="gradient-text">Fitness</span><br />
          Track. Train. Transform.
        </h1>
        <p className="hero-subtitle">
          AI-powered workout planning, real-time nutrition tracking, and expert coaching —
          all in one premium platform designed for serious athletes.
        </p>
        <div className="hero-cta">
          <Link to="/login" className="btn btn-primary btn-xl" id="btnGetStarted">
            🚀 Start Free Trial
          </Link>
          <a href="#features" className="btn btn-outline btn-xl">Explore Features</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>50K+</strong><span>Active Athletes</span></div>
          <div className="hero-stat"><strong>2M+</strong><span>Workouts Logged</span></div>
          <div className="hero-stat"><strong>4.9★</strong><span>App Rating</span></div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <h2 className="section-title">Everything You Need to Excel</h2>
        <div className="features-grid">
          {[
            { icon:'📊', title:'Smart Analytics',  desc:'Real-time insights on your performance, heart rate, sleep quality and more.' },
            { icon:'💪', title:'Workout Builder',  desc:'Create custom routines or pick from 500+ expert-designed programs.' },
            { icon:'🥗', title:'Nutrition Tracker', desc:'Log meals, track macros, and get AI-powered diet recommendations.' },
            { icon:'🔒', title:'Secure & Private',  desc:'Enterprise-grade JWT authentication with RBAC role management.' },
            { icon:'📱', title:'Multi-Platform',    desc:'Access your data from any device — web, iOS, and Android.' },
            { icon:'🤖', title:'AI Coaching',       desc:'Personalised coaching suggestions based on your fitness data.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="landing-plans" id="plans">
        <h2 className="section-title">Choose Your Plan</h2>
        <div className="plans-grid">
          {[
            { name:'Free',  price:'$0',     period:'/month', features:['Basic workout tracking','3 workout templates','Community access'],          cta:'Get Started',  highlight:false },
            { name:'Pro',   price:'$9.99',  period:'/month', features:['Unlimited workouts','AI insights','Advanced analytics','Priority support'], cta:'Go Pro',       highlight:true  },
            { name:'Elite', price:'$19.99', period:'/month', features:['Everything in Pro','1-on-1 coaching','Custom meal plans','API access'],      cta:'Go Elite',     highlight:false },
          ].map(p => (
            <div className={`plan-card ${p.highlight ? 'plan-highlight' : ''}`} key={p.name}>
              {p.highlight && <div className="plan-badge">Most Popular</div>}
              <h3 className="plan-name">{p.name}</h3>
              <div className="plan-price">
                <span className="plan-amount">{p.price}</span>
                <span className="plan-period">{p.period}</span>
              </div>
              <ul className="plan-features">
                {p.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              <Link to="/login" className={`btn ${p.highlight ? 'btn-primary' : 'btn-outline'} btn-full`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand"><span>⚡</span> FitWave</div>
        <p>© {new Date().getFullYear()} FitWave Inc. Built for serious athletes.</p>
      </footer>
    </div>
  );
};

export default Landing;
