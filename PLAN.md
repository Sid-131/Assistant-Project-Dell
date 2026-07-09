# PowerScale AI Assistant — Implementation Plan
**Project:** Dell PowerScale OneFS 9.12 RAG Chatbot Demo  
**Deadline:** June 15, 2026  
**Purpose:** Internal Dell demo — a locally-running AI assistant embedded in the PowerScale WebUI concept that answers admin questions from official OneFS 9.12 documentation  
**Status:** Plan only — no code written yet

---

## 1. What We Are Building

A self-contained, offline RAG chatbot that:
- Answers PowerScale admin questions using official OneFS 9.12 documentation as its knowledge base
- Runs 100% locally — no internet required, no cloud calls, no data leaves the machine
- Ships as a single folder that can be copied to any Windows laptop and launched with one double-click
- Looks like a chat widget that could be embedded inside the PowerScale WebUI

The demo is not a full production implementation. It is a working prototype that proves the concept convincingly to a Dell internal audience.

---

## 2. Constraints

| Constraint | Detail |
|---|---|
| Deadline | June 15, 2026 |
| Target machine | Windows laptop, 16GB RAM, no GPU, office environment |
| Internet | Not required at demo time (everything bundled) |
| Admin rights | Not required to run the demo |
| LLM | Must run locally via Ollama |
| Documents | Dell PowerScale OneFS 9.12 official PDFs only |
| Scope | Read-only Q&A — no cluster actions, no PAPI calls |

---

## 3. Architecture

```
User (browser)
    |
    | http://localhost:8501
    v
Streamlit Chat UI  (app/app.py)
    |
    | Python function call
    v
RAG Query Engine  (LlamaIndex)
    |           |
    |           | vector similarity search
    |           v
    |       ChromaDB  (app/chroma_db/)   <-- pre-built from PDFs
    |           |
    |           | returns top-K chunks
    |           v
    |       Retrieved context
    |
    | prompt = system_prompt + context + question
    v
Ollama  (localhost:11434)
    |
    | runs llama3.1:8b model locally
    v
Answer text  -->  back to Streamlit UI
```

**Key design decision:** The Chroma vector database is built ONCE on the developer's machine during setup (ingest step), then the pre-built DB folder is included in the bundle. The demo laptop never needs to run ingestion — it just loads the existing DB and serves queries.

---

## 4. Tech Stack

| Layer | Choice | Version | Reason |
|---|---|---|---|
| LLM runtime | Ollama | Latest | Single binary, no install needed, runs llama models locally |
| LLM model | llama3.1:8b | Q4_K_M quant | Best quality/speed tradeoff on 16GB CPU-only |
| Embedding model | nomic-embed-text | via Ollama | Local, good for technical text, no separate process needed |
| RAG framework | LlamaIndex | 0.12.x | Better document RAG than LangChain, simpler API |
| Vector store | ChromaDB | 0.6.x | Pure Python, persistent to disk, no server needed |
| PDF parsing | LlamaIndex SimpleDirectoryReader | built-in | Uses pypdf under the hood, handles multi-page PDFs |
| Chat UI | Streamlit | 1.45.x | Fastest to build, single-file, looks clean |
| Backend glue | Python 3.11 | — | venv bundled with the app |

**Do not use:** LangChain, FastAPI (unnecessary for demo), any cloud API, Docker.

---

## 5. Complete File Structure

