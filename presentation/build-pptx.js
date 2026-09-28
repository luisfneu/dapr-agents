// Builds presentation/dapr-agents-in-5-minutes.pptx (same content as the web deck)
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2];

const THEME = {
  name: "Dapr Agents",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "16202E", lt1: "F5F6F2", dk2: "0E1726", lt2: "FFFFFF",
    accent1: "1D5FD1", accent2: "5CA0FF", accent3: "6A7179", accent4: "4A5568",
    accent5: "B8C4D6", accent6: "DDE1E6", hlink: "1D5FD1", folHlink: "5CA0FF",
  },
};
const K = THEME.colors;
const MONO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Dapr Agents in 5 minutes";
pres.author = "Dapr Agents demo";

const W = 13.33, M = 0.6, CW = W - 2 * M; // content width 12.13

// ---------- layouts ----------
function footerBits(bg, fg) {
  return {
    background: { color: bg },
    slideNumber: { x: W - M - 0.5, y: 6.85, w: 0.5, h: 0.35, fontSize: 11, color: fg, align: "right" },
  };
}
pres.defineSlideMaster({
  title: "LIGHT", ...footerBits(K.lt1, K.accent3),
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.45, w: 8, h: 0.35, fontSize: 11, bold: true, color: K.accent1, charSpacing: 2, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.8, w: CW, h: 1.25, fontSize: 30, bold: true, color: K.dk1, valign: "top", align: "left", margin: 0 } } },
    { placeholder: { options: { name: "footer", type: "body", x: M, y: 6.85, w: 10.5, h: 0.35, fontSize: 11, color: K.accent3, margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "DARK", ...footerBits(K.dk2, K.accent5),
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.45, w: 8, h: 0.35, fontSize: 11, bold: true, color: K.accent2, charSpacing: 2, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.8, w: CW, h: 1.25, fontSize: 30, bold: true, color: K.lt1, valign: "top", align: "left", margin: 0 } } },
    { placeholder: { options: { name: "footer", type: "body", x: M, y: 6.85, w: 10.5, h: 0.35, fontSize: 11, color: K.accent5, margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "COVER", background: { color: K.dk2 },
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.6, w: 8, h: 0.4, fontSize: 12, bold: true, color: K.accent2, charSpacing: 3, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.2, w: 11, h: 2.0, fontSize: 54, bold: true, color: K.lt1, valign: "top", align: "left", margin: 0 } } },
    { placeholder: { options: { name: "subtitle", type: "body", x: M, y: 4.3, w: 10, h: 0.9, fontSize: 22, color: K.accent5, valign: "top", margin: 0 } } },
    { placeholder: { options: { name: "meta", type: "body", x: M, y: 6.5, w: 11, h: 0.4, fontSize: 13, color: K.accent5, margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "ACCENT", background: { color: K.accent1 },
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.6, w: 8, h: 0.4, fontSize: 12, bold: true, color: K.lt1, charSpacing: 3, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 1.5, w: 11.5, h: 1.8, fontSize: 44, bold: true, color: K.lt1, valign: "top", align: "left", margin: 0 } } },
    { placeholder: { options: { name: "meta", type: "body", x: M, y: 6.5, w: 12, h: 0.4, fontSize: 13, color: K.lt1, margin: 0 } } },
  ],
});

// ---------- helpers ----------
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: opts.fill || K.lt2 },
    line: opts.line === null ? { color: opts.fill || K.lt2, width: 0 } : { color: opts.line || K.accent6, width: 1 },
    objectName: opts.name || "card",
  });
}
function numberBadge(slide, x, y, n, bg = K.accent1, fg = K.lt1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: bg }, line: { color: bg, width: 0 }, objectName: "badge " + n });
  slide.addText(String(n), { x, y, w: 0.5, h: 0.5, fontSize: 13, bold: true, color: fg, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "badge label " + n });
}
function text(slide, str, o) { slide.addText(str, { isTextBox: true, margin: 0, ...o }); }
function codeLines(lines) {
  // lines: array of arrays of {t, c} runs; returns pptxgenjs text runs
  const out = [];
  lines.forEach((ln, i) => {
    ln.forEach((r) => out.push({ text: r.t, options: { color: r.c || "E6EAF0", fontFace: MONO } }));
    if (i < lines.length - 1) out[out.length - 1].options.breakLine = true;
  });
  return out;
}
const KW = "5CA0FF", STR = "9CCB7A", NUM = "F2B35B", CMT = "8A98AD";

