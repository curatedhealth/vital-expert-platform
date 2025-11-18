#!/usr/bin/env node
/**
 * Automated TypeScript Error Fix Script
 * Fixes common syntax errors (TS1005, TS1128, TS1109)
 *
 * Usage: node scripts/fix-typescript-errors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_PATH = path.join(__dirname, '../apps/digital-health-startup');

console.log('🔧 TypeScript Error Fixer - Starting...\n');

// Get list of files with most errors
console.log('📊 Analyzing TypeScript errors...');
const errorOutput = execSync(
  `cd "${APP_PATH}" && npx tsc --noEmit 2>&1 | grep "error TS1005\\|error TS1128\\|error TS1109"`,
  { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);

const fileErrorCounts = {};
const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));

errorLines.forEach(line => {
  const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+):/);
  if (match) {
    const [, filePath, lineNum, col, errorCode] = match;
    if (!fileErrorCounts[filePath]) {
      fileErrorCounts[filePath] = { count: 0, errors: [] };
    }
    fileErrorCounts[filePath].count++;
    fileErrorCounts[filePath].errors.push({ line: parseInt(lineNum), col: parseInt(col), code: errorCode });
  }
});

// Sort files by error count
const sortedFiles = Object.entries(fileErrorCounts)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 30); // Top 30 files

console.log(`\n📁 Found ${sortedFiles.length} files with syntax errors`);
console.log('Top 10 files with most errors:');
sortedFiles.slice(0, 10).forEach(([file, data], index) => {
  console.log(`  ${index + 1}. ${file} (${data.count} errors)`);
});

console.log('\n🔨 Starting fixes...\n');

let totalFixed = 0;
let filesFixed = 0;

// Fix patterns for each file
for (const [relativeFilePath, data] of sortedFiles) {
  const filePath = path.join(APP_PATH, relativeFilePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativeFilePath}`);
    continue;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let fixCount = 0;

    // Pattern 1: Missing const/let/var before arrow functions
    // Example: "  handleClick = () => {" -> "const handleClick = () => {"
    const arrowFunctionPattern = /^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/gm;
    content = content.replace(arrowFunctionPattern, (match, indent, name, params) => {
      fixCount++;
      return `${indent}const ${name} = ${params} =>`;
    });

    // Pattern 2: Missing const before object/array destructuring
    // Example: "  { data } = await fetch()" -> "const { data } = await fetch()"
    const destructurePattern = /^(\s+)(\{[^}]+\}|\[[^\]]+\])\s*=\s*(?!>)/gm;
    content = content.replace(destructurePattern, (match, indent, destructure) => {
      // Check if it's not already preceded by const/let/var
      if (!match.trim().startsWith('const') && !match.trim().startsWith('let') && !match.trim().startsWith('var')) {
        fixCount++;
        return `${indent}const ${destructure} = `;
      }
      return match;
    });

    // Pattern 3: Missing semicolons at end of statements
    // Example: "const x = 5" -> "const x = 5;"
    const lines = content.split('\n');
    const fixedLines = lines.map((line, index) => {
      // Skip empty lines, comments, and lines already ending with semicolon/comma/brace
      if (line.trim() === '' ||
          line.trim().startsWith('//') ||
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*') ||
          line.trim().endsWith(';') ||
          line.trim().endsWith(',') ||
          line.trim().endsWith('{') ||
          line.trim().endsWith('}') ||
          line.trim().endsWith('[') ||
          line.trim().endsWith(']') ||
          line.trim().endsWith('(') ||
          line.trim().endsWith(')') ||
          line.trim().endsWith('=>')) {
        return line;
      }

      // Check if this line has a TS1005 error
      const hasError = data.errors.some(err =>
        err.line === index + 1 && err.code === 'TS1005'
      );

      if (hasError && line.match(/^\s*(const|let|var|return|export)\s+/)) {
        fixCount++;
        return line + ';';
      }

      return line;
    });

    if (fixCount > 0) {
      content = fixedLines.join('\n');
    }

    // Only write if we made changes
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed ${fixCount} errors in ${relativeFilePath}`);
      totalFixed += fixCount;
      filesFixed++;
    }

  } catch (error) {
    console.error(`❌ Error processing ${relativeFilePath}:`, error.message);
  }
}

console.log('\n📊 Fix Summary:');
console.log(`   Files processed: ${sortedFiles.length}`);
console.log(`   Files fixed: ${filesFixed}`);
console.log(`   Total fixes applied: ${totalFixed}`);

console.log('\n🔍 Verifying fixes...');
try {
  const newErrorCount = execSync(
    `cd "${APP_PATH}" && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`,
    { encoding: 'utf-8' }
  ).trim();

  console.log(`   Errors remaining: ${newErrorCount}`);
  console.log(`   Errors fixed: ${errorLines.length - parseInt(newErrorCount)}`);
} catch (error) {
  console.error('⚠️  Could not verify fixes');
}

console.log('\n✨ Done!\n');
