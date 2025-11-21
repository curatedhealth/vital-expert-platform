# Agent Capabilities Analysis Guide

**Date:** 2025-11-17
**Status:** 🔄 Analysis Running
**Purpose:** Extract capabilities from 319 existing agents and create Phase 2 development plan

---

## What This Analysis Does

The `analyze_agents_capabilities.py` script performs comprehensive analysis of all 319 existing agents to:

1. **Extract Capabilities** - Use GPT-4 to analyze each agent and identify what capabilities it provides
2. **Categorize Agents** - Group agents by domain (regulatory, clinical, market_access, etc.)
3. **Map to Skills** - Identify which Claude Code skills each capability requires
4. **Identify Gaps** - Find missing skills that need development in Phase 2
5. **Generate SQL** - Create migration SQL to populate capabilities registry
6. **Create Roadmap** - Generate Phase 2 skills development plan with priorities

---

## Process Flow

```
┌─────────────────┐
│  319 Agents in  │
│  Supabase DB    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  GPT-4 Analysis (Batch Processing)  │
│  - Extract 2-4 capabilities per agent │
│  - Categorize by domain              │
│  - Identify required skills          │
│  - Assess complexity level           │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Aggregation & Deduplication         │
│  - Merge similar capabilities        │
│  - Count agent usage per capability  │
│  - Calculate skill demand            │
└────────┬─────────────────────────────┘
         │
         ├───────► agent_capabilities_analysis.json (Raw Data)
         │
         ├───────► 005_seed_agent_capabilities_registry.sql (Migration)
         │
         └───────► PHASE_2_SKILLS_DEVELOPMENT_PLAN.md (Roadmap)
```

---

## Expected Outputs

### 1. `agent_capabilities_analysis.json`

**Purpose:** Raw analysis data for reference

**Structure:**
```json
[
  {
    "agent_id": "uuid",
    "agent_name": "FDA 510(k) Regulatory Specialist",
    "capabilities": [
      {
        "name": "fda_510k_submission",
        "display_name": "FDA 510(k) Submission",
        "description": "Expertise in 510(k) pathway...",
        "complexity": "advanced"
      }
    ],
    "category": "regulatory",
    "required_skills": [
      "fda_database_search",
      "predicate_device_search",
      "generate_510k_template"
    ]
  }
]
```

### 2. `supabase/migrations/005_seed_agent_capabilities_registry.sql`

**Purpose:** Populate `capabilities` table based on actual agent usage

**Content:**
- INSERT statements for all unique capabilities
- Grouped by category (regulatory, clinical, market_access, etc.)
- Includes agent usage counts and examples
- ON CONFLICT handling for idempotency

**Example:**
```sql
-- REGULATORY CAPABILITIES (45 capabilities)

INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level) VALUES
('fda_510k_submission', 'fda-510k-submission', 'FDA 510(k) Submission', 'Expertise in FDA 510(k) premarket notification pathway...', 'regulatory', 'advanced')
ON CONFLICT (capability_name) DO NOTHING;
-- Used by 12 agents: FDA 510(k) Regulatory Specialist, Medical Device Strategist, ...
```

### 3. `PHASE_2_SKILLS_DEVELOPMENT_PLAN.md`

**Purpose:** Prioritized roadmap for developing missing skills

**Sections:**

#### Executive Summary
- Total missing skills
- High/Medium/Low priority breakdown

#### High Priority Skills (>10 agents need)
| Skill Name | Agents Needing It | Category | Notes |
|------------|-------------------|----------|-------|
| `predicate_device_search` | 25 | data_retrieval | FDA 510(k) predicate database integration |
| `regulatory_pathway_analysis` | 18 | analysis | GPT-4 decision tree for pathway selection |

#### Medium Priority Skills (5-10 agents need)
| Skill Name | Agents Needing It | Category |
|------------|-------------------|----------|
| `sample_size_calculator` | 8 | analysis |

#### Low Priority Skills (<5 agents need)
- Listed in collapsible section

#### Implementation Roadmap
- Week-by-week development schedule
- Grouping by skill type (infrastructure, domain-specific, enhancement)

