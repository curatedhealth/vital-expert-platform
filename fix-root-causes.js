#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files with most TS1005/TS1128 errors
function getTopErrorFiles() {
  try {
    const result = execSync('npx tsc --noEmit 2>&1 | grep "TS1005\\|TS1128" | cut -d\'(\' -f1 | sort | uniq -c | sort -rn | head -10', { encoding: 'utf8' });
    return result.trim().split('\n').map(line => {
      const match = line.match(/^\s*(\d+)\s+(.+)$/);
      return match ? { count: parseInt(match[1]), file: match[2] } : null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Error getting file list:', error.message);
    return [];
  }
}

// Fix missing const declarations for object literals
function fixMissingConstDeclarations(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixes = 0;
    
    // Pattern 1: Object literals without const/let/var
    const objectLiteralPattern = /^\s*{\s*[^}]*}\s*;?\s*$/gm;
    const matches = content.match(objectLiteralPattern);
    
    if (matches) {
      matches.forEach(match => {
        const trimmed = match.trim();
        if (trimmed.startsWith('{') && !trimmed.match(/^\s*(const|let|var)\s+/)) {
          // This is likely a missing declaration
          console.log(`Found potential missing declaration in ${filePath}: ${trimmed.substring(0, 50)}...`);
        }
      });
    }
    
    // Pattern 2: Function calls without assignment
    const functionCallPattern = /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*;?\s*$/gm;
    const functionMatches = content.match(functionCallPattern);
    
    if (functionMatches) {
      functionMatches.forEach(match => {
        const trimmed = match.trim();
        if (!trimmed.match(/^\s*(const|let|var)\s+/)) {
          console.log(`Found potential missing assignment in ${filePath}: ${trimmed.substring(0, 50)}...`);
        }
      });
    }
    
    return fixes;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
function main() {
  console.log('🔍 Analyzing top error files...');
  const topFiles = getTopErrorFiles();
  
  console.log('\n📊 Top files with TS1005/TS1128 errors:');
  topFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}: ${file.count} errors`);
  });
  
  console.log('\n🔧 Analyzing patterns in top files...');
  topFiles.slice(0, 5).forEach(file => {
    console.log(`\n--- Analyzing ${file.file} ---`);
    const fixes = fixMissingConstDeclarations(file.file);
    console.log(`Potential fixes identified: ${fixes}`);
  });
  
  console.log('\n✅ Analysis complete. Review the patterns above to identify the most common issues.');
}

main();
