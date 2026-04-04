
// ════════════════════════════════════════
// ★ i18n — Language Toggle System
// ════════════════════════════════════════
const I18N_EN = {
  // Hero
  'hero.eyebrow': 'Personal Website',
  'hero.lead': "I'm Jason Liao. I keep working across mathematics, control systems, and robotics. I enjoy theoretical derivation, and I love turning abstract models step by step into systems that can be verified, implemented, and put to real use. I've always believed that truly powerful technology isn't just about computing or building — it must also be understood, shared, and ultimately make a difference in the world.",

  // News
  'news.1': 'Ongoing work on hexapod robot control and learning-based methods',
  'news.2': "Comparative experiments: Reinforcement Learning vs. Classical Control in progress",
  'news.3': 'Engineering / Mathematics / Control & Robotics',

  // Portrait
  'portrait.title': 'Selected Portraits',

  // About
  'about.h2': "Beyond convention,<br>guided by conviction.",
  'about.p1': "I'm from Taiwan, and I continue to study and work across engineering and the mathematical sciences.",
  'about.p2': "I love derivation, and I love transforming abstract models into systems that can be verified, simulated, and deployed. From fluid mechanics and thermodynamics to applied mathematics, control theory, robotics, and reinforcement learning — I've been searching for a path where the theories I truly care about can land in engineering and become something useful to the world.",
  'about.stat1': 'Systems thinking & engineering practice',
  'about.stat2': 'Derivation, modeling & analysis',
  'about.stat3': 'Learning-based vs. classical methods',
  'about.stat4': 'Mobility systems & research work',
  'about.profile.eyebrow': "Profile",
  'about.profile.title': "Jason Liao",
  'about.list.1.title': "Academic Background",
  'about.list.1.desc': 'Working across engineering, mathematics, and control-oriented problem solving.',
  'about.list.2.title': "Current Direction",
  'about.list.2.desc': 'Current work centers on robot control, learning-based methods, and rigorous comparison with classical approaches.',
  'about.list.3.title': "Long-term Vision",
  'about.list.3.desc': "I hope to bridge theory, engineering, and the real world more closely — producing research that is both rigorous and genuinely useful.",
  'about.list.4.title': "Beyond the Lab",
  'about.list.4.desc': "Outside academics, baseball is my greatest passion. I'm a devoted fan of Chinese Taipei and the CTBC Brothers. For me, baseball has never been just a game — it's a deeply Taiwanese, passionate, and sincere emotional connection. I love the atmosphere of an entire stadium cheering together, the whole nation united behind the players fighting until the very last moment. In NPB I follow the Yomiuri Giants, and in MLB the New York Yankees. I also play Valorant — I enjoy the thrill of competition, rhythm, and split-second decision-making.",

  // About timeline
  'about.tl.1.year': "01 · The Beginning",
  'about.tl.1.p': "I've loved math and physics since I was young. The feeling of thinking something through clearly, deriving it cleanly, and explaining it plainly has always been deeply attractive to me. Because of that, I always assumed I'd follow a typical science track.",
  'about.tl.2.year': "02 · Into Engineering",
  'about.tl.2.p': "After actually entering the engineering field, I gradually discovered that the theories I once loved weren't just elegant — they could also be turned into things that truly work. From mechanics, fluids, and control to modeling, I grew to love engineering because it showed me that knowledge can not only explain the world, but actually change it.",
  'about.tl.3.year': "03 · Where I Am Now",
  'about.tl.3.p': "I'm currently working on hexapod robot RHex control research. The core question right now is whether reinforcement learning can outperform classical control in certain scenarios — in stability, adaptability, and overall effectiveness. What I'm doing is working through this question step by step, rigorously and thoroughly. Beyond that, I maintain a strong interest in thermofluids and cross-disciplinary integration, because I deeply value the feeling of theory and practice truly coming together.",

  // Background
  'bg.h2': "Education",
  'bg.lead': 'The fuller version of my academic background and portraits is shared only in Acquaintance Mode. The public version keeps things intentionally broad.',
  'bg.tl.1.year': "Elementary",
  'bg.tl.1.p': 'An early academic foundation built in Taipei',
  'bg.tl.2.year': "Middle School",
  'bg.tl.2.p': 'A continued interest in mathematics and physics',
  'bg.tl.3.year': "High School",
  'bg.tl.3.p': 'A period of committing more fully to science and engineering',
  'bg.tl.4.year': "University",
  'bg.tl.4.p': 'Current work centered on control, modeling, and robotics',

  // Focus
  'focus.h2': "What I'm Working On",
  'focus.card1.title': "Current Focus",
  'focus.list.1.title': "Hexapod Robot Control",
  'focus.list.1.desc': 'I am currently focused on hexapod robot control. The main direction is using reinforcement learning and comparing it with classical control methods to look for better results in stability, adaptability, and overall effectiveness.',
  'focus.list.2.title': "Mathematical & Engineering Modeling",
  'focus.list.2.desc': "I've always valued derivation and modeling. For me, mathematics isn't an auxiliary tool — it's the foundation that helps me see problems clearly, define systems precisely, and validate methods rigorously.",
  'focus.list.3.title': "Thermofluids & Cross-disciplinary Integration",
  'focus.list.3.desc': "While my current focus is on control and robotics, I remain deeply interested in thermofluids and cross-disciplinary integration. If I can gradually connect these seemingly separate fields in the future, that would be truly exciting.",
  'focus.card2.title': "What I Care About",
  'focus.values.1.title': "Precision",
  'focus.values.1.desc': "See the problem clearly first, then communicate it clearly.",
  'focus.values.2.title': "Rigor",
  'focus.values.2.desc': "I care not just about how results look, but whether the derivation and implementation can truly stand on their own.",
  'focus.values.3.title': "Warmth",
  'focus.values.3.desc': "Research can be rigorous, but being human should be warm.",

  // Skills
  'skills.lead': "These are the tools and foundations I use most often and am most committed to sharpening.",
  'skills.matlab': "Control modeling, system simulation & analysis",
  'skills.mathematica': "Derivation, symbolic computation & mathematical visualization",
  'skills.cad': "Mechanical design thinking & engineering communication",
  'skills.python': "Analysis, simulation & research development",
  'skills.cpp': "Low-level implementation & performance-oriented programming",
  'skills.rl': "A key direction I'm actively investing in",
  'skills.linalg': "The foundational language of modeling & control",
  'skills.diffeq': "The most fundamental tool for understanding system dynamics",
  'skills.numerical': "Methods for bringing theory into computation & simulation",

  // Research
  'research.lead': "No formal publications yet — here I present my current research and the key directions that have shaped my path.",
  'research.pub1.title': "Hexapod Robot Control: Reinforcement Learning vs. Classical Control",
  'research.pub1.author': "Jason Liao",
  'research.pub1.venue': 'Current Robotics Research',
  'research.pub1.desc': "My current research focus is hexapod robot control. The core question is whether reinforcement learning can achieve more stable, effective, and adaptive control than classical methods in certain scenarios. This is the work I am most focused on right now.",
  'research.pub2.title': "From Mathematics to Engineering Foundations",
  'research.pub2.author': 'Current Research Track',
  'research.pub2.venue': 'Engineering / Mathematics / Modeling',
  'research.pub2.desc': "While my research focus is now on control and robotics, my foundation was built gradually through mathematics, physics, engineering mathematics, linear algebra, differential equations, fluid mechanics, thermodynamics, and mechanics. These aren't just background — they're the methods I rely on to stand firm in my research.",

  // Projects
  'projects.card1.p': 'I am currently working on hexapod robot RHex control, with a focus on comparing reinforcement learning and classical control so the results on stability, adaptability, and overall effectiveness can be understood more clearly and rigorously.',
  'projects.card2.p': "I've always valued the role of mathematics in engineering. For me, differential equations, linear algebra, and state spaces aren't just course material — they're the foundation for understanding systems, building models, and validating whether methods are reliable.",
  'projects.card3.p': "While my current research centers on control and robotics, I've always loved thermofluids and maintain interest in integration across mathematics, thermofluids, and control. For me, this isn't a side path — it's a direction I want to keep open long-term.",

  // Writing
  'writing.lead': "What I leave here are traces of my journey. Some about research, some about baseball, and some are simply thoughts that felt very real in the moment.",
  'writing.card1.meta': "Essay · Identity",
  'writing.card1.title': "Reason as the Bone, Passion as the Heart",
  'writing.card1.desc': "On how I view learning, passion, responsibility, and the future — and the kind of person I aspire to become.",
  'writing.card2.meta': "Note · Research",
  'writing.card2.title': "From Mathematics to Robot Control",
  'writing.card2.desc': "On how I went from loving derivation to doing control and robotics research. Mathematics, for me, is not decoration — it's the foundation.",
  'writing.card3.meta': "Essay · Life",
  'writing.card3.title': "What Baseball Taught Me About Engineering",
  'writing.card3.desc': "On the rhythm, discipline, and sense of team that Taiwanese baseball gave me. Many things I value in research, I first learned on the field.",

  // Contact
  'contact.h2': 'Get in Touch',
  'contact.desc': 'Direct contact details and the fuller personal profile are available only in Acquaintance Mode. Publicly, GitHub remains the best place to reach me.',
  'contact.directCta': 'Acquaintance Mode',
  'contact.location.label': "Location",
  'contact.location.value': 'Taipei, Taiwan',
  'contact.lang.label': "Languages",
  'contact.lang.value': "Traditional Chinese / English",
  'private.placeholder': 'Available in Acquaintance Mode',
  'private.modal.eyebrow': 'Acquaintance Mode',
  'private.modal.title': 'Unlock private profile details',
  'private.modal.desc': 'To reduce personal-data exposure, portraits, direct contact details, the Chinese name, and the full academic background are shown only after local password verification.',
  'private.modal.label': 'Password',
  'private.modal.submit': 'Unlock',
  'private.modal.cancel': 'Cancel',
  'private.modal.toggleShow': 'Show',
  'private.modal.toggleHide': 'Hide',
  'private.modal.note': 'The password is verified locally in your browser and is never sent to a server. Acquaintance Mode locks again after 10 minutes of inactivity.',

  // Footer
  'footer.motto': "Stand on reason, walk with passion.",
  'footer.brand': "Jason Liao",
};
const I18N_ZH = {
  'private.modal.toggleShow': '顯示',
  'private.modal.toggleHide': '隱藏',
};

