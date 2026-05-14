# AdSense Readiness

Use this runbook to prepare Vision AR for Google AdSense without committing
publisher IDs, private account URLs, verification tokens, or production
environment values.

## Public-Safe Boundary

- Keep real publisher IDs and account details in private provider configuration.
- Commit variable names, expected behavior, and placeholder shapes only.
- Do not commit AdSense dashboard URLs, screenshots with account data,
  verification tokens, payment details, or private review notes.
- Keep ads disabled until policy pages, original public content, account
  approval, and launch QA are complete.

## Configuration

AdSense is disabled unless all of these are true:

- `NODE_ENV=production`
- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is configured with a valid `ca-pub-...` value
- `ADSENSE_DISABLED` is not `true`

The default local and preview posture should remain:

```bash
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
ADSENSE_DISABLED=true
```

`ADSENSE_DISABLED=true` is the fast kill switch. It suppresses both the script
loader and `/ads.txt`, even if public variables are configured.

## Runtime Behavior

- The AdSense script can load only on approved public acquisition surfaces:
  `/canales`, `/canales/*`, `/canales/categoria/*`, and SEO-eligible
  `/combo/*` pages.
- The script must not load on the dashboard, auth pages, protected account
  pages, private combinations, API routes, generated metadata routes, or pages
  that cannot be evaluated by crawlers.
- `/ads.txt` returns no publisher ID unless the production AdSense config is
  fully enabled. When enabled, it publishes one Google seller line derived from
  the configured `ca-pub-...` value.

## Approval Checklist

Before enabling AdSense in production:

1. Confirm public trust pages are live and linked from public navigation.
2. Confirm original channel/category/combo content is crawlable and not thin.
3. Confirm the sitemap includes only approved public acquisition URLs.
4. Confirm auth, account, private, API, and generated metadata routes are not
   ad surfaces.
5. Review mobile and desktop pages for accidental-click risk near controls,
   embeds, navigation, or forms.
6. Complete the private AdSense application flow from the maintainer account.
7. Add the real `NEXT_PUBLIC_ADSENSE_CLIENT_ID` only in the production provider
   environment after account approval.
8. Set `NEXT_PUBLIC_ADSENSE_ENABLED=true` and keep `ADSENSE_DISABLED=false`
   only when launch QA passes.

## PR Security Note

For changes touching AdSense readiness, mention the public integration boundary
in the PR body:

- `/ads.txt` is intentionally public and unauthenticated.
- Missing, invalid, or disabled config emits no publisher ID.
- No user data, database access, external API calls, secrets, or private URLs
  are involved.
- Protected and private pages are excluded from ad script loading.
