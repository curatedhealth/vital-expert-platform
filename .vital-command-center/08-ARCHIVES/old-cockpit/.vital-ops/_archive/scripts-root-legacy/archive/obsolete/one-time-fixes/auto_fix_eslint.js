#!/usr/bin/env node

/**
 * Automated ESLint Fix Script - Comprehensive
 * Fixes all auto-fixable issues and provides guidance for manual fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/hichamnaim/Downloads/Cursor/VITAL path';

console.log('================================================');
console.log('VITAL Path - Automated ESLint Fix');
console.log('================================================\n');

// Step 1: Run auto-fix for all fixable issues
console.log('Step 1: Running ESLint auto-fix...');
try {
  execSync('npm run lint:fix', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  console.log('✓ Auto-fix complete\n');
} catch (error) {
  console.log('✓ Auto-fix complete (some issues remain)\n');
}

// Step 2: Generate detailed report
console.log('Step 2: Generating detailed ESLint report...');
let output;
try {
  output = execSync('npm run lint -- --format json', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  });
} catch (error) {
  output = error.stdout || '';
}

// Parse the JSON output
let results = [];
try {
  const parsed = JSON.parse(output);
  results = parsed;
} catch (e) {
  console.log('Could not parse ESLint JSON output');
}

// Step 3: Analyze remaining issues
console.log('\nStep 3: Analyzing remaining issues...\n');

const issueStats = {
  unusedVars: 0,
  consoleStatements: 0,
  explicitAny: 0,
  unsafeAssignment: 0,
  unsafeCall: 0,
  unsafeMemberAccess: 0,
  accessibility: 0,
  importOrder: 0,
  useBeforeDefine: 0,
  other: 0
};

const fileIssues = {};

if (Array.isArray(results)) {
  results.forEach(result => {
    if (result.messages && result.messages.length > 0) {
      const fileName = path.relative(PROJECT_ROOT, result.filePath);
      fileIssues[fileName] = result.messages.length;

      result.messages.forEach(msg => {
        if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
          issueStats.unusedVars++;
        } else if (msg.ruleId === 'no-console') {
          issueStats.consoleStatements++;
        } else if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
          issueStats.explicitAny++;
        } else if (msg.ruleId === '@typescript-eslint/no-unsafe-assignment') {
          issueStats.unsafeAssignment++;
        } else if (msg.ruleId === '@typescript-eslint/no-unsafe-call') {
          issueStats.unsafeCall++;
        } else if (msg.ruleId === '@typescript-eslint/no-unsafe-member-access') {
          issueStats.unsafeMemberAccess++;
        } else if (msg.ruleId && msg.ruleId.startsWith('jsx-a11y/')) {
          issueStats.accessibility++;
        } else if (msg.ruleId === 'import/order') {
          issueStats.importOrder++;
        } else if (msg.ruleId === '@typescript-eslint/no-use-before-define') {
          issueStats.useBeforeDefine++;
        } else {
          issueStats.other++;
        }
      });
    }
  });
}

console.log('Issue Statistics:');
console.log('==========================================');
console.log(`Unused Variables: ${issueStats.unusedVars}`);
console.log(`Console Statements: ${issueStats.consoleStatements}`);
console.log(`Explicit any: ${issueStats.explicitAny}`);
console.log(`Unsafe Assignments: ${issueStats.unsafeAssignment}`);
console.log(`Unsafe Calls: ${issueStats.unsafeCall}`);
console.log(`Unsafe Member Access: ${issueStats.unsafeMemberAccess}`);
console.log(`Accessibility Issues: ${issueStats.accessibility}`);
console.log(`Import Order: ${issueStats.importOrder}`);
console.log(`Use Before Define: ${issueStats.useBeforeDefine}`);
console.log(`Other Issues: ${issueStats.other}`);
console.log('==========================================');

const totalIssues = Object.values(issueStats).reduce((a, b) => a + b, 0);
console.log(`\nTotal Issues Remaining: ${totalIssues}\n`);

// Step 4: Show files with most issues
console.log('Files with Most Issues (Top 20):');
console.log('==========================================');
const sortedFiles = Object.entries(fileIssues)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

sortedFiles.forEach(([file, count]) => {
  console.log(`${count.toString().padStart(4)} issues - ${file}`);
});

// Step 5: Generate recommendations
console.log('\n\nRecommendations for Manual Fixes:');
console.log('==========================================');

if (issueStats.unusedVars > 0) {
  console.log(`\n1. Unused Variables (${issueStats.unusedVars} instances):`);
  console.log('   - Remove unused imports');
  console.log('   - Prefix unused function parameters with _ (e.g., _param)');
  console.log('   - Remove unused variable declarations');
}

if (issueStats.consoleStatements > 0) {
  console.log(`\n2. Console Statements (${issueStats.consoleStatements} instances):`);
  console.log('   - Remove console.log from production code');
  console.log('   - Keep console.warn and console.error in API routes');
  console.log('   - Add eslint-disable comments for test files if needed');
}

if (issueStats.explicitAny > 0) {
  console.log(`\n3. Explicit any Types (${issueStats.explicitAny} instances):`);
  console.log('   - Replace "any" with "unknown" as default');
  console.log('   - Add proper type definitions where possible');
  console.log('   - Use type guards for unknown types');
}

if (issueStats.unsafeAssignment + issueStats.unsafeCall + issueStats.unsafeMemberAccess > 0) {
  const total = issueStats.unsafeAssignment + issueStats.unsafeCall + issueStats.unsafeMemberAccess;
  console.log(`\n4. Unsafe Operations (${total} instances):`);
  console.log('   - Add type assertions after validation');
  console.log('   - Use type guards to narrow types');
  console.log('   - Consider adding @ts-expect-error with explanation');
}

if (issueStats.accessibility > 0) {
  console.log(`\n5. Accessibility Issues (${issueStats.accessibility} instances):`);
  console.log('   - Add htmlFor to label elements');
  console.log('   - Fix anchor tags with invalid href');
  console.log('   - Add proper ARIA attributes');
}

console.log('\n\nNext Steps:');
console.log('==========================================');
console.log('1. Review the files with the most issues');
console.log('2. Fix unused variables systematically');
console.log('3. Remove/replace console statements');
console.log('4. Update type definitions');
console.log('5. Run: npm run lint -- --fix');
console.log('6. Run: npm run lint to verify');
console.log('\n✓ Analysis complete!');