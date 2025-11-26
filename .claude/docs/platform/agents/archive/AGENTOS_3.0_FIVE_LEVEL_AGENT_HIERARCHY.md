# AgentOS 3.0 - Five-Level Agent Hierarchy

**Date:** November 24, 2025  
**System:** AgentOS 3.0 (Production)  
**Total Agents:** 319+ across all levels

---

## 📊 Overview: Hierarchical Deep Agent Architecture

AgentOS 3.0 implements a **5-level hierarchical agent system** inspired by organizational structures and designed for scalable, efficient AI orchestration. Each level has specific capabilities, autonomy, and coordination patterns.

```
Level 1: MASTER      (Orchestrators)      ─── Highest Autonomy
Level 2: EXPERT      (Domain Specialists) ─── User Selection Point  
Level 3: SPECIALIST  (Sub-Experts)        ─── Spawned by Experts
Level 4: WORKER      (Task Executors)     ─── Spawned by Specialists
Level 5: TOOL        (100+ Integrations)  ─── Lowest Autonomy
```

---

## 🏗️ The Five Levels

### Level 1: MASTER Agents (Orchestrators)

**Role:** High-level orchestration, multi-agent coordination, strategic decision-making

**Characteristics:**
- **Autonomy:** Highest
- **Scope:** Cross-domain, strategic
- **Can Spawn:** Experts, Specialists, Workers, Tools
- **Decision Authority:** Full autonomy over sub-agent selection
- **Use Cases:** Complex multi-step workflows, strategic planning

**Examples:**
- Master Clinical Strategy Orchestrator
- Master Regulatory Pathway Planner
- Master Market Access Strategy Director
- Master Drug Development Coordinator

**Capabilities:**
```python
{
  "can_spawn": ["EXPERT", "SPECIALIST", "WORKER", "TOOL"],
  "autonomy_level": "high",
  "decision_making": "strategic",
  "coordination_scope": "cross-domain",
  "max_sub_agents": 10,
  "requires_human_approval": false  # Tier 1-2 queries
}
```

**When to Use:**
- Multi-domain strategic questions
- Complex multi-step projects (e.g., IND submission end-to-end)
- Autonomous workflows (Mode 3)

---

### Level 2: EXPERT Agents (Domain Specialists) ⭐ USER SELECTION POINT

**Role:** Deep domain expertise in specific medical affairs / regulatory areas

**Characteristics:**
- **Autonomy:** High within domain
- **Scope:** Single domain, deep expertise
- **Can Spawn:** Specialists, Workers, Tools
- **Decision Authority:** Within domain boundaries
- **Use Cases:** Specific domain questions (90% of user queries)

**Count:** 319+ agents across Medical Affairs, Regulatory, R&D, Commercial

**Examples:**

**Medical Affairs (80+ agents):**
- EXPERT - Medical Information Specialist
- EXPERT - Medical Science Liaison Advisor
- EXPERT - Real-World Evidence Specialist
- EXPERT - Health Economics Specialist
- EXPERT - Medical Communications Manager
- EXPERT - Publication Strategy Lead

**Regulatory Affairs (40+ agents):**
- EXPERT - Regulatory Strategy Director
- EXPERT - IND/NDA Submission Lead
- EXPERT - Global Regulatory Affairs Manager
- EXPERT - Quality Assurance Manager
- EXPERT - Compliance & Audit Specialist

**Market Access (35+ agents):**
- EXPERT - Health Economics Manager
- EXPERT - Pricing Strategy Director
- EXPERT - Reimbursement Strategy Manager
- EXPERT - National Account Director
- EXPERT - Patient Access Director

**Clinical Development (30+ agents):**
- EXPERT - Clinical Trial Manager
- EXPERT - Clinical Data Manager
- EXPERT - Biostatistician
- EXPERT - Clinical Operations Lead

**Drug Safety (25+ agents):**
- EXPERT - Pharmacovigilance Lead
- EXPERT - Safety Surveillance Manager
- EXPERT - Adverse Event Specialist

**Capabilities:**
```python
{
  "can_spawn": ["SPECIALIST", "WORKER", "TOOL"],
  "autonomy_level": "high",
  "decision_making": "domain-specific",
  "coordination_scope": "within-domain",
  "max_sub_agents": 5,
  "requires_human_approval": false,  # Tier 1-2
  "rag_profile": "hybrid_enhanced",   # Default
  "can_request_panel": true
}
```

