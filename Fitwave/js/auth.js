import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, doc, setDoc } from './firebase-config.js';

// ===== FITWAVE AUTH JS (Firebase Integrated) =====

// ── TOAST ──
function showToast(msg, type = 'info', duration = 3200) {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-2)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type]}<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(8px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── TAB SWITCH ──
window.switchTab = function(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).setAttribute('aria-selected','true');
  document.getElementById('section-' + tab).classList.add('active');
};

// ── PASSWORD TOGGLE ──
window.togglePass = function(id, icon) {
  const input = document.getElementById(id);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  icon.innerHTML = isPass
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
};

// ── PASSWORD STRENGTH ──
function checkStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const regPwd = document.getElementById('reg-password');
if (regPwd) {
  regPwd.addEventListener('input', function() {
    const score = checkStrength(this.value);
    const fill = document.getElementById('pwd-fill');
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
    const widths = ['0%', '25%', '50%', '75%', '100%'];
    if (fill) { fill.style.width = widths[score]; fill.style.background = colors[score] || 'transparent'; }
  });
}

// ── SET LOADING ──
function setLoading(btnId, loading, text = '') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.orig = btn.textContent;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> ${text || 'Please wait…'}`;
  } else {
    btn.disabled = false;
    btn.textContent = text || btn.dataset.orig || 'Submit';
  }
}

// ── LOGIN ──
window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }
  
  setLoading('btn-login', true, 'Logging in…');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showToast('Welcome back! Redirecting…', 'success');
    localStorage.setItem('fw_user_id', userCredential.user.uid);
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  } catch (error) {
    setLoading('btn-login', false, 'Log In');
    showToast(error.message, 'error');
  }
};

// ── REGISTER ──
window.handleRegister = async function(e) {
  e.preventDefault();
  const first = document.getElementById('reg-firstname').value.trim();
  const last  = document.getElementById('reg-lastname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pwd   = document.getElementById('reg-password').value;
  const terms = document.getElementById('terms').checked;
  const goal  = document.getElementById('reg-goal').value;
  
  if (!first || !last || !email || !pwd) { showToast('Please fill in all fields.', 'error'); return; }
  if (pwd.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }
  if (!terms) { showToast('Please accept the Terms of Service.', 'error'); return; }
  
  setLoading('btn-register', true, 'Creating account…');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
    const uid = userCredential.user.uid;
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'user_profiles', uid), {
      firstName: first,
      lastName: last,
      email: email,
      goal: goal || 'general-fitness',
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('fw_user_id', uid);
    showToast(`Welcome to Fitwave, ${first}! 🎉`, 'success');
    setTimeout(() => window.location.href = 'onboarding.html', 1400); // Redirect to onboarding instead of dashboard
  } catch (error) {
    setLoading('btn-register', false, 'Create Account');
    showToast(error.message, 'error');
  }
};

// ── SOCIAL LOGIN (Placeholder) ──
window.socialLogin = function(provider) {
  showToast(`Social login for ${provider} not fully configured yet.`, 'info');
};

// ── FORGOT PASSWORD STEPS (Unchanged logic but attached to window) ──
let otpTimer = null;
let currentStep = 'email';

window.goToStep = function(step) {
  document.querySelectorAll('.forgot-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');
  currentStep = step;
};

window.sendOTP = function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showToast('Please enter a valid email address.', 'error'); return; }
  setLoading('btn-send-otp', true, 'Sending code…');
  setTimeout(() => {
    setLoading('btn-send-otp', false, 'Send Reset Code');
    const sentEl = document.getElementById('otp-sent-to');
    if (sentEl) sentEl.innerHTML = `We sent a 6-digit code to <strong style="color:var(--text-primary);">${email}</strong>`;
    goToStep('otp');
    showToast('Verification code sent!', 'success');
    startOTPTimer();
    setTimeout(() => { ['1','2','3','4','5','6'].forEach((d,i) => { const inp = document.getElementById('otp-'+i); if(inp){inp.value=d;inp.classList.add('filled');} }); }, 800);
  }, 1500);
};

function startOTPTimer() {
  let secs = 60;
  const el = document.getElementById('otp-timer');
  clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    if (!el) return;
    if (secs <= 0) { clearInterval(otpTimer); el.textContent = ''; return; }
    el.textContent = `(${secs}s)`;
    secs--;
  }, 1000);
}

window.resendOTP = function() {
  showToast('Resending verification code…', 'info');
  startOTPTimer();
  document.querySelectorAll('.otp-input').forEach(i => { i.value = ''; i.classList.remove('filled'); });
  document.getElementById('otp-0')?.focus();
};

window.verifyOTP = function() {
  const code = Array.from({length:6}, (_,i) => document.getElementById('otp-'+i)?.value || '').join('');
  if (code.length < 6) { showToast('Please enter the complete 6-digit code.', 'error'); return; }
  setLoading('btn-verify-otp', true, 'Verifying…');
  setTimeout(() => {
    clearInterval(otpTimer);
    setLoading('btn-verify-otp', false, 'Verify Code');
    goToStep('reset');
    showToast('Code verified!', 'success');
  }, 1200);
};

window.resetPassword = function(e) {
  e.preventDefault();
  const newPwd = document.getElementById('new-password').value;
  const conPwd = document.getElementById('confirm-password').value;
  if (newPwd.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }
  if (newPwd !== conPwd) { showToast('Passwords do not match.', 'error'); return; }
  setLoading('btn-reset', true, 'Updating…');
  setTimeout(() => {
    setLoading('btn-reset', false, 'Reset Password');
    goToStep('success');
  }, 1400);
};

// ── OTP keyboard navigation ──
document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 6; i++) {
    const inp = document.getElementById('otp-' + i);
    if (!inp) continue;
    inp.addEventListener('input', function() {
      this.classList.toggle('filled', this.value !== '');
      if (this.value && i < 5) document.getElementById('otp-' + (i+1))?.focus();
    });
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && i > 0) document.getElementById('otp-' + (i-1))?.focus();
    });
    inp.addEventListener('paste', function(e) {
      const data = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
      data.split('').forEach((d,j) => { const el = document.getElementById('otp-'+j); if(el){el.value=d;el.classList.add('filled');} });
      e.preventDefault();
    });
  }
});
