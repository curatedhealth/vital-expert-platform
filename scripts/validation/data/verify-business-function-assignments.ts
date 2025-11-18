/**
 * Verify all agents have correct business function assignments
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAssignments() {
  console.log('✅ Verifying Business Function Assignments\n');

  // Get all business functions
  const { data: functions } = await supabase
    .from('business_functions')
    .select('*');

  if (!functions) {
    console.error('❌ Could not fetch business functions');
    return;
  }

  const functionMap: Record<string, any> = {};
  functions.forEach((func: any) => {
    functionMap[func.id] = func;
  });

  // Get all agents with their business functions
  const { data: agents } = await supabase
    .from('agents')
    .select('id, display_name, business_function, tier')
    .eq('status', 'active')
    .order('tier')
    .order('display_name');

  if (!agents) {
    console.error('❌ Could not fetch agents');
    return;
  }

  console.log('📊 BUSINESS FUNCTION DISTRIBUTION');
  console.log('='.repeat(80));

  const distribution: Record<string, number> = {};
  let missingCount = 0;
  let invalidCount = 0;

  agents.forEach((agent: any) => {
    if (!agent.business_function) {
      missingCount++;
      return;
    }

    const func = functionMap[agent.business_function];
    if (!func) {
      invalidCount++;
      console.log(`⚠️  Invalid UUID: ${agent.display_name} - ${agent.business_function}`);
      return;
    }

    distribution[func.name] = (distribution[func.name] || 0) + 1;
  });

  console.log('\nAgents per Business Function:');
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([funcName, count]) => {
      const percentage = ((count / agents.length) * 100).toFixed(1);
      console.log(`  ${funcName.padEnd(30)} ${String(count).padStart(3)} agents (${percentage}%)`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Total Agents:           ${agents.length}`);
  console.log(`  ✅ Valid Assignments:    ${agents.length - missingCount - invalidCount}`);
  console.log(`  ⚠️  Missing Function:     ${missingCount}`);
  console.log(`  ❌ Invalid UUID:         ${invalidCount}`);
  console.log('='.repeat(80));

  // Show sample agents from each function
  console.log('\n📋 SAMPLE AGENTS BY FUNCTION');
  console.log('='.repeat(80));

  for (const func of functions) {
    const { data: sampleAgents } = await supabase
      .from('agents')
      .select('display_name, tier')
      .eq('business_function', func.id)
      .eq('status', 'active')
      .limit(3);

    if (sampleAgents && sampleAgents.length > 0) {
      console.log(`\n${func.name}:`);
      sampleAgents.forEach((agent: any, i: number) => {
        console.log(`  ${i + 1}. ${agent.display_name} (Tier ${agent.tier})`);
      });
    }
  }

  // Check for agents without business_function
  if (missingCount > 0) {
    console.log('\n⚠️  AGENTS WITHOUT BUSINESS FUNCTION');
    console.log('='.repeat(80));

    const { data: missingAgents } = await supabase
      .from('agents')
      .select('display_name, tier')
      .is('business_function', null)
      .eq('status', 'active')
      .limit(20);

    if (missingAgents) {
      missingAgents.forEach((agent: any, i: number) => {
        console.log(`  ${i + 1}. ${agent.display_name} (Tier ${agent.tier})`);
      });

      if (missingCount > 20) {
        console.log(`  ... and ${missingCount - 20} more`);
      }
    }
  }
}

verifyAssignments()
  .then(() => {
    console.log('\n✅ Verification complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
