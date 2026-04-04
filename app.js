
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

  // Smooth glow follow
  function animateGlow(){
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // Enlarge cursor on interactive elements
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

  // Draw connections between close particles
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
// ★ Parallax Scroll — Subtle depth layers
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
// ★ Typewriter effect on lead paragraph
// ════════════════════════════════════════
const heroLead = document.querySelector('.hero .lead');
if(heroLead){
  const fullText = heroLead.textContent.trim();
  heroLead.textContent = '';
  heroLead.style.visibility = 'visible';
  let charIdx = 0;
  const typeSpeed = 30;

  function typeChar(){
    if(charIdx < fullText.length){
      heroLead.textContent += fullText[charIdx];
      charIdx++;
      setTimeout(typeChar, typeSpeed);
    }
  }

  // Start typing after a brief delay once page loads
  setTimeout(typeChar, 800);
}

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
