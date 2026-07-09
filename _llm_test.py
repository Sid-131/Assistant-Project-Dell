from llama_cpp import Llama
print("loading llama3.1:8b (this takes ~20-40s)...")
llm = Llama(model_path="models_gguf/llama3.1-8b-instruct.Q4_K_M.gguf", n_ctx=8192, n_threads=8, chat_format="llama-3", verbose=False)
out = llm.create_chat_completion(
  messages=[{"role":"system","content":"You are a helpful OneFS assistant. Answer only from the context."},
            {"role":"user","content":"Context: To check cluster health, run the command isi status -v from the CLI.\n\nQuestion: What command checks cluster health?"}],
  temperature=0.2, max_tokens=120)
print("ANSWER:", out["choices"][0]["message"]["content"])
