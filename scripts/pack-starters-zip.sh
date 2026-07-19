#!/usr/bin/env bash
# Pack a curated starters-only ZIP for offline / flash-drive use (Option D).
# Contains ONLY the starter/practice code (no lecture decks, no solutions, no
# quizzes) plus a START-HERE guide. Run AFTER `npm run stage` has produced
# web-lectures/full-stack-g10/assets/.
#
# Usage: ./scripts/pack-starters-zip.sh 1.0.0
set -euo pipefail

VERSION="${1:?usage: pack-starters-zip.sh <version e.g. 1.0.0>}"
SRC="web-lectures/full-stack-g10/assets"

if [ ! -d "$SRC" ]; then
  echo "✘ $SRC not found. Run 'npm run stage' first." >&2
  exit 1
fi

STAGE="$(mktemp -d)/g10-starters"
mkdir -p "$STAGE"

# Starters tree, organized by lecture slug (starters/<slug>/...) + starters/_shared/.
cp -r "$SRC" "$STAGE/starters"

cat > "$STAGE/START-HERE.md" <<'EOF'
# Grade 10 — Starter Code

This folder contains the **starter / practice files** for every lecture's
"🎯 Try It" activities, mini-projects, gates, and challenges. There are **no
solutions and no quizzes** here — just the files you open and build on.

## How to use a starter
1. Open the folder for the lecture you're on, e.g. `starters/html/`.
2. **Copy** the file somewhere you can edit (your own folder, a USB stick, a
   code editor). Don't edit the only copy — keep the original as a backup.
3. Open the `.html` file by **double-clicking** it. It opens in your browser.
4. To edit the code, open the same file in any text editor (VS Code, Notepad,
   etc.), save, then **refresh** the browser.

## Tips
- For multi-file starters (e.g. `starters/_shared/gates/gate-g4-request-response/`),
  open that folder in VS Code and follow its `package.json` / `README`.
- Everything here works **fully offline** — no internet needed after download.
- If you also downloaded the full lecture ZIP, these same starters live inside
  it under `assets/`, next to the decks.

## Where things are
- `starters/<lecture-slug>/` — each lecture's practice & mini-project files.
- `starters/_shared/gates/` — the gate scaffolds (G0–G6).
- `starters/_shared/challenges/` — the capstone challenge starters.
EOF

OUT="dist/starters-v${VERSION}.zip"
mkdir -p dist
( cd "$(dirname "$STAGE")" && zip -r -q "$OLDPWD/$OUT" "$(basename "$STAGE")" )

COUNT=$(find "$STAGE/starters" -type f | wc -l | tr -d ' ')
echo "✔ Wrote $OUT ($COUNT starter files)"
echo "  Attach it to a GitHub Release tagged v${VERSION}."
