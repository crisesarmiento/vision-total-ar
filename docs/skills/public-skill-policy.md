# Public Skill Policy

Vision AR is a public repository. Repo-scoped skills in `.agents/skills` are public maintainer and contributor guidance, not a place for private operations.

## Allowed

- Public repo workflows: branch model, PR expectations, validation commands, release flow, issue triage, and documentation updates.
- Public architecture guidance derived from committed code, public docs, and non-sensitive decisions.
- Public-safe infrastructure guidance such as which workflow file to inspect or which documented runbook to follow.
- Links to public GitHub, Linear issue identifiers, Vercel preview behavior, and public documentation.

## Not Allowed

- API keys, tokens, passwords, private keys, database URLs, or copied environment values.
- Private dashboard URLs, production-only account paths, or personal account preferences.
- Exploit details or vulnerability reproduction steps that belong in private disclosure.
- Instructions that bypass `SECURITY.md`, branch protection, reviews, or production approval gates.
- Client-specific or non-public operational data.

## Review Standard

Every public skill change should answer three questions before merge:

- Can a contributor read this without gaining private access knowledge?
- Does this duplicate secrets or secret-adjacent operational context?
- Does this point to public docs or private maintainer skills when sensitive detail is needed?

Run `npm run skills:validate` before opening a PR. The validator catches structure errors and obvious secret-like patterns, but human review is still required.
