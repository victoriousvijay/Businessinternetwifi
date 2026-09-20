/* Page effects: staggered reveals, revealed section headings and a gentle 3D card tilt. */
(function () {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // section headings fade in, and cards in a grid arrive one after another
  document.querySelectorAll('.section-head').forEach((el) => { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });
  document.querySelectorAll('.cards-3, .steps-3, .hero-links, .viz-list, .info-stack').forEach((grid) => {
    Array.from(grid.children).forEach((c, i) => {
      if (c.hasAttribute('data-reveal') && !c.style.getPropertyValue('--d')) c.style.setProperty('--d', (i % 3) * 0.08 + 's');
    });
  });

  if (!fine || reduced) return;
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
