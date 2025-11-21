const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findVectorDocuments() {
  console.log('🔍 Looking for actual vector database documents...');

  try {
    // Check for vector-related tables that might contain your uploaded documents
    const possibleVectorTables = [
      'documents', // Standard documents table
      'vector_documents',
      'embeddings',
      'document_embeddings',
      'langchain_pg_collection',
      'langchain_pg_embedding',
      'vecs', // Supabase vector extension
      'chunks',
      'document_chunks',
      'knowledge_chunks'
    ];

    console.log('\n📊 Checking vector/document tables:');

    for (const tableName of possibleVectorTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          console.log(`✅ ${tableName}: ${count} records`);

          if (count > 0) {
            // Get sample data
            const { data } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);

            if (data && data.length > 0) {
              console.log(`   📝 Sample columns: ${Object.keys(data[0]).join(', ')}`);
              console.log(`   📄 Sample record:`, data[0]);
            }
          }
        } else if (error && !error.message.includes('does not exist')) {
          console.log(`⚠️  ${tableName}: ${error.message}`);
        } else {
          console.log(`❌ ${tableName}: Table not found`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Access error`);
      }
    }

    // Check if documents table has the actual uploaded documents
    console.log('\n🔍 Detailed check of documents table:');
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(5);

    if (!docsError && docs) {
      console.log(`Found ${docs.length} documents:`);
      docs.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name || doc.file_name || doc.title || 'Untitled'}`);
        console.log(`   Type: ${doc.document_type || doc.file_type || 'unknown'}`);
        console.log(`   Status: ${doc.processing_status || doc.status || 'unknown'}`);
        console.log(`   Size: ${doc.file_size || 'unknown'}`);
        console.log(`   Created: ${doc.created_at || doc.uploaded_at}`);
        console.log('');
      });
    } else {
      console.log('No documents found or error:', docsError);
    }

    // Check for langchain tables (common for vector DBs)
    console.log('\n🔗 Checking for LangChain vector tables:');
    try {
      const { data: collections } = await supabase
        .from('langchain_pg_collection')
        .select('*')
        .limit(3);

      if (collections && collections.length > 0) {
        console.log('LangChain collections found:', collections.map(c => c.name || c.collection_name));
      }
    } catch (err) {
      console.log('No LangChain tables found');
    }

  } catch (error) {
    console.error('❌ Error searching for vector documents:', error);
  }
}

findVectorDocuments().catch(console.error);