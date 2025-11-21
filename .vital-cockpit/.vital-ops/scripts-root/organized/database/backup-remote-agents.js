const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzU5NzI0MSwiZXhwIjoyMDQzMTczMjQxfQ.L2k6xgN3-BaI6L9t5PjdFZH_8hIWgP2rqEKjGgV3ZEI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupRemoteAgents() {
  console.log('🔄 Backing up current remote agents...\n');

  try {
    // Get all agents from remote
    const { data: agents, error, count } = await supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching agents:', error);
      return;
    }

    console.log(`✅ Fetched ${count} agents from remote Supabase\n`);

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../database/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = path.join(backupDir, `remote_agents_backup_${timestamp}.json`);

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify({
      backup_date: new Date().toISOString(),
      source: 'remote_supabase',
      url: supabaseUrl,
      agent_count: count,
      agents: agents
    }, null, 2));

    console.log(`✅ Backup saved to: ${backupFile}`);
    console.log(`📊 Backed up ${count} agents`);

    // Also create a simple SQL format for easy restoration
    const sqlBackupFile = path.join(backupDir, `remote_agents_backup_${timestamp}.sql`);
    let sqlContent = `-- Remote Supabase Agents Backup\n`;
    sqlContent += `-- Date: ${new Date().toISOString()}\n`;
    sqlContent += `-- Source: ${supabaseUrl}\n`;
    sqlContent += `-- Agent Count: ${count}\n\n`;

    if (agents && agents.length > 0) {
      sqlContent += `-- Backup of current 3 agents (before restoration)\n\n`;
      agents.forEach(agent => {
        sqlContent += `-- Agent: ${agent.name}\n`;
        sqlContent += `INSERT INTO agents (id, name, description, system_prompt, model, temperature, max_tokens, is_active, created_at, updated_at)\n`;
        sqlContent += `VALUES (\n`;
        sqlContent += `  '${agent.id}',\n`;
        sqlContent += `  '${agent.name.replace(/'/g, "''")}',\n`;
        sqlContent += `  '${(agent.description || '').replace(/'/g, "''")}',\n`;
        sqlContent += `  '${(agent.system_prompt || '').replace(/'/g, "''")}',\n`;
        sqlContent += `  '${agent.model}',\n`;
        sqlContent += `  ${agent.temperature || 0.7},\n`;
        sqlContent += `  ${agent.max_tokens || 2000},\n`;
        sqlContent += `  ${agent.is_active || true},\n`;
        sqlContent += `  '${agent.created_at}',\n`;
        sqlContent += `  '${agent.updated_at}'\n`;
        sqlContent += `);\n\n`;
      });
    }

    fs.writeFileSync(sqlBackupFile, sqlContent);
    console.log(`✅ SQL backup saved to: ${sqlBackupFile}\n`);

    console.log('═'.repeat(80));
    console.log('✅ BACKUP COMPLETE');
    console.log('═'.repeat(80));

  } catch (err) {
    console.error('❌ Backup failed:', err);
  }
}

backupRemoteAgents();
