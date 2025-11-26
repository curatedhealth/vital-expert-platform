# Agent Capabilities & Responsibilities - Implementation Plan

**Version**: 1.0.0  
**Date**: November 26, 2025  
**Status**: Active

---

## Problem Statement

Current state:
- ✅ 489 agents fully created
- ✅ Schema ready (`capabilities`, `responsibilities`, `agent_capabilities`, `agent_responsibilities`, `skills`)
- ❌ No systematic capability/responsibility taxonomy
- ❌ No (role + level) assignment rules

**Goal**: Define and assign capabilities/responsibilities to all 489 agents based on **(role + level)** combinations.

---

## Core Principle

**Capabilities/Responsibilities = Role Context + Agent Level**

Example:
```
Medical Science Liaison (Role) + L2 EXPERT (Level)
→ Capabilities: KOL engagement, scientific communication, data analysis
→ Responsibilities: Territory management, presentation delivery, inquiry response

Medical Science Liaison (Role) + L3 SPECIALIST (Level)  
→ Capabilities: Meeting execution, literature review, data collection
→ Responsibilities: Individual KOL meetings, presentation support
```

---

## Implementation Steps

### 1. Research & Define Taxonomy

**Research Scope** (use web search):
- Industry-standard capabilities per role (pharma + digital health)
- Level-appropriate differentiation (L1 strategic → L5 automated)
- Cross-cutting vs role-specific capabilities

**Output**: 
- `CAPABILITY_TAXONOMY.md` - Complete taxonomy with role + level mappings
- `RESPONSIBILITY_TAXONOMY.md` - Complete responsibility definitions

**Approach**:
- Start with Medical Affairs (158 agents) as pilot
- Then expand to all 8 pharma functions + 6 digital health functions
- Define 5-10 capabilities per (role + level) combination
- Define 5-10 responsibilities per (role + level) combination

---

### 2. Map Capabilities → Skills

**Current State**:
- Capabilities = High-level (e.g., "Data Analysis")
- Skills = Granular (e.g., "Statistical Modeling", "Data Visualization")

**Task**: Define parent-child relationships

**Output**: Update to `CAPABILITY_TAXONOMY.md` with skill mappings

Example:
```
Capability: Data Analysis
├── Skill: Statistical Modeling
├── Skill: Data Visualization
├── Skill: Hypothesis Testing
└── Skill: Predictive Analytics
```

---

### 3. Create Assignment Rules

**Assignment Logic**:
```sql
IF role = 'Medical Science Liaison' AND level = 'L1 MASTER'
  THEN assign capabilities: [Strategic Planning, Team Leadership, KOL Strategy]
  
IF role = 'Medical Science Liaison' AND level = 'L2 EXPERT'
  THEN assign capabilities: [KOL Engagement, Scientific Communication, Data Analysis]
  
IF role = 'Medical Science Liaison' AND level = 'L3 SPECIALIST'
  THEN assign capabilities: [Meeting Execution, Literature Review, Presentation Delivery]
```

**Output**: 
- SQL seed file: `20251127-assign-capabilities-by-role-level.sql`
- SQL seed file: `20251127-assign-responsibilities-by-role-level.sql`

---

### 4. Execute Assignments

**Run SQL seeds**:
1. Seed capabilities table (if not populated)
2. Seed responsibilities table (if not populated)
3. Bulk assign to agents via `agent_capabilities` junction table
4. Bulk assign to agents via `agent_responsibilities` junction table

**Target**: All 489 agents get appropriate capabilities/responsibilities

---

### 5. Verification

**Verify**:
```sql
-- Check coverage
SELECT 
  COUNT(DISTINCT a.id) as agents_with_capabilities
FROM agents a
JOIN agent_capabilities ac ON a.id = ac.agent_id;

-- Check by level
SELECT 
  al.level_number,
  COUNT(DISTINCT a.id) as agent_count,
  AVG(cap_count.caps) as avg_capabilities_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN (
  SELECT agent_id, COUNT(*) as caps 
  FROM agent_capabilities 
  GROUP BY agent_id
) cap_count ON a.id = cap_count.agent_id
GROUP BY al.level_number;
```

