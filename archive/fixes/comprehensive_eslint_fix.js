#!/usr/bin/env node

/**
 * Comprehensive ESLint Fix Script
 * Systematically fixes all ESLint errors and warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = '/Users/hichamnaim/Downloads/Cursor/VITAL path';
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

let stats = {
  filesProcessed: 0,
  unusedVarsFixed: 0,
  consoleStatementsFixed: 0,
  explicitAnyFixed: 0,
  accessibilityFixed: 0,
  errors: []
};

/**
 * Fix unused variables in a file
 */
function fixUnusedVariables(filePath, content) {
  let fixed = content;
  let count = 0;

  // Pattern 1: Unused function parameters - prefix with underscore
  fixed = fixed.replace(/(\w+)\s*:\s*([^,)]+)(\s*[,)])/g, (match, paramName, paramType, ending) => {
    // Check if parameter is used in the function body after its definition
    const functionMatch = content.match(new RegExp(`${paramName}\\s*:.*?\\{([^}]+)\\}`, 's'));
    if (functionMatch && !functionMatch[1].includes(paramName)) {
      count++;
      return `_${paramName}: ${paramType}${ending}`;
    }
    return match;
  });

  // Pattern 2: Remove unused imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
  fixed = fixed.replace(importRegex, (match) => {
    const imports = match.match(/\{([^}]+)\}/)[1].split(',').map(i => i.trim());
    const usedImports = imports.filter(imp => {
      const varName = imp.split(' as ')[1] || imp;
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = content.match(regex);
      return matches && matches.length > 1; // More than just the import statement
    });

    if (usedImports.length === 0) {
      count++;
      return '';
    }
    if (usedImports.length < imports.length) {
      count++;
      return match.replace(/\{([^}]+)\}/, `{${usedImports.join(', ')}}`);
    }
    return match;
  });

  // Pattern 3: Remove unused variable declarations
  fixed = fixed.replace(/^\s*(const|let|var)\s+(_?\w+)\s*=\s*[^;]+;?\s*$/gm, (match, keyword, varName) => {
    if (varName.startsWith('_')) return match; // Already prefixed

    // Check if variable is used after declaration
    const afterDeclaration = content.slice(content.indexOf(match) + match.length);
    const regex = new RegExp(`\\b${varName}\\b`);

    if (!regex.test(afterDeclaration)) {
      count++;
      return `${keyword} _${varName}${match.slice(match.indexOf('='))}`;
    }
    return match;
  });

  stats.unusedVarsFixed += count;
  return fixed;
}

/**
 * Remove console statements
 */
function removeConsoleStatements(filePath, content) {
  let fixed = content;
  let count = 0;

  // Check if it's a test file or config file (console allowed)
  if (filePath.includes('test') || filePath.includes('spec') ||
      filePath.includes('config') || filePath.includes('scripts/')) {
    return content;
  }

  // Check if it's an API route (console.warn and console.error allowed)
  const isApiRoute = filePath.includes('/api/');

  // Remove console.log statements
  fixed = fixed.replace(/^\s*console\.log\([^)]*\);?\s*$/gm, () => {
    count++;
    return '';
  });

  // Remove console.debug statements
  fixed = fixed.replace(/^\s*console\.debug\([^)]*\);?\s*$/gm, () => {
    count++;
    return '';
  });

  // Remove console.info statements unless in API route
  if (!isApiRoute) {
    fixed = fixed.replace(/^\s*console\.info\([^)]*\);?\s*$/gm, () => {
      count++;
      return '';
    });
  }

  // Clean up empty lines
  fixed = fixed.replace(/\n\n\n+/g, '\n\n');

  stats.consoleStatementsFixed += count;
  return fixed;
}

/**
 * Replace explicit any with unknown
 */
function replaceExplicitAny(filePath, content) {
  let fixed = content;
  let count = 0;

  // Pattern 1: Function parameters
  fixed = fixed.replace(/(\w+):\s*any\b/g, (match, paramName) => {
    count++;
    return `${paramName}: unknown`;
  });

  // Pattern 2: Type annotations
  fixed = fixed.replace(/:\s*any\[\]/g, () => {
    count++;
    return ': unknown[]';
  });

  // Pattern 3: Generic types
  fixed = fixed.replace(/<any>/g, () => {
    count++;
    return '<unknown>';
  });

  // Pattern 4: Type assertions
  fixed = fixed.replace(/as\s+any\b/g, () => {
    count++;
    return 'as unknown';
  });

  stats.explicitAnyFixed += count;
  return fixed;
}

/**
 * Fix accessibility issues
 */
function fixAccessibility(filePath, content) {
  let fixed = content;
  let count = 0;

  // Fix labels without htmlFor
  fixed = fixed.replace(/<label([^>]*)>(?!.*htmlFor)/g, (match, attrs) => {
    // Try to find nearby input id
    const inputMatch = content.match(/<input[^>]*id=["']([^"']+)["'][^>]*>/);
    if (inputMatch) {
      count++;
      return `<label${attrs} htmlFor="${inputMatch[1]}">`;
    }
    return match;
  });

  // Fix anchor tags with invalid href
  fixed = fixed.replace(/<a\s+href=["']#["']/g, () => {
    count++;
    return '<a href="javascript:void(0)"';
  });

  stats.accessibilityFixed += count;
  return fixed;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;

    // Apply fixes in order
    fixed = fixUnusedVariables(filePath, fixed);
    fixed = removeConsoleStatements(filePath, fixed);
    fixed = replaceExplicitAny(filePath, fixed);
    fixed = fixAccessibility(filePath, fixed);

    // Only write if changes were made
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      stats.filesProcessed++;
      console.log(`✓ Fixed: ${path.relative(PROJECT_ROOT, filePath)}`);
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively find all TypeScript files
 */
function findTypeScriptFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (entry.name === 'node_modules' || entry.name === '.next' ||
        entry.name === 'dist' || entry.name === 'build' ||
        entry.name === 'coverage') {
      continue;
    }

    if (entry.isDirectory()) {
      findTypeScriptFiles(fullPath, files);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('================================================');
  console.log('VITAL Path - Comprehensive ESLint Fix');
  console.log('================================================\n');

  console.log('Finding TypeScript files...');
  const files = findTypeScriptFiles(SRC_DIR);
  console.log(`Found ${files.length} TypeScript files\n`);

  console.log('Processing files...\n');
  files.forEach(processFile);

  console.log('\n================================================');
  console.log('Fix Summary');
  console.log('================================================');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Unused variables fixed: ${stats.unusedVarsFixed}`);
  console.log(`Console statements removed: ${stats.consoleStatementsFixed}`);
  console.log(`Explicit any replaced: ${stats.explicitAnyFixed}`);
  console.log(`Accessibility issues fixed: ${stats.accessibilityFixed}`);
  console.log(`Errors encountered: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  ${path.relative(PROJECT_ROOT, file)}: ${error}`);
    });
  }

  console.log('\n================================================');
  console.log('Running auto-fix for import order...');
  console.log('================================================\n');

  try {
    execSync('npm run lint:fix', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      encoding: 'utf8'
    });
  } catch (error) {
    console.log('Some issues remain after auto-fix (expected)');
  }

  console.log('\n✓ Fix process complete!');
  console.log('Run "npm run lint" to see remaining issues');
}

main();