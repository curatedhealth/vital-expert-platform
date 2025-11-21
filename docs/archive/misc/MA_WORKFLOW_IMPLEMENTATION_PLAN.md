# Medical Affairs Workflow Implementation Plan

## Overview

This document outlines the complete implementation plan for adding workflows, tasks, agents, tools, and RAG sources to Medical Affairs JTBDs, enabling full execution capabilities similar to Digital Health use cases.

---

## Current State Analysis

### Database Schema Status

**Existing Tables:**
- ✅ `jtbd_library` - 120 Medical Affairs JTBDs with Strategic Pillar categorization
- ✅ `dh_workflow` - Workflow table (currently UUID-based, DH use cases only)
- ✅ `dh_task` - Task table (linked to workflows)
- ✅ `dh_agent` - AI agent definitions
- ✅ `dh_tool` - Tool definitions
- ✅ `dh_rag_source` - RAG knowledge source definitions
- ✅ `dh_task_agent` - Task-to-agent assignments
- ✅ `dh_task_tool` - Task-to-tool assignments
- ✅ `dh_task_rag` - Task-to-RAG assignments

**Problem:**
- `dh_workflow.use_case_id` is UUID type → incompatible with `jtbd_library.id` (VARCHAR)
- Current workflows cannot link to JTBDs

---

## Solution Architecture

### Option A: Dual-ID Column Approach (RECOMMENDED)

**Add UUID column to jtbd_library:**

```sql
-- Migration: Add UUID column to jtbd_library
ALTER TABLE jtbd_library
ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();

-- Create index for performance
CREATE INDEX idx_jtbd_library_uuid ON jtbd_library(uuid_id);

-- Update existing records with UUIDs (already done by DEFAULT)
```

**Benefits:**
- ✅ Minimal schema changes
- ✅ Reuse existing `dh_workflow` table
- ✅ Maintain VARCHAR id for human-readable codes
- ✅ UUID for internal linking

**Mapping:**
- `jtbd_library.id` = "JTBD-MA-042" (human-readable, used in URLs)
- `jtbd_library.uuid_id` = "a1b2c3d4-..." (UUID, used for workflow linking)

---

### Option B: Separate MA Workflow Tables

**Create dedicated MA tables:**

```sql
CREATE TABLE ma_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id VARCHAR(20) REFERENCES jtbd_library(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ma_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES ma_workflow(id),
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Benefits:**
- ✅ Clean separation between DH and MA
- ✅ Independent evolution
- ⚠️ More code duplication

---

## Recommended Implementation: Option A

We'll use **Option A** (Dual-ID approach) for simplicity and code reuse.

---

## Phase 1: Database Schema Updates

### Step 1.1: Add UUID to jtbd_library

```sql
-- File: supabase/migrations/20251109_add_uuid_to_jtbd_library.sql

-- Add UUID column
ALTER TABLE jtbd_library
ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();

-- Create index
CREATE INDEX IF NOT EXISTS idx_jtbd_library_uuid ON jtbd_library(uuid_id);

-- Add unique constraint
ALTER TABLE jtbd_library
ADD CONSTRAINT jtbd_library_uuid_unique UNIQUE (uuid_id);