// Store original Chinese content
const i18nOriginal = new Map();
const i18nMetaOriginal = {};
let i18nInitialized = false;
const PRIVATE_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const PRIVATE_ACTIVITY_THROTTLE_MS = 1000;
const privateMode = {
  unlocked: false,
  payload: null,
  scriptPromise: null,
  mediaUrls: [],
  lastActivityAt: 0,
  lastActivityHandledAt: 0,
  idleTimer: null,
};
const PRIVATE_UI_COPY = {
  zh: {
    toggleOff: '熟客模式',
    toggleOn: '熟客模式 ON',
    unlockButton: 'Email Me',
    footerEmail: 'Email',
    modalError: '密碼不正確，或目前瀏覽器不支援本機解密。',
    modalLoading: '驗證中...',
    passwordPlaceholder: '輸入密碼',
    portraitLocked: [
      {
        kicker: '熟客模式',
        title: 'Portraits 只在熟客模式中開放',
      },
      {
        kicker: 'Private Profile',
        title: '照片會在本機驗證後顯示',
      },
    ],
  },
  en: {
    toggleOff: 'Acquaintance Mode',
    toggleOn: 'Acquaintance Mode On',
    unlockButton: 'Email Me',
    footerEmail: 'Email',
    modalError: 'Incorrect password, or this browser does not support local decryption.',
    modalLoading: 'Unlocking...',
    passwordPlaceholder: 'Enter password',
    portraitLocked: [
      {
        kicker: 'Acquaintance Mode',
        title: 'Portraits are shared only after unlock.',
      },
      {
        kicker: 'Private Profile',
        title: 'Images stay encrypted until local verification succeeds.',
      },
    ],
  },
};
function getStoredLang(){
  try {
    return window.localStorage.getItem('site-lang') || 'zh';
  } catch {
    return 'zh';
  }
}
function setStoredLang(lang){
  try {
    window.localStorage.setItem('site-lang', lang);
  } catch {
    // ignore storage errors in restricted preview contexts
  }
}
let currentLang = getStoredLang();
let heroLeadTypeTimer = null;
let heroLeadHasAnimated = false;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Merge main translations with post-page translations (if any)
function getTranslations(){
  const merged = Object.assign({}, I18N_EN);
  if(typeof PAGE_I18N_EN !== 'undefined') Object.assign(merged, PAGE_I18N_EN);
  if(typeof POST_I18N_EN !== 'undefined') Object.assign(merged, POST_I18N_EN);
  return merged;
}

