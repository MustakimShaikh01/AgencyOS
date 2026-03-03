# 🏢 AgencyOS – Autonomous AI Marketing Startup Simulator
## 📋 Master Implementation Plan

> **Version:** 1.0.0  
> **Created:** 2026-03-03  
> **Status:** Planning Phase  
> **Target Stack:** Python (FastAPI) · SQLite · HuggingFace/llama.cpp · HTML/CSS/JS  

---

## 📌 Table of Contents

1. [Project Vision](#1-project-vision)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Implementation Phases Overview](#4-implementation-phases-overview)
5. [Phase 1 – Project Foundation & Environment](#5-phase-1--project-foundation--environment)
6. [Phase 2 – Database & Core Models](#6-phase-2--database--core-models)
7. [Phase 3 – Agent System (Core Intelligence)](#7-phase-3--agent-system-core-intelligence)
8. [Phase 4 – LLM Integration Layer](#8-phase-4--llm-integration-layer)
9. [Phase 5 – Orchestrator & Authority Engine](#9-phase-5--orchestrator--authority-engine)
10. [Phase 6 – Logging & Audit System](#10-phase-6--logging--audit-system)
11. [Phase 7 – FastAPI Backend & REST API](#11-phase-7--fastapi-backend--rest-api)
12. [Phase 8 – Frontend Dashboard](#12-phase-8--frontend-dashboard)
13. [Phase 9 – Business Logic & Rules Engine](#13-phase-9--business-logic--rules-engine)
14. [Phase 10 – Testing & QA](#14-phase-10--testing--qa)
15. [Phase 11 – Performance Optimization](#15-phase-11--performance-optimization)
16. [Phase 12 – Documentation & Deployment](#16-phase-12--documentation--deployment)
17. [Folder Structure (Final)](#17-folder-structure-final)
18. [Database Schema](#18-database-schema)
19. [Agent Prompt Templates](#19-agent-prompt-templates)
20. [Business Rules Reference](#20-business-rules-reference)
21. [MVP Checklist](#21-mvp-checklist)
22. [Risk Register](#22-risk-register)
23. [Timeline & Milestones](#23-timeline--milestones)

---

## 1. Project Vision

### Problem
Businesses and AI learners lack hands-on experience understanding how autonomous AI agents collaborate, make governance decisions, and manage marketing operations end-to-end.

### Solution
**AgencyOS** simulates a fully autonomous AI-powered marketing startup. Multiple specialized AI agents collaborate, argue, review, approve, and execute marketing tasks under a structured authority and governance system — all running locally.

### Target Audience
| Audience | Use Case |
|---|---|
| AI Learners | Understand multi-agent orchestration |
| Marketing Students | See AI-powered campaign workflows |
| Startup Founders | Prototype autonomous AI company ops |
| EdTech Platforms | Interactive AI governance teaching tool |

### Core Differentiator
- Real local LLMs (no OpenAI costs)
- Governance + authority hierarchy
- Full audit trail
- Gamified XP system for agents
- Risk + compliance engine built in

---

## 2. System Architecture

```
                     ┌──────────────────────────┐
                     │       Frontend UI          │
                     │  Dashboard / Office View   │
                     │  (HTML + CSS + Vanilla JS) │
                     └──────────┬─────────────────┘
                                │ REST + WebSocket
                     ┌──────────┴─────────────────┐
                     │       FastAPI Backend        │
                     │  /api/v1/* routes            │
                     └──────────┬─────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
  ┌──────▼──────┐    ┌──────────▼──────┐   ┌──────────▼──────┐
  │ Orchestrator │    │ Authority Engine │   │  Logging Engine  │
  │   Engine    │    │ (Governance)     │   │  (Audit Store)   │
  └──────┬──────┘    └─────────────────┘   └─────────────────┘
         │
  ┌──────▼──────┐
  │ Agent Registry│
  │  (9 Agents)  │
  └──────┬──────┘
         │
  ┌──────▼──────────┐
  │ Multi-LLM        │
  │ Executor         │
  └──────┬──────────┘
         │
  ┌──────▼──────────────────────┐
  │     HuggingFace / llama.cpp  │
  │  TinyLlama · Qwen · Mistral  │
  └─────────────────────────────┘
         │
  ┌──────▼──────────┐
  │   SQLite DB      │
  │  (Single file)   │
  └─────────────────┘
```

### Data Flow (Campaign Execution)
```
User creates campaign
      ↓
Orchestrator receives task
      ↓
Strategist breaks into sub-tasks
      ↓
Content Writer drafts content (LLM)
      ↓
Approver reviews (LLM, structured JSON)
      ↓
Risk Agent checks compliance (LLM)
      ↓
[ risk_score < 70 ] → Finance Controller approves budget
      ↓
Results logged to DB + shown in Dashboard
```

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend Framework | FastAPI | Async, fast, auto-docs |
| Language | Python 3.11+ | AI ecosystem support |
| LLM Runtime | llama.cpp (via llama-cpp-python) | Local quantized models |
| Model Hub | HuggingFace (download only) | Free model access |
| Database | SQLite | Zero-config, portable |
| ORM | SQLAlchemy (async) | Clean model abstraction |
| Frontend | HTML5 + CSS3 + Vanilla JS | Zero framework overhead |
| Realtime | WebSockets (FastAPI native) | Live agent activity feed |
| Testing | Pytest + httpx | Fast, async-compatible |
| Config | Python-dotenv + Pydantic Settings | Type-safe config |
| Logging | Python logging + structlog | Structured audit logs |

### Model Strategy
| Model | Size (Q4) | Purpose |
|---|---|---|
| TinyLlama 1.1B | ~600 MB | Fast lightweight tasks (summarize, classify) |
| Qwen 1.8B | ~1.2 GB | Content writing, structured JSON output |
| Mistral 7B | ~4 GB | Complex reasoning, risk analysis (optional) |

> **Total Max Disk:** ~6 GB  
> **RAM Required:** 8 GB workable  
> **Loading:** Lazy — load only when needed, unload after use

---

## 4. Implementation Phases Overview

| Phase | Name | Duration | Priority |
|---|---|---|---|
| Phase 1 | Project Foundation & Environment | Day 1 | 🔴 Critical |
| Phase 2 | Database & Core Models | Day 1–2 | 🔴 Critical |
| Phase 3 | Agent System | Day 2–4 | 🔴 Critical |
| Phase 4 | LLM Integration Layer | Day 3–5 | 🔴 Critical |
| Phase 5 | Orchestrator & Authority Engine | Day 5–7 | 🔴 Critical |
| Phase 6 | Logging & Audit System | Day 6–7 | 🟠 High |
| Phase 7 | FastAPI Backend & REST API | Day 7–9 | 🔴 Critical |
| Phase 8 | Frontend Dashboard | Day 9–12 | 🟠 High |
| Phase 9 | Business Logic & Rules Engine | Day 10–12 | 🟠 High |
| Phase 10 | Testing & QA | Day 12–14 | 🟡 Medium |
| Phase 11 | Performance Optimization | Day 13–14 | 🟡 Medium |
| Phase 12 | Documentation & Deployment | Day 14 | 🟡 Medium |

---

## 5. Phase 1 – Project Foundation & Environment

### Goals
- Set up folder structure
- Configure Python virtual environment
- Install all dependencies
- Create config system

### Steps

#### 1.1 Initialize Project Structure
```bash
mkdir -p agencyos/app/{core,agents,llm,db,logs,memory}
mkdir -p agencyos/frontend/{dashboard,office-view,activity-feed}
mkdir -p agencyos/{tests,scripts,models}
touch agencyos/app/main.py
touch agencyos/app/config.py
touch agencyos/requirements.txt
touch agencyos/.env.example
touch agencyos/README.md
```

#### 1.2 Python Dependencies (`requirements.txt`)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
aiosqlite==0.19.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
llama-cpp-python==0.2.38
httpx==0.26.0
websockets==12.0
structlog==24.1.0
pytest==7.4.4
pytest-asyncio==0.23.3
rich==13.7.0
typer==0.9.0
```

#### 1.3 Config System (`app/config.py`)
```python
# Fields to configure:
# - APP_NAME, VERSION, DEBUG
# - DATABASE_URL (sqlite+aiosqlite:///./agencyos.db)
# - MODEL_DIR (./models/)
# - DEFAULT_MODEL (tinyllama)
# - MAX_TOKENS (512)
# - MAX_CONTEXT (2048)
# - LOG_LEVEL
# - RISK_THRESHOLD (70)
# - BUDGET_OVERRUN_THRESHOLD (0.2)
# - APPROVAL_SCORE_THRESHOLD (75)
# - CONFIDENCE_THRESHOLD (0.5)
```

#### 1.4 Environment Variables (`.env.example`)
```
APP_NAME=AgencyOS
VERSION=1.0.0
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./agencyos.db
MODEL_DIR=./models/
DEFAULT_MODEL=tinyllama
RISK_THRESHOLD=70
BUDGET_OVERRUN_THRESHOLD=0.20
```

### Deliverables
- [ ] Full folder structure created
- [ ] Virtual environment active
- [ ] All dependencies installable
- [ ] Config loaded from `.env`

---

## 6. Phase 2 – Database & Core Models

### Goals
- Design and implement SQLite schema
- Create SQLAlchemy ORM models
- Set up async DB session management
- Write schema migration script

### Steps

#### 2.1 Schema Design (`app/db/schema.sql`)

```sql
-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    authority_level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    approval_rate REAL DEFAULT 1.0,
    efficiency_score REAL DEFAULT 1.0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    assigned_agent TEXT,
    budget REAL DEFAULT 0.0,
    risk_score INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    output_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand_guidelines TEXT,
    total_budget REAL DEFAULT 0.0,
    spent_budget REAL DEFAULT 0.0,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Decisions Table
CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    agent TEXT NOT NULL,
    decision TEXT NOT NULL,
    score REAL,
    reasoning TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Model Usage Table
CREATE TABLE IF NOT EXISTS model_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    agent TEXT NOT NULL,
    model_name TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    resource_type TEXT,
    resource_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 SQLAlchemy Models (`app/db/models.py`)
- `Agent`, `Task`, `Campaign`, `Decision`, `ModelUsage`, `AuditLog` classes
- All fields matching schema above
- Relationships: Campaign → Tasks, Task → Decisions

#### 2.3 Database Session (`app/db/session.py`)
```python
# Async SQLAlchemy engine + session factory
# get_db() dependency for FastAPI injection
# init_db() to create all tables on startup
```

### Deliverables
- [ ] `schema.sql` complete
- [ ] All ORM models defined
- [ ] Async session working
- [ ] DB auto-initializes on first run

---

## 7. Phase 3 – Agent System (Core Intelligence)

### Goals
- Define base agent architecture
- Implement all 9 specialized agents
- Create agent registry
- Define structured prompt templates

### Agent Hierarchy

```
Level 5 │ Approver (QA Director)
Level 4 │ Risk Agent (Compliance Officer)
Level 4 │ Finance Controller
Level 3 │ Strategist (Campaign Lead)
Level 2 │ SEO Agent
Level 2 │ Ads Manager
Level 2 │ Social Manager
Level 1 │ Content Writer
Level 1 │ (Expandable)
```

### Steps

#### 3.1 Base Agent (`app/agents/base_agent.py`)

```python
class BaseAgent:
    name: str
    role: str
    authority_level: int
    model_preference: str   # which LLM to use by default
    prompt_template: str    # base system prompt

    async def execute(self, task: dict) -> dict
    async def build_prompt(self, task: dict) -> str
    async def parse_response(self, raw: str) -> dict
    async def validate_output(self, output: dict) -> bool
    async def log_decision(self, task_id, decision, score)
```

#### 3.2 Strategist Agent (`app/agents/strategist.py`)

**Responsibilities:**
- Receive campaign brief
- Break into sub-tasks
- Assign agents to tasks
- Set task budgets

**Output JSON:**
```json
{
  "analysis_summary": "...",
  "sub_tasks": [
    { "title": "...", "assigned_to": "content_writer", "budget": 50.0 }
  ],
  "confidence_score": 0.87
}
```

#### 3.3 Content Writer Agent (`app/agents/content_writer.py`)

**Responsibilities:**
- Draft marketing content (blog, ad copy, social post)
- SEO keyword integration
- Self-review before submission

**Output JSON:**
```json
{
  "analysis_summary": "...",
  "draft_content": "...",
  "self_review_notes": "...",
  "confidence_score": 0.82
}
```

#### 3.4 Approver Agent (`app/agents/approver.py`)

**Responsibilities:**
- Review submitted content
- Score across 5 dimensions (brand, clarity, persuasion, risk, SEO)
- Issue revisions or approve

**Output JSON:**
```json
{
  "approved": false,
  "overall_score": 68,
  "issues": ["Weak CTA", "Missing keyword density"],
  "revision_instructions": "...",
  "confidence_score": 0.91
}
```

#### 3.5 Risk Agent (`app/agents/risk_agent.py`)

**Responsibilities:**
- Scan for false claims
- Legal/regulatory checks
- Escalate if needed

**Output JSON:**
```json
{
  "risk_score": 45,
  "risk_flags": ["Unsubstantiated claim: '10x ROI guaranteed'"],
  "escalation_required": false
}
```

#### 3.6 Finance Controller (`app/agents/finance_controller.py`)

**Responsibilities:**
- Track budget per campaign
- Calculate token costs
- Approve or block spending

**Output JSON:**
```json
{
  "budget_status": "within_limit",
  "cost_efficiency_score": 82,
  "approval_required": false
}
```

#### 3.7 SEO Agent (`app/agents/seo_agent.py`)
- Keyword density analysis
- Meta tag generation
- Internal link suggestions

#### 3.8 Ads Manager (`app/agents/ads_manager.py`)
- Audience targeting strategy
- Ad copy variants
- Budget allocation recommendations

#### 3.9 Social Manager (`app/agents/social_manager.py`)
- Platform-specific adaptations
- Posting schedule recommendations
- Hashtag strategy

#### 3.10 Agent Registry (`app/core/orchestrator.py`)
```python
AGENT_REGISTRY = {
    "strategist": StrategistAgent(),
    "content_writer": ContentWriterAgent(),
    "approver": ApproverAgent(),
    "risk_agent": RiskAgent(),
    "finance_controller": FinanceControllerAgent(),
    "seo_agent": SEOAgent(),
    "ads_manager": AdsManagerAgent(),
    "social_manager": SocialManagerAgent(),
}
```

### Deliverables
- [ ] `base_agent.py` with full interface
- [ ] All 9 agents implemented
- [ ] Agent registry populated
- [ ] All prompt templates defined
- [ ] JSON output validation on each agent

---

## 8. Phase 4 – LLM Integration Layer

### Goals
- Abstract LLM calls behind a unified interface
- Support multiple local models
- Implement lazy loading
- Prompt caching for repeated queries

### Steps

#### 4.1 HuggingFace Client (`app/llm/hf_client.py`)
```python
# Download models if not present
# Map model names to HuggingFace repo IDs
MODEL_MAP = {
    "tinyllama": "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
    "qwen": "TheBloke/Qwen-1_8B-Chat-GGUF",
    "mistral": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
}
async def download_model(name: str) -> Path
```

#### 4.2 Local Quantized Loader (`app/llm/local_quantized_loader.py`)
```python
# llama-cpp-python integration
# Lazy loading: load on first use, unload after
# Context: max 2048 tokens
# Settings: n_threads=4, n_gpu_layers=0 (CPU mode)

class ModelLoader:
    _loaded_models: dict = {}

    def load(self, model_name: str) -> Llama
    def unload(self, model_name: str)
    def is_loaded(self, model_name: str) -> bool
    async def generate(self, model_name, prompt, max_tokens=512) -> str
```

#### 4.3 Multi-Model Executor (`app/llm/multi_model_executor.py`)
```python
# Route tasks to appropriate model
# Retry logic: if model fails, try next
# Track token usage for billing

class MultiModelExecutor:
    async def execute(self, agent_name: str, prompt: str, task_id: int) -> dict
    async def _select_model(self, agent_name: str) -> str
    async def _log_usage(self, agent, model, tokens, task_id)
```

#### 4.4 Model Configuration
```
Agent       → Preferred Model   → Fallback
Strategist  → qwen              → tinyllama
ContentWriter → qwen            → tinyllama
Approver    → mistral           → qwen
RiskAgent   → mistral           → qwen
Finance     → tinyllama         → None
SEO         → qwen              → tinyllama
```

#### 4.5 Prompt Cache (`app/memory/agent_memory.py`)
```python
# In-memory LRU cache for repeated prompts
# Key: hash(prompt)
# TTL: 300 seconds
# Max size: 100 entries
```

### Deliverables
- [ ] Model downloader script working
- [ ] Lazy loader loads/unloads correctly
- [ ] Multi-model executor routes correctly
- [ ] Token usage tracked per call
- [ ] Prompt cache reduces redundant LLM calls

---

## 9. Phase 5 – Orchestrator & Authority Engine

### Goals
- Build central task orchestration loop
- Implement authority-based approval chain
- Handle revision cycles
- Enforce escalation rules

### Steps

#### 5.1 Orchestrator (`app/core/orchestrator.py`)

```python
class Orchestrator:
    async def run_campaign(self, campaign_id: int)
    async def assign_task(self, task: Task, agent_name: str)
    async def execute_task(self, task: Task, agent: BaseAgent) -> dict
    async def handle_revision(self, task: Task, instructions: str)
    async def check_revision_limit(self, task: Task) -> bool
    async def escalate_task(self, task: Task, reason: str)
```

**Orchestration Loop:**
```
1. Load campaign
2. Run Strategist → get sub-tasks
3. For each sub-task:
   a. Run assigned agent
   b. Run Approver → check score
   c. If score < 75 → revision (max 3)
   d. Run Risk Agent → check risk
   e. If risk > 70 → block + escalate
   f. Run Finance Controller → check budget
   g. If budget overrun > 20% → escalate
   h. Log all decisions
4. Mark campaign complete
```

#### 5.2 Authority Engine (`app/core/authority_engine.py`)

```python
class AuthorityEngine:
    def can_approve(self, agent: Agent, task: Task) -> bool
    def can_escalate(self, agent: Agent) -> bool
    def check_budget_authority(self, agent: Agent, amount: float) -> bool
    def get_approval_chain(self, task: Task) -> list[str]
    def enforce_authority(self, action: str, actor: Agent) -> bool
```

**Authority Rules:**
```
Level 1: Execute tasks only
Level 2: Execute + self-review
Level 3: Execute + approve own scope
Level 4: Approve others + escalate
Level 5: Full approval authority + override
```

#### 5.3 Workflow Engine (`app/core/workflow_engine.py`)

```python
class WorkflowEngine:
    workflows = {
        "content_campaign": [
            "strategist",
            "content_writer",
            "seo_agent",
            "approver",
            "risk_agent",
            "finance_controller",
        ],
        "ad_campaign": [
            "strategist",
            "ads_manager",
            "approver",
            "risk_agent",
            "finance_controller",
        ],
    }

    async def run(self, workflow_name: str, campaign_id: int)
```

#### 5.4 Decision Engine (`app/core/decision_engine.py`)

```python
class DecisionEngine:
    def evaluate(self, outputs: dict) -> dict
    def apply_rules(self, task, outputs) -> str  # approved/revision/blocked/escalated
    def calculate_aggregate_score(self, scores: list) -> float
```

### Deliverables
- [ ] Orchestrator runs full campaign end-to-end
- [ ] Authority engine blocks unauthorized actions
- [ ] Revision cycle capped at 3
- [ ] Escalation triggers correctly on rules
- [ ] XP updated for agents after each task

---

## 10. Phase 6 – Logging & Audit System

### Goals
- Full audit trail for every action
- Structured JSON logging
- Decision history queryable from API
- Token usage reporting

### Steps

#### 6.1 Action Logger (`app/logs/action_logger.py`)
```python
# Log: agent actions, task state changes
# Format: structured JSON lines
# Output: DB + file log
```

#### 6.2 Decision Logger (`app/logs/decision_logger.py`)
```python
# Log: every agent decision with full JSON output
# Stored in `decisions` table
# Queryable by task, agent, date range
```

#### 6.3 Usage Logger (`app/logs/usage_logger.py`)
```python
# Log: model usage per agent per task
# Track: tokens, duration, cost estimate
# Stored in `model_usage` table
```

#### 6.4 Audit Log
```python
# Every state change is audited
# actor, action, resource, timestamp
# Immutable (append-only)
```

### Deliverables
- [ ] All 3 loggers functional
- [ ] Every LLM call logged
- [ ] Every decision stored in DB
- [ ] Audit trail complete and queryable

---

## 11. Phase 7 – FastAPI Backend & REST API

### Goals
- Build comprehensive REST API
- WebSocket for real-time agent activity
- Auto-generated OpenAPI docs
- Input validation with Pydantic

### API Routes

#### Campaigns
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/campaigns` | Create new campaign |
| GET | `/api/v1/campaigns` | List all campaigns |
| GET | `/api/v1/campaigns/{id}` | Get campaign detail |
| POST | `/api/v1/campaigns/{id}/run` | Trigger campaign execution |
| GET | `/api/v1/campaigns/{id}/status` | Get live status |

#### Agents
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/agents` | List all agents |
| GET | `/api/v1/agents/{name}` | Get agent profile |
| GET | `/api/v1/agents/{name}/decisions` | Agent decision history |

#### Tasks
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/tasks` | List all tasks |
| GET | `/api/v1/tasks/{id}` | Get task detail |
| GET | `/api/v1/tasks/{id}/decisions` | Task decision history |

#### Analytics
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/analytics/model-usage` | Token usage report |
| GET | `/api/v1/analytics/agent-performance` | Agent XP + scores |
| GET | `/api/v1/analytics/audit-log` | Full audit log |

#### WebSocket
| Path | Description |
|---|---|
| `ws://localhost:8000/ws/activity` | Real-time agent activity feed |

### Steps

#### 7.1 App Entry Point (`app/main.py`)
```python
# FastAPI app init
# CORS middleware
# DB init on startup
# Include all routers
# WebSocket endpoint
# Static files for frontend
```

#### 7.2 Pydantic Schemas (`app/db/schemas.py`)
```python
# Request/Response models for all endpoints
# CampaignCreate, TaskCreate, AgentResponse
# DecisionResponse, AnalyticsResponse
```

#### 7.3 Router Files
```
app/api/
├── campaigns.py
├── agents.py
├── tasks.py
├── analytics.py
└── websocket.py
```

### Deliverables
- [ ] All endpoints returning correct data
- [ ] WebSocket streaming agent activity
- [ ] OpenAPI docs at `/docs`
- [ ] Input validation on all POST routes
- [ ] Error responses standardized (RFC 7807)

---

## 12. Phase 8 – Frontend Dashboard

### Goals
- Stunning, premium UI (dark mode, glassmorphism)
- Real-time agent activity feed
- Campaign creation wizard
- Agent profiles with XP bars
- Analytics charts

### Pages

#### 8.1 Dashboard (`/dashboard`)
- KPI cards: Active Campaigns, Tasks Completed, Total Tokens Used, Budget Spent
- Live Activity Feed (WebSocket)
- Recent Campaigns table
- Agent performance mini-cards

#### 8.2 Office View (`/office-view`)
- Visual "office floor" showing agents at their desks
- Live status bubbles showing what each agent is working on
- XP bars and approval-rate per agent
- Click agent → show decision history

#### 8.3 Campaign Creation (`/campaigns/new`)
- Multi-step wizard
- Step 1: Campaign name + brand guidelines
- Step 2: Workflow selection (content / ads / social)
- Step 3: Budget allocation
- Step 4: Confirm + Launch

#### 8.4 Campaign Detail (`/campaigns/{id}`)
- Task pipeline view (Kanban-style)
- Each task card shows: status, assigned agent, risk score, revision count
- Click task → full decision history

#### 8.5 Analytics (`/analytics`)
- Token usage bar chart (by model)
- Agent performance radar chart
- Budget utilization gauge
- Decision score history line chart

### Design System
```css
/* Color Palette */
--bg-primary: #0a0a0f;
--bg-secondary: #111118;
--glass: rgba(255,255,255,0.05);
--accent: #6c63ff;
--accent-glow: rgba(108,99,255,0.3);
--success: #00d4aa;
--warning: #ffb830;
--danger: #ff4d6d;

/* Typography */
--font: 'Inter', sans-serif;

/* Effects */
backdrop-filter: blur(20px);
box-shadow: 0 8px 32px rgba(0,0,0,0.4);
```

### Deliverables
- [ ] All 5 pages built and responsive
- [ ] WebSocket connected and live
- [ ] Charts rendering real data
- [ ] Office view shows all 9 agents
- [ ] Dark mode glassmorphism throughout

---

## 13. Phase 9 – Business Logic & Rules Engine

### Goals
- Enforce all business rules automatically
- XP system for agents
- Campaign state machine

### Business Rules (Complete)

```
Rule 1:  risk_score > 70                → AUTO BLOCK task
Rule 2:  budget_overrun > 20%           → ESCALATE to Finance Controller
Rule 3:  approval_score < 75            → SEND to REVISION
Rule 4:  confidence_score < 0.5        → AUTO ESCALATE
Rule 5:  3 failed revisions             → DOWNGRADE agent XP (-10 XP)
Rule 6:  approved first try             → BONUS XP (+15 XP)
Rule 7:  risk_score < 20               → FAST-TRACK (skip full review)
Rule 8:  campaign budget exhausted      → PAUSE all tasks
Rule 9:  agent XP > 500               → PROMOTE authority_level +1
Rule 10: agent XP < -50 (total drain)  → BENCH agent (status=inactive)
```

### Campaign State Machine
```
DRAFT → RUNNING → IN_REVIEW → APPROVED → COMPLETED
                            ↓
                         REVISION
                            ↓
                         BLOCKED (if escalated+rejected)
```

### Deliverables
- [ ] All 10 rules enforced in `decision_engine.py`
- [ ] XP updated after every task
- [ ] Campaign state transitions correct
- [ ] Finance escalation triggers budget check

---

## 14. Phase 10 – Testing & QA

### Goals
- Unit tests for each agent
- Integration tests for API routes
- End-to-end campaign run test

### Test Structure
```
tests/
├── unit/
│   ├── test_agents.py         # each agent output validation
│   ├── test_authority.py      # authority engine rules
│   ├── test_rules.py          # business rule triggers
│   └── test_llm_mock.py       # mock LLM responses
├── integration/
│   ├── test_campaigns_api.py  # campaign CRUD + run
│   ├── test_agents_api.py     # agent endpoints
│   └── test_analytics_api.py  # analytics endpoints
└── e2e/
    └── test_full_campaign.py  # full campaign from create → complete
```

### Test Strategy
- **Unit tests**: Mock LLM calls, test JSON parsing + validation
- **Integration tests**: Use TestClient (httpx), real SQLite in-memory
- **E2E test**: Full flow with mocked LLM, real DB

### Coverage Targets
| Area | Target |
|---|---|
| Agent logic | 90% |
| API routes | 85% |
| Business rules | 95% |
| Overall | 80% |

### Deliverables
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E test covers full campaign lifecycle
- [ ] Coverage report generated

---

## 15. Phase 11 – Performance Optimization

### Goals
- Sub-second API responses
- LLM generation optimized
- Memory footprint minimal

### Optimizations

#### LLM
```
- n_threads = physical CPU count
- n_gpu_layers = 0 (CPU mode, adjust if GPU available)
- max_tokens = 512 (not 2048 unless needed)
- use_mmap = True
- use_mlock = False (saves RAM)
- Unload model after 5 minutes of inactivity
- Prompt cache: LRU 100 entries, 5-min TTL
```

#### Database
```
- Enable WAL mode: PRAGMA journal_mode=WAL
- Index: tasks(status), tasks(campaign_id), decisions(task_id)
- Connection pool: max 5 connections
```

#### API
```
- Async everywhere (no blocking calls)
- Response compression (gzip)
- Pagination on list endpoints (limit=20 default)
```

### Deliverables
- [ ] API response < 100ms (non-LLM)
- [ ] LLM generation ≤ 30s for 512 tokens
- [ ] Memory usage ≤ 4GB during run
- [ ] DB queries optimized with EXPLAIN QUERY PLAN

---

## 16. Phase 12 – Documentation & Deployment

### Goals
- Complete README
- API documentation
- Local setup guide
- Docker support (optional)

### Documentation Files
```
docs/
├── QUICKSTART.md       # 5-minute setup
├── ARCHITECTURE.md     # system design details
├── API_REFERENCE.md    # all endpoints
├── AGENT_GUIDE.md      # how agents work
├── MODEL_SETUP.md      # downloading models
└── CONTRIBUTING.md     # how to extend
```

### Local Deployment
```bash
# 1. Clone and setup
git clone <repo>
cd agencyos
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Download models
python scripts/download_models.py --models tinyllama qwen

# 3. Setup environment
cp .env.example .env

# 4. Run
uvicorn app.main:app --reload --port 8000

# 5. Open browser
open http://localhost:8000
```

### Deliverables
- [ ] README complete with screenshots
- [ ] API auto-docs at `/docs`
- [ ] Model download script working
- [ ] `QUICKSTART.md` tested by fresh setup

---

## 17. Folder Structure (Final)

```
agencyos/
│
├── app/
│   ├── main.py                    # FastAPI app entry
│   ├── config.py                  # Settings + env
│   │
│   ├── api/
│   │   ├── campaigns.py
│   │   ├── agents.py
│   │   ├── tasks.py
│   │   ├── analytics.py
│   │   └── websocket.py
│   │
│   ├── core/
│   │   ├── orchestrator.py        # Campaign run loop
│   │   ├── authority_engine.py    # Governance rules
│   │   ├── workflow_engine.py     # Workflow definitions
│   │   ├── model_router.py        # Agent → model mapping
│   │   └── decision_engine.py     # Business rule evaluator
│   │
│   ├── agents/
│   │   ├── base_agent.py
│   │   ├── strategist.py
│   │   ├── content_writer.py
│   │   ├── seo_agent.py
│   │   ├── ads_manager.py
│   │   ├── social_manager.py
│   │   ├── approver.py
│   │   ├── risk_agent.py
│   │   └── finance_controller.py
│   │
│   ├── llm/
│   │   ├── hf_client.py           # Model downloader
│   │   ├── multi_model_executor.py
│   │   └── local_quantized_loader.py
│   │
│   ├── db/
│   │   ├── models.py              # SQLAlchemy ORM
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── session.py             # Async DB session
│   │   └── schema.sql             # Raw SQL reference
│   │
│   ├── logs/
│   │   ├── action_logger.py
│   │   ├── decision_logger.py
│   │   └── usage_logger.py
│   │
│   └── memory/
│       └── agent_memory.py        # Prompt LRU cache
│
├── frontend/
│   ├── index.html                 # Root (redirects to dashboard)
│   ├── static/
│   │   ├── css/
│   │   │   └── main.css
│   │   └── js/
│   │       ├── api.js             # REST client
│   │       ├── websocket.js       # WS client
│   │       └── charts.js          # Chart rendering
│   ├── dashboard/
│   │   └── index.html
│   ├── office-view/
│   │   └── index.html
│   └── activity-feed/
│       └── index.html
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── download_models.py
│   ├── seed_db.py
│   └── run_demo.py
│
├── models/                        # Local GGUF model files
│   ├── tinyllama.gguf
│   └── qwen.gguf
│
├── docs/
│   ├── QUICKSTART.md
│   └── ARCHITECTURE.md
│
├── agencyos.db                    # SQLite database (auto-created)
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 18. Database Schema

### Full SQL

```sql
-- Agents
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    authority_level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    approval_rate REAL DEFAULT 1.0,
    efficiency_score REAL DEFAULT 1.0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand_guidelines TEXT,
    workflow_type TEXT DEFAULT 'content_campaign',
    total_budget REAL DEFAULT 0.0,
    spent_budget REAL DEFAULT 0.0,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    assigned_agent TEXT,
    budget REAL DEFAULT 0.0,
    risk_score INTEGER DEFAULT 0,
    approval_score INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    output_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Decisions
CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    agent TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    decision TEXT NOT NULL,
    score REAL,
    reasoning TEXT,
    full_output TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Model Usage
CREATE TABLE IF NOT EXISTS model_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    agent TEXT NOT NULL,
    model_name TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    resource_type TEXT,
    resource_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_decisions_task ON decisions(task_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_agent ON model_usage(agent);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
```

---

## 19. Agent Prompt Templates

### Base System Prompt
```
You are {ROLE} in a professional AI marketing startup called AgencyOS.

Company Brand Guidelines:
{brand_guidelines}

Your Authority Level: {authority_level} / 5

Instructions:
1. Think step by step internally before responding.
2. Return ONLY valid JSON, no markdown, no explanation.
3. Your response must include all required JSON fields.
4. Be professional, objective, and data-driven.
```

### Strategist Prompt
```
You are the Campaign Strategist at AgencyOS.

Campaign Brief:
{campaign_brief}

Brand Guidelines:
{brand_guidelines}

Budget: ${budget}

Break this campaign into actionable sub-tasks.
Assign each task to one of: content_writer, seo_agent, ads_manager, social_manager

Return JSON:
{
  "analysis_summary": "brief campaign analysis",
  "sub_tasks": [
    {
      "title": "task name",
      "description": "what needs to be done",
      "assigned_to": "agent_name",
      "budget": 0.0,
      "priority": "high|medium|low"
    }
  ],
  "confidence_score": 0.0
}
```

### Content Writer Prompt
```
You are a Senior Content Writer at AgencyOS.

Task: {task_description}
Brand Guidelines: {brand_guidelines}
Target Audience: {target_audience}

Content Objectives:
- High engagement
- SEO-optimized
- Professional tone
- Clear call-to-action

Return JSON:
{
  "analysis_summary": "...",
  "draft_content": "full content here",
  "self_review_notes": "what you think could be improved",
  "seo_keywords_used": ["keyword1", "keyword2"],
  "confidence_score": 0.0
}
```

### Approver Prompt
```
You are the Quality Assurance Director at AgencyOS.

Content to review:
{draft_content}

Brand Guidelines:
{brand_guidelines}

Evaluate on these dimensions (0-100 each):
1. Brand Alignment
2. Clarity and Readability
3. Persuasion Strength
4. Risk Level (higher = worse)
5. SEO Compliance

Return JSON:
{
  "approved": true,
  "overall_score": 0,
  "dimension_scores": {
    "brand_alignment": 0,
    "clarity": 0,
    "persuasion": 0,
    "risk_level": 0,
    "seo_compliance": 0
  },
  "issues": [],
  "revision_instructions": "detailed instructions if not approved",
  "confidence_score": 0.0
}
```

### Risk Agent Prompt
```
You are the Chief Compliance and Risk Officer at AgencyOS.

Content to analyze:
{content}

Detect any of the following:
- False or unsubstantiated claims
- Legal risk (copyright, defamation, false advertising)
- Ethical concerns (discrimination, manipulation)
- Brand reputation risk
- Regulatory compliance issues

Return JSON:
{
  "risk_score": 0,
  "risk_flags": ["specific issue 1", "specific issue 2"],
  "risk_categories": ["legal", "ethical", "brand"],
  "escalation_required": false,
  "recommended_changes": "what to fix"
}
```

### Finance Controller Prompt
```
You are the Finance Controller at AgencyOS.

Campaign Budget: ${total_budget}
Spent So Far: ${spent_budget}
Current Task Cost: ${task_cost}
Token Usage This Session: {tokens_used}

Analyze:
- Is the task cost within budget?
- Is there a budget overrun risk?
- Is cost efficiency acceptable?

Return JSON:
{
  "budget_status": "within_limit|approaching_limit|over_limit",
  "budget_remaining": 0.0,
  "overrun_percentage": 0.0,
  "cost_efficiency_score": 0,
  "approval_required": false,
  "recommendation": "proceed|pause|escalate"
}
```

---

## 20. Business Rules Reference

| Rule ID | Trigger | Condition | Action | XP Impact |
|---|---|---|---|---|
| R001 | Risk check | risk_score > 70 | AUTO BLOCK | -5 XP (writer) |
| R002 | Budget check | overrun > 20% | ESCALATE finance | none |
| R003 | Approval check | score < 75 | REVISION | none |
| R004 | Confidence | confidence < 0.5 | AUTO ESCALATE | none |
| R005 | Revision limit | count >= 3 | DOWNGRADE XP | -10 XP (writer) |
| R006 | First-pass approval | score >= 90 | BONUS | +15 XP (writer) |
| R007 | Clean risk | risk_score < 20 | FAST TRACK | +5 XP |
| R008 | Budget exhausted | remaining = 0 | PAUSE all tasks | none |
| R009 | High XP | agent XP > 500 | PROMOTE level | +1 authority |
| R010 | Negative XP | agent XP < -50 | BENCH agent | status=inactive |

---

## 21. MVP Checklist

### Minimum Viable Product (MVP)

**Agents (4 required for MVP)**
- [ ] Strategist
- [ ] Content Writer
- [ ] Approver
- [ ] Risk Agent

**Models (2 required for MVP)**
- [ ] TinyLlama 1.1B Q4
- [ ] Qwen 1.8B Q4

**Backend**
- [ ] Campaign CRUD API
- [ ] Campaign run endpoint
- [ ] Agent list endpoint
- [ ] Task + decision history API

**Frontend**
- [ ] Dashboard (KPIs + live feed)
- [ ] Campaign creation form
- [ ] Task pipeline view

**Business Rules**
- [ ] R001 (auto block high risk)
- [ ] R003 (revision on low score)
- [ ] R005 (XP downgrade)

**Infrastructure**
- [ ] SQLite working
- [ ] WebSocket live feed
- [ ] Logging functional

### Post-MVP (V2 Features)
- [ ] SEO Agent, Ads Manager, Social Manager
- [ ] Mistral 7B integration
- [ ] Office View visualization
- [ ] Analytics charts
- [ ] Vector memory store
- [ ] Agent chat interface
- [ ] Campaign export (PDF/JSON)
- [ ] Multi-user support

---

## 22. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM returns invalid JSON | High | High | Retry with structured prompts; JSON repair fallback |
| Model OOM on low-RAM machine | Medium | High | Introduce RAM check before loading; use TinyLlama by default |
| Agent infinite revision loop | Low | High | Hard cap at 3 revisions; rule R005 |
| SQLite corruption | Low | High | WAL mode + daily backup script |
| Model download failure | Medium | Medium | Bundle fallback prompt-only mode |
| Frontend WebSocket disconnect | Medium | Low | Auto-reconnect with exponential backoff |
| LLM generates harmful content | Low | High | Risk Agent always runs; R001 blocks it |

---

## 23. Timeline & Milestones

### 2-Week Sprint Plan

| Week | Days | Milestone | Deliverable |
|---|---|---|---|
| Week 1 | Day 1 | Foundation | Project structure, config, requirements |
| Week 1 | Day 2 | Database | Schema created, ORM working |
| Week 1 | Day 3–4 | Core Agents | Base + 4 MVP agents complete |
| Week 1 | Day 4–5 | LLM Layer | Models load, generate, log usage |
| Week 1 | Day 5–7 | Orchestrator | Full campaign run end-to-end (CLI) |
| Week 2 | Day 7–8 | Logging/Audit | All decisions logged |
| Week 2 | Day 8–9 | FastAPI | All REST endpoints + WebSocket |
| Week 2 | Day 9–11 | Frontend | Dashboard + campaign flow |
| Week 2 | Day 11–12 | Business Rules | All 10 rules enforced |
| Week 2 | Day 12–13 | Testing | 80%+ coverage |
| Week 2 | Day 13–14 | Polish + Docs | README, cleanup, demo |

### Key Milestones (Checkpoints)

```
✅ M1 (Day 2):  Database initializes, seed data inserts
✅ M2 (Day 4):  Content Writer runs with TinyLlama
✅ M3 (Day 6):  Full campaign CLI run (no frontend)
✅ M4 (Day 9):  API serves all endpoints with real data
✅ M5 (Day 11): Dashboard shows live campaign data
✅ M6 (Day 14): Full demo: create campaign, run, view results
```

---

## 📎 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                  AgencyOS Quick Reference                │
├──────────────────┬──────────────────────────────────────┤
│ Start server     │ uvicorn app.main:app --reload         │
│ Run CLI campaign │ python scripts/run_demo.py            │
│ Download models  │ python scripts/download_models.py     │
│ Run tests        │ pytest tests/ -v --cov=app            │
│ View DB          │ sqlite3 agencyos.db                   │
│ API Docs         │ http://localhost:8000/docs            │
│ Dashboard        │ http://localhost:8000/dashboard       │
├──────────────────┴──────────────────────────────────────┤
│ Risk > 70 = BLOCK   │  Score < 75 = REVISION            │
│ Revisions >= 3 = XP DROP  │  XP > 500 = PROMOTE         │
└─────────────────────────────────────────────────────────┘
```

---

*This document is the single source of truth for AgencyOS implementation.*  
*Update this file as implementation progresses.*  
*Version control: commit this file with each phase completion.*
