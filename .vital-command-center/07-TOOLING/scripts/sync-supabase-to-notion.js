/**
 * Sync data from Supabase to Notion
 * Supports all 12 VITAL Path databases with relation handling
 */

import { createClient } from '@supabase/supabase-js';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const notionToken = process.env.NOTION_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!notionToken) {
  console.error('❌ Missing Notion API key');
  console.log('ℹ️  Set NOTION_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const notion = new Client({ auth: notionToken });

// Database ID mappings (update after creating Notion databases)
const NOTION_DB_IDS = {
  org_functions: process.env.NOTION_ORG_FUNCTIONS_DB_ID,
  org_departments: process.env.NOTION_ORG_DEPARTMENTS_DB_ID,
  org_roles: process.env.NOTION_ORG_ROLES_DB_ID,
  org_responsibilities: process.env.NOTION_ORG_RESPONSIBILITIES_DB_ID,
  agents: process.env.NOTION_AGENTS_DB_ID,
  capabilities: process.env.NOTION_CAPABILITIES_DB_ID,
  competencies: process.env.NOTION_COMPETENCIES_DB_ID,
  prompts: process.env.NOTION_PROMPTS_DB_ID,
  rag_documents: process.env.NOTION_RAG_DOCUMENTS_DB_ID,
  tools: process.env.NOTION_TOOLS_DB_ID,
  workflows: process.env.NOTION_WORKFLOWS_DB_ID,
  jobs_to_be_done: process.env.NOTION_JOBS_TO_BE_DONE_DB_ID
};

// Field mappers: Convert Supabase data to Notion properties
const FIELD_MAPPERS = {
  agents: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Display Name': { rich_text: [{ text: { content: row.display_name || '' } }] },
    'Description': { rich_text: [{ text: { content: (row.description || '').substring(0, 2000) } }] },
    'Role': { rich_text: [{ text: { content: row.role || '' } }] },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'Lifecycle Stage': { select: { name: capitalize(row.lifecycle_stage || 'active') } },
    'Tier': { select: { name: tierToLabel(row.tier) } },
    'Is Active': { checkbox: row.is_active !== false },
    'Is Featured': { checkbox: row.is_featured || false },
    'Model': { rich_text: [{ text: { content: row.model || 'gpt-4' } }] },
    'Temperature': { number: row.temperature || 0.7 },
    'Max Tokens': { number: row.max_tokens || 2000 },
    'System Prompt': { rich_text: [{ text: { content: (row.system_prompt || '').substring(0, 2000) } }] },
    'Tools': { multi_select: [] }, // TODO: Parse tools array
    'Icon': { rich_text: [{ text: { content: row.icon || '🤖' } }] },
    'Color': { select: { name: capitalize(row.color || 'blue') } },
    'Usage Count': { number: row.usage_count || 0 },
    'Success Rate': { number: row.success_rate || 0 }
  }),

  capabilities: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Display Name': { rich_text: [{ text: { content: row.display_name || '' } }] },
    'Description': { rich_text: [{ text: { content: (row.description || '').substring(0, 2000) } }] },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'Domain': { select: { name: capitalize(row.domain || 'general') } },
    'Complexity Level': { select: { name: capitalize(row.complexity_level || 'intermediate') } },
    'Priority': { select: { name: capitalize(row.priority || 'medium') } },
    'Maturity': { select: { name: capitalize(row.maturity || 'concept') } },
    'Icon': { rich_text: [{ text: { content: row.icon || '⚡' } }] },
    'Color': { select: { name: capitalize(row.color || 'blue') } },
    'Is New': { checkbox: row.is_new || false },
    'Panel Recommended': { checkbox: row.panel_recommended || false },
    'Is Premium': { checkbox: row.is_premium || false },
    'Usage Count': { number: row.usage_count || 0 },
    'Success Rate': { number: row.success_rate || 0 }
  }),

  org_functions: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Function Code': { rich_text: [{ text: { content: row.function_code || '' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Icon': { rich_text: [{ text: { content: row.icon || '📁' } }] },
    'Color': { select: { name: capitalize(row.color || 'gray') } },
    'Is Active': { checkbox: row.is_active !== false },
    'Sort Order': { number: row.sort_order || 0 }
  }),

  org_departments: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Department Code': { rich_text: [{ text: { content: row.department_code || '' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Head of Department': { rich_text: [{ text: { content: row.head_of_department || '' } }] },
    'Team Size': { number: row.team_size || 0 },
    'Budget': { number: row.budget || 0 },
    'Is Active': { checkbox: row.is_active !== false }
  }),

  org_roles: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Role Code': { rich_text: [{ text: { content: row.role_code || '' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Level': { select: { name: capitalize(row.level || 'mid') } },
    'Salary Range': { rich_text: [{ text: { content: row.salary_range || '' } }] },
    'Is Active': { checkbox: row.is_active !== false }
  }),

  org_responsibilities: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Category': { select: { name: capitalize(row.category || 'execution') } },
    'Priority': { select: { name: capitalize(row.priority || 'medium') } },
    'Time Allocation': { number: row.time_allocation || 0 },
    'Is Active': { checkbox: row.is_active !== false }
  }),

  competencies: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Category': { select: { name: capitalize(row.category || 'technical') } },
    'Level Required': { select: { name: capitalize(row.level_required || 'intermediate') } },
    'Assessment Criteria': { rich_text: [{ text: { content: row.assessment_criteria || '' } }] },
    'Is Core': { checkbox: row.is_core || false }
  }),

  prompts: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Prompt Text': { rich_text: [{ text: { content: (row.prompt_text || '').substring(0, 2000) } }] },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'Type': { select: { name: capitalize(row.type || 'template') } },
    'Complexity': { select: { name: capitalize(row.complexity || 'moderate') } },
    'Usage Count': { number: row.usage_count || 0 },
    'Rating': { number: Math.min(5, Math.max(1, row.rating || 3)) },
    'Is Active': { checkbox: row.is_active !== false }
  }),

  rag_documents: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Document Type': { select: { name: row.document_type || 'Guideline' } },
    'Content': { rich_text: [{ text: { content: (row.content || '').substring(0, 2000) } }] },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'Version': { rich_text: [{ text: { content: row.version || '1.0' } }] },
    'Status': { select: { name: capitalize(row.status || 'active') } },
    'Chunk Count': { number: row.chunk_count || 0 },
    'Vector Embedded': { checkbox: row.vector_embedded || false }
  }),

  tools: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Type': { select: { name: capitalize(row.type || 'api') } },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'Authentication Required': { checkbox: row.authentication_required || false },
    'Is Active': { checkbox: row.is_active !== false }
  }),

  workflows: (row) => ({
    'Name': { title: [{ text: { content: row.name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: row.description || '' } }] },
    'Type': { select: { name: capitalize(row.type || 'general') } },
    'Status': { select: { name: capitalize(row.status || 'active') } },
    'Expected Duration': { number: row.expected_duration || 0 },
    'Usage Count': { number: row.usage_count || 0 },
    'Success Rate': { number: row.success_rate || 0 }
  }),

  jobs_to_be_done: (row) => ({
    'Job Statement': { title: [{ text: { content: row.job_statement || 'Untitled' } }] },
    'Category': { select: { name: capitalize(row.category || 'general') } },
    'User Persona': { select: { name: capitalize(row.user_persona || 'general') } },
    'Situation': { rich_text: [{ text: { content: row.situation || '' } }] },
    'Motivation': { rich_text: [{ text: { content: row.motivation || '' } }] },
    'Expected Outcome': { rich_text: [{ text: { content: row.expected_outcome || '' } }] },
    'Priority': { select: { name: capitalize(row.priority || 'medium') } },
    'Frequency': { select: { name: capitalize(row.frequency || 'monthly') } },
    'Complexity': { select: { name: capitalize(row.complexity || 'moderate') } },
    'Is Solved': { checkbox: row.is_solved || false }
  })
};

