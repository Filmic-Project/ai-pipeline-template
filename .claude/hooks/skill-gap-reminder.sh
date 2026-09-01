#!/usr/bin/env bash
# Stop hook: nudge to capture reusable conventions as skills.
#
# Fires at turn-end. Guarded by `stop_hook_active` so it blocks at most once
# per stop sequence (one reflection per turn) — never an infinite loop.
#
# Reads the hook payload (JSON) on stdin. If we're already continuing because
# of this hook, allow the stop. Otherwise emit a one-time reminder that makes
# the model reflect on whether a skill should be proposed/updated.
#
# NUDGE is JSON-escaped once below (backslash then double-quote) before being
# emitted, so an accidental quote/backslash in the text can't produce invalid
# JSON. Keep NUDGE single-line — raw newlines/control chars are still not escaped.

input="$(cat)"

# Already re-woken by this hook? Let the turn end.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

NUDGE="Before ending the turn: did anything this turn reveal a REUSABLE, codebase-specific convention not yet captured in a skill — e.g. a PR review comment, a correction that came up more than once, or a non-obvious gotcha that cost real time? If yes, follow the always-on rule (.claude/rules/skill-self-improvement/RULE.md) and the skill-maintenance skill (.claude/skills/skill-maintenance/SKILL.md): propose updating an existing skill or creating a new one (propose-then-confirm), then finish. If no such gap, just end the turn normally — do NOT invent one-off or speculative skills."

# JSON-escape NUDGE once (backslash first, then double-quote) so a stray quote
# or backslash in the text can't produce invalid JSON.
esc=${NUDGE//\\/\\\\}   # escape backslash first
esc=${esc//\"/\\\"}     # then double-quote

printf '{"decision":"block","reason":"%s"}\n' "$esc"
exit 0
