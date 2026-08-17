// scripts/check-mermaid.mjs — Layer 2 of mermaid syntax hardening.
//
// Full syntax validation of EVERY mermaid source (lecture.md fences +
// diagramSrc/**/*.mmd — the same sources Layer 1 lints, via the shared
// collector) by POSTing each to a Kroki instance's /mermaid/png endpoint:
// HTTP 200 = parses; 4xx/5xx = the parser's actual error message.
//
// On-demand by design (mermaid-check-hardening-plan.md): Kroki is usually
// DOWN on this machine (restart=no, on-demand doctrine — see KROKI-readme.md),
// so when the health probe fails we print the kroki-up hint and exit 0 (SKIP).
// The full check is never a surprise dependency. Run it while authoring
// diagrams:
//
//   kroki-up && npm run check:mermaid; kroki-down
//
// The runner takes an injected `transport` (a fetch-compatible function) so
// the test suite verifies 200/400/unreachable behavior hermetically — no real
// HTTP in npm test. `runCheck()` returns a structured result; `main()` is the
// CLI wrapper (exit 1 only on real parse failures, 0 on clean OR skip).

import { collectMermaidSources } from './lib/mermaid-lint.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASE = process.env.KROKI_BASE_URL || 'http://localhost:8000';

/** Fetch with a hard timeout so a hung probe can never stall the CLI. */
async function timedFetch(url, opts = {}, timeoutMs = 10_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: opts.signal ?? ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probe Kroki reachability (short timeout — a down Kroki must feel instant).
 *
 * @param {{ transport?: Function, baseUrl?: string }} [opts]
 * @returns {Promise<boolean>}
 */
export async function probeKroki({ transport = timedFetch, baseUrl = DEFAULT_BASE } = {}) {
  try {
    const res = await transport(`${baseUrl}/health`, { timeoutMs: 1500 });
    return !!res && res.ok;
  } catch {
    return false;
  }
}

/**
 * Validate every mermaid source through Kroki.
 *
 * @param {{ lecturesDir?: string, baseUrl?: string, transport?: Function }} [opts]
 * @returns {Promise<{ skipped: boolean, checked: number, failures:
 *   { slug: string, rel: string, status: number, message: string }[] }>}
 */
export async function runCheck({
  lecturesDir = path.join(REPO_ROOT, 'lectures'),
  baseUrl = DEFAULT_BASE,
  transport = timedFetch,
} = {}) {
  if (!(await probeKroki({ transport, baseUrl }))) {
    return { skipped: true, checked: 0, failures: [] };
  }
  const sources = collectMermaidSources(lecturesDir);
  const failures = [];
  for (const s of sources) {
    let res;
    try {
      res = await transport(`${baseUrl}/mermaid/png`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: s.text,
      });
    } catch (err) {
      failures.push({ slug: s.slug, rel: s.rel, status: 0, message: String(err).slice(0, 200) });
      continue;
    }
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).trim();
      failures.push({
        slug: s.slug,
        rel: s.rel,
        status: res.status,
        message: body.slice(0, 300) || `HTTP ${res.status} with no body`,
      });
    }
  }
  return { skipped: false, checked: sources.length, failures };
}

/** CLI entry. Exit codes: 0 = clean OR skipped (Kroki down); 1 = failures. */
export async function main() {
  const result = await runCheck();
  if (result.skipped) {
    console.log(
      'check:mermaid: SKIPPED — no Kroki at ' + DEFAULT_BASE +
      '. Run `kroki-up` first if you want full mermaid validation.',
    );
    return 0;
  }
  if (result.failures.length === 0) {
    console.log(`check:mermaid: clean — ${result.checked} source(s) parse via Kroki.`);
    return 0;
  }
  console.error(`check:mermaid: ${result.failures.length} of ${result.checked} source(s) FAIL to parse:`);
  for (const f of result.failures) {
    console.error(`  ✗ ${f.slug}/${f.rel} (HTTP ${f.status})`);
    console.error(`      ${f.message.split('\n')[0]}`);
  }
  console.error('check:mermaid: fix the sources above — quoting edge labels with special chars is the usual cure: -->|"label(...)"|');
  return 1;
}

// Run only when invoked directly (not when imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main());
}
