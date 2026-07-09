"""
PowerScale WebUI prototype — backend.

Serves a static replica of the OneFS Storage Administration console with an
embedded AI assistant. The assistant is backed by the local RAG engine
(Ollama + ChromaDB) built by ingest.py. Answers stream token-by-token over SSE.

Run:  python web/server.py     (or via START.bat)
"""
import json
from pathlib import Path

from flask import Flask, Response, request, send_from_directory

# ── Config ───────────────────────────────────────────────────────────────────
ROOT        = Path(__file__).parent
DB_DIR      = ROOT.parent / "app" / "chroma_db"
OLLAMA_URL  = "http://localhost:11434"
MODEL_NAME  = "llama3.2:3b"
EMBED_MODEL = "nomic-embed-text"
TOP_K       = 5
MIN_SCORE   = 0.35   # citations below this similarity are dropped

SYSTEM_PROMPT = """You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant embedded in the PowerScale WebUI.
Answer questions using ONLY the provided context from the official OneFS 9.12 documentation.
Be concise, accurate, and practical. If the answer includes steps, number them clearly.
Format any OneFS CLI commands as fenced code blocks using triple backticks.
When you refer to a location in the WebUI, name it as "Menu > Item" (for example, "Access > Access Zones" or "Protocols > Windows Sharing (SMB)").
If the context does not contain enough information to answer the question confidently, say:
"I don't have sufficient information in the loaded documentation to answer this accurately."
Never make up commands, configuration values, or procedures not present in the context."""

app = Flask(__name__)
_idx = None          # lazily-loaded vector index (shared)
_engines = {}        # per-product query engines: {"onefs": ..., "insightiq": ...}


def _ensure_index():
    """Build the shared vector index + models once."""
    global _idx
    if _idx is not None:
        return _idx

    from llama_index.core import VectorStoreIndex, Settings, StorageContext
    from llama_index.embeddings.ollama import OllamaEmbedding
    from llama_index.llms.ollama import Ollama
    from llama_index.vector_stores.chroma import ChromaVectorStore
    import chromadb

    Settings.embed_model = OllamaEmbedding(
        model_name=EMBED_MODEL, base_url=OLLAMA_URL, request_timeout=60.0,
    )
    Settings.llm = Ollama(
        model=MODEL_NAME, base_url=OLLAMA_URL, request_timeout=300.0,
        system_prompt=SYSTEM_PROMPT, context_window=8192,
        # Cap answer length (faster on CPU) and keep the model resident between
        # questions so there is no reload penalty at a booth.
        additional_kwargs={"num_predict": 500}, keep_alive="30m",
    )
    db  = chromadb.PersistentClient(path=str(DB_DIR))
    col = db.get_or_create_collection("onefs_docs")
    vs  = ChromaVectorStore(chroma_collection=col)
    _idx = VectorStoreIndex.from_vector_store(
        vs, storage_context=StorageContext.from_defaults(vector_store=vs)
    )
    return _idx


def get_engine(product="insightiq"):
    """Return a streaming query engine for the given product (cached).

    Hard wall: product="onefs" retrieves OneFS docs only (WebUI assistant);
    product="insightiq" retrieves everything (OneFS + InsightIQ) so that
    explain-alert (OneFS Event Reference) and performance answers both work.
    """
    if product in _engines:
        return _engines[product]
    idx = _ensure_index()
    filters = None
    if product == "onefs":
        from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
        filters = MetadataFilters(filters=[ExactMatchFilter(key="product", value="onefs")])
    _engines[product] = idx.as_query_engine(
        similarity_top_k=TOP_K, streaming=True, filters=filters)
    return _engines[product]


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
    import urllib.request
    try:
        urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=3)
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}, 503


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    question = data.get("question", "").strip()
    context  = data.get("context", "").strip()   # the WebUI page the user is on
    if not question:
        return {"error": "empty question"}, 400

    # Which assistant is asking? OneFS WebUI -> onefs-only wall; InsightIQ -> all.
    product = (data.get("product") or "").strip().lower()
    if product not in ("onefs", "insightiq"):
        product = "insightiq" if "insightiq" in context.lower() else "onefs"

    # Give the model (and retrieval) awareness of where the admin is in the WebUI,
    # so vague questions like "how do I configure this?" resolve to the page.
    query = question
    if context:
        # `context` is a product-qualified location string passed by the frontend
        # (e.g. "the Dashboard page of Dell PowerScale InsightIQ").
        query = f"(The user is currently viewing {context}.) {question}"

    def stream():
        try:
            engine = get_engine(product)
            resp = engine.query(query)

            # Source nodes are retrieved before the LLM runs — available now.
            sources, seen = [], set()
            for node in getattr(resp, "source_nodes", []):
                if node.score is not None and node.score < MIN_SCORE:
                    continue
                fn = node.node.metadata.get("file_name", "")
                if fn and fn not in seen:
                    seen.add(fn)
                    sources.append(prettify(fn))

            # Stream the answer tokens (and accumulate to detect the fallback).
            full = ""
            for token in resp.response_gen:
                full += token
                yield f"data: {json.dumps({'token': token})}\n\n"

            # If the model couldn't answer, don't show citations — it would
            # contradict the "no sufficient information" message.
            if "sufficient information" in full.lower():
                sources = []

            yield f"data: {json.dumps({'sources': sources, 'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return Response(stream(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


if __name__ == "__main__":
    print("Loading RAG engine...")
    get_engine("onefs")       # OneFS-walled (WebUI)
    get_engine("insightiq")   # unfiltered (InsightIQ)
    print("Ready. Serving PowerScale WebUI prototype at http://localhost:8501")
    app.run(host="127.0.0.1", port=8501, threaded=True)
