#!/usr/bin/env tsx

/**
 * Generate SQL Migration for Legacy Content
 * 
 * This script extracts ALL content from the legacy Ask Panel V1:
 * - 148 node templates from TaskLibrary
 * - 10 complete workflow templates (6 panels + 4 expert modes)
 * 
 * And generates a complete SQL migration file.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Import task definitions
import { TASK_DEFINITIONS } from '../apps/vital-system/src/components/langgraph-gui/TaskLibrary';

// Import panel workflow configurations
import { 
  STRUCTURED_PANEL_CONFIG,
  OPEN_PANEL_CONFIG,
  SOCRATIC_PANEL_CONFIG,
  ADVERSARIAL_PANEL_CONFIG,
  DELPHI_PANEL_CONFIG,
  HYBRID_PANEL_CONFIG,
} from '../apps/vital-system/src/components/langgraph-gui/panel-workflows/panel-definitions';

// Import Ask Expert mode configurations  
import { MODE1_ASK_EXPERT_CONFIG } from '../apps/vital-system/src/components/langgraph-gui/panel-workflows/mode1-ask-expert';
import { MODE2_ASK_EXPERT_CONFIG } from '../apps/vital-system/src/components/langgraph-gui/panel-workflows/mode2-ask-expert';
import { MODE3_ASK_EXPERT_CONFIG } from '../apps/vital-system/src/components/langgraph-gui/panel-workflows/mode3-ask-expert';
import { MODE4_ASK_EXPERT_CONFIG } from '../apps/vital-system/src/components/langgraph-gui/panel-workflows/mode4-ask-expert';

const PANEL_WORKFLOWS = [
  STRUCTURED_PANEL_CONFIG,
  OPEN_PANEL_CONFIG,
  SOCRATIC_PANEL_CONFIG,
  ADVERSARIAL_PANEL_CONFIG,
  DELPHI_PANEL_CONFIG,
  HYBRID_PANEL_CONFIG,
  MODE1_ASK_EXPERT_CONFIG,
  MODE2_ASK_EXPERT_CONFIG,
  MODE3_ASK_EXPERT_CONFIG,
  MODE4_ASK_EXPERT_CONFIG,
];

// Helper function to escape SQL strings
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// Helper function to convert JSON to SQL-safe string
function jsonToSql(obj: any): string {
  return escapeSql(JSON.stringify(obj));
}

// Generate SQL for node library
function generateNodeLibrarySQL(): string {
  let sql = `-- ============================================================================
-- PART 1: Seed Node Library (${TASK_DEFINITIONS.length} Task Definitions)
-- ============================================================================

`;

  for (const task of TASK_DEFINITIONS) {
    const nodeType = task.category === 'Control Flow' ? 'control' : 
                     task.category.includes('Workflow') ? 'agent' : 
                     task.id.includes('agent') ? 'agent' : 'tool';
    
    const category = task.category.toLowerCase().replace(/ /g, '_');
    const tags = [category, task.id.replace(/_/g, '-')].concat(
      task.config.tools || []
    );
    
    sql += `INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  '${task.id}',
  '${escapeSql(task.name)}',
  '${escapeSql(task.name)}',
  '${escapeSql(task.description)}',
  '${nodeType}',
  '${category}',
  '${task.icon}',
  true,
  true,
  '${jsonToSql(task.config)}',
  ARRAY[${tags.map(t => `'${t}'`).join(', ')}]
)
ON CONFLICT (node_slug) DO NOTHING;

`;
  }

  return sql;
}

// Generate SQL for workflow templates
function generateWorkflowTemplatesSQL(): string {
  let sql = `-- ============================================================================
-- PART 2: Seed Workflow Templates (${PANEL_WORKFLOWS.length} Complete Workflows)
-- ============================================================================

`;

  for (const workflow of PANEL_WORKFLOWS) {
    const templateCategory = workflow.id.includes('ask_expert') ? 'ask_expert' : 'panel_discussion';
    const workflowType = workflow.id.includes('ask_expert') ? 'ask_expert' : 'panel_discussion';
    
    // Create workflow definition
    const workflowDefinition = {
      nodes: workflow.nodes,
      edges: workflow.edges,
      metadata: {
        icon: workflow.icon.name,
        defaultQuery: workflow.defaultQuery,
        experts: workflow.experts,
        phases: workflow.phases,
      },
    };
    
    sql += `-- Workflow: ${workflow.name}
INSERT INTO workflows (id, name, description, workflow_type, definition, is_template, is_active, template_id, version)
SELECT 
  uuid_generate_v4(),
  '${escapeSql(workflow.name)}',
  '${escapeSql(workflow.description)}',
  '${workflowType}',
  '${jsonToSql(workflowDefinition)}'::jsonb,
  true,
  true,
  '${workflow.id}',
  '1.0'
WHERE NOT EXISTS (SELECT 1 FROM workflows WHERE template_id = '${workflow.id}');

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
  '${escapeSql(workflow.name)}',
  '${workflow.id}',
  '${escapeSql(workflow.name)}',
  '${escapeSql(workflow.description)}',
  'workflow',
  '${templateCategory}',
  'langgraph',
  true,
  true,
  true,
  jsonb_build_object(
    'workflow_id', w.id,
    'nodes', w.definition->'nodes',
    'edges', w.definition->'edges',
    'metadata', w.definition->'metadata'
  ),
  ARRAY['${workflow.id}', '${templateCategory}', 'workflow', 'pre-built'],
  '${workflow.icon.name || 'Users'}'
FROM workflows w
WHERE w.template_id = '${workflow.id}'
  AND NOT EXISTS (
    SELECT 1 FROM template_library tl 
    WHERE tl.source_table = 'workflows' AND tl.template_slug = '${workflow.id}'
  );

`;
  }

  return sql;
}

// Generate complete migration
function generateMigration(): string {
  return `-- ============================================================================
-- Migration 026: Seed Legacy Node Library and Workflow Templates
-- ============================================================================
-- This migration seeds ALL content from the legacy Ask Panel V1:
-- - ${TASK_DEFINITIONS.length} node templates from TaskLibrary
-- - ${PANEL_WORKFLOWS.length} complete workflow templates (6 panels + 4 expert modes)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

${generateNodeLibrarySQL()}
${generateWorkflowTemplatesSQL()}

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check node library count
-- SELECT node_category, COUNT(*) as count FROM node_library WHERE is_builtin = true GROUP BY node_category ORDER BY node_category;

-- Check template library count
-- SELECT template_category, COUNT(*) as count FROM template_library WHERE is_builtin = true GROUP BY template_category ORDER BY template_category;

-- Check workflows count
-- SELECT workflow_type, COUNT(*) as count FROM workflows WHERE is_template = true GROUP BY workflow_type ORDER BY workflow_type;

-- Show all legacy nodes
-- SELECT node_slug, node_name, node_category, icon FROM node_library WHERE is_builtin = true ORDER BY node_category, node_name;

-- Show all legacy workflows
-- SELECT template_slug, display_name, template_category FROM template_library WHERE is_builtin = true ORDER BY template_category, display_name;
`;
}

// Main execution
try {
  console.log('🚀 Generating legacy content migration...');
  console.log(`📦 Task Definitions: ${TASK_DEFINITIONS.length}`);
  console.log(`📋 Workflow Templates: ${PANEL_WORKFLOWS.length}`);
  
  const migration = generateMigration();
  const outputPath = join(__dirname, '../database/postgres/migrations/026_seed_legacy_content_FULL.sql');
  
  writeFileSync(outputPath, migration, 'utf-8');
  
  console.log('✅ Migration generated successfully!');
  console.log(`📄 File: ${outputPath}`);
  console.log(`📊 Size: ${(migration.length / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Error generating migration:', error);
  process.exit(1);
}

