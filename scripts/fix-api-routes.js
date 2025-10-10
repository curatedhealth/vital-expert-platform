#!/usr/bin/env node

/**
 * Script to fix API routes by adding dynamic export
 * This addresses the static generation errors identified in the audit
 */

const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = 'src/app/api';
const DYNAMIC_EXPORT = "export const dynamic = 'force-dynamic';";

// Routes that need dynamic export (based on audit findings)
const ROUTES_TO_FIX = [
  'admin/health/route.ts',
  'admin/costs/overview/route.ts',
  'admin/costs/anomalies/route.ts',
  'admin/audit-logs/route.ts',
  'admin/costs/forecast/route.ts',
  'admin/alerts/instances/route.ts',
  'admin/security/violations/route.ts',
  'dashboard/rag-metrics/route.ts',
  'admin/compliance/playbooks/route.ts'
];

function addDynamicExport(filePath) {
  try {
    const fullPath = path.join(API_ROUTES_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${fullPath}`);
      return false;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log(`✅ Already has dynamic export: ${filePath}`);
      return true;
    }

    // Find the import section and add dynamic export after it
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    // Insert dynamic export after imports
    lines.splice(insertIndex, 0, '', DYNAMIC_EXPORT);
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`✅ Added dynamic export to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function fixAllRoutes() {
  console.log('🔧 Fixing API routes with dynamic export...\n');
  
  let successCount = 0;
  let totalCount = ROUTES_TO_FIX.length;
  
  for (const route of ROUTES_TO_FIX) {
    if (addDynamicExport(route)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} routes fixed`);
  
  if (successCount === totalCount) {
    console.log('✅ All API routes fixed successfully!');
  } else {
    console.log('⚠️  Some routes could not be fixed. Check the errors above.');
  }
}

// Run the script
if (require.main === module) {
  fixAllRoutes();
}

module.exports = { addDynamicExport, fixAllRoutes };
