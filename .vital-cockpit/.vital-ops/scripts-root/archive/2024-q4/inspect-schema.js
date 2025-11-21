const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  console.log('🔍 Inspecting database schema...');

  try {
    // Try to get the table structure by doing a select with limit 0
    // This will show us what columns exist
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Error querying knowledge_base:', error);
    } else {
      console.log('✅ knowledge_base table exists and is accessible');
    }

    // Check what tables exist
    const { data: tables } = await supabase
      .rpc('get_tables')
      .catch(() => {
        console.log('📝 Cannot use get_tables RPC, trying alternative method...');
        return { data: null };
      });

    if (tables) {
      console.log('📋 Available tables:', tables);
    }

    // Try to query the information schema if accessible
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'knowledge_base')
      .catch(() => {
        console.log('📝 Cannot access information_schema');
        return { data: null };
      });

    if (columns) {
      console.log('🏗️  knowledge_base columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // Let's try different table names that might exist
    const possibleTables = ['knowledge_documents', 'documents', 'knowledge', 'document_store'];

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
          if (data && data.length > 0) {
            console.log(`📄 Sample columns in ${tableName}:`, Object.keys(data[0]));
          } else {
            console.log(`📄 Table ${tableName} exists but is empty`);
          }
        }
      } catch (err) {
        console.log(`❌ Table ${tableName} does not exist or is not accessible`);
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

inspectSchema().catch(console.error);