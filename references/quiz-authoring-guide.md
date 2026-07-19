# Quiz Authoring Guide — `assets/quiz.md`

> **The single source of truth for writing lecture quizzes in Markdown.**
> This guide documents the format **already used by every existing quiz** in this repo (~20 files),
> so that new quizzes stay consistent and a future interactive renderer can parse them with zero
> changes. Pair it with [`inceptions/context.md`](../inceptions/context.md) (the project "second brain")
> and [`inceptions/teaching-model-ai-gated-mastery.md`](../inceptions/teaching-model-ai-gated-mastery.md)
> (the teaching model).

**Last updated:** 2026-07-18 · **Status:** Format spec of current practice.

---

## 1. Purpose & current state

- **What a quiz is for.** Each lecture's quiz is a **calibration anchor**, not a graded exam. Its job
  is to tell the student **whether "I can do it" matches "I actually can"** — i.e. whether they are
  ready to attempt that lecture's gate. See
  [`inceptions/teaching-model-ai-gated-mastery.md`](../inceptions/teaching-model-ai-gated-mastery.md)
  §"Self-quiz (calibration anchor)".
- **It is NOT graded.** A miss is a signal to loop back and retry, never a grade penalty.
- **Current rendering state (be honest about this).** Today `quiz.md` files are **plain static
  Markdown**. Nothing in the build core ([`scripts/lib/`](../scripts/lib)), the Express server
  ([`server/`](../server)), or the EJS views parses or renders them, and `lecture.md` files do not
  link to them. They are consumed as **readable text** (screen / print) right now. Section 11 notes
  how a future renderer can turn them interactive **without changing any existing quiz file**.

> **TL;DR:** Write clean, consistent Markdown. The format below is both human-readable *now* and
> machine-parseable *later*.

---

## 2. File placement & naming

| Thing | Convention |
|---|---|
| Path | `lectures/<slug>/assets/quiz.md` |
| Slug | kebab-case, same as the lecture folder (e.g. `js-basics`, `responsive-bulma`) |
| Filename | **always** `quiz.md` (never `quiz-2.md`, `Quiz.md`, etc.) |
| One per lecture | exactly one `quiz.md` per lecture folder |

Examples of correct paths:

```
lectures/html/assets/quiz.md
lectures/js-arrays-objects/assets/quiz.md
lectures/debugging-devtools/assets/quiz.md
```