---

## Analysis Metrics

### Expected Capability Distribution

Based on agent naming patterns, we anticipate:

| Category | Estimated Capabilities | Example Capabilities |
|----------|----------------------|---------------------|
| **Regulatory** | 40-50 | FDA submissions, EMA MDR, PMDA pathways |
| **Clinical** | 30-40 | Trial design, endpoints, biostatistics |
| **Market Access** | 20-30 | HTA submissions, HEOR, pricing |
| **Technical/CMC** | 15-20 | Manufacturing, quality, analytical methods |
| **Strategic** | 10-15 | Portfolio management, competitive intel |
| **Operational** | 10-15 | Project management, coordination |
| **Analytical** | 10-15 | Data analysis, modeling, statistics |
| **Communication** | 5-10 | Writing, presentations, stakeholder mgmt |

**Total:** ~150-200 unique capabilities

### Expected Skill Demand

**High Demand (>10 agents):**
- Regulatory database searches (FDA, EMA, PMDA)
- Template generation (submissions, protocols, dossiers)
- Compliance validation
- Literature search

**Medium Demand (5-10 agents):**
- Specialized calculators (sample size, CAC, budget impact)
- Data analysis tools
- Document generators

**Low Demand (<5 agents):**
- Niche regulatory pathways
- Specialized therapeutic area tools

---

## Skill Gap Analysis Process

### Step 1: Skill Demand Extraction

For each agent, GPT-4 identifies 2-5 required skills:
- What tools would enable this agent's capabilities?
- What data sources does it need?
- What specialized functions are required?

### Step 2: Matching Against Existing Skills

Compare demanded skills against our current skill library:
- ✅ **Exists:** Already in database (from migrations 003-004)
- ❌ **Missing:** Needs development in Phase 2

### Step 3: Priority Assignment

Missing skills prioritized by demand:
- **High (>10 agents):** Critical infrastructure, develop first
- **Medium (5-10 agents):** Important enhancements, develop second
- **Low (<5 agents):** Nice-to-have, consider for Phase 3

### Step 4: Implementation Suggestions

For each missing skill, suggest:
- **Category:** data_retrieval, generation, analysis, validation, etc.
- **Implementation approach:** API integration, GPT-4 wrapper, template library
- **Estimated effort:** Quick (hours), Medium (days), Complex (weeks)

---

## Running Time Estimates

**Total Processing Time:** ~10-20 minutes

**Breakdown:**
- Fetch 319 agents from database: ~2 seconds
- GPT-4 analysis (64 batches × 5 agents × 2s wait): ~10-15 minutes
- Aggregation and deduplication: ~5 seconds
- SQL generation: ~2 seconds
- Plan generation: ~1 second

**API Costs (Estimated):**
- 319 GPT-4 calls × $0.01-0.02 per call = ~$3-6 total

---

## Monitoring Progress

Check analysis status:
```bash
# Check if script is still running
ps aux | grep analyze_agents_capabilities

# Monitor output (if running in background)
tail -f /path/to/output.log

# Check for generated files
ls -lh agent_capabilities_analysis.json
ls -lh supabase/migrations/005_seed_agent_capabilities_registry.sql
ls -lh PHASE_2_SKILLS_DEVELOPMENT_PLAN.md
```

---

## Next Steps After Analysis Complete

### 1. Review Generated Files ✅

**Review Capabilities SQL:**
```bash
cat supabase/migrations/005_seed_agent_capabilities_registry.sql
```
- Check capability naming consistency
- Verify categories are correct
- Review complexity assignments

**Review Phase 2 Plan:**
```bash
cat PHASE_2_SKILLS_DEVELOPMENT_PLAN.md
```
- Prioritize which skills to develop first
- Estimate development timeline
- Assign development resources

### 2. Run Migration 005 📊

```bash
python3 scripts/run_migration.py --migration 005
```

This will populate the `capabilities` table with capabilities extracted from actual agent usage.

### 3. Map Agents to Capabilities 🔗

Run script to create `agent_capabilities` junction records:
```bash
python3 scripts/link_agents_to_capabilities.py
```