**When to Use:**
- **Mode 1 (Manual):** User explicitly selects expert
- **Mode 2 (Auto):** System selects via evidence-based selection
- **Direct domain questions:** "What are FDA IND requirements?"
- **Multi-turn conversations:** Maintained persona across messages

**User Interaction:**
```
User → Selects "Medical Information Specialist" (Level 2 EXPERT)
      ↓
Expert → Analyzes query complexity
      ↓
Expert → Spawns Specialist agents if needed (Level 3)
      ↓
Expert → Coordinates responses & synthesizes final answer
```

---

### Level 3: SPECIALIST Agents (Sub-Experts)

**Role:** Focused sub-domain expertise, spawned by Experts as needed

**Characteristics:**
- **Autonomy:** Medium
- **Scope:** Narrow sub-domain
- **Can Spawn:** Workers, Tools
- **Decision Authority:** Limited to specific tasks
- **Use Cases:** Complex questions requiring multiple perspectives

**Examples:**

**Medical Information Specialists:**
- SPECIALIST - Medical Librarian (literature search)
- SPECIALIST - Medical Writer - Scientific (content creation)
- SPECIALIST - Congress & Events Manager (event coverage)
- SPECIALIST - Medical Review Committee Coordinator

**Regulatory Specialists:**
- SPECIALIST - IND Document Specialist
- SPECIALIST - Labeling & Advertising Specialist
- SPECIALIST - Post-Market Surveillance Analyst

**Market Access Specialists:**
- SPECIALIST - HEOR Analyst (health economics)
- SPECIALIST - Contract Analyst (contracting)
- SPECIALIST - Gross-to-Net Analyst (pricing)
- SPECIALIST - Patient Access Coordinator

**Clinical Specialists:**
- SPECIALIST - Clinical Research Coordinator
- SPECIALIST - Site Management Specialist
- SPECIALIST - Patient Recruitment Coordinator

**Capabilities:**
```python
{
  "can_spawn": ["WORKER", "TOOL"],
  "autonomy_level": "medium",
  "decision_making": "task-specific",
  "coordination_scope": "narrow",
  "max_sub_agents": 3,
  "spawned_by": ["MASTER", "EXPERT"],
  "lifespan": "session-scoped"  # Exists only for current query
}
```

**When Spawned:**
- Expert detects query complexity > threshold
- Multiple sub-domains involved (e.g., regulatory + pricing)
- Specific expertise needed (e.g., statistical analysis)
- Panel discussion requested

**Example Flow:**
```
Query: "What are the regulatory and pricing implications of accelerated approval?"

EXPERT - Regulatory Strategy Director (Level 2)
  ├─ Spawns → SPECIALIST - Accelerated Approval Analyst (Level 3)
  └─ Spawns → SPECIALIST - Pricing Impact Analyst (Level 3)
              └─ Spawns → WORKER - Market Data Collector (Level 4)
```

---

### Level 4: WORKER Agents (Task Executors)

**Role:** Execute specific, well-defined tasks; operational support

**Characteristics:**
- **Autonomy:** Low
- **Scope:** Single task
- **Can Spawn:** Tools only
- **Decision Authority:** Minimal (execute assigned task)
- **Use Cases:** Data collection, document processing, calculations

**Examples:**

**Medical Affairs Workers:**
- WORKER - Medical Affairs Operations Manager
- WORKER - Hub Services Manager (patient support)
- WORKER - Literature Search Coordinator
- WORKER - Data Entry Specialist

**Regulatory Workers:**
- WORKER - Document Submission Coordinator
- WORKER - Regulatory Filing Administrator
- WORKER - Compliance Documentation Specialist

**Market Access Workers:**
- WORKER - Contracting Administrator
- WORKER - Pricing Data Analyst
- WORKER - Patient Assistance Program Coordinator

**Clinical Workers:**
- WORKER - Study Coordinator
- WORKER - Data Entry Specialist
- WORKER - Site Communication Coordinator

**Capabilities:**
```python
{
  "can_spawn": ["TOOL"],
  "autonomy_level": "low",
  "decision_making": "none",  # Follows instructions
  "coordination_scope": "single-task",
  "max_sub_agents": 0,  # Can only spawn tools
  "spawned_by": ["MASTER", "EXPERT", "SPECIALIST"],
  "lifespan": "task-scoped"  # Exists only for task duration
}
```

**When Spawned:**
- Data extraction needed (e.g., from FDA database)
- Document formatting required
- Repetitive task execution
- Parallel data collection

