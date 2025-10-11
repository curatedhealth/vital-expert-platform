#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix implicit any type errors in React event handlers
 */

const files = [
  'src/app/(app)/ask-panel/components/panel-builder.tsx',
  'src/app/(app)/ask-panel/components/panel-templates.tsx',
  'src/app/(app)/ask-panel/components/panel-sidebar.tsx',
  'src/app/(app)/ask-panel/page.tsx',
  'src/app/(app)/knowledge-domains/page.tsx',
  'src/app/(app)/profile/page.tsx',
  'src/app/(app)/knowledge/page.tsx'
];

const patterns = [
  // Input onChange handlers
  {
    search: /onChange=\{\(e\)\s*=>/g,
    replace: 'onChange={(e: React.ChangeEvent<HTMLInputElement>) =>'
  },
  // Textarea onChange handlers
  {
    search: /onChange=\{\(e\)\s*=>/g,
    replace: 'onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>'
  },
  // Button onClick handlers
  {
    search: /onClick=\{\(e\)\s*=>/g,
    replace: 'onClick={(e: React.MouseEvent<HTMLButtonElement>) =>'
  },
  // onKeyDown handlers
  {
    search: /onKeyDown=\{\(e\)\s*=>/g,
    replace: 'onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>'
  },
  // onKeyDown for textarea
  {
    search: /onKeyDown=\{\(e\)\s*=>/g,
    replace: 'onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>'
  }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  patterns.forEach(pattern => {
    const newContent = content.replace(pattern.search, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🔧 Fixing implicit any type errors...\n');

  files.forEach(file => {
    fixFile(file);
  });

  console.log('\n✅ Implicit any fixes completed!');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, patterns };
