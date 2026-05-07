# Milestone 7 Child Ticket Breakdown

CRIS-267 remains the coordinating epic for design consistency and AI design research. The implementation work should be split into linked child tickets so review, validation, and scope stay clear.

## Child Tickets

Linked Linear issues under CRIS-267:

- CRIS-268: Research: review OpenAI model and design-feature docs for Vision AR
- CRIS-269: Chore: audit current Vision AR component design consistency
- CRIS-270: Docs: document Vision AR design system conventions
- CRIS-271: Fix: align shared UI primitives with documented design tokens
- CRIS-272: Fix: improve dashboard and player controls accessibility/responsive polish
- CRIS-273: Fix: normalize secondary page layouts with dashboard conventions
- CRIS-274: Fix: respect reduced motion and long-session readability
- CRIS-275: Test: add visual QA checklist for design changes

### Design Audit And Convention Inventory

Goal: audit current UI surfaces and identify consistency issues before implementation polish.

Scope:

- Review `/`, `/combo/[id]`, `/mis-combinaciones`, `/ingresar`, `/registrarse`, `/perfil`, `/configuracion`, and shared UI primitives.
- Compare route and component behavior against `docs/design/vision-ui-conventions.md`.
- Group findings into dashboard/player, secondary pages, shared primitives, responsive behavior, and accessibility basics.

Acceptance criteria:

- Findings cite concrete files or routes.
- Findings distinguish visual consistency, interaction consistency, and accessibility basics.
- Deferred or out-of-scope items are listed as follow-ups.

Validation:

- Read-only audit. No build is required unless local rendering is used.

### Document Vision AR UI Conventions

Goal: make reusable UI decisions durable and public-safe.

Scope:

- Add or update `docs/design/vision-ui-conventions.md`.
- Link the design docs from `README.md`.
- Update `.agents/skills/vision-design/SKILL.md` when conventions become agent guidance.

Acceptance criteria:

- The doc covers visual language, layout, components, interaction states, surface checklist, and validation.
- Public docs do not include secrets, private dashboard links, account paths, or production credentials.

Validation:

- `npm run skills:validate`
- `npm run lint`
- `npm run typecheck`

### Dashboard And Player Polish

Goal: align the main monitoring experience without changing the product direction.

Scope:

- Polish dashboard header, sidebar, preset controls, ticker placement, player tile overlays, favorite states, and global controls based on audit findings.
- Preserve drag and drop, keyboard shortcuts, iframe behavior, saved layouts, live metadata, and ticker polling.

Acceptance criteria:

- Controls remain readable and stable across desktop and mobile.
- Icon-only controls have accessible names.
- Long Spanish labels do not overflow controls or cards.
- No schema, auth, API, or OpenAI integration changes.

Validation:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- Responsive visual QA for `/`.

### Library, Public Combo, Auth, And Settings Polish

Goal: align secondary surfaces with the dashboard visual language.

Scope:

- Polish saved-combo library, public combo pages, auth panels, profile, and settings.
- Reuse existing `components/ui/*` primitives and Spanish copy style.
- Keep protected-route and session behavior unchanged.

Acceptance criteria:

- Empty states, action grouping, card treatments, and form spacing match the documented conventions.
- Destructive and authentication actions remain clear.
- No database, auth, API, or OpenAI integration changes.

Validation:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- Responsive visual QA for `/combo/[id]`, `/mis-combinaciones`, `/ingresar`, `/registrarse`, `/perfil`, and `/configuracion`.

### AI Design Research Memo

Goal: evaluate OpenAI-assisted design workflows without shipping AI product behavior.

Scope:

- Maintain `docs/design/ai-design-research.md`.
- Cite official OpenAI guidance for latest model selection, front-end prompting, and image-generation prompting.
- Document model rationale, privacy constraints, validation needs, and deferred implementation criteria.

Acceptance criteria:

- Research is explicitly non-production and does not add SDKs, API routes, env vars, billing, or user data flow.
- Any follow-up implementation idea includes model rationale, safety/privacy notes, and validation requirements.

Validation:

- Documentation review.
- `npm run lint` and `npm run typecheck` if linked code comments or imports change.

### Validation And Milestone Closeout

Goal: close Milestone 7 with an accurate status summary.

Scope:

- Confirm each child ticket has validation notes.
- Summarize changed design conventions and deferred ideas.
- Confirm whether `.agents/skills/vision-design/SKILL.md` needs further updates after implementation polish.

Acceptance criteria:

- CRIS-267 has linked child tickets and a final status note.
- Deferred work is captured in follow-up Linear issues, not chat history.
- Public docs remain free of sensitive operational detail.

Validation:

- Run the validation commands required by the child tickets completed in the milestone.
