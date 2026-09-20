/* ==========================================================================
   AI-style advisor chat widget (rule-based, no API key required).
   Anything it can't answer is turned into an email to the company.
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SITE;
  const { icon } = window.Icons;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const [p1, p2, p3] = S.plans;

  const KB = [
    { k: /(cheap|lowest|budget|afford|least)/, a: () => `The most affordable option is <b>${p1.tier}</b> — ${p1.label} for just <b>$${p1.price}/mo for 1 year</b>, no contracts.<ul><li>${p1.perks[1]}</li><li>${p1.perks[2]}</li></ul>`, go: true },
    { k: /(best|fastest|gig|gaming|game|stream|4k|fiber)/, a: () => `For the best all-round fiber experience, take <b>${p3.tier}</b> — ${p3.label} at <b>$${p3.price}/mo</b> (was $${p3.oldPrice}) with Advanced WiFi included. It's built for gaming, 4K streaming and working from home at once.`, go: true },
    { k: /(business|office|wfh|remote|work from|commercial|enterprise|static ip|sla)/, a: () => `For remote workers, <b>${p2.tier}</b> (${p2.label}, $${p2.price}/mo) is the sweet spot. For offices we arrange <b>dedicated fiber, static IP blocks, 99.9% uptime SLAs</b> and priority support — tell me a bit about your site and an advisor will quote you.`, go: true },
    { k: /(bundle|tv|cable|triple|phone|voice|voip|save|saving|combine)/, a: () => `Bundling Internet + TV + phone into one subscription can cut monthly spend by up to <b>40%</b>. Try our <a href="/plans#calculator">savings calculator</a>, or leave your details and an advisor will build a custom bundle.`, go: true },
    { k: /(install|setup|set up|activation|how long|technician|self)/, a: () => `Where lines already exist, a <b>self-install kit</b> arrives in 2–3 business days and takes under 15 minutes. If a technician is needed, appointments are typically scheduled within <b>48–72 hours</b>.` },
    { k: /(contract|commit|cancel|term)/, a: () => `Our residential fiber plans are <b>no-contract</b>. Some commercial connections use 1–2 year agreements in exchange for fixed pricing — we clearly show contract status on every plan.` },
    { k: /(hidden|fee|markup|extra charge|price|cost|billing)/, a: () => `No hidden fees or advisory markups — what we quote matches your monthly bill. Final pricing depends on credit approval and carrier terms.` },
    { k: /(speed|how fast|mbps|how much)/, a: () => `Quick guide: <b>100 Mbps</b> suits 1–3 people, <b>500 Mbps</b> suits busy homes & remote work, <b>1 Gig</b> suits power users and big families. Try the <a href="/#speed">speed visualiser</a> on the home page.` },
    { k: /(zip|availab|coverage|address|area|my location)/, a: () => `You can check your address on our <a href="/availability">availability page</a> — enter your ZIP / postal code and an advisor will confirm exact options for your street.`, },
    { k: /(call|phone|number|contact|email|reach|human|agent|person|talk)/, a: () => `You can call <b><a href="tel:${S.phoneHref}">${S.phone}</a></b> or email <a href="mailto:${S.email}">${S.email}</a>. Or leave a message right here and we'll email you back.`, form: true },
    { k: /^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/, a: () => `Hello! 👋 Ask me about plans, speeds, bundles or installation — or tell me what you need and I'll point you to the best fit.` },
    { k: /(thank|thanks|great|awesome)/, a: () => `You're welcome! Anything else I can help with?` }
  ];

  const QUICK = ['Which plan has the best fiber internet?', 'What is the cheapest plan?', 'Recommend a plan for remote work', 'How can I save by bundling?'];

  function build() {
    document.body.insertAdjacentHTML('beforeend', `
      <button class="adv-fab" id="advFab" aria-label="Open AI advisor">${icon('chat')}<span>AI Advisor</span></button>
      <section class="adv-panel" id="advPanel" role="dialog" aria-label="Advisor chat" aria-hidden="true">
        <div class="adv-head"><span class="av">${icon('bot')}</span><div><b>${S.brand} Advisor</b><small>ONLINE • ADVISOR PORTAL</small></div><button class="icon-btn x" id="advClose" aria-label="Close chat">${icon('x')}</button></div>
        <div class="adv-body" id="advBody"></div>
        <form class="adv-input" id="advForm" autocomplete="off"><input type="text" id="advText" placeholder="Ask anything about internet plans…" aria-label="Message" maxlength="300"><button class="send" type="submit" aria-label="Send">${icon('send')}</button></form>
        <div class="adv-foot">${S.brand.toUpperCase()} ADVISORY • ${S.year}</div>
      </section>`);
    const fab = $('#advFab'), panel = $('#advPanel'), body = $('#advBody'), form = $('#advForm'), input = $('#advText');
    let greeted = false, busy = false;

    const scroll = () => (body.scrollTop = body.scrollHeight);
    const add = (html, who = 'bot') => { const d = document.createElement('div'); d.className = 'bubble ' + who; d.innerHTML = html; body.appendChild(d); scroll(); return d; };
    const quick = (list) => { const q = document.createElement('div'); q.className = 'quick'; list.forEach((t) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { q.remove(); ask(t); }; q.appendChild(b); }); body.appendChild(q); scroll(); };

    function leaveMessage() {
      const f = document.createElement('form');
      f.className = 'adv-form';
      f.innerHTML = `<input type="text" name="name" placeholder="Your name" required maxlength="100"><input type="email" name="email" placeholder="Email address" required maxlength="150"><input type="tel" name="phone" placeholder="Phone (optional)" maxlength="30"><textarea name="message" placeholder="How can we help?" required maxlength="1000"></textarea><input class="hp" type="text" name="website" tabindex="-1" autocomplete="off"><span class="err-msg"></span><button class="btn btn-primary btn-sm" type="submit"><span class="btn-label">Send to our team</span><span class="spinner"></span></button>`;
      const last = [...body.querySelectorAll('.bubble.me')].pop();
      if (last) f.elements.message.value = last.textContent;
      body.appendChild(f); scroll();
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = $('.err-msg', f), btn = $('button', f);
        err.style.display = 'none';
        btn.disabled = true; btn.classList.add('is-loading');
        const d = Object.fromEntries(new FormData(f));
        const res = await window.submitLead({ ...d, source: 'ai-advisor', service: 'Advisor chat enquiry' });
        btn.disabled = false; btn.classList.remove('is-loading');
        if (res.ok) { f.remove(); add(`✅ <b>Thanks, ${esc(d.name)}!</b> Your message has been sent to our team — we'll reply to <b>${esc(d.email)}</b> shortly.`); window.confetti?.(); }
        else { err.textContent = res.error || 'Could not send. Please try again.'; err.style.display = 'block'; }
      });
    }

    function reply(text) {
      const t = text.toLowerCase();
      const hit = KB.find((e) => e.k.test(t));
      const typing = add('<span class="typing"><i></i><i></i><i></i></span>');
      busy = true;
      setTimeout(() => {
        typing.remove();
        if (hit) {
          add(hit.a());
          if (hit.go) quick(['Check availability', 'Talk to a human']);
          if (hit.form) leaveMessage();
        } else {
          add(`I want to make sure you get an accurate answer on that. Leave your details and one of our advisors will email or call you back:`);
          leaveMessage();
        }
        busy = false;
      }, 650 + Math.random() * 500);
    }
    function ask(text) {
      if (text === 'Check availability') { add(text, 'me'); return setTimeout(() => { add('Taking you to the availability checker…'); setTimeout(() => (location.href = '/availability'), 700); }, 400); }
      if (text === 'Talk to a human') { add(text, 'me'); return reply('talk to a human'); }
      add(esc(text), 'me'); reply(text);
    }

    const open = () => {
      panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); fab.style.display = 'none';
      if (!greeted) {
        greeted = true;
        add(`<b>👋 Welcome to ${esc(S.brand)}!</b><br>I'm your virtual network advisor. I can compare speed-per-dollar, explain fiber vs cable, or help you pick the right plan.<br><br>What kind of connectivity do you need today?`);
        quick(QUICK);
      }
      setTimeout(() => input.focus(), 350);
    };
    const close = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); fab.style.display = ''; };
    fab.addEventListener('click', open);
    $('#advClose').addEventListener('click', close);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && panel.classList.contains('open') && close());
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (!v || busy) return; input.value = ''; ask(v); });
    window.openAdvisor = open;
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open-advisor]')) { e.preventDefault(); open(); } });
  }
  document.addEventListener('chrome:ready', build);
})();
