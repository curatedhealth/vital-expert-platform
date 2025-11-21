/**
 * Update and Refine Existing Agents from JSON
 * - Keep all 287 existing agents
 * - Update them with proper role-based names from JSON
 * - Fix personal names and improve descriptions
 * - NO deletions, only updates and additions
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

// Personal name patterns to detect and fix
const isPersonalName = (name: string): boolean => {
  return (
    /^Dr\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+/.test(name) ||
    /^Prof\.\s+[A-Z][a-z]+/.test(name) ||
    /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(name)
  );
};

async function updateAgentsFromJson() {
  console.log('🔄 Updating and Refining Agent Registry from JSON\n');
  console.log('⚠️  NO AGENTS WILL BE DELETED - Only updates and refinements\n');

  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'vital_agents_registry_250_complete.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData = JSON.parse(jsonContent);
  const jsonAgents: JsonAgent[] = jsonData.agents;

  console.log(`📄 Loaded ${jsonAgents.length} agents from JSON\n`);

  // Get existing agents from database
  const { data: dbAgents, error: fetchError } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active');

  if (fetchError || !dbAgents) {
    console.error('❌ Error fetching agents:', fetchError);
    return;
  }

  console.log(`💾 Found ${dbAgents.length} existing agents in database\n`);

  // Get business functions mapping
  const { data: businessFunctions } = await supabase
    .from('business_functions')
    .select('id, name');

  const funcMap: Record<string, string> = {};
  businessFunctions?.forEach(f => {
    funcMap[f.name] = f.id;
    // Add common variations
    if (f.name === 'regulatory_affairs') {
      funcMap['regulatory'] = f.id;
      funcMap['regulatory_intelligence'] = f.id;
    }
    if (f.name === 'clinical_development') {
      funcMap['drug_development'] = f.id;
      funcMap['clinical_operations'] = f.id;
    }
    if (f.name === 'medical_writing') {
      funcMap['medical_affairs'] = f.id;
      funcMap['publications'] = f.id;
    }
    if (f.name === 'market_access') {
      funcMap['commercialization'] = f.id;
      funcMap['payer_relations'] = f.id;
    }
  });

  // Track statistics
  let agentsUpdated = 0;
  let personalNamesFixed = 0;
  let descriptionsImproved = 0;
  let newAgentsAdded = 0;

  console.log('='.repeat(80));
  console.log('STEP 1: CREATING JSON LOOKUP MAP');
  console.log('='.repeat(80) + '\n');

  // Create lookup map by name (normalized)
  const jsonAgentMap = new Map<string, JsonAgent>();
  jsonAgents.forEach(agent => {
    const normalizedName = agent.name.toLowerCase().replace(/[-_\s]/g, '');
    jsonAgentMap.set(normalizedName, agent);
  });

  console.log(`📊 Created lookup map with ${jsonAgentMap.size} unique agents\n`);

  console.log('='.repeat(80));
  console.log('STEP 2: UPDATING EXISTING AGENTS');
  console.log('='.repeat(80) + '\n');

  for (const dbAgent of dbAgents) {
    const normalizedDbName = dbAgent.name.toLowerCase().replace(/[-_\s]/g, '');
    const jsonAgent = jsonAgentMap.get(normalizedDbName);

    if (jsonAgent) {
      // Found matching agent in JSON - update it
      const updates: any = {};
      let needsUpdate = false;

      // Check if current display_name is a personal name
      if (isPersonalName(dbAgent.display_name)) {
        updates.display_name = jsonAgent.display_name;
        needsUpdate = true;
        personalNamesFixed++;
        console.log(`🔧 Fixing personal name:`);
        console.log(`   Old: "${dbAgent.display_name}"`);
        console.log(`   New: "${jsonAgent.display_name}"\n`);
      } else if (dbAgent.display_name !== jsonAgent.display_name) {
        // Different name but not personal - use JSON version
        updates.display_name = jsonAgent.display_name;
        needsUpdate = true;
      }

      // Update description if different
      if (jsonAgent.description && dbAgent.description !== jsonAgent.description) {
        updates.description = jsonAgent.description;
        needsUpdate = true;
        descriptionsImproved++;
      }

      // Update tier if different
      if (jsonAgent.tier && dbAgent.tier !== jsonAgent.tier) {
        updates.tier = jsonAgent.tier;
        needsUpdate = true;
      }

      // Update business function
      const jsonFunc = funcMap[jsonAgent.business_function];
      if (jsonFunc && dbAgent.business_function !== jsonFunc) {
        updates.business_function = jsonFunc;
        needsUpdate = true;
      }

      // Update model if provided
      if (jsonAgent.model && dbAgent.model !== jsonAgent.model) {
        updates.model = jsonAgent.model;
        needsUpdate = true;
      }

      // Update capabilities and knowledge domains
      if (jsonAgent.capabilities && jsonAgent.capabilities.length > 0) {
        updates.capabilities = jsonAgent.capabilities;
        needsUpdate = true;
      }

      if (jsonAgent.knowledge_domains && jsonAgent.knowledge_domains.length > 0) {
        updates.knowledge_domains = jsonAgent.knowledge_domains;
        needsUpdate = true;
      }

      // Update domain expertise
      if (jsonAgent.domain_expertise && dbAgent.domain_expertise !== jsonAgent.domain_expertise) {
        updates.domain_expertise = jsonAgent.domain_expertise;
        needsUpdate = true;
      }

      // Update system prompt if provided
      if (jsonAgent.system_prompt && dbAgent.system_prompt !== jsonAgent.system_prompt) {
        updates.system_prompt = jsonAgent.system_prompt;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const { error } = await supabase
          .from('agents')
          .update(updates)
          .eq('id', dbAgent.id);

        if (error) {
          console.error(`   ❌ Failed to update ${dbAgent.display_name}:`, error.message);
        } else {
          console.log(`   ✅ Updated: ${updates.display_name || dbAgent.display_name}`);
          agentsUpdated++;
        }
      }
    } else {
      // No match in JSON - check if it has a personal name
      if (isPersonalName(dbAgent.display_name)) {
        console.log(`⚠️  Personal name found (no JSON match): "${dbAgent.display_name}"`);
        console.log(`   ID: ${dbAgent.id}`);
        console.log(`   Needs manual review\n`);
      }
    }
  }

  console.log('\n='.repeat(80));
  console.log('STEP 3: ADDING NEW AGENTS FROM JSON');
  console.log('='.repeat(80) + '\n');

  // Find agents in JSON that don't exist in database
  const dbAgentNames = new Set(
    dbAgents.map(a => a.name.toLowerCase().replace(/[-_\s]/g, ''))
  );

  const newAgents = jsonAgents.filter(jsonAgent => {
    const normalizedName = jsonAgent.name.toLowerCase().replace(/[-_\s]/g, '');
    return !dbAgentNames.has(normalizedName);
  });

  console.log(`📊 Found ${newAgents.length} new agents to add\n`);

  // Get current max avatar number
  let avatarCounter = 116;
  const avatarUsage = new Map<string, number>();
  dbAgents.forEach(a => {
    if (a.avatar && a.avatar.startsWith('avatar_')) {
      const num = parseInt(a.avatar.replace('avatar_', ''));
      if (!isNaN(num)) {
        avatarCounter = Math.max(avatarCounter, num + 1);
        avatarUsage.set(a.avatar, (avatarUsage.get(a.avatar) || 0) + 1);
      }
    }
  });

  for (const jsonAgent of newAgents) {
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
      system_prompt: jsonAgent.system_prompt || `You are ${jsonAgent.display_name}, a specialized AI agent for ${jsonAgent.description}`,
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
      newAgentsAdded++;
    }
  }

  // Final count
  const { count: finalCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log('\n' + '='.repeat(80));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Initial agent count: ${dbAgents.length}`);
  console.log(`  Agents updated: ${agentsUpdated}`);
  console.log(`  Personal names fixed: ${personalNamesFixed}`);
  console.log(`  Descriptions improved: ${descriptionsImproved}`);
  console.log(`  New agents added: ${newAgentsAdded}`);
  console.log(`  Final agent count: ${finalCount}`);
  console.log(`  Agents deleted: 0 ✅`);

  console.log('\n✅ All existing agents preserved and refined!');

  return {
    agentsUpdated,
    personalNamesFixed,
    descriptionsImproved,
    newAgentsAdded,
    finalCount
  };
}

updateAgentsFromJson()
  .then((result) => {
    if (result) {
      console.log('\n✅ Agent registry update complete!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
