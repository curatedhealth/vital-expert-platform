#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding all API routes with Supabase client creation issues...');

// Find all route.ts files in the API directory
const findRouteFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item === 'route.ts' || item === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
};

const apiDir = path.join(__dirname, 'src', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`📁 Found ${routeFiles.length} API route files`);

const problematicFiles = [];

for (const filePath of routeFiles) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for module-level Supabase client creation
    const hasModuleLevelClient = content.includes('const supabase = createClient(') && 
                                !content.includes('// Create Supabase client inside the function');
    
    if (hasModuleLevelClient) {
      problematicFiles.push(filePath);
      console.log(`❌ Found issue in: ${filePath}`);
    }
  } catch (error) {
    console.log(`⚠️  Error reading ${filePath}: ${error.message}`);
  }
}

console.log(`\n🎯 Found ${problematicFiles.length} files with Supabase client creation issues`);

if (problematicFiles.length === 0) {
  console.log('✅ No issues found! All routes are properly configured.');
  process.exit(0);
}

console.log('\n📝 Files that need fixing:');
problematicFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🔧 To fix these files, you need to:');
console.log('1. Remove the module-level Supabase client creation');
console.log('2. Add Supabase client creation inside each function with proper error handling');
console.log('3. Example pattern:');
console.log(`
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // ... rest of function
  } catch (error) {
    // ... error handling
  }
}
`);

process.exit(1);
