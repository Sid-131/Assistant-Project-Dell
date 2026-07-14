# PowerScale Assistant

An **AI-assistant feature for Dell PowerScale**, built as a working local prototype across the two consoles an administrator lives in:

- **OneFS WebUI** (`/`) — answers OneFS administration & configuration questions.
- **InsightIQ** (`/insightiq`) — adds cluster performance answers and *"explain this alert."*

Answers are drawn **only from official Dell documentation**, with source citations, and everything runs **100% locally** — no internet, no cloud, nothing leaves the machine.

> This is a prototype of a product *feature* (an assistant embedded in the PowerScale consoles), not a standalone app. The local web app simulates how the assistant would appear inside the real console.

---

## What it does

- **Grounded Q&A** — answers come only from the official OneFS + InsightIQ manuals; it cites its sources and says *"I don't have sufficient information…"* instead of hallucinating.
- **Two embedded assistants, one engine** — the same backend serves both the OneFS WebUI replica and the InsightIQ replica.
- **Scope wall** — the WebUI assistant retrieves **OneFS docs only**; the InsightIQ assistant retrieves **OneFS + InsightIQ** docs (so it can both explain alerts *and* answer performance questions).
- **Performance redirect** — ask the WebUI a performance question and it doesn't bluff: it shows a card linking you to InsightIQ, where that lives.
- **Actionable answers** — click-to-navigate links, *explain this event/alert*, inline field helpers, and copyable `isi …` CLI blocks.

---

## Architecture

```
Browser ──http──> Flask app  (web/server_local.py, :8501)
                     │  serves web/index.html (OneFS WebUI) and web/insightiq.html
                     │  POST /api/chat  {question, context, product}  → SSE stream
                     ▼
             embed query (nomic-embed-text)
                     ▼
             ChromaDB  (app/chroma_db, cosine, collection "onefs_docs")
                     │  top-K passages, product-filtered:
                     │    product=onefs → OneFS docs only
                     │    product=insightiq → OneFS + InsightIQ docs
                     ▼
             LLM (qwen2.5:3b-instruct)  → grounded answer + citations → browser
```

**Two interchangeable engines, same prompt → same answers:**

| Engine | When | Notes |
|---|---|---|
| **in-process llama-cpp** (default) | CPU-only machines (the office/locked-down laptop) | LLM runs *inside* `python.exe` — no separate `.exe` for Device Guard / WDAC / AppLocker to block |
| **Ollama** (opt-in: `USE_OLLAMA=1`) | a machine with an NVIDIA GPU | offloads to the GPU (~13s answers vs minutes); falls back to in-process if Ollama isn't up or lacks the models |

The vector database is **pre-built and bundled** (`app/chroma_db/`), so the app never re-ingests at run time.

## Tech stack

| Layer | Choice |
|---|---|
| Chat model | `qwen2.5:3b-instruct` (reliably emits fenced CLI commands) |
| Embedding model | `nomic-embed-text` |
| LLM runtime | llama-cpp-python **0.2.90** (in-process, AVX2) *or* Ollama (GPU) |
| Vector store | ChromaDB 0.6 (cosine), product-tagged |
| Web backend | Flask 3.1 (SSE streaming) |
| Ingest | LlamaIndex 0.12 + pypdf (build-time only) |
| Frontend | single-file HTML/CSS/JS (`web/index.html`, `web/insightiq.html`) |
| Python | 3.11 |

---

## Run it

**CPU (default — the portable/locked-down path):**
```
Double-click  START.bat        →  http://localhost:8501
```

**GPU (fast, for demos/recording — needs Ollama + an NVIDIA GPU):**
```
Double-click  START-DEMO-GPU.bat
```
This forces Ollama's `cuda_v12` runner (the auto-picked `cuda_v13` crashes on Ampere), sets `USE_OLLAMA=1`, and serves the same app on the GPU.

> First answer after launch is a little slower while the model loads; ask one throwaway question to warm it up.

## Performance & tuning

CPU inference is dominated by **prompt "prefill"** (~40 tok/s), so context size is the main latency lever. The two engines are tuned differently, all overridable by env var:

| Setting | CPU default | GPU default | Meaning |
|---|---|---|---|
| `TOP_K` / `TOP_K_GPU` | 5 | 8 | passages retrieved |
| `PROMPT_CHARS` / `PROMPT_CHARS_GPU` | 1300 | 1800 | per-passage char cap (1800 = whole chunk) |
| `N_THREADS` | cores − 2 | — | CPU threads; leaves headroom for the OS / storage workload |
| `MAX_TOKENS` | 500 | 500 | answer length cap |

