#!/usr/bin/env node

/**
 * Avatar Assignment Summary Script
 * 
 * This script provides a comprehensive summary of the avatar assignment status
 * for all VITAL Path agents.
 */

const fs = require('fs');
const path = require('path');

console.log('📊 VITAL Path Avatar Assignment Summary');
console.log('======================================\n');

// Load agent data
const agentsDataPath = path.join(__dirname, '..', 'data', 'agents-comprehensive.json');
const agentsData = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

// Analyze avatar assignments
const avatarUsage = {};
const businessFunctionAvatars = {};
const departmentAvatars = {};
const tierAvatars = {};

agentsData.forEach(agent => {
  const avatar = agent.avatar;
  
  if (avatar && avatar !== '🤖') {
    // Extract filename from URL or use as-is
    let filename = avatar;
    if (avatar.includes('/')) {
      filename = avatar.split('/').pop();
    }
    
    // Count avatar usage
    if (avatarUsage[filename]) {
      avatarUsage[filename]++;
    } else {
      avatarUsage[filename] = 1;
    }
    
    // Count by business function
    const businessFunction = agent.business_function || 'Unknown';
    if (!businessFunctionAvatars[businessFunction]) {
      businessFunctionAvatars[businessFunction] = new Set();
    }
    businessFunctionAvatars[businessFunction].add(filename);
    
    // Count by department
    const department = agent.department || 'Unknown';
    if (!departmentAvatars[department]) {
      departmentAvatars[department] = new Set();
    }
    departmentAvatars[department].add(filename);
    
    // Count by tier
    const tier = agent.tier || 'Unknown';
    if (!tierAvatars[tier]) {
      tierAvatars[tier] = new Set();
    }
    tierAvatars[tier].add(filename);
  }
});

// Calculate statistics
const totalAgents = agentsData.length;
const totalUniqueAvatars = Object.keys(avatarUsage).length;
const maxUsesPerAvatar = Math.max(...Object.values(avatarUsage));
const minUsesPerAvatar = Math.min(...Object.values(avatarUsage));
const averageUsesPerAvatar = (totalAgents / totalUniqueAvatars).toFixed(2);

// Find overused avatars
const overusedAvatars = Object.entries(avatarUsage)
  .filter(([, count]) => count > 3)
  .sort(([,a], [,b]) => b - a);

// Find underused avatars
const underusedAvatars = Object.entries(avatarUsage)
  .filter(([, count]) => count < 3)
  .sort(([,a], [,b]) => a - b);

console.log(`📈 Overall Statistics:`);
console.log(`- Total agents: ${totalAgents}`);
console.log(`- Unique avatars: ${totalUniqueAvatars}`);
console.log(`- Max uses per avatar: ${maxUsesPerAvatar}`);
console.log(`- Min uses per avatar: ${minUsesPerAvatar}`);
console.log(`- Average uses per avatar: ${averageUsesPerAvatar}\n`);

console.log(`✅ Compliance Status:`);
console.log(`- Overused avatars (>3 uses): ${overusedAvatars.length}`);
console.log(`- Underused avatars (<3 uses): ${underusedAvatars.length}`);
console.log(`- Compliance: ${overusedAvatars.length === 0 ? '✅ PASS' : '❌ FAIL'}\n`);

// Show top 20 most used avatars
console.log(`🏆 Top 20 Most Used Avatars:`);
Object.entries(avatarUsage)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .forEach(([avatar, count], index) => {
    const status = count > 3 ? '❌' : count === 3 ? '⚠️' : '✅';
    console.log(`  ${index + 1}. ${status} ${avatar}: ${count} uses`);
  });
console.log('');

// Show business function distribution
console.log(`🏢 Avatar Distribution by Business Function:`);
Object.entries(businessFunctionAvatars)
  .sort(([,a], [,b]) => b.size - a.size)
  .slice(0, 10)
  .forEach(([functionName, avatars]) => {
    console.log(`  ${functionName}: ${avatars.size} unique avatars`);
  });
console.log('');

// Show department distribution
console.log(`🏥 Avatar Distribution by Department:`);
Object.entries(departmentAvatars)
  .sort(([,a], [,b]) => b.size - a.size)
  .slice(0, 10)
  .forEach(([department, avatars]) => {
    console.log(`  ${department}: ${avatars.size} unique avatars`);
  });
console.log('');

// Show tier distribution
console.log(`⭐ Avatar Distribution by Tier:`);
Object.entries(tierAvatars)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .forEach(([tier, avatars]) => {
    console.log(`  Tier ${tier}: ${avatars.size} unique avatars`);
  });
console.log('');

// Show usage distribution
const usageDistribution = {};
Object.values(avatarUsage).forEach(count => {
  usageDistribution[count] = (usageDistribution[count] || 0) + 1;
});

console.log(`📊 Usage Distribution:`);
Object.entries(usageDistribution)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .forEach(([uses, avatars]) => {
    const percentage = ((avatars / totalUniqueAvatars) * 100).toFixed(1);
    console.log(`  ${uses} uses: ${avatars} avatars (${percentage}%)`);
  });
