
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

// Skill Bar Animation
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('animated');
      skillObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.3});
skillFills.forEach(el => skillObserver.observe(el));

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
