
// ════════════════════════════════════════
// ★ i18n — Language Toggle System
// ════════════════════════════════════════
const I18N_EN = {
  // Hero
  'hero.lead': "I'm Jason Liao ([private]). I study Mechanical Engineering with a focus on mathematics, control systems, and robotics. I enjoy theoretical derivation, and I love turning abstract models step by step into systems that can be verified, implemented, and put to real use. I've always believed that truly powerful technology isn't just about computing or building — it must also be understood, shared, and ultimately make a difference in the world.",

  // News
  'news.1': "Ongoing hexapod robot RHex control research at [private-lab]",
  'news.2': "Comparative experiments: Reinforcement Learning vs. Classical Control in progress",
  'news.3': "Mechanical Engineering / Double Major in Civil Eng. / Minor in Mathematics",

  // Portrait
  'portrait.title': "Jason Liao",

  // About
  'about.h2': "Beyond convention,<br>guided by conviction.",
  'about.p1': "I'm from Taiwan, currently studying and conducting research in engineering and mathematical sciences at [private-affiliation].",
  'about.p2': "I love derivation, and I love transforming abstract models into systems that can be verified, simulated, and deployed. From fluid mechanics and thermodynamics to applied mathematics, control theory, robotics, and reinforcement learning — I've been searching for a path where the theories I truly care about can land in engineering and become something useful to the world.",
  'about.stat1': "[private-affiliation]",
  'about.stat2': "Mechanical Engineering Major",
  'about.stat3': "Civil Eng. Double Major · Math Minor",
  'about.stat4': "Hexapod Robot Control Research",
  'about.profile.eyebrow': "Profile",
  'about.profile.title': "Jason Liao",
  'about.list.1.title': "Academic Background",
  'about.list.1.desc': "Department of Mechanical Engineering, [private-affiliation], with coursework in Civil Engineering and Mathematics.",
  'about.list.2.title': "Current Direction",
  'about.list.2.desc': "Conducting research at [private-lab] on hexapod robot control, focusing on comparative analysis of reinforcement learning and classical control methods.",
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
  'about.tl.3.p': "I'm currently doing research at NTU's Bio-inspired Robotics Lab, primarily working on hexapod robot RHex control. The core question right now is whether reinforcement learning can outperform classical control in certain scenarios — in stability, adaptability, and overall effectiveness. What I'm doing is working through this question step by step, rigorously and thoroughly. Beyond that, I maintain a strong interest in thermofluids and cross-disciplinary integration, because I deeply value the feeling of theory and practice truly coming together.",

  // Background
  'bg.h2': "Education",
  'bg.lead': "Along the way, I've been fortunate to be part of several places that shaped who I am. They didn't just form my academic background — they gradually shaped how I see the world, approach research, and understand myself.",
  'bg.tl.1.year': "Elementary",
  'bg.tl.1.p': "[private-school]",
  'bg.tl.2.year': "Middle School",
  'bg.tl.2.p': "[private-school]",
  'bg.tl.3.year': "High School",
  'bg.tl.3.p': "[private-school]<br>[private-academic-detail]",
  'bg.tl.4.year': "University",
  'bg.tl.4.p': "[private-affiliation]<br>Major in Mechanical Engineering<br>Double Major in Civil Engineering<br>Minor in Mathematics",

  // Focus
  'focus.h2': "What I'm Working On",
  'focus.card1.title': "Current Focus",
  'focus.list.1.title': "Hexapod Robot Control",
  'focus.list.1.desc': "Currently researching hexapod robot RHex control at [private-lab]. The main direction is using reinforcement learning to control the robot and comparing it with classical control methods — seeking better solutions in stability, adaptability, and effectiveness.",
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
  'research.pub1.desc': "I'm currently conducting control research on the hexapod robot RHex at NTU's Bio-inspired Robotics Lab. The core question is whether reinforcement learning can achieve more stable, effective, and adaptive control than classical methods in certain scenarios. This is my primary focus right now.",
  'research.pub2.title': "From Mathematics to Engineering Foundations",
  'research.pub2.desc': "While my research focus is now on control and robotics, my foundation was built gradually through mathematics, physics, engineering mathematics, linear algebra, differential equations, fluid mechanics, thermodynamics, and mechanics. These aren't just background — they're the methods I rely on to stand firm in my research.",

  // Projects
  'projects.card1.p': "Currently conducting hexapod robot RHex control research at [private-lab]. The focus is on comparing reinforcement learning with classical control to achieve clearer and more rigorous results in stability, adaptability, and overall effectiveness.",
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
  'contact.h2': "Get in Touch",
  'contact.desc': "Whether it's academic exchange, research collaboration, robot control, mathematical modeling, or just chatting about baseball — feel free to reach out.",
  'contact.location.label': "Location",
  'contact.location.value': "Taipei / [private-affiliation]",
  'contact.lang.label': "Languages",
  'contact.lang.value': "Traditional Chinese / English",

  // Footer
  'footer.motto': "Stand on reason, walk with passion.",
  'footer.brand': "Jason Liao",
};

// Store original Chinese content
const i18nOriginal = new Map();
const i18nMetaOriginal = {};
let currentLang = localStorage.getItem('site-lang') || 'zh';
let heroLeadTypeTimer = null;
let heroLeadHasAnimated = false;

// Merge main translations with post-page translations (if any)
function getTranslations(){
  const merged = Object.assign({}, I18N_EN);
  if(typeof PAGE_I18N_EN !== 'undefined') Object.assign(merged, PAGE_I18N_EN);
  if(typeof POST_I18N_EN !== 'undefined') Object.assign(merged, POST_I18N_EN);
  return merged;
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
  // Collect all translatable elements and store their original content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    i18nOriginal.set(el.getAttribute('data-i18n'), el.textContent);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    i18nOriginal.set(el.getAttribute('data-i18n-html'), el.innerHTML);
  });

  // Apply saved language
  if(currentLang === 'en') applyLang('en');
  else applyMeta('zh');
  updateLangToggleUI();

  if(document.querySelector('.hero .lead[data-i18n]')){
    renderHeroLead(true);
  }
}

function applyLang(lang){
  currentLang = lang;
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  localStorage.setItem('site-lang', lang);

  const translations = getTranslations();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = lang === 'en' ? (translations[key] || i18nOriginal.get(key)) : i18nOriginal.get(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = lang === 'en' ? (translations[key] || i18nOriginal.get(key)) : i18nOriginal.get(key);
  });

  applyMeta(lang);
  updateLangToggleUI();

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

// Bind toggle button
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('langToggle');
  if(toggleBtn) toggleBtn.addEventListener('click', toggleLang);
  initI18n();
});

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
