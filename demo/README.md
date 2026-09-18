# Demo: Dapr Agents in 5 minutes

A durable order-support agent. Shows: tools, LLM through the Conversation API,
memory in a state store, and durable execution (survives crash/restart).

Tested on this machine: dapr CLI 1.19.1, runtime 1.19.0, dapr-agents 1.1.0, Python 3.13, Ollama qwen3:4b.

## One-time setup (already done here)

```bash
brew install dapr/tap/dapr-cli ollama
dapr init                                  # Docker Desktop must be running
ollama pull qwen3:4b
python3.13 -m venv .venv && source .venv/bin/activate   # dapr-agents 1.1 needs Python 3.11-3.14
pip install -r requirements.txt
```

On this machine the Dapr Redis runs on **port 6380** (6379 is taken by `langfuse-redis-1`),
and `resources/*.yaml` already point there. If `docker ps` shows no `dapr_redis`:

```bash
docker run -d --name dapr_redis --restart unless-stopped -p 127.0.0.1:6380:6379 redis:6
```

## Before the talk (5 min)

```bash
open -a Docker                      # then wait for dapr_placement / dapr_scheduler / dapr_redis in `docker ps`
brew services start ollama
cd ~/gitWorkspace/dapr-agents/demo
./demo.sh warm                      # loads the model: first call is otherwise ~10s slower
./demo.sh run                       # terminal 1
./demo.sh ask && ./demo.sh wait <id>   # terminal 2, dry run
```

## Live demo script (~2 min)

Terminal 1: `./demo.sh run`

Terminal 2:
```bash
./demo.sh ask "Where is my order 1042?"   # prints instance_id
./demo.sh wait <id>                       # ~8s: LLM picks get_order, calls it, answers
```

Durability (the "wow" moment):
```bash
./demo.sh ticket                 # open_ticket tool sleeps 8s
# -> terminal 1: Ctrl+C as soon as you see "Function name: open_ticket" (agent dies mid-tool)
./demo.sh run                    # terminal 1 again
./demo.sh wait <same id>         # terminal 2: resumes at the tool step, ~14s, ticket opened
```

What happened: the first LLM call (choosing the tool) was checkpointed by Dapr Workflow and
is not repeated; only the interrupted tool activity re-runs, then the final LLM call.

Measured here: 2 LLM calls per question, 3–5s each on qwen3:4b. The agent's optional
end-of-run summary (`summarize_on_completion`) is disabled because it costs an extra ~50s call
on a local model.

## Pre-recorded video (for presenting from another machine)

`demo.mp4` (about 65s, 1750×1080) shows the whole live script: start, ask, ticket, Ctrl+C mid-tool,
restart, resume. `demo.gif` is the same recording. Re-record with `./record-demo.sh` (needs tmux,
asciinema, agg, ffmpeg: `brew install tmux asciinema agg ffmpeg`).

## Files

| File | What it shows |
|---|---|
| `agent.py` | `DurableAgent` + `AgentRunner.serve` (HTTP on 8001) |
| `tools.py` | `@tool`: a Python function becomes an LLM tool |
| `resources/llm-provider.yaml` | LLM provider (Ollama by default) configured outside the code |
| `resources-examples/llm-provider-openai.yaml` | Same agent, OpenAI instead: copy over resources/llm-provider.yaml, set `OPENAI_API_KEY` |
| `resources/agent-workflow.yaml` | State store for workflow checkpoints |
| `resources/agent-memory.yaml` | State store for conversation history |
| `demo.sh` | run / ask / ticket / wait / get / warm |
| `record-demo.sh` | records demo.cast / demo.gif / demo.mp4 in a scripted tmux session |

## Endpoints

- `POST /agent/run` body `{"task": "..."}` → `{"instance_id": "...", "status_url": "/agent/instances/..."}`
- `GET /agent/instances/{id}` → `runtime_status`, `serialized_output` (final answer), timestamps

## Fallback models (already pulled)

`qwen3:1.7b`, `llama3.2:3b`, `qwen2.5:3b`. Switch with `OLLAMA_MODEL=<name> ./demo.sh run`.
