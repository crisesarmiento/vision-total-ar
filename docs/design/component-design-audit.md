# Component Design Consistency Audit

CRIS-269 audits the current Vision AR interface against `docs/design/vision-ui-conventions.md`. The goal is to classify design consistency work before implementation polish begins, without changing UI behavior in this ticket.

## Summary

- The app already has a coherent dark, monitoring-focused multiview direction.
- Most actionable issues are not product-direction problems; they are accessibility, responsive, reduced-motion, and primitive-consistency gaps.
- No new Milestone 7 category is needed. Actionable findings map to CRIS-271 through CRIS-275.

## Surfaces Reviewed

- Dashboard: `components/dashboard/live-dashboard.tsx`, `components/dashboard/player-tile.tsx`, `components/dashboard/news-ticker.tsx`, `components/dashboard/save-combination-dialog.tsx`
- Public and saved combinations: `app/combo/[id]/page.tsx`, `app/mis-combinaciones/page.tsx`, `components/combo/*`
- Account surfaces: `components/auth/auth-panel.tsx`, `app/perfil/page.tsx`, `components/profile/*`, `app/configuracion/page.tsx`
- Shared primitives: `Button`, `Card`, `Input`, `Textarea`, `Dialog`, `Badge`, `Switch`, `Label`, `Avatar`

## Fix Now

| Route/component | Issue category | Evidence | Recommended target |
| --- | --- | --- | --- |
| `components/dashboard/player-tile.tsx` | Accessibility | Player tile icon-only controls for play/pause, mute, fullscreen, and open-on-YouTube render icons without accessible names. The drag handle has `aria-label`, but the other icon-only controls do not. | CRIS-272 |
| `components/dashboard/player-tile.tsx` | Accessibility | The volume range input has no accessible label or visible value context beyond a decorative `Expand` icon. | CRIS-272 |
| `components/dashboard/live-dashboard.tsx` | Accessibility | Mobile sidebar open/close menu buttons are icon-only and do not expose action-specific labels. | CRIS-272 |
| `components/dashboard/live-dashboard.tsx` | Accessibility | Sidebar favorite star buttons are custom `button` elements with only an icon, no accessible name, and no `aria-pressed` state. | CRIS-272 |
| `components/dashboard/live-dashboard.tsx` | Responsive behavior | Mobile sidebar uses transform state but no overlay, focus trap, or explicit outside-click escape path. This can make the drawer feel detached from the rest of the mobile viewport. | CRIS-272 |
| `components/dashboard/live-dashboard.tsx` | Responsive behavior | Header action groups, global controls, and preset controls wrap using general flex behavior, but no compact grouping strategy separates navigation, playback, saving, and layout controls on narrow screens. | CRIS-272 |
| `components/dashboard/player-tile.tsx` | Long-session readability | Top and bottom overlays stack several badges and controls over live video. The current overlay treatment is consistent with the brand, but it should be checked on small tiles to ensure status and control density do not hide too much content. | CRIS-272 |
| `components/dashboard/news-ticker.tsx` | Reduced motion | The ticker continuously animates with Framer Motion and does not check reduced-motion preference. | CRIS-274 |
| `components/profile/settings-form.tsx` | Reduced motion | A `reducedMotion` preference exists in settings, but the audit did not find dashboard/ticker behavior consuming it. | CRIS-274 |
| `components/dashboard/save-combination-dialog.tsx` and `components/profile/settings-form.tsx` | Shared primitives | Select controls repeat ad hoc Tailwind styles instead of using a shared primitive, which can drift from `Input` focus, disabled, and density conventions. | CRIS-271 |
| `components/ui/dialog.tsx` | Shared primitives | Dialog content uses a fixed centered panel with no explicit small-viewport max-height or scroll behavior. Long forms can become cramped on short screens. | CRIS-271 |
| `components/ui/card.tsx` | Shared primitives | `CardTitle` defaults to `text-2xl`, while dense dashboard panels often override it manually. The primitive should define or document compact title usage to reduce per-component overrides. | CRIS-271 |
| `app/combo/[id]/page.tsx` | Secondary-page consistency | Public combo header actions use a non-wrapping `flex gap-2` group and one manually styled link instead of a `Button` variant. Long names or mobile widths may crowd the header. | CRIS-273 |
| `app/mis-combinaciones/page.tsx` | Secondary-page consistency | Saved-combo actions mix `Button` and destructive intent without a distinct destructive treatment or confirmation pattern for `Eliminar`. | CRIS-273 |
| `app/perfil/page.tsx` and `app/configuracion/page.tsx` | Secondary-page consistency | Back-to-dashboard links are manually styled instead of using the shared `Button` pattern used elsewhere for command-like navigation. | CRIS-273 |
| `components/profile/avatar-uploader.tsx` | Secondary-page consistency | UploadThing button styling is manually defined and should be aligned with the shared button visual and focus conventions where the provider allows it. | CRIS-273 |
| `components/profile/settings-form.tsx` | Accessibility | Switch rows render visible text in a `p` element instead of a `Label` associated with the switch control. | CRIS-273 |
| `all audited UI routes` | Visual QA | The current audit is source-based. The next milestone step still needs a repeatable visual QA checklist for desktop, mobile, focus states, reduced motion, empty states, loading/pending states, and long Spanish text. | CRIS-275 |

