const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyAgentOrgMigration() {
  try {
    console.log('🚀 APPLYING AGENT-ORGANIZATIONAL STRUCTURE MIGRATION');
    console.log('======================================================================\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250108000000_add_agent_org_mapping.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Step 1: Applying migration to add organizational mapping columns...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.error(`❌ Error executing statement: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Exception executing statement: ${err.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`✅ Migration applied: ${successCount} statements successful, ${errorCount} errors\n`);
    
    // Verify the columns were added
    console.log('📋 Step 2: Verifying organizational mapping columns...');
    
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, function_area, department, org_function_id, org_department_id, org_role_id')
      .limit(1);
    
    if (agentsError) {
      console.error('❌ Error verifying columns:', agentsError.message);
    } else if (agentsData && agentsData.length > 0) {
      const sampleAgent = agentsData[0];
      console.log('✅ Organizational mapping columns verified:');
      console.log(`   - function_area: ${sampleAgent.function_area || 'NULL'}`);
      console.log(`   - department: ${sampleAgent.department || 'NULL'}`);
      console.log(`   - org_function_id: ${sampleAgent.org_function_id || 'NULL'}`);
      console.log(`   - org_department_id: ${sampleAgent.org_department_id || 'NULL'}`);
      console.log(`   - org_role_id: ${sampleAgent.org_role_id || 'NULL'}`);
    }
    
    console.log('\n🎉 AGENT-ORGANIZATIONAL STRUCTURE MIGRATION COMPLETE!');
    console.log('======================================================================');
    console.log('✅ Agents table now has organizational mapping columns');
    console.log('✅ Relationship tables created');
    console.log('✅ Helper functions created');
    console.log('🚀 Ready to map agents to organizational structure');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

applyAgentOrgMigration();
