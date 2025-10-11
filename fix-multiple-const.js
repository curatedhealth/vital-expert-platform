#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing multiple const keywords...\n');

// Find all TypeScript files
const srcDir = path.join(__dirname, 'src');
const files = getAllFiles(srcDir, ['.ts', '.tsx']);

let fixedFiles = new Set();

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix multiple const keywords
  const fixes = [
    { pattern: /const const const /g, replacement: 'const ' },
    { pattern: /const const /g, replacement: 'const ' },
    { pattern: /const eateContext/g, replacement: 'createContext' },
    { pattern: /const ew /g, replacement: 'new ' },
    { pattern: /const rocess/g, replacement: 'process' },
    { pattern: /const his\./g, replacement: 'this.' },
    { pattern: /const wait /g, replacement: 'await ' },
    { pattern: /const eCallback/g, replacement: 'useCallback' },
    { pattern: /const nter\(/g, replacement: 'Inter(' },
    { pattern: /const className="inter\.className}/g, replacement: 'className={inter.className}' },
    { pattern: /const lang = en"/g, replacement: 'lang="en"' },
    { pattern: /const charSet = utf-8"/g, replacement: 'charSet="utf-8"' },
    { pattern: /const name = viewport"/g, replacement: 'name="viewport"' },
    { pattern: /const content = width=device-width, initial-scale=1"/g, replacement: 'content="width=device-width, initial-scale=1"' }
  ];
  
  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixedFiles.add(file);
    console.log(`  ✓ Fixed multiple const in ${file}`);
  }
});

console.log(`\n✅ Fixed ${fixedFiles.size} files with multiple const issues\n`);

function getAllFiles(dir, extensions) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  });
  
  return files;
}