function getBaseTranslation(key, lang){
  const translations = getTranslations();
  return lang === 'en'
    ? (translations[key] || i18nOriginal.get(key) || '')
    : (I18N_ZH[key] || i18nOriginal.get(key) || '');
}

function getPrivateTranslation(key, lang){
  if(!privateMode.unlocked || !privateMode.payload?.translations?.[lang]) return null;
  return privateMode.payload.translations[lang][key] ?? null;
}

function getRenderedTranslation(key, lang){
  return getPrivateTranslation(key, lang) ?? getBaseTranslation(key, lang);
}

function base64ToUint8Array(base64){
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i = 0; i < binary.length; i += 1){
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getPrivatePayloadEntries(payload){
  if(Array.isArray(payload?.entries) && payload.entries.length){
    return payload.entries;
  }
  return payload ? [payload] : [];
}

function revokePrivateMedia(){
  privateMode.mediaUrls.forEach(url => URL.revokeObjectURL(url));
  privateMode.mediaUrls = [];
}

function clearPrivateAutoLockTimer(){
  if(privateMode.idleTimer){
    window.clearTimeout(privateMode.idleTimer);
    privateMode.idleTimer = null;
  }
}

function isPrivateSessionExpired(){
  return privateMode.unlocked && privateMode.lastActivityAt > 0 && (Date.now() - privateMode.lastActivityAt) >= PRIVATE_IDLE_TIMEOUT_MS;
}

function schedulePrivateAutoLock(){
  clearPrivateAutoLockTimer();
  if(!privateMode.unlocked) return;

  const remaining = PRIVATE_IDLE_TIMEOUT_MS - (Date.now() - privateMode.lastActivityAt);
  if(remaining <= 0){
    lockPrivateMode('timeout');
    return;
  }

  privateMode.idleTimer = window.setTimeout(() => {
    if(isPrivateSessionExpired()){
      lockPrivateMode('timeout');
      return;
    }
    schedulePrivateAutoLock();
  }, remaining);
}

function touchPrivateSession(source = 'activity'){
  if(!privateMode.unlocked) return;

  const now = Date.now();
  if(source === 'mousemove' && (now - privateMode.lastActivityHandledAt) < PRIVATE_ACTIVITY_THROTTLE_MS){
    return;
  }

  privateMode.lastActivityAt = now;
  privateMode.lastActivityHandledAt = now;
  schedulePrivateAutoLock();
}

function evaluatePrivateSessionExpiry(){
  if(!privateMode.unlocked) return;
  if(isPrivateSessionExpired()){
    lockPrivateMode('timeout');
    return;
  }
  schedulePrivateAutoLock();
}

function createPrivateImageUrl(entry){
  const bytes = base64ToUint8Array(entry.data);
  const blob = new Blob([bytes], { type: entry.mime });
  const url = URL.createObjectURL(blob);
  privateMode.mediaUrls.push(url);
  return url;
}

function renderPortraitCard(card, entry, fallbackCopy){
  if(!card) return;
  if(privateMode.unlocked && entry){
    const imageUrl = createPrivateImageUrl(entry);
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = entry.alt?.[currentLang] || entry.alt?.en || 'Portrait';
    img.loading = 'lazy';
    img.decoding = 'async';

    const caption = document.createElement('figcaption');
    caption.textContent = entry.caption?.[currentLang] || entry.caption?.en || '';

    card.innerHTML = '';
    card.append(img, caption);
    return;
  }

  card.innerHTML = `
    <div class="portrait-lock">
      <span class="portrait-lock-kicker">${fallbackCopy.kicker}</span>
      <strong class="portrait-lock-title">${fallbackCopy.title}</strong>
    </div>
  `;
}

function renderProtectedPortraits(){
  const primary = document.getElementById('portraitPrimary');
  const secondary = document.getElementById('portraitSecondary');
  if(!primary || !secondary) return;

  revokePrivateMedia();

  const fallbackCopy = PRIVATE_UI_COPY[currentLang].portraitLocked;
  renderPortraitCard(primary, privateMode.payload?.images?.primary, fallbackCopy[0]);
  renderPortraitCard(secondary, privateMode.payload?.images?.secondary, fallbackCopy[1]);
}

function updateProtectedFields(){
  document.querySelectorAll('[data-private-field]').forEach(el => {
    const key = el.getAttribute('data-private-field');
    const fallback = getBaseTranslation('private.placeholder', currentLang);
    el.textContent = privateMode.unlocked ? (privateMode.payload?.fields?.[key] || fallback) : fallback;
  });
}

function updatePrivateLinks(){
  const directContactBtn = document.getElementById('directContactBtn');
  const footerContactLink = document.getElementById('footerContactLink');
  const emailHref = privateMode.payload?.fields?.emailHref || '#private-access';
  const publicLabel = getBaseTranslation('contact.directCta', currentLang);
  const uiCopy = PRIVATE_UI_COPY[currentLang];

  if(directContactBtn){
    directContactBtn.textContent = privateMode.unlocked ? uiCopy.unlockButton : publicLabel;
    directContactBtn.setAttribute('href', privateMode.unlocked ? emailHref : '#private-access');
  }
  if(footerContactLink){
    footerContactLink.textContent = privateMode.unlocked ? uiCopy.footerEmail : publicLabel;
    footerContactLink.setAttribute('href', privateMode.unlocked ? emailHref : '#private-access');
  }
}

function updatePrivateModalUI(){
  const passwordInput = document.getElementById('privatePassword');
  const errorEl = document.getElementById('privateError');
  const submitBtn = document.getElementById('privateSubmit');
  const passwordToggle = document.getElementById('privatePasswordToggle');
  const passwordToggleText = document.getElementById('privatePasswordToggleText');
  if(passwordInput){
    passwordInput.placeholder = PRIVATE_UI_COPY[currentLang].passwordPlaceholder;
  }
  if(errorEl){
    errorEl.textContent = errorEl.dataset.locked ? PRIVATE_UI_COPY[currentLang].modalError : '';
  }
  if(submitBtn && !submitBtn.disabled){
    submitBtn.textContent = getBaseTranslation('private.modal.submit', currentLang);
  }
  if(passwordToggle && passwordToggleText){
    const toggleKey = passwordInput?.type === 'text' ? 'private.modal.toggleHide' : 'private.modal.toggleShow';
    const toggleLabel = getBaseTranslation(toggleKey, currentLang);
    passwordToggleText.textContent = toggleLabel;
    passwordToggle.setAttribute('aria-label', toggleLabel);
  }
}

function updatePrivateToggleUI(){
  const toggleBtn = document.getElementById('privateToggle');
  const label = document.getElementById('privateToggleLabel');
  if(toggleBtn){
    toggleBtn.dataset.state = privateMode.unlocked ? 'on' : 'off';
  }
  if(label){
    label.textContent = privateMode.unlocked ? PRIVATE_UI_COPY[currentLang].toggleOn : PRIVATE_UI_COPY[currentLang].toggleOff;
  }
}

function refreshPrivateUI(){
  updateProtectedFields();
  updatePrivateLinks();
  updatePrivateToggleUI();
  updatePrivateModalUI();
  renderProtectedPortraits();
}

function openPrivateModal(){
  const modal = document.getElementById('privateModal');
  const passwordInput = document.getElementById('privatePassword');
  const errorEl = document.getElementById('privateError');
  if(!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if(errorEl){
    errorEl.textContent = '';
    delete errorEl.dataset.locked;
  }
  if(passwordInput){
    passwordInput.value = '';
    window.setTimeout(() => passwordInput.focus(), 40);
  }
}

function closePrivateModal(){
  const modal = document.getElementById('privateModal');
  const passwordInput = document.getElementById('privatePassword');
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if(passwordInput){
    passwordInput.type = 'password';
  }
  updatePrivateModalUI();
}

async function loadPrivatePayload(){
  if(privateMode.payload) return privateMode.payload;
  if(typeof window.PRIVATE_PROFILE_PAYLOAD !== 'undefined') return window.PRIVATE_PROFILE_PAYLOAD;
  if(privateMode.scriptPromise) return privateMode.scriptPromise;

  privateMode.scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'private-data.js';
    script.async = true;
    script.onload = () => {
      if(typeof window.PRIVATE_PROFILE_PAYLOAD === 'undefined'){
        reject(new Error('private payload missing'));
        return;
      }
      resolve(window.PRIVATE_PROFILE_PAYLOAD);
    };
    script.onerror = () => reject(new Error('private payload load failed'));
    document.head.appendChild(script);
  }).catch(error => {
    privateMode.scriptPromise = null;
    throw error;
  });

  return privateMode.scriptPromise;
}

