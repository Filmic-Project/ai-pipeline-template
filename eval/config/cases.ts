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
 * phrasing genuinely varies.
 *
 * ⚠️ A `mustNotMatch` pattern that names an ANTI-PATTERN cannot tell "the
 * agent recommended this" from "the agent named it in order to warn against
 * it" — and a well-configured agent does the latter constantly, because the
 * rule it just read says to. That makes such a case flakier the BETTER the
 * config gets, which is exactly backwards. Set `forbidCodeOnly` on those
 * cases: the patterns then run against fenced code blocks (what the agent is
 * actually proposing you write) instead of its prose. `mustMatch` always runs
 * against the whole response, so the pair still fails a genuine regression —
 * an agent that recommends the anti-pattern stops producing the required
 * `mustMatch` token.
 */

export interface ConfigEvalCase {
  id: string;
  /** The task/question an agent would face, phrased naturally. */
  prompt: string;
  /** Case-insensitive regexes the final response MUST match (all of them). */
  mustMatch: string[];
  /** Case-insensitive regexes the final response must NOT match (any fails). */
  mustNotMatch: string[];
  /**
   * Run `mustNotMatch` against fenced code blocks only, not the prose.
   * For cases whose forbidden pattern is an anti-pattern a correct answer
   * routinely CITES while warning against it — see the header note.
   */
  forbidCodeOnly?: boolean;
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
  //   // A correct answer reaches for the anti-pattern to warn about it
  //   // ("avoid `Date.now() - 7*24*60*60*1000`"), which tripped the forbidden
  //   // regex and failed a RIGHT answer — after the same branch had passed this
  //   // case four times in the preceding hour. See the header note.
  //   forbidCodeOnly: true,
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
