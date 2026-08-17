// temp/validate-mermaid.mjs — extract every ```mermaid fence from the OOP
// lectures and render each through Kroki's mermaid engine. HTTP 200 = parses;
// 4xx/5xx = the same parse error the deck would show in the browser.
import fs from 'node:fs';
import path from 'node:path';

const base = path.join(new URL('.', import.meta.url).pathname, '..');
const slugs = ['oop-classes', 'oop-inheritance-diagrams', 'oop-prototypes'];
const KROKI = process.env.KROKI_BASE_URL || 'http://localhost:8000';

let failed = 0;
for (const slug of slugs) {
  const md = fs.readFileSync(path.join(base, 'lectures', slug, 'lecture.md'), 'utf8');
  const fences = [...md.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (let i = 0; i < fences.length; i++) {
    const res = await fetch(KROKI + '/mermaid/png', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fences[i],
    });
    if (!res.ok) {
      failed++;
      const err = await res.text();
      const firstLine = fences[i].split('\n').find((l) => l.trim()) || '(empty)';
      console.log(`FAIL ${slug} fence#${i + 1} (${firstLine.trim().slice(0, 40)}…): ${res.status} ${err.slice(0, 200)}`);
    } else {
      console.log(`ok   ${slug} fence#${i + 1}`);
    }
  }
}
console.log(failed ? `❌ ${failed} fence(s) failing` : '✅ ALL FENCES PARSE');
process.exit(failed ? 1 : 0);
