# 🏢 AgencyOS

> **Autonomous AI Marketing Startup Simulator**

AgencyOS simulates a fully autonomous AI-powered marketing agency. Specialized AI agents collaborate, review, approve, and execute marketing campaigns — powered by local LLMs, governed by a real authority engine, and tracked with full audit logging.

---

## ✨ Features

- 🤖 **9 Specialized AI Agents** — Strategist, Content Writer, Approver, Risk Officer, Finance Controller + more
- 🧠 **Local LLMs** — TinyLlama, Qwen, Mistral via llama.cpp (no OpenAI costs)
- ⚖️ **Authority & Governance Engine** — 5-level approval hierarchy
- 📋 **Full Audit Trail** — Every decision logged and queryable
- 🎮 **XP System** — Agents earn/lose XP based on performance
- 📊 **Live Dashboard** — Real-time WebSocket activity feed
- 💰 **Budget Control** — Automated finance checks and escalations
- 🔒 **Risk Engine** — Auto-blocks harmful or legally risky content

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd agencyos

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env

# 5. Download AI models (first time only)
python scripts/download_models.py --models tinyllama qwen

# 6. Start the server
uvicorn app.main:app --reload --port 8000

# 7. Open dashboard
open http://localhost:8000
```

---

## 📋 Implementation Plan

See **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** for the complete 12-phase implementation guide.

---

## 🗂 Project Structure

```
agencyos/
├── app/
│   ├── main.py          # FastAPI entry point
│   ├── config.py        # Settings
│   ├── api/             # REST routes
│   ├── core/            # Orchestrator, Authority Engine
│   ├── agents/          # All 9 AI agents
│   ├── llm/             # LLM integration layer
│   ├── db/              # SQLite + SQLAlchemy models
│   └── logs/            # Audit + decision logging
├── frontend/            # HTML/CSS/JS dashboard
├── tests/               # Unit + integration + e2e tests
├── scripts/             # Utility scripts
└── models/              # Local GGUF model files
```

---

## 🤖 Agent Roster

| Agent | Role | Authority Level |
|---|---|---|
| Strategist | Campaign planning + task breakdown | 3 |
| Content Writer | Drafts all marketing content | 1 |
| SEO Agent | SEO optimization checks | 2 |
| Ads Manager | Ad copy + targeting | 2 |
| Social Manager | Social media adaptations | 2 |
| Approver | QA Director — final review | 5 |
| Risk Agent | Compliance Officer | 4 |
| Finance Controller | Budget management | 4 |

---

## ⚙️ Tech Stack

| Component | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+) |
| LLM Runtime | llama-cpp-python |
| Database | SQLite + SQLAlchemy |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Realtime | WebSockets |

---

## 📖 Documentation

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — Full 12-phase build plan
- [docs/QUICKSTART.md](./docs/QUICKSTART.md) — 5-minute setup guide
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System design
- [docs/AGENT_GUIDE.md](./docs/AGENT_GUIDE.md) — How agents work
- [API Docs](http://localhost:8000/docs) — Auto-generated OpenAPI (when running)

---

## 🏗 Current Status

> 📌 **Phase:** Planning Complete — Ready for Implementation  
> See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for phase-by-phase progress.

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)
# AgencyOS
