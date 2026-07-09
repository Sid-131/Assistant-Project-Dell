const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TableOfContents, VerticalAlign,
  TabStopType
} = require("docx");

const BLUE = "0076CE", DARK = "0B2740", INK = "1A1A1A", GREY = "5B6B7B", LIGHTBLUE = "EAF3FB", RULE = "0076CE";

// ── helpers ──────────────────────────────────────────────────────
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P = (runs, opts = {}) => new Paragraph({
  spacing: { after: 140, line: 276 },
  children: Array.isArray(runs) ? runs : [new TextRun(runs)], ...opts
});
const lead = (t) => new Paragraph({ spacing: { after: 160, line: 288 },
  children: [new TextRun({ text: t, italics: true, color: GREY, size: 24 })] });
const bullet = (t) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 80, line: 270 },
  children: Array.isArray(t) ? t : [new TextRun(t)] });
const numbered = (t, ref = "n") => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80, line: 270 },
  children: Array.isArray(t) ? t : [new TextRun(t)] });
const b = (t) => new TextRun({ text: t, bold: true });
const r = (t) => new TextRun(t);

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "D9DEE5" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
function cell(text, w, { head = false, bold = false, fill } = {}) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    shading: fill ? { fill, type: ShadingType.CLEAR } : (head ? { fill: DARK, type: ShadingType.CLEAR } : undefined),
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, bold: head || bold, color: head ? "FFFFFF" : INK, size: 21 })] })],
  });
}
function table(headers, rows, widths) {
  const total = widths.reduce((a, c) => a + c, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { head: true })) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((c, i) => cell(c, widths[i], { fill: ri % 2 ? "F4F7FA" : undefined, bold: i === 0 })),
      })),
    ],
  });
}
const ruleBefore = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, children: [new TextRun(t)],
});

