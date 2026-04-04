import { escapeHtml, isLikelyHtml, renderRichContent } from '../shared/markdown.mjs';

const studioState = {
  bootstrap: null,
  section: 'dashboard',
  selectedPostId: null,
  username: null,
};

const STUDIO_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const STUDIO_SESSION_STORAGE_KEY = 'jl_studio_session_active';
const STUDIO_ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

const studioSessionState = {
  idleTimer: null,
  lastActivityAt: 0,
  expiring: false,
};

const studioRefs = {
  loginView: document.getElementById('studioLoginView'),
  appView: document.getElementById('studioAppView'),
  loginForm: document.getElementById('studioLoginForm'),
  loginError: document.getElementById('studioLoginError'),
  username: document.getElementById('studioUsername'),
  password: document.getElementById('studioPassword'),
  nav: document.getElementById('studioNav'),
  title: document.getElementById('studioSectionTitle'),
  status: document.getElementById('studioStatusPill'),
  sessionHint: document.getElementById('studioSessionHint'),
  logoutBtn: document.getElementById('studioLogoutBtn'),
  panels: {
    dashboard: document.getElementById('studioDashboardPanel'),
    translations: document.getElementById('studioTranslationsPanel'),
    updates: document.getElementById('studioUpdatesPanel'),
    posts: document.getElementById('studioPostsPanel'),
    private: document.getElementById('studioPrivatePanel'),
    deploy: document.getElementById('studioDeployPanel'),
  },
};

const STUDIO_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'translations', label: 'Public Copy' },
  { id: 'updates', label: 'Updates' },
  { id: 'posts', label: 'Posts' },
  { id: 'private', label: 'Acquaintance Profile' },
  { id: 'deploy', label: 'Deploy' },
];

function studioFetchJson(url, options = {}){
  return fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  }).then(async response => {
    const payload = await response.json().catch(() => ({}));
    if(!response.ok){
      throw new Error(payload.error || 'Request failed');
    }
    return payload;
  });
}

function setStudioStatus(message, tone = 'neutral'){
  studioRefs.status.textContent = message;
  studioRefs.status.dataset.tone = tone;
}

function showLogin(){
  studioRefs.loginView.hidden = false;
  studioRefs.appView.hidden = true;
  studioRefs.password.value = '';
}

function showApp(){
  studioRefs.loginView.hidden = true;
  studioRefs.appView.hidden = false;
}

const MARKDOWN_TOOLBAR_ACTIONS = [
  { action: 'h2', label: 'H2' },
  { action: 'h3', label: 'H3' },
  { action: 'bold', label: 'Bold' },
  { action: 'italic', label: 'Italic' },
  { action: 'ul', label: '• List' },
  { action: 'ol', label: '1. List' },
  { action: 'quote', label: 'Quote' },
  { action: 'link', label: 'Link' },
  { action: 'code', label: 'Code' },
  { action: 'divider', label: 'Divider' },
];

function getMarkdownPreviewMarkup(value = ''){
  const rendered = renderRichContent(value);
  if(rendered){
    return rendered;
  }
  return '<p class="muted">內容會在這裡即時預覽。You can write in Markdown and see the rendered article here.</p>';
}

function renderMarkdownEditor({ id, label, value, languageLabel }){
  const editorMode = isLikelyHtml(value || '') ? 'Legacy HTML' : 'Markdown';
  return `
    <section class="studio-markdown-editor" data-markdown-editor="${id}">
      <div class="studio-language-pair-header">
        <strong>${label}</strong>
        <div class="studio-row-actions">
          <div class="studio-language-badge">${languageLabel}</div>
          <div class="studio-language-badge" data-markdown-mode="${id}">${editorMode}</div>
        </div>
      </div>
      <div class="studio-markdown-toolbar">
        ${MARKDOWN_TOOLBAR_ACTIONS.map(tool => `
          <button class="btn magnetic" type="button" data-markdown-action="${tool.action}" data-editor-target="${id}">
            ${tool.label}
          </button>
        `).join('')}
      </div>
      <label class="studio-form-field">
        <span>${label}（Markdown）</span>
        <textarea id="${id}" data-markdown-source="${id}" rows="16">${escapeHtml(value || '')}</textarea>
      </label>
      <div class="studio-markdown-preview-shell">
        <div class="studio-mini-label">Live Preview</div>
        <div class="studio-markdown-preview" data-markdown-preview="${id}">
          ${getMarkdownPreviewMarkup(value)}
        </div>
      </div>
      <div class="small muted studio-markdown-note">
        新文章建議直接寫 Markdown；如果是舊文章的 HTML 內容，系統也會繼續相容並正常顯示。
      </div>
    </section>
  `;
}

function focusTextarea(textarea){
  textarea.focus();
  triggerMarkdownInput(textarea);
}

