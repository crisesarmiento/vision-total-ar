# Google Search Console Launch

Use this runbook to verify Vision AR in Google Search Console after the
production domain is live, submit the production sitemap, inspect representative
public URLs, and monitor early search health.

This runbook is public-safe. It names process, report types, and public URL
patterns only. Do not commit Search Console property URLs, verification tokens,
account IDs, screenshots with account data, production environment values, or
private dashboard notes.

## Prerequisites

- Production deploy is live on the canonical domain configured by
  `NEXT_PUBLIC_APP_URL`.
- `https://<production-domain>/robots.txt` is reachable and lists the production
  sitemap.
- `https://<production-domain>/sitemap.xml` is reachable without authentication.
- Public acquisition routes are live: `/`, `/canales`,
  `/canales/categoria/*`, `/canales/*`, and eligible `/combo/*` pages.
- Auth and account routes are excluded from the sitemap and noindexed where
  applicable: `/ingresar`, `/registrarse`, `/perfil`, `/configuracion`, and
  `/mis-combinaciones`.

## Verification

Set up Search Console as a private maintainer action. Keep the generated
verification values in the relevant private provider or dashboard only.

Choose one of these verification paths:

- **Domain property via DNS**: preferred when the maintainer controls the root
  domain and wants coverage across protocol and subdomain variants. Add the TXT
  or CNAME value from Search Console in the DNS provider. Do not remove the DNS
  record after verification succeeds.
- **URL-prefix property via HTML tag**: acceptable when verification should cover
  only the exact production URL prefix. Add the generated
  `google-site-verification` meta tag to the homepage `<head>` through a private
  production configuration path; do not commit the token value.
- **URL-prefix property via HTML file**: acceptable only if the generated file
  can be served from the site root without authentication or cross-domain
  redirects. Do not commit the generated token file to the public repository.
- **Google Analytics or Google Tag Manager**: acceptable only when the matching
  production tag is already installed, controlled by the maintainer, and allowed
  by the product privacy boundary.

Add a second verification method when practical so access does not depend on a
single tag, file, or owner.

## Launch Checklist

Before submitting the sitemap:

1. Open the production homepage in an incognito window and confirm it does not
   require authentication.
2. Open `/robots.txt` and confirm it allows public crawling and points to the
   production `/sitemap.xml`.
3. Open `/sitemap.xml` and confirm every URL uses the canonical production
   origin.
4. Confirm the sitemap contains public acquisition URLs only: `/`, `/canales`,
   `/canales/categoria/*`, `/canales/*`, and eligible `/combo/*` pages.
5. Confirm `/ingresar`, `/registrarse`, `/perfil`, `/configuracion`,
   `/mis-combinaciones`, `/api/*`, generated metadata routes, and private
   user-scoped pages are not in the sitemap.
6. Inspect representative page source or rendered metadata and confirm canonical
   URLs point to the intended production URL.
7. Confirm no private combo names, private layout data, account paths, query
   strings, or hashes appear in submitted URLs.

## Submit The Sitemap

1. In Search Console, select the verified production property.
2. Open **Indexing > Sitemaps**.
3. Submit the production sitemap path: `sitemap.xml`.
4. Confirm the submitted URL resolves to
   `https://<production-domain>/sitemap.xml`.
5. Wait for processing. Google may need time before discovered or indexed URL
   counts settle.

Read the sitemap report as follows:

- **Success**: Google fetched and parsed the sitemap. Continue with URL
  Inspection for representative URLs.
- **Could not fetch**: confirm the sitemap is public, returns HTTP 200, is not
  blocked by `robots.txt`, and uses the canonical production origin.
- **Parsing or format errors**: validate the XML response and confirm it contains
  absolute canonical URLs only.
- **Discovered URLs**: compare the count with expected public acquisition pages.
  Investigate unexpected drops or private/protected URLs immediately.
- **Indexed coverage**: treat early low index counts as normal. Escalate only
  when important public URLs remain excluded after Google has recrawled them.

