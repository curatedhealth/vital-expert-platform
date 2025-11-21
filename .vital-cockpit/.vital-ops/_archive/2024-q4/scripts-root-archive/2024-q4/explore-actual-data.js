const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exploreDatabase() {
  console.log('🔍 Exploring actual database content...');

  // Check different possible table names for documents/knowledge
  const possibleTables = [
    'knowledge_base',
    'documents',
    'knowledge_documents',
    'document_store',
    'files',
    'uploads'
  ];

  for (const tableName of possibleTables) {
    try {
      console.log(`\n📋 Checking table: ${tableName}`);

      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(3);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Found ${count} records`);

        if (data && data.length > 0) {
          console.log(`   📄 Columns:`, Object.keys(data[0]));
          console.log(`   📝 Sample record:`, data[0]);
        }
      }
    } catch (err) {
      console.log(`   ❌ Cannot access table: ${tableName}`);
    }
  }

  // Also check for any tables with 'knowledge' or 'document' in the name
  console.log('\n🔍 Looking for tables that might contain knowledge/document data...');

  // Try to find tables with content
  const tablesWithContent = ['agents', 'prompts', 'capabilities'];

  for (const tableName of tablesWithContent) {
    try {
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (count > 0) {
        console.log(`📊 ${tableName}: ${count} records`);

        // Get sample data
        const { data } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      // Table doesn't exist, skip
    }
  }
}

exploreDatabase().catch(console.error);