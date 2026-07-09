"""
End-to-end RAG+LLM smoke test — mirrors app.py's engine setup.
Tests a few demo questions plus the out-of-scope fallback.
Usage: python test_answers.py
"""
from pathlib import Path
import chromadb
from llama_index.core import VectorStoreIndex, Settings, StorageContext
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.vector_stores.chroma import ChromaVectorStore

OLLAMA_URL = "http://localhost:11434"
DB_DIR = Path(__file__).parent / "app" / "chroma_db"
MIN_SCORE = 0.35

SYSTEM_PROMPT = """You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant.
Answer questions using ONLY the provided context from the official OneFS 9.12 documentation.
Be concise, accurate, and practical. If the answer includes steps, number them clearly.
If the context does not contain enough information to answer the question confidently, say:
"I don't have sufficient information in the loaded documentation to answer this accurately."
Never make up commands, configuration values, or procedures not present in the context."""

Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text", base_url=OLLAMA_URL, request_timeout=60.0)
Settings.llm = Ollama(model="llama3.1:8b", base_url=OLLAMA_URL, request_timeout=300.0,
                      system_prompt=SYSTEM_PROMPT, context_window=8192)

db = chromadb.PersistentClient(path=str(DB_DIR))
col = db.get_or_create_collection("onefs_docs")
vs = ChromaVectorStore(chroma_collection=col)
idx = VectorStoreIndex.from_vector_store(vs, storage_context=StorageContext.from_defaults(vector_store=vs))
engine = idx.as_query_engine(similarity_top_k=5, streaming=False)

questions = [
    "How do I create an SMB share in OneFS 9.12?",
    "What CLI command do I use to check cluster health?",
    "What is the price of a Dell PowerScale F600?",   # out-of-scope -> must fall back
]

for q in questions:
    print("=" * 72)
    print(f"Q: {q}")
    resp = engine.query(q)
    ans = str(resp).strip()
    srcs = []
    for n in getattr(resp, "source_nodes", []):
        if n.score is not None and n.score < MIN_SCORE:
            continue
        fn = n.node.metadata.get("file_name", "")
        if fn and fn not in srcs:
            srcs.append(fn)
    print(f"A: {ans}")
    print(f"   top_score={resp.source_nodes[0].score:.3f}  sources={srcs}")
    print()
