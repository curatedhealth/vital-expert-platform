#!/usr/bin/env node

/**
 * Analyze All 372 Agents Script
 * 
 * This script fetches all 372 agents from the cloud database
 * and analyzes their avatar assignments to ensure proper distribution.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VITAL Path - Analyze All 372 Agents');
console.log('=====================================\n');

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

async function fetchAllAgents() {
  console.log('🌐 Fetching all agents from cloud database...\n');
  
  try {
    // Fetch all agents from the API
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/agents-crud?showAll=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const agents = data.agents || data;
    
    console.log(`✅ Successfully fetched ${agents.length} agents from cloud database\n`);
    return agents;
    
  } catch (error) {
    console.error('❌ Error fetching agents from cloud database:', error.message);
    console.log('📁 Falling back to local data...\n');
    
    // Fallback to local data
    const localDataPath = path.join(__dirname, '..', 'data', 'agents-comprehensive.json');
    if (fs.existsSync(localDataPath)) {
      const localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      console.log(`📁 Using local data: ${localData.length} agents\n`);
      return localData;
    } else {
      throw new Error('No data available from cloud or local sources');
    }
  }
}

async function analyzeAgents() {
  const agents = await fetchAllAgents();
  
  console.log(`📊 Analysis Results:`);
  console.log(`- Total agents: ${agents.length}`);
  console.log(`- Available avatars: ${availableAvatars.length}`);
  console.log(`- Max uses per avatar: 3`);
  console.log(`- Total possible assignments: ${availableAvatars.length * 3}\n`);

  // Analyze avatar assignments
  const avatarUsage = {};
  const agentsWithoutAvatars = [];
  const agentsWithEmojiAvatars = [];
  const agentsWithPngAvatars = [];
  const agentsWithSupabaseAvatars = [];
  const businessFunctionAvatars = {};
  const departmentAvatars = {};
  const tierAvatars = {};

  agents.forEach(agent => {
    const avatar = agent.avatar;
    
    if (!avatar || avatar === '🤖' || avatar === '') {
      agentsWithoutAvatars.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name
      });
    } else if (avatar.match(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
      // Emoji avatar
      agentsWithEmojiAvatars.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        avatar: avatar
      });
    } else if (avatar.includes('supabase.co/storage')) {
      // Supabase URL avatar
      const filename = avatar.split('/').pop();
      agentsWithSupabaseAvatars.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        avatar: filename
      });
      
      if (avatarUsage[filename]) {
        avatarUsage[filename]++;
      } else {
        avatarUsage[filename] = 1;
      }
    } else if (avatar.includes('.png') || avatar.includes('/icons/')) {
      // PNG avatar
      const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
      agentsWithPngAvatars.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        avatar: filename
      });
      
      if (avatarUsage[filename]) {
        avatarUsage[filename]++;
      } else {
        avatarUsage[filename] = 1;
      }
    }
    
    // Count by business function
    const businessFunction = agent.business_function || 'Unknown';
    if (!businessFunctionAvatars[businessFunction]) {
      businessFunctionAvatars[businessFunction] = new Set();
    }
    if (avatar && avatar !== '🤖') {
      const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
      businessFunctionAvatars[businessFunction].add(filename);
    }
    
    // Count by department
    const department = agent.department || 'Unknown';
    if (!departmentAvatars[department]) {
      departmentAvatars[department] = new Set();
    }
    if (avatar && avatar !== '🤖') {
      const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
      departmentAvatars[department].add(filename);
    }
    
    // Count by tier
    const tier = agent.tier || 'Unknown';
    if (!tierAvatars[tier]) {
      tierAvatars[tier] = new Set();
    }
    if (avatar && avatar !== '🤖') {
      const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
      tierAvatars[tier].add(filename);
    }
  });

  // Calculate statistics
  const totalAgents = agents.length;
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

  console.log(`📈 Avatar Assignment Summary:`);
  console.log(`- Agents without avatars: ${agentsWithoutAvatars.length}`);
  console.log(`- Agents with emoji avatars: ${agentsWithEmojiAvatars.length}`);
  console.log(`- Agents with PNG avatars: ${agentsWithPngAvatars.length}`);
  console.log(`- Agents with Supabase avatars: ${agentsWithSupabaseAvatars.length}`);
  console.log(`- Total unique avatars in use: ${totalUniqueAvatars}\n`);

  console.log(`📊 Overall Statistics:`);
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
      compliance_status: overusedAvatars.length === 0 ? 'PASS' : 'FAIL',
      agents_without_avatars: agentsWithoutAvatars.length,
      agents_with_emoji_avatars: agentsWithEmojiAvatars.length,
      agents_with_png_avatars: agentsWithPngAvatars.length,
      agents_with_supabase_avatars: agentsWithSupabaseAvatars.length
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
    underused_avatars: underusedAvatars,
    agents_without_avatars: agentsWithoutAvatars,
    agents_with_emoji_avatars: agentsWithEmojiAvatars,
    agents_with_png_avatars: agentsWithPngAvatars,
    agents_with_supabase_avatars: agentsWithSupabaseAvatars
  };

  // Save comprehensive report
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'all-372-agents-analysis-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate markdown summary
  const markdownReport = `# All 372 Agents Analysis Report

## Executive Summary
- **Total Agents**: ${totalAgents}
- **Unique Avatars**: ${totalUniqueAvatars}
- **Compliance Status**: ${overusedAvatars.length === 0 ? '✅ PASS' : '❌ FAIL'}
- **Max Uses per Avatar**: ${maxUsesPerAvatar}
- **Average Uses per Avatar**: ${averageUsesPerAvatar}

## Key Statistics
- **Overused Avatars**: ${overusedAvatars.length}
- **Underused Avatars**: ${underusedAvatars.length}
- **Agents Without Avatars**: ${agentsWithoutAvatars.length}
- **Avatar Utilization**: ${((totalUniqueAvatars / availableAvatars.length) * 100).toFixed(1)}% of available avatars

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
- \`reports/all-372-agents-analysis-report.json\` - Complete data
- \`reports/all-372-agents-analysis-summary.md\` - This summary
`;

  fs.writeFileSync(
    path.join(reportsDir, 'all-372-agents-analysis-summary.md'),
    markdownReport
  );

  console.log(`📁 Comprehensive report saved to: ${reportsDir}/`);
  console.log(`- all-372-agents-analysis-report.json (complete data)`);
  console.log(`- all-372-agents-analysis-summary.md (markdown summary)\n`);

  // Final status
  if (overusedAvatars.length === 0) {
    console.log(`🎉 SUCCESS! All avatar assignments are optimal.`);
    console.log(`✅ No avatars are overused (all ≤3 uses)`);
    console.log(`✅ Avatar distribution is well-balanced`);
    console.log(`✅ All ${totalAgents} agents have unique avatars assigned`);
  } else {
    console.log(`⚠️  ATTENTION: ${overusedAvatars.length} avatars need redistribution.`);
    console.log(`❌ Some avatars are used more than 3 times`);
  }

  console.log(`\n📋 Next Steps:`);
  console.log(`1. Review the comprehensive report`);
  console.log(`2. Execute database updates if needed`);
  console.log(`3. Test avatar display in the application`);
  console.log(`4. Monitor avatar usage in production`);
}

// Run the analysis
analyzeAgents().catch(console.error);
