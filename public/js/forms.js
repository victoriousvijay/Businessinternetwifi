/* ==========================================================================
   Lead forms → POST /api/contact  (server emails the company inbox)
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async function submitLead(payload) {
    let res;
    try {
      res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (_) {
      return { ok: false, error: 'Network problem — please check your connection or call us.' };
    }
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { ok: false, ...data, error: data.error || 'Something went wrong. Please try again.' };
  }
  window.submitLead = submitLead;

  function setErr(field, msg) {
    if (!field) return;
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('err', !!msg);
    let m = $('.msg', wrap);
    if (!m) { m = document.createElement('span'); m.className = 'msg'; wrap.appendChild(m); }
    m.textContent = msg || '';
  }

  function bind(form) {
    const card = form.closest('.form-card') || form;
    const alertBox = $('.form-alert', form);
    const btn = $('button[type=submit]', form);

    $$('input, textarea, select', form).forEach((el) => el.addEventListener('input', () => setErr(el, '')));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox?.classList.remove('show');
      const v = (n) => (form.elements[n] ? form.elements[n].value.trim() : '');
      const data = {
        name: v('name'), email: v('email'), phone: v('phone'), service: v('service'), plan: v('plan'),
        zip: v('zip'), address: v('address'), message: v('message'), website: v('website'),
        source: form.dataset.source || 'website'
      };

      let bad = false;
      if (data.name.length < 2) { setErr(form.elements.name, 'Please enter your full name.'); bad = true; }
      if (!EMAIL_RE.test(data.email)) { setErr(form.elements.email, 'Please enter a valid email address.'); bad = true; }
      if (form.elements.phone && form.elements.phone.required && data.phone.replace(/\D/g, '').length < 7) { setErr(form.elements.phone, 'Please enter a valid phone number.'); bad = true; }
      if (form.elements.message && form.elements.message.required && data.message.length < 5) { setErr(form.elements.message, 'Please tell us a little about your enquiry.'); bad = true; }
      if (bad) { $('.err input, .err textarea', form)?.focus(); return; }

      btn.disabled = true; btn.classList.add('is-loading');
      const res = await submitLead(data);
      btn.disabled = false; btn.classList.remove('is-loading');

      if (res.ok) {
        card.classList.add('done');
        form.reset();
        card.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      if (res.errors) Object.entries(res.errors).forEach(([k, m]) => setErr(form.elements[k], m));
      if (alertBox) { alertBox.textContent = res.error; alertBox.classList.add('show'); }
    });

    $('.again', card)?.addEventListener('click', () => card.classList.remove('done'));
  }

  document.addEventListener('chrome:ready', () => $$('form[data-lead-form]').forEach(bind));
})();
