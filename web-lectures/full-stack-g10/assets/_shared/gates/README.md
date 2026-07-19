# 🚪 AI-Unlock Gate Activities — Runnable Scaffolds

The actual **starter + solution files** for each gate in
[`inceptions/gate-activities.md`](../../inceptions/gate-activities.md).
Each gate is a **30-minute, no-AI, individual** integration build. Passing it
*unlocks AI code generation* for that technology area.

> **Read the rules and pedagogy first:**
> [`inceptions/teaching-model-ai-gated-mastery.md`](../../inceptions/teaching-model-ai-gated-mastery.md) (the *why*) ·
> [`inceptions/gate-activities.md`](../../inceptions/gate-activities.md) (the per-gate *spec* with pass criteria).

---

## The seven gates

| Gate | Folder / files | Tech unlocked | Quarter | How to run |
|---|---|---|---|---|
| **G0** Markup | `gate-g0-markup-starter.html` / `-solution.html` | HTML, CSS, Bulma, responsive | Q1 | Open in browser |
| **G1** Control Flow & Data | `gate-g1-control-flow-starter.html` / `-solution.html` | Vanilla JS basics | Q2 | Open in browser |
| **G2** DOM & Events | `gate-g2-dom-events-starter.html` / `-solution.html` | DOM + events | Q2 | Open in browser |
| **G3** Persistence + Async | `gate-g3-async-storage-starter.html` / `-solution.html` + `gate-g3-data.json` | `fetch`/async + `localStorage` | Q2 | **Serve locally** (see below) |
| **G4** Request → Response | `gate-g4-request-response/` | Express routes + EJS + validation | Q3 | `npm install && npm start` |
| **G5** Data Model + SQLite CRUD | `gate-g5-sqlite-crud/` | SQLite + prepared statements | Q3 | `npm install && npm start` |
| **G6** Auth & Sessions | `gate-g6-auth-sessions/` | Sessions, login, route guards | Q4 | `npm install && npm start` |

---

## How to run

### Client-side gates (G0, G1, G2)
Open the `-starter.html` file directly in a browser (F12 → Console for G1).
The `-solution.html` is the teacher reference.

### G3 (Persistence + Async)
**Must be served** — `fetch('data.json')` is blocked over `file://`. Pick one:
```bash
# Option A: VS Code "Live Server" extension (right-click the HTML file -> Open with Live Server)
# Option B: a one-off static server
npx serve .           # then open the URL it prints
```

### Node gates (G4, G5, G6)
Each is a standalone project folder:
```bash
cd gate-g4-request-response
npm install
npm start             # runs app.js (the starter)  -> http://localhost:3000
npm run solution      # runs app.solution.js (teacher reference)
```
- **G5** creates a `residents.db` file (gitignored). Delete it to reset.
- **G6** test login → username: `admin`, password: `barangay123` (see `auth-helper.js`).

---

## Facilitator rules (the important part)

1. **30 minutes, no AI, individual.** Tabs closed, AI tutors off for the gate too.
2. **Objective pass criteria.** Each gate's spec (in `gate-activities.md`) is a
   checkbox list of "it does X." Pass/fail, not a vibe.
3. **"Not yet" is not a failing grade.** A miss defers that tech's AI-unlock and
   triggers a "loop back, retry next class."
4. **Every gate reuses a prior skill** (the spiral doing spaced retrieval for free).
5. 🔒 **Unlock is individual; project AI-use is collective.** A group may use AI
   for tech area X **only when every member has individually passed gate X.**

---

## Folder layout

```
shared/gates/
├── README.md                          ← you are here
├── gate-g0-markup-starter.html
├── gate-g0-markup-solution.html
├── gate-g1-control-flow-starter.html
├── gate-g1-control-flow-solution.html
├── gate-g2-dom-events-starter.html
├── gate-g2-dom-events-solution.html
├── gate-g3-async-storage-starter.html
├── gate-g3-async-storage-solution.html
├── gate-g3-data.json
├── gate-g4-request-response/          (Express app: app.js, app.solution.js, package.json, .gitignore, views/)
├── gate-g5-sqlite-crud/               (Express + SQLite app)
└── gate-g6-auth-sessions/             (Express + sessions app, + auth-helper.js)
```
