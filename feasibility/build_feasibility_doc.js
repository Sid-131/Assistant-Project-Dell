// PowerScale CPU feasibility document — prototype baseline → projected on-node.
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, LevelFormat,
} = require("docx");
const fs = require("fs");

const NAVY = "0B1F33", BLUE = "0076CE", SLATE = "5B6B7B", INK = "1A2330",
      HEADBG = "E7F2FC", ZEBRA = "F4F7FB", LINE = "C9D5E2";
const TW = 9360; // table width (DXA)

const P = (text, o = {}) => new Paragraph({
  spacing: { after: o.after ?? 120, line: 276 }, alignment: o.align,
  children: text == null ? [] : [new TextRun({ text, size: o.size ?? 21, bold: o.bold, italics: o.italic, color: o.color ?? INK, font: "Calibri" })],
});
const RUNS = (runs, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, line: 276 },
  children: runs.map(r => new TextRun({ font: "Calibri", size: 21, ...r })) });
const H = (text, lvl = HeadingLevel.HEADING_1) => new Paragraph({
  heading: lvl, spacing: { before: 260, after: 120 },
  children: [new TextRun({ text, bold: true, color: NAVY, font: "Calibri", size: lvl === HeadingLevel.HEADING_1 ? 28 : 24 })] });
const bullet = (text, bold) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 80, line: 276 },
  children: [new TextRun({ text, font: "Calibri", size: 21, color: INK, bold })] });

function cell(text, { w, bold, color, bg, align } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: bg ? { type: ShadingType.CLEAR, fill: bg, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ alignment: align,
      children: [new TextRun({ text, bold, size: 19, color: color ?? INK, font: "Calibri" })] })],
  });
}
function table(cols, rows) {
  const widths = cols.map(c => c.w);
  const header = new TableRow({ tableHeader: true,
    children: cols.map(c => cell(c.h, { w: c.w, bold: true, color: NAVY, bg: HEADBG, align: c.align })) });
  const body = rows.map((r, i) => new TableRow({
    children: r.map((v, j) => cell(String(v), { w: widths[j], bg: i % 2 ? ZEBRA : "FFFFFF", align: cols[j].align })) }));
  return new Table({ columnWidths: widths, width: { size: TW, type: WidthType.DXA },
    borders: ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].reduce((a, k) =>
      (a[k] = { style: BorderStyle.SINGLE, size: 4, color: LINE }, a), {}),
    rows: [header, ...body] });
}
const RULE = () => new Paragraph({ spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 2 } } });

