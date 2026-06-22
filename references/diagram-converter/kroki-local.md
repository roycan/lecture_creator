# Run Kroki locally with Podman or Docker

This guide shows how to run a local Kroki server on your own machine and point the lecture
pipeline at it for fully-offline diagram rendering. The commands use **Podman**; **Docker is a
drop-in** — replace `podman` with `docker` everywhere (verified on Docker 29).

> **Mermaid needs a companion container.** The `yuzutech/kroki` image is the *frontend*; it
> delegates Mermaid rendering to a separate `yuzutech/kroki-mermaid` service. Without it, every
> Mermaid (`.mmd`) render returns **HTTP 503**. This project renders Mermaid heavily, so the
> quick start below runs **both** containers on a shared network.

## Quick start (most used)

Run Kroki (frontend **+ Mermaid companion**) in the background on localhost:8000. It is bound
to `127.0.0.1`, so it is only reachable from your machine.

```bash
# 1) A shared network lets the frontend reach the Mermaid companion by name.
podman network create kroki-net

# 2) Kroki frontend on localhost:8000, told where to find Mermaid.
podman run -d --name kroki \
  --network kroki-net \
  -p 127.0.0.1:8000:8000 \
  -e KROKI_MERMAID_HOST=kroki-mermaid \
  docker.io/yuzutech/kroki

# 3) Mermaid companion (headless Chromium — give it ~10s to boot on first render).
podman run -d --name kroki-mermaid --network kroki-net docker.io/yuzutech/kroki-mermaid

# Verify both are up
podman ps --filter name=kroki
```

Quick smoke test (expect a 200 and a real PNG size — not an error):

```bash
printf 'flowchart LR\n  A-->B\n' | curl -s -o /tmp/m.png -w '%{http_code} %{size_download}\n' \
  --data-binary @- http://localhost:8000/mermaid/png      # expect: 200 <size>
```

- Base URL for the pipeline: `http://localhost:8000` — e.g.
  `KROKI_BASE_URL=http://localhost:8000 npm run build -- <slug>`, or the convenience script
  `npm run build:kroki -- <slug>`.
- To stop later: `podman stop kroki kroki-mermaid`
- To start again: `podman start kroki kroki-mermaid`
- To see logs: `podman logs -f kroki` (frontend) / `podman logs -f kroki-mermaid`

If port 8000 is taken, change the host port, e.g. `-p 127.0.0.1:9000:8000`, and use
`http://localhost:9000` as the base URL.

> **Heads-up — output formats in this image (Kroki `24.04`):** Graphviz, PlantUML, Mermaid,
> ditaa, nomnoml, … all render to **PNG**. **D2 renders to SVG only** (`POST /d2/png` → HTTP 400
> *“Unsupported output format: png for d2. Must be one of svg.”*). In this project every `.d2`
> is a *fallback* behind a `.mmd` primary, so this never blocks a build — just keep the `.mmd`
> as the primary source for any diagram you need as a PNG.

---

## Prerequisites
- **Podman** *or* **Docker** installed (rootless / non-root recommended). Podman: https://podman.io/docs/installation · Docker: https://docs.docker.com/get-docker/. The commands say `podman`; `docker` works identically.
- A free local port (default 8000).
- ~600 MB free for the two images (`yuzutech/kroki` + `yuzutech/kroki-mermaid`).
- Optional but recommended: a firewall that blocks external access; we bind to 127.0.0.1 for local-only access.

## Start, stop, restart
```bash
# Start (first time) — see quick start above (network + 2 containers).

# Stop both
podman stop kroki kroki-mermaid

# Restart both (after stop or reboot, once the containers exist)
podman start kroki kroki-mermaid

# Remove both containers (to recreate fresh)
podman rm -f kroki kroki-mermaid
podman network rm kroki-net   # optional
```

## Auto-start on boot (optional)
Podman doesn’t auto-start containers on reboot by default. Use systemd user services to start Kroki at login or boot.

> The example below generates a unit for the **frontend** container only. For a working setup you
> must ALSO generate + enable a unit for `kroki-mermaid` (same step with `--name kroki-mermaid`)
> and have both join `kroki-net`. For most teachers, simply running
> `podman start kroki kroki-mermaid` at login (or the Quick start commands) is far simpler.

