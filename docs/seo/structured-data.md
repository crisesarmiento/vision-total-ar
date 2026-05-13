# Structured Data

Vision AR uses conservative JSON-LD on public discovery pages so search engines can understand the site, page hierarchy, and curated channel lists without implying ownership of third-party broadcasts.

Checked on 2026-05-13 against Google Search Central guidance for structured data, supported search features, breadcrumbs, and organization markup.

## Schema Types

- `Organization`: rendered with the public Vision AR name, canonical site URL, public description, and generated `/icon` logo.
- `WebSite`: rendered for the public site identity with Spanish Argentina language context.
- `BreadcrumbList`: rendered on public channel, category, directory, and combo pages to describe the page hierarchy.
- `ItemList`: rendered only for visible public lists such as channel categories, category channel lists, and eligible public combination channel lists.

## Explicit Non-Goals

- No `VideoObject` markup is emitted. Vision AR embeds third-party livestreams and does not claim ownership of video content, thumbnails, live status, or broadcast rights.
- No `sameAs`, private dashboard URL, account data, contact data, Search Console token, AdSense ID, or credential-adjacent value is included.
- Public combo `ItemList` markup is gated by the same SEO eligibility rules used for indexing and sitemap inclusion.

## Validation

Automated validation covers JSON serialization, absolute URLs, breadcrumb positions, item list positions, missing-value cleanup, and the absence of `VideoObject`.

Before release, manually validate representative rendered pages in Google's Rich Results Test:

- `/`
- `/canales`
- one `/canales/categoria/[slug]`
- one `/canales/[id]`
- one eligible `/combo/[id]`

## References

- <https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data>
- <https://developers.google.com/search/docs/appearance/structured-data/search-gallery>
- <https://developers.google.com/search/docs/appearance/structured-data/breadcrumb>
- <https://developers.google.com/search/docs/appearance/structured-data/organization>
