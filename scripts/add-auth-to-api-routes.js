#!/usr/bin/env node

/**
 * Script to add authentication middleware to API routes
 * This addresses the missing authentication on admin endpoints
 */

const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = 'src/app/api';

// Admin routes that need authentication
const ADMIN_ROUTES = [
  'admin/costs/overview/route.ts',
  'admin/costs/anomalies/route.ts',
  'admin/audit-logs/route.ts',
  'admin/costs/forecast/route.ts',
  'admin/alerts/instances/route.ts',
  'admin/security/violations/route.ts',
  'admin/compliance/playbooks/route.ts'
];

// User routes that need authentication
const USER_ROUTES = [
  'dashboard/rag-metrics/route.ts',
  'agents/route.ts',
  'knowledge/route.ts',
  'chat/route.ts',
  'workflows/route.ts',
  'medical-intelligence/route.ts',
  'llm/route.ts',
  'events/route.ts',
  'settings/route.ts',
  'profile/route.ts'
];

const AUTH_IMPORT = "import { withAuth } from '@/lib/auth/api-auth-middleware';";

function addAuthToRoute(filePath, isAdmin = false) {
  try {
    const fullPath = path.join(API_ROUTES_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${fullPath}`);
      return false;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if auth is already added
    if (content.includes('withAuth') || content.includes('api-auth-middleware')) {
      console.log(`✅ Already has auth: ${filePath}`);
      return true;
    }

    // Add auth import
    let newContent = content;
    
    // Find the last import statement and add auth import
    const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      newContent = content.slice(0, insertIndex) + '\n' + AUTH_IMPORT + content.slice(insertIndex);
    } else {
      // No imports found, add at the beginning
      newContent = AUTH_IMPORT + '\n\n' + content;
    }

    // Wrap the main function with withAuth
    const functionRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{/g;
    const match = newContent.match(functionRegex);
    
    if (match) {
      const functionName = match[0].match(/(GET|POST|PUT|DELETE|PATCH)/)[0];
      const functionStart = newContent.indexOf(match[0]);
      const functionEnd = newContent.indexOf('}', functionStart);
      
      // Find the matching closing brace
      let braceCount = 1;
      let i = functionStart + match[0].length;
      while (i < newContent.length && braceCount > 0) {
        if (newContent[i] === '{') braceCount++;
        if (newContent[i] === '}') braceCount--;
        i++;
      }
      
      const functionBody = newContent.slice(functionStart + match[0].length, i - 1);
      const beforeFunction = newContent.slice(0, functionStart);
      const afterFunction = newContent.slice(i);
      
      // Create new function with auth wrapper
      const newFunction = `export async function ${functionName}(request: NextRequest) {
  return withAuth(request, async (req, user) => {
${functionBody}
  });
}`;
      
      newContent = beforeFunction + newFunction + afterFunction;
    }

    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`✅ Added auth to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function addAuthToAllRoutes() {
  console.log('🔐 Adding authentication to API routes...\n');
  
  let successCount = 0;
  let totalCount = ADMIN_ROUTES.length + USER_ROUTES.length;
  
  console.log('📁 Admin routes:');
  for (const route of ADMIN_ROUTES) {
    if (addAuthToRoute(route, true)) {
      successCount++;
    }
  }
  
  console.log('\n📁 User routes:');
  for (const route of USER_ROUTES) {
    if (addAuthToRoute(route, false)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} routes updated`);
  
  if (successCount === totalCount) {
    console.log('✅ All API routes now have authentication!');
  } else {
    console.log('⚠️  Some routes could not be updated. Check the errors above.');
  }
}

// Run the script
if (require.main === module) {
  addAuthToAllRoutes();
}

module.exports = { addAuthToRoute, addAuthToAllRoutes };
