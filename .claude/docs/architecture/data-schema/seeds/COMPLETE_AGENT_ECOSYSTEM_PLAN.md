# Complete Agent Ecosystem Seeding Plan

## Overview
Seed the complete agent ecosystem with full metadata for powerful GraphRAG capabilities.

---

## Execution Order

### **Step 1: Run 5-Level Migration** ✅
**File**: `5_level_agent_hierarchy_migration.sql`
- Adds all new columns to `agents` and `agent_hierarchies`
- Creates 5 new tables
- Creates 2 new views

### **Step 2: Create Master Agents (Level 1)**
**File**: `seed_01_master_agents.sql`
- 5 Master Agents (one per major domain)
  1. **Master Medical Affairs Orchestrator**
  2. **Master Clinical Excellence Orchestrator**
  3. **Master Evidence Generation Orchestrator**
  4. **Master Communications Orchestrator**
  5. **Master Operations Orchestrator**

### **Step 3: Seed 30 Medical Affairs Experts (Level 2)**
**File**: `seed_02_medical_affairs_experts.sql`
- All 30 agents from `MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json`
- Map each to appropriate Master Agent
- Assign to departments (7 departments)
- Set `agent_level = 'expert'`

### **Step 4: Map Agents to Roles, Functions, Departments**
**File**: `seed_03_map_org_structure.sql`
- Link agents to existing `roles` table
- Link agents to existing `functions` table
- Link agents to existing `departments` table
- Populate cached `_name` fields

### **Step 5: Map Agents to Skills**
**File**: `seed_04_map_agent_skills.sql`
- Extract capabilities from JSON → map to `skills` table
- Create missing skills if needed
- Insert into `agent_skills` junction table
- Set proficiency levels

### **Step 6: Map Agents to Tools**
**File**: `seed_05_map_agent_tools.sql`
- Map agents to relevant tools from `tools` table
- Create tool agents (Level 5) for key tools
- Insert into `agent_tools` junction table
- Set usage context

### **Step 7: Map Agents to Knowledge**
**File**: `seed_06_map_agent_knowledge.sql`
- Map agents to knowledge bases
- Insert into `agent_knowledge` junction table
- Set knowledge access permissions

### **Step 8: Map Agents to JTBDs**
**File**: `seed_07_map_agent_jtbds.sql`
- Map agents to Jobs-To-Be-Done
- Insert into `agent_jtbds` or `jtbd_agent_mapping` junction table
- Set JTBD execution priority

### **Step 9: Create Specialist Agents (Level 3)**
**File**: `seed_08_specialist_agents.sql`
- 20-30 Specialist agents (spawnable by Experts)
- Examples:
  - Clinical Trial Protocol Specialist
  - Pharmacovigilance Data Specialist
  - Budget Impact Analysis Specialist
  - CME Compliance Specialist

### **Step 10: Create Worker Agents (Level 4)**
**File**: `seed_09_worker_agents.sql`
- 15-20 Worker agents (task executors)
- Examples:
  - Literature Search Worker
  - Data Extraction Worker
  - Citation Formatter Worker
  - Document Template Filler Worker

### **Step 11: Create Tool Agents (Level 5)**
**File**: `seed_10_tool_agents.sql`
- 50+ Tool agents (integrations)
- Map existing tools to agent wrappers
- Examples:
  - PubMed Search Tool
  - ClinicalTrials.gov API Tool
  - Statistical Calculator Tool
  - Document Generator Tool

### **Step 12: Build Complete Hierarchy**
**File**: `seed_11_build_hierarchy_relationships.sql`
- Master → Expert relationships (5 masters × ~6 experts each = 30)
- Expert → Specialist relationships (~30 experts × 1-3 specialists)
- Specialist → Worker relationships
- Worker → Tool relationships
- Populate `agent_hierarchies` with all relationships
- Set delegation rules, confidence thresholds, routing rules

### **Step 13: Populate Agent Capabilities**
**File**: `seed_12_populate_capabilities.sql`
- Extract capabilities from JSON
- Insert into `agent_capabilities` table
- Set proficiency levels
- Mark validated capabilities

### **Step 14: Map to Industry Verticals**
**File**: `seed_13_map_verticals.sql`
- Insert into `agent_vertical_mapping`
- All Medical Affairs agents → `pharmaceuticals` vertical
- Set vertical expertise levels

### **Step 15: Verification & Statistics**
**File**: `verify_complete_ecosystem.sql`
- Count agents by level
- Count relationships
- Count mappings (skills, tools, knowledge, JTBDs)
- Validate hierarchy completeness
- Check GraphRAG metadata completeness

---

## Expected Final Counts

| Entity | Count |
|--------|-------|
| Master Agents (L1) | 5 |
| Expert Agents (L2) | 30 |
| Specialist Agents (L3) | 25 |
| Worker Agents (L4) | 15 |
| Tool Agents (L5) | 50+ |
| **Total Agents** | **125+** |
| Agent Hierarchies | 150+ |
| Agent-Skill Mappings | 300+ |
| Agent-Tool Mappings | 200+ |
| Agent-Knowledge Mappings | 100+ |
| Agent-JTBD Mappings | 200+ |

---

## GraphRAG Metadata Coverage

✅ **Organizational Context**:
- Functions, Departments, Roles
- Reports-to relationships
- Stakeholder networks

✅ **Capability Context**:
- Skills with proficiency levels
- Domain expertise arrays
- Certifications

✅ **Tool Context**:
- Available tools per agent
- Tool execution capabilities
- Integration endpoints

✅ **Knowledge Context**:
- Accessible knowledge bases
- Document repositories
- Training materials

✅ **Task Context**:
- JTBDs per agent
- Workflow capabilities
- Task execution patterns

✅ **Performance Context**:
- Accuracy scores
- Response times
- Usage statistics

✅ **Hierarchy Context**:
- Parent-child relationships
- Delegation rules
- Spawning capabilities

---

## Files to Create (15 files)

1. ✅ `5_level_agent_hierarchy_migration.sql` (DONE)
2. 🔨 `seed_01_master_agents.sql`
3. 🔨 `seed_02_medical_affairs_experts.sql`
4. 🔨 `seed_03_map_org_structure.sql`
5. 🔨 `seed_04_map_agent_skills.sql`
6. 🔨 `seed_05_map_agent_tools.sql`
7. 🔨 `seed_06_map_agent_knowledge.sql`
8. 🔨 `seed_07_map_agent_jtbds.sql`
9. 🔨 `seed_08_specialist_agents.sql`
10. 🔨 `seed_09_worker_agents.sql`
11. 🔨 `seed_10_tool_agents.sql`
12. 🔨 `seed_11_build_hierarchy_relationships.sql`
13. 🔨 `seed_12_populate_capabilities.sql`
14. 🔨 `seed_13_map_verticals.sql`
15. 🔨 `verify_complete_ecosystem.sql`

---

## Next Action
Proceed to create all 15 seed files in sequence.

