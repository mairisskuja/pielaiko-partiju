#!/usr/bin/env bash
# Renderē assets/og-image.png (1200×630) un assets/apple-touch-icon.png (180×180) ar Chrome headless.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome nav atrasts: $CHROME (norādi CHROME=/ceļš)"; exit 1; }
render() { # $1 avots.html  $2 mērķis.png  $3 WxH
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$3" --virtual-time-budget=6000 --screenshot="$PWD/$2" "file://$PWD/$1" 2>/dev/null
  echo "→ $2 ($3)"
}
render scripts/og-image.html pielaiko-partiju/assets/og-image.png 1200,630
render scripts/apple-touch-icon.html pielaiko-partiju/assets/apple-touch-icon.png 180,180
