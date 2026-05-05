# Milestone 8 Monitoring Journey Audit

CRIS-279 audits Vision AR as end-to-end monitoring journeys before the Milestone 8 implementation PRs begin. CRIS-285 adds the repeatable evidence expectations that each UX/design PR should carry into review.

This audit is public-safe. It does not include credentials, private URLs, personal account paths, production-only operational details, or account-specific data.

## Summary

- The dashboard already has the right product direction: dark-first, monitoring-focused, Spanish-first, and centered on the multiview player grid.
- Milestone 8 should prioritize scan speed, state clarity, mobile wrapping, and consistent async feedback rather than a broad redesign.
- The strongest first implementation grouping is CRIS-280 plus CRIS-281 because the dashboard command center and channel discovery share the same route, header, sidebar, mobile drawer, and focus behavior.
- Secondary surfaces can follow as CRIS-282 plus CRIS-283 because empty-state guidance, public combo presentation, and saved-combo metadata overlap across `/combo/[id]` and `/mis-combinaciones`.
- CRIS-284 should remain separate because async feedback touches dashboard actions, combo actions, auth, profile, settings, avatar upload, and layout persistence.

## First-Run Journey

Routes and files reviewed:

- `/`: `app/page.tsx`, `components/dashboard/live-dashboard.tsx`, `components/dashboard/player-tile.tsx`
- `/ingresar` and `/registrarse`: `app/ingresar/page.tsx`, `app/registrarse/page.tsx`, `components/auth/auth-panel.tsx`
- `/perfil` and `/configuracion`: `app/perfil/page.tsx`, `app/configuracion/page.tsx`, `components/profile/profile-form.tsx`, `components/profile/settings-form.tsx`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | Anonymous users can immediately monitor channels, but the dashboard first-run path relies mostly on controls and supporting cards to explain save/share value. Add short guidance only where it helps the next action and does not compete with the player grid. | CRIS-282 |
| Visual polish | Auth entry copy is concise and tied to combinations, favorites, and preferences, but it can be visually connected more clearly to the dashboard language without becoming a marketing page. | CRIS-282 |
| Product UX opportunity | `/perfil` and `/configuracion` empty or incomplete states are present but utilitarian. Profile analytics with no data and default preferences should state the condition and the next useful dashboard action. | CRIS-282 |
| Out of scope | Do not add onboarding persistence, schema fields, provider explanations, or account-specific walkthrough state in Milestone 8. | Follow-up only if a later ticket defines persistence scope. |

## Active Monitoring Journey

Routes and files reviewed:

- `/`: `components/dashboard/live-dashboard.tsx`, `components/dashboard/player-tile.tsx`, `components/dashboard/news-ticker.tsx`, `components/dashboard/home-live-now-section.tsx`
- Shared logic: `lib/channel-filters.ts`, `lib/layout-presets.ts`, `lib/dashboard-layout.ts`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | Header actions, global playback, wake lock, save/share, import/export, and preset controls are all available in the sticky dashboard header, but the command groups scan as one large cluster on smaller widths. Grouping and hierarchy should make frequent monitoring actions faster to identify. | CRIS-280 |
| Visual polish | The player grid remains the primary surface, but the supporting right column and command header should be checked together at `1440x900` and `390x844` so featured content does not compete with live tiles. | CRIS-280 |
| Product UX opportunity | Preset controls use consistent buttons, but long labels and multiple controls can crowd mobile. Labels should wrap or collapse intentionally while preserving accessible names. | CRIS-280 |
| Visual polish | Ticker placement already respects reduced-motion input through `reducedMotionEnabled`; Milestone 8 should verify that placement and paused behavior stay quiet during long sessions. | CRIS-280 |
| Functional bug | No functional dashboard playback, persistence, or polling bug was identified in this source audit. | None |

## Save And Share Journey

Routes and files reviewed:

- Dashboard save/share: `components/dashboard/save-combination-dialog.tsx`, `components/dashboard/share-dashboard-button.tsx`, `components/dashboard/layout-import-export.tsx`
- Public combo: `app/combo/[id]/page.tsx`, `components/combo/copy-link-button.tsx`, `components/combo/favorite-combination-button.tsx`, `components/combo/fork-combination-button.tsx`
- Saved combinations: `app/mis-combinaciones/page.tsx`, `components/combo/delete-combination-button.tsx`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | Save, share, copy-link, open-in-dashboard, fork, favorite, and delete actions exist, but their hierarchy changes by surface. The public combo and saved-combo surfaces should make the primary action obvious without changing the sharing model. | CRIS-283 |
| Visual polish | Public combo metadata communicates owner, description, player count, favorites, and actions, but action groups should be verified for mobile wrapping and long combination names. | CRIS-283 |
| Product UX opportunity | Saved-combo cards show visibility and description, while recent cards show last viewed time. Cards should become easier to scan by visibility, player count, favorites, dates, and destructive affordances where data is already available. | CRIS-283 |
| Product UX opportunity | Missing channels on public combos are public-safe and actionable, but empty or invalid combination layouts should use the same concise state language as saved-combo empty states. | CRIS-282, CRIS-283 |
| Functional bug | The audit did not identify a broken save/share route. Server action validation gaps are already tracked separately in public API follow-ups CRIS-286 and CRIS-287 and should not be folded into this milestone. | Existing follow-ups |

