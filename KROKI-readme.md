# Kroki — Local Diagram Rendering (On-Demand)

> **Quick reference for running Kroki locally on WSL 2.** This is the cheat sheet for the
> **on-demand** strategy: Kroki is off by default, you start it only when editing diagrams, and
> it frees its RAM the moment you stop it.
>
> For the full deep-dive (systemd auto-start, all 13 engines, security, uninstall), see
> [`references/diagram-converter/kroki-local.md`](references/diagram-converter/kroki-local.md).

---

## TL;DR — the three commands you'll actually use

```bash
kroki-up        # start Kroki (only when you're about to edit/render diagrams)
kroki-status    # check if it's running
kroki-down      # stop Kroki, free ~500 MB of RAM
```

> **Why on-demand?** The build pipeline has **mtime-skip**: once a PNG is on disk, a normal
> `npm run build` reads the existing PNG and never touches Kroki. Kroki only fires when a
> diagram *source* (`.mmd` / `.puml` / `.d2` / `.dot`) has actually changed. So in steady state
> you rarely need it running — start it for a diagram-authoring session, then stop it.

---

## One-time setup

Run each of these **once**. After that, you only ever use `kroki-up` / `kroki-down`.

### 1. Create the Docker network

```bash
docker network create kroki-net
```

### 2. Pull both images (~600 MB total, takes 1–2 min)

```bash
docker pull docker.io/yuzutech/kroki
docker pull docker.io/yuzutech/kroki-mermaid
```

### 3. Start the containers the first time

```bash
# Frontend — exposes port 8000 on localhost, delegates Mermaid to the companion
docker run -d --name kroki --network kroki-net \
  -p 127.0.0.1:8000:8000 \
  -e KROKI_MERMAID_HOST=kroki-mermaid \
  docker.io/yuzutech/kroki

# Mermaid companion — MUST run, or every .mmd render returns HTTP 503
docker run -d --name kroki-mermaid --network kroki-net \
  docker.io/yuzutech/kroki-mermaid
```

### 4. Add the on-demand aliases to your shell

Append to `~/.bashrc` (or `~/.zshrc` if you use zsh):

```bash
# ── Kroki on-demand controls ──────────────────────────────────────────
# Start both containers (creates them if missing, otherwise just restarts)
alias kroki-up='docker start kroki kroki-mermaid 2>/dev/null && echo "✓ Kroki up at http://localhost:8000" || echo "✗ Containers not created yet — see KROKI-readme.md setup"'

# Stop both containers — instantly frees ~500 MB of RAM
alias kroki-down='docker stop kroki kroki-mermaid && echo "✓ Kroki stopped, RAM freed"'

# Show running status
alias kroki-status='docker ps --filter name=kroki --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'

# Live resource usage (CPU %, memory, network) — handy to confirm it's idle
alias kroki-stats='docker stats --no-stream kroki kroki-mermaid'

# Tail Kroki logs (useful when a render fails)
alias kroki-logs='docker logs -f kroki'
```

Then reload your shell:

```bash
source ~/.bashrc
```

### 5. Verify the setup worked

```bash
kroki-status                      # both should show "Up ..."
sleep 5                           # give the Mermaid companion ~5s to boot on first render
printf 'flowchart LR\n  A-->B\n' | curl -s -o /tmp/kroki-test.png -w '%{http_code} %{size_download}\n' \
  --data-binary @- http://localhost:8000/mermaid/png
# expect: 200 <size>   (a real PNG, ~1000–5000 bytes)
```

If you see `200`, you're done. Run `kroki-down` now to free the RAM until you actually need it.

> **Note on auto-start:** We deliberately do **not** run `docker update --restart` or
> `sudo systemctl enable docker`. That keeps Kroki off by default — exactly the on-demand
> behavior we want. If you later prefer "always on," see the
> [auto-start section](references/diagram-converter/kroki-local.md) of the full guide.

---

## Daily workflow

### When you're editing diagrams (`.mmd`, `.puml`, `.d2`, `.dot`)

