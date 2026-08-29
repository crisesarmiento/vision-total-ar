# Search And Monetization Launch QA - 2026-08-29

This report records a CRIS-301 rerun of the public SEO, sitemap, robots, and
monetization preflight. It is public-safe: it includes route patterns, public
HTTP behavior, and checklist outcomes only. Search Console property URLs,
verification tokens, AdSense publisher IDs, account URLs, screenshots with
account data, and production environment values stay in private maintainer
systems.

## Summary

- **Local target:** Docker Compose app at `http://localhost:3000`
- **Production target:** `https://vision-total-ar.vercel.app`
- **Checked at:** 2026-08-29
- **Result:** public preflight passed on production and local after two launch
  bugs were identified; Search Console private UI actions remain pending
- **AdSense decision:** keep ads disabled. `/ads.txt` remains an empty 404 with
  `Cache-Control: no-store`. No publisher ID was observed in HTML or ads.txt.
- **Search Console decision:** production still exposes the
  `google-site-verification` metadata hook. Sitemap submission and URL
  Inspection remain private maintainer actions using
  `docs/runbooks/search-console-launch.md`.

## Bugs Found

| Finding | Surfaces | Fix |
| --- | --- | --- |
| Homepage HTML canonical and Open Graph URL omit the trailing slash, while `/sitemap.xml` and JSON-LD used a trailing slash. Search Console can treat those as distinct URLs. | `/` local and production | `getCanonicalUrl("/")` now returns the site origin without a trailing slash so sitemap, JSON-LD, breadcrumbs, and the App Router canonical tag match. |
| Seeded public combinations failed the public combo SEO gate because descriptions were shorter than 80 characters, so local `/sitemap.xml` contained zero `/combo/*` URLs and combo pages rendered `noindex, follow`. | `/combo/demo-mesa-de-noticias`, `/combo/demo-modo-elecciones`, `/combo/demo-streaming-independiente` | Seed descriptions now include original Spanish copy that passes the quality gate. Private seed combo remains non-indexable. |

## Checked URL Set

| URL pattern | Expected | Local | Production | Result |
| --- | --- | --- | --- | --- |
| `/` | 200, canonical, JSON-LD, desktop/mobile render | 200 | 200 | Pass |
| `/canales` | 200, canonical, Open Graph, JSON-LD, in sitemap | 200 | 200 | Pass |
| `/canales/categoria/noticias` | 200, canonical, Open Graph, JSON-LD, in sitemap | 200 | 200 | Pass |
| `/canales/tn` | 200, canonical, Open Graph, JSON-LD, in sitemap | 200 | 200 | Pass |
| `/guias` | 200, canonical, Open Graph, JSON-LD, in sitemap | 200 | 200 | Pass |
| `/guias/seguir-ultimo-momento-argentina` | 200, canonical, Open Graph, JSON-LD, in sitemap | 200 | 200 | Pass |
| `/acerca-de`, `/contacto`, `/privacidad`, `/terminos`, `/politica-editorial` | 200, canonical, linked from public footer, in sitemap | 200 | 200 | Pass |
| eligible `/combo/[id]` | Indexable public combos appear only when quality gates pass | Seed combos were noindex before the seed fix | No eligible production combo URL in sitemap | Local fail before fix; production not checked (no eligible URL) |
| `/robots.txt` | Allow `/` and point to production `/sitemap.xml` | 200, sitemap on localhost | 200, sitemap on production origin | Pass |
| `/sitemap.xml` | Public acquisition URLs only | 200, 37 URLs, no auth/account/API | 200, 37 URLs, no auth/account/API | Pass |
| `/ads.txt` | No publisher ID while AdSense is disabled | empty 404, `no-store` | empty 404, `no-store` | Pass |
| `/ingresar`, `/registrarse` | noindex, absent from sitemap | noindex, nofollow | noindex, nofollow | Pass |
| `/perfil`, `/configuracion`, `/mis-combinaciones` | redirect unauthenticated users; absent from sitemap | 302/200 via `/ingresar`, noindex | same | Pass |
| `/api/live`, `/api/ticker` | excluded from sitemap, not ad surfaces | 200 JSON | 200 JSON | Pass |

## Technical SEO Checks

- **Status codes:** homepage, channel, category, guide, policy, robots, and
  sitemap routes returned 200 on local and production.
- **Canonical URLs:** representative public pages expose canonical URLs on the
  matching origin. After the helper fix, the homepage canonical no longer
  disagrees with sitemap `loc` or Organization/WebSite JSON-LD.
- **Robots and noindex posture:** `robots.txt` allows public crawling. Auth and
  account pages emit `noindex, nofollow` and are absent from the sitemap.
- **Sitemap inclusion/exclusion:** includes `/`, `/canales`,
  `/canales/categoria/*`, `/canales/*`, `/guias`, `/guias/*`, and public policy
  pages. Excludes auth, account, API, `robots.txt`, `sitemap.xml`, and
  `/ads.txt`.
- **Open Graph and Twitter metadata:** representative public pages expose title,
  description, canonical, Open Graph, and Twitter metadata.
- **Structured data:** homepage, channel, category, guide, and public combo
  pages include JSON-LD. Policy pages currently have metadata without JSON-LD;
  that is a non-blocking follow-up, not a crawlability blocker.
- **Verification hook:** production HTML includes `google-site-verification`
  from private env config. The token value is not recorded here.

## Monetization Checks

- **Ad gating:** no AdSense publisher ID or `adsbygoogle` script was observed
  on checked public pages.
- **`/ads.txt`:** empty 404 with `Cache-Control: no-store` on local and
  production, matching disabled readiness behavior.
- **Excluded surfaces:** dashboard, auth, account, API, and generated metadata
  routes are not ad surfaces.

## Search Console Checklist

Reviewed `docs/runbooks/search-console-launch.md`. Remaining private maintainer
actions:

- Submit `sitemap.xml` for the verified production property.
- Run URL Inspection for `/`, `/canales`, a representative category page, a
  representative channel page, `/guias`, and a representative guide page.
- Compare user-declared canonicals with Google's selected canonicals after the
  homepage trailing-slash fix is in production.
- Do not request indexing for auth, account, API, private, 404, or incomplete
  acquisition pages.

## Follow-Up

- Production still has no eligible public combo URL in the sitemap. That is
  expected until a real public combination passes the description and channel
  quality gates.
- Policy-page JSON-LD remains optional. File a new ticket only if Search
  Console or rich-result review needs WebPage/BreadcrumbList on trust pages.
- Search Console UI verification, sitemap submission, and URL Inspection stay
  in private maintainer systems.
