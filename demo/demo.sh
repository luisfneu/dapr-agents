#!/usr/bin/env bash
# Shortcuts for the live demo.
#   ./demo.sh run              start agent + sidecar (terminal 1)
#   ./demo.sh ask "question"   POST a task, prints the instance id
#   ./demo.sh ticket           POST the slow tool task (8s), prints the instance id
#   ./demo.sh wait <id>        poll until COMPLETED/FAILED and print the answer
#   ./demo.sh get <id>         raw workflow state (JSON)
#   ./demo.sh warm             load the model into memory before the talk
set -euo pipefail
cd "$(dirname "$0")"
export OLLAMA_ENDPOINT="${OLLAMA_ENDPOINT:-http://localhost:11434/v1}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:4b}"
URL=http://localhost:8001

post() {
  curl -s -X POST "$URL/agent/run" -H "Content-Type: application/json" -d "{\"task\": \"$1\"}" \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); print("instance_id:", d["instance_id"])'
}

case "${1:-}" in
  run)    [ -d .venv ] && source .venv/bin/activate
          dapr run --app-id support-agent --resources-path resources --log-level "${DAPR_LOG_LEVEL:-error}" -- python agent.py ;;
  ask)    post "${2:-Where is my order 1042?}" ;;
  ticket) post "Open a ticket for order 1042, the box arrived crushed" ;;
  get)    curl -s "$URL/agent/instances/${2:?instance id}" | python3 -m json.tool ;;
  wait)   id="${2:?instance id}"
          for _ in $(seq 1 120); do
            s=$(curl -s "$URL/agent/instances/$id" || true)
            if echo "$s" | grep -qE '"runtime_status": *"(COMPLETED|FAILED)"'; then
              echo "$s" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["runtime_status"]); print(json.loads(d["serialized_output"])["content"])'
              exit 0
            fi
            printf '.'; sleep 1
          done; echo "timeout" ;;
  warm)   ollama run "$OLLAMA_MODEL" "hi" >/dev/null && echo "model $OLLAMA_MODEL loaded" ;;
  *)      sed -n '2,8p' "$0" ;;
esac
