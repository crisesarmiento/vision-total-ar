---
name: vision-design
description: Use when implementing or reviewing Vision AR frontend design work, including dashboard UI, sidebar behavior, public combo pages, responsive layouts, motion, typography, and visual consistency.
---

# Vision Design

Use this skill for UI implementation, visual QA, and design review.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Principles

- Preserve the established Vision AR visual language unless a ticket explicitly changes it.
- Prioritize clarity for long monitoring sessions: readable labels, stable controls, responsive grids, and low-friction channel discovery.
- Keep Spanish product copy consistent with the app.
- Avoid generic redesigns or unrelated visual drift.
- Use `docs/design/vision-ui-conventions.md` as the durable source for reusable UI conventions.
- Treat the dashboard grid as the primary product surface. Supporting chrome should help users compare live signals without competing with the players.

## Implementation Notes

- Use existing components and Tailwind conventions before adding new abstractions.
- Keep dashboard interactions predictable across desktop and mobile: persistent desktop sidebar, temporary mobile drawer, stable player tiles, and compact but readable controls.
- Use Lucide icons for recognizable commands when available. Icon-only controls need accessible labels and should use tooltips or nearby context when the meaning is not obvious.
- Add motion only when it clarifies state, ordering, loading, drag feedback, or responsiveness. Respect OS and Vision AR reduced-motion preferences, especially for ticker and spatial movement.
- Preserve the dark-first monitoring palette: near-black surfaces, translucent borders, red primary/live/focus treatment, neutral text, and small channel accents.
- Keep cards, glass panels, overlays, dialogs, and page sections consistent with the conventions doc. Avoid nested cards and decorative redesigns.
- Validate responsive behavior, keyboard focus, long Spanish text wrapping, disabled/pending states, and accessible names for interactive controls.
- For AI-assisted design research, keep work documentation-first unless a separate implementation ticket authorizes API integration, user data flow, billing, and production validation.

Document design decisions in the PR when a change affects reusable patterns or user workflow.
