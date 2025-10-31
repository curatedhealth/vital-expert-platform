/**
 * Sync Supabase Embeddings to Pinecone
 *
 * This script syncs all existing document chunks from Supabase to Pinecone.
 * Run this once when migrating from Supabase pgvector to Pinecone.
 *
 * Usage:
 *   node scripts/sync-supabase-to-pinecone.js
 */

const { createClient } = require('@supabase/supabase-js');
const { Pinecone } = require('@pinecone-database/pinecone');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'vital-knowledge';
const BATCH_SIZE = 100; // Pinecone limit

// Validate environment variables
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

if (!PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is required');
  process.exit(1);
}

async function syncSupabaseToPinecone() {
  console.log('🚀 Starting Supabase to Pinecone sync...\n');

  // Initialize clients
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

  try {
    // Step 1: Check if Pinecone index exists
    console.log('📊 Checking Pinecone index...');
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);

    if (!indexExists) {
      console.log(`⚠️  Index "${PINECONE_INDEX_NAME}" does not exist. Creating...`);

      await pinecone.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 3072, // text-embedding-3-large
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      console.log('✅ Pinecone index created successfully');
      console.log('⏳ Waiting 60 seconds for index to initialize...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    } else {
      console.log(`✅ Pinecone index "${PINECONE_INDEX_NAME}" exists`);
    }

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Step 2: Get total count from Supabase
    console.log('\n📊 Counting chunks in Supabase...');
    const { count } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (!count || count === 0) {
      console.log('⚠️  No chunks with embeddings found in Supabase');
      return;
    }

    console.log(`✅ Found ${count} chunks with embeddings\n`);

    // Step 3: Fetch and sync in batches
    let offset = 0;
    let totalSynced = 0;
    let errors = 0;

    while (offset < count) {
      const batchNumber = Math.floor(offset / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(count / BATCH_SIZE);

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches}...`);

      // Fetch batch from Supabase
      const { data: chunks, error } = await supabase
        .from('document_chunks')
        .select(`
          id,
          content,
          embedding,
          metadata,
          document_id,
          knowledge_documents(
            id,
            title,
            domain,
            tags
          )
        `)
        .not('embedding', 'is', null)
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error(`❌ Error fetching batch: ${error.message}`);
        errors++;
        offset += BATCH_SIZE;
        continue;
      }

      if (!chunks || chunks.length === 0) {
        break;
      }

      // Convert to Pinecone format
      const vectors = chunks.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding,
        metadata: {
          chunk_id: chunk.id,
          document_id: chunk.document_id,
          content: chunk.content.substring(0, 40000), // Pinecone metadata size limit
          domain: chunk.knowledge_documents?.domain,
          source_title: chunk.knowledge_documents?.title,
          tags: chunk.knowledge_documents?.tags || [],
          timestamp: new Date().toISOString(),
          ...chunk.metadata,
        },
      }));

      // Upsert to Pinecone
      // Strategy: Use single default namespace ('') for all knowledge domains
      // Domain filtering is done via metadata filters, not separate namespaces
      // This enables efficient cross-domain queries while keeping management simple
      // See: docs/PINECONE_KNOWLEDGE_STORAGE_STRATEGY.md
      try {
        await index.namespace('').upsert(vectors);
        totalSynced += vectors.length;
        console.log(`  ✅ Synced ${vectors.length} vectors (${totalSynced}/${count})`);
      } catch (upsertError) {
        console.error(`  ❌ Error upserting batch: ${upsertError.message}`);
        errors++;
      }

      offset += BATCH_SIZE;

      // Rate limiting: small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 4: Verify sync
    console.log('\n📊 Verifying sync...');
    const stats = await index.describeIndexStats();

    console.log('\n✅ Sync Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`Total chunks in Supabase: ${count}`);
    console.log(`Total synced to Pinecone: ${totalSynced}`);
    console.log(`Pinecone vector count:    ${stats.totalRecordCount || 0}`);
    console.log(`Errors:                   ${errors}`);
    console.log('═══════════════════════════════════════\n');

    if (totalSynced < count) {
      console.log('⚠️  Warning: Not all chunks were synced. Please check errors above.');
    } else {
      console.log('🎉 All chunks successfully synced to Pinecone!');
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    throw error;
  }
}

// Run the sync
syncSupabaseToPinecone()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
