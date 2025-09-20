const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeKnowledgeData() {
  console.log('🔍 Analyzing Knowledge Data Structure...');

  try {
    // Get documents with metadata
    const { data: docs, error: docsError } = await supabase
      .from('knowledge_sources')
      .select('*');

    if (docsError) {
      console.error('Error:', docsError);
      return;
    }

    console.log('\n📊 Documents Analysis:');
    console.log('Total documents:', docs.length);

    // Categories analysis
    const categories = {};
    const domains = {};
    const sizes = [];
    let totalSize = 0;
    const today = new Date().toISOString().split('T')[0];
    let todayUploads = 0;

    docs.forEach(doc => {
      // Categories
      categories[doc.category] = (categories[doc.category] || 0) + 1;

      // Domains
      domains[doc.domain] = (domains[doc.domain] || 0) + 1;

      // Sizes
      sizes.push(doc.file_size);
      totalSize += doc.file_size;

      // Today's uploads
      if (doc.created_at.startsWith(today)) {
        todayUploads++;
      }

      console.log('\nDocument:', doc.name);
      console.log('- Category:', doc.category);
      console.log('- Domain:', doc.domain);
      console.log('- Size:', Math.round(doc.file_size / 1024), 'KB');
      console.log('- Tags:', doc.tags);
      console.log('- Created:', doc.created_at);
    });

    console.log('\n📈 Categories:', categories);
    console.log('📈 Domains:', domains);
    console.log('📈 Total Size:', Math.round(totalSize / 1024), 'KB');
    console.log('📈 Today\'s Uploads:', todayUploads);

    // Get chunks count
    const { count: chunksCount, error: chunksError } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });

    if (!chunksError) {
      console.log('📈 Total Chunks:', chunksCount);
    }

    // Get chunks by knowledge source
    const { data: chunksBySource, error: chunksBySourceError } = await supabase
      .from('document_chunks')
      .select('knowledge_source_id')
      .then(({ data }) => {
        const counts = {};
        data?.forEach(chunk => {
          counts[chunk.knowledge_source_id] = (counts[chunk.knowledge_source_id] || 0) + 1;
        });
        return { data: counts };
      });

    console.log('\n📈 Chunks by Document:', chunksBySource?.data || {});

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

analyzeKnowledgeData();