- **Getting the CLI command reliably needs the full excerpts** (`TOP_K=8 PROMPT_CHARS=1800`) — truncated excerpts clip `isi` commands off the end. On GPU that's the default (prefill is nearly free, ~13s). On CPU it costs ~2–3 min, so the CPU default stays at the faster `5 × 1300` (complete answers, CLI only sometimes). Set the two env vars to force CLI on CPU.
- **`N_THREADS` is a resource governor.** It leaves cores free rather than grabbing every one — the small-scale version of the "storage stays P0" guarantee for an on-cluster (PowerScale node) deployment. Pin it explicitly on a big node.
- Measured on an RTX 3050 6 GB: `qwen2.5:3b` ~13 s with CLI; `llama3.1:8b` ~47 s (only 26/33 layers fit 6 GB); `llama3.2:3b` fast but **never** emits CLI.

## First-time / fresh-machine setup

1. Install [Python 3.11](https://www.python.org/downloads/release/python-3119/); optionally [Ollama](https://ollama.com/download) for the GPU path.
2. `powershell -ExecutionPolicy Bypass -File download_docs.ps1`  (only if `docs/` is empty)
3. `Double-click SETUP.bat`  (venv, packages, models, vector DB)
4. `Double-click START.bat`

### Building from source (the llama-cpp constraint)
`llama-cpp-python` is **not** pinned in `requirements.txt` because the wheel is CPU-specific: pin **0.2.90** from the CPU wheel index. Newer wheels (0.3.32/0.3.33) are compiled with **AVX-512** and crash with `0xc000001d` on 12th/13th-gen Intel consumer CPUs.
```
pip install --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu llama-cpp-python==0.2.90
```

### Updating a bundle from a clone
On a machine that runs the unzipped bundle, `git pull` in the clone then run `UPDATE-FROM-CLONE.bat` — it pulls and copies the web app into the bundle. (The model + DB are gitignored and stay put.)

---

## Project structure

```
Smart Web UI/
├── README.md
├── requirements.txt            ← ingest/dev deps (serving needs only flask+chromadb+llama-cpp)
├── START.bat                   ← launch (CPU engine)
├── START-DEMO-GPU.bat          ← launch on GPU via Ollama (cuda_v12)
├── UPDATE-FROM-CLONE.bat       ← pull + copy web app into a bundle
├── SETUP.bat                   ← one-time setup
├── download_docs.ps1           ← download the OneFS PDFs
│
├── ingest.py                   ← build ChromaDB from docs/ (OneFS)
├── ingest_insightiq.py         ← add InsightIQ admin guide + performance reports
├── tag_products.py             ← tag every vector product=onefs|insightiq (the wall)
│
├── web/
│     ├── server_local.py       ← Flask backend, dual engine, SSE streaming
│     ├── index.html            ← OneFS WebUI replica + assistant
│     └── insightiq.html        ← InsightIQ replica + assistant
│
├── app/chroma_db/              ← pre-built vector DB (gitignored)
├── models_gguf/                ← GGUF weights (gitignored)
├── docs/                       ← official PDFs (gitignored; fetch via script)
│
├── diagrams/                   ← architecture + request-flow SVGs
├── demo/                       ← demo video script
├── deck/                       ← pitch / management decks (PptxGenJS)
└── management-doc/             ← management proposal (docx)
```

## Verify it works

```powershell
# health — reports which engine loaded
curl http://localhost:8501/api/health          # {"ok":true,"engine":"llamacpp"|"ollama"}

# one grounded answer (SSE)
curl -N -X POST http://localhost:8501/api/chat -H "Content-Type: application/json" ^
     -d "{\"question\":\"How do I create an SMB share in OneFS 9.12?\",\"product\":\"onefs\"}"
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `download_docs.ps1` returns 403 | Dell's CDN needs a browser User-Agent — the script sets one. |
| `pip install` fails building `chroma-hnswlib` | Use **Python 3.11** (no 3.13 Windows wheel). |
| `0xc000001d` on model load | AVX-512 llama-cpp wheel on a non-AVX-512 CPU — pin **0.2.90** (see above). |
| GPU present but Ollama crashes (`shared object initialization failed`) | Force the older runner: `set OLLAMA_LLM_LIBRARY=cuda_v12` (START-DEMO-GPU.bat does this). |
| Answers omit the `isi` CLI command | Feed full excerpts: `set TOP_K=8` and `set PROMPT_CHARS=1800`. |
| Answers take minutes on CPU | Expected — fully local on CPU. Use the GPU launcher, or accept it as the "nothing leaves the box" trade. |

## Scope & limitations

- **Read-only.** No live cluster data, no PAPI calls, no actions — answers come purely from documentation. The consoles are realistic mocks with sample data.
- Corpus is **OneFS 9.12** + **InsightIQ 6.2** documentation. (See `deck/` and `management-doc/` for the productization story.)

## Credits

Built with llama-cpp-python / Ollama, LlamaIndex, ChromaDB, and Flask. Documentation © Dell Technologies (used locally for retrieval).
