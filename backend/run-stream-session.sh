#!/usr/bin/env bash
# One fixed personal application session; never a caller-supplied command.
set -euo pipefail
bundle=/opt/selkies-8dcdbe239dc8/squashfs-root/usr/conda/bin
export HOME=/home/matt DISPLAY=:92 XDG_RUNTIME_DIR=/run/mos-desktop-stream
export XAUTHORITY="$XDG_RUNTIME_DIR/Xauthority"
export PATH="$bundle:/usr/bin:/bin"
cd "$HOME"
[[ $(id -u) == 1001 && -d "$XDG_RUNTIME_DIR" && -x "$bundle/selkies" ]]
[[ ! -S /tmp/.X11-unix/X92 ]]
cookie="$(openssl rand -hex 16)"
touch "$XAUTHORITY"
chmod 600 "$XAUTHORITY"
xauth add "$DISPLAY" . "$cookie"
unset cookie
children=()
cleanup(){
  trap - EXIT TERM INT
  for child in "${children[@]}"; do kill "$child" 2>/dev/null || true; done
  for child in "${children[@]}"; do wait "$child" 2>/dev/null || true; done
}
trap cleanup EXIT
trap 'exit 0' TERM INT
/usr/bin/Xvfb "$DISPLAY" -screen 0 1280x720x24 -nolisten tcp -auth "$XAUTHORITY" -noreset &
children+=("$!")
for attempt in {1..50}; do
  if /usr/bin/xdpyinfo >/dev/null 2>&1; then break; fi
  sleep .1
done
/usr/bin/xdpyinfo >/dev/null
/usr/bin/openbox &
children+=("$!")
/usr/bin/xedit -geometry 1000x600+20+20 &
children+=("$!")
"$bundle/selkies" --addr=127.0.0.1 --port=18031 --enable-basic-auth=true \
  --enable-https=false --use-cpu=true --encoder=jpeg --framerate=60 \
  --mode=websockets '--enable-dual-mode=false|locked' \
  '--audio-enabled=false|locked' '--microphone-enabled=false|locked' \
  '--webcam-enabled=false|locked' '--gamepad-enabled=false|locked' \
  --enable-clipboard=false '--enable-binary-clipboard=false|locked' \
  '--command-enabled=false|locked' --file-transfers=none '--printing-enabled=false|locked' \
  '--enable-sharing=false|locked' '--enable-collab=false|locked' \
  '--enable-shared=true|locked' --enable-resize=true &
children+=("$!")
wait "${children[-1]}"
