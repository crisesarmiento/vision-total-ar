# Search Performance Reporting

Use this runbook to review whether Google discovery work is producing useful
traffic and whether visitors activate Vision AR without collecting user-scoped
or sensitive data.

## Privacy Boundary

- Use Vercel Web Analytics for aggregate page views and allowlisted activation
  events only.
- Do not export or commit Vercel dashboard URLs, Search Console property URLs,
  account IDs, analytics IDs, verification tokens, screenshots with private
  account data, or production environment values.
- Do not track emails, names, user IDs, combo IDs, combo slugs, combo names,
  private combination contents, layout JSON, dashboard search text, or protected
  account page URLs.
- Keep `NEXT_PUBLIC_ENABLE_WEB_ANALYTICS=false` unless Vercel Web Analytics is
  enabled for the target environment.

## Weekly Organic Report

1. In Vercel Web Analytics, record aggregate visitors, page views, top pages,
   referrers, countries, devices, and browsers for the last 7 and 28 days.
2. In Google Search Console Performance, record clicks, impressions, CTR, and
   average position for the same period where available.
3. Review the Search Console `Pages` tab for `/`, `/canales`,
   `/canales/categoria/*`, `/canales/*`, and eligible `/combo/*` URLs.
4. Review the Search Console `Queries` tab for Spanish and Argentina-focused
   discovery terms. Keep query exports private when they include sensitive or
   low-volume data.
5. Compare Vercel top landing pages with Search Console top pages. Treat
   differences as directional because Search Console and analytics aggregate data
   differently.

## Activation Events

Review these aggregate event counts in Vercel Web Analytics:

- `search_landing_view`: acquisition page families.
- `dashboard_open`: dashboard starts by `direct`, `public_combo`, or
  `shared_layout` source.
- `public_combo_open`: public combo opens with indexability and count buckets.
- `signup_completed`: signup completions by method bucket.
- `favorite_combo_toggled`: public combo favorite/unfavorite actions.
- `public_combo_forked`: successful public combo forks.

Activation should be interpreted as directional product usage, not user-level
attribution. Do not try to reconstruct individual journeys from aggregate
events.

## Launch Checks

- Confirm analytics is disabled in local development unless explicitly testing
  with `NEXT_PUBLIC_ENABLE_WEB_ANALYTICS=true`.
- Confirm protected routes are not sent as analytics page views.
- Confirm page view URLs have no query strings or hashes.
- Confirm custom event payloads contain only allowlisted coarse properties.
- Confirm Search Console setup and sitemap submission remain private maintainer
  actions unless a public runbook explicitly says otherwise.

## References

- <https://vercel.com/docs/analytics>
- <https://vercel.com/docs/analytics/quickstart>
- <https://vercel.com/docs/analytics/custom-events>
- <https://support.google.com/webmasters/answer/7576553>