// ================= 1. Cover =================
pres.addSection({ title: "Intro" });
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Intro" });
  s.addText("DAPR AGENTS", { placeholder: "eyebrow" });
  s.addText("AI agents that survive production", { placeholder: "title" });
  s.addText("What it is, what it’s for, and a 2-minute demo with code.", { placeholder: "subtitle" });
  s.addText("[Your name]   ·   [Event / team]   ·   October 2026", { placeholder: "meta" });
  s.addNotes("[0:00 to 0:30] Quick intro. Hook: everyone has built an agent in a notebook that works; the problem starts in production, when the process dies in the middle of a 30-second call. Dapr Agents is a framework built to solve exactly that. Agenda: what it is, which problem it solves, use cases, demo.");
}

// ================= 2. What it is =================
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Intro" });
  s.addText("WHAT IT IS", { placeholder: "eyebrow" });
  s.addText("A Python framework for AI agents built on top of Dapr", { placeholder: "title" });
  const cards = [
    ["Agent = code", "LLM + instructions + tools + memory, in one class. You write Python functions; the model decides when to call them."],
    ["Infra = Dapr", "State, workflow, pub/sub, secrets and the LLM itself are sidecar building blocks. Swapping a provider is YAML, not code."],
    ["CNCF project", "Open source, maintained by the Dapr project. Same foundation that has run microservices in production for years."],
  ];
  const cw = (CW - 0.6) / 3, y = 2.35, h = 3.3;
  cards.forEach(([t, b], i) => {
    const x = M + i * (cw + 0.3);
    card(s, x, y, cw, h, { name: "card " + t });
    numberBadge(s, x + 0.35, y + 0.35, i + 1);
    text(s, t, { x: x + 0.35, y: y + 1.1, w: cw - 0.7, h: 0.5, fontSize: 20, bold: true, color: K.dk1, objectName: "card title " + t });
    text(s, b, { x: x + 0.35, y: y + 1.7, w: cw - 0.7, h: 1.8, fontSize: 15, color: K.accent4, valign: "top", objectName: "card body " + t });
  });
  s.addText("github.com/dapr/dapr-agents   ·   pip install dapr-agents", { placeholder: "footer" });
  s.addNotes("[0:30 to 1:30] Dapr is the CNCF microservices runtime: a sidecar that gives you state, pub/sub, workflow, secrets. Dapr Agents is the agent layer on top of it. Core idea: the agent is plain Python; everything that is infrastructure (where state lives, which LLM, how it scales) is handled by the sidecar through YAML components. The same agent runs locally with Redis and Ollama, and in production with Postgres and OpenAI, with zero code changes.");
}

