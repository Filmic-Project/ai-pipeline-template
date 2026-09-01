/**
 * Version-controlled band config for the Sentry maintain loop
 * (.github/workflows/sentry-maintain-loop.yml → scripts/monitor-error-bands.ts).
 *
 * A band breaches when a NEW unresolved Sentry issue (first seen inside the
 * window) matching `query` accumulates at least `minEvents` events in that
 * window (inclusive threshold). Detection is fully deterministic — no model
 * is involved; a breach only *triggers* the headless diagnosis job.
 *
 * Tuning lives here so threshold changes are reviewable diffs.
 */

export interface ErrorBand {
  /** Stable identifier, used in breach output and PR bodies. */
  id: string;
  /** Sentry issue-search query. Keep `is:unresolved age:-24h` in every band. */
  query: string;
  /** Minimum event count within the window for an issue to count as a breach. */
  minEvents: number;
}

export interface ErrorBandsConfig {
  /** Sentry statsPeriod for queries and event counts. */
  window: '24h';
  bands: ErrorBand[];
  /** Issues whose title contains any of these substrings are ignored. */
  excludeTitleSubstrings: string[];
  /** Open PRs with this label are scanned to dedupe already-reported issues. */
  dedupeOpenPrLabel: string;
}

// TODO(template): tune the queries and thresholds to your project's traffic.
// Expect one tuning cycle: run `npm run monitor:error-bands` locally on a
// quiet day and adjust until it comes back empty. If another monitor already
// owns an error class, exclude it here (e.g. `!has:vendor.error_type`).
export const ERROR_BANDS_CONFIG: ErrorBandsConfig = {
  window: '24h',
  bands: [
    {
      id: 'api-errors',
      query: 'is:unresolved age:-24h level:error url:"*/api/*"',
      minEvents: 50,
    },
    {
      id: 'client-errors',
      query: 'is:unresolved age:-24h level:error',
      minEvents: 100,
    },
  ],
  excludeTitleSubstrings: ['ResizeObserver loop'],
  dedupeOpenPrLabel: 'maintain-loop',
};
