---
name: spec
description: >
  Turn an accepted intent.md into a spec.md with numbered acceptance criteria
  and a policy-constraint pass over this repo's policy skills. Use when the
  user says "/spec", "write the spec for <intent>", "spec this out", or after
  an intent created by /intent or the maintain loop is accepted. The spec's
  acceptance criteria are what the automated PR review (REVIEW.md Pass 3)
  checks diffs against. Human-initiated only — there is deliberately NO CI
  trigger for spec generation.
compatibility: Repos with an intent/ directory at the root (this template).
metadata:
  version: "1.0"
---

# /spec — write the spec for an intent

Create `spec.md` next to a given `intent/<slug>/intent.md`, from
`intent/_templates/spec.md`.

## Procedure

1. **Read the target `intent.md` in full.** If its Status is not `accepted`,
   confirm with the user before speccing a draft.
2. **Mandatory constraint pass.** Read, in full, the SKILL.md of every policy
   skill whose domain the intent touches, per this mapping (multiple rows
   usually apply; "any code" always does):

   <!-- TODO(template): fill this table with YOUR policy skills — one row per
        domain area a spec could touch. Keep the "any code" row and point it
        at your conventions skill. -->

   | Intent touches | Read `.claude/skills/…/SKILL.md` |
   |---|---|
   | any code at all | `code-conventions` |
   | <domain area, e.g. payments/gating> | `<skill-name>` |
   | <domain area, e.g. URLs/domains/redirects> | `<skill-name>` |
   | <domain area, e.g. UI copy/labels> | `<skill-name>` |

   The table lists the current policy skills, but treat it as a floor, not a
   ceiling: scan `.claude/skills/` for any newer skill whose description
   matches the intent's domain before declaring the pass complete.

   Distill every applicable rule into the spec's **Policy constraints**
   section, each cited by skill name (and section number where the skill has
   one). Flag conflicts between the intent and a policy explicitly — the user
   resolves them before the spec is accepted, not the implementer later.
3. **Write the acceptance criteria** — numbered, each independently checkable
   from the diff plus a running session. These are consumed verbatim by
   REVIEW.md Pass 3, so vague criteria produce vague reviews.
4. **Fill the remaining sections** (surfaces, contracts, test plan, out of
   scope). The test plan names which loop must be green: unit tests, type
   check, browser verification, evals.
5. **Propose, then confirm** — show the draft before writing the file.
6. Next step: a plan-mode session producing `plan.md` in the same directory.

## Don't

- Don't skip the constraint pass or cite a skill you didn't read this session.
- Don't write code or plan.md — this skill ends at spec.md.
- Don't wire spec generation into CI; it stays human-triggered.