// ================= 3. What it's for =================
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Intro" });
  s.addText("WHAT IT’S FOR", { placeholder: "eyebrow" });
  s.addText("An agent in a notebook works. An agent in production breaks.", { placeholder: "title" });
  const hdr = { bold: true, color: K.lt1, fill: { color: K.dk2 }, fontSize: 14 };
  const L = (t) => ({ text: t, options: { color: K.accent4 } });
  const R = (b, t) => ({ text: [{ text: b, options: { bold: true, color: K.dk1 } }, { text: t, options: { color: K.accent4 } }] });
  const rows = [
    [{ text: "Without Dapr Agents", options: hdr }, { text: "With Dapr Agents", options: { ...hdr } }],
    [L("Process dies mid-way through a 30s tool call: everything is lost, start over"), R("Durable execution", ": every step is a workflow checkpoint; resumes where it stopped")],
    [L("Conversation history lives in RAM"), R("Memory in a state store", ": survives restarts and scales horizontally")],
    [L("Each LLM vendor SDK hardcoded in the app"), R("Conversation API", ": OpenAI, Anthropic, Ollama, Bedrock via YAML")],
    [L("Agents call each other over raw HTTP, no retries"), R("Pub/sub + resiliency", ": queues, retries and timeouts from Dapr")],
    [L("Zero visibility into what the agent did"), R("Tracing and metrics", " per step, for free, via OpenTelemetry")],
  ];
  s.addTable(rows, {
    x: M, y: 2.35, w: CW, colW: [4.6, CW - 4.6], fontSize: 14, fontFace: "Calibri",
    border: { type: "solid", color: K.accent6, pt: 1 }, fill: { color: K.lt2 }, margin: [0.1, 0.15, 0.1, 0.15], rowH: 0.62, valign: "middle",
    objectName: "comparison table",
  });
  s.addText("The pain is not the LLM. It’s everything around it.", { placeholder: "footer" });
  s.addNotes("[1:30 to 2:15] Stress the first row: it is what the demo shows. An agent makes 3 LLM calls and 2 tool calls; if the pod restarts on step four, without durability you pay for everything again and the user waits twice as long. Dapr Workflow records every step; on restart it replays the history and continues. The rest of the table is bonus: memory, LLM swap, queues, tracing.");
}

// ================= 4. How it works =================
pres.addSection({ title: "How it works" });
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "How it works" });
  s.addText("HOW IT WORKS", { placeholder: "eyebrow" });
  s.addText("Your app talks to the sidecar. The sidecar talks to the world.", { placeholder: "title" });
  const y0 = 2.5, bh = 3.6;
  // left: your process
  card(s, M, y0, 3.5, bh, { line: K.accent1, name: "your process" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: y0, w: 3.5, h: bh, rectRadius: 0.12, fill: { color: K.lt2, transparency: 100 }, line: { color: K.accent1, width: 2.5 }, objectName: "your process border" });
  text(s, "YOUR PROCESS", { x: M + 0.3, y: y0 + 0.3, w: 3, h: 0.3, fontSize: 11, bold: true, color: K.accent1, charSpacing: 2, objectName: "lbl your process" });
  text(s, "DurableAgent", { x: M + 0.3, y: y0 + 0.7, w: 3, h: 0.5, fontSize: 20, bold: true, color: K.dk1, objectName: "h your process" });
  text(s, "instructions\ntools (@tool)\nDaprChatClient\nmemory + state", { x: M + 0.3, y: y0 + 1.3, w: 3, h: 2, fontSize: 15, color: K.accent4, valign: "top", lineSpacingMultiple: 1.2, objectName: "body your process" });
  // middle: sidecar
  const mx = 5.0;
  card(s, mx, y0, 3.5, bh, { fill: K.dk2, line: null, name: "sidecar" });
  text(s, "DAPR SIDECAR", { x: mx + 0.3, y: y0 + 0.3, w: 3, h: 0.3, fontSize: 11, bold: true, color: K.accent2, charSpacing: 2, objectName: "lbl sidecar" });
  text(s, "Building blocks", { x: mx + 0.3, y: y0 + 0.7, w: 3, h: 0.5, fontSize: 20, bold: true, color: K.lt1, objectName: "h sidecar" });
  text(s, "Workflow (durability)\nState (memory)\nConversation (LLM)\nPub/sub, Secrets, Tracing", { x: mx + 0.3, y: y0 + 1.3, w: 3.1, h: 2, fontSize: 15, color: K.accent5, valign: "top", lineSpacingMultiple: 1.2, objectName: "body sidecar" });
  // right: backends
  const rx = 9.6, rw = W - M - rx, rh = 1.0;
  [["LLM", "OpenAI, Anthropic, Ollama, Bedrock…"], ["State store", "Redis, Postgres, Cosmos, DynamoDB…"], ["Message bus", "Kafka, RabbitMQ, Redis, Service Bus…"]].forEach(([t, b], i) => {
    const y = y0 + i * 1.3;
    card(s, rx, y, rw, rh, { name: "backend " + t });
    text(s, t, { x: rx + 0.25, y: y + 0.15, w: rw - 0.4, h: 0.35, fontSize: 16, bold: true, color: K.dk1, objectName: "h " + t });
    text(s, b, { x: rx + 0.25, y: y + 0.52, w: rw - 0.4, h: 0.35, fontSize: 12, color: K.accent4, objectName: "body " + t });
  });
  // connectors
  const cy = y0 + bh / 2;
  s.addShape(pres.shapes.LINE, { x: M + 3.5, y: cy, w: mx - (M + 3.5), h: 0, line: { color: K.accent1, width: 2.5, beginArrowType: "triangle", endArrowType: "triangle" }, objectName: "arrow app sidecar" });
  text(s, "HTTP / gRPC", { x: M + 3.5, y: cy - 0.5, w: mx - (M + 3.5), h: 0.3, fontSize: 11, bold: true, color: K.accent1, align: "center", objectName: "lbl http grpc" });
  [0, 1, 2].forEach((i) => {
    const ty = y0 + i * 1.3 + rh / 2, x1 = mx + 3.5, x2 = rx;
    const top = Math.min(cy, ty), hgt = Math.abs(ty - cy);
    s.addShape(pres.shapes.LINE, { x: x1, y: top, w: x2 - x1, h: hgt, flipV: ty < cy, line: { color: K.accent3, width: 1.75, endArrowType: "triangle" }, objectName: "arrow sidecar backend " + i });
  });
  s.addText("Every box on the right is a YAML component. Swapping one = editing the YAML.", { placeholder: "footer" });
  s.addNotes("[2:15 to 2:45] Move fast here. Three columns: your code, the sidecar, the backends. The agent never imports a Redis or OpenAI SDK; it talks to localhost:3500 and the sidecar resolves it. That is why the same agent.py runs locally and on Kubernetes.");
}

