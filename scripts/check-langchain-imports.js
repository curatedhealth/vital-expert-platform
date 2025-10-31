#!/usr/bin/env node

/**
 * Compliance check: ensure no new LangChain JS imports are introduced under /apps
 *
 * Existing legacy files are tracked in scripts/langchain-allowlist.json.
 * Any new usage outside the allowlist will cause this script to exit with a non-zero status.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const ALLOWLIST_PATH = path.join(__dirname, 'langchain-allowlist.json');
const SEARCH_ROOTS = ['apps'];
const LANGCHAIN_PATTERN = /@langchain/g;
const LEGACY_FILE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
  '.json',
]);

if (!fs.existsSync(ALLOWLIST_PATH)) {
  console.error('[LangChain Compliance] Allowlist file not found:', ALLOWLIST_PATH);
  process.exit(1);
}

const rawAllowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
const allowlist = new Set();
const unmatchedAllowlist = new Set();

for (const entry of rawAllowlist) {
  const normalized = String(entry).replace(/\\/g, '/');
  allowlist.add(normalized);
  if (!normalized.includes('.bak.')) {
    unmatchedAllowlist.add(normalized);
  }
}
const violations = new Map();

function shouldSkipDirectory(dirName) {
  return [
    'node_modules',
    '.next',
    '.turbo',
    '.git',
    'dist',
    'build',
    'coverage',
  ].includes(dirName);
}

function shouldInspectFile(filePath) {
  const ext = path.extname(filePath);
  if (!LEGACY_FILE_EXTENSIONS.has(ext)) {
    return false;
  }

  // Skip backup artifacts that mirror legacy implementations.
  return !filePath.includes('.bak.');
}

function checkFile(filePath) {
  const relativePath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');

  LANGCHAIN_PATTERN.lastIndex = 0;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn('[LangChain Compliance] Unable to read file:', relativePath, error);
    return;
  }

  if (!LANGCHAIN_PATTERN.test(content)) {
    return;
  }

  if (allowlist.has(relativePath)) {
    unmatchedAllowlist.delete(relativePath);
    return;
  }

  violations.set(relativePath, true);
}

function walkDirectory(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const absolutePath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDirectory(entry.name)) continue;
      walkDirectory(absolutePath);
      continue;
    }

    if (!shouldInspectFile(absolutePath)) continue;
    checkFile(absolutePath);
  }
}

for (const root of SEARCH_ROOTS) {
  const absoluteRoot = path.join(REPO_ROOT, root);
  if (!fs.existsSync(absoluteRoot)) continue;
  walkDirectory(absoluteRoot);
}

if (violations.size > 0) {
  console.error('\n[LangChain Compliance] ❌ Detected unsupported LangChain JS imports:\n');
  for (const file of violations.keys()) {
    console.error(`  - ${file}`);
  }
  console.error('\nPlease migrate these modules to the Python AI engine or add a temporary allowlist entry.');
  process.exit(1);
}

if (unmatchedAllowlist.size > 0) {
  console.warn(
    '\n[LangChain Compliance] ⚠️ Allowlist entries with no matching files detected:'
  );
  for (const entry of unmatchedAllowlist.values()) {
    console.warn(`  - ${entry}`);
  }
  console.warn('Consider removing these entries if the files have been migrated.\n');
}

console.log('[LangChain Compliance] ✅ No new LangChain JS imports detected.');
