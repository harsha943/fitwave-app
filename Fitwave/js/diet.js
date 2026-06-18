import './db.js';

// ===== FITWAVE DIET JS (Firebase Integrated) =====

function showToast(msg, type='info', duration=3200){
  const icons={success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`};
  const c=document.getElementById('toast-container');if(!c)return;
  const t=document.createElement('div');t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]}<span>${msg}</span>`;c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(8px)';t.style.transition='0.3s';setTimeout(()=>t.remove(),300);},duration);
}

// ── DATA STATE ──
let dietData = null;

// ── MACRO ANIMATIONS ──
function updateMacroVisuals() {
  if(!dietData) return;
  const today = dietData.today;
  const goals = dietData.goals;
  
  // Update text values
  document.querySelector('.macro-card:nth-child(1) .macro-val').textContent = today.calories.toLocaleString();
  document.querySelector('.macro-card:nth-child(1) .macro-target span').textContent = goals.calories.toLocaleString();
  
  document.querySelector('.macro-card:nth-child(2) .macro-val').textContent = today.protein + 'g';
  document.querySelector('.macro-card:nth-child(2) .macro-target span').textContent = goals.protein + 'g';
  
  document.querySelector('.macro-card:nth-child(3) .macro-val').textContent = today.carbs + 'g';
  document.querySelector('.macro-card:nth-child(3) .macro-target span').textContent = goals.carbs + 'g';
  
  document.querySelector('.macro-card:nth-child(4) .macro-val').textContent = today.fats + 'g';
  document.querySelector('.macro-card:nth-child(4) .macro-target span').textContent = goals.fats + 'g';

  const rings = [
    { id: 'ring-cal', pct: (today.calories / goals.calories) * 100, offsetBase: 220 },
    { id: 'ring-pro', pct: (today.protein / goals.protein) * 100, offsetBase: 220 },
    { id: 'ring-carb', pct: (today.carbs / goals.carbs) * 100, offsetBase: 220 },
    { id: 'ring-fat', pct: (today.fats / goals.fats) * 100, offsetBase: 220 }
  ];
  
  rings.forEach(r => {
    const el = document.getElementById(r.id);
    if(el) {
      const pct = Math.min(r.pct, 100);
      const offset = r.offsetBase - (pct / 100) * r.offsetBase;
      setTimeout(() => { el.style.strokeDashoffset = offset; }, 300);
    }
  });
}

// ── WATER TRACKER ──
function updateWaterVisual() {
  if(!dietData) return;
  const fill = document.getElementById('water-fill');
  const txt = document.getElementById('water-val');
  if(fill && txt) {
    const pct = Math.min((dietData.today.water / dietData.goals.water) * 100, 100);
    fill.style.height = pct + '%';
    txt.textContent = dietData.today.water.toFixed(1);
    document.querySelector('.water-target').textContent = `/ ${dietData.goals.water.toFixed(1)} L`;
  }
}

window.addWater = async function(amount) {
  if(window.dbService) {
    const newWater = await window.dbService.addWater(amount);
    if(dietData) dietData.today.water = newWater;
    updateWaterVisual();
    showToast(`Added ${amount}L of water. Stay hydrated! 💧`, 'success');
  }
}

// ── DATE NAV ──
function initDate() {
  const el = document.getElementById('diet-date-text');
  if(el) {
    const d = new Date();
    el.textContent = 'Today, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

window.prevDay = function() {
  const el = document.getElementById('diet-date-text');
  if(el) el.textContent = 'Yesterday';
  showToast('Loading past logs...', 'info');
}

window.nextDay = function() {
  const el = document.getElementById('diet-date-text');
  if(el) el.textContent = 'Tomorrow';
  showToast('Planning future meals...', 'info');
}

// ── ADD FOOD ──
window.promptAddFood = function(meal) {
  showToast(`Opening AI Food Scanner for ${meal}...`, 'info');
  // Mock adding food for now
  setTimeout(async () => {
    if(window.dbService) {
      await window.dbService.addFood(meal.toLowerCase(), {
        name: "Mock Scanned Food",
        calories: 250, protein: 15, carbs: 20, fats: 8
      });
      showToast('Food added to database successfully!', 'success');
      loadUserData(); // refresh screen
    }
  }, 1500);
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
    dietData = await window.dbService.getData();
    
    const name = localStorage.getItem('fw_user_name') || 'Fitwave User';
    const avatar = document.getElementById('nav-avatar');
    if(avatar && name) avatar.textContent = name.charAt(0).toUpperCase();

    if(dietData) {
      updateMacroVisuals();
      updateWaterVisual();
    }
  }
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', async () => {
  initDate();
  await loadUserData();
  
  setTimeout(() => {
    showToast('Your AI coach adjusted your carbs up 20g based on today\'s intense workout.', 'info', 5000);
  }, 1000);
});
