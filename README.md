# Sara Almohammadi — Digital Business Card

A bilingual (English default, Arabic optional) digital business card and booth display for
**Al-Rayan National Colleges** at LEAP.

| File | Purpose |
| --- | --- |
| `index.html` | The digital card — profile, areas of collaboration, contact, vCard, QR, image export |
| `booth.html` | Booth screen — large QR code, positioning statement, live engagement metrics |
| `api/count.js` | Serverless function that records and reports profile views |
| `lang.js` | Bilingual controller (`data-en` / `data-ar` attributes) |
| `qrcode.js` | QR generator (MIT, Kazuhiko Arase) |
| `logo.png`, `logo-mark.png` | Institutional logo lockup and shield mark |
| `docs/copy-deck.md` | Approved English/Arabic copy for every section |

## Deploying on Vercel

1. Import this repository in Vercel. Framework preset: **Other**, no build command — `index.html`
   at the repository root is served as-is and `api/` is deployed as a serverless function.
2. After the first deploy, set `ME.site` in `index.html` to the public URL so the QR code and the
   saved contact carry the final link.

## Enabling the engagement metrics

The booth screen reports QR scans, unique visitors, views today, and total views. Counters are
stored in Redis; without a store the pages still work and the metrics panel simply reports that it
is not enabled.

1. In the Vercel project: **Storage → Upstash Redis → Connect**.
2. Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (the `UPSTASH_REDIS_REST_*` names are
   also accepted). Redeploy.

Endpoint behaviour — `GET /api/count` returns the current totals; `POST /api/count` records one
view. `index.html` posts once per page view, tagged `qr` when opened from the booth code
(`?s=qr`) and `direct` otherwise. Unique visitors are counted from a random identifier stored in
the visitor's own browser; no personal data is collected.

## Running the booth screen

Open `/booth.html` on the booth display, select **Full screen**, and leave it running. The page
requests a screen wake lock, sizes the QR code to the available space, and refreshes the metrics
every ten seconds.

## Editing content

- Contact details, title, and links: the `ME` object in `index.html`.
- Copy: every translatable element carries `data-en` and `data-ar`. Update both, keeping the
  wording aligned with `docs/copy-deck.md`.
- Language: English is the default; `?lang=ar` opens the Arabic view and the choice is remembered
  per browser.
