# Quick Start: Data Loading

## ✅ Prerequisites Check

All scripts are ready and schema-compliant. Environment variables should be in your `.env` file.

## 🚀 Run the Scripts

From the `services/ai-engine` directory:

### Option 1: Use Helper Scripts (Recommended)

```bash
cd services/ai-engine

# 1. Load to Pinecone (with dry-run first)
./scripts/run_pinecone.sh --dry-run
./scripts/run_pinecone.sh

# 2. Load to Neo4j
./scripts/run_neo4j.sh

# 3. Verify (coming soon)
# ./scripts/run_verify.sh
```

### Option 2: Manual with python3

```bash
cd services/ai-engine

# Load env vars manually
export SUPABASE_URL="..."
export SUPABASE_SERVICE_KEY="..."
export PINECONE_API_KEY="..."
export OPENAI_API_KEY="..."
export NEO4J_URI="..."
export NEO4J_USER="..."
export NEO4J_PASSWORD="..."

# Run scripts
python3 scripts/load_agents_to_pinecone.py
python3 scripts/load_agents_to_neo4j.py
```

## ⚠️ Important Notes

1. **Use `python3`** (not `python`) on macOS
2. **Environment variables** are loaded from `../../.env` by helper scripts
3. **Dry-run first** with `--dry-run` flag to test without loading data
4. **Estimated time**: ~10-15 minutes total for both scripts

## 📊 Expected Output

### Pinecone Loading:
```
Loading environment variables from .env...
Running Pinecone loading script...
🚀 Agent Embedding Pipeline Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All clients initialized
✅ Fetched X active agents
✅ Fetched enrichment data for X agents
✅ Created X text representations
✅ Generated X embeddings
✅ Upserted all X vectors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline Complete!
```

### Neo4j Loading:
```
Loading environment variables from .env...
Running Neo4j loading script...
🚀 Agent Graph Loading Pipeline Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All clients initialized
✅ Created X Agent nodes
✅ Created X Skill nodes
✅ Created X Tool nodes
✅ Created X relationships
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline Complete!
```

## 🔍 Troubleshooting

### Error: .env file not found
Make sure you're in `services/ai-engine` and your `.env` file is at the project root (`../../.env`).

### Error: command not found: python
Use `python3` instead of `python` on macOS.

### Error: Missing environment variables
Check that your `.env` file contains:
- `SUPABASE_URL` (lines 14-18)
- `SUPABASE_SERVICE_KEY`
- `PINECONE_API_KEY` (lines 149-154)
- `OPENAI_API_KEY`
- `NEO4J_URI` (lines 38-41)
- `NEO4J_USER`
- `NEO4J_PASSWORD`

## 📖 More Details

For comprehensive documentation, see:
- `scripts/README_EXECUTION.md` - Full execution guide
- `../../PHASE_0_DATA_LOADING_STATUS.md` - Implementation status

