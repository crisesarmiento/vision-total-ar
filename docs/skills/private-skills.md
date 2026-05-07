# Private Maintainer Skills

Use private skills for workflows that are useful to maintainers but unsafe or noisy in a public repo.

## Where To Store Them

- Personal machine: `~/.codex/skills`
- Shared maintainer workflow: private skills repository or private Codex plugin

Do not copy private skill content into `.agents/skills`.

## Private-Only Examples

- Production incident response using real credentials or provider-specific account paths.
- Personal GitHub, Linear, Vercel, Neon, or monitoring preferences.
- Database URLs, API keys, tokens, secret names with values, or exact recovery commands containing private endpoints.
- Security investigation playbooks that include exploit details before disclosure.

## Public Pointer Pattern

Public skills may say: "Use the private incident-response skill if production credentials or private dashboards are required."

Public skills must not include the private steps themselves.

## Maintenance

Keep private skills short, task-focused, and separate from repo code. If a private workflow becomes safe and useful for contributors, extract only the public-safe part into `.agents/skills` and keep credentials or account-specific details private.