## URL Inspection

Use URL Inspection for the homepage and representative public landing pages:

- `/`
- `/canales`
- one or more `/canales/categoria/*` pages
- one or more `/canales/*` pages
- one eligible public `/combo/*` page when public combo indexing is enabled for
  that URL

For each URL:

1. Inspect the exact canonical production URL.
2. Check whether Google can crawl the URL and whether indexing is allowed.
3. Run a live test when the indexed result is stale or missing.
4. Confirm the user-declared canonical matches the intended production URL.
5. Compare Google's selected canonical with the user-declared canonical. If they
   differ, review redirects, duplicate content, internal links, and sitemap
   signals.
6. Confirm the inspected URL is listed in the sitemap when it is intended for
   search.
7. Request indexing only for launch-critical public pages after the live test is
   valid. Do not request indexing for auth, account, API, private, or low-quality
   pages.

## Interpreting Search Console Findings

- **Indexability**: public acquisition pages should be crawlable and indexable.
  Auth pages, account pages, APIs, and private user-scoped surfaces should not be
  search landing pages.
- **Canonical**: user-declared canonical should be the production URL without
  tracking parameters, hashes, or alternate hostnames. Google's selected
  canonical should usually match; mismatches require a content, redirect, or
  internal-link review.
- **Sitemap association**: indexable public URLs should appear in the submitted
  sitemap. Missing sitemap association can weaken discovery for new or lightly
  linked pages.
- **Page indexing report**: review non-indexed reasons by page type. Expected
  exclusions are acceptable for auth, account, API, and generated metadata
  routes. Unexpected exclusions on public landing pages need a Linear follow-up.
- **Mobile usability and page experience**: use Search Console findings as
  directional signals and verify issues manually on production pages before
  filing implementation work.
- **Core Web Vitals**: review mobile and desktop URL groups. Prioritize poor or
  needs-improvement groups that include the homepage, channel pages, category
  pages, or public combo pages.

## Weekly Monitoring

During the first launch month, review weekly:

- Search results performance: clicks, impressions, CTR, average position, top
  queries, top pages, countries, devices, and search appearance where available.
- Queries: Spanish and Argentina-focused discovery terms for live news,
  multiview, channel comparison, and public combinations.
- Pages: `/`, `/canales`, `/canales/categoria/*`, `/canales/*`, and eligible
  `/combo/*` URLs.
- Indexing: indexed pages, non-indexed reasons, crawl errors, and unexpected
  protected or private URLs.
- Sitemaps: fetch status, last read time, discovered URL count, parsing errors,
  and sudden count changes.
- URL Inspection: recheck any launch-critical URL with changed metadata,
  canonical, sitemap, or index status.
- Core Web Vitals: mobile and desktop URL groups that moved into poor or
  needs-improvement status.

Keep exports, raw query data, account-specific URLs, and dashboard screenshots in
private maintainer systems. Public issues and PRs should summarize the problem
using route patterns and report categories only.

## Escalation

Create a Linear issue when a finding requires code, content, or operational
change. Use public-safe wording:

- Crawlability or sitemap bugs: include the affected public route pattern, report
  category, expected behavior, and observed public behavior.
- Canonical mismatches: include the intended canonical pattern and the type of
  mismatch. Do not paste private dashboard URLs.
- Content quality gaps: describe the user-facing page family and missing public
  value.
- Core Web Vitals regressions: include the route group, device group, metric, and
  affected public page family.
- Verification or account-access problems: keep details private and reference
  maintainer systems instead of creating public implementation notes.

## References

- <https://support.google.com/webmasters/answer/9008080>
- <https://support.google.com/webmasters/answer/7451001>
- <https://support.google.com/webmasters/answer/9012289>
- <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- <https://support.google.com/webmasters/answer/7576553>
- <https://support.google.com/webmasters/answer/7440203>
- <https://support.google.com/webmasters/answer/9205520>
