# 🔧 **Environment Configuration for Pinecone + LangExtract**

## ✅ **Current API Keys (from .env.vercel)**

```bash
# ✅ Already Available
OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"
NEXT_PUBLIC_SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
```

## ❌ **Missing API Keys (Need to Add)**

### **1. Pinecone API Key**
```bash
# Get from: https://app.pinecone.io/organizations
PINECONE_API_KEY="your_pinecone_api_key_here"
PINECONE_INDEX_NAME="vital-knowledge"
```

### **2. Google AI API Key (for LangExtract)**
```bash
# Get from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY="your_google_ai_api_key_here"
```

## 🚀 **Complete Environment Setup**

Add these lines to your `.env.vercel` file:

```bash
# ============================================================================
# PINECONE CONFIGURATION
# ============================================================================
PINECONE_API_KEY="your_pinecone_api_key_here"
PINECONE_INDEX_NAME="vital-knowledge"

# ============================================================================
# GOOGLE AI CONFIGURATION (LangExtract)
# ============================================================================
GOOGLE_API_KEY="your_google_ai_api_key_here"

# ============================================================================
# RAG SYSTEM CONFIGURATION
# ============================================================================
ENABLE_LANGEXTRACT="true"
RAG_STRATEGY="agent-optimized"
VECTOR_SEARCH_PROVIDER="pinecone"
```

## 📋 **Setup Instructions**

### **Step 1: Get Pinecone API Key**
1. Go to [Pinecone Console](https://app.pinecone.io/organizations)
2. Sign up/Login to your account
3. Navigate to "API Keys" section
4. Copy your API key
5. Add to `.env.vercel`:
   ```bash
   PINECONE_API_KEY="pc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   PINECONE_INDEX_NAME="vital-knowledge"
   ```

### **Step 2: Get Google AI API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add to `.env.vercel`:
   ```bash
   GOOGLE_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### **Step 3: Initialize Pinecone Index**
```bash
# Run the migration script to create the Pinecone index
./scripts/run-knowledge-base-migration.sh
```

### **Step 4: Test Integration**
```bash
# Test all services are working
./scripts/test-pinecone-langextract-integration.sh
```

## 🔍 **Verification Commands**

### **Check Current Environment**
```bash
# Check if all required keys are set
echo "OpenAI: ${OPENAI_API_KEY:0:20}..."
echo "Supabase: ${NEXT_PUBLIC_SUPABASE_URL}"
echo "Pinecone: ${PINECONE_API_KEY:0:20}..."
echo "Google AI: ${GOOGLE_API_KEY:0:20}..."
```

### **Test Pinecone Connection**
```bash
# Test Pinecone API access
curl -X GET "https://api.pinecone.io/indexes" \
  -H "Api-Key: $PINECONE_API_KEY"
```

### **Test Google AI Connection**
```bash
# Test Google AI API access
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## 🎯 **Production Configuration**

For production deployment, ensure these are set in your Vercel environment variables:

### **Required Variables**
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `GOOGLE_API_KEY`
- `ENABLE_LANGEXTRACT=true`

### **Optional Variables**
- `RAG_STRATEGY=agent-optimized`
- `VECTOR_SEARCH_PROVIDER=pinecone`
- `LANGEXTRACT_CACHE_TTL=3600`

## ⚠️ **Security Notes**

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor usage** and set up billing alerts
5. **Use least privilege** access for all services

## 🚀 **Ready to Go!**

Once you add the missing API keys, the RAG system will be fully operational with:
- ⚡ **Pinecone** for high-performance vector search
- 🧬 **LangExtract** for structured entity extraction
- 🗄️ **Supabase** for metadata and relational queries
- 🤖 **OpenAI** for embeddings and text generation
