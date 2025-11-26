# Agent Relationships & Data Loading Status

## Executive Summary

### ✅ What We Have

1. **Agent-to-Agent Relationships**: Schema exists (`agent_hierarchies` table)
2. **Data Loading Scripts**: Complete scripts for Pinecone, Neo4j, and skills
3. **Comprehensive Data Model**: Agents + Skills + Tools + Knowledge + Hierarchies

### ⚠️ What Needs To Be Done

1. **Load agent hierarchy relationships** (currently empty)
2. **Execute Pinecone loading script** (agents with full enrichment)
3. **Execute Neo4j loading script** (complete knowledge graph)

---

## Part 1: Agent-to-Agent Relationships Based on Levels

### Database Schema ✅ EXISTS

**Table**: `agent_hierarchies`

```sql
CREATE TABLE agent_hierarchies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Relationship
    parent_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    child_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Relationship Type
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'delegates_to',        -- Parent delegates work to child
        'supervises',          -- Parent supervises child's work
        'collaborates_with',   -- Peers working together
        'consults',            -- Parent consults child for expertise
        'escalates_to'         -- Child escalates to parent
    )),
    
    -- Delegation Rules
    delegation_trigger TEXT,
    auto_delegate BOOLEAN DEFAULT false,
    confidence_threshold NUMERIC(3,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT no_self_hierarchy CHECK (parent_agent_id != child_agent_id),
    UNIQUE(parent_agent_id, child_agent_id, relationship_type)
);
```

### 5-Level Agent Hierarchy

Based on your 489 agents, they are distributed across 5 levels:

1. **Level 1: Master Agents** (Top-tier orchestrators)
   - Example: "AI Drug Discovery Specialist", "Regulatory Strategist"
   - Role: Coordinate multiple expert agents
   - Relationships: `delegates_to` Level 2, `supervises` Level 2-3

2. **Level 2: Expert Agents** (Domain specialists)
   - Example: "Global Medical Science Liaison", "Clinical Trial Manager"
   - Role: Deep expertise in specific domains
   - Relationships: `escalates_to` Level 1, `delegates_to` Level 3, `consults` Level 2 peers

3. **Level 3: Specialist Agents** (Task-focused)
   - Example: "RWE Analyst", "Adverse Event Reporter"
   - Role: Execute specific analytical tasks
   - Relationships: `escalates_to` Level 2, `uses` Level 5 tools

4. **Level 4: Worker Agents** (Operational)
   - Example: Data processors, document parsers
   - Role: Execute repetitive tasks
   - Relationships: `escalates_to` Level 3

5. **Level 5: Tool Agents** (Pure execution)
   - Example: API callers, database queries
   - Role: Single-purpose tools
   - Relationships: `used_by` all levels

### Current Status ⚠️

**Problem**: The `agent_hierarchies` table is **EMPTY** - no relationships have been created yet.

**Solution Needed**: Create a script to populate relationships based on:
- Agent levels (master → expert → specialist → worker → tool)
- Business functions (agents in same function can collaborate)
- Departments (agents in same department have supervises relationships)
- Skills overlap (agents with shared skills can consult each other)

---

## Part 2: Pinecone Data Loading

### What Gets Loaded to Pinecone ✅

**Script**: `services/ai-engine/scripts/load_agents_to_pinecone.py`

#### Data Included Per Agent

**From agents table**:
- `id`, `name`, `description`, `system_prompt`
- `agent_level_id`, `status`
- `role_name`, `department_name`, `function_name`

**Enrichment Data (from junction tables)**:
- ✅ **Skills**: All skills assigned to agent (from `agent_skill_assignments`)
- ✅ **Tools**: All tools assigned to agent (from `agent_tool_assignments`)
- ✅ **Knowledge Domains**: All domains the agent knows (from `agent_knowledge_domains`)

#### Text Representation for Embedding

```python
def create_agent_text_representation(self, agent: Dict, enrichments: Dict) -> str:
    """
    Creates rich text representation:
    
    Agent Name: Global Medical Science Liaison
    Description: Expert in medical affairs and clinical liaison
    Role: Global Medical Science Liaison
    Department: Field Medical
    Function: Medical Affairs
    Skills: Clinical Communication, Literature Analysis, KOL Engagement, ...
    Tools: PubMed Search, Clinical Database, ...
    Knowledge Domains: Oncology, Immunotherapy, Clinical Trials, ...
    Expertise: You are a Global Medical Science Liaison...
    """
```