COMMENT ON COLUMN jtbd_library.uuid_id IS 'UUID for internal linking to workflows (use id for external references)';
```

### Step 1.2: Update API to Return Both IDs

```typescript
// In /api/workflows/usecases/route.ts
const jtbdAsUseCases = jtbds?.map(jtbd => ({
  id: jtbd.id,                    // VARCHAR: "JTBD-MA-042"
  uuid_id: jtbd.uuid_id,          // UUID: for workflow linking
  code: jtbd.jtbd_code || jtbd.id,
  // ... rest of fields
}));
```

### Step 1.3: Update Workflow Query to Use uuid_id

```typescript
// In /api/workflows/usecases/[code]/complete/route.ts
if (useCase.uuid_id && isValidUuid(useCase.uuid_id)) {
  const workflows = await supabase
    .from('dh_workflow')
    .select('*')
    .eq('use_case_id', useCase.uuid_id)  // Use uuid_id instead of id
    .order('position', { ascending: true });
}
```

---

## Phase 2: Sample Workflow Data

### Top 5 Priority JTBDs for Workflow Creation

Based on Strategic Pillar distribution:

1. **JTBD-MA-001** (SP01: Growth & Market Access)
   - Annual Strategic Planning & Market Assessment
   - **Workflows:** 3
   - **Tasks:** ~15

2. **JTBD-MA-015** (SP02: Scientific Excellence)
   - Medical Information Response Management
   - **Workflows:** 2
   - **Tasks:** ~10

3. **JTBD-MA-030** (SP03: Stakeholder Engagement)
   - KOL Identification and Engagement Planning
   - **Workflows:** 3
   - **Tasks:** ~12

4. **JTBD-MA-046** (SP04: Compliance & Quality)
   - Off-Label Inquiry Handling
   - **Workflows:** 2
   - **Tasks:** ~8

5. **JTBD-MA-062** (SP05: Operational Excellence)
   - Budget Planning and Resource Allocation
   - **Workflows:** 2
   - **Tasks:** ~10

**Total:** 12 workflows, ~55 tasks

---

## Phase 3: Workflow Structure Examples

### Example: JTBD-MA-001 - Annual Strategic Planning

**Workflow 1: Situational Analysis**

```typescript
{
  name: "Situational Analysis & Market Assessment",
  description: "Comprehensive analysis of internal capabilities, market landscape, and competitive positioning",
  position: 1,
  metadata: {
    estimatedDuration: 240, // 4 hours
    complexity: "ADVANCED",
    requiredRoles: ["Medical Affairs Director", "Market Insights Analyst"]
  }
}
```

**Tasks:**
1. **Environmental Scan**
   - Objective: Analyze external factors (regulatory, competitive, payer landscape)
   - Agents: Market Intelligence Agent, Regulatory Scanner
   - Tools: Web Search, Document Analysis
   - RAG: FDA Guidance Database, Competitor Intelligence

2. **Internal Capability Assessment**
   - Objective: Evaluate current MA team capabilities, resources, and gaps
   - Agents: Resource Analysis Agent
   - Tools: Survey Tool, Gap Analysis Framework
   - RAG: Historical Performance Data

3. **SWOT Analysis Generation**
   - Objective: Synthesize findings into strategic framework
   - Agents: Strategic Planning Agent
   - Tools: SWOT Framework Template
   - RAG: Industry Best Practices

**Workflow 2: Strategic Objective Setting**

**Tasks:**
1. **Stakeholder Input Collection**
2. **Priority Ranking**
3. **Objective Definition**
4. **KPI Development**

**Workflow 3: Resource Allocation & Roadmap**

**Tasks:**
1. **Budget Modeling**
2. **Timeline Development**
3. **Risk Assessment**
4. **Approval Package Creation**

---

## Phase 4: Agent, Tool, and RAG Source Definitions

### Medical Affairs-Specific Agents

```typescript
const MA_AGENTS = [
  {
    code: "AGT_MA_STRATEGIC_PLANNER",
    name: "Strategic Planning Agent",
    type: "COORDINATOR",
    description: "Facilitates annual planning process, synthesizes inputs",
    model: "claude-3-5-sonnet-20241022",
    system_prompt: `You are a Medical Affairs strategic planning expert...`,
    capabilities: ["strategic_analysis", "stakeholder_synthesis", "objective_setting"]
  },
  {
    code: "AGT_MA_MED_INFO",
    name: "Medical Information Specialist Agent",
    type: "EXECUTOR",
    description: "Responds to medical information inquiries with evidence-based answers",
    model: "claude-3-5-sonnet-20241022",
    capabilities: ["literature_search", "evidence_synthesis", "response_drafting"]
  },
  {
    code: "AGT_MA_KOL_IDENTIFIER",
    name: "KOL Identification Agent",
    type: "ANALYZER",
    description: "Identifies and profiles key opinion leaders in therapeutic areas",
    capabilities: ["pubmed_search", "citation_analysis", "profile_generation"]
  },
  {
    code: "AGT_MA_COMPLIANCE_CHECKER",
    name: "Compliance Review Agent",
    type: "VALIDATOR",
    description: "Reviews content for regulatory compliance and off-label restrictions",
    capabilities: ["compliance_scan", "risk_flagging", "recommendation_generation"]
  },
  {
    code: "AGT_MA_BUDGET_ANALYST",
    name: "Budget Analysis Agent",
    type: "ANALYZER",
    description: "Analyzes budget scenarios and resource allocation options",
    capabilities: ["financial_modeling", "scenario_analysis", "roi_calculation"]
  }
];
```

### Medical Affairs-Specific Tools

```typescript
const MA_TOOLS = [
  {
    code: "TOOL_PUBMED_SEARCH",
    name: "PubMed Literature Search",
    category: "RESEARCH",
    description: "Search biomedical literature database",
    api_endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
    authentication_required: false
  },
  {
    code: "TOOL_SWOT_FRAMEWORK",
    name: "SWOT Analysis Template",
    category: "PLANNING",
    description: "Structured framework for strategic analysis",
    template_url: "/templates/swot_analysis.json"
  },
  {
    code: "TOOL_KOL_DATABASE",
    name: "KOL Database",
    category: "DATA",
    description: "Internal KOL profiles and engagement history",
    database_connection: "kol_profiles_db"
  },
  {
    code: "TOOL_COMPLIANCE_SCANNER",
    name: "Promotional Material Compliance Scanner",
    category: "VALIDATION",
    description: "Scans content for off-label, claims, and regulatory issues"
  },
  {
    code: "TOOL_BUDGET_MODEL",
    name: "MA Budget Planning Model",
    category: "ANALYTICS",
    description: "Excel-based budget modeling tool",
    file_type: "XLSX"
  }
];
```

### Medical Affairs-Specific RAG Sources

```typescript
const MA_RAG_SOURCES = [
  {
    code: "RAG_FDA_GUIDANCE",
    name: "FDA Guidance Documents",
    source_type: "DOCUMENT_COLLECTION",
    description: "All FDA guidance relevant to Medical Affairs activities",
    embedding_model: "text-embedding-3-large",
    chunk_size: 1000,
    last_updated: "2025-01-01"
  },
  {
    code: "RAG_CLINICAL_TRIALS",
    name: "Clinical Trial Database",
    source_type: "STRUCTURED_DATA",
    description: "Company clinical trial results and protocols",
    access_level: "INTERNAL_ONLY"
  },
  {
    code: "RAG_COMPETITOR_INTEL",
    name: "Competitive Intelligence Repository",
    source_type: "DOCUMENT_COLLECTION",
    description: "Competitor product information, publications, and launches"
  },
  {
    code: "RAG_MA_BEST_PRACTICES",
    name: "Medical Affairs Best Practices Library",
    source_type: "KNOWLEDGE_BASE",
    description: "Industry standards, SOPs, and playbooks for MA functions"
  },
  {
    code: "RAG_MEDICAL_LITERATURE",
    name: "Curated Medical Literature",
    source_type: "VECTOR_STORE",
    description: "Key publications relevant to therapeutic areas",
    embedding_model: "text-embedding-3-large"
  }
];
```

---

## Phase 5: Implementation Scripts

### Script 1: Database Migration

```sql
-- File: scripts/create_ma_workflows.sql

