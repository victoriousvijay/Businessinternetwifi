/*
 * SINGLE PLACE TO EDIT YOUR COMPANY DETAILS.
 * Used by the pages (via data-site="…" attributes) and by the server (emails).
 * Replace every value marked CHANGE ME with your real business details.
 */
(function (root, factory) {
  const cfg = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = cfg;
  else root.SITE = cfg;
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    brand: 'BusinessInternetWifi',           // CHANGE ME
    brandSuffix: 'INTERNET · WIFI · TV',      // CHANGE ME
    legalName: 'BusinessInternetWifi',        // CHANGE ME
    phone: '+1-844-733-2380',             // call only (no WhatsApp)
    phoneHref: '+18447332380',           // digits only, keep the +
    email: 'info@businessinternetwifi.com', // shown on the site; delivery address is COMPANY_EMAIL in .env
    addressLine1: '1178 Broadway',
    addressLine2: 'New York, NY 10001',
    year: new Date().getFullYear(),
    plans: [
      {
        id: 'advantage', tier: 'INTERNET ADVANTAGE', speed: 100, label: '100 Mbps Internet',
        blurb: 'Everyday browsing and streaming.',
        oldPrice: null, price: 30,
        perks: ['Fiber-powered internet', 'Unlimited mobile for 1 year', 'No contracts']
      },
      {
        id: 'premier', tier: 'INTERNET PREMIER', speed: 500, label: '500 Mbps Internet',
        blurb: 'Work and streaming on many devices.',
        oldPrice: 50, price: 40, featured: true,
        perks: ['Fiber-powered internet', 'Unlimited mobile for 1 year', 'No contracts']
      },
      {
        id: 'gig', tier: 'INTERNET GIG', speed: 1000, label: '1 Gig Internet',
        blurb: 'Gaming and busy households.',
        oldPrice: 70, price: 60,
        perks: ['Fiber-powered internet', 'Advanced WiFi included', 'No contracts']
      }
    ]
  };
});
