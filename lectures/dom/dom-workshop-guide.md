# DOM Workshop Pilot 01 — Mission 02: The Living Mission Board (Teacher Guide)

> **Status:** experimental pilot created for Roy's review — NOT yet a curriculum standard.
> **Companion files:** [`assets/dom-workshop-scroll.md`](assets/dom-workshop-scroll.md) (**the single student instruction + evidence source — print this**) · [`assets/dom-workshop.html`](assets/dom-workshop.html) (interactive mission terminal — no instructions in the page) · [`assets/dom-workshop.css`](assets/dom-workshop.css) (read-only styling, holds the state classes) · [`assets/dom-workshop.js`](assets/dom-workshop.js) (student TODO starter — the only file students edit) · [`assets/dom-workshop-solution.js`](assets/dom-workshop-solution.js) (teacher answer, auto-excluded from student bundles) · [`lecture.md`](lecture.md) (theory — not modified by this pilot).
> **Timing honesty:** durations below are desk-design estimates. This is an **untested prototype** — validate on the first live run and record actuals in §19.

---

## 1. Learning objectives

Students **personally experience** (the lecture formalizes the names later):

- **D1 — Selection & events:** select an existing element with `getElementById()`, verify it with `console.log()`, attach a `click` listener, and change the terminal status on click. Student's lived question: *"Why did my code run, but nothing happened until I clicked?"*
- **D2 — Reading & writing `textContent`:** read one element's text and write it into another (title → briefing, prefixed `Selected: `). Question: *"Where did that briefing text come from?"*
- **D3 — `classList` & separation of concerns:** switch state classes (`stby`→`active`, `shuttered`→`revealed`) with **zero color values in JS**; CSS paints. Question: *"Why did the panel change appearance even though JavaScript never assigned a color?"*
- **Workflow:** predict → one change → save/refresh → observe → record evidence (the Village Laws).

- Deliberate boundary: no terminology lecturing during the workshop — questions about "what's an event listener" get *"watch this circuit — we'll name it in the slides."* Objectives are **experiences**, not vocabulary.
- **Two Us circuits stay intact:** Circuits 2 and 3 are the guided Wave 2 experience (6 + 6 min) and are **never shortened or cut** to save time — see §5.

## 2. Prerequisites

- `js-basics` complete (variables, `if`, loops, functions) and `js-arrays-objects` complete — per curriculum Q2, `dom` runs weeks 4–5 after both [V: `full-stack-g10-curriculum.md` §5].
- Per student: editor + browser side by side, console open (`F12`), `const`/`let` comfortable.
- No internet. No server. Classic `<script src>` (never `type="module"` — modules are blocked on `file://`).
- Students have **not** formally studied the DOM lecture yet — that is the point (workshop → theory).

## 3. Files and setup

```
lectures/dom/
├── dom-workshop-guide.md            ← this file (never staged)
├── shinobi-crest.png                ← Roy's original (kept; assets/ holds the copy)
├── mission-terminal.png             ← Roy's original (kept)
├── intelligence-scroll.png          ← Roy's original (kept)
└── assets/
    ├── dom-workshop-scroll.md       ships ✅  ← CANONICAL student handout (print this)
    ├── shinobi-crest.png            ships ✅
    ├── mission-terminal.png         ships ✅
    ├── intelligence-scroll.png      ships ✅
    ├── dom-workshop.html            ships ✅
    ├── dom-workshop.css             ships ✅
    ├── dom-workshop.js              ships ✅ (students edit)
    └── dom-workshop-solution.js     EXCLUDED by staging regex ✅
```

**How the scroll and the HTML work together:** `dom-workshop-scroll.md` is the **single student instruction and evidence source** — print one per student. It carries the mission briefing, prerequisites, Village Laws, PREDICT / OBSERVE / REFLECT at every circuit, the evidence fields, rescue cards and the completion checklist. `dom-workshop.html` is **only the interactive mission terminal** (identity header + a pointer to the scroll + the terminal itself) — the duplicate worksheet blocks were removed in the final cleanup, so the page holds no instructions and no response fields. Students record answers **in the printed scroll**; the HTML page is what they run. Students edit only `dom-workshop.js`.
**Single-source rule (final):** the scroll is the *only* place a student reads an instruction or writes an answer; the HTML is the *only* place they see the terminal; `dom-workshop.js` is the *only* file they edit; the solution and this guide never reach students. If a future edit adds instructions back into the HTML, it breaks this architecture.