-- JTBD-MA-001: Annual Strategic Planning
DO $$
DECLARE
  jtbd_uuid UUID;
  workflow1_id UUID;
  workflow2_id UUID;
  workflow3_id UUID;
  task_id UUID;
BEGIN
  -- Get JTBD UUID
  SELECT uuid_id INTO jtbd_uuid FROM jtbd_library WHERE id = 'JTBD-MA-001';

  -- Workflow 1: Situational Analysis
  INSERT INTO dh_workflow (id, use_case_id, name, description, position, metadata)
  VALUES (
    gen_random_uuid(),
    jtbd_uuid,
    'Situational Analysis & Market Assessment',
    'Comprehensive analysis of internal capabilities, market landscape, and competitive positioning',
    1,
    '{"estimatedDuration": 240, "complexity": "ADVANCED"}'::jsonb
  )
  RETURNING id INTO workflow1_id;

  -- Task 1.1: Environmental Scan
  INSERT INTO dh_task (id, workflow_id, code, title, objective, position)
  VALUES (
    gen_random_uuid(),
    workflow1_id,
    'T1.1',
    'Environmental Scan',
    'Analyze external factors including regulatory changes, competitive landscape, and payer dynamics',
    1
  )
  RETURNING id INTO task_id;

  -- Assign agents to task
  INSERT INTO dh_task_agent (task_id, agent_id, assignment_type, execution_order)
  SELECT task_id, id, 'PRIMARY_EXECUTOR', 1
  FROM dh_agent WHERE code = 'AGT_MA_STRATEGIC_PLANNER';

  -- Assign tools to task
  INSERT INTO dh_task_tool (task_id, tool_id)
  SELECT task_id, id FROM dh_tool WHERE code = 'TOOL_PUBMED_SEARCH';

  -- Assign RAG sources to task
  INSERT INTO dh_task_rag (task_id, rag_source_id)
  SELECT task_id, id FROM dh_rag_source WHERE code = 'RAG_FDA_GUIDANCE';

  -- Continue with more tasks...

