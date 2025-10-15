#!/usr/bin/env node

/**
 * Sync organizational structure tables (business_functions, departments, organizational_roles)
 * from CSVs in the repository root.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const FILES = {
  functions: 'Functions 2753dedf985680178336f15f9342a9a7_all.csv',
  departments: 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv',
  roles: 'Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv',
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] || '').trim().replace(/^"|"$/g, '');
    });
    return obj;
  });
}

async function safeInsertUniqueByName(table, rows, nameKey = 'name') {
  if (rows.length === 0) return { inserted: 0 };
  // Fetch existing names
  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select('name');
  if (fetchError) {
    console.error(`❌ Read ${table} failed:`, fetchError.message);
    process.exit(1);
  }
  const existingNames = new Set((existing || []).map(r => (r.name || '').toLowerCase()));

  // Build new rows filtered by name not present
  // Prepare and de-duplicate by lowercased name
  const seen = new Set();
  const prepared = [];
  for (const r of rows) {
    const name = (r[nameKey] || r['Name'] || r['name'] || '').slice(0, 255).trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (existingNames.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    prepared.push({
      name,
      description: r['Description'] || r['description'] || null,
    });
  }

  let inserted = 0;
  const batchSize = 500;
  for (let i = 0; i < prepared.length; i += batchSize) {
    const batch = prepared.slice(i, i + batchSize);
    if (batch.length === 0) continue;
    const { error, count } = await supabase
      .from(table)
      .insert(batch, { count: 'exact' });
    if (error) {
      console.error(`❌ Insert ${table} failed:`, error.message);
      process.exit(1);
    }
    inserted += count || batch.length;
  }
  return { inserted };
}

async function main() {
  console.log('🚀 Syncing organizational structure tables...');

  const root = process.cwd();
  const funcRows = parseCSV(path.join(root, FILES.functions));
  const deptRows = parseCSV(path.join(root, FILES.departments));
  const roleRows = parseCSV(path.join(root, FILES.roles));

  const f = await safeInsertUniqueByName('business_functions', funcRows);
  const d = await safeInsertUniqueByName('departments', deptRows);
  const r = await safeInsertUniqueByName('organizational_roles', roleRows);

  console.log('✅ Sync complete:', { functions: f.inserted, departments: d.inserted, roles: r.inserted });
}

main().catch(err => { console.error('❌ Fatal error:', err); process.exit(1); });


