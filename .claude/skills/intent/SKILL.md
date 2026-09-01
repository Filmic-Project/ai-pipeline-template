---
name: intent
description: >
  Capture a feature/fix intent as a version-controlled intent.md artifact —
  the entry point of this repo's plan→spec→build loop. Use when the user says
  "/intent", "capture an intent", "start a feature", "turn this Sentry issue /
  analytics finding / user report into an intent", or hands you a problem
  statement that should become tracked feature work. Produces
  intent/<yyyy-mm>-<slug>/intent.md from the template; it does NOT write specs,
  plans, or code — /spec is the next step.
compatibility: Repos with an intent/ directory at the root (this template).
metadata:
  version: "1.0"
---

# /intent — capture an intent artifact

Create `intent/<yyyy-mm>-<slug>/intent.md` from
`intent/_templates/intent.md`. The artifact records WHY, not HOW.

## Procedure

1. **Gather the problem.** If the user gave a Sentry link, GitHub issue,
   analytics finding, or free-text description, extract from it. Otherwise
   interview — ask only the questions the template needs, in one batch:
   problem + evidence, desired outcome, non-goals, hard constraints, success
   signal.
2. **Name the directory** `intent/<yyyy-mm>-<slug>/` using the current month
   and a 2–4 word kebab slug. Check it doesn't already exist; if a closely
   related intent exists, propose updating that one instead of forking a
   duplicate.
3. **Fill every template section.** Rules that matter:
   - The observed signal must link real evidence (Sentry permalink, analytics
     query, PR/issue URL). No evidence → say "no hard evidence; based on X".
   - Desired outcome is user-visible and testable, free of implementation.
   - **Never invent a success signal.** If nothing measurable exists, write
     that explicitly in the section.
   - `Source: human` (the maintain loop writes its own with
     `Source: maintain-loop`). `Status: draft`.
4. **Show the draft** to the user, apply corrections, write the file.
5. Point at the next step: run `/spec` on the accepted intent. Do not start
   speccing or planning unless asked.

## Don't

- Don't write spec.md/plan.md or touch code — this skill ends at intent.md.
- Don't pad sections to look complete; a short honest intent beats a padded one.
- Don't create an intent for trivial changes the user would ship directly —
  suggest skipping the chain instead.
