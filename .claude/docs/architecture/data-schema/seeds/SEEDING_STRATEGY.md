# Complete Agent Seeding with Full Org Mapping

## Overview
All agents will be seeded with complete organizational context:
- ✅ `tenant_id`
- ✅ `function_id` + `function_name`
- ✅ `department_id` + `department_name`
- ✅ `role_id` + `role_name`
- ✅ `master_agent_id` + `master_agent_name` (for L2-L5)
- ✅ `agent_level` (master, expert, specialist, worker, tool)
- ✅ `industry_vertical` (pharmaceuticals)

## Execution Plan

### Option A: Single Comprehensive File (Recommended)
Create **ONE** master seed file that:
1. Sets up all organizational structure (functions, departments, roles)
2. Seeds all 133 agents in order (L1 → L2 → L3 → L4 → L5)
3. Builds all hierarchical relationships
4. Maps all metadata (skills, tools, knowledge, JTBDs)

**File**: `seed_complete_agent_ecosystem.sql`  
**Runtime**: ~3-5 minutes  
**Lines**: ~5000 lines

### Option B: Modular Files (Current Approach)
Separate files for each level:
- `seed_01_master_agents.sql` (5 masters)
- `seed_02_expert_agents_part1.sql` (experts 1-14)
- `seed_02_expert_agents_part2.sql` (experts 15-35)
- `seed_03_specialist_agents.sql` (25 specialists)
- `seed_04_worker_agents.sql` (18 workers)
- `seed_05_tool_agents.sql` (50 tools)
- `seed_06_build_hierarchy.sql`
- `seed_07_map_skills.sql`
- `seed_08_map_tools.sql`
- `seed_09_map_knowledge.sql`
- `seed_10_map_jtbds.sql`

**Total Files**: 11 files  
**Runtime**: ~6-8 minutes total

## Recommended Approach

**I recommend Option A** - Single comprehensive file for these reasons:

1. **Atomic Operation**: All-or-nothing transaction
2. **Consistent IDs**: Can use variables throughout
3. **Easier Debugging**: Single point of failure
4. **Role Mapping**: Can query roles once and use throughout
5. **Foreign Keys**: All relationships created in correct order

## Next Steps

**Please confirm which approach you prefer:**

**A) Single comprehensive file** (5000 lines, one execution)  
**B) Modular files** (11 files, multiple executions)

Once confirmed, I'll proceed to create the complete agent ecosystem with full organizational mapping (including role_id and role_name for all applicable agents).

---

## Role Mapping Strategy

For agents, we'll use this logic:

**Level 1 (Master)**:
- `role_id`: NULL (masters don't map to single roles)
- `role_name`: NULL

**Level 2 (Expert)**:
- `role_id`: Lookup from `roles` table by name pattern match
- `role_name`: Populated from `roles.name`
- Example: "Medical Science Liaison Advisor" → role: "Medical Science Liaison"

**Level 3 (Specialist)**:
- `role_id`: Same as parent expert or specialized role
- `role_name`: Populated from `roles.name`

**Level 4 (Worker)**:
- `role_id`: NULL (workers are task executors, not org roles)
- `role_name`: NULL

**Level 5 (Tool)**:
- `role_id`: NULL (tools are integrations)
- `role_name`: NULL

