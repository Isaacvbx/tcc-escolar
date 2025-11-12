/* script.js - versão corrigida e compatível com common.js
   - Usa loadJSON/saveJSON/escapeHtml/getUser do common.js
   - Protegido contra ausência de elementos (multi-page)
*/

(function () {
  // Provide fallback implementations if common.js wasn't loaded (prevents crashes)
  if (typeof loadJSON !== 'function') {
    window.loadJSON = function (k, f) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } };
  }
  if (typeof saveJSON !== 'function') {
    window.saveJSON = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  }
  if (typeof escapeHtml !== 'function') {
    window.escapeHtml = function (s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); };
  }
  if (typeof getUser !== 'function') {
    window.getUser = function () { try { const r = localStorage.getItem('ss_user'); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  }

  // DOM ready helper
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(() => {
    const $ = s => document.querySelector(s);

    // Elements that may exist on some pages
    const projectsList = $('#projectsList');
    const projectsCount = $('#projectsCount');
    const projectsChartEl = document.getElementById('projectsChart');
    const profileNameEl = $('#profileName');
    const profileAreasEl = $('#profileAreas');
    const navUserName = $('#navUserName');
    const chatWindow = $('#chatWindow');

    // State
    let projects = loadJSON('ss_projects', []);
    let profile = loadJSON('ss_profile', {});
    let chat = loadJSON('ss_chat', []);
    let user = getUser();
    let projectsChart = null;

    // Render functions (safe when element missing)
    function renderProjects() {
      if (!projectsList) return;
      projectsList.innerHTML = '';
      projects.forEach((p, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'col-12';
        const areas = (p.areas || []).slice(0, 2).join(', ') || 'Geral';
        wrapper.innerHTML = `
          <div class="card p-3 project-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="badge badge-area px-2 py-1 mb-2 rounded">${escapeHtml(areas)}</div>
                <h6 class="project-title mb-1">${escapeHtml(p.title || '')}</h6>
                <p class="text-muted small mb-2">${escapeHtml(p.summary || '')}</p>
                <p class="small mb-1"><strong>Colaboradores:</strong> ${(p.collaborators || []).map(escapeHtml).join(', ') || 'nenhum'}</p>
                <div class="d-flex gap-2 mt-2">
                  <button class="btn btn-sm btn-outline-primary" data-action="open" data-idx="${i}">Abrir</button>
                  <button class="btn btn-sm btn-outline-secondary" data-action="invite" data-idx="${i}">Convidar</button>
                  <button class="btn btn-sm btn-outline-success" data-action="share" data-idx="${i}">Compartilhar resultados</button>
                </div>
              </div>
              <div class="text-end">
                <small class="text-muted">Publicado</small>
                <div class="text-muted small">${p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</div>
              </div>
            </div>
          </div>
        `;
        projectsList.appendChild(wrapper);
      });
      if (projectsCount) projectsCount.textContent = `${projects.length} projeto(s)`;
      updateChart();
    }

    function renderProfile() {
      if (profileNameEl) profileNameEl.textContent = profile.name || user?.name || '—';
      if (profileAreasEl) profileAreasEl.textContent = 'Áreas: ' + ((profile.areas && profile.areas.join(', ')) || '—');
      if (navUserName) navUserName.textContent = user?.name ? `Olá, ${user.name}` : '';
    }

    // Chat render
    function renderChat() {
      if (!chatWindow) return;
      chatWindow.innerHTML = '';
      chat.forEach(m => {
        const div = document.createElement('div');
        div.className = 'msg ' + (m.sender === 'me' ? 'me' : 'other');
        div.innerHTML = `<div>${escapeHtml(m.text)}</div><div class="time">${new Date(m.at).toLocaleTimeString()}</div>`;
        chatWindow.appendChild(div);
      });
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Event delegation for project buttons
    if (projectsList) {
      projectsList.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button[data-action]');
        if (!btn) return;
        const idx = Number(btn.dataset.idx);
        const action = btn.dataset.action;
        if (action === 'open') openProject(idx);
        if (action === 'invite') inviteCollab(idx);
        if (action === 'share') shareResults(idx);
      });
    }

    function openProject(idx) {
      const p = projects[idx];
      if (!p) return;
      alert(`Projeto: ${p.title}\n\nResumo:\n${p.summary || '(sem resumo)'}\n\nColaboradores:\n${(p.collaborators || []).join(', ') || 'nenhum'}`);
    }
    function inviteCollab(idx) {
      const list = prompt('E-mails para convidar (vírgula):', (projects[idx].collaborators || []).join(', '));
      if (list === null) return;
      const arr = list.split(',').map(s => s.trim()).filter(Boolean);
      projects[idx].collaborators = Array.from(new Set([...(projects[idx].collaborators || []), ...arr]));
      saveAll(); renderProjects();
      alert('Convites adicionados (simulação).');
    }
    function shareResults(idx) {
      const res = prompt('Descreva os resultados/publicação (simulação):');
      if (!res) return;
      projects[idx].results = res;
      saveAll(); renderProjects();
      alert('Resultados salvos (simulação).');
    }

    // Publish project (if form exists)
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        const title = document.getElementById('projTitle')?.value?.trim();
        if (!title) return alert('Título é obrigatório.');
        const summary = document.getElementById('projSummary')?.value?.trim() || '';
        const areas = (document.getElementById('projAreas')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
        const collabs = (document.getElementById('projCollabs')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
        const project = { id: Date.now(), title, summary, areas, collaborators: collabs, createdAt: new Date().toISOString() };
        projects.unshift(project);
        saveAll();
        renderProjects();
        try { document.getElementById('projectForm')?.reset(); } catch (e) {}
        try { const modalEl = document.getElementById('publishModal'); const bs = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl); bs.hide(); } catch (e) {}
      });
    }

    // Chat send handler
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    const emojiBtn = document.getElementById('emojiBtn');
    if (sendChatBtn && chatInput) {
      sendChatBtn.addEventListener('click', () => {
        const text = chatInput.value || '';
        if (!text.trim()) return;
        const msg = { id: Date.now(), text: text.trim(), at: new Date().toISOString(), sender: 'me' };
        chat.push(msg);
        saveAll(); renderChat();
        chatInput.value = '';
        // simulate reply
        if (Math.random() < 0.25) {
          setTimeout(() => {
            chat.push({ id: Date.now() + 1, text: 'Recebi — vou verificar.', at: new Date().toISOString(), sender: 'other' });
            saveAll(); renderChat();
          }, 800 + Math.random() * 1200);
        }
      });
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatBtn.click(); }
      });
    }
    if (emojiBtn && chatInput) {
      emojiBtn.addEventListener('click', () => { chatInput.value += '😊'; chatInput.focus(); });
    }

    // Chart update
    function updateChart() {
      if (!projectsChartEl || typeof Chart === 'undefined') return;
      const counts = {};
      projects.forEach(p => {
        (p.areas && p.areas.length ? p.areas.slice(0, 3) : ['Geral']).forEach(a => counts[a] = (counts[a] || 0) + 1);
      });
      const labels = Object.keys(counts).slice(0, 6);
      const data = labels.map(l => counts[l]);
      try {
        if (projectsChart) projectsChart.destroy();
        projectsChart = new Chart(projectsChartEl.getContext('2d'), { type: 'bar', data: { labels, datasets: [{ label: 'Projetos por área', data }] }, options: { responsive: true, maintainAspectRatio: false } });
      } catch (e) { console.error('Chart error', e); }
    }

    // Demo / clear buttons
    const fakeDataBtn = document.getElementById('fakeDataBtn');
    if (fakeDataBtn) {
      fakeDataBtn.addEventListener('click', () => {
        projects = [
          { id: Date.now()+1, title: 'Pipeline de detecção viral', summary:'Ferramenta open-source para análise genômica.', areas:['Genômica','Bioinformática'], collaborators:['maria@uni.edu'], createdAt: new Date().toISOString() },
          { id: Date.now()+2, title: 'Estudo sobre impacto social da pandemia', summary:'Análise longitudinal.', areas:['Epidemiologia','Sociologia'], collaborators:[], createdAt: new Date().toISOString() },
          { id: Date.now()+3, title: 'Modelo de predição de surtos', summary:'Modelo SIR melhorado.', areas:['Matemática','Epidemiologia'], collaborators:['joao@lab.org'], createdAt: new Date().toISOString() }
        ];
        chat = [{ id: 1, text: 'Bem-vindos ao chat do grupo!', at: new Date().toISOString(), sender: 'other' }];
        profile = { name: user?.name || 'Usuário', areas: ['Epidemiologia','Bioinformática'], bio: 'Pesquisador interessado em ciência aberta.' };
        saveAll(); renderAll();
      });
    }
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        if (!confirm('Remover todos os dados locais?')) return;
        localStorage.removeItem('ss_projects'); localStorage.removeItem('ss_profile'); localStorage.removeItem('ss_chat');
        projects = []; profile = {}; chat = [];
        saveAll(); renderAll();
      });
    }

    // Recent cases (if element exists)
    const casesEl = document.getElementById('recentCases');
    if (casesEl) {
      const recentCases = [
        { title: 'Reanálise de fotografias de Auschwitz — Tal Bruttmann', desc: 'Micro-história...', src: 'Le Monde' },
        { title: 'Redescoberta da cidade bizantina Tharais', desc: 'Equipe arqueológica...', src: 'Gephyra/Popular Mechanics' },
        { title: 'Domesticação da videira na Itália', desc: 'Estudo PLOS ONE (2025)', src: 'PLOS ONE (DOI: 10.1371/journal.pone.0321653)' }
      ];
      casesEl.innerHTML = '';
      recentCases.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(c.title)}</strong><div>${escapeHtml(c.desc)}</div><div class="text-muted small mt-1">${escapeHtml(c.src)}</div><hr class="my-2">`;
        casesEl.appendChild(li);
      });
    }

    // Save/load utils local to this file (use common.js's functions where appropriate)
    function saveAll() {
      try {
        saveJSON('ss_projects', projects);
        saveJSON('ss_profile', profile);
        saveJSON('ss_chat', chat);
      } catch (e) { console.error('saveAll error', e); }
    }
    // render everything
    function renderAll() { user = getUser(); renderProfile(); renderProjects(); renderChat(); if (navUserName) navUserName.textContent = user?.name ? `Olá, ${user.name}` : ''; }

    // initial render
    renderAll();

    // persist before unload
    window.addEventListener('beforeunload', saveAll);
  }); // end onReady
})(); // end script.js IIFE
