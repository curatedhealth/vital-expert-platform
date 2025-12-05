# Complete Agent Ecosystem - Execution Guide

## 📋 Overview
This guide provides the execution order for seeding the complete 5-level agent hierarchy with full GraphRAG metadata.

**Target**: 133+ agents across 5 levels with complete relationship mappings

---

## 🚀 Execution Order

### **Step 0: Prerequisites**
Run this diagnostic first to check your database state:
```bash
# Check existing tables and relationships
Open: .vital-command-center/04-TECHNICAL/data-schema/diagnostics/check_existing_relationship_tables.sql
```

###  **Step 1: Execute 5-Level Migration** ✅
**File**: `migrations/5_level_agent_hierarchy_migration.sql`
```sql
-- Adds all new columns and tables for 5-level hierarchy
-- Expected: ~2 minutes
```

**Verification**: Run `migrations/verify_5_level_migration.sql`

---

### **Step 2: Seed Master Agents (Level 1)** ✅
**File**: `seeds/seed_01_master_agents.sql`
```sql
-- Creates 5 Master Orchestrator Agents
-- Expected: ~5 seconds
```

**Expected Output**:
```
✓ Created Master 1: Medical Affairs Orchestrator
✓ Created Master 2: Clinical Excellence Orchestrator
✓ Created Master 3: Evidence Generation Orchestrator
✓ Created Master 4: Medical Communications Orchestrator
✓ Created Master 5: Medical Strategy & Operations Orchestrator
```

---

### **Step 3: Seed Expert Agents (Level 2)** ✅
**Files** (run in order):
1. `seeds/seed_02_medical_affairs_experts_part1.sql` (Experts 1-14)
2. `seeds/seed_02_medical_affairs_experts_part2.sql` (Experts 15-35)

```sql
-- Creates 35 Expert Agents + updates 5 existing analytics
-- Expected: ~20 seconds total
```

**Expected Output**:
```
✓ [1/35] Created: Medical Science Liaison Advisor
✓ [2/35] Created: Regional Medical Director
...
✓ [30/35] Created: Medical Affairs Operations Manager
✓ Updated 5 existing Analytics agents to Expert level
Total Expert Agents: 35
```

---

### **Step 4: Seed Specialist Agents (Level 3)** 🔄 IN PROGRESS
**File**: `seeds/seed_03_specialist_agents.sql`
```sql
-- Creates 25 Specialist Agents (spawnable by Experts)
-- Expected: ~15 seconds
```

**Specialist Categories**:
- Clinical Trial Specialists (5)
- RWE & Data Specialists (5)
- Publication & Writing Specialists (5)
- Medical Communications Specialists (5)
- Operations & Compliance Specialists (5)

---

### **Step 5: Seed Worker Agents (Level 4)** ⏳ PENDING
**File**: `seeds/seed_04_worker_agents.sql`
```sql
-- Creates 18 Worker Agents (task executors)
-- Expected: ~10 seconds
```

**Worker Categories**:
- Data Workers (5)
- Document Workers (5)
- Search Workers (4)
- Analysis Workers (4)

---

### **Step 6: Seed Tool Agents (Level 5)** ⏳ PENDING
**File**: `seeds/seed_05_tool_agents.sql`
```sql
-- Creates 50+ Tool Agents (integration wrappers)
-- Expected: ~30 seconds
```

**Tool Categories**:
- Database Tools (10)
- Search & API Tools (10)
- Document Generation Tools (10)
- Analysis & Calculation Tools (10)
- Integration Tools (10+)

---

### **Step 7: Build Complete Hierarchy** ⏳ PENDING
**File**: `seeds/seed_06_build_complete_hierarchy.sql`
```sql
-- Creates ALL hierarchical relationships
-- Expected: ~45 seconds
```

**Relationships Created**:
- Master → Expert: ~35 relationships
- Expert → Specialist: ~75 relationships
- Specialist → Worker: ~50 relationships
- Worker → Tool: ~90 relationships
- **Total**: ~250 hierarchical relationships

---

### **Step 8: Map Agents to Skills** ⏳ PENDING
**File**: `seeds/seed_07_map_agent_skills.sql`
```sql
-- Maps agents to skills (creates junction records)
-- Expected: ~60 seconds
```

**Expected Mappings**: 300+ agent-skill mappings

---

### **Step 9: Map Agents to Tools** ⏳ PENDING
**File**: `seeds/seed_08_map_agent_tools.sql`
```sql
-- Maps agents to tools (creates junction records)
-- Expected: ~45 seconds
```

**Expected Mappings**: 200+ agent-tool mappings

---

### **Step 10: Map Agents to Knowledge** ⏳ PENDING
**File**: `seeds/seed_09_map_agent_knowledge.sql`
```sql
-- Maps agents to knowledge bases
-- Expected: ~30 seconds
```

**Expected Mappings**: 100+ agent-knowledge mappings

---

### **Step 11: Map Agents to JTBDs** ⏳ PENDING
**File**: `seeds/seed_10_map_agent_jtbds.sql`
```sql
-- Maps agents to Jobs-To-Be-Done
-- Expected: ~45 seconds
```

