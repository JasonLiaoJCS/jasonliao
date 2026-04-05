import {
  createEmbeddedImageToken,
  escapeHtml,
  extractEmbeddedImageDocument,
  isLikelyHtml,
  renderRichContent,
  serializeEmbeddedImageDocument,
} from '../shared/markdown.mjs';

const studioState = {
  bootstrap: null,
  markdownEditorAssets: {},
  section: 'dashboard',
  selectedPostId: null,
  username: null,
  postEditor: {
    autosaveTimer: null,
    dirty: false,
    currentPostId: null,
    savedSnapshot: '',
    restoredDraftAt: null,
    autosavedAt: null,
    hasLocalDraft: false,
  },
};

const STUDIO_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const STUDIO_SESSION_STORAGE_KEY = 'jl_studio_session_active';
const STUDIO_ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
const MARKDOWN_IMAGE_ACCEPT = 'image/png,image/jpeg,.png,.jpg,.jpeg';
const MARKDOWN_IMAGE_TOKEN_PREFIX = 'jl-img:';
const MARKDOWN_IMAGE_MAX_FILES = 6;
const MARKDOWN_IMAGE_MAX_FILE_SIZE = 12 * 1024 * 1024;
const MARKDOWN_IMAGE_MAX_DIMENSION = 1800;
const MARKDOWN_IMAGE_JPEG_QUALITY = 0.86;
const MARKDOWN_IMAGE_PNG_KEEP_THRESHOLD = 1.2 * 1024 * 1024;
const STUDIO_POST_DRAFT_KEY_PREFIX = 'jl-studio-post-draft:';
const STUDIO_POST_AUTOSAVE_DELAY_MS = 1200;
const STUDIO_POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STUDIO_POST_DRAFT_RETENTION_MS = 45 * 24 * 60 * 60 * 1000;
const STUDIO_POST_ORPHAN_DRAFT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const STUDIO_POST_DRAFT_MAX_COUNT = 12;
const STUDIO_POST_DRAFT_MAX_TOTAL_CHARS = 2_500_000;

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
  subtitle: document.getElementById('studioSectionSubtitle'),
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
  {
    id: 'dashboard',
    label: 'Dashboard',
    subtitle: 'Overview, publishing state, and your current content workflow.',
    description: 'Overview & status',
    icon: '◉',
  },
  {
    id: 'translations',
    label: 'Public Copy',
    subtitle: 'Bilingual homepage copy, section text, and public-facing messaging.',
    description: 'Homepage bilingual copy',
    icon: '文',
  },
  {
    id: 'updates',
    label: 'Updates',
    subtitle: 'Homepage news items, visibility, order, and short bilingual announcements.',
    description: 'Latest news & ordering',
    icon: '↗',
  },
  {
    id: 'posts',
    label: 'Posts',
    subtitle: 'Article drafting, markdown editing, visibility, slugs, and publishing.',
    description: 'Writing & publishing',
    icon: '✦',
  },
  {
    id: 'private',
    label: 'Acquaintance Profile',
    subtitle: 'Protected identity details, portraits, private captions, and contact fields.',
    description: 'Protected profile data',
    icon: '◌',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    subtitle: 'Deployment notes, backend setup reminders, and safety resets.',
    description: 'Release & reset tools',
    icon: '△',
  },
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

function getMarkdownPreviewMarkup(value = '', manifest = null){
  const serialized = manifest ? serializeEmbeddedImageDocument(value, manifest) : value;
  const rendered = renderRichContent(serialized);
  if(rendered){
    return rendered;
  }
  return '<p class="muted">內容會在這裡即時預覽。You can write in Markdown and see the rendered article here.</p>';
}

function renderMarkdownEditor({ id, label, value, languageLabel, manifest = null }){
  const editorDocument = manifest
    ? {
      content: String(value || ''),
      manifest: normalizePostDraftAssets({ [id]: manifest })[id] || deepClone(manifest),
    }
    : extractEmbeddedImageDocument(value || '');
  studioState.markdownEditorAssets[id] = editorDocument.manifest;
  const editorMode = isLikelyHtml(editorDocument.content || '') ? 'Legacy HTML' : 'Markdown';
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
      <div class="studio-markdown-utility-row">
        <button
          class="btn magnetic studio-markdown-upload-trigger"
          type="button"
          data-markdown-image-trigger="${id}"
          data-default-label="Add Photos"
        >
          Add Photos
        </button>
        <input
          class="studio-hidden-file-input"
          type="file"
          accept="${MARKDOWN_IMAGE_ACCEPT}"
          multiple
          data-markdown-image-input="${id}"
        >
        <div class="small muted studio-markdown-upload-note">
          支援 PNG / JPG，多張一次插入。系統會先縮圖後再嵌進文章，適合放幾張 blog 照片。
        </div>
      </div>
      <label class="studio-form-field">
        <span>${label}（Markdown）</span>
        <textarea id="${id}" data-markdown-source="${id}" rows="16">${escapeHtml(editorDocument.content || '')}</textarea>
      </label>
      <div class="studio-markdown-preview-shell">
        <div class="studio-mini-label">Live Preview</div>
        <div class="studio-markdown-preview" data-markdown-preview="${id}">
          ${getMarkdownPreviewMarkup(editorDocument.content, editorDocument.manifest)}
        </div>
      </div>
      <div class="small muted studio-markdown-note">
        新文章建議直接寫 Markdown；圖片會以短代碼顯示在編輯器中，預覽與正式文章仍會正常顯示。
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

function insertBlockAtCursor(textarea, value){
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const needsLeadingGap = before.trim() && !before.endsWith('\n\n');
  const needsTrailingGap = after.trim() && !after.startsWith('\n\n');
  const nextValue = `${needsLeadingGap ? '\n\n' : ''}${value}${needsTrailingGap ? '\n\n' : ''}`;
  textarea.setRangeText(nextValue, start, end, 'end');
  const caret = start + nextValue.length;
  textarea.setSelectionRange(caret, caret);
  focusTextarea(textarea);
}

function normalizeMarkdownImageAlt(fileName = ''){
  return String(fileName)
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Blog photo';
}

function escapeMarkdownImageAlt(value = ''){
  return String(value).replace(/[\[\]]/g, '').trim();
}

function getMarkdownImageManifest(editorId){
  if(!studioState.markdownEditorAssets[editorId]){
    studioState.markdownEditorAssets[editorId] = {};
  }
  return studioState.markdownEditorAssets[editorId];
}

function getUsedMarkdownImageIds(markdown = ''){
  const ids = new Set();
  String(markdown || '').replace(/!\[[^\]]*\]\((jl-img:[^)]+)\)/gi, (match, token) => {
    const id = String(token || '').trim().slice(MARKDOWN_IMAGE_TOKEN_PREFIX.length);
    if(id){
      ids.add(id);
    }
    return match;
  });
  return ids;
}

function pruneMarkdownImageManifest(editorId, markdown = ''){
  const manifest = getMarkdownImageManifest(editorId);
  const usedIds = getUsedMarkdownImageIds(markdown);
  Object.keys(manifest).forEach(id => {
    if(!usedIds.has(id)){
      delete manifest[id];
    }
  });
  return manifest;
}

function createUniqueMarkdownImageId(editorId){
  const manifest = getMarkdownImageManifest(editorId);
  let candidate = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  while(manifest[candidate]){
    candidate = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
  return candidate;
}

function isSupportedMarkdownImageFile(file){
  if(!file){
    return false;
  }
  const fileName = String(file.name || '');
  const fileType = String(file.type || '');
  return /^image\/(?:png|jpe?g)$/i.test(fileType) || /\.(?:png|jpe?g)$/i.test(fileName);
}

async function loadImageElement(file){
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`無法讀取圖片：${file.name || 'unknown file'}`));
    };
    image.src = objectUrl;
  });
}

async function createEmbeddedMarkdownImage(file){
  if(!isSupportedMarkdownImageFile(file)){
    throw new Error(`${file?.name || '檔案'} 不是支援的 PNG/JPG`);
  }
  if(file.size > MARKDOWN_IMAGE_MAX_FILE_SIZE){
    throw new Error(`${file.name} 超過 12MB，請先縮小再上傳`);
  }

  const image = await loadImageElement(file);
  const sourceWidth = image.naturalWidth || image.width || 1;
  const sourceHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, MARKDOWN_IMAGE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const keepPng = /^image\/png$/i.test(file.type || '') && file.size <= MARKDOWN_IMAGE_PNG_KEEP_THRESHOLD;
  const outputType = keepPng ? 'image/png' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: true });
  if(!context){
    throw new Error('目前瀏覽器無法處理圖片縮圖');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  if(outputType === 'image/jpeg'){
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);
  const dataUrl = outputType === 'image/png'
    ? canvas.toDataURL(outputType)
    : canvas.toDataURL(outputType, MARKDOWN_IMAGE_JPEG_QUALITY);

  return {
    alt: escapeMarkdownImageAlt(normalizeMarkdownImageAlt(file.name)),
    dataUrl,
  };
}