// ================= 5. Use cases =================
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "How it works" });
  s.addText("USE CASES", { placeholder: "eyebrow" });
  s.addText("Where a durable agent pays for itself", { placeholder: "title" });
  const items = [
    ["Customer support with real actions", "Looks up the order, opens a ticket, issues a refund. Each action hits a slow external system; none may run twice. (Today’s demo.)"],
    ["Long-running back-office workflows", "Claims, onboarding, invoice approval: minutes to days, with a human in the loop. Workflow waits for the event without burning a pod."],
    ["Multi-agent pipelines", "Triage agent routes to expert agents over pub/sub. Each one scales, retries and is traced on its own."],
    ["Event-driven automation", "An agent subscribed to a Kafka topic: new alert, new PR, new lead. Reacts, calls tools, publishes the result."],
  ];
  const cw = (CW - 0.3) / 2, ch = 1.95;
  items.forEach(([t, b], i) => {
    const x = M + (i % 2) * (cw + 0.3), y = 2.35 + Math.floor(i / 2) * (ch + 0.3);
    card(s, x, y, cw, ch, { name: "usecase " + (i + 1) });
    numberBadge(s, x + 0.3, y + 0.3, i + 1);
    text(s, t, { x: x + 1.0, y: y + 0.3, w: cw - 1.3, h: 0.5, fontSize: 18, bold: true, color: K.dk1, valign: "middle", objectName: "uc title " + (i + 1) });
    text(s, b, { x: x + 1.0, y: y + 0.85, w: cw - 1.3, h: 1.0, fontSize: 14, color: K.accent4, valign: "top", objectName: "uc body " + (i + 1) });
  });
  s.addText("Common thread: slow steps, side effects, and a process that can die in between.", { placeholder: "footer" });
  s.addNotes("[2:45 to 3:15] Four patterns, one sentence each. Point at the first card: that is the demo. Common thread: whenever the agent has side effects (ticket, refund, email) and slow steps, you need to know exactly which step ran, and never repeat it after a crash.");
}

