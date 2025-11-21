import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateAgentsWithReadableNames() {
  console.log('\n🔄 UPDATING AGENTS WITH READABLE BUSINESS FUNCTION NAMES\n');
  console.log('='.repeat(80));

  // 1. Get all business functions to create mapping
  const { data: functions, error: funcError } = await supabase
    .from('business_functions')
    .select('id, name');

  if (funcError || !functions) {
    console.error('❌ Error fetching business functions:', funcError);
    return;
  }

  const functionMap = new Map(functions.map(f => [f.id, f.name]));
  console.log('\n📊 Function Mapping:');
  functionMap.forEach((name, id) => {
    console.log(`  ${id} -> ${name}`);
  });

  // 2. Get all agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, department, role')
    .eq('status', 'active');

  if (agentsError || !agents) {
    console.error('❌ Error fetching agents:', agentsError);
    return;
  }

  console.log(`\n📋 Found ${agents.length} active agents`);

  // 3. Update agents with readable function names
  let updated = 0;
  let alreadyReadable = 0;
  let errors = 0;

  for (const agent of agents) {
    // Check if business_function is a UUID (contains hyphens in UUID format)
    const isUUID = agent.business_function && agent.business_function.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/);

    if (isUUID) {
      const readableName = functionMap.get(agent.business_function);

      if (readableName) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({ business_function: readableName })
          .eq('id', agent.id);

        if (updateError) {
          console.error(`❌ Error updating ${agent.display_name}:`, updateError);
          errors++;
        } else {
          updated++;
          if (updated <= 5) {
            console.log(`✅ Updated: ${agent.display_name}`);
            console.log(`   ${agent.business_function} -> ${readableName}`);
          }
        }
      } else {
        console.warn(`⚠️  No mapping found for UUID: ${agent.business_function} (${agent.display_name})`);
        errors++;
      }
    } else {
      alreadyReadable++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 UPDATE SUMMARY:');
  console.log(`  ✅ Updated: ${updated} agents`);
  console.log(`  ℹ️  Already readable: ${alreadyReadable} agents`);
  console.log(`  ❌ Errors: ${errors} agents`);
  console.log(`  📈 Total: ${agents.length} agents`);

  // 4. Verify the updates
  console.log('\n🔍 VERIFICATION:');
  const { data: verifyAgents } = await supabase
    .from('agents')
    .select('business_function')
    .eq('status', 'active');

  const stillUUIDs = verifyAgents?.filter(a =>
    a.business_function && a.business_function.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  ).length || 0;

  const readable = verifyAgents?.filter(a =>
    a.business_function && !a.business_function.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  ).length || 0;

  console.log(`  ✅ Readable function names: ${readable}/${verifyAgents?.length || 0}`);
  console.log(`  ⚠️  Still UUIDs: ${stillUUIDs}/${verifyAgents?.length || 0}`);

  // 5. Show sample of updated agents
  const { data: sampleAgents } = await supabase
    .from('agents')
    .select('display_name, business_function, department, role')
    .eq('status', 'active')
    .limit(5);

  console.log('\n✨ SAMPLE OF UPDATED AGENTS:');
  sampleAgents?.forEach(agent => {
    console.log(`\n  📌 ${agent.display_name}`);
    console.log(`     Function: ${agent.business_function}`);
    console.log(`     Department: ${agent.department}`);
    console.log(`     Role: ${agent.role}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Update Complete!\n');
}

updateAgentsWithReadableNames();
