const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/lib/services/evidence-pack-builder.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/lib/services/model-selector.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/lib/services/tool-registry-service.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/services/llm-provider.service.ts',
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/src/shared/services/rag/rag-service.ts'
];

function fixRecursiveReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the recursive getSupabaseClient calls
  const fixedContent = content.replace(
    /private getSupabaseClient\(\) \{\s*if \(!this\.getSupabaseClient\(\)\) \{\s*this\.getSupabaseClient\(\) = createClient\(\);\s*\}\s*return this\.getSupabaseClient\(\);\s*\}/g,
    `private getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient();
    }
    return this.supabase;
  }`
  );
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    return true;
  }
  return false;
}

console.log('🔧 Fixing recursive getSupabaseClient references...');

let fixedCount = 0;
for (const filePath of filesToFix) {
  try {
    if (fixRecursiveReferences(filePath)) {
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${path.basename(filePath)}: ${error.message}`);
  }
}

console.log(`\n📊 Fixed ${fixedCount} files with recursive reference issues.`);
