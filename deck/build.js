const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "PowerScale Assistant";
pres.title = "PowerScale Assistant — Concept Proposal";

// ── Palette (topic-specific: deep navy + Dell blue, orange accent) ──
const NAVY   = "0B1F33";
const INK    = "0F1E2E";
const BLUE   = "0076CE"; // Dell brand
const BLUEDK = "00558F";
const ORANGE = "F97316"; // sharp accent, used sparingly
const SLATE  = "5B6B7B";
const SLATEL = "9AA8B5";
const LIGHT  = "F6F8FB";
const CARD   = "FFFFFF";
const BORDER = "E3E8EF";
const ICE    = "EAF3FB";
const HF = "Segoe UI";   // header
const BF = "Segoe UI";   // body
const W = 13.33, H = 7.5, M = 0.7;

const shadow = () => ({ type: "outer", color: "0B1F33", blur: 9, offset: 3, angle: 135, opacity: 0.16 });

function darkBg(s){ s.background = { color: NAVY }; }
function lightBg(s){ s.background = { color: LIGHT }; }

function eyebrow(s, text, x, y, color){
  s.addText(text.toUpperCase(), { x, y, w: 9, h: 0.3, margin: 0,
    fontFace: HF, fontSize: 12, bold: true, charSpacing: 3, color: color || BLUE });
}
function title(s, text, x, y, w, color, size){
  s.addText(text, { x, y, w, h: 1.4, margin: 0, fontFace: HF, fontSize: size || 32,
    bold: true, color: color || INK, lineSpacingMultiple: 1.0, valign: "top" });
}
function card(s, x, y, w, h, fill){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || CARD }, line: { color: BORDER, width: 1 }, shadow: shadow() });
}
function spark(s, x, y, size, color){
  s.addText("✦", { x, y, w: size, h: size, margin: 0, align: "center", valign: "middle",
    fontFace: HF, fontSize: 18, bold: true, color: color || BLUE });
}
function pageNum(s, n){
  s.addText(String(n).padStart(2,"0"), { x: W-1.0, y: H-0.55, w: 0.5, h: 0.3, margin: 0,
    align: "right", fontFace: BF, fontSize: 10, color: SLATEL });
}

// ════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ════════════════════════════════════════════════════════════════
let s = pres.addSlide(); darkBg(s);
// subtle accent block
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: BLUE } });
eyebrow(s, "Concept proposal · Dell PowerScale", M, 0.85, BLUE);
s.addText("PowerScale Assistant", { x: M, y: 2.05, w: 8.6, h: 1.4, margin: 0,
  fontFace: HF, fontSize: 56, bold: true, color: "FFFFFF" });
s.addText("An expert OneFS administrator, embedded in the console.", {
  x: M, y: 3.5, w: 7.8, h: 0.9, margin: 0, fontFace: HF, fontSize: 23, color: ICE });
s.addText([
  { text: "Runs 100% local", options: { bold: true, color: "FFFFFF" } },
  { text: "   ·   grounded in official OneFS 9.12 documentation   ·   nothing leaves the cluster", options: { color: SLATEL } }
], { x: M, y: 6.5, w: 11, h: 0.4, margin: 0, fontFace: BF, fontSize: 13 });

// right-side assistant mock motif
const px = 9.7, py = 1.55, pw = 2.95, ph = 4.4;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, rectRadius: 0.1,
  fill: { color: "FFFFFF" }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: 0.7, fill: { color: BLUE } });
s.addText("✦  Assistant", { x: px+0.15, y: py, w: pw-0.3, h: 0.7, margin: 0, valign: "middle",
  fontFace: HF, fontSize: 13, bold: true, color: "FFFFFF" });
// user bubble
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px+0.9, y: py+0.95, w: 1.9, h: 0.55, rectRadius: 0.08, fill: { color: BLUE } });
s.addText("How do I add a node?", { x: px+0.9, y: py+0.95, w: 1.9, h: 0.55, margin: 4, valign: "middle", align: "center", fontFace: BF, fontSize: 9, color: "FFFFFF" });
// bot bubble
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px+0.15, y: py+1.65, w: 2.4, h: 1.5, rectRadius: 0.08, fill: { color: "F1F5F9" }, line: { color: BORDER, width: 1 } });
s.addText([
  { text: "1. Cluster management →\n    Hardware configuration.\n", options: { breakLine: true } },
  { text: "2. Add node, then join.", options: {} }
], { x: px+0.3, y: py+1.75, w: 2.1, h: 1.3, margin: 0, fontFace: BF, fontSize: 8.5, color: INK });
// citation chips
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px+0.15, y: py+3.35, w: 1.25, h: 0.32, rectRadius: 0.05, fill: { color: ICE }, line: { color: "CDDDF0", width: 1 } });
s.addText("Web Admin Guide", { x: px+0.15, y: py+3.35, w: 1.25, h: 0.32, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 7, color: BLUEDK });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px+1.5, y: py+3.35, w: 1.05, h: 0.32, rectRadius: 0.05, fill: { color: ICE }, line: { color: "CDDDF0", width: 1 } });
s.addText("CLI Reference", { x: px+1.5, y: py+3.35, w: 1.05, h: 0.32, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 7, color: BLUEDK });

