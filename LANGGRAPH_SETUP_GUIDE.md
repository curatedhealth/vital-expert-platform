# 🚀 LangGraph Knowledge Pipeline - Setup & Installation Guide

## Prerequisites

- Python 3.10+ installed
- Access to your Supabase project (URL + Service Role Key)
- Access to Pinecone (API Key)
- (Optional) OpenAI API key for embeddings

---

## 📦 Step 1: Install Dependencies

### Option A: Install All Dependencies (Recommended)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
pip3 install -r requirements.txt
```

This installs:
- ✅ **LangGraph** (0.0.20+) - Advanced workflow engine
- ✅ **LangChain** (0.1.0+) - Text splitters, documents
- ✅ **Playwright** (1.40.0+) - Browser automation for PMC
- ✅ **Supabase** (2.0.0+) - Database client
- ✅ **Pinecone** (3.0.0+) - Vector database
- ✅ **SentenceTransformers** - Embeddings
- ✅ **PDF Tools** - PyPDF2, pdfplumber
- ✅ **Utilities** - aiohttp, beautifulsoup4, structlog

### Option B: Install Minimal (Without LangGraph)

If you only want the basic pipeline:

```bash
pip3 install aiohttp beautifulsoup4 python-dotenv supabase pinecone-client sentence-transformers
```

---

## 🎭 Step 2: Install Playwright Browser

Required for scraping PMC and other protected sites:

```bash
python3 -m playwright install chromium
```

**Verify installation:**
```bash
python3 -c "from playwright.async_api import async_playwright; print('✅ Playwright ready')"
```

---

## 🔧 Step 3: Configure Environment Variables

The pipeline needs access to your Supabase and Pinecone instances.

### Check Existing Configuration

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
cat .env.local | grep -E "SUPABASE|PINECONE"
```

### Should Show:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
PINECONE_API_KEY=pcsk_5hYvkJ...
PINECONE_INDEX_NAME=vital-knowledge
```

**These are already configured!** ✅

---

## 🧪 Step 4: Verify Installation

Run this test to verify everything is installed correctly:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

python3 -c "
import sys
print('🔍 Checking dependencies...\n')

# Core
try:
    import aiohttp
    print('✅ aiohttp')
except ImportError:
    print('❌ aiohttp - MISSING')

try:
    from bs4 import BeautifulSoup
    print('✅ beautifulsoup4')
except ImportError:
    print('❌ beautifulsoup4 - MISSING')

# LangChain
try:
    from langchain_core.documents import Document
    print('✅ langchain-core')
except ImportError:
    print('❌ langchain-core - MISSING')

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    print('✅ langchain-text-splitters')
except ImportError:
    print('❌ langchain-text-splitters - MISSING')

# LangGraph
try:
    from langgraph.graph import StateGraph
    print('✅ langgraph')
except ImportError:
    print('❌ langgraph - MISSING (optional but recommended)')

# Playwright
try:
    from playwright.async_api import async_playwright
    print('✅ playwright')
except ImportError:
    print('❌ playwright - MISSING')

# Database
try:
    import supabase
    print('✅ supabase')
except ImportError:
    print('❌ supabase - MISSING')

try:
    import pinecone
    print('✅ pinecone')
except ImportError:
    print('❌ pinecone - MISSING')

# Embeddings
try:
    from sentence_transformers import SentenceTransformer
    print('✅ sentence-transformers')
except ImportError:
    print('❌ sentence-transformers - MISSING')

# PDF
try:
    import PyPDF2
    print('✅ PyPDF2')
except ImportError:
    print('❌ PyPDF2 - MISSING')

try:
    import pdfplumber
    print('✅ pdfplumber')
except ImportError:
    print('❌ pdfplumber - MISSING')

# Utilities
try:
    import structlog
    print('✅ structlog')
except ImportError:
    print('❌ structlog - MISSING')

print('\n🎉 Dependency check complete!')
"
```

**Expected output:** All dependencies should show ✅

---

## 🧪 Step 5: Test the LangGraph Processor

Create a test script:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src"

cat > test_langgraph.py << 'EOF'
import asyncio
import sys
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path.cwd()))

async def test():
    print("🧪 Testing LangGraph Knowledge Processor\n")
    
    try:
        from services.knowledge_pipeline_langgraph import create_knowledge_processor
        print("✅ Import successful\n")
        
        # Create processor
        print("🔧 Creating processor...")
        processor = await create_knowledge_processor(
            embedding_model="sentence-transformers/all-MiniLM-L6-v2"
        )
        print("✅ Processor created successfully!\n")
        
        # Test with sample document
        print("📄 Processing test document...")
        result = await processor.process_document(
            raw_content="This is a test document about digital health innovations in telemedicine. It discusses various applications of AI and machine learning in healthcare delivery.",
            source_url="https://example.com/test-doc",
            source_metadata={
                'title': 'Test Document',
                'domain': 'healthcare',
                'category': 'research',
                'tags': ['digital-health', 'AI', 'telemedicine'],
                'description': 'A test document for verifying the LangGraph workflow'
            }
        )
        
        print("\n" + "="*60)
        print("📊 PROCESSING RESULT")
        print("="*60)
        print(f"Success: {result['success']}")
        print(f"Stage: {result['stage']}")
        print(f"Word Count: {result['word_count']}")
        print(f"Chunk Count: {result['chunk_count']}")
        print(f"Quality Score: {result['quality_score']:.2f}")
        print(f"Pinecone Vectors: {result['pinecone_vectors_uploaded']}")
        print(f"Supabase Stored: {result['supabase_stored']}")
        
        if result['errors']:
            print(f"\n⚠️ Errors: {result['errors']}")
        
        if result['warnings']:
            print(f"\n⚠️ Warnings: {result['warnings']}")
        
        print("="*60 + "\n")
        
        if result['success']:
            print("🎉 LangGraph processor is working perfectly!")
        else:
            print("⚠️ Processing completed with issues")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())
