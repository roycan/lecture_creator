# Vendored browser bundles (`scripts/lib/vendor/`)

Prebuilt UMD bundles read by [`../bundle-libs.mjs`](../bundle-libs.mjs) and
inlined into every exported presentation so the shell is fully offline
(Phase 2c, decision D4). These are committed (not gitignored) — they are part
of the deterministic, no-network build.

Pinned to the **exact** CDN versions the original `template.mjs` referenced, so
the offline output is a faithful mirror of what the online CDN path loaded:

| File | Library | Version | Source URL |
|---|---|---|---|
| `highlight.min.js` | highlight.js | 11.9.0 (BSD-3-Clause) | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js` |
| `github-dark.min.css` | hljs dark theme | 11.9.0 | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css` |
| `github.min.css` | hljs light theme | 11.9.0 | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css` |
| `mermaid.min.js` | mermaid | 10.9.0 (MIT) | `https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js` |

## Notes

- **highlight.js 11.9.0** auto-detects languages from this bundle; no per-language
  registration is needed for these lectures. It defines the global `hljs` that the
  runtime uses via `hljs.highlightAll()`.
- **mermaid 10.9.0** is intentionally pinned rather than `package.json`'s `^11.0.0`
  to match the version the old CDN tag loaded. The runtime calls
  `mermaid.run({ nodes })`, which is v10/v11-compatible. `mermaid.min.js` is ~3 MB —
  inlining it makes a mermaid lecture's HTML large; that is the offline trade-off
  this project explicitly chose (D2/D4).
- `bundleLibs({ mermaid: false })` omits `mermaidScript`, so non-mermaid lectures
  stay small and still fully offline.

## Re-fetching (if a vendor file is lost or upgraded)

```bash
mkdir -p scripts/lib/vendor
curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" \
  -o scripts/lib/vendor/highlight.min.js
curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" \
  -o scripts/lib/vendor/github-dark.min.css
curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" \
  -o scripts/lib/vendor/github.min.css
curl -fsSL "https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js" \
  -o scripts/lib/vendor/mermaid.min.js
```
