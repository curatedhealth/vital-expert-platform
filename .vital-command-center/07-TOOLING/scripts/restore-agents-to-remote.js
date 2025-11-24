const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzU5NzI0MSwiZXhwIjoyMDQzMTczMjQxfQ.L2k6xgN3-BaI6L9t5PjdFZH_8hIWgP2rqEKjGgV3ZEI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAgentsToRemote() {
  console.log('🚀 AGENT RESTORATION TO REMOTE SUPABASE');
  console.log('═'.repeat(80));
  console.log(`Target: ${supabaseUrl}`);
  console.log(`Source: Local backup (Oct 6, 2025)`);
  console.log('═'.repeat(80), '\n');

  try {
    // Step 1: Parse the local backup SQL file
    console.log('📂 Step 1: Reading local backup file...');
    const backupFile = path.join(__dirname, '../database/backups/agents_20251006_134706.sql');

    if (!fs.existsSync(backupFile)) {
      console.error('❌ Backup file not found:', backupFile);
      return;
    }

    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    console.log(`✅ Backup file loaded (${sqlContent.length} bytes)\n`);

    // Step 2: Extract agent data from COPY statement
    console.log('🔍 Step 2: Parsing agent data from backup...');

    const copyMatch = sqlContent.match(/COPY public\.agents \((.*?)\) FROM stdin;([\s\S]*?)\\\./);

    if (!copyMatch) {
      console.error('❌ Could not find COPY statement in backup file');
      return;
    }

    const columns = copyMatch[1].split(', ');
    const dataLines = copyMatch[2].trim().split('\n').filter(line => line.trim() && !line.startsWith('--'));

    console.log(`✅ Found ${dataLines.length} agents in backup`);
    console.log(`✅ Columns: ${columns.length} fields\n`);

    // Step 3: Delete existing agents from remote
    console.log('🗑️  Step 3: Deleting existing 3 agents from remote...');
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (impossible UUID)

    if (deleteError) {
      console.error('❌ Error deleting existing agents:', deleteError);
      return;
    }
    console.log('✅ Existing agents deleted\n');

    // Step 4: Parse and prepare agent records
    console.log('🔄 Step 4: Parsing agent records...');
    const agents = [];
    let parseErrors = 0;

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const line = dataLines[i];
        const values = line.split('\t');

        if (values.length !== columns.length) {
          console.warn(`⚠️  Line ${i + 1}: Column count mismatch (${values.length} vs ${columns.length})`);
          parseErrors++;
          continue;
        }

        const agent = {};
        columns.forEach((col, idx) => {
          let value = values[idx];

          // Handle NULL values
          if (value === '\\N') {
            agent[col] = null;
          }
          // Handle boolean
          else if (value === 't' || value === 'f') {
            agent[col] = value === 't';
          }
          // Handle arrays
          else if (value.startsWith('{') && value.endsWith('}')) {
            const arrayContent = value.slice(1, -1);
            agent[col] = arrayContent ? arrayContent.split(',').map(v => v.replace(/^"|"$/g, '')) : [];
          }
          // Handle JSON
          else if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
            try {
              agent[col] = JSON.parse(value);
            } catch {
              agent[col] = value;
            }
          }
          // Handle numbers
          else if (!isNaN(value) && value !== '') {
            agent[col] = parseFloat(value);
          }
          // Handle strings
          else {
            agent[col] = value;
          }
        });

        agents.push(agent);
      } catch (err) {
        console.error(`❌ Error parsing line ${i + 1}:`, err.message);
        parseErrors++;
      }
    }

    console.log(`✅ Parsed ${agents.length} agents successfully`);
    if (parseErrors > 0) {
      console.log(`⚠️  ${parseErrors} parsing errors\n`);
    } else {
      console.log('');
    }

    // Step 5: Insert agents in batches
    console.log('📤 Step 5: Uploading agents to remote Supabase...');
    const batchSize = 50;
    let uploaded = 0;
    let errors = 0;

    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('agents')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error);
        errors += batch.length;
      } else {
        uploaded += data.length;
        process.stdout.write(`\r   Uploaded: ${uploaded}/${agents.length} agents`);
      }
    }

    console.log('\n');

    // Step 6: Verify final count
    console.log('✅ Step 6: Verifying restoration...');
    const { count, error: countError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting agents:', countError);
    } else {
      console.log(`✅ Remote agent count: ${count}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ RESTORATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`📊 Summary:`);
    console.log(`   • Agents in backup: ${dataLines.length}`);
    console.log(`   • Successfully parsed: ${agents.length}`);
    console.log(`   • Successfully uploaded: ${uploaded}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Final count in remote: ${count}`);
    console.log('═'.repeat(80), '\n');

  } catch (err) {
    console.error('❌ Restoration failed:', err);
  }
}

restoreAgentsToRemote();
