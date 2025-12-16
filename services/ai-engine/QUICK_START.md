# Quick Start Guide - AI Engine Backend

## Option 1: Direct Run (if dependencies installed globally)

```bash
cd services/ai-engine

# Set PYTHONPATH
export PYTHONPATH="${PWD}/src"

# Run with python3
python3 src/main.py
```

## Option 2: Using Start Scripts

The project includes several start scripts:

### Development Mode (Recommended)
```bash
cd services/ai-engine
chmod +x start-dev.sh
./start-dev.sh
```

### Standard Start
```bash
cd services/ai-engine
chmod +x start.sh
./start.sh
```

## Option 3: Using uvicorn directly

```bash
cd services/ai-engine

# Set PYTHONPATH
export PYTHONPATH="${PWD}/src"

# Run uvicorn
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Install Dependencies (if needed)

If you get import errors, install dependencies:

```bash
cd services/ai-engine
python3 -m pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd services/ai-engine

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Then run
export PYTHONPATH="${PWD}/src"
python3 src/main.py
```

## Environment Variables

Make sure you have a `.env` or `.env.local` file with:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT=8000` (optional, defaults to 8000)

## Verify It's Running

Once started, test with:
```bash
curl http://localhost:8000/health
```

You should see a JSON response with status information.




