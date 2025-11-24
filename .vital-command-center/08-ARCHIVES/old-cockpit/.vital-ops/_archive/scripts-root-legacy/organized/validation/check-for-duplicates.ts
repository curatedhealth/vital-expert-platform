/**
 * Check for Duplicate Agents
 * - Check by name field (primary identifier)
 * - Check by display_name (for similar roles)
 * - Check by normalized names (ignoring case, spaces, hyphens)
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

async function checkForDuplicates() {
  console.log('🔍 Checking for Duplicate Agents\n');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, business_function')
    .eq('status', 'active')
    .order('name');

  if (error || !agents) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Total Active Agents: ${agents.length}\n`);

  console.log('='.repeat(80));
  console.log('CHECK 1: EXACT NAME DUPLICATES');
  console.log('='.repeat(80) + '\n');

  const nameMap = new Map<string, any[]>();
  agents.forEach(agent => {
    const name = agent.name;
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name)!.push(agent);
  });

  const exactDuplicates = Array.from(nameMap.entries())
    .filter(([_, agents]) => agents.length > 1);

  if (exactDuplicates.length > 0) {
    console.log(`❌ Found ${exactDuplicates.length} exact name duplicates:\n`);
    exactDuplicates.forEach(([name, duplicateAgents]) => {
      console.log(`  "${name}" - ${duplicateAgents.length} instances:`);
      duplicateAgents.forEach(agent => {
        console.log(`    - ID: ${agent.id}`);
        console.log(`      Display: ${agent.display_name}`);
        console.log(`      Tier: ${agent.tier}\n`);
      });
    });
  } else {
    console.log('✅ No exact name duplicates found!\n');
  }

  console.log('='.repeat(80));
  console.log('CHECK 2: EXACT DISPLAY NAME DUPLICATES');
  console.log('='.repeat(80) + '\n');

  const displayNameMap = new Map<string, any[]>();
  agents.forEach(agent => {
    const displayName = agent.display_name;
    if (!displayNameMap.has(displayName)) {
      displayNameMap.set(displayName, []);
    }
    displayNameMap.get(displayName)!.push(agent);
  });

  const displayDuplicates = Array.from(displayNameMap.entries())
    .filter(([_, agents]) => agents.length > 1);

  if (displayDuplicates.length > 0) {
    console.log(`❌ Found ${displayDuplicates.length} display name duplicates:\n`);
    displayDuplicates.forEach(([displayName, duplicateAgents]) => {
      console.log(`  "${displayName}" - ${duplicateAgents.length} instances:`);
      duplicateAgents.forEach(agent => {
        console.log(`    - ID: ${agent.id}`);
        console.log(`      Name: ${agent.name}`);
        console.log(`      Tier: ${agent.tier}\n`);
      });
    });
  } else {
    console.log('✅ No exact display name duplicates found!\n');
  }

  console.log('='.repeat(80));
  console.log('CHECK 3: NORMALIZED NAME DUPLICATES');
  console.log('='.repeat(80) + '\n');

  const normalizedMap = new Map<string, any[]>();
  agents.forEach(agent => {
    const normalized = normalizeString(agent.name);
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, []);
    }
    normalizedMap.get(normalized)!.push(agent);
  });

  const normalizedDuplicates = Array.from(normalizedMap.entries())
    .filter(([_, agents]) => agents.length > 1);

  if (normalizedDuplicates.length > 0) {
    console.log(`⚠️  Found ${normalizedDuplicates.length} normalized name duplicates:\n`);
    console.log('(These have the same name when ignoring case, spaces, and hyphens)\n');
    normalizedDuplicates.forEach(([normalized, duplicateAgents]) => {
      console.log(`  Normalized: "${normalized}"`);
      duplicateAgents.forEach(agent => {
        console.log(`    - "${agent.name}" → "${agent.display_name}"`);
        console.log(`      ID: ${agent.id}, Tier: ${agent.tier}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No normalized duplicates found!\n');
  }

  console.log('='.repeat(80));
  console.log('CHECK 4: SIMILAR DISPLAY NAMES (FUZZY MATCH)');
  console.log('='.repeat(80) + '\n');

  const normalizedDisplayMap = new Map<string, any[]>();
  agents.forEach(agent => {
    const normalized = normalizeString(agent.display_name);
    if (!normalizedDisplayMap.has(normalized)) {
      normalizedDisplayMap.set(normalized, []);
    }
    normalizedDisplayMap.get(normalized)!.push(agent);
  });

  const similarDisplayNames = Array.from(normalizedDisplayMap.entries())
    .filter(([_, agents]) => agents.length > 1);

  if (similarDisplayNames.length > 0) {
    console.log(`⚠️  Found ${similarDisplayNames.length} similar display names:\n`);
    similarDisplayNames.forEach(([normalized, duplicateAgents]) => {
      console.log(`  Similar to: "${duplicateAgents[0].display_name}"`);
      duplicateAgents.forEach(agent => {
        console.log(`    - "${agent.display_name}"`);
        console.log(`      Name: ${agent.name}, ID: ${agent.id.substring(0, 8)}..., Tier: ${agent.tier}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No similar display names found!\n');
  }

  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Total agents: ${agents.length}`);
  console.log(`  Exact name duplicates: ${exactDuplicates.length}`);
  console.log(`  Exact display name duplicates: ${displayDuplicates.length}`);
  console.log(`  Normalized name duplicates: ${normalizedDuplicates.length}`);
  console.log(`  Similar display names: ${similarDisplayNames.length}`);

  const totalIssues =
    exactDuplicates.length +
    displayDuplicates.length +
    normalizedDuplicates.length +
    similarDisplayNames.length;

  if (totalIssues === 0) {
    console.log('\n✅ No duplicates found! All agents are unique.\n');
  } else {
    console.log(`\n⚠️  Total duplicate issues found: ${totalIssues}\n`);
    console.log('💡 Recommendation: Review and remove duplicate agents to maintain data quality.\n');
  }

  return {
    totalAgents: agents.length,
    exactNameDuplicates: exactDuplicates.length,
    displayNameDuplicates: displayDuplicates.length,
    normalizedDuplicates: normalizedDuplicates.length,
    similarDisplayNames: similarDisplayNames.length,
  };
}

checkForDuplicates()
  .then((result) => {
    if (result) {
      process.exit(result.exactNameDuplicates > 0 ? 1 : 0);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