```bash
# 1) Create the container (if you haven’t already)
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki

# 2) Generate a systemd unit for this container
podman generate systemd --new --files --name kroki

# This creates ./container-kroki.service in the current directory
# 3) Install it to your user systemd dir
mkdir -p ~/.config/systemd/user
mv container-kroki.service ~/.config/systemd/user/

# 4) Reload and enable the service for your user
systemctl --user daemon-reload
systemctl --user enable --now container-kroki.service

# [Optional] Allow services to run even without an active GUI session
loginctl enable-linger "$USER"
```

Notes:
- With the service enabled, Kroki will start automatically on login. With linger enabled, it can start at boot without a user session.
- To stop and disable: `systemctl --user disable --now container-kroki.service`
- Logs via: `journalctl --user -u container-kroki.service -f`

## Verify Kroki is running
Use a simple PlantUML test via HTTP POST to render an SVG locally:

```bash
cat > /tmp/kroki-test.puml <<'PUML'
@startuml
Alice -> Bob: Hi
@enduml
PUML

curl -s -X POST \
  -H 'Content-Type: text/plain' \
  --data-binary @/tmp/kroki-test.puml \
  http://localhost:8000/plantuml/svg \
  > /tmp/kroki-test.svg

# Open /tmp/kroki-test.svg in your browser/viewer
```

You should get a valid SVG file. If you mapped a different host port, replace `8000` with your chosen port.

## Integrate with this app
- In the UI, set “Kroki base URL” to your local instance, e.g. `http://localhost:8000`.
- The app will clear its cache when you change this value so previews refresh immediately.
- Both preview and PNG download will use your local Kroki once set.

## Update Kroki to a newer version
```bash
# Pull the latest image
podman pull docker.io/yuzutech/kroki

# If using a simple container
podman stop kroki && podman rm kroki
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki

# If using the systemd service
systemctl --user stop container-kroki.service
podman rm kroki
podman pull docker.io/yuzutech/kroki
systemctl --user start container-kroki.service
```

## Troubleshooting
- Port already in use:
  - Pick a different host port: `-p 127.0.0.1:9000:8000` and use `http://localhost:9000` in the app.
- **Mermaid returns HTTP 503** (`Connection refused: …:8002`):
  - The Mermaid companion isn’t running or isn’t reachable. Both containers must be on the same
    network and the frontend needs `-e KROKI_MERMAID_HOST=kroki-mermaid`. Re-run the Quick start.
    The companion also needs ~10 s to launch headless Chromium before its first render.
- **D2 returns HTTP 400** (`Unsupported output format: png for d2. Must be one of svg.`):
  - Expected on Kroki `24.04` — D2 outputs **SVG only** in this image. Use the `.mmd` primary
    (PNG) for diagrams you need as images; `.d2` stays an SVG-only fallback.
- Can’t connect from the app:
  - Verify container is running: `podman ps --filter name=kroki`
  - Test rendering with curl (see Verify section)
  - Check logs: `podman logs kroki` or `journalctl --user -u container-kroki.service -f`
  - Firewall may block localhost; confirm that `localhost:PORT` is reachable.
- CORS issues:
  - Kroki typically returns permissive CORS headers. If your browser reports CORS errors, confirm you’re using `http://localhost:PORT` and not an IP or different origin policy. As a workaround, you can wrap Kroki behind a local reverse proxy that adds `Access-Control-Allow-Origin: *`.
- After changing the base URL in the app the preview still shows old errors:
  - The app now clears its internal availability cache when the base changes. Refresh the page once if needed.

## Security considerations
- Binding to `127.0.0.1` keeps Kroki local-only; avoid `-p 8000:8000` without the 127.0.0.1 prefix if you don’t want LAN access.
- Update the image periodically for security fixes.
- Stop the container when not in use if you prefer a smaller attack surface.

## Uninstall / cleanup
```bash
# If you used the systemd service
systemctl --user disable --now container-kroki.service
rm -f ~/.config/systemd/user/container-kroki.service
systemctl --user daemon-reload

# Remove the container and image
podman rm -f kroki || true
podman rmi docker.io/yuzutech/kroki || true
```

## References
- Kroki: https://kroki.io
- Podman docs: https://docs.podman.io/
