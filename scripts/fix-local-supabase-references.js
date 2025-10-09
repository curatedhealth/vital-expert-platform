#!/usr/bin/env node

/**
 * Fix Local Supabase References Script
 * Replaces all local Supabase references with cloud instance URLs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Local Supabase References...\n');

// Cloud instance configuration
const CLOUD_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const LOCAL_URL = 'http://127.0.0.1:54321';
const LOCALHOST_URL = 'http://localhost:54321';

// Files to process
const filesToProcess = [
  'data/agents-comprehensive.json',
  'scripts/deploy-complete-mvp.js',
  'scripts/import-marketing-agents-simple.js',
  'scripts/import-marketing-agents-complete.js',
  'scripts/update-all-remaining-agents.js',
  'scripts/update-all-system-prompts.js',
  'scripts/update-agents-to-development.js',
  'scripts/import-market-access-complete.js',
  'scripts/import-medical-affairs-complete.js',
  'scripts/update-medical-affairs-expanded-structure.js',
  'scripts/update-tier1-complete-gold-standard.js',
  'scripts/update-tier1-gold-standard-prompts.js',
  'scripts/create-knowledge-domains-table-supabase.js',
  'scripts/create-knowledge-domains-table.js',
  'scripts/seed-knowledge-domains.js',
  'scripts/update-tier1-enhanced-prompts.js',
  'scripts/validate-org-hierarchy.js',
  'scripts/assign-medical-models-to-medical-agents.js',
  'scripts/upgrade-agents-capability-based.js',
  'scripts/upgrade-agents-incremental.js',
  'scripts/update-digital-health-complete-data.js',
  'scripts/update-digital-health-avatars.js',
  'scripts/import-digital-health-agents.js',
  'scripts/sync-agents-from-notion.js',
  'scripts/sync-notion-to-supabase.js',
  'scripts/import-from-template.js',
  'scripts/import-comprehensive-agents.ts',
  'scripts/import-capabilities-prompts.ts',
  'scripts/connect-prompts-to-prism.js',
  'scripts/seed-expert-agents.js',
  'scripts/load-regulatory-sample.js',
  'scripts/seed-expanded-agents.js',
  'scripts/update-icons-to-4digit.js',
  'scripts/load-sample-agents-with-avatars.js',
  'scripts/fix-icons-simple.js',
  'scripts/fix-icon-urls.js',
  'scripts/load-corrected-enhanced-agents.js',
  'scripts/debug-agent-loader.js',
  'scripts/load-strategic-intelligence.js',
  'scripts/load-compatible-enhanced-agents.js',
  'scripts/load-enhanced-vital-agents.js',
  'scripts/create-agent-capability-relationships.js',
  'scripts/load-expert-agents-simplified.js',
  'scripts/load-expert-agents.js',
  'scripts/load-comprehensive-capabilities.js',
  'scripts/fix-rag-functions.js',
  'scripts/apply-rag-migration.js',
  'scripts/apply-functions-only.js',
  'scripts/final-schema-apply.js',
  'scripts/manual-schema-fix.js',
  'scripts/apply-schema-fix.js',
  'scripts/schema-audit.js'
];

// Library files
const libraryFiles = [
  'src/lib/utils/database-library-loader.ts',
  'src/shared/services/utils/database-library-loader.ts',
  'src/shared/utils/utils/database-library-loader.ts'
];

let totalFilesProcessed = 0;
let totalReplacements = 0;

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;

    // Replace local Supabase URLs with cloud URLs
    const originalContent = content;
    
    // Replace 127.0.0.1:54321 with cloud URL
    content = content.replace(new RegExp(LOCAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CLOUD_URL);
    replacements += (originalContent.match(new RegExp(LOCAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    // Replace localhost:54321 with cloud URL
    content = content.replace(new RegExp(LOCALHOST_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), CLOUD_URL);
    replacements += (originalContent.match(new RegExp(LOCALHOST_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

    // Replace any remaining localhost references in Supabase context
    content = content.replace(/localhost:54321/g, CLOUD_URL);
    content = content.replace(/127\.0\.0\.1:54321/g, CLOUD_URL);

    if (replacements > 0) {
      // Create backup
      fs.writeFileSync(filePath + '.backup', originalContent);
      
      // Write updated content
      fs.writeFileSync(filePath, content);
      
      console.log(`✅ ${filePath}: ${replacements} replacements`);
      totalReplacements += replacements;
    } else {
      console.log(`⚪ ${filePath}: No changes needed`);
    }

    totalFilesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('📁 Processing files...\n');

filesToProcess.forEach(file => {
  processFile(file);
});

libraryFiles.forEach(file => {
  processFile(file);
});

// Process data files
console.log('\n📊 Processing data files...');
processFile('data/agents-comprehensive.json');

// Process documentation files
console.log('\n📚 Processing documentation files...');
const docFiles = [
  'docs/MARKET_ACCESS_COMPLETE_IMPORT_SUMMARY.md',
  'docs/AGENT_IMPORT_EXPORT_GUIDE.md',
  'docs/technical/DOMAIN_BASED_LLM_ROUTING.md',
  'docs/guides/KNOWLEDGE_DOMAINS_SETUP.md',
  'docs/guides/NEXT_STEPS.md',
  'docs/status/AUTONOMOUS_MODE_FIXED.md',
  'docs/guides/LANGCHAIN_ENHANCED_FEATURES.md',
  'docs/status/TOKEN_TRACKING_COMPLETE_SETUP.md',
  'docs/status/TOKEN_TRACKING_SETUP_COMPLETE.md'
];

docFiles.forEach(file => {
  processFile(file);
});

// Process SQL files
console.log('\n🗄️  Processing SQL files...');
const sqlFiles = [
  'archive/sql/restore-254-agents-complete.sql',
  'database/backups/full_backup_20251006_134706.sql',
  'database/backups/agents_20251006_134706.sql'
];

sqlFiles.forEach(file => {
  processFile(file);
});

// Process JSON schema files
console.log('\n📋 Processing schema files...');
const schemaFiles = [
  'docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json'
];

schemaFiles.forEach(file => {
  processFile(file);
});

console.log('\n📊 Summary:');
console.log(`  Files processed: ${totalFilesProcessed}`);
console.log(`  Total replacements: ${totalReplacements}`);
console.log(`  Cloud URL: ${CLOUD_URL}`);

if (totalReplacements > 0) {
  console.log('\n✅ Local Supabase references have been updated to cloud instance');
  console.log('📁 Backup files created with .backup extension');
  console.log('\n🔄 Next steps:');
  console.log('1. Review the changes in the updated files');
  console.log('2. Test the application to ensure everything works');
  console.log('3. Remove backup files when satisfied: rm **/*.backup');
} else {
  console.log('\n⚪ No local Supabase references found to update');
}

console.log('\n🌐 All references now point to cloud instance:', CLOUD_URL);