## Return-User Journey

Routes and files reviewed:

- `/`: `app/page.tsx`, `components/dashboard/live-dashboard.tsx`
- `/mis-combinaciones`: `app/mis-combinaciones/page.tsx`
- `/perfil`: `app/perfil/page.tsx`
- `/configuracion`: `app/configuracion/page.tsx`, `components/profile/settings-form.tsx`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | Return-user layout hydration, favorite channels, default grid preset, ticker preference, reduced motion, and live alerts are wired through `app/page.tsx`. The dashboard should surface these states quietly without adding setup friction. | CRIS-280, CRIS-282 |
| Visual polish | Navigation from dashboard to library/profile/settings is present, but the dashboard command header should make account actions distinct from live monitoring commands. | CRIS-280 |
| Product UX opportunity | Saved combinations and recent combinations are split into useful sections, but an empty library should point back to the dashboard with one clear next action. | CRIS-282, CRIS-283 |
| Functional bug | Layout preference persistence retries after failures, but it has no user-visible feedback. Treat this as feedback-state normalization, not layout architecture work. | CRIS-284 |

## Mobile Journey

Routes and files reviewed:

- `/`: `components/dashboard/live-dashboard.tsx`, `components/dashboard/player-tile.tsx`
- `/combo/[id]`: `app/combo/[id]/page.tsx`
- `/mis-combinaciones`: `app/mis-combinaciones/page.tsx`
- `/ingresar`, `/registrarse`, `/perfil`, `/configuracion`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | The dashboard uses a persistent desktop sidebar and temporary mobile drawer, with Escape and overlay close behavior already present. CRIS-281 should verify focus restoration, selected-channel feedback, and drawer stability while assigning channels. | CRIS-281 |
| Visual polish | Sidebar search, filter chips, live/favorite/independent states, and channel cards are present. Milestone 8 should improve hierarchy and state readability without duplicating completed quick-filter scope from CRIS-226. | CRIS-281 |
| Visual polish | Dashboard command groups use flexible wrapping, but mobile needs clearer grouping so controls do not crowd or obscure player tiles. | CRIS-280 |
| Visual polish | Public combo and saved library action groups already wrap, but long names, badges, and destructive actions need explicit mobile visual QA. | CRIS-283 |
| Functional bug | No mobile-only route blocker was identified in source review. Real-browser QA is still required for drawer, keyboard, and overflow behavior. | CRIS-285 evidence |

## Accessibility And Feedback Journey

Routes and files reviewed:

- Dashboard controls: `components/dashboard/live-dashboard.tsx`, `components/dashboard/player-tile.tsx`
- Combo actions: `components/combo/copy-link-button.tsx`, `components/combo/favorite-combination-button.tsx`, `components/combo/delete-combination-button.tsx`
- Auth/profile/settings: `components/auth/auth-panel.tsx`, `components/profile/profile-form.tsx`, `components/profile/settings-form.tsx`, `components/profile/avatar-uploader.tsx`

Findings:

| Classification | Finding | Target |
| --- | --- | --- |
| Product UX opportunity | Channel assignment changes the focused player and closes the drawer, but the visible selected/assigned feedback can be stronger for pointer, touch, and keyboard users. | CRIS-281 |
| Visual polish | Icon-only dashboard and player controls mostly have accessible labels and titles now; Milestone 8 should preserve those labels while compacting controls. | CRIS-280, CRIS-281 |
| Product UX opportunity | Favorite channel and favorite combo states use pressed state and visual fill, but pending states should keep control sizes stable and communicate that duplicate actions are blocked. | CRIS-284 |
| Product UX opportunity | Auth, profile, settings, save, delete, and copy actions all provide some feedback, but success/error/pending copy should be normalized and public-safe. | CRIS-284 |
| Functional bug | Copy link failure, auth provider errors, profile save errors, settings save errors, and delete failures are recoverable through toasts. The remaining risk is inconsistent wording and layout stability rather than broken behavior. | CRIS-284 |

## Deferred Scope Mapping

Do not duplicate these known backlog areas in Milestone 8 implementation PRs:

- Live alerts and notification behavior: already represented by existing dashboard preferences and live-alert code paths.
- Stale stream recovery: existing player and stale overlay behavior should remain unchanged unless a later ticket targets it.
- Export/import and unsaved-share scope: keep `LayoutImportExport` and dashboard share model behavior unchanged.
- Wake lock: keep current `useWakeLock` behavior unchanged.
- Catalog expansion and live metadata backend work: CRIS-281 is UI discovery polish only.
- Security hardening and server action validation: public API follow-ups CRIS-286 and CRIS-287 already track known validation gaps.

## Evidence Standard For Milestone 8 PRs

Each implementation PR under CRIS-278 should include:

- Routes checked and browser or preview environment used, without private URLs.
- Desktop and mobile viewports, minimum `1440x900` and `390x844`.
- Keyboard focus checks and mobile drawer behavior where relevant.
- Long Spanish text wrapping notes.
- Disabled, pending, empty, loading, error, and destructive states relevant to the touched surfaces.
- Reduced-motion behavior when dashboard, ticker, drawer, drag, or animation behavior is affected.
- Validation commands run and skipped checks with concrete reasons.
- Public-safe screenshots only when useful for review.
- Follow-up issue IDs for intentionally deferred design gaps.