async function decryptPrivatePayload(password){
  if(!window.crypto?.subtle) throw new Error('crypto unavailable');
  const payload = await loadPrivatePayload();
  const entries = getPrivatePayloadEntries(payload);

  for(const entry of entries){
    try {
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
      );
      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: base64ToUint8Array(entry.salt),
          iterations: entry.iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
      );
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToUint8Array(entry.iv) },
        key,
        base64ToUint8Array(entry.data),
      );
      return JSON.parse(textDecoder.decode(decrypted));
    } catch {
      // Keep trying remaining entries so multiple passwords can stay valid.
    }
  }

  throw new Error('private payload decrypt failed');
}

async function unlockPrivateMode(password){
  const data = await decryptPrivatePayload(password);
  privateMode.unlocked = true;
  privateMode.payload = data;
  privateMode.lastActivityAt = Date.now();
  privateMode.lastActivityHandledAt = privateMode.lastActivityAt;
  applyLang(currentLang);
  schedulePrivateAutoLock();
  closePrivateModal();
}

function lockPrivateMode(){
  privateMode.unlocked = false;
  privateMode.payload = null;
  privateMode.lastActivityAt = 0;
  privateMode.lastActivityHandledAt = 0;
  clearPrivateAutoLockTimer();
  revokePrivateMedia();
  applyLang(currentLang);
}

