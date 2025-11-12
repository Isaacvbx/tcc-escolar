// profile.js — avatar upload, sugestões de áreas, salva perfil e atualiza nav
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const nameIn = document.getElementById('profileNameInput');
  const areasIn = document.getElementById('profileAreasInput');
  const bioIn = document.getElementById('profileBioInput');

  // create avatar inputs/UI
  const avatarRow = document.createElement('div');
  avatarRow.className = 'mb-3 d-flex align-items-center gap-3';
  avatarRow.innerHTML = `
    <img id="profileAvatarPreview" class="profile-avatar" src="" alt="avatar" />
    <div>
      <label class="btn btn-outline-secondary btn-sm mb-1" id="avatarChooseBtn">Escolher avatar</label>
      <input type="file" id="profileAvatarInput" accept="image/*" style="display:none" />
      <div class="small text-muted">PNG/JPG (será salvo localmente)</div>
    </div>
  `;
  form?.insertBefore(avatarRow, form.firstChild);

  const avatarInput = document.getElementById('profileAvatarInput');
  const avatarPreview = document.getElementById('profileAvatarPreview');
  const avatarBtn = document.getElementById('avatarChooseBtn');

  const user = getUser();
  let profile = loadJSON('ss_profile', {});
  // load avatar from profile if exist
  if (profile.avatar) avatarPreview.src = profile.avatar;
  else avatarPreview.src = 'https://via.placeholder.com/96x96.png?text=U';

  // update nav avatar
  function updateNavAvatar() {
    const nav = document.querySelector('#navUserName');
    if (!nav) return;
    // create small avatar next to navUserName if not exists
    if (!document.getElementById('navAvatar')) {
      const img = document.createElement('img'); img.id = 'navAvatar'; img.className = 'nav-avatar me-2';
      nav.parentElement.insertBefore(img, nav);
    }
    const navAvatar = document.getElementById('navAvatar');
    navAvatar.src = profile.avatar || 'https://via.placeholder.com/28.png?text=U';
  }
  updateNavAvatar();

  avatarBtn?.addEventListener('click', () => avatarInput?.click());
  avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      profile.avatar = evt.target.result; avatarPreview.src = profile.avatar;
      saveJSON('ss_profile', profile); updateNavAvatar();
      showToast('Avatar atualizado');
    };
    reader.readAsDataURL(file);
  });

  // suggestions for areas (simple)
  const suggestions = ['Epidemiologia','Genômica','Bioinformática','História','Arqueologia','Matemática','Sociologia','Modelagem'];
  areasIn?.addEventListener('focus', () => {
    // add small suggestion dropdown
    let container = document.getElementById('areasSuggest');
    if (container) return;
    container = document.createElement('div'); container.id = 'areasSuggest'; container.className='mt-2';
    suggestions.slice(0,6).forEach(s => {
      const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-sm btn-light me-2 mb-2'; btn.textContent = s;
      btn.addEventListener('click', () => {
        const arr = (areasIn.value||'').split(',').map(t=>t.trim()).filter(Boolean);
        if (!arr.includes(s)) arr.push(s);
        areasIn.value = arr.join(', ');
      });
      container.appendChild(btn);
    });
    areasIn.parentElement.appendChild(container);
  });

  // fill inputs
  if (nameIn) nameIn.value = profile.name || user?.name || '';
  if (areasIn) areasIn.value = (profile.areas || []).join(', ');
  if (bioIn) bioIn.value = profile.bio || '';

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    profile.name = (nameIn?.value || '').trim() || user?.name || '';
    profile.areas = (areasIn?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
    profile.bio = (bioIn?.value || '').trim();
    saveJSON('ss_profile', profile);
    showToast('Perfil salvo');
    // update nav display name
    const nav = document.getElementById('navUserName');
    if (nav) nav.textContent = `Olá, ${profile.name}`;
  });

  // small toast helper (shared)
  function showToast(text, ms = 2000) {
    let t = document.querySelector('.toast-custom');
    if (!t) { t = document.createElement('div'); t.className='toast-custom'; document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show');
    clearTimeout(t._timer); t._timer = setTimeout(()=>t.classList.remove('show'), ms);
  }
});
