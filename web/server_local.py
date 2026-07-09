"""
PowerScale AI Assistant — in-process backend (no Ollama).

Runs the LLM and the embedding model *inside* this Python process via
llama-cpp-python, so there is no separate executable for application-control
policies (Device Guard / WDAC / AppLocker) to block. Serves both prototypes:

    /            OneFS WebUI assistant
    /insightiq   InsightIQ assistant

Run:  python web/server_local.py
"""
import json
import os
import threading
from pathlib import Path

from flask import Flask, Response, request, send_from_directory

ROOT      = Path(__file__).parent
MODELS    = ROOT.parent / "models_gguf"
LLM_PATH  = MODELS / "llama3.2-3b-instruct.Q4_K_M.gguf"
EMB_PATH  = MODELS / "nomic-embed-text.f16.gguf"
DB_DIR    = ROOT.parent / "app" / "chroma_db"
TOP_K        = 5
MIN_SCORE    = 0.35
PROMPT_CHARS = 1300   # cap each excerpt fed to the LLM (less prefill = faster on CPU)

SYSTEM_PROMPT = (
    "You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant.\n"
    "Answer using ONLY the provided documentation excerpts. Be concise, accurate, and practical. "
    "If the answer includes steps, number them clearly. Format any OneFS CLI commands as fenced code blocks "
    "using triple backticks. When you refer to a location in the UI, name it as \"Menu > Item\".\n"
    "If the excerpts do not contain enough information to answer confidently, say exactly: "
    "\"I don't have sufficient information in the loaded documentation to answer this accurately.\" "
    "Never invent commands, values, or procedures that are not in the excerpts."
)

app = Flask(__name__)
_llm = None
_emb = None
_col = None
_load_lock = threading.Lock()


def _load():
    global _llm, _emb, _col
    if _llm is not None:
        return
    # Guard against concurrent loads (background warm-up thread + first request).
    with _load_lock:
        if _llm is not None:
            return
        _load_models()


def _load_models():
    global _llm, _emb, _col
    from llama_cpp import Llama
    import chromadb

    n_threads = max(2, (os.cpu_count() or 4))
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
    r = _emb.create_embedding(text)
    return r["data"][0]["embedding"]


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
    return {"ok": _llm is not None}


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
            # 1) retrieve
            qv = _embed(question)
            res = _col.query(query_embeddings=[qv], n_results=TOP_K, where=where,
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

            # 2) generate (streamed)
            full = ""
            for chunk in _llm.create_chat_completion(
                messages=[{"role": "system", "content": SYSTEM_PROMPT},
                          {"role": "user", "content": user_msg}],
                stream=True, temperature=0.2, max_tokens=500,
            ):
                delta = chunk["choices"][0]["delta"].get("content")
                if delta:
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
    # Warm the models in the background so the pages serve instantly while the
    # model loads. It then stays resident for the whole process lifetime, so
    # every answer (including the first) is fast — no per-question reload.
    print("Serving PowerScale WebUI + InsightIQ at http://localhost:8501")
    print("(loading the AI model in the background — first answer is ready in ~15-20s)")
    threading.Thread(target=_load, daemon=True).start()
    app.run(host="127.0.0.1", port=8501, threaded=True)
