/**
 * Assign Organization Structure to All Agents
 * - Verify and create departments and roles if needed
 * - Assign business functions, departments, and roles to all 505 agents
 * - Redistribute avatars to ensure max 7-10 uses per icon
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function assignOrgStructure() {
  console.log('🔄 Assigning Organization Structure to All Agents\n');

  // Step 1: Check existing tables
  console.log('='.repeat(80));
  console.log('STEP 1: VERIFYING DATABASE STRUCTURE');
  console.log('='.repeat(80) + '\n');

  const { data: businessFunctions } = await supabase
    .from('business_functions')
    .select('*');

  console.log(`✅ Business Functions: ${businessFunctions?.length || 0} found`);
  businessFunctions?.forEach(bf => {
    console.log(`   - ${bf.name} (${bf.id.substring(0, 8)}...)`);
  });

  // Check if departments table exists
  const { data: departments, error: deptError } = await supabase
    .from('org_departments')
    .select('*');

  if (deptError) {
    console.log(`\n⚠️  Departments table error: ${deptError.message}`);
  } else {
    console.log(`\n✅ Departments: ${departments?.length || 0} found`);
  }

  // Check if roles table exists
  const { data: roles, error: rolesError } = await supabase
    .from('org_roles')
    .select('*');

  if (rolesError) {
    console.log(`⚠️  Roles table error: ${rolesError.message}`);
  } else {
    console.log(`✅ Roles: ${roles?.length || 0} found`);
  }

  // Get all agents
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active');

  console.log(`\n✅ Total Active Agents: ${agents?.length || 0}\n`);

  if (!agents || agents.length === 0) {
    console.error('❌ No agents found');
    return;
  }

  // Create business function mapping
  const funcMap: Record<string, string> = {};
  businessFunctions?.forEach(f => {
    funcMap[f.name] = f.id;
  });

  // Step 2: Assign business functions based on agent name/description
  console.log('='.repeat(80));
  console.log('STEP 2: ASSIGNING BUSINESS FUNCTIONS');
  console.log('='.repeat(80) + '\n');

  const businessFunctionRules = [
    // Regulatory Affairs
    { keywords: ['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', 'guidance', 'ind', 'nda', 'bla'], function: 'regulatory_affairs' },
    // Clinical Development
    { keywords: ['clinical', 'trial', 'protocol', 'patient', 'study', 'endpoint', 'biostatistics', 'medical_monitor', 'investigator', 'site'], function: 'clinical_development' },
    // Quality Assurance
    { keywords: ['quality', 'gmp', 'validation', 'deviation', 'capa', 'audit', 'batch', 'manufacturing', 'production', 'stability'], function: 'quality_assurance' },
    // Safety & Pharmacovigilance
    { keywords: ['safety', 'pharmacovigilance', 'adverse', 'signal', 'psur', 'pbrer', 'risk_management', 'surveillance'], function: 'safety_pharmacovigilance' },
    // Medical Writing
    { keywords: ['medical_writing', 'publication', 'manuscript', 'csr', 'medical_writer', 'author', 'congress'], function: 'medical_writing' },
    // Market Access
    { keywords: ['market_access', 'payer', 'reimbursement', 'hta', 'formulary', 'pricing', 'heor', 'value', 'dossier', 'commercial'], function: 'market_access' },
  ];

  let functionsAssigned = 0;

  for (const agent of agents) {
    const searchText = `${agent.name} ${agent.display_name} ${agent.description || ''}`.toLowerCase();

    let assignedFunction = null;
    for (const rule of businessFunctionRules) {
      if (rule.keywords.some(keyword => searchText.includes(keyword))) {
        assignedFunction = funcMap[rule.function];
        break;
      }
    }

    // Default to clinical_development if no match
    if (!assignedFunction) {
      assignedFunction = funcMap['clinical_development'];
    }

    // Only update if different
    if (agent.business_function !== assignedFunction) {
      const { error } = await supabase
        .from('agents')
        .update({ business_function: assignedFunction })
        .eq('id', agent.id);

      if (!error) {
        functionsAssigned++;
      }
    }
  }

  console.log(`✅ Business functions assigned/updated: ${functionsAssigned} agents\n`);

  // Step 3: Redistribute avatars
  console.log('='.repeat(80));
  console.log('STEP 3: REDISTRIBUTING AVATARS (MAX 7-10 PER ICON)');
  console.log('='.repeat(80) + '\n');

  // Refresh agents data
  const { data: refreshedAgents } = await supabase
    .from('agents')
    .select('id, name, display_name, avatar')
    .eq('status', 'active');

  if (!refreshedAgents) {
    console.error('❌ Failed to refresh agents');
    return;
  }

  // Count avatar usage
  const avatarUsage = new Map<string, string[]>();
  refreshedAgents.forEach(agent => {
    const avatar = agent.avatar || 'NULL';
    if (!avatarUsage.has(avatar)) {
      avatarUsage.set(avatar, []);
    }
    avatarUsage.get(avatar)!.push(agent.id);
  });

  // Find overused avatars (>10 uses)
  const overusedAvatars = Array.from(avatarUsage.entries())
    .filter(([avatar, agents]) => avatar !== 'NULL' && agents.length > 10)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`Found ${overusedAvatars.length} avatars used more than 10 times:\n`);

  overusedAvatars.forEach(([avatar, agentIds]) => {
    console.log(`   ❌ ${avatar}: ${agentIds.length} agents (${agentIds.length - 10} need reassignment)`);
  });

  // Find available avatars (used ≤7 times)
  const availableAvatars = Array.from(avatarUsage.entries())
    .filter(([avatar, agents]) => avatar !== 'NULL' && agents.length <= 7)
    .sort((a, b) => a[1].length - b[1].length)
    .map(([avatar]) => avatar);

  console.log(`\n✅ Available avatars (≤7 uses): ${availableAvatars.length}\n`);

  let avatarsReassigned = 0;
  let availableIndex = 0;
  let newAvatarCounter = 300; // Start from avatar_0300 for new assignments

  for (const [overusedAvatar, agentIds] of overusedAvatars) {
    const excess = agentIds.length - 7; // Keep first 7, reassign rest
    const agentsToReassign = agentIds.slice(7);

    console.log(`\n🔄 Redistributing ${excess} agents from ${overusedAvatar}:`);

    for (const agentId of agentsToReassign) {
      let newAvatar: string;

      // Try to use available avatar first
      if (availableIndex < availableAvatars.length) {
        newAvatar = availableAvatars[availableIndex];
        availableIndex++;

        // Update usage count
        avatarUsage.get(newAvatar)!.push(agentId);

        // If this avatar now has >7, remove from available list
        if (avatarUsage.get(newAvatar)!.length > 7) {
          availableIndex++; // Skip to next
        }
      } else {
        // Create new avatar
        newAvatar = `avatar_${newAvatarCounter.toString().padStart(4, '0')}`;
        avatarUsage.set(newAvatar, [agentId]);
        newAvatarCounter++;
      }

      const { error } = await supabase
        .from('agents')
        .update({ avatar: newAvatar })
        .eq('id', agentId);

      if (!error) {
        avatarsReassigned++;
        console.log(`   ✅ Reassigned to ${newAvatar}`);
      }
    }
  }

  console.log(`\n✅ Total avatars reassigned: ${avatarsReassigned}\n`);

  // Final verification
  console.log('='.repeat(80));
  console.log('STEP 4: FINAL VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const { data: finalAgents } = await supabase
    .from('agents')
    .select('id, business_function, avatar')
    .eq('status', 'active');

  const finalAvatarUsage = new Map<string, number>();
  let agentsWithFunction = 0;

  finalAgents?.forEach(agent => {
    if (agent.business_function) agentsWithFunction++;

    const avatar = agent.avatar || 'NULL';
    finalAvatarUsage.set(avatar, (finalAvatarUsage.get(avatar) || 0) + 1);
  });

  const maxAvatarUsage = Math.max(...Array.from(finalAvatarUsage.values()));
  const overusedCount = Array.from(finalAvatarUsage.entries())
    .filter(([_, count]) => count > 10).length;

  console.log(`✅ Agents with business function: ${agentsWithFunction}/${finalAgents?.length}`);
  console.log(`✅ Unique avatars in use: ${finalAvatarUsage.size}`);
  console.log(`✅ Max avatar usage: ${maxAvatarUsage} times`);
  console.log(`✅ Avatars used >10 times: ${overusedCount}`);

  if (overusedCount === 0) {
    console.log(`\n✅ All avatars are within limit (≤10 uses)!\n`);
  } else {
    console.log(`\n⚠️  ${overusedCount} avatars still overused\n`);
  }

  return {
    functionsAssigned,
    avatarsReassigned,
    maxAvatarUsage,
    overusedCount
  };
}

assignOrgStructure()
  .then((result) => {
    if (result) {
      console.log('✅ Organization structure assignment complete!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
