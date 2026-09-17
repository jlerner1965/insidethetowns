#!/usr/bin/env bash
# Screenshots a built site (dist/) at phone / tablet / desktop widths for design review.
#
#   TOWN=niwot npm run build && scripts/screenshot.sh /path/out [ / /events/ /eat-drink/ ... ]
#
# Uses the Chromium "headless shell" that Playwright installs, because the
# regular Chromium binary's new headless mode enforces a minimum window width
# and silently lays out a 375px capture at ~450px. No npm dependency.
set -euo pipefail
OUT="${1:-screenshots}"; shift || true
PAGES=("${@:-/}")
DIST="${DIST:-dist}"
PORT="${PORT:-4399}"
SHELL_BIN="${CHROME_HEADLESS_SHELL:-$(ls -d "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1 || true)}"
[ -x "$SHELL_BIN" ] || { echo "headless_shell not found; set CHROME_HEADLESS_SHELL"; exit 1; }
[ -d "$DIST" ] || { echo "$DIST/ missing; run the build first"; exit 1; }
mkdir -p "$OUT"
# Wait for a previous run's server to let go of the port, then start ours.
for i in $(seq 1 40); do curl -sf "http://127.0.0.1:$PORT/" >/dev/null || break; sleep 0.25; done
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIST" >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
up=0
for i in $(seq 1 40); do curl -sf "http://127.0.0.1:$PORT/" >/dev/null && { up=1; break; }; sleep 0.25; done
[ "$up" = 1 ] && kill -0 "$PID" 2>/dev/null || { echo "static server did not start on :$PORT"; exit 1; }
for page in "${PAGES[@]}"; do
  name=$(echo "$page" | sed 's#^/##; s#/$##; s#/#-#g'); name=${name:-home}
  for w in 375 768 1280; do
    "$SHELL_BIN" --no-sandbox --disable-gpu --hide-scrollbars --proxy-server="direct://" --proxy-bypass-list="*" \
      --window-size="$w,2400" --screenshot="$OUT/$name-$w.png" "http://127.0.0.1:$PORT$page" >/dev/null 2>&1
  done
  echo "shot $page"
done