## Document As Intentional

| Route/component | Issue category | Evidence | Recommended target |
| --- | --- | --- | --- |
| Global visual language | Visual consistency | Dark near-black surfaces, translucent white borders, red primary accents, and subtle glass panels match the documented Vision AR direction. | No change |
| `components/dashboard/live-dashboard.tsx` | Product hierarchy | The sidebar, sticky dashboard header, video grid, and right-side featured-combination column keep the grid as the primary experience while supporting channel discovery. | No change |
| `components/dashboard/player-tile.tsx` | Visual consistency | Large rounded player tiles, live status badges, compact controls, gradient overlays, and small channel accent dots support the monitoring-console direction. | No change |
| `components/dashboard/live-dashboard.tsx` | Spanish copy | Dashboard labels such as `Todas las visiones`, `Buscador de señales`, `Silenciar todo`, and `Guardar combinación` are concise and action-oriented. | No change |
| `components/dashboard/live-dashboard.tsx` | Channel discovery | Favorite channels sort first, live state is visible, and independent channels use compact badges without changing the page palette. | No change |
| `app/combo/[id]/page.tsx` | Public sharing | The public combo page correctly uses a read-only grid, player count, favorite/copy/open actions, and the same dark card language as the dashboard. | No change |
| `app/mis-combinaciones/page.tsx` | Information architecture | Saved and recent combinations are separated into a primary list plus supporting column, matching the secondary-page convention. | No change |
| `components/auth/auth-panel.tsx` | Account flows | Auth copy is short, Spanish-first, and focused on the value of saved combinations, favorites, and preferences. | No change |
| `components/ui/button.tsx` | Shared primitives | Button variants, rounded shape, disabled opacity, and focus-visible ring establish a consistent baseline for command actions. | No change |
| `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/badge.tsx`, `components/ui/avatar.tsx` | Shared primitives | The primitives consistently use translucent borders, dark fills, rounded geometry, and compact text sizing that fits the documented visual system. | No change |

## Follow-Up Later

No new `follow-up later` finding was identified during this audit. All actionable findings map to existing Milestone 7 tickets:

- CRIS-271 for shared UI primitive consistency.
- CRIS-272 for dashboard and player accessibility/responsive polish.
- CRIS-273 for secondary page layout consistency.
- CRIS-274 for reduced-motion and long-session readability.
- CRIS-275 for repeatable visual QA.

## Validation Notes

This ticket is documentation-only. It should not change React components, Tailwind classes, Prisma schema, auth behavior, API routes, or OpenAI integration.

Recommended validation for the CRIS-269 PR:

- `git diff --check`
- `npm run lint`
- `npm run typecheck`
