# CSS Workshop Pilot 01 — Profile Card Style Lab (Teacher Guide)

> **Status:** experimental pilot created for Roy's review — NOT yet a curriculum standard.
> **Companion to:** [`lecture.md`](lecture.md) (the theory deck) · [`assets/css-workshop.html`](assets/css-workshop.html) (student worksheet) · [`assets/css-workshop.css`](assets/css-workshop.css) (student starter stylesheet) · [`assets/css-workshop-solution.css`](assets/css-workshop-solution.css) (teacher answer sheet).
> **Timing honesty:** every duration below is a *desk design estimate*, not a measured classroom time. Validate on the first live run and adjust (record actuals in §14).

---

## 0. File map — what ships and what never ships

| File | Audience | Reaches students? | Why |
|---|---|---|---|
| `lectures/css/assets/css-workshop.html` | Students | ✅ yes | staged like every other asset (`npm run stage`) and copied into the offline ZIP |
| `lectures/css/assets/css-workshop.css` | Students | ✅ yes | the file students edit |
| `lectures/css/assets/css-workshop-solution.css` | Teacher | ❌ no | filename contains `solution` → `EXCLUDE_RE = /solution\|quiz\.md$\|\.test\.js$/i` in `scripts/stage-student-assets.mjs` strips it from site + ZIP |
| `lectures/css/css-workshop-guide.md` (this file) | Teacher | ❌ no | lives **outside** `assets/`, and staging only ever copies `assets/` — that is why the guide is at the lecture-folder root, not inside `assets/` |

Verification (read-only, run anytime):

```bash
node --input-type=module -e "import('./scripts/stage-student-assets.mjs').then(m => console.log(
  'html ships?  ', !m.shouldExcludeAsset('css-workshop.html'),
  '\ncss ships?   ', !m.shouldExcludeAsset('css-workshop.css'),
  '\nsolution blocked?', m.shouldExcludeAsset('css-workshop-solution.css')))"
npm run check     # unchanged: 0 errors / 0 warnings
npm test          # unchanged: 182 pass / 0 fail
```

**Not done on purpose (pilot authorization covered these 4 files only):** no `lecture.md` Try-It link, no quiz.md additions, no diagram changes. If the pilot earns its place, the follow-ups are listed in §12.

---

## 1. Learning objectives

By the end of the workshop, each student will **personally have experienced** (words formalized later by the deck):

- **A — Competing rules:** edited a class rule and seen a different rule control the outcome; had to locate the rule that actually wins.
- **B — Inheritance:** changed a parent's text styling and sorted, line by line, what followed vs what refused.
- **C — Box model:** changed `width`, `padding`, and `border` and found the card's edge-to-edge size does not equal its `width` value.
- **Workflow:** the edit → save → refresh loop, run repeatedly and unselfconsciously.

Deliberate boundary: the objectives are *experiences and observations*, **not terminology**. "Specificity", "inherited property", "content box" belong to the lecture. If a student uses those words early, great — do not lecture on them yet.

---

## 2. Prerequisites

- Students have met basic HTML (the Q1 sequence: `html` weeks 2–3 before `css` weeks 4–5). They only *read* the provided markup; they write none.
- An editor and a browser per student (pairs acceptable if devices are shared — the You-stages stay individually owned: each student makes their own edits).
- **No internet needed** (system fonts only, no images, no CDN). **No DevTools needed** for the core (E3 optional).
- Place in sequence: after some HTML exposure, **before** the CSS lecture's theory slides. G0 (responsive-bulma block, end of Q1) comes much later — this lab deliberately prepares nothing structural for it (§13).

---

## 3. Materials & setup

**Quick trial (copy today):** copy exactly two files — `css-workshop.html` + `css-workshop.css` — into one folder per student (USB/LMS/shared drive). Students double-click the HTML. Do **not** copy the `-solution` file to students.

**Official delivery:** files are already in `lectures/css/assets/`; `npm run stage` publishes them under `web-lectures/full-stack-g10/assets/css/` and `pack-student-zip.sh` carries them into the offline ZIP, with the solution automatically excluded.

**Before class:** open `css-workshop-solution.css` once so you know where every EXPT marker leads; confirm students' folders contain exactly two files.

