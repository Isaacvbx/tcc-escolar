// login.js - fluxo de login local (robusto)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const email = document.getElementById('loginEmail');
  const name = document.getElementById('loginName');

  if (!form) return; // se não houver form nesta página, sai

  // se já logado, ir para index
  try {
    if (localStorage.getItem('ss_user')) {
      window.location.href = 'index.html';
      return;
    }
  } catch (e) { console.error(e); }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const eVal = (email?.value || '').trim();
    const nVal = (name?.value || '').trim() || 'Usuário';
    if (!eVal) return alert('Informe um e-mail válido.');
    const user = { email: eVal, name: nVal, loggedAt: new Date().toISOString() };
    try { localStorage.setItem('ss_user', JSON.stringify(user)); } catch (err) { console.error('storage', err); }
    // redireciona para index.html
    window.location.href = 'index.html';
  });
});
