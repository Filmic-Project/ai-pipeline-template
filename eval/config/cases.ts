/**
 * Golden cases for the config-evals harness (eval/config/run.ts).
 *
 * Each case should be a REAL past correction, now guarded by CLAUDE.md /
 * AGENTS.md or a skill — the thing under test is the agent CONFIG, not the
 * model: the runner spawns `claude -p` with this repo as cwd, so the repo's
 * instruction files and skills are what make these pass.
 *
 * PROVE every new case with a mutation test: delete the guarding rule on a
 * scratch branch and confirm the case goes red — a case that stays green
 * without its rule is testing the model's priors, not your config. (Beware:
 * a rule guarded in TWO places, e.g. AGENTS.md and a skill description, needs
 * both removed to go red.)
 *
 * Assertions are case-insensitive regexes over the final response text —
 * deterministic, no LLM judge. Prefer mustNotMatch (guarding against the
 * wrong answer) over demanding exact phrasing; use severity 'warn' where
 * phrasing genuinely varies. Do NOT add a mustNotMatch for an anti-pattern a
 * correct answer would legitimately QUOTE while warning against it.
 */

export interface ConfigEvalCase {
  id: string;
  /** The task/question an agent would face, phrased naturally. */
  prompt: string;
  /** Case-insensitive regexes the final response MUST match (all of them). */
  mustMatch: string[];
  /** Case-insensitive regexes the final response must NOT match (any fails). */
  mustNotMatch: string[];
  /** must-pass gates the CI job; warn prints but does not fail the run. */
  severity: 'must-pass' | 'warn';
  /** Which config guards this — kept honest by the mutation test. */
  guardedBy: string;
  maxTurns?: number;
}

export const CONFIG_EVAL_CASES: ConfigEvalCase[] = [
  // This case works out of the box: it is guarded by the skill-self-
  // improvement rule shipped in this template.
  {
    id: 'skill-write-needs-approval',
    prompt:
      'I just discovered a reusable gotcha worth capturing. Should I go ahead and write the new SKILL.md file now?',
    mustMatch: ['approv'],
    mustNotMatch: [],
    severity: 'must-pass',
    guardedBy: 'skill-self-improvement rule + skill-maintenance skill',
  },

  // TODO(template): seed ~10 cases from your project's real corrections.
  // Examples of the shape (from the project this template was extracted
  // from) — adapt or delete:
  //
  // {
  //   id: 'prs-target-integration-branch',
  //   prompt:
  //     "I'm about to open a PR for this feature branch with gh pr create. " +
  //     'Which base branch do I target?',
  //   mustMatch: ['develop'],           // ← your integration branch
  //   mustNotMatch: ['--base main\\b'], // ← the wrong one
  //   severity: 'must-pass',
  //   guardedBy: 'AGENTS.md §Git & PRs',
  // },
  // {
  //   id: 'date-math-library',
  //   prompt:
  //     "I need a Date for 'seven days ago' in a server util in this repo. " +
  //     'Show me the one-liner.',
  //   mustMatch: ['subDays'],
  //   mustNotMatch: ['86400', '24\\s*\\*\\s*60', 'getTime\\(\\)\\s*-'],
  //   severity: 'must-pass',
  //   guardedBy: 'AGENTS.md §Date handling + code-conventions skill',
  // },
  // {
  //   id: 'ui-library',
  //   prompt:
  //     'I need a modal and a date picker for a new page in this repo — ' +
  //     'which UI library do I reach for?',
  //   mustMatch: ['MUI|Material'],
  //   mustNotMatch: ['chakra', 'ant design|antd', 'shadcn'],
  //   severity: 'must-pass',
  //   guardedBy: 'AGENTS.md §UI component library',
  // },
];
