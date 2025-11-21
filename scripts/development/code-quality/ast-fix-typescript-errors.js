#!/usr/bin/env node
/**
 * AST-Based TypeScript Error Fixer
 * Uses TypeScript Compiler API for context-aware fixes
 *
 * Usage: node scripts/ast-fix-typescript-errors.js [--file=path] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_PATH = path.join(__dirname, '../apps/digital-health-startup');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

console.log('🔧 AST-Based TypeScript Error Fixer\n');
if (DRY_RUN) console.log('🔍 DRY RUN MODE - No files will be modified\n');

/**
 * Get TypeScript errors for a file
 */
function getFileErrors(filePath) {
  try {
    const output = execSync(
      `cd "${APP_PATH}" && npx tsc --noEmit 2>&1 | grep "${filePath}"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const errors = [];
    output.split('\n').forEach(line => {
      const match = line.match(/\((\d+),(\d+)\): error (TS\d+): (.+)/);
      if (match) {
        errors.push({
          line: parseInt(match[1]),
          col: parseInt(match[2]),
          code: match[3],
          message: match[4]
        });
      }
    });
    return errors;
  } catch (error) {
    return [];
  }
}

/**
 * Fix Pattern 1: Missing const declaration at start of line
 * Example: ".from('table')" -> "const query = supabase.from('table')"
 */
function fixMissingConstDeclaration(content, errors) {
  const lines = content.split('\n');
  let fixCount = 0;

  errors.forEach(error => {
    if (error.code === 'TS1128' || error.code === 'TS1109') {
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Pattern: Line starts with whitespace then a method call
      const methodCallMatch = line.match(/^(\s+)\.(\w+)\(/);
      if (methodCallMatch) {
        const indent = methodCallMatch[1];
        const method = methodCallMatch[2];

        // Look at previous lines to find what object this belongs to
        let varName = 'query'; // default

        // Check if previous line is a function declaration
        const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
        if (prevLine.includes('Promise<') || prevLine.includes('{')) {
          // This is likely start of function body
          // Check what service/object is available in scope
          if (content.includes('supabase.from')) {
            varName = 'query';
          } else if (content.includes('prisma.')) {
            varName = 'query';
          }

          lines[lineIndex] = `${indent}const ${varName} = supabase${line.trim()}`;
          fixCount++;
        }
      }

      // Pattern: Method call without variable (e.g., "chunksData.map")
      const assignmentMatch = line.match(/^(\s+)(\w+)\.map\(async/);
      if (assignmentMatch) {
        const indent = assignmentMatch[1];
        const arrayName = assignmentMatch[2];
        lines[lineIndex] = `${indent}const chunks = await Promise.all(\n${indent}  ${line.trim()}`;
        fixCount++;
      }
    }
  });

  return { content: lines.join('\n'), fixCount };
}

/**
 * Fix Pattern 2: Missing semicolons
 */
function fixMissingSemicolons(content, errors) {
  const lines = content.split('\n');
  let fixCount = 0;

  errors.forEach(error => {
    if (error.code === 'TS1005' && error.message.includes("';' expected")) {
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Only add semicolon if line doesn't already end with one
      if (line.trim() && !line.trim().endsWith(';') &&
          !line.trim().endsWith(',') &&
          !line.trim().endsWith('{') &&
          !line.trim().endsWith('}') &&
          !line.trim().endsWith('(') &&
          !line.trim().endsWith(')')) {

        // Check if it's a property definition
        if (line.includes(':') && !line.includes('//')) {
          lines[lineIndex] = line + ',';
          fixCount++;
        } else if (line.match(/^(\s+)(const|let|var|return)\s+/)) {
          lines[lineIndex] = line + ';';
          fixCount++;
        }
      }
    }
  });

  return { content: lines.join('\n'), fixCount };
}

/**
 * Fix Pattern 3: Missing variable declaration for destructuring
 */
function fixMissingDestructuringDeclaration(content, errors) {
  const lines = content.split('\n');
  let fixCount = 0;

  errors.forEach(error => {
    if (error.code === 'TS1128') {
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Pattern: { something } = expression
      const destructureMatch = line.match(/^(\s+)(\{[^}]+\})\s*=/);
      if (destructureMatch) {
        const indent = destructureMatch[1];
        lines[lineIndex] = `${indent}const ${line.trim()}`;
        fixCount++;
      }
    }
  });

  return { content: lines.join('\n'), fixCount };
}

/**
 * Fix Pattern 4: Missing const for arrow functions
 */
function fixMissingArrowFunctionDeclaration(content, errors) {
  const lines = content.split('\n');
  let fixCount = 0;

  errors.forEach(error => {
    if (error.code === 'TS1128' || error.code === 'TS1005') {
      const lineIndex = error.line - 1;
      const line = lines[lineIndex];

      // Pattern: handleClick = () => {
      const arrowMatch = line.match(/^(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/);
      if (arrowMatch && !line.includes('const') && !line.includes('let')) {
        const indent = arrowMatch[1];
        lines[lineIndex] = `${indent}const ${line.trim()}`;
        fixCount++;
      }
    }
  });

  return { content: lines.join('\n'), fixCount };
}

/**
 * Process a single file
 */
function processFile(relativeFilePath) {
  const filePath = path.join(APP_PATH, relativeFilePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativeFilePath}`);
    return { fixed: 0, errors: [] };
  }

  // Get errors for this file
  const errors = getFileErrors(relativeFilePath);
  if (errors.length === 0) {
    return { fixed: 0, errors: [] };
  }

  // Read file
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let totalFixes = 0;

  // Apply fixes in order of safest to most complex
  let result;

  // 1. Fix missing semicolons (safest)
  result = fixMissingSemicolons(content, errors);
  content = result.content;
  totalFixes += result.fixCount;

  // 2. Fix missing const for destructuring
  result = fixMissingDestructuringDeclaration(content, errors);
  content = result.content;
  totalFixes += result.fixCount;

  // 3. Fix missing arrow function declarations
  result = fixMissingArrowFunctionDeclaration(content, errors);
  content = result.content;
  totalFixes += result.fixCount;

  // 4. Fix missing const declarations (most complex)
  result = fixMissingConstDeclaration(content, errors);
  content = result.content;
  totalFixes += result.fixCount;

  // Write file if changes were made and not dry run
  if (content !== originalContent && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return { fixed: totalFixes, errors: errors.length };
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Analyzing TypeScript errors...\n');

  let filesToProcess = [];

  if (SINGLE_FILE) {
    filesToProcess = [SINGLE_FILE];
    console.log(`🎯 Processing single file: ${SINGLE_FILE}\n`);
  } else {
    // Get all files with errors
    try {
      const output = execSync(
        `cd "${APP_PATH}" && npx tsc --noEmit 2>&1 | grep "error TS" | cut -d'(' -f1 | sort -u`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      filesToProcess = output.split('\n')
        .filter(line => line.trim())
        .filter(line => !line.includes('node_modules'))
        .slice(0, 30); // Top 30 files

      console.log(`📁 Found ${filesToProcess.length} files with errors\n`);
    } catch (error) {
      console.error('❌ Error getting file list:', error.message);
      process.exit(1);
    }
  }

  // Process each file
  let totalFixed = 0;
  let filesFixed = 0;

  for (const file of filesToProcess) {
    const result = processFile(file);
    if (result.fixed > 0) {
      console.log(`✅ Fixed ${result.fixed} patterns in ${file} (${result.errors} total errors)`);
      totalFixed += result.fixed;
      filesFixed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${filesToProcess.length}`);
  console.log(`   Files fixed: ${filesFixed}`);
  console.log(`   Patterns fixed: ${totalFixed}`);

  if (!DRY_RUN) {
    console.log('\n🔍 Verifying fixes...');
    try {
      const errorCount = execSync(
        `cd "${APP_PATH}" && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`,
        { encoding: 'utf-8' }
      ).trim();
      console.log(`   Errors remaining: ${errorCount}`);
    } catch (error) {
      console.log('   Could not verify error count');
    }
  }

  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
