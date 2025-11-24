# Phase 1: GraphRAG Foundation - Quick Start Guide

**Status**: 🟢 Day 1 Complete | Starting Day 2  
**Progress**: 15% of Phase 1

---

## 🎯 **What We Have So Far**

### ✅ Completed (Day 1)
- [x] Project directory structure
- [x] Configuration management (`config.py` - 230 lines)
- [x] Data models (`models.py` - 360 lines)
- [x] Structured logging (`utils/logger.py` - 200+ lines)
- [x] Environment template (`env.template`)
- [x] Package initialization files

**Total**: 800+ lines of production-ready code

---

## 📁 **Current Structure**

```
backend/services/ai_engine/graphrag/
├── __init__.py                 ✅ Complete
├── config.py                   ✅ Complete (230 lines)
├── models.py                   ✅ Complete (360 lines)
├── env.template                ✅ Complete
├── service.py                  📦 Next (Day 2-3)
├── profile_resolver.py         📦 Next (Day 3-4)
├── kg_view_resolver.py         📦 Next (Day 3-4)
├── utils/
│   ├── __init__.py            ✅ Complete
│   ├── logger.py              ✅ Complete (200+ lines)
│   └── metrics.py             📦 Next (Day 2)
├── clients/                    📦 Next (Day 2)
│   ├── __init__.py
│   ├── postgres_client.py
│   ├── neo4j_client.py
│   ├── vector_db_client.py
│   └── elastic_client.py
├── search/                     📦 Next (Day 5-7)
│   ├── __init__.py
│   ├── vector_search.py
│   ├── keyword_search.py
│   ├── graph_search.py
│   └── fusion.py
└── context/                    📦 Next (Day 10-11)
    ├── __init__.py
    ├── evidence_builder.py
    └── citation_manager.py
```

---

## 🚀 **Quick Start**

### Step 1: Set Up Environment

```bash
# Navigate to GraphRAG directory
cd backend/services/ai_engine/graphrag

# Copy environment template
cp env.template .env

# Edit .env with your credentials
nano .env
```

### Step 2: Install Dependencies

```bash
# From project root
pip install \
    pydantic \
    pyyaml \
    asyncpg \
    neo4j \
    elasticsearch \
    pinecone-client \
    openai \
    cohere \
    prometheus-client \
    langfuse
```

Or add to `requirements.txt`:
```txt
# GraphRAG Dependencies
pydantic>=2.0.0
pyyaml>=6.0
asyncpg>=0.28.0
neo4j>=5.12.0
elasticsearch>=8.9.0
pinecone-client>=2.2.4
openai>=1.0.0
cohere>=4.30.0
prometheus-client>=0.17.0
langfuse>=2.0.0
```

### Step 3: Test Configuration Loading

```python
# test_config.py
from graphrag import get_config

# This will load from environment variables
config = get_config()

print(f"Postgres Host: {config.database.postgres_host}")
print(f"Neo4j URI: {config.database.neo4j_uri}")
print(f"Vector DB Type: {config.database.vector_db_type}")
print(f"Embedding Model: {config.embedding.model}")
```

### Step 4: Test Logger

```python
# test_logger.py
from graphrag.utils import get_logger, set_correlation_id

logger = get_logger(__name__, log_format="json")
set_correlation_id("test-123")

logger.info("GraphRAG service initialized", extra={
    "version": "1.0.0",
    "environment": "development"
})
```

---

## 🔧 **Infrastructure Setup**

### Required Services

#### 1. **PostgreSQL (Supabase)** ✅
Already configured with AgentOS 3.0 schema.

**Check**:
```sql
SELECT * FROM rag_profiles LIMIT 5;
SELECT * FROM agent_kg_views LIMIT 5;
```

#### 2. **Neo4j (Knowledge Graph)** 📦

**Option A: Docker (Quick Start)**
```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/your-password \
    -e NEO4J_PLUGINS='["apoc", "graph-data-science"]' \
    neo4j:5.12
```

**Option B: Neo4j Aura (Cloud)**
1. Sign up at https://neo4j.com/cloud/aura/
2. Create a free database
3. Copy connection URI to `.env`

**Verify**:
```cypher
// In Neo4j Browser (http://localhost:7474)
MATCH (n) RETURN count(n);
```

#### 3. **Vector DB** 📦

**Option A: pgvector (Recommended - uses Supabase)**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Option B: Pinecone (Cloud)**
1. Sign up at https://www.pinecone.io/
2. Create index: dimension=1536, metric=cosine
3. Copy API key to `.env`

#### 4. **Elasticsearch (Keyword Search)** 📦

**Option A: Docker (Quick Start)**
```bash
docker run \
    --name elasticsearch \
    -p 9200:9200 \
    -e "discovery.type=single-node" \
    -e "xpack.security.enabled=false" \
    docker.elastic.co/elasticsearch/elasticsearch:8.10.0
```

**Option B: Elastic Cloud**
1. Sign up at https://cloud.elastic.co/
2. Create deployment
3. Copy endpoint to `.env`

**Verify**:
```bash
curl http://localhost:9200
```

