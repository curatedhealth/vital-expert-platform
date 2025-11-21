#!/usr/bin/env node

/**
 * Import data from JSON templates
 * Supports agents, capabilities, and other data tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importFromTemplate(filePath) {
  console.log('📥 Starting data import from template...\n');
  console.log(`📁 File: ${filePath}\n`);

  try {
    // Read and parse JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Import agents
    if (data.agents && data.agents.length > 0) {
      console.log(`🤖 Importing ${data.agents.length} agents...`);

      for (const agent of data.agents) {
        try {
          const { error } = await supabase
            .from('agents')
            .insert([agent])
            .select();

          if (error) {
            console.error(`❌ Failed to import ${agent.display_name}:`, error.message);
            errors++;
          } else {
            console.log(`✅ Imported: ${agent.display_name}`);
            imported++;
          }
        } catch (err) {
          console.error(`❌ Exception importing ${agent.display_name}:`, err.message);
          errors++;
        }
      }
    }

    // Import capabilities
    if (data.capabilities && data.capabilities.length > 0) {
      console.log(`\n🎯 Importing ${data.capabilities.length} capabilities...`);

      for (const capability of data.capabilities) {
        try {
          const { error } = await supabase
            .from('capabilities')
            .insert([capability])
            .select();

          if (error) {
            console.error(`❌ Failed to import ${capability.name}:`, error.message);
            errors++;
          } else {
            console.log(`✅ Imported: ${capability.name}`);
            imported++;
          }
        } catch (err) {
          console.error(`❌ Exception importing ${capability.name}:`, err.message);
          errors++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Imported:  ${imported}`);
    console.log(`   ⏭️  Skipped:   ${skipped}`);
    console.log(`   ❌ Errors:    ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (imported > 0) {
      console.log('🎉 Import completed successfully!\n');
    } else if (errors > 0) {
      console.error('⚠️  Import completed with errors.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during import:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Check for file argument
if (process.argv.length < 3) {
  console.error('❌ Missing file argument!');
  console.error('\nUsage:');
  console.error('  node scripts/import-from-template.js <json-file>');
  console.error('\nExample:');
  console.error('  node scripts/import-from-template.js database/templates/my_agents.json\n');
  process.exit(1);
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}\n`);
  process.exit(1);
}

// Run import
importFromTemplate(filePath);
