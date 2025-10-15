#!/usr/bin/env node

/**
 * Database Avatar Update Script
 * 
 * This script updates the database with the current avatar assignments
 * to ensure all agents have proper avatar URLs stored.
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️  VITAL Path Database Avatar Update Script');
console.log('============================================\n');

// Load agent data
const agentsDataPath = path.join(__dirname, '..', 'data', 'agents-comprehensive.json');
const agentsData = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

console.log(`📊 Processing ${agentsData.length} agents...\n`);

// Generate SQL updates for all agents
const sqlUpdates = [];
const avatarUpdates = [];

agentsData.forEach(agent => {
  const currentAvatar = agent.avatar;
  
  if (currentAvatar && currentAvatar !== '🤖') {
    // Convert Supabase URLs to local paths
    let avatarPath = currentAvatar;
    
    if (currentAvatar.includes('supabase.co/storage')) {
      const filename = currentAvatar.split('/').pop();
      avatarPath = `/icons/png/avatars/${filename}`;
    } else if (currentAvatar.includes('.png') && !currentAvatar.startsWith('/')) {
      avatarPath = `/icons/png/avatars/${currentAvatar}`;
    }
    
    // Only update if the path has changed
    if (avatarPath !== currentAvatar) {
      const sql = `UPDATE agents SET avatar = '${avatarPath}' WHERE id = '${agent.id}';`;
      sqlUpdates.push(sql);
      
      avatarUpdates.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        old_avatar: currentAvatar,
        new_avatar: avatarPath
      });
    }
  }
});

console.log(`📈 Update Summary:`);
console.log(`- Total agents: ${agentsData.length}`);
console.log(`- Agents needing updates: ${avatarUpdates.length}`);
console.log(`- SQL statements generated: ${sqlUpdates.length}\n`);

if (avatarUpdates.length > 0) {
  console.log(`🔄 Avatar Updates:`);
  avatarUpdates.slice(0, 10).forEach(update => {
    console.log(`  - ${update.display_name}: ${update.old_avatar} → ${update.new_avatar}`);
  });
  if (avatarUpdates.length > 10) {
    console.log(`  ... and ${avatarUpdates.length - 10} more`);
  }
  console.log('');
}

// Generate comprehensive report
const report = {
  summary: {
    total_agents: agentsData.length,
    agents_updated: avatarUpdates.length,
    sql_statements: sqlUpdates.length
  },
  updates: avatarUpdates,
  sql_updates: sqlUpdates
};

// Save reports
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Save detailed report
fs.writeFileSync(
  path.join(reportsDir, 'database-avatar-update-report.json'),
  JSON.stringify(report, null, 2)
);

// Save SQL file
fs.writeFileSync(
  path.join(reportsDir, 'database-avatar-updates.sql'),
  sqlUpdates.join('\n')
);

// Save summary report
const summaryReport = `# Database Avatar Update Report

## Summary
- **Total Agents**: ${report.summary.total_agents}
- **Agents Updated**: ${report.summary.agents_updated}
- **SQL Statements**: ${report.summary.sql_statements}

## Avatar Updates
${avatarUpdates.map(update => 
  `- **${update.display_name}**: \`${update.old_avatar}\` → \`${update.new_avatar}\``
).join('\n')}

## Next Steps
1. Review the SQL file: \`reports/database-avatar-updates.sql\`
2. Execute the SQL updates in your database
3. Verify avatar assignments in the application
4. Test avatar display functionality

## Files Generated
- \`reports/database-avatar-update-report.json\` - Detailed report
- \`reports/database-avatar-updates.sql\` - SQL update statements
- \`reports/database-avatar-update-summary.md\` - This summary
`;

fs.writeFileSync(
  path.join(reportsDir, 'database-avatar-update-summary.md'),
  summaryReport
);

console.log(`📁 Reports saved to: ${reportsDir}/`);
console.log(`- database-avatar-update-report.json (detailed data)`);
console.log(`- database-avatar-updates.sql (SQL statements)`);
console.log(`- database-avatar-update-summary.md (summary report)\n`);

if (avatarUpdates.length > 0) {
  console.log(`✅ Database update script completed!`);
  console.log(`🎯 ${avatarUpdates.length} agents will be updated with proper avatar paths.`);
  console.log(`📋 Next: Execute the SQL updates in your database.`);
} else {
  console.log(`✅ No updates needed!`);
  console.log(`🎯 All agents already have proper avatar paths.`);
}
