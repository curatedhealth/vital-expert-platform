#!/usr/bin/env node

/**
 * Sync Notion Database to Supabase
 *
 * Setup:
 * 1. Install: npm install @notionhq/client
 * 2. Get Notion API key: https://www.notion.so/my-integrations
 * 3. Share your database with the integration
 * 4. Get database ID from the URL
 *
 * Usage:
 * NOTION_API_KEY=your_key NOTION_DATABASE_ID=your_db_id node scripts/sync-notion-to-supabase.js
 */

const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'agents';

// Field mapping from Notion to Supabase
const FIELD_MAPPING = {
  // Notion Property Name -> Supabase Column Name
  'Name': 'name',
  'Display Name': 'display_name',
  'Description': 'description',
  'Avatar': 'avatar',
  'Tier': 'tier',
  'Status': 'status',
  'Department': 'department',
  'Role': 'role',
  'Business Function': 'business_function',
  'Model': 'model',
  'Temperature': 'temperature',
  'System Prompt': 'system_prompt',
};

/**
 * Extract value from Notion property
 */
function extractNotionValue(property) {
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title[0]?.plain_text || null;
    case 'rich_text':
      return property.rich_text[0]?.plain_text || null;
    case 'number':
      return property.number;
    case 'select':
      return property.select?.name || null;
    case 'multi_select':
      return property.multi_select.map(item => item.name);
    case 'checkbox':
      return property.checkbox;
    case 'url':
      return property.url;
    case 'email':
      return property.email;
    case 'phone_number':
      return property.phone_number;
    case 'date':
      return property.date?.start || null;
    default:
      return null;
  }
}

/**
 * Transform Notion page to Supabase row
 */
function transformNotionToSupabase(page) {
  const row = {};

  for (const [notionField, supabaseField] of Object.entries(FIELD_MAPPING)) {
    const property = page.properties[notionField];
    if (property) {
      row[supabaseField] = extractNotionValue(property);
    }
  }

  // Add metadata
  row.metadata = {
    notion_id: page.id,
    notion_url: page.url,
    last_synced: new Date().toISOString()
  };

  return row;
}

/**
 * Sync Notion database to Supabase
 */
async function syncNotionToSupabase() {
  console.log('🔄 Starting Notion → Supabase sync...\n');

  if (!NOTION_API_KEY) {
    console.error('❌ Missing NOTION_API_KEY environment variable');
    console.error('   Get your key from: https://www.notion.so/my-integrations\n');
    process.exit(1);
  }

  if (!NOTION_DATABASE_ID) {
    console.error('❌ Missing NOTION_DATABASE_ID environment variable');
    console.error('   Find it in your Notion database URL\n');
    process.exit(1);
  }

  console.log(`📊 Notion Database: ${NOTION_DATABASE_ID}`);
  console.log(`💾 Supabase Table: ${SUPABASE_TABLE}\n`);

  try {
    // Fetch all pages from Notion database
    console.log('📥 Fetching data from Notion...');
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
    });

    console.log(`✅ Found ${response.results.length} items in Notion\n`);

    let imported = 0;
    let updated = 0;
    let errors = 0;

    // Process each page
    for (const page of response.results) {
      try {
        const row = transformNotionToSupabase(page);

        if (!row.name) {
          console.log(`⏭️  Skipped: Missing name`);
          continue;
        }

        // Check if record exists (by name or notion_id in metadata)
        const { data: existing } = await supabase
          .from(SUPABASE_TABLE)
          .select('id, name')
          .eq('name', row.name)
          .single();

        if (existing) {
          // Update existing record
          const { error } = await supabase
            .from(SUPABASE_TABLE)
            .update(row)
            .eq('id', existing.id);

          if (error) {
            console.error(`❌ Failed to update ${row.name}:`, error.message);
            errors++;
          } else {
            console.log(`🔄 Updated: ${row.name}`);
            updated++;
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from(SUPABASE_TABLE)
            .insert([row]);

          if (error) {
            console.error(`❌ Failed to insert ${row.name}:`, error.message);
            errors++;
          } else {
            console.log(`✅ Imported: ${row.name}`);
            imported++;
          }
        }
      } catch (err) {
        console.error(`❌ Error processing page:`, err.message);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log('='.repeat(60));
    console.log(`   Total in Notion:  ${response.results.length}`);
    console.log(`   ✅ Imported:      ${imported}`);
    console.log(`   🔄 Updated:       ${updated}`);
    console.log(`   ❌ Errors:        ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (imported + updated > 0) {
      console.log('🎉 Sync completed successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run sync
syncNotionToSupabase();
