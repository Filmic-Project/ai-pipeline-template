/**
 * Deterministic detector for the Sentry maintain loop.
 *
 *   npm run monitor:error-bands
 *
 * Runs each band query from config/error-bands.ts against Sentry, keeps NEW
 * unresolved issues whose event count exceeds the band's threshold, drops
 * excluded titles and issues already reported by an open PR labeled with the
 * dedupe label (checked via `gh pr list`, skipped with a warning when gh or
 * a token is unavailable).
 *
 * On breach it writes breach.json to the working directory and, when running
 * in GitHub Actions, appends `breach=true` to $GITHUB_OUTPUT. A breach exits
 * 0 — it is the expected input to the diagnose job, not a CI failure; only
 * script/API errors exit non-zero.
 *
 * NOTE on Sentry reporting: this is a standalone CI process that never
 * initializes the Sentry SDK, so it deliberately does NOT call
 * Sentry.captureException — it fails loudly via a non-zero exit code, and
 * the workflow's notification step does the alerting.
 *
 * Required env: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT.
 * Optional env: SENTRY_API_BASE (defaults to https://sentry.io/api/0),
 * GH_TOKEN (enables PR dedupe), GITHUB_OUTPUT (set by Actions).
 */

import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { appendFileSync, readdirSync, readFileSync, writeFileSync, type Dirent } from 'node:fs';
import path from 'node:path';
import { ERROR_BANDS_CONFIG, type ErrorBand } from '../config/error-bands';

const SENTRY_API_BASE = process.env.SENTRY_API_BASE ?? 'https://sentry.io/api/0';
// Safety cap for Link-header pagination — 5 pages ≈ 500 issues per band query.
const MAX_PAGES = 5;
const PERMALINK_PATTERN = /https:\/\/[^\s)"'`]+\/issues\/\d+\/?/g;

interface SentryIssue {
  id: string;
  title: string;
  culprit?: string;
  count: string;
  permalink: string;
}

interface BreachedIssue {
  bandId: string;
  minEvents: number;
  id: string;
  title: string;
  culprit: string | null;
  count: number;
  permalink: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

/** The rel="next" URL from a Sentry Link header, or null when exhausted. */
function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }
  for (const part of linkHeader.split(',')) {
    if (part.includes('rel="next"') && part.includes('results="true"')) {
      const match = part.match(/<([^>]+)>/);
      return match ? match[1] : null;
    }
  }
  return null;
}

async function fetchIssues(
  org: string,
  project: string,
  token: string,
  query: string,
): Promise<SentryIssue[]> {
  const params = new URLSearchParams({ query, statsPeriod: ERROR_BANDS_CONFIG.window });
  let url: string | null = `${SENTRY_API_BASE}/projects/${org}/${project}/issues/?${params}`;
  const issues: SentryIssue[] = [];
  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const response: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Sentry API ${response.status} for query "${query}": ${body}`);
    }
    issues.push(...((await response.json()) as SentryIssue[]));
    url = nextPageUrl(response.headers.get('link'));
  }
  if (url) {
    console.warn(`Pagination cap (${MAX_PAGES} pages) hit for query "${query}"; later pages unchecked.`);
  }
  return issues;
}

/**
 * Permalinks already reported: open maintain-loop PR bodies (best-effort —
 * without gh/GH_TOKEN we warn and continue) plus the DURABLE source, the
 * committed markdown files under intent/ in this checkout. The latter keeps
 * an issue from being re-diagnosed after its intent PR merges but before the
 * issue is resolved in Sentry.
 */
function alreadyReportedPermalinks(label: string): Set<string> {
  const permalinks = new Set<string>();
  try {
    const stdout = execFileSync(
      'gh',
      ['pr', 'list', '--label', label, '--state', 'open', '--limit', '100', '--json', 'body'],
      { encoding: 'utf8' },
    );
    const prs = JSON.parse(stdout) as Array<{ body: string | null }>;
    for (const pr of prs) {
      for (const match of (pr.body ?? '').matchAll(PERMALINK_PATTERN)) {
        permalinks.add(match[0].replace(/\/$/, ''));
      }
    }
  } catch (error) {
    console.warn(`PR dedupe unavailable (${(error as Error).message.split('\n')[0]}); using intent files only.`);
  }
  for (const permalink of intentFilePermalinks(path.resolve(__dirname, '..', 'intent'))) {
    permalinks.add(permalink);
  }
  return permalinks;
}

function intentFilePermalinks(intentDir: string): Set<string> {
  const permalinks = new Set<string>();
  let entries: Dirent[];
  try {
    entries = readdirSync(intentDir, { recursive: true, withFileTypes: true });
  } catch (error) {
    // Only a missing intent/ dir is a benign empty result; any other failure
    // would silently disable durable dedupe, so fail the run instead.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return permalinks;
    }
    throw error;
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }
    const content = readFileSync(path.join(entry.parentPath, entry.name), 'utf8');
    for (const match of content.matchAll(PERMALINK_PATTERN)) {
      permalinks.add(match[0].replace(/\/$/, ''));
    }
  }
  return permalinks;
}

function breachesForBand(band: ErrorBand, issues: SentryIssue[]): BreachedIssue[] {
  return issues
    .filter((issue) => Number(issue.count) >= band.minEvents)
    .filter(
      (issue) =>
        !ERROR_BANDS_CONFIG.excludeTitleSubstrings.some((substring) =>
          issue.title.includes(substring),
        ),
    )
    .map((issue) => ({
      bandId: band.id,
      minEvents: band.minEvents,
      id: issue.id,
      title: issue.title,
      culprit: issue.culprit ?? null,
      count: Number(issue.count),
      permalink: issue.permalink.replace(/\/$/, ''),
    }));
}

function setActionsOutput(breach: boolean): void {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    appendFileSync(outputPath, `breach=${breach}\n`);
  }
}

async function main(): Promise<void> {
  const org = requireEnv('SENTRY_ORG');
  const project = requireEnv('SENTRY_PROJECT');
  const token = requireEnv('SENTRY_AUTH_TOKEN');

  // De-dupe across bands by issue id — the first (most specific) band wins.
  const byIssueId = new Map<string, BreachedIssue>();
  for (const band of ERROR_BANDS_CONFIG.bands) {
    for (const breached of breachesForBand(band, await fetchIssues(org, project, token, band.query))) {
      if (!byIssueId.has(breached.id)) {
        byIssueId.set(breached.id, breached);
      }
    }
  }

  const reported = alreadyReportedPermalinks(ERROR_BANDS_CONFIG.dedupeOpenPrLabel);
  const breaches = [...byIssueId.values()].filter((b) => !reported.has(b.permalink));

  if (breaches.length === 0) {
    console.log('No error-band breaches in the last 24h.');
    setActionsOutput(false);
    return;
  }

  console.log(`Found ${breaches.length} error-band breach(es) in the last 24h:`);
  for (const breach of breaches) {
    const where = breach.culprit ? ` [${breach.culprit}]` : '';
    console.log(
      `- [${breach.bandId} ≥${breach.minEvents}] ${breach.title}${where} (events: ${breach.count}) ${breach.permalink}`,
    );
  }

  writeFileSync('breach.json', `${JSON.stringify({ window: ERROR_BANDS_CONFIG.window, breaches }, null, 2)}\n`);
  setActionsOutput(true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