function captureMetaOriginal(){
  if(i18nMetaOriginal.title) return;
  i18nMetaOriginal.title = document.title;
  i18nMetaOriginal.description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  i18nMetaOriginal.ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  i18nMetaOriginal.ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  i18nMetaOriginal.twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
  i18nMetaOriginal.twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
  i18nMetaOriginal.ogLocale = document.querySelector('meta[property="og:locale"]')?.getAttribute('content') || '';
}

function applyMeta(lang){
  captureMetaOriginal();
  const metaEn = typeof PAGE_I18N_META_EN !== 'undefined' ? PAGE_I18N_META_EN : null;
  const title = lang === 'en' && metaEn?.title ? metaEn.title : i18nMetaOriginal.title;
  const description = lang === 'en' && metaEn?.description ? metaEn.description : i18nMetaOriginal.description;
  const ogTitle = lang === 'en' && metaEn?.ogTitle ? metaEn.ogTitle : i18nMetaOriginal.ogTitle;
  const ogDescription = lang === 'en' && metaEn?.ogDescription ? metaEn.ogDescription : i18nMetaOriginal.ogDescription;
  const twitterTitle = lang === 'en' && metaEn?.twitterTitle ? metaEn.twitterTitle : i18nMetaOriginal.twitterTitle;
  const twitterDescription = lang === 'en' && metaEn?.twitterDescription ? metaEn.twitterDescription : i18nMetaOriginal.twitterDescription;
  const ogLocale = lang === 'en' && metaEn?.ogLocale ? metaEn.ogLocale : i18nMetaOriginal.ogLocale;

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', ogTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', ogDescription);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', twitterTitle);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', twitterDescription);
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', ogLocale);
}