// ════════════════════════════════════════════════════════════════
// SLIDE 2 — Problem
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "The problem", M, 0.7, BLUE);
title(s, "OneFS is powerful — but expert-gated", M, 1.05, 11.5, INK, 34);
s.addText("The knowledge to run it exists. It just isn't where the admin is working — so routine questions become tab-switches and support cases.", {
  x: M, y: 2.0, w: 11.5, h: 0.7, margin: 0, fontFace: BF, fontSize: 15, color: SLATE });

const pains = [
  ["📚", "Deep, dense product", "11 official manuals, thousands of pages. Answers exist — buried."],
  ["🔀", "Out of the workflow", "Help means leaving the console for a PDF, a KB portal, or a ticket."],
  ["🎓", "Expert-gated", "Junior admins stall on senior knowledge; mistakes drive support load."],
];
let cx = M, cy = 3.1, cw = 3.78, ch = 3.0, gap = 0.30;
pains.forEach((p, i) => {
  const x = cx + i*(cw+gap);
  card(s, x, cy, cw, ch);
  s.addShape(pres.shapes.OVAL, { x: x+0.35, y: cy+0.4, w: 0.85, h: 0.85, fill: { color: ICE } });
  s.addText(p[0], { x: x+0.35, y: cy+0.4, w: 0.85, h: 0.85, margin: 0, align: "center", valign: "middle", fontSize: 22 });
  s.addText(p[1], { x: x+0.35, y: cy+1.45, w: cw-0.7, h: 0.55, margin: 0, fontFace: HF, fontSize: 17, bold: true, color: INK });
  s.addText(p[2], { x: x+0.35, y: cy+2.0, w: cw-0.7, h: 0.85, margin: 0, fontFace: BF, fontSize: 12.5, color: SLATE });
});
pageNum(s, 2);

// ════════════════════════════════════════════════════════════════
// SLIDE 3 — Why current tooling falls short
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Why today's help fails", M, 0.7, BLUE);
title(s, "Today's “help” is a PDF and a support case —\nneither is in the workflow", M, 1.05, 11.6, INK, 30);

// Friction flow
const steps = [
  ["Admin hits a question", "mid-task, in the WebUI"],
  ["Leaves the console", "PDF · KB portal · ticket"],
  ["Context is lost", "version drift, guesswork"],
  ["Slow resolution", "or a Dell support case"],
];
let fx = M, fy = 3.2, fw = 2.7, fh = 1.7, fgap = 0.45;
steps.forEach((st, i) => {
  const x = fx + i*(fw+fgap);
  card(s, x, fy, fw, fh, i===3 ? "FFF1E8" : CARD);
  s.addText(String(i+1), { x: x+0.22, y: fy+0.2, w: 0.5, h: 0.5, margin: 0, fontFace: HF, fontSize: 20, bold: true, color: i===3?ORANGE:BLUE });
  s.addText(st[0], { x: x+0.22, y: fy+0.7, w: fw-0.44, h: 0.5, margin: 0, fontFace: HF, fontSize: 14, bold: true, color: INK });
  s.addText(st[1], { x: x+0.22, y: fy+1.18, w: fw-0.44, h: 0.4, margin: 0, fontFace: BF, fontSize: 11, color: SLATE });
  if (i < 3) s.addText("→", { x: x+fw+0.05, y: fy, w: fgap-0.1, h: fh, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 22, bold: true, color: SLATEL });
});
s.addText("Every detour is time the admin doesn't have — and a chance to misconfigure the cluster.", {
  x: M, y: 5.5, w: 11.6, h: 0.5, margin: 0, fontFace: BF, fontSize: 14, italic: true, color: SLATE });
pageNum(s, 3);