#### Vector Metadata Stored in Pinecone

```python
{
    'agent_id': 'uuid',
    'name': 'Agent Name',
    'description': 'First 500 chars',
    'type': 'agent',
    'status': 'active',
    'agent_level': 'expert',  # If available
    'role': 'Global Medical Science Liaison',
    'department': 'Field Medical',
    'function': 'Medical Affairs'
}
```

### Current Status ⚠️

**Problem**: Script has **NOT been executed** yet - no agents in Pinecone.

**Evidence**:
- Script exists and is complete
- Environment variables needed (check if set)
- No verification that it's been run

**How to Execute**:

```bash
cd services/ai-engine

# Activate virtual environment
source venv/bin/activate

# Set environment variables (if not already set)
export SUPABASE_URL="your_url"
export SUPABASE_SERVICE_KEY="your_key"
export PINECONE_API_KEY="your_key"
export OPENAI_API_KEY="your_key"

# Run the script
python scripts/load_agents_to_pinecone.py

# Or dry-run first to test
python scripts/load_agents_to_pinecone.py --dry-run
```

**Expected Output**:
```
🚀 Agent Embedding Pipeline Starting
✅ Fetched 489 active agents
✅ Fetched enrichment data for 489 agents
✅ Created 489 text representations
✅ Generated 489 embeddings
✅ Upserted all 489 vectors

Pipeline Complete!
   Total Agents: 489
   Total Vectors: 489
```

---

## Part 3: Neo4j Knowledge Graph Loading

### What Gets Loaded to Neo4j ✅

**Script**: `services/ai-engine/scripts/load_agents_to_neo4j.py`

#### Nodes Created

1. **Agent Nodes** (489 agents)
   ```cypher
   (:Agent {
       id: 'uuid',
       name: 'Agent Name',
       description: '...',
       agent_level: 'expert',
       role: 'Global Medical Science Liaison',
       department: 'Field Medical',
       function: 'Medical Affairs',
       status: 'active'
   })
   ```

2. **Skill Nodes** (58 skills from our seeding)
   ```cypher
   (:Skill {
       id: 'uuid',
       name: 'Clinical Communication',
       description: '...',
       category: 'healthcare',
       complexity_level: 'advanced'
   })
   ```

3. **Tool Nodes** (from tools table)
   ```cypher
   (:Tool {
       id: 'uuid',
       name: 'PubMed Search',
       description: '...',
       tool_type: 'search'
   })
   ```

4. **Knowledge Domain Nodes** (from knowledge_domains table)
   ```cypher
   (:KnowledgeDomain {
       id: 'uuid',
       name: 'Oncology',
       description: '...',
       domain_type: 'medical'
   })
   ```

#### Relationships Created

1. **HAS_SKILL** (Agent → Skill)
   ```cypher
   (agent)-[:HAS_SKILL {
       proficiency_level: 'expert',
       is_primary: true
   }]->(skill)
   ```
   - From: `agent_skill_assignments` table
   - Count: 66,391 relationships (489 agents × ~135 skills each)

2. **USES_TOOL** (Agent → Tool)
   ```cypher
   (agent)-[:USES_TOOL {
       is_primary: false
   }]->(tool)
   ```
   - From: `agent_tool_assignments` table

3. **KNOWS_ABOUT** (Agent → Knowledge Domain)
   ```cypher
   (agent)-[:KNOWS_ABOUT {
       expertise_level: 'advanced'
   }]->(knowledge)
   ```
   - From: `agent_knowledge_domains` table

4. **DELEGATES_TO** (Agent → Agent) ⚠️
   ```cypher
   (parent:Agent)-[:DELEGATES_TO {
       relationship_type: 'delegates_to',
       delegation_level: 1
   }]->(child:Agent)
   ```
   - From: `agent_hierarchies` table
   - **PROBLEM**: Table is empty, so NO agent-agent relationships yet

### Current Status ⚠️

**Problem**: Script has **NOT been executed** yet - Neo4j graph is empty.

**How to Execute**:

```bash
cd services/ai-engine

# Activate virtual environment
source venv/bin/activate

# Set environment variables
export NEO4J_URI="neo4j+s://your_uri"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your_password"
export SUPABASE_URL="your_url"
export SUPABASE_SERVICE_KEY="your_key"

# Run the script
python scripts/load_agents_to_neo4j.py

# Or with clear-existing flag to start fresh
python scripts/load_agents_to_neo4j.py --clear-existing
```

