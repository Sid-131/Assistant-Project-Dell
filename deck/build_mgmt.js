// Management concept-proposal deck for the PowerScale Admin Assistant.
// Answers the exec review (problem, prototypes, trust, on-cluster compute,
// data residency, payoff, org fit, phased path) — cost intentionally omitted.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "PowerScale";
pres.title = "PowerScale Admin Assistant — Management Proposal";

// ── Palette (deep navy + Dell blue; teal = trust/positive, orange = sharp accent) ──
const NAVY="0B1F33", INK="0F1E2E", BLUE="0076CE", BLUEDK="00558F",
      ORANGE="EA6A1E", TEAL="0E9E6E", SLATE="5B6B7B", SLATEL="9AA8B5",
      LIGHT="F5F8FB", CARD="FFFFFF", BORDER="E1E7EF", ICE="EAF3FB", ICEB="CFE0F2",
      MOCK="8A97A5", MOCKBG="EEF1F4";
const HF="Segoe UI", BF="Segoe UI", MONO="Consolas";
const W=13.33, H=7.5, M=0.7;

const shadow = () => ({ type:"outer", color:"0B1F33", blur:9, offset:3, angle:135, opacity:0.15 });
const darkBg = s => { s.background = { color: NAVY }; };
const lightBg = s => { s.background = { color: LIGHT }; };

function eyebrow(s, t, color){ s.addText(t.toUpperCase(), { x:M, y:0.62, w:11.9, h:0.3, margin:0,
  fontFace:HF, fontSize:12, bold:true, charSpacing:2.5, color: color||BLUE }); }
function title(s, t, color, size, w){ s.addText(t, { x:M, y:1.0, w:w||11.9, h:1.2, margin:0,
  fontFace:HF, fontSize:size||29, bold:true, color: color||INK, lineSpacingMultiple:1.02, valign:"top" }); }
function card(s, x, y, w, h, fill, line){ s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h,
  rectRadius:0.09, fill:{ color: fill||CARD }, line:{ color: line||BORDER, width:1 }, shadow: shadow() }); }
function dot(s, x, y, color){ s.addShape(pres.shapes.OVAL, { x, y, w:0.13, h:0.13, fill:{ color: color||BLUE }, line:{ type:"none" } }); }
function numCircle(s, x, y, n, fill){ s.addShape(pres.shapes.OVAL, { x, y, w:0.44, h:0.44, fill:{ color: fill||BLUE }, line:{ type:"none" } });
  s.addText(String(n), { x, y, w:0.44, h:0.44, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:15, bold:true, color:"FFFFFF" }); }
function pageNum(s, n){ s.addText(String(n).padStart(2,"0"), { x:W-0.95, y:H-0.5, w:0.5, h:0.3, margin:0,
  align:"right", fontFace:BF, fontSize:10, color:SLATEL });
  s.addText("PowerScale Admin Assistant", { x:M, y:H-0.5, w:6, h:0.3, margin:0, fontFace:BF, fontSize:9.5, color:SLATEL }); }

// icon-row: dot/number + bold head + body, in a column of width w
function featRow(s, x, y, w, n, head, body, accent){
  numCircle(s, x, y-0.02, n, accent||BLUE);
  s.addText(head, { x:x+0.62, y:y-0.05, w:w-0.62, h:0.32, margin:0, fontFace:HF, fontSize:14.5, bold:true, color:INK });
  s.addText(body, { x:x+0.62, y:y+0.28, w:w-0.62, h:0.6, margin:0, fontFace:BF, fontSize:12, color:SLATE, lineSpacingMultiple:1.02 });
}

