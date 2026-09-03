---
name: spec
description: >
  Turn an accepted intent.md into a spec.md with numbered acceptance criteria
  and a policy-constraint pass over this repo's policy skills. Use when the
  user says "/spec", "write the spec for <intent>", "spec this out", or after
  an intent created by /intent or the maintain loop is accepted. The spec's
  acceptance criteria are what the automated PR review (REVIEW.md Pass 3)
  checks diffs against, so every field, type, route or component a criterion
  names must be GROUNDED in the code (grep it, cite file:line) — the intent's
  prose is not a schema, and an AC that cites a field nobody defined stalls
  plan mode one stage too late. ALSO covers what to do when plan mode,
  implementation or review finds a criterion wrong: amend spec.md first,
  record it under ## Decisions, and route the call by defect kind. Human-
  initiated only — there is deliberately NO CI trigger for spec generation.
compatibility: Repos with an intent/ directory at the root (this template).
metadata:
  version: "1.1"
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

   **Ground every EXISTING name in the code.** Any field, type, prop, API
   route, component, env var or table an AC cites as already there must exist
   in the checkout: grep it and put the `file:line` in the AC (e.g.
   "`Team.shortCode`, `types/team.ts:6`"). If the intent's prose names
   something that does not exist, do NOT carry the name into the AC as if it
   did — write what the code actually has and note the substitution in the
   spec's Summary. The intent is written by a person from memory; it is not
   a schema.

   Things the feature will CREATE are named freely — that is what the
   Affected surfaces and Data / API contracts sections are for — but marked
   so a reader can't mistake them for existing code: "`NEW`
   `components/LiveTracker.tsx`", "`NEW` field `Fixture.trackerState`". The
   rule is about which names claim to exist, not about how many exist.

   *(Origin: a spec whose AC 2 said "prefer the API's `short_name`" when the
   only real field was a 3-letter `short_code`. Plan mode had to stop and ask
   a three-option question; a grep at spec time would have caught it.)*
4. **Fill the remaining sections** (surfaces, contracts, test plan, out of
   scope). The test plan names which loop must be green: unit tests, type
   check, browser verification, evals.
5. **Propose, then confirm** — show the draft before writing the file.
6. Next step: a plan-mode session producing `plan.md` in the same directory.

## When a later stage finds the spec wrong

Plan mode, the implementation, or the review will sometimes surface a
criterion that is wrong. The spec is what Pass 3 checks the diff against, so
**the spec is amended first — never worked around silently.** Fix the
criterion in place and add a dated entry under `## Decisions` saying what
changed and why; the amendment ships in the same PR as the code. Who decides
depends on the defect:

| Defect | Example | Decides | Goes to |
|---|---|---|---|
| Factual error about the code | the AC names a field that doesn't exist | engineer, on the spot | amended AC + Decisions entry |
| Ambiguous / conflicting behaviour | two ACs can't both hold on mobile | product owner | amended AC; PO acknowledges on the PR |
| Policy conflict | an AC wants what a policy skill forbids | engineer, citing the skill | Policy constraints + Decisions |
| The intent's outcome is wrong | the fix reveals the desired outcome is off | product owner — back to `/intent` | intent.md, then re-run `/spec` |

Plan mode cannot edit files, so from a plan session the amendment becomes
**step 1 of the plan** ("update spec.md AC n and add the Decisions entry;
commit before any code change"), and `plan.md` records the choice too.

## Don't

- Don't cite a field, type, route or component in an AC as existing unless
  you found it in the codebase this session — grep first, cite `file:line`;
  mark what the feature will create as `NEW`.
- Don't let a later stage build to an interpretation the spec doesn't state;
  amend the spec, then build.
- Don't skip the constraint pass or cite a skill you didn't read this session.
- Don't write code or plan.md — this skill ends at spec.md.
- Don't wire spec generation into CI; it stays human-triggered.
