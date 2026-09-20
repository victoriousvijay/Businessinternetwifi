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
    const medias = Array.from(document.querySelectorAll('.fcard-media'));
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY, vh = innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
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
  const SEL = '.fcard, .plan, .step-card, .info-card';
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
