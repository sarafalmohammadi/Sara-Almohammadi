# Sara Almohammadi — Digital Business Card

A single-page, bilingual (English default, Arabic optional) digital business card for LEAP,
representing **Al-Rayan National Colleges**.

| File | Purpose |
| --- | --- |
| `index.html` | The card — identity, positioning, collaboration priorities, contact, share sheet |
| `contact.vcf` | The contact file served to visitors; the reliable path on iOS and Android |
| `api/count.js` | Serverless function that records views (no personal data) |
| `lang.js` | Bilingual controller (`data-en` / `data-ar` attributes) |
| `qrcode.js` | QR generator (MIT, Kazuhiko Arase) |
| `logo.png` | Institutional lockup for light backgrounds |
| `logo-reverse.png` | Reversed lockup — white wordmark, shield colours intact — for the navy hero and the exported image |
| `logo-mark.png` | Shield mark, used as the favicon |
| `vercel.json` | Serves `contact.vcf` as `text/vcard` so phones offer "Add to Contacts" |
| `docs/copy-deck.md` | Approved English and Arabic copy for every section |

## Deploying on Vercel

1. Import the repository. Framework preset **Other**, no build command — the root `index.html` is
   served as-is and `api/` is deployed as a serverless function.
2. After the first deploy, set `ME.site` in `index.html` to the public URL. The share code and the
   "Share link" action then use the final address instead of deriving it from the browser.

## Contact file

**Save Contact** links directly to `contact.vcf`. This is deliberate: generating a `.vcf` in
JavaScript and downloading it through a blob URL fails on iOS Safari, which is what broke earlier.
`vercel.json` sets `Content-Type: text/vcard`, so iOS opens the contact preview and Android saves
the file.

`contact.vcf` is maintained by hand. If a phone number, title, or link changes, update both
`contact.vcf` and the `ME` object in `index.html` so the file and the offline QR code stay
identical.

## Views

`index.html` posts once per page view to `/api/count`, tagged `qr` when the visitor arrived from a
shared code (`?s=qr`) and `direct` otherwise. Unique visitors are counted from a random identifier
stored in the visitor's own browser; no personal data is collected or transmitted.

To enable storage: in the Vercel project, **Storage → Upstash Redis → Connect**, then redeploy.
Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (the `UPSTASH_REDIS_REST_*` names are also
accepted). Without a store the card works normally and the endpoint reports `configured: false`.

Read the totals at any time by opening `/api/count` in a browser:
`{"qr":…,"all":…,"people":…,"today":…}`.

## Editing content

- Contact details, title, and links: the `ME` object in `index.html`.
- Copy: every translatable element carries `data-en` and `data-ar`. Update both, and keep the
  wording aligned with `docs/copy-deck.md`.
- Language: English is the default; `?lang=ar` opens the Arabic view, and the choice is remembered
  per browser.
