#!/usr/bin/env node

// This script patches styled-jsx to prevent "document is not defined" errors during SSR
// It runs as a postinstall hook

const fs = require('fs');
const path = require('path');

const styledJsxPath = path.join(
  __dirname,
  '../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.28.5_react@18.3.1/node_modules/styled-jsx/dist/index/index.js'
);

const noopPath = path.join(__dirname, '../styled-jsx-noop.js');

try {
  if (fs.existsSync(styledJsxPath)) {
    const noopContent = fs.readFileSync(noopPath, 'utf8');
    fs.writeFileSync(styledJsxPath, noopContent, 'utf8');
    console.log('✅ Successfully patched styled-jsx to prevent SSR errors');
  } else {
    console.log('⚠️  styled-jsx not found at expected path, skipping patch');
  }
} catch (error) {
  console.error('❌ Error patching styled-jsx:', error.message);
  // Don't fail the build
  process.exit(0);
}
