const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzU5NzI0MSwiZXhwIjoyMDQzMTczMjQxfQ.L2k6xgN3-BaI6L9t5PjdFZH_8hIWgP2rqEKjGgV3ZEI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Remote schema has only these 24 columns (from previous check)
const REMOTE_COLUMNS = [
  'id', 'name', 'description', 'system_prompt', 'model',
  'temperature', 'max_tokens', 'is_active', 'created_by',
  'created_at', 'updated_at', 'slug', 'title', 'expertise',
  'specialties', 'background', 'personality_traits', 'communication_style',
  'capabilities', 'avatar_url', 'popularity_score', 'rating',
  'total_consultations', 'metadata'
];

async function restoreAgentsSmartly() {
  console.log('🚀 SMART AGENT RESTORATION TO REMOTE SUPABASE');
  console.log('═'.repeat(80));
  console.log(`Target: ${supabaseUrl}`);
  console.log(`Source: Local backup (Oct 6, 2025)`);
  console.log(`Strategy: Map only matching columns`);
  console.log('═'.repeat(80), '\n');

  try {
    // Step 1: Read backup file
    console.log('📂 Step 1: Reading local backup file...');
    const backupFile = path.join(__dirname, '../database/backups/agents_20251006_134706.sql');
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    console.log(`✅ Backup file loaded\n`);

    // Step 2: Parse COPY statement
    console.log('🔍 Step 2: Parsing backup data...');
    const copyMatch = sqlContent.match(/COPY public\.agents \((.*?)\) FROM stdin;([\s\S]*?)\\\./);

    if (!copyMatch) {
      console.error('❌ Could not find COPY statement');
      return;
    }

    const backupColumns = copyMatch[1].split(', ');
    const dataLines = copyMatch[2].trim().split('\n').filter(line => line.trim() && !line.startsWith('--'));

    console.log(`✅ Found ${dataLines.length} agents in backup`);
    console.log(`✅ Backup has ${backupColumns.length} columns`);
    console.log(`✅ Remote has ${REMOTE_COLUMNS.length} columns\n`);

    // Step 3: Create column mapping
    console.log('🗺️  Step 3: Creating column mapping...');
    const columnMap = {};
    const mappedColumns = [];

    backupColumns.forEach((col, idx) => {
      if (REMOTE_COLUMNS.includes(col)) {
        columnMap[col] = idx;
        mappedColumns.push(col);
      }
    });

    console.log(`✅ Mapped ${mappedColumns.length} matching columns:`);
    console.log(`   ${mappedColumns.join(', ')}\n`);

    // Step 4: Parse agents with column mapping
    console.log('🔄 Step 4: Parsing agents (only mapped columns)...');
    const agents = [];

    for (const line of dataLines) {
      const values = line.split('\t');
      const agent = {};

      mappedColumns.forEach(col => {
        const idx = columnMap[col];
        let value = values[idx];

        // Handle NULL
        if (value === '\\N' || value === undefined) {
          agent[col] = null;
        }
        // Handle boolean
        else if (value === 't' || value === 'f') {
          agent[col] = value === 't';
        }
        // Handle arrays
        else if (value && value.startsWith('{') && value.endsWith('}')) {
          const arrayContent = value.slice(1, -1);
          agent[col] = arrayContent ? arrayContent.split(',').map(v => v.replace(/^"|"$/g, '').trim()) : [];
        }
        // Handle JSON
        else if (value && ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']')))) {
          try {
            agent[col] = JSON.parse(value);
          } catch {
            agent[col] = value;
          }
        }
        // Handle numbers
        else if (col === 'temperature' || col === 'max_tokens' || col === 'popularity_score' || col === 'rating' || col === 'total_consultations') {
          agent[col] = value && !isNaN(value) ? parseFloat(value) : null;
        }
        // Strings
        else {
          agent[col] = value || null;
        }
      });

      agents.push(agent);
    }

    console.log(`✅ Parsed ${agents.length} agents\n`);

    // Step 5: Delete existing agents
    console.log('🗑️  Step 5: Clearing remote agents table...');
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return;
    }
    console.log('✅ Table cleared\n');

    // Step 6: Insert in batches
    console.log('📤 Step 6: Uploading agents to remote...');
    const batchSize = 25;
    let uploaded = 0;

    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('agents')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        // Show first failing record for debugging
        console.error('   First record:', JSON.stringify(batch[0], null, 2).substring(0, 500));
        break;
      } else {
        uploaded += data.length;
        process.stdout.write(`\r   Progress: ${uploaded}/${agents.length} agents (${Math.round(uploaded/agents.length*100)}%)`);
      }
    }

    console.log('\n');

    // Step 7: Verify
    console.log('✅ Step 7: Verifying...');
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Final count: ${count} agents in remote\n`);

    console.log('═'.repeat(80));
    console.log('✅ RESTORATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`📊 Summary:`);
    console.log(`   • Agents in backup: ${dataLines.length}`);
    console.log(`   • Successfully uploaded: ${uploaded}`);
    console.log(`   • Final count: ${count}`);
    console.log(`   • Success rate: ${Math.round(uploaded/dataLines.length*100)}%`);
    console.log('═'.repeat(80), '\n');

  } catch (err) {
    console.error('❌ Restoration failed:', err);
  }
}

restoreAgentsSmartly();
