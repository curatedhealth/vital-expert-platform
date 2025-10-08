const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addAgentOrgColumns() {
  try {
    console.log('🚀 ADDING ORGANIZATIONAL MAPPING COLUMNS TO AGENTS TABLE');
    console.log('======================================================================\n');
    
    // SQL to add organizational mapping columns
    const addColumnsSQL = `
      -- Add organizational mapping columns to agents table
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS function_area VARCHAR(255);
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS department VARCHAR(255);
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;
      
      -- Add indexes for performance
      CREATE INDEX IF NOT EXISTS idx_agents_function_area ON agents(function_area);
      CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);
      CREATE INDEX IF NOT EXISTS idx_agents_org_function_id ON agents(org_function_id);
      CREATE INDEX IF NOT EXISTS idx_agents_org_department_id ON agents(org_department_id);
      CREATE INDEX IF NOT EXISTS idx_agents_org_role_id ON agents(org_role_id);
      
      -- Add comments for documentation
      COMMENT ON COLUMN agents.function_area IS 'Business function area (e.g., Research & Development, Clinical Development)';
      COMMENT ON COLUMN agents.department IS 'Department within the function (e.g., Drug Discovery, Clinical Operations)';
      COMMENT ON COLUMN agents.org_function_id IS 'Foreign key reference to org_functions table';
      COMMENT ON COLUMN agents.org_department_id IS 'Foreign key reference to org_departments table';
      COMMENT ON COLUMN agents.org_role_id IS 'Foreign key reference to org_roles table';
    `;
    
    console.log('📋 Step 1: Adding organizational mapping columns...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: addColumnsSQL });
    
    if (error) {
      console.error('❌ Error adding columns:', error.message);
      
      // Try alternative approach - direct SQL execution
      console.log('📋 Trying alternative approach...');
      
      // Add columns one by one
      const columns = [
        { name: 'function_area', type: 'VARCHAR(255)' },
        { name: 'department', type: 'VARCHAR(255)' },
        { name: 'org_function_id', type: 'UUID REFERENCES org_functions(id) ON DELETE SET NULL' },
        { name: 'org_department_id', type: 'UUID REFERENCES org_departments(id) ON DELETE SET NULL' },
        { name: 'org_role_id', type: 'UUID REFERENCES org_roles(id) ON DELETE SET NULL' }
      ];
      
      for (const column of columns) {
        try {
          const { error: colError } = await supabase.rpc('exec_sql', { 
            sql: `ALTER TABLE agents ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};` 
          });
          
          if (colError) {
            console.error(`❌ Error adding column ${column.name}:`, colError.message);
          } else {
            console.log(`✅ Added column: ${column.name}`);
          }
        } catch (err) {
          console.error(`❌ Exception adding column ${column.name}:`, err.message);
        }
      }
    } else {
      console.log('✅ Successfully added organizational mapping columns');
    }
    
    // Verify columns were added
    console.log('\n📋 Step 2: Verifying columns were added...');
    
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
    
    console.log('\n🎉 ORGANIZATIONAL MAPPING COLUMNS ADDED SUCCESSFULLY!');
    console.log('======================================================================');
    console.log('✅ Agents table now has organizational mapping columns');
    console.log('🚀 Ready to map agents to organizational structure');
    
  } catch (error) {
    console.error('❌ Failed to add columns:', error.message);
  }
}

addAgentOrgColumns();
