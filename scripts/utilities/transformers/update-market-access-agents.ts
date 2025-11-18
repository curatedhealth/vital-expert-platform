/**
 * Update all Market Access agents to use the Market Access function
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateMarketAccessAgents() {
  console.log('🚀 Updating Market Access agents...\n');

  try {
    // Get Market Access function
    const { data: marketAccessFunction, error: funcError } = await supabase
      .from('org_functions')
      .select('id, department_name')
      .eq('department_name', 'Market Access')
      .single();

    if (funcError || !marketAccessFunction) {
      throw new Error('Market Access function not found');
    }

    console.log('✓ Found Market Access function:', marketAccessFunction.id);

    // Find all agents with market access related business_function strings
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, display_name, business_function, function_id');

    if (agentsError) throw agentsError;

    // Filter agents that should be Market Access
    const marketAccessAgents = agents?.filter(a => {
      const bf = (a.business_function || '').toLowerCase();
      return bf.includes('market') ||
             bf.includes('access') ||
             bf.includes('heor') ||
             bf.includes('pricing') ||
             bf.includes('reimbursement') ||
             bf.includes('payer') ||
             bf.includes('formulary') ||
             bf.includes('evidence') ||
             bf.includes('health economics');
    }) || [];

    console.log(`\n📊 Found ${marketAccessAgents.length} Market Access agents\n`);

    let updated = 0;
    let alreadyUpdated = 0;

    for (const agent of marketAccessAgents) {
      if (agent.function_id === marketAccessFunction.id) {
        alreadyUpdated++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('agents')
        .update({
          function_id: marketAccessFunction.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`   ✗ Error updating ${agent.display_name}:`, updateError.message);
      } else {
        updated++;
        console.log(`   ✓ ${agent.display_name}`);
      }
    }

    console.log('\n✅ UPDATE COMPLETE\n');
    console.log('═══════════════════════════════════════');
    console.log(`Total Market Access Agents: ${marketAccessAgents.length}`);
    console.log(`Updated:                    ${updated}`);
    console.log(`Already up-to-date:         ${alreadyUpdated}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMarketAccessAgents();
