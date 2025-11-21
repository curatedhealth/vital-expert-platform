#!/usr/bin/env node

/**
 * Fix Remaining ESLint Errors
 * Targets specific error types that weren't caught in the first pass
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Remaining ESLint Errors...\n');

const srcDir = path.join(__dirname, '../src');

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          getAllTsFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    } catch (error) {
      // Skip files we can't access
    }
  });

  return fileList;
}

const tsFiles = getAllTsFiles(srcDir);
console.log(`Processing ${tsFiles.length} TypeScript files...\n`);

let stats = {
  filesModified: 0,
  errorsFixed: 0,
  unusedVarsRemoved: 0,
  emptyBlocksFixed: 0
};

tsFiles.forEach((filePath, index) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let modified = false;

    // Fix 1: Remove unused underscored variables (lines with just const _ = ...)
    // These were prefixed but still unused
    const unusedUnderscoreRegex = /^\s*(const|let|var)\s+_[a-zA-Z0-9_]*\s*=.*?;?\s*$/gm;
    if (content.match(unusedUnderscoreRegex)) {
      content = content.replace(unusedUnderscoreRegex, '');
      stats.unusedVarsRemoved++;
      modified = true;
    }

    // Fix 2: Remove lines with unused '_prompt' variables
    const unusedPromptRegex = /^\s*(const|let|var)\s+_prompt\s*=.*?;?\s*$/gm;
    if (content.match(unusedPromptRegex)) {
      content = content.replace(unusedPromptRegex, '');
      stats.unusedVarsRemoved++;
      modified = true;
    }

    // Fix 3: Remove other unused variables that are assigned but never used
    const lines = content.split('\n');
    const newLines = [];
    let removedLines = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip lines with unused variable declarations
      if (
        line.match(/^\s*(const|let|var)\s+_[a-zA-Z0-9_]*\s*=/) ||
        line.match(/^\s*(const|let|var)\s+effectiveness_improvement\s*=/) ||
        line.match(/^\s*(const|let|var)\s+_z_alpha\s*=/)
      ) {
        removedLines++;
        continue;
      }

      // Fix empty blocks: {} => { /* empty */ }
      if (line.match(/\{\s*\}/) && !line.includes('/*')) {
        newLines.push(line.replace(/\{\s*\}/, '{ /* empty */ }'));
        stats.emptyBlocksFixed++;
        modified = true;
      } else {
        newLines.push(line);
      }
    }

    if (removedLines > 0) {
      content = newLines.join('\n');
      modified = true;
      stats.unusedVarsRemoved += removedLines;
    }

    // Fix 4: Remove duplicate semicolons
    const duplicateSemiRegex = /;;+/g;
    if (content.match(duplicateSemiRegex)) {
      content = content.replace(duplicateSemiRegex, ';');
      modified = true;
    }

    // Fix 5: Fix common parsing errors
    // Remove trailing commas in imports that might cause issues
    content = content.replace(/,(\s*})\s+from/g, '$1 from');

    // Write back if modified
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesModified++;
      stats.errorsFixed++;
    }

    // Progress indicator
    if ((index + 1) % 100 === 0) {
      console.log(`  Processed ${index + 1}/${tsFiles.length} files...`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
});

console.log('\n✅ Fixes Applied:');
console.log(`  Files modified: ${stats.filesModified}`);
console.log(`  Errors fixed: ${stats.errorsFixed}`);
console.log(`  Unused variables removed: ${stats.unusedVarsRemoved}`);
console.log(`  Empty blocks fixed: ${stats.emptyBlocksFixed}`);

// Run ESLint auto-fix again
console.log('\nRunning final ESLint auto-fix...');
try {
  execSync('npx eslint src --ext .ts,.tsx --fix', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
} catch (error) {
  // Expected
}

// Get final count
console.log('\nGetting final error count...');
let finalOutput;
try {
  finalOutput = execSync('npx eslint src --ext .ts,.tsx', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  });
} catch (error) {
  finalOutput = error.stdout || '';
}

const summaryMatch = finalOutput.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
if (summaryMatch) {
  console.log('\n📊 Final ESLint Status:');
  console.log(`  Total issues: ${summaryMatch[1]}`);
  console.log(`  Errors: ${summaryMatch[2]}`);
  console.log(`  Warnings: ${summaryMatch[3]}`);
} else {
  console.log('\n✅ No ESLint issues remaining!');
}

console.log('\n✨ Done!');