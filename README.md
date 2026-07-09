# PowerScale Assistant

An **AI-assisted help feature for the Dell PowerScale (OneFS 9.12) WebUI**, built as a working local prototype.

An administrator can ask questions in plain English **without leaving the console** and get answers drawn **only from the official OneFS 9.12 documentation**, with source citations. Everything runs **100% locally** — no internet, no cloud, no data leaves the machine.

> This is a prototype of a product *feature* (an assistant embedded in the PowerScale WebUI), not a standalone app. The local web app simulates how the assistant would appear inside the real console.

---

## What it does

- **Grounded Q&A** — answers come only from 11 official OneFS 9.12 manuals; it cites its sources and says *"I don't have sufficient information…"* instead of hallucinating.
- **Embedded in a faithful WebUI replica** — a recreation of the *OneFS Storage Administration* console (Dashboard, Network configuration, Auditing) with the assistant as a floating ✨ panel.
- **Context-aware** — it knows which page you're on and tailors its answers and suggested questions.
- **Actionable answers**
  - **Click-to-navigate** — references like *Protocols → Windows Sharing (SMB)* become links that navigate the console.
  - **Explain this event** — click a Dashboard event to get a plain-English cause and fix, cited from the Event Reference Guide.
  - **Inline field helpers** — ✨ icons next to settings ask a question about that exact field.
  - **Copyable CLI** — `isi …` commands render as one-click-copy code blocks.

---

## Architecture

```
Browser  ──http──>  Flask web app (web/server.py, :8501)
                          │  serves web/index.html  (the WebUI + assistant)
                          │  POST /api/chat  (streams answers via SSE)
                          ▼
                    LlamaIndex RAG engine
                       │              │
              embed query        retrieve top-K
                       ▼              ▼
                Ollama  ◄───  ChromaDB (app/chroma_db, pre-built)
          nomic-embed-text     5,205 passages from 11 OneFS PDFs
          llama3.1:8b  ──>  grounded answer + citations  ──>  browser
```

The vector database is **pre-built and bundled** (`app/chroma_db/`), so the app never needs to re-ingest at run time.

## Tech stack

| Layer | Choice |
|---|---|
| LLM runtime | Ollama (local) |
| Generation model | `llama3.1:8b` |
| Embedding model | `nomic-embed-text` |
| RAG framework | LlamaIndex 0.12 |
| Vector store | ChromaDB 0.6 (cosine) |
| Web backend | Flask 3.1 (SSE streaming) |
| Frontend | Single-file HTML/CSS/JS (`web/index.html`) |
| Python | 3.11 |

---

## Run it locally (anytime)

Everything is already set up on this machine. To launch the web app:

```
Double-click  START.bat
```

This starts Ollama (using the bundled models), opens your browser to **http://localhost:8501**, and runs the web server. Press `Ctrl+C` in the window to stop.

> First launch tip: if the page doesn't load immediately, give it ~10–15 seconds — the RAG engine loads once at startup.

## First-time setup (fresh machine)

If the `venv/` or models aren't present yet:

1. **Install** [Python 3.11](https://www.python.org/downloads/release/python-3119/) and [Ollama](https://ollama.com/download).
2. **Download the docs** (only needed if `docs/` is empty):
   ```powershell
   powershell -ExecutionPolicy Bypass -File download_docs.ps1
   ```
3. **Run setup** (creates the venv, installs packages, pulls models, builds the vector DB):
   ```
   Double-click  SETUP.bat
   ```
4. **Launch**: `START.bat`.

---

## Project structure

```
Smart Web UI/
├── README.md                 ← this file
├── PLAN.md                   ← original implementation plan
├── requirements.txt          ← Python dependencies
│
├── START.bat                 ← launch the web app (run anytime)
├── SETUP.bat                 ← one-time setup (venv, packages, models, DB)
├── download_docs.ps1         ← downloads the 11 OneFS 9.12 PDFs
├── ingest.py                 ← builds the ChromaDB vector store from docs/
│
├── web/                      ← the web application
│     ├── server.py           ←   Flask backend + RAG engine + SSE streaming
│     └── index.html          ←   OneFS WebUI replica + embedded assistant
│
├── app/
│     └── chroma_db/          ← pre-built vector database (5,205 passages)
├── docs/                     ← the 11 official OneFS 9.12 PDFs
│
├── deck/                     ← pitch decks (PptxGenJS)
│     ├── PowerScale-Assistant-Pitch.pptx         (10-slide concept proposal)
│     └── PowerScale-Assistant-Pitch-5slide.pptx  (5-slide tight pitch)
│
├── test_query.py             ← retrieval smoke test (no LLM needed)
├── test_answers.py           ← end-to-end RAG+LLM test
│
├── venv/                     ← Python 3.11 virtual environment (generated)
└── ollama/models/            ← bundled model weights (~5 GB, generated)
```

## How it works

1. **Ingestion** (`ingest.py`, run once): loads the PDFs, splits them with `SentenceSplitter` (chunk 512 / overlap 64), embeds each chunk with `nomic-embed-text`, and stores vectors in ChromaDB using **cosine** distance.
2. **Serving** (`web/server.py`): loads the RAG engine once at startup. On each `/api/chat` request it retrieves the top-5 passages, prepends the current WebUI page as context, and streams `llama3.1:8b`'s answer token-by-token over SSE. Citations are derived from the retrieved passages (similarity ≥ 0.35); the fallback message suppresses citations.

## Verify it works

```powershell
venv\Scripts\python.exe test_query.py     # retrieval only
venv\Scripts\python.exe test_answers.py   # full RAG + LLM (needs Ollama running)
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `download_docs.ps1` returns 403 | Dell's CDN needs a browser User-Agent — the script already sets one. |
| `pip install` fails building `chroma-hnswlib` | Use **Python 3.11** (no prebuilt wheel for 3.13 on Windows). |
| Ingestion error: *"input exceeds context length"* | `nomic-embed-text` caps at 2048 tokens; `ingest.py` caps chunk text at 1800 chars. |
| Citations never show / scores look wrong | The ChromaDB collection must use `hnsw:space=cosine` (it does). |
| `model not found` at run time | Ensure Ollama serves with `OLLAMA_MODELS` pointed at `ollama\models` (START.bat sets this). |
| Page slow to first load | The RAG engine loads once at startup (~10–15s). |
| Answers take 10–20s | Expected on CPU with no GPU — this is the "fully local" trade-off. |

## Scope & limitations

- **Read-only.** No live cluster data, no PAPI calls, no actions — answers come purely from documentation.
- The WebUI is a **realistic mock** with sample data; it is not connected to a real cluster.
- The corpus is **OneFS 9.12** documentation. (See `deck/` for the feasibility study on integrating with real PowerScale and the broader Dell portfolio.)

## Credits

Built with Ollama, LlamaIndex, ChromaDB, and Flask. Documentation © Dell Technologies (official OneFS 9.12 manuals, used locally for retrieval).