// ════════════════════════════════════════════════════════════════
// SLIDE 4 — The concept (hero mock)
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "The concept", M, 0.7, BLUE);
title(s, "We embedded the docs as a cited\nexpert, right inside the WebUI", M, 1.05, 7.0, INK, 29);
s.addText([
  { text: "Ask in plain English without leaving the console. ", options: { breakLine: true, color: INK, bold: true } },
  { text: "Answers come only from official OneFS docs, with source citations — and if the docs don't cover it, it says so instead of guessing.", options: { color: SLATE } }
], { x: M, y: 2.55, w: 6.4, h: 1.6, margin: 0, fontFace: BF, fontSize: 15 });

// feature ticks
const ticks = ["Grounded in official documentation", "Cites its sources on every answer", "Says “I don't know” — no hallucination"];
ticks.forEach((t, i) => {
  const y = 4.3 + i*0.6;
  s.addText("✓", { x: M, y, w: 0.4, h: 0.45, margin: 0, fontFace: HF, fontSize: 16, bold: true, color: ORANGE });
  s.addText(t, { x: M+0.45, y, w: 6.0, h: 0.45, margin: 0, valign: "middle", fontFace: BF, fontSize: 13.5, color: INK });
});

// Hero WebUI mock (right)
const mx = 7.7, my = 1.35, mw = 4.95, mh = 5.55;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: mx, y: my, w: mw, h: mh, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: BORDER, width: 1 }, shadow: shadow() });
// top nav (Dell blue)
s.addShape(pres.shapes.RECTANGLE, { x: mx, y: my+0.5, w: mw, h: 0.5, fill: { color: BLUE } });
s.addText("OneFS Storage Administration", { x: mx+0.2, y: my+0.05, w: mw-0.4, h: 0.45, margin: 0, valign: "middle", fontFace: HF, fontSize: 10, bold: true, color: INK });
s.addText("Dashboard    Cluster mgmt    File System    Protocols", { x: mx+0.2, y: my+0.5, w: mw-0.4, h: 0.5, margin: 0, valign: "middle", fontFace: BF, fontSize: 8.5, color: "FFFFFF" });
// dashboard skeleton
s.addShape(pres.shapes.RECTANGLE, { x: mx+0.25, y: my+1.25, w: 2.3, h: 0.9, fill: { color: "F1F5F9" } });
s.addShape(pres.shapes.RECTANGLE, { x: mx+0.25, y: my+2.3, w: 2.3, h: 1.4, fill: { color: "F1F5F9" } });
s.addText("Cluster status", { x: mx+0.32, y: my+1.3, w: 2, h: 0.3, margin: 0, fontFace: BF, fontSize: 8, color: SLATE });
// assistant panel overlay (right of mock)
const ax = mx+2.75, ay = my+1.2, aw = 1.95, ah = 4.0;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: ay, w: aw, h: ah, rectRadius: 0.07, fill: { color: "F8FAFC" }, line: { color: "CBD5E1", width: 1 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: ax, y: ay, w: aw, h: 0.5, fill: { color: BLUE } });
s.addText("✦ Assistant", { x: ax+0.1, y: ay, w: aw-0.2, h: 0.5, margin: 0, valign: "middle", fontFace: HF, fontSize: 9, bold: true, color: "FFFFFF" });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax+0.55, y: ay+0.65, w: 1.3, h: 0.4, rectRadius: 0.06, fill: { color: BLUE } });
s.addText("Create an SMB share?", { x: ax+0.55, y: ay+0.65, w: 1.3, h: 0.4, margin: 2, align: "center", valign: "middle", fontFace: BF, fontSize: 6.5, color: "FFFFFF" });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax+0.1, y: ay+1.15, w: 1.75, h: 1.7, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { color: BORDER, width: 1 } });
s.addText("1. Protocols → Windows\n   Sharing (SMB).\n2. Create an SMB Share.\n3. Name the share and\n   set the /ifs path.", { x: ax+0.2, y: ay+1.25, w: 1.6, h: 1.55, margin: 0, fontFace: BF, fontSize: 6.5, color: INK });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax+0.1, y: ay+3.0, w: 1.0, h: 0.28, rectRadius: 0.04, fill: { color: ICE }, line: { color: "CDDDF0", width: 1 } });
s.addText("Web Admin Guide", { x: ax+0.1, y: ay+3.0, w: 1.0, h: 0.28, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 5.5, color: BLUEDK });
pageNum(s, 4);

