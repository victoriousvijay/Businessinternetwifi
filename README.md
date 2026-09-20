# BusinessInternetWifi — Internet & TV advisory website

Multi-page, animated site (light theme by default, dark toggle in the header) with a small Node/Express
backend. **Every customer query — contact form, availability/quote form and the AI-advisor chat — is emailed to your company inbox.**

## 1. Run it

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env (see below)
npm start                 # http://localhost:3000
```

## 2. Make queries arrive in your email

Edit `.env`:

| Setting | What it is |
|---|---|
| `COMPANY_EMAIL` | The inbox that receives every enquiry |
| `SMTP_HOST / PORT / SECURE / USER / PASS` | The mail account the server sends *from* |
| `MAIL_FROM` | Sender name shown on the email |
| `AUTO_REPLY` | `true` = customer also gets a "we received your request" email |
| `ADMIN_KEY` | Access code for the `/admin` leads dashboard |

**Gmail:** turn on 2-step verification, create an *App Password* (Google Account → Security → App passwords) and use
`smtp.gmail.com`, port `465`, `SMTP_SECURE=true`, your Gmail address as `SMTP_USER` and the app password as `SMTP_PASS`.
Any SMTP provider works (Zoho, Outlook/Microsoft 365, Brevo, SendGrid, Mailgun SMTP…).

The email is sent with **Reply-To = the customer**, so you just hit *Reply*.

A copy of every enquiry is also saved to `data/leads.jsonl` (so nothing is lost if email is down) and shown at `/admin`.
If SMTP isn't configured the server prints a warning and only saves enquiries.

## 3. Put in your real business details

Edit **`public/js/site-config.js`** — brand name, legal name, phone, email, address and the three plans/prices.
Every page (header, footer, legal pages, forms, advisor chat) reads from that one file.

## Landing pages

- `/fiber-internet` (fiber internet) and `/business-fiber` are call-focused landing pages, generated from one template.
- Copy, tiers and prices live in `public/fiber-internet.html` and `public/business-fiber.html`; rename a page by renaming its file (the URL follows the file name).
- Phone, email and address come from `public/js/site-config.js` (phone is call-only).

## Pages

`/` Home · `/plans` (comparison + savings calculator) · `/availability` (radar ZIP checker → quote form) ·
`/services` (+ business section) · `/how-it-works` · `/faq` · `/contact` · `/admin` (leads, code-protected) ·
`/privacy` · `/terms` · `/disclosures`

## Effects

Custom cursor (dot + trailing ring + glow, magnetic buttons, labelled hovers), live network-canvas hero with pulses that react to the mouse,
3D-tilt cards with spotlight, animated speed gauge, scroll-reveal + split-text headlines, counters, marquee, page-transition curtain,
scroll-progress bar, interactive speed visualiser, savings calculator, confetti on success, smooth scrolling. All motion is disabled for
visitors who prefer reduced motion, and the custom cursor is disabled on touch devices.

## Things to know before going live

- **Availability checker is a front-end simulation.** It accepts any valid ZIP/postal code and always shows "networks detected", with the copy
  saying an advisor confirms the exact address. To make it real, replace the `setTimeout` in `initAvail()` (`public/js/pages.js`) with a call to
  your coverage/availability API.
- **AI advisor is rule-based** (`public/js/advisor.js`), no API key needed. Unknown questions become an emailed message. It can be swapped for an LLM later.
- `privacy`, `terms`, `disclosures` are generic templates — have them reviewed by a lawyer.
- Serve over HTTPS in production (any Node host, or behind Nginx/Caddy). Keep `.env` private; it is git-ignored.
