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
  record it under ## Decisions, and route the call by defect kind. ALSO
  covers the checkability pass every AC must survive before the spec is
  accepted — the four shapes that read as criteria but cannot be verified
  from outside the code (diff-only wording, test-only behaviour, process
  claims, post-launch measurement) and the rewording for each. ALSO use when
  a spec links a Claude Design canvas: read the canvas with DesignSync BEFORE
  writing criteria and diff it against them before flipping Status to
  accepted — it is non-normative, it drifts, and REVIEW.md Pass 3 never sees
  it. ALSO use when an intent constraint says something does NOT exist yet
  (an asset, a helper, a route) and scopes in producing it — an absence claim
  is grounded with `find`/`ls` over the asset directories, not a code grep,
  which returns nothing for an unreferenced file that is sitting right there.
  Human-initiated only — there is deliberately NO CI trigger for spec
  generation.
compatibility: Repos with an intent/ directory at the root (this template).
metadata:
  version: "1.2"
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
3. **If a design canvas exists, read it BEFORE writing criteria.** A linked but
   unread canvas is worse than no link: it reads as "settled somewhere else"
   and leaves the spec parked in `draft` behind placeholder OPEN values.

   - **How to read one.** `DesignSync` `list_files` then `get_file`, with the
     uuid from the canvas's `/design/p/<uuid>` URL as `projectId`. The
     `Artifact` tool **refuses** that URL — it only accepts
     `…/code/artifact/<uuid>`, which a canvas does not have. Needs
     `/design-consent` once per session; `/design-login` is not available in a
     non-interactive session.
   - **Transcribe, don't cite.** Pass 3 reads `spec.md` and nothing else, so a
     number that lives only on the canvas is invisible to review. Move each
     value into the criterion it feeds, and leave behind a resolved table
     saying *which* criterion now carries it.
   - **Diff in three directions, because canvas and spec drift both ways:**
     values the canvas settles that the spec left open; **criteria added after
     the canvas was drawn** — it will be silent on them, and silence is absence
     of design, never assent; and canvas prescriptions that *contradict* a
     criterion or an intent non-goal.
   - **Record the read** in the spec header (`Canvas read: <date>`, file name,
     artboard count). That is what tells the next reviewer "settled on the
     canvas" from "nobody opened it".
   - **Never let an implementer resolve a conflict silently.** Contradictions
     go in a *Decisions to settle* section with a recommendation each, and the
     spec stays `draft` until they close — same rule as step 2's policy
     conflicts.
   - A canvas is hand-authored static HTML: not your real component theme, not
     your real breakpoints, no real data. It never satisfies a criterion that
     needs a layout engine or a production build.
4. **Write the acceptance criteria** — numbered, each independently checkable
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

   **Ground ABSENCE claims too.** A constraint of the form "no X exists yet,
   producing it is in scope" is a claim about the repo and gets the same check
   as a name — but a different command. A code grep proves only that nothing
   *references* X; an asset, a template or a helper can sit unreferenced in
   `public/`, `assets/` or `lib/` and still be exactly what the intent wants.
   Look for the file itself:

   ```bash
   find public assets -iname '*<term>*'      # assets: by name, not by reference
   grep -rln '<term>' lib components app     # code: a helper nobody imports yet
   ```

   If it exists, the scope shrinks: drop the production work from the spec,
   note the substitution in the Summary, and record it under `## Decisions` as
   a factual call (engineer decides). Check this BEFORE writing the criteria
   that would have consumed the new artefact — an AC that budgets for
   producing something that already exists is as wrong as one that cites a
   field nobody defined.

   *(Origin: an intent stated that no ball-only logo asset existed and scoped
   in producing one from the PWA icon. One `find public -iname '*logo*'` found
   two, transparent and correctly tinted, referenced by no code — which is why
   every grep had missed them. One command removed a work item.)*

   **4a. Checkability pass — every AC needs an observation AND a test.**
   Before showing the draft, write next to each criterion (in your head or in
   the message, not in the file) the manual step a tester would take and the
   automated test that proves it. An AC with neither is not an AC. Four shapes
   read as criteria and fail this pass; each has a fixed rewording:

   | Shape | Tell | Reword to |
   |---|---|---|
   | Diff-only wording | "no longer calls X", "byte-for-byte unchanged", "never uses `x-uuid`" | the observable: a status code, a stored record, a response header, rendered copy, a counter that does or does not move |
   | Test-only behaviour | a failure mode the outside cannot produce (an outage on one dependency while an earlier one keeps working) | keep the behaviour, name the unit/route test as the proof, say "not a manual session" |
   | Process claim | "watched failing before restore", "grepped before deletion" | require the evidence be pasted in the PR body (the failing output, the grep command + result) |
   | Post-launch measurement | "conversions increase over 30 days" | deliver the query itself (bounded, internal traffic excluded) as the AC; the comparison goes back to the intent's Success signal |

   An AC that mixes a behaviour with implementation notes (file, helper,
   library) splits into the behaviour and a "How" sub-bullet — Pass 3 checks
   the behaviour; the notes are guidance for plan mode. Ambiguous counting
   words ("once per render") get a concrete event ("once per blocked response
   received; re-renders do not re-emit").

   *(Origin: a verification-matrix pass run AFTER acceptance flagged 11 of 22
   ACs — six diff-only, three test-only, two process/measurement — and every
   one had to be reworded in a Decisions entry. Running this pass before
   "propose, then confirm" costs minutes; after acceptance it costs a second
   review round.)*
5. **Fill the remaining sections** (surfaces, contracts, test plan, out of
   scope). The test plan names which loop must be green: unit tests, type
   check, browser verification, evals.
6. **Propose, then confirm** — show the draft before writing the file.
7. Next step: a plan-mode session producing `plan.md` in the same directory.

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
- Don't carry an intent's "X does not exist yet" into scope on a code grep
  alone — `find` the file by name in `public/`/`assets/` first; an
  unreferenced asset returns zero grep hits while sitting on disk.
- Don't let a later stage build to an interpretation the spec doesn't state;
  amend the spec, then build.
- Don't skip the constraint pass or cite a skill you didn't read this session.
- Don't ship an AC you cannot name a manual observation AND a test for —
  "no longer calls X" is a diff note, not a criterion (step 4a).
- Don't write criteria around an unread canvas, and don't treat a canvas as
  verification — screenshotting an artboard proves as little as screenshotting
  a control that never mounted.
- Don't write code or plan.md — this skill ends at spec.md.
- Don't wire spec generation into CI; it stays human-triggered.
