/* ==========================================================================
   Core: shared layout (header/footer), theme, reveal, counters
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

  /* ---------- icons ---------- */
  const I = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="3"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    wifi: '<path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>',
    tv: '<rect width="20" height="14" x="2" y="4" rx="3"/><path d="M8 21h8M12 18v3"/>',
    voip: '<path d="M4 15a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-1v-6h3M4 15v3a2 2 0 0 0 2 2h1v-6H4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/>',
    rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1ZM12 15l-3-3a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2ZM9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12Z"/>',
    bot: '<rect width="18" height="12" x="3" y="8" rx="4"/><path d="M12 8V4M9 13v1.5M15 13v1.5M1 13v3M23 13v3"/><circle cx="12" cy="3" r="1" fill="currentColor"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    game: '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2L1.6 15a3 3 0 0 0 5 2.6L8 16h8l1.4 1.6a3 3 0 0 0 5-2.6l-1.2-6.8A4 4 0 0 0 17.3 5Z"/>',
    video: '<rect width="15" height="12" x="2" y="6" rx="3"/><path d="m17 10 5-3v10l-5-3"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.6 12 3.5 3.5 0 0 0 6 19h11.5Z"/>',
    home: '<path d="m3 11 9-8 9 8M5 9.5V21h14V9.5"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    dollar: '<path d="M12 2v20M17 6.5C16 5 14.2 4 12 4c-2.8 0-5 1.4-5 3.6 0 5 10 2.6 10 8 0 2.2-2.2 4.4-5 4.4-2.4 0-4.4-1-5.5-2.6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>'
  };
  const icon = (n, cls = '', extra = '') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${I[n] || ''}</svg>`;
  window.Icons = { I, icon };

  /* ---------- shared layout ---------- */
  const NAV = [
    ['Home', '/'],
    ['Plans', '/plans'],
    ['Check Availability', '/availability'],
    ['Services', '/services'],
    ['How It Works', '/how-it-works'],
    ['FAQ', '/faq'],
    ['Contact', '/contact']
  ];
  const here = (location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/');

  function buildChrome() {
    const links = NAV.map(([t, h]) => `<a href="${h}" class="${h === here ? 'active' : ''}">${t}</a>`).join('');
    const landing = document.body.hasAttribute('data-landing');
    const header = landing ? `
    <header class="site-header" id="siteHeader">
      <div class="container nav">
        <a href="/" class="logo" aria-label="${S.brand} home">
          <span class="logo-mark">${icon('wifi')}</span>
          <span class="logo-text"><b>${S.brand}</b><small>${S.brandSuffix}</small></span>
        </a>
        <div class="nav-actions">
          <a href="tel:${S.phoneHref}" class="btn btn-primary btn-sm">${icon('phone')}<span class="lg">Call ${S.phone}</span><span class="sm">Call now</span></a>
        </div>
      </div>
    </header>` : `
    <header class="site-header" id="siteHeader">
      <div class="container nav">
        <a href="/" class="logo" aria-label="${S.brand} home">
          <span class="logo-mark">${icon('wifi')}</span>
          <span class="logo-text"><b>${S.brand}</b><small>${S.brandSuffix}</small></span>
        </a>
        <nav class="nav-links" id="navLinks" aria-label="Primary"><span class="nav-pill"></span>${links}</nav>
        <div class="nav-actions">
          <button class="icon-btn theme-toggle" id="themeToggle" aria-label="Toggle light/dark theme">${icon('moon', 'moon')}${icon('sun', 'sun')}</button>
          <a href="tel:${S.phoneHref}" class="btn btn-primary btn-sm">${icon('phone')}<span>${S.phone}</span></a>
          <button class="icon-btn burger" id="burger" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div>
    </header>`;
    const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="foot-grid">
          <div>
            <a href="/" class="logo"><span class="logo-mark">${icon('wifi')}</span><span class="logo-text"><b>${S.brand}</b><small>${S.brandSuffix}</small></span></a>
            <p>${S.legalName} is an independent telecom advisory platform. We compare regional networks to help homes and businesses find the best connectivity package.</p>
          </div>
          <div>
            <h4>CLIENT LINKS</h4>
            <div class="foot-links">
              <a href="/fiber-internet">Fiber Internet</a><a href="/business-fiber">Business Fiber</a>
              <a href="/plans">Residential Plans</a><a href="/availability">ZIP Availability Checker</a>
              <a href="/how-it-works">How It Works</a><a href="/faq">FAQs</a><a href="/contact">Contact Us</a>
            </div>
          </div>
          <div>
            <h4>COMPANY CONTACT</h4>
            <div class="foot-contact">
              <b>${S.legalName}</b>
              <span>${S.addressLine1}<br>${S.addressLine2}</span>
              <a href="mailto:${S.email}">${S.email}</a>
              <a href="tel:${S.phoneHref}">${S.phone}</a>
            </div>
          </div>
        </div>
        <p class="disclaimer"><b>Advisory Disclaimer:</b> ${S.legalName} is a privately owned and operated marketing platform. All trademarks, logos and brand names of national and regional telecom carriers are the property of their respective owners. Mention of services does not imply direct carrier endorsement, affiliation or sponsorship. Actual connection speeds, latencies and promotion availability vary by street address and technical parameters. All prices, terms, contract structures and promo details are subject to final credit approval and carrier policy changes.</p>
        <div class="foot-bottom">
          <span>© ${S.year} ${S.legalName}. All rights reserved.</span>
          <nav><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a><a href="/faq">FAQs</a><a href="/disclosures">Disclosures</a></nav>
        </div>
      </div>
    </footer>`;
    const h = $('#site-header'), f = $('#site-footer');
    if (h) h.outerHTML = header;
    if (f) f.outerHTML = footer;
    $$('[data-site]').forEach((el) => {
      const v = S[el.dataset.site];
      if (v != null) el.textContent = v;
    });
    $$('[data-site-href]').forEach((el) => {
      const spec = el.dataset.siteHref, i = spec.indexOf(':');
      el.setAttribute('href', spec.slice(i + 1) + (S[spec.slice(0, i)] || ''));
    });
    $$('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, el.dataset.iconClass || '')));
  }

  /* ---------- theme ---------- */
  function initTheme() {
    const root = document.documentElement;
    $('#themeToggle')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
      window.dispatchEvent(new Event('themechange'));
    });
  }

  /* ---------- header / nav ---------- */
  function initHeader() {
    const header = $('#siteHeader');
    if (!header) return;
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      header.classList.toggle('scrolled', y > 24);
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!$('#navLinks')) return;
    const nav = $('#navLinks'), pill = $('.nav-pill', nav), burger = $('#burger');
    const movePill = (el) => {
      if (!el || innerWidth <= 960) return;
      pill.style.opacity = 1;
      pill.style.width = el.offsetWidth + 'px';
      pill.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    const active = $('a.active', nav);
    const rest = () => (active ? movePill(active) : (pill.style.opacity = 0));
    $$('a', nav).forEach((a) => a.addEventListener('mouseenter', () => movePill(a)));
    nav.addEventListener('mouseleave', rest);
    addEventListener('resize', rest);
    setTimeout(rest, 60);

    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = icon(open ? 'x' : 'menu');
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------- anchor scrolling (native smooth scroll) ---------- */
  window.scrollToEl = (el, off = -90) => {
    if (typeof el === 'string') el = $(el);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ---------- split text + reveal + counters ---------- */
  function initReveal() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('in');
        io.unobserve(el);
        $$('[data-count]', el).concat(el.matches('[data-count]') ? [el] : []).forEach(countUp);
      }),
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );
    $$('[data-reveal], .plan, .step, [data-count]').forEach((el) => io.observe(el));
    setTimeout(() => document.documentElement.classList.add('is-ready'), 50);
  }
  function countUp(el) {
    if (el.__done) return; el.__done = true;
    const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const fmt = (v) => pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suf;
    if (reduced) return (el.textContent = fmt(end));
    const t0 = performance.now(), dur = 1800;
    (function tick(t) {
      const p = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- timeline rail ---------- */
  function initTimeline() {
    const tl = $('.timeline');
    if (!tl) return;
    const rail = $('.rail', tl);
    const upd = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / (r.height - 40)));
      rail.style.height = p * (r.height - 40) + 'px';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- in-page anchors ---------- */
  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) { e.preventDefault(); scrollToEl(href); return; }
      let url; try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash) { e.preventDefault(); scrollToEl(url.hash); }
      $('#navLinks')?.classList.remove('open');
    });
    if (location.hash) setTimeout(() => scrollToEl(location.hash), 300);
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    buildChrome();
    initTheme();
    initHeader();
    initReveal();
    initTimeline();
    initAnchors();
    document.dispatchEvent(new Event('chrome:ready'));
  });
})();
