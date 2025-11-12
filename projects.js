// projects.js — busca, filtro, modal de detalhe, curtir, arrastar/reorder
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('projectsList');
  const publishBtn = document.getElementById('publishBtn');

  // adiciona barra de busca e filtro dinamicamente (se existir o container)
  const containerCard = listEl?.closest('.card') || listEl?.parentElement;
  if (containerCard) {
    const controls = document.createElement('div');
    controls.className = 'd-flex gap-2 mb-3 align-items-center';
    controls.innerHTML = `
      <input id="projectSearch" class="form-control input-search" placeholder="Buscar projetos por título, área ou colaborador" />
      <select id="projectAreaFilter" class="form-select" style="max-width:180px;">
        <option value="">Filtrar por área</option>
      </select>
    `;
    containerCard.insertBefore(controls, containerCard.firstChild);
  }

  let projects = loadJSON('ss_projects', []);
  // ensure projects have meta fields (likes/bookmarks)
  projects = projects.map(p => Object.assign({ likes: p.likes||0, bookmarked: !!p.bookmarked }, p));

  function buildAreasList() {
    const sel = document.getElementById('projectAreaFilter');
    if (!sel) return;
    const areas = new Set();
    projects.forEach(p => (p.areas||[]).forEach(a => areas.add(a)));
    sel.innerHTML = `<option value="">Filtrar por área</option>`;
    Array.from(areas).sort().forEach(a => {
      const opt = document.createElement('option'); opt.value = a; opt.textContent = a; sel.appendChild(opt);
    });
  }

  function render(filtered = null) {
    if (!listEl) return;
    const arr = filtered || projects;
    listEl.innerHTML = '';
    arr.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = 'col-12';
      row.draggable = true;
      row.dataset.idx = idx;
      row.innerHTML = `
        <div class="card p-3 project-card" data-id="${p.id}">
          <div class="d-flex justify-content-between align-items-start">
            <div style="flex:1">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="badge-area">${(p.areas||[]).slice(0,2).join(', ') || 'Geral'}</div>
                <div class="project-meta small-muted">Publicado: ${p.createdAt?new Date(p.createdAt).toLocaleDateString():'-'}</div>
              </div>
              <h6 class="mb-1">${escapeHtml(p.title)}</h6>
              <p class="text-muted small mb-2">${escapeHtml((p.summary||'').slice(0,160))}${(p.summary||'').length>160?'…':''}</p>
              <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-sm btn-outline-primary" data-action="open" data-idx="${idx}">Abrir</button>
                <button class="btn btn-sm btn-outline-secondary" data-action="invite" data-idx="${idx}">Convidar</button>
                <button class="btn btn-sm btn-outline-success" data-action="share" data-idx="${idx}">Resultados</button>
              </div>
            </div>
            <div class="text-end" style="min-width:110px">
              <div class="small-muted mb-2">Colab: ${(p.collaborators||[]).slice(0,2).join(', ') || '—'}</div>
              <div class="d-flex flex-column align-items-end gap-2 project-actions">
                <button class="btn btn-sm btn-light like-btn" data-idx="${idx}">❤️ <span class="like-count">${p.likes||0}</span></button>
                <button class="btn btn-sm btn-outline-secondary bookmark-btn" data-idx="${idx}">${p.bookmarked? 'Saved' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      `;
      listEl.appendChild(row);
      // small animation reveal
      requestAnimationFrame(()=> {
        const card = row.querySelector('.project-card');
        if (card) { card.style.transition = 'transform .18s, opacity .18s'; card.style.opacity = 0; setTimeout(()=> card.style.opacity = 1, 10); }
      });
    });
  }

  // event delegation for actions
  listEl?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);
    if (btn.classList.contains('like-btn')) {
      projects[idx].likes = (projects[idx].likes||0) + 1;
      saveJSON('ss_projects', projects);
      render();
      showToast('GOSTEI adicionado!');
      return;
    }
    if (btn.classList.contains('bookmark-btn')) {
      projects[idx].bookmarked = !projects[idx].bookmarked;
      saveJSON('ss_projects', projects);
      render();
      showToast(projects[idx].bookmarked ? 'Projeto salvo' : 'Removido dos salvos');
      return;
    }
    if (action === 'open') openProject(idx);
    if (action === 'invite') inviteCollab(idx);
    if (action === 'share') shareResults(idx);
  });

  // drag & drop reorder
  let dragSrc = null;
  listEl?.addEventListener('dragstart', (e) => {
    const row = e.target.closest('[draggable="true"]');
    if (!row) return;
    dragSrc = row;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  listEl?.addEventListener('dragend', (e) => {
    dragSrc?.classList.remove('dragging'); dragSrc = null;
    // persist new order (by reading cards order)
    const newOrder = Array.from(listEl.querySelectorAll('[data-id]')).map(el => {
      const id = el.querySelector('.project-card')?.dataset?.id;
      return projects.find(p => String(p.id) === String(id));
    }).filter(Boolean);
    if (newOrder.length) { projects = newOrder; saveJSON('ss_projects', projects); render(); showToast('Ordem dos projetos atualizada'); }
  });
  listEl?.addEventListener('dragover', (e) => {
    e.preventDefault();
    const row = e.target.closest('[draggable="true"]');
    if (!row || !dragSrc || row === dragSrc) return;
    const rect = row.getBoundingClientRect();
    const after = (e.clientY - rect.top) > (rect.height/2);
    if (after) row.after(dragSrc); else row.before(dragSrc);
  });

  function openProject(idx) {
    const p = projects[idx];
    if (!p) return;
    // build modal if not exist
    let modalEl = document.getElementById('projectDetailModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal fade';
      modalEl.id = 'projectDetailModal';
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered project-detail"><div class="modal-content">
          <div class="modal-header"><h5 id="pdTitle" class="modal-title"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body" id="pdBody"></div>
          <div class="modal-footer"><button id="pdClose" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button></div>
        </div></div>`;
      document.body.appendChild(modalEl);
    }
    modalEl.querySelector('#pdTitle').textContent = p.title;
    modalEl.querySelector('#pdBody').innerHTML = `
      <p class="small-muted">Áreas: ${(p.areas||[]).join(', ') || 'Geral'}</p>
      <p>${escapeHtml(p.summary || '(sem resumo)')}</p>
      <p class="small-muted">Colaboradores: ${(p.collaborators||[]).join(', ') || 'nenhum'}</p>
      ${p.results ? `<hr><h6>Resultados</h6><p>${escapeHtml(p.results)}</p>` : ''}
    `;
    const bs = new bootstrap.Modal(modalEl);
    bs.show();
  }

  function inviteCollab(idx) {
    const em = prompt('E-mails para convidar (vírgula):', (projects[idx].collaborators||[]).join(', '));
    if (em === null) return;
    const arr = em.split(',').map(s=>s.trim()).filter(Boolean);
    projects[idx].collaborators = Array.from(new Set([...(projects[idx].collaborators||[]), ...arr]));
    saveJSON('ss_projects', projects);
    render();
    showToast('Convites adicionados (simulado)');
  }
  function shareResults(idx) {
    const res = prompt('Descreva os resultados (simulado):', projects[idx].results || '');
    if (res === null) return;
    projects[idx].results = res;
    saveJSON('ss_projects', projects);
    render();
    showToast('Resultados salvos (simulado)');
  }

  // publish project
  publishBtn?.addEventListener('click', () => {
    const title = document.getElementById('projTitle')?.value?.trim();
    if (!title) return alert('Título obrigatório');
    const summary = document.getElementById('projSummary')?.value?.trim() || '';
    const areas = (document.getElementById('projAreas')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
    const collabs = (document.getElementById('projCollabs')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
    const project = { id: Date.now(), title, summary, areas, collaborators: collabs, createdAt: new Date().toISOString(), likes:0, bookmarked:false };
    projects.unshift(project);
    saveJSON('ss_projects', projects);
    document.getElementById('projectForm')?.reset();
    render();
    buildAreasList();
    showToast('Projeto publicado');
    try { const m = document.getElementById('publishModal'); const bs = bootstrap.Modal.getInstance(m) || new bootstrap.Modal(m); bs.hide(); } catch(e){}
  });

  // search/filter bindings
  const searchEl = document.getElementById('projectSearch');
  const areaSel = document.getElementById('projectAreaFilter');
  searchEl?.addEventListener('input', () => applyFilters());
  areaSel?.addEventListener('change', () => applyFilters());

  function applyFilters() {
    const q = (searchEl?.value || '').toLowerCase().trim();
    const area = (areaSel?.value || '').trim();
    let filtered = projects.filter(p => {
      if (area && !(p.areas||[]).includes(area)) return false;
      if (!q) return true;
      const txt = (p.title + ' ' + (p.summary||'') + ' ' + (p.collaborators||[]).join(' ')).toLowerCase();
      return txt.includes(q);
    });
    render(filtered);
  }

  // toast helper
  function showToast(text, ms = 2200) {
    let t = document.querySelector('.toast-custom');
    if (!t) {
      t = document.createElement('div'); t.className = 'toast-custom'; document.body.appendChild(t);
    }
    t.textContent = text; t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=> t.classList.remove('show'), ms);
  }

  // setup initial UI
  buildAreasList();
  render();
});