---

## 4. Standard delivery — 30 minutes

| Stage | Min | Worksheet step | What happens |
|---|---:|---|---|
| Introduce the challenge | 3 | intro + ground rules | Show the finished-looking card and the goal: *make it respond to you, and catch three puzzles it plays on you.* State the ground rules (fictional data, HTML read-only, questions welcome — this is practice). Everyone opens the two files side by side. |
| **Me** — teacher demo | 5 | Step 1 | Narrate every keystroke (wave rule): change `.avatar` background → `Ctrl+S` → `F5` → circle changes. Then the required 10-second self-explanation: *"In one sentence — what did I just do?"* (Expected: "edited the CSS, saved, refreshed, the card changed.") Do **not** explain why any rule wins. |
| **Us** — guided experimentation | 12 | Steps 2–4 | Step 2 (1 min): every student reproduces the avatar change alone — participation check, hands on keyboards. Step 3 (6 min): the name-red mission — predict → edit `.name` → observe nothing → guided hunt → edit `#profile-name` → red. Step 4 (5 min): restyle `.card`'s color + font; class calls CHANGED / NOT CHANGED line-by-line before refreshing. |
| **You** — individual | 8 | Steps 5–6 | C1 width → C2 padding → C3 border, each with predict→do→observe against the START BAR (≈5 min), optional margin probe (1 min), then 2 min personalizing through CSS only. Circulate; answer questions with questions (§7). |
| Reflection | 2 | Step 7 | The three exit questions, out loud or as CSS comments. Listen for the qualitative box-model answer ("padding/border add to it") — do not correct toward jargon. |

**Wave mapping (do not cut Wave 2):** Wave 1 = Step 1 (teacher on screen), **Wave 2 = Steps 2–4 (whole class together — the diagnostic moment)**, Wave 3 = Steps 5–6 (solo). If the session runs short, trim Step 6 or the margin probe — never Step 3–4.

**Reveal policy:** students may ask questions throughout (formative, not an exam). Answer *procedural* questions freely ("which file?", "how do I save?"). For *mechanism* questions ("why didn't it change?"), return the prompt: "What do you predict?" Hold the full explanation until the lecture — the workshop's job is to make the question sticky, the slides' job is to answer it.

---

## 5. Quick delivery — 15 minutes (honest cut)

| Stage | Min | Content |
|---|---:|---|
| Introduce | 2 | ground rules + open files (compressed) |
| Me | 3 | Step 1 demo + self-explanation (compressed) |
| Us | 6 | **Step 3 only — Experience A in full**, including the hunt and reveal-as-fact |
| You | 3 | C1 only (width change vs start bar) |
| Reflect | 1 | Exit question 1 |

**What is cut, stated plainly:** Experience B (inheritance) is skipped entirely — its content then leans 100% on the lecture's "Why Cascading?" slide and the homework; C2/C3 are skipped, so the box-model discovery is *weak* in this version (students see width track the card, not padding/border adding size); personalization moves to homework; no extensions. **Preserved discovery: A — "why didn't my change work?"** This is a fallback session, not the designed experience.

---

## 6. Extended delivery — 45 minutes

Run the full 30-minute core, then, only on teacher go:

