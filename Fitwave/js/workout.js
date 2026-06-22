import { db, collection, addDoc, auth } from './firebase-config.js';

// ===== FITWAVE WORKOUT JS (Firebase Integrated) =====

function showToast(msg, type='info', duration=3200){
  const icons={success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`};
  const c=document.getElementById('toast-container');if(!c)return;
  const t=document.createElement('div');t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]}<span>${msg}</span>`;c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(8px)';t.style.transition='0.3s';setTimeout(()=>t.remove(),300);},duration);
}

// ── DAYS DATA ──
const days = [
  { dow:'MON', num:24, name:'Push Day: Power',       meta:'Chest, Shoulders, Triceps', done:true,  active:false },
  { dow:'TUE', num:25, name:'Pull Day: Mobility',    meta:'Back, Biceps, Core', done:false, active:false },
  { dow:'WED', num:26, name:'Active Recovery',       meta:'Stretch Flow', done:false, active:true  },
  { dow:'THU', num:27, name:'Legs: Foundation',      meta:'Quads, Hamstrings, Glutes', done:false, active:false },
  { dow:'FRI', num:28, name:'Upper Body Strength',   meta:'Full Upper Body', done:false, active:false },
  { dow:'SAT', num:29, name:'Cardio Blast',          meta:'HIIT & Core',        done:false, active:false },
  { dow:'SUN', num:30, name:'Rest & Recovery',       meta:'Optional stretch',       done:false, active:false },
];

let currentLevel = 'intermediate';
let currentDayIdx = 2;

function buildDayList(activeIdx) {
  const wrap = document.getElementById('day-list');
  if(!wrap) return;
  wrap.innerHTML = '';
  days.forEach((d, i) => {
    const isActive = i === activeIdx;
    const div = document.createElement('div');
    div.className = 'day-item' + (isActive ? ' active' : '');
    div.innerHTML = `
      <div class="day-date">
        <div class="day-dow">${d.dow}</div>
        <div class="day-num">${d.num}</div>
      </div>
      <div class="day-info">
        <div class="day-name">${d.name}</div>
        <div class="day-meta">${d.meta}</div>
      </div>
      <div class="day-check ${d.done ? 'done' : ''}">
        ${d.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </div>
    `;
    div.addEventListener('click', () => {
      buildDayList(i);
      updateRoutine(i);
    });
    wrap.appendChild(div);
  });
}

// ── EXERCISES DATA ──
const plansData = {
  beginner: {
    0: [
      { name:'Machine Chest Press', focus:'Focus on form', sets:'3', reps:'12', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Dumbbell Shoulder Press', focus:'Keep core tight', sets:'3', reps:'10', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Push-ups (Knees)', focus:'Full range of motion', sets:'3', reps:'To failure', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Tricep Pushdowns', focus:'Squeeze at the bottom', sets:'3', reps:'15', rest:'60s', color:'rgba(247,37,133,0.25)' },
    ],
    1: [
      { name:'Lat Pulldown', focus:'Pull with your elbows', sets:'3', reps:'12', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Seated Cable Row', focus:'Squeeze shoulder blades', sets:'3', reps:'12', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Dumbbell Bicep Curls', focus:'Control the descent', sets:'3', reps:'15', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Plank', focus:'Keep back straight', sets:'3', reps:'30s', rest:'45s', color:'rgba(247,37,133,0.25)' },
    ],
    2: [
      { name:'Light Walk', focus:'Keep heart rate low', sets:'1', reps:'15 mins', rest:'-', color:'rgba(79,110,247,0.3)' },
      { name:'Standing Toe Touch', focus:'Feel the hamstring stretch', sets:'2', reps:'30s', rest:'15s', color:'rgba(155,93,229,0.3)' },
      { name:"Child's Pose", focus:'Relax your lower back', sets:'2', reps:'45s', rest:'15s', color:'rgba(198,241,53,0.2)' },
    ],
    3: [
      { name:'Goblet Squat', focus:'Chest up, drop hips down', sets:'3', reps:'12', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Leg Press', focus:"Don't lock knees", sets:'3', reps:'12', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Leg Extensions', focus:'Squeeze at the top', sets:'3', reps:'15', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Seated Calf Raises', focus:'Full stretch', sets:'3', reps:'20', rest:'45s', color:'rgba(247,37,133,0.25)' },
    ],
    4: [
      { name:'Incline DB Press', focus:'Feel the upper chest', sets:'3', reps:'12', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Assisted Pull-ups', focus:'Control the negative', sets:'3', reps:'8', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Lateral Raises', focus:'Slight bend in elbows', sets:'3', reps:'15', rest:'60s', color:'rgba(198,241,53,0.2)' },
    ],
    5: [
      { name:'Cycling', focus:'Moderate pace', sets:'1', reps:'20 mins', rest:'-', color:'rgba(79,110,247,0.3)' },
      { name:'Jumping Jacks', focus:'Keep breathing', sets:'3', reps:'45s', rest:'15s', color:'rgba(155,93,229,0.3)' },
      { name:'Mountain Climbers', focus:'Pace yourself', sets:'3', reps:'30s', rest:'30s', color:'rgba(198,241,53,0.2)' },
    ],
    6: [
      { name:'Full Rest', focus:'Hydrate and recover', sets:'-', reps:'-', rest:'-', color:'rgba(79,110,247,0.3)' },
      { name:'Foam Rolling (Optional)', focus:'Hit tight spots', sets:'1', reps:'10 mins', rest:'-', color:'rgba(155,93,229,0.3)' },
    ]
  },
  intermediate: {
    0: [
      { name:'Barbell Bench Press', focus:'Explosive concentric phase', sets:'4', reps:'8',  rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Dumbbell Shoulder Press', focus:'Keep core tight, neutral grip', sets:'3', reps:'10', rest:'60s', color:'rgba(155,93,229,0.3)' },
      { name:'Incline DB Fly', focus:'Full stretch at bottom', sets:'3', reps:'12', rest:'60s', color:'rgba(247,37,133,0.25)' },
      { name:'Cable Tricep Pushdowns', focus:'Slow eccentric', sets:'3', reps:'15', rest:'45s', color:'rgba(198,241,53,0.2)' },
      { name:'Lateral Raises', focus:'Lead with elbows', sets:'4', reps:'15', rest:'30s', color:'rgba(79,110,247,0.3)' },
    ],
    1: [
      { name:'Barbell Rows', focus:'Keep back straight', sets:'4', reps:'8', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Pull-ups', focus:'Full extension', sets:'3', reps:'To failure', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Face Pulls', focus:'Squeeze rear delts', sets:'3', reps:'15', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Barbell Curls', focus:'No momentum', sets:'3', reps:'12', rest:'60s', color:'rgba(247,37,133,0.25)' },
      { name:'Hanging Leg Raises', focus:'Control the swing', sets:'3', reps:'15', rest:'60s', color:'rgba(79,110,247,0.3)' },
    ],
    2: [
      { name:'Foam Roll Full Body', focus:'Hold each spot 30-60s', sets:'1', reps:'Full', rest:'—', color:'rgba(198,241,53,0.2)' },
      { name:'Cat-Cow Stretch', focus:'Breathe deeply', sets:'3', reps:'10', rest:'30s', color:'rgba(79,110,247,0.3)' },
      { name:'Hip Flexor Stretch', focus:'Pelvis neutral', sets:'2', reps:'30s', rest:'15s', color:'rgba(155,93,229,0.3)' },
      { name:"Child's Pose", focus:'Sink hips back', sets:'3', reps:'45s', rest:'15s', color:'rgba(247,37,133,0.25)' },
    ],
    3: [
      { name:'Barbell Back Squat', focus:'Drive knees out', sets:'4', reps:'8', rest:'120s', color:'rgba(79,110,247,0.3)' },
      { name:'Romanian Deadlift', focus:'Hinge at hips', sets:'4', reps:'10', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Walking Lunges', focus:'90° knee angle', sets:'3', reps:'20', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Leg Curl', focus:'3s eccentric', sets:'3', reps:'12', rest:'60s', color:'rgba(247,37,133,0.25)' },
      { name:'Calf Raises', focus:'Pause at top', sets:'4', reps:'20', rest:'30s', color:'rgba(79,110,247,0.3)' },
    ],
    4: [
      { name:'Overhead Press', focus:'Bar path straight up', sets:'4', reps:'8', rest:'90s', color:'rgba(79,110,247,0.3)' },
      { name:'Weighted Pull-ups', focus:'Chest to bar', sets:'4', reps:'8', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Dips', focus:'Slight forward lean', sets:'3', reps:'12', rest:'60s', color:'rgba(198,241,53,0.2)' },
      { name:'Hammer Curls', focus:'Squeeze brachialis', sets:'3', reps:'12', rest:'60s', color:'rgba(247,37,133,0.25)' },
    ],
    5: [
      { name:'Sprint Intervals', focus:'20s sprint, 40s jog', sets:'10', reps:'1 min', rest:'-', color:'rgba(79,110,247,0.3)' },
      { name:'Burpees', focus:'Explosive jump', sets:'4', reps:'15', rest:'45s', color:'rgba(155,93,229,0.3)' },
      { name:'Russian Twists', focus:'Rotate fully', sets:'4', reps:'20', rest:'30s', color:'rgba(198,241,53,0.2)' },
    ],
    6: [
      { name:'Yoga Flow', focus:'Focus on breathing', sets:'1', reps:'20 mins', rest:'-', color:'rgba(79,110,247,0.3)' },
    ]
  },
  advanced: {
    0: [
      { name:'Heavy Bench Press', focus:'Maximal force', sets:'5', reps:'5', rest:'180s', color:'rgba(79,110,247,0.3)' },
      { name:'Seated DB Press', focus:'Heavy, strict form', sets:'4', reps:'8', rest:'120s', color:'rgba(155,93,229,0.3)' },
      { name:'Weighted Dips', focus:'Full depth', sets:'4', reps:'10', rest:'90s', color:'rgba(247,37,133,0.25)' },
      { name:'Cable Crossovers', focus:'Squeeze the peak', sets:'4', reps:'15', rest:'45s', color:'rgba(198,241,53,0.2)' },
      { name:'Skullcrushers', focus:'Elbows tucked', sets:'4', reps:'12', rest:'60s', color:'rgba(79,110,247,0.3)' },
      { name:'Egyptian Lateral Raises', focus:'Constant tension', sets:'4', reps:'15', rest:'30s', color:'rgba(155,93,229,0.3)' },
    ],
    1: [
      { name:'Deadlift', focus:'Brace core heavily', sets:'5', reps:'5', rest:'180s', color:'rgba(79,110,247,0.3)' },
      { name:'Pendlay Rows', focus:'Explosive pull', sets:'4', reps:'8', rest:'120s', color:'rgba(155,93,229,0.3)' },
      { name:'Weighted Pull-ups', focus:'Strict form', sets:'4', reps:'8', rest:'120s', color:'rgba(198,241,53,0.2)' },
      { name:'Straight Arm Pulldowns', focus:'Isolate the lats', sets:'4', reps:'15', rest:'45s', color:'rgba(247,37,133,0.25)' },
      { name:'Preacher Curls', focus:'Full stretch at bottom', sets:'4', reps:'10', rest:'60s', color:'rgba(79,110,247,0.3)' },
      { name:'Dragon Flags', focus:'Slow eccentric', sets:'4', reps:'8', rest:'90s', color:'rgba(155,93,229,0.3)' },
    ],
    2: [
      { name:'Mobility Flow', focus:'Dynamic stretching', sets:'1', reps:'20 mins', rest:'-', color:'rgba(198,241,53,0.2)' },
      { name:'Sauna / Ice Bath', focus:'Contrast therapy', sets:'3', reps:'10 mins', rest:'-', color:'rgba(79,110,247,0.3)' },
    ],
    3: [
      { name:'Heavy Back Squat', focus:'Drive out the hole', sets:'5', reps:'5', rest:'180s', color:'rgba(79,110,247,0.3)' },
      { name:'Bulgarian Split Squats', focus:'Deep stretch', sets:'4', reps:'10', rest:'120s', color:'rgba(155,93,229,0.3)' },
      { name:'Stiff-Leg Deadlifts', focus:'Hinge strictly', sets:'4', reps:'10', rest:'120s', color:'rgba(198,241,53,0.2)' },
      { name:'Sissy Squats', focus:'Quad isolation', sets:'3', reps:'15', rest:'60s', color:'rgba(247,37,133,0.25)' },
      { name:'Donkey Calf Raises', focus:'Pause and stretch', sets:'5', reps:'20', rest:'30s', color:'rgba(79,110,247,0.3)' },
    ],
    4: [
      { name:'Military Press', focus:'Strict overhead', sets:'5', reps:'5', rest:'120s', color:'rgba(79,110,247,0.3)' },
      { name:'Incline Bench Press', focus:'Upper chest bias', sets:'4', reps:'8', rest:'120s', color:'rgba(155,93,229,0.3)' },
      { name:'T-Bar Row', focus:'Thick back development', sets:'4', reps:'10', rest:'90s', color:'rgba(198,241,53,0.2)' },
      { name:'Spider Curls', focus:'Peak contraction', sets:'4', reps:'12', rest:'60s', color:'rgba(247,37,133,0.25)' },
      { name:'Overhead Tricep Ext', focus:'Long head focus', sets:'4', reps:'12', rest:'60s', color:'rgba(79,110,247,0.3)' },
    ],
    5: [
      { name:'Assault Bike Sprints', focus:'Max wattage', sets:'8', reps:'20s', rest:'40s', color:'rgba(79,110,247,0.3)' },
      { name:'Heavy Sled Pushes', focus:'Drive through toes', sets:'5', reps:'40m', rest:'90s', color:'rgba(155,93,229,0.3)' },
      { name:'Toes to Bar', focus:'Strict core compression', sets:'4', reps:'15', rest:'60s', color:'rgba(198,241,53,0.2)' },
    ],
    6: [
      { name:'Deep Tissue Massage', focus:'Release trigger points', sets:'-', reps:'-', rest:'-', color:'rgba(79,110,247,0.3)' },
    ]
  }
};

function getExercises(dayIdx) {
  const plan = plansData[currentLevel] || plansData['intermediate'];
  return plan[dayIdx] || plan[0];
}

function buildExerciseList(dayIdx) {
  const wrap = document.getElementById('exercise-list');
  if(!wrap) return;
  const exercises = getExercises(dayIdx);
  const badge = wrap.closest('.exercise-card')?.querySelector('.badge');
  if(badge) badge.textContent = exercises.length + ' Exercises';
  wrap.innerHTML = '';
  exercises.forEach((ex, i) => {
    const div = document.createElement('div');
    div.className = 'exercise-item anim-fade-up';
    div.style.animationDelay = (i * 0.06) + 's';
    div.innerHTML = `
      <div style="width:56px;height:56px;border-radius:var(--radius-sm);background:${ex.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--font-display);font-weight:800;font-size:1.1rem;color:rgba(255,255,255,0.6);">${i+1}</div>
      <div class="exercise-info">
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-focus">${ex.focus}</div>
      </div>
      <div class="exercise-stats">
        <div class="exercise-stat">
          <div class="exercise-stat-label">SETS/REPS</div>
          <div class="exercise-stat-val">${ex.sets} ${ex.sets !== '-' ? '×' : ''} ${ex.reps}</div>
        </div>
        <div class="exercise-stat">
          <div class="exercise-stat-label">REST</div>
          <div class="exercise-stat-val exercise-stat-sub">${ex.rest}</div>
        </div>
      </div>
      <div class="exercise-info-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
    `;
    div.addEventListener('click', () => showToast(`${ex.name}: ${ex.focus}`, 'info'));
    wrap.appendChild(div);
  });
}

function updateRoutine(dayIdx) {
  currentDayIdx = dayIdx;
  const titles = {
    0: "Today's Routine: Push Power",
    1: "Today's Routine: Pull Day",
    2: "Active Recovery Flow",
    3: "Today's Routine: Leg Foundation",
    4: "Today's Routine: Upper Body",
    5: "Cardio Blast HIIT",
    6: "Rest & Recovery Day",
  };
  const titleEl = document.getElementById('routine-title');
  if(titleEl) titleEl.textContent = titles[dayIdx] || "Today's Routine";
  buildExerciseList(dayIdx);
}

// ── LEVEL SWITCHER ──
window.setLevel = function(level) {
  currentLevel = level;
  document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('lvl-' + level)?.classList.add('active');
  const msgs = {
    beginner: 'Switched to Beginner mode. Lighter loads, longer rest.',
    intermediate: 'Switched to Intermediate mode.',
    advanced: 'Switched to Advanced mode. Prepare to push your limits! 💪',
  };
  showToast(msgs[level] || '', 'info');
  buildExerciseList(currentDayIdx);
};

// ── START SESSION & SAVE TO FIREBASE ──
let sessionActive = false;
let sessionTimer = null;
let sessionSecs = 0;

window.startSession = async function() {
  const btn = document.getElementById('btn-start-session');
  if(!btn) return;
  if(!sessionActive) {
    sessionActive = true;
    sessionSecs = 0;
    showToast('Session started! Give it your all! 🔥', 'success');
    btn.style.background = '#22c55e';
    sessionTimer = setInterval(() => {
      sessionSecs++;
      const m = String(Math.floor(sessionSecs/60)).padStart(2,'0');
      const s = String(sessionSecs%60).padStart(2,'0');
      btn.innerHTML = `⏱ ${m}:${s} — STOP SESSION`;
    }, 1000);
  } else {
    clearInterval(sessionTimer);
    sessionActive = false;
    btn.style.background = '';
    btn.innerHTML = `START SESSION <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    const mins = Math.floor(sessionSecs / 60);
    const secs = sessionSecs % 60;
    showToast(`Great session! ${mins}m ${secs}s completed. 🏆`, 'success', 5000);

    // ── SAVE WORKOUT SESSION TO FIREBASE ──
    const uid = localStorage.getItem('fw_user_id');
    if (uid && db) {
      try {
        const exercises = getExercises(currentDayIdx);
        await addDoc(collection(db, 'users', uid, 'workouts'), {
          date: new Date().toISOString(),
          day: days[currentDayIdx]?.name || 'Workout',
          level: currentLevel,
          durationSeconds: sessionSecs,
          exercises: exercises.map(e => e.name),
          score: Math.min(100, Math.round(60 + (sessionSecs / 3600) * 40))
        });
        showToast('Workout saved to your database! 💾', 'success', 3000);
      } catch(e) {
        console.error('Error saving workout:', e);
      }
    }
  }
};

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  buildDayList(currentDayIdx);
  buildExerciseList(currentDayIdx);
  showToast("Weekly protocol loaded. Ready to work? 💪", 'info', 3500);
});