This matches the project-wide convention from [`inceptions/context.md`](../inceptions/context.md) §7
(kebab-case everywhere; assets live in each lecture's `assets/` folder).

---

## 3. Anatomy of a quiz file

A quiz is a single Markdown file with **one `#` title** and a series of **`##` questions**, each
followed by either multiple-choice options or fill-in answers.

````markdown
# Quiz: <Topic Name>

## <First question prompt>
* [ ] wrong option
* [x] correct option
* [ ] wrong option
* [ ] wrong option

## <Second question prompt>
<code block if needed>
* [ ] ...
* [x] ...

## <Fill-in question with a ___ blank>
Answer: acceptable wording 1
Answer: acceptable wording 2
````

Rules:

1. **Exactly one `#` line** at the top: `# Quiz: <Topic>`. The topic should match the lecture slug's
   human name (e.g. `Quiz: JavaScript Basics`, `Quiz: Debugging with DevTools`).
2. **One blank line** between the title and the first question, and **one blank line between every
   question block**. Do not run questions together.
3. **Every question starts with `##`** (level-2 heading). Use `###`/`####` **only inside** a question
   if ever needed — never to start a new question. (This mirrors the slide-splitting convention in
   [`README.md`](../README.md) where `#`/`##` start new units.)
4. **Target ~8 questions** per quiz (existing quizzes range 8–10). Mix question types (see §8).
5. **No preamble, no closing remark.** Just title + questions. Keep it scannable.

---

## 4. Question Type A — Multiple choice (the main type)

This is the dominant question type across all existing quizzes.

### Structure

```markdown
## <Question prompt — a full sentence ending in "?" or a clear instruction>
* [ ] <distractor>
* [ ] <distractor>
* [x] <the correct answer>
* [ ] <distractor>
```

### Rules

| Rule | Detail |
|---|---|
| Option marker | **`* [ ]`** for a wrong option, **`* [x]`** for the correct one. The lowercase `x` marks the answer. |
| Spacing | `*` + one space + `[` + space-or-`x` + `]` + one space + option text. Example: `* [x] \`const\``. |
| Exactly one answer | A multiple-choice question has **exactly one** `[x]`. There are **no multi-select** questions in this format. |
| Option count | Usually **4** options. **2** is fine for True/False (see §6). Avoid 3 (feels arbitrary) or 5+ (too long). |
| Answer position | **Vary it.** Do not always put the correct answer third. Spread `[x]` across positions 1–4 over the quiz. |
| Inline code | Wrap code in backticks inside both prompts and options: `` `localStorage.setItem(...)` ``, `` `<article>` ``. This is heavily used and aids readability. |
| Plausible distractors | Every wrong option should be *believable* — a real misconception, a common typo, or a near-miss API name. Never use joke options like "Ask the teacher." |

### Code blocks in a question

If the question refers to code, put a **fenced code block** between the `##` prompt and the options:

````markdown
## What does this code output?
```javascript
let x = "5" + 3;
console.log(x);
```
* [ ] 8
* [x] "53"
* [ ] 53
* [ ] Error
````

- The opening fence goes **directly under the `##` prompt** (a blank line before it is fine too; just
  keep it consistent within the file).
- Options go **directly under the closing fence**.
- Always tag the fence with a language: ` ```html `, ` ```css `, ` ```javascript `, ` ```sql ` — so a
  future renderer can syntax-highlight (and so it's readable today).

---

## 5. Question Type B — Fill-in-the-blank / short answer

For definitions and one-word / short-phrase answers.

### Structure

```markdown
## <Prompt that contains one or more ___ blanks>
Answer: <acceptable wording 1>
Answer: <acceptable wording 2>
Answer: <acceptable wording 3>
```

### Rules

| Rule | Detail |
|---|---|
| Blanks | Mark the blank with **`___`** (three underscores) inside the prompt. Example: *"The CSS ___ model treats every element as a box."* |
| Answer lines | Each acceptable answer on its own line starting with **`Answer: `** (capital A, colon, one space). |
| Multiple variants | **Always list several** acceptable wordings — cover case (`Array` / `array`) and phrasing. The grader accepts *any one* of them. |
| No options | Fill-in questions have **no** `* [ ]` lines. If you find yourself writing options, it's really a multiple-choice question — use Type A. |

### Examples

```markdown
## Ben sees `NaN` in his console after doing math. What does `NaN` stand for?
Answer: Not a Number
Answer: NaN
Answer: not a number
```

```markdown
## The three logical operators in JavaScript are `&&` (AND), `||` (OR), and `___` (NOT).
Answer: !
Answer: NOT
```

```markdown
## Responsive design means building pages that ___ so they look good on phones, tablets, and desktop computers.
Answer: adapt to different screen sizes
Answer: adjust to different screen sizes
Answer: respond to screen size
```

---

## 6. True / False convention

Treat True/False as a **2-option multiple-choice question** (Type A), **not** as fill-in.

```markdown
## True or False: A PWA can be installed on a phone's home screen without going through an app store.
* [x] True
* [ ] False
```

Tip — make `False` *informative*: instead of a bare `False`, add the correction so the student learns
from the miss:

```markdown
## True or False: Once you deploy your app, you never need to update it again.
* [ ] True
* [x] False — you should regularly update dependencies for security, monitor for errors, and fix bugs
```

---

## 7. Copy-paste template

Paste this skeleton and fill in the `[brackets]`. It includes one of each question type so you can
delete what you don't need.

````markdown
# Quiz: [Topic Name]

## [Scenario or concept — a clear question?]
* [ ] [plausible distractor]
* [ ] [plausible distractor]
* [x] [the correct answer]
* [ ] [plausible distractor]

## What does this code output?
```javascript
[// code the student must trace]
```
* [ ] [wrong output]
* [x] [correct output]
* [ ] [wrong output]
* [ ] [wrong output]

## [A "find the bug" scenario]. What is the bug?
```html
[// the buggy snippet]
```
* [ ] [wrong diagnosis]
* [x] [correct diagnosis]
* [ ] [wrong diagnosis]
* [ ] [wrong diagnosis]

## [A classmate asks / "why" question]. Which is the best answer?
* [ ] [shallow/superficial answer]
* [x] [the deep, correct answer]
* [ ] [technically-true-but-not-best answer]
* [ ] [plainly wrong answer]

## [Definition prompt with a ___ blank.]
Answer: [canonical wording]
Answer: [case variant]
Answer: [phrasing variant]

## True or False: [statement].
* [x] True
* [ ] False
````

---

## 8. Worked example — a complete quiz

A full, original quiz showing every type in place, using the project's Philippine classroom context.

````markdown
# Quiz: HTML Forms & Inputs

## Maria is building a contact form for her barangay office website. Which input type should she use for a visitor's email address so the phone shows the "@" key and basic validation?
* [ ] `<input type="text">`
* [x] `<input type="email">`
* [ ] `<input type="mail">`
* [ ] `<input type="address">`

## Carlo wrote this form, but pressing the button does not submit any data. What is the bug?
```html
<form>
  <input type="text" name="name">
  <button type="button">Send</button>
</form>
```
* [ ] The `name` attribute is missing a value
* [ ] The form needs an `id`
* [x] The button `type` is `"button"` instead of `"submit"`
* [ ] `<form>` is not a real element

## What does this render in the browser?
```html
<input type="checkbox" name="agree" checked>
```
* [ ] A text box that is empty
* [x] A checkbox that is already ticked
* [ ] A radio button
* [ ] A submit button

## Liza wants a visitor to pick exactly one shipping option from "Pickup", "Delivery", and "LBC". Which input type and attribute combination is correct?
* [ ] Three `<input type="checkbox">` with the same `name`
* [x] Three `<input type="radio">` with the same `name`
* [ ] One `<input type="select">`
* [ ] Three `<input type="radio">` with different `name`s

## A classmate asks: "Why put `name="email"` on an input?" Which is the best answer?
* [ ] It is required by HTML5 or the page will not load
* [x] `name` becomes the key the server uses to read that field's value (e.g. `req.body.email`)
* [ ] It styles the input
* [ ] It makes the input required

## The attribute that marks a field the user must fill in before submitting is `___`.
Answer: required
Answer: the required attribute

## True or False: A `<label>` should be linked to its input with `for="id"` so tapping the label focuses the input — which helps both mobile users and screen readers.
* [x] True
* [ ] False
````

---

## 9. Pedagogy & content tips

### Use the established question archetypes

Vary these across the quiz so it tests different skills:

| Archetype | What it tests | Example opener |
|---|---|---|
| **Recall / concept** | Do you know the definition? | *"Which keyword declares a value that won't change?"* |
| **Code output** | Can you trace code? | *"What does this code output?"* + snippet |
| **Find the bug** | Can you debug? | *"[Name] wrote this, but it doesn't work. What is the bug?"* |
| **Best answer / "why"** | Do you understand *why*? | *"A classmate asks… Which is the best answer?"* |
| **Scenario / applied** | Can you choose the right tool? | *"[Name] wants to… Which should she use?"* |
| **Definition (fill-in)** | Vocabulary | *"The ___ model treats every element as a box."* |
| **True / False** | Misconception checks | *"True or False: …"* |

### Localize to the students' world

The existing quizzes consistently use **Filipino names and settings** — keep doing that so questions
feel concrete and relevant:

- **Names:** Maria, Carlo, Juan, Liza, Ben, Ana (rotate them).
- **Settings:** sari-sari store, barangay office/officials, school club/website, student grades,
  jeepney/load/online sellers.
- **Currency:** `₱` (peso) when showing prices.

### Distractor rules

1. **Every wrong option must be plausible** — a real misconception, a common typo, or a near-miss.
   (`getElementByID` vs `getElementById`; `background` vs `backround` misspelling; a method that
   exists on a *different* data type.)
2. **Avoid "all of the above" / "none of the above"** — they reveal the answer by process of
   elimination and don't test understanding.
3. **Avoid joke options** ("Ask the teacher", "Give up") — they lower the signal.
4. **Keep options roughly the same length and grammatical form.** If the correct answer is the only
   long one, students can guess by length.
5. **Vary the correct-answer position** across the quiz — don't always make it the 3rd option.

### Calibration, not gotcha

This quiz decides *"am I ready for the gate?"* — so write it to **match the lecture's learning
objectives**, not to trick. If a student genuinely understood the lecture, they should pass.

---

## 10. Do / Don't quick list

**Do**
- ✅ Use `# Quiz: <Topic>` as the only `#` line.
- ✅ Start every question with `##`.
- ✅ Use `* [x]` for exactly one answer per multiple-choice question.
- ✅ Tag code fences with a language (` ```javascript `).
- ✅ List 2–4 `Answer:` variants for fill-in questions.
- ✅ Treat True/False as a 2-option multiple-choice question.
- ✅ Use backticks for all code (`const`, `<article>`, `forEach`).
- ✅ Localize with Filipino names and settings.

**Don't**
- ❌ Don't use `- [ ]` (dash) — the convention is `* [ ]` (asterisk).
- ❌ Don't put two `[x]` on one question (no multi-select).
- ❌ Don't leave a multiple-choice question with 0 or 1 distractor.
- ❌ Don't add preamble, headings other than `#`/`##`, or closing remarks.
- ❌ Don't link to external URLs — quizzes are offline-readable (see context.md §7).
- ❌ Don't mix `Answer:` lines and `* [ ]` options in the same question.

---

## 11. Validation checklist

Before saving a `quiz.md`, eyeball it against this list:

- [ ] File is at `lectures/<slug>/assets/quiz.md`.
- [ ] Exactly one `# Quiz: …` line at the top.
- [ ] Every question starts with `##`; no other heading levels start a question.
- [ ] One blank line between the title and the first question, and between every question.
- [ ] Each multiple-choice question has **exactly one** `[x]` and at least 2 options total (ideally 4).
- [ ] Each fill-in question has **only** `Answer:` lines (no `* [ ]` mixed in) and at least 2 variants.
- [ ] Every code fence has a language tag.
- [ ] Correct-answer position varies across the quiz.
- [ ] All code is wrapped in backticks.
- [ ] ~8 questions, mixing at least 3 archetypes from §9.

---

## 12. Forward note — how a future renderer would parse this

Nothing needs to change in existing quiz files for an interactive renderer to be added later. The
format above is intentionally machine-parseable:

```
# Quiz: <title>              ←  parse the single H1 → quiz title
## <prompt>                  ←  parse each H2 → a question; its prompt is the heading text
* [ ] <text>                 ←  an option: bracket = checkbox, 'x' = correct
* [x] <text>
```lang / ```               ←  a fenced block immediately under the H2 → question's code context
Answer: <text>              ←  a fill-in acceptable answer (mutually exclusive with * [ ])
```

A renderer (e.g. an Express route `/lectures/:slug/quiz` or a built-in slide type) would:

1. Split the file on `##` headings (same approach as [`scripts/lib/split-slides.mjs`](../scripts/lib/split-slides.mjs) uses for slides).
2. For each block, detect the question type by the first non-empty line after the prompt:
   - lines starting with `* [` → **multiple choice**;
   - lines starting with `Answer:` → **fill-in**.
3. Read the correct answer(s): `[x]` for MCQ; the set of `Answer:` strings (case-insensitive,
   trimmed) for fill-in.

Because **every existing quiz already follows this grammar**, adding a renderer later is a
build/server change only — **no content migration** is required. Until then, the files remain
perfectly usable as readable/printable Markdown.
