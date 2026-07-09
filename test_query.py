"""
Quick retrieval smoke test for the built ChromaDB.
Retrieval only (no LLM) — confirms the vector DB returns relevant chunks.
Usage: python test_query.py
"""
from pathlib import Path
import chromadb
from llama_index.core import VectorStoreIndex, Settings
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

DB_DIR = Path(__file__).parent / "app" / "chroma_db"
OLLAMA_URL = "http://localhost:11434"

Settings.llm = None
Settings.embed_model = OllamaEmbedding(
    model_name="nomic-embed-text",
    base_url=OLLAMA_URL,
    request_timeout=60.0,
    ollama_additional_kwargs={"num_ctx": 8192},
)

db = chromadb.PersistentClient(path=str(DB_DIR))
col = db.get_or_create_collection("onefs_docs")
print(f"Collection 'onefs_docs' has {col.count()} vectors\n")

vstore = ChromaVectorStore(chroma_collection=col)
index = VectorStoreIndex.from_vector_store(vstore)
retriever = index.as_retriever(similarity_top_k=5)

questions = [
    "How do I create an SMB share in OneFS 9.12?",
    "What network ports does NFS require to be open?",
    "What CLI command do I use to check cluster health?",
]

for q in questions:
    print("=" * 70)
    print(f"Q: {q}")
    nodes = retriever.retrieve(q)
    for i, n in enumerate(nodes, 1):
        src = n.metadata.get("file_name", "?")
        page = n.metadata.get("page_label", "?")
        snippet = " ".join(n.text.split())[:120]
        print(f"  [{i}] score={n.score:.3f}  {src} (p.{page})")
        print(f"      {snippet}...")
    print()
