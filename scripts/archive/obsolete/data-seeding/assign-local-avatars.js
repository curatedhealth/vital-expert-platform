#!/usr/bin/env node

/**
 * Assign local PNG avatars to all agents (max 3 uses per icon)
 *
 * - Reads PNG files from the provided folder
 * - Shuffles and assigns each icon to up to 3 agents for better distribution
 * - Updates agents.avatar to a local path like /icons/png/avatars/avatar_0001.png
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/assign-local-avatars.js \
 *     --dir "/Users/hichamnaim/Downloads/Cursor/VITAL path/public/icons/png/avatars"
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

const MAX_USES_PER_ICON = 3;

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { dir: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') {
      result.dir = args[i + 1];
      i++;
    }
  }
  if (!result.dir) {
    console.error('❌ Please provide --dir pointing to the avatars PNG folder');
    process.exit(1);
  }
  return result;
}

function listPngFiles(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const pngs = entries
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.png'))
    .map(e => e.name)
    .sort();
  if (pngs.length === 0) {
    console.error('❌ No PNG files found in directory:', absDir);
    process.exit(1);
  }
  return pngs;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchAllAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, display_name, status')
    .order('tier', { ascending: true })
    .order('priority', { ascending: true });
  if (error) {
    console.error('❌ Failed to fetch agents:', error.message);
    process.exit(1);
  }
  return data || [];
}

function buildLocalPath(filename, absDir) {
  const relIdx = absDir.indexOf('/public/');
  if (relIdx === -1) {
    // Default to expected path prefix
    return `/icons/png/avatars/${filename}`;
  }
  const publicRoot = absDir.slice(relIdx + '/public'.length);
  const normalized = publicRoot.replace(/\\/g, '/').replace(/\s/g, '%20');
  return `${normalized}/${filename}`;
}

function createAssignmentPool(pngFiles, maxUses) {
  const pool = [];
  pngFiles.forEach(name => {
    for (let i = 0; i < maxUses; i++) {
      pool.push(name);
    }
  });
  return shuffle(pool);
}

async function updateAvatars(agents, absDir) {
  console.log(`\n💾 Updating avatars for ${agents.length} agents...`);
  let success = 0;
  let failed = 0;

  const batchSize = 50;
  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);
    const updates = batch.map(async (agent) => {
      const { error } = await supabase
        .from('agents')
        .update({ avatar: agent._newAvatar })
        .eq('id', agent.id);
      if (error) {
        failed++;
      } else {
        success++;
      }
    });
    await Promise.all(updates);
    process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, agents.length)}/${agents.length}`);
    if (i + batchSize < agents.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  console.log(`\n✅ Updated: ${success}, ❌ Failed: ${failed}`);
}

async function main() {
  const { dir } = parseArgs();
  const absDir = path.resolve(dir);
  console.log('📁 Icons directory:', absDir);

  const pngFiles = listPngFiles(absDir);
  console.log(`🖼️  Found ${pngFiles.length} PNG icons`);

  const agents = await fetchAllAgents();
  console.log(`👥 Found ${agents.length} agents`);

  const pool = createAssignmentPool(pngFiles, MAX_USES_PER_ICON);
  const capacity = pool.length;
  console.log(`📐 Capacity: ${capacity} slots (${pngFiles.length} icons × ${MAX_USES_PER_ICON})`);
  if (agents.length > capacity) {
    console.warn(`⚠️  Not enough icons to keep ≤${MAX_USES_PER_ICON}/icon. ${agents.length - capacity} agents will reuse beyond cap.`);
  }

  // Assign avatars
  let poolIdx = 0;
  for (const agent of agents) {
    const filename = pool[poolIdx % pool.length];
    const localPath = buildLocalPath(filename, absDir);
    agent._newAvatar = localPath;
    poolIdx++;
  }

  // Update DB
  await updateAvatars(agents, absDir);

  // Report distribution
  const usage = new Map();
  for (const a of agents) {
    const key = a._newAvatar;
    usage.set(key, (usage.get(key) || 0) + 1);
  }
  const overLimit = Array.from(usage.entries()).filter(([, count]) => count > MAX_USES_PER_ICON);
  console.log(`\n📊 Distribution summary:`);
  console.log(`   Icons used: ${usage.size}`);
  console.log(`   Over limit (> ${MAX_USES_PER_ICON}): ${overLimit.length}`);
  if (overLimit.length > 0) {
    console.log('   Examples:');
    overLimit.slice(0, 10).forEach(([k, c]) => console.log(`   - ${k}: ${c}`));
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});


