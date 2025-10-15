#!/usr/bin/env node

/**
 * Debug Agent Data Script
 * 
 * This script fetches and examines the actual agent data structure
 * to understand how avatars are stored and assigned.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VITAL Path - Debug Agent Data');
console.log('================================\n');

async function debugAgentData() {
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
    
    // Examine first 10 agents
    console.log('📋 Sample Agent Data (first 10):');
    console.log('================================\n');
    
    agents.slice(0, 10).forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.display_name || agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Avatar: ${agent.avatar}`);
      console.log(`   Business Function: ${agent.business_function}`);
      console.log(`   Department: ${agent.department}`);
      console.log(`   Tier: ${agent.tier}`);
      console.log(`   Status: ${agent.status}`);
      console.log('');
    });
    
    // Analyze avatar patterns
    console.log('🎭 Avatar Analysis:');
    console.log('==================\n');
    
    const avatarPatterns = {};
    const avatarTypes = {
      emoji: 0,
      png: 0,
      svg: 0,
      supabase: 0,
      local: 0,
      other: 0,
      empty: 0
    };
    
    agents.forEach(agent => {
      const avatar = agent.avatar;
      
      if (!avatar || avatar === '🤖' || avatar === '') {
        avatarTypes.empty++;
      } else if (avatar.match(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
        avatarTypes.emoji++;
      } else if (avatar.includes('.png')) {
        avatarTypes.png++;
        const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
        avatarPatterns[filename] = (avatarPatterns[filename] || 0) + 1;
      } else if (avatar.includes('.svg')) {
        avatarTypes.svg++;
        const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
        avatarPatterns[filename] = (avatarPatterns[filename] || 0) + 1;
      } else if (avatar.includes('supabase.co/storage')) {
        avatarTypes.supabase++;
        const filename = avatar.split('/').pop();
        avatarPatterns[filename] = (avatarPatterns[filename] || 0) + 1;
      } else if (avatar.includes('/icons/') || avatar.startsWith('/')) {
        avatarTypes.local++;
        const filename = avatar.includes('/') ? avatar.split('/').pop() : avatar;
        avatarPatterns[filename] = (avatarPatterns[filename] || 0) + 1;
      } else {
        avatarTypes.other++;
        avatarPatterns[avatar] = (avatarPatterns[avatar] || 0) + 1;
      }
    });
    
    console.log('Avatar Type Distribution:');
    Object.entries(avatarTypes).forEach(([type, count]) => {
      const percentage = ((count / agents.length) * 100).toFixed(1);
      console.log(`  ${type}: ${count} agents (${percentage}%)`);
    });
    console.log('');
    
    console.log('Top 20 Avatar Patterns:');
    Object.entries(avatarPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([pattern, count], index) => {
        console.log(`  ${index + 1}. ${pattern}: ${count} uses`);
      });
    console.log('');
    
    // Show unique avatars count
    const uniqueAvatars = Object.keys(avatarPatterns).length;
    console.log(`📊 Summary:`);
    console.log(`- Total agents: ${agents.length}`);
    console.log(`- Unique avatars: ${uniqueAvatars}`);
    console.log(`- Most used avatar: ${Object.entries(avatarPatterns).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}`);
    console.log(`- Max uses per avatar: ${Math.max(...Object.values(avatarPatterns))}`);
    console.log('');
    
    // Save debug data
    const debugData = {
      total_agents: agents.length,
      avatar_types: avatarTypes,
      avatar_patterns: avatarPatterns,
      unique_avatars: uniqueAvatars,
      sample_agents: agents.slice(0, 10).map(agent => ({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        avatar: agent.avatar,
        business_function: agent.business_function,
        department: agent.department,
        tier: agent.tier,
        status: agent.status
      }))
    };
    
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportsDir, 'debug-agent-data.json'),
      JSON.stringify(debugData, null, 2)
    );
    
    console.log(`📁 Debug data saved to: ${reportsDir}/debug-agent-data.json`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugAgentData();