function renderHeroLead(animate = false){
  const heroLead = document.querySelector('.hero .lead[data-i18n]');
  if(!heroLead) return;

  const fullText = heroLead.textContent.trim();
  clearTimeout(heroLeadTypeTimer);

  if(!animate){
    heroLead.textContent = fullText;
    return;
  }

  heroLead.textContent = '';
  let charIdx = 0;
  const typeSpeed = 28;

  function typeChar(){
    if(charIdx < fullText.length){
      heroLead.textContent += fullText[charIdx];
      charIdx += 1;
      heroLeadTypeTimer = setTimeout(typeChar, typeSpeed);
    } else {
      heroLeadHasAnimated = true;
    }
  }

  heroLeadTypeTimer = setTimeout(typeChar, 500);
}

function initI18n(){
  if(i18nInitialized) return;
  i18nInitialized = true;

  // Collect all translatable elements and store their original content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    i18nOriginal.set(el.getAttribute('data-i18n'), el.textContent);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    i18nOriginal.set(el.getAttribute('data-i18n-html'), el.innerHTML);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    i18nOriginal.set(el.getAttribute('data-i18n-aria-label'), el.getAttribute('aria-label') || '');
  });

  applyLang(currentLang === 'en' ? 'en' : 'zh');

  if(document.querySelector('.hero .lead[data-i18n]')){
    renderHeroLead(true);
  }
}

