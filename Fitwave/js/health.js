import { db, collection, addDoc } from './firebase-config.js';

// ===== FITWAVE HEALTH JS (Firebase Integrated) =====

function showToast(msg, type='info', duration=3200){
  const icons={success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`};
  const c=document.getElementById('toast-container');if(!c)return;
  const t=document.createElement('div');t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]}<span>${msg}</span>`;c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(8px)';t.style.transition='0.3s';setTimeout(()=>t.remove(),300);},duration);
}

// ── LIVE ECG ANIMATION ──
function initECG() {
  const hrVal = document.getElementById('live-hr-val');
  if(!hrVal) return;
  const bpms = [142, 145, 144, 148, 147, 144, 142, 145];
  let bi = 0;
  setInterval(() => {
    hrVal.textContent = bpms[bi++ % bpms.length];
  }, 1200);
}

// ── SLEEP CHART ──
function initSleepChart() {
  const bars = [
    { day: 'M', val: 6.5, pct: 65 },
    { day: 'T', val: 7.2, pct: 72 },
    { day: 'W', val: 8.0, pct: 80 },
    { day: 'T', val: 5.5, pct: 55 },
    { day: 'F', val: 7.8, pct: 78 },
    { day: 'S', val: 8.5, pct: 85 },
    { day: 'S', val: 8.2, pct: 82 }
  ];
  const wrap = document.getElementById('sleep-chart');
  if(!wrap) return;
  bars.forEach((b, i) => {
    const col = document.createElement('div');
    col.className = 'sleep-bar-wrap';
    col.innerHTML = `
      <div class="sleep-bar" data-val="${b.val}h" style="height:0px; opacity:${0.5 + (i/12)};"></div>
      <div class="sleep-day">${b.day}</div>
    `;
    wrap.appendChild(col);
    setTimeout(() => {
      col.querySelector('.sleep-bar').style.height = b.pct + '%';
    }, 200 + (i * 100));
  });
}

// ── HRV CHART ──
function initHRVChart() {
  const wrap = document.getElementById('hrv-chart');
  if(!wrap) return;
  const data = [55, 58, 62, 59, 65, 72, 70];
  const max = Math.max(...data);
  const min = 40;
  data.forEach((v, i) => {
    const col = document.createElement('div');
    col.className = 'sleep-bar-wrap';
    const pct = ((v - min) / (max - min)) * 100;
    col.innerHTML = `
      <div class="sleep-bar" data-val="${v}ms" style="height:0px; background:linear-gradient(180deg, var(--accent-green), var(--accent-blue));"></div>
      <div class="sleep-day">${['M','T','W','T','F','S','S'][i]}</div>
    `;
    wrap.appendChild(col);
    setTimeout(() => {
      col.querySelector('.sleep-bar').style.height = (20 + pct * 0.8) + '%';
    }, 400 + (i * 100));
  });
}

// ── LOG WEIGHT TO FIREBASE ──
window.logWeight = async function(weight) {
  const uid = localStorage.getItem('fw_user_id');
  if (!uid || !db) {
    showToast('Please log in to save metrics.', 'error');
    return;
  }
  try {
    await addDoc(collection(db, 'users', uid, 'health_metrics'), {
      type: 'weight',
      value: weight,
      unit: 'kg',
      date: new Date().toISOString()
    });
    showToast(`Weight ${weight}kg logged to your health record! 📊`, 'success');
  } catch(e) {
    console.error('Error logging weight:', e);
    showToast('Failed to save. Check your connection.', 'error');
  }
};

// ── LOG SLEEP TO FIREBASE ──
window.logSleep = async function(hours) {
  const uid = localStorage.getItem('fw_user_id');
  if (!uid || !db) {
    showToast('Please log in to save metrics.', 'error');
    return;
  }
  try {
    await addDoc(collection(db, 'users', uid, 'health_metrics'), {
      type: 'sleep',
      value: hours,
      unit: 'hours',
      date: new Date().toISOString()
    });
    showToast(`Sleep of ${hours}h logged! 😴`, 'success');
  } catch(e) {
    console.error('Error logging sleep:', e);
  }
};

// ── LOAD USER ──
function loadUser() {
  const uid = localStorage.getItem('fw_user_id');
  if (!uid) {
    window.location.href = 'index.html';
    return;
  }
  const name = localStorage.getItem('fw_user_name') || 'User';
  const avatar = document.getElementById('nav-avatar');
  if(avatar) avatar.textContent = name.charAt(0).toUpperCase();
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  loadUser();
  initECG();
  initSleepChart();
  initHRVChart();
  setTimeout(() => {
    showToast('Your readiness score is 94%. Prime condition for a heavy lifting session.', 'success', 5000);
  }, 1000);
});
