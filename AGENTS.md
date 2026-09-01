# AGENTS.md

<!-- TODO(template): this file is the always-loaded instruction set for every
     agent session (CLAUDE.md points here, so Claude Code, and any other tool
     reading AGENTS.md, share it). Keep it SHORT — one-line rules with
     pointers into skills for the detail. Replace every TODO below. -->

## Setup commands

- Run tests (CI and Agents): <!-- TODO(template): e.g. `npm run test:ci` -->
- Type check: <!-- TODO(template): e.g. `./node_modules/.bin/tsc --noEmit` -->

## Git & PRs

- The integration branch is **`main`**. <!-- TODO(template): if you integrate
  on develop/trunk/etc., say so here — agents will otherwise target the
  default branch — and update the `branches:` filters in
  .github/workflows/. -->
- Open all PRs against the integration branch; cut feature branches from
  `origin/<integration-branch>` after `git fetch`.

## Feature artifacts & the development loop

- Feature work is tracked as version-controlled artifacts in
  `intent/<yyyy-mm>-<slug>/`: `intent.md` (why — via `/intent`) → `spec.md`
  (what, with acceptance criteria + policy constraints — via `/spec`) →
  `plan.md` (how — save the approved plan-mode output there before
  implementing). See `intent/README.md`. Small changes may skip the chain.
- The full loop: signal (Sentry/analytics/user) → `/intent` → `/spec` → plan
  mode → implement → automatic Claude PR review against `REVIEW.md` (Pass 3
  checks the diff against the spec's acceptance criteria when the PR body
  links the intent dir) → recurring findings become `Skill gap:` lines →
  captured via the **skill-maintenance** skill → config changes to
  `CLAUDE.md`/`AGENTS.md`/`.claude/**` are gated by the config-evals CI job.
  The Sentry maintain loop feeds new `intent.md` drafts back into the top.

## Project skills

Reusable, codebase-specific know-how lives as skills in `.claude/skills/`.
Consult the relevant skill before working in its area:

- **code-conventions** — <!-- TODO(template): create this skill (copy
  .claude/skills/_template/) and list your review-enforced house rules the
  compiler does not catch. --> See `.claude/skills/code-conventions/SKILL.md`.
- **skill-maintenance** — when/how to propose or update skills. **Whenever a
  PR review comment, a repeated correction, or a discovered gap reveals a
  reusable convention not yet captured in a skill, follow this skill to propose
  or update one.** See `.claude/skills/skill-maintenance/SKILL.md`.

**Self-improving skills (always-on).** The rule
`.claude/rules/skill-self-improvement/RULE.md` is loaded every session. It makes
the agent *propose* a new or improved skill whenever a reusable gap or a wrong
skill surfaces — and never write a `SKILL.md`/`RULE.md` without explicit approval.
`skill-maintenance` is the procedure it points to, and a turn-end hook
(`.claude/hooks/skill-gap-reminder.sh`) nudges the same reflection.

## Code style

<!-- TODO(template): your language/framework rules, e.g.:
- TypeScript strict mode, no `any`/`unknown`
- Which UI library, which data-fetching library, which date library -->

## Testing

<!-- TODO(template): test frameworks, where test files live, verification
     requirements (e.g. "verify UI changes in a browser before done"). -->

## Observability

<!-- TODO(template): if you use Sentry: every new/modified `catch` reports via
     Sentry.captureException — EXCEPT standalone CI scripts, which never
     initialize the SDK and must fail loudly via exit code + workflow
     notification instead. -->