// faux assistant chat panel artifact
function chatPanel(s, x, y, w, h, header, userMsg, botRich, chips){
  card(s, x, y, w, h, CARD);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h:0.5, rectRadius:0.09, fill:{ color: BLUE }, line:{ type:"none" } });
  s.addShape(pres.shapes.RECTANGLE, { x, y:y+0.25, w, h:0.25, fill:{ color: BLUE }, line:{ type:"none" } });
  s.addText(header, { x:x+0.18, y, w:w-0.36, h:0.5, margin:0, valign:"middle", fontFace:HF, fontSize:11.5, bold:true, color:"FFFFFF" });
  // user bubble (right)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+w-2.2, y:y+0.68, w:2.0, h:0.5, rectRadius:0.08, fill:{ color: BLUE }, line:{ type:"none" } });
  s.addText(userMsg, { x:x+w-2.2, y:y+0.68, w:2.0, h:0.5, margin:5, valign:"middle", align:"center", fontFace:BF, fontSize:9, color:"FFFFFF" });
  // bot bubble (left)
  const bh = h-2.15;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+0.2, y:y+1.32, w:w-1.1, h:bh, rectRadius:0.08, fill:{ color:"F2F6FA" }, line:{ color: BORDER, width:1 } });
  s.addText(botRich, { x:x+0.38, y:y+1.45, w:w-1.45, h:bh-0.25, margin:0, fontFace:BF, fontSize:10.5, color:INK, lineSpacingMultiple:1.05, valign:"top" });
  // citation chips
  let cx = x+0.2;
  chips.forEach(c => { const cw = 0.28 + c.length*0.072;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:cx, y:y+h-0.5, w:cw, h:0.3, rectRadius:0.05, fill:{ color: ICE }, line:{ color: ICEB, width:1 } });
    s.addText(c, { x:cx, y:y+h-0.5, w:cw, h:0.3, margin:0, align:"center", valign:"middle", fontFace:BF, fontSize:7.5, color:BLUEDK });
    cx += cw+0.12; });
}

// ═══════════════════════ SLIDE 1 — Cover ═══════════════════════
let s = pres.addSlide(); darkBg(s);
s.addText("PRODUCT PROPOSAL  ·  DELL POWERSCALE  ·  MANAGEMENT REVIEW", { x:M, y:0.9, w:9, h:0.3, margin:0,
  fontFace:HF, fontSize:12.5, bold:true, charSpacing:2.5, color: BLUE });
s.addText("An expert in the console,\nat 2 a.m.", { x:M, y:2.0, w:8.2, h:2.0, margin:0,
  fontFace:HF, fontSize:50, bold:true, color:"FFFFFF", lineSpacingMultiple:1.0 });
s.addText("A documentation-grounded admin assistant embedded in the OneFS WebUI and InsightIQ — running entirely on the customer's cluster.",
  { x:M, y:4.55, w:7.9, h:1.1, margin:0, fontFace:HF, fontSize:19, color:ICE, lineSpacingMultiple:1.06 });
s.addText([{ text:"Prototype built & demonstrated", options:{ bold:true, color:"FFFFFF" } },
  { text:"    ·    100% local    ·    grounded in official OneFS documentation    ·    nothing leaves the cluster", options:{ color:SLATEL } }],
  { x:M, y:6.55, w:11.9, h:0.4, margin:0, fontFace:BF, fontSize:12.5 });
// right assistant artifact
chatPanel(s, 9.55, 1.55, 3.05, 4.55, "✦  AI Assistant",
  "How do I add a node?",
  [{ text:"Cluster management > Hardware\nconfiguration > Add node.\n\n", options:{ breakLine:true } },
   { text:"isi devices node add", options:{ fontFace:MONO, color:BLUEDK, bold:true } }],
  ["Web Admin Guide","CLI Reference"]);

// ═══════════════════════ SLIDE 2 — Problem ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "The problem", ORANGE);
title(s, "1 in 5 support cases is an admin asking a question the docs already answer.");
s.addText("~20%", { x:M, y:2.5, w:4.6, h:1.5, margin:0, fontFace:HF, fontSize:96, bold:true, color:ORANGE });
s.addText("of support contacts are “how do I…” administration questions — not product defects.",
  { x:M, y:4.15, w:5.2, h:1.0, margin:0, fontFace:BF, fontSize:15, color:INK, lineSpacingMultiple:1.05 });
card(s, M, 5.55, 5.2, 1.15, ICE, ICEB);
s.addText([{ text:"Honest caveat.  ", options:{ bold:true, color:BLUEDK } },
  { text:"This is a working internal estimate. Step one before build is validating it against our support-ticket taxonomy.", options:{ color:SLATE } }],
  { x:M+0.2, y:5.55, w:4.8, h:1.15, margin:0, valign:"middle", fontFace:BF, fontSize:12, lineSpacingMultiple:1.03 });