function buildEmbeddedMarkdownImages(editorId, images){
  const manifest = getMarkdownImageManifest(editorId);
  return images
    .map(image => {
      const imageId = createUniqueMarkdownImageId(editorId);
      manifest[imageId] = { src: image.dataUrl };
      return `![${image.alt}](${createEmbeddedImageToken(imageId)})`;
    })
    .join('\n\n');
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
    const imageTrigger = container.querySelector(`[data-markdown-image-trigger="${editorId}"]`);
    const imageInput = container.querySelector(`[data-markdown-image-input="${editorId}"]`);
    if(!editor || !preview || !modeBadge){
      return;
    }

    const refreshPreview = () => {
      const value = textarea.value;
      const manifest = pruneMarkdownImageManifest(editorId, value);
      preview.innerHTML = getMarkdownPreviewMarkup(value, manifest);
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

    if(imageTrigger && imageInput){
      imageTrigger.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', async event => {
        const files = Array.from(event.target.files || []);
        imageInput.value = '';
        if(!files.length){
          return;
        }

        const limitedFiles = files.slice(0, MARKDOWN_IMAGE_MAX_FILES);
        const skippedFiles = Math.max(0, files.length - limitedFiles.length);
        const defaultLabel = imageTrigger.dataset.defaultLabel || imageTrigger.textContent || 'Add Photos';
        imageTrigger.disabled = true;
        imageTrigger.textContent = 'Processing...';
        setStudioStatus(`Processing ${limitedFiles.length} image${limitedFiles.length > 1 ? 's' : ''}...`, 'pending');

        const embeddedImages = [];
        const errors = [];

        for(const file of limitedFiles){
          try {
            embeddedImages.push(await createEmbeddedMarkdownImage(file));
          } catch (error){
            errors.push(error.message || `無法處理 ${file.name}`);
          }
        }

        if(embeddedImages.length){
          insertBlockAtCursor(textarea, buildEmbeddedMarkdownImages(editorId, embeddedImages));
        }

        imageTrigger.disabled = false;
        imageTrigger.textContent = defaultLabel;

        if(embeddedImages.length && !errors.length && !skippedFiles){
          setStudioStatus(`Inserted ${embeddedImages.length} photo${embeddedImages.length > 1 ? 's' : ''} into the editor`, 'success');
          return;
        }

        const warnings = [];
        if(skippedFiles){
          warnings.push(`一次最多插入 ${MARKDOWN_IMAGE_MAX_FILES} 張，已略過 ${skippedFiles} 張`);
        }
        if(errors.length){
          warnings.push(errors[0]);
        }

        if(embeddedImages.length){
          setStudioStatus(`已插入 ${embeddedImages.length} 張圖片。${warnings.join('；')}`, warnings.length ? 'neutral' : 'success');
          return;
        }

        setStudioStatus(warnings[0] || '目前沒有成功插入任何圖片', 'error');
      });
    }
  });
}

