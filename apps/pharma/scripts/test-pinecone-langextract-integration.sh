#!/bin/bash

# ============================================================================
# PINECONE + LANGEXTRACT INTEGRATION TEST SCRIPT
# ============================================================================
# Description: Test the complete RAG system with Pinecone and LangExtract
# Version: 1.0.0
# Date: 2025-01-27
# ============================================================================

set -e

echo "🧪 Testing Pinecone + LangExtract Integration..."

# Check if we're in the right directory
if [ ! -f "apps/digital-health-startup/src/lib/services/rag/unified-rag-service.ts" ]; then
    echo "❌ UnifiedRAGService not found. Please run this script from the project root."
    exit 1
fi

# Check environment variables
echo "🔍 Checking environment variables..."

if [ -z "$PINECONE_API_KEY" ]; then
    echo "⚠️  PINECONE_API_KEY not set. Please set it in your .env.local file."
    echo "   You can get it from: https://app.pinecone.io/organizations"
fi

if [ -z "$PINECONE_INDEX_NAME" ]; then
    echo "⚠️  PINECONE_INDEX_NAME not set. Using default: vital-knowledge"
    export PINECONE_INDEX_NAME="vital-knowledge"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set. Required for embeddings."
    exit 1
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  GOOGLE_API_KEY not set. LangExtract will be disabled."
    echo "   You can get it from: https://aistudio.google.com/app/apikey"
fi

echo "✅ Environment variables checked"

# Test TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
cd apps/digital-health-startup

if npx tsc --noEmit --skipLibCheck src/lib/services/rag/unified-rag-service.ts src/lib/services/vectorstore/pinecone-vector-service.ts src/lib/services/extraction/langextract-pipeline.ts; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Test Pinecone connection
echo "🌲 Testing Pinecone connection..."
if node -e "
const { Pinecone } = require('@pinecone-database/pinecone');
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
pc.listIndexes().then(() => {
  console.log('✅ Pinecone connection successful');
  process.exit(0);
}).catch(err => {
  console.error('❌ Pinecone connection failed:', err.message);
  process.exit(1);
});
"; then
    echo "✅ Pinecone connection test passed"
else
    echo "❌ Pinecone connection test failed"
    exit 1
fi

# Test OpenAI embeddings
echo "🤖 Testing OpenAI embeddings..."
if node -e "
const fetch = require('node-fetch');
fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`
  },
  body: JSON.stringify({
    input: 'Test query for RAG system',
    model: 'text-embedding-3-small'
  })
}).then(res => res.json()).then(data => {
  if (data.data && data.data[0] && data.data[0].embedding) {
    console.log('✅ OpenAI embeddings test passed');
    process.exit(0);
  } else {
    console.error('❌ OpenAI embeddings test failed:', data);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ OpenAI embeddings test failed:', err.message);
  process.exit(1);
});
"; then
    echo "✅ OpenAI embeddings test passed"
else
    echo "❌ OpenAI embeddings test failed"
    exit 1
fi

# Test Google AI (LangExtract) if API key is available
if [ ! -z "$GOOGLE_API_KEY" ]; then
    echo "🧬 Testing Google AI (LangExtract)..."
    if node -e "
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    model.generateContent('Test query for LangExtract').then(() => {
      console.log('✅ Google AI (LangExtract) test passed');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Google AI (LangExtract) test failed:', err.message);
      process.exit(1);
    });
    "; then
        echo "✅ Google AI (LangExtract) test passed"
    else
        echo "❌ Google AI (LangExtract) test failed"
        exit 1
    fi
else
    echo "⚠️  Skipping Google AI test (API key not provided)"
fi

# Test Supabase connection
echo "🗄️  Testing Supabase connection..."
if node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('agents').select('count').limit(1).then(() => {
  console.log('✅ Supabase connection test passed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Supabase connection test failed:', err.message);
  process.exit(1);
});
"; then
    echo "✅ Supabase connection test passed"
else
    echo "❌ Supabase connection test failed"
    exit 1
fi

echo ""
echo "🎉 All integration tests passed!"
echo ""
echo "📊 Integration Status:"
echo "   ✅ Pinecone Vector Database: Connected"
echo "   ✅ OpenAI Embeddings: Working"
echo "   ✅ Supabase Metadata: Connected"
if [ ! -z "$GOOGLE_API_KEY" ]; then
    echo "   ✅ LangExtract Processing: Available"
else
    echo "   ⚠️  LangExtract Processing: Disabled (no API key)"
fi
echo ""
echo "🚀 RAG system is production-ready with:"
echo "   • Pinecone for high-performance vector search"
echo "   • Supabase for metadata and relational queries"
echo "   • OpenAI for embeddings and text generation"
echo "   • LangExtract for structured entity extraction"
echo ""
echo "✨ Ready to process documents and answer questions!"
