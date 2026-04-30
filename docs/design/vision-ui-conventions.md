# Vision AR UI Conventions

This document captures the reusable UI conventions for Vision AR. It exists so design changes stay consistent across the dashboard, public combo pages, saved-combo library, auth, profile, settings, and shared UI primitives.

## Product Direction

- Vision AR is a dark, monitoring-focused multiview product for Argentine news channels.
- The dashboard grid is the primary surface. Navigation, cards, and supporting panels should help users compare signals without competing with the players.
- Keep the interface Spanish-first and operational. Copy should be short, concrete, and oriented around watching, comparing, saving, and sharing signals.
- Preserve the current visual language unless a ticket explicitly changes it. Avoid generic redesigns, marketing-style sections, decorative backgrounds, or unrelated visual drift.

## Visual System

- Use Tailwind tokens from `app/globals.css` and `tailwind.config.ts` before adding new colors or utilities.
- The main palette is near-black surfaces, white translucent borders, red primary actions, neutral text, and occasional channel accents.
- Use red primarily for product identity, live status, focus rings, and primary actions. Do not turn every status, card, or decoration red.
- Use channel `accent` colors as small identifying swatches only. They should not redefine the page palette.
- `glass-panel` is appropriate for sticky or high-level dashboard chrome. Do not use it for every repeated item.
- Rounded cards and controls are already part of the product language. Keep radii consistent with existing `Card`, `Button`, `Badge`, and player tile treatments.
- Shadows and backdrop blur should stay subtle. The app should feel like a live operations console, not a landing page.

## Layout

- Dashboard pages should prioritize the video grid and keep controls dense but readable.
- The sidebar should remain a persistent desktop tool and a temporary mobile drawer.
- Player tiles should keep stable dimensions with `aspect-video`, predictable controls, and overlays that do not hide essential channel context.
- Secondary pages such as public combos, saved combinations, profile, settings, and auth should reuse the dashboard language with simpler layouts.
- Avoid nested cards. Use cards for discrete repeated items, forms, modals, and framed tools.
- Keep mobile layouts single-column where scanning or interaction would otherwise become cramped.

## Components

- Reuse `components/ui/*` primitives before introducing new wrappers.
- Use `Button` variants for command actions and links that behave like commands.
- Use `Badge` only for compact metadata such as live state, visibility, counts, and channel categories.
- Use Lucide icons for recognizable controls such as play, pause, mute, fullscreen, copy, favorite, layout, menu, and navigation.
- Icon-only controls need accessible labels through visible text, `aria-label`, or nearby context.
- Prefer existing Radix-backed primitives for dialogs, switches, labels, and future menu/tab interactions.
- Add motion only when it clarifies state, ordering, loading, or responsiveness. Do not add ornamental motion.
- Respect OS and Vision AR reduced-motion preferences. Disable continuous ticker or spatial movement while preserving static status affordances.

## Interaction States

- Focus states must be visible on keyboard navigation.
- Hover states should be restrained: border, background, or text-color shifts are enough for most controls.
- Disabled and pending states must prevent duplicate actions and communicate reduced availability through opacity or disabled controls.
- Empty states should state the current condition and the next useful action without instructional bulk.
- Error states should be short, recoverable, and public-safe. Do not expose provider details or private operational context.

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

Also perform responsive visual QA for the surfaces listed above. Check keyboard focus, mobile sidebar behavior, player controls, save-combo dialog behavior, empty states, and long Spanish text wrapping.
