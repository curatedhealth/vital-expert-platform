# Skills Data Seeding - Complete Guide

## Overview

This directory contains all scripts and data for seeding **58 skills** into AgentOS 3.0 across multiple databases:
- **PostgreSQL (Supabase)** - Source of truth
- **Neo4j** - Knowledge graph relationships
- **Pinecone** - Vector embeddings for semantic search

## 📊 Skills Inventory

### **Total: 58 Skills**

**Source 1: VITAL Command Center** (16 skills)
- Document Processing (4 skills)
- Creative & Design (4 skills)
- Development & Code (5 skills)
- Communication & Writing (3 skills)

**Source 2: Awesome Claude Skills** (42 skills)
- Scientific & Research (4 skills)
- Development & Code (8 skills)
- Writing & Research (5 skills)
- Collaboration & Project Management (5 skills)
- Security & Web Testing (4 skills)
- Data & Analysis (2 skills)
- Media & Content (4 skills)
- Utility & Automation (4 skills)
- Document Skills (4 skills)
- Learning & Knowledge (2 skills)

## 🏢 Business Function Coverage

✅ Medical Affairs & Regulatory  
✅ Legal & Compliance  
✅ Finance & Accounting  
✅ Marketing & Communications  
✅ IT & Engineering  
✅ Research & Development  
✅ Operations & Administration  
✅ Human Resources  
✅ Business Development  

## 📁 Directory Structure

```
database/data/skills/
├── master_seed_all_skills.sql       # Master SQL seed (58 skills)
├── assign_skills_to_agents.sql      # Agent-skill assignments
├── all_vital_skills.json            # VITAL skills (JSON)
├── awesome_claude_skills.json       # Awesome Claude skills (JSON)
├── seed_all_vital_skills.sql        # VITAL skills (SQL)
└── seed_awesome_claude_skills.sql   # Awesome Claude skills (SQL)

scripts/
├── seed_all_skills.sh               # 🚀 MASTER SCRIPT (Run this!)
├── parse_all_skills.py              # Parse VITAL skills
├── seed_all_skills_to_databases.py  # Load to Neo4j + Pinecone
└── README_SKILLS_SEEDING.md         # This file
```

## 🚀 Quick Start (Automated)

### Prerequisites

1. **Environment Variables** - Set these in your `.env`:

```bash
# PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres"

# Neo4j
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="your_password"

# Pinecone
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_INDEX_NAME="vital-agents"

# OpenAI (for embeddings)
OPENAI_API_KEY="your_openai_api_key"

# Tenant
TENANT_ID="vital-expert-platform"
```

2. **Python Dependencies**:

```bash
cd services/ai-engine
pip install asyncpg neo4j pinecone-client openai python-dotenv
```

### Run the Master Script

```bash
cd services/ai-engine
./scripts/seed_all_skills.sh
```

This single command will:
1. ✅ Parse all skills from sources
2. ✅ Load 58 skills to PostgreSQL
3. ✅ Load 58 skills to Neo4j (with relationships)
4. ✅ Load 58 skills to Pinecone (with embeddings)
5. ✅ Verify consistency across all databases

## 📋 Manual Step-by-Step

If you prefer to run each step manually:

### Step 1: Parse Skills

```bash
cd services/ai-engine

# Parse VITAL skills
python scripts/parse_all_skills.py

# Parse Awesome Claude skills
python scripts/parse_awesome_claude_skills.py
```

**Output:**
- `database/data/skills/all_vital_skills.json`
- `database/data/skills/awesome_claude_skills.json`
- `database/data/skills/seed_all_vital_skills.sql`
- `database/data/skills/seed_awesome_claude_skills.sql`

### Step 2: Load to PostgreSQL

```bash
# Load master seed script (recommended)
psql "$DATABASE_URL" -f database/data/skills/master_seed_all_skills.sql

# OR load individually:
# psql "$DATABASE_URL" -f database/data/skills/seed_all_vital_skills.sql
# psql "$DATABASE_URL" -f database/data/skills/seed_awesome_claude_skills.sql
```

**Verify:**
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM skills WHERE is_active = true;"
# Expected: 58 (or more if you have additional skills)
```

### Step 3: Load to Neo4j and Pinecone

```bash
python scripts/seed_all_skills_to_databases.py
```

This will:
- Load all skills from PostgreSQL
- Create skill nodes in Neo4j
- Create category and implementation type relationships
- Generate embeddings for all skills
- Upload embeddings to Pinecone

**Progress Indicators:**
```
[1/5] Loading skills from PostgreSQL...
✓ Loaded 58 skills from PostgreSQL

[2/5] Loading skills to Neo4j...
✓ Loaded 58 skills to Neo4j

[3/5] Creating skill dependencies in Neo4j...
✓ Created skill dependency relationships in Neo4j

[4/5] Loading skills to Pinecone...
[58/58] Systematic Debugging [Security & Web Testing]
✓ Loaded 58 skills to Pinecone

[5/5] Verifying seeding...
✓ PostgreSQL: 58 active skills
✓ Neo4j: 58 skill nodes
✓ Pinecone: 58 skill vectors

