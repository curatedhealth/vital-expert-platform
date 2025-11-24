/**
 * Complete Medical Affairs Import Script
 *
 * This script:
 * 1. Ensures 7 departments exist with proper structure
 * 2. Creates/updates 30 organizational roles
 * 3. Imports all 30 Medical Affairs agents from JSON specification
 * 4. Maps agents to correct departments and roles
 * 5. Validates completeness
 *
 * Sources:
 * - docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json
 * - docs/MEDICAL_AFFAIRS_EXPANDED_STRUCTURE_30.md
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load agent specification
const agentsFilePath = path.join(__dirname, '..', 'docs', 'MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json');
const agentsData = JSON.parse(fs.readFileSync(agentsFilePath, 'utf-8'));

// Medical Affairs Business Function ID
let MEDICAL_AFFAIRS_ID = '5942a717-4363-4cec-b9b7-db644617e91c';

// Department mapping
const DEPARTMENT_MAP = {};
const ROLE_MAP = {};

async function main() {
  console.log('🏥 Medical Affairs Complete Import');
  console.log('═'.repeat(70));
  console.log(`📦 Importing ${agentsData.agent_count} agents from specification`);
  console.log('═'.repeat(70));
  console.log('');

  // Step 1: Verify/Get Medical Affairs business function
  await ensureBusinessFunction();

  // Step 2: Create/Update 7 Departments
  await createDepartments();

  // Step 3: Create/Update 30 Organizational Roles
  await createOrganizationalRoles();

  // Step 4: Import 30 Agents
  await importAgents();

  // Step 5: Summary Report
  await generateSummary();

  console.log('');
  console.log('═'.repeat(70));
  console.log('✅ MEDICAL AFFAIRS IMPORT COMPLETE');
  console.log('═'.repeat(70));
}

async function ensureBusinessFunction() {
  console.log('STEP 1: Verifying Medical Affairs Business Function');
  console.log('─'.repeat(70));

  const { data, error } = await supabase
    .from('business_functions')
    .select('id, name')
    .eq('name', 'Medical Affairs')
    .single();

  if (error || !data) {
    console.error('❌ Medical Affairs business function not found!');
    process.exit(1);
  }

  MEDICAL_AFFAIRS_ID = data.id;
  console.log(`✓ Medical Affairs: ${data.id}`);
  console.log('');
}

async function createDepartments() {
  console.log('STEP 2: Creating/Updating 7 Departments');
  console.log('─'.repeat(70));

  const departments = [
    { name: 'Field Medical', description: 'MSL teams, regional directors, field medical training' },
    { name: 'Medical Information', description: 'Medical information specialists, librarians, content management' },
    { name: 'Medical Communications & Writing', description: 'Publications, medical education, scientific and regulatory writing' },
    { name: 'Evidence Generation & HEOR', description: 'Real-world evidence, health economics, biostatistics, epidemiology' },
    { name: 'Clinical Operations Support', description: 'Clinical liaisons, medical monitors, data management, disclosure' },
    { name: 'Medical Excellence & Governance', description: 'Medical excellence, review committees, quality assurance' },
    { name: 'Medical Strategy & Operations', description: 'Medical strategy, therapeutic area experts, global medical advisors' }
  ];

  for (const dept of departments) {
    const { data: existing } = await supabase
      .from('departments')
      .select('id, name')
      .eq('business_function_id', MEDICAL_AFFAIRS_ID)
      .ilike('name', `%${dept.name}%`)
      .maybeSingle();

    if (existing) {
      DEPARTMENT_MAP[dept.name] = existing.id;
      console.log(`✓ ${dept.name}: ${existing.id.slice(0, 8)}...`);
    } else {
      const { data: newDept, error } = await supabase
        .from('departments')
        .insert({
          name: dept.name,
          description: dept.description,
          business_function_id: MEDICAL_AFFAIRS_ID
        })
        .select('id')
        .single();

      if (error) {
        console.error(`✗ Failed to create ${dept.name}:`, error.message);
      } else {
        DEPARTMENT_MAP[dept.name] = newDept.id;
        console.log(`✓ Created ${dept.name}: ${newDept.id.slice(0, 8)}...`);
      }
    }
  }

  console.log(`\n✅ Departments ready: ${Object.keys(DEPARTMENT_MAP).length}/7\n`);
}

async function createOrganizationalRoles() {
  console.log('STEP 3: Creating/Updating 30 Organizational Roles');
  console.log('─'.repeat(70));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const agent of agentsData.agents) {
    const deptId = DEPARTMENT_MAP[agent.department];
    if (!deptId) {
      console.log(`⚠ Skipping role for ${agent.display_name} - department not found`);
      skipped++;
      continue;
    }

    const roleName = agent.metadata?.role_name || agent.display_name;

    // Check if role exists
    const { data: existing } = await supabase
      .from('organizational_roles')
      .select('id, name')
      .eq('department_id', deptId)
      .eq('name', roleName)
      .maybeSingle();

    const roleData = {
      name: roleName,
      department_id: deptId,
      business_function_id: MEDICAL_AFFAIRS_ID,
      level: agent.tier === 1 ? 'senior' : agent.tier === 2 ? 'manager' : 'specialist',
      description: `${agent.id.toUpperCase()} | ${agent.description} | Tier ${agent.tier}`,
      responsibilities: agent.capabilities,
      required_capabilities: agent.capabilities.slice(0, 5)
    };

    if (existing) {
      ROLE_MAP[agent.id] = existing.id;
      updated++;
    } else {
      const { data: newRole, error } = await supabase
        .from('organizational_roles')
        .insert(roleData)
        .select('id')
        .single();

      if (error) {
        // Role might exist with slight name variation
        const { data: anyRole } = await supabase
          .from('organizational_roles')
          .select('id')
          .eq('department_id', deptId)
          .ilike('name', `%${roleName.split(' ')[0]}%`)
          .limit(1)
          .maybeSingle();

        if (anyRole) {
          ROLE_MAP[agent.id] = anyRole.id;
          skipped++;
        } else {
          console.log(`✗ ${agent.id}: ${error.message.substring(0, 60)}...`);
          skipped++;
        }
      } else {
        ROLE_MAP[agent.id] = newRole.id;
        created++;
      }
    }
  }

  console.log(`\n✅ Organizational roles processed:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total mapped: ${Object.keys(ROLE_MAP).length}/30\n`);
}

async function importAgents() {
  console.log('STEP 4: Importing 30 Medical Affairs Agents');
  console.log('─'.repeat(70));

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const agentSpec of agentsData.agents) {
    try {
      // Get department and role IDs
      const deptId = DEPARTMENT_MAP[agentSpec.department];
      const roleId = ROLE_MAP[agentSpec.id];

      if (!deptId) {
        console.log(`⚠ ${agentSpec.id}: Department not found - ${agentSpec.department}`);
        errors++;
        continue;
      }

      // Check if agent already exists
      const { data: existing } = await supabase
        .from('agents')
        .select('id, name, tier')
        .eq('name', agentSpec.name)
        .maybeSingle();

      // Build agent data
      const agentData = {
        name: agentSpec.name,
        display_name: agentSpec.display_name,
        description: agentSpec.description,
        tier: agentSpec.tier,
        status: agentSpec.status,
        priority: agentSpec.priority,
        model: agentSpec.model,
        system_prompt: agentSpec.system_prompt,
        capabilities: agentSpec.capabilities,
        business_function: 'Medical Affairs',
        business_function_id: MEDICAL_AFFAIRS_ID,
        department: agentSpec.department,
        department_id: deptId,
        role_id: roleId,
        metadata: {
          ...agentSpec.metadata,
          agent_code: agentSpec.id.toUpperCase(),
          imported_from: 'MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json',
          import_date: new Date().toISOString()
        }
      };

      if (existing) {
        // Update existing agent
        const { error } = await supabase
          .from('agents')
          .update(agentData)
          .eq('id', existing.id);

        if (error) {
          console.log(`✗ ${agentSpec.id}: Update failed - ${error.message.substring(0, 50)}...`);
          errors++;
        } else {
          console.log(`↻ ${agentSpec.id}: ${agentSpec.display_name} (T${agentSpec.tier}) - Updated`);
          updated++;
        }
      } else {
        // Create new agent
        const { error } = await supabase
          .from('agents')
          .insert(agentData);

        if (error) {
          console.log(`✗ ${agentSpec.id}: Creation failed - ${error.message.substring(0, 50)}...`);
          errors++;
        } else {
          console.log(`✓ ${agentSpec.id}: ${agentSpec.display_name} (T${agentSpec.tier}) - Created`);
          created++;
        }
      }
    } catch (err) {
      console.log(`✗ ${agentSpec.id}: Exception - ${err.message}`);
      errors++;
    }
  }

  console.log(`\n✅ Agent import complete:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${created + updated}/30\n`);
}

async function generateSummary() {
  console.log('STEP 5: Validation & Summary');
  console.log('─'.repeat(70));

  // Count agents by tier
  const { data: agents } = await supabase
    .from('agents')
    .select('tier')
    .eq('business_function', 'Medical Affairs');

  if (agents) {
    const tierCounts = {
      tier1: agents.filter(a => a.tier === 1).length,
      tier2: agents.filter(a => a.tier === 2).length,
      tier3: agents.filter(a => a.tier === 3).length
    };

    console.log('📊 Medical Affairs Agent Distribution:');
    console.log(`   Total Agents: ${agents.length}`);
    console.log(`   Tier 1 (Ultra-Specialists): ${tierCounts.tier1}`);
    console.log(`   Tier 2 (Specialists): ${tierCounts.tier2}`);
    console.log(`   Tier 3 (Generalists): ${tierCounts.tier3}`);
  }

  // Count by department
  const { data: deptCounts } = await supabase
    .from('agents')
    .select('department_id, department')
    .eq('business_function', 'Medical Affairs');

  if (deptCounts) {
    console.log('\n📋 Agents by Department:');
    const deptMap = {};
    deptCounts.forEach(a => {
      const dept = a.department || 'Unknown';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    Object.entries(deptMap).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} agents`);
    });
  }

  console.log('\n🎯 Next Steps:');
  console.log('   1. Review agents in database');
  console.log('   2. Test agent functionality');
  console.log('   3. Update any custom prompts or configurations');
  console.log('   4. Deploy to production when validated');
}

main()
  .then(() => {
    console.log('\n✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
