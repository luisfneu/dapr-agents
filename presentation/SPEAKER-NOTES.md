# Speaker notes: Dapr Agents in 5 minutes

Timing per slide is in brackets. Total 5:00.

## 1. Cover: AI agents that survive production

[0:00 to 0:30] Quick intro. Hook: everyone has built an agent in a notebook that works; the problem starts in production, when the process dies in the middle of a 30-second call. Dapr Agents is a framework built to solve exactly that. Agenda: what it is, which problem it solves, use cases, demo.

## 2. What it is

[0:30 to 1:30] Dapr is the CNCF microservices runtime: a sidecar that gives you state, pub/sub, workflow, secrets. Dapr Agents is the agent layer on top of it. Core idea: the agent is plain Python; everything that is infrastructure (where state lives, which LLM, how it scales) is handled by the sidecar through YAML components. The same agent runs locally with Redis and Ollama, and in production with Postgres and OpenAI, with zero code changes.

## 3. What it’s for

[1:30 to 2:15] Stress the first row: it is what the demo shows. An agent makes 3 LLM calls and 2 tool calls; if the pod restarts on step four, without durability you pay for everything again and the user waits twice as long. Dapr Workflow records every step; on restart it replays the history and continues. The rest of the table is bonus: memory, LLM swap, queues, tracing.

## 4. How it works

[2:15 to 2:45] Move fast here. Three columns: your code, the sidecar, the backends. The agent never imports a Redis or OpenAI SDK; it talks to localhost:3500 and the sidecar resolves it. That is why the same agent.py runs locally and on Kubernetes.

## 5. Use cases

[2:45 to 3:15] Four patterns, one sentence each. Point at the first card: that is the demo. Common thread: whenever the agent has side effects (ticket, refund, email) and slow steps, you need to know exactly which step ran, and never repeat it after a crash.

## 6. Demo: the code

[3:15 to 4:00] Switch to the editor if you prefer; this slide is the fallback. Walk top-down: a tool is a decorated function. DurableAgent gets instructions, tools, the LLM client (by component name), and two stores. The runner exposes HTTP. Nothing here imports OpenAI or Redis.

## 7. Demo: live (play demo.mp4)

[4:00 to 4:40] Play demo/demo.mp4 (65 seconds) here; narrate over it with the three steps on this slide. Pause it at the Ctrl+C and again when the ticket comes back. If presenting live instead: local Ollama (qwen3:4b), about 8 seconds per question. Terminal 1: ./demo.sh run. Terminal 2: ./demo.sh ask, then ./demo.sh wait with the id. Then ./demo.sh ticket; in terminal 1 press Ctrl+C as soon as "Function name: open_ticket" appears; ./demo.sh run again; ./demo.sh wait with the same id: about 14 seconds later the ticket is opened, and the tool-picking LLM call was not repeated.

## 8. Takeaway

[4:40 to 5:00] One sentence close: you write the agent, Dapr keeps it alive. Three words: durable, portable, observable. Point to the repo and open for questions.