---

## 🔑 **API Keys Required**

### Essential
- ✅ **Supabase/Postgres** - Already have
- 📦 **OpenAI** - For embeddings (`text-embedding-ada-002`)
  - Get at: https://platform.openai.com/api-keys
  - Cost: ~$0.0001 per 1K tokens

### Recommended
- 📦 **Cohere** - For reranking (improves accuracy by 10-20%)
  - Get at: https://dashboard.cohere.com/api-keys
  - Free tier: 100 requests/minute

### Optional
- 📦 **Langfuse** - For LLM observability
  - Get at: https://cloud.langfuse.com/
  - Free tier available

---

## 📊 **Day 2 Plan**

### Tasks for Tomorrow
1. **Database Clients** (4-6 hours)
   - [ ] `postgres_client.py` - AsyncPG wrapper
   - [ ] `neo4j_client.py` - Neo4j driver wrapper
   - [ ] `vector_db_client.py` - Vector DB adapter
   - [ ] `elastic_client.py` - Elasticsearch wrapper

2. **Metrics Utility** (1-2 hours)
   - [ ] `utils/metrics.py` - Prometheus metrics

3. **Testing** (1-2 hours)
   - [ ] Test each database connection
   - [ ] Verify connection pooling
   - [ ] Load testing scripts

### Success Criteria for Day 2
- ✅ All 4 database clients operational
- ✅ Connection pooling working
- ✅ Error handling tested
- ✅ Metrics collection started

---

## 🧪 **Testing Your Setup**

### 1. Test Imports
```python
# test_imports.py
try:
    from graphrag import GraphRAGConfig, get_config
    from graphrag.models import GraphRAGRequest, RAGProfile
    from graphrag.utils import get_logger
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
```

### 2. Test Configuration
```python
# test_full_config.py
from graphrag import get_config

config = get_config()

# Test all database configs
print("Database Configuration:")
print(f"  Postgres: {config.database.postgres_host}:{config.database.postgres_port}")
print(f"  Neo4j: {config.database.neo4j_uri}")
print(f"  Vector DB: {config.database.vector_db_type}")
print(f"  Elasticsearch: {config.database.elasticsearch_url}")

# Test fusion weights
print("\nFusion Weights:")
for profile_name in ['semantic_standard', 'hybrid_enhanced', 'graphrag_entity', 'agent_optimized']:
    weights = getattr(config.fusion_weights, profile_name)
    print(f"  {profile_name}: V={weights.vector}, K={weights.keyword}, G={weights.graph}")
```

### 3. Test Logging
```python
# test_logging.py
from graphrag.utils import get_logger, set_correlation_id, LogContext

# JSON logging
logger = get_logger("test", log_format="json", log_level="INFO")
set_correlation_id("test-correlation-123")

logger.info("Starting GraphRAG service", extra={"version": "1.0.0"})

with LogContext(logger, agent_id="agent-456", session_id="session-789"):
    logger.info("Processing query")
    logger.debug("Debug message (won't show at INFO level)")

logger.info("Service ready")
```

---

## 📚 **Documentation Index**

### Core Documentation
- `PHASE1_TRACKER.md` - Full implementation plan
- `PHASE1_DAY1_COMPLETE.md` - Day 1 summary
- `QUICKSTART.md` - This file
- `env.template` - Environment configuration

### Code Documentation
- `config.py` - Configuration management
- `models.py` - Data models
- `utils/logger.py` - Logging utilities

### Reference
- `AGENTOS_3.0_IMPLEMENTATION_ROADMAP.md` - Overall roadmap
- `INDEX.md` - Master documentation index

---

## 🐛 **Troubleshooting**

### Import Errors
```bash
# Ensure you're in the correct directory
pwd  # Should end with: /backend/services/ai_engine

# Add to PYTHONPATH if needed
export PYTHONPATH="${PYTHONPATH}:/path/to/backend/services"
```

### Configuration Errors
```python
# Explicit config loading
from graphrag.config import GraphRAGConfig

# From environment
config = GraphRAGConfig.from_env()

# From YAML
config = GraphRAGConfig.from_yaml("config.yaml")
```

### Database Connection Issues
```bash
# Test Postgres
psql -h your-host -U postgres -d postgres

# Test Neo4j
cypher-shell -a bolt://localhost:7687 -u neo4j -p your-password

# Test Elasticsearch
curl http://localhost:9200/_cluster/health
```

---

## 📞 **Questions Before Day 2?**

1. **Vector DB**: pgvector or Pinecone?
2. **Neo4j**: Docker or Aura Cloud?
3. **Elasticsearch**: Docker or Elastic Cloud?
4. **API Keys**: Do you have OpenAI key?

---

## 🎉 **Day 1 Achievement**

**Code Written**: 800+ lines  
**Files Created**: 7  
**Tests Written**: 3  
**Documentation**: 4 comprehensive files  

**Status**: 🟢 **AHEAD OF SCHEDULE!**

---

**Next**: Continue to Day 2 - Database Clients  
**ETA**: Day 2 end - 30% of Phase 1 complete