// 5-squares visual (1 highlighted)
const bx=7.0, by=2.9;
for(let i=0;i<5;i++){ const on=i===0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:bx+(i%3)*1.7, y:by+Math.floor(i/3)*1.55, w:1.45, h:1.3, rectRadius:0.1,
    fill:{ color: on?ORANGE:CARD }, line:{ color: on?ORANGE:BORDER, width:1.5 }, shadow: shadow() });
  s.addText("👤", { x:bx+(i%3)*1.7, y:by+Math.floor(i/3)*1.55, w:1.45, h:1.3, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:30, color: on?"FFFFFF":SLATEL }); }
s.addText("1 in 5 = an admin question", { x:bx, y:by+3.0, w:5.1, h:0.4, margin:0, fontFace:HF, fontSize:14, bold:true, color:INK });
pageNum(s, 2);

// ═══════════════════════ SLIDE 3 — Pain ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Who feels it");
title(s, "Today that admin waits hours — or reads a 900-page PDF.");
s.addText("The storage admin, mid-change, at 2 a.m. Something is unclear and the maintenance clock is running.",
  { x:M, y:2.15, w:11.9, h:0.6, margin:0, fontFace:BF, fontSize:15, color:SLATE });
const c3w=5.75, c3y=3.0, c3h=2.7;
card(s, M, c3y, c3w, c3h);
s.addText("Option A — open a case", { x:M+0.3, y:c3y+0.28, w:c3w-0.6, h:0.4, margin:0, fontFace:HF, fontSize:17, bold:true, color:INK });
s.addText("Answer comes back in hours, sometimes days. The change stalls, or the admin guesses.",
  { x:M+0.3, y:c3y+0.85, w:c3w-0.6, h:1.0, margin:0, fontFace:BF, fontSize:13.5, color:SLATE, lineSpacingMultiple:1.08 });
s.addText("→  Slow, and a cost Dell pays to answer.", { x:M+0.3, y:c3y+2.05, w:c3w-0.6, h:0.4, margin:0, fontFace:HF, fontSize:12.5, bold:true, color:ORANGE });
card(s, M+c3w+0.4, c3y, c3w, c3h);
s.addText("Option B — search the manuals", { x:M+c3w+0.7, y:c3y+0.28, w:c3w-0.6, h:0.4, margin:0, fontFace:HF, fontSize:17, bold:true, color:INK });
s.addText("Dozens of guides, hundreds of pages each. The answer exists — finding it is the needle in the haystack.",
  { x:M+c3w+0.7, y:c3y+0.85, w:c3w-0.6, h:1.0, margin:0, fontFace:BF, fontSize:13.5, color:SLATE, lineSpacingMultiple:1.08 });
s.addText("→  The answer already exists. It's just buried.", { x:M+c3w+0.7, y:c3y+2.05, w:c3w-0.6, h:0.4, margin:0, fontFace:HF, fontSize:12.5, bold:true, color:ORANGE });
s.addText("Either path: downtime risk, frustration, and a support case for something already documented.",
  { x:M, y:6.15, w:11.9, h:0.5, margin:0, fontFace:HF, fontSize:14, bold:true, color:INK });
pageNum(s, 3);

// ═══════════════════════ SLIDE 4 — Concept ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "The concept");
title(s, "Put the expert where the admin already works.");
const q4=[["OneFS WebUI","Day-to-day administration","Answers OneFS admin & configuration questions right inside the management console the admin already has open."],
          ["InsightIQ","Monitoring & performance","Answers cluster, performance and alert questions where admins watch the fleet — and explains what an alert means."]];
q4.forEach((c,i)=>{ const x=M+i*6.15;
  card(s, x, 2.5, 5.75, 3.1);
  s.addShape(pres.shapes.OVAL, { x:x+0.35, y:2.85, w:0.7, h:0.7, fill:{ color: i?TEAL:BLUE }, line:{ type:"none" } });
  s.addText(i? "◧":"▦", { x:x+0.35, y:2.85, w:0.7, h:0.7, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:20, color:"FFFFFF" });
  s.addText(c[0], { x:x+1.25, y:2.85, w:4.3, h:0.4, margin:0, fontFace:HF, fontSize:20, bold:true, color:INK });
  s.addText(c[1], { x:x+1.25, y:3.28, w:4.3, h:0.35, margin:0, fontFace:HF, fontSize:12.5, bold:true, color: i?TEAL:BLUE });
  s.addText(c[2], { x:x+0.35, y:3.95, w:5.05, h:1.4, margin:0, fontFace:BF, fontSize:13.5, color:SLATE, lineSpacingMultiple:1.1 }); });
