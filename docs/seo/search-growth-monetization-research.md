# Search Growth And Monetization Research

This memo records the CRIS-290 research recommendation for making Vision AR discoverable in Google Search and preparing monetization without creating policy, copyright, privacy, or public-repository risk.

Checked on 2026-05-13 against official Google Search Central, Search Console, Next.js, and Google AdSense documentation.

This ticket is intentionally research-only: no Search Console verification token, AdSense publisher ID, `ads.txt`, analytics script, ad script, environment variable, schema change, public API route, private dashboard URL, or production account operation is part of CRIS-290.

## Official References

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): recommends crawlable helpful pages, descriptive titles and snippets, clear site structure, internal links, and content written for users.
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): explains canonical signals through redirects, `rel="canonical"`, and sitemap URLs.
- [Google robots meta guidance](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag): documents page-level indexing controls such as `noindex`.
- [Search Console sitemaps report](https://support.google.com/webmasters/answer/7451001): documents sitemap submission and sitemap processing checks.
- [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289): documents indexability checks, live tests, canonical reporting, and request-indexing workflow.
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata): documents route metadata, dynamic metadata, canonical alternates, robots metadata, and Open Graph metadata for App Router.
- [AdSense eligibility requirements](https://support.google.com/adsense/answer/9724): requires policy-compliant content, user-owned or controlled sites, and useful original content.
- [AdSense Program policies](https://support.google.com/adsense/answer/48182): links publisher policies, restrictions, privacy requirements, and ad placement expectations.

## Research Goals

- Define how Vision AR should become discoverable for Spanish and Argentina-focused search intent around live news monitoring, multiview viewing, channel comparison, and public combinations.
- Separate technical SEO work from content quality work so future tickets do not treat metadata alone as a ranking or AdSense-readiness strategy.
- Establish public-safe monetization boundaries before any ad code, account IDs, or `ads.txt` support is implemented.
- Identify copyright and policy risks from embedded third-party livestreams before public landing pages or ads are added.
- Produce follow-up implementation guidance for Milestone 10 tickets without adding runtime behavior in CRIS-290.

## Current State Audit

Vision AR already has the foundation for a crawlable public product, but not enough search-specific content or monetization readiness to apply for ads.

Existing public discovery surfaces:

- `/` renders the live dashboard and has global metadata from `app/layout.tsx`.
- `/combo/[id]` renders public saved combinations by slug when `visibility` is `PUBLIC`.
- `app/opengraph-image.tsx`, `app/icon.tsx`, `app/manifest.ts`, `app/robots.ts`, and `app/sitemap.ts` exist.
- Public APIs `/api/live` and `/api/ticker` expose live metadata and ticker data with rate limits documented in `docs/runbooks/public-api-audit.md`.

Existing protected or account-oriented surfaces:

- `/perfil`, `/configuracion`, and `/mis-combinaciones` are protected by middleware.
- `/ingresar` and `/registrarse` are auth entry points and redirect authenticated users.

Current SEO gaps:

- `app/sitemap.ts` includes auth and protected account routes; these should not be treated as acquisition pages.
- Public combo pages do not yet define per-combo `generateMetadata`.
- No route-level indexability matrix exists.
- No Search Console setup runbook exists.
- No crawlable channel, category, or evergreen content pages exist.
- No trust, legal, privacy, contact, editorial, or monetization policy pages exist.
- No AdSense readiness boundary exists for ad scripts, `ads.txt`, publisher IDs, or placement rules.

## Route Indexability Matrix

| Surface | Current route | Recommendation | Rationale | Follow-up |
|---------|---------------|----------------|-----------|-----------|
| Home dashboard | `/` | Index | Primary public product entry point and brand query target. | CRIS-291 |
| Public combinations | `/combo/[id]` | Conditional future index | Useful only when the combo has enough original metadata, valid channels, and a stable canonical URL. Direct sharing should keep working even when a combo is not indexed. | CRIS-293 |
| Auth pages | `/ingresar`, `/registrarse` | Exclude from sitemap and noindex | These are transactional pages, not acquisition content. | CRIS-291 |
| Protected account pages | `/perfil`, `/configuracion`, `/mis-combinaciones` | Exclude from sitemap and noindex where applicable | User-scoped pages should not be search landing pages or ad surfaces. | CRIS-291 |
| Public APIs | `/api/*` | Exclude from sitemap | Machine-readable endpoints are not search landing pages. Existing rate limits stay documented separately. | None for CRIS-290 |
| Generated app metadata | `/manifest.webmanifest`, `/opengraph-image`, `/icon`, `/robots.txt`, `/sitemap.xml` | Exclude as page content | These support discovery and sharing but are not indexable content pages. | CRIS-291 |
| Future channel pages | Future `/canales/*` or equivalent | Index when content threshold is met | Channel pages can target Argentine live-news search intent if they include original copy, source context, and internal links. | CRIS-292 |
| Future category/use-case pages | Future category or guide routes | Index when content threshold is met | These should become the main organic acquisition surfaces. | CRIS-292, CRIS-300 |

## Search Strategy

### Technical SEO

CRIS-291 should harden the Next.js metadata layer before any broad content launch:

- Use `NEXT_PUBLIC_APP_URL` as the canonical production base, documenting the variable name but not production values.
- Keep sitemap URLs limited to public canonical acquisition pages.
- Add page-level robots metadata for auth and protected routes instead of relying on `robots.txt` to hide pages.
- Add per-route canonical URLs through App Router metadata.
- Keep `robots.ts` aligned with the sitemap and avoid using `robots.txt` as a duplicate-content or privacy workaround.

### Crawlable Public Content

CRIS-292 and CRIS-300 should create original Spanish content around how users actually discover this product:

- "ver noticias argentinas en vivo"
- "canales de noticias argentinos en vivo"
- "comparar cobertura en vivo"
- "multiview de noticias"
- "seguir breaking news en Argentina"
- "grilla de canales en vivo"

The first indexable content pages should be channel pages, category/use-case pages, and evergreen explainers. Each page should include a unique title, description, H1, original body copy, internal links, visible source/context metadata, and a clear CTA to open the dashboard.

Avoid thin pages that only wrap an iframe or repeat copied channel descriptions. Search and monetization readiness require useful original context.

### Internal Linking

Future public pages should form a simple graph:

- Home links to top categories, guides, and public combinations.
- Category pages link to relevant channels and useful guides.
- Channel pages link back to category pages and dashboard presets.
- Public combo pages link to included channels and the dashboard deep link.
- Trust and policy pages stay visible from public navigation or footer.

### Structured Data Boundaries

CRIS-294 should add only structured data that accurately represents Vision AR:

- Good candidates: `WebSite`, `Organization`, `BreadcrumbList`, and `ItemList`.
- Avoid `VideoObject` until the product can accurately represent video ownership, thumbnails, live state, and rights for embedded streams.
- Structured data must match visible content and must not imply Vision AR owns third-party broadcasts.

## Monetization Strategy

AdSense readiness should come after useful public content and trust pages, not before.

Recommended order:

1. Complete technical SEO and indexability cleanup.
2. Publish original channel, category, and evergreen guide content.
3. Add public trust pages: about, contact, privacy, terms/use, and editorial/content policy.
4. Add analytics only with clear privacy boundaries.
5. Add AdSense configuration hooks without real IDs.
6. Design policy-safe ad placements.
7. Run launch QA before applying for AdSense or enabling ads in production.

AdSense is the first monetization path because it is operationally simple once the site has enough content and policy pages. Direct sponsorships, affiliate-style partnerships, and premium features can be evaluated later, but they should not block search readiness.

Disallowed or deferred for Milestone 10:

- Ads on auth forms, protected pages, private dashboards, account pages, or player controls.
- Ads that create accidental click risk near playback, drag, fullscreen, volume, favorite, fork, copy, or sign-in controls.
- Ad scripts enabled by default in local development or previews.
- Committed publisher IDs, account URLs, verification tokens, or private monetization dashboard references.
- Monetizing pages dominated by embedded third-party video without enough original Vision AR content.

## Policy And Copyright Risks

Vision AR is a multiview monitoring interface for third-party media. Public pages must be explicit that livestreams, channel brands, and embedded media belong to their respective sources.

Risk areas:

- Public channel pages that look like Vision AR owns or republishes a broadcast.
- Structured data that overclaims video ownership.
- Thin pages built only from iframes and generic copy.
- Ads placed around embedded streams in ways that could imply a content-rights relationship.
- User-generated public combination names or descriptions that are too low-quality, misleading, or spam-like for indexing.

Recommended mitigations:

- Add original explanatory copy and source context on indexable pages.
- Gate public combo indexing by quality before adding them to sitemap.
- Keep terms/content policy public and easy to find.
- Do not add `VideoObject` schema until a separate rights and metadata review approves it.
- Preserve direct sharing for public combos even when a combo is not indexed.

## Public-Safe Operational Boundary

CRIS-290 does not require private systems. Future operational work must stop at the public boundary in repo docs:

- Search Console verification should be documented as a private maintainer action in CRIS-296.
- AdSense account setup, site review, and publisher IDs are private maintainer actions.
- Vercel production env values are private; docs should name variables and behavior only.
- Screenshots, dashboard URLs, account paths, verification tokens, and publisher IDs must not be committed.

## Follow-Up Ticket Map

| Ticket | Purpose |
|--------|---------|
| CRIS-291 | Implement technical metadata, sitemap, robots, and canonical cleanup. |
| CRIS-292 | Add crawlable public channel and category landing pages. |
| CRIS-293 | Make public combo pages SEO-safe with metadata, quality gates, and sitemap rules. |
| CRIS-294 | Add accurate structured data for site identity, breadcrumbs, and lists. |
| CRIS-295 | Add privacy-safe analytics and search performance tracking. |
| CRIS-296 | Create the Search Console launch runbook. |
| CRIS-297 | Add trust, legal, privacy, contact, and content policy pages. |
| CRIS-298 | Add AdSense readiness hooks without private IDs. |
| CRIS-299 | Design policy-safe ad placements for public pages. |
| CRIS-300 | Publish original SEO content for Argentine news monitoring use cases. |
| CRIS-301 | Run final SEO, Search Console, and monetization launch QA. |

## Acceptance Criteria For Later Implementation

Before Vision AR applies for AdSense or treats organic acquisition as live:

- Public pages intended for acquisition are indexable, canonical, linked internally, and present in sitemap.
- Protected, account, auth, API, and generated metadata routes are excluded from sitemap and noindexed where appropriate.
- Public pages contain original Spanish content that helps users understand the product and use case.
- Search Console is verified privately and sitemap submission is documented publicly.
- Analytics avoids PII, private combination data, and account-specific dashboard tracking.
- Trust and policy pages are live and linked from public navigation.
- Ads are disabled by default and only render on approved public surfaces when configured.
- Launch QA checks sitemap, robots, canonical, metadata, structured data, mobile rendering, and ad placement safety.

## Deferred Ideas

Defer these until separate tickets define product value, policy risk, implementation details, validation, and ownership:

- NewsArticle or VideoObject structured data.
- Google News-specific workflows.
- Automatic indexing requests beyond manual Search Console usage.
- Programmatic Search Console or AdSense API integrations.
- Sponsorship inventory management.
- Premium subscription or paywall design.
- Public ranking dashboards based on user behavior.

## Skill Maintenance

No repo skill update is required for CRIS-290 because this ticket records a one-time research recommendation and does not change the implementation workflow, infrastructure workflow, documentation standard, or agent behavior. If later tickets establish a durable SEO or monetization workflow, update `vision-documentation`, `vision-infra`, or `vision-architecture` in that same PR.
