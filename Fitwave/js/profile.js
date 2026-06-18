import { auth, signOut } from './firebase-config.js';
import './db.js';

// ===== FITWAVE PROFILE JS (Firebase Integrated) =====

function showToast(msg, type='info', duration=3200){
  const icons={success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`};
  const c=document.getElementById('toast-container');if(!c)return;
  const t=document.createElement('div');t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]}<span>${msg}</span>`;c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(8px)';t.style.transition='0.3s';setTimeout(()=>t.remove(),300);},duration);
}

// ── ANIMATE COUNT ──
function animateCount(el, target, duration=1400, suffix=''){
  if(!el) return;
  const start = performance.now();
  const update = (time) => {
    const p = Math.min((time - start)/duration,1);
    const ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(ease*target).toLocaleString() + suffix;
    if(p<1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── LOAD USER & DATA ──
async function loadUserData(){
  const uid = localStorage.getItem('fw_user_id');
  if (!uid) {
    window.location.href = 'index.html';
    return;
  }
  
  if (window.dbService) {
    window.dbService.setUserId(uid);
    const data = await window.dbService.getData();
    // In a real app we would fetch the user profile document too (user_profiles collection)
    // For now we just mock the name if not found in localStorage
    const name = localStorage.getItem('fw_user_name') || 'Fitwave User';
    
    const nameEl = document.getElementById('profile-display-name');
    if(nameEl) nameEl.textContent = name;
    
    const avatarEl = document.getElementById('profile-avatar-initials');
    if(avatarEl) avatarEl.textContent = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    
    const navAvatar = document.querySelector('.nav-icon-btn div');
    if(navAvatar) navAvatar.textContent = name.charAt(0).toUpperCase();

    // Populate actual DB data if available
    if (data) {
      animateCount(document.getElementById('stat-calories'), data.today?.calories || 0);
    }
  }
}

// ── WEIGHT CHART ──
function buildWeightChart(){
  const wrap = document.getElementById('weight-mini-chart');
  if(!wrap) return;
  const data = [76.5, 76.0, 75.5, 75.2, 74.8, 74.2];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const colors = ['rgba(79,110,247,0.4)','rgba(79,110,247,0.5)','rgba(79,110,247,0.6)','rgba(79,110,247,0.7)','rgba(79,110,247,0.85)','var(--accent-blue)'];
  data.forEach((v, i) => {
    const bar = document.createElement('div');
    const pct = ((v - min) / (max - min + 0.1));
    const h = 15 + (1-pct) * 35;
    bar.className = 'mini-bar';
    bar.style.cssText = `background:${colors[i]};height:0px;transition:height 1s ease ${i*0.1}s;`;
    bar.title = `${v}kg`;
    bar.addEventListener('mouseenter', () => showToast(`${['Jan','Feb','Mar','Apr','May','Jun'][i]}: ${v}kg`, 'info', 1500));
    wrap.appendChild(bar);
    setTimeout(() => { bar.style.height = h + 'px'; }, 400);
  });
}

// ── HEATMAP ──
function buildHeatmap(){
  const wrap = document.getElementById('activity-heatmap');
  if(!wrap) return;
  const levels = [0,0,1,2,0,3,4,1,0,2,3,4,0,1,2,3,0,4,1,0,2,3,4,2,0,1,3,4,0,2,1,3,4,0,2,1,3,0,4,2,1,3,0,2,4,1,0,3];
  levels.forEach(l => {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell' + (l>0 ? ` l${l}` : '');
    cell.title = l===0 ? 'Rest day' : `Intensity level ${l}`;
    wrap.appendChild(cell);
  });
}

// ── EDIT PROFILE ──
window.editProfile = function(){
  showToast('Profile editor coming soon!', 'info');
}

// ── LOGOUT ──
window.logout = async function(){
  showToast('Logging out…', 'info');
  try {
    await signOut(auth);
    localStorage.removeItem('fw_user_id');
    localStorage.removeItem('fw_user_name');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  } catch (error) {
    showToast('Error logging out: ' + error.message, 'error');
  }
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', async () => {
  await loadUserData();
  buildWeightChart();
  buildHeatmap();

  // Animate mock stats
  setTimeout(() => {
    animateCount(document.getElementById('stat-workouts'), 147);
    animateCount(document.getElementById('stat-hours'), 312);
    animateCount(document.getElementById('stat-streak'), 23);
  }, 300);

  showToast('Profile loaded. Keep crushing it! 💪', 'success', 3000);
});