// ════════════════════════════════════════════════════════════════
// SLIDE 5 — Prototype proof (dark)
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); darkBg(s);
eyebrow(s, "Proof — it already works", M, 0.7, "7FB8E6");
title(s, "It already works — fully local, nothing leaves the cluster", M, 1.05, 11.8, "FFFFFF", 30);

// architecture flow
const arch = [
  ["WebUI", "embedded panel"],
  ["RAG engine", "retrieve + ground"],
  ["Local knowledge", "ChromaDB · OneFS docs"],
  ["Local LLM", "Ollama · llama3.1:8b"],
];
let axx = M, ayy = 2.5, awd = 2.62, ahd = 1.5, ag = 0.35;
arch.forEach((a, i) => {
  const x = axx + i*(awd+ag);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: ayy, w: awd, h: ahd, rectRadius: 0.08, fill: { color: "14304A" }, line: { color: "23507A", width: 1 } });
  s.addText(a[0], { x: x+0.2, y: ayy+0.25, w: awd-0.4, h: 0.5, margin: 0, fontFace: HF, fontSize: 15, bold: true, color: "FFFFFF" });
  s.addText(a[1], { x: x+0.2, y: ayy+0.8, w: awd-0.4, h: 0.5, margin: 0, fontFace: BF, fontSize: 11, color: "9FC4E0" });
  if (i < 3) s.addText("→", { x: x+awd+0.02, y: ayy, w: ag, h: ahd, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 20, bold: true, color: BLUE });
});
s.addText("No internet. No cloud. No data egress — the property that makes it adoptable in air-gapped clusters.", {
  x: M, y: 4.25, w: 11.8, h: 0.5, margin: 0, fontFace: BF, fontSize: 14, italic: true, color: "9FC4E0" });

// proof stats
const stats = [["11", "official manuals indexed"], ["5,205", "passages searchable"], ["0.73–0.79", "retrieval relevance"], ["0", "answers that leave the box"]];
let sx = M, sy = 5.25, sw = 2.85, sh = 1.5, sgp = 0.18;
stats.forEach((st, i) => {
  const x = sx + i*(sw+sgp);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: sy, w: sw, h: sh, rectRadius: 0.07, fill: { color: "102A42" }, line: { color: "1D3F5C", width: 1 } });
  s.addText(st[0], { x: x+0.15, y: sy+0.2, w: sw-0.3, h: 0.7, margin: 0, fontFace: HF, fontSize: 30, bold: true, color: i===3?ORANGE:"FFFFFF" });
  s.addText(st[1], { x: x+0.15, y: sy+0.95, w: sw-0.3, h: 0.45, margin: 0, fontFace: BF, fontSize: 11, color: "9FC4E0" });
});
pageNum(s, 5);

// ════════════════════════════════════════════════════════════════
// SLIDE 6 — Woven in + actionable
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Not a chatbot in a tab", M, 0.7, BLUE);
title(s, "It's woven into the console, and its answers are actionable", M, 1.05, 11.8, INK, 30);

const feats = [
  ["📍", "Context-aware", "Knows which page you're on; tailors answers and suggestions to it."],
  ["🩺", "Explain this event", "Click an alert; get a plain-English cause and fix, cited from the docs."],
  ["🧭", "Click-to-navigate", "Answers link to the right WebUI screen and take you there."],
  ["⌨️", "Copyable CLI", "Commands render as ready-to-run, one-click-copy code blocks."],
];
let gx = M, gy = 2.5, gw = 5.75, gh = 1.95, ggx = 0.3, ggy = 0.3;
feats.forEach((f, i) => {
  const col = i % 2, row = Math.floor(i/2);
  const x = gx + col*(gw+ggx), y = gy + row*(gh+ggy);
  card(s, x, y, gw, gh);
  s.addShape(pres.shapes.OVAL, { x: x+0.3, y: y+0.55, w: 0.85, h: 0.85, fill: { color: ICE } });
  s.addText(f[0], { x: x+0.3, y: y+0.55, w: 0.85, h: 0.85, margin: 0, align: "center", valign: "middle", fontSize: 20 });
  s.addText(f[1], { x: x+1.4, y: y+0.45, w: gw-1.7, h: 0.5, margin: 0, fontFace: HF, fontSize: 17, bold: true, color: INK });
  s.addText(f[2], { x: x+1.4, y: y+0.95, w: gw-1.7, h: 0.85, margin: 0, fontFace: BF, fontSize: 12.5, color: SLATE });
});
pageNum(s, 6);

