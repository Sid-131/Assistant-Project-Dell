"""
PowerScale OneFS 9.12 AI Assistant
Streamlit chat UI with local RAG (Ollama + ChromaDB)
"""

import streamlit as st
from pathlib import Path
import sys

# ── Page config ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="PowerScale AI Assistant",
    page_icon="🗄️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Dell / PowerScale brand styles ─────────────────────────────────────────
st.markdown("""
<style>
  /* Dell blue header bar */
  [data-testid="stAppViewContainer"] > .main { background: #f5f6f8; }
  .dell-header {
      background: #0076CE;
      color: white;
      padding: 14px 24px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
  }
  .dell-header h1 { margin: 0; font-size: 1.3rem; font-weight: 600; }
  .dell-header span { font-size: 0.85rem; opacity: 0.85; }

  /* Chat bubbles */
  .user-msg {
      background: #0076CE; color: white;
      padding: 10px 16px; border-radius: 18px 18px 4px 18px;
      margin: 6px 0; max-width: 75%; float: right; clear: both;
  }
  .bot-msg {
      background: white; color: #1a1a1a;
      padding: 10px 16px; border-radius: 18px 18px 18px 4px;
      margin: 6px 0; max-width: 85%; float: left; clear: both;
      border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .source-tag {
      font-size: 0.72rem; color: #666;
      background: #f0f4ff; border: 1px solid #ccd7f5;
      border-radius: 4px; padding: 2px 7px; margin: 2px 2px 0 0;
      display: inline-block;
  }
  .clearfix { clear: both; }
  div[data-testid="stChatInput"] textarea { border-radius: 24px !important; }
</style>
""", unsafe_allow_html=True)

# ── Constants ───────────────────────────────────────────────────────────────
OLLAMA_URL  = "http://localhost:11434"
DB_DIR      = Path(__file__).parent / "chroma_db"
MODEL_NAME  = "llama3.1:8b"
EMBED_MODEL = "nomic-embed-text"
TOP_K       = 5
MIN_SCORE   = 0.35   # below this → "not enough info"

SUGGESTED = [
    "How do I create an SMB share in OneFS 9.12?",
    "What are the default quota grace period settings?",
    "How do I add a node to an existing PowerScale cluster?",
    "What network ports does NFS require?",
    "How do I configure an access zone?",
    "What is SmartPools and how does it work?",
]

SYSTEM_PROMPT = """You are an expert Dell PowerScale / OneFS 9.12 storage administrator assistant.
Answer questions using ONLY the provided context from the official OneFS 9.12 documentation.
Be concise, accurate, and practical. If the answer includes steps, number them clearly.
If the context does not contain enough information to answer the question confidently, say:
"I don't have sufficient information in the loaded documentation to answer this accurately."
Never make up commands, configuration values, or procedures not present in the context."""

# ── RAG setup (cached) ──────────────────────────────────────────────────────
@st.cache_resource(show_spinner="Loading AI assistant...")
def load_rag():
    try:
        from llama_index.core import VectorStoreIndex, Settings
        from llama_index.embeddings.ollama import OllamaEmbedding
        from llama_index.llms.ollama import Ollama
        from llama_index.vector_stores.chroma import ChromaVectorStore
        from llama_index.core import StorageContext
        import chromadb

        if not DB_DIR.exists():
            return None, "chroma_db not found — run ingest.py first"

        embed = OllamaEmbedding(
            model_name=EMBED_MODEL,
            base_url=OLLAMA_URL,
            request_timeout=60.0,
        )
        llm = Ollama(
            model=MODEL_NAME,
            base_url=OLLAMA_URL,
            request_timeout=300.0,
            system_prompt=SYSTEM_PROMPT,
            context_window=8192,
        )
        Settings.embed_model = embed
        Settings.llm         = llm

        db  = chromadb.PersistentClient(path=str(DB_DIR))
        col = db.get_or_create_collection("onefs_docs")
        vs  = ChromaVectorStore(chroma_collection=col)
        ctx = StorageContext.from_defaults(vector_store=vs)
        idx = VectorStoreIndex.from_vector_store(vs, storage_context=ctx)

        engine = idx.as_query_engine(
            similarity_top_k=TOP_K,
            streaming=False,
        )
        return engine, None
    except Exception as e:
        return None, str(e)

# ── Header ──────────────────────────────────────────────────────────────────
st.markdown("""
<div class="dell-header">
  <div>🗄️</div>
  <div>
    <h1>PowerScale AI Assistant</h1>
    <span>OneFS 9.12 · Powered by local AI · No internet required</span>
  </div>
</div>
""", unsafe_allow_html=True)

# ── Sidebar ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 💡 Try asking...")
    for q in SUGGESTED:
        if st.button(q, use_container_width=True, key=q):
            st.session_state.pending_question = q

    st.divider()
    st.markdown("### ⚙️ Status")
    if st.button("🔄 Check Ollama", use_container_width=True):
        import urllib.request
        try:
            urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=3)
            st.success("Ollama running")
        except Exception:
            st.error("Ollama not running")

    if st.button("🗑️ Clear chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    st.divider()
    st.caption("Sources: Dell PowerScale OneFS 9.12 official documentation")
    st.caption("Running fully locally — no data leaves your machine")

# ── Session state ────────────────────────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = []

# ── Load RAG engine ──────────────────────────────────────────────────────────
engine, error = load_rag()

if error:
    st.error(f"**Setup required:** {error}")
    st.info("1. Run `download_docs.ps1` to download documentation\n2. Run `python ingest.py` to build the knowledge base\n3. Make sure Ollama is running with `ollama serve`")
    st.stop()

# ── Chat history ─────────────────────────────────────────────────────────────
chat_container = st.container()
with chat_container:
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            st.markdown(f'<div class="user-msg">{msg["content"]}</div><div class="clearfix"></div>', unsafe_allow_html=True)
        else:
            sources_html = ""
            if msg.get("sources"):
                tags = "".join(f'<span class="source-tag">📄 {s}</span>' for s in msg["sources"])
                sources_html = f"<div style='margin-top:8px'>{tags}</div>"
            st.markdown(
                f'<div class="bot-msg">{msg["content"]}{sources_html}</div><div class="clearfix"></div>',
                unsafe_allow_html=True
            )

# ── Input + response ──────────────────────────────────────────────────────────
question = st.chat_input("Ask anything about OneFS 9.12 administration...")

# Handle sidebar button click
if "pending_question" in st.session_state:
    question = st.session_state.pop("pending_question")

if question:
    st.session_state.messages.append({"role": "user", "content": question})

    with st.spinner("Searching documentation and generating answer..."):
        try:
            response = engine.query(question)

            # Extract answer text
            answer = str(response).strip()

            # Extract source file names
            sources = []
            if hasattr(response, "source_nodes"):
                seen = set()
                for node in response.source_nodes:
                    if node.score is not None and node.score < MIN_SCORE:
                        continue
                    fname = ""
                    if hasattr(node.node, "metadata"):
                        fname = node.node.metadata.get("file_name", "")
                    if fname and fname not in seen:
                        # Prettify filename
                        label = fname.replace("onefs-9120-", "").replace("-", " ").replace(".pdf", "").title()
                        sources.append(label)
                        seen.add(fname)

            # Confidence gate
            if not sources and not answer:
                answer = "I don't have sufficient information in the loaded documentation to answer this accurately."

            st.session_state.messages.append({
                "role": "assistant",
                "content": answer,
                "sources": sources,
            })

        except Exception as e:
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"Error generating response: {e}",
                "sources": [],
            })

    st.rerun()
