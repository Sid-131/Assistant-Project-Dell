// One-page leave-behind for the management pitch.
const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow,
        TableCell, WidthType, BorderStyle, ShadingType, LevelFormat } = require("docx");
const fs = require("fs");

const NAVY = "0B1F33", BLUE = "0076CE", TEAL = "0F7A5C", SLATE = "5B6B7B", INK = "1A2330",
      TINT = "E7F2FC", TEALT = "E3F6EF", LINE = "C9D5E2";
const TW = 10080;

const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 70, line: 250 }, alignment: o.align,
  children: [new TextRun({ text: t, size: o.size ?? 19, bold: o.bold, italics: o.italic, color: o.color ?? INK, font: "Calibri" })] });
const RUNS = (rs, o = {}) => new Paragraph({ spacing: { after: o.after ?? 70, line: 250 },
  children: rs.map(r => new TextRun({ font: "Calibri", size: 19, ...r })) });
const H = t => new Paragraph({ spacing: { before: 150, after: 60 },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 17, characterSpacing: 30, color: BLUE, font: "Calibri" })] });
const B = t => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 40, line: 250 },
  children: [new TextRun({ text: t, size: 19, color: INK, font: "Calibri" })] });

const promo = (title, body, bg, col) => new TableCell({
  width: { size: TW / 3, type: WidthType.DXA },
  shading: { type: ShadingType.CLEAR, fill: bg, color: "auto" },
  margins: { top: 90, bottom: 90, left: 130, right: 130 },
  children: [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: title, bold: true, size: 19, color: col, font: "Calibri" })] }),
    new Paragraph({ children: [new TextRun({ text: body, size: 16, color: INK, font: "Calibri" })] }),
  ],
});

const doc = new Document({
  numbering: { config: [{ reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 190 } } } }] }] },
  styles: { paragraphStyles: [{ id: "Normal", run: { font: "Calibri", size: 19, color: INK } }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, bottom: 800, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "PowerScale Admin Assistant", bold: true, size: 36, color: NAVY, font: "Calibri" })] }),
      new Paragraph({ spacing: { after: 40 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 3 } },
        children: [new TextRun({ text: "An AI helper embedded in the OneFS WebUI and InsightIQ — grounded in Dell's own documentation, running entirely on the cluster.", size: 20, color: SLATE, font: "Calibri" })] }),

      H("The problem"),
      RUNS([{ text: "At 2 a.m., an admin mid-change has two bad options: search a 900-page manual, or open a support case and wait hours. Our working estimate is that " },
            { text: "roughly 1 in 5 support contacts", bold: true },
            { text: " are “how do I…” questions the documentation already answers — slow for the customer, and a cost to us for answering what we've already written down." }]),

      H("What we built — a working prototype"),
      P("An assistant inside the two consoles admins already use. Same engine, two scopes:"),
      B("OneFS WebUI — administration and configuration questions."),
      B("InsightIQ — performance answers and “explain this alert.”"),
      RUNS([{ text: "Ask in plain English and get numbered steps, the exact " }, { text: "isi", font: "Consolas", size: 18 },
            { text: " CLI command as a one-click copy, and a citation back to the guide it came from. Ask a performance question in the WebUI and it doesn't bluff — it hands you to InsightIQ." }]),

      H("Why it is safe to put in front of customers"),
      new Table({ columnWidths: [TW / 3, TW / 3, TW / 3], width: { size: TW, type: WidthType.DXA },
        borders: ["top","bottom","left","right","insideHorizontal","insideVertical"].reduce((a,k)=>(a[k]={style:BorderStyle.SINGLE,size:4,color:LINE},a),{}),
        rows: [new TableRow({ children: [
          promo("Grounded", "Answers only from official docs. Says “I don't know” instead of inventing.", TINT, BLUE),
          promo("Cited", "Every answer shows the source guide it came from.", TEALT, TEAL),
          promo("100% local", "Nothing leaves the cluster — unlocks federal and regulated accounts.", TINT, BLUE),
        ] })] }),
      new Paragraph({ spacing: { before: 80, after: 70, line: 250 }, children: [new TextRun({
        text: "The knowledge base ships and stays current with each OneFS release, and the assistant suggests — it never executes.", size: 19, color: INK, font: "Calibri" })] }),

      H("It runs where the product runs"),
      P("The assistant is CPU-based, like a PowerScale node. The prototype runs on a laptop; a node is Xeon-class, with the AI instructions and core count a laptop does not have — projecting answers in seconds on-node. A one-command bench is included to confirm it on real hardware."),

      H("Status and the ask"),
      B("Today — grounded, cited answers in both consoles: proven. Cluster data in the demo is mocked."),
      B("Next — connect to live cluster data so it answers about this cluster, not just the manual; then guarded, confirm-before-run actions."),
      RUNS([{ text: "The ask: ", bold: true, color: BLUE }, { text: "green-light validation of the live-data step on a real node. The software is proven; it needs the cluster behind it." }], { after: 100 }),

      new Paragraph({ spacing: { before: 60 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [new TextRun({ text: "Prototype — read-only; no live cluster calls. The 1-in-5 figure is a working internal estimate, to be validated against the support-ticket taxonomy.", size: 15, italics: true, color: SLATE, font: "Calibri" })] }),
    ],
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync("PowerScale-Assistant-One-Pager.docx", b); console.log("WROTE PowerScale-Assistant-One-Pager.docx"); });