```bash
kroki-up                       # start Kroki for this session
# ... edit diagram sources ...
npm run diagram -- lectures/htmx   # render one lecture's diagrams
# or:  npm run build:kroki -- htmx  # render + build the deck in one step
npm run check:mermaid              # full mermaid syntax validation (all fences + .mmd)
kroki-down                     # done — free the RAM
```

### When you're NOT editing diagrams (most days)

```bash
# Kroki stays stopped. You don't need it.
npm run build -- htmx          # reads existing PNGs via mtime-skip — zero Kroki, zero internet
npm run build:all              # same — unless you edited a diagram source
npm test                       # Kroki not involved at all
```

The build only calls Kroki when a `.mmd`/`.puml`/`.d2`/`.dot` source is **newer** than its
rendered `.png`. Unchanged diagrams are skipped. This is why on-demand works so well here.

---

## Rendering diagrams — the commands

| Goal | Command |
|------|---------|
| Render one lecture's diagrams (no build) | `npm run diagram -- lectures/htmx` |
| Render + build one lecture (uses local Kroki) | `npm run build:kroki -- htmx` |
| Render + build **all** lectures | `npm run build:kroki -- --all` |
| Build **without** Kroki (reads existing PNGs) | `npm run build -- htmx` |
| Validate all mermaid syntax (fences + `.mmd`) | `npm run check:mermaid` |
| Override the Kroki URL for one command | `KROKI_BASE_URL=http://localhost:8000 npm run build -- htmx` |

> `npm run build:kroki` is just a convenience wrapper that sets
> `KROKI_BASE_URL=http://localhost:8000` and runs `node scripts/build.js`. It does **not** start
> Kroki for you — run `kroki-up` first.

---

## Resource footprint

| State | CPU | RAM | Notes |
|-------|-----|-----|-------|
| **Stopped** (`kroki-down`) | 0% | 0 MB | Nothing running. This is the default. |
| **Running, idle** (`kroki-up`, no renders) | ~0% | ~350–700 MB | JVM + headless Chromium parked, waiting. |
| **Rendering a diagram** | brief spike | same | Only active for the seconds a render takes. |

Check your actual numbers anytime:

```bash
kroki-stats
```

At idle you'll see CPU `0.00%` — the only real cost is the held RAM, which is why we stop it
between sessions.

---

## Troubleshooting

### `kroki-up` says "Containers not created yet"
You skipped the [one-time setup](#one-time-setup). Run steps 1–3 first.

### Mermaid renders return `HTTP 503`
The companion container isn't reachable. Check:
```bash
docker ps --filter name=kroki-mermaid      # is it running?
docker logs --tail 20 kroki-mermaid        # why did it fail?
kroki-up                                   # (re)start both
```
The companion embeds headless Chromium and needs ~5–10s to be ready on first render.

### Port 8000 is already in use
```bash
ss -tlnp | grep ':8000'    # what's holding it?
```
Either stop the other process, or re-create the `kroki` container on a different port
(e.g. `-p 127.0.0.1:9000:8000`) and use `KROKI_BASE_URL=http://localhost:9000`.

### "permission denied" talking to Docker
Your user isn't in the `docker` group. Fix once:
```bash
sudo usermod -aG docker $USER
# log out of WSL entirely and back in (or: newgrp docker)
```

### A specific diagram won't render
Check the engine-specific notes in the
[full guide](references/diagram-converter/kroki-local.md) — notably the **D2 → SVG-only**
caveat (Kroki `24.04` can't render D2 to PNG; keep `.mmd` as the primary source).

---

## Updating Kroki

```bash
kroki-down
docker rm kroki kroki-mermaid
docker pull docker.io/yuzutech/kroki
docker pull docker.io/yuzutech/kroki-mermaid
# then re-run the two `docker run` commands from the one-time setup (step 3)
kroki-up
```

---

## Where to learn more

- **Full reference (engines, auto-start, security, uninstall):**
  [`references/diagram-converter/kroki-local.md`](references/diagram-converter/kroki-local.md)
- **Diagram converter overview (14 engines, templates):**
  [`references/diagram-converter/README.md`](references/diagram-converter/README.md)
- **How the build pipeline decides what to render (fallback chains, mtime-skip):**
  [`inceptions/context.md`](inceptions/context.md) §12
