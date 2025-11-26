# Data Loading Scripts - Execution Guide

## ✅ Scripts Ready to Execute

All scripts have been fixed and are schema-compliant. They are ready to load data into:
1. **Pinecone** - Agent embeddings for semantic search
2. **Neo4j** - Agent graph relationships
3. **PostgreSQL (Supabase)** - Already loaded (KG metadata + skills)

---

## 🔧 Environment Variables

Based on your `.env` file, you should have these variables configured:

### Supabase (lines 14-18)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### Neo4j (lines 38-41)
```bash
NEO4J_URI=your_neo4j_uri
NEO4J_USER=your_neo4j_user
NEO4J_PASSWORD=your_neo4j_password
```

### API Keys (lines 149-154)
```bash
PINECONE_API_KEY=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 🚀 Execution Steps

### Step 1: Activate Virtual Environment (if using one)

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF
source venv/bin/activate  # or your venv path
```

### Step 2: Install Dependencies (if not already installed)

```bash
pip install structlog openai pinecone-client supabase neo4j
```

### Step 3: Load Environment Variables

If your `.env` file is in the project root:

```bash
# Option 1: Export from .env
set -a
source .env
set +a

# Option 2: Use python-dotenv (scripts already import dotenv)
# The scripts will automatically load from .env if present
```

### Step 4: Run Pinecone Loading Script

```bash
cd services/ai-engine

# Dry run first (to test without actually loading)
python scripts/load_agents_to_pinecone.py --dry-run

# Actual run
python scripts/load_agents_to_pinecone.py
```

**Expected Output:**
```
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
   Total Agents: X
   Total Vectors: X
   Time Elapsed: XX.XXs
```

### Step 5: Run Neo4j Loading Script

```bash
# Run without clearing existing data
python scripts/load_agents_to_neo4j.py

# Or clear existing data first (use with caution!)
python scripts/load_agents_to_neo4j.py --clear-existing
```

**Expected Output:**
```
🚀 Agent Graph Loading Pipeline Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All clients initialized
✅ Created X Agent nodes
✅ Created X Skill nodes
✅ Created X Tool nodes
✅ Created X KnowledgeDomain nodes
✅ Created X HAS_SKILL relationships
✅ Created X USES_TOOL relationships
✅ Created X KNOWS_ABOUT relationships
✅ Created X DELEGATES_TO relationships (hierarchies)
✅ Created X indexes for performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline Complete!
   Total Nodes: X
   Total Relationships: X
   Time Elapsed: XX.XXs
```

### Step 6: Verify Data Loading

```bash
python scripts/verify_data_loading.py
```

**Expected Output:**
```
🔍 Verifying Data Loading Across All Databases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PostgreSQL (Supabase):
  ✅ KG node_types: 8
  ✅ KG edge_types: 13
  ✅ Agent KG views: 10+
  ✅ Skills: 12+
  ✅ Agents (active): X

Pinecone:
  ✅ Index exists: vital-medical-agents
  ✅ Vector count: X (matches agent count)
  ✅ Sample query: Returns X results
  ✅ Metadata fields: name, role, department, function, status

Neo4j:
  ✅ Agent nodes: X
  ✅ Skill nodes: X
  ✅ Tool nodes: X
  ✅ KnowledgeDomain nodes: X
  ✅ Relationships: X
  ✅ Indexes: X

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL DATA LOADING VERIFIED!
```

---

## 🔍 Troubleshooting

### Error: Missing environment variables

```bash
❌ Missing required environment variables: SUPABASE_URL, PINECONE_API_KEY
```

**Solution**: Ensure all required environment variables are set. Check your `.env` file or export them manually:

```bash
export SUPABASE_URL="your_url"
export SUPABASE_SERVICE_KEY="your_key"
export PINECONE_API_KEY="your_key"
export OPENAI_API_KEY="your_key"
export NEO4J_URI="your_uri"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your_password"
```

### Error: Connection refused (Neo4j)

```bash
❌ Failed to connect to Neo4j: Connection refused
```

**Solution**: 
1. Ensure Neo4j is running
2. Check `NEO4J_URI` format: `neo4j+s://your-instance.neo4j.io` or `bolt://localhost:7687`
3. Verify credentials are correct

### Error: Index not found (Pinecone)

```bash
❌ Pinecone index 'vital-medical-agents' not found
```

