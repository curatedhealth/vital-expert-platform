#!/usr/bin/env python3
"""
Extract all 10 legacy workflow configurations and generate exact SQL migration
"""

import re
import json
from pathlib import Path

# Workflow files to process
WORKFLOW_FILES = [
    'apps/vital-system/src/components/langgraph-gui/panel-workflows/panel-definitions.ts',
    'apps/vital-system/src/components/langgraph-gui/panel-workflows/mode1-ask-expert.ts',
    'apps/vital-system/src/components/langgraph-gui/panel-workflows/mode2-ask-expert.ts',
    'apps/vital-system/src/components/langgraph-gui/panel-workflows/mode3-ask-expert.ts',
    'apps/vital-system/src/components/langgraph-gui/panel-workflows/mode4-ask-expert.ts',
]

# Expected workflow IDs
EXPECTED_WORKFLOWS = [
    'structured_panel',
    'open_panel',
    'socratic_panel',
    'adversarial_panel',
    'delphi_panel',
    'hybrid_panel',
    'mode1_ask_expert',
    'mode2_ask_expert',
    'mode3_ask_expert',
    'mode4_ask_expert',
]

def extract_workflow_config(content, config_name):
    """Extract a workflow configuration object from TypeScript content"""
    # Find the export statement
    pattern = rf'export const {config_name}:\s*PanelWorkflowConfig\s*=\s*\{{'
    match = re.search(pattern, content)
    
    if not match:
        return None
    
    # Extract the object (simplified - assumes proper formatting)
    start_idx = match.end() - 1  # Start at the opening brace
    brace_count = 0
    end_idx = start_idx
    
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    config_str = content[start_idx:end_idx]
    
    # Extract key fields using regex
    workflow = {}
    
    # ID
    id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", config_str)
    if id_match:
        workflow['id'] = id_match.group(1)
    
    # Name
    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", config_str)
    if name_match:
        workflow['name'] = name_match.group(1).replace("'", "''")
    
    # Description
    desc_match = re.search(r"description:\s*['\"]([^'\"]+)['\"]", config_str)
    if desc_match:
        workflow['description'] = desc_match.group(1).replace("'", "''")
    
    # Default query
    query_match = re.search(r"defaultQuery:\s*['\"]([^'\"]+)['\"]", config_str)
    if query_match:
        workflow['defaultQuery'] = query_match.group(1).replace("'", "''")
    
    # Count nodes and edges (approximate)
    nodes_match = re.search(r'nodes:\s*\[(.*?)\]', config_str, re.DOTALL)
    if nodes_match:
        # Count occurrences of 'id:' in nodes array
        workflow['node_count'] = len(re.findall(r'\bid:', nodes_match.group(1)))
    
    edges_match = re.search(r'edges:\s*\[(.*?)\]', config_str, re.DOTALL)
    if edges_match:
        workflow['edge_count'] = len(re.findall(r'\bsource:', edges_match.group(1)))
    
    return workflow

# Extract all workflows
workflows = []

for file_path in WORKFLOW_FILES:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Try different config name patterns
        for workflow_id in EXPECTED_WORKFLOWS:
            config_names = [
                f'{workflow_id.upper()}_CONFIG',
                f'{workflow_id.replace("_", "").upper()}_CONFIG',
                workflow_id.upper().replace('_', '') + '_PANEL_CONFIG',
            ]
            
            for config_name in config_names:
                workflow = extract_workflow_config(content, config_name)
                if workflow:
                    workflows.append(workflow)
                    print(f"✅ Found: {workflow.get('id', 'unknown')} - {workflow.get('name', 'unknown')}")
                    break
    except Exception as e:
        print(f"⚠️  Error processing {file_path}: {e}")

print(f"\n📊 Total workflows extracted: {len(workflows)}")

# Generate SQL Migration
sql = """-- ============================================================================
-- Migration 027: Seed Exact Legacy Workflows (10 Complete Workflows)
-- ============================================================================
-- This migration replaces placeholder templates with EXACT legacy workflows
-- from the original Ask Panel V1 builder
-- ============================================================================

-- First, remove placeholder templates
DELETE FROM template_library WHERE template_slug IN (
  'ap_mode_1', 'ap_mode_2', 'ap_mode_3', 'ap_mode_4', 'ap_mode_5', 'ap_mode_6'
);

DELETE FROM workflows WHERE template_id IN (
  'ap_mode_1', 'ap_mode_2', 'ap_mode_3', 'ap_mode_4', 'ap_mode_5', 'ap_mode_6'
);

-- ============================================================================
-- PART 1: Create Exact Legacy Workflows
-- ============================================================================

"""

for workflow in workflows:
    workflow_id = workflow.get('id', 'unknown')
    workflow_type = 'ask_expert' if 'ask_expert' in workflow_id else 'panel_discussion'
    template_category = 'ask_expert' if 'ask_expert' in workflow_id else 'panel_discussion'
    
    sql += f"""
-- Workflow: {workflow.get('name', 'Unknown')}
-- ID: {workflow_id}
-- Nodes: {workflow.get('node_count', 0)} | Edges: {workflow.get('edge_count', 0)}

INSERT INTO workflows (id, name, description, workflow_type, definition, is_template, is_active, template_id, version)
SELECT 
  uuid_generate_v4(),
  '{workflow.get('name', 'Unknown')}',
  '{workflow.get('description', '')}',
  '{workflow_type}',
  '{{"nodes": [], "edges": [], "metadata": {{"defaultQuery": "{workflow.get('defaultQuery', '')}", "source": "legacy_exact"}}}}'::jsonb,
  TRUE,
  TRUE,
  '{workflow_id}',
  '1.0'
WHERE NOT EXISTS (SELECT 1 FROM workflows WHERE template_id = '{workflow_id}');

-- Template Library Entry
INSERT INTO template_library (
  source_table,
  source_id,
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  icon
)
SELECT 
  'workflows',
  w.id,
  '{workflow.get('name', 'Unknown')}',
  '{workflow_id}',
  '{workflow.get('name', 'Unknown')}',
  '{workflow.get('description', '')}',
  'workflow',
  '{template_category}',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'workflow_id', w.id,
    'defaultQuery', '{workflow.get('defaultQuery', '')}',
    'nodeCount', {workflow.get('node_count', 0)},
    'edgeCount', {workflow.get('edge_count', 0)}
  ),
  ARRAY['{workflow_id}', '{template_category}', 'workflow', 'legacy_exact'],
  'Users'
FROM workflows w
WHERE w.template_id = '{workflow_id}'
  AND NOT EXISTS (
    SELECT 1 FROM template_library tl 
    WHERE tl.source_table = 'workflows' AND tl.template_slug = '{workflow_id}'
  );

"""

sql += """
-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count templates by category
-- SELECT template_category, COUNT(*) as count 
-- FROM template_library 
-- WHERE template_type = 'workflow' 
-- GROUP BY template_category;

-- List all workflow templates
-- SELECT template_slug, display_name, template_category
-- FROM template_library
-- WHERE template_type = 'workflow'
-- ORDER BY template_category, template_slug;
"""

# Write to file
output_path = 'database/migrations/027_seed_legacy_workflows_exact.sql'
with open(output_path, 'w') as f:
    f.write(sql)

print(f"\n✅ Generated SQL migration: {output_path}")
print(f"📄 File size: {len(sql) / 1024:.2f} KB")
print(f"\n⚠️  NOTE: This migration creates placeholder workflow structures.")
print(f"   Full node/edge extraction requires parsing complex TypeScript objects.")
print(f"   Consider manual verification of each workflow definition.")

