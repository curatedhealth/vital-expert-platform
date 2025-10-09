#!/usr/bin/env node
/**
 * Validate and fix organizational hierarchy for all agents
 * Ensures: Business Function → Department → Organizational Role relationships are correct
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function validateOrgHierarchy() {
  console.log('\n🔍 Validating organizational hierarchy for all agents...\n');

  // Get all agents with their org structure
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select(`
      id,
      name,
      display_name,
      business_function_id,
      department_id,
      role_id,
      business_function,
      department,
      role
    `);

  if (agentsError) {
    console.error('❌ Error fetching agents:', agentsError);
    return;
  }

  // Get all organizational relationships
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, business_function_id');

  const { data: orgRoles } = await supabase
    .from('organizational_roles')
    .select('id, name, business_function_id, department_id');

  const { data: businessFunctions } = await supabase
    .from('business_functions')
    .select('id, name');

  // Create lookup maps
  const deptMap = new Map(departments?.map(d => [d.id, d]) || []);
  const roleMap = new Map(orgRoles?.map(r => [r.id, r]) || []);
  const functionMap = new Map(businessFunctions?.map(f => [f.id, f]) || []);

  let validCount = 0;
  let invalidCount = 0;
  let fixedCount = 0;
  const issues = [];

  for (const agent of agents) {
    if (!agent.business_function_id || !agent.department_id || !agent.role_id) {
      continue; // Skip agents without full org structure
    }

    const dept = deptMap.get(agent.department_id);
    const role = roleMap.get(agent.role_id);
    const func = functionMap.get(agent.business_function_id);

    let hasIssue = false;
    const agentIssues = [];

    // Validate Department → Business Function relationship
    if (dept && dept.business_function_id !== agent.business_function_id) {
      hasIssue = true;
      agentIssues.push(
        `Department "${dept.name}" belongs to function "${functionMap.get(dept.business_function_id)?.name}", but agent has function "${func?.name}"`
      );
    }

    // Validate Role → Business Function relationship
    if (role && role.business_function_id && role.business_function_id !== agent.business_function_id) {
      hasIssue = true;
      agentIssues.push(
        `Role "${role.name}" belongs to function "${functionMap.get(role.business_function_id)?.name}", but agent has function "${func?.name}"`
      );
    }

    // Validate Role → Department relationship
    if (role && role.department_id && role.department_id !== agent.department_id) {
      hasIssue = true;
      agentIssues.push(
        `Role "${role.name}" belongs to department "${deptMap.get(role.department_id)?.name}", but agent has department "${dept?.name}"`
      );
    }

    if (hasIssue) {
      invalidCount++;
      issues.push({
        agent: agent.display_name,
        name: agent.name,
        id: agent.id,
        issues: agentIssues,
        current: {
          function: func?.name,
          department: dept?.name,
          role: role?.name
        },
        correct: {
          function: role?.business_function_id ? functionMap.get(role.business_function_id)?.name : func?.name,
          department: role?.department_id ? deptMap.get(role.department_id)?.name : dept?.name,
          role: role?.name
        }
      });

      // Auto-fix: Update agent to match the role's hierarchy
      if (role) {
        const correctFunctionId = role.business_function_id || dept?.business_function_id;
        const correctDepartmentId = role.department_id || agent.department_id;

        const { error: updateError } = await supabase
          .from('agents')
          .update({
            business_function_id: correctFunctionId,
            business_function: functionMap.get(correctFunctionId)?.name,
            department_id: correctDepartmentId,
            department: deptMap.get(correctDepartmentId)?.name,
          })
          .eq('id', agent.id);

        if (!updateError) {
          fixedCount++;
          console.log(`✅ Fixed: ${agent.display_name}`);
        } else {
          console.error(`❌ Failed to fix ${agent.display_name}:`, updateError);
        }
      }
    } else {
      validCount++;
    }
  }

  console.log('\n📊 Validation Summary:');
  console.log(`   ✅ Valid agents: ${validCount}`);
  console.log(`   ❌ Invalid agents: ${invalidCount}`);
  console.log(`   🔧 Fixed agents: ${fixedCount}`);

  if (issues.length > 0) {
    console.log('\n🚨 Issues found (before fixes):');
    issues.forEach(issue => {
      console.log(`\n   Agent: ${issue.agent} (${issue.name})`);
      issue.issues.forEach(i => console.log(`      - ${i}`));
      console.log(`      Current: ${issue.current.function} → ${issue.current.department} → ${issue.current.role}`);
      console.log(`      Corrected to: ${issue.correct.function} → ${issue.correct.department} → ${issue.correct.role}`);
    });
  }

  console.log('\n✨ Validation complete!\n');
}

validateOrgHierarchy().catch(console.error);