**Expected Output**:
```
🚀 Agent Graph Loading Pipeline Starting
✅ Created 489 Agent nodes
✅ Created 58 Skill nodes
✅ Created [X] Tool nodes
✅ Created [X] Knowledge Domain nodes
✅ Created 66,391 HAS_SKILL relationships
✅ Created [X] USES_TOOL relationships
✅ Created [X] KNOWS_ABOUT relationships
✅ Created 0 DELEGATES_TO relationships  ⚠️ (empty hierarchies table)

📊 Graph Verification Results:
   Nodes:
     - Agents: 489
     - Skills: 58
     - Tools: [X]
     - Knowledge Domains: [X]
   Relationships:
     - HAS_SKILL: 66,391
     - USES_TOOL: [X]
     - KNOWS_ABOUT: [X]
     - DELEGATES_TO: 0  ⚠️

Pipeline Complete!
```

---

## Part 4: Missing Piece - Agent Hierarchy Relationships

### Problem

The `agent_hierarchies` table is **EMPTY**. This means:
- ❌ No agent-to-agent relationships
- ❌ No delegation paths
- ❌ No escalation routes
- ❌ No collaboration networks

### Solution: Create Hierarchy Seeding Script

**File to Create**: `services/ai-engine/database/data/agents/seed_agent_hierarchies.sql`

```sql
-- ==========================================
-- SEED AGENT HIERARCHIES BASED ON LEVELS
-- ==========================================

-- Strategy:
-- 1. Master agents (Level 1) delegate to Expert agents (Level 2) in same function
-- 2. Expert agents (Level 2) delegate to Specialist agents (Level 3) in same department
-- 3. Specialist agents (Level 3) consult with peers in same department
-- 4. All agents can escalate to their direct supervisor

-- Master → Expert (delegates_to)
INSERT INTO agent_hierarchies (parent_agent_id, child_agent_id, relationship_type, auto_delegate, confidence_threshold)
SELECT 
    master.id as parent_agent_id,
    expert.id as child_agent_id,
    'delegates_to' as relationship_type,
    true as auto_delegate,
    0.85 as confidence_threshold
FROM agents master
CROSS JOIN agents expert
WHERE master.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Master')
  AND expert.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Expert')
  AND master.function_id = expert.function_id  -- Same business function
  AND master.id != expert.id
ON CONFLICT (parent_agent_id, child_agent_id, relationship_type) DO NOTHING;

-- Expert → Specialist (delegates_to)
INSERT INTO agent_hierarchies (parent_agent_id, child_agent_id, relationship_type, auto_delegate, confidence_threshold)
SELECT 
    expert.id as parent_agent_id,
    specialist.id as child_agent_id,
    'delegates_to' as relationship_type,
    true as auto_delegate,
    0.80 as confidence_threshold
FROM agents expert
CROSS JOIN agents specialist
WHERE expert.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Expert')
  AND specialist.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Specialist')
  AND expert.department_id = specialist.department_id  -- Same department
  AND expert.id != specialist.id
ON CONFLICT (parent_agent_id, child_agent_id, relationship_type) DO NOTHING;

-- Specialist → Worker (delegates_to)
INSERT INTO agent_hierarchies (parent_agent_id, child_agent_id, relationship_type, auto_delegate, confidence_threshold)
SELECT 
    specialist.id as parent_agent_id,
    worker.id as child_agent_id,
    'delegates_to' as relationship_type,
    true as auto_delegate,
    0.75 as confidence_threshold
FROM agents specialist
CROSS JOIN agents worker
WHERE specialist.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Specialist')
  AND worker.agent_level_id = (SELECT id FROM agent_levels WHERE name = 'Worker')
  AND specialist.department_id = worker.department_id
  AND specialist.id != worker.id
ON CONFLICT (parent_agent_id, child_agent_id, relationship_type) DO NOTHING;

-- Peer Collaboration (collaborates_with) - Agents in same level and department
INSERT INTO agent_hierarchies (parent_agent_id, child_agent_id, relationship_type, auto_delegate, confidence_threshold)
SELECT 
    a1.id as parent_agent_id,
    a2.id as child_agent_id,
    'collaborates_with' as relationship_type,
    false as auto_delegate,
    0.70 as confidence_threshold
FROM agents a1
CROSS JOIN agents a2
WHERE a1.agent_level_id = a2.agent_level_id  -- Same level
  AND a1.department_id = a2.department_id    -- Same department
  AND a1.id < a2.id  -- Avoid duplicates (a→b and b→a)
ON CONFLICT (parent_agent_id, child_agent_id, relationship_type) DO NOTHING;

-- Summary
SELECT 
    relationship_type,
    COUNT(*) as count
FROM agent_hierarchies
GROUP BY relationship_type
ORDER BY count DESC;
```

