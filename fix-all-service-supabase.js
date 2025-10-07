const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const filesToProcess = [];

// Find all files with private supabase = createClient() pattern
function findSupabaseIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Pattern: private supabase = createClient();
    const privateMatch = line.match(/private\s+(supabase(?:Admin)?)\s*=\s*createClient\(/);
    if (privateMatch) {
      filesToProcess.push({
        filePath,
        lineNumber: i + 1,
        supabaseVar: privateMatch[1],
        content
      });
      break;
    }
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        traverseDirectory(filePath);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      findSupabaseIssues(filePath);
    }
  }
}

function applyFix(fileInfo) {
  let newContent = fileInfo.content;
  let changesMade = false;

  // Replace private supabase = createClient() with lazy initialization
  const privatePattern = new RegExp(`private\\s+(${fileInfo.supabaseVar})\\s*=\\s*createClient\\([^)]*\\);?`, 'g');
  
  if (privatePattern.test(newContent)) {
    newContent = newContent.replace(privatePattern, `private $1: ReturnType<typeof createClient> | null = null;`);
    
    // Add getSupabaseClient method after the property declaration
    const classMatch = newContent.match(/export class \w+ \{([\s\S]*?)(?=\n  [a-zA-Z]|\n\})/);
    if (classMatch) {
      const classBody = classMatch[1];
      const methodInsertion = `

  private getSupabaseClient() {
    if (!this.${fileInfo.supabaseVar}) {
      this.${fileInfo.supabaseVar} = createClient();
    }
    return this.${fileInfo.supabaseVar};
  }`;
      
      newContent = newContent.replace(classMatch[0], classMatch[0] + methodInsertion);
    }
    
    // Replace all this.supabase references with this.getSupabaseClient()
    const thisSupabasePattern = new RegExp(`this\\.${fileInfo.supabaseVar}`, 'g');
    newContent = newContent.replace(thisSupabasePattern, `this.getSupabaseClient()`);
    
    changesMade = true;
  }

  if (changesMade) {
    fs.writeFileSync(fileInfo.filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

console.log('🔧 Fixing all service classes with Supabase client creation issues...');
traverseDirectory(projectRoot);

console.log(`📁 Found ${filesToProcess.length} files with Supabase client creation issues:`);
filesToProcess.forEach(file => {
  console.log(`  - ${file.filePath} (line ${file.lineNumber})`);
});

let fixedCount = 0;
let errorCount = 0;

for (const fileInfo of filesToProcess) {
  try {
    if (applyFix(fileInfo)) {
      console.log(`✅ Fixed: ${fileInfo.filePath}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${fileInfo.filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fileInfo.filePath}: ${error.message}`);
    errorCount++;
  }
}

console.log('\n📊 Summary:');
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`📁 Total processed: ${filesToProcess.length} files`);

if (fixedCount > 0) {
  console.log('\n🎉 Successfully fixed service classes!');
  console.log('💡 All services now use lazy Supabase client initialization.');
} else if (filesToProcess.length > 0) {
  console.log('\nAll identified files were already fixed or did not require changes.');
} else {
  console.log('\nNo service classes with Supabase client creation issues found.');
}
