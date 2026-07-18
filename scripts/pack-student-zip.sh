#!/usr/bin/env bash
# Pack the student-facing lecture bundle into a versioned ZIP.
# Usage: ./scripts/pack-student-zip.sh 1.0.0
set -euo pipefail

VERSION="${1:?usage: pack-student-zip.sh <version e.g. 1.0.0>}"
SRC="web-lectures/full-stack-g10"
STAGE="$(mktemp -d)/full-stack-g10-lectures"
mkdir -p "$STAGE"

# Copy exactly what students need
cp "$SRC"/*.html "$STAGE"/
cp "$SRC/full-stack-g10-curriculum.md" "$STAGE"/

# Produce the zip so the top-level folder is named nicely
OUT="dist/full-stack-g10-v${VERSION}.zip"
mkdir -p dist
( cd "$(dirname "$STAGE")" && zip -r "$OLDPWD/$OUT" "$(basename "$STAGE")" )

echo "✔ Wrote $OUT"
echo "  Attach it to a GitHub Release tagged v${VERSION}."