function applyLang(lang){
  currentLang = lang;
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  setStoredLang(lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getRenderedTranslation(key, lang);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = getRenderedTranslation(key, lang);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', getRenderedTranslation(key, lang));
  });

  applyMeta(lang);
  updateLangToggleUI();
  refreshPrivateUI();

  if(document.querySelector('.hero .lead[data-i18n]')){
    renderHeroLead(false);
  }
}

function updateLangToggleUI(){
  const label = document.getElementById('langLabel');
  if(label){
    label.textContent = currentLang === 'zh' ? 'EN' : '中文';
  }
}

function toggleLang(){
  applyLang(currentLang === 'zh' ? 'en' : 'zh');
}

function handlePrivateTrigger(event){
  if(privateMode.unlocked) return;
  event.preventDefault();
  openPrivateModal();
}

function setupPrivateUI(){
  const privateToggle = document.getElementById('privateToggle');
  const directContactBtn = document.getElementById('directContactBtn');
  const footerContactLink = document.getElementById('footerContactLink');
  const privateForm = document.getElementById('privateForm');
  const privatePassword = document.getElementById('privatePassword');
  const privatePasswordToggle = document.getElementById('privatePasswordToggle');
  const privateError = document.getElementById('privateError');
  const privateSubmit = document.getElementById('privateSubmit');

  if(privateToggle){
    privateToggle.addEventListener('click', () => {
      if(privateMode.unlocked){
        lockPrivateMode();
      } else {
        openPrivateModal();
      }
    });
  }

  [directContactBtn, footerContactLink].forEach(link => {
    if(link) link.addEventListener('click', handlePrivateTrigger);
  });

  document.querySelectorAll('[data-private-close]').forEach(el => {
    el.addEventListener('click', closePrivateModal);
  });

  document.addEventListener('keydown', event => {
    if(event.key === 'Escape'){
      closePrivateModal();
    }
  });

  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(eventName => {
    window.addEventListener(eventName, () => touchPrivateSession(eventName), { passive: true });
  });
  window.addEventListener('mousemove', () => touchPrivateSession('mousemove'), { passive: true });
  window.addEventListener('focus', evaluatePrivateSessionExpiry);
  window.addEventListener('pageshow', evaluatePrivateSessionExpiry);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible'){
      evaluatePrivateSessionExpiry();
    }
  });

  if(privateForm){
    privateForm.addEventListener('submit', async event => {
      event.preventDefault();
      if(!privatePassword) return;

      const password = privatePassword.value.trim();
      if(!password) return;

      if(privateSubmit){
        privateSubmit.disabled = true;
        privateSubmit.textContent = PRIVATE_UI_COPY[currentLang].modalLoading;
      }

      if(privateError){
        privateError.textContent = '';
        delete privateError.dataset.locked;
      }

      try {
        await unlockPrivateMode(password);
      } catch {
        if(privateError){
          privateError.textContent = PRIVATE_UI_COPY[currentLang].modalError;
          privateError.dataset.locked = 'true';
        }
      } finally {
        if(privateSubmit){
          privateSubmit.disabled = false;
          privateSubmit.textContent = getBaseTranslation('private.modal.submit', currentLang);
        }
      }
    });
  }

  if(privatePassword && privatePasswordToggle){
    privatePasswordToggle.addEventListener('click', () => {
      privatePassword.type = privatePassword.type === 'password' ? 'text' : 'password';
      updatePrivateModalUI();
      privatePassword.focus();
    });
  }

  refreshPrivateUI();
}

function setupI18nUI(){
  const toggleBtn = document.getElementById('langToggle');
  if(toggleBtn) toggleBtn.addEventListener('click', toggleLang);
  initI18n();
  setupPrivateUI();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', setupI18nUI, { once: true });
} else {
  setupI18nUI();
}

// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if(menuBtn && navLinks){
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
}
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click', () => navLinks?.classList.remove('open'));
});

// Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if(scrollProgress) scrollProgress.style.width = progress + '%';
}

// Active Navigation
const navAnchors = document.querySelectorAll('[data-nav]');
const sections = [];
navAnchors.forEach(a => {
  const id = a.getAttribute('href').replace('#','');
  const el = document.getElementById(id);
  if(el) sections.push({el, link: a});
});

