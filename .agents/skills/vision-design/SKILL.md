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

## Implementation Notes

- Use existing components and Tailwind conventions before adding new abstractions.
- Keep dashboard interactions predictable across desktop and mobile.
- Add motion only when it clarifies state or improves perceived responsiveness.
- Validate responsive behavior and accessibility basics for interactive controls.
- For AI-assisted design research, keep work documentation-first unless a separate implementation ticket authorizes API integration, user data flow, billing, and production validation.

Document design decisions in the PR when a change affects reusable patterns or user workflow.
