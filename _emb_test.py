from llama_cpp import Llama
import chromadb
emb = Llama(model_path="models_gguf/nomic-embed-text.f16.gguf", embedding=True, n_ctx=2048, verbose=False)
col = chromadb.PersistentClient(path="app/chroma_db").get_collection("onefs_docs")
for q in ["How do I create an SMB share in OneFS 9.12?","What CLI command checks cluster health?"]:
    qv = emb.create_embedding(q)["data"][0]["embedding"]
    res = col.query(query_embeddings=[qv], n_results=3, include=["metadatas","distances"])
    print("Q:", q)
    for m,d in zip(res["metadatas"][0], res["distances"][0]):
        print(f"   sim={1-d:.3f}  {m.get('file_name')}")
