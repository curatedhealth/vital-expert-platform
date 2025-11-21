const fs = require('fs');
const path = require('path');

// Read the backup file
const backupPath = '/Users/hichamnaim/Downloads/Cursor/VITAL path/database/backups/agents_20251006_134706.sql';
const content = fs.readFileSync(backupPath, 'utf8');

// Extract the COPY section
const lines = content.split('\n');
const copyStart = lines.findIndex(line => line.startsWith('COPY public.agents'));
const copyEnd = lines.findIndex((line, index) => index > copyStart && line.startsWith('\\.'));

if (copyStart === -1 || copyEnd === -1) {
  console.log('Could not find COPY section');
  process.exit(1);
}

// Extract agent data lines
const agentLines = lines.slice(copyStart + 1, copyEnd);
console.log('Found', agentLines.length, 'agent lines');

// Parse the header to get column names
const headerLine = lines[copyStart];
const columns = headerLine.match(/COPY public\.agents \((.*?)\) FROM stdin;/)[1].split(', ');

console.log('Columns:', columns.length);

// Convert agent data to JSON format
const agents = [];

agentLines.forEach((line, index) => {
  if (line.trim()) {
    const values = line.split('\t');
    
    const agent = {};
    columns.forEach((col, colIndex) => {
      if (values[colIndex] && values[colIndex] !== '\\N') {
        let value = values[colIndex];
        
        // Parse arrays and objects
        if (typeof value === 'string') {
          if (value.startsWith('{') && value.endsWith('}')) {
            try {
              value = JSON.parse(value.replace(/'/g, '"'));
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
        }
        
        agent[col] = value;
      }
    });
    
    agents.push(agent);
  }
});

console.log('Converted', agents.length, 'agents to JSON format');

// Create a simplified version for the API
const simplifiedAgents = agents.map(agent => ({
  id: agent.id,
  name: agent.name,
  display_name: agent.display_name,
  description: agent.description,
  avatar: agent.avatar,
  color: agent.color,
  model: agent.model,
  system_prompt: agent.system_prompt,
  temperature: agent.temperature,
  max_tokens: agent.max_tokens,
  capabilities: agent.capabilities,
  knowledge_domains: agent.knowledge_domains,
  business_function: agent.business_function,
  role: agent.role,
  tier: agent.tier,
  status: agent.status,
  department: agent.department,
  is_custom: agent.is_custom,
  is_public: agent.is_public,
  created_at: agent.created_at,
  updated_at: agent.updated_at
}));

// Save the comprehensive agents data
fs.writeFileSync(
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/agents-comprehensive.json',
  JSON.stringify(simplifiedAgents, null, 2)
);

console.log('Saved comprehensive agents data to data/agents-comprehensive.json');
console.log('Total agents:', simplifiedAgents.length);

// Also create a summary
const summary = {
  total_agents: simplifiedAgents.length,
  by_tier: {},
  by_status: {},
  by_business_function: {},
  by_department: {}
};

simplifiedAgents.forEach(agent => {
  // Count by tier
  const tier = agent.tier || 'unknown';
  summary.by_tier[tier] = (summary.by_tier[tier] || 0) + 1;
  
  // Count by status
  const status = agent.status || 'unknown';
  summary.by_status[status] = (summary.by_status[status] || 0) + 1;
  
  // Count by business function
  const bf = agent.business_function || 'unknown';
  summary.by_business_function[bf] = (summary.by_business_function[bf] || 0) + 1;
  
  // Count by department
  const dept = agent.department || 'unknown';
  summary.by_department[dept] = (summary.by_department[dept] || 0) + 1;
});

fs.writeFileSync(
  '/Users/hichamnaim/Downloads/Cursor/VITAL path/data/agents-summary.json',
  JSON.stringify(summary, null, 2)
);

console.log('Saved agents summary to data/agents-summary.json');
console.log('Summary:', summary);