---

## Action Plan

### Step 1: Create Agent Hierarchies ⚠️ URGENT
```bash
# Run in Supabase SQL Editor
psql -f services/ai-engine/database/data/agents/seed_agent_hierarchies.sql
```

### Step 2: Load Agents to Pinecone 🔄 READY
```bash
cd services/ai-engine
source venv/bin/activate
python scripts/load_agents_to_pinecone.py
```

### Step 3: Load Complete Graph to Neo4j 🔄 READY
```bash
cd services/ai-engine
source venv/bin/activate
python scripts/load_agents_to_neo4j.py --clear-existing
```

### Step 4: Verify Everything ✅
```sql
-- Check Postgres
SELECT COUNT(*) FROM agent_hierarchies;
SELECT COUNT(*) FROM agent_skill_assignments;

-- Check if scripts ran
-- Look for vectors in Pinecone dashboard
-- Query Neo4j for graph stats
```

---

## Current Data Status

### ✅ Loaded and Complete

| Data Type | Count | Status | Location |
|-----------|-------|--------|----------|
| Agents | 489 | ✅ Complete | PostgreSQL |
| Agent Levels | 489/489 (100%) | ✅ Assigned | PostgreSQL |
| Functions | 489/489 (100%) | ✅ Assigned | PostgreSQL |
| Departments | 489/489 (100%) | ✅ Assigned | PostgreSQL |
| Roles | 489/489 (100%) | ✅ Assigned | PostgreSQL |
| Skills | 58 | ✅ Loaded | PostgreSQL |
| Agent-Skill Assignments | 66,391 | ✅ Complete | PostgreSQL |

### ⚠️ Not Loaded Yet

| Data Type | Expected Count | Status | Action Needed |
|-----------|---------------|--------|---------------|
| Agent Hierarchies | ~2,000-5,000 | ❌ Empty (0) | Run seed script |
| Pinecone Vectors | 489 agents | ❌ Not loaded | Run Python script |
| Neo4j Graph | 489 agents + relationships | ❌ Not loaded | Run Python script |

---

## Benefits After Full Loading

### Once Everything is Loaded

1. **Semantic Agent Search** (Pinecone)
   - Find agents by natural language description
   - Filter by level, role, department, function
   - Include skills, tools, knowledge in search

2. **Graph Traversal** (Neo4j)
   - Find delegation paths: Master → Expert → Specialist
   - Discover collaboration networks
   - Identify skill gaps and tool dependencies
   - Query: "Which agents can handle X and delegate to Y?"

3. **Evidence-Based Selection** (GraphRAG)
   - Combine vector search + graph traversal + SQL
   - Score agents by multiple factors
   - Provide evidence chains for selections

4. **Agent Orchestration** (LangGraph)
   - Use hierarchy to route queries
   - Auto-delegate based on confidence
   - Build multi-agent workflows

---

## Files Reference

### Scripts Created
1. ✅ `services/ai-engine/scripts/load_agents_to_pinecone.py`
2. ✅ `services/ai-engine/scripts/load_agents_to_neo4j.py`
3. ✅ `services/ai-engine/scripts/seed_all_skills_to_databases.py`
4. ⚠️ `services/ai-engine/database/data/agents/seed_agent_hierarchies.sql` (NEEDS TO BE CREATED)

### Database Tables
1. ✅ `agents` - 489 rows, fully populated
2. ✅ `agent_levels` - 5 rows (Master, Expert, Specialist, Worker, Tool)
3. ✅ `agent_skill_assignments` - 66,391 rows
4. ✅ `skills` - 58 rows
5. ✅ `org_functions`, `org_departments`, `org_roles` - Fully populated
6. ⚠️ `agent_hierarchies` - 0 rows (EMPTY)

---

**Status**: 📊 **90% Complete**

**Remaining Work**:
1. Create and run `seed_agent_hierarchies.sql` (30 min)
2. Run `load_agents_to_pinecone.py` (10 min)
3. Run `load_agents_to_neo4j.py` (10 min)

**Total Time to Complete**: ~1 hour

---

**Generated**: 2025-11-24  
**System**: AgentOS 3.0  
**Feature**: Agent Relationships & Multi-Database Loading  
**Status**: 90% Complete - Ready for Final Loading