// ════════════════════════════════════════════════════════════════
// SLIDE 7 — Deployment / honest constraint
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "How it integrates — honestly", M, 0.7, BLUE);
title(s, "Run it as a sidecar, not on the storage nodes —\nthe air-gap stays intact", M, 1.05, 11.8, INK, 30);

const models = [
  ["On-cluster", "Low–Med", "Inside OneFS with the WebUI. Smallest footprint, but LLM inference competes with storage I/O on FreeBSD nodes with no GPU.", false, "C0392B"],
  ["Sidecar appliance", "High · recommended", "A small Linux VM/container beside the cluster. Keeps inference off storage nodes, stays on-prem and air-gap-friendly.", true, "1E8E4E"],
  ["CloudIQ / APEX AIOps", "High (connected)", "Dell-hosted SaaS. Best model quality and central updates — for customers who allow the connectivity Dell already ships.", false, "B7791F"],
];
let dx = M, dy = 3.15, dw = 3.78, dh = 3.4, dg = 0.30;
models.forEach((m, i) => {
  const x = dx + i*(dw+dg);
  const rec = m[3];
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: dy, w: dw, h: dh, rectRadius: 0.09,
    fill: { color: rec ? "EAF6EF" : CARD }, line: { color: rec ? "1E8E4E" : BORDER, width: rec ? 2 : 1 }, shadow: shadow() });
  s.addText(m[0], { x: x+0.3, y: dy+0.3, w: dw-0.6, h: 0.5, margin: 0, fontFace: HF, fontSize: 17, bold: true, color: INK });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x+0.3, y: dy+0.9, w: dw-0.6, h: 0.5, rectRadius: 0.06, fill: { color: rec ? "1E8E4E" : "EEF2F6" } });
  s.addText(m[1], { x: x+0.3, y: dy+0.9, w: dw-0.6, h: 0.5, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 12, bold: true, color: rec ? "FFFFFF" : SLATE });
  s.addText(m[2], { x: x+0.3, y: dy+1.55, w: dw-0.6, h: 1.7, margin: 0, fontFace: BF, fontSize: 12, color: SLATE });
});
pageNum(s, 7);

// ════════════════════════════════════════════════════════════════
// SLIDE 8 — Roadmap (phased)
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Phased roadmap", M, 0.7, BLUE);
title(s, "Read-only first, actions later — trust gates the roadmap, not capability", M, 1.05, 11.8, INK, 28);

const phases = [
  ["0", "Doc Q&A", "Embedded, cited answers. (Today's prototype.)"],
  ["1", "Live read-only", "Grounds in this cluster's real state via the Platform API."],
  ["2", "Guided actions", "Write actions behind RBAC, confirmation, and audit."],
  ["3", "Cross-product", "Fleet-wide via CloudIQ / APEX AIOps."],
  ["4", "Proactive", "Detects, recommends, and predicts."],
];
// timeline line
s.addShape(pres.shapes.LINE, { x: M+0.3, y: 3.4, w: 11.4, h: 0, line: { color: "CBD5E1", width: 2 } });
let tx = M, tw2 = 2.35, tg = 0.13;
phases.forEach((p, i) => {
  const x = tx + i*(tw2+tg);
  const now = i===0;
  s.addShape(pres.shapes.OVAL, { x: x+tw2/2-0.28, y: 3.12, w: 0.56, h: 0.56, fill: { color: now?ORANGE:BLUE } });
  s.addText(p[0], { x: x+tw2/2-0.28, y: 3.12, w: 0.56, h: 0.56, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: "FFFFFF" });
  card(s, x, 4.0, tw2, 2.4);
  if (now) s.addText("NOW", { x: x+0.2, y: 4.15, w: tw2-0.4, h: 0.3, margin: 0, fontFace: HF, fontSize: 10, bold: true, charSpacing: 2, color: ORANGE });
  s.addText(p[1], { x: x+0.2, y: now?4.45:4.2, w: tw2-0.4, h: 0.55, margin: 0, fontFace: HF, fontSize: 14, bold: true, color: INK });
  s.addText(p[2], { x: x+0.2, y: now?5.0:4.75, w: tw2-0.4, h: 1.3, margin: 0, fontFace: BF, fontSize: 11, color: SLATE });
});
pageNum(s, 8);

