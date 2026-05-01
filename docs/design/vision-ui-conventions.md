# Vision AR UI Conventions

This document captures the reusable UI conventions for Vision AR. It exists so design changes stay consistent across the dashboard, public combo pages, saved-combo library, auth, profile, settings, and shared UI primitives.

Use `docs/design/visual-qa-checklist.md` when reviewing or handing off design changes. The checklist translates these conventions into repeatable route, viewport, state, accessibility, reduced-motion, and PR-evidence checks.

## Product Direction

- Vision AR is a dark, monitoring-focused multiview product for Argentine news channels.
- The dashboard grid is the primary surface. Navigation, cards, and supporting panels should help users compare signals without competing with the players.
- Keep the interface Spanish-first and operational. Copy should be short, concrete, and oriented around watching, comparing, saving, and sharing signals.
- Preserve the current visual language unless a ticket explicitly changes it. Avoid generic redesigns, marketing-style sections, decorative backgrounds, or unrelated visual drift.
- Design work should improve scan speed and confidence during long monitoring sessions. Prefer stable layouts, readable labels, predictable controls, and quiet status treatment over novelty.

## Visual System

- Use Tailwind tokens from `app/globals.css` and `tailwind.config.ts` before adding new colors or utilities.
- The product is dark-first. Light mode tokens should remain usable for primitives, but product surfaces should be reviewed primarily against the dark monitoring experience.
- The main palette is near-black surfaces, white translucent borders, red primary actions, neutral text, and occasional channel accents. Do not introduce a competing palette without a ticket that changes product direction.
- Use red primarily for product identity, live status, focus rings, destructive emphasis, and primary actions. Do not turn every status, card, section, or decoration red.
- Use channel `accent` colors as small identifying swatches, border accents, or compact metadata. They should not redefine the page palette or reduce text contrast.
- `glass-panel` is appropriate for sticky or high-level dashboard chrome such as headers, sidebars, and persistent control bands. Do not use it for every repeated item or nested content block.
- Rounded cards and controls are already part of the product language. Keep radii consistent with existing `Card`, `Button`, `Badge`, dialogs, and player tile treatments.
- Use large rounded panels only for major containers or modal-like surfaces. Compact controls, badges, forms, and dense dashboard elements should stay visually tight.
- Shadows and backdrop blur should stay subtle. The app should feel like a live operations console, not a landing page.

## Typography And Copy

- Use concise Spanish product copy. Prefer verbs and nouns users already see in the app, such as `Ver`, `Guardar`, `Compartir`, `Favoritos`, `En vivo`, `Silenciar`, `Reproducir`, `Pausar`, `Configuracion`, and `Mis combinaciones`.
- Keep dashboard labels short because they compete with video content. Avoid explanatory paragraphs inside the dashboard chrome.
- Reserve large headings for page-level context. Inside cards, sidebars, dialogs, and control panels, use compact headings and metadata-sized supporting copy.
- Keep letter spacing neutral and avoid decorative typography. Text should be easy to scan for long sessions.
- Error and empty-state copy should describe the condition and the next useful action without exposing provider details, private operational context, or credentials.

## Layout

- Dashboard pages should prioritize the video grid and keep controls dense but readable.
- The sidebar should remain a persistent desktop tool and a temporary mobile drawer.
- Player tiles should keep stable dimensions with `aspect-video`, predictable controls, and overlays that do not hide essential channel context.
- Secondary pages such as public combos, saved combinations, profile, settings, and auth should reuse the dashboard language with simpler layouts.
- Avoid nested cards. Use cards for discrete repeated items, forms, modals, and framed tools, not for every page section.
- Keep mobile layouts single-column where scanning or interaction would otherwise become cramped.
- Preserve stable dimensions for fixed-format elements such as player tiles, preset controls, icon buttons, channel rows, and metadata badges. Hover, loading, pending, and long-label states should not shift the grid.
- Keep the dashboard denser than secondary pages, but do not compress touch targets below comfortable mobile use. When density and touch ergonomics conflict, preserve the user action and allow labels to wrap or collapse to an accessible icon control.
- Public combo, auth, profile, settings, and saved-combo pages may use more whitespace than the dashboard, but should still feel connected through dark surfaces, red primary actions, neutral borders, and compact metadata.