// ── document ─────────────────────────────────────────────────────
const doc = new Document({
  creator: "PowerScale AI Assistant",
  title: "PowerScale AI Assistant — Management Proposal",
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: INK } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal",
        run: { size: 52, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { after: 80 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
      { reference: "n", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5", space: 4 } },
      children: [new TextRun({ text: "PowerScale AI Assistant  ·  Management Proposal", color: GREY, size: 16 }),
        new TextRun({ text: "\tConfidential — Internal", color: GREY, size: 16 })],
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D9DEE5", space: 4 } },
      children: [new TextRun({ text: "Bringing conversational help to the OneFS WebUI", color: GREY, size: 16 }),
        new TextRun({ text: "\tPage ", color: GREY, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], color: GREY, size: 16 })],
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }] })] }) },
    children: [
      // ── Title block ──
      new Paragraph({ spacing: { before: 1200, after: 0 }, style: "Title",
        children: [new TextRun("PowerScale AI Assistant")] }),
      new Paragraph({ spacing: { after: 240 }, children: [
        new TextRun({ text: "Bringing conversational, in‑context help to the entire OneFS WebUI", size: 30, color: BLUE, bold: true })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "A proposal for management, grounded in a validated working prototype", size: 24, color: GREY, italics: true })] }),
      new Paragraph({ spacing: { before: 360 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 8 } },
        children: [new TextRun({ text: "Prepared for: Product Leadership", size: 22, color: INK })] }),
      new Paragraph({ children: [new TextRun({ text: "Status: Prototype complete and demonstrated  ·  Recommendation: Productize across the OneFS WebUI", size: 22, color: INK })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── TOC ──
      new Paragraph({ spacing: { after: 220 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 6 } },
        children: [new TextRun({ text: "Contents", bold: true, size: 30, color: BLUE })] }),
      ...[
        ["1", "Executive Summary"],
        ["2", "The Opportunity"],
        ["3", "What We Built: The Prototype"],
        ["4", "What the Prototype Proves"],
        ["5", "The Vision: Across the Entire OneFS WebUI"],
        ["6", "Business Impact"],
        ["7", "A Phased, Low‑Risk Rollout"],
        ["8", "Risks and How We Address Them"],
        ["9", "Recommendation & Next Steps"],
        ["", "Appendix: Questions the Prototype Answers Today"],
      ].map(([n, t]) => new Paragraph({ spacing: { after: 130, line: 276 },
        children: [
          new TextRun({ text: n ? `${n}    ` : "      ", bold: true, color: BLUE, size: 24 }),
          new TextRun({ text: t, color: INK, size: 24 }),
        ] })),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. Executive Summary ──
      H1("1.  Executive Summary"),
      lead("We built a working prototype of an AI assistant embedded directly inside the OneFS management console. It answers administrators’ questions in plain language, drawing only on Dell’s official OneFS documentation, and it runs entirely on the customer’s own environment. This document proposes extending that experience across the whole OneFS WebUI."),
      P([b("The problem. "), r("OneFS is a deep, capable platform, but that depth makes the WebUI hard to learn and the answers hard to find. When an administrator gets stuck, the answer usually already exists in the documentation — it is simply not on the screen in front of them. So they leave the console to search lengthy manuals, or they open a support case. By our working estimate, roughly "), b("one in five support cases"), r(" are exactly these kinds of questions: “how do I do X?” and “what does this cluster event mean?”")]),
      P([b("What we built. "), r("A prototype that places an assistant inside the WebUI. An administrator asks a question without leaving the page they are on, and receives a clear, step‑by‑step answer with a citation to the official guide it came from. It understands which screen the user is on, explains cluster events in plain English, points the user to the right place in the console, and provides ready‑to‑use commands. Critically, it answers "), b("only"), r(" from the official documentation and declines to guess when the answer is not there.")]),
      P([b("What it proves. "), r("The prototype validates that this experience is accurate, trustworthy, and genuinely useful — and that it can run fully within the customer’s environment, with no data leaving the cluster. That last property is decisive for the security‑sensitive customers PowerScale serves.")]),
      P([b("The proposal. "), r("Extend the assistant from the prototype’s initial screens to "), b("the entire OneFS WebUI"), r(", so that every area of the console — from the dashboard to protocols, data protection, access, and cluster management — carries the same conversational, in‑context help. The result: a measurably easier product, fewer support cases, and faster, more confident administrators.")]),

      // ── 2. The Opportunity ──
      H1("2.  The Opportunity"),
      H2("2.1  OneFS is powerful, but that power has a learning cost"),
      P("OneFS gives administrators enormous capability, and the WebUI exposes a correspondingly large surface area. For an experienced administrator this is a strength; for everyone else it is a barrier. Finding the right screen, understanding what a setting does, and interpreting a cluster event all require knowledge that today lives outside the product — in manuals, knowledge‑base articles, and the heads of senior engineers."),
      H2("2.2  The answer exists — just not on the screen"),
      P("The friction is not that the information is missing. Dell’s OneFS documentation is thorough. The friction is that the information is separated from the moment of need. To answer a simple question, an administrator typically:"),
      numbered("Stops what they are doing in the console."),
      numbered("Searches across lengthy PDFs and knowledge‑base articles for the relevant passage."),
      numbered("Pieces together an answer — or, if time is short, opens a support case."),
      P("Each detour costs the administrator time, risks a misconfiguration, and — when it ends in a support case — costs Dell money to answer a question the documentation already covers."),
      H2("2.3  Two question types drive avoidable support load"),
      P([b("“How do I do X?” "), r("Procedural questions — creating a share, configuring an access zone, adding a node — where the documented steps exist but are hard to locate.")]),
      P([b("“What does this event mean?” "), r("Cluster events and alerts are often cryptic. Administrators open cases simply to understand whether an event is serious and what to do about it.")]),
      P([r("Together, by our working estimate, these account for about "), b("one in five OneFS support cases"), r(" — a large, addressable pool of contacts that never needed a human to begin with.")]),

      // ── 3. The Prototype ──
      H1("3.  What We Built: The Prototype"),
      lead("A working assistant, embedded in the OneFS console, that answers from the official documentation — demonstrated end to end, today."),
      P("We built and validated a functioning prototype. It is not a slideware concept; it is a running experience that can be demonstrated live. The prototype recreates the OneFS WebUI and embeds an assistant panel that an administrator can open from any page."),
      H2("3.1  The experience"),
      bullet([b("Ask in plain language, in context. "), r("The administrator types a question — “How do I create an SMB share?” — without leaving the console, and gets a clear, numbered answer.")]),
      bullet([b("Every answer is sourced. "), r("Each response cites the official OneFS guide it came from, so the administrator can trust it and read further if needed.")]),
      bullet([b("It knows where you are. "), r("The assistant is aware of the screen the administrator is on and tailors its answers and suggestions to that context.")]),
      bullet([b("It explains cluster events. "), r("An administrator can point the assistant at an event — for example, a drive predicted to fail — and receive a plain‑English explanation of what it means and how to resolve it.")]),
      bullet([b("It guides action. "), r("Answers link to the right place in the console, and any relevant commands are presented ready to copy.")]),
      bullet([b("It refuses to guess. "), r("If the documentation does not contain a confident answer, the assistant says so rather than inventing one — a non‑negotiable for an infrastructure product.")]),
      bullet([b("It runs locally. "), r("The entire experience operates within the customer’s own environment. No questions, data, or cluster details leave the box.")]),
      H2("3.2  What it covers today"),
      P("The prototype was built against the complete OneFS 9.12 documentation set — eleven official guides spanning thousands of pages — and was validated against a representative set of real administrator questions across administration, networking, protocols, security, and cluster events. The initial console screens (dashboard, network configuration, and auditing) demonstrate the embedded experience and the page‑aware behavior."),

      // ── 4. What the Prototype Proves ──
      H1("4.  What the Prototype Proves"),
      P("The prototype was built to de‑risk the idea before any investment in a full product. It answers four questions that matter to a go / no‑go decision:"),
      table(
        ["Question", "What the prototype demonstrated"],
        [
          ["Is it accurate?", "Answers are correct and grounded in the official documentation, with a source citation on every response."],
          ["Is it safe?", "When the documentation does not cover a question, the assistant declines to answer instead of guessing — no fabricated commands or values."],
          ["Is the experience right?", "Embedding the assistant in the console, aware of the current screen, makes help feel like part of the product rather than a separate tool."],
          ["Can it run where customers need it?", "The whole experience runs locally, with nothing leaving the cluster — essential for air‑gapped and security‑sensitive environments."],
        ],
        [2600, 6760]
      ),
      new Paragraph({ spacing: { before: 160, after: 0, line: 276 }, children: [new TextRun({ text: "In short: the hard parts — accuracy, trust, the in‑context experience, and local operation — are proven. What remains is breadth: extending the same experience across the whole console.", italics: true, color: GREY })] }),

      // ── 5. The Vision ──
      H1("5.  The Vision: Across the Entire OneFS WebUI"),
      lead("The prototype covers a few screens. The opportunity is to make the same conversational, in‑context help present everywhere in OneFS — a single, consistent assistant across the whole console."),
      P("Today an administrator’s experience of help is inconsistent: some tasks are familiar, others send them to a manual or a support case. The proposal is to make the assistant a permanent layer of the WebUI, available on every page, so that help is always one question away — wherever the administrator happens to be. The following shows how that plays out across the major areas of the console:"),
      table(
        ["WebUI area", "How the assistant helps"],
        [
          ["Dashboard & monitoring", "Explains cluster status, capacity, and events in plain English; turns an alert into a cause and a recommended action."],
          ["Cluster management", "Walks through node, network, licensing, hardware, and upgrade tasks; explains settings before they are changed."],
          ["File system & SmartPools", "Clarifies storage pools, tiering, quotas, and deduplication, and the trade‑offs between them."],
          ["Data protection", "Guides snapshots, replication, and retention; explains what a given policy will and will not protect."],
          ["Access & authentication", "Demystifies access zones, providers, roles, and permissions — a frequent source of confusion and error."],
          ["Protocols (SMB, NFS, S3, HDFS)", "Answers protocol set‑up and tuning questions, including the ports and prerequisites each requires."],
        ],
        [2900, 6460]
      ),
      P([b("A growing knowledge base. "), r("As coverage expands, so does what the assistant draws on: the full OneFS documentation set, Dell knowledge‑base articles, the event reference, and release notes — always matched to the customer’s installed version, so answers are never stale or for the wrong release.")]),
      P([b("One consistent experience. "), r("Crucially, this is not a series of disconnected help pop‑ups. It is one assistant, with one voice and one standard of accuracy, present across the entire product — so an administrator learns to trust it once and relies on it everywhere.")]),

      // ── 6. Business Impact ──
      H1("6.  Business Impact"),
      P("Extending the assistant across the WebUI delivers value on several fronts at once:"),
      H2("6.1  Lower support cost"),
      P([r("The “how do I?” and “what does this event mean?” questions — our estimated "), b("one in five cases"), r(" — can be answered in the console, before they ever become a support contact. Every deflected case is direct cost avoided and a faster outcome for the customer.")]),
      H2("6.2  A lower barrier to operating OneFS"),
      P("With expert guidance built into the product, a less‑experienced administrator can operate OneFS confidently. This broadens who can run the platform — valuable for customers who lack deep in‑house expertise, and therefore for Dell’s addressable market."),
      H2("6.3  Fewer misconfigurations"),
      P("Many support cases stem not from questions but from mistakes — settings changed without understanding their effect. In‑context explanations at the moment of change reduce those errors and the escalations they cause."),
      H2("6.4  A better, stickier product"),
      P("A console that answers its own questions is simply easier to live with. It improves the day‑to‑day experience of the administrators who choose and renew the platform, and it is a clear, demonstrable differentiator against competing storage systems."),
      H2("6.5  A new signal Dell does not have today"),
      P("What administrators ask the assistant — in aggregate and anonymized — reveals exactly where the product and its documentation are hardest to understand. That is a continuous, direct feedback loop into product and content decisions that no survey provides."),

      // ── 7. Phased Rollout ──
      H1("7.  A Phased, Low‑Risk Rollout"),
      P("This does not need to arrive all at once. The capability can be delivered in stages, each useful on its own and each building trust before the next:"),
      table(
        ["Phase", "What ships", "Value"],
        [
          ["1 — Answer", "Conversational, cited help across the whole WebUI, drawn from the official documentation.", "Immediate support deflection and an easier console. Lowest risk."],
          ["2 — Aware", "Answers that reflect the customer’s own cluster — its real status, events, and configuration.", "Moves from general guidance to specific, situation‑aware help."],
          ["3 — Act", "Guided actions the administrator can confirm and execute, with full audit and permissions.", "Turns answers into completed tasks, safely."],
          ["4 — Anticipate", "Proactive guidance — surfacing issues and recommendations before the administrator asks.", "Shifts OneFS from reactive to proactive operation."],
        ],
        [1500, 4660, 3200]
      ),
      new Paragraph({ spacing: { before: 140, after: 140, line: 276 }, children: [new TextRun({ text: "The prototype already delivers the heart of Phase 1. Each later phase is optional and gated on the trust earned by the one before it.", italics: true, color: GREY })] }),

      // ── 8. Risks ──
      H1("8.  Risks and How We Address Them"),
      table(
        ["Concern", "How it is addressed"],
        [
          ["Could it give a wrong answer?", "It answers only from the official documentation, cites its source every time, and declines to answer when it is not confident. The prototype already behaves this way."],
          ["Is customer data safe?", "The experience runs entirely within the customer’s environment. Nothing leaves the cluster — suitable even for air‑gapped sites."],
          ["Could it take an unsafe action?", "Early phases are read‑only — guidance only. Any future action requires the administrator’s confirmation, respects existing permissions, and is fully audited."],
          ["Will the answers stay current?", "The knowledge base is tied to the customer’s installed OneFS version and refreshed as documentation is updated, so answers track the product."],
        ],
        [3000, 6360]
      ),

      // ── 9. Recommendation ──
      H1("9.  Recommendation & Next Steps"),
      P([b("Recommendation. "), r("Approve productization of the assistant across the OneFS WebUI, beginning with Phase 1 (conversational, cited help on every screen). The concept is proven; the remaining work is breadth and polish, not invention.")]),
      P("Concrete next steps we recommend:"),
      numbered("Endorse the direction and confirm the target: the assistant as a standard, built‑in feature of the OneFS WebUI."),
      numbered("Fund a focused team to extend the prototype’s experience across the full console and the complete documentation set."),
      numbered("Run a guided pilot with a small number of design‑partner customers to confirm support‑deflection impact and gather feedback."),
      numbered("Use the pilot’s results — deflection rate and administrator feedback — to scope Phases 2 and beyond."),
      new Paragraph({ spacing: { before: 200, after: 140, line: 276 }, children: [new TextRun({ text: "The prototype has answered the question of whether this can work. The decision in front of us is how widely and how quickly to bring it to our customers.", bold: true, color: DARK })] }),

      // ── Appendix ──
      new Paragraph({ children: [new PageBreak()] }),
      H1("Appendix:  Questions the Prototype Answers Today"),
      P("The following are representative of the questions the prototype answers correctly, with citations, drawn live from the official OneFS 9.12 documentation:"),
      bullet("“How do I create an SMB share in OneFS 9.12?”"),
      bullet("“How do I configure an access zone?”"),
      bullet("“What network ports does NFS require to be open?”"),
      bullet("“What CLI command do I use to check cluster health?”"),
      bullet("“What is a groupnet, and how does it relate to a subnet?”"),
      bullet("“What does enabling protocol access auditing do?”"),
      bullet("“Explain this event: a drive in bay 3 reported a predictive failure — what does it mean and how do I resolve it?”"),
      new Paragraph({ spacing: { before: 160, after: 140, line: 276 }, children: [new TextRun({ text: "And, just as importantly, when asked something outside the documentation — such as product pricing — it correctly declines to answer rather than guessing.", italics: true, color: GREY })] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync("PowerScale-Assistant-Management-Proposal.docx", buf); console.log("WROTE docx"); });
