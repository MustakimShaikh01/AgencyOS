# 🚀 AgencyOS Quickstart

Get your autonomous marketing simulation running under 5 minutes.

## Prerequisites
- Python 3.11+
- minimum 8GB RAM

## 1. Setup Environment
```bash
git clone <repo-url>
cd agencyos

# Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
cp .env.example .env
```

## 2. Seed Storage (SQLite + Models)
AgencyOS runs entirely locally (no API keys, zero cost). It requires quantized GGUF models downloaded from HuggingFace to operate.
```bash
# Downloads lightweight TinyLLama and Qwen into ./models/
PYTHONPATH=. python scripts/download_models.py --models tinyllama qwen

# Initialize the SQLite tables and insert Agent profiles
PYTHONPATH=. python scripts/seed_db.py
```

## 3. Launching
You can run it in two modes:

**A) Full Web Application**
```bash
uvicorn app.main:app --reload --port 8000
```
Then visit `http://localhost:8000` to interact with the Dashboard!

**B) Headless CLI Mode**
Use this to bypass the UI and just trigger a single campaign using Python directly:
```bash
PYTHONPATH=. python scripts/run_demo.py
```
