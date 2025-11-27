# 🔍 Legacy Workflow Template Audit

## Current Status

### ✅ What We Have in Database (from migration 025)
- `ap_mode_1` through `ap_mode_6` (6 templates)
- These are **PLACEHOLDER** templates, not the actual legacy workflows

### ❌ What We Need (from legacy code)

**6 Panel Workflows:**
1. `structured_panel` - Sequential, moderated discussion for formal decisions
2. `open_panel` - Parallel collaborative exploration for innovation
3. `socratic_panel` - Socratic questioning method
4. `adversarial_panel` - Adversarial debate format
5. `delphi_panel` - Delphi consensus method
6. `hybrid_panel` - Hybrid approach combining multiple methods

**4 Ask Expert Modes:**
7. `mode1_ask_expert` - Interactive Manual (user selects expert → multi-turn conversation)
8. `mode2_ask_expert` - Collaborative Multi-Expert (multiple experts collaborate)
9. `mode3_ask_expert` - Phased Research (structured research phases)
10. `mode4_ask_expert` - Rapid Consensus (quick expert panel for fast decisions)

## The Problem

The migration `025_add_panel_templates.sql` created generic placeholder workflows (`ap_mode_1` to `ap_mode_6`) but:

1. **Wrong IDs**: Uses `ap_mode_X` instead of actual legacy IDs
2. **Wrong Content**: Generic workflows, not the actual legacy workflow definitions
3. **Missing 4 workflows**: Only has 6, missing the 4 Ask Expert modes
4. **No nodes/edges**: Lacks the detailed node and edge definitions from legacy

## Required Action

Create a new migration `027_seed_legacy_workflows_exact.sql` that:

1. **Removes** the placeholder `ap_mode_1` to `ap_mode_6` templates
2. **Adds** all 10 actual legacy workflows with their complete definitions:
   - All nodes with correct types, positions, and configurations
   - All edges connecting the nodes
   - Expert configurations
   - Phase definitions
   - Default queries and metadata

## Files to Extract From

Legacy workflow definitions are in:
- `apps/vital-system/src/components/langgraph-gui/panel-workflows/panel-definitions.ts`
- `apps/vital-system/src/components/langgraph-gui/panel-workflows/mode1-ask-expert.ts`
- `apps/vital-system/src/components/langgraph-gui/panel-workflows/mode2-ask-expert.ts`
- `apps/vital-system/src/components/langgraph-gui/panel-workflows/mode3-ask-expert.ts`
- `apps/vital-system/src/components/langgraph-gui/panel-workflows/mode4-ask-expert.ts`

## Next Steps

1. Create Python script to extract all 10 workflow configurations
2. Generate SQL migration with complete workflow definitions
3. Apply migration to replace placeholder templates with real ones
4. Verify templates match legacy exactly

---

**Goal**: When a user clicks "Templates" in the modern designer, they see the EXACT same 10 workflows with the EXACT same node structures as the legacy builder.