// Helper functions
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function tierToLabel(tier) {
  const tierMap = { 0: 'Core', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
  return tierMap[tier] || 'Tier 1';
}

// Sync single table
async function syncTable(tableName, batchSize = 10) {
  const notionDbId = NOTION_DB_IDS[tableName];

  if (!notionDbId) {
    console.error(`❌ No Notion database ID configured for ${tableName}`);
    console.log(`ℹ️  Set NOTION_${tableName.toUpperCase()}_DB_ID in .env.local`);
    return { success: 0, failed: 0, skipped: 1 };
  }

  console.log(`\n🔄 Syncing ${tableName}...`);

  try {
    // Fetch all records from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`❌ Error fetching from Supabase:`, error);
      return { success: 0, failed: 0, skipped: 1 };
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  No data to sync for ${tableName}`);
      return { success: 0, failed: 0, skipped: 1 };
    }

    console.log(`📥 Found ${data.length} records to sync`);

    const fieldMapper = FIELD_MAPPERS[tableName];
    if (!fieldMapper) {
      console.error(`❌ No field mapper defined for ${tableName}`);
      return { success: 0, failed: 0, skipped: data.length };
    }

    let success = 0;
    let failed = 0;

    // Process in batches to avoid rate limits
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      for (const row of batch) {
        try {
          const properties = fieldMapper(row);

          await notion.pages.create({
            parent: { database_id: notionDbId },
            properties: properties
          });

          success++;
          process.stdout.write(`\r✅ Synced: ${success}/${data.length}`);

        } catch (error) {
          failed++;
          console.error(`\n❌ Failed to sync record ${row.id || row.name}:`, error.message);
        }
      }

      // Rate limiting: wait 300ms between batches
      if (i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`\n✅ Sync complete: ${success} success, ${failed} failed`);
    return { success, failed, skipped: 0 };

  } catch (error) {
    console.error(`❌ Exception syncing ${tableName}:`, error);
    return { success: 0, failed: 0, skipped: 1 };
  }
}

// Main sync function
async function syncAllTables() {
  console.log('🚀 Starting Supabase → Notion Sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Sync order (respects dependencies)
  const syncOrder = [
    'org_functions',
    'org_departments',
    'org_roles',
    'org_responsibilities',
    'competencies',
    'capabilities',
    'tools',
    'prompts',
    'agents',
    'workflows',
    'rag_documents',
    'jobs_to_be_done'
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tableName of syncOrder) {
    const result = await syncTable(tableName);
    results[tableName] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Sync Complete!');
  console.log(`📊 Total Success: ${totalSuccess}`);
  console.log(`📊 Total Failed: ${totalFailed}`);
  console.log(`📊 Total Skipped: ${totalSkipped}`);
  console.log('\n📋 Table Summary:');

  for (const [tableName, result] of Object.entries(results)) {
    const status = result.skipped > 0 ? '⏭️ ' : result.failed > 0 ? '⚠️ ' : '✅';
    console.log(`   ${status} ${tableName.padEnd(25)} ${result.success} synced, ${result.failed} failed`);
  }

  return results;
}

// CLI support
const args = process.argv.slice(2);
const tableName = args.find(arg => arg.startsWith('--table='))?.split('=')[1];

if (tableName) {
  console.log(`🎯 Syncing single table: ${tableName}`);
  syncTable(tableName)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
} else {
  syncAllTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}
