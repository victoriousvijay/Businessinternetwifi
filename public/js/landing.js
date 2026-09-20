/* Landing pages: interactive speed-tier selector */
(function () {
  'use strict';
  document.addEventListener('chrome:ready', () => {
    document.querySelectorAll('[data-tiers]').forEach((box) => {
      let tiers = [];
      try { tiers = JSON.parse(box.dataset.tiers); } catch (_) { return; }
      const tabs = box.querySelector('.tier-tabs');
      const speed = box.querySelector('.tier-speed'), sub = box.querySelector('.tier-sub'), price = box.querySelector('.tier-price b');
      tabs.innerHTML = tiers.map((t, i) => `<button type="button" data-i="${i}" aria-pressed="false">${t.tab}</button>`).join('');
      const pick = (i) => {
        const t = tiers[i];
        speed.innerHTML = `${t.speed}<small>${t.unit}</small>`;
        sub.textContent = t.sub;
        price.textContent = t.price;
        tabs.querySelectorAll('button').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
      };
      tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
      pick(box.dataset.default ? +box.dataset.default : 0);
    });
  });
})();