**Expected Mappings**: 200+ agent-JTBD mappings

---

### **Step 12: Populate Agent Capabilities** ⏳ PENDING
**File**: `seeds/seed_11_populate_capabilities.sql`
```sql
-- Extracts capabilities from system prompts
-- Expected: ~30 seconds
```

**Expected Records**: 500+ capability records

---

### **Step 13: Map to Industry Verticals** ⏳ PENDING
**File**: `seeds/seed_12_map_verticals.sql`
```sql
-- Maps all agents to pharmaceuticals vertical
-- Expected: ~10 seconds
```

**Expected Mappings**: 133+ vertical mappings

---

### **Step 14: Final Verification** ⏳ PENDING
**File**: `seeds/verify_complete_ecosystem.sql`
```sql
-- Comprehensive verification of entire ecosystem
-- Expected: ~5 seconds
```

**Expected Results**:
```
✅ Total Agents: 133
  - Master (L1): 5
  - Expert (L2): 35
  - Specialist (L3): 25
  - Worker (L4): 18
  - Tool (L5): 50
✅ Hierarchical Relationships: 250+
✅ Agent-Skill Mappings: 300+
✅ Agent-Tool Mappings: 200+
✅ Agent-Knowledge Mappings: 100+
✅ Agent-JTBD Mappings: 200+
✅ Agent Capabilities: 500+
✅ Vertical Mappings: 133+
```

---

## 📊 Expected Final State

| Metric | Count |
|--------|-------|
| **Total Agents** | 133 |
| Master Agents (L1) | 5 |
| Expert Agents (L2) | 35 |
| Specialist Agents (L3) | 25 |
| Worker Agents (L4) | 18 |
| Tool Agents (L5) | 50 |
| **Relationships** | |
| Hierarchical Links | 250+ |
| Agent-Skill Mappings | 300+ |
| Agent-Tool Mappings | 200+ |
| Agent-Knowledge Mappings | 100+ |
| Agent-JTBD Mappings | 200+ |
| Agent Capabilities | 500+ |
| Vertical Mappings | 133+ |

---

## 🎯 GraphRAG Metadata Coverage

After completion, every agent will have:

✅ **Organizational Context**:
- Function, Department, Role linkages
- Master → Expert → Specialist → Worker → Tool hierarchy
- Reports-to relationships

✅ **Capability Context**:
- Skills with proficiency levels (300+ mappings)
- Domain expertise arrays
- Reasoning capabilities (JSON)

✅ **Tool Context**:
- Available tools per agent (200+ mappings)
- Tool execution capabilities
- Integration endpoints (for L5 tools)

✅ **Knowledge Context**:
- Accessible knowledge bases (100+ mappings)
- Document repositories
- Training materials

✅ **Task Context**:
- JTBDs per agent (200+ mappings)
- Workflow capabilities
- Task execution patterns

✅ **Performance Context**:
- Accuracy scores
- Response time targets (P50, P95)
- Usage statistics

✅ **Hierarchy Context**:
- Parent-child relationships (250+)
- Delegation rules
- Spawning capabilities
- Confidence thresholds

---

## ⏱️ Total Execution Time

**Estimated Total**: ~6-8 minutes for complete ecosystem

- Migration: ~2 min
- Master Agents: ~5 sec
- Expert Agents: ~20 sec
- Specialist Agents: ~15 sec
- Worker Agents: ~10 sec
- Tool Agents: ~30 sec
- Hierarchy Build: ~45 sec
- Skills Mapping: ~60 sec
- Tools Mapping: ~45 sec
- Knowledge Mapping: ~30 sec
- JTBDs Mapping: ~45 sec
- Capabilities: ~30 sec
- Verticals: ~10 sec
- Verification: ~5 sec

---

## 🚨 Troubleshooting

### If a step fails:
1. Check error message for missing foreign keys
2. Verify previous steps completed successfully
3. Run verification query for that step
4. Check Supabase connection (timeout issues)
5. Re-run the failed step only

### Common Issues:
- **Connection timeout**: Re-run the specific file
- **Missing tenant/function**: Check pharmaceuticals tenant exists
- **Duplicate key**: Agent already exists (safe to ignore)
- **Foreign key violation**: Previous step incomplete

---

## 📁 File Locations

All files are in:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-command-center/04-TECHNICAL/data-schema/
```

- `migrations/` - Schema changes
- `seeds/` - Data seeding scripts
- `diagnostics/` - Verification queries

---

## ✅ Current Status

- [x] Step 1: 5-Level Migration (READY)
- [x] Step 2: Master Agents (READY)
- [x] Step 3: Expert Agents (READY)
- [ ] Step 4: Specialist Agents (IN PROGRESS)
- [ ] Step 5: Worker Agents
- [ ] Step 6: Tool Agents
- [ ] Step 7: Build Hierarchy
- [ ] Step 8-13: Metadata Mappings
- [ ] Step 14: Verification

---

**Next Action**: Continue creating specialist, worker, and tool agent seed files.