// ════════════════════════════════════════════════════════════════
// SLIDE 9 — Portfolio expansion (hub & spoke)
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Beyond PowerScale", M, 0.7, BLUE);
title(s, "One engine, the whole Dell portfolio — with CloudIQ as the hub", M, 1.05, 11.8, INK, 30);
s.addText("Same pattern everywhere: docs + an embeddable panel + a read-only API connector. Build the engine once; add a corpus and a connector per product.", {
  x: M, y: 2.0, w: 7.2, h: 1.1, margin: 0, fontFace: BF, fontSize: 14, color: SLATE });

// hub
const hubx = 9.55, huby = 4.0, hr = 1.5;
s.addShape(pres.shapes.OVAL, { x: hubx-hr, y: huby-hr, w: hr*2, h: hr*2, fill: { color: BLUE }, shadow: shadow() });
s.addText([{ text: "Assistant engine\n", options: { bold: true, fontSize: 14, breakLine: true } }, { text: "CloudIQ / APEX AIOps", options: { fontSize: 10 } }],
  { x: hubx-hr, y: huby-hr, w: hr*2, h: hr*2, margin: 0, align: "center", valign: "middle", fontFace: HF, color: "FFFFFF" });

// spokes (left column list)
const prods = [
  ["PowerStore · PowerMax · Unity", "Storage REST APIs"],
  ["PowerEdge · iDRAC", "Redfish standard — one connector, many"],
  ["PowerProtect · Data Domain", "Backup admin, simplified"],
  ["VxRail", "Embed in VxRail Manager"],
];
let lx = M, ly = 3.2, lw = 6.6, lh = 0.82, lgap = 0.18;
prods.forEach((p, i) => {
  const y = ly + i*(lh+lgap);
  card(s, lx, y, lw, lh);
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y, w: 0.1, h: lh, fill: { color: BLUE } });
  s.addText(p[0], { x: lx+0.3, y: y+0.1, w: lw-0.6, h: 0.4, margin: 0, fontFace: HF, fontSize: 14, bold: true, color: INK });
  s.addText(p[1], { x: lx+0.3, y: y+0.45, w: lw-0.6, h: 0.32, margin: 0, fontFace: BF, fontSize: 11, color: SLATE });
  // connector line to hub
  s.addShape(pres.shapes.LINE, { x: lx+lw, y: y+lh/2, w: (hubx-hr)-(lx+lw), h: (huby)-(y+lh/2), line: { color: "CBD5E1", width: 1.5 } });
});
pageNum(s, 9);

// ════════════════════════════════════════════════════════════════
// SLIDE 10 — The bet / ask (dark close)
// ════════════════════════════════════════════════════════════════
s = pres.addSlide(); darkBg(s);
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: ORANGE } });
eyebrow(s, "The bet", M, 0.85, ORANGE);
title(s, "Fewer tickets. Faster admins. A stickier platform.", M, 1.3, 11.6, "FFFFFF", 34);

const bets = [
  ["Deflect support cases", "Admins self-serve from the docs instead of opening Dell cases."],
  ["Lower the expertise barrier", "Junior admins get senior-level guidance — expanding who can run OneFS."],
  ["A product feedback flywheel", "Anonymized questions reveal doc gaps and unmet needs Dell can't see today."],
];
let bx = M, by = 3.1, bw = 3.78, bh = 2.0, bg = 0.30;
bets.forEach((b, i) => {
  const x = bx + i*(bw+bg);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: by, w: bw, h: bh, rectRadius: 0.08, fill: { color: "14304A" }, line: { color: "23507A", width: 1 } });
  s.addText(b[0], { x: x+0.28, y: by+0.28, w: bw-0.56, h: 0.7, margin: 0, fontFace: HF, fontSize: 15, bold: true, color: "FFFFFF" });
  s.addText(b[1], { x: x+0.28, y: by+1.0, w: bw-0.56, h: 0.9, margin: 0, fontFace: BF, fontSize: 12, color: "9FC4E0" });
});
// the ask
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.55, w: 12.0, h: 1.15, rectRadius: 0.08, fill: { color: ORANGE } });
s.addText([
  { text: "The ask:  ", options: { bold: true, color: "FFFFFF" } },
  { text: "green-light a Phase 0–1 pilot on a sidecar with two design-partner clusters.", options: { color: "FFFFFF" } }
], { x: M+0.4, y: 5.55, w: 11.2, h: 1.15, margin: 0, valign: "middle", fontFace: HF, fontSize: 18 });

pres.writeFile({ fileName: "PowerScale-Assistant-Pitch.pptx" }).then(f => console.log("WROTE", f));