**Example Flow:**
```
SPECIALIST - HEOR Analyst (Level 3)
  └─ Spawns → WORKER - Market Data Collector (Level 4)
              ├─ Uses TOOL - FDA Database API (Level 5)
              ├─ Uses TOOL - Excel Calculator (Level 5)
              └─ Returns structured data to Specialist
```

---

### Level 5: TOOL Agents (100+ Integrations)

**Role:** Execute specific functions via APIs, databases, calculators

**Characteristics:**
- **Autonomy:** None (deterministic)
- **Scope:** Single function
- **Can Spawn:** Nothing
- **Decision Authority:** None (pure execution)
- **Use Cases:** API calls, calculations, database queries

**Count:** 100+ tools across categories

**Categories:**

**1. Search & Retrieval Tools (20+)**
- RAG Search (Pinecone + Supabase + pgvector)
- Web Search (Tavily, Brave, Google)
- Database Search (FDA, EMA, PMDA, ClinicalTrials.gov)
- PubMed Search
- Patent Search

**2. Regulatory Database Tools (15+)**
- FDA Drugs@FDA API
- FDA Orange Book API
- EMA Product Registry
- PMDA Database
- WHO INN Database
- ClinicalTrials.gov API

**3. Data Processing Tools (20+)**
- PDF Parser
- Excel Calculator
- CSV Processor
- JSON Validator
- Text Summarizer
- Statistical Calculator

**4. Communication Tools (10+)**
- Email Sender
- Slack Notifier
- Calendar Integrator
- Document Generator

**5. Analytics Tools (15+)**
- Sentiment Analysis
- Named Entity Recognition (spaCy)
- Keyword Extraction
- Topic Modeling
- Statistical Tests (T-test, ANOVA, Chi-square)

**6. Compliance Tools (10+)**
- HIPAA Checker
- GDPR Validator
- PHI Detector
- PII Redactor
- Audit Logger

**7. Specialized Medical Tools (10+)**
- Drug Interaction Checker
- Dosing Calculator
- BMI Calculator
- Clinical Risk Scores
- Lab Value Interpreter

**Capabilities:**
```python
{
  "can_spawn": [],  # Cannot spawn anything
  "autonomy_level": "none",
  "decision_making": "none",
  "coordination_scope": "single-function",
  "execution_type": "deterministic",
  "spawned_by": ["MASTER", "EXPERT", "SPECIALIST", "WORKER"],
  "lifespan": "single-execution"
}
```

**Tool Registry:**
```python
# All tools registered in tool_registry table
{
  "tool_id": UUID,
  "name": "FDA Drugs@FDA API",
  "tool_type": "api",
  "implementation_type": "rest_api",
  "input_schema": {...},  # JSON schema
  "output_schema": {...},
  "safety_scope": {
    "handles_phi": false,
    "handles_pii": false,
    "approved_domains": ["regulatory"]
  },
  "rate_limits": {...},
  "authentication_required": true
}
```

---

## 🔄 Agent Spawning & Coordination

### Spawning Rules

**1. Top-Down Spawning:**
```
MASTER → can spawn → EXPERT, SPECIALIST, WORKER, TOOL
EXPERT → can spawn → SPECIALIST, WORKER, TOOL
SPECIALIST → can spawn → WORKER, TOOL
WORKER → can spawn → TOOL
TOOL → cannot spawn
```

**2. Complexity-Based Spawning:**
```python
def should_spawn_sub_agents(query_complexity: float, agent_level: str) -> bool:
    if agent_level == "EXPERT":
        return query_complexity > 0.7  # High complexity
    elif agent_level == "SPECIALIST":
        return query_complexity > 0.8  # Very high complexity
    else:
        return False
```

**3. Session-Scoped Lifespan:**
- Sub-agents exist only for current query/session
- Destroyed after task completion
- State not persisted across queries

### Coordination Patterns

**Pattern 1: Sequential Execution**
```
EXPERT → SPECIALIST_1 (completes) → SPECIALIST_2 (completes) → Synthesis
```

**Pattern 2: Parallel Execution**
```
EXPERT → spawns [SPECIALIST_1, SPECIALIST_2, SPECIALIST_3] in parallel
       → waits for all to complete
       → synthesizes results
```

**Pattern 3: Hierarchical Delegation**
```
EXPERT → SPECIALIST_A
           └→ WORKER_1
               └→ TOOL_X
           └→ WORKER_2
               └→ TOOL_Y
       → SPECIALIST_B
           └→ TOOL_Z
```

