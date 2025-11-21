/**
 * Remove Duplicate Agents
 * - Keep the agent with the proper snake_case name format
 * - Remove duplicates with improper name formats
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function removeDuplicates() {
  console.log('🔄 Removing Duplicate Agents\n');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, created_at')
    .eq('status', 'active')
    .order('name');

  if (error || !agents) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Total Active Agents: ${agents.length}\n`);

  // Group by normalized name
  const normalizedMap = new Map<string, any[]>();
  agents.forEach(agent => {
    const normalized = normalizeString(agent.name);
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, []);
    }
    normalizedMap.get(normalized)!.push(agent);
  });

  const duplicateGroups = Array.from(normalizedMap.entries())
    .filter(([_, agents]) => agents.length > 1);

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found!\n');
    return { removed: 0 };
  }

  console.log(`Found ${duplicateGroups.length} duplicate groups\n`);

  let totalRemoved = 0;

  for (const [normalized, duplicates] of duplicateGroups) {
    console.log(`\n🔍 Processing duplicate group: "${normalized}"`);
    console.log(`   ${duplicates.length} agents found:\n`);

    // Sort to prefer snake_case names (contains underscores)
    const sorted = duplicates.sort((a, b) => {
      // Prefer snake_case (lowercase with underscores)
      const aIsSnakeCase = /^[a-z][a-z0-9_]*$/.test(a.name);
      const bIsSnakeCase = /^[a-z][a-z0-9_]*$/.test(b.name);

      if (aIsSnakeCase && !bIsSnakeCase) return -1;
      if (!aIsSnakeCase && bIsSnakeCase) return 1;

      // If both or neither are snake_case, prefer older (created first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const keeper = sorted[0];
    const toRemove = sorted.slice(1);

    console.log(`   ✅ KEEPING:`);
    console.log(`      Name: "${keeper.name}"`);
    console.log(`      Display: "${keeper.display_name}"`);
    console.log(`      ID: ${keeper.id}\n`);

    console.log(`   ❌ REMOVING ${toRemove.length} duplicate(s):`);
    for (const duplicate of toRemove) {
      console.log(`      Name: "${duplicate.name}"`);
      console.log(`      Display: "${duplicate.display_name}"`);
      console.log(`      ID: ${duplicate.id}`);

      // Delete the duplicate
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', duplicate.id);

      if (deleteError) {
        console.error(`      ❌ Error deleting: ${deleteError.message}`);
      } else {
        console.log(`      ✅ Deleted successfully`);
        totalRemoved++;
      }
    }
  }

  // Final count
  const { count: finalCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log('\n' + '='.repeat(80));
  console.log('📊 REMOVAL SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Initial agents: ${agents.length}`);
  console.log(`  Duplicates removed: ${totalRemoved}`);
  console.log(`  Final agent count: ${finalCount}`);

  console.log('\n✅ Duplicate removal complete!\n');

  return { removed: totalRemoved, finalCount };
}

removeDuplicates()
  .then((result) => {
    if (result) {
      console.log('✅ All duplicates have been removed.\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