s.addText("One engine.  Two surfaces.  Same grounded, cited answers.", { x:M, y:6.15, w:11.9, h:0.5, margin:0,
  align:"center", fontFace:HF, fontSize:15, bold:true, color:INK });
pageNum(s, 4);

// ═══════════════════════ SLIDE 5 — Prototype 1 (WebUI) ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Prototype 1  ·  OneFS WebUI");
title(s, "Answers with cited sources and copy-ready commands.");
chatPanel(s, M, 2.2, 4.3, 4.5, "✦  AI Assistant",
  "Create an SMB share?",
  [{ text:"1. Protocols > Windows Sharing (SMB).\n2. Create an SMB Share; set name + path.\n\n", options:{ breakLine:true } },
   { text:"isi smb shares create", options:{ fontFace:MONO, color:BLUEDK, bold:true } }],
  ["Web Admin Guide","CLI Reference"]);
const f5=[["Grounded Q&A with citations","Every answer points back to the official OneFS guide it came from."],
          ["Copy-ready CLI","isi commands render as one-click copy blocks — no re-typing."],
          ["Click-to-navigate","Answers link straight to the right WebUI page."],
          ["Explain-this-event","Dashboard alerts get a plain-English explanation on click."],
          ["Context-aware","Knows which page the admin is on and tailors suggestions."]];
let y5=2.35; f5.forEach((f,i)=>{ featRow(s, 5.5, y5, 7.1, i+1, f[0], f[1]); y5+=0.9; });
pageNum(s, 5);

// ═══════════════════════ SLIDE 6 — Prototype 2 (InsightIQ) ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Prototype 2  ·  InsightIQ", TEAL);
title(s, "Adds performance answers and “explain this alert.”");
const f6=[["Everything the WebUI assistant does","Same grounded engine, same citations — on the InsightIQ console."],
          ["Performance answers","“Which node is busiest?”, throughput, latency — read from the reports."],
          ["Explain this alert","Plain-English cause and fix, grounded in the OneFS Event Reference."],
          ["Widest scope","Spans OneFS admin + cluster & performance knowledge in one place."]];
let y6=2.45; f6.forEach((f,i)=>{ featRow(s, M, y6, 7.0, i+1, f[0], f[1], TEAL); y6+=1.0; });
// alert-explain artifact
const ax=8.15, ay=2.2, aw=4.45;
card(s, ax, ay, aw, 4.5, CARD);
s.addText("View Alerts", { x:ax+0.25, y:ay+0.2, w:aw-0.5, h:0.35, margin:0, fontFace:HF, fontSize:13, bold:true, color:INK });
card(s, ax+0.25, ay+0.7, aw-0.5, 1.05, "FBF0EC", "F1C9B8");
s.addText("● Warning", { x:ax+0.45, y:ay+0.82, w:2.0, h:0.3, margin:0, fontFace:HF, fontSize:11, bold:true, color:ORANGE });
s.addText("Protocol latency above threshold on node 4", { x:ax+0.45, y:ay+1.12, w:aw-0.9, h:0.55, margin:0, fontFace:BF, fontSize:11, color:INK, lineSpacingMultiple:1.03 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:ax+aw-1.55, y:ay+0.78, w:1.25, h:0.34, rectRadius:0.05, fill:{ color: TEAL }, line:{ type:"none" } });
s.addText("✦ Explain", { x:ax+aw-1.55, y:ay+0.78, w:1.25, h:0.34, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:9.5, bold:true, color:"FFFFFF" });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:ax+0.25, y:ay+1.95, w:aw-0.5, h:2.3, rectRadius:0.08, fill:{ color:"F2F6FA" }, line:{ color:BORDER, width:1 } });
s.addText([{ text:"What it means  ", options:{ bold:true, color:TEAL, breakLine:true } },
  { text:"High protocol latency usually points to a node under load or a slow client workload.\n\n", options:{ color:INK, breakLine:true } },
  { text:"What to check  ", options:{ bold:true, color:TEAL, breakLine:true } },
  { text:"Per-node CPU and connection counts on node 4; rebalance heavy clients.", options:{ color:INK } }],
  { x:ax+0.45, y:ay+2.1, w:aw-0.9, h:2.05, margin:0, fontFace:BF, fontSize:10.5, lineSpacingMultiple:1.06, valign:"top" });
pageNum(s, 6);