END $$;
```

### Script 2: Seed MA Agents

```python
# File: scripts/seed_ma_agents.py

from supabase import create_client
import os

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

MA_AGENTS = [
    {
        "code": "AGT_MA_STRATEGIC_PLANNER",
        "name": "Strategic Planning Agent",
        "type": "COORDINATOR",
        "description": "Facilitates annual planning process, synthesizes stakeholder inputs into strategic objectives",
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.3,
        "max_tokens": 4000,
        "system_prompt": """You are a Medical Affairs strategic planning expert with 15+ years of experience in pharmaceutical strategy development.

Your role:
- Facilitate annual strategic planning process
- Synthesize inputs from cross-functional stakeholders
- Develop SMART objectives aligned with business goals
- Create actionable roadmaps with clear milestones

Approach:
1. Gather comprehensive situational analysis
2. Identify strategic priorities based on data
3. Engage stakeholders for alignment
4. Develop measurable objectives and KPIs
5. Create resource allocation recommendations

Output format: Structured strategic plan with executive summary, SWOT analysis, strategic objectives, and implementation roadmap.""",
        "capabilities": ["strategic_analysis", "stakeholder_synthesis", "objective_setting", "roadmap_development"],
        "metadata": {
            "therapeutic_areas": ["all"],
            "geography": ["global"],
            "experience_level": "senior"
        }
    },
    {
        "code": "AGT_MA_MED_INFO",
        "name": "Medical Information Specialist Agent",
        "type": "EXECUTOR",
        "description": "Responds to medical information inquiries with evidence-based, compliant answers",
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.1,
        "max_tokens": 3000,
        "system_prompt": """You are a Medical Information Specialist with expertise in evidence-based medicine and regulatory compliance.

Your role:
- Respond to medical information requests from HCPs
- Provide accurate, referenced answers
- Ensure all responses are on-label and compliant
- Flag off-label or inappropriate inquiries

Guidelines:
- Always cite primary literature (clinical trials, guidelines)
- Use approved product labeling as foundation
- NEVER provide off-label information
- Escalate complex/inappropriate requests
- Maintain scientific objectivity

Response format:
1. Direct answer to question
2. Supporting evidence with citations
3. References section
4. Compliance disclaimer""",
        "capabilities": ["literature_search", "evidence_synthesis", "response_drafting", "compliance_validation"],
        "metadata": {
            "specialization": "medical_information",
            "compliance_trained": true
        }
    },
    # ... more agents
]

# Insert agents
for agent in MA_AGENTS:
    response = supabase.table("dh_agent").insert(agent).execute()
    print(f"✅ Created agent: {agent['name']}")

print(f"\n🎉 Seeded {len(MA_AGENTS)} Medical Affairs agents")
```

### Script 3: Seed MA Tools

```python
# File: scripts/seed_ma_tools.py

MA_TOOLS = [
    {
        "code": "TOOL_PUBMED_SEARCH",
        "name": "PubMed Literature Search",
        "category": "RESEARCH",
        "type": "API",
        "description": "Search biomedical literature database with advanced query capabilities",
        "configuration": {
            "base_url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
            "endpoints": {
                "search": "esearch.fcgi",
                "fetch": "efetch.fcgi"
            },
            "rate_limit": "3_per_second",
            "authentication_required": False
        },
        "usage_instructions": "Construct PubMed query with MeSH terms, author names, or keywords. Returns PMIDs for matching articles.",
        "metadata": {
            "vendor": "NCBI",
            "cost": "free",
            "sla": "best_effort"
        }
    },
    {
        "code": "TOOL_SWOT_FRAMEWORK",
        "name": "SWOT Analysis Template",
        "category": "PLANNING",
        "type": "TEMPLATE",
        "description": "Structured framework for strategic analysis (Strengths, Weaknesses, Opportunities, Threats)",
        "configuration": {
            "template_format": "JSON",
            "sections": ["strengths", "weaknesses", "opportunities", "threats"],
            "validation_rules": "min_3_per_section"
        }
    },
    # ... more tools
]

