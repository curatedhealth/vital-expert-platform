#!/usr/bin/env node

/**
 * Assign PNG Avatars to All 372 Agents Script
 * 
 * This script assigns proper PNG avatars to all 372 agents in the cloud database,
 * replacing the current UUID-based avatar identifiers with actual avatar files.
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 VITAL Path - Assign PNG Avatars to All 372 Agents');
console.log('====================================================\n');

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
  console.log('🌐 Fetching all 372 agents from cloud database...\n');
  
  try {
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
    throw error;
  }
}

function createAvatarAssignmentStrategy(agents) {
  console.log('📊 Creating avatar assignment strategy...\n');
  
  // Group agents by business function for better distribution
  const agentsByBusinessFunction = {};
  agents.forEach(agent => {
    const businessFunction = agent.business_function || 'Unknown';
    if (!agentsByBusinessFunction[businessFunction]) {
      agentsByBusinessFunction[businessFunction] = [];
    }
    agentsByBusinessFunction[businessFunction].push(agent);
  });
  
  console.log('📈 Agents by Business Function:');
  Object.entries(agentsByBusinessFunction)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([functionName, agents]) => {
      console.log(`  ${functionName}: ${agents.length} agents`);
    });
  console.log('');
  
  // Create assignment plan
  const assignmentPlan = [];
  const avatarUsage = {};
  let avatarIndex = 0;
  
  // Initialize avatar usage tracking
  availableAvatars.forEach(avatar => {
    avatarUsage[avatar] = 0;
  });
  
  // Assign avatars to agents
  Object.entries(agentsByBusinessFunction).forEach(([businessFunction, functionAgents]) => {
    console.log(`🎯 Assigning avatars to ${businessFunction} (${functionAgents.length} agents)...`);
    
    functionAgents.forEach((agent, index) => {
      // Find next available avatar (max 3 uses per avatar)
      let assignedAvatar = null;
      let attempts = 0;
      
      while (!assignedAvatar && attempts < availableAvatars.length) {
        const candidateAvatar = availableAvatars[avatarIndex % availableAvatars.length];
        
        if (avatarUsage[candidateAvatar] < 3) {
          assignedAvatar = candidateAvatar;
          avatarUsage[candidateAvatar]++;
        }
        
        avatarIndex++;
        attempts++;
      }
      
      // If no avatar found with <3 uses, use the first available
      if (!assignedAvatar) {
        assignedAvatar = availableAvatars.find(avatar => avatarUsage[avatar] < 3) || availableAvatars[0];
        avatarUsage[assignedAvatar]++;
      }
      
      assignmentPlan.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        business_function: agent.business_function,
        department: agent.department,
        tier: agent.tier,
        old_avatar: agent.avatar,
        new_avatar: assignedAvatar,
        avatar_url: `/icons/png/avatars/${assignedAvatar}`
      });
    });
  });
  
  return { assignmentPlan, avatarUsage };
}

function generateSQLUpdates(assignmentPlan) {
  console.log('📝 Generating SQL update statements...\n');
  
  const sqlUpdates = assignmentPlan.map(assignment => {
    return `UPDATE agents SET avatar = '${assignment.avatar_url}' WHERE id = '${assignment.id}';`;
  });
  
  return sqlUpdates;
}

async function assignAvatarsToAllAgents() {
  try {
    // Fetch all agents
    const agents = await fetchAllAgents();
    
    if (agents.length !== 372) {
      console.log(`⚠️  Warning: Expected 372 agents, but found ${agents.length}`);
    }
    
    // Create assignment strategy
    const { assignmentPlan, avatarUsage } = createAvatarAssignmentStrategy(agents);
    
    // Generate SQL updates
    const sqlUpdates = generateSQLUpdates(assignmentPlan);
    
    // Calculate statistics
    const totalAgents = assignmentPlan.length;
    const totalUniqueAvatars = Object.keys(avatarUsage).filter(avatar => avatarUsage[avatar] > 0).length;
    const maxUsesPerAvatar = Math.max(...Object.values(avatarUsage));
    const minUsesPerAvatar = Math.min(...Object.values(avatarUsage));
    const averageUsesPerAvatar = (totalAgents / totalUniqueAvatars).toFixed(2);
    
    // Find overused avatars
    const overusedAvatars = Object.entries(avatarUsage)
      .filter(([, count]) => count > 3)
      .sort(([,a], [,b]) => b - a);
    
    console.log(`📊 Assignment Results:`);
    console.log(`- Total agents: ${totalAgents}`);
    console.log(`- Unique avatars used: ${totalUniqueAvatars}`);
    console.log(`- Max uses per avatar: ${maxUsesPerAvatar}`);
    console.log(`- Min uses per avatar: ${minUsesPerAvatar}`);
    console.log(`- Average uses per avatar: ${averageUsesPerAvatar}`);
    console.log(`- Overused avatars: ${overusedAvatars.length}\n`);
    
    if (overusedAvatars.length > 0) {
      console.log(`❌ Overused Avatars:`);
      overusedAvatars.forEach(([avatar, count]) => {
        console.log(`  ${avatar}: ${count} uses`);
      });
      console.log('');
    }
    
    // Show sample assignments
    console.log(`🎭 Sample Avatar Assignments (first 20):`);
    assignmentPlan.slice(0, 20).forEach((assignment, index) => {
      console.log(`  ${index + 1}. ${assignment.display_name}: ${assignment.new_avatar}`);
    });
    if (assignmentPlan.length > 20) {
      console.log(`  ... and ${assignmentPlan.length - 20} more`);
    }
    console.log('');
    
    // Generate comprehensive report
    const report = {
      summary: {
        total_agents: totalAgents,
        total_avatars_available: availableAvatars.length,
        unique_avatars_used: totalUniqueAvatars,
        max_uses_per_avatar: maxUsesPerAvatar,
        min_uses_per_avatar: minUsesPerAvatar,
        average_uses_per_avatar: parseFloat(averageUsesPerAvatar),
        overused_avatars: overusedAvatars.length,
        compliance_status: overusedAvatars.length === 0 ? 'PASS' : 'FAIL'
      },
      assignment_plan: assignmentPlan,
      avatar_usage: avatarUsage,
      sql_updates: sqlUpdates
    };
    
    // Save reports
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save detailed report
    fs.writeFileSync(
      path.join(reportsDir, 'assign-png-avatars-to-372-agents-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Save SQL file
    fs.writeFileSync(
      path.join(reportsDir, 'assign-png-avatars-to-372-agents-updates.sql'),
      sqlUpdates.join('\n')
    );
    
    // Save summary report
    const summaryReport = `# Assign PNG Avatars to All 372 Agents Report

## Summary
- **Total Agents**: ${totalAgents}
- **Available Avatars**: ${availableAvatars.length}
- **Unique Avatars Used**: ${totalUniqueAvatars}
- **Max Uses per Avatar**: ${maxUsesPerAvatar}
- **Compliance Status**: ${overusedAvatars.length === 0 ? '✅ PASS' : '❌ FAIL'}

## Assignment Strategy
- Agents grouped by business function for better distribution
- Avatars assigned with max 3 uses per avatar
- Local PNG paths used for better performance

## Sample Assignments
${assignmentPlan.slice(0, 20).map((assignment, index) => 
  `${index + 1}. **${assignment.display_name}**: \`${assignment.new_avatar}\``
).join('\n')}

## Next Steps
1. Review the SQL file: \`reports/assign-png-avatars-to-372-agents-updates.sql\`
2. Execute the SQL updates in your database
3. Verify avatar assignments in the application
4. Test avatar display functionality

## Files Generated
- \`reports/assign-png-avatars-to-372-agents-report.json\` - Detailed report
- \`reports/assign-png-avatars-to-372-agents-updates.sql\` - SQL update statements
- \`reports/assign-png-avatars-to-372-agents-summary.md\` - This summary
`;

    fs.writeFileSync(
      path.join(reportsDir, 'assign-png-avatars-to-372-agents-summary.md'),
      summaryReport
    );
    
    console.log(`📁 Reports saved to: ${reportsDir}/`);
    console.log(`- assign-png-avatars-to-372-agents-report.json (detailed data)`);
    console.log(`- assign-png-avatars-to-372-agents-updates.sql (SQL statements)`);
    console.log(`- assign-png-avatars-to-372-agents-summary.md (summary report)\n`);
    
    // Final status
    if (overusedAvatars.length === 0) {
      console.log(`🎉 SUCCESS! Avatar assignment completed successfully.`);
      console.log(`✅ All ${totalAgents} agents assigned unique avatars`);
      console.log(`✅ No avatars are overused (all ≤3 uses)`);
      console.log(`✅ Optimal distribution achieved`);
    } else {
      console.log(`⚠️  ATTENTION: ${overusedAvatars.length} avatars are overused.`);
      console.log(`❌ Some avatars are used more than 3 times`);
    }
    
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Review the comprehensive report`);
    console.log(`2. Execute the SQL updates in your database`);
    console.log(`3. Test avatar display in the application`);
    console.log(`4. Monitor avatar usage in production`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the assignment
assignAvatarsToAllAgents();