function triggerMarkdownInput(textarea){
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function wrapSelection(textarea, before, after, placeholder){
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const selected = textarea.value.slice(start, end) || placeholder;
  const nextValue = `${before}${selected}${after}`;
  textarea.setRangeText(nextValue, start, end, 'end');
  const selectionStart = start + before.length;
  textarea.setSelectionRange(selectionStart, selectionStart + selected.length);
  focusTextarea(textarea);
}

function replaceSelectedLines(textarea, transform, fallback = ''){
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const selected = textarea.value.slice(start, end);
  const seed = selected || fallback;
  const lines = seed.split('\n');
  const nextValue = lines.map((line, index) => transform(line, index)).join('\n');
  textarea.setRangeText(nextValue, start, end, 'end');
  textarea.setSelectionRange(start, start + nextValue.length);
  focusTextarea(textarea);
}

function insertAtCursor(textarea, value){
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.setRangeText(value, start, end, 'end');
  textarea.setSelectionRange(start + value.length, start + value.length);
  focusTextarea(textarea);
}

function applyMarkdownAction(textarea, action){
  switch(action){
    case 'h2':
      replaceSelectedLines(textarea, line => `## ${(line || 'Section title').replace(/^#+\s*/, '')}`, 'Section title');
      return;
    case 'h3':
      replaceSelectedLines(textarea, line => `### ${(line || 'Subsection').replace(/^#+\s*/, '')}`, 'Subsection');
      return;
    case 'bold':
      wrapSelection(textarea, '**', '**', 'bold text');
      return;
    case 'italic':
      wrapSelection(textarea, '_', '_', 'emphasis');
      return;
    case 'ul':
      replaceSelectedLines(textarea, line => `- ${(line || 'List item').replace(/^[-*]\s+/, '')}`, 'List item');
      return;
    case 'ol':
      replaceSelectedLines(textarea, (line, index) => `${index + 1}. ${(line || 'List item').replace(/^\d+\.\s+/, '')}`, 'List item');
      return;
    case 'quote':
      replaceSelectedLines(textarea, line => `> ${line || 'Quoted line'}`, 'Quoted line');
      return;
    case 'link': {
      const selected = textarea.value.slice(textarea.selectionStart ?? 0, textarea.selectionEnd ?? 0) || 'Link text';
      const url = window.prompt('Link URL', 'https://');
      if(!url){
        return;
      }
      wrapSelection(textarea, '[', `](${url})`, selected);
      return;
    }
    case 'code':
      wrapSelection(textarea, '```\n', '\n```', 'code block');
      return;
    case 'divider':
      insertAtCursor(textarea, '\n---\n');
      return;
    default:
      return;
  }
}

function bindMarkdownEditors(container){
  container.querySelectorAll('[data-markdown-source]').forEach(textarea => {
    const editorId = textarea.dataset.markdownSource;
    const editor = container.querySelector(`[data-markdown-editor="${editorId}"]`);
    const preview = container.querySelector(`[data-markdown-preview="${editorId}"]`);
    const modeBadge = container.querySelector(`[data-markdown-mode="${editorId}"]`);
    if(!editor || !preview || !modeBadge){
      return;
    }

    const refreshPreview = () => {
      const value = textarea.value;
      preview.innerHTML = getMarkdownPreviewMarkup(value);
      preview.classList.toggle('is-empty', !String(value).trim());
      const mode = isLikelyHtml(value) ? 'Legacy HTML' : 'Markdown';
      modeBadge.textContent = mode;
      modeBadge.dataset.mode = mode.toLowerCase().replace(/\s+/g, '-');
    };

    textarea.addEventListener('input', refreshPreview);
    refreshPreview();

    editor.querySelectorAll('[data-markdown-action]').forEach(button => {
      button.addEventListener('click', () => applyMarkdownAction(textarea, button.dataset.markdownAction));
    });
  });
}

function createId(){
  if(window.crypto?.randomUUID){
    return window.crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasStudioSessionMarker(){
  try {
    return sessionStorage.getItem(STUDIO_SESSION_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setStudioSessionMarker(){
  try {
    sessionStorage.setItem(STUDIO_SESSION_STORAGE_KEY, '1');
  } catch {
    // ignore sessionStorage issues and rely on cookie/session timeout
  }
}

function clearStudioSessionMarker(){
  try {
    sessionStorage.removeItem(STUDIO_SESSION_STORAGE_KEY);
  } catch {
    // ignore sessionStorage issues
  }
}

function clearStudioIdleTimer(){
  if(studioSessionState.idleTimer){
    window.clearTimeout(studioSessionState.idleTimer);
    studioSessionState.idleTimer = null;
  }
}

function stopStudioSessionProtection(){
  clearStudioIdleTimer();
  studioSessionState.lastActivityAt = 0;
  studioSessionState.expiring = false;
}

function updateStudioSessionHint(){
  if(!studioState.username){
    studioRefs.sessionHint.textContent = '每次重新打開 Studio 都需要重新登入，閒置 10 分鐘會自動登出。';
    return;
  }
  studioRefs.sessionHint.textContent = `Signed in as ${studioState.username} · Auto logout after 10 minutes idle`;
}

function recordStudioActivity(){
  if(!studioState.username) return;
  studioSessionState.lastActivityAt = Date.now();
  clearStudioIdleTimer();
  studioSessionState.idleTimer = window.setTimeout(() => {
    expireStudioSession('Inactive for 10 minutes. Please sign in again.');
  }, STUDIO_IDLE_TIMEOUT_MS);
}

async function clearStudioSession(reason = 'Signed out', tone = 'neutral', options = {}){
  const { showLoginError = false } = options;
  stopStudioSessionProtection();
  clearStudioSessionMarker();
  studioState.bootstrap = null;
  studioState.username = null;
  studioState.selectedPostId = null;
  showLogin();
  studioRefs.loginError.textContent = showLoginError ? reason : '';
  updateStudioSessionHint();
  setStudioStatus(reason, tone);
  try {
    await studioFetchJson('/api/admin/logout', { method: 'POST' });
  } catch {
    // ignore logout transport issues while clearing local state
  }
}

async function expireStudioSession(reason){
  if(studioSessionState.expiring) return;
  studioSessionState.expiring = true;
  await clearStudioSession(reason, 'neutral', { showLoginError: true });
}

function startStudioSessionProtection(){
  studioSessionState.expiring = false;
  setStudioSessionMarker();
  updateStudioSessionHint();
  recordStudioActivity();
}

function getCurrentPost(){
  if(!studioState.bootstrap?.posts?.length) return null;
  const current = studioState.bootstrap.posts.find(post => post.id === studioState.selectedPostId);
  return current || studioState.bootstrap.posts[0];
}

function ensureSelectedPost(){
  if(!studioState.bootstrap?.posts?.length){
    studioState.selectedPostId = null;
    return;
  }
  const exists = studioState.bootstrap.posts.some(post => post.id === studioState.selectedPostId);
  if(!exists){
    studioState.selectedPostId = studioState.bootstrap.posts[0].id;
  }
}

function renderNav(){
  studioRefs.nav.innerHTML = STUDIO_SECTIONS.map(section => `
    <button type="button" data-section="${section.id}" class="${studioState.section === section.id ? 'active' : ''}">
      ${section.label}
    </button>
  `).join('');

  studioRefs.nav.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      studioState.section = button.dataset.section;
      renderStudio();
    });
  });
}

function renderDashboard(){
  const panel = studioRefs.panels.dashboard;
  const updatesCount = studioState.bootstrap?.updates?.length || 0;
  const postsCount = studioState.bootstrap?.posts?.length || 0;
  const privateReady = studioState.bootstrap?.privateProfile?.fields?.email ? 'Ready' : 'Needs setup';

  panel.innerHTML = `
    <div class="studio-grid">
      <div class="studio-dashboard-stats">
        <div class="studio-stat">
          <div class="small muted">Managed Updates</div>
          <strong>${updatesCount}</strong>
          <div class="muted small">首頁動態與近期更新</div>
        </div>
        <div class="studio-stat">
          <div class="small muted">Managed Posts</div>
          <strong>${postsCount}</strong>
          <div class="muted small">可切換公開 / 熟客權限</div>
        </div>
        <div class="studio-stat">
          <div class="small muted">Acquaintance Profile</div>
          <strong>${privateReady}</strong>
          <div class="muted small">聯絡方式、照片與學經歷</div>
        </div>
      </div>

      <div class="studio-card">
        <div class="eyebrow">What this backend handles</div>
        <h3>你現在可以在線上做什麼</h3>
        <ul class="list">
          <li><span class="muted">更新首頁自介與聯絡文案，不需要再手改 HTML。</span></li>
          <li><span class="muted">新增 updates 與文章，並決定公開或只限熟客可見。</span></li>
          <li><span class="muted">把中文姓名、聯絡資訊、學經歷與照片留在受保護的熟客資料裡，而不是公開原始碼。</span></li>
        </ul>
      </div>

      <div class="studio-callout">
        <strong>目前仍有靜態 fallback。</strong>
        <div class="muted" style="margin-top:6px">也就是說，就算 Cloudflare backend 還沒正式接上，現有 GitHub Pages 版前台仍可以先繼續使用，不會因為這次升級而整站失效。</div>
      </div>
    </div>
  `;
}

function renderTranslations(){
  const panel = studioRefs.panels.translations;
  const groups = studioState.bootstrap.translationFields || [];
  const translations = studioState.bootstrap.translations || { zh: {}, en: {} };

  panel.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <div class="eyebrow">Public Copy</div>
        <h3>前台公開文案</h3>
      </div>
      <div class="studio-row-actions">
        <button class="btn magnetic" type="button" id="resetTranslationsBtn">Reset to Default</button>
        <button class="btn btn-primary magnetic" type="button" id="saveTranslationsBtn">Save Public Copy</button>
      </div>
    </div>
    <div class="studio-grid" style="margin-top:20px">
      ${groups.map(group => `
        <section class="studio-card">
          <h4>${group.title}</h4>
          <div class="studio-form-grid">
            ${group.fields.map(field => `
              <div class="studio-language-pair">
                <div class="studio-language-pair-header">
                  <strong>${field.label}</strong>
                  <div class="studio-language-badge">${field.key}</div>
                </div>
                <label class="studio-form-field">
                  <span>中文 / Mixed</span>
                  ${field.type === 'textarea'
                    ? `<textarea data-translation-key="${field.key}" data-lang="zh" rows="${field.rows || 4}">${escapeHtml(translations.zh?.[field.key] || '')}</textarea>`
                    : `<input data-translation-key="${field.key}" data-lang="zh" type="text" value="${escapeHtml(translations.zh?.[field.key] || '')}">`
                  }
                </label>
                <label class="studio-form-field">
                  <span>English</span>
                  ${field.type === 'textarea'
                    ? `<textarea data-translation-key="${field.key}" data-lang="en" rows="${field.rows || 4}">${escapeHtml(translations.en?.[field.key] || '')}</textarea>`
                    : `<input data-translation-key="${field.key}" data-lang="en" type="text" value="${escapeHtml(translations.en?.[field.key] || '')}">`
                  }
                </label>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  panel.querySelector('#resetTranslationsBtn')?.addEventListener('click', resetTranslationsToDefault);
  panel.querySelector('#saveTranslationsBtn')?.addEventListener('click', saveTranslations);
}

async function saveTranslations(){
  const payload = { zh: {}, en: {} };
  studioRefs.panels.translations.querySelectorAll('[data-translation-key]').forEach(field => {
    payload[field.dataset.lang][field.dataset.translationKey] = field.value;
  });
  setStudioStatus('Saving public copy...', 'pending');
  await studioFetchJson('/api/admin/translations', {
    method: 'PUT',
    body: JSON.stringify({ translations: payload }),
  });
  studioState.bootstrap.translations = payload;
  setStudioStatus('Public copy saved', 'success');
}

async function resetTranslationsToDefault(){
  if(!window.confirm('Reset public copy to the original default text?')){
    return;
  }
  setStudioStatus('Resetting public copy...', 'pending');
  const payload = await studioFetchJson('/api/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ target: 'translations' }),
  });
  studioState.bootstrap.translations = payload.translations;
  renderTranslations();
  setStudioStatus('Public copy restored to default', 'success');
}

function renderUpdateItem(item){
  return `
    <article class="studio-update-item" data-update-id="${item.id}">
      <div class="studio-row-actions">
        <span class="studio-pill ${item.visibility === 'acquaintance' ? 'private' : 'public'}">${item.visibility === 'acquaintance' ? 'Acquaintance' : 'Public'}</span>
        <button class="btn magnetic" type="button" data-action="move-update" data-direction="-1" data-id="${item.id}">↑</button>
        <button class="btn magnetic" type="button" data-action="move-update" data-direction="1" data-id="${item.id}">↓</button>
        <button class="btn magnetic" type="button" data-action="remove-update" data-id="${item.id}">Remove</button>
      </div>
      <div class="studio-form-grid cols-2" style="margin-top:16px">
        <label class="studio-form-field">
          <span>Date Label</span>
          <input data-update-field="dateLabel" value="${escapeHtml(item.dateLabel || '')}">
        </label>
        <label class="studio-form-field">
          <span>Visibility</span>
          <select data-update-field="visibility">
            <option value="public" ${item.visibility === 'public' ? 'selected' : ''}>Public</option>
            <option value="acquaintance" ${item.visibility === 'acquaintance' ? 'selected' : ''}>Acquaintance</option>
          </select>
        </label>
        <label class="studio-form-field">
          <span>中文</span>
          <textarea data-update-field="zh" rows="3">${escapeHtml(item.zh || '')}</textarea>
        </label>
        <label class="studio-form-field">
          <span>English</span>
          <textarea data-update-field="en" rows="3">${escapeHtml(item.en || '')}</textarea>
        </label>
      </div>
    </article>
  `;
}

function renderUpdates(){
  const panel = studioRefs.panels.updates;
  const updates = studioState.bootstrap.updates || [];

  panel.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <div class="eyebrow">Updates</div>
        <h3>首頁最新動態</h3>
      </div>
      <div class="studio-row-actions">
        <button class="btn magnetic" type="button" id="resetUpdatesBtn">Reset Updates</button>
        <button class="btn magnetic" type="button" id="addUpdateBtn">Add Update</button>
        <button class="btn btn-primary magnetic" type="button" id="saveUpdatesBtn">Save Updates</button>
      </div>
    </div>
    <div class="studio-updates-list" id="studioUpdatesList" style="margin-top:20px">
      ${updates.length ? updates.map(renderUpdateItem).join('') : '<div class="studio-empty">目前還沒有 CMS managed updates。你可以新增後，首頁的 Latest Updates 就會改成這裡的內容。</div>'}
    </div>
  `;

  panel.querySelector('#resetUpdatesBtn')?.addEventListener('click', resetUpdatesToDefault);
  panel.querySelector('#addUpdateBtn')?.addEventListener('click', () => {
    studioState.bootstrap.updates.push({
      id: createId(),
      visibility: 'public',
      isPublished: true,
      sortOrder: studioState.bootstrap.updates.length,
      dateLabel: '',
      zh: '',
      en: '',
    });
    renderUpdates();
  });

  panel.querySelector('#saveUpdatesBtn')?.addEventListener('click', saveUpdates);
  panel.querySelectorAll('[data-action="remove-update"]').forEach(button => {
    button.addEventListener('click', () => {
      studioState.bootstrap.updates = studioState.bootstrap.updates.filter(item => item.id !== button.dataset.id);
      renderUpdates();
    });
  });
  panel.querySelectorAll('[data-action="move-update"]').forEach(button => {
    button.addEventListener('click', () => {
      const index = studioState.bootstrap.updates.findIndex(item => item.id === button.dataset.id);
      const direction = Number(button.dataset.direction);
      const nextIndex = index + direction;
      if(index < 0 || nextIndex < 0 || nextIndex >= studioState.bootstrap.updates.length) return;
      const clone = [...studioState.bootstrap.updates];
      const [moved] = clone.splice(index, 1);
      clone.splice(nextIndex, 0, moved);
      studioState.bootstrap.updates = clone.map((item, order) => ({ ...item, sortOrder: order }));
      renderUpdates();
    });
  });
}

async function saveUpdates(){
  const updates = [...studioRefs.panels.updates.querySelectorAll('[data-update-id]')].map((item, index) => ({
    id: item.dataset.updateId,
    sortOrder: index,
    isPublished: true,
    dateLabel: item.querySelector('[data-update-field="dateLabel"]').value,
    visibility: item.querySelector('[data-update-field="visibility"]').value,
    zh: item.querySelector('[data-update-field="zh"]').value,
    en: item.querySelector('[data-update-field="en"]').value,
  }));

  setStudioStatus('Saving updates...', 'pending');
  await studioFetchJson('/api/admin/updates', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  });
  studioState.bootstrap.updates = updates;
  renderUpdates();
  setStudioStatus('Updates saved', 'success');
}

async function resetUpdatesToDefault(){
  if(!window.confirm('Reset all homepage updates to the default empty state?')){
    return;
  }
  setStudioStatus('Resetting updates...', 'pending');
  const payload = await studioFetchJson('/api/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ target: 'updates' }),
  });
  studioState.bootstrap.updates = payload.updates || [];
  renderUpdates();
  setStudioStatus('Updates restored to default', 'success');
}

function renderPostEditor(post){
  return `
    <div class="studio-card">
      <div class="studio-form-grid cols-2">
        <label class="studio-form-field">
          <span>Slug</span>
          <input id="postSlug" type="text" value="${escapeHtml(post.slug || '')}">
        </label>
        <label class="studio-form-field">
          <span>Publish Date</span>
          <input id="postPublishedAt" type="date" value="${escapeHtml((post.publishedAt || '').slice(0, 10))}">
        </label>
        <label class="studio-form-field">
          <span>Visibility</span>
          <select id="postVisibility">
            <option value="public" ${post.visibility === 'public' ? 'selected' : ''}>Public</option>
            <option value="acquaintance" ${post.visibility === 'acquaintance' ? 'selected' : ''}>Acquaintance</option>
          </select>
        </label>
        <label class="studio-form-field">
          <span>Status</span>
          <select id="postStatus">
            <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="published" ${post.status === 'published' ? 'selected' : ''}>Published</option>
          </select>
        </label>
      </div>
      <div class="studio-form-grid cols-2" style="margin-top:18px">
        <label class="studio-form-field">
          <span>中文標題</span>
          <input id="postTitleZh" type="text" value="${escapeHtml(post.title.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Title</span>
          <input id="postTitleEn" type="text" value="${escapeHtml(post.title.en || '')}">
        </label>
        <label class="studio-form-field">
          <span>中文摘要</span>
          <textarea id="postExcerptZh" rows="4">${escapeHtml(post.excerpt.zh || '')}</textarea>
        </label>
        <label class="studio-form-field">
          <span>English Excerpt</span>
          <textarea id="postExcerptEn" rows="4">${escapeHtml(post.excerpt.en || '')}</textarea>
        </label>
      </div>
      <label class="studio-form-field" style="margin-top:18px">
        <span>Tags（用逗號分隔）</span>
        <input id="postTagsInput" type="text" value="${escapeHtml((post.tags || []).join(', '))}">
      </label>
      <div class="studio-post-editor-note" style="margin-top:18px">
        Studio 文章現在支援 Markdown 編輯、常用格式工具列與即時預覽。舊的 HTML 文章也會繼續正常顯示。
      </div>
      <div class="studio-form-grid cols-2 studio-markdown-grid" style="margin-top:18px">
        ${renderMarkdownEditor({
          id: 'postContentZh',
          label: '中文內容',
          value: post.content.zh || '',
          languageLabel: 'ZH',
        })}
        ${renderMarkdownEditor({
          id: 'postContentEn',
          label: 'English Content',
          value: post.content.en || '',
          languageLabel: 'EN',
        })}
      </div>
      <div class="studio-row-actions" style="margin-top:20px">
        ${post.slug ? `<a class="btn magnetic" href="/notes/${escapeHtml(post.slug)}" target="_blank" rel="noopener">Open Current URL</a>` : ''}
        <button class="btn magnetic" id="deletePostBtn" type="button">Delete Post</button>
      </div>
    </div>
  `;
}

function renderPosts(){
  ensureSelectedPost();
  const panel = studioRefs.panels.posts;
  const posts = studioState.bootstrap.posts || [];
  const currentPost = getCurrentPost();

  panel.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <div class="eyebrow">Posts</div>
        <h3>Blog / Notes 發布台</h3>
      </div>
      <div class="studio-row-actions">
        <button class="btn magnetic" type="button" id="createPostBtn">New Post</button>
        <button class="btn btn-primary magnetic" type="button" id="savePostBtn">Save Post</button>
      </div>
    </div>
    <div class="studio-post-layout" style="margin-top:20px">
      <div>
        <div class="studio-posts-list">
          ${posts.length ? posts.map(post => `
            <article class="studio-post-item ${post.id === studioState.selectedPostId ? 'selected' : ''}" data-post-card="${post.id}">
              <div class="studio-row-actions">
                <span class="studio-pill ${post.visibility === 'acquaintance' ? 'private' : 'public'}">${post.visibility === 'acquaintance' ? 'Acquaintance' : 'Public'}</span>
                <span class="studio-pill">${post.status}</span>
              </div>
              <h4 style="margin-top:14px">${escapeHtml(post.title.zh || post.title.en || 'Untitled')}</h4>
              <p class="small muted">${escapeHtml(post.slug)}</p>
            </article>
          `).join('') : '<div class="studio-empty">還沒有 managed posts。新增之後，公開文章會在 /notes/slug 出現。</div>'}
        </div>
      </div>
      <div class="studio-post-editor">
        ${currentPost ? renderPostEditor(currentPost) : '<div class="studio-empty">先新增一篇文章。</div>'}
      </div>
    </div>
  `;

  panel.querySelector('#createPostBtn')?.addEventListener('click', () => {
    const newPost = {
      id: createId(),
      slug: '',
      visibility: 'public',
      status: 'draft',
      publishedAt: new Date().toISOString().slice(0, 10),
      title: { zh: '', en: '' },
      excerpt: { zh: '', en: '' },
      content: { zh: '', en: '' },
      tags: [],
    };
    studioState.bootstrap.posts = [newPost, ...(studioState.bootstrap.posts || [])];
    studioState.selectedPostId = newPost.id;
    renderPosts();
  });

  panel.querySelectorAll('[data-post-card]').forEach(card => {
    card.addEventListener('click', () => {
      studioState.selectedPostId = card.dataset.postCard;
      renderPosts();
    });
  });

  panel.querySelector('#savePostBtn')?.addEventListener('click', saveCurrentPost);
  panel.querySelector('#deletePostBtn')?.addEventListener('click', deleteCurrentPost);
  bindMarkdownEditors(panel);
}

function collectCurrentPostFromForm(){
  const post = getCurrentPost();
  if(!post) return null;
  return {
    ...post,
    slug: document.getElementById('postSlug').value.trim(),
    visibility: document.getElementById('postVisibility').value,
    status: document.getElementById('postStatus').value,
    publishedAt: document.getElementById('postPublishedAt').value || null,
    title: {
      zh: document.getElementById('postTitleZh').value,
      en: document.getElementById('postTitleEn').value,
    },
    excerpt: {
      zh: document.getElementById('postExcerptZh').value,
      en: document.getElementById('postExcerptEn').value,
    },
    content: {
      zh: document.getElementById('postContentZh').value,
      en: document.getElementById('postContentEn').value,
    },
    tags: document.getElementById('postTagsInput').value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean),
  };
}

async function saveCurrentPost(){
  const post = collectCurrentPostFromForm();
  if(!post) return;
  if(!post.slug){
    setStudioStatus('Slug is required', 'error');
    return;
  }
  setStudioStatus('Saving post...', 'pending');
  await studioFetchJson('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify({ post }),
  });
  studioState.bootstrap.posts = studioState.bootstrap.posts.map(item => item.id === post.id ? post : item);
  studioState.selectedPostId = post.id;
  renderPosts();
  setStudioStatus('Post saved', 'success');
}

async function deleteCurrentPost(){
  const post = getCurrentPost();
  if(!post) return;
  if(!window.confirm(`Delete "${post.title.zh || post.title.en || post.slug}"?`)){
    return;
  }
  setStudioStatus('Deleting post...', 'pending');
  await studioFetchJson('/api/admin/posts', {
    method: 'DELETE',
    body: JSON.stringify({ id: post.id }),
  });
  studioState.bootstrap.posts = studioState.bootstrap.posts.filter(item => item.id !== post.id);
  ensureSelectedPost();
  renderPosts();
  setStudioStatus('Post deleted', 'success');
}

function renderPrivateImageEditor(slot, image = {}){
  return `
    <div class="studio-card">
      <div class="studio-mini-label">${slot === 'primary' ? 'Primary Portrait' : 'Secondary Portrait'}</div>
      <img class="studio-image-preview" src="${escapeHtml(image?.dataUrl || '')}" alt="">
      <div class="studio-form-grid" style="margin-top:14px">
        <label class="studio-form-field">
          <span>Upload Image</span>
          <input type="file" accept="image/*" data-private-image-upload="${slot}">
        </label>
        <label class="studio-form-field">
          <span>中文 Caption</span>
          <input type="text" data-private-image-caption="${slot}" data-lang="zh" value="${escapeHtml(image?.caption?.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Caption</span>
          <input type="text" data-private-image-caption="${slot}" data-lang="en" value="${escapeHtml(image?.caption?.en || '')}">
        </label>
        <label class="studio-form-field">
          <span>中文 Alt</span>
          <input type="text" data-private-image-alt="${slot}" data-lang="zh" value="${escapeHtml(image?.alt?.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Alt</span>
          <input type="text" data-private-image-alt="${slot}" data-lang="en" value="${escapeHtml(image?.alt?.en || '')}">
        </label>
      </div>
    </div>
  `;
}

function renderPrivateProfile(){
  const panel = studioRefs.panels.private;
  const profile = studioState.bootstrap.privateProfile || {
    translations: { zh: {}, en: {} },
    fields: {},
    images: { primary: {}, secondary: {} },
  };
  const fieldGroups = studioState.bootstrap.privateTranslationFields || [];

  panel.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <div class="eyebrow">Acquaintance Profile</div>
        <h3>熟客模式內容</h3>
        </div>
        <div class="studio-row-actions">
          <button class="btn magnetic" type="button" id="resetPrivateProfileBtn">Reset to Default</button>
          <button class="btn magnetic" type="button" id="savePrivateProfileAsDefaultBtn">Save as Reset Default</button>
          <button class="btn btn-primary magnetic" type="button" id="savePrivateProfileBtn">Save Acquaintance Profile</button>
        </div>
      </div>
    <div class="studio-grid" style="margin-top:20px">
      <section class="studio-card">
        <h4>直接聯絡資訊</h4>
        <div class="studio-form-grid cols-2">
          <label class="studio-form-field">
            <span>Email</span>
            <input id="privateEmail" type="text" value="${escapeHtml(profile.fields?.email || '')}">
          </label>
          <label class="studio-form-field">
            <span>Email Link</span>
            <input id="privateEmailHref" type="text" value="${escapeHtml(profile.fields?.emailHref || '')}">
          </label>
          <label class="studio-form-field">
            <span>Phone</span>
            <input id="privatePhone" type="text" value="${escapeHtml(profile.fields?.phone || '')}">
          </label>
          <label class="studio-form-field">
            <span>Instagram</span>
            <input id="privateInstagram" type="text" value="${escapeHtml(profile.fields?.instagram || '')}">
          </label>
          <label class="studio-form-field">
            <span>Instagram Link</span>
            <input id="privateInstagramHref" type="text" value="${escapeHtml(profile.fields?.instagramHref || '')}">
          </label>
        </div>
      </section>

      ${fieldGroups.map(group => `
        <section class="studio-card">
          <h4>${group.title}</h4>
          <div class="studio-form-grid">
            ${group.fields.map(field => `
              <div class="studio-language-pair">
                <div class="studio-language-pair-header">
                  <strong>${field.label}</strong>
                  <div class="studio-language-badge">${field.key}</div>
                </div>
                <label class="studio-form-field">
                  <span>中文 / Mixed</span>
                  ${field.type === 'textarea'
                    ? `<textarea data-private-translation-key="${field.key}" data-lang="zh" rows="${field.rows || 3}">${escapeHtml(profile.translations?.zh?.[field.key] || '')}</textarea>`
                    : `<input data-private-translation-key="${field.key}" data-lang="zh" type="text" value="${escapeHtml(profile.translations?.zh?.[field.key] || '')}">`
                  }
                </label>
                <label class="studio-form-field">
                  <span>English</span>
                  ${field.type === 'textarea'
                    ? `<textarea data-private-translation-key="${field.key}" data-lang="en" rows="${field.rows || 3}">${escapeHtml(profile.translations?.en?.[field.key] || '')}</textarea>`
                    : `<input data-private-translation-key="${field.key}" data-lang="en" type="text" value="${escapeHtml(profile.translations?.en?.[field.key] || '')}">`
                  }
                </label>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}

      <section class="studio-card">
        <h4>熟客模式照片</h4>
        <div class="studio-private-media">
          ${renderPrivateImageEditor('primary', profile.images?.primary)}
          ${renderPrivateImageEditor('secondary', profile.images?.secondary)}
        </div>
      </section>
    </div>
  `;

  panel.querySelector('#resetPrivateProfileBtn')?.addEventListener('click', resetPrivateProfileToDefault);
  panel.querySelector('#savePrivateProfileAsDefaultBtn')?.addEventListener('click', savePrivateProfileAsDefault);
  panel.querySelector('#savePrivateProfileBtn')?.addEventListener('click', savePrivateProfile);
  panel.querySelectorAll('[data-private-image-upload]').forEach(input => {
    input.addEventListener('change', async event => {
      const slot = event.target.dataset.privateImageUpload;
      const file = event.target.files?.[0];
      if(!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      studioState.bootstrap.privateProfile.images[slot].dataUrl = dataUrl;
      renderPrivateProfile();
    });
  });
}

async function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function collectPrivateProfileFromForm(){
  const current = structuredClone(studioState.bootstrap.privateProfile);
  current.fields.email = document.getElementById('privateEmail').value;
  current.fields.emailHref = document.getElementById('privateEmailHref').value;
  current.fields.phone = document.getElementById('privatePhone').value;
  current.fields.instagram = document.getElementById('privateInstagram').value;
  current.fields.instagramHref = document.getElementById('privateInstagramHref').value;

  current.translations = { zh: {}, en: {} };
  studioRefs.panels.private.querySelectorAll('[data-private-translation-key]').forEach(field => {
    current.translations[field.dataset.lang][field.dataset.privateTranslationKey] = field.value;
  });

  ['primary', 'secondary'].forEach(slot => {
    current.images[slot].caption = current.images[slot].caption || { zh: '', en: '' };
    current.images[slot].alt = current.images[slot].alt || { zh: '', en: '' };
  });

  studioRefs.panels.private.querySelectorAll('[data-private-image-caption]').forEach(field => {
    const slot = field.dataset.privateImageCaption;
    current.images[slot].caption[field.dataset.lang] = field.value;
  });
  studioRefs.panels.private.querySelectorAll('[data-private-image-alt]').forEach(field => {
    const slot = field.dataset.privateImageAlt;
    current.images[slot].alt[field.dataset.lang] = field.value;
  });

  return current;
}

async function savePrivateProfile(){
  const current = collectPrivateProfileFromForm();
  setStudioStatus('Saving acquaintance profile...', 'pending');
  await studioFetchJson('/api/admin/private-profile', {
    method: 'PUT',
    body: JSON.stringify({ profile: current }),
  });
  studioState.bootstrap.privateProfile = current;
  setStudioStatus('Acquaintance profile saved', 'success');
}

async function savePrivateProfileAsDefault(){
  if(!window.confirm('Save the current acquaintance profile as your future reset default?')){
    return;
  }
  const current = collectPrivateProfileFromForm();
  setStudioStatus('Saving acquaintance reset default...', 'pending');
  await studioFetchJson('/api/admin/private-profile-default', {
    method: 'PUT',
    body: JSON.stringify({ profile: current }),
  });
  setStudioStatus('Acquaintance reset default saved', 'success');
}

async function resetPrivateProfileToDefault(){
  if(!window.confirm('Reset acquaintance profile, private captions, and contact fields to the default values?')){
    return;
  }
  setStudioStatus('Resetting acquaintance profile...', 'pending');
  const payload = await studioFetchJson('/api/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ target: 'private-profile' }),
  });
  studioState.bootstrap.privateProfile = payload.profile;
  renderPrivateProfile();
  setStudioStatus('Acquaintance profile restored to default', 'success');
}

function renderDeployPanel(){
  const panel = studioRefs.panels.deploy;
  panel.innerHTML = `
    <div class="studio-grid">
      <section class="studio-card">
        <div class="eyebrow">Deployment</div>
        <h3>上線前最後幾件事</h3>
        <ol class="list">
          <li><span class="muted">把 repo 接到 Cloudflare Pages，並綁定這個專案根目錄作為 output。</span></li>
          <li><span class="muted">建立 D1 database，名稱可以用 <code>jasonliao-cms</code>。</span></li>
          <li><span class="muted">設定 Secrets：<code>ADMIN_USERNAME</code>、<code>ADMIN_PASSWORD</code>、<code>ADMIN_SESSION_SECRET</code>、<code>ACQUAINTANCE_PASSWORD</code>。</span></li>
          <li><span class="muted">確認首頁公開網址維持不變，這樣 Google 既有索引不需要整個重來。</span></li>
        </ol>
      </section>
        <section class="studio-card">
          <div class="eyebrow">Privacy Boundary</div>
          <h3>這一版已經做的保護</h3>
          <ul class="list">
            <li><span class="muted">後台與 API 預設 noindex，不會自己跑去被 Google 收錄。</span></li>
            <li><span class="muted">熟客資料改成經過安全 session 驗證後才從 server 取回，不需要再把明文個資塞在公開頁面原始碼裡。</span></li>
            <li><span class="muted">公開前台保留靜態 fallback，還沒切部署時現有網站也不會壞。</span></li>
            <li><span class="muted">熟客資料可以另外存成你的私人 reset default，不需要把真實個資寫回公開 repo。</span></li>
          </ul>
        </section>
      <section class="studio-card">
        <div class="eyebrow">Safety Reset</div>
        <h3>回到最初預設</h3>
        <p class="muted">如果你試改了一輪，想把 CMS 管理的內容全部回到初始狀態，可以在這裡一鍵重置。這會清空 CMS managed posts 與 updates，並把公開文案、熟客資料恢復為預設值。</p>
        <div class="studio-row-actions" style="margin-top:18px">
          <button class="btn magnetic" type="button" id="resetAllCmsBtn">Reset Entire CMS</button>
        </div>
      </section>
    </div>
  `;

  panel.querySelector('#resetAllCmsBtn')?.addEventListener('click', resetEntireCms);
}

async function resetEntireCms(){
  if(!window.confirm('Reset the entire CMS to default? This will clear all managed posts and updates.')){
    return;
  }
  setStudioStatus('Resetting entire CMS...', 'pending');
  const payload = await studioFetchJson('/api/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ target: 'all' }),
  });
  studioState.bootstrap.translations = payload.translations;
  studioState.bootstrap.updates = payload.updates || [];
  studioState.bootstrap.privateProfile = payload.profile;
  studioState.bootstrap.posts = payload.posts || [];
  studioState.selectedPostId = null;
  renderStudio();
  setStudioStatus('Entire CMS restored to default', 'success');
}

function renderStudio(){
  renderNav();
  showApp();

  Object.entries(studioRefs.panels).forEach(([id, panel]) => {
    panel.hidden = id !== studioState.section;
  });
  studioRefs.title.textContent = STUDIO_SECTIONS.find(section => section.id === studioState.section)?.label || 'Dashboard';

  renderDashboard();
  renderTranslations();
  renderUpdates();
  renderPosts();
  renderPrivateProfile();
  renderDeployPanel();
}

async function loadBootstrap(){
  setStudioStatus('Loading studio data...', 'pending');
  const payload = await studioFetchJson('/api/admin/bootstrap');
  studioState.bootstrap = payload;
  studioState.username = payload.username;
  ensureSelectedPost();
  renderStudio();
  startStudioSessionProtection();
  setStudioStatus('Studio ready', 'success');
}

async function handleLogin(event){
  event.preventDefault();
  studioRefs.loginError.textContent = '';
  setStudioStatus('Signing in...', 'pending');

  try {
    await studioFetchJson('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: studioRefs.username.value.trim(),
        password: studioRefs.password.value,
      }),
    });
    setStudioSessionMarker();
    await loadBootstrap();
  } catch (error){
    studioRefs.loginError.textContent = error.message;
    setStudioStatus('Sign-in failed', 'error');
  }
}

async function handleLogout(){
  await clearStudioSession('Signed out', 'neutral');
}

async function bootstrapStudio(){
  showLogin();
  updateStudioSessionHint();
  if(!hasStudioSessionMarker()){
    await clearStudioSession('Ready', 'neutral');
    return;
  }

  setStudioStatus('Checking session...', 'pending');
  try {
    const session = await studioFetchJson('/api/admin/session');
    if(session.authenticated){
      await loadBootstrap();
      return;
    }
  } catch {
    // ignore and show login view
  }
  clearStudioSessionMarker();
  setStudioStatus('Ready', 'neutral');
}

studioRefs.loginForm?.addEventListener('submit', handleLogin);
studioRefs.logoutBtn?.addEventListener('click', handleLogout);
document.addEventListener('visibilitychange', () => {
  if(!studioState.username) return;
  if(document.visibilityState === 'hidden'){
    return;
  }
  if(Date.now() - studioSessionState.lastActivityAt >= STUDIO_IDLE_TIMEOUT_MS){
    expireStudioSession('Inactive for 10 minutes. Please sign in again.');
    return;
  }
  recordStudioActivity();
});
STUDIO_ACTIVITY_EVENTS.forEach(eventName => {
  document.addEventListener(eventName, recordStudioActivity, { passive: true });
});

bootstrapStudio();
