/* ==========================================================================
   Page-specific behaviour: plans, visualiser, calculator,
   FAQ, availability checker, admin dashboard
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SITE;
  const { icon } = window.Icons;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = new URLSearchParams(location.search);

  /* ---------- plans ---------- */
  function planCard(p, i) {
    const tag = p.oldPrice ? 'ONLINE EXCLUSIVE PRICE' : 'FIRST-YEAR PRICE';
    return `
    <article class="plan ${p.featured ? 'featured' : ''}" data-reveal style="--d:${i * 0.1}s">
      ${p.featured ? '<span class="ribbon">MOST POPULAR</span>' : ''}
      <span class="plan-tier">${p.tier}</span>
      <h3>${p.label}</h3>
      <p class="plan-blurb">${p.blurb}</p>
      <div class="plan-speed" aria-hidden="true"><i style="--w:${Math.min(100, (p.speed / 1000) * 100)}%"></i></div>
      <div class="plan-price">
        ${p.oldPrice ? `<span class="was">$${p.oldPrice}</span>` : ''}
        <span class="now"><sup>$</sup>${p.price}</span>
        <span class="per"><b>/MO</b><span>FOR 1 YEAR</span></span>
      </div>
      <span class="plan-tag">${tag}</span>
      <ul>${p.perks.map((t) => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>
      <a class="btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block" href="/availability?plan=${p.id}">
        <span class="btn-label">Select Advisor Quote</span>${icon('arrow', 'arrow')}
      </a>
    </article>`;
  }
  function initPlans() {
    $$('[data-plans]').forEach((box) => { box.innerHTML = S.plans.map(planCard).join(''); });
  }

  /* ---------- speed visualiser ---------- */
  function initViz() {
    const r = $('#speedRange');
    if (!r) return;
    const steps = [50, 100, 250, 500, 1000, 2000];
    const out = $('#vizSpeed');
    const tiles = {
      streams: (s) => [Math.floor(s / 25), '4K streams at once', Math.min(100, (s / 25 / 80) * 100)],
      calls: (s) => [Math.floor(s / 4), 'HD video calls at once', Math.min(100, (s / 4 / 500) * 100)],
      gamers: (s) => [Math.floor(s / 15), 'online gamers at once', Math.min(100, (s / 15 / 133) * 100)],
      dl: (s) => {
        const sec = (50 * 8000) / s;
        const label = sec < 60 ? Math.round(sec) + ' sec' : Math.round(sec / 60) + ' min';
        return [label, '50 GB game download', Math.max(4, 100 - Math.min(96, (sec / 8000) * 100 * 2.2))];
      }
    };
    const update = () => {
      const v = +r.value, s = steps[v];
      r.style.setProperty('--p', (v / (steps.length - 1)) * 100 + '%');
      out.innerHTML = `${s >= 1000 ? s / 1000 : s}<small>${s >= 1000 ? 'Gbps' : 'Mbps'}</small>`;
      for (const k in tiles) {
        const el = $(`[data-use="${k}"]`); if (!el) continue;
        const [val, sub, pct] = tiles[k](s);
        $('b', el).textContent = val; $('small', el).textContent = sub; $('.bar i', el).style.width = pct + '%';
      }
      const rec = s <= 100 ? 'Solid for 1–3 people browsing and streaming.' : s <= 500 ? 'Great for busy households and remote work.' : 'Built for power users, creators and big families.';
      $('#vizRec').textContent = rec;
    };
    r.addEventListener('input', update);
    update();
  }

  /* ---------- savings calculator ---------- */
  function initCalc() {
    const bill = $('#billRange');
    if (!bill) return;
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const update = () => {
      const plan = S.plans.find((p) => p.id === ($('input[name="calcPlan"]:checked') || {}).value) || S.plans[1];
      const b = +bill.value;
      bill.style.setProperty('--p', ((b - 40) / 210) * 100 + '%');
      $('#billVal').textContent = money(b);
      const diff = b - plan.price;
      $('#saveMonthly').textContent = money(Math.max(0, diff));
      $('#saveBig').textContent = diff > 0 ? money(diff * 12) : '$0';
      $('#calcPlanName').textContent = plan.label;
      $('#calcPlanPrice').textContent = money(plan.price) + '/mo';
      $('#calcCurrent').textContent = money(b) + '/mo';
      $('#calcNote').textContent = diff > 0 ? 'estimated saved in your first year' : 'similar spend — but with faster, contract-free fiber';
    };
    bill.addEventListener('input', update);
    $$('input[name="calcPlan"]').forEach((i) => i.addEventListener('change', update));
    update();
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    const list = $('.faq-list');
    if (!list) return;
    const items = $$('.faq-item', list);
    items.forEach((it) => {
      const q = $('.faq-q', it);
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', () => {
        const open = !it.classList.contains('open');
        items.forEach((o) => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
      });
    });
    items[0]?.querySelector('.faq-q').click();
    const search = $('#faqSearch'), empty = $('.faq-empty');
    search?.addEventListener('input', () => {
      const v = search.value.trim().toLowerCase();
      let n = 0;
      items.forEach((it) => { const hit = !v || it.textContent.toLowerCase().includes(v); it.style.display = hit ? '' : 'none'; if (hit) n++; });
      empty.style.display = n ? 'none' : 'block';
    });
  }

  /* ---------- availability checker ---------- */
  function initAvail() {
    const form = $('#availForm');
    if (!form) return;
    const radar = $('.radar'), zip = $('#zip'), addr = $('#addr'), status = $('#scanStatus'), result = $('#result');
    const sel = $('.selected-plan'), planInput = $('#planField');
    const plan = S.plans.find((p) => p.id === qs.get('plan'));
    const setPlan = (p) => {
      if (!p) { sel.classList.remove('show'); planInput.value = ''; return; }
      $('span', sel).textContent = `${S.brand} — ${p.tier} (${p.label}) · $${p.price}/mo`;
      planInput.value = `${p.tier} – ${p.label} – $${p.price}/mo`;
      sel.classList.add('show');
    };
    setPlan(plan);
    $('button', sel)?.addEventListener('click', () => { setPlan(null); history.replaceState(null, '', location.pathname); });

    const validZip = (v) => /^[A-Za-z0-9][A-Za-z0-9 \-]{2,9}$/.test(v.trim());
    $$('.sample-zips button').forEach((b) => b.addEventListener('click', () => { zip.value = b.textContent; zip.dispatchEvent(new Event('input')); zip.focus(); }));
    zip.addEventListener('input', () => zip.closest('.field').classList.remove('err'));

    $('#locBtn')?.addEventListener('click', () => {
      const note = $('#locNote');
      if (!navigator.geolocation) { note.textContent = 'Location is not supported by this browser — please type your ZIP code.'; return; }
      note.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: la, longitude: lo } = pos.coords;
          addr.value = `GPS ${la.toFixed(4)}, ${lo.toFixed(4)}`;
          note.textContent = 'Location captured — now add your ZIP / postal code to continue.';
          zip.focus();
        },
        () => (note.textContent = 'Location permission denied. Please type your ZIP / postal code instead.'),
        { timeout: 8000 }
      );
    });

    const msgs = ['Pinging regional fiber grids…', 'Scanning cable & coax routes…', 'Locating 5G fixed-wireless nodes…', 'Matching promotions to your sector…'];
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = zip.closest('.field');
      if (!validZip(zip.value)) { f.classList.add('err'); zip.focus(); return; }
      const btn = $('button[type=submit]', form);
      btn.disabled = true; btn.classList.add('is-loading');
      result.classList.remove('show');
      radar.classList.remove('idle'); radar.classList.add('scanning');
      $$('.blip', radar).forEach((b) => b.classList.remove('show'));
      let i = 0; status.textContent = msgs[0];
      const iv = setInterval(() => (status.textContent = msgs[++i % msgs.length]), 700);
      setTimeout(() => {
        clearInterval(iv);
        radar.classList.remove('scanning'); radar.classList.add('idle');
        btn.disabled = false; btn.classList.remove('is-loading');
        status.textContent = 'Scan complete';
        $$('.blip', radar).forEach((b, k) => setTimeout(() => b.classList.add('show'), k * 220));
        $('#resZip').textContent = zip.value.trim().toUpperCase();
        $('#leadZip').value = zip.value.trim().toUpperCase();
        $('#leadAddr').value = addr.value.trim();
        $('#leadPlan').value = planInput.value;
        result.classList.add('show');
        setTimeout(() => scrollToEl(result, -110), 250);
      }, 2800);
    });
  }

  /* ---------- admin: advisory leads ---------- */
  function initAdmin() {
    const gate = $('#gate');
    if (!gate) return;
    const dash = $('#dash'), tbody = $('#leadRows'), err = $('#gateErr');
    let all = [];
    const fmt = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    const render = (rows) => {
      tbody.innerHTML = rows.length
        ? rows.map((l) => `<tr>
            <td>${esc(fmt(l.receivedAt))}</td><td><b>${esc(l.name)}</b><br><a href="mailto:${esc(l.email)}" style="color:var(--primary)">${esc(l.email)}</a><br>${esc(l.phone)}</td>
            <td>${esc(l.service)}${l.plan ? '<br><small style="color:var(--muted)">' + esc(l.plan) + '</small>' : ''}</td>
            <td>${esc(l.zip)}${l.address ? '<br><small style="color:var(--muted)">' + esc(l.address) + '</small>' : ''}</td>
            <td class="msg-cell">${esc(l.message)}</td><td>${esc(l.source)}</td></tr>`).join('')
        : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px">No enquiries found.</td></tr>';
    };
    async function load(key) {
      const res = await fetch('/api/leads', { headers: { 'x-admin-key': key } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Access denied');
      return data;
    }
    function show(data) {
      all = data.leads;
      gate.style.display = 'none'; dash.style.display = 'block';
      const day = Date.now() - 864e5, wk = Date.now() - 7 * 864e5;
      $('#stTotal').textContent = all.length;
      $('#stToday').textContent = all.filter((l) => +new Date(l.receivedAt) > day).length;
      $('#stWeek').textContent = all.filter((l) => +new Date(l.receivedAt) > wk).length;
      $('#mailWarn').style.display = data.emailConfigured ? 'none' : 'block';
      render(all);
    }
    $('#gateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const key = $('#adminKey').value.trim();
      const btn = $('button[type=submit]', e.target);
      err.textContent = ''; btn.classList.add('is-loading'); btn.disabled = true;
      try { const d = await load(key); sessionStorage.setItem('ak', key); show(d); }
      catch (ex) { err.textContent = ex.message; }
      btn.classList.remove('is-loading'); btn.disabled = false;
    });
    const saved = sessionStorage.getItem('ak');
    if (saved) load(saved).then(show).catch(() => sessionStorage.removeItem('ak'));
    $('#leadSearch')?.addEventListener('input', (e) => {
      const v = e.target.value.toLowerCase();
      render(all.filter((l) => JSON.stringify(l).toLowerCase().includes(v)));
    });
    $('#csvBtn')?.addEventListener('click', () => {
      const cols = ['receivedAt', 'name', 'email', 'phone', 'service', 'plan', 'zip', 'address', 'message', 'source'];
      const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      const csv = [cols.join(','), ...all.map((l) => cols.map((c) => q(l[c])).join(','))].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'leads.csv'; a.click();
    });
    $('#logoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('ak'); location.reload(); });
  }

  document.addEventListener('chrome:ready', () => {
    initPlans(); initViz(); initCalc(); initFaq(); initAvail(); initAdmin();
    // plans are injected after the reveal observer ran → observe them now
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$('[data-plans] [data-reveal]').forEach((el) => io.observe(el));
  });
})();