// ═══════════════════════ SLIDE 7 — Real vs Mocked ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "What the prototype proves");
title(s, "The hard part is real: grounded answers from Dell's own documentation.");
const realItems=["The answer engine — grounded retrieval + generation","The full OneFS documentation set as the knowledge base","Source citations on every answer","Both embedded assistants (WebUI + InsightIQ)","100% local execution — no cloud"];
const mockItems=["The console UI — faithful visual replicas","The dashboard's sample cluster numbers","The InsightIQ report figures"];
card(s, M, 2.35, 5.75, 3.7, "EFF9F4", "BFE6D5");
s.addText("REAL  —  and it's the product", { x:M+0.3, y:2.6, w:5.2, h:0.4, margin:0, fontFace:HF, fontSize:15, bold:true, color:TEAL });
realItems.forEach((t,i)=>{ const yy=3.15+i*0.56; s.addText("✓", { x:M+0.3, y:yy, w:0.35, h:0.35, margin:0, fontFace:HF, fontSize:14, bold:true, color:TEAL });
  s.addText(t, { x:M+0.7, y:yy-0.02, w:4.85, h:0.5, margin:0, fontFace:BF, fontSize:12.5, color:INK, lineSpacingMultiple:1.0 }); });
card(s, M+6.15, 2.35, 5.75, 3.7, MOCKBG, "D6DBE1");
s.addText("MOCKED  —  and only cosmetic", { x:M+6.45, y:2.6, w:5.2, h:0.4, margin:0, fontFace:HF, fontSize:15, bold:true, color:MOCK });
mockItems.forEach((t,i)=>{ const yy=3.15+i*0.56; s.addText("○", { x:M+6.45, y:yy, w:0.35, h:0.35, margin:0, fontFace:HF, fontSize:13, bold:true, color:MOCK });
  s.addText(t, { x:M+6.85, y:yy-0.02, w:4.85, h:0.5, margin:0, fontFace:BF, fontSize:12.5, color:SLATE, lineSpacingMultiple:1.0 }); });
s.addText("What's mocked is cosmetic. What's real is the engine — and the engine is the product.",
  { x:M, y:6.3, w:11.9, h:0.5, margin:0, align:"center", fontFace:HF, fontSize:14.5, bold:true, color:INK });
pageNum(s, 7);

// ═══════════════════════ SLIDE 8 — How it works ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "How it works");
title(s, "Grounded retrieval — it answers only from Dell's docs, so a small model is enough.");
const steps=[["Admin asks","a question in the console"],["Retrieve","top passages from this version's official docs"],
  ["Summarize","a small on-cluster model, using only those passages"],["Cited answer","returned in the console, with sources"]];
const sw=2.78, sy=2.55, gap=0.24;
steps.forEach((st,i)=>{ const x=M+i*(sw+gap); card(s, x, sy, sw, 1.85);
  numCircle(s, x+0.28, sy+0.28, i+1);
  s.addText(st[0], { x:x+0.85, y:sy+0.3, w:sw-1.0, h:0.4, margin:0, fontFace:HF, fontSize:15, bold:true, color:INK });
  s.addText(st[1], { x:x+0.28, y:sy+0.9, w:sw-0.56, h:0.85, margin:0, fontFace:BF, fontSize:12, color:SLATE, lineSpacingMultiple:1.05 });
  if(i<3) s.addText("→", { x:x+sw-0.02, y:sy+0.55, w:0.28, h:0.5, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:20, bold:true, color:BLUE }); });
card(s, M, 4.85, 5.75, 1.05, ICE, ICEB);
s.addText([{ text:"Only from the docs  →  ", options:{ bold:true, color:BLUEDK } },{ text:"hallucination stays low.", options:{ color:INK } }],
  { x:M+0.3, y:4.85, w:5.2, h:1.05, margin:0, valign:"middle", fontFace:BF, fontSize:13 });
card(s, M+6.15, 4.85, 5.75, 1.05, ICE, ICEB);
s.addText([{ text:"Summarizes, doesn't memorize  →  ", options:{ bold:true, color:BLUEDK } },{ text:"a small model fits on-cluster.", options:{ color:INK } }],
  { x:M+6.45, y:4.85, w:5.2, h:1.05, margin:0, valign:"middle", fontFace:BF, fontSize:13 });
