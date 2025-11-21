#!/usr/bin/env node

/**
 * Map Tools to Agents Based on Capabilities
 * This script assigns appropriate tools to each agent based on their capabilities
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Available tools from tool-registry.ts
const AVAILABLE_TOOLS = [
  'Web Search',
  'Document Analysis',
  'Data Calculator',
  'Regulatory Database Search',
  'Literature Search',
  'Statistical Analysis',
  'Timeline Generator',
  'Budget Calculator',
  'Risk Assessment Matrix',
  'Compliance Checker',
  'Citation Generator',
  'Template Generator',
  'Clinical Trials Search',
  'Study Design',
  'Endpoint Selection',
];

/**
 * Map agent capabilities to appropriate tools
 */
function mapToolsForAgent(agent) {
  const tools = [];
  const capabilities = agent.capabilities || [];
  const knowledgeDomains = agent.knowledge_domains || [];
  const name = agent.name.toLowerCase();
  const displayName = (agent.display_name || '').toLowerCase();

  // === CORE TOOLS (most agents need these) ===
  tools.push('Web Search');

  // === REGULATORY & COMPLIANCE TOOLS ===
  if (
    capabilities.some(cap => cap.includes('regulatory') || cap.includes('compliance')) ||
    knowledgeDomains.some(d => d.includes('regulatory') || d.includes('compliance')) ||
    name.includes('regulatory') || name.includes('compliance') ||
    displayName.includes('regulatory') || displayName.includes('compliance')
  ) {
    tools.push('Regulatory Database Search');
    tools.push('Compliance Checker');
  }

  // === CLINICAL TRIALS TOOLS ===
  if (
    capabilities.some(cap => cap.includes('trial') || cap.includes('clinical_research')) ||
    knowledgeDomains.some(d => d.includes('clinical') || d.includes('trial')) ||
    name.includes('trial') || name.includes('clinical') ||
    displayName.includes('trial') || displayName.includes('clinical')
  ) {
    tools.push('Clinical Trials Search');
    tools.push('Study Design');
    tools.push('Endpoint Selection');
    tools.push('Literature Search');
  }

  // === RESEARCH & LITERATURE TOOLS ===
  if (
    capabilities.some(cap => cap.includes('research') || cap.includes('literature') || cap.includes('scientific')) ||
    knowledgeDomains.some(d => d.includes('research') || d.includes('scientific') || d.includes('medical_affairs')) ||
    name.includes('research') || name.includes('scientific') ||
    displayName.includes('research') || displayName.includes('scientific')
  ) {
    tools.push('Literature Search');
    tools.push('Citation Generator');
  }

  // === CALCULATION & ANALYSIS TOOLS ===
  if (
    capabilities.some(cap => cap.includes('calculation') || cap.includes('dosing') || cap.includes('analysis') || cap.includes('statistical')) ||
    name.includes('calculator') || name.includes('dosing') || name.includes('analysis') ||
    displayName.includes('calculator') || displayName.includes('dosing') || displayName.includes('analysis')
  ) {
    tools.push('Data Calculator');
    if (capabilities.some(cap => cap.includes('statistical'))) {
      tools.push('Statistical Analysis');
    }
  }

  // === PROJECT MANAGEMENT TOOLS ===
  if (
    capabilities.some(cap => cap.includes('project') || cap.includes('planning') || cap.includes('timeline')) ||
    name.includes('project') || name.includes('planning') || name.includes('manager') ||
    displayName.includes('project') || displayName.includes('planning') || displayName.includes('manager')
  ) {
    tools.push('Timeline Generator');
    tools.push('Risk Assessment Matrix');
  }

  // === BUDGET & FINANCIAL TOOLS ===
  if (
    capabilities.some(cap => cap.includes('budget') || cap.includes('financial') || cap.includes('cost')) ||
    name.includes('budget') || name.includes('financial') || name.includes('reimbursement') ||
    displayName.includes('budget') || displayName.includes('financial') || displayName.includes('reimbursement')
  ) {
    tools.push('Budget Calculator');
  }

  // === DOCUMENT TOOLS ===
  if (
    capabilities.some(cap => cap.includes('document') || cap.includes('template') || cap.includes('writing')) ||
    name.includes('writer') || name.includes('document') || name.includes('template') ||
    displayName.includes('writer') || displayName.includes('document') || displayName.includes('template')
  ) {
    tools.push('Document Analysis');
    tools.push('Template Generator');
  }

  // Remove duplicates and return
  return [...new Set(tools)];
}

async function mapToolsToAgents() {
  console.log('🔧 Mapping Tools to Agents Based on Capabilities...\n');

  try {
    // Fetch all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, display_name, capabilities, knowledge_domains, tools')
      .eq('status', 'active');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      return;
    }

    console.log(`📊 Found ${agents.length} active agents\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each agent
    for (const agent of agents) {
      const assignedTools = mapToolsForAgent(agent);

      // Update agent with tools
      const { error: updateError } = await supabase
        .from('agents')
        .update({ tools: assignedTools })
        .eq('id', agent.id);

      if (updateError) {
        errorCount++;
        console.error(`❌ Failed to update ${agent.display_name}:`, updateError.message);
      } else {
        successCount++;
        console.log(`✅ ${agent.display_name}: ${assignedTools.length} tools (${assignedTools.slice(0, 3).join(', ')}${assignedTools.length > 3 ? '...' : ''})`);
      }
    }

    console.log('\n📊 Mapping Summary:');
    console.log(`✅ Successfully mapped: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    // Show tool usage statistics
    console.log('\n📈 Tool Usage Statistics:');
    const toolCounts = {};

    const { data: updatedAgents } = await supabase
      .from('agents')
      .select('tools')
      .eq('status', 'active');

    updatedAgents.forEach(agent => {
      (agent.tools || []).forEach(tool => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    });

    Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tool, count]) => {
        console.log(`  ${tool}: ${count} agents`);
      });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

mapToolsToAgents();