**Quick trial today:** copy the **seven** student files (scroll + 3 images + HTML/CSS/JS) to each student's folder (USB/LMS) — never the solution. Double-click the HTML; print the scroll.
**Official delivery:** `npm run stage` publishes the student files under `web-lectures/full-stack-g10/assets/dom/`; `pack-student-zip.sh` copies that `assets/` tree into the offline ZIP (so the scroll and its three images ship); the solution is stripped automatically by `EXCLUDE_RE = /solution|quiz\.md$|\.test\.js$/i` (the scroll's name matches none of those patterns).
**Before class:** open the solution once so every TODO's target is in your head; confirm student folders contain exactly 7 files (never the solution).

## 4. Mission briefing (read aloud, 60 seconds)

> "The academy's mission terminal is malfunctioning. The missions are on the board, but nothing responds — status stuck, briefing dead, shutters sealed. Your job today: restore its reflexes, one circuit at a time. You'll type every line yourself. This is training, not a test."

Show Phase 0 live: click power + all Open Intel buttons → **nothing happens** (the genuine nonfunctional state). Keep narrative light — the story serves the code, never the reverse.

## 5. Detailed 30-minute facilitation sequence

| Stage | Min | Your move | Student move |
|---|---:|---|---|
| Briefing | 3 | Read briefing; demo the frozen terminal; point at the scroll's laws + files | Click dead buttons; write P0 prediction; open both files side by side |
| **Me** — Circuit 1 (D1) | 5 | Type Circuit 1 live, narrating every keystroke (see §7). End with the one-sentence self-explanation | Follow along **in their own file**; write P1 before first run; record Evidence 1 |
| **Us** — Circuit 2 (D2) | 6 | Dictate step-by-step (scroll Phase 2); circulate | Individually type title+briefing variables and Mission 1's handler; P2; Evidence 2 |
| **Us** — Circuit 3 (D3) | 6 | Dictate step-by-step (scroll Phase 3); hold answers to "which file paints?" | Extend the **same** handler with class switches; P3; Evidence 3 |
| **You** — Circuit 4 | 8 | Circulate only; answer with questions; rescue cards first | Independently restore Mission 2 (stretch: Mission 3 + toggle); P4; Evidence 4 |
| Reflection | 2 | **Discuss the two oral prompts (§7);** collect written Q3; run sign-off | Answer the 2 prompts aloud; write Q3; tick the completion table |

**Wave structure:** Wave 1 = your Circuit 1 demo. **Wave 2 = Circuits 2–3 lockstep (never cut).** Wave 3 = Circuit 4 solo. If short on time: cut the Circuit 4 stretch, then E2 — never Wave 2.

**Written load (final):** each circuit asks for **one prediction + one observation/evidence record + one short explanation** (~31 writing lines total, only ~10 of them prose). **Four prompts are deliberately ORAL, never written:** (a) the load-vs-click distinction (D1 — §7), (b) the JavaScript-vs-CSS responsibility boundary (D3 — §7), and the two Phase 5 prompts below — *(c) "which line made the button respond?"* and *(d) "why did the panel change appearance without a colour in JS?"* — both already answered in Circuits 1 and 3. Do not expect those four on paper; ask them aloud while circulating or in the Phase 5 discussion. Writing must never eat the time needed to type, run, and observe the code.

**Phase 5 reflection (final):** two **oral prompts** discussed with Roy (no writing) + **one written answer** (the personal-project bridge, Q3). The completion table row reads "two oral prompts discussed + one written answer".

## 6. What you demonstrate vs what students type

| | Content |
|---|---|
| **You type (Me)** | Circuit 1 complete: two `getElementById` variables → `console.log` both → power button's `click` listener → `textContent = 'ONLINE'` |
| **You dictate (Us)** | Circuit 2: select title + briefing → new handler on Mission 1 button → `briefing.textContent = 'Selected: ' + title.textContent`. Circuit 3: inside that same handler, the four `classList` lines (after students open the CSS and *find* the class names themselves) |
| **Students type alone (You)** | Circuit 4: everything for Mission 2 — same pattern, their own ID mapping from the HTML |

**Never paste. Never project finished code for the You stage.** Students may copy *their own* Circuit 2/3 work for Mission 2 — that is the intended near-transfer, but they must adapt the IDs themselves.

## 7. Questions to ask (and hold the answers)

**Before every run:** *"What do you predict will happen?"* — insist on the written P-blank first.

- **D1:** *"console.log printed… element or null?"* → *"So what changed when you clicked — did the page reload? Did any code run twice?"* Hold: "code ran once at load; the handler runs on every click" (lecture Section 5).
- **D2:** *"Where did 'Silent Pagoda Patrol' come from? Did you type those words in your JS?"* → *"So textContent can be… read AND written?"* Hold: concatenation mechanics fine to show, terminology later.
- **D3:** *"Did your JS contain any colors? Then who painted it?"* → *"Open the CSS — what did you find?"* Hold: "separation of concerns", specificity. (Note: the label text `ACTIVE` *is* yours to write — the *look* is CSS's. Keep that line sharp: you changed **what it says**, CSS decides **how it looks**.)
- **Transfer:** *"Mission 2's badge is a different element — what changes in your code? What stays identical?"*

**Oral-only prompts (never collect these in writing):** the load-vs-click distinction (D1), the JS-vs-CSS boundary (D3), and the two Phase 5 prompts — *"Which line made the button respond?"* and *"Why did the panel change appearance even though JavaScript never assigned a colour?"* The second of those duplicates Circuit 3's written answer, so in Phase 5 treat it as a **recall check**: expect the student to point at their own Circuit 3 line rather than re-write it. Ask both orally during Phase 5 (or while circulating after Circuit 4).

**Expected answers (teacher key):** P0 ≈ "zero / only comments" (starter is comments-only — no executable statements by design). P1 = an element, not `null`. P2 = `Selected: Silent Pagoda Patrol`. P3 = **No** (JS has no colors) / **dom-workshop.css**. P4 = `Selected: Midnight Lantern Escort`; Mission 1's badge does **not** change (its handler isn't this button's) but the briefing is replaced (single briefing line shows latest selection). Badge label after Circuit 3 = `ACTIVE`. Oral prompt 1 → the `addEventListener('click', …)` line (Evidence 1). Oral prompt 2 → "CSS decides the look; JS only switched classes" (their Circuit 3 answer).

## 8. Expected browser observations

- **Before (Phase 0):** status `OFFLINE`, all badges `STANDBY`, intel invisible, briefing "No mission selected." Buttons clickable but inert — the terminal *looks* finished, *is* dead.
- **After Circuit 1:** console shows two element nodes; click power → `ONLINE`.
- **After Circuit 2:** click Mission 1 → briefing changes to `Selected: Silent Pagoda Patrol`; nothing else moves.
- **After Circuit 3 (one click, three effects):** briefing + badge `STANDBY`→`ACTIVE` **(label text *and* teal glow — the text you set, the colors CSS)** + shutter opens (brief animation). Zero colors anywhere in the JS.
- **After Circuit 4:** Mission 2 fully responds; briefing shows Mission 2; Mission 1 stays active; no console errors.
- **Stretch:** Mission 3 shutter opens then closes on second click (`toggle`). Badge label flips to `ACTIVE` on first click (and stays — the toggle only affects the shutter).
- **Badge-label pitfall (already handled in the answer file):** a class-only switch can render a badge in the active *style* while its label still reads `STANDBY`. The solution writes the label text (`textContent = 'ACTIVE'`) alongside the class switch — students should do the same in Circuit 3.

## 9. Common misconceptions

| Misconception | Reality | Response (theory-safe) |
|---|---|---|
| "Nothing works / my code doesn't run" | Save (`Ctrl+S`) + Refresh (`F5`) forgotten | Walk the loop aloud (Law 2); make it a ritual |
| `null` TypeError = "JavaScript is broken" | Wrong/mis-cased ID, or element not yet in DOM | Compare id letter-by-letter with the HTML (rescue card 2) |
| "I need to write colors to change the look" | CSS classes carry the appearance | *"Open dom-workshop.css — who wrote those colors?"* |
| Handler written twice (Circuit 3 as a new handler) | Circuit 3 **extends** Circuit 2's handler | *"One button, one handler, three jobs — find your Circuit 2 handler"* |
| Typing the title text as a literal string into the briefing | D2 requires **reading** another element | *"Did you type the mission name, or read it from the page?"* |
| Copying Circuit 2 but keeping Mission 1 IDs | Transfer needs Mission 2's ids | *"Which element did you actually select — check the id"* |
| `addEventListener` with parentheses (`fn()`) | Calls immediately, passes result | Watch the Me demo again; quiz in lecture Section 5 |

## 10. Rescue instructions (90-second rule)

Ordered cards (mirrors the scroll's rescue list): ① saved + refreshed? ② `null` → id letter-by-letter vs HTML (+ missing `}`/`;` above the red line) ③ copy first red console line into notes → hand up ④ briefing wrong → check you read the *title* element, quotes and `+` spacing ⑤ badge dead → class names must match `dom-workshop.css` exactly. Teacher first-responder question for every rescue: *"What did console say?"*

## 11. 15-minute version (honest cut)

| Stage | Min | Content |
|---|---:|---|
| Briefing | 2 | Frozen demo + laws (compressed) |
| Me | 3 | Circuit 1 only (D1: select → log → listener → ONLINE) |
| Us | 6 | **D3 only:** wire Mission 1's button directly to the badge + shutter class switches (skip the briefing/`textContent` read entirely) |
| You | 3 | Mission 2: badge + shutter only |
| Reflect | 1 | Oral Q2 prompt only (no writing) | Answer aloud; no written exit ticket |

**What students miss, stated plainly:** **D2 never happens** — no reading text from another element, the briefing line stays "No mission selected." the whole session, and Evidence 2/P2 don't exist. D2 then leans 100% on the lecture's Section 2 with no lived hook. D1 and D3 survive intact (the two most visual discoveries). This is a fallback session, not the designed experience.

## 12. 45-minute extensions (go only when told)

- **E1 — one loop, all cards:** replaces the per-mission handlers using `querySelectorAll('.open')` + `forEach` + `closest('.card')`. Prerequisite recap: `js-arrays-objects` `forEach`. **Before E1, the three per-mission handlers must be commented out** (or both fire per click — harmless but confusing; solution file documents this). Previews lecture Section 5's event-delegation diagrams.
- **E2 — paint, then refactor:** set `badge.style.backgroundColor` directly → observe → convert to a class → delete the direct line. Discussion: *"Which would you maintain?"* Note: students cannot edit the CSS, so E2's class (e.g. `.badge-hot`) must be **added to `dom-workshop.css` by the teacher before class** (one line) — or run E2 as a whole-class demo on the projector only.
- **Stretch inside You-stage (not a 45th-minute extension):** Mission 3 + shutter `toggle`.
- Honest floor: E1 ≈ 5–7 min, E2 ≈ 5 min. 45 min = 30 core + both extensions; skipping E2 alone yields ~40.

## 13. G2 exclusion checklist (preserve in every future revision)

G2 (`shared/gates/gate-g2-dom-events-starter.html`) is a 30-min no-AI mastery gate. The workshop must **never** contain: a `<form>` · form submission · `submit` events · `event.preventDefault()` · inputs/textareas or `.value` · `createElement()` / any dynamically created element · `prepend()`/appending lists · accumulating entries (newest-first or otherwise) · counters · `form.reset()` · the Barangay Complaint Box scenario · any link to the gate scaffold or solution.

**Verified absent from all four workshop files** (see pilot report §5). Permitted shared foundations: `getElementById`, `addEventListener('click')`, `textContent`, `classList`. The workshop teaches the atoms; G2 assesses the form-workflow molecule. Also keep the workshop's **own** exclusions: no `innerHTML`, no `localStorage`, no `fetch` in core.

## 14. Connection to the DOM lecture (formalization map)

| Workshop | Exact lecture heading in [`lecture.md`](lecture.md) |
|---|---|
| D1 | **Section 1 — Selecting Elements** (incl. the `console.log` tip) + **Section 5 — Events** (`addEventListener`, click) |
| D2 | **Section 2 — Reading and Changing Content** (`.textContent` — read *and* replace) |
| D3 | **Section 3 — Styling Elements** (`.classList` vs `.style`; the accessibility tip) |
| Circuit 4 transfer | Section 1 + 2 + 5 combined; sets up **Mini Project A/B** patterns |
| E1 (if run) | Section 5's event-flow + event-delegation visuals |
| Rescue card 2 (`null`) | **Troubleshooting & Tips** — names this exact error already |

**Suggested opener for the lecture (later, teacher's call):** *"Yesterday your terminal was frozen — here are the official names for what you restored."*

**Recorded, NOT implemented (future authorized phase):** ① replace the generic intro with a post-workshop bridge ② add a read-`textContent` example to Section 2 (currently only writes) ③ correct the stale *"Estimated length: 1500–1800 lines"* (file is 668 lines) ④ fix practice1's `// TODO: Hook up the button` comment above already-complete code ⑤ keep Section 4 (create/remove) as the later concept leading toward G2.

## 15. Connection to personal projects

- The written reflection's Q3 forces the transfer: *"Which button or interaction in your own project could benefit from what you learned?"* — click → update text / flip a class is the atomic interaction of every Q2 client-side app. (The other two Phase 5 prompts are oral — see §7.)
- Curriculum Q2 artifact = "interactive client-side app" — every button students wire in their project is Circuit 1/2/3 in miniature.
- After G2 (later quarter), these same atoms combine with forms — the workshop deliberately stops at "buttons that respond."
- Collect 2–3 Q3 answers aloud in the last 30 seconds; they seed the lecture's *When to Use DOM* §1 discussion.

## 16. AI policy (state in the briefing)

- **Workshop is formative training, structurally separate from G2:** no gate, no rank, no AI privilege. Guide §13 keeps the G2 exclusion list; nothing about the G2 scaffold, scenario or pass criteria appears in any student-facing file.

## 17. Visual identity

Dark navy / teal / warm amber, restrained hierarchy, system fonts only — mission-scroll feel without emoji clutter. The terminal (bottom of the student HTML) must look **finished while its JS is dead**: students create the before/after themselves.

## 18. ComfyUI illustrations — SUPPLIED (three originals in `lectures/dom/`)

Roy generated three PNGs, since **regenerated and approved by Roy**. Actual sizes:
`shinobi-crest.png` 496×496 · `mission-terminal.png` 1408×768 (landscape) ·
`intelligence-scroll.png` 512×512. Copies live in `assets/` (md5-identical); the
originals remain untouched in `lectures/dom/`. **The scroll references all three by
bare relative filename**, which resolves in the repo, after `npm run stage`, and in the
student ZIP (everything sits in one `assets/dom/` folder).

| Original (`lectures/dom/`) | Copy ships as | Referenced in the scroll at |
|---|---|---|
| `shinobi-crest.png` | `assets/shinobi-crest.png` | Mission identity block (below the H2) |
| `mission-terminal.png` | `assets/mission-terminal.png` | Mission Briefing |
| `intelligence-scroll.png` | `assets/intelligence-scroll.png` | Phase 3 — Circuit 3 · SHUTTERS |

Alt text is written from what the images actually contain (verified by inspection), not
from the filenames. **All instruction stays real HTML/CSS/JS — images are decorative
only.**

### Current status (verified after artwork regeneration)

1. **Artwork approved — do not regenerate.** Actual subjects, as inspected from pixels:
   - `shinobi-crest.png` — circular medallion, gold/bronze knotwork border, dark
     blue-grey inner field, silver-white abstract bird emblem.
   - `mission-terminal.png` — symmetrical dark architectural chamber, fluted columns,
     glowing cyan neon square on the back wall, warm amber lighting.
   - `intelligence-scroll.png` — futuristic silver-blue rolled scroll, glowing amber
     end cap, beaded cord, dark wooden surface, blue light particles.
   The scroll's alt text matches these descriptions. The crest is somewhat more
   medieval/fantasy in style than the other two — **Roy accepts it; do not spend
   another image-generation round trying to make the three identical.**
2. **The crest has a solid white background, not transparency** (RGB, no alpha
   channel). It reads correctly on a white page; on a dark surface it would show a
   white box. Do not describe it as transparent.
3. **HTML marker comments cleaned.** Only **Insertion Point 1** remains (inside `terminal-frame` → `intelligence-scroll.png`). The former Insertion Point 2 sat inside the HTML's Mission Briefing block, which was **removed as duplicate worksheet content** in the final cleanup — the scroll's own Mission Briefing already renders `mission-terminal.png`. Both markers are/were **inert HTML comments**: images are referenced only by the Markdown scroll, so nothing renders in the HTML and terminal behaviour is untouched. Actually inserting an image into the HTML page is still a future decision.
4. **Markdown sizing.** Plain Markdown cannot set image width, so each illustration
   renders at its natural pixel size (496²/1408×768/512²) in a standard preview and in
   print. Adding `width=` would require HTML in the scroll (ruled out by the brief).

Prompt guidance used (record): original anime-inspired shinobi academy setting, no copyrighted characters, **negative prompt: text/letters/logo/diagram/screenshot** — images are decorative only.

## 19. Classroom trial observation checklist (first live run)

Record actuals — this is an untested prototype. **First student pilot scheduled: 2026-11-04.** No timing evidence exists yet; every figure below is a desk estimate until that run.

- [ ] Actual minutes per stage vs §5 (especially: Circuit 1 demo ≤5 min? Wave 2 ≤12?)
- [ ] P1 predictions written before first run — how many students? How many hit `null` on first try?
- [ ] How many needed rescue card 2 (`null`)? Card 5 (class names)?
- [ ] Circuit 3 "who painted it?" answers — correct on first ask, or after prompting?
- [ ] Circuit 4: how many completed Mission 2 solo within 8 min? Stretch attempts?
- [ ] Evidence fields: written, or skipped under time pressure?
- [ ] Which discovery produced the loudest "wait, why?"
- [ ] Verbatim answers to reflection Q3 (personal-project bridge) — collect 2–3.
- [ ] Did students attempt to WRITE the two oral prompts instead of discussing them? (Signal the scroll wording confused them.)
- [ ] Was 15-min cut's D2-deferral acceptable, or does D2 need to move earlier?
- [ ] Narrative load: did the theme help or distract? (Principle 9 check.)

## 20. Known pilot risks / decisions already made

- **Power button** (`#power-btn`): the spec's D1 says "change the terminal status when the button is clicked" but named no specific button — a dedicated header power button gives D1 its own element so Circuit 4 (card buttons) is genuinely new wiring. *Flagged as an interpretation for Roy (report §11).*
- **Scroll evidence fields are blank lines, not `<input>` fields** — inputs would violate the G2 "no inputs" rule and add form semantics.
- **HTML is terminal-only (final cleanup):** the duplicate worksheet markup (P0–P4, evidence fields, reflection lines, rescue cards, completion table, phase instructions) was **removed from `dom-workshop.html`**, leaving identity header + one pointer to the scroll + the terminal. CSS rules for those removed blocks (`.phase`, `.predict`, `.expect`, `.evidence`, `.signoff`, `.rescue`, `.reflect`, `.idline`, `.check`, `.closing`, `.note`, `.phase-tag`, `.box-cell`, `.extension`) are now unused — left in place because `dom-workshop.css` is out of scope for this cleanup.
- **Starter JS is comments-only by design** — loads with zero console noise; P0's honest answer is "zero working lines."
- **Solution includes commented E1/E2 reference** — teacher-only file, excluded from all student bundles.
- **`lecture.md` and all practice files untouched** (scope).