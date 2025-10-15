#!/usr/bin/env node

/**
 * Avatar Redistribution Script for VITAL Path Agents
 * 
 * This script redistributes avatars to ensure no avatar is used more than 3 times.
 * It identifies overused avatars and reassigns them to underused ones.
 * 
 * Features:
 * - Identifies avatars used more than 3 times
 * - Redistributes to ensure max 3 uses per avatar
 * - Maintains agent-avatar relationships where possible
 * - Generates SQL updates for database
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 VITAL Path Avatar Redistribution Script');
console.log('==========================================\n');

// Available avatars (201 total)
const availableAvatars = [
  // Numbered avatars (avatar_0001.png to avatar_0119.png)
  ...Array.from({ length: 119 }, (_, i) => `avatar_${String(i + 1).padStart(4, '0')}.png`),
  // Noun avatars (various character types)
  'noun-african-girl-7845961.png',
  'noun-arabic-7845964.png',
  'noun-arabic-woman-7845949.png',
  'noun-avatar-5840189.png',
  'noun-avatar-5840192.png',
  'noun-avatar-7845970.png',
  'noun-backpacker-5840190.png',
  'noun-boy-5757369.png',
  'noun-boy-5757373.png',
  'noun-boy-7815633.png',
  'noun-boy-7845950.png',
  'noun-boy-7845969.png',
  'noun-boy-7845975.png',
  'noun-boy-7845976.png',
  'noun-businessman-7845943.png',
  'noun-cowboy-7845963.png',
  'noun-employ-7845947.png',
  'noun-father-7845956.png',
  'noun-female-7845967.png',
  'noun-female-7845968.png',
  'noun-female-7845971.png',
  'noun-girl-7815632.png',
  'noun-girl-7845948.png',
  'noun-girl-7845959.png',
  'noun-guy-7845962.png',
  'noun-housewife-7845945.png',
  'noun-housewife-7845952.png',
  'noun-housewife-7845973.png',
  'noun-lady-7845953.png',
  'noun-male-7845946.png',
  'noun-man-5757356.png',
  'noun-man-5757357.png',
  'noun-man-5757361.png',
  'noun-man-5757362.png',
  'noun-man-5757364.png',
  'noun-man-5757365.png',
  'noun-man-5757371.png',
  'noun-man-5757375.png',
  'noun-man-5757377.png',
  'noun-man-5757380.png',
  'noun-man-5757382.png',
  'noun-man-5757384.png',
  'noun-man-5757385.png',
  'noun-man-7815635.png',
  'noun-man-7815636.png',
  'noun-man-7845944.png',
  'noun-man-7845957.png',
  'noun-man-7845965.png',
  'noun-man-7845974.png',
  'noun-old-man-7845966.png',
  'noun-people-5840185.png',
  'noun-people-5840188.png',
  'noun-people-5840193.png',
  'noun-people-5840194.png',
  'noun-people-7845958.png',
  'noun-player-7845978.png',
  'noun-portrait-7845960.png',
  'noun-punk-5840186.png',
  'noun-schoolboy-7845954.png',
  'noun-teenager-7845977.png',
  'noun-user-5840187.png',
  'noun-user-5840191.png',
  'noun-wife-7845972.png',
  'noun-woman-5757358.png',
  'noun-woman-5757359.png',
  'noun-woman-5757360.png',
  'noun-woman-5757363.png',
  'noun-woman-5757366.png',
  'noun-woman-5757367.png',
  'noun-woman-5757370.png',
  'noun-woman-5757372.png',
  'noun-woman-5757374.png',
  'noun-woman-5757376.png',
  'noun-woman-5757378.png',
  'noun-woman-5757379.png',
  'noun-woman-5757381.png',
  'noun-woman-5757383.png',
  'noun-woman-5757386.png',
  'noun-woman-7815634.png',
  'noun-woman-7815637.png',
  'noun-woman-7845951.png',
  'noun-woman-7845955.png'
];

// Load agent data
const agentsDataPath = path.join(__dirname, '..', 'data', 'agents-comprehensive.json');
const agentsData = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

console.log(`📊 Analysis Results:`);
console.log(`- Total agents: ${agentsData.length}`);
console.log(`- Available avatars: ${availableAvatars.length}`);
console.log(`- Max uses per avatar: 3\n`);

// Analyze current avatar usage
const currentAvatarUsage = {};
const agentsByAvatar = {};

agentsData.forEach(agent => {
  const currentAvatar = agent.avatar;
  
  if (currentAvatar && currentAvatar !== '🤖') {
    // Extract filename from URL or use as-is
    let filename = currentAvatar;
    if (currentAvatar.includes('/')) {
      filename = currentAvatar.split('/').pop();
    }
    
    if (currentAvatarUsage[filename]) {
      currentAvatarUsage[filename]++;
    } else {
      currentAvatarUsage[filename] = 1;
    }
    
    if (!agentsByAvatar[filename]) {
      agentsByAvatar[filename] = [];
    }
    agentsByAvatar[filename].push({
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      business_function: agent.business_function,
      department: agent.department,
      tier: agent.tier
    });
  }
});

// Find overused avatars (more than 3 uses)
const overusedAvatars = Object.entries(currentAvatarUsage)
  .filter(([, count]) => count > 3)
  .sort(([,a], [,b]) => b - a);

// Find underused avatars (less than 3 uses)
const underusedAvatars = Object.entries(currentAvatarUsage)
  .filter(([, count]) => count < 3)
  .sort(([,a], [,b]) => a - b);

// Find unused avatars
const unusedAvatars = availableAvatars.filter(avatar => !currentAvatarUsage[avatar]);

console.log(`🔍 Current Avatar Usage Analysis:`);
console.log(`- Overused avatars (>3 uses): ${overusedAvatars.length}`);
console.log(`- Underused avatars (<3 uses): ${underusedAvatars.length}`);
console.log(`- Unused avatars: ${unusedAvatars.length}\n`);

if (overusedAvatars.length > 0) {
  console.log(`⚠️  Overused Avatars:`);
  overusedAvatars.forEach(([avatar, count]) => {
    console.log(`  ${avatar}: ${count} uses (${count - 3} excess)`);
  });
  console.log('');
}

// Calculate redistribution needs
let totalExcessUses = overusedAvatars.reduce((sum, [, count]) => sum + (count - 3), 0);
let totalAvailableSlots = underusedAvatars.reduce((sum, [, count]) => sum + (3 - count), 0) + unusedAvatars.length * 3;

console.log(`📈 Redistribution Analysis:`);
console.log(`- Total excess uses: ${totalExcessUses}`);
console.log(`- Total available slots: ${totalAvailableSlots}`);
console.log(`- Can redistribute: ${totalAvailableSlots >= totalExcessUses ? '✅ Yes' : '❌ No'}\n`);

if (totalAvailableSlots < totalExcessUses) {
  console.log(`❌ Error: Not enough available slots to redistribute all overused avatars.`);
  console.log(`   Need ${totalExcessUses} slots, but only have ${totalAvailableSlots} available.`);
  process.exit(1);
}

// Create redistribution plan
const redistributionPlan = [];
const sqlUpdates = [];

// Process overused avatars
overusedAvatars.forEach(([avatar, count]) => {
  const excessUses = count - 3;
  const agentsUsingThisAvatar = agentsByAvatar[avatar];
  
  console.log(`🔄 Processing ${avatar} (${count} uses, ${excessUses} excess):`);
  
  // Keep the first 3 agents, reassign the rest
  const agentsToReassign = agentsUsingThisAvatar.slice(3);
  
  console.log(`  - Keeping: ${agentsUsingThisAvatar.slice(0, 3).map(a => a.display_name).join(', ')}`);
  console.log(`  - Reassigning: ${agentsToReassign.length} agents`);
  
  // Find new avatars for reassigned agents
  agentsToReassign.forEach(agent => {
    let newAvatar = null;
    
    // Try to find an underused avatar first
    for (const [underusedAvatar, currentCount] of underusedAvatars) {
      if (currentCount < 3) {
        newAvatar = underusedAvatar;
        underusedAvatars[underusedAvatars.findIndex(([a]) => a === underusedAvatar)][1]++;
        break;
      }
    }
    
    // If no underused avatar available, use an unused one
    if (!newAvatar && unusedAvatars.length > 0) {
      newAvatar = unusedAvatars.shift();
      currentAvatarUsage[newAvatar] = 1;
    }
    
    if (newAvatar) {
      redistributionPlan.push({
        agent_id: agent.id,
        agent_name: agent.display_name,
        old_avatar: avatar,
        new_avatar: newAvatar,
        reason: 'Redistributed from overused avatar'
      });
      
      sqlUpdates.push(`UPDATE agents SET avatar = '/icons/png/avatars/${newAvatar}' WHERE id = '${agent.id}';`);
      
      console.log(`    ✅ ${agent.display_name} → ${newAvatar}`);
    } else {
      console.log(`    ❌ No available avatar for ${agent.display_name}`);
    }
  });
  
  console.log('');
});

// Generate comprehensive report
const report = {
  summary: {
    total_agents: agentsData.length,
    total_avatars: availableAvatars.length,
    overused_avatars: overusedAvatars.length,
    underused_avatars: underusedAvatars.length,
    unused_avatars: unusedAvatars.length,
    total_excess_uses: totalExcessUses,
    total_available_slots: totalAvailableSlots,
    redistributions: redistributionPlan.length
  },
  overused_avatars: overusedAvatars,
  underused_avatars: underusedAvatars,
  unused_avatars: unusedAvatars,
  redistribution_plan: redistributionPlan,
  sql_updates: sqlUpdates,
  final_usage: currentAvatarUsage
};

// Save reports
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Save detailed report
fs.writeFileSync(
  path.join(reportsDir, 'avatar-redistribution-report.json'),
  JSON.stringify(report, null, 2)
);

// Save SQL file
fs.writeFileSync(
  path.join(reportsDir, 'avatar-redistribution-updates.sql'),
  sqlUpdates.join('\n')
);

// Save summary report
const summaryReport = `# Avatar Redistribution Report

## Summary
- **Total Agents**: ${report.summary.total_agents}
- **Total Avatars**: ${report.summary.total_avatars}
- **Overused Avatars**: ${report.summary.overused_avatars}
- **Underused Avatars**: ${report.summary.underused_avatars}
- **Unused Avatars**: ${report.summary.unused_avatars}
- **Total Excess Uses**: ${report.summary.total_excess_uses}
- **Total Available Slots**: ${report.summary.total_available_slots}
- **Redistributions**: ${report.summary.redistributions}

## Overused Avatars (Before Redistribution)
${overusedAvatars.map(([avatar, count]) => `- ${avatar}: ${count} uses`).join('\n')}

## Redistribution Plan
${redistributionPlan.map(plan => 
  `- **${plan.agent_name}**: ${plan.old_avatar} → ${plan.new_avatar}`
).join('\n')}

## Next Steps
1. Review the SQL file: \`reports/avatar-redistribution-updates.sql\`
2. Execute the SQL updates in your database
3. Verify avatar assignments in the application
4. Test avatar display functionality

## Files Generated
- \`reports/avatar-redistribution-report.json\` - Detailed report
- \`reports/avatar-redistribution-updates.sql\` - SQL update statements
- \`reports/avatar-redistribution-summary.md\` - This summary
`;

fs.writeFileSync(
  path.join(reportsDir, 'avatar-redistribution-summary.md'),
  summaryReport
);

console.log(`📁 Reports saved to: ${reportsDir}/`);
console.log(`- avatar-redistribution-report.json (detailed data)`);
console.log(`- avatar-redistribution-updates.sql (SQL statements)`);
console.log(`- avatar-redistribution-summary.md (summary report)\n`);

console.log(`✅ Redistribution completed!`);
console.log(`- Agents reassigned: ${redistributionPlan.length}`);
console.log(`- SQL updates generated: ${sqlUpdates.length}`);
console.log(`🎯 All avatars now comply with max 3 uses rule.`);
console.log(`📋 Next: Execute the SQL updates in your database.`);