## Responsive Behavior

- Desktop dashboard: keep sidebar navigation and channel discovery persistent, with the player grid as the dominant surface.
- Mobile dashboard: use a temporary drawer for channel discovery, keep primary grid and global controls visible, and avoid side-by-side layouts that force cramped controls.
- Player grid: maintain `aspect-video` tiles, predictable overlays, and control placement across presets. Long channel names should truncate or wrap in a controlled way without covering controls.
- Secondary pages: default to single-column mobile layouts and use multi-column desktop layouts only when comparison or grouping benefits scanning.
- Dialogs and sheets should fit small screens without hiding primary actions, close affordances, or validation messages.

## Components

- Reuse `components/ui/*` primitives before introducing new wrappers.
- Use `Button` variants for command actions and links that behave like commands.
- Use `Badge` only for compact metadata such as live state, visibility, counts, and channel categories.
- Use Lucide icons for recognizable controls such as play, pause, mute, volume, fullscreen, copy, favorite, layout, menu, close, settings, and navigation.
- Prefer familiar icon-only controls for compact dashboard tools when the meaning is clear. Use icon plus text for primary actions, destructive actions, unfamiliar commands, or secondary pages where space is available.
- Icon-only controls need accessible labels through visible text, `aria-label`, or nearby context. Add tooltips or visible affordances when the icon is not self-evident.
- Prefer existing Radix-backed primitives for dialogs, switches, labels, and future menu/tab interactions.
- Controls that trigger async work need disabled or pending states that prevent duplicate actions. Keep pending labels short and stable.
- Destructive actions should remain visually distinct and require an interaction pattern appropriate to the risk, such as a dialog, clear destructive button, or explicit copy.
- Form controls should keep labels visible or programmatically associated. Placeholder text is not a replacement for labels.

## Motion And Reduced Motion

- Add motion only when it clarifies state, ordering, loading, drag feedback, or responsiveness. Do not add ornamental motion.
- Respect OS and Vision AR reduced-motion preferences. Disable continuous ticker movement or spatial movement while preserving static status affordances.
- Ticker behavior should never become the dominant visual event. Under reduced motion, show static or paused content rather than a continuously moving strip.
- Drag feedback should identify the active tile and drop target without making the whole grid visually noisy.
- Hover and transition effects should remain restrained. Border, background, opacity, or text-color shifts are enough for most controls.

## Interaction States

- Focus states must be visible on keyboard navigation.
- Disabled and pending states must prevent duplicate actions and communicate reduced availability through opacity or disabled controls.
- Empty states should state the current condition and the next useful action without instructional bulk.
- Error states should be short, recoverable, and public-safe. Do not expose provider details or private operational context.
- Keyboard behavior should preserve dashboard speed: focus should be visible, Escape should close temporary surfaces where appropriate, and icon-only controls should be reachable.
- Live, favorite, selected, focused, muted, paused, disabled, loading, and error states should be distinguishable without relying only on color.

## Surface Checklist

Use this checklist when reviewing design work:

- `/`: dashboard shell, sidebar, header, preset controls, ticker, player tiles, featured combinations.
- `/combo/[id]`: public read-only combo layout, favorite/copy/open actions, empty or invalid channel handling.
- `/mis-combinaciones`: saved and recent combo lists, empty states, destructive actions.
- `/ingresar` and `/registrarse`: auth panels, form labels, validation, alternate auth actions.
- `/perfil`: avatar, profile form, account summary, sign-out action.
- `/configuracion`: preference controls, switches, form spacing, save states.
- Shared primitives: `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Dialog`, `Switch`, `Avatar`, `Separator`, and `Label`.

## Validation

For design changes, run the validation path appropriate to the touched files:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run skills:validate` when `.agents/skills`, `docs/skills`, `scripts/validate-skills.mjs`, or `AGENTS.md` changes

Also perform responsive visual QA for the surfaces listed above using `docs/design/visual-qa-checklist.md`. Check keyboard focus, mobile sidebar behavior, player controls, save-combo dialog behavior, empty states, reduced-motion behavior, disabled and pending states, and long Spanish text wrapping.
