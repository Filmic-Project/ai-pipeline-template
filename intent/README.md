# Feature artifacts: intent → spec → plan

This directory holds the version-controlled artifact chain for feature work
(the Plan/Design stages of the AI-native SDLC loop):

```
intent/<yyyy-mm>-<slug>/
  intent.md   what problem, for whom, what outcome — the WHY   (/intent)
  spec.md     acceptance criteria + policy constraints — the WHAT (/spec)
  plan.md     implementation plan from plan mode — the HOW
```

## Rules

- **One directory per feature/fix**, named `<yyyy-mm>-<slug>`
  (e.g. `2026-09-login-rate-limit`).
- `intent.md` and `spec.md` are created from `_templates/` via the `/intent`
  and `/spec` skills. `plan.md` is the approved plan-mode output, saved before
  implementation starts.
- Artifacts are committed **with the feature PR** (or ahead of it). The PR
  body links the directory; the automated Claude review (see `REVIEW.md`,
  Pass 3) checks the diff against `spec.md`'s acceptance criteria.
- Not every change needs the chain: bug fixes and small changes may skip it
  (say "small change" in the PR template). Anything worth a plan-mode session
  is worth committing the plan here.
- The Sentry maintain loop opens PRs that add an `intent.md` with
  `Source: maintain-loop`. Review the diagnosis, edit freely, merge, then run
  `/spec` on it — that re-enters the normal chain.
