# Search And Monetization Launch QA - 2026-05-14

This report records the CRIS-301 production launch QA pass for Google discovery
and monetization readiness. It is public-safe: it includes route patterns,
public HTTP behavior, and checklist outcomes only. Search Console property URLs,
verification tokens, AdSense publisher IDs, account URLs, screenshots with
account data, and production environment values stay in private maintainer
systems.

## Summary

- **Target:** production, `https://vision-total-ar.vercel.app`
- **Checked at:** 2026-05-14, approximately 02:06-02:11 ART
- **Rerun after release:** 2026-05-14, approximately 18:27 ART
- **Result:** public production preflight passed after release; Search Console
  private actions remain pending
- **Blocking follow-up:** CRIS-302, "Chore: deploy discovery and monetization
  launch surfaces to production before final QA" was resolved by release PR #77
  promoting `develop` to `main`.
- **AdSense decision:** keep ads disabled and do not apply for AdSense until
  Search Console launch checks are completed and the private AdSense account
  review/configuration is ready.
- **Search Console decision:** production is now ready for private Search
  Console sitemap submission and URL Inspection using
  `docs/runbooks/search-console-launch.md`.

The first production pass found that production was still serving the older
pre-release route set. Release PR #77 deployed the current Milestone 10 work to
production; the post-release rerun below records the corrected public behavior.

## Checked URL Set

| URL pattern | Expected | Observed | Result |
| --- | --- | --- | --- |
| `/` | Public homepage returns 200 and renders on desktop/mobile. | Returned 200. Browser mobile pass rendered the dashboard shell during the initial pass. | Pass |
| `/canales` | Public channel index returns 200, has canonical metadata, and appears in sitemap. | Returned 200 after release. Title, canonical, Open Graph, and JSON-LD were present. | Pass |
| `/canales/categoria/noticias` | Public category page returns 200, has canonical metadata, and appears in sitemap. | Returned 200 after release. Title, canonical, Open Graph, and JSON-LD were present. | Pass |
| `/canales/tn` | Public channel detail page returns 200, has canonical metadata, and appears in sitemap. | Returned 200 after release. Title, canonical, Open Graph, and JSON-LD were present. | Pass |
| `/guias` | Public evergreen guide index returns 200, has canonical metadata, and appears in sitemap. | Returned 200 after release. Title, canonical, Open Graph, and JSON-LD were present. | Pass |
| `/guias/seguir-ultimo-momento-argentina` | Representative guide returns 200, has canonical metadata, and appears in sitemap. | Returned 200 after release. Title, canonical, Open Graph, and JSON-LD were present. | Pass |
| eligible `/combo/[id]` | Eligible public combos appear only when quality gates pass. | No eligible production combo URL was available from the sitemap during this pass. | Not checked |
| `/robots.txt` | Allows public crawling and points to production `/sitemap.xml`. | Returned 200 with `User-Agent: *`, `Allow: /`, and the production sitemap URL. | Pass |
| `/sitemap.xml` | Contains only public acquisition URLs. | Returned 200 after release and listed homepage, channel/category/channel pages, guides, and public policy pages. | Pass |
| `/ads.txt` | Public route returns no publisher ID while AdSense is disabled. | Returned empty 404 with `Cache-Control: no-store`, matching the disabled readiness behavior. No publisher ID was observed. | Pass |
| `/ingresar` | Auth page is not submitted in the sitemap and is noindexed. | The route is absent from the post-release sitemap. | Pass |
| `/registrarse`, `/perfil`, `/configuracion`, `/mis-combinaciones` | Auth/account routes are excluded from the sitemap. | All four route patterns are absent from the post-release sitemap. | Pass |
| `/api/*` | API routes are excluded from the sitemap and are not ad surfaces. | No API URLs were present in the sitemap. | Pass |

## Technical SEO Checks

- **Status codes:** after release, the homepage, representative channel index,
  category, channel detail, guide index, guide detail, robots, and sitemap URLs
  returned 200.
- **Canonical URLs:** representative public pages expose canonical URLs on the
  production origin.
- **Robots and noindex posture:** `robots.txt` is reachable and points to the
  production sitemap. Auth/account/API/generated metadata route patterns are
  absent from the sitemap.
- **Sitemap inclusion/exclusion:** post-release sitemap inclusion is correct for
  checked route families. It includes `/`, `/canales`, `/canales/categoria/*`,
  `/canales/*`, `/guias`, `/guias/*`, and public policy pages; it excludes auth,
  account, API, `robots.txt`, `sitemap.xml`, and `/ads.txt`.
- **Open Graph and Twitter metadata:** representative public pages expose title,
  description, canonical, Open Graph, and Twitter metadata.
- **Structured data:** representative public pages include JSON-LD script tags.
- **Mobile rendering:** browser QA at a mobile viewport rendered the homepage
  dashboard shell. The initial desktop browser check for `/canales` rendered the
  pre-release 404; after release, curl checks confirmed the route returns 200
  with discovery metadata.

## Monetization Checks

- **Ad gating:** no AdSense publisher ID was observed in the checked production
  HTML or `/ads.txt` response.
- **`/ads.txt`:** returned empty 404 with `Cache-Control: no-store`, matching
  the documented disabled behavior when publisher config is absent or disabled.
- **Ad placement safety:** production public pages are now available for private
  AdSense review. Ads remain disabled, so no filled ad slot layout shift was
  observed in this public preflight.
- **Excluded surfaces:** auth/account routes are absent from the sitemap and are
  not approved ad surfaces.

## Search Console Checklist

The Search Console launch runbook was reviewed. After release, production is
ready for private maintainer execution:

- Sitemap submission: pending private maintainer action in Search Console.
- URL Inspection for homepage and representative public pages: pending private
  maintainer action in Search Console.
- Canonical comparison: pending Search Console URL Inspection results.
- Request indexing: not performed. Do not request indexing for auth, account,
  API, private, 404, or incomplete acquisition pages.

## Follow-Up

CRIS-302 was created as the launch-blocking follow-up and was resolved by the
0.3.0 production release. Before AdSense application or treating organic
acquisition as live, complete the remaining private Search Console steps:

- Submit `sitemap.xml` for the verified production property.
- Run URL Inspection for `/`, `/canales`, a representative category page, a
  representative channel page, `/guias`, and a representative guide page.
- Compare user-declared canonicals with Google's selected canonicals.
- File a new public-safe Linear issue for any Search Console indexability,
  canonical, mobile usability, content quality, or policy blocker.
