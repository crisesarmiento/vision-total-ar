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
- the approved page surface has a configured numeric slot ID

The default local and preview posture should remain:

```bash
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX=
NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY=
NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_DETAIL=
NEXT_PUBLIC_ADSENSE_SLOT_PUBLIC_COMBO=
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
- Display ad placements render only when both the global AdSense config and the
  matching surface slot are enabled. Blank or non-numeric slot IDs render
  nothing.

## Approved Placement Surfaces

| Surface | Slot variable | Placement rule |
| --- | --- | --- |
| `/canales` | `NEXT_PUBLIC_ADSENSE_SLOT_CHANNELS_INDEX` | Inline after the category overview cards and before the detailed category sections. |
| `/canales/categoria/[slug]` | `NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_CATEGORY` | Inline after the hero/summary area and before the channel cards. |
| `/canales/[id]` | `NEXT_PUBLIC_ADSENSE_SLOT_CHANNEL_DETAIL` | Inline after the channel hero/ficha area and before related channels. |
| SEO-eligible `/combo/[id]` | `NEXT_PUBLIC_ADSENSE_SLOT_PUBLIC_COMBO` | Below the read-only player grid, outside player tiles and controls. |

Use only neutral `Publicidad` labeling. Do not use headings or copy that asks
users to click ads, implies sponsorship, points attention at ads, or makes ads
look like navigation, channel cards, download links, player controls, or other
Vision AR commands.

## Excluded Surfaces

Never render AdSense placements on:

- the dashboard `/`
- auth pages and forms
- protected account pages such as profile, settings, and saved combinations
- private or non-indexable public combinations
- player tiles, player overlays, channel controls, dialogs, drawers, or sticky
  dashboard chrome
- API routes, metadata routes, `robots.txt`, `sitemap.xml`, or `/ads.txt`
- pages or states that cannot be evaluated by crawlers

## Layout Stability

- Reserve stable vertical space for enabled display units before ad fill.
- Keep placements separated from interactive controls, links, video embeds, and
  forms to reduce accidental-click risk.
- Keep disabled or unconfigured placements fully inert; they should not leave
  empty ad boxes in local development, preview, or disabled production states.
- Review Core Web Vitals layout-shift risk in browser QA before enabling any
  production slot.

## Approval Checklist

Before enabling AdSense in production:

1. Confirm public trust pages are live and linked from public navigation.
2. Confirm original channel/category/combo content is crawlable and not thin.
3. Confirm the sitemap includes only approved public acquisition URLs.
4. Confirm auth, account, private, API, and generated metadata routes are not
   ad surfaces.
5. Review mobile and desktop pages for accidental-click risk near controls,
   embeds, navigation, or forms.
6. Confirm enabled placements reserve stable space and do not overlap text,
   controls, navigation, or player content at common desktop and mobile
   viewports.
7. Complete the private AdSense application flow from the maintainer account.
8. Add the real `NEXT_PUBLIC_ADSENSE_CLIENT_ID` only in the production provider
   environment after account approval.
9. Add real numeric slot IDs only in the production provider environment after
   the matching ad units are approved.
10. Set `NEXT_PUBLIC_ADSENSE_ENABLED=true` and keep `ADSENSE_DISABLED=false`
    only when launch QA passes.

## PR Security Note

For changes touching AdSense readiness, mention the public integration boundary
in the PR body:

- `/ads.txt` is intentionally public and unauthenticated.
- Missing, invalid, or disabled config emits no publisher ID.
- No user data, database access, external API calls, secrets, or private URLs
  are involved.
- Protected and private pages are excluded from ad script loading.
