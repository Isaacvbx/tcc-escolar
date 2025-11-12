// common.js - utilitários e init nav/logout robusto

// Utils
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('loadJSON error', e);
    return fallback;
  }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error('saveJSON error', e); }
}
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function getUser() { return loadJSON('ss_user', null); }

// redirect to login if not logged and not on login page
function ensureLoggedIn() {
  try {
    const pathname = window.location.pathname || '';
    const onLogin = pathname.endsWith('login.html') || pathname.endsWith('/login.html') || pathname.indexOf('login.html') !== -1;
    if (onLogin) return; // allow login page
    const user = getUser();
    if (!user) {
      // preserve current location? just redirect to login
      window.location.href = 'login.html';
    }
  } catch (e) {
    console.error('ensureLoggedIn error', e);
  }
}

// init nav (set username + logout handler). Safe to call multiple times.
function initNavLogout() {
  try {
    const user = getUser();
    const navUserName = document.getElementById('navUserName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (navUserName) {
      navUserName.textContent = user && user.name ? `Olá, ${escapeHtml(user.name)}` : '';
    }

    if (logoutBtn) {
      // remove previous handler if any (avoid duplicates)
      logoutBtn.replaceWith(logoutBtn.cloneNode(true));
      const fresh = document.getElementById('logoutBtn');
      fresh.addEventListener('click', () => {
        try {
          // remove only auth key
          localStorage.removeItem('ss_user');
        } catch (err) { console.error('Erro removendo ss_user', err); }
        // small timeout to ensure removal persisted
        setTimeout(() => window.location.href = 'login.html', 40);
      });
    } else {
      // It's fine if nav isn't present on some pages (we warn once)
      // console.warn('initNavLogout: logoutBtn not found in DOM');
    }
  } catch (e) {
    console.error('initNavLogout error', e);
  }
}

// Run ensureLoggedIn + initNavLogout in a timing-safe way:
// If DOM is still loading, wait for DOMContentLoaded; else run now.
(function () {
  try {
    // Always check login first
    ensureLoggedIn();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initNavLogout();
      });
    } else {
      // DOM already ready (script might be loaded at end of body)
      initNavLogout();
    }
  } catch (e) {
    console.error('common bootstrap error', e);
  }
})();
