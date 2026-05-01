# Visual QA Checklist

Use this checklist for Vision AR design changes before opening or handing off a PR. It keeps visual review repeatable across the dashboard, public combo pages, saved combinations, auth, profile, settings, and shared UI primitives.

This checklist is public-safe. Do not record credentials, environment values, private dashboard URLs, account-specific paths, production-only operational details, or screenshots that expose private data.

## Review Setup

- Start from the changed branch with local dependencies installed.
- Run the app with local or preview data that is safe to share in PR notes.
- Check at least one desktop viewport and one mobile viewport. Recommended baselines are `1440x900` and `390x844`.
- Prefer real browser QA for layout, focus, motion, and overflow behavior. Static source review is not enough for visual changes.
- Keep `docs/design/vision-ui-conventions.md` open as the source of truth for palette, spacing, density, copy, motion, and component behavior.

## Global Checks

- The dark-first monitoring palette remains dominant: near-black surfaces, translucent borders, red primary/live/focus treatment, neutral text, and small channel accents.
- The dashboard grid stays visually primary. Headers, sidebars, dialogs, cards, and secondary columns support the live players without competing with them.
- Spanish copy is concise, product-specific, and does not add explanatory bulk inside dense dashboard chrome.
- Cards, glass panels, dialogs, buttons, badges, inputs, switches, and avatar controls match the shared primitive conventions.
- Text does not overflow buttons, cards, badges, player overlays, dialogs, or form rows in desktop or mobile viewports.
- Icon-only controls have accessible names through visible text, `aria-label`, or nearby programmatic context.
- Focus states are visible with keyboard navigation and do not depend only on color.
- Disabled, pending, empty, loading, and error states are visually distinct and do not shift layout unexpectedly.
- Reduced-motion behavior avoids continuous or distracting movement while preserving useful status information.

## Surface Checks

### Dashboard `/`

- Desktop keeps the sidebar persistent and gives the player grid the largest visual weight.
- Mobile uses a temporary channel drawer pattern without hiding primary grid and global controls.
- Header actions, global playback controls, save controls, and layout presets wrap or collapse without crowding.
- Preset controls remain stable and readable across `1x1`, `2x1`, `2x2`, `3x3`, and `4x4`.
- Ticker placement does not dominate the page, overlap controls, or keep moving when reduced motion should pause it.
- Featured or supporting combination cards do not compete with player tiles on desktop and collapse cleanly on mobile.

### Player Tiles

- Player tiles preserve `aspect-video` sizing and do not resize when controls, hover states, loading states, or badges appear.
- Top and bottom overlays keep channel identity, live state, viewers, mute/play/fullscreen controls, and drag affordances readable without covering too much video.
- Long channel names truncate or wrap predictably without overlapping status badges or controls.
- Per-player controls have accessible names, visible focus, and comfortable touch targets.
- Muted, paused, focused, dragging, live, loading, and unavailable states can be distinguished without relying only on color.

### Sidebar And Channel Discovery

- Search, favorites, live indicators, independent-channel badges, and category metadata are readable in desktop and mobile drawer layouts.
- Favorite controls expose selected state and remain easy to operate by pointer and keyboard.
- Channel accent colors appear as compact identifiers, not as a competing page palette.
- Empty or filtered channel states explain the condition and next useful action without private provider details.

### Public Combo `/combo/[id]`

- Read-only combo layout preserves stable player tiles and clear channel context.
- Favorite, copy-link, and open-in-dashboard actions wrap cleanly on narrow screens.
- Missing, empty, or invalid combo states are short, public-safe, and actionable.
- Public pages do not expose authenticated-only affordances unless the action is intentionally available.

### Saved Combinations `/mis-combinaciones`

- Saved and recent lists remain scannable, with clear metadata for visibility, player count, favorites, and dates.
- Empty states point users back to the dashboard without adding instructional bulk.
- Destructive actions are visually distinct and use an interaction pattern appropriate to the risk.
- Pending save/delete/favorite states prevent duplicate actions and keep button sizes stable.

### Auth, Profile, And Settings

- `/ingresar` and `/registrarse` keep form labels visible or programmatically associated, with readable validation and alternate auth actions.
- `/perfil` keeps avatar upload, profile fields, account metadata, and sign-out actions grouped without nested-card clutter.
- `/configuracion` keeps preference switches, ticker settings, visual preferences, and save states aligned with shared form conventions.
- Protected-route pages preserve dashboard navigation affordances such as a consistent back-to-dashboard action.
- Authentication, upload, and settings errors stay recoverable and public-safe.

## Interaction And State Checks

- Keyboard: Tab order reaches primary navigation, sidebar controls, player controls, dialogs, forms, and destructive actions in a useful order.
- Escape closes temporary surfaces such as mobile drawers or dialogs where applicable.
- Pointer and touch: hover-only cues are backed by visible or accessible state for touch and keyboard users.
- Reduced motion: continuous ticker or spatial motion pauses or becomes static when OS or Vision AR preferences request it.
- Long-session readability: persistent motion, flashing, dense overlays, and status badges do not create unnecessary visual fatigue.
- Long Spanish strings: titles, channel names, validation messages, button labels, and empty-state copy wrap or truncate intentionally.

## Evidence To Capture In PRs

- Routes and viewports checked.
- Browser or preview environment used, without private URLs.
- Validation commands run and results.
- Any skipped checks with a concrete reason.
- Screenshots only when they are public-safe and useful for review.
- Follow-up issue IDs for design gaps intentionally deferred.

## Validation Commands

Run the validation path appropriate to the touched files:

- `npm run skills:validate` when `.agents/skills`, `docs/skills`, `scripts/validate-skills.mjs`, or `AGENTS.md` changes.
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

For documentation-only design checklist updates, `npm run test` and `npm run build` may be skipped when no app code, imports, schemas, or generated assets changed. State the reason in the PR.