for tool in MA_TOOLS:
    response = supabase.table("dh_tool").insert(tool).execute()
    print(f"✅ Created tool: {tool['name']}")
```

### Script 4: Create Complete Workflow for JTBD-MA-001

```python
# File: scripts/create_jtbd_ma_001_workflow.py

def create_strategic_planning_workflow():
    """Create complete workflow for JTBD-MA-001: Annual Strategic Planning"""

    # Get JTBD UUID
    jtbd = supabase.table("jtbd_library").select("uuid_id").eq("id", "JTBD-MA-001").single().execute()
    jtbd_uuid = jtbd.data["uuid_id"]

    # Workflow 1: Situational Analysis
    wf1 = supabase.table("dh_workflow").insert({
        "use_case_id": jtbd_uuid,
        "name": "Situational Analysis & Market Assessment",
        "description": "Comprehensive analysis of internal capabilities, market landscape, and competitive positioning to inform strategic planning",
        "position": 1,
        "metadata": {
            "estimatedDuration": 240,
            "complexity": "ADVANCED",
            "requiredRoles": ["Medical Affairs Director", "Market Insights Analyst"],
            "outputs": ["SWOT Analysis", "Market Assessment Report", "Capability Gap Analysis"]
        }
    }).execute()

    workflow1_id = wf1.data[0]["id"]

    # Task 1.1: Environmental Scan
    t1 = supabase.table("dh_task").insert({
        "workflow_id": workflow1_id,
        "code": "T1.1",
        "title": "Environmental Scan",
        "objective": "Analyze external factors including regulatory changes, competitive product launches, payer policy shifts, and emerging therapeutic areas",
        "position": 1,
        "extra": {
            "deliverables": [
                "Regulatory landscape summary",
                "Competitive intelligence report",
                "Payer trends analysis"
            ],
            "data_sources": [
                "FDA.gov",
                "ClinicalTrials.gov",
                "Competitor press releases",
                "Payer policy databases"
            ]
        }
    }).execute()

    task1_id = t1.data[0]["id"]

    # Assign agents
    strategic_planner = supabase.table("dh_agent").select("id").eq("code", "AGT_MA_STRATEGIC_PLANNER").single().execute()

    supabase.table("dh_task_agent").insert({
        "task_id": task1_id,
        "agent_id": strategic_planner.data["id"],
        "assignment_type": "PRIMARY_EXECUTOR",
        "execution_order": 1
    }).execute()

    # Assign tools
    pubmed = supabase.table("dh_tool").select("id").eq("code", "TOOL_PUBMED_SEARCH").single().execute()
    supabase.table("dh_task_tool").insert({
        "task_id": task1_id,
        "tool_id": pubmed.data["id"]
    }).execute()

    # Assign RAG sources
    fda_guidance = supabase.table("dh_rag_source").select("id").eq("code", "RAG_FDA_GUIDANCE").single().execute()
    supabase.table("dh_task_rag").insert({
        "task_id": task1_id,
        "rag_source_id": fda_guidance.data["id"]
    }).execute()

    print(f"✅ Created workflow: {wf1.data[0]['name']}")
    print(f"✅ Created task: {t1.data[0]['title']}")

    # Continue creating more tasks...

if __name__ == "__main__":
    create_strategic_planning_workflow()
```

---

## Phase 6: API Updates

### Update Complete Route to Handle Both UUID and VARCHAR

```typescript
// File: /api/workflows/usecases/[code]/complete/route.ts

// After fetching useCase...

// Determine which ID to use for workflow lookup
const workflowLinkId = useCase.uuid_id || useCase.id;

