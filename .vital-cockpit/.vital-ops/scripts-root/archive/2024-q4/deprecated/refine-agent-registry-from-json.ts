/**
 * Refine Agent Registry from JSON
 * - Remove duplicates between JSON and database
 * - Update existing agents with proper role-based names
 * - Add missing agents from JSON to reach 250 total
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface JsonAgent {
  name: string;
  display_name: string;
  description: string;
  avatar?: string;
  color?: string;
  model?: string;
  system_prompt?: string;
  tier: number;
  business_function: string;
  role: string;
  capabilities?: string[];
  knowledge_domains?: string[];
  domain_expertise?: string;
  priority?: number;
}

async function refineAgentRegistry() {
  console.log('🔄 Refining Agent Registry from JSON\n');

  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'vital_agents_registry_250_complete.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData = JSON.parse(jsonContent);
  const jsonAgents: JsonAgent[] = jsonData.agents;

  console.log(`📄 Loaded ${jsonAgents.length} agents from JSON\n`);

  // Get existing agents from database
  const { data: dbAgents, error: fetchError } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, business_function')
    .eq('status', 'active');

  if (fetchError || !dbAgents) {
    console.error('❌ Error fetching agents:', fetchError);
    return;
  }

  console.log(`💾 Found ${dbAgents.length} agents in database\n`);

  // Get business functions mapping
  const { data: businessFunctions } = await supabase
    .from('business_functions')
    .select('id, name');

  const funcMap: Record<string, string> = {};
  businessFunctions?.forEach(f => {
    funcMap[f.name] = f.id;
    // Add common variations
    if (f.name === 'regulatory_affairs') funcMap['regulatory'] = f.id;
    if (f.name === 'clinical_development') funcMap['drug_development'] = f.id;
  });

  // Track statistics
  let duplicatesFound = 0;
  let agentsUpdated = 0;
  let agentsAdded = 0;
  let personalNamesFixed = 0;

  // Create a map of existing agents by name
  const dbAgentMap = new Map(dbAgents.map(a => [a.name.toLowerCase(), a]));

  console.log('='.repeat(80));
  console.log('STEP 1: IDENTIFYING DUPLICATES AND UPDATES');
  console.log('='.repeat(80) + '\n');

  const agentsToAdd: JsonAgent[] = [];
  const agentsToUpdate: Array<{ id: string; updates: any }> = [];

  for (const jsonAgent of jsonAgents) {
    const existingAgent = dbAgentMap.get(jsonAgent.name.toLowerCase());

    if (existingAgent) {
      // Agent exists - check if needs update
      const needsUpdate =
        existingAgent.display_name !== jsonAgent.display_name ||
        !existingAgent.display_name.match(/(Specialist|Expert|Advisor|Manager|Director|Coordinator|Analyst|Strategist|Officer|Lead|Consultant|Architect|Designer|Monitor)$/i);

      if (needsUpdate) {
        // Check if display name is personal name pattern
        const isPersonalName =
          /^Dr\.\s+[A-Z][a-z]+/.test(existingAgent.display_name) ||
          /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(existingAgent.display_name);

        if (isPersonalName) {
          console.log(`🔧 Fixing personal name: "${existingAgent.display_name}" → "${jsonAgent.display_name}"`);
          personalNamesFixed++;
        }

        agentsToUpdate.push({
          id: existingAgent.id,
          updates: {
            display_name: jsonAgent.display_name,
            description: jsonAgent.description,
            tier: jsonAgent.tier,
            business_function: funcMap[jsonAgent.business_function] || existingAgent.business_function,
            avatar: jsonAgent.avatar || existingAgent.id.split('-')[0].padStart(4, '0'),
          }
        });
        agentsUpdated++;
      }
      duplicatesFound++;
    } else {
      // New agent - add to list
      agentsToAdd.push(jsonAgent);
    }
  }

  console.log(`\n📊 Analysis Complete:`);
  console.log(`   Duplicates found: ${duplicatesFound}`);
  console.log(`   Agents to update: ${agentsUpdated}`);
  console.log(`   Personal names to fix: ${personalNamesFixed}`);
  console.log(`   New agents to add: ${agentsToAdd.length}\n`);

  // Update existing agents
  if (agentsToUpdate.length > 0) {
    console.log('='.repeat(80));
    console.log('STEP 2: UPDATING EXISTING AGENTS');
    console.log('='.repeat(80) + '\n');

    for (const { id, updates } of agentsToUpdate) {
      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error(`   ❌ Failed to update agent ${id}:`, error.message);
      } else {
        console.log(`   ✅ Updated: ${updates.display_name}`);
      }
    }
  }

  // Add new agents (limit to reach 250 total)
  const targetTotal = 250;
  const currentTotal = dbAgents.length;
  const neededAgents = Math.max(0, targetTotal - currentTotal);
  const agentsToCreate = agentsToAdd.slice(0, neededAgents);

  if (agentsToCreate.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: ADDING NEW AGENTS');
    console.log('='.repeat(80) + '\n');
    console.log(`Adding ${agentsToCreate.length} agents to reach ${targetTotal} total\n`);

    // Get available avatars
    const avatarUsage = new Map<string, number>();
    dbAgents.forEach(a => {
      const avatar = a.id.split('-')[0].padStart(4, '0');
      avatarUsage.set(avatar, (avatarUsage.get(avatar) || 0) + 1);
    });

    let avatarCounter = 116; // Start from avatar_0116

    for (const jsonAgent of agentsToCreate) {
      // Find available avatar
      while (avatarUsage.get(`avatar_${avatarCounter.toString().padStart(4, '0')}`) || 0 >= 5) {
        avatarCounter++;
      }

      const avatar = `avatar_${avatarCounter.toString().padStart(4, '0')}`;
      avatarUsage.set(avatar, (avatarUsage.get(avatar) || 0) + 1);

      const newAgent = {
        name: jsonAgent.name,
        display_name: jsonAgent.display_name,
        description: jsonAgent.description,
        avatar,
        color: jsonAgent.color || '#2196F3',
        model: jsonAgent.model || 'gpt-4o-mini',
        system_prompt: jsonAgent.system_prompt || `YOU ARE: ${jsonAgent.display_name}, specializing in ${jsonAgent.description}.`,
        tier: jsonAgent.tier,
        business_function: funcMap[jsonAgent.business_function] || funcMap['clinical_development'],
        role: jsonAgent.role || 'specialist',
        status: 'active',
        temperature: 0.7,
        max_tokens: 2000,
        rag_enabled: true,
        context_window: 8000,
        capabilities: jsonAgent.capabilities || [],
        knowledge_domains: jsonAgent.knowledge_domains || [],
        domain_expertise: jsonAgent.domain_expertise || 'medical',
        priority: jsonAgent.priority || 1,
        implementation_phase: 1,
        cost_per_query: jsonAgent.tier === 1 ? 0.02 : jsonAgent.tier === 2 ? 0.10 : 0.30,
      };

      const { error } = await supabase
        .from('agents')
        .insert([newAgent]);

      if (error) {
        console.error(`   ❌ Failed to add ${newAgent.display_name}:`, error.message);
      } else {
        console.log(`   ✅ Added: ${newAgent.display_name} (Tier ${newAgent.tier})`);
        agentsAdded++;
      }
    }
  }

  // Final verification
  const { count: finalCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log('\n' + '='.repeat(80));
  console.log('📊 REFINEMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Initial agent count: ${currentTotal}`);
  console.log(`  Duplicates identified: ${duplicatesFound}`);
  console.log(`  Agents updated: ${agentsUpdated}`);
  console.log(`  Personal names fixed: ${personalNamesFixed}`);
  console.log(`  New agents added: ${agentsAdded}`);
  console.log(`  Final agent count: ${finalCount}`);
  console.log(`  Target: ${targetTotal}`);

  if (finalCount === targetTotal) {
    console.log('\n✅ Successfully refined agent registry to exactly 250 agents!');
  } else if (finalCount && finalCount < targetTotal) {
    console.log(`\n⚠️  ${targetTotal - finalCount} agents still needed to reach target`);
  } else if (finalCount && finalCount > targetTotal) {
    console.log(`\n⚠️  ${finalCount - targetTotal} agents over target`);
  }

  return {
    duplicatesFound,
    agentsUpdated,
    personalNamesFixed,
    agentsAdded,
    finalCount
  };
}

refineAgentRegistry()
  .then((result) => {
    if (result) {
      console.log('\n✅ Agent registry refinement complete!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