This reads `agent_capabilities_analysis.json` and creates junction table records linking each agent to its capabilities.

### 4. Develop High-Priority Skills 🛠️

Based on Phase 2 plan, begin skill development:
- Start with skills needed by 15+ agents
- Focus on regulatory/clinical domain skills first
- Create skills in `.claude/skills/` directory
- Add to `skills` table via migration

### 5. Link Skills to Capabilities 🔗

For each developed skill, create `capability_skills` records showing which capabilities it enables.

---

## Integration with Enhancement Tool

Once capabilities are populated, update `enhance_agent_library.py` to:

1. **Assign Capabilities Instead of Generating:**
   ```python
   # OLD: Generate capabilities with GPT-4
   capabilities = await generate_capabilities(agent)

   # NEW: Look up from capabilities registry
   capabilities = lookup_agent_capabilities(agent_id)
   ```

2. **Link to Existing Capabilities:**
   ```python
   # Create agent_capabilities records
   for cap in capabilities:
       cap_id = get_capability_id(cap['name'])
       link_agent_to_capability(agent_id, cap_id, proficiency='expert')
   ```

3. **Assign Skills Based on Capabilities:**
   ```python
   # Get required skills for each capability
   for cap in agent_capabilities:
       required_skills = get_capability_skills(cap_id)
       for skill in required_skills:
           link_agent_to_skill(agent_id, skill_id)
   ```

---

## Example Output Snippets

### Capabilities SQL (Sample)

```sql
-- REGULATORY CAPABILITIES (45 capabilities)

INSERT INTO capabilities (...) VALUES
('fda_510k_submission', 'fda-510k-submission', 'FDA 510(k) Submission', 'Expertise in FDA 510(k) premarket notification pathway including predicate selection and substantial equivalence', 'regulatory', 'advanced')
ON CONFLICT (capability_name) DO NOTHING;
-- Used by 12 agents: FDA 510(k) Specialist, Medical Device Regulatory Strategist, Regulatory Affairs Manager, ...

INSERT INTO capabilities (...) VALUES
('ema_mdr_compliance', 'ema-mdr-compliance', 'EMA MDR Compliance', 'Expertise in European Medical Device Regulation (MDR) compliance and CE marking procedures', 'regulatory', 'advanced')
ON CONFLICT (capability_name) DO NOTHING;
-- Used by 8 agents: EMA Regulatory Specialist, EU MDR Compliance Expert, Medical Device Regulatory Strategist, ...
```

### Phase 2 Plan (Sample)

```markdown
## High Priority Skills (Develop First)

| Skill Name | Agents Needing It | Category | Notes |
|------------|-------------------|----------|-------|
| `predicate_device_search` | 25 | data_retrieval | FDA 510(k) database API integration + caching |
| `regulatory_pathway_analysis` | 18 | analysis | GPT-4 decision tree for pathway selection |
| `clinical_endpoint_selection` | 15 | analysis | GPT-4 analysis + endpoint database |
| `hta_database_search` | 12 | data_retrieval | NICE/CADTH/IQWiG API integration |
```

---

## Success Criteria

Analysis is successful when:

✅ All 319 agents analyzed without errors
✅ 150-200 unique capabilities extracted
✅ Capabilities grouped into 8 categories
✅ SQL migration file generated and valid
✅ Phase 2 plan includes prioritized skills list
✅ High-priority skills (>10 agent demand) identified
✅ Missing skills categorized by development effort

---

## Troubleshooting

### Analysis Takes Too Long
- Reduce batch size from 5 to 3
- Increase delay between batches
- Check OpenAI API rate limits

### GPT-4 Extraction Errors
- Check agent has description or system_prompt
- Verify OpenAI API key is valid
- Review error logs for specific failures

### Duplicate Capabilities
- Normal - will be deduplicated in aggregation step
- Review similarity thresholds if too many duplicates

### Missing Categories
- Add to category list in script
- Re-run analysis for affected agents

---

**Status:** 🔄 Analysis currently running...

**ETA:** ~10-20 minutes

**Next Update:** Check for generated files in project root