if (isValidUuid(workflowLinkId)) {
  const result = await supabase
    .from('dh_workflow')
    .select('*')
    .eq('use_case_id', workflowLinkId)
    .order('position', { ascending: true });

  workflows = result.data || [];

  if (workflows.length > 0) {
    console.log(`[API] ✅ Found ${workflows.length} workflows for ${useCase.source}`);
  }
} else {
  console.log(`[API] ⚠️ No valid UUID for workflow linking: ${code}`);
}
```

---

## Implementation Timeline

### Week 1: Database & Schema
- [ ] Day 1: Add uuid_id column to jtbd_library
- [ ] Day 2: Create and run migration script
- [ ] Day 3: Update API to return uuid_id
- [ ] Day 4: Test workflow queries with new schema
- [ ] Day 5: Verify no regressions in DH use cases

### Week 2: Seed Data (Agents, Tools, RAG)
- [ ] Day 1-2: Create and seed MA agents (5 agents)
- [ ] Day 3: Create and seed MA tools (5 tools)
- [ ] Day 4: Create and seed MA RAG sources (5 sources)
- [ ] Day 5: Verify all lookups and relationships

### Week 3: Workflow Creation (Top 5 JTBDs)
- [ ] Day 1: JTBD-MA-001 (3 workflows, 15 tasks)
- [ ] Day 2: JTBD-MA-015 (2 workflows, 10 tasks)
- [ ] Day 3: JTBD-MA-030 (3 workflows, 12 tasks)
- [ ] Day 4: JTBD-MA-046 (2 workflows, 8 tasks)
- [ ] Day 5: JTBD-MA-062 (2 workflows, 10 tasks)

### Week 4: Testing & Refinement
- [ ] Day 1-2: End-to-end testing of JTBD detail pages
- [ ] Day 3: Test workflow execution flow
- [ ] Day 4: Performance optimization
- [ ] Day 5: Documentation and deployment

---

## Success Criteria

### Phase 1: Schema (Week 1)
- [x] jtbd_library has uuid_id column
- [ ] All 120 JTBDs have unique UUIDs
- [ ] API returns both id and uuid_id
- [ ] Workflow queries work with uuid_id
- [ ] No 22P02 errors

### Phase 2: Seed Data (Week 2)
- [ ] 5+ MA-specific agents created
- [ ] 5+ MA-specific tools created
- [ ] 5+ MA-specific RAG sources created
- [ ] All entities have proper metadata
- [ ] Lookups perform <100ms

### Phase 3: Workflows (Week 3)
- [ ] 12+ workflows created across 5 JTBDs
- [ ] 55+ tasks defined with objectives
- [ ] All tasks have agent assignments
- [ ] All tasks have tool/RAG assignments
- [ ] Task sequencing is logical

### Phase 4: End-to-End (Week 4)
- [ ] JTBD detail pages load successfully
- [ ] Workflows display with tasks
- [ ] Agents, tools, RAG sources visible
- [ ] Workflow visualizer renders correctly
- [ ] Performance <2s for detail page load

---

## Next Immediate Steps

1. **Create Migration Script:**
   ```bash
   scripts/migrations/20251109_add_uuid_to_jtbd_library.sql
   ```

2. **Run Migration:**
   ```bash
   psql $DATABASE_URL -f scripts/migrations/20251109_add_uuid_to_jtbd_library.sql
   ```

3. **Update API Routes:**
   - Update `/api/workflows/usecases/route.ts` to include uuid_id
   - Update `/api/workflows/usecases/[code]/complete/route.ts` to use uuid_id

4. **Create Seed Scripts:**
   - `scripts/seed_ma_agents.py`
   - `scripts/seed_ma_tools.py`
   - `scripts/seed_ma_rag_sources.py`

5. **Create First Workflow:**
   - `scripts/create_jtbd_ma_001_workflow.py`

6. **Test:**
   - Navigate to `/workflows/JTBD-MA-001`
   - Verify workflows display
   - Verify tasks load with agents/tools/RAG

---

## Questions to Resolve

1. **Tenant Isolation:** Should MA workflows be tenant-specific or shared across all tenants?
   - Recommendation: Start shared, add tenant_id later if needed

2. **Workflow Versioning:** How to handle workflow updates without breaking in-progress executions?
   - Recommendation: Add version column, default to latest

3. **Agent Model Selection:** Use Claude Sonnet for all or mix Haiku for simple tasks?
   - Recommendation: Default Sonnet, optimize to Haiku after profiling

4. **RAG Embedding Model:** Continue with text-embedding-3-large or test alternatives?
   - Recommendation: Stay with text-embedding-3-large (proven performance)

---

**Status:** ⏳ Ready to Execute - Awaiting Approval to Proceed

**Estimated Effort:** 4 weeks (1 engineer full-time)

**Risk Level:** LOW (additive changes, no breaking modifications)
