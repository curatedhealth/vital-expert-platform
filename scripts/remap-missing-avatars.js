#!/usr/bin/env node

/**
 * Remap agents pointing to missing numbered avatar PNGs to available ones (≤3 uses per icon)
 * - Detects avatar_* patterns and /icons/png/avatars/avatar_####.png paths
 * - Verifies file existence under the target avatars directory
 * - Reassigns missing ones to available icons with cap ≤ 3 uses
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

const AVATARS_DIR = path.resolve('/Users/hichamnaim/Downloads/Cursor/VITAL path/public/icons/png/avatars');
const MAX_USES_PER_ICON = 3;

function listExistingPngs() {
  const entries = fs.readdirSync(AVATARS_DIR, { withFileTypes: true });
  return new Set(entries.filter(e => e.isFile() && e.name.endsWith('.png')).map(e => e.name));
}

function toFilenameFromAvatarField(value) {
  if (!value) return null;
  if (/^avatar_\d{3,4}$/.test(value)) {
    const num = value.replace('avatar_', '').padStart(4, '0');
    return `avatar_${num}.png`;
  }
  if (/\/icons\/png\/avatars\/avatar_\d{4}\.png$/.test(value)) {
    return path.basename(value);
  }
  return null;
}

async function fetchAgents() {
  const { data, error } = await supabase.from('agents').select('id, name, display_name, avatar');
  if (error) {
    console.error('❌ Failed to fetch agents:', error.message);
    process.exit(1);
  }
  return data || [];
}

async function main() {
  const existing = listExistingPngs();
  console.log(`🖼️  Available PNGs: ${existing.size}`);

  const agents = await fetchAgents();
  console.log(`👥 Agents: ${agents.length}`);

  // Count current usage for available files
  const usage = new Map();
  for (const a of agents) {
    const filename = toFilenameFromAvatarField(a.avatar);
    if (filename && existing.has(filename)) {
      usage.set(filename, (usage.get(filename) || 0) + 1);
    }
  }

  // Build pool of files with remaining capacity
  const files = Array.from(existing);
  files.sort();
  const pool = [];
  for (const f of files) {
    const used = usage.get(f) || 0;
    const remaining = Math.max(0, MAX_USES_PER_ICON - used);
    for (let i = 0; i < remaining; i++) pool.push(f);
  }

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let poolIdx = 0;
  const updates = [];
  const missing = [];
  for (const a of agents) {
    const filename = toFilenameFromAvatarField(a.avatar);
    if (filename && existing.has(filename)) continue; // Already valid

    // Needs remap if it looked like avatar pattern but missing or invalid
    if (filename || (typeof a.avatar === 'string' && a.avatar.includes('/icons/png/avatars/'))) {
      missing.push({ id: a.id, name: a.display_name || a.name, old: a.avatar });
      if (pool.length === 0) continue;
      const pick = pool[poolIdx % pool.length];
      poolIdx++;
      const newPath = `/icons/png/avatars/${pick}`;
      updates.push({ id: a.id, newAvatar: newPath });
      usage.set(pick, (usage.get(pick) || 0) + 1);
    }
  }

  console.log(`🔎 Missing/invalid avatar refs found: ${missing.length}`);
  console.log(`🛠️  Planned updates: ${updates.length}`);

  // Apply updates in batches
  let success = 0, failed = 0;
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    await Promise.all(batch.map(async (u) => {
      const { error } = await supabase.from('agents').update({ avatar: u.newAvatar }).eq('id', u.id);
      if (error) failed++; else success++;
    }));
    process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, updates.length)}/${updates.length}`);
    if (i + batchSize < updates.length) await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n✅ Updated: ${success}, ❌ Failed: ${failed}`);
}

main().catch(err => { console.error('❌ Fatal error:', err); process.exit(1); });


