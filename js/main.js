/* =============================================
   DOUG BLACK — main.js

   One gate system for the whole site. Rules:

   1. A page marked <body data-gate="off"> shows immediately
      and NEVER reads or writes the stored token. Ungated pages
      used to clear the token, which is why visitors kept being
      asked for the password again after touching the homepage.
   2. Everything is stored in localStorage AND a year-long cookie,
      so eviction of one does not lock the visitor back out.
   3. A page can be unlocked by link: ?k=greatwork. The password
      is stripped from the URL immediately afterwards.
   4. If gate markup is missing on a gated page, reveal the site
      rather than throwing. A throw here renders a blank screen.
   ============================================= */

(function () {
  'use strict';

  var SITE_PASSWORD = 'greatwork';
  var AUTH_KEY = 'db_auth';
  var UNLOCK_PARAM = 'k';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  /* ─── STORAGE ─────────────────────────────── */

  function remember() {
    try { localStorage.setItem(AUTH_KEY, 'true'); } catch (e) {}
    try {
      document.cookie = AUTH_KEY + '=true; path=/; max-age=' + COOKIE_MAX_AGE + '; samesite=lax';
    } catch (e) {}
  }

  function isAuthed() {
    try {
      if (localStorage.getItem(AUTH_KEY) === 'true') return true;
    } catch (e) {}
    try {
      if (document.cookie.indexOf(AUTH_KEY + '=true') !== -1) return true;
    } catch (e) {}
    return false;
  }

  /* ─── REVEAL ──────────────────────────────── */

  function reveal(animate) {
    var gate = document.getElementById('password-gate');
    var site = document.getElementById('site');

    if (site) site.classList.remove('hidden');

    if (!gate) {
      if (site) site.classList.add('visible');
      return;
    }

    if (animate) {
      gate.classList.add('fade-out');
      setTimeout(function () {
        gate.style.display = 'none';
        if (site) site.classList.add('visible');
      }, 500);
    } else {
      gate.style.display = 'none';
      if (site) site.classList.add('visible');
    }
  }

  /* ─── UNLOCK BY LINK: ?k=greatwork ────────── */

  function consumeUnlockLink() {
    var match = window.location.search.match(new RegExp('[?&]' + UNLOCK_PARAM + '=([^&]*)'));
    if (!match) return false;

    var supplied = decodeURIComponent(match[1].replace(/\+/g, ' ')).toLowerCase().trim();
    if (supplied !== SITE_PASSWORD) return false;

    remember();

    if (window.history && window.history.replaceState) {
      var search = window.location.search
        .replace(new RegExp('[?&]' + UNLOCK_PARAM + '=[^&]*'), '')
        .replace(/^&/, '?');
      if (search === '?') search = '';
      window.history.replaceState(null, '', window.location.pathname + search + window.location.hash);
    }
    return true;
  }

  /* ─── GATE ────────────────────────────────── */

  function initGate() {
    if (document.body && document.body.getAttribute('data-gate') === 'off') {
      reveal(false);
      return;
    }

    if (consumeUnlockLink() || isAuthed()) {
      reveal(false);
      return;
    }

    var input = document.getElementById('password-input');
    var btn = document.getElementById('password-submit');
    var error = document.getElementById('gate-error');

    if (!input || !btn) {
      reveal(false);
      return;
    }

    function attempt() {
      if (input.value.toLowerCase().trim() === SITE_PASSWORD) {
        remember();
        reveal(true);
      } else {
        if (error) error.classList.add('visible');
        input.value = '';
        input.focus();
        setTimeout(function () { if (error) error.classList.remove('visible'); }, 2000);
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });

    setTimeout(function () { input.focus(); }, 100);
  }

  /* ─── NAV SCROLL STATE ────────────────────── */

  function initNav() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ─── INIT ────────────────────────────────── */

  function start() {
    initGate();
    initNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
