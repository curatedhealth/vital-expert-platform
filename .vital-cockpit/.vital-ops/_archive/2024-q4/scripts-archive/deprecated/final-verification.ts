/**
 * Final Verification of Agent Registry
 * - Verify all 505 agents have business functions, departments, and roles
 * - Verify avatar distribution
 * - Generate summary report
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function finalVerification() {
  console.log('🔍 Final Verification of Agent Registry\n');

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active');

  if (!agents) {
    console.error('❌ No agents found');
    return;
  }

  console.log(`📊 Total Active Agents: ${agents.length}\n`);

  // Verify business functions
  const withFunction = agents.filter(a => a.business_function);
  const withoutFunction = agents.filter(a => !a.business_function);

  console.log('='.repeat(80));
  console.log('BUSINESS FUNCTIONS');
  console.log('='.repeat(80));
  console.log(`  With function: ${withFunction.length} (${Math.round(withFunction.length / agents.length * 100)}%)`);
  console.log(`  Without function: ${withoutFunction.length}`);

  if (withoutFunction.length > 0) {
    console.log('\n  ⚠️  Agents without business function:');
    withoutFunction.slice(0, 5).forEach(a => console.log(`     - ${a.display_name}`));
  }

  // Verify departments
  const withDepartment = agents.filter(a => a.department && a.department !== null);
  const withoutDepartment = agents.filter(a => !a.department || a.department === null);

  console.log('\n' + '='.repeat(80));
  console.log('DEPARTMENTS');
  console.log('='.repeat(80));
  console.log(`  With department: ${withDepartment.length} (${Math.round(withDepartment.length / agents.length * 100)}%)`);
  console.log(`  Without department: ${withoutDepartment.length}`);

  if (withoutDepartment.length > 0 && withoutDepartment.length <= 10) {
    console.log('\n  ⚠️  Agents without department:');
    withoutDepartment.forEach(a => console.log(`     - ${a.display_name}`));
  }

  // Verify roles
  const withRole = agents.filter(a => a.role);
  const withoutRole = agents.filter(a => !a.role);

  console.log('\n' + '='.repeat(80));
  console.log('ROLES');
  console.log('='.repeat(80));
  console.log(`  With role: ${withRole.length} (${Math.round(withRole.length / agents.length * 100)}%)`);
  console.log(`  Without role: ${withoutRole.length}`);

  // Role distribution
  const roleDistribution = new Map<string, number>();
  agents.forEach(a => {
    const role = a.role || 'none';
    roleDistribution.set(role, (roleDistribution.get(role) || 0) + 1);
  });

  console.log('\n  Top 10 Roles:');
  Array.from(roleDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([role, count]) => {
      console.log(`    ${role.padEnd(20)} ${count}`);
    });

  // Department distribution
  const deptDistribution = new Map<string, number>();
  agents.forEach(a => {
    const dept = a.department || 'none';
    deptDistribution.set(dept, (deptDistribution.get(dept) || 0) + 1);
  });

  console.log('\n' + '='.repeat(80));
  console.log('DEPARTMENT DISTRIBUTION');
  console.log('='.repeat(80));
  Array.from(deptDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([dept, count]) => {
      console.log(`  ${String(dept).padEnd(40)} ${count.toString().padStart(3)}`);
    });

  // Business function distribution
  const { data: functions } = await supabase.from('business_functions').select('*');
  const funcIdToName: Record<string, string> = {};
  functions?.forEach(f => {
    funcIdToName[f.id] = f.name;
  });

  const funcDistribution = new Map<string, number>();
  agents.forEach(a => {
    const func = funcIdToName[a.business_function] || 'none';
    funcDistribution.set(func, (funcDistribution.get(func) || 0) + 1);
  });

  console.log('\n' + '='.repeat(80));
  console.log('BUSINESS FUNCTION DISTRIBUTION');
  console.log('='.repeat(80));
  Array.from(funcDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([func, count]) => {
      const pct = Math.round(count / agents.length * 100);
      console.log(`  ${func.padEnd(40)} ${count.toString().padStart(3)} (${pct}%)`);
    });

  // Avatar verification
  const avatarUsage = new Map<string, number>();
  agents.forEach(a => {
    const avatar = a.avatar || 'none';
    avatarUsage.set(avatar, (avatarUsage.get(avatar) || 0) + 1);
  });

  const overused = Array.from(avatarUsage.entries()).filter(([_, count]) => count > 10);

  console.log('\n' + '='.repeat(80));
  console.log('AVATAR DISTRIBUTION');
  console.log('='.repeat(80));
  console.log(`  Total unique avatars: ${avatarUsage.size}`);
  console.log(`  Max avatar usage: ${Math.max(...avatarUsage.values())} times`);
  console.log(`  Avatars used >10 times: ${overused.length}`);

  if (overused.length > 0) {
    console.log('\n  ⚠️  Overused avatars:');
    overused.forEach(([avatar, count]) => {
      console.log(`    ${avatar}: ${count} times`);
    });
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ FINAL SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Total agents: ${agents.length}`);
  console.log(`  With business function: ${withFunction.length}/${agents.length}`);
  console.log(`  With department: ${withDepartment.length}/${agents.length}`);
  console.log(`  With role: ${withRole.length}/${agents.length}`);
  console.log(`  Unique avatars: ${avatarUsage.size}`);
  console.log(`  Avatar compliance: ${overused.length === 0 ? '✅ All within limit' : '⚠️ ' + overused.length + ' overused'}`);

  const allComplete = withFunction.length === agents.length &&
                     withDepartment.length === agents.length &&
                     withRole.length === agents.length &&
                     overused.length === 0;

  if (allComplete) {
    console.log('\n🎉 ALL AGENTS FULLY CONFIGURED!\n');
  } else {
    console.log('\n⚠️  Some agents need attention (see details above)\n');
  }

  return {
    total: agents.length,
    withFunction: withFunction.length,
    withDepartment: withDepartment.length,
    withRole: withRole.length,
    uniqueAvatars: avatarUsage.size,
    overusedAvatars: overused.length
  };
}

finalVerification()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