// ================= 6. Demo: the code =================
pres.addSection({ title: "Demo" });
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Demo" });
  s.addText("DEMO · THE CODE", { placeholder: "eyebrow" });
  s.addText("One tool, one agent, one runner", { placeholder: "title" });
  const bx = M, by = 2.1, bw = 7.9, bh = 4.55;
  card(s, bx, by, bw, bh, { fill: K.dk2, line: null, name: "code box" });
  const code = [
    [{ t: "@tool", c: CMT }],
    [{ t: "async def ", c: KW }, { t: "get_order(order_id: str) -> str:" }],
    [{ t: "    " }, { t: '"""Look up status and ETA of an order."""', c: STR }],
    [{ t: "    " }, { t: "return ", c: KW }, { t: "ORDERS.get(order_id, " }, { t: '"not found"', c: STR }, { t: ")" }],
    [{ t: " " }],
    [{ t: "agent = DurableAgent(" }],
    [{ t: "    name=" }, { t: '"SupportAgent"', c: STR }, { t: "," }],
    [{ t: "    role=" }, { t: '"Order support assistant"', c: STR }, { t: "," }],
    [{ t: "    instructions=[" }, { t: '"Use tools, never invent data."', c: STR }, { t: "]," }],
    [{ t: "    tools=[get_order, open_ticket]," }],
    [{ t: "    llm=DaprChatClient(component_name=" }, { t: '"llm-provider"', c: STR }, { t: ")," }],
    [{ t: "    memory=AgentMemoryConfig(store=ConversationDaprStateMemory(" }],
    [{ t: "        store_name=" }, { t: '"agent-memory"', c: STR }, { t: "))," }],
    [{ t: "    state=AgentStateConfig(store=StateStoreService(" }],
    [{ t: "        store_name=" }, { t: '"agent-workflow"', c: STR }, { t: "))," }],
    [{ t: ")" }],
    [{ t: "AgentRunner().serve(agent, port=" }, { t: "8001", c: NUM }, { t: ")" }],
  ];
  s.addText(codeLines(code), { x: bx + 0.3, y: by + 0.25, w: bw - 0.5, h: bh - 0.5, fontSize: 11.5, fontFace: MONO, color: "E6EAF0", valign: "top", lineSpacingMultiple: 1.15, isTextBox: true, margin: 0, objectName: "code" });
  const notes = [
    ["@tool", "Docstring + type hints become the schema the LLM sees."],
    ["llm-provider", "A Dapr component name. Which model? That’s in the YAML."],
    ["memory / state", "Two state stores: chat history, and workflow checkpoints."],
    ["serve", "POST /agent/run returns an instance id; GET /agent/instances/{id} returns the result."],
  ];
  const nx = bx + bw + 0.3, nw = W - M - nx, nh = 1.03;
  notes.forEach(([t, b], i) => {
    const y = by + i * (nh + 0.14);
    card(s, nx, y, nw, nh, { name: "note " + t });
    text(s, t, { x: nx + 0.22, y: y + 0.12, w: nw - 0.4, h: 0.3, fontSize: 14, bold: true, color: K.accent1, fontFace: MONO, objectName: "note title " + t });
    text(s, b, { x: nx + 0.22, y: y + 0.42, w: nw - 0.4, h: 0.58, fontSize: 12, color: K.accent4, valign: "top", objectName: "note body " + t });
  });
  s.addText("Full code: demo/agent.py and demo/tools.py (about 60 lines total)", { placeholder: "footer" });
  s.addNotes("[3:15 to 4:00] Switch to the editor if you prefer; this slide is the fallback. Walk top-down: a tool is a decorated function. DurableAgent gets instructions, tools, the LLM client (by component name), and two stores. The runner exposes HTTP. Nothing here imports OpenAI or Redis.");
}

