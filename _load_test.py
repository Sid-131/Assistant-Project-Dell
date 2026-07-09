from llama_cpp import Llama
print("loading nomic (embedding)...")
e = Llama(model_path="models_gguf/nomic-embed-text.f16.gguf", embedding=True, n_ctx=2048, verbose=False)
v = e.create_embedding("cluster health")["data"][0]["embedding"]
print("EMBED OK dim", len(v))
