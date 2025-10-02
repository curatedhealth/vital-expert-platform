#!/usr/bin/env node

/**
 * Import Agents from Complete Registry
 * - Maps business functions and roles to org structure
 * - Assigns appropriate avatar icons
 * - Determines tier based on role complexity
 * - Imports only agents not already in database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Business function mapping from registry to org_functions
const businessFunctionMap = {
  'regulatory_affairs': 'Regulatory Affairs',
  'clinical_development': 'Clinical Development',
  'medical_affairs': 'Medical Affairs',
  'market_access': 'Commercial',
  'pharmacovigilance': 'Pharmacovigilance',
  'general_operations': 'Operations',
  'clinical_trials': 'Clinical Development',
  'drug_safety': 'Pharmacovigilance',
  'reimbursement': 'Commercial'
};

// Role mapping from registry roles to org_roles
const roleMap = {
  'orchestrator': 'Chief Executive Officer',
  'strategist': 'Strategy Director',
  'specialist': 'Senior Specialist',
  'monitor': 'Surveillance Manager',
  'validator': 'QA Director',
  'analyst': 'Senior Analyst',
  'advisor': 'Strategy Advisor',
  'processor': 'Data Manager'
};

// Tier determination based on role and accuracy
function determineTier(agent) {
  const role = agent.role?.toLowerCase() || '';
  const businessFunc = agent.business_function?.toLowerCase() || '';
  const accuracy = agent.performance_metrics?.accuracy_rate || agent.accuracy_score || 0;

  // Tier 1: Orchestrators, Chiefs, Directors, high accuracy strategic roles
  if (role.includes('orchestrator') ||
      role.includes('chief') ||
      agent.display_name?.includes('Chief') ||
      (accuracy >= 0.97 && role.includes('strategist'))) {
    return 1;
  }

  // Tier 3: Analysts, entry-level specialists, lower accuracy
  if (role.includes('analyst') ||
      role.includes('writer') ||
      accuracy < 0.90) {
    return 3;
  }

  // Tier 2: All others (managers, specialists, validators)
  return 2;
}

// Get appropriate role from org_roles
async function findMatchingRole(agent) {
  const registryRole = agent.role?.toLowerCase() || '';

  // Try to find exact match first
  const mappedRole = roleMap[registryRole];
  if (mappedRole) {
    const { data } = await supabase
      .from('org_roles')
      .select('role_name')
      .eq('role_name', mappedRole)
      .eq('is_active', true)
      .single();

    if (data) return data.role_name;
  }

  // Try fuzzy match based on agent name and description
  const searchTerms = [];

  if (agent.display_name?.includes('Chief')) searchTerms.push('Chief');
  if (agent.display_name?.includes('Director')) searchTerms.push('Director');
  if (agent.display_name?.includes('Manager')) searchTerms.push('Manager');
  if (agent.display_name?.includes('Specialist')) searchTerms.push('Specialist');
  if (agent.display_name?.includes('Analyst')) searchTerms.push('Analyst');
  if (agent.display_name?.includes('Expert')) searchTerms.push('Senior');

  for (const term of searchTerms) {
    const { data } = await supabase
      .from('org_roles')
      .select('role_name')
      .ilike('role_name', `%${term}%`)
      .eq('is_active', true)
      .limit(1);

    if (data && data.length > 0) {
      return data[0].role_name;
    }
  }

  // Default fallback
  return 'Senior Specialist';
}

// Get next available avatar
async function getNextAvatar(startIndex) {
  const avatarNumber = String(startIndex).padStart(4, '0');
  const avatarCode = `avatar_${avatarNumber}`;

  // Check if this avatar is already used
  const { data } = await supabase
    .from('agents')
    .select('avatar')
    .eq('avatar', avatarCode)
    .single();

  if (data) {
    // Avatar already used, try next one
    return getNextAvatar(startIndex + 1);
  }

  return avatarCode;
}

async function importAgents() {
  console.log('📥 Importing Agents from Complete Registry...\n');

  try {
    // Read the registry file
    const registryPath = path.join(__dirname, '../docs/vital_agents_complete_registry.json');
    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    console.log(`📊 Found ${registryData.agents.length} agents in registry\n`);

    // Get existing agents to avoid duplicates
    const { data: existingAgents } = await supabase
      .from('agents')
      .select('name, display_name');

    const existingNames = new Set(existingAgents.map(a => a.name.toLowerCase()));
    const existingDisplayNames = new Set(existingAgents.map(a => (a.display_name || '').toLowerCase()));

    console.log(`✅ Found ${existingAgents.length} existing agents in database\n`);

    // Filter out agents that already exist
    const newAgents = registryData.agents.filter(agent => {
      const nameLower = agent.name.toLowerCase();
      const displayNameLower = (agent.display_name || '').toLowerCase();
      return !existingNames.has(nameLower) && !existingDisplayNames.has(displayNameLower);
    });

    console.log(`🆕 ${newAgents.length} new agents to import\n`);

    if (newAgents.length === 0) {
      console.log('ℹ️  No new agents to import. All agents from registry already exist.\n');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let avatarIndex = 22; // Start after existing avatars

    for (const agent of newAgents) {
      try {
        // Map business function
        const businessFunction = businessFunctionMap[agent.business_function] || 'Operations';

        // Find matching role
        const role = await findMatchingRole(agent);

        // Determine tier
        const tier = determineTier(agent);

        // Get next available avatar
        const avatar = await getNextAvatar(avatarIndex);
        avatarIndex++;

        // Prepare agent data
        const agentData = {
          name: agent.name,
          display_name: agent.display_name,
          description: agent.description || '',
          avatar: avatar,
          color: agent.color || '#1976D2',
          version: agent.version || '1.0.0',
          model: agent.model || 'GPT-4',
          system_prompt: agent.system_prompt || '',
          temperature: agent.temperature || 0.7,
          max_tokens: agent.max_tokens || 2000,
          rag_enabled: agent.rag_enabled || false,
          context_window: agent.context_window || 8000,
          response_format: agent.response_format || 'markdown',
          business_function: businessFunction,
          role: role,
          tier: tier,
          status: agent.status === 'production' ? 'active' : 'inactive',
          knowledge_domains: agent.knowledge_domains || [],
          capabilities: agent.capabilities || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Insert agent
        const { error } = await supabase
          .from('agents')
          .insert([agentData]);

        if (error) {
          console.error(`❌ Error importing ${agent.display_name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${agent.display_name}`);
          console.log(`   Function: ${businessFunction}`);
          console.log(`   Role: ${role}`);
          console.log(`   Tier: ${tier}`);
          console.log(`   Avatar: ${avatar}\n`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${agent.display_name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Total in registry: ${registryData.agents.length}`);
    console.log(`   📈 Total existing: ${existingAgents.length}`);
    console.log(`   📈 Total after import: ${existingAgents.length + successCount}\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

async function verifyImport() {
  console.log('\n🔍 Verification Report...\n');

  const { data: agents } = await supabase
    .from('agents')
    .select('display_name, business_function, role, tier, avatar')
    .order('tier, display_name');

  // Group by tier
  const byTier = {
    1: [],
    2: [],
    3: []
  };

  agents.forEach(agent => {
    byTier[agent.tier]?.push(agent);
  });

  Object.entries(byTier).forEach(([tier, tierAgents]) => {
    console.log(`\n🎯 Tier ${tier} (${tierAgents.length} agents):`);
    tierAgents.forEach(agent => {
      console.log(`   ${agent.display_name}`);
      console.log(`      Function: ${agent.business_function}`);
      console.log(`      Role: ${agent.role}`);
      console.log(`      Avatar: ${agent.avatar}`);
    });
  });

  console.log(`\n✨ Total agents in database: ${agents.length}\n`);
}

async function main() {
  await importAgents();
  await verifyImport();
  process.exit(0);
}

main();