**Solution**: The script will automatically create the index on first run. If you see this error, ensure you have:
1. Valid Pinecone API key
2. Correct Pinecone environment/cloud region configured
3. Sufficient quota in your Pinecone account

### Error: Column "is_active" does not exist

```bash
❌ column "is_active" does not exist
```

**Solution**: This means the scripts are not updated. The fixed scripts use `status = 'active'` instead. Ensure you're running the latest versions from this directory.

---

## 📊 What Gets Loaded

### Pinecone (Vector Database)

**Index Name**: `vital-medical-agents`  
**Dimension**: 1536 (OpenAI text-embedding-3-small)  
**Metric**: Cosine similarity

**Vector Metadata**:
- `agent_id` (UUID)
- `name` (Agent name)
- `description` (Agent description)
- `role` (Role name)
- `department` (Department name)
- `function` (Function name)
- `agent_level` (Master/Expert/Specialist/Worker/Tool)
- `status` ('active')
- `type` ('agent')

### Neo4j (Graph Database)

**Node Types**:
- `(:Agent)` - All active agents
- `(:Skill)` - All skills
- `(:Tool)` - All tools
- `(:KnowledgeDomain)` - All knowledge domains

**Relationship Types**:
- `(Agent)-[:HAS_SKILL]->(Skill)`
- `(Agent)-[:USES_TOOL]->(Tool)`
- `(Agent)-[:KNOWS_ABOUT]->(KnowledgeDomain)`
- `(Agent)-[:DELEGATES_TO]->(Agent)` - Hierarchies
- `(Agent)-[:COLLABORATES_WITH]->(Agent)` - Peer relationships

**Indexes Created**:
- Agent ID, name
- Skill ID, name
- Tool ID, name
- KnowledgeDomain ID, name

### PostgreSQL (Supabase) - Already Loaded ✅

**KG Metadata**:
- 8 node types (Agent, Skill, Tool, KnowledgeDomain, Drug, Disease, ClinicalTrial, Publication)
- 13 edge types (HAS_SKILL, USES_TOOL, KNOWS_ABOUT, DELEGATES_TO, etc.)
- 10+ agent KG views (default_view for all agents, medical_view for medical agents)

**Skills**:
- 12 skills (8 from skills-main folder + 4 existing)

---

## 🎯 Expected Timeline

| Task | Duration | Status |
|------|----------|--------|
| Parse skills | ~1 min | ✅ Done |
| SQL seed skills | ~10 sec | ✅ Done |
| SQL seed KG metadata | ~10 sec | ✅ Done |
| Load to Pinecone | ~5 min | 🚀 Ready |
| Load to Neo4j | ~5 min | 🚀 Ready |
| Verify loading | ~2 min | 📋 After 4 & 5 |

**Total Time**: ~12 minutes

---

## 📝 Next Steps After Data Loading

Once all data is loaded and verified:

1. **Phase 1: GraphRAG Foundation** (Week 1-2)
   - Create database clients (Postgres, Neo4j, Pinecone)
   - Implement RAG profile & KG view resolution
   - Implement vector, keyword, graph search + fusion
   - Build context & evidence chain builder
   - Create main GraphRAG service
   - Create API endpoint

2. **Phase 2: LangGraph Compilation** (Week 3-4)
   - Implement LangGraph compiler
   - Create node compilers
   - Implement Postgres checkpointer

3. **Continue with remaining phases...**

---

## 🔗 Related Documentation

- **Main Plan**: `AGENTOS_IMPLEMENTATION_PLAN_UPDATED.md`
- **Data Loading Plan**: `.vital-docs/vital-expert-docs/11-data-schema/agents/GRAPHRAG_DATA_LOADING_PLAN.md`
- **Status Report**: `PHASE_0_DATA_LOADING_STATUS.md`
- **Data Summary**: `DATA_LOADING_SUMMARY.md`

---

## ✅ Scripts Summary

All scripts use the correct schema:
- ✅ `status = 'active'` (not `is_active`)
- ✅ Direct columns: `role_name`, `department_name`, `function_name` (not metadata JSONB)
- ✅ Correct skill columns: `name`, `slug`, `description`, `category`, `complexity_level`
- ✅ Dynamic UUID resolution for KG metadata

**You're ready to go!** 🚀