function createId(){
  if(window.crypto?.randomUUID){
    return window.crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone(value){
  if(typeof structuredClone === 'function'){
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function safeLocalStorageGetItem(key){
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSetItem(key, value){
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeLocalStorageRemoveItem(key){
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage issues
  }
}

function listLocalStorageKeys(){
  try {
    return Object.keys(window.localStorage);
  } catch {
    return [];
  }
}

function createEmptyCoverImage(){
  return {
    src: '',
    alt: {
      zh: '',
      en: '',
    },
  };
}

function normalizePostCoverImage(coverImage = {}){
  const src = String(coverImage?.src || '').trim();
  return {
    src,
    alt: {
      zh: src ? String(coverImage?.alt?.zh || '').trim() : '',
      en: src ? String(coverImage?.alt?.en || '').trim() : '',
    },
  };
}

function normalizePrivateProfileImageEntry(image = {}){
  const dataUrl = String(image?.dataUrl || '').trim();
  return {
    dataUrl,
    alt: {
      zh: dataUrl ? String(image?.alt?.zh || 'Portrait').trim() : 'Portrait',
      en: dataUrl ? String(image?.alt?.en || 'Portrait').trim() : 'Portrait',
    },
    caption: {
      zh: dataUrl ? String(image?.caption?.zh || '').trim() : '',
      en: dataUrl ? String(image?.caption?.en || '').trim() : '',
    },
  };
}

function normalizePostDraftAssets(assets = {}){
  return {
    postContentZh: deepClone(assets?.postContentZh || {}),
    postContentEn: deepClone(assets?.postContentEn || {}),
  };
}

function normalizePostDraftShape(post = {}){
  return {
    id: String(post.id || '').trim(),
    slug: String(post.slug || '').trim(),
    visibility: post.visibility === 'acquaintance' ? 'acquaintance' : 'public',
    status: post.status === 'published' ? 'published' : 'draft',
    publishedAt: String(post.publishedAt || '').trim(),
    title: {
      zh: String(post.title?.zh || ''),
      en: String(post.title?.en || ''),
    },
    excerpt: {
      zh: String(post.excerpt?.zh || ''),
      en: String(post.excerpt?.en || ''),
    },
    content: {
      zh: String(post.content?.zh || ''),
      en: String(post.content?.en || ''),
    },
    tags: Array.isArray(post.tags)
      ? post.tags.map(tag => String(tag || '').trim()).filter(Boolean)
      : [],
    coverImage: normalizePostCoverImage(post.coverImage),
    localDraftOnly: Boolean(post.localDraftOnly),
  };
}

function getPostDraftStorageKey(postId){
  return `${STUDIO_POST_DRAFT_KEY_PREFIX}${postId}`;
}

function normalizeStoredPostDraft(payload){
  if(!payload || typeof payload !== 'object'){
    return null;
  }
  const post = normalizePostDraftShape(payload.post || {});
  if(!post.id){
    return null;
  }
  return {
    version: 1,
    savedAt: String(payload.savedAt || ''),
    post,
    assets: normalizePostDraftAssets(payload.assets),
  };
}

function getDraftSavedAtMs(value){
  const timestamp = Date.parse(String(value || ''));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function cleanupLocalPostDrafts({ referencePosts = [], keepPostId = '', aggressive = false } = {}){
  const normalizedKeepPostId = String(keepPostId || '').trim();
  const now = Date.now();
  const savedPostSnapshots = new Map(
    (Array.isArray(referencePosts) ? referencePosts : [])
      .filter(post => post && !post.localDraftOnly)
      .map(post => {
        const normalizedId = String(post.id || '').trim();
        if(!normalizedId){
          return null;
        }
        const savedComparable = buildComparableSavedPost(post);
        return [normalizedId, buildComparablePostSnapshot(savedComparable, savedComparable.assets)];
      })
      .filter(Boolean),
  );

  const allEntries = listLocalStorageKeys()
    .filter(key => key.startsWith(STUDIO_POST_DRAFT_KEY_PREFIX))
    .map(key => {
      const raw = safeLocalStorageGetItem(key);
      const postId = key.slice(STUDIO_POST_DRAFT_KEY_PREFIX.length);
      const draft = readLocalPostDraft(postId);
      if(!draft){
        return null;
      }
      return {
        key,
        postId,
        draft,
        savedAtMs: getDraftSavedAtMs(draft.savedAt),
        sizeChars: raw?.length || 0,
      };
    })
    .filter(Boolean);

  let removedCount = 0;
  const remaining = [];

  allEntries.forEach(entry => {
    if(entry.postId === normalizedKeepPostId){
      remaining.push(entry);
      return;
    }

    const ageMs = Math.max(0, now - entry.savedAtMs);
    const savedSnapshot = savedPostSnapshots.get(entry.postId);
    const draftSnapshot = buildComparablePostSnapshot(entry.draft.post, entry.draft.assets);
    const matchesSavedPost = Boolean(savedSnapshot) && !entry.draft.post.localDraftOnly && savedSnapshot === draftSnapshot;
    const isOrphanServerDraft = !savedSnapshot && !entry.draft.post.localDraftOnly;
    const isExpired = ageMs > STUDIO_POST_DRAFT_RETENTION_MS;
    const isExpiredOrphan = isOrphanServerDraft && ageMs > STUDIO_POST_ORPHAN_DRAFT_RETENTION_MS;

    if(matchesSavedPost || isExpired || isExpiredOrphan){
      safeLocalStorageRemoveItem(entry.key);
      removedCount += 1;
      return;
    }

    remaining.push(entry);
  });

  remaining.sort((left, right) => left.savedAtMs - right.savedAtMs);

  const maxCount = aggressive ? Math.max(4, Math.floor(STUDIO_POST_DRAFT_MAX_COUNT / 2)) : STUDIO_POST_DRAFT_MAX_COUNT;
  while(remaining.length > maxCount){
    const removable = remaining.findIndex(entry => entry.postId !== normalizedKeepPostId);
    if(removable === -1){
      break;
    }
    safeLocalStorageRemoveItem(remaining[removable].key);
    remaining.splice(removable, 1);
    removedCount += 1;
  }

  let totalChars = remaining.reduce((sum, entry) => sum + entry.sizeChars, 0);
  const maxTotalChars = aggressive ? Math.floor(STUDIO_POST_DRAFT_MAX_TOTAL_CHARS * 0.7) : STUDIO_POST_DRAFT_MAX_TOTAL_CHARS;
  while(totalChars > maxTotalChars){
    const removable = remaining.findIndex(entry => entry.postId !== normalizedKeepPostId);
    if(removable === -1){
      break;
    }
    totalChars -= remaining[removable].sizeChars;
    safeLocalStorageRemoveItem(remaining[removable].key);
    remaining.splice(removable, 1);
    removedCount += 1;
  }

  return {
    removedCount,
    remainingCount: remaining.length,
  };
}

function readLocalPostDraft(postId){
  if(!postId){
    return null;
  }
  const raw = safeLocalStorageGetItem(getPostDraftStorageKey(postId));
  if(!raw){
    return null;
  }
  try {
    return normalizeStoredPostDraft(JSON.parse(raw));
  } catch {
    safeLocalStorageRemoveItem(getPostDraftStorageKey(postId));
    return null;
  }
}

function writeLocalPostDraft(postId, payload){
  const normalized = normalizeStoredPostDraft(payload);
  if(!normalized){
    return false;
  }
  const storageKey = getPostDraftStorageKey(postId);
  const serialized = JSON.stringify(normalized);
  const referencePosts = studioState.bootstrap?.posts || [];

  cleanupLocalPostDrafts({
    referencePosts,
    keepPostId: postId,
  });

  if(safeLocalStorageSetItem(storageKey, serialized)){
    return true;
  }

  cleanupLocalPostDrafts({
    referencePosts,
    keepPostId: postId,
    aggressive: true,
  });

  return safeLocalStorageSetItem(storageKey, serialized);
}

function removeLocalPostDraft(postId){
  if(!postId){
    return;
  }
  safeLocalStorageRemoveItem(getPostDraftStorageKey(postId));
}

function listLocalPostDrafts(){
  return listLocalStorageKeys()
    .filter(key => key.startsWith(STUDIO_POST_DRAFT_KEY_PREFIX))
    .map(key => {
      const postId = key.slice(STUDIO_POST_DRAFT_KEY_PREFIX.length);
      return readLocalPostDraft(postId);
    })
    .filter(Boolean);
}

function buildComparableSavedPost(post = {}){
  const zhDocument = extractEmbeddedImageDocument(post.content?.zh || '');
  const enDocument = extractEmbeddedImageDocument(post.content?.en || '');
  return {
    ...normalizePostDraftShape({
      ...post,
      content: {
        zh: zhDocument.content || '',
        en: enDocument.content || '',
      },
    }),
    assets: normalizePostDraftAssets({
      postContentZh: zhDocument.manifest,
      postContentEn: enDocument.manifest,
    }),
  };
}

function buildComparablePostSnapshot(post = {}, assets = {}){
  const normalized = normalizePostDraftShape(post);
  const comparable = {
    slug: normalized.slug,
    visibility: normalized.visibility,
    status: normalized.status,
    publishedAt: normalized.publishedAt,
    title: normalized.title,
    excerpt: normalized.excerpt,
    content: normalized.content,
    tags: normalized.tags,
    coverImage: normalized.coverImage,
    assets: normalizePostDraftAssets(assets),
  };
  return JSON.stringify(comparable);
}

function mergeLocalDraftPosts(posts = []){
  const merged = Array.isArray(posts) ? [...posts] : [];
  listLocalPostDrafts().forEach(draft => {
    if(merged.some(item => item.id === draft.post.id)){
      return;
    }
    merged.unshift({
      ...normalizePostDraftShape(draft.post),
      updatedAt: draft.savedAt || null,
      path: draft.post.slug ? `/notes/${draft.post.slug}` : '',
      localDraftOnly: true,
    });
  });
  return sortStudioPosts(merged);
}

function formatStudioTimestamp(value){
  if(!value){
    return '';
  }
  const date = new Date(value);
  if(Number.isNaN(date.getTime())){
    return '';
  }
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStudioPublishStatusLabel(post, options = {}){
  const {
    draftLabel = 'Draft',
    autoLabel = 'Will be set automatically when published',
  } = options;
  const stamped = formatStudioTimestamp(post?.publishedAt);
  if(stamped){
    return stamped;
  }
  return post?.status === 'published' ? autoLabel : draftLabel;
}

function getStudioPostSortTime(post){
  const publishedAt = Date.parse(String(post?.publishedAt || ''));
  const updatedAt = Date.parse(String(post?.updatedAt || ''));
  const publishedTime = Number.isFinite(publishedAt) ? publishedAt : 0;
  const updatedTime = Number.isFinite(updatedAt) ? updatedAt : 0;

  if(post?.localDraftOnly){
    return updatedTime || publishedTime;
  }
  if(post?.status === 'published'){
    return publishedTime || updatedTime;
  }
  return updatedTime || publishedTime;
}

function sortStudioPosts(posts = []){
  return [...posts].sort((left, right) => {
    const primaryDelta = getStudioPostSortTime(right) - getStudioPostSortTime(left);
    if(primaryDelta !== 0){
      return primaryDelta;
    }
    return String(left?.slug || left?.id || '').localeCompare(String(right?.slug || right?.id || ''));
  });
}

function stripPostDraftText(value = ''){
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, ' $1 ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateStudioReadingMinutes(post){
  const sample = stripPostDraftText(post?.content?.zh || post?.content?.en || '');
  if(!sample){
    return 1;
  }
  const latinWords = (sample.match(/[A-Za-z0-9_]+/g) || []).length;
  const cjkChars = (sample.match(/[\u3400-\u9fff]/g) || []).length;
  const wordEquivalent = latinWords + (cjkChars / 2);
  return Math.max(1, Math.round(wordEquivalent / 220));
}

function evaluatePostChecklist(post){
  const normalized = normalizePostDraftShape(post);
  const titleReady = Boolean(normalized.title.zh.trim() || normalized.title.en.trim());
  const excerptReady = Boolean(normalized.excerpt.zh.trim() || normalized.excerpt.en.trim());
  const contentReady = Boolean(stripPostDraftText(normalized.content.zh) || stripPostDraftText(normalized.content.en));
  const slugFilled = Boolean(normalized.slug);
  const slugReady = slugFilled && STUDIO_POST_SLUG_PATTERN.test(normalized.slug);
  const publishDateReady = Boolean(normalized.publishedAt);
  const tagsReady = normalized.tags.length > 0;
  const coverReady = Boolean(normalized.coverImage.src);
  const publishing = normalized.status === 'published';

  const items = [
    {
      key: 'slug',
      label: 'Slug ready',
      detail: slugReady
        ? normalized.slug
        : (slugFilled ? 'Use lowercase letters, numbers, and hyphens only.' : 'Add a slug before saving to the site.'),
      ok: slugReady,
      required: true,
    },
    {
      key: 'title',
      label: 'Title',
      detail: titleReady ? 'At least one language has a title.' : 'Add a Chinese or English title.',
      ok: titleReady,
      required: publishing,
    },
    {
      key: 'excerpt',
      label: 'Excerpt',
      detail: excerptReady ? 'Summary is ready for cards and previews.' : 'Add a short summary for cards and previews.',
      ok: excerptReady,
      required: publishing,
    },
    {
      key: 'content',
      label: 'Article body',
      detail: contentReady ? `Estimated ${estimateStudioReadingMinutes(normalized)} min read.` : 'Write the article body in at least one language.',
      ok: contentReady,
      required: publishing,
    },
    {
      key: 'publishedAt',
      label: 'Publish time',
      detail: publishDateReady
        ? `Stamped ${formatStudioTimestamp(normalized.publishedAt)}`
        : (publishing
          ? 'Studio will stamp the publish time automatically when you save.'
          : 'A publish timestamp will be added automatically the first time this post goes live.'),
      ok: publishDateReady || publishing,
      required: false,
    },
    {
      key: 'cover',
      label: 'Cover image',
      detail: coverReady ? 'Homepage feature and article hero will use it.' : 'Recommended for a stronger blog card and preview.',
      ok: coverReady,
      required: false,
    },
    {
      key: 'tags',
      label: 'Tags',
      detail: tagsReady ? `${normalized.tags.length} tag${normalized.tags.length > 1 ? 's' : ''} ready.` : 'Recommended for navigation and context.',
      ok: tagsReady,
      required: false,
    },
  ];

  return {
    items,
    blockers: items.filter(item => item.required && !item.ok),
  };
}

function renderChecklistMarkup(report){
  return report.items.map(item => `
    <div class="studio-check-item ${item.ok ? 'ok' : item.required ? 'warn' : 'optional'}">
      <div class="studio-check-indicator" aria-hidden="true">${item.ok ? '✓' : item.required ? '!' : '·'}</div>
      <div class="studio-check-copy">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.detail)}</span>
      </div>
      <div class="studio-check-state">${item.ok ? 'Ready' : item.required ? 'Needed' : 'Optional'}</div>
    </div>
  `).join('');
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
  if(studioState.section === 'posts'){
    persistCurrentPostDraft({ silent: true });
  }
  stopStudioSessionProtection();
  clearStudioSessionMarker();
  studioState.bootstrap = null;
  studioState.username = null;
  studioState.selectedPostId = null;
  resetPostEditorState();
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
      <span class="studio-nav-icon" aria-hidden="true">${section.icon}</span>
      <span class="studio-nav-copy">
        <strong>${section.label}</strong>
        <small>${section.description}</small>
      </span>
    </button>
  `).join('');

  studioRefs.nav.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      if(!confirmPostContextChange()){
        return;
      }
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
    <div class="studio-grid studio-dashboard-shell">
      <section class="studio-command-card">
        <div class="eyebrow">Editorial Control</div>
        <h3>把前台、熟客模式與內容工作流收斂到同一個控制台。</h3>
        <p class="muted">Studio 現在是你管理網站的主場。公開文案、首頁 updates、文章、熟客資料與 reset 流程都集中在這裡，不需要再在多個檔案和頁面之間切換。</p>
        <div class="studio-command-grid">
          <div class="studio-mini-stat">
            <span>Content System</span>
            <strong>Online</strong>
          </div>
          <div class="studio-mini-stat">
            <span>Session Model</span>
            <strong>Protected</strong>
          </div>
          <div class="studio-mini-stat">
            <span>Editing Mode</span>
            <strong>Live CMS</strong>
          </div>
        </div>
      </section>

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

      <div class="studio-grid cols-2">
        <div class="studio-card">
          <div class="eyebrow">What this backend handles</div>
          <h3>你現在可以在線上完成的事</h3>
          <ul class="list">
            <li><span class="muted">更新首頁自介、焦點區塊與聯絡文案，不需要再手改 HTML。</span></li>
            <li><span class="muted">新增 updates 與文章，並決定公開或只限熟客可見。</span></li>
            <li><span class="muted">把中文姓名、聯絡資訊、學經歷與照片留在受保護的熟客資料裡，而不是公開原始碼。</span></li>
          </ul>
        </div>

        <div class="studio-card">
          <div class="eyebrow">Operating Notes</div>
          <h3>現在的工作節奏會更單純</h3>
          <ul class="list">
            <li><span class="muted">日常內容更新以 Studio 為主，只有版型與程式改動才回 repo。</span></li>
            <li><span class="muted">Markdown 編輯與即時預覽已經打通，寫文和調整結構會順很多。</span></li>
            <li><span class="muted">熟客資料與公開內容拆開管理，安全性和維護性都更乾淨。</span></li>
          </ul>
        </div>
      </div>

      <div class="studio-callout">
        <strong>目前仍保留靜態 fallback。</strong>
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

function clearPostAutosaveTimer(){
  if(studioState.postEditor.autosaveTimer){
    window.clearTimeout(studioState.postEditor.autosaveTimer);
    studioState.postEditor.autosaveTimer = null;
  }
}

function resetPostEditorState(){
  clearPostAutosaveTimer();
  studioState.postEditor.dirty = false;
  studioState.postEditor.currentPostId = null;
  studioState.postEditor.savedSnapshot = '';
  studioState.postEditor.restoredDraftAt = null;
  studioState.postEditor.autosavedAt = null;
  studioState.postEditor.hasLocalDraft = false;
}

function getHydratedEditorPost(post){
  if(!post){
    return null;
  }

  const localDraft = readLocalPostDraft(post.id);
  const savedComparable = buildComparableSavedPost(post);
  if(localDraft){
    return {
      post: normalizePostDraftShape(localDraft.post),
      assets: normalizePostDraftAssets(localDraft.assets),
      localDraft,
      savedSnapshot: post.localDraftOnly
        ? ''
        : buildComparablePostSnapshot(savedComparable, savedComparable.assets),
    };
  }

  return {
    post: normalizePostDraftShape(savedComparable),
    assets: normalizePostDraftAssets(savedComparable.assets),
    localDraft: null,
    savedSnapshot: post.localDraftOnly
      ? ''
      : buildComparablePostSnapshot(savedComparable, savedComparable.assets),
  };
}

function renderPostCoverPreviewMarkup(coverImage){
  const cover = normalizePostCoverImage(coverImage);
  if(!cover.src){
    return `
      <div class="studio-cover-placeholder">
        <strong>No cover image yet</strong>
        <span>Upload a PNG/JPG or paste an image URL. This will be used on the article page and blog feature cards.</span>
      </div>
    `;
  }

  const altText = cover.alt.zh || cover.alt.en || 'Post cover preview';
  return `<img class="studio-cover-preview-image" src="${escapeHtml(cover.src)}" alt="${escapeHtml(altText)}">`;
}

function syncPostCoverPreview(){
  const previewShell = document.getElementById('postCoverPreviewShell');
  if(!previewShell){
    return;
  }
  const coverImage = normalizePostCoverImage({
    src: document.getElementById('postCoverSrc')?.value || '',
    alt: {
      zh: document.getElementById('postCoverAltZh')?.value || '',
      en: document.getElementById('postCoverAltEn')?.value || '',
    },
  });
  previewShell.innerHTML = renderPostCoverPreviewMarkup(coverImage);
}

function collectCurrentPostDraftFromForm(){
  const post = getCurrentPost();
  if(!post) return null;

  const postContentZh = document.getElementById('postContentZh')?.value || '';
  const postContentEn = document.getElementById('postContentEn')?.value || '';
  const zhManifest = pruneMarkdownImageManifest('postContentZh', postContentZh);
  const enManifest = pruneMarkdownImageManifest('postContentEn', postContentEn);

  return {
    ...normalizePostDraftShape({
      ...post,
      slug: document.getElementById('postSlug')?.value.trim() || '',
      visibility: document.getElementById('postVisibility')?.value || 'public',
      status: document.getElementById('postStatus')?.value || 'draft',
      publishedAt: post.publishedAt || '',
      title: {
        zh: document.getElementById('postTitleZh')?.value || '',
        en: document.getElementById('postTitleEn')?.value || '',
      },
      excerpt: {
        zh: document.getElementById('postExcerptZh')?.value || '',
        en: document.getElementById('postExcerptEn')?.value || '',
      },
      content: {
        zh: postContentZh,
        en: postContentEn,
      },
      tags: (document.getElementById('postTagsInput')?.value || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      coverImage: {
        src: document.getElementById('postCoverSrc')?.value || '',
        alt: {
          zh: document.getElementById('postCoverAltZh')?.value || '',
          en: document.getElementById('postCoverAltEn')?.value || '',
        },
      },
      localDraftOnly: Boolean(post.localDraftOnly),
    }),
    assets: {
      postContentZh: deepClone(zhManifest),
      postContentEn: deepClone(enManifest),
    },
  };
}

function updatePostWorkflowUI(){
  const draft = collectCurrentPostDraftFromForm();
  if(!draft){
    return;
  }

  const currentPost = getCurrentPost();
  const currentSnapshot = buildComparablePostSnapshot(draft, draft.assets);
  const dirty = currentPost?.localDraftOnly || currentSnapshot !== studioState.postEditor.savedSnapshot;
  const checklist = evaluatePostChecklist(draft);
  studioState.postEditor.dirty = Boolean(dirty);

  const dirtyPill = document.getElementById('postDirtyPill');
  if(dirtyPill){
    dirtyPill.textContent = dirty ? 'Unpublished Changes' : 'Site Saved';
    dirtyPill.classList.toggle('private', dirty);
  }

  const autosavePill = document.getElementById('postAutosavePill');
  if(autosavePill){
    if(studioState.postEditor.autosaveTimer){
      autosavePill.textContent = 'Autosaving...';
    } else if(studioState.postEditor.autosavedAt){
      autosavePill.textContent = `Autosaved ${formatStudioTimestamp(studioState.postEditor.autosavedAt)}`;
    } else if(studioState.postEditor.hasLocalDraft){
      autosavePill.textContent = 'Local Draft Ready';
    } else {
      autosavePill.textContent = 'Autosave On';
    }
  }

  const hint = document.getElementById('postDraftHint');
  if(hint){
    if(dirty && studioState.postEditor.autosavedAt){
      hint.textContent = `目前內容和網站正式版本不同，最近一次本機 autosave 在 ${formatStudioTimestamp(studioState.postEditor.autosavedAt)}。按 Save Post 才會真正更新網站。`;
    } else if(dirty){
      hint.textContent = '偵測到尚未發佈的變更。系統會先暫存在本機，等你確認後再正式保存到網站。';
    } else {
      hint.textContent = '目前表單內容和網站上的版本一致。';
    }
  }

  const checklistNode = document.getElementById('postPublishChecklist');
  if(checklistNode){
    checklistNode.innerHTML = renderChecklistMarkup(checklist);
  }

  const publishStamp = document.getElementById('postPublishStamp');
  if(publishStamp){
    publishStamp.textContent = getStudioPublishStatusLabel(draft, {
      draftLabel: 'Not published yet',
      autoLabel: 'Will be stamped automatically when you publish',
    });
  }

  const publishHint = document.getElementById('postPublishHint');
  if(publishHint){
    publishHint.textContent = draft.publishedAt
      ? (draft.status === 'published'
        ? 'This article is already live with the timestamp shown above.'
        : 'This is the last publish time recorded for this article.')
      : 'No manual date picker anymore. Studio will stamp the publish time automatically the first time this post goes live.';
  }

  const discardBtn = document.getElementById('discardLocalDraftBtn');
  if(discardBtn){
    discardBtn.hidden = !studioState.postEditor.hasLocalDraft;
  }
}

function renderPostEditor(editorState){
  const post = editorState.post;
  const checklist = evaluatePostChecklist(post);
  const restoredAt = editorState.localDraft?.savedAt ? formatStudioTimestamp(editorState.localDraft.savedAt) : '';
  const publishStamp = formatStudioTimestamp(post.publishedAt);
  const publishStampLabel = publishStamp || (post.status === 'published'
    ? 'Will be stamped automatically when you publish'
    : 'Not published yet');
  const publishStampHint = publishStamp
    ? (post.status === 'published'
      ? 'This article is already live with the timestamp shown above.'
      : 'This is the last publish time recorded for this article.')
    : 'No manual date picker anymore. Studio will stamp the publish time automatically the first time this post goes live.';
  const isCurrentFeatured = studioState.bootstrap?.featuredPostId === post.id;
  const featuredLabel = isCurrentFeatured
    ? (studioState.bootstrap?.featuredSource === 'manual' ? 'Currently featured manually' : 'Currently featured by latest publish')
    : 'Newest published post becomes featured automatically, but you can override it here anytime.';
  return `
    <div class="studio-card studio-post-workflow-card">
      <div class="studio-post-workflow-head">
        <div>
          <div class="eyebrow">Workflow</div>
          <h4>Autosave, preview, and publish readiness</h4>
        </div>
        <div class="studio-row-actions">
          <span class="studio-pill ${editorState.localDraft ? 'private' : ''}" id="postDirtyPill">${editorState.localDraft ? 'Local Draft Restored' : 'Ready to Edit'}</span>
          <span class="studio-pill" id="postAutosavePill">${restoredAt ? `Restored ${escapeHtml(restoredAt)}` : 'Autosave On'}</span>
        </div>
      </div>
      <div class="studio-post-editor-note" id="postDraftHint">
        ${editorState.localDraft
          ? `已載入本機 autosave 草稿（${escapeHtml(restoredAt || 'just now')}）。這些變更還沒有正式發佈到網站。`
          : '編輯時會自動把草稿暫存在本機，切頁或重整時不容易把內容弄丟。'}
      </div>
      <div class="studio-checklist" id="postPublishChecklist" style="margin-top:18px">
        ${renderChecklistMarkup(checklist)}
      </div>
      <div class="studio-row-actions" style="margin-top:18px">
        <button class="btn magnetic" id="previewDraftBtn" type="button">Preview Draft</button>
        <button class="btn magnetic" id="discardLocalDraftBtn" type="button" ${editorState.localDraft ? '' : 'hidden'}>Discard Local Draft</button>
        <button class="btn magnetic" id="setFeaturedPostBtn" type="button" ${(post.status === 'published' && !post.localDraftOnly) ? '' : 'disabled'}>${isCurrentFeatured ? 'Homepage Featured' : 'Set as Featured'}</button>
      </div>
      <div class="studio-post-editor-note" style="margin-top:14px">${escapeHtml(featuredLabel)}</div>
    </div>

    <div class="studio-card studio-post-cover-card">
      <div class="studio-row-actions" style="justify-content:space-between">
        <div>
          <div class="eyebrow">Cover Image</div>
          <h4>文章封面</h4>
        </div>
        <span class="studio-pill">Homepage + Article</span>
      </div>
      <div class="studio-cover-preview-shell" id="postCoverPreviewShell" style="margin-top:18px">
        ${renderPostCoverPreviewMarkup(post.coverImage)}
      </div>
      <div class="studio-form-grid cols-2" style="margin-top:18px">
        <label class="studio-form-field">
          <span>Cover Image URL</span>
          <input id="postCoverSrc" type="text" value="${escapeHtml(post.coverImage?.src || '')}" placeholder="https://... or data:image/...">
        </label>
        <label class="studio-form-field">
          <span>Upload PNG / JPG</span>
          <input id="postCoverUpload" type="file" accept="${MARKDOWN_IMAGE_ACCEPT}">
        </label>
        <label class="studio-form-field">
          <span>中文 Alt</span>
          <input id="postCoverAltZh" type="text" value="${escapeHtml(post.coverImage?.alt?.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Alt</span>
          <input id="postCoverAltEn" type="text" value="${escapeHtml(post.coverImage?.alt?.en || '')}">
        </label>
      </div>
      <div class="studio-row-actions" style="margin-top:16px">
        <button class="btn magnetic" id="clearPostCoverBtn" type="button">Remove Cover</button>
      </div>
    </div>

    <div class="studio-card">
      <div class="studio-form-grid cols-2">
        <label class="studio-form-field">
          <span>Slug</span>
          <input id="postSlug" type="text" value="${escapeHtml(post.slug || '')}" placeholder="example-post-slug">
        </label>
        <div class="studio-form-field">
          <span>Publish Time</span>
          <div class="studio-static-field" id="postPublishStamp">${escapeHtml(publishStampLabel)}</div>
          <small class="studio-field-note" id="postPublishHint">${escapeHtml(publishStampHint)}</small>
        </div>
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
        Studio 文章現在支援 Markdown 編輯、常用格式工具列、PNG/JPG 圖片插入、封面圖欄位、draft 預覽與自動儲存。
      </div>
      <div class="studio-form-grid cols-2 studio-markdown-grid" style="margin-top:18px">
        ${renderMarkdownEditor({
          id: 'postContentZh',
          label: '中文內容',
          value: post.content.zh || '',
          languageLabel: 'ZH',
          manifest: editorState.assets.postContentZh,
        })}
        ${renderMarkdownEditor({
          id: 'postContentEn',
          label: 'English Content',
          value: post.content.en || '',
          languageLabel: 'EN',
          manifest: editorState.assets.postContentEn,
        })}
      </div>
      <div class="studio-row-actions" style="margin-top:20px">
        ${post.slug ? `<a class="btn magnetic" href="/notes/${escapeHtml(post.slug)}" target="_blank" rel="noopener">Open Current URL</a>` : ''}
        <button class="btn magnetic" id="deletePostBtn" type="button">${post.localDraftOnly ? 'Delete Local Draft' : 'Delete Post'}</button>
      </div>
    </div>
  `;
}

function persistCurrentPostDraft({ silent = false } = {}){
  const draft = collectCurrentPostDraftFromForm();
  if(!draft?.id){
    return false;
  }

  const savedAt = new Date().toISOString();
  const ok = writeLocalPostDraft(draft.id, {
    savedAt,
    post: {
      ...draft,
      localDraftOnly: Boolean(getCurrentPost()?.localDraftOnly),
    },
    assets: draft.assets,
  });

  clearPostAutosaveTimer();

  if(ok){
    studioState.postEditor.hasLocalDraft = true;
    studioState.postEditor.autosavedAt = savedAt;
    updatePostWorkflowUI();
    if(!silent){
      setStudioStatus('Draft autosaved locally', 'neutral');
    }
    return true;
  }

  setStudioStatus('Autosave could not store this draft locally. Please save the post manually.', 'error');
  return false;
}

function schedulePostAutosave(){
  clearPostAutosaveTimer();
  studioState.postEditor.autosaveTimer = window.setTimeout(() => {
    persistCurrentPostDraft({ silent: true });
  }, STUDIO_POST_AUTOSAVE_DELAY_MS);
  updatePostWorkflowUI();
}

function confirmPostContextChange(){
  if(studioState.section !== 'posts' || !studioState.postEditor.dirty){
    return true;
  }
  persistCurrentPostDraft({ silent: true });
  return window.confirm('This post still has local draft changes that are not saved to the live site yet. They have been autosaved locally. Continue?');
}

function buildPreviewHtml(post){
  const normalized = normalizePostDraftShape(post);
  const renderedContent = {
    zh: renderRichContent(post.content?.zh || ''),
    en: renderRichContent(post.content?.en || ''),
  };
  const coverImage = normalizePostCoverImage(post.coverImage);
  const previewData = JSON.stringify({
    title: normalized.title,
    excerpt: normalized.excerpt,
    renderedContent,
    tags: normalized.tags,
    publishedAt: normalized.publishedAt,
    status: normalized.status,
    readingMinutes: estimateStudioReadingMinutes(normalized),
  }).replace(/</g, '\\u003c');
  const title = escapeHtml(normalized.title.zh || normalized.title.en || 'Draft Preview');
  const description = escapeHtml(normalized.excerpt.zh || normalized.excerpt.en || 'Studio draft preview');
  const tags = normalized.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const coverMarkup = coverImage.src
    ? `<div class="post-cover"><img src="${escapeHtml(coverImage.src)}" alt="${escapeHtml(coverImage.alt.zh || coverImage.alt.en || title)}"></div>`
    : '';

  return `<!DOCTYPE html>
  <html lang="zh-Hant" data-lang="zh">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
    <style>
      .post-shell{padding:132px 0 110px}.post-hero,.post-panel{width:min(960px, calc(100% - 40px));margin:0 auto}
      .post-hero{position:relative;overflow:hidden;display:grid;gap:20px;padding:38px 40px;border-radius:34px;border:1px solid rgba(255,255,255,.1);background:radial-gradient(circle at 82% 18%, rgba(217,177,111,.16), transparent 24%),linear-gradient(160deg, rgba(17,21,31,.96), rgba(8,10,16,.985));box-shadow:0 28px 82px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)}
      .post-hero::before{content:"";position:absolute;inset:16px;border-radius:26px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.008));pointer-events:none}.post-hero > *{position:relative;z-index:1}
      .post-toolbar{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}.post-toolbar .actions{display:flex;gap:12px;flex-wrap:wrap}
      .post-toggle{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--gold-soft);font-weight:600;cursor:pointer}
      .post-meta{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start}.post-meta-cluster{display:flex;gap:10px;flex-wrap:wrap}
      .post-chip{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#e7decf;font-size:.85rem}
      .post-title{margin:0;font-size:clamp(2.5rem, 5vw, 4.4rem);line-height:.95;letter-spacing:-.03em;max-width:12ch}.post-excerpt{margin:0;font-size:1.08rem;color:#d6cec1;max-width:64ch;line-height:1.85}
      .post-cover img{display:block;width:100%;max-height:420px;object-fit:cover;border-radius:28px;border:1px solid rgba(255,255,255,.08)}
      .post-panel{margin-top:24px;padding:42px;border-radius:32px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 80px rgba(0,0,0,.28)}.post-body-wrap{max-width:70ch}.post-body{color:#ddd6c9}.post-body p{color:#ddd6c9;margin:0 0 18px}.post-body h2,.post-body h3,.post-body h4{margin:36px 0 16px}.post-body ul,.post-body ol{padding-left:1.3rem;margin:0 0 18px}.post-body li + li{margin-top:8px}.post-body blockquote{margin:24px 0;padding:18px 20px;border-left:3px solid rgba(217,177,111,.48);background:rgba(217,177,111,.08);border-radius:0 18px 18px 0}.post-body pre{overflow:auto;margin:24px 0;padding:18px;border-radius:22px;background:#0e131d;border:1px solid rgba(255,255,255,.08)}.post-body code{padding:2px 6px;border-radius:8px;background:rgba(255,255,255,.08);font-family:"IBM Plex Mono","SFMono-Regular",Consolas,monospace;font-size:.92em}.post-body pre code{padding:0;background:none}.post-body hr{border:none;height:1px;margin:32px 0;background:rgba(255,255,255,.12)}.post-body a{color:var(--gold-soft);text-decoration:underline;text-underline-offset:3px}.post-body img{display:block;max-width:100%;height:auto;margin:22px 0;border-radius:22px;border:1px solid rgba(255,255,255,.08)}
      @media (max-width:720px){.post-hero,.post-panel{width:min(100%, calc(100% - 24px));padding:28px 22px}.post-title{max-width:none}}
    </style>
  </head>
  <body>
    <nav class="nav"><div class="nav-inner"><a class="brand" href="/" aria-label="Jason Liao home"><span class="brand-mark"><span>JL</span></span><span>Jason Liao</span></a><div class="nav-links" style="display:flex"><span class="post-chip">Studio Draft Preview</span></div></div></nav>
    <main class="post-shell">
      <section class="post-hero">
        <div class="post-toolbar"><a class="btn" href="javascript:window.close()">Close Preview</a><div class="actions"><button class="post-toggle" id="langSwitch" type="button">EN</button></div></div>
        <div class="post-meta"><div class="eyebrow">Draft Preview</div><div class="post-meta-cluster"><span class="post-chip" id="postPublished">${escapeHtml(getStudioPublishStatusLabel(normalized, { draftLabel: '尚未發布', autoLabel: '發布時自動填入' }))}</span><span class="post-chip" id="postReadingTime">${estimateStudioReadingMinutes(normalized)} min read</span></div></div>
        ${coverMarkup}
        <h1 class="post-title">${title}</h1>
        <p class="post-excerpt">${description}</p>
        <div class="tags" id="postTags">${tags}</div>
      </section>
      <article class="post-panel"><div class="post-body-wrap"><div class="post-body" id="postBody">${renderedContent.zh || renderedContent.en || ''}</div></div></article>
    </main>
    <script>
      const previewData = ${previewData};
      const langSwitch = document.getElementById('langSwitch');
      const postBody = document.getElementById('postBody');
      const postTags = document.getElementById('postTags');
      const postTitle = document.querySelector('.post-title');
      const postExcerpt = document.querySelector('.post-excerpt');
      const postPublished = document.getElementById('postPublished');
      const postReadingTime = document.getElementById('postReadingTime');
      let currentLang = 'zh';
      const escapeHtml = value => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
      function formatPublishedLabel(lang){
        if (previewData.publishedAt) {
          const date = new Date(previewData.publishedAt);
          if (!Number.isNaN(date.getTime())) {
            if (lang === 'zh') {
              const pad = value => String(value).padStart(2, '0');
              return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
            }
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(date);
          }
        }
        if (previewData.status === 'published') {
          return lang === 'zh' ? '發布時自動填入' : 'Auto-set on publish';
        }
        return lang === 'zh' ? '尚未發布' : 'Draft';
      }
      function renderTags(){ postTags.innerHTML = (previewData.tags || []).map(tag => '<span class="tag">' + escapeHtml(tag) + '</span>').join(''); }
      function renderPost(lang){
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
        document.documentElement.dataset.lang = lang;
        langSwitch.textContent = lang === 'zh' ? 'EN' : '中文';
        postTitle.textContent = previewData.title[lang] || previewData.title.zh || previewData.title.en || '';
        postExcerpt.textContent = previewData.excerpt[lang] || previewData.excerpt.zh || previewData.excerpt.en || '';
        postBody.innerHTML = previewData.renderedContent[lang] || previewData.renderedContent.zh || previewData.renderedContent.en || '';
        postPublished.textContent = formatPublishedLabel(lang);
        postReadingTime.textContent = lang === 'zh' ? '閱讀約 ' + previewData.readingMinutes + ' 分鐘' : previewData.readingMinutes + ' min read';
        renderTags();
      }
      langSwitch.addEventListener('click', () => renderPost(currentLang === 'zh' ? 'en' : 'zh'));
      renderPost('zh');
    </script>
  </body>
  </html>`;
}

function previewCurrentPost(){
  const post = collectCurrentPostFromForm();
  if(!post){
    return;
  }
  const previewUrl = URL.createObjectURL(new Blob([buildPreviewHtml(post)], { type: 'text/html' }));
  const previewWindow = window.open(previewUrl, '_blank', 'noopener');
  if(!previewWindow){
    URL.revokeObjectURL(previewUrl);
    setStudioStatus('Preview was blocked by the browser. Please allow pop-ups for Studio.', 'error');
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
  setStudioStatus('Draft preview opened in a new tab', 'success');
}

function discardCurrentLocalDraft(){
  const post = getCurrentPost();
  if(!post){
    return;
  }
  if(!window.confirm(`Discard the local draft for "${post.title.zh || post.title.en || post.slug || 'Untitled'}"?`)){
    return;
  }
  removeLocalPostDraft(post.id);
  clearPostAutosaveTimer();
  studioState.postEditor.hasLocalDraft = false;
  studioState.postEditor.autosavedAt = null;
  if(post.localDraftOnly){
    studioState.bootstrap.posts = (studioState.bootstrap.posts || []).filter(item => item.id !== post.id);
    ensureSelectedPost();
  }
  renderPosts();
  setStudioStatus('Local draft discarded', 'success');
}

async function setCurrentPostAsFeatured(){
  const post = getCurrentPost();
  if(!post){
    return;
  }
  if(post.localDraftOnly || post.status !== 'published'){
    setStudioStatus('Publish this post first, then you can set it as featured.', 'error');
    return;
  }

  setStudioStatus('Updating homepage featured post...', 'pending');
  const payload = await studioFetchJson('/api/admin/posts/featured', {
    method: 'POST',
    body: JSON.stringify({ id: post.id }),
  });

  studioState.bootstrap.featuredPostId = payload.featuredPostId || post.id;
  studioState.bootstrap.featuredSource = payload.featuredSource || 'manual';
  renderPosts();
  setStudioStatus('Homepage featured post updated', 'success');
}

function bindPostEditorInteractions(panel){
  const handleFieldChange = () => {
    syncPostCoverPreview();
    schedulePostAutosave();
  };

  panel.querySelectorAll('#postSlug, #postVisibility, #postStatus, #postTitleZh, #postTitleEn, #postExcerptZh, #postExcerptEn, #postTagsInput, #postCoverSrc, #postCoverAltZh, #postCoverAltEn, #postContentZh, #postContentEn')
    .forEach(field => {
      field.addEventListener('input', handleFieldChange);
      field.addEventListener('change', handleFieldChange);
    });

  panel.querySelector('#previewDraftBtn')?.addEventListener('click', previewCurrentPost);
  panel.querySelector('#discardLocalDraftBtn')?.addEventListener('click', discardCurrentLocalDraft);
  panel.querySelector('#setFeaturedPostBtn')?.addEventListener('click', setCurrentPostAsFeatured);
  panel.querySelector('#postCoverUpload')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if(!file){
      return;
    }
    try {
      setStudioStatus('Processing cover image...', 'pending');
      const cover = await createEmbeddedMarkdownImage(file);
      const coverSrc = document.getElementById('postCoverSrc');
      const coverAltZh = document.getElementById('postCoverAltZh');
      const coverAltEn = document.getElementById('postCoverAltEn');
      if(coverSrc){
        coverSrc.value = cover.dataUrl;
      }
      if(coverAltZh && !coverAltZh.value.trim()){
        coverAltZh.value = cover.alt;
      }
      if(coverAltEn && !coverAltEn.value.trim()){
        coverAltEn.value = cover.alt;
      }
      syncPostCoverPreview();
      schedulePostAutosave();
      setStudioStatus('Cover image updated', 'success');
    } catch (error){
      setStudioStatus(error.message || 'Unable to process cover image', 'error');
    }
  });

  panel.querySelector('#clearPostCoverBtn')?.addEventListener('click', () => {
    const coverSrc = document.getElementById('postCoverSrc');
    const coverAltZh = document.getElementById('postCoverAltZh');
    const coverAltEn = document.getElementById('postCoverAltEn');
    if(coverSrc) coverSrc.value = '';
    if(coverAltZh) coverAltZh.value = '';
    if(coverAltEn) coverAltEn.value = '';
    syncPostCoverPreview();
    schedulePostAutosave();
  });

  updatePostWorkflowUI();
}

function renderPosts(){
  studioState.bootstrap.posts = mergeLocalDraftPosts(studioState.bootstrap.posts || []);
  ensureSelectedPost();
  const panel = studioRefs.panels.posts;
  const posts = studioState.bootstrap.posts || [];
  const currentPost = getCurrentPost();
  const editorState = currentPost ? getHydratedEditorPost(currentPost) : null;
  studioState.markdownEditorAssets = {};
  clearPostAutosaveTimer();

  panel.innerHTML = `
    <div class="studio-toolbar">
      <div>
        <div class="eyebrow">Posts</div>
        <h3>Blog / Notes 發布台</h3>
      </div>
      <div class="studio-row-actions">
        <button class="btn magnetic" type="button" id="createPostBtn">New Post</button>
        <button class="btn magnetic" type="button" id="previewDraftToolbarBtn" ${currentPost ? '' : 'disabled'}>Preview Draft</button>
        <button class="btn btn-primary magnetic" type="button" id="savePostBtn" ${currentPost ? '' : 'disabled'}>Save Post</button>
      </div>
    </div>
    <div class="studio-post-layout" style="margin-top:20px">
      <div>
        <div class="studio-posts-list">
          ${posts.length ? posts.map(post => {
            const localDraft = readLocalPostDraft(post.id);
            return `
              <article class="studio-post-item ${post.id === studioState.selectedPostId ? 'selected' : ''}" data-post-card="${post.id}">
                <div class="studio-row-actions">
                  <span class="studio-pill ${post.visibility === 'acquaintance' ? 'private' : 'public'}">${post.visibility === 'acquaintance' ? 'Acquaintance' : 'Public'}</span>
                  <span class="studio-pill">${escapeHtml(post.status)}</span>
                  ${studioState.bootstrap?.featuredPostId === post.id ? `<span class="studio-pill ${studioState.bootstrap?.featuredSource === 'manual' ? 'public' : 'private'}">Featured</span>` : ''}
                  ${(post.localDraftOnly || localDraft) ? '<span class="studio-pill private">Local Draft</span>' : ''}
                </div>
                <h4 style="margin-top:14px">${escapeHtml(post.title.zh || post.title.en || 'Untitled')}</h4>
                <p class="small muted">${escapeHtml(post.slug || 'unsaved-draft')}</p>
              </article>
            `;
          }).join('') : '<div class="studio-empty">還沒有 managed posts。新增之後，公開文章會在 /notes/slug 出現。</div>'}
        </div>
      </div>
      <div class="studio-post-editor">
        ${editorState ? renderPostEditor(editorState) : '<div class="studio-empty">先新增一篇文章。</div>'}
      </div>
    </div>
  `;

  if(editorState){
    studioState.postEditor.currentPostId = currentPost.id;
    studioState.postEditor.savedSnapshot = editorState.savedSnapshot;
    studioState.postEditor.restoredDraftAt = editorState.localDraft?.savedAt || null;
    studioState.postEditor.autosavedAt = editorState.localDraft?.savedAt || null;
    studioState.postEditor.hasLocalDraft = Boolean(editorState.localDraft);
  } else {
    resetPostEditorState();
  }

  panel.querySelector('#createPostBtn')?.addEventListener('click', () => {
    if(!confirmPostContextChange()){
      return;
    }
    const newPost = {
      id: createId(),
      slug: '',
      visibility: 'public',
      status: 'draft',
      publishedAt: '',
      updatedAt: new Date().toISOString(),
      title: { zh: '', en: '' },
      excerpt: { zh: '', en: '' },
      content: { zh: '', en: '' },
      tags: [],
      coverImage: createEmptyCoverImage(),
      localDraftOnly: true,
    };
    studioState.bootstrap.posts = sortStudioPosts([newPost, ...(studioState.bootstrap.posts || [])]);
    studioState.selectedPostId = newPost.id;
    renderPosts();
  });

  panel.querySelectorAll('[data-post-card]').forEach(card => {
    card.addEventListener('click', () => {
      if(card.dataset.postCard === studioState.selectedPostId){
        return;
      }
      if(!confirmPostContextChange()){
        return;
      }
      studioState.selectedPostId = card.dataset.postCard;
      renderPosts();
    });
  });

  panel.querySelector('#savePostBtn')?.addEventListener('click', saveCurrentPost);
  panel.querySelector('#previewDraftToolbarBtn')?.addEventListener('click', previewCurrentPost);
  panel.querySelector('#deletePostBtn')?.addEventListener('click', deleteCurrentPost);
  bindMarkdownEditors(panel);
  bindPostEditorInteractions(panel);
}

function collectCurrentPostFromForm(){
  const draft = collectCurrentPostDraftFromForm();
  if(!draft) return null;
  return {
    ...draft,
    publishedAt: draft.publishedAt || null,
    coverImage: normalizePostCoverImage(draft.coverImage),
    content: {
      zh: serializeEmbeddedImageDocument(draft.content.zh, draft.assets.postContentZh),
      en: serializeEmbeddedImageDocument(draft.content.en, draft.assets.postContentEn),
    },
  };
}

async function saveCurrentPost(){
  const previousPost = getCurrentPost();
  const draft = collectCurrentPostDraftFromForm();
  const post = collectCurrentPostFromForm();
  if(!draft || !post) return;

  if(!draft.slug){
    setStudioStatus('Slug is required before saving to the site', 'error');
    updatePostWorkflowUI();
    return;
  }
  if(!STUDIO_POST_SLUG_PATTERN.test(draft.slug)){
    setStudioStatus('Slug must use lowercase letters, numbers, and hyphens only', 'error');
    updatePostWorkflowUI();
    return;
  }

  const checklist = evaluatePostChecklist(draft);
  if(draft.status === 'published' && checklist.blockers.length){
    setStudioStatus('Complete the publish checklist before publishing this post', 'error');
    updatePostWorkflowUI();
    return;
  }

  setStudioStatus(post.status === 'published' ? 'Publishing post...' : 'Saving post...', 'pending');
  const response = await studioFetchJson('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify({ post }),
  });
  const savedPost = response?.post || post;
  const becamePublished = previousPost?.status !== 'published' && savedPost.status === 'published';
  removeLocalPostDraft(post.id);
  clearPostAutosaveTimer();
  if(becamePublished){
    studioState.bootstrap.featuredPostId = savedPost.id;
    studioState.bootstrap.featuredSource = 'auto';
  }
  studioState.bootstrap.posts = sortStudioPosts(studioState.bootstrap.posts.map(item => item.id === post.id ? {
    ...savedPost,
    localDraftOnly: false,
  } : item));
  studioState.selectedPostId = savedPost.id;
  renderPosts();
  setStudioStatus(savedPost.status === 'published' ? 'Post published' : 'Post saved', 'success');
}

async function deleteCurrentPost(){
  const post = getCurrentPost();
  if(!post) return;
  if(!window.confirm(`Delete "${post.title.zh || post.title.en || post.slug || 'Untitled'}"?`)){
    return;
  }

  if(post.localDraftOnly){
    removeLocalPostDraft(post.id);
    clearPostAutosaveTimer();
    studioState.bootstrap.posts = studioState.bootstrap.posts.filter(item => item.id !== post.id);
    if(studioState.bootstrap.featuredPostId === post.id){
      studioState.bootstrap.featuredPostId = '';
      studioState.bootstrap.featuredSource = 'auto';
    }
    ensureSelectedPost();
    renderPosts();
    setStudioStatus('Local draft deleted', 'success');
    return;
  }

  setStudioStatus('Deleting post...', 'pending');
  await studioFetchJson('/api/admin/posts', {
    method: 'DELETE',
    body: JSON.stringify({ id: post.id }),
  });
  removeLocalPostDraft(post.id);
  clearPostAutosaveTimer();
  studioState.bootstrap.posts = studioState.bootstrap.posts.filter(item => item.id !== post.id);
  if(studioState.bootstrap.featuredPostId === post.id){
    studioState.bootstrap.featuredPostId = '';
    studioState.bootstrap.featuredSource = 'auto';
  }
  ensureSelectedPost();
  renderPosts();
  setStudioStatus('Post deleted', 'success');
}

function renderPrivateImageEditor(slot, image = {}){
  const normalized = normalizePrivateProfileImageEntry(image);
  const previewMarkup = normalized.dataUrl
    ? `<img class="studio-image-preview" src="${escapeHtml(normalized.dataUrl)}" alt="${escapeHtml(normalized.alt.zh || normalized.alt.en || 'Portrait')}">`
    : '<div class="studio-empty">No portrait uploaded yet.</div>';
  return `
    <div class="studio-card">
      <div class="studio-mini-label">${slot === 'primary' ? 'Primary Portrait' : 'Secondary Portrait'}</div>
      ${previewMarkup}
      <div class="studio-row-actions" style="margin-top:14px">
        <button class="btn magnetic" type="button" data-private-image-clear="${slot}" ${normalized.dataUrl ? '' : 'disabled'}>Remove Image</button>
      </div>
      <div class="studio-form-grid" style="margin-top:14px">
        <label class="studio-form-field">
          <span>Upload Image</span>
          <input type="file" accept="image/*" data-private-image-upload="${slot}">
        </label>
        <label class="studio-form-field">
          <span>中文 Caption</span>
          <input type="text" data-private-image-caption="${slot}" data-lang="zh" value="${escapeHtml(normalized.caption.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Caption</span>
          <input type="text" data-private-image-caption="${slot}" data-lang="en" value="${escapeHtml(normalized.caption.en || '')}">
        </label>
        <label class="studio-form-field">
          <span>中文 Alt</span>
          <input type="text" data-private-image-alt="${slot}" data-lang="zh" value="${escapeHtml(normalized.alt.zh || '')}">
        </label>
        <label class="studio-form-field">
          <span>English Alt</span>
          <input type="text" data-private-image-alt="${slot}" data-lang="en" value="${escapeHtml(normalized.alt.en || '')}">
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
  panel.querySelectorAll('[data-private-image-clear]').forEach(button => {
    button.addEventListener('click', () => {
      const slot = button.dataset.privateImageClear;
      const previous = normalizePrivateProfileImageEntry(studioState.bootstrap.privateProfile.images?.[slot]);
      studioState.bootstrap.privateProfile.images[slot] = normalizePrivateProfileImageEntry({
        ...previous,
        dataUrl: '',
      });
      renderPrivateProfile();
      setStudioStatus('Portrait removed from current profile draft', 'neutral');
    });
  });
  panel.querySelectorAll('[data-private-image-upload]').forEach(input => {
    input.addEventListener('change', async event => {
      const slot = event.target.dataset.privateImageUpload;
      const file = event.target.files?.[0];
      if(!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      studioState.bootstrap.privateProfile.images[slot] = normalizePrivateProfileImageEntry({
        ...studioState.bootstrap.privateProfile.images[slot],
        dataUrl,
      });
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

  ['primary', 'secondary'].forEach(slot => {
    current.images[slot] = normalizePrivateProfileImageEntry(current.images[slot]);
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
  const currentSection = STUDIO_SECTIONS.find(section => section.id === studioState.section) || STUDIO_SECTIONS[0];
  studioRefs.title.textContent = currentSection.label;
  if(studioRefs.subtitle){
    studioRefs.subtitle.textContent = currentSection.subtitle;
  }

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
  cleanupLocalPostDrafts({
    referencePosts: payload.posts || [],
  });
  studioState.bootstrap = {
    ...payload,
    posts: mergeLocalDraftPosts(payload.posts || []),
  };
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
  if(!confirmPostContextChange()){
    return;
  }
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
    if(studioState.section === 'posts'){
      persistCurrentPostDraft({ silent: true });
    }
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

window.addEventListener('beforeunload', event => {
  if(studioState.section !== 'posts' || !studioState.postEditor.dirty){
    return;
  }
  persistCurrentPostDraft({ silent: true });
  event.preventDefault();
  event.returnValue = '';
});

bootstrapStudio();
