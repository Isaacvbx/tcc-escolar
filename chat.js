// chat.js — reações, typing indicator, unread badge e animações
document.addEventListener('DOMContentLoaded', () => {
  const chatWindow = document.getElementById('chatWindow');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  const emojiBtn = document.getElementById('emojiBtn');
  const navUserName = document.getElementById('navUserName');

  let chat = loadJSON('ss_chat', []);
  let unread = Number(localStorage.getItem('ss_unread') || 0);

  function render() {
    if (!chatWindow) return;
    chatWindow.innerHTML = '';
    chat.forEach(msg => {
      const d = document.createElement('div');
      d.className = 'msg ' + (msg.sender === 'me' ? 'me' : 'other');
      d.dataset.id = msg.id;
      d.innerHTML = `
        <div>${escapeHtml(msg.text)}</div>
        <div class="meta"><small class="time">${new Date(msg.at).toLocaleTimeString()}</small><div class="reactions"></div></div>
      `;
      chatWindow.appendChild(d);
      // reveal animation
      setTimeout(()=> d.classList.add('show'), 10);

      // render reactions
      if (msg.reactions && Object.keys(msg.reactions).length) {
        const rx = d.querySelector('.reactions');
        Object.entries(msg.reactions).forEach(([emoji, count]) => {
          const span = document.createElement('span'); span.textContent = `${emoji} ${count}`; span.style.fontSize='0.9rem'; rx.appendChild(span);
        });
      }

      // reaction popup on click
      d.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        showReactPopup(ev.pageX, ev.pageY, msg.id);
      });
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
    updateUnreadBadge();
  }

  // send
  function send(text) {
    if (!text || !text.trim()) return;
    const m = { id: Date.now(), text: text.trim(), at: new Date().toISOString(), sender: 'me', reactions: {} };
    chat.push(m); saveJSON('ss_chat', chat); render();
    simulateReply();
  }

  sendBtn?.addEventListener('click', () => { send(chatInput?.value||''); if (chatInput) chatInput.value = ''; });
  chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); } });
  emojiBtn?.addEventListener('click', () => { if (!chatInput) return; chatInput.value += '😊'; chatInput.focus(); });

  // simulate typing + reply
  function simulateReply() {
    showTyping(true);
    setTimeout(() => {
      showTyping(false);
      const reply = { id: Date.now()+1, text: 'Obrigado — vou verificar e respondo!', at: new Date().toISOString(), sender: 'other', reactions: {} };
      chat.push(reply); saveJSON('ss_chat', chat);
      // if user is not on chat page, increase unread
      const onChat = location.pathname.includes('chat.html') || location.pathname.endsWith('/chat.html');
      if (!onChat) { unread++; localStorage.setItem('ss_unread', unread); }
      render();
    }, 900 + Math.random()*1600);
  }

  // typing indicator injection
  let typingEl = null;
  function showTyping(show) {
    if (!chatWindow) return;
    if (show) {
      if (!typingEl) {
        typingEl = document.createElement('div'); typingEl.className = 'typing';
        typingEl.innerHTML = `<span></span><span></span><span></span>`;
      }
      chatWindow.appendChild(typingEl);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } else {
      typingEl?.remove();
    }
  }

  // reaction popup
  function showReactPopup(x,y,msgId) {
    const emojis = ['👍','❤️','😆','😮','😢','🎉'];
    // remove previous
    document.querySelectorAll('.react-popup').forEach(n=>n.remove());
    const popup = document.createElement('div'); popup.className = 'react-popup card p-2'; popup.style.position='absolute';
    popup.style.left = (x - 20) + 'px'; popup.style.top = (y - 40) + 'px'; popup.style.zIndex = 9999; popup.style.display='flex'; popup.style.gap='8px';
    emojis.forEach(em => {
      const b = document.createElement('button'); b.className='btn btn-sm'; b.textContent = em; b.style.padding='6px 8px';
      b.addEventListener('click', () => { addReaction(msgId, em); popup.remove(); });
      popup.appendChild(b);
    });
    document.body.appendChild(popup);
    // click outside closes
    setTimeout(()=> {
      const out = (ev) => { if (!popup.contains(ev.target)) { popup.remove(); document.removeEventListener('click', out); } };
      document.addEventListener('click', out);
    }, 50);
  }

  function addReaction(msgId, emoji) {
    const m = chat.find(c => String(c.id) === String(msgId));
    if (!m) return;
    m.reactions = m.reactions || {};
    m.reactions[emoji] = (m.reactions[emoji] || 0) + 1;
    saveJSON('ss_chat', chat); render();
  }

  // unread badge in nav
  function updateUnreadBadge() {
    // show count in navUserName as small badge (non-intrusive)
    if (!navUserName) return;
    if (unread > 0) navUserName.innerHTML = `${navUserName.textContent || ''} <span class="badge bg-danger ms-2">${unread}</span>`;
    else navUserName.innerHTML = (navUserName.textContent || '').replace(/\s*<span.*<\/span>/,'');
  }

  // mark all as read when entering chat page
  if (location.pathname.includes('chat.html')) {
    unread = 0; localStorage.setItem('ss_unread', 0); updateUnreadBadge();
  }

  // initial render
  render();
});
