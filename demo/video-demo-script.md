# PowerScale Admin Assistant — Demo Video Script (~3:45)

Architecture first (plain-English), then the live demo of both platforms.

## Before you record (setup)
- **Pre-warm it:** launch `START.bat`, wait ~20s, ask one throwaway question so answers are fast on camera.
- Tabs ready: **OneFS WebUI** (`localhost:8501/`) and **InsightIQ** (`localhost:8501/insightiq`). Hide bookmarks / personal tabs.
- Have the architecture graphic ready for Part 1 — `diagrams/how-it-works.svg` (or `.png`).
- Record 1080p; move the cursor slowly. Text in `[brackets]` = on-screen caption.
- Answers stream in ~10–20s — either keep it (shows it's genuinely thinking *locally*) or trim the wait in editing.

---

## PART 1 · How it works (0:00–1:00) 

### SCENE A1 — What this is (0:00–0:20)
- **Screen:** Title card, then the two consoles (WebUI + InsightIQ) side by side, dimmed.
- **VO:** "This is the PowerScale Admin Assistant — an AI helper built into the two places a storage admin already works: the OneFS console, and InsightIQ. What you'll see is a working prototype of that feature."
- **Caption:** `A prototype of an embedded PowerScale feature`

### SCENE A2 — The idea, in plain terms (0:20–0:45)
- **Screen:** `diagrams/how-it-works.svg` — reveal one box at a time:
  **① You ask** → **② It looks up the answer in Dell's official docs** → **③ A small AI on the cluster explains it in plain English** → **④ You get the answer, with its sources.**
- **VO:** "The idea is simple. You ask in plain language. Instead of *guessing*, the assistant looks it up in Dell's own documentation. A small AI — running right on the cluster — turns those pages into a clear answer. And it always shows the sources it used."
- **Caption:** `Grounded in Dell's docs · runs on the cluster · always cited`

### SCENE A3 — Two surfaces, one engine (0:45–1:00)
- **Screen:** Split — **WebUI** ("OneFS admin questions") | **InsightIQ** ("performance + alerts"), subtle divider.
- **VO:** "Same engine, two jobs. In the WebUI it handles OneFS administration. In InsightIQ it adds performance and alerts. Each one stays in its lane — and nothing ever leaves the cluster."

---

## PART 2 · Live demo (1:00–3:45)

### SCENE 1 — Into the WebUI (1:00–1:10)
- **Screen:** OneFS WebUI. Click the **✨ AI Assistant** button; panel slides out.
- **VO:** "Let's see it. Here's the assistant, embedded in the OneFS console."

### SCENE 2 — Grounded answer + copy-ready CLI (1:10–1:40)
- **Screen:** Type **"How do I create an SMB share in OneFS 9.12?"** → Send. Streams: numbered steps + an `isi` command block + citation chips.
- **VO:** "Ask a real admin question — and you get numbered steps, the exact command as a one-click copy block, and a **citation** back to the guide it came from."
- **Screen:** Click **Copy** on the command; click a citation chip.
- **Caption:** `Grounded · cited · copy-ready`

### SCENE 3 — Explain this event (1:40–2:00)
- **Screen:** On the dashboard, click **✦ Explain** on an event row.
- **VO:** "It reads the cluster too. Click 'Explain' on an event, and it says what it means and what to do next — in plain English."

### SCENE 4 — The scope wall → bridge to InsightIQ (2:00–2:25)
- **Screen:** In the assistant, type **"Which node has the highest CPU?"** → a card appears: *"Performance lives in InsightIQ"* + **[Open InsightIQ →]**.
- **VO:** "Now watch — ask a *performance* question here, and it doesn't bluff. That lives in InsightIQ, so it hands you off, with a link."
- **Screen:** Click **Open InsightIQ →**.
- **Caption:** `Each assistant knows its scope`

### SCENE 5 — InsightIQ answers performance (2:25–2:55)
- **Screen:** InsightIQ. Open the assistant. Ask **"Which node had the highest CPU usage?"** → *"Node 1, ~3%…"* with InsightIQ citations.
- **VO:** "Same assistant, wider scope. Here it reads the actual performance reports — so it tells you which node is busiest, and backs it up with the source."

### SCENE 6 — Explain this alert (2:55–3:20)
- **Screen:** **View Alerts** → click **Explain** on the protocol-latency warning → plain-English cause + what to check.
- **VO:** "And every alert gets the same treatment, grounded in the OneFS Event Reference."

### SCENE 7 — Close (3:20–3:45)
- **Screen:** Quick cuts of both consoles, then the black `START` window.
- **VO:** "Grounded in Dell's own docs. Cited every time. And 100% local — nothing ever leaves the cluster. An expert admin, in the console, at 2 a.m."
- **Caption:** `Runs on the cluster · nothing leaves · always cited`
- **End card:** *PowerScale Admin Assistant — prototype.*

---

**Delivery tips:** keep the VO calm and unhurried; let one answer fully render on screen (proof it's real); don't demo more than the moments above — restraint reads as confidence.
