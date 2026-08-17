// scripts/test/oop-lectures.test.js
//
// Content + pipeline gates for the three-lecture OOP extension set
// (oop-classes · oop-inheritance-diagrams · oop-prototypes — see
// oop-javascript-lecture-plan.md §7).
//
// Groups 1–2: HERMETIC pipeline checks — temp fixtures (withLectures pattern
//             from cli.test.js); nothing touches the real lectures/ tree.
// Groups 3–5: REAL-FILE content gates — they intentionally read the actual
//             lecture files, turning "the plan was followed" into runnable
//             assertions (quiz format, house-style structure, curriculum
//             consistency).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { scanLecture } from '../check.js';
import { buildOne } from '../build.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..', '..');

const SLUGS = ['oop-classes', 'oop-inheritance-diagrams', 'oop-prototypes'];

// --- helpers ----------------------------------------------------------------

/** Build a throwaway lectures/ tree, run asyncFn(root), clean up. */
async function withLectures(spec, asyncFn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oop-lect-'));
  for (const [slug, files] of Object.entries(spec)) {
    const slugDir = path.join(root, slug);
    fs.mkdirSync(slugDir, { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      const full = path.join(slugDir, name);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
  }
  try {
    return await asyncFn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** A throwaway dist dir; cleaned up after asyncFn(distDir). */
async function withDist(asyncFn) {
  const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oop-dist-'));
  try {
    return await asyncFn(distDir);
  } finally {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
}

const lecturePath = (slug) => path.join(REPO, 'lectures', slug, 'lecture.md');
const readLecture = (slug) => fs.readFileSync(lecturePath(slug), 'utf8');

// ===========================================================================
// 1 + 2 — Hermetic pipeline checks: scanLecture + buildOne on temp fixtures
// ===========================================================================

const FIXTURE_MD = [
  '# OOP Fixture',
  '',
  '**Grade 10 - ICT (Full-Stack Elective)**',
  '**Quarter 5**',
  '',
  '## The problem',
  '',
  'Data and behavior, strangers.',
  '',
  '```javascript',
  'class Product {}',
  '```',
  '',
  '---',
  '',
  '**📝 Quick Reference Card**',
  '',
  'class Product {}',
  '',
].join('\n');

test('OOP pipeline — scanLecture accepts each new slug (hermetic fixture)', async () => {
  const spec = Object.fromEntries(
    SLUGS.map((slug) => [slug, { 'lecture.md': FIXTURE_MD }]),
  );
  await withLectures(spec, async (root) => {
    for (const slug of SLUGS) {
      const result = scanLecture(slug, { lecturesDir: root });
      assert.ok(result.ok, `${slug}: scanLecture ok`);
      assert.deepEqual(result.missing, [], `${slug}: no missing images`);
    }
  });
});

test('OOP pipeline — buildOne produces a real deck per slug (hermetic fixture)', async () => {
  const spec = Object.fromEntries(
    SLUGS.map((slug) => [slug, { 'lecture.md': FIXTURE_MD }]),
  );
  await withLectures(spec, async (root) => {
    await withDist(async (distDir) => {
      for (const slug of SLUGS) {
        const { file } = buildOne(slug, { lecturesDir: root, distDir });
        assert.ok(fs.existsSync(file), `${slug}: dist output written`);
        const html = fs.readFileSync(file, 'utf8');
        assert.ok(html.length > 0, `${slug}: deck non-empty`);
        assert.ok(html.includes('<html'), `${slug}: deck has <html>`);
        assert.ok(html.includes('</html>'), `${slug}: deck closes </html>`);
      }
    });
  });
});

// ===========================================================================
// 3 — Real-file gate: quiz format (references/quiz-authoring-guide.md)
// ===========================================================================

test('OOP quizzes — title, 7–10 questions, exactly one [x] per MCQ, Answer: lines on fill-ins', () => {
  for (const slug of SLUGS) {
    const quizPath = path.join(REPO, 'lectures', slug, 'assets', 'quiz.md');
    assert.ok(fs.existsSync(quizPath), `${slug}: assets/quiz.md exists`);
    const quiz = fs.readFileSync(quizPath, 'utf8');

    // Exactly one H1 title.
    const h1 = quiz.match(/^# .+$/gm) || [];
    assert.equal(h1.length, 1, `${slug}: exactly one '#' quiz title`);

    // 7–10 H2 questions.
    const questions = quiz.match(/^## .+$/gm) || [];
    assert.ok(
      questions.length >= 7 && questions.length <= 10,
      `${slug}: 7–10 questions (got ${questions.length})`,
    );

    // Per question: MCQ → exactly one [x]; otherwise a fill-in with ≥1 Answer:.
    const blocks = quiz.split(/^## .+$/m).slice(1);
    assert.equal(blocks.length, questions.length, `${slug}: blocks parsed`);
    blocks.forEach((body, i) => {
      const optionLines = body.match(/^\s*\* \[/gm) || [];
      const checked = body.match(/\* \[x\]/g) || [];
      if (optionLines.length > 0) {
        assert.equal(checked.length, 1, `${slug} Q${i + 1}: exactly one [x] answer`);
      } else {
        assert.ok(/Answer:/i.test(body), `${slug} Q${i + 1}: fill-in has an Answer: line`);
        assert.ok(body.includes('___'), `${slug} Q${i + 1}: fill-in has a ___ blank`);
      }
    });
  }
});

// ===========================================================================
// 4 — Real-file gate: house-style lecture structure + asset links
// ===========================================================================

test('OOP lectures — metadata, objectives, TOC anchors, spine sections, resolving asset links', () => {
  for (const slug of SLUGS) {
    const md = readLecture(slug);

    // Metadata block.
    assert.ok(md.includes('**Grade 10 - ICT (Full-Stack Elective)**'), `${slug}: grade line`);
    assert.ok(/\*\*Quarter \d/.test(md), `${slug}: quarter line`);
    assert.ok(/\*\*Duration:\*\*/.test(md), `${slug}: duration line`);
    assert.ok(/\*\*Prerequisite:\*\*/.test(md), `${slug}: prerequisite line`);

    // Learning objectives: 5–8 numbered ✅ items.
    const objSection = md.split('## 🎯 Learning Objectives')[1]?.split(/^## /m)[0] ?? '';
    const objectives = objSection.match(/^\d+\. ✅/gm) || [];
    assert.ok(
      objectives.length >= 5 && objectives.length <= 8,
      `${slug}: 5–8 objectives (got ${objectives.length})`,
    );

    // TOC present; every (#section-N) link has a matching anchor.
    assert.ok(md.includes('## 📖 Table of Contents'), `${slug}: TOC heading`);
    const tocLinks = [...md.matchAll(/\]\(#(section-\d+)\)/g)].map((m) => m[1]);
    const anchors = new Set([...md.matchAll(/<a name="(section-\d+)"><\/a>/g)].map((m) => m[1]));
    assert.ok(tocLinks.length >= 10, `${slug}: TOC has entries`);
    for (const link of tocLinks) {
      assert.ok(anchors.has(link), `${slug}: TOC link #${link} has an anchor`);
    }

    // House-style spine sections.
    for (const section of [
      'Troubleshooting',
      "What's Next?",
      'Quick Reference Card',
      'Mini-Project',
      'Final Challenge',
      "🎯 Try It",
    ]) {
      assert.ok(md.includes(section), `${slug}: contains "${section}"`);
    }

    // Every relative assets/ and diagrams/ link resolves on disk.
    const lectureDir = path.join(REPO, 'lectures', slug);
    const refs = [...md.matchAll(/\]\((assets\/[^)#\s]+|diagrams\/[^)#\s]+)\)/g)].map((m) => m[1]);
    assert.ok(refs.length >= 2, `${slug}: references some assets`);
    for (const ref of refs) {
      assert.ok(
        fs.existsSync(path.join(lectureDir, ref)),
        `${slug}: referenced file exists — ${ref}`,
      );
    }
  }
});

// ===========================================================================
// 5 — Real-file gate: curriculum consistency (§5 quarter tables + §10 index)
// ===========================================================================

test('OOP curriculum — all three slugs indexed in §10 and placed in the right quarter table', () => {
  const currPath = path.join(REPO, 'web-lectures', 'full-stack-g10', 'full-stack-g10-curriculum.md');
  assert.ok(fs.existsSync(currPath), 'curriculum doc exists');
  const curr = fs.readFileSync(currPath, 'utf8');

  // §10 index rows for all three slugs (+ the htmx fix that rode along).
  const indexSection = curr.split('## 10.')[1] ?? '';
  for (const slug of [...SLUGS, 'htmx']) {
    assert.ok(
      new RegExp(`\\|\\s*\\*{0,2}${slug}\\*{0,2}\\s*\\|`).test(indexSection),
      `§10 index has a row for ${slug}`,
    );
  }

  // §5 placement: Q5 block carries oop-classes (+ htmx), Q6 block the rest.
  const q5 = curr.split('### Q5')[1]?.split('### Q6')[0] ?? '';
  const q6 = curr.split('### Q6')[1]?.split(/^## /m)[0] ?? '';
  assert.ok(q5.includes('oop-classes'), '§5 Q5 table lists oop-classes');
  assert.ok(q5.includes('htmx'), '§5 Q5 table lists htmx');
  assert.ok(q6.includes('oop-inheritance-diagrams'), '§5 Q6 table lists oop-inheritance-diagrams');
  assert.ok(q6.includes('oop-prototypes'), '§5 Q6 table lists oop-prototypes');
});
