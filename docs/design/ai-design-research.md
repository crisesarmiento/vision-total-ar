# AI Design Research

This memo records the CRIS-268 research recommendation for OpenAI-assisted design work in Vision AR. It is intentionally research-only: no OpenAI API route, SDK setup, billing path, user data flow, environment variable, schema change, or production feature is part of this ticket.

Checked on 2026-05-01 against official OpenAI documentation.

## Official References

- [Latest model guide](https://developers.openai.com/api/docs/guides/latest-model): identifies `gpt-5.5` as the current latest model and recommends outcome-first prompts, explicit success criteria, reasoning effort tuning, structured outputs, prompt caching, and tool-specific guidance.
- [Prompt engineering coding guidance](https://developers.openai.com/api/docs/guides/prompt-engineering#coding): recommends clear engineering roles, structured tool use, validation, clean Markdown output, and front-end prompts that specify visual standards, UI states, file structure, reusable components, and tests.
- [Migrate to Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses): recommends Responses for new projects that need agentic loops, built-in tools, multi-turn state, multimodal inputs, and reasoning model support.
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs): recommends JSON Schema-backed outputs when downstream code or review workflows need reliable machine-consumable structure.
- [Image generation guide](https://developers.openai.com/api/docs/guides/image-generation): documents Image API and Responses API image generation, multi-turn editing, quality/size controls, streaming, limitations, and cost considerations.
- [GPT Image 2 model page](https://developers.openai.com/api/docs/models/gpt-image-2): identifies `gpt-image-2` as the current state-of-the-art image generation and editing model with flexible image sizes and high-fidelity image inputs.

## Research Goals

- Evaluate how OpenAI-assisted workflows can help Vision AR audit UI consistency, draft design conventions, and explore mockups without shipping an AI feature.
- Keep all research inputs public-safe: screenshots, prompts, and notes must avoid credentials, private dashboard URLs, personal account paths, production data, and non-public operational details.
- Produce follow-up implementation tickets only when the use case, data boundary, model rationale, fallback behavior, validation path, acceptance tests, and cost/risk owner are explicit.

## Current Guidance Summary

### Model Fit

`gpt-5.5` is the best fit for maintainer-facing design research because the work needs long-context repo reading, product-spec-to-plan reasoning, structured recommendations, tool use, and careful preservation of Vision AR's existing UI direction.

Recommended starting configuration for future experiments:

- Use `gpt-5.5`.
- Start with `reasoning.effort: "medium"` for design audits and planning.
- Evaluate `low` only after representative prompts produce stable results.
- Use higher reasoning effort only when a benchmarked design-review workflow proves the added latency and cost are justified.
- Keep prompts outcome-first: describe the user-facing goal, Vision AR design constraints, allowed side effects, evidence rules, and required output shape.

### Responses API Fit

Responses API is the recommended future interface for any AI-assisted design workflow that needs agentic behavior, multi-turn state, tool use, or image generation inside a conversational flow.

Relevant fit for Vision AR:

- A maintainer assistant could inspect repo files, design docs, and route screenshots, then return structured findings.
- Multi-turn design review could preserve previous findings with `previous_response_id` or explicit returned output items.
- Built-in tools, including image generation, are a better fit than custom orchestration for exploratory workflows.
- Any stateless or privacy-sensitive workflow must explicitly decide whether to use `store: false`, encrypted reasoning items, or a stricter no-user-data boundary.

Responses API is not a reason to add product integration now. It is only the recommended API surface if a later ticket authorizes an implementation.

### Structured Outputs Fit

Use Structured Outputs for any future machine-consumable design recommendation, such as an audit result that feeds a Linear issue draft, checklist item, or PR note.

Candidate output shape:

- `summary`
- `findings`
- `severity`
- `surface`
- `evidence`
- `recommendation`
- `requiresFollowUp`
- `riskNotes`

Do not rely on prompt-only JSON instructions when the output will drive automation. Use a schema and keep TypeScript/Zod definitions aligned if the workflow becomes code.

### Front-End Prompting Fit

Official front-end prompting guidance maps well to Vision AR because the app already has explicit UI conventions and reusable primitives.

Future prompts should name:

- Stack and primitives: Next.js App Router, React, TypeScript, Tailwind, shadcn-style primitives, Radix, Lucide, and Motion.
- Visual constraints: dark-first monitoring console, near-black surfaces, red primary/live/focus treatment, neutral text, channel accents, and no decorative redesign.
- Interaction states: hover, focus, selected, live, favorite, loading, disabled, empty, error, pending, and reduced motion.
- Accessibility requirements: accessible names for icon controls, visible focus, associated labels, keyboard reachability, and non-color-only state.
- Evidence requirements: changed files, routes checked, validation commands, skipped checks, and visual QA notes when UI changes are in scope.

### GPT Image Fit

`gpt-image-2` is useful for research-only mockups, visual exploration, and controlled image edits when the artifact is clearly labeled as non-production reference material.

Relevant guidance:

- Use the Image API for one-off generation or editing.
- Use Responses API image generation for conversational, multi-turn, or tool-driven exploration.
- Keep prompts structured around goal, subject, key details, composition, constraints, and what must remain unchanged.
- Repeat invariants on every edit: Vision AR name, dark monitoring console direction, Argentine news multiview context, and no fake provider data.
- Use lower quality for quick drafts when acceptable; use medium or high only when text, layout, or detailed mockup fidelity matters.

Known limitations matter for UI work: text placement can still be imperfect, visual consistency across generations can drift, precise layout composition can be hard, complex prompts may add latency, and image inputs can affect cost.

## Candidate Workflows

### Design Audit Assistant

Use an internal maintainer workflow to inspect existing routes and components, compare them against `docs/design/vision-ui-conventions.md`, and return findings grouped by severity.

Recommended model rationale: `gpt-5.5` is suitable because the task needs long-context codebase reading, visual consistency reasoning, and structured planning. Start with medium reasoning for balanced quality and latency; test lower effort only after a representative audit produces stable findings.

Required constraints:

- Read-only unless a separate implementation ticket authorizes edits.
- Cite files and routes for every finding.
- Separate design drift from functional bugs.
- Do not invent new product direction.
- Return Structured Outputs if the findings will feed automation or issue creation.

Recommendation: worth follow-up as an internal maintainer tool after a separate ticket defines exact inputs, output schema, privacy rules, and validation.

### Scoped Design-Review Prompt Templates

Use prompt templates for scoped design tickets such as dashboard/player polish, secondary-surface alignment, or visual QA review.

Prompt shape:

```text
Goal: Polish the Vision AR [surface] while preserving the existing dark multiview design language.
Success criteria: The change reuses existing UI primitives, keeps Spanish copy concise, preserves dashboard priority, and passes lint, typecheck, tests, and build.
Constraints: No schema changes, no auth changes, no public API changes, no OpenAI integration, no credentials or private URLs in docs.
Evidence: Report changed files, validation commands, and any skipped checks.
```

Recommendation: worth follow-up as documentation or internal maintainer guidance. This can remain prompt-only unless automation is introduced later.

### Image And Mockup Exploration

Use image generation or editing only for non-production reference material such as layout moodboards, component explorations, or comparative mockups.

Required constraints:

- Mark generated images as research artifacts, not product assets.
- Restate invariants on each iteration: Vision AR name, dark monitoring console direction, Argentine news multiview context, and no fake provider data.
- Do not use generated images as final UI assets without a separate design and licensing review.

Recommendation: worth follow-up only for research artifacts. Defer production asset usage until a design and licensing review exists.

## Deferred Ideas

Defer these ideas until separate tickets define product value, public-safe data flow, fallback behavior, validation, and cost ownership:

- User-facing AI design features inside Vision AR.
- Automatic UI generation or direct code mutation inside the product.
- Production image asset generation or generated brand assets.
- AI workflows that send private screenshots, account data, production telemetry, credentials, private URLs, or user-generated content to OpenAI.
- Any background job, rate-limited service, billing path, logging path, or admin workflow that depends on OpenAI API calls.

## Follow-Up Issue Template

A future AI implementation ticket must define:

- The exact user or maintainer workflow being automated.
- Whether the feature is internal-only, admin-only, or user-facing.
- Which data is sent to OpenAI and why it is safe to send.
- Model choice, reasoning effort, expected output shape, and whether Structured Outputs are required.
- Data boundary, storage mode, logging rules, and privacy/trust notes.
- Fallback behavior when OpenAI is unavailable, slow, expensive, or returns low-confidence output.
- Validation plan, including representative prompts, rejection cases, accessibility expectations, and visual QA if UI output is involved.
- Acceptance tests or review checklist.
- Cost controls, rate limits, abuse controls, and owner for ongoing monitoring.
- Public documentation updates and any private maintainer notes required.

Until that exists, Milestone 7 AI work remains documentation and research only.
