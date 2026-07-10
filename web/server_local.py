"""
PowerScale AI Assistant — backend for both prototypes.

    /            OneFS WebUI assistant
    /insightiq   InsightIQ assistant

Picks its engine automatically:

  * Ollama (http://localhost:11434) if it is running — uses the GPU, so a full
    cited answer comes back in ~12s instead of minutes.
  * llama-cpp-python in-process otherwise — the LLM runs *inside* this Python
    process, so there is no separate executable for application-control policies
    (Device Guard / WDAC / AppLocker) to block. This is the office-laptop path.

Either way the prompt is identical, so the answers are identical.

Run:  python web/server_local.py
"""
import json
import os
import threading
import urllib.request
from pathlib import Path

from flask import Flask, Response, request, send_from_directory

ROOT      = Path(__file__).parent
MODELS    = ROOT.parent / "models_gguf"
LLM_PATH  = MODELS / "llama3.2-3b-instruct.Q4_K_M.gguf"
EMB_PATH  = MODELS / "nomic-embed-text.f16.gguf"
DB_DIR    = ROOT.parent / "app" / "chroma_db"
TOP_K        = int(os.environ.get("TOP_K", "5"))      # CPU engine: prefill is expensive
TOP_K_GPU    = int(os.environ.get("TOP_K_GPU", "10")) # Ollama/GPU: prefill ~1775 tok/s, so
                                                      # retrieve more — richer, fuller answers
MIN_SCORE    = 0.35
PROMPT_CHARS = 1300   # cap each excerpt fed to the LLM (less prefill = faster on CPU)
MAX_TOKENS   = 500

OLLAMA_URL         = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_CHAT_MODEL  = os.environ.get("OLLAMA_CHAT_MODEL", "llama3.2:3b")
OLLAMA_EMBED_MODEL = "nomic-embed-text"
# 8k suits the 3B (fits entirely in VRAM). A 7B/8B needs 4096 to keep more
# layers on a 6GB GPU — set OLLAMA_NUM_CTX=4096 when using a bigger model.
OLLAMA_NUM_CTX     = int(os.environ.get("OLLAMA_NUM_CTX", "8192"))

SYSTEM_PROMPT = (
    "You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant.\n"
    "Answer using ONLY the provided documentation excerpts. Be thorough, accurate, and practical. "
    "If the answer includes steps, number them clearly. When you refer to a location in the UI, "
    "name it as \"Menu > Item\".\n"
    "IMPORTANT: if the excerpts contain a relevant OneFS CLI command (for example one starting with "
    "\"isi \"), you MUST also show it, copied verbatim from the excerpts, in a fenced code block using "
    "triple backticks. Give both the WebUI steps and the CLI command whenever both are available.\n"
    "If the excerpts do not contain enough information to answer confidently, say exactly: "
    "\"I don't have sufficient information in the loaded documentation to answer this accurately.\" "
    "Never invent commands, values, or procedures that are not in the excerpts."
)

app = Flask(__name__)
_llm = None
_emb = None
_col = None
_backend = None          # "ollama" | "llamacpp"
_load_lock = threading.Lock()


def _ollama_up() -> bool:
    try:
        urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=2)
        return True
    except Exception:
        return False


def _post(path: str, payload: dict, timeout: int = 300):
    req = urllib.request.Request(f"{OLLAMA_URL}{path}",
                                 data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=timeout)


def _load():
    if _backend is not None:
        return
    # Guard against concurrent loads (background warm-up thread + first request).
    with _load_lock:
        if _backend is not None:
            return
        _load_models()


def _load_models():
    global _llm, _emb, _col, _backend
    import chromadb

    if _ollama_up():
        _backend = "ollama"
        print(f"Engine: Ollama at {OLLAMA_URL} (GPU if available) — model {OLLAMA_CHAT_MODEL}")
    else:
        _backend = "llamacpp"
        from llama_cpp import Llama
        n_threads = max(2, (os.cpu_count() or 4))
        print("Engine: in-process llama-cpp (CPU)")
        print("Loading embedding model...")
        _emb = Llama(model_path=str(EMB_PATH), embedding=True, n_ctx=2048,
                     n_threads=n_threads, verbose=False)
        print("Loading language model (llama3.2:3b)... this takes a moment")
        _llm = Llama(model_path=str(LLM_PATH), n_ctx=8192, n_threads=n_threads,
                     chat_format="llama-3", verbose=False)

    db = chromadb.PersistentClient(path=str(DB_DIR))
    _col = db.get_or_create_collection("onefs_docs")
    print("Ready.")


