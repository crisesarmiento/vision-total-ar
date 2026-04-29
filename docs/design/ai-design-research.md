# AI Design Research

This memo records the CRIS-267 research boundary for OpenAI-assisted design work. It is intentionally research-only: no OpenAI API route, SDK setup, billing path, user data flow, environment variable, or production feature is part of this epic.

## Official References

- [Latest model guide](https://developers.openai.com/api/docs/guides/latest-model): current latest guidance identifies `gpt-5.5` and recommends outcome-first prompts, explicit success criteria, and intentional reasoning effort.
- [Prompt engineering coding guidance](https://developers.openai.com/api/docs/guides/prompt-engineering#coding): front-end work benefits from explicit visual standards, UI states, file structure, reusable components, testing expectations, and clean Markdown output.
- [Image generation prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide): image and mockup workflows should use explicit constraints, separate what should change from what must remain stable, and iterate in small changes.

## Research Goals

- Evaluate how OpenAI-assisted workflows can help Vision AR audit UI consistency, draft design conventions, and explore mockups without shipping an AI feature.
- Keep all research inputs public-safe: screenshots, prompts, and notes must avoid credentials, private dashboard URLs, personal account paths, production data, and non-public operational details.
- Produce follow-up implementation tickets only when the use case, data boundaries, model rationale, validation path, and cost/risk owner are explicit.

## Candidate Workflows

### Design Audit Assistant

Use an agentic coding workflow to inspect existing routes and components, compare them against `docs/design/vision-ui-conventions.md`, and return findings grouped by severity.

Recommended model rationale: `gpt-5.5` is suitable because the task needs long-context codebase reading, visual consistency reasoning, and structured planning. Start with medium reasoning for balanced quality and latency; test lower effort only after a representative audit produces stable findings.

Required constraints:

- Read-only unless a separate implementation ticket authorizes edits.
- Cite files and routes for every finding.
- Separate design drift from functional bugs.
- Do not invent new product direction.

### Prompted UI Polish

Use prompt-guided implementation only for scoped tickets such as dashboard/player polish or secondary-surface alignment.

Prompt shape:

```text
Goal: Polish the Vision AR [surface] while preserving the existing dark multiview design language.
Success criteria: The change reuses existing UI primitives, keeps Spanish copy concise, preserves dashboard priority, and passes lint, typecheck, tests, and build.
Constraints: No schema changes, no auth changes, no public API changes, no OpenAI integration, no credentials or private URLs in docs.
Evidence: Report changed files, validation commands, and any skipped checks.
```

### Image And Mockup Exploration

Use image generation or editing only for non-production reference material such as layout moodboards, component explorations, or comparative mockups.

Required constraints:

- Mark generated images as research artifacts, not product assets.
- Restate invariants on each iteration: Vision AR name, dark monitoring console direction, Argentine news multiview context, and no fake provider data.
- Do not use generated images as final UI assets without a separate design and licensing review.

## Deferred Implementation Criteria

A future AI implementation ticket must define:

- The exact user or maintainer workflow being automated.
- Whether the feature is internal-only, admin-only, or user-facing.
- Which data is sent to OpenAI and why it is safe to send.
- Model choice, reasoning effort, expected output shape, and failure behavior.
- Cost controls, rate limits, logging rules, and privacy notes.
- Validation plan, including representative prompts and rejection cases.

Until that exists, CRIS-267 AI work remains documentation and research only.