| Ext | Min | Content | Honest note |
|---|---:|---|---|
| E1 hover | 5 | Students append `.tags li:hover { … }` and pick a property | theory anchor exists (nav-bar slide's `a:hover`) |
| E2 gradient | 5 | Swap the card's `background` for `linear-gradient(…)` | syntax is *given* — it is not discoverable by tinkering; the observation is the payoff |
| E3 inspector measure | 5 | Teacher-led: measure the card live, confirm 564 vs the 460 width rule | **uses the browser inspector — a Q2 `debugging-devtools` tool.** If your class hasn't reached it, skip E3: 40 minutes total, and the slides close Experience C instead. Say this out loud rather than padding the time. |

---

## 7. Questions to ask (with hold-the-reveal notes)

**Before every modification:** *"What do you predict will happen?"* — insist on a spoken/written prediction *before* `F5`. The prediction is the learning event; the refresh only grades it.

**Experience A:**
- "Did the name change? What did you actually see?"
- "Your edit was correct CSS — the syntax was fine. So why didn't the browser obey it?" *(park any mechanism answer)*
- "Which rule did you finally have to edit? How many rules touch that one line?"
- Resist saying: *specificity, ID beats class, cascade order, precedence.*

**Experience B:**
- "You changed ONE rule — but only some lines obeyed. Which ones changed? Which refused?"
- "What do the refusers have in common?" *(let them circle the ones with their own color/font lines)*
- "Did you check the initials inside the circle?"
- Resist saying: *inherited properties, explicit declaration, UA stylesheet.*

**Experience C:**
- "The width rule says 460. Is the blue-framed card 460? Where are the extra pixels?"
- "C2: the width rule never changed — so why did the card still grow?"
- "Margin probe: bigger, or just moved?"
- Resist saying: *content box, border box, box-sizing, padding adds to width.* (And do **not** demo `box-sizing: border-box` — the CSS lecture never teaches it; an unanswered question is worse than an unanswered curiosity.)

---

## 8. Expected observations (answer key lives here + in the solution CSS)

- **Loop (Step 2):** avatar circle recolors for everyone — participation checkpoint.
- **A:** editing `.name`'s color changes **nothing visible** (display stays `#111827` from `#profile-name`); editing `#profile-name` turns the name red. Subtlety: `.name`'s `font-size` still applied all along — only the contested property lost. Students who paste a color into both rules also succeed; accept either path as long as they can point to *both* rules.
- **B:** with `.card` color/font changed — CHANGED: bio, three chips, footnote (+ initials' *font* but not their color); NOT CHANGED: name (ID rule), role (own color), handle (own color *and* own font — the lone holdout on the typeface), avatar initials (own white).
- **C (suggested values):** start 360+48+6 = **414 px** (= start bar, by construction) → C1 **514** → C2 **554** (grew although `width` sat at 460) → C3 **564**. Students who use their own numbers get different totals — accept any correct *relative* observation. Margin probe: vertical gap grew, edge-to-edge size did not.
- **Reflection:** the target is qualitative — "another rule was controlling it", "the ones with their own style refused", "padding and border are adding space". Jargon-free is correct.

---

## 9. Anticipated misconceptions & responses

| Misconception / moment | What it really is | Response (theory-safe) |
|---|---|---|
| "CSS is broken" / "nothing happens" after an edit | Forgot `Ctrl+S`, refreshed the wrong window, or edited the HTML | Walk the loop aloud together once; make it a student ritual, not a lesson |
| "My color line has an error" — retypes `.name` color repeatedly | The rule *is* valid; a different rule outranks it | "Syntax looks fine to me. What else touches this line?" → hunt |
| Typing a color with no `#`, or no unit (`width: 460`) | Invalid declaration — browser silently drops that one line | Distinct from Experience A: nothing else competes here; fix the value. (Semicolons are the lecture's Mistake 1 — mention only if it bites) |
| "IDs are useless / `.name` is broken" | Pre-judging the mechanism | "Which one did the browser actually obey? Interesting — let's see what the slides say" |
| "The card is bigger than 460 because of a bug" | Box-model expectation gap — the target discovery | "Name every part you suspect" — collect 2–3 hypotheses, confirm none yet |
| Padding vs margin interchangeable | Outside-space vs inside-space | Margin probe result first ("moved, not grown"); vocabulary later |
| "All styles inherit" (from B's success) | Over-generalizing inheritance | "Did the handle change its font? What does that do to 'all'?" — no formal property lists |
| Wants to edit the HTML to "fix" the name faster | Crossing the lab's boundary (and drifting toward G0-style authoring) | "Everything this lab teaches lives in the CSS file — HTML stays untouched" |
| Asks about `box-sizing`, `!important`, media queries | Real CSS, out of pilot scope | Park it visibly on the board as a "slides/later" question; do not demo |

---

## 10. The answer stylesheet explained

`assets/css-workshop-solution.css` is the completed 30-minute state plus commentary, organized so you can skim by experience:

- **Card block** — suggested final values (460 / 44 / 8) with the C1–C3 progression noted in comments.
- **`ANSWER — EXPERIENCE A`** — why `.name` edits vanished (ID rule controls the contested property), the sanctioned fix (edit the winning rule, don't delete), what may be said in the workshop vs what stays for the slides, plus the property-by-property bonus observation (teacher-only).
- **`ANSWER — EXPERIENCE B`** — the full CHANGED / NOT CHANGED inventory with the one-line reason per holdout, and the phrasing to elicit rather than state.
- **`ANSWER — EXPERIENCE C`** — the arithmetic (414 → 514 → 554 → 564), where each delta came from, the margin-probe verdict, and the explicit **box-sizing out-of-scope warning**.
- **`ANSWER — Step 6`** — personalization has no canonical answer; completion = the student can name one deliberate choice and why.
- **`ANSWER — Extensions`** — E1/E2 solutions and the honest E3 tooling flag.

Nothing in the student HTML or student CSS contains these answers — questions and EXPT markers only. That split is the design: students *experience*, the two teacher files *explain*.

---

## 11. Completion criteria (formative — no grade attached)

A student is done when they can show their screen and:

1. Point at the two rules that both controlled the name, and say which one the browser obeyed (mechanism-free wording is fine).
2. Name the lines that followed the card's restyle and the lines that refused, with a reason in their own words.
3. State, qualitatively, why the card is wider than its `width` value — "padding and border add to it" is a full-credit answer.
4. Have written predictions for the experiments they ran (wrong ones included) — attempts are visible, not just outcomes.
5. Have a personalized card they chose deliberately (Step 6).

Explicitly NOT required: correct terminology, DevTools, finishing the optional probes, or any edit to the HTML.

---

## 12. Transition into the CSS lecture

Run the workshop **before** the deck, then open the lecture with their own evidence — the discovery-to-slide map:

| Workshop moment | Slide that answers it (by heading; slide # from the current 21-slide build) |
|---|---|
| Step 3 — "why didn't my red show up?" | *CSS Selectors - Part 1* (slide 6: element/class/`#id`) → *Common Mistakes* (slide 13: `#` vs `.`) |
| Step 4 — who followed, who refused | *Why "Cascading"?"* (slide 3: inheritance + override) |
| Steps 5 — extra pixels | *The Box Model* (slide 9 — ASCII diagram + the `width: 200px; padding: 20px; border: 2px` example is the arithmetic confirmation) |
| Step 2 loop + personalization | *Three Ways to Add CSS* (slide 5) and *Homework* (slide 18: the profile card they just pre-designed) |
| E1 hover (if run) | *Real-World Example: Simple Navigation Bar* (slide 14: `a:hover`) |

Suggested opener line: *"Yesterday the card ignored you. Today the slides tell you why it obeyed — and when."* End by pointing at the Homework slide: the workshop card's styling becomes their starting point, and they may then build their own profile HTML — which is exactly where HTML authoring belongs.

**Optional follow-up for Roy (not done — needs your call):** the deck already carries an unreferenced figure `diagrams/css-specificity-hierarchy.png`. If Experience A lands well with the class, that is the moment to reference it in the *CSS Selectors* section — improving existing material rather than adding new (workshop principle 8). Also consider fixing the deck's closing promise *"Next class: CSS Flexbox"* (no Flexbox lecture exists; next in sequence is `responsive-bulma`).

**Gate reminder for students:** this lab is practice, not G0. G0 later asks for a page built from a wireframe with semantic markup and Bulma at 375 px — nothing this lab does.

---

## 13. G0 boundary checklist (for anyone editing this pilot later)

The workshop must never: author HTML from a blank body · use the Barangay Profile / sari-sari landing scenarios · introduce Bulma or any framework · include in-page anchor nav · include forms/validation · test or drill 375 px responsiveness · work from a wireframe. Its deliverable stays: **handwritten custom CSS applied to existing, untouched markup.** If a future revision breaks any line here, it has drifted into gate rehearsal.

---

## 14. After the first live run — record for Roy

- Actual minutes per stage vs §4's estimates (especially Step 3's hunt and Step 5's three puzzles).
- Which experience produced the loudest "wait, why?" — that decides whether 15-min cuts should keep A or swap in C.
- Device realities: did pairs hinder individual ownership? Was save→refresh friction frequent?
- Two or three verbatim student hypotheses from exit question 3 — the best gauge of whether the workshop created the questions the deck then answers.