// ================= 7. Demo: live =================
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Demo" });
  s.addText("DEMO · LIVE", { placeholder: "eyebrow" });
  s.addText("Run it, ask it, kill it, watch it finish anyway", { placeholder: "title" });
  const steps = [
    ["1 · RUN", [["dapr run --app-id support-agent"], ["  --resources-path resources"], ["  -- python agent.py"]], "Sidecar starts, loads the YAML components, app listens on 8001.", false],
    ["2 · ASK", [["POST /agent/run"], ['{"task": "Where is my'], ['  order 1042?"}']], "Returns an instance id. LLM picks get_order, calls it, answers. GET /agent/instances/{id} shows every step.", false],
    ["3 · KILL IT", [['"Open a ticket for 1042"'], ["^C   # during the 8s tool"], ["dapr run ...   # restart"]], "Same instance id: resumes at the tool step. The LLM call that picked the tool is not repeated.", true],
  ];
  const cw = (CW - 0.6) / 3, y = 2.35, h = 3.6;
  steps.forEach(([lbl, code, desc, hot], i) => {
    const x = M + i * (cw + 0.3);
    card(s, x, y, cw, h, { fill: hot ? K.accent1 : "16233A", line: hot ? null : "2A3A55", name: "step " + (i + 1) });
    text(s, lbl, { x: x + 0.3, y: y + 0.3, w: cw - 0.6, h: 0.3, fontSize: 11, bold: true, color: hot ? K.lt1 : K.accent2, charSpacing: 2, objectName: "step label " + (i + 1) });
    card(s, x + 0.3, y + 0.75, cw - 0.6, 1.35, { fill: "0A1220", line: null, name: "step code box " + (i + 1) });
    s.addText(codeLines(code.map((l) => [{ t: l[0] }])), { x: x + 0.45, y: y + 0.85, w: cw - 0.9, h: 1.15, fontSize: 11, fontFace: MONO, color: "E6EAF0", valign: "top", lineSpacingMultiple: 1.2, isTextBox: true, margin: 0, objectName: "step code " + (i + 1) });
    text(s, desc, { x: x + 0.3, y: y + 2.3, w: cw - 0.6, h: 1.7, fontSize: 14, color: hot ? K.lt1 : K.accent5, valign: "top", objectName: "step desc " + (i + 1) });
  });
  s.addText("Pre-recorded: demo/demo.mp4 (65s)   ·   live: ./demo.sh run · ask · ticket · wait", { placeholder: "footer" });
  s.addNotes("[4:00 to 4:40] Play demo/demo.mp4 (65 seconds) here; narrate over it with the three steps on this slide. Pause it at the Ctrl+C and again when the ticket comes back. If presenting live instead: local Ollama (qwen3:4b), about 8 seconds per question. Terminal 1: ./demo.sh run. Terminal 2: ./demo.sh ask, then ./demo.sh wait with the id. Then ./demo.sh ticket; in terminal 1 press Ctrl+C as soon as \"Function name: open_ticket\" appears; ./demo.sh run again; ./demo.sh wait with the same id: about 14 seconds later the ticket is opened, and the tool-picking LLM call was not repeated.");
}

// ================= 8. Takeaway =================
{
  const s = pres.addSlide({ masterName: "ACCENT", sectionTitle: "Demo" });
  s.addText("TAKEAWAY", { placeholder: "eyebrow" });
  s.addText("Write the agent. Let Dapr keep it alive.", { placeholder: "title" });
  const cols = [["Durable", "Every LLM and tool step is a checkpoint."], ["Portable", "LLM, state, queue: swap the YAML, keep the code."], ["Observable", "Tracing per step, out of the box."]];
  const cw = (CW - 0.8) / 3;
  cols.forEach(([t, b], i) => {
    const x = M + i * (cw + 0.4);
    text(s, t, { x, y: 3.9, w: cw, h: 0.5, fontSize: 22, bold: true, color: K.lt1, objectName: "col title " + t });
    text(s, b, { x, y: 4.45, w: cw, h: 0.9, fontSize: 15, color: "DCE6FA", valign: "top", objectName: "col body " + t });
  });
  s.addText("github.com/dapr/dapr-agents   ·   pip install dapr-agents   ·   [your contact]", { placeholder: "meta" });
  s.addNotes("[4:40 to 5:00] One sentence close: you write the agent, Dapr keeps it alive. Three words: durable, portable, observable. Point to the repo and open for questions.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
