---
name: vision-ticket-flow
description: Use when working a Vision AR Linear issue through the repo workflow: branch from develop, implement on a feature/fix/chore branch, open a PR to develop, keep Linear and GitHub Project status aligned, and verify completion after merge.
---

# Vision Ticket Flow

Use this skill when a task names a Linear issue, asks to start a ticket, asks to create a PR, or asks why Linear/GitHub status is out of sync.

Read root `AGENTS.md` first for current project context, workflow rules, and skill-maintenance expectations.

## Workflow

1. Read the Linear issue and confirm project `Vision AR`, team `CRIS`, assignee, priority, labels, cycle, and milestone.
2. Start from updated `develop`.
3. Create or use a branch containing the issue ID:
   - `feature/CRIS-###-slug` for features
   - `fix/CRIS-###-slug` for bugs
   - `chore/CRIS-###-slug` for maintenance
4. Move the Linear issue to `In Progress` only when real implementation work begins.
5. Open PRs to `develop`, not `main`, unless the task is an explicit release PR.
6. Include the issue ID in the PR title or body.
7. Fill PR metadata before handing off:
   - assign the PR to the maintainer/current user unless the task says otherwise
   - apply only existing GitHub labels that fit the change
   - keep the PR body public-safe and include summary, validation, blockers, and linked follow-ups
   - keep draft PRs in an implementation state and ready PRs in review state
8. Add the PR to the Vision Total AR GitHub Project if it is not automatic, then align the GitHub Project status with the Linear issue status:
   - Linear `Todo` or `Backlog` maps to GitHub Project `Todo`
   - Linear `In Progress` maps to GitHub Project `In Progress`
   - Linear `In Review` maps to GitHub Project `In Review`
   - Linear `Done` or `Closed` maps to GitHub Project `Done`
9. Move Linear to `In Review` once reviewable PR work exists.
10. After merge, verify Linear moved to `Done`; if not, apply the manual fallback.

## Public Safety

Do not include credentials, private dashboard URLs, database connection strings, or account-specific operational steps in issue or PR text. Reference public runbooks for public workflows and private maintainer skills for sensitive production operations.
