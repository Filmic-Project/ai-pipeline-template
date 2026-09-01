# REVIEW.md — automated PR review contract

This file defines the review the **Claude PR Review** workflow
(`.github/workflows/claude-review.yml`) performs on every non-draft PR into
the integration branch. It is also the reference for local `/code-review`
runs. If other review bots (Qodo, Devin, CodeRabbit, …) run on this repo,
do not duplicate their findings (see Exclusions).

<!-- TODO(template): replace the example bullets in Pass 1 and Pass 2 with
     YOUR project's house rules, and point at YOUR conventions skill(s). The
     more concrete the bullets, the better the review. -->

## Review passes (in order)

### Pass 1 — Correctness bugs

Before this pass, **Read `.claude/skills/code-conventions/SKILL.md` in full**
— it is the catalogue of house rules the compiler does not catch.
<!-- TODO(template): create that skill (start from
     .claude/skills/_template/SKILL.md) or change this path. -->
Check the diff for, at minimum:

- Logic errors, unhandled promise rejections, and wrong fallback behavior.
- <!-- TODO(template): e.g. "catch blocks without Sentry.captureException" -->
- <!-- TODO(template): e.g. "manual Date arithmetic instead of date-fns" -->
- <!-- TODO(template): e.g. "DB results consumed in a way that discards sort order" -->

### Pass 2 — Security

<!-- TODO(template): name the security-relevant skills of your repo, e.g.
     authorization/gating rules, origin/domain rules. -->
Check for:

- Missing authorization on gated routes or list surfaces.
- External URLs not validated before reaching an `href` or redirect.
- Secrets, tokens, or credentials in the diff (including test fixtures).
- <!-- TODO(template): project-specific security rules -->

### Pass 3 — Spec compliance

If the PR body links an `intent/<slug>/` directory: read its `spec.md`, check
the diff against the numbered acceptance criteria, and flag both unmet
criteria and scope creep (changes no criterion calls for). If the PR body
links no intent artifact, **skip this pass silently** — do not comment about
its absence.

## Severity ranking

Tag every finding as one of:

- **BLOCKER** — merging this breaks production behavior, data, or security.
- **HIGH** — a real bug or policy violation likely to bite users or on-call.
- **MEDIUM** — a genuine defect with a narrow blast radius or workaround.
- **NIT** — style/polish. Summary-only, **maximum 5**, never inline.

Post inline comments only for BLOCKER/HIGH/MEDIUM. Each finding: severity tag,
`file:line`, one-sentence rationale, and a concrete suggested fix. Post one
summary comment ordering findings by severity. Do not modify any files.

## Exclusions — do not review

- Generated files: <!-- TODO(template): list yours --> `package-lock.json`,
  snapshots, type-sync output.
- Pure-markdown edits under `.claude/` (guarded by the config-evals workflow
  instead).
- Findings other review bots have already posted on this PR. Inline
  review-thread comments are NOT in `gh pr view` — read them via
  `gh api repos/<owner>/<repo>/pulls/<n>/comments` before writing findings,
  and do not restate them. This is best-effort: the apps run independently,
  so a reviewer that posts later can still overlap; the re-review on the next
  push is when convergence happens.

## Recurring findings → skill gap

If a finding's *class* has appeared in previous reviews (search existing PR
comments and recent merged-PR reviews when suspicious), say so, and end the
summary with a line:

```
Skill gap: <existing skill to amend, or proposed new skill name> — <one-line rule to capture>
```

This feeds the repo's skill-self-improvement loop
(`.claude/rules/skill-self-improvement/RULE.md` +
`.claude/skills/skill-maintenance/SKILL.md`): a human turns the `Skill gap:`
line into a skill patch, and the config-evals workflow gates that change.