def _embed(text: str):
    if _backend == "ollama":
        r = json.load(_post("/api/embeddings",
                            {"model": OLLAMA_EMBED_MODEL, "prompt": text}, timeout=60))
        return r["embedding"]
    return _emb.create_embedding(text)["data"][0]["embedding"]


def _stream_answer(system: str, user: str):
    """Yield answer text chunks. Same prompt on both engines."""
    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    if _backend == "ollama":
        resp = _post("/api/chat", {
            "model": OLLAMA_CHAT_MODEL, "stream": True, "messages": messages,
            "options": {"temperature": 0.2, "num_predict": MAX_TOKENS, "num_ctx": OLLAMA_NUM_CTX},
        })
        for line in resp:
            line = line.strip()
            if not line:
                continue
            ev = json.loads(line)
            tok = (ev.get("message") or {}).get("content")
            if tok:
                yield tok
            if ev.get("done"):
                break
    else:
        for chunk in _llm.create_chat_completion(
                messages=messages, stream=True, temperature=0.2, max_tokens=MAX_TOKENS):
            tok = chunk["choices"][0]["delta"].get("content")
            if tok:
                yield tok


def prettify(fname: str) -> str:
    return (fname.replace("onefs-9120-", "").replace("onefs-", "")
                 .replace("-", " ").replace(".pdf", "").title())


# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/insightiq")
def insightiq():
    return send_from_directory(ROOT, "insightiq.html")


@app.route("/api/health")
def health():
    return {"ok": _col is not None, "engine": _backend}


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    question = (data.get("question") or "").strip()
    context  = (data.get("context") or "").strip()
    if not question:
        return {"error": "empty question"}, 400

    # Hard wall: the OneFS WebUI assistant retrieves OneFS docs only; the
    # InsightIQ assistant retrieves everything (OneFS + InsightIQ) so that
    # explain-alert (OneFS Event Reference) and performance answers both work.
    product = (data.get("product") or "").strip().lower()
    if product not in ("onefs", "insightiq"):
        product = "insightiq" if "insightiq" in context.lower() else "onefs"
    where = {"product": "onefs"} if product == "onefs" else None

    def stream():
        try:
            _load()
            # 1) retrieve (more excerpts on the GPU, where prefill is nearly free)
            k = TOP_K_GPU if _backend == "ollama" else TOP_K
            qv = _embed(question)
            res = _col.query(query_embeddings=[qv], n_results=k, where=where,
                             include=["documents", "metadatas", "distances"])
            docs   = res["documents"][0]
            metas  = res["metadatas"][0]
            dists  = res["distances"][0]

            sources, seen, excerpts = [], set(), []
            for doc, meta, dist in zip(docs, metas, dists):
                sim = 1.0 - float(dist)
                excerpts.append(doc)
                fn = (meta or {}).get("file_name", "")
                if sim >= MIN_SCORE and fn and fn not in seen:
                    seen.add(fn)
                    sources.append(prettify(fn))

            ctx_block = "\n\n---\n\n".join(d[:PROMPT_CHARS] for d in excerpts)
            loc = f"(The user is currently viewing {context}.)\n" if context else ""
            user_msg = (f"{loc}Use ONLY these OneFS documentation excerpts to answer.\n\n"
                        f"{ctx_block}\n\nQuestion: {question}")

            # 2) generate (streamed) — same prompt on Ollama/GPU or llama-cpp/CPU
            full = ""
            for delta in _stream_answer(SYSTEM_PROMPT, user_msg):
                full += delta
                yield f"data: {json.dumps({'token': delta})}\n\n"

            if "sufficient information" in full.lower():
                sources = []
            yield f"data: {json.dumps({'sources': sources, 'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return Response(stream(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


if __name__ == "__main__":
    # Warm up in the background so the pages serve instantly. On Ollama this is
    # near-instant; on the CPU engine the model loads once and stays resident,
    # so every answer (including the first) avoids a reload.
    print("Serving PowerScale WebUI + InsightIQ at http://localhost:8501")
    print("(warming up in the background...)")
    threading.Thread(target=_load, daemon=True).start()
    app.run(host="127.0.0.1", port=8501, threaded=True)
