# 🧠 Architecture

AgencyOS relies exclusively on local models dynamically shifted to process multi-agent queries via CPU context switching. The system contains exactly three discrete layers running monolithically under one FastAPI event-loop.

## Layer 1: Intelligence Abstraction
Models downloaded via HuggingFace's GGUF distribution route to `MultiModelExecutor`.
Rather than loading out all files to RAM (which breaks memory bounds on 16GB laptops), `ModelLoader` relies on `llama.cpp` using the dynamic `.load()` and `.unload()` methodology.
Token bounds are tightly capped (e.g. `n_ctx=2048`) and thread pooling ensures fast responses natively to Python async IO limits. Let's see how:

**Agent -> Exec**: A "Content Writer" asks for marketing drafts. 
**Routing**: The Orchestrator pipes this directly into the executor targeting `model_preference=qwen`.
**Memory**: If a known task runs, `agent_memory.py` caches hashes so repeated prompts cost 0ms.

## Layer 2: Core Orchestration 
It manages flow-control using exactly these 3 singletons:
1. `Orchestrator`: Triggers campaign kickoffs, dynamically mapping tasks from a strategist payload straight to database rows tracking each agent assignable ID.
2. `WorkflowEngine`: Determines list topology (i.e. if `workflow_type="content_campaign"`, it loops `[content_writer, seo_agent, approver]`).
3. `AuthorityEngine` & `DecisionEngine`: Governs rigid hierarchy blocks across Levels 1 - 5 mapping outputs directly from LLM scores natively down to integers, applying logic rules like `"risk_score > 70 → BLOCKED"`.

## Layer 3: REST & 3D Simulation
All logging flows (`action_logger.py`, `decision_logger.py`) map straight into SQLAlchemy `AsyncSession` wrappers writing non-blocking rows to SQLite.
On the UI side, an async Websocket streaming service runs on `/ws/activity` that emits JSON payloads mapped exactly to HTML UI elements rendering Live Office Feeds inside `game.js`.
The frontend utilizes **Three.js** and **GSAP** to map AI decisions into physical 3D WebGL worker avatars—triggering walking, chat bubbles, and "Thinking" animations tied structurally to the Python LLM responses.

## Layer 4: Local RAG Semantics
We supplement simple prompt injections by hitting a Local RAG engine (`rag_engine.py`) built directly over text corporas like `data/market_trends.txt`. 
The `StrategistAgent` automatically intercepts initial queries, delays the orchestrator, and polls the local RAG engine using TF-IDF and overlap chunking to pull trending data dynamically into its AI brain prior to creating sub-tasks.
