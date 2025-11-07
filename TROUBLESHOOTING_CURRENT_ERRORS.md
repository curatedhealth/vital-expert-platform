# 🔍 Pipeline Troubleshooting - Error Analysis

## Current Issues Identified

### ✅ Changes Made

**1. Better Error Messages**
- API now extracts actual Python error messages
- Shows specific failure reasons instead of "Unknown error"

**2. Increased Timeout**
- Changed from 2 minutes → 5 minutes per source
- Should handle large PDFs and slow JS sites better

---

## 🧪 Next Steps to Debug

### Step 1: Retry One Source
Now that we have better error reporting:

1. Click 🔄 **Retry** on any failed source
2. Check the new error message
3. Should now show actual Python error

### Step 2: Test Directly via Terminal

To see the exact Python error, run this:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Test BCG URL directly
python3 -c "
import asyncio
import sys
sys.path.insert(0, '.')

async def test():
    from enhanced_web_scraper import EnhancedWebScraper
    async with EnhancedWebScraper(use_playwright=False) as scraper:
        result = await scraper.scrape_url('https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain')
        print(f'Success: {result[\"success\"]}')
        if result['success']:
            print(f'Words: {result[\"word_count\"]}')
        else:
            print(f'Error: {result.get(\"error\", \"Unknown\")}')

asyncio.run(test())
"
```

### Step 3: Check Enhanced Scraper Status

Verify which scraper is being used:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
python3 -c "
try:
    from enhanced_web_scraper import EnhancedWebScraper
    print('✅ Enhanced scraper loaded')
    import PyPDF2, pdfplumber
    print('✅ PDF parsers available')
    from playwright.async_api import async_playwright
    print('✅ Playwright available')
except ImportError as e:
    print(f'❌ Import error: {e}')
"
```

---

## 🔧 Likely Root Causes

Based on the error patterns:

### For "Unknown error" (6-17s failures):

**Possible causes:**
1. ❌ Enhanced scraper not being imported
2. ❌ Python path issues
3. ❌ Environment variables not passed correctly
4. ❌ Metadata mapping errors

### For Timeout (2-4 minute failures):

**Possible causes:**
1. ⏱️ Playwright taking too long
2. ⏱️ Large PDFs downloading slowly
3. ⏱️ Network latency

---

## 🎯 Recommended Actions

### Action 1: Check Python Logs

The API should now log to console. Check your Next.js terminal for:
```
✅ Single source result: { success: false, wordCount: 0, errorDetails: 'actual error here' }
```

### Action 2: Verify Scraper Import

Run this to check if pipeline is using enhanced scraper:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
head -20 knowledge-pipeline.py | grep -A 5 "EnhancedWebScraper"
```

Should see:
```python
try:
    from enhanced_web_scraper import EnhancedWebScraper as WebScraper
    ENHANCED_SCRAPER = True
```

### Action 3: Test Single URL with Full Pipeline

Create a test config with just one URL:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Create test config
cat > test-single.json << 'EOF'
{
  "sources": [{
    "url": "https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain",
    "domain": "ai_ml_workplace",
    "firm": "BCG",
    "category": "report",
    "tags": ["AI", "workplace"],
    "priority": "high",
    "description": "BCG AI at Work 2025"
  }],
  "scraping_settings": {
    "timeout": 60,
    "use_playwright": false
  }
}
EOF

# Run pipeline
python3 knowledge-pipeline.py --config test-single.json --dry-run
```

This will show the exact error!

---

## 📊 Expected Behavior After Fixes

### Before:
```
❌ BCG Report - Failed after 7.9s
Error: Unknown error
```

### After:
```
❌ BCG Report - Failed after 12.3s
Error: Cannot connect to host www.bcg.com:443 ssl:True [SSLCertVerificationError]
```

Now you'll see the **actual** error and can fix it!

---

## 🚀 Quick Win Test

Try this in your terminal RIGHT NOW:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Quick test of one URL
python3 knowledge-pipeline.py \
  --config <(echo '{
    "sources": [{
      "url": "https://example.com",
      "domain": "test",
      "category": "test",
      "tags": [],
      "priority": "high",
      "description": "Test"
    }]
  }') \
  --dry-run
```

If this works (should extract ~19 words from example.com), then we know:
- ✅ Python pipeline working
- ✅ Enhanced scraper loading
- ✅ SSL fix active

If it fails, we'll see the real error!

---

**Try these diagnostics and let me know what errors you see!** 🔍

