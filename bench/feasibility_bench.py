"""
PowerScale CPU feasibility bench.

Run this ON A TARGET MACHINE (a PowerScale node, or a Xeon VM matching the node
generation) to turn the prototype's CPU projection into a measured number.

It (1) detects the CPU's AI-relevant instruction sets, (2) times prompt prefill
and token generation at several thread counts on the shipped 3B model, and
(3) projects the latency of a typical RAG answer (~2200 prompt + ~300 output
tokens). No vector DB needed — a representative context is synthesized.

    python bench/feasibility_bench.py [--gguf PATH] [--threads 8,16,32]

Requires only: llama-cpp-python + the .gguf. On a real node, install the
llama-cpp build for the node's ISA (AVX-512/VNNI, or AMX) — NOT the AVX2
fallback the prototype laptop is pinned to.
"""
import argparse, json, os, platform, time
from pathlib import Path

PROMPT_TOK = 2200      # typical RAG prompt (8 excerpts) — what we project for
GEN_TOK    = 300       # typical answer length


def isa_flags():
    import llama_cpp
    raw = llama_cpp.llama_print_system_info().decode()
    want = ("AVX2", "AVX512", "AVX512_VNNI", "AVX512_BF16", "MATMUL_INT8", "BLAS")
    got = {}
    for part in raw.split("|"):
        if "=" in part:
            k, v = part.split("=")
            k = k.strip()
            if k in want:
                got[k] = v.strip() == "1"
    return got, llama_cpp.__version__


def synth_context(n_tok):
    # ~1 token per 4 chars; repeat a realistic OneFS snippet to length
    unit = ("OneFS includes a configurable SMB service to create and manage SMB "
            "shares. Run isi smb shares create HOMEDIR --path=/ifs/home to create a "
            "share. Shares are specific to access zones. ")
    return (unit * (n_tok * 4 // len(unit) + 1))[: n_tok * 4]


def run(gguf, threads):
    from llama_cpp import Llama
    ctx = synth_context(PROMPT_TOK)
    prompt = f"Use ONLY these excerpts.\n\n{ctx}\n\nQuestion: How do I create an SMB share?"
    rows = []
    for n in threads:
        llm = Llama(model_path=gguf, n_ctx=4096, n_threads=n, verbose=False)
        llm.create_chat_completion(messages=[{"role": "user", "content": "hi"}], max_tokens=1)  # warm
        t = time.time()
        r = llm.create_chat_completion(
            messages=[{"role": "user", "content": prompt}], max_tokens=GEN_TOK, temperature=0.2)
        dt = time.time() - t
        tm = r["timings"] if "timings" in r else {}
        u = r.get("usage", {})
        pt = u.get("prompt_tokens", PROMPT_TOK)
        ct = u.get("completion_tokens", GEN_TOK)
        # llama-cpp exposes ms timings in verbose; fall back to overall rate
        pre_tps = tm.get("prompt_per_second") or (pt / max(dt * 0.7, 0.01))
        gen_tps = tm.get("predicted_per_second") or (ct / max(dt * 0.3, 0.01))
        est = PROMPT_TOK / max(pre_tps, 0.1) + GEN_TOK / max(gen_tps, 0.1)
        rows.append({"threads": n, "wall_s": round(dt, 1),
                     "prefill_tps": round(pre_tps, 1), "gen_tps": round(gen_tps, 1),
                     "projected_answer_s": round(est, 1)})
        del llm
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gguf", default=os.environ.get(
        "LLM_GGUF", "models_gguf/qwen2.5-3b-instruct.Q4_K_M.gguf"))
    cpu = os.cpu_count() or 8
    default_threads = sorted({4, 8, cpu // 2, cpu} & set(range(1, cpu + 1)) or {cpu})
    ap.add_argument("--threads", default=",".join(map(str, default_threads)))
    args = ap.parse_args()

    if not Path(args.gguf).exists():
        raise SystemExit(f"model not found: {args.gguf}  (pass --gguf)")

    flags, ver = isa_flags()
    print(f"host      : {platform.processor() or platform.machine()}  |  {cpu} logical cores")
    print(f"llama_cpp : {ver}")
    print("ISA       : " + "  ".join(f"{k}={'yes' if v else 'no'}" for k, v in flags.items()))
    tier = ("AMX (Sapphire Rapids class)" if flags.get("MATMUL_INT8")
            else "AVX-512 + VNNI (Ice Lake class)" if flags.get("AVX512_VNNI")
            else "AVX-512 (no VNNI)" if flags.get("AVX512")
            else "AVX2 only (consumer / prototype class)")
    print(f"AI tier   : {tier}\n")

    rows = run(args.gguf, [int(x) for x in args.threads.split(",")])
    print(f"{'threads':>7} {'prefill tok/s':>14} {'gen tok/s':>10} {'answer (est)':>13}")
    for r in rows:
        print(f"{r['threads']:>7} {r['prefill_tps']:>14} {r['gen_tps']:>10} {r['projected_answer_s']:>11}s")

    out = {"host": platform.processor() or platform.machine(), "cores": cpu,
           "llama_cpp": ver, "isa": flags, "ai_tier": tier,
           "prompt_tok": PROMPT_TOK, "gen_tok": GEN_TOK, "runs": rows}
    Path("bench").mkdir(exist_ok=True)
    Path("bench/feasibility_result.json").write_text(json.dumps(out, indent=2))
    print("\nwrote bench/feasibility_result.json")


if __name__ == "__main__":
    main()