```
powerscale-demo/                   <-- root folder, copy this entire thing
│
├── PLAN.md                        <-- this file
├── requirements.txt               <-- Python dependencies
│
├── download_docs.ps1              <-- Step 1: downloads all PDFs from Dell
├── SETUP.bat                      <-- Step 2: creates venv, installs packages, runs ingestion
├── START.bat                      <-- Step 3 (demo day): starts Ollama + Streamlit, opens browser
│
├── ingest.py                      <-- standalone script: reads PDFs → builds chroma_db
│
├── ollama/                        <-- Ollama binary + models (bundled)
│     ├── ollama.exe               <-- copied from %LOCALAPPDATA%\Programs\Ollama\
│     └── models/                  <-- model weights pulled here (controlled by OLLAMA_MODELS env var)
│           ├── llama3.1:8b        <-- ~5GB
│           └── nomic-embed-text   <-- ~274MB
│
├── docs/                          <-- OneFS 9.12 PDF corpus (downloaded by download_docs.ps1)
│     ├── onefs-9120-web-admin-guide.pdf
│     ├── onefs-9120-cli-admin-guide.pdf
│     ├── onefs-9120-cli-command-reference.pdf
│     ├── onefs-9120-security-config-guide.pdf
│     ├── onefs-9120-technical-specs.pdf
│     ├── onefs-9120-backup-recovery-guide.pdf
│     ├── onefs-9120-cloudpools-admin-guide.pdf
│     ├── onefs-hdfs-config-guide.pdf
│     ├── onefs-event-reference.pdf
│     ├── onefs-upgrade-planning-guide.pdf
│     └── onefs-supportability-compatibility-guide.pdf
│
├── venv/                          <-- Python virtual environment (created by SETUP.bat)
│     └── Scripts/
│           ├── python.exe
│           └── ... (all installed packages)
│
└── app/                           <-- the actual application
      ├── app.py                   <-- Streamlit chat UI (main entry point)
      └── chroma_db/               <-- pre-built vector DB (created by ingest.py, bundled)
```

**Total bundle size when complete:** ~7GB (dominated by the llama3.1:8b model weights)

---

## 6. Document Sources (PDF URLs)

All PDFs are publicly accessible from Dell's CDN — no login required except Release Notes.

| Document | Priority | URL |
|---|---|---|
| Web Administration Guide | HIGH | https://dl.dell.com/content/manual61406859-powerscale-onefs-9-12-0-0-web-administration-guide.pdf |
| CLI Administration Guide | HIGH | https://dl.dell.com/content/manual60806629-powerscale-onefs-9-12-0-0-cli-administration-guide.pdf |
| CLI Command Reference | HIGH | https://dl.dell.com/content/manual51938935-powerscale-onefs-9-12-0-0-cli-command-reference.pdf |
| Security Configuration Guide | HIGH | https://dl.dell.com/content/manual53532926-powerscale-onefs-9-12-0-0-security-configuration-guide.pdf |
| Technical Specifications Guide | MED | https://dl.dell.com/content/manual28144700-powerscale-onefs-9-12-0-0-technical-specifications-guide.pdf |
| Backup and Recovery Guide | MED | https://dl.dell.com/content/manual28412948-powerscale-onefs-9-12-0-0-backup-and-recovery-guide.pdf |
| CloudPools Administration Guide | MED | https://dl.dell.com/content/manual27693880-powerscale-onefs-9-12-0-0-cloudpools-administration-guide.pdf |
| HDFS Configuration Guide | LOW | https://dl.dell.com/content/manual31880569-powerscale-onefs-hdfs-configuration-guide.pdf |
| Event Reference Guide | LOW | https://dl.dell.com/content/manual73474568-powerscale-onefs-event-reference-guide.pdf |
| Upgrade Planning Guide | LOW | https://dl.dell.com/content/manual81478978-powerscale-onefs-upgrade-planning-and-process-guide.pdf |
| Supportability & Compatibility Guide | LOW | https://dl.dell.com/content/manual45268461-powerscale-onefs-supportability-and-compatibility-guide.pdf |

**Source hub:** https://www.dell.com/support/kbdoc/en-us/000355502/onefs-9-12-0-0-documentation-powerscale-info-hub

---

## 7. Implementation Steps (in order)

### Step 1 — download_docs.ps1

A PowerShell script that downloads all PDFs listed in Section 6 into the `docs/` folder.

Requirements:
- Uses `System.Net.WebClient` for downloads (works without admin rights)
- Skips files that already exist and are non-zero size
- Prints progress: document name, MB downloaded
- Prints a summary at the end: N downloaded, N failed
- Note on Release Notes: they require Dell account login — skip them, not needed for RAG

### Step 2 — requirements.txt

Pin these exact packages:
- llama-index (core)
- llama-index-vector-stores-chroma
- llama-index-embeddings-ollama
- llama-index-llms-ollama
- llama-index-readers-file
- chromadb
- streamlit

Use currently stable versions compatible with each other. Do not pin overly tightly — allow patch version flexibility.

### Step 3 — ingest.py

A standalone Python script. Run once. Does not start a server.

