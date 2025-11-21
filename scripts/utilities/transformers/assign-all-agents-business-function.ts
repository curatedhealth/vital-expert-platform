/**
 * Ensure ALL agents have a business function assigned from org_functions table
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

// Mapping of string business_function values to standardized names
const functionMapping: Record<string, string> = {
  'research_and_development': 'Research & Development',
  'research & development': 'Research & Development',
  'r&d': 'Research & Development',
  'clinical_development': 'Clinical Development',
  'clinical development': 'Clinical Development',
  'regulatory_affairs': 'Regulatory Affairs',
  'regulatory affairs': 'Regulatory Affairs',
  'regulatory': 'Regulatory Affairs',
  'quality_and_compliance': 'Quality & Compliance',
  'quality & compliance': 'Quality & Compliance',
  'quality': 'Quality & Compliance',
  'manufacturing_and_supply_chain': 'Manufacturing & Supply Chain',
  'manufacturing & supply chain': 'Manufacturing & Supply Chain',
  'manufacturing': 'Manufacturing & Supply Chain',
  'supply_chain': 'Manufacturing & Supply Chain',
  'commercial': 'Commercial',
  'medical_affairs': 'Medical Affairs',
  'medical affairs': 'Medical Affairs',
  'medical': 'Medical Affairs',
  'market_access': 'Market Access',
  'market access': 'Market Access',
  'safety_pharmacovigilance': 'Safety & Pharmacovigilance',
  'safety & pharmacovigilance': 'Safety & Pharmacovigilance',
  'safety': 'Safety & Pharmacovigilance',
  'pharmacovigilance': 'Safety & Pharmacovigilance',
  'business_development': 'Business Development',
  'business development': 'Business Development',
  'bd': 'Business Development',
  'corporate_affairs': 'Corporate Affairs',
  'corporate affairs': 'Corporate Affairs',
  'finance': 'Finance',
  'data_analytics': 'Data & Analytics',
  'data & analytics': 'Data & Analytics',
  'data': 'Data & Analytics',
  'analytics': 'Data & Analytics'
};

async function assignAllAgentsBusinessFunction() {
  console.log('🚀 Assigning Business Functions to ALL Agents...\n');

  try {
    // 1. Fetch all org_functions
    const { data: functions, error: funcError } = await supabase
      .from('org_functions')
      .select('id, unique_id, department_name');

    if (funcError) throw funcError;
    console.log(`✓ Loaded ${functions?.length || 0} business functions\n`);

    // Create a map for quick lookup
    const functionMap = new Map<string, any>();
    functions?.forEach(f => {
      const normalized = f.department_name.toLowerCase().trim();
      functionMap.set(normalized, f);
    });

    // 2. Fetch ALL agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, display_name, business_function, function_id');

    if (agentsError) throw agentsError;
    console.log(`✓ Loaded ${agents?.length || 0} agents\n`);

    // 3. Check current status
    const agentsWithoutFunction = agents?.filter(a => !a.function_id) || [];
    console.log('📊 Current Status:');
    console.log(`   Total Agents: ${agents?.length || 0}`);
    console.log(`   With function_id: ${(agents?.length || 0) - agentsWithoutFunction.length}`);
    console.log(`   Without function_id: ${agentsWithoutFunction.length}\n`);

    if (agentsWithoutFunction.length === 0) {
      console.log('✅ All agents already have business functions assigned!\n');
      return;
    }

    // 4. Process each agent without function_id
    console.log('🔄 Processing agents without business function...\n');

    let updated = 0;
    let assigned = 0;
    let defaultAssigned = 0;
    let errors = 0;

    // Get a default function for agents without any business_function string
    const defaultFunction = functions?.find(f =>
      f.department_name === 'Clinical Development' ||
      f.department_name === 'Medical Affairs'
    ) || functions?.[0];

    for (const agent of agentsWithoutFunction) {
      let matchedFunction = null;

      // Try to match based on existing business_function string
      if (agent.business_function) {
        const normalized = agent.business_function.toLowerCase().trim();

        // Try direct match
        matchedFunction = functionMap.get(normalized);

        // Try mapped value
        if (!matchedFunction && functionMapping[normalized]) {
          const mappedName = functionMapping[normalized].toLowerCase();
          matchedFunction = functionMap.get(mappedName);
        }

        // Try partial match
        if (!matchedFunction) {
          for (const [key, func] of functionMap.entries()) {
            if (key.includes(normalized) || normalized.includes(key)) {
              matchedFunction = func;
              break;
            }
          }
        }
      }

      // Use default function if no match found
      if (!matchedFunction) {
        matchedFunction = defaultFunction;
        defaultAssigned++;
      } else {
        assigned++;
      }

      // Update the agent
      if (matchedFunction) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({
            function_id: matchedFunction.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.id);

        if (updateError) {
          console.error(`   ✗ Error updating ${agent.display_name}:`, updateError.message);
          errors++;
        } else {
          updated++;
          const label = matchedFunction === defaultFunction ? '(default)' : '';
          console.log(`   ✓ ${agent.display_name} → ${matchedFunction.department_name} ${label}`);
        }
      }
    }

    // 5. Final verification
    console.log('\n📈 Verification...');

    const { data: updatedAgents } = await supabase
      .from('agents')
      .select('id, function_id');

    const finalWithFunction = updatedAgents?.filter(a => a.function_id).length || 0;

    console.log('\n✅ ASSIGNMENT COMPLETE\n');
    console.log('═══════════════════════════════════════');
    console.log(`Total Agents:              ${agents?.length || 0}`);
    console.log(`Successfully Updated:      ${updated}`);
    console.log(`  - Matched from string:   ${assigned}`);
    console.log(`  - Assigned default:      ${defaultAssigned}`);
    console.log(`Errors:                    ${errors}`);
    console.log('═══════════════════════════════════════');
    console.log(`Final Coverage:            ${finalWithFunction}/${agents?.length || 0} (${Math.round(finalWithFunction / (agents?.length || 1) * 100)}%)`);
    console.log('═══════════════════════════════════════\n');

    if (finalWithFunction < (agents?.length || 0)) {
      console.log(`⚠️  ${(agents?.length || 0) - finalWithFunction} agents still missing business function\n`);
    } else {
      console.log('🎉 ALL agents now have business functions assigned!\n');
    }

  } catch (error) {
    console.error('❌ Assignment failed:', error);
    process.exit(1);
  }
}

// Run the assignment
assignAllAgentsBusinessFunction();
