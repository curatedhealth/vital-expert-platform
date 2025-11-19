/**
 * Check agent names to ensure they are role-based, not personal names
 * Identifies agents with potential personal/private names
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Common first names to detect personal names
const COMMON_FIRST_NAMES = [
  'john', 'jane', 'michael', 'sarah', 'david', 'emily', 'james', 'mary',
  'robert', 'jennifer', 'william', 'linda', 'richard', 'patricia', 'joseph',
  'barbara', 'thomas', 'elizabeth', 'charles', 'susan', 'christopher', 'jessica',
  'daniel', 'karen', 'matthew', 'nancy', 'anthony', 'betty', 'mark', 'helen',
  'donald', 'sandra', 'steven', 'ashley', 'paul', 'kimberly', 'andrew', 'donna'
];

// Patterns that suggest personal names
const PERSONAL_NAME_PATTERNS = [
  /^Dr\.\s+[A-Z][a-z]+/,           // Dr. Smith
  /^[A-Z][a-z]+\s+[A-Z][a-z]+$/,   // John Smith
  /^Prof\.\s+[A-Z][a-z]+/,         // Prof. Johnson
];

// Good role-based patterns
const ROLE_BASED_PATTERNS = [
  /Agent$/i,                        // Clinical Trial Designer Agent
  /Specialist$/i,                   // Regulatory Specialist
  /Manager$/i,                      // Project Manager
  /Director$/i,                     // Medical Director
  /Coordinator$/i,                  // Study Coordinator
  /Analyst$/i,                      // Data Analyst
  /Strategist$/i,                   // Market Strategist
  /Officer$/i,                      // Compliance Officer
  /Lead$/i,                         // Development Lead
  /Expert$/i,                       // HTA Expert
  /Advisor$/i,                      // Regulatory Advisor
  /Consultant$/i,                   // Medical Consultant
  /Architect$/i,                    // QMS Architect
  /Designer$/i,                     // Trial Designer
  /Monitor$/i,                      // Safety Monitor
];

async function checkAgentNames() {
  console.log('🔍 Analyzing Agent Names for Role-Based Naming\n');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, tier')
    .eq('status', 'active')
    .order('display_name');

  if (error || !agents) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Total Active Agents: ${agents.length}\n`);

  const issues: any[] = [];
  const roleBasedNames: any[] = [];
  const potentialPersonalNames: any[] = [];

  agents.forEach((agent) => {
    const displayName = agent.display_name || '';
    const lowerName = displayName.toLowerCase();

    // Check for personal name patterns
    let hasPersonalPattern = false;
    for (const pattern of PERSONAL_NAME_PATTERNS) {
      if (pattern.test(displayName)) {
        hasPersonalPattern = true;
        break;
      }
    }

    // Check for common first names
    const firstWord = displayName.split(/\s+/)[0]?.toLowerCase();
    const hasCommonName = COMMON_FIRST_NAMES.includes(firstWord);

    if (hasPersonalPattern || hasCommonName) {
      potentialPersonalNames.push({
        ...agent,
        reason: hasPersonalPattern ? 'Personal pattern (Dr./Prof./FirstName LastName)' : 'Common first name'
      });
    } else {
      // Check if it's a good role-based name
      const isRoleBased = ROLE_BASED_PATTERNS.some(pattern => pattern.test(displayName));
      if (isRoleBased) {
        roleBasedNames.push(agent);
      } else {
        issues.push({
          ...agent,
          reason: 'Does not follow standard role-based pattern'
        });
      }
    }
  });

  console.log('='.repeat(80));
  console.log('📋 NAMING ANALYSIS RESULTS');
  console.log('='.repeat(80));

  if (potentialPersonalNames.length > 0) {
    console.log(`\n❌ POTENTIAL PERSONAL NAMES (${potentialPersonalNames.length} agents):`);
    console.log('   These agents may have personal names instead of role-based names:\n');
    potentialPersonalNames.forEach((agent, idx) => {
      console.log(`   ${idx + 1}. "${agent.display_name}"`);
      console.log(`      ID: ${agent.id}`);
      console.log(`      Reason: ${agent.reason}`);
      console.log(`      Tier: ${agent.tier}\n`);
    });
  } else {
    console.log('\n✅ NO PERSONAL NAMES DETECTED\n');
  }

  if (issues.length > 0) {
    console.log(`\n⚠️  NON-STANDARD ROLE NAMES (${issues.length} agents):`);
    console.log('   These agents don\'t follow standard role-based patterns:\n');
    issues.slice(0, 20).forEach((agent, idx) => {
      console.log(`   ${idx + 1}. "${agent.display_name}"`);
      console.log(`      Name: ${agent.name}`);
      console.log(`      ID: ${agent.id}\n`);
    });
    if (issues.length > 20) {
      console.log(`   ... and ${issues.length - 20} more\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`  Total agents: ${agents.length}`);
  console.log(`  Role-based names: ${roleBasedNames.length} (${Math.round(roleBasedNames.length / agents.length * 100)}%)`);
  console.log(`  Personal names: ${potentialPersonalNames.length} (${Math.round(potentialPersonalNames.length / agents.length * 100)}%)`);
  console.log(`  Non-standard: ${issues.length} (${Math.round(issues.length / agents.length * 100)}%)`);

  // Sample role-based names
  console.log('\n✅ EXAMPLES OF GOOD ROLE-BASED NAMES:');
  roleBasedNames.slice(0, 10).forEach((agent, idx) => {
    console.log(`   ${idx + 1}. ${agent.display_name}`);
  });

  return {
    total: agents.length,
    roleBased: roleBasedNames.length,
    personalNames: potentialPersonalNames.length,
    nonStandard: issues.length,
    personalNamesList: potentialPersonalNames,
    issuesList: issues
  };
}

checkAgentNames()
  .then((result) => {
    if (result) {
      console.log('\n✅ Analysis complete!\n');
      if (result.personalNames > 0 || result.nonStandard > 20) {
        console.log('💡 Recommendation: Review and update names to follow role-based patterns.');
        console.log('   Good patterns: [Role] + [Specialty/Function] + [Agent/Specialist/Expert/etc]\n');
      }
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