**Pattern 4: Panel Discussion (Multi-Agent)**
```
User Query → System spawns panel of EXPERTS (Level 2)
           → EXPERT_1, EXPERT_2, EXPERT_3 discuss in parallel
           → Consensus or debate synthesis
           → Final recommendation
```

---

## 📊 Distribution Across Levels

### Current Agent Count by Level

| Level | Type | Count | Percentage | Use Case |
|-------|------|-------|------------|----------|
| 1 | MASTER | 5-10 | 2% | Strategic orchestration |
| 2 | EXPERT | 319+ | 85% | User-selected domain experts ⭐ |
| 3 | SPECIALIST | 40-50 | 10% | Sub-domain focus |
| 4 | WORKER | 10-15 | 2% | Task execution |
| 5 | TOOL | 100+ | N/A | Function execution |

**Level 2 (EXPERT) is the primary interaction point** - 85% of queries.

### By Department

**Medical Affairs: 80+ EXPERT agents**
- Medical Information, MSL, Publications, Med Comms, RWE

**Regulatory Affairs: 40+ EXPERT agents**
- Strategy, Submissions, Quality, Compliance, Safety

**Market Access: 35+ EXPERT agents**
- HEOR, Pricing, Reimbursement, Patient Access, Policy

**Clinical Development: 30+ EXPERT agents**
- Trial Design, Data Management, Biostats, Operations

**R&D: 25+ EXPERT agents**
- Discovery, Translational Medicine, Preclinical, CMC

**Commercial: 20+ EXPERT agents**
- Brand, Marketing, Sales, Digital Strategy

**Support Functions: 30+ EXPERT agents**
- Legal, Finance, HR, IT, Operations

---

## 🎯 Tier-Based Usage

### Tier 1 (Rapid Response)
- **Primary Level:** EXPERT only (no spawning)
- **Tools:** Minimal (RAG + basic search)
- **Complexity:** Low
- **Response Time:** < 5s

### Tier 2 (Expert Analysis)
- **Primary Level:** EXPERT
- **Can Spawn:** SPECIALIST (optional)
- **Tools:** Full RAG + web search + calculators
- **Complexity:** Medium
- **Response Time:** < 30s

### Tier 3 (Deep Reasoning + HITL)
- **Primary Level:** EXPERT or MASTER
- **Can Spawn:** SPECIALIST + WORKER + TOOL
- **Tools:** Full suite + regulatory DBs
- **Complexity:** High
- **Response Time:** < 120s
- **Human Oversight:** Required

---

## 💡 Implementation Details

### Database Schema

```sql
-- agents table (Level column)
ALTER TABLE agents ADD COLUMN agent_level TEXT 
CHECK (agent_level IN ('MASTER', 'EXPERT', 'SPECIALIST', 'WORKER', 'TOOL'));

-- Query agent distribution
SELECT 
    agent_level,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM agents
WHERE agent_level IS NOT NULL
GROUP BY agent_level
ORDER BY
    CASE agent_level
        WHEN 'MASTER' THEN 1
        WHEN 'EXPERT' THEN 2
        WHEN 'SPECIALIST' THEN 3
        WHEN 'WORKER' THEN 4
        WHEN 'TOOL' THEN 5
    END;
```

### LangGraph Implementation

```python
# From mode1_interactive_manual.py

class Mode1InteractiveManualWorkflow:
    """
    Deep Agent Architecture (5-Level Hierarchy):
    Level 1: Master Agents (Orchestrators)
    Level 2: Expert Agents (319+ Domain Specialists) ← USER SELECTS HERE
    Level 3: Specialist Agents (Sub-Experts, spawned as needed)
    Level 4: Worker Agents (Task Executors, spawned as needed)
    Level 5: Tool Agents (100+ integrations)
    """
    
    async def execute_expert_agent_node(self, state: UnifiedWorkflowState):
        """
        Execute the selected EXPERT agent (Level 2).
        Can spawn SPECIALIST (Level 3) and WORKER (Level 4) sub-agents.
        """
        query_complexity = state.get('complexity_score', 0.5)
        
        # Determine if sub-agents needed
        if query_complexity > 0.7:
            # Spawn SPECIALIST agents (Level 3)
            specialists = await self.spawn_specialist_agents(
                query=state['query'],
                domain=state['agent_profile']['domain']
            )
            
            # Specialists may spawn WORKER agents (Level 4)
            for specialist in specialists:
                if specialist.needs_data_collection():
                    worker = await self.spawn_worker_agent(
                        task="data_collection",
                        specialist_id=specialist.id
                    )
                    # Worker spawns TOOL agents (Level 5)
                    tools = await worker.execute_tools([
                        "fda_database_api",
                        "pubmed_search"
                    ])
```