const doc = new Document({
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 220 } } } }] }] },
  styles: { paragraphStyles: [{ id: "Normal", run: { font: "Calibri", size: 21, color: INK } }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      // ── Cover ──
      new Paragraph({ spacing: { before: 1600, after: 60 }, children: [new TextRun({ text: "FEASIBILITY STUDY", bold: true, color: BLUE, size: 22, characterSpacing: 40, font: "Calibri" })] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Running the PowerScale Admin Assistant on the cluster", bold: true, color: NAVY, size: 44, font: "Calibri" })] }),
      P("From a constrained-CPU prototype to projected on-node performance", { size: 26, color: SLATE, after: 400 }),
      RUNS([{ text: "Question: " , bold: true }, { text: "the prototype is slow on a CPU laptop. Would it be usable running on a real PowerScale node, which is also CPU-based?" }], { after: 120 }),
      RUNS([{ text: "Answer: " , bold: true, color: BLUE }, { text: "yes — the laptop's latency is an artifact of consumer hardware; a PowerScale Xeon node is a different AI-compute class. This document measures the prototype baseline, projects the node, and gives a one-command test to confirm it on real hardware." }]),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1 ──
      H("1.  The prototype's CPU latency is a floor, not the ceiling"),
      P("The prototype runs on a consumer laptop CPU with only AVX2 — the weakest AI-compute tier. Measured on that machine with the shipped 3B model on a realistic retrieval prompt (~2,200 prompt + ~300 answer tokens):"),
      table(
        [{ h: "Prototype CPU", w: 3400 }, { h: "Instruction tier", w: 2560 }, { h: "Prefill", w: 1200, align: AlignmentType.CENTER }, { h: "Answer (typical)", w: 2200, align: AlignmentType.CENTER }],
        [["Intel Core i5-13450HX (laptop)", "AVX2 only", "~54 tok/s", "~106 s"]]),
      P("Thread count barely moved it (6 vs 14 threads ≈ identical): the laptop is memory-bandwidth-bound with two memory channels and only performance-core headroom. This is the slowest hardware the assistant will ever run on.", { after: 60 }),
      RUNS([{ text: "Key point: ", bold: true }, { text: "the number to judge feasibility on is not this one. A PowerScale node changes three things at once — instruction set, core count, and memory bandwidth." }]),

      // ── 2 ──
      H("2.  A PowerScale node is a different compute class"),
      P("PowerScale all-flash and hybrid nodes run Intel Xeon Scalable processors, which carry the AI-acceleration instructions the laptop lacks, across many more cores and memory channels."),
      table(
        [{ h: "Attribute", w: 2600 }, { h: "Prototype laptop", w: 3200 }, { h: "PowerScale node (Xeon Scalable)", w: 3560 }],
        [
          ["AI instructions", "AVX2", "AVX-512 + VNNI (Ice Lake); AMX on newest gen"],
          ["Cores (usable)", "~6 effective", "12 – 64 (e.g. F900 = dual 32-core)"],
          ["Memory channels", "2", "8 per socket (much higher bandwidth)"],
          ["RAM", "tens of GB", "hundreds of GB"],
          ["GPU", "none", "none (all CPU) — same as prototype"],
        ]),
      P("VNNI accelerates the int8 quantized matrix math that dominates prefill; AMX (on Sapphire-Rapids-class nodes) is a dedicated matrix engine that pushes CPU inference toward GPU-class throughput. None of this is new work — it is the platform the assistant would already be running on.", { after: 60 }),
      RUNS([{ text: "Implication for packaging: ", bold: true }, { text: "the prototype pins an old AVX2 build of the runtime to avoid a crash on consumer chips. On a node, that pin is dropped — ship the AVX-512/AMX build matched to the node's generation." }]),

      // ── 3 ──
      new Paragraph({ children: [new PageBreak()] }),
      H("3.  Projected performance on the node"),
      P("Scaling the measured prototype baseline by the instruction-set and core/bandwidth gains, under a conservative on-cluster thread cap (see §4). Ranges, not point estimates — to be replaced by the measured number from §5."),
      table(
        [{ h: "Node class", w: 3200 }, { h: "AI tier", w: 2960 }, { h: "Speed-up vs prototype", w: 1600, align: AlignmentType.CENTER }, { h: "Projected answer", w: 1600, align: AlignmentType.CENTER }],
        [
          ["F200 / F600 (Ice Lake)", "AVX-512 + VNNI", "~3–4×", "~27–40 s"],
          ["F900 (dual 32-core)", "AVX-512 + VNNI", "~4–6×", "~18–27 s"],
          ["Sapphire-Rapids class", "AVX-512 + AMX", "~8–15×", "~7–14 s"],
        ]),
      RUNS([{ text: "Assumptions. ", bold: true }, { text: "Baseline ~106 s (measured). VNNI ≈ 2–4× prefill over AVX2; AMX ≈ 5–10×; plus real core/bandwidth scaling beyond the laptop's plateau, capped by the governor in §4. Prefill dominates, so instruction set matters most. Streaming means first words appear well before the totals above." }], { after: 60 }),
      RUNS([{ text: "Read: ", bold: true, color: BLUE }, { text: "on current-gen nodes an answer lands in tens of seconds; on AMX-class nodes, in roughly ten. For a documentation assistant that saves a support case, that is usable." }]),

      // ── 4 ──
      H("4.  Storage stays first — the governor bounds the projection"),
      P("A node's cores are paid for by the customer to serve storage, not to run a chatbot. The assistant runs as a low-priority, thread-capped service so client I/O and cache always win. That cap is a deliberate trade: it gives up peak inference speed to protect the storage SLA."),
      bullet("The projections above assume a capped allocation (a slice of cores), not the whole node — so they are conservative; a dedicated box would be faster.", false),
      bullet("The assistant is bursty (it works only during a question), so its cap is idle most of the time.", false),
      bullet("N_THREADS in the prototype is the seed of this governor; on a node it is pinned to a fixed slice.", false),

      // ── 5 ──
      H("5.  How we confirm it — one command on real hardware"),
      P("Projections become a number by running the bundled bench on hardware that matches the node generation (a lab node, or an Ice-Lake / Sapphire-Rapids cloud VM):"),
      new Paragraph({ shading: { type: ShadingType.CLEAR, fill: "F1F3F5", color: "auto" }, spacing: { after: 120 },
        children: [new TextRun({ text: "python bench/feasibility_bench.py", font: "Consolas", size: 20, color: "1A2330" })] }),
      P("It detects the CPU's AI tier (AVX-512 / VNNI / AMX), times prefill and generation at several thread counts, and prints the projected answer latency — the same table as §3, measured. Acceptance gate before committing to on-node deployment:"),
      bullet("Answer latency at the capped thread count meets the target for that node class (e.g. ≤ 15 s on F900-class).", true),
      bullet("With the assistant active under load, client I/O throughput and P99 latency stay within ~2% of baseline.", true),
      P("If a class misses the gate, the fallback is the InsightIQ VM (off-node compute) — already the recommended first deployment.", { color: SLATE }),

      // ── 6 ──
      H("6.  Risks & unknowns"),
      bullet("Memory-bandwidth ceiling — past a point, more threads stop helping; the bench measures where that is per node.", false),
      bullet("Contention with storage services under peak load; the governor mitigates but must be validated at P99.", false),
      bullet("Node-generation variance — older archive (A-series) nodes are a weaker tier; feature them only where the node clears the gate.", false),
      bullet("Answer quality is fixed to the 3B model; a larger model would be higher quality but slower — a separate trade to test on-node where RAM is ample.", false),

      // ── 7 ──
      H("7.  Recommendation"),
      RUNS([{ text: "Feasible, pending one measurement. ", bold: true, color: BLUE }, { text: "The prototype proves the software; the node provides the missing compute. Validate on a matching Xeon VM with the bench, ship the AVX-512/AMX runtime build for the node's generation (not the prototype's AVX2 pin), and keep the InsightIQ-VM path as the low-risk first step while on-node clears its gate." }]),
      RULE(),
      P("Projections are engineering estimates pending the on-node bench in §5. Prototype baseline measured on an Intel i5-13450HX (AVX2), 3B model, ~2,200+300-token prompt.", { size: 17, color: SLATE, italic: true }),
    ],
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync("PowerScale-CPU-Feasibility.docx", b); console.log("WROTE PowerScale-CPU-Feasibility.docx"); });