Logic:
1. Check Ollama is reachable at http://localhost:11434 — exit with clear error if not
2. Check `docs/` folder has at least one PDF — exit with clear error if not
3. Load all PDFs from `docs/` using LlamaIndex `SimpleDirectoryReader` with `filename_as_id=True`
4. Configure embedding model: `OllamaEmbedding` with `nomic-embed-text`
5. Set `Settings.llm = None` (no LLM needed at ingestion time)
6. Chunk documents using `SentenceSplitter` with `chunk_size=512`, `chunk_overlap=64`
7. Create a `PersistentClient` ChromaDB at `app/chroma_db/`
8. Get or create a collection named `"onefs_docs"`
9. Build a `VectorStoreIndex` from the nodes, persisting to Chroma
10. Print progress at each step and final summary (number of chunks indexed)

Important: store `file_name` in node metadata so the UI can show source citations.

### Step 4 — app/app.py

A single-file Streamlit application. No separate backend.

#### Layout
- Full-width layout
- Header bar styled in Dell blue (#0076CE) with "PowerScale AI Assistant" title and "OneFS 9.12 · Running locally" subtitle
- Left sidebar: suggested questions as clickable buttons, a status check button for Ollama, a clear chat button
- Main area: chat message history + chat input at the bottom

#### RAG engine setup
- Use `@st.cache_resource` so the engine loads once and persists across rerenders
- Load ChromaDB from `app/chroma_db/` — if it doesn't exist, show a clear setup error and stop
- Configure `OllamaEmbedding` with `nomic-embed-text`
- Configure `Ollama` LLM with `llama3.1:8b`, `request_timeout=300`, `context_window=8192`
- Build `VectorStoreIndex` from the loaded vector store
- Create a query engine with `similarity_top_k=5`

#### System prompt (pass to LLM)
```
You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant.
Answer questions using ONLY the provided context from the official OneFS 9.12 documentation.
Be concise, accurate, and practical. If the answer includes steps, number them clearly.
If the context does not contain enough information to answer the question confidently, say:
"I don't have sufficient information in the loaded documentation to answer this accurately."
Never make up commands, configuration values, or procedures not present in the context.
```

#### Chat message handling
- Session state holds list of messages: `{role, content, sources}`
- On user question: append to messages, query the engine, get response and source nodes
- Extract source file names from node metadata, deduplicate, prettify (strip prefix/extension)
- Only show sources where node similarity score >= 0.35
- If no sources pass the threshold AND answer is empty: return the fallback "I don't have sufficient information" message
- Append assistant message with answer + sources to session state
- Rerun to update UI

#### Chat bubble styling
- User messages: right-aligned, Dell blue background, white text
- Assistant messages: left-aligned, white background, light border
- Source citations: small grey tags below each assistant message showing document name

#### Suggested starter questions (in sidebar)
1. "How do I create an SMB share in OneFS 9.12?"
2. "What are the default quota grace period settings?"
3. "How do I add a node to a PowerScale cluster?"
4. "What network ports does NFS require?"
5. "How do I configure an access zone?"
6. "What is SmartPools and how does it work?"

### Step 5 — SETUP.bat

One-time setup script. Run on the developer's machine before bundling.

Logic:
1. Check `python` is available — if not, print download link and exit
2. If `venv/` doesn't exist, create it with `python -m venv venv`
3. Run `venv\Scripts\pip install -r requirements.txt`
4. Check `ollama\ollama.exe` exists — if not, print instructions to copy it from `%LOCALAPPDATA%\Programs\Ollama\` and exit
5. Set `OLLAMA_MODELS` env var to `%ROOT%\ollama\models`
6. Start Ollama, wait 4 seconds
7. Pull `llama3.1:8b` and `nomic-embed-text` models
8. Check `docs\*.pdf` exists — if not, tell user to run `download_docs.ps1` first and exit
9. Run `venv\Scripts\python.exe ingest.py`
10. Print "Setup complete. Run START.bat to launch."

### Step 6 — START.bat

Demo day launcher. Double-click to start everything.

Logic:
1. Set `OLLAMA_MODELS=%ROOT%\ollama\models`
2. Set `OLLAMA_HOST=127.0.0.1:11434`
3. Start `ollama\ollama.exe serve` in background (`start /B`)
4. Wait 5 seconds for Ollama to be ready
5. Open `http://localhost:8501` in default browser
6. Run Streamlit using `venv\Scripts\python.exe -m streamlit run app\app.py` with flags:
   - `--server.port 8501`
   - `--server.headless true`
   - `--browser.gatherUsageStats false`

**Critical:** Call `venv\Scripts\python.exe` directly, not `venv\Scripts\streamlit.exe`. This avoids broken absolute paths when the folder is moved to a different machine or drive letter.

---

## 8. Chunking Strategy

This is the single most important quality factor. Use these settings:

- **Splitter:** `SentenceSplitter` (not fixed-size token splitter)
- **chunk_size:** 512 tokens
- **chunk_overlap:** 64 tokens
- **Why:** Technical docs have answers in heading + paragraph + table combinations. Sentence-aware splitting keeps these together better than fixed splits.
- **Metadata to preserve per chunk:** `file_name`, `page_label` (if available from PDF reader)

---

## 9. Ollama Portability — Critical Detail

By default, Ollama stores models in `%USERPROFILE%\.ollama\models`. To make the bundle self-contained, the `OLLAMA_MODELS` environment variable must be set to `ollama\models` inside the project folder BEFORE calling any Ollama commands. Both SETUP.bat and START.bat must do this.

To get `ollama.exe`:
- After installing Ollama normally on the developer's machine, find it at: `%LOCALAPPDATA%\Programs\Ollama\ollama.exe`
- Copy it to `powerscale-demo\ollama\ollama.exe`

---

## 10. What the Demo Must Successfully Answer

These are the test questions. The bot must answer all of these correctly before the demo is considered ready:

1. "How do I create an SMB share in OneFS 9.12?" — from Web Admin Guide
2. "What are the default quota grace period settings?" — from Web Admin Guide / CLI Admin Guide
3. "How do I add a node to a PowerScale cluster?" — from Web Admin Guide
4. "What network ports does NFS require to be open?" — from Security Config Guide / Web Admin Guide
5. "How do I configure an access zone?" — from Web Admin Guide
6. "What is SmartPools and how does it work?" — from Web Admin Guide
7. "What CLI command do I use to check cluster health?" — from CLI Admin Guide / CLI Command Reference
8. One out-of-scope question (e.g. "What is the price of a PowerScale F600?") — must return the fallback message, not hallucinate

---

## 11. Known Gotchas

| Issue | Fix |
|---|---|
| venv breaks when folder is moved | Call `python.exe` directly, never `activate` the venv in the bat files |
| Ollama models go to wrong folder | Always set `OLLAMA_MODELS` env var before `ollama serve` |
| PDF pages with only images/diagrams | Accept this — those pages won't be indexed, skip gracefully |
| Slow response on CPU | Expected: 10–20 sec on llama3.1:8b without GPU. Frame it as "running fully locally" |
| Streamlit reruns on every state change | Use `st.session_state` correctly, call `st.rerun()` only after appending messages |
| ChromaDB version conflicts | Stick to chromadb 0.6.x — newer versions changed the API significantly |
| LlamaIndex version fragmentation | Use `llama-index` meta-package to avoid sub-package version mismatches |

---

## 12. Out of Scope (Do Not Build)

- PAPI integration or any live cluster data
- User authentication
- Multi-user support
- Conversation memory across sessions (session memory within one session is fine)
- Reranking (nice to have but not needed for demo timeline)
- Hybrid search (nice to have but not needed for demo timeline)
- Any deployment beyond a local Windows folder
- Docker
- FastAPI or any separate backend process

---

## 13. Day-by-Day Build Order

**Day 1 (June 11):**
- `download_docs.ps1` — download all PDFs
- `requirements.txt` — pin dependencies
- `ingest.py` — build the vector DB, verify it works with a raw Python query

**Day 2 (June 12):**
- `app/app.py` — build the full Streamlit UI end to end
- Test all 8 demo questions, check response quality

**Day 3 (June 13):**
- `SETUP.bat` + `START.bat` — automation scripts
- Full end-to-end test: fresh folder, run SETUP, run START, verify browser opens and bot works
- Fix any chunking or quality issues found in Day 2 testing

**Day 4 (June 14):**
- Bundle: copy `ollama.exe` + models into folder, verify START.bat works standalone
- Polish UI: branding, error messages, sidebar copy
- Run all 8 test questions one final time
- Prepare demo script (what to say, what to click)

**June 15:** Demo