### Spawning Service

```python
# services/sub_agent_spawner.py

class SubAgentSpawner:
    async def spawn_specialist(
        self,
        expert_id: UUID,
        task_type: str,
        context: dict
    ) -> SpecialistAgent:
        """Spawn Level 3 SPECIALIST from Level 2 EXPERT."""
        specialist = await self.db.fetch_one(
            """
            SELECT * FROM agents 
            WHERE agent_level = 'SPECIALIST'
              AND domain = $1
              AND capabilities @> $2
            ORDER BY success_rate DESC
            LIMIT 1
            """,
            context['domain'],
            [task_type]
        )
        return SpecialistAgent(specialist)
    
    async def spawn_worker(
        self,
        specialist_id: UUID,
        task: str
    ) -> WorkerAgent:
        """Spawn Level 4 WORKER from Level 3 SPECIALIST."""
        worker = await self.db.fetch_one(
            """
            SELECT * FROM agents
            WHERE agent_level = 'WORKER'
              AND task_type = $1
            LIMIT 1
            """,
            task
        )
        return WorkerAgent(worker)
```

---

## 📈 Usage Patterns

### Mode 1 (Manual Selection)
```
User selects: "EXPERT - Medical Information Specialist" (Level 2)
            ↓
Expert analyzes query complexity
            ↓
If complex → spawns SPECIALIST agents (Level 3)
            ↓
Specialists spawn WORKER agents (Level 4) if needed
            ↓
Workers execute TOOL agents (Level 5)
            ↓
Results flow back up the hierarchy
            ↓
Expert synthesizes final response
```

### Mode 2 (Automatic Selection)
```
User query: "What are FDA IND requirements?"
         ↓
Evidence-based selector scores all EXPERT agents (Level 2)
         ↓
Selects: "EXPERT - Regulatory Strategy Director"
         ↓
(Same spawning logic as Mode 1)
```

### Mode 3 (Autonomous Multi-Agent)
```
User query: Complex strategic question
         ↓
MASTER Orchestrator (Level 1) activated
         ↓
Spawns multiple EXPERT agents (Level 2) for panel
         ↓
Each EXPERT spawns SPECIALIST agents (Level 3) as needed
         ↓
Parallel execution + consensus building
         ↓
MASTER synthesizes final strategic recommendation
```

---

## 🎯 Best Practices

### 1. Level Selection
- **Default to Level 2 (EXPERT)** for 90% of queries
- **Use Level 1 (MASTER)** only for strategic, multi-domain questions
- **Don't directly select Level 3-5** - they're spawned automatically

### 2. Spawning Strategy
- **Spawn sparingly:** Only when complexity warrants
- **Parallel execution:** Spawn specialists in parallel when independent
- **Resource limits:** Max 5 sub-agents per level

### 3. Cost Optimization
- **Tier 1:** Use EXPERT only (no spawning)
- **Tier 2:** Spawn SPECIALIST only if needed
- **Tier 3:** Full hierarchy allowed

### 4. Human Oversight
- **Level 1 (MASTER):** Tier 3 requires HITL
- **Level 2 (EXPERT):** Tier 2-3 may require HITL
- **Level 3-5:** No direct HITL (controlled by parent)

---

## 📚 Further Reading

**Related Documentation:**
- `AGENTOS_3.0_IMPLEMENTATION_AUDIT.md` - Full system audit
- `AGENTOS_3.0_KNOWLEDGE_GRAPH_DOCS.md` - GraphRAG integration
- `EVIDENCE_BASED_SELECTION.md` - Agent selection algorithm

**Database Migrations:**
- `ALL_MIGRATIONS_CONSOLIDATED.sql` (line 74) - agent_level column
- `007_organizational_hierarchy.sql` - Level assignments

**Code References:**
- `langgraph_workflows/mode1_interactive_manual.py` (lines 78-83)
- `services/sub_agent_spawner.py` - Spawning logic
- `services/evidence_based_selector.py` - Selection by level

---

**Last Updated:** November 24, 2025  
**System Version:** AgentOS 3.0  
**Total Agents:** 319+ EXPERT agents + 50+ SPECIALIST + 15+ WORKER + 100+ TOOL
