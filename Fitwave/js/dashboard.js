// ===== FITWAVE DASHBOARD JS (Firebase Integrated) =====

// ── TOAST ──
function showToast(msg, type = 'info', duration = 3200) {
  const icons = {
    success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const c = document.getElementById('toast-container');
  if(!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${icons[type]}<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(8px)'; t.style.transition='0.3s'; setTimeout(()=>t.remove(),300); }, duration);
}

// ── DATE ──
function setDate() {
  const el = document.getElementById('dash-date');
  if(!el) return;
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  el.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

// ── ANIMATE COUNT ──
function animateCount(el, target, duration=1400, prefix='', suffix='') {
  if(!el) return;
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(ease * target).toLocaleString() + suffix;
    if(progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── RING CHART ──
function animateRing(id, pct, color) {
  const el = document.getElementById(id);
  if(!el) return;
  const circumference = 289;
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => { el.style.strokeDashoffset = offset; }, 200);
}

// ── HEART RATE BARS ──
function buildHRBars() {
  const wrap = document.getElementById('hr-bars');
  if(!wrap) return;
  const heights = [30,45,28,60,38,72,55,40,68,52,35,44,70,48,32];
  heights.forEach((h, i) => {
    const bar = document.createElement('div');
    bar.className = 'hr-bar' + (i === 11 ? ' active' : '');
    bar.style.height = h + '%';
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.querySelectorAll('.hr-bar').forEach(b => b.classList.remove('active'));
      bar.classList.add('active');
    });
    wrap.appendChild(bar);
  });
}

// ── WEIGHT MINI CHART ──
function buildWeightChart() {
  const wrap = document.getElementById('weight-chart');
  if(!wrap) return;
  const data = [78, 77.5, 76.8, 75.9, 75.1, 74.2];
  const max = Math.max(...data);
  const min = Math.min(...data);
  data.forEach((v, i) => {
    const bar = document.createElement('div');
    const pct = ((v - min) / (max - min + 0.01)) * 100;
    bar.style.cssText = `flex:1;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--accent-blue),var(--accent-purple));opacity:${0.4 + i*0.12};transition:height 1.2s ease ${i*0.1}s;`;
    bar.style.height = '0px';
    wrap.appendChild(bar);
    setTimeout(() => { bar.style.height = (8 + pct * 0.28) + 'px'; }, 300);
    bar.title = `${v}kg`;
  });
}

// ── LOAD USER & DATA ──
async function loadUserData() {
  const uid = localStorage.getItem('fw_user_id');
  if (!uid) {
    window.location.href = 'index.html';
    return;
  }
  
  if (window.dbService) {
    window.dbService.setUserId(uid);
    const data = await window.dbService.getData();
    if (data) {
      // Update UI with real database values
      const calories = data.today?.calories || 0;
      const calGoal = data.goals?.calories || 2500;
      const water = data.today?.water || 0;
      const waterGoal = data.goals?.water || 3;
      
      const protein = data.today?.protein || 0;
      const proGoal = data.goals?.protein || 150;
      
      const carbs = data.today?.carbs || 0;
      const carbGoal = data.goals?.carbs || 250;
      
      const fats = data.today?.fats || 0;
      const fatGoal = data.goals?.fats || 70;

      animateCount(document.getElementById('val-cal'), calories);
      animateRing('ring-cal', Math.min((calories / calGoal) * 100, 100), '#c6f135');
      
      // Update Macros
      document.getElementById('prog-protein').style.width = Math.min((protein / proGoal) * 100, 100) + '%';
      document.getElementById('prog-carbs').style.width = Math.min((carbs / carbGoal) * 100, 100) + '%';
      document.getElementById('prog-fats').style.width = Math.min((fats / fatGoal) * 100, 100) + '%';
      
      // Update Water
      document.getElementById('prog-water').style.width = Math.min((water / waterGoal) * 100, 100) + '%';
      const waterEl = document.querySelector('.metric-value[style*="var(--accent-blue)"]');
      if (waterEl) {
        waterEl.innerHTML = `${water.toFixed(1)} <span>/ ${waterGoal}L</span>`;
      }
    }
  }
}

// ── SETUP NAVIGATION (Make Status Cards Clickable) ──
function setupNavigation() {
  // Activity Card -> Workout
  document.querySelector('.activity-card')?.addEventListener('click', () => {
    window.location.href = 'workout.html';
  });
  
  // Nutrition Hub -> Diet
  document.querySelector('.nutrition-card')?.addEventListener('click', () => {
    window.location.href = 'diet.html';
  });

  // Heart Rate Card -> Health
  document.querySelectorAll('.metric-card')[0]?.addEventListener('click', () => {
    window.location.href = 'health.html';
  });

  // Sleep Quality Card -> Health
  document.querySelectorAll('.metric-card')[1]?.addEventListener('click', () => {
    window.location.href = 'health.html';
  });

  // Hydration Card -> Diet / Water
  document.querySelectorAll('.metric-card')[2]?.addEventListener('click', () => {
    window.location.href = 'diet.html';
  });

  // Body Weight Card -> Health
  document.querySelectorAll('.metric-card')[3]?.addEventListener('click', () => {
    window.location.href = 'health.html';
  });
  
  // Make cursor pointer for all clickable cards
  document.querySelectorAll('.activity-card, .nutrition-card, .metric-card').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = "Click to view details";
  });
}

// ── NOTIFICATION BADGE ──
document.getElementById('notif-btn')?.addEventListener('click', () => {
  document.getElementById('notif-dot')?.remove();
  showToast('3 new AI insights available!', 'info');
});

// ── INIT ──
window.addEventListener('DOMContentLoaded', async () => {
  setDate();
  buildHRBars();
  buildWeightChart();
  setupNavigation();

  // Load Data from Firebase
  await loadUserData();

  // Animate mock rings for steps/mins (until connected to a real tracker API)
  setTimeout(() => {
    animateRing('ring-steps', 84.32, '#4f6ef7');  // 8432/10000
    animateRing('ring-min',   86.67, '#9b5de5');  // 52/60
  }, 300);

  animateCount(document.getElementById('val-steps'), 8432);
  animateCount(document.getElementById('val-min'),   52);

  showToast('Good morning! Your AI coach has a new plan ready. 🔥', 'success', 4000);
});
