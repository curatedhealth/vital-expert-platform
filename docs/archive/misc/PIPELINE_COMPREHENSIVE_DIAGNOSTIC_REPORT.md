# 🔍 KNOWLEDGE PIPELINE - COMPREHENSIVE DIAGNOSTIC REPORT

**Date**: November 7, 2025  
**Issue**: Pipeline failing with "Unknown error" messages  
**Status**: 🔴 **ONGOING INVESTIGATION**

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Complete Timeline](#complete-timeline)
3. [All Fixes Applied](#all-fixes-applied)
4. [Current Issue Analysis](#current-issue-analysis)
5. [Diagnostic Steps](#diagnostic-steps)
6. [Root Cause Investigation](#root-cause-investigation)
7. [Recommended Actions](#recommended-actions)

---

## 📊 EXECUTIVE SUMMARY

### What We're Trying to Do
Build a Knowledge Pipeline that:
- Searches academic sources (PubMed, arXiv)
- Scrapes content from URLs
- Processes and chunks the text
- Stores in Supabase + Pinecone (RAG system)
- Supports multi-domain organization

### Current Status
- ✅ UI/UX: Gold-standard interface complete
- ✅ Search & Import: Working
- ✅ Domain Selection: Implemented
- ✅ Multiple fixes applied
- ❌ **BLOCKING ISSUE**: Pipeline execution fails with truncated error messages

### The Mystery
The error message is being cut off:
```
"Unknown error: 2025-11-07 23:14:09,823 - __main__ - INFO - ✅ Loaded configuration from /Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/temp/pipeline-single-1762553649522.json\n2025-11-07 23:"
```

The log shows configuration loaded successfully, but then... nothing. The error is truncated.

---

## 🕐 COMPLETE TIMELINE

### Phase 1: Initial Request (Start)
**User Request**: "improve and streaming the front end different tabs options make the UX UI gold standard"

**Actions Taken**:
1. ✅ Complete UI/UX redesign
2. ✅ Added real-time streaming logs
3. ✅ Implemented live statistics dashboard
4. ✅ Created 4-tab intelligent layout
5. ✅ Added smooth animations and transitions
6. ✅ Made fully responsive

**Result**: Beautiful, modern interface complete

---

### Phase 2: Dynamic Import Fix
**Issue**: `Element type is invalid... Lazy element type must resolve to a class or function`

**Root Cause**: Incorrect dynamic import syntax
```typescript
// BEFORE (wrong)
const KnowledgePipelineConfig = dynamic(
  () => import('@/components/admin/KnowledgePipelineConfig').then(mod => ({ default: mod.KnowledgePipelineConfig })),
  { ssr: false }
);

// AFTER (correct)
const KnowledgePipelineConfig = dynamic(
  () => import('@/components/admin/KnowledgePipelineConfig'),
  { ssr: false }
);
```

**Fix Applied**: Changed to default export import  
**File**: `apps/digital-health-startup/src/app/(app)/admin/page.tsx` (Line 63-66)  
**Status**: ✅ FIXED

---

### Phase 3: PMC Scraping Issue
**Issue**: Pipeline returning 0 words for PubMed Central articles

**Root Cause**: Using PDF URLs instead of HTML URLs
```typescript
// BEFORE (wrong)
url: result.pdf_link || result.url,  // PDF URLs don't return scrapable content

// AFTER (correct)
url: result.url,  // HTML URLs contain full article text
```

**Why This Matters**:
- PMC PDF URLs: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8328933/pdf/` → 0 words
- PMC HTML URLs: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8328933/` → 15,000+ words

**Fix Applied**: Use main URL (HTML for PMC, PDF for arXiv)  
**File**: `apps/digital-health-startup/src/components/admin/KnowledgeSearchImport.tsx` (Line 178)  
**Status**: ✅ FIXED

**Python Log Showed**:
```
⚠️ Skipping document without content: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8328933/pdf/
```

---

### Phase 4: API Timeout Configuration
**Issue**: "Failed to fetch" errors after starting pipeline

**Root Cause**: Next.js API route timing out (10 second default in production)

**Fix Applied**: Added explicit timeout configuration
```typescript
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
```

**File**: `apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts` (Lines 9-11)  
**Status**: ✅ FIXED

---

### Phase 5: Domain Selection Feature
**Issue**: Pipeline needed multi-domain support like `/knowledge/upload`

**Actions Taken**:
1. ✅ Added domain selection UI (multi-select with badges)
2. ✅ Fetched domains from `knowledge_domains_new` table
3. ✅ Passed `domainIds` array to API
4. ✅ Updated Python script to extract domain_ids
5. ✅ Modified RAG integration to use primary domain

**Files Changed**:
- `apps/digital-health-startup/src/components/admin/KnowledgePipelineConfig.tsx`
- `apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts`
- `scripts/knowledge-pipeline.py`
- `services/ai-engine/src/services/knowledge_pipeline_integration.py`

**Status**: ✅ IMPLEMENTED

---

### Phase 6: Environment Variable Fixes
**Issue**: Python script not receiving environment variables

**Actions Taken**:
1. ✅ API route passes env vars to subprocess
2. ✅ Added early validation in API (before calling Python)
3. ✅ Enhanced error extraction to show missing vars
4. ✅ Added detailed logging

**Code Added**:
```typescript
// Early validation
if (!pythonEnv.SUPABASE_URL || !pythonEnv.SUPABASE_SERVICE_ROLE_KEY) {
  return NextResponse.json({
    success: false,
    error: 'Environment variables not configured',
    missing_vars: [...],
  });
}
```

**Status**: ✅ FIXED

---

## 🎯 ALL FIXES APPLIED

### Summary Table

| # | Issue | Fix | File | Status |
|---|-------|-----|------|--------|
| 1 | Dynamic import error | Changed import syntax | `admin/page.tsx` | ✅ |
| 2 | PMC 0 words | Use HTML URLs | `KnowledgeSearchImport.tsx` | ✅ |
| 3 | API timeout | Added maxDuration | `run-single/route.ts` | ✅ |
| 4 | Domain selection | Multi-domain UI + backend | Multiple files | ✅ |
| 5 | Env vars missing | Early validation + passing | `run-single/route.ts` | ✅ |
| 6 | UI/UX outdated | Complete redesign | `KnowledgePipelineConfig.tsx` | ✅ |
| 7 | No real-time feedback | Streaming logs | `KnowledgePipelineConfig.tsx` | ✅ |
| 8 | Error messages unclear | Enhanced error extraction | `run-single/route.ts` | ✅ |

---

## 🔴 CURRENT ISSUE ANALYSIS

### The Problem

**Error Message (Truncated)**:
```
Unknown error: 2025-11-07 23:14:09,823 - __main__ - INFO - ✅ Loaded configuration from /Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/temp/pipeline-single-1762553649522.json\n2025-11-07 23:
```

### What We Know

1. **Configuration Loads Successfully** ✅
   ```
   ✅ Loaded configuration from .../pipeline-single-1762553649522.json
   ```

2. **Then Something Fails** ❌
   - But error message is cut off
   - We only see up to "2025-11-07 23:" (timestamp)
   - No actual error details

3. **Pattern**:
   - Happens consistently
   - Multiple sources fail the same way
   - All at roughly the same point (after config load)

### What's Strange

The error says "Unknown error" but includes Python logs that show SUCCESS:
```
✅ Loaded configuration
```

This suggests:
1. Python script starts correctly
2. Something fails shortly after
3. The error message is being truncated in transmission
4. OR the Python script is exiting without proper error output

---

## 🔬 DIAGNOSTIC STEPS NEEDED

### Step 1: Check Full Python Output

**Run Python Script Directly** (bypass Next.js):
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Set environment variables
export SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
export PINECONE_API_KEY="pcsk_..."
export PINECONE_ENVIRONMENT="us-east-1-aws"
export OPENAI_API_KEY="sk-proj-..."

# Run with latest config
python3 knowledge-pipeline.py --config ../apps/digital-health-startup/temp/pipeline-single-1762553649522.json

# Capture full output
python3 knowledge-pipeline.py --config ../apps/digital-health-startup/temp/pipeline-single-1762553649522.json > output.log 2>&1
cat output.log
```

**What to look for**:
- Where exactly does it fail?
- Is there a Python exception?
- Does it hang or crash?
- Full error traceback

---

### Step 2: Check Config File

**Inspect Latest Config**:
```bash
cat "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/temp/pipeline-single-1762553649522.json" | python3 -m json.tool | head -100
```

**Verify**:
- Is URL correct (HTML not PDF)?
- Are domain_ids present?
- Is embedding_model set?
- Are all required fields there?

---

### Step 3: Check API Response

**What's the API actually returning?**

In the API route, the response should include:
```typescript
{
  success: false,
  error: "...",
  details: "...",
  stdout: "... first 5000 chars ...",
  stderr: "... first 5000 chars ..."
}
```

**But the frontend only sees**:
```
"Unknown error: ... truncated ..."
```

**Possible Issues**:
1. Response is too large and being truncated
2. JSON parsing error
3. Network issue
4. Response format mismatch

---

### Step 4: Check Backend Terminal

**Look at Next.js dev server logs**:
```bash
# In the terminal where you ran `npm run dev`
# Look for:
- "📥 Single source execution request:"
- "🔐 Environment variables:"
- "✅ Single source execution completed"
- OR error logs
```

---

## 🕵️ ROOT CAUSE INVESTIGATION

### Hypothesis 1: String Truncation
**Theory**: Error message is > 5000 chars and being cut off

**Evidence**:
- Substring limit: `stdout.substring(0, 5000)`
- Error ends mid-timestamp: "2025-11-07 23:"

**Test**:
```typescript
// In run-single/route.ts, increase limit
stdout: stdout.substring(0, 50000), // Was 5000
stderr: stderr ? stderr.substring(0, 50000) : null, // Was 5000
```

---

### Hypothesis 2: Python Script Hanging
**Theory**: Script starts but hangs on a specific operation

**Possible Culprits**:
1. Playwright browser launch (slow/stuck)
2. Network request timeout
3. RAG service initialization (Pinecone connection)
4. Database query hanging

**Evidence Needed**:
- Run script directly to see where it hangs
- Check if it's waiting for user input
- Look for infinite loops

---

### Hypothesis 3: Silent Crash
**Theory**: Python script crashes without logging

**Possible Causes**:
1. Import error (module not found)
2. Segmentation fault (rare)
3. Memory error
4. Uncaught exception in async code

**Test**:
```bash
# Add verbose Python logging
python3 -v knowledge-pipeline.py --config ...
```

---

### Hypothesis 4: RAG Service Issue
**Theory**: LangGraph or RAG integration fails silently

**Evidence from Earlier**:
```python
# Line 388 in knowledge-pipeline.py
self.use_langgraph = False  # Disabled - use standard RAG integration
```

LangGraph was disabled earlier because of issues. But the standard RAG integration might also have problems.

**Possible Issues**:
1. Pinecone connection fails
2. Supabase client error
3. Embedding service initialization
4. Domain mapping issue

---

### Hypothesis 5: Domain ID Format Issue
**Theory**: `domain_ids` is in wrong format

**Config shows**:
```json
"domain_ids": ["digital_health"]
```

**But RAG integration expects**:
```python
domain_ids = content.get('domain_ids', [])
if domain_ids and len(domain_ids) > 0:
    domain_id = domain_ids[0]  # Use first as string
```

**Potential Issue**: 
- Is `"digital_health"` the correct format?
- Should it be a UUID?
- Does the domain exist in the database?

---

## 🎯 RECOMMENDED ACTIONS

### Immediate Actions (Priority 1)

#### 1. Run Python Script Directly
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Set all env vars
export SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<your-key>"
export PINECONE_API_KEY="<your-key>"
export PINECONE_ENVIRONMENT="us-east-1-aws"
export OPENAI_API_KEY="<your-key>"

# Run with full logging
python3 knowledge-pipeline.py --config ../apps/digital-health-startup/temp/pipeline-single-1762553649522.json 2>&1 | tee full-output.log

# Check output
cat full-output.log
```

**What to look for**:
- Exact line where it fails
- Full error traceback
- Warnings before error
- Last successful log message

---

#### 2. Increase Error Message Limits

**File**: `apps/digital-health-startup/src/app/api/pipeline/run-single/route.ts`

**Change** (Line 181-182):
```typescript
// BEFORE
stdout: stdout.substring(0, 5000),
stderr: stderr ? stderr.substring(0, 5000) : null,

// AFTER
stdout: stdout.substring(0, 50000), // 10x more
stderr: stderr ? stderr.substring(0, 50000) : null,
```

---

#### 3. Add Debug Logging to Python Script

**File**: `scripts/knowledge-pipeline.py`

**Add at key points**:
```python
# After config load (around line 650)
logger.info("=" * 80)
logger.info("🔍 DEBUG: About to initialize scraper")
logger.info(f"🔍 DEBUG: Sources count: {len(sources)}")
logger.info(f"🔍 DEBUG: First source URL: {sources[0]['url']}")
logger.info("=" * 80)

# Before scraping (around line 672)
logger.info("=" * 80)
logger.info(f"🔍 DEBUG: About to scrape: {url}")
logger.info(f"🔍 DEBUG: Scraper class: {WebScraperClass.__name__}")
logger.info("=" * 80)

# After scraping (around line 676)
logger.info("=" * 80)
logger.info(f"🔍 DEBUG: Scrape result: success={scraped_data.get('success')}")
logger.info(f"🔍 DEBUG: Word count: {scraped_data.get('word_count', 0)}")
logger.info("=" * 80)
```

---

#### 4. Check Domain ID Format

**Query Supabase directly**:
```sql
SELECT domain_id, slug, domain_name 
FROM knowledge_domains_new 
WHERE slug = 'digital_health' 
OR domain_name = 'Digital Health';
```

**Verify**:
- Does `digital_health` exist?
- What's the actual `domain_id` (UUID)?
- Should we use UUID instead of slug?

---

#### 5. Simplify Test Case

**Create minimal config**:
```json
{
  "sources": [{
    "url": "https://example.com",
    "description": "Test",
    "domain": "test",
    "category": "test",
    "tags": [],
    "priority": "medium"
  }],
  "scraping_settings": { "timeout": 30, "max_retries": 1 },
  "processing_settings": { "chunk_size": 1000, "chunk_overlap": 200 },
  "upload_settings": { 
    "enable_supabase": false,  // DISABLE UPLOADS
    "enable_pinecone": false 
  },
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Test with uploads disabled** to isolate scraping vs. upload issues

---

### Short-term Actions (Priority 2)

#### 6. Add Timeout Wrapper to Python Script

```python
# Add at top of script
import signal

def timeout_handler(signum, frame):
    logger.error("❌ TIMEOUT: Script exceeded 4 minutes")
    raise TimeoutError("Script timeout")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(240)  # 4 minute timeout
```

---

#### 7. Check Playwright Installation

```bash
# Verify Playwright browsers are installed
python3 -c "from playwright.sync_api import sync_playwright; p = sync_playwright().start(); browser = p.chromium.launch(); print('✅ Playwright works'); browser.close(); p.stop()"
```

---

#### 8. Test RAG Integration Separately

```python
# Create test script: test_rag.py
import asyncio
import sys
sys.path.insert(0, 'services/ai-engine/src')

async def test():
    from services.knowledge_pipeline_integration import RAGIntegrationUploader
    
    uploader = RAGIntegrationUploader(embedding_model='text-embedding-3-large')
    await uploader.initialize()
    print("✅ RAG integration initialized")
    
    # Test upload
    result = await uploader.upload_content({
        'url': 'https://test.com',
        'title': 'Test',
        'content': 'This is test content.',
        'domain': 'test',
        'domain_ids': ['<UUID>']  # Use actual UUID
    })
    print(f"✅ Upload result: {result}")

asyncio.run(test())
```

---

### Long-term Actions (Priority 3)

#### 9. Add Comprehensive Error Boundaries

**Frontend**:
```typescript
// Wrap handleRunSingleSource in try-catch
try {
  const response = await fetch('/api/pipeline/run-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ... }),
  });
  
  const result = await response.json();
  console.log('📊 Full API response:', JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ Fetch error:', error);
  console.error('   Type:', error.constructor.name);
  console.error('   Message:', error.message);
}
```

---

#### 10. Implement Health Check Endpoint

```typescript
// apps/digital-health-startup/src/app/api/pipeline/health/route.ts
export async function GET() {
  try {
    // Check Python
    const pythonCheck = await execAsync('python3 --version');
    
    // Check env vars
    const envCheck = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      pinecone: !!process.env.PINECONE_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };
    
    return NextResponse.json({
      status: 'ok',
      python: pythonCheck.stdout.trim(),
      env: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
```

---

## 📝 SUMMARY FOR EXTERNAL HELP

### If you need to ask for help, provide:

**1. Full Error Log**:
```bash
# Run this and share output
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
python3 knowledge-pipeline.py --config ../apps/digital-health-startup/temp/pipeline-single-1762553649522.json 2>&1 | tee error-log.txt
cat error-log.txt
```

**2. Config File**:
```bash
cat "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/temp/pipeline-single-1762553649522.json"
```

**3. Environment Check**:
```bash
python3 --version
python3 -c "import playwright; print('Playwright:', playwright.__version__)"
python3 -c "import pinecone; print('Pinecone:', pinecone.__version__)"
```

**4. Database Check**:
```sql
SELECT COUNT(*) FROM knowledge_domains_new WHERE is_active = true;
SELECT domain_id, slug FROM knowledge_domains_new WHERE slug = 'digital_health';
```

**5. This Report**:
Share this entire document showing:
- What we tried to build
- All fixes applied
- Current blocking issue
- Diagnostic steps taken

---

## 🎯 NEXT IMMEDIATE STEP

**RUN THIS NOW**:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Set environment variables (use your actual values from .env file)
export SUPABASE_URL="<your-supabase-url>"
export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
export PINECONE_API_KEY="<your-pinecone-api-key>"
export PINECONE_ENVIRONMENT="us-east-1-aws"
export OPENAI_API_KEY="<your-openai-api-key>"

# Run with latest failing config and capture ALL output
python3 knowledge-pipeline.py --config ../apps/digital-health-startup/temp/pipeline-single-1762553649522.json 2>&1 | tee full-diagnostic.log

# Show the log
cat full-diagnostic.log
```

**This will reveal the ACTUAL error** that's being truncated in the API response.

---

**End of Report**

*Generated for debugging Knowledge Pipeline execution failures*