s.addText([{ text:"Scope wall:  ", options:{ bold:true, color:INK } },
  { text:"WebUI = OneFS docs only.   InsightIQ = OneFS + cluster & performance.", options:{ color:SLATE } }],
  { x:M, y:6.25, w:11.9, h:0.5, margin:0, fontFace:BF, fontSize:13 });
pageNum(s, 8);

// ═══════════════════════ SLIDE 9 — Trust & safety ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Trust & safety", TEAL);
title(s, "Grounded, version-matched, and guard-railed on destructive actions.");
const ts=[["Grounded-only","Answers come from official docs with citations — never open-internet guessing."],
  ["Version-matched","The knowledge base ships inside each OneFS release: a 9.13 cluster gets 9.13 answers."],
  ["Human-in-the-loop","The assistant suggests, never executes. Confirm-before-run on any delete or modify."],
  ["Accuracy gate before GA","A graded test set of real admin questions, a pass bar, and SME sign-off. No shipping on vibes."]];
ts.forEach((t,i)=>{ const x=M+(i%2)*6.15, y=2.5+Math.floor(i/2)*2.0;
  card(s, x, y, 5.75, 1.75);
  numCircle(s, x+0.3, y+0.3, i+1, TEAL);
  s.addText(t[0], { x:x+0.9, y:y+0.32, w:4.6, h:0.4, margin:0, fontFace:HF, fontSize:16, bold:true, color:INK });
  s.addText(t[1], { x:x+0.3, y:y+0.92, w:5.15, h:0.7, margin:0, fontFace:BF, fontSize:12.5, color:SLATE, lineSpacingMultiple:1.06 }); });
pageNum(s, 9);

// ═══════════════════════ SLIDE 10 — Storage stays P0 ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Running on the cluster");
title(s, "Storage stays P0 — the assistant runs in the headroom, never the workload.");
const cp=[["Small footprint","A quantized 3B model, ~2–3 GB, loaded once. Retrieval lets us stay small."],
  ["Resource-capped","Hard CPU/RAM ceilings. Cache and client I/O always win; throttled first under load."],
  ["Bursty, not sustained","Works only during a question — seconds, not a 24/7 background daemon."],
  ["Off-box option","Heavy InsightIQ analysis can run on the InsightIQ VM, off the storage node."]];
let y10=2.35; cp.forEach((t,i)=>{ featRow(s, M, y10, 6.6, i+1, t[0], t[1]); y10+=1.0; });
// resource bar visual
const rx=7.6, rw=4.9, ry=2.6;
s.addText("One node's resources", { x:rx, y:ry-0.35, w:rw, h:0.3, margin:0, fontFace:HF, fontSize:12.5, bold:true, color:INK });
// total-resource track, then P0 + capped-assistant segments with a headroom gap
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:rx, y:ry, w:rw, h:1.4, rectRadius:0.06, fill:{ color:"E9EEF3" }, line:{ color:BORDER, width:1 } });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:rx, y:ry, w:rw*0.68, h:1.4, rectRadius:0.06, fill:{ color: BLUE }, line:{ type:"none" } });
s.addText("Client I/O + cache — P0", { x:rx, y:ry, w:rw*0.68, h:1.4, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:12, bold:true, color:"FFFFFF" });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:rx+rw*0.71, y:ry, w:rw*0.15, h:1.4, rectRadius:0.06, fill:{ color: ORANGE }, line:{ type:"none" } });
s.addText("Assistant", { x:rx+rw*0.71, y:ry, w:rw*0.15, h:1.4, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:9, bold:true, color:"FFFFFF" });
s.addText("head-\nroom", { x:rx+rw*0.87, y:ry, w:rw*0.13, h:1.4, margin:0, align:"center", valign:"middle", fontFace:BF, fontSize:8.5, color:SLATE });
s.addText("↑ capped by a resource governor — the assistant can never starve storage.",
  { x:rx, y:ry+1.55, w:rw, h:0.6, margin:0, fontFace:BF, fontSize:11, italic:true, color:SLATE, lineSpacingMultiple:1.05 });
card(s, rx, ry+2.35, rw, 1.35, "FBF0EC", "F1C9B8");
s.addText([{ text:"Phase-0 gate.  ", options:{ bold:true, color:ORANGE } },
  { text:"Prove client P99 latency & throughput stay within ~2% with it active — or we ship off-box first.", options:{ color:INK } }],
  { x:rx+0.25, y:ry+2.35, w:rw-0.5, h:1.35, margin:0, valign:"middle", fontFace:BF, fontSize:11.5, lineSpacingMultiple:1.05 });