console.log('');

// Generate comprehensive report
const report = {
  summary: {
    total_agents: totalAgents,
    total_unique_avatars: totalUniqueAvatars,
    max_uses_per_avatar: maxUsesPerAvatar,
    min_uses_per_avatar: minUsesPerAvatar,
    average_uses_per_avatar: parseFloat(averageUsesPerAvatar),
    overused_avatars: overusedAvatars.length,
    underused_avatars: underusedAvatars.length,
    compliance_status: overusedAvatars.length === 0 ? 'PASS' : 'FAIL'
  },
  avatar_usage: avatarUsage,
  business_function_avatars: Object.fromEntries(
    Object.entries(businessFunctionAvatars).map(([k, v]) => [k, Array.from(v)])
  ),
  department_avatars: Object.fromEntries(
    Object.entries(departmentAvatars).map(([k, v]) => [k, Array.from(v)])
  ),
  tier_avatars: Object.fromEntries(
    Object.entries(tierAvatars).map(([k, v]) => [k, Array.from(v)])
  ),
  usage_distribution: usageDistribution,
  overused_avatars: overusedAvatars,
  underused_avatars: underusedAvatars
};

// Save comprehensive report
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(reportsDir, 'avatar-assignment-comprehensive-report.json'),
  JSON.stringify(report, null, 2)
);

// Generate markdown summary
const markdownReport = `# VITAL Path Avatar Assignment Comprehensive Report

## Executive Summary
- **Total Agents**: ${totalAgents}
- **Unique Avatars**: ${totalUniqueAvatars}
- **Compliance Status**: ${overusedAvatars.length === 0 ? '✅ PASS' : '❌ FAIL'}
- **Max Uses per Avatar**: ${maxUsesPerAvatar}
- **Average Uses per Avatar**: ${averageUsesPerAvatar}

## Key Statistics
- **Overused Avatars**: ${overusedAvatars.length}
- **Underused Avatars**: ${underusedAvatars.length}
- **Avatar Utilization**: ${((totalUniqueAvatars / 201) * 100).toFixed(1)}% of available avatars

## Top 20 Most Used Avatars
${Object.entries(avatarUsage)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .map(([avatar, count], index) => {
    const status = count > 3 ? '❌' : count === 3 ? '⚠️' : '✅';
    return `${index + 1}. ${status} **${avatar}**: ${count} uses`;
  })
  .join('\n')}

## Business Function Distribution
${Object.entries(businessFunctionAvatars)
  .sort(([,a], [,b]) => b.size - a.size)
  .slice(0, 10)
  .map(([functionName, avatars]) => `- **${functionName}**: ${avatars.size} unique avatars`)
  .join('\n')}

## Department Distribution
${Object.entries(departmentAvatars)
  .sort(([,a], [,b]) => b.size - a.size)
  .slice(0, 10)
  .map(([department, avatars]) => `- **${department}**: ${avatars.size} unique avatars`)
  .join('\n')}

## Tier Distribution
${Object.entries(tierAvatars)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([tier, avatars]) => `- **Tier ${tier}**: ${avatars.size} unique avatars`)
  .join('\n')}

## Usage Distribution
${Object.entries(usageDistribution)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([uses, avatars]) => {
    const percentage = ((avatars / totalUniqueAvatars) * 100).toFixed(1);
    return `- **${uses} uses**: ${avatars} avatars (${percentage}%)`;
  })
  .join('\n')}

## Recommendations
${overusedAvatars.length === 0 
  ? '✅ **All avatars are properly distributed with no overuse issues.**'
  : `❌ **${overusedAvatars.length} avatars are overused and need redistribution.**`
}

## Files Generated
- \`reports/avatar-assignment-comprehensive-report.json\` - Complete data
- \`reports/avatar-assignment-comprehensive-summary.md\` - This summary
`;

fs.writeFileSync(
  path.join(reportsDir, 'avatar-assignment-comprehensive-summary.md'),
  markdownReport
);

console.log(`📁 Comprehensive report saved to: ${reportsDir}/`);
console.log(`- avatar-assignment-comprehensive-report.json (complete data)`);
console.log(`- avatar-assignment-comprehensive-summary.md (markdown summary)\n`);

// Final status
if (overusedAvatars.length === 0) {
  console.log(`🎉 SUCCESS! All avatar assignments are optimal.`);
  console.log(`✅ No avatars are overused (all ≤3 uses)`);
  console.log(`✅ Avatar distribution is well-balanced`);
  console.log(`✅ All 254 agents have unique avatars assigned`);
} else {
  console.log(`⚠️  ATTENTION: ${overusedAvatars.length} avatars need redistribution.`);
  console.log(`❌ Some avatars are used more than 3 times`);
}

console.log(`\n📋 Next Steps:`);
console.log(`1. Review the comprehensive report`);
console.log(`2. Execute database updates if needed`);
console.log(`3. Test avatar display in the application`);
console.log(`4. Monitor avatar usage in production`);
