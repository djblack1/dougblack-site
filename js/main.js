/* =============================================
   DOUG BLACK — main.js
   ============================================= */

const SITE_PASSWORD = 'greatwork';
const SESSION_KEY = 'db_auth';

// ─── PASSWORD GATE ───────────────────────────

function checkAuth() {
  return localStorage.getItem(SESSION_KEY) === 'true';
}

function unlock(animate = true) {
  const gate = document.getElementById('password-gate');
  const site = document.getElementById('site');

  site.classList.remove('hidden');

  if (animate) {
    gate.classList.add('fade-out');
    setTimeout(() => {
      gate.style.display = 'none';
      site.classList.add('visible');
    }, 500);
  } else {
    gate.style.display = 'none';
    site.classList.add('visible');
  }
}

function initGate() {
  if (checkAuth()) {
    unlock(false);
    return;
  }

  const input = document.getElementById('password-input');
  const btn = document.getElementById('password-submit');
  const error = document.getElementById('gate-error');

  function attempt() {
    if (input.value.toLowerCase().trim() === SITE_PASSWORD) {
      localStorage.setItem(SESSION_KEY, 'true');
      unlock(true);
    } else {
      error.classList.add('visible');
      input.value = '';
      input.focus();
      setTimeout(() => error.classList.remove('visible'), 2000);
    }
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attempt();
  });

  // Focus input on load
  setTimeout(() => input.focus(), 100);
}

// ─── NAV SCROLL STATE ───────────────────────

function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ─── INIT ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initGate();
  initNav();
});
