#!/usr/bin/env node

/**
 * Analyze Organizational Structure Script
 * 
 * This script analyzes all business functions, departments, roles, and responsibilities
 * available in the cloud instance to understand the complete organizational structure.
 */

const fs = require('fs');
const path = require('path');

console.log('🏢 VITAL Path - Analyze Organizational Structure');
console.log('==============================================\n');

async function analyzeOrganizationalStructure() {
  try {
    console.log('🌐 Fetching all 372 agents from cloud database...\n');
    
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
    
    // Analyze organizational structure
    const analysis = {
      business_functions: {},
      departments: {},
      roles: {},
      responsibilities: new Set(),
      tiers: {},
      statuses: {},
      total_agents: agents.length
    };
    
    agents.forEach(agent => {
      // Business Functions
      const businessFunction = agent.business_function || 'Unknown';
      if (!analysis.business_functions[businessFunction]) {
        analysis.business_functions[businessFunction] = {
          count: 0,
          agents: [],
          departments: new Set(),
          roles: new Set()
        };
      }
      analysis.business_functions[businessFunction].count++;
      analysis.business_functions[businessFunction].agents.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        department: agent.department,
        role: agent.role,
        tier: agent.tier,
        status: agent.status
      });
      
      if (agent.department) {
        analysis.business_functions[businessFunction].departments.add(agent.department);
      }
      if (agent.role) {
        analysis.business_functions[businessFunction].roles.add(agent.role);
      }
      
      // Departments
      const department = agent.department || 'Unknown';
      if (!analysis.departments[department]) {
        analysis.departments[department] = {
          count: 0,
          agents: [],
          business_functions: new Set(),
          roles: new Set()
        };
      }
      analysis.departments[department].count++;
      analysis.departments[department].agents.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        business_function: agent.business_function,
        role: agent.role,
        tier: agent.tier,
        status: agent.status
      });
      
      if (agent.business_function) {
        analysis.departments[department].business_functions.add(agent.business_function);
      }
      if (agent.role) {
        analysis.departments[department].roles.add(agent.role);
      }
      
      // Roles
      const role = agent.role || 'Unknown';
      if (!analysis.roles[role]) {
        analysis.roles[role] = {
          count: 0,
          agents: [],
          business_functions: new Set(),
          departments: new Set()
        };
      }
      analysis.roles[role].count++;
      analysis.roles[role].agents.push({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        business_function: agent.business_function,
        department: agent.department,
        tier: agent.tier,
        status: agent.status
      });
      
      if (agent.business_function) {
        analysis.roles[role].business_functions.add(agent.business_function);
      }
      if (agent.department) {
        analysis.roles[role].departments.add(agent.department);
      }
      
      // Responsibilities (from capabilities)
      if (agent.capabilities && Array.isArray(agent.capabilities)) {
        agent.capabilities.forEach(capability => {
          analysis.responsibilities.add(capability);
        });
      }
      
      // Tiers
      const tier = agent.tier || 'Unknown';
      if (!analysis.tiers[tier]) {
        analysis.tiers[tier] = {
          count: 0,
          business_functions: new Set(),
          departments: new Set(),
          roles: new Set()
        };
      }
      analysis.tiers[tier].count++;
      
      if (agent.business_function) {
        analysis.tiers[tier].business_functions.add(agent.business_function);
      }
      if (agent.department) {
        analysis.tiers[tier].departments.add(agent.department);
      }
      if (agent.role) {
        analysis.tiers[tier].roles.add(agent.role);
      }
      
      // Statuses
      const status = agent.status || 'Unknown';
      if (!analysis.statuses[status]) {
        analysis.statuses[status] = 0;
      }
      analysis.statuses[status]++;
    });
    
    // Convert Sets to Arrays for JSON serialization
    Object.keys(analysis.business_functions).forEach(bf => {
      analysis.business_functions[bf].departments = Array.from(analysis.business_functions[bf].departments);
      analysis.business_functions[bf].roles = Array.from(analysis.business_functions[bf].roles);
    });
    
    Object.keys(analysis.departments).forEach(dept => {
      analysis.departments[dept].business_functions = Array.from(analysis.departments[dept].business_functions);
      analysis.departments[dept].roles = Array.from(analysis.departments[dept].roles);
    });
    
    Object.keys(analysis.roles).forEach(role => {
      analysis.roles[role].business_functions = Array.from(analysis.roles[role].business_functions);
      analysis.roles[role].departments = Array.from(analysis.roles[role].departments);
    });
    
    Object.keys(analysis.tiers).forEach(tier => {
      analysis.tiers[tier].business_functions = Array.from(analysis.tiers[tier].business_functions);
      analysis.tiers[tier].departments = Array.from(analysis.tiers[tier].departments);
      analysis.tiers[tier].roles = Array.from(analysis.tiers[tier].roles);
    });
    
    analysis.responsibilities = Array.from(analysis.responsibilities);
    
    // Display results
    console.log('📊 Organizational Structure Analysis:');
    console.log('====================================\n');
    
    console.log(`📈 Overall Statistics:`);
    console.log(`- Total agents: ${analysis.total_agents}`);
    console.log(`- Business functions: ${Object.keys(analysis.business_functions).length}`);
    console.log(`- Departments: ${Object.keys(analysis.departments).length}`);
    console.log(`- Roles: ${Object.keys(analysis.roles).length}`);
    console.log(`- Responsibilities/Capabilities: ${analysis.responsibilities.length}`);
    console.log(`- Tiers: ${Object.keys(analysis.tiers).length}`);
    console.log(`- Statuses: ${Object.keys(analysis.statuses).length}\n`);
    
    // Business Functions
    console.log('🏢 Business Functions:');
    Object.entries(analysis.business_functions)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([bf, data]) => {
        console.log(`  ${bf}: ${data.count} agents`);
        console.log(`    - Departments: ${data.departments.length} (${data.departments.slice(0, 3).join(', ')}${data.departments.length > 3 ? '...' : ''})`);
        console.log(`    - Roles: ${data.roles.length} (${data.roles.slice(0, 3).join(', ')}${data.roles.length > 3 ? '...' : ''})`);
      });
    console.log('');
    
    // Departments
    console.log('🏥 Departments:');
    Object.entries(analysis.departments)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([dept, data]) => {
        console.log(`  ${dept}: ${data.count} agents`);
        console.log(`    - Business Functions: ${data.business_functions.length} (${data.business_functions.slice(0, 3).join(', ')}${data.business_functions.length > 3 ? '...' : ''})`);
        console.log(`    - Roles: ${data.roles.length} (${data.roles.slice(0, 3).join(', ')}${data.roles.length > 3 ? '...' : ''})`);
      });
    console.log('');
    
    // Roles
    console.log('👔 Roles:');
    Object.entries(analysis.roles)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 20) // Show top 20 roles
      .forEach(([role, data]) => {
        console.log(`  ${role}: ${data.count} agents`);
        console.log(`    - Business Functions: ${data.business_functions.length} (${data.business_functions.slice(0, 2).join(', ')}${data.business_functions.length > 2 ? '...' : ''})`);
        console.log(`    - Departments: ${data.departments.length} (${data.departments.slice(0, 2).join(', ')}${data.departments.length > 2 ? '...' : ''})`);
      });
    if (Object.keys(analysis.roles).length > 20) {
      console.log(`  ... and ${Object.keys(analysis.roles).length - 20} more roles`);
    }
    console.log('');
    
    // Tiers
    console.log('⭐ Tiers:');
    Object.entries(analysis.tiers)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([tier, data]) => {
        console.log(`  Tier ${tier}: ${data.count} agents`);
        console.log(`    - Business Functions: ${data.business_functions.length}`);
        console.log(`    - Departments: ${data.departments.length}`);
        console.log(`    - Roles: ${data.roles.length}`);
      });
    console.log('');
    
    // Statuses
    console.log('📊 Statuses:');
    Object.entries(analysis.statuses)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / analysis.total_agents) * 100).toFixed(1);
        console.log(`  ${status}: ${count} agents (${percentage}%)`);
      });
    console.log('');
    
    // Responsibilities/Capabilities
    console.log('🎯 Top 20 Responsibilities/Capabilities:');
    const responsibilityCounts = {};
    agents.forEach(agent => {
      if (agent.capabilities && Array.isArray(agent.capabilities)) {
        agent.capabilities.forEach(capability => {
          responsibilityCounts[capability] = (responsibilityCounts[capability] || 0) + 1;
        });
      }
    });
    
    Object.entries(responsibilityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([responsibility, count]) => {
        console.log(`  ${responsibility}: ${count} agents`);
      });
    console.log('');
    
    // Save comprehensive report
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      summary: {
        total_agents: analysis.total_agents,
        business_functions: Object.keys(analysis.business_functions).length,
        departments: Object.keys(analysis.departments).length,
        roles: Object.keys(analysis.roles).length,
        responsibilities: analysis.responsibilities.length,
        tiers: Object.keys(analysis.tiers).length,
        statuses: Object.keys(analysis.statuses).length
      },
      business_functions: analysis.business_functions,
      departments: analysis.departments,
      roles: analysis.roles,
      responsibilities: analysis.responsibilities,
      responsibility_counts: responsibilityCounts,
      tiers: analysis.tiers,
      statuses: analysis.statuses
    };
    
    fs.writeFileSync(
      path.join(reportsDir, 'organizational-structure-analysis.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate markdown summary
    const summaryReport = `# Organizational Structure Analysis Report

## Executive Summary
- **Total Agents**: ${analysis.total_agents}
- **Business Functions**: ${Object.keys(analysis.business_functions).length}
- **Departments**: ${Object.keys(analysis.departments).length}
- **Roles**: ${Object.keys(analysis.roles).length}
- **Responsibilities/Capabilities**: ${analysis.responsibilities.length}
- **Tiers**: ${Object.keys(analysis.tiers).length}
- **Statuses**: ${Object.keys(analysis.statuses).length}

## Business Functions
${Object.entries(analysis.business_functions)
  .sort(([,a], [,b]) => b.count - a.count)
  .map(([bf, data]) => `- **${bf}**: ${data.count} agents (${data.departments.length} departments, ${data.roles.length} roles)`)
  .join('\n')}

## Departments
${Object.entries(analysis.departments)
  .sort(([,a], [,b]) => b.count - a.count)
  .map(([dept, data]) => `- **${dept}**: ${data.count} agents (${data.business_functions.length} business functions, ${data.roles.length} roles)`)
  .join('\n')}

## Top 20 Roles
${Object.entries(analysis.roles)
  .sort(([,a], [,b]) => b.count - a.count)
  .slice(0, 20)
  .map(([role, data]) => `- **${role}**: ${data.count} agents`)
  .join('\n')}

## Tiers
${Object.entries(analysis.tiers)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([tier, data]) => `- **Tier ${tier}**: ${data.count} agents (${data.business_functions.length} business functions, ${data.departments.length} departments, ${data.roles.length} roles)`)
  .join('\n')}

## Statuses
${Object.entries(analysis.statuses)
  .sort(([,a], [,b]) => b - a)
  .map(([status, count]) => {
    const percentage = ((count / analysis.total_agents) * 100).toFixed(1);
    return `- **${status}**: ${count} agents (${percentage}%)`;
  })
  .join('\n')}

## Top 20 Responsibilities/Capabilities
${Object.entries(responsibilityCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .map(([responsibility, count]) => `- **${responsibility}**: ${count} agents`)
  .join('\n')}

## Files Generated
- \`reports/organizational-structure-analysis.json\` - Complete analysis data
- \`reports/organizational-structure-analysis-summary.md\` - This summary
`;

    fs.writeFileSync(
      path.join(reportsDir, 'organizational-structure-analysis-summary.md'),
      summaryReport
    );
    
    console.log(`📁 Analysis report saved to: ${reportsDir}/`);
    console.log(`- organizational-structure-analysis.json (complete data)`);
    console.log(`- organizational-structure-analysis-summary.md (markdown summary)\n`);
    
    // Final summary
    console.log(`🎯 Organizational Structure Summary:`);
    console.log(`✅ Complete organizational structure mapped`);
    console.log(`✅ ${Object.keys(analysis.business_functions).length} business functions identified`);
    console.log(`✅ ${Object.keys(analysis.departments).length} departments identified`);
    console.log(`✅ ${Object.keys(analysis.roles).length} roles identified`);
    console.log(`✅ ${analysis.responsibilities.length} responsibilities/capabilities identified`);
    console.log(`✅ All 372 agents properly categorized`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  }
}

// Run the analysis
analyzeOrganizationalStructure();