function updateActiveNav(){
  const scrollY = window.scrollY + 120;
  let current = null;
  sections.forEach(({el, link}) => {
    if(el.offsetTop <= scrollY){
      current = link;
    }
  });
  navAnchors.forEach(a => a.classList.remove('active'));
  if(current) current.classList.add('active');
}

// Back to Top
const backToTop = document.getElementById('backToTop');
function updateBackToTop(){
  if(!backToTop) return;
  if(window.scrollY > 500){
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}
if(backToTop){
  backToTop.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
}

// Scroll Reveal (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.1, rootMargin: '0px 0px -40px 0px'});
revealElements.forEach(el => revealObserver.observe(el));

// Combined scroll handler (throttled)
let ticking = false;
function onScroll(){
  if(!ticking){
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateActiveNav();
      updateBackToTop();
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, {passive: true});

// Init
updateScrollProgress();
updateActiveNav();

// ════════════════════════════════════════
// ★ Custom Cursor + Glow Trail
// ════════════════════════════════════════
const cursor = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

if(cursor && cursorGlow && window.matchMedia('(pointer:fine)').matches){
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateGlow(){
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  const interactives = document.querySelectorAll('a, button, .btn, .card, .project-card, .blog-card, .stat');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

// ════════════════════════════════════════
// ★ 3D Tilt Cards
// ════════════════════════════════════════
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    card.style.transition = 'transform .5s cubic-bezier(.25,.46,.45,.94)';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .1s ease-out';
  });
});

// ════════════════════════════════════════
// ★ Magnetic Buttons
// ════════════════════════════════════════
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});

// ════════════════════════════════════════
// ★ Stat Cards — Mouse Glow Position
// ════════════════════════════════════════
document.querySelectorAll('.stat').forEach(stat => {
  stat.addEventListener('mousemove', e => {
    const rect = stat.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    stat.style.setProperty('--mx', mx + '%');
    stat.style.setProperty('--my', my + '%');
  });
});

// ════════════════════════════════════════
// ★ Hero Particle Canvas
// ════════════════════════════════════════
const heroCanvas = document.getElementById('heroParticles');
if(heroCanvas){
  const ctx = heroCanvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 50;

  function resizeCanvas(){
    const hero = heroCanvas.parentElement;
    heroCanvas.width = hero.offsetWidth;
    heroCanvas.height = hero.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle{
    constructor(){this.reset()}
    reset(){
      this.x = Math.random() * heroCanvas.width;
      this.y = Math.random() * heroCanvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeDir = Math.random() > 0.5 ? 1 : -1;
    }
    update(){
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.fadeDir * 0.003;
      if(this.opacity > 0.6) this.fadeDir = -1;
      if(this.opacity < 0.05) this.fadeDir = 1;
      if(this.x < -10 || this.x > heroCanvas.width + 10 || this.y < -10 || this.y > heroCanvas.height + 10){
        this.reset();
      }
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(217,177,111,${this.opacity})`;
      ctx.fill();
    }
  }

  for(let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections(){
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 120){
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(217,177,111,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles(){
    ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ════════════════════════════════════════
// ★ Parallax Scroll
// ════════════════════════════════════════
const parallaxElements = document.querySelectorAll('.section-number, .hero-glow, .hero-logo');
function updateParallax(){
  parallaxElements.forEach(el => {
    const speed = el.classList.contains('hero-glow') ? 0.15
                : el.classList.contains('hero-logo') ? 0.04
                : 0.06;
    const rect = el.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
}
window.addEventListener('scroll', () => {
  requestAnimationFrame(updateParallax);
}, {passive: true});

// ════════════════════════════════════════
// ★ Smooth Nav Background on Scroll
// ════════════════════════════════════════
const nav = document.querySelector('.nav');
function updateNavBg(){
  if(!nav) return;
  if(window.scrollY > 60){
    nav.style.background = 'rgba(9,11,17,.85)';
    nav.style.borderBottomColor = 'rgba(217,177,111,.08)';
  } else {
    nav.style.background = 'rgba(9,11,17,.58)';
    nav.style.borderBottomColor = 'rgba(255,255,255,.06)';
  }
}
window.addEventListener('scroll', () => requestAnimationFrame(updateNavBg), {passive: true});
updateNavBg();
