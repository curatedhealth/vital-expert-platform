/**
 * Sync updates from Notion to Supabase
 * Run this after making changes in Notion
 */

import { createClient } from '@supabase/supabase-js';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const NOTION_DB_IDS = {
  agents: process.env.NOTION_AGENTS_DB_ID,
  capabilities: process.env.NOTION_CAPABILITIES_DB_ID,
  org_functions: process.env.NOTION_ORG_FUNCTIONS_DB_ID,
  org_departments: process.env.NOTION_ORG_DEPARTMENTS_DB_ID,
  org_roles: process.env.NOTION_ORG_ROLES_DB_ID,
  org_responsibilities: process.env.NOTION_ORG_RESPONSIBILITIES_DB_ID,
  competencies: process.env.NOTION_COMPETENCIES_DB_ID,
  prompts: process.env.NOTION_PROMPTS_DB_ID,
  rag_documents: process.env.NOTION_RAG_DOCUMENTS_DB_ID,
  tools: process.env.NOTION_TOOLS_DB_ID,
  workflows: process.env.NOTION_WORKFLOWS_DB_ID,
  jobs_to_be_done: process.env.NOTION_JOBS_TO_BE_DONE_DB_ID
};

// Map Notion properties back to Supabase format
function notionToSupabase(table, notionPage) {
  const props = notionPage.properties;

  const mappers = {
    agents: () => ({
      name: props.Name?.title?.[0]?.text?.content || '',
      display_name: props['Display Name']?.rich_text?.[0]?.text?.content || '',
      description: props.Description?.rich_text?.[0]?.text?.content || '',
      avatar: props.Avatar?.rich_text?.[0]?.text?.content || '🤖',
      status: props.Status?.select?.name?.toLowerCase() || 'active',
      tier: tierLabelToNumber(props.Tier?.select?.name),
      model: props.Model?.select?.name || 'gpt-4',
      temperature: props.Temperature?.number || 0.7,
      max_tokens: props['Max Tokens']?.number || 2000,
      system_prompt: props['System Prompt']?.rich_text?.[0]?.text?.content || '',
      domain_expertise: props['Domain Expertise']?.select?.name?.toLowerCase() || 'general',
      medical_specialty: props['Medical Specialty']?.rich_text?.[0]?.text?.content || '',
      hipaa_compliant: props['HIPAA Compliant']?.checkbox || false,
      gdpr_compliant: props['GDPR Compliant']?.checkbox || false,
      pharma_enabled: props['Pharma Enabled']?.checkbox || false,
      data_classification: props['Data Classification']?.select?.name?.toLowerCase() || 'internal',
      accuracy_score: props['Accuracy Score']?.number || 0,
      priority: props.Priority?.number || 1,
      cost_per_query: props['Cost per Query']?.number || 0,
      total_interactions: props['Total Interactions']?.number || 0,
      is_public: props['Is Public']?.checkbox !== false,
      is_custom: props['Is Custom']?.checkbox || false
    }),

    capabilities: () => ({
      name: props.Name?.title?.[0]?.text?.content || '',
      display_name: props['Display Name']?.rich_text?.[0]?.text?.content || '',
      description: props.Description?.rich_text?.[0]?.text?.content || '',
      category: props.Category?.select?.name?.toLowerCase() || 'general',
      domain: props.Domain?.select?.name?.toLowerCase() || 'general',
      stage: props.Stage?.select?.name || '',
      vital_component: props['VITAL Component']?.select?.name || '',
      priority: props.Priority?.select?.name?.toLowerCase() || 'medium',
      maturity: props.Maturity?.select?.name?.toLowerCase() || 'concept',
      complexity_level: props['Complexity Level']?.select?.name?.toLowerCase() || 'intermediate',
      is_new: props['Is New']?.checkbox || false,
      panel_recommended: props['Panel Recommended']?.checkbox || false,
      is_premium: props['Is Premium']?.checkbox || false,
      usage_count: props['Usage Count']?.number || 0,
      success_rate: props['Success Rate']?.number || 0,
      implementation_timeline: props['Implementation Timeline']?.number || 0,
      icon: props.Icon?.rich_text?.[0]?.text?.content || '⚡',
      color: props.Color?.rich_text?.[0]?.text?.content || 'blue'
    })
  };

  return mappers[table] ? mappers[table]() : {};
}

function tierLabelToNumber(tierLabel) {
  const tierMap = { 'Core': 0, 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3 };
  return tierMap[tierLabel] || 1;
}

// Sync single database
async function syncDatabase(tableName) {
  const notionDbId = NOTION_DB_IDS[tableName];

  if (!notionDbId) {
    console.log(`⏭️  Skipping ${tableName} - no Notion database configured`);
    return { synced: 0, errors: 0 };
  }

  console.log(`\n🔄 Syncing ${tableName} from Notion...`);

  try {
    // Fetch all pages from Notion database
    const response = await notion.databases.query({
      database_id: notionDbId
    });

    console.log(`📥 Found ${response.results.length} records in Notion`);

    let synced = 0;
    let errors = 0;

    for (const page of response.results) {
      try {
        const supabaseData = notionToSupabase(tableName, page);

        // Find matching record by name
        const { data: existing, error: findError } = await supabase
          .from(tableName)
          .select('id')
          .eq('name', supabaseData.name)
          .single();

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from(tableName)
            .update(supabaseData)
            .eq('id', existing.id);

          if (updateError) {
            console.error(`❌ Update error for ${supabaseData.name}:`, updateError.message);
            errors++;
          } else {
            synced++;
            process.stdout.write(`\r✅ Synced: ${synced}/${response.results.length}`);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from(tableName)
            .insert(supabaseData);

          if (insertError) {
            console.error(`❌ Insert error for ${supabaseData.name}:`, insertError.message);
            errors++;
          } else {
            synced++;
            process.stdout.write(`\r✅ Synced: ${synced}/${response.results.length}`);
          }
        }
      } catch (err) {
        console.error(`\n❌ Error processing page:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };

  } catch (error) {
    console.error(`❌ Failed to sync ${tableName}:`, error.message);
    return { synced: 0, errors: 1 };
  }
}

// Main sync function
async function syncAll() {
  console.log('🚀 Starting Notion → Supabase Sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const tablesToSync = ['agents', 'capabilities'];
  const results = {};

  for (const table of tablesToSync) {
    results[table] = await syncDatabase(table);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Sync Complete!');
  console.log('\n📋 Summary:');

  let totalSynced = 0;
  let totalErrors = 0;

  for (const [table, result] of Object.entries(results)) {
    console.log(`   ${table.padEnd(20)} ${result.synced} synced, ${result.errors} errors`);
    totalSynced += result.synced;
    totalErrors += result.errors;
  }

  console.log(`\n📊 Total: ${totalSynced} synced, ${totalErrors} errors`);

  if (totalErrors === 0 && totalSynced > 0) {
    console.log('\n🎉 All changes synced successfully!');
    console.log('💡 Frontend will auto-update via Supabase real-time');
  }
}

// CLI support
const args = process.argv.slice(2);
const database = args.find(arg => arg.startsWith('--database='))?.split('=')[1];

if (database) {
  console.log(`🎯 Syncing single database: ${database}`);
  syncDatabase(database)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
} else {
  syncAll()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}
