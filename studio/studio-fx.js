/* ==========================================================
   Studio FX — aurora canvas, cursor spotlight, tilt,
   text reveal, ripple, dashboard count-up.
   Pure visual layer; does not touch studio.js state.
   ========================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Aurora canvas ---------- */
function initAurora() {
  const canvas = document.querySelector('.studio-aurora');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');

  const blobs = [
    { x: 0.18, y: 0.22, r: 380, hue: [217, 177, 111], a: 0.22, dx: 0.00012, dy: 0.00008 },
    { x: 0.82, y: 0.08, r: 340, hue: [240, 220, 200], a: 0.12, dx: -0.00009, dy: 0.00011 },
    { x: 0.72, y: 0.78, r: 460, hue: [180, 140, 90], a: 0.18, dx: -0.00007, dy: -0.00013 },
    { x: 0.28, y: 0.86, r: 300, hue: [255, 230, 180], a: 0.10, dx: 0.00010, dy: -0.00010 },
  ];

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let t0 = performance.now();
  function frame(t) {
    const dt = t - t0; t0 = t;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      b.x += b.dx * dt;
      b.y += b.dy * dt;
      if (b.x < -0.1 || b.x > 1.1) b.dx *= -1;
      if (b.y < -0.1 || b.y > 1.1) b.dy *= -1;
      const cx = b.x * w, cy = b.y * h;
      const wobble = Math.sin(t * 0.00035 + b.x * 6) * 18;
      const rr = b.r + wobble;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, `rgba(${b.hue[0]},${b.hue[1]},${b.hue[2]},${b.a})`);
      g.addColorStop(0.55, `rgba(${b.hue[0]},${b.hue[1]},${b.hue[2]},${b.a * 0.25})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- 2. Cursor spotlight ---------- */
function initSpotlight() {
  const el = document.querySelector('.studio-spotlight');
  if (!el || reduceMotion) return;
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let x = tx, y = ty;

  document.body.classList.add('fx-ready');

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function loop() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ---------- 3. Tilt on [data-tilt] ---------- */
function initTilt() {
  if (reduceMotion) return;
  const targets = document.querySelectorAll('[data-tilt]');
  targets.forEach((el) => {
    let rect = null;
    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onMove = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-py * 6).toFixed(2);
      const ry = (px * 8).toFixed(2);
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    };
    const onLeave = () => {
      rect = null;
      el.style.transform = '';
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });
}

/* ---------- 4. Text reveal (character by character) ---------- */
function initReveal() {
  const nodes = document.querySelectorAll('[data-reveal-text]');
  nodes.forEach((node) => {
    const text = node.textContent;
    node.textContent = '';
    const frag = document.createDocumentFragment();
    let i = 0;
    for (const ch of text) {
      if (ch === ' ') {
        const sp = document.createElement('span');
        sp.className = 'rv-space';
        frag.appendChild(sp);
      } else {
        const span = document.createElement('span');
        span.className = 'rv-char';
        span.textContent = ch;
        span.style.setProperty('--rv-delay', `${i * 0.035}s`);
        frag.appendChild(span);
        i++;
      }
    }
    node.appendChild(frag);
  });
}

/* ---------- 5. Button ripple ---------- */
function initRipple() {
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.magnetic');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const ripple = document.createElement('span');
    ripple.className = 'fx-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });
}

/* ---------- 6. Count-up for dashboard numbers ---------- */
function initCountUp() {
  if (reduceMotion) return;
  const seen = new WeakSet();
  const animate = (el) => {
    if (seen.has(el)) return;
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d[\d,]*)(.*)$/);
    if (!match) return;
    seen.add(el);
    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2] || '';
    if (!Number.isFinite(target) || target <= 0) return;
    const duration = 900;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Observe dashboard panel for newly inserted stats.
  const panel = document.getElementById('studioDashboardPanel');
  if (!panel) return;
  const scan = () => panel.querySelectorAll('.studio-stat strong').forEach(animate);
  const mo = new MutationObserver(scan);
  mo.observe(panel, { childList: true, subtree: true });
  scan();
}

/* ---------- boot ---------- */
function boot() {
  initAurora();
  initSpotlight();
  initTilt();
  initReveal();
  initRipple();
  initCountUp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