EOF

# Run the test
SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes" \
PINECONE_API_KEY="pcsk_5hYvkJ_Fx7q8P2UQooumHyyi3uFUbjxvT6Rdjio9SEz49psKrC92rwyB2m3RH1P3vqzxa6" \
python3 test_langgraph.py
```

**Expected Output:**
```
🧪 Testing LangGraph Knowledge Processor

✅ Import successful

🔧 Creating processor...
✅ LangGraph processor created and ready
✅ Processor created successfully!

📄 Processing test document...

============================================================
📊 PROCESSING RESULT
============================================================
Success: True
Stage: complete
Word Count: 24
Chunk Count: 1
Quality Score: 4.50
Pinecone Vectors: 1
Supabase Stored: True
============================================================

🎉 LangGraph processor is working perfectly!
```

---

## 🎯 Step 6: Run the Full Pipeline

Now test with your actual PMC sources:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Use the existing test config
SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes" \
PINECONE_API_KEY="pcsk_5hYvkJ_Fx7q8P2UQooumHyyi3uFUbjxvT6Rdjio9SEz49psKrC92rwyB2m3RH1P3vqzxa6" \
python3 knowledge-pipeline.py --config test-single-source.json --dry-run
```

**Look for these log messages:**
```
✅ LangGraph processor initialized - using advanced workflow 🚀
📋 Workflow stages: metadata enrichment → validation → chunking → embeddings → storage
🔄 Processing with LangGraph workflow: Sharing Digital Health...
📝 Stage 1: Enriching metadata
✅ Metadata enriched - Quality: 5.05, Words: 9892
🔍 Stage 2: Validating document quality
✂️ Stage 3: Chunking document
✅ Created 12 chunks
🧠 Stage 4: Generating embeddings
💾 Stage 5: Storing in Supabase
📤 Stage 6: Uploading to Pinecone
✅ LangGraph processing complete
```

---

## 🌐 Step 7: Test from Web UI

1. **Restart your Next.js server** to load the new code:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
# Stop current server (Ctrl+C)
npm run dev
```

2. **Open the Knowledge Pipeline**:
   - Go to: http://localhost:3000/admin?view=knowledge-pipeline
   - Click "Queue (20)" tab
   - Click "Run All (20)"

3. **Watch the console** for LangGraph logs:
```
✅ LangGraph processor initialized - using advanced workflow 🚀
🔄 Processing with LangGraph workflow: Sharing Digital Health...
✅ LangGraph processing complete:
   📊 Quality Score: 5.05
   ✂️ Chunks: 12
   📤 Vectors uploaded: 12
   💾 Supabase: ✅
```

---

## 🐛 Troubleshooting

### Issue 1: "No module named 'langgraph'"

**Solution:**
```bash
pip3 install langgraph langgraph-checkpoint
```

### Issue 2: "LangGraph not available" Warning

**Expected behavior!** The system falls back to standard RAG integration.

To fix:
```bash
pip3 install langgraph>=0.0.20 langgraph-checkpoint>=0.0.1
```

### Issue 3: "ImportError: cannot import name 'StateGraph'"

**Solution:** Update langgraph:
```bash
pip3 install --upgrade langgraph
```

### Issue 4: Playwright browser not found

**Solution:**
```bash
python3 -m playwright install chromium
```

### Issue 5: Environment variables not found

**Solution:** Make sure you're passing env vars to Python:
```bash
# Set them in your shell session
export SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
export PINECONE_API_KEY="pcsk_5hYvkJ..."

# Then run the pipeline
python3 knowledge-pipeline.py --config test.json
```

---

## ✅ Verification Checklist

Before considering the installation complete, verify:

- [ ] All dependencies installed (`pip list | grep -E "langgraph|langchain|playwright"`)
- [ ] Playwright browser installed (`playwright install chromium`)
- [ ] Environment variables configured (`.env.local` exists)
- [ ] LangGraph processor can be imported
- [ ] Test document processes successfully
- [ ] Pipeline runs with real PMC source
- [ ] Web UI "Run All" works
- [ ] Logs show "LangGraph processor initialized"

---

## 📊 Success Indicators

You'll know everything is working when you see:

### Terminal Output:
```
✅ LangGraph processor initialized - using advanced workflow 🚀
📋 Workflow stages: metadata enrichment → validation → chunking → embeddings → storage
🔄 Processing with LangGraph workflow: Sharing Digital Health Educational...
✅ LangGraph processing complete:
   📊 Quality Score: 5.05
   ✂️ Chunks: 12
   📤 Vectors uploaded: 12
   💾 Supabase: ✅
```

### Web UI Console:
```
✅ Success! Words: 9892
```

### Supabase Dashboard:
- Check `knowledge_documents` table for new entries
- Verify metadata fields are populated

### Pinecone Dashboard:
- Check vector count increased
- Verify namespace routing

---

## 🎉 You're Ready!

Once all checks pass, you can:

1. **Run the full pipeline** on all 20 PMC sources
2. **Use Search & Import** to find more content
3. **Watch the LangGraph workflow** process documents
4. **Query your RAG system** to retrieve chunked content

**The LangGraph Knowledge Pipeline is now fully operational! 🚀**

---

## 📚 Next Steps

- Read: `LANGGRAPH_KNOWLEDGE_PIPELINE.md` for detailed workflow info
- See: `COMPLETE_FIX_SUMMARY.md` for the latest fixes
- Check: `WHERE_IS_DATA_SAVED.md` to find your processed documents

**Happy processing! 🎊**