**Output**: Brief stats summary (append to this file, don't create new doc)

---

## Work Breakdown

### Phase 1: Medical Affairs (1-2 days)
- 158 agents across 3 departments, 15 roles
- Research capabilities/responsibilities per role
- Define L1/L2/L3 differentiation
- Create assignment rules
- Execute and verify

### Phase 2: Remaining Pharma Functions (2-3 days)
- Regulatory Affairs (70 agents)
- Clinical Development (68 agents)
- Safety & Pharmacovigilance (45 agents)
- Market Access (39 agents)
- Clinical Operations (20 agents)
- Quality Assurance (15 agents)
- Cross-Functional (12 agents)

### Phase 3: Digital Health (1 day)
- 89 agents across 6 functions
- Similar approach, tech-focused capabilities

### Phase 4: Verification & Refinement (1 day)
- Run verification queries
- Check coverage
- Refine edge cases

**Total Estimate**: 5-7 days

---

## Critical Files (Only These)

1. **CAPABILITY_TAXONOMY.md** (this folder)
   - Complete capability definitions
   - Role + level mappings
   - Capability → skill relationships

2. **RESPONSIBILITY_TAXONOMY.md** (this folder)
   - Complete responsibility definitions  
   - Role + level mappings

3. **sql-seeds/20251127-seed-capabilities.sql**
   - Populate capabilities table

4. **sql-seeds/20251127-seed-responsibilities.sql**
   - Populate responsibilities table

5. **sql-seeds/20251127-assign-capabilities-by-role-level.sql**
   - Bulk assign to agents

6. **sql-seeds/20251127-assign-responsibilities-by-role-level.sql**
   - Bulk assign to agents

7. **This file (CAPABILITIES_PLAN.md)**
   - Updated with progress & verification stats

**Total**: 7 files (3 docs + 4 SQL seeds)

---

## Decision Log

**Why (role + level) instead of just role?**
- L1 orchestrates, L3 executes → completely different capabilities
- Same role, different level = different responsibilities
- More accurate, more flexible

**Why not rigid inheritance?**
- Need flexibility for edge cases
- Bulk assignment gives 90% automation
- Can override 10% edge cases manually

**Why capabilities → skills hierarchy?**
- Capabilities = "what you can do" (high-level)
- Skills = "how you do it" (granular)
- Agents have capabilities, which decompose into skills
- Better for skill gap analysis, training, search

---

## Success Metrics

- ✅ 100% agent coverage (489/489 have capabilities)
- ✅ 100% agent coverage (489/489 have responsibilities)
- ✅ 5-10 capabilities per agent on average
- ✅ 5-10 responsibilities per agent on average
- ✅ Clear (role + level) differentiation
- ✅ Capabilities mapped to skills
- ✅ Verification queries pass

---

## Status Update: Medical Affairs COMPLETE

✅ **Capability Taxonomy**: 60 capabilities defined
- 39 role-specific capabilities (targeted to 34 unique role types)
- 21 cross-cutting capabilities (shared across roles)

✅ **Responsibility Taxonomy**: 60 responsibilities defined
- 39 role-specific responsibilities (targeted to 34 unique role types)
- 21 cross-cutting responsibilities (shared across roles)

**Coverage**: 158 Medical Affairs agents will get 8-12 capabilities and 8-12 responsibilities each

**Assignment Strategy**:
```
For each agent:
  - Assign 5-7 role-specific capabilities (based on role_name)
  - Assign 3-5 cross-cutting capabilities (based on agent_level_id + function)
  - Assign 5-7 role-specific responsibilities (based on role_name)
  - Assign 3-5 cross-cutting responsibilities (based on agent_level_id + function)
  
Total per agent: 8-12 capabilities + 8-12 responsibilities
```

---

## Next Steps

1. ✅ Research Medical Affairs roles (158 agents, 34 unique roles) - COMPLETE
2. ✅ Define 60 capabilities (39 role-specific + 21 cross-cutting) - COMPLETE
3. ✅ Define 60 responsibilities (39 role-specific + 21 cross-cutting) - COMPLETE
4. ⏳ Create SQL assignment script for Medical Affairs
5. ⏳ Expand to remaining pharma functions (Regulatory, Clinical Dev, Safety, etc.)
6. ⏳ Map capabilities to skills

---

**Last Updated**: November 26, 2025  
**Status**: Medical Affairs Taxonomy Complete - Ready for SQL Assignment

