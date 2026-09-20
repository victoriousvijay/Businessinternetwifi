/* ==========================================================================
   3D cursor
   - a shaded sphere that tracks the pointer and stretches along its direction of travel
   - a trailing ring that tilts in perspective with the pointer's velocity
   - the ring grows and fills over links and buttons, a pulse plays on click
   - colours switch automatically on dark sections (hero, CTA, footer)
   Fine pointers only; disabled for touch and for reduced motion.
   ========================================================================== */
(function () {
  'use strict';
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const stage = document.createElement('div');
  stage.className = 'cursor-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="cursor-ring"><i></i></div><div class="cursor-orb"></div>';
  const ring = stage.firstChild, orb = stage.lastChild;

  const CLICKABLE = 'a, button, select, summary, label, input[type=range], input[type=checkbox], input[type=radio], [role=button], .faq-q';
  const TEXT = 'input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=submit]), textarea';
  const DARK = '.hero, .lp-hero, .cta, .site-footer, .hl-card, .tier-card, .plan.featured';

  let mx = -100, my = -100, rx = -100, ry = -100, ox = -100, oy = -100;
  let tiltX = 0, tiltY = 0, ringS = 1, orbS = 1, stretch = 1, angle = 0;
  let shown = false, hover = false, down = false, text = false;

  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(stage));

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!shown) { shown = true; ox = rx = mx; oy = ry = my; root.classList.add('cursor-on'); }
    const t = e.target;
    hover = !!(t.closest && t.closest(CLICKABLE));
    text = !!(t.closest && t.closest(TEXT));
    stage.classList.toggle('on-dark', !!(t.closest && t.closest(DARK)));
    ring.classList.toggle('hover', hover);
  }, { passive: true });
  document.addEventListener('mouseleave', () => root.classList.remove('cursor-on'));
  document.addEventListener('mouseenter', () => shown && root.classList.add('cursor-on'));

  addEventListener('mousedown', () => {
    down = true;
    const p = document.createElement('div');
    p.className = 'cursor-pulse';
    p.style.left = mx + 'px'; p.style.top = my + 'px';
    stage.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  });
  addEventListener('mouseup', () => (down = false));
  root.classList.add('has-cursor');

  (function loop() {
    // orb follows tightly, ring lags behind
    const pox = ox, poy = oy;
    ox += (mx - ox) * 0.5; oy += (my - oy) * 0.5;
    const px = rx, py = ry;
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;

    // velocity drives the ring's 3D tilt and the orb's stretch
    const vx = rx - px, vy = ry - py;
    tiltX += (Math.max(-55, Math.min(55, -vy * 3.2)) - tiltX) * 0.2;
    tiltY += (Math.max(-55, Math.min(55, vx * 3.2)) - tiltY) * 0.2;
    const dx = ox - pox, dy = oy - poy, speed = Math.hypot(dx, dy);
    if (speed > 0.6) angle = Math.atan2(dy, dx);
    stretch += (1 + Math.min(speed * 0.045, 0.7) - stretch) * 0.25;

    ringS += ((text ? 0 : down ? 0.75 : hover ? 1.5 : 1) - ringS) * 0.18;
    orbS += ((text ? 0 : hover ? 0.5 : down ? 0.8 : 1) - orbS) * 0.22;

    ring.style.transform = `translate3d(${rx}px,${ry}px,0) perspective(320px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${ringS})`;
    orb.style.transform = `translate3d(${ox}px,${oy}px,0) rotate(${angle}rad) scale(${orbS * stretch},${orbS / Math.sqrt(stretch)})`;
    requestAnimationFrame(loop);
  })();
})();
