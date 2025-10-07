#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Automated Supabase client creation fix...');

// List of files that need fixing (from the comprehensive check)
const filesToFix = [
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/(app)/knowledge-domains/page.tsx',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/advisory/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/agents/[id]/prompt-starters/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/agents/query-hybrid/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/agents/rag-config/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/agents/registry/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/analytics/dashboard/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/batch/agents/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/batch/capabilities/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/batch/prompts/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/chat/autonomous/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/chat/langchain-enhanced/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/chat/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/clinical/safety/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/clinical/validation/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/dtx/narcolepsy/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/events/stream/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/events/websocket/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/health/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/icons/[id]/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/icons/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/interventions/[id]/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/interventions/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/knowledge/analytics/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/knowledge/documents/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/knowledge/duplicates/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/knowledge/process/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/knowledge-domains/initialize/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/llm/available-models/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/llm/feedback/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/llm/query/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/llm-providers/configure/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/llm-providers/test/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/metrics/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/migrations/add-org-columns/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/orchestrator/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/organizational-structure/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/prompts/[id]/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/prompts/advanced/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/prompts/generate-hybrid/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/prompts/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/rag/enhanced/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/app/api/rag/search-hybrid/route.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/features/chat/agents/autonomous-expert-agent.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/features/chat/prompts/agent-prompt-builder.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/features/chat/services/ask-expert-graph.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/features/knowledge/components/knowledge-uploader.tsx'
];

let fixedCount = 0;
let skippedCount = 0;

for (const filePath of filesToFix) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      skippedCount++;
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: Remove module-level supabase client creation
    const moduleLevelPattern = /const\s+supabase\s*=\s*createClient\s*\(\s*\n?\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]*\)\s*;?\s*\n/g;
    if (moduleLevelPattern.test(content)) {
      content = content.replace(moduleLevelPattern, '');
      modified = true;
    }

    // Pattern 2: Remove single-line module-level creation
    const singleLinePattern = /const\s+supabase\s*=\s*createClient\s*\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]*\)\s*;?\s*\n/g;
    if (singleLinePattern.test(content)) {
      content = content.replace(singleLinePattern, '');
      modified = true;
    }

    // Pattern 3: Remove with exclamation marks
    const exclamationPattern = /const\s+supabase\s*=\s*createClient\s*\(\s*\n?\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL![^)]*\)\s*;?\s*\n/g;
    if (exclamationPattern.test(content)) {
      content = content.replace(exclamationPattern, '');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      skippedCount++;
    }

  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    skippedCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`📁 Total processed: ${filesToFix.length} files`);

if (fixedCount > 0) {
  console.log(`\n🎉 Successfully fixed ${fixedCount} files!`);
  console.log('💡 Note: You may still need to add Supabase client creation inside functions that use it.');
} else {
  console.log('\n🤔 No files were modified. They may already be fixed or need manual intervention.');
}