pageNum(s, 10);

// ═══════════════════════ SLIDE 11 — Data residency ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "Data & security", TEAL);
title(s, "100% on the customer's cluster. Nothing leaves. Nothing calls home.");
// boundary box
const dbx=M, dby=2.5, dbw=7.7, dbh=3.4;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:dbx, y:dby, w:dbw, h:dbh, rectRadius:0.1, fill:{ color:"EFF9F4" }, line:{ color:TEAL, width:2, dashType:"dash" } });
s.addText("CUSTOMER ENVIRONMENT — AIR-GAPPED", { x:dbx+0.3, y:dby+0.22, w:dbw-0.6, h:0.35, margin:0, fontFace:HF, fontSize:12.5, bold:true, charSpacing:1.5, color:TEAL });
const inside=["OneFS cluster","Small AI model","Knowledge base","InsightIQ VM"];
inside.forEach((t,i)=>{ const x=dbx+0.35+(i%2)*3.6, y=dby+0.85+Math.floor(i/2)*1.2;
  card(s, x, y, 3.3, 0.95, CARD);
  s.addText(t, { x:x, y:y, w:3.3, h:0.95, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:14, bold:true, color:INK }); });
// blocked egress
s.addShape(pres.shapes.LINE, { x:dbx+dbw, y:dby+dbh/2, w:1.1, h:0, line:{ color:MOCK, width:2, dashType:"dash", endArrowType:"triangle" } });
s.addText("✕", { x:dbx+dbw+0.35, y:dby+dbh/2-0.55, w:0.5, h:0.5, margin:0, align:"center", valign:"middle", fontFace:HF, fontSize:22, bold:true, color:"C0392B" });
card(s, dbx+dbw+1.15, dby+dbh/2-0.75, 2.35, 1.5, MOCKBG, "D6DBE1");
s.addText("Dell / cloud", { x:dbx+dbw+1.15, y:dby+dbh/2-0.6, w:2.35, h:0.4, margin:0, align:"center", fontFace:HF, fontSize:12.5, bold:true, color:MOCK });
s.addText("no data egress\nno phone-home", { x:dbx+dbw+1.15, y:dby+dbh/2-0.15, w:2.35, h:0.8, margin:0, align:"center", fontFace:BF, fontSize:10.5, color:SLATE, lineSpacingMultiple:1.05 });
s.addText([{ text:"Model & knowledge base ship in the release package — no download. ", options:{ color:SLATE } },
  { text:"Cluster data and telemetry never leave the environment.", options:{ bold:true, color:INK } }],
  { x:M, y:6.05, w:11.9, h:0.45, margin:0, fontFace:BF, fontSize:12.5 });
s.addText("This is what lets federal, healthcare, and security-first enterprises say yes.",
  { x:M, y:6.55, w:11.9, h:0.45, margin:0, fontFace:HF, fontSize:14, bold:true, color:TEAL });
pageNum(s, 11);

// ═══════════════════════ SLIDE 12 — Payoff ═══════════════════════
s = pres.addSlide(); lightBg(s);
eyebrow(s, "The payoff");
title(s, "Deflect half of admin-question cases → ~10% fewer cases, plus faster onboarding.");
card(s, M, 2.45, 7.3, 2.0, CARD);
s.addText([{ text:"~20%", options:{ fontSize:34, bold:true, color:BLUE } },{ text:"  admin-question cases", options:{ fontSize:15, color:SLATE } },
  { text:"   ×   ", options:{ fontSize:20, color:SLATEL } },{ text:"~50%", options:{ fontSize:34, bold:true, color:BLUE } },{ text:"  self-resolved", options:{ fontSize:15, color:SLATE } }],
  { x:M+0.35, y:2.75, w:6.7, h:0.8, margin:0, valign:"middle", fontFace:HF });
s.addShape(pres.shapes.LINE, { x:M+0.35, y:3.75, w:6.6, h:0, line:{ color:BORDER, width:1 } });
s.addText([{ text:"≈ 10% ", options:{ fontSize:26, bold:true, color:TEAL } },{ text:"fewer support cases", options:{ fontSize:16, bold:true, color:INK } },
  { text:"   (target — validated in Phase 0)", options:{ fontSize:12, italic:true, color:SLATE } }],
  { x:M+0.35, y:3.85, w:6.7, h:0.5, margin:0, valign:"middle", fontFace:HF });