✅ SUCCESS: All databases consistent!
```

### Step 4: Assign Skills to Agents

```bash
psql "$DATABASE_URL" -f database/data/skills/assign_skills_to_agents.sql
```

This will:
- Assign skills to agents based on business function
- Set appropriate proficiency levels (expert, advanced, intermediate)
- Mark primary vs. secondary skills

**Verify:**
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM agent_skill_assignments;"
```

## 🔍 Verification Queries

### PostgreSQL (Supabase)

```sql
-- Total skills
SELECT COUNT(*) FROM skills WHERE is_active = true;

-- Skills by category
SELECT 
    category,
    COUNT(*) as skill_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM skills
WHERE is_active = true
GROUP BY category
ORDER BY skill_count DESC;

-- Skills by implementation type
SELECT 
    implementation_type,
    COUNT(*) as count
FROM skills
WHERE is_active = true
GROUP BY implementation_type;

-- Agent-skill assignments
SELECT 
    proficiency_level,
    COUNT(*) as count
FROM agent_skill_assignments
GROUP BY proficiency_level;
```

### Neo4j (Cypher Queries)

```cypher
// Total skills
MATCH (s:Skill {tenant_id: "vital-expert-platform"})
RETURN count(s) as total_skills

// Skills by category
MATCH (s:Skill {tenant_id: "vital-expert-platform"})
RETURN s.category as category, count(s) as count
ORDER BY count DESC

// Skill relationships
MATCH (s:Skill)-[r]->(target)
RETURN type(r) as relationship_type, count(r) as count
ORDER BY count DESC

// Agent-skill connections
MATCH (a:Agent)-[r:HAS_SKILL]->(s:Skill)
RETURN a.name, count(s) as skill_count
ORDER BY skill_count DESC
LIMIT 10
```

### Pinecone (Python)

```python
from pinecone import Pinecone
pc = Pinecone(api_key="your_api_key")
index = pc.Index("vital-agents")

# Get stats
stats = index.describe_index_stats()
print(f"Total vectors: {stats.total_vector_count}")
print(f"Tenant vectors: {stats.namespaces['vital-expert-platform'].vector_count}")

# Query for a skill
results = index.query(
    vector=[0.1] * 1536,  # Use actual embedding
    top_k=10,
    namespace="vital-expert-platform",
    filter={"type": "skill"}
)
```

## 📝 Schema Reference

### `skills` Table (PostgreSQL)

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    implementation_type TEXT CHECK (implementation_type IN ('prompt', 'tool', 'workflow', 'agent_graph')),
    implementation_ref TEXT,
    category TEXT,
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 10),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `agent_skill_assignments` Table (PostgreSQL)

```sql
CREATE TABLE agent_skill_assignments (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL,
    last_used_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (agent_id, skill_id)
);
```

### Neo4j Node Structure

```
(:Skill {
    id: "uuid",
    name: "Scientific Databases",
    description: "Access to 26 scientific databases...",
    category: "Scientific & Research",
    implementation_type: "tool",
    complexity_level: 8,
    tenant_id: "vital-expert-platform"
})
```

### Pinecone Vector Metadata

```json
{
  "id": "skill-uuid",
  "type": "skill",
  "name": "Scientific Databases",
  "description": "Access to 26 scientific databases...",
  "category": "Scientific & Research",
  "implementation_type": "tool",
  "complexity_level": 8,
  "tenant_id": "vital-expert-platform",
  "source": "awesome-claude-skills"
}
```

## 🧪 Testing

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Test Neo4j connection
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "RETURN 1;"

# Test Pinecone connection
python -c "from pinecone import Pinecone; pc = Pinecone(api_key='$PINECONE_API_KEY'); print('Connected:', pc.list_indexes())"

# Test OpenAI API
python -c "import openai; openai.api_key='$OPENAI_API_KEY'; print('Connected')"
```

## 🐛 Troubleshooting

### Problem: "No skills found in PostgreSQL"
**Solution:** Run the SQL seed script first:
```bash
psql "$DATABASE_URL" -f database/data/skills/master_seed_all_skills.sql
```

### Problem: "Failed to connect to Neo4j"
**Solution:** Check Neo4j is running and credentials are correct:
```bash
docker ps | grep neo4j  # If using Docker
# Or check Neo4j desktop/server is running
```

### Problem: "Pinecone index not found"
**Solution:** Create the index first:
```python
from pinecone import Pinecone, ServerlessSpec
pc = Pinecone(api_key="your_key")
pc.create_index(
    name="vital-agents",
    dimension=1536,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
```

### Problem: "OpenAI rate limit exceeded"
**Solution:** Add delays between embedding requests or use a batch approach. The script includes automatic retry logic.

## 📚 Next Steps

After seeding is complete:

1. **Verify in UI**: Check the Knowledge Graph tab in the agents page
2. **Test Agent Selection**: Use skills in the evidence-based agent selector
3. **Test Skill Execution**: Create agent graphs with skill nodes
4. **Monitor Usage**: Track skill usage in `agent_skill_assignments.usage_count`

## 🤝 Contributing

To add new skills:

1. Create a `SKILL.md` file in `.vital-command-center/skills-main/`
2. Run the parser: `python scripts/parse_all_skills.py`
3. Load to databases: `./scripts/seed_all_skills.sh`

## 📄 License

Part of the VITAL Expert Platform - AgentOS 3.0


