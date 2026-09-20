/* Page effects: scroll animations, staggered reveals, count-up numbers and a gentle 3D card tilt. */
(function () {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal setup (runs before main.js starts observing) ---------- */
  document.querySelectorAll('.section-head').forEach((el) => { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });
  const variant = (sel, v) => document.querySelectorAll(sel).forEach((el) => { if (el.hasAttribute('data-reveal') && !el.getAttribute('data-reveal')) el.setAttribute('data-reveal', v); });
  variant('.cards-3 > .fcard, .plans-grid > .plan, .viz, .biz, .cta, .table-wrap, .steps-3 > .step-card', 'zoom');
  document.querySelectorAll('.cards-3, .steps-3, .hero-links, .viz-list, .info-stack').forEach((grid) => {
    Array.from(grid.children).forEach((c, i) => {
      if (c.hasAttribute('data-reveal') && !c.style.getPropertyValue('--d')) c.style.setProperty('--d', (i % 3) * 0.1 + 's');
    });
  });

  /* ---------- count-up for hero / landing stat numbers ---------- */
  document.querySelectorAll('.hero-stats .stat b, .lp-stats b').forEach((b) => {
    const m = /^(\$?)(\d[\d,]*\.?\d*)(.*)$/.exec(b.textContent.trim());
    if (!m || /^[\d\/]/.test(m[3]) || m[3].includes('/')) return;
    const n = parseFloat(m[2].replace(/,/g, ''));
    if (!n) return;
    b.setAttribute('data-count', String(n));
    if (m[1]) b.setAttribute('data-prefix', m[1]);
    if (m[3]) b.setAttribute('data-suffix', m[3]);
  });

  /* safety net: never leave content hidden if the observer is slow to fire */
  window.addEventListener('load', () => setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.1 && r.bottom > 0) el.classList.add('in');
    });
  }, 1800));

  if (reduced) return;

  /* ---------- scroll progress bar + parallax ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.className = 'scroll-bar';
    document.body.appendChild(bar);

    const hero = document.querySelector('.hero, .lp-hero');
    const heroBody = hero && (hero.querySelector('.hero-grid') || hero.querySelector(':scope > .container'));
    const galaxy = hero && hero.querySelector('.galaxy');
    const medias = Array.from(document.querySelectorAll('.fcard-media'));
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY, vh = innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

      if (hero && y < hero.offsetHeight + 80) {
        const p = Math.min(1, y / hero.offsetHeight);
        if (heroBody) { heroBody.style.transform = 'translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0)'; heroBody.style.opacity = String(1 - p * 0.55); }
        if (galaxy) galaxy.style.transform = 'translate3d(0,' + (y * 0.32).toFixed(1) + 'px,0)';
      }
      for (const m of medias) {
        const r = m.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) continue;
        m.style.setProperty('--py', (((r.top + r.height / 2) - vh / 2) * -0.06).toFixed(1) + 'px');
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* ---------- gentle 3D tilt on cards (mouse devices) ---------- */
  if (!fine) return;
  const SEL = '.fcard, .plan, .step-card, .hl-card, .info-card';
  let cur = null;
  const reset = (el) => { el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s, border-color 0.2s'; el.style.transform = ''; };
  document.addEventListener('mousemove', (e) => {
    const el = e.target.closest && e.target.closest(SEL);
    if (cur && cur !== el) reset(cur);
    cur = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform 0.12s ease-out, box-shadow 0.2s, border-color 0.2s';
    el.style.transform = 'perspective(900px) rotateX(' + (-py * 6) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-4px)';
  }, { passive: true });
  document.addEventListener('mouseleave', () => { if (cur) reset(cur); cur = null; });
})();
