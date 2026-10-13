#!/usr/bin/env bash
# Trusted service configuration only; no browser-selected device or command.
set -euo pipefail
bundle=/opt/selkies-8dcdbe239dc8/squashfs-root/usr/conda/bin
: "${MOS_GPU_RENDER_NODE:?Set the admitted render node}"
vendor="${MOS_GPU_VENDOR:-nvidia}"
export HOME=/home/matt DISPLAY=:93 XDG_RUNTIME_DIR=/run/mos-desktop-stream
export XAUTHORITY="$XDG_RUNTIME_DIR/Xauthority"
export XKB_CONFIG_ROOT=/usr/share/X11/xkb
export PATH="$bundle:/usr/bin:/bin"
case "$vendor" in
  nvidia)
    : "${MOS_GPU_LIBRARIES:?Set the admitted NVIDIA library directory}"
    export LD_LIBRARY_PATH="$MOS_GPU_LIBRARIES:${bundle%/bin}/lib"
    export __EGL_VENDOR_LIBRARY_FILENAMES="$MOS_GPU_LIBRARIES/egl-vendor.json"
    export __EGL_EXTERNAL_PLATFORM_CONFIG_DIRS="$MOS_GPU_LIBRARIES/egl-platform.d"
    export GBM_BACKENDS_PATH="$MOS_GPU_LIBRARIES/gbm" GBM_BACKEND=nvidia-drm
    ;;
  amd)
    export LD_LIBRARY_PATH="${bundle%/bin}/lib" LIBVA_DRIVER_NAME=radeonsi
    ;;
  *) echo 'Unsupported configured GPU vendor' >&2; exit 1 ;;
esac
native_libraries="${MOS_GPU_LIBRARIES:-}"
[[ $(id -u) == 1001 && -c "$MOS_GPU_RENDER_NODE" && -x /usr/bin/Xwayland ]]
cd "$HOME"
cookie="$(openssl rand -hex 16)"
touch "$XAUTHORITY"; chmod 600 "$XAUTHORITY"
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
"$bundle/selkies" --addr=127.0.0.1 --port=18031 --enable-basic-auth=true \
  --enable-https=false --wayland=true --render-dri="$MOS_GPU_RENDER_NODE" \
  --encode-dri="$MOS_GPU_RENDER_NODE" --auto-gpu="$vendor" \
  --use-cpu=false --encoder=h264enc --framerate=60 --mode=websockets \
  '--enable-dual-mode=false|locked' '--audio-enabled=false|locked' \
  '--microphone-enabled=false|locked' '--webcam-enabled=false|locked' \
  '--gamepad-enabled=false|locked' --enable-clipboard=false \
  '--enable-binary-clipboard=false|locked' '--command-enabled=false|locked' \
  --file-transfers=none '--printing-enabled=false|locked' \
  '--enable-sharing=false|locked' '--enable-collab=false|locked' \
  '--enable-shared=true|locked' --enable-resize=false \
  --manual-resolution=true --manual-width=1280 --manual-height=720 &
children+=("$!")
for attempt in {1..100}; do
  [[ -S "$XDG_RUNTIME_DIR/wayland-1" ]] && break
  kill -0 "${children[0]}"
  sleep .1
done
[[ -S "$XDG_RUNTIME_DIR/wayland-1" ]]
export WAYLAND_DISPLAY=wayland-1
env LD_LIBRARY_PATH="$native_libraries" /usr/bin/Xwayland "$DISPLAY" \
  -shm -geometry 1280x720 -nolisten tcp -auth "$XAUTHORITY" -noreset &
children+=("$!")
for attempt in {1..100}; do
  if /usr/bin/xdpyinfo >/dev/null 2>&1; then break; fi
  sleep .1
done
/usr/bin/xdpyinfo >/dev/null
env LD_LIBRARY_PATH="$native_libraries" /usr/bin/openbox &
children+=("$!")
env LD_LIBRARY_PATH="$native_libraries" /usr/bin/xedit -geometry 1000x600+20+20 &
children+=("$!")
wait -n "${children[@]}"