card(s, M+7.7, 2.45, 4.2, 2.0, ICE, ICEB);
s.addText("Faster onboarding", { x:M+7.95, y:2.7, w:3.7, h:0.4, margin:0, fontFace:HF, fontSize:16, bold:true, color:BLUEDK });
s.addText("New admins ramp faster — the console teaches itself instead of the manual.",
  { x:M+7.95, y:3.2, w:3.7, h:1.1, margin:0, fontFace:BF, fontSize:13, color:INK, lineSpacingMultiple:1.08 });
card(s, M, 4.75, 11.9, 1.85, LIGHT, BORDER);
s.addText("How we'll prove it — not just claim it", { x:M+0.35, y:5.0, w:11.2, h:0.4, margin:0, fontFace:HF, fontSize:15, bold:true, color:INK });
const proof=["Instrument assistant-resolved vs. escalated","Track time-to-answer","Compare case-rate: enabled clusters vs. control"];
proof.forEach((t,i)=>{ const x=M+0.35+i*3.85; dot(s, x, 5.7, BLUE);
  s.addText(t, { x:x+0.25, y:5.55, w:3.6, h:0.7, margin:0, fontFace:BF, fontSize:12.5, color:SLATE, lineSpacingMultiple:1.05 }); });
pageNum(s, 12);

// ═══════════════════════ SLIDE 13 — Fit + roadmap + ask (dark) ═══════════════════════
s = pres.addSlide(); darkBg(s);
s.addText("WHERE IT FITS  ·  THE ASK", { x:M, y:0.7, w:11.9, h:0.3, margin:0, fontFace:HF, fontSize:12.5, bold:true, charSpacing:2.5, color:BLUE });
s.addText("One platform: strengthen InsightIQ 6.3 today, OneFS tomorrow.", { x:M, y:1.15, w:11.9, h:0.9, margin:0, fontFace:HF, fontSize:27, bold:true, color:"FFFFFF" });
s.addText("The same engine can enhance the existing InsightIQ 6.3 assistant — event guide, explain-alerts, admin Q&A. Build once, not a competing effort.",
  { x:M, y:2.15, w:11.9, h:0.7, margin:0, fontFace:BF, fontSize:14, color:ICE, lineSpacingMultiple:1.05 });
const ph=[["Phase 0","Prove the SLA gate + validate the 1-in-5 case number."],
  ["Phase 1","Ship the InsightIQ assistant off-box — lowest risk. Docs + explain-alert."],
  ["Phase 2","On-cluster WebUI assistant for F/H nodes, resource-governed."],
  ["Phase 3","Live telemetry: “why is my cluster slow right now.”"]];
ph.forEach((p,i)=>{ const x=M+i*2.98;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:3.25, w:2.78, h:2.15, rectRadius:0.09, fill:{ color:"12314B" }, line:{ color:"1E4569", width:1 } });
  s.addText(p[0], { x:x+0.25, y:3.45, w:2.3, h:0.4, margin:0, fontFace:HF, fontSize:15, bold:true, color: i?SLATEL:BLUE });
  s.addText(p[1], { x:x+0.25, y:3.95, w:2.35, h:1.35, margin:0, fontFace:BF, fontSize:11.5, color: i?"C9D4DE":"FFFFFF", lineSpacingMultiple:1.08 });
  if(i<3) s.addText("→", { x:x+2.78-0.02, y:3.9, w:0.28, h:0.5, margin:0, align:"center", fontFace:HF, fontSize:18, bold:true, color:SLATEL }); });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:M, y:5.85, w:11.9, h:0.95, rectRadius:0.1, fill:{ color: BLUE }, line:{ type:"none" } });
s.addText([{ text:"The ask:   ", options:{ bold:true, color:"FFFFFF", fontSize:18 } },
  { text:"greenlight Phase 0 — prove the storage-SLA gate and validate the case number, before we invest further.", options:{ color:"EAF3FB", fontSize:15 } }],
  { x:M+0.35, y:5.85, w:11.2, h:0.95, margin:0, valign:"middle", fontFace:HF });

pres.writeFile({ fileName: "PowerScale-Assistant-Management-Deck.pptx" }).then(f => console.log("WROTE", f));
