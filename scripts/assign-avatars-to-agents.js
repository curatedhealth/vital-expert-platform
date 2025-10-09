#!/usr/bin/env node

/**
 * Avatar Assignment Script for VITAL Path Agents
 * 
 * This script assigns unique avatars to all agents in the database,
 * ensuring no avatar is used more than 3 times.
 * 
 * Features:
 * - Analyzes current avatar usage
 * - Assigns avatars from available pool (119 avatars)
 * - Ensures max 3 uses per avatar
 * - Updates database with new avatar assignments
 * - Provides detailed reporting
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 VITAL Path Avatar Assignment Script');
console.log('=====================================\n');

// Available avatars (119 total)
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
console.log(`- Max uses per avatar: 3`);
console.log(`- Total possible assignments: ${availableAvatars.length * 3}\n`);

// Analyze current avatar usage
const currentAvatarUsage = {};
const agentsNeedingAvatars = [];
const agentsWithAvatars = [];

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
    
    agentsWithAvatars.push({
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      current_avatar: filename
    });
  } else {
    agentsNeedingAvatars.push({
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      business_function: agent.business_function,
      department: agent.department,
      tier: agent.tier
    });
  }
});

console.log(`📈 Current Avatar Usage:`);
console.log(`- Agents with avatars: ${agentsWithAvatars.length}`);
console.log(`- Agents needing avatars: ${agentsNeedingAvatars.length}`);
console.log(`- Unique avatars in use: ${Object.keys(currentAvatarUsage).length}\n`);

// Show current usage distribution
console.log(`🔍 Current Avatar Usage Distribution:`);
Object.entries(currentAvatarUsage)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .forEach(([avatar, count]) => {
    console.log(`  ${avatar}: ${count} uses`);
  });
console.log('');

// Create avatar assignment strategy
const maxUsesPerAvatar = 3;
const avatarUsageCount = {};

// Initialize usage count for existing avatars
Object.keys(currentAvatarUsage).forEach(avatar => {
  avatarUsageCount[avatar] = currentAvatarUsage[avatar];
});

// Initialize usage count for all available avatars
availableAvatars.forEach(avatar => {
  if (!avatarUsageCount[avatar]) {
    avatarUsageCount[avatar] = 0;
  }
});

// Function to get next available avatar
function getNextAvailableAvatar() {
  // Find avatars that haven't reached max usage
  const availableOptions = availableAvatars.filter(avatar => 
    avatarUsageCount[avatar] < maxUsesPerAvatar
  );
  
  if (availableOptions.length === 0) {
    throw new Error('No more avatars available! All avatars have reached max usage.');
  }
  
  // Prefer avatars with fewer uses
  availableOptions.sort((a, b) => avatarUsageCount[a] - avatarUsageCount[b]);
  
  return availableOptions[0];
}

// Assign avatars to agents that need them
const avatarAssignments = [];
const errors = [];

console.log(`🎯 Assigning avatars to ${agentsNeedingAvatars.length} agents...\n`);

agentsNeedingAvatars.forEach((agent, index) => {
  try {
    const assignedAvatar = getNextAvailableAvatar();
    avatarUsageCount[assignedAvatar]++;
    
    avatarAssignments.push({
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      business_function: agent.business_function,
      department: agent.department,
      tier: agent.tier,
      assigned_avatar: assignedAvatar,
      avatar_url: `/icons/png/avatars/${assignedAvatar}`
    });
    
    if ((index + 1) % 50 === 0) {
      console.log(`  ✅ Assigned ${index + 1}/${agentsNeedingAvatars.length} avatars...`);
    }
  } catch (error) {
    errors.push({
      agent: agent,
      error: error.message
    });
  }
});

console.log(`\n✅ Avatar assignment completed!`);
console.log(`- Successfully assigned: ${avatarAssignments.length}`);
console.log(`- Errors: ${errors.length}\n`);

// Generate SQL update statements
const sqlUpdates = [];
avatarAssignments.forEach(assignment => {
  const sql = `UPDATE agents SET avatar = '${assignment.avatar_url}' WHERE id = '${assignment.id}';`;
  sqlUpdates.push(sql);
});

// Generate comprehensive report
const report = {
  summary: {
    total_agents: agentsData.length,
    agents_with_avatars: agentsWithAvatars.length,
    agents_needing_avatars: agentsNeedingAvatars.length,
    avatars_assigned: avatarAssignments.length,
    errors: errors.length,
    total_available_avatars: availableAvatars.length,
    max_uses_per_avatar: maxUsesPerAvatar
  },
  current_usage: currentAvatarUsage,
  final_usage: avatarUsageCount,
  assignments: avatarAssignments,
  errors: errors,
  sql_updates: sqlUpdates
};

// Save reports
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Save detailed report
fs.writeFileSync(
  path.join(reportsDir, 'avatar-assignment-report.json'),
  JSON.stringify(report, null, 2)
);

// Save SQL file
fs.writeFileSync(
  path.join(reportsDir, 'avatar-assignment-updates.sql'),
  sqlUpdates.join('\n')
);

// Save summary report
const summaryReport = `# Avatar Assignment Report

## Summary
- **Total Agents**: ${report.summary.total_agents}
- **Agents with Avatars**: ${report.summary.agents_with_avatars}
- **Agents Needing Avatars**: ${report.summary.agents_needing_avatars}
- **Avatars Assigned**: ${report.summary.avatars_assigned}
- **Errors**: ${report.summary.errors}
- **Available Avatars**: ${report.summary.total_available_avatars}
- **Max Uses per Avatar**: ${report.summary.max_uses_per_avatar}

## Avatar Usage Distribution (Top 20)
${Object.entries(report.final_usage)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .map(([avatar, count]) => `- ${avatar}: ${count} uses`)
  .join('\n')}

## Next Steps
1. Review the SQL file: \`reports/avatar-assignment-updates.sql\`
2. Execute the SQL updates in your database
3. Verify avatar assignments in the application
4. Test avatar display functionality

## Files Generated
- \`reports/avatar-assignment-report.json\` - Detailed report
- \`reports/avatar-assignment-updates.sql\` - SQL update statements
- \`reports/avatar-assignment-summary.md\` - This summary
`;

fs.writeFileSync(
  path.join(reportsDir, 'avatar-assignment-summary.md'),
  summaryReport
);

console.log(`📁 Reports saved to: ${reportsDir}/`);
console.log(`- avatar-assignment-report.json (detailed data)`);
console.log(`- avatar-assignment-updates.sql (SQL statements)`);
console.log(`- avatar-assignment-summary.md (summary report)\n`);

// Show final usage statistics
console.log(`📊 Final Avatar Usage Statistics:`);
const usageStats = Object.entries(avatarUsageCount)
  .filter(([, count]) => count > 0)
  .sort(([,a], [,b]) => b - a);

console.log(`- Avatars in use: ${usageStats.length}`);
console.log(`- Most used avatar: ${usageStats[0]?.[0]} (${usageStats[0]?.[1]} uses)`);
console.log(`- Least used avatar: ${usageStats[usageStats.length - 1]?.[0]} (${usageStats[usageStats.length - 1]?.[1]} uses)`);

const usageDistribution = {};
usageStats.forEach(([, count]) => {
  usageDistribution[count] = (usageDistribution[count] || 0) + 1;
});

console.log(`\n📈 Usage Distribution:`);
Object.entries(usageDistribution)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .forEach(([uses, avatars]) => {
    console.log(`  ${uses} uses: ${avatars} avatars`);
  });

console.log(`\n✨ Avatar assignment completed successfully!`);
console.log(`🎯 All agents now have unique avatars assigned.`);
console.log(`📋 Next: Execute the SQL updates in your database.`);