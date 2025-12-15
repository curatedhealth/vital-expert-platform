#!/bin/bash

# ============================================================================
# SIMPLE API CONNECTION TEST
# ============================================================================
# Description: Test API connections for Pinecone, OpenAI, and Google AI
# ============================================================================

set -e

echo "🧪 Testing API Connections..."

# Test Pinecone connection
echo "🌲 Testing Pinecone connection..."
if curl -s -X GET "https://api.pinecone.io/indexes" \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "Content-Type: application/json" > /dev/null; then
    echo "✅ Pinecone connection successful"
else
    echo "❌ Pinecone connection failed"
    exit 1
fi

# Test OpenAI connection
echo "🤖 Testing OpenAI connection..."
if curl -s -X POST "https://api.openai.com/v1/embeddings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"input": "test", "model": "text-embedding-3-small"}' \
  | grep -q "data"; then
    echo "✅ OpenAI connection successful"
else
    echo "❌ OpenAI connection failed"
    exit 1
fi

# Test Google AI connection
echo "🧬 Testing Google AI connection..."
if curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  | grep -q "candidates"; then
    echo "✅ Google AI connection successful"
else
    echo "❌ Google AI connection failed"
    exit 1
fi

echo ""
echo "🎉 All API connections successful!"
echo ""
echo "📊 Integration Status:"
echo "   ✅ Pinecone Vector Database: Connected"
echo "   ✅ OpenAI Embeddings: Working"
echo "   ✅ Google AI (LangExtract): Available"
echo ""
echo "🚀 RAG system is ready for production!"
