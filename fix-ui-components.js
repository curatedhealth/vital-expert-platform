#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of UI components that need fixing
const uiComponents = [
  'src/components/ui/label.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toggle.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/accordion.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/hover-card.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/stepper.tsx',
  'src/components/ui/timeline.tsx',
  'src/components/ui/toggle-group.tsx',
  'src/components/ui/tree.tsx',
  'src/components/ui/upload.tsx',
  'src/components/ui/virtual-list.tsx',
  'src/components/ui/wizard.tsx'
];

function fixComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match React.forwardRef without const declaration
  const forwardRefPattern = /^(\s*)(React\.ElementRef<[^>]+>,\s*React\.ComponentPropsWithoutRef<[^>]+>)\s*>\s*\(/gm;
  
  // Pattern to match function declarations without const
  const functionPattern = /^(\s*)(\w+)\s*=\s*\(\s*\{[^}]*\}\s*:\s*[^)]+\)\s*=>\s*\{/gm;

  // Fix React.forwardRef patterns
  content = content.replace(forwardRefPattern, (match, indent, typeDef) => {
    // Extract component name from the line before
    const lines = content.split('\n');
    const matchIndex = content.indexOf(match);
    const beforeMatch = content.substring(0, matchIndex);
    const beforeLines = beforeMatch.split('\n');
    const currentLineIndex = beforeLines.length - 1;
    
    // Look for the component name in the previous lines
    let componentName = 'Component';
    for (let i = currentLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('displayName') && line.includes('=')) {
        const nameMatch = line.match(/(\w+)\.displayName/);
        if (nameMatch) {
          componentName = nameMatch[1];
          break;
        }
      }
    }
    
    modified = true;
    return `${indent}const ${componentName} = React.forwardRef<\n${indent}  ${typeDef}\n${indent}>((`;
  });

  // Fix function patterns
  content = content.replace(functionPattern, (match, indent, funcName) => {
    modified = true;
    return `${indent}const ${funcName} = (`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

console.log('🔧 Fixing UI components...\n');

uiComponents.forEach(component => {
  fixComponent(component);
});

console.log('\n✅ UI components fix complete!');
