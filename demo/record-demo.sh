#!/usr/bin/env bash
# Records the demo as a terminal video (no GUI needed): demo.cast -> demo.gif -> demo.mp4
# Layout: tmux with two panes, left = agent, right = client. Keys are "typed" by this script.
set -euo pipefail
cd "$(dirname "$0")"
OUT=${1:-demo}
S=demo-rec; R=demo-asc
COLS=160; ROWS=42; LEFT=92
L="$S:0.0"; RP="$S:0.1"

tmux kill-session -t $S 2>/dev/null || true
tmux kill-session -t $R 2>/dev/null || true
rm -f "$OUT.cast" "$OUT.gif" "$OUT.mp4"

# Inner session (the one that gets recorded)
tmux new-session -d -s $S -x $COLS -y $ROWS -n demo "bash --norc --noprofile"
tmux set -t $S status off
tmux set -t $S pane-border-status top
tmux set -t $S pane-border-format " #{pane_title} "
tmux set -t $S pane-border-style fg=colour240
tmux set -t $S pane-active-border-style fg=colour240
tmux split-window -h -t $S "bash --norc --noprofile"
tmux resize-pane -t $L -x $LEFT
for p in $L $RP; do
  tmux send-keys -t $p -l "export PS1='\[\e[1;34m\]\$ \[\e[0m\]' TERM=xterm-256color; cd '$PWD'; clear"
  tmux send-keys -t $p Enter
done
tmux select-pane -t $L -T "Terminal 1 · agent"
tmux select-pane -t $RP -T "Terminal 2 · client"
tmux select-pane -t $RP
sleep 1

# Outer session: asciinema records an attach to the inner session
tmux new-session -d -s $R -x $COLS -y $ROWS \
  "TMUX= asciinema rec --overwrite --window-size ${COLS}x${ROWS} -c 'tmux attach -t $S' '$PWD/$OUT.cast'"
sleep 2

typein() { local p=$1 t=$2 c; tmux select-pane -t "$p"
  for ((i=0;i<${#t};i++)); do c=${t:i:1}; tmux send-keys -t "$p" -l "$c"; sleep 0.045; done
  sleep 0.5; tmux send-keys -t "$p" Enter; }
wait_pane() { local p=$1 re=$2 n=${3:-90}
  for ((i=0;i<n;i++)); do tmux capture-pane -p -t "$p" | grep -qE "$re" && return 0; sleep 0.5; done
  echo "timeout waiting for /$re/" >&2; return 1; }
wait_agent() { for i in $(seq 1 90); do curl -s -o /dev/null localhost:8001/docs && return 0; sleep 1; done; return 1; }
wait_done() { for i in $(seq 1 120); do curl -s "localhost:8001/agent/instances/$1" | grep -qE '"runtime_status": *"(COMPLETED|FAILED)"' && return 0; sleep 1; done; return 1; }
id_count() { tmux capture-pane -p -t $RP | grep -c "instance_id:" || true; }
new_id() { # wait until one more "instance_id:" line than $1 is on screen, print the newest
  for i in $(seq 1 60); do [ "$(id_count)" -gt "$1" ] && break; sleep 0.5; done
  tmux capture-pane -p -t $RP | grep "instance_id:" | tail -1 | awk '{print $2}'; }

# ---- the demo ----
sleep 2
typein $L "./demo.sh run"
wait_agent; wait_pane $L "up and running"; sleep 3

N=$(id_count); typein $RP './demo.sh ask "Where is my order 1042?"'
ID=$(new_id "$N"); sleep 1.5
typein $RP "./demo.sh wait $ID"
wait_done "$ID"; sleep 5

N=$(id_count); typein $RP "./demo.sh ticket"
ID=$(new_id "$N"); sleep 1
wait_pane $L "open_ticket" 60; sleep 1.5
tmux select-pane -t $L; tmux send-keys -t $L C-c          # kill the agent mid-tool
wait_pane $L "Exited App" 30; sleep 3
typein $L "clear"; sleep 1

typein $L "./demo.sh run"
wait_agent; wait_pane $L "up and running"; sleep 2
typein $RP "./demo.sh wait $ID"
wait_done "$ID"; sleep 7

# ---- end (freeze on the result; shut everything down off camera) ----
tmux kill-session -t $S
pkill -f "app-id support-agent" 2>/dev/null || true
pkill -f "agent.py" 2>/dev/null || true
for i in $(seq 1 30); do tmux has-session -t $R 2>/dev/null || break; sleep 1; done
tmux kill-session -t $R 2>/dev/null || true

echo "cast: $OUT.cast ($(wc -c < "$OUT.cast") bytes)"
agg --font-size 18 --theme monokai --fps-cap 20 --last-frame-duration 3 "$OUT.cast" "$OUT.gif"
ffmpeg -y -loglevel error -i "$OUT.gif" -movflags faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "$OUT.mp4"
ls -la "$OUT".cast "$OUT".gif "$OUT".mp4
ffprobe -v error -show_entries format=duration:stream=width,height -of default=nw=1 "$OUT.mp4"
