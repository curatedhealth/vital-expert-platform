# 🔧 Pipeline Error Debugging - Enhanced Logging

**Issue**: Pipeline failing with generic "Unknown error" messages  
**Date**: November 7, 2025  
**Status**: ✅ **Enhanced logging added**

---

## 🔍 Problem Analysis

### Original Error
```
❌ Unknown error: 2025-11-07 21:00:27,547 - __main__ - ERROR -    ❌ Unknown error
```

### Root Cause
The `RAGServiceUploader.upload_content()` method was catching errors but not logging enough details about:
1. Which processing path was being used (LangGraph vs. standard)
2. What the actual error was
3. Full result object when LangGraph fails
4. Complete exception traceback

---

## ✅ Enhancements Made

### 1. Added Upload Method Diagnostics
**Location**: Line 426 in `knowledge-pipeline.py`

```python
logger.info(f"🔄 Upload method check: use_langgraph={self.use_langgraph}, processor={self.langgraph_processor is not None}, rag={self.rag_integration is not None}")
```

**Shows**:
- Whether LangGraph is enabled
- Whether LangGraph processor initialized
- Whether fallback RAG integration is available

### 2. Enhanced LangGraph Failure Logging
**Location**: Lines 463-467 in `knowledge-pipeline.py`

```python
logger.error(f"   ❌ LangGraph processing failed for: {content.get('url', 'unknown')}")
logger.error(f"   📄 Full result: {result}")
for error in errors:
    logger.error(f"   ❌ {error}")
```

**Shows**:
- Which URL failed
- Complete result object from LangGraph
- All error messages from the result

### 3. Enhanced Exception Logging
**Location**: Lines 486-492 in `knowledge-pipeline.py`

```python
logger.error(f"❌ Error uploading content: {str(e)}")
logger.error(f"   URL: {content.get('url', 'unknown')}")
logger.error(f"   Exception type: {type(e).__name__}")
import traceback
logger.error(f"   Traceback: {traceback.format_exc()}")
```

**Shows**:
- Full exception message
- URL being processed
- Exception type (e.g., `ImportError`, `AttributeError`)
- Complete Python traceback

---

## 📊 Expected Output (Enhanced)

### Before (Unhelpful)
```
2025-11-07 21:00:27,547 - __main__ - ERROR -    ❌ Unknown error
```

### After (Detailed)
```
2025-11-07 21:00:27,547 - __main__ - INFO -  🔄 Upload method check: use_langgraph=True, processor=True, rag=False
2025-11-07 21:00:27,548 - __main__ - INFO -  🔄 Processing with LangGraph workflow: AI at Work: Momentum Builds...
2025-11-07 21:00:30,123 - __main__ - ERROR -    ❌ LangGraph processing failed for: https://www.bcg.com/publications/2025/ai-at-work
2025-11-07 21:00:30,123 - __main__ - ERROR -    📄 Full result: {'success': False, 'errors': ['Missing required field: content'], 'warnings': [], 'chunk_count': 0}
2025-11-07 21:00:30,123 - __main__ - ERROR -    ❌ Missing required field: content
```

**OR** if it's an exception:
```
2025-11-07 21:00:30,123 - __main__ - ERROR - ❌ Error uploading content: 'NoneType' object has no attribute 'process_document'
2025-11-07 21:00:30,123 - __main__ - ERROR -    URL: https://www.bcg.com/publications/2025/ai-at-work
2025-11-07 21:00:30,123 - __main__ - ERROR -    Exception type: AttributeError
2025-11-07 21:00:30,123 - __main__ - ERROR -    Traceback: Traceback (most recent call last):
  File ".../knowledge-pipeline.py", line 432, in upload_content
    result = await self.langgraph_processor.process_document(...)
AttributeError: 'NoneType' object has no attribute 'process_document'
```

---

## 🎯 Next Steps for User

### 1. Run Pipeline Again
The next time the pipeline runs, you'll get detailed error information:

```bash
# From the UI or command line
# The logs will now show exactly what's failing
```

### 2. Check the Logs
Look for the new diagnostic messages:
- ✅ `🔄 Upload method check:` - Shows which path is being used
- ❌ `❌ LangGraph processing failed for:` - Shows which URL failed
- 📄 `📄 Full result:` - Shows the complete result object
- 🔍 `Traceback:` - Shows the complete error stack

### 3. Common Issues to Look For

#### Issue: LangGraph Not Initialized
```
🔄 Upload method check: use_langgraph=True, processor=False, rag=True
```
**Fix**: Check if LangGraph import failed during initialization

#### Issue: Missing Content
```
📄 Full result: {'success': False, 'errors': ['Missing required field: content']}
```
**Fix**: Scraper didn't extract content from the page

#### Issue: Import Error
```
Exception type: ImportError
Traceback: ... No module named 'services.knowledge_pipeline_langgraph'
```
**Fix**: LangGraph module not in Python path

#### Issue: Missing Dependencies
```
Exception type: ImportError
Traceback: ... No module named 'langgraph'
```
**Fix**: Run `pip install langgraph langgraph-checkpoint`

---

## 🔄 Testing the Enhanced Logging

### Quick Test
1. Try running a single source from the UI
2. Check the console logs in the backend
3. You should now see detailed error information

### Expected Flow
```
🔄 Initializing RAG Service...
✅ LangGraph processor initialized - using advanced workflow 🚀
📋 Workflow stages: metadata enrichment → validation → chunking → embeddings → storage
✅ RAG Service uploader initialized

🔄 Upload method check: use_langgraph=True, processor=True, rag=False
🔄 Processing with LangGraph workflow: [document title]...

[If success]
✅ LangGraph processing complete:
   📊 Quality Score: 7.50
   ✂️ Chunks: 15
   📤 Vectors uploaded: 15
   💾 Supabase: ✅

[If failure]
❌ LangGraph processing failed for: [URL]
📄 Full result: [complete result object]
❌ [specific error message]
```

---

## 📝 Files Modified

1. **`scripts/knowledge-pipeline.py`**
   - Line 426: Added upload method diagnostics
   - Lines 463-467: Enhanced LangGraph failure logging
   - Lines 486-492: Enhanced exception logging with traceback

---

## ✅ Benefits

1. **Faster Debugging**: See exactly what's failing
2. **Better Error Messages**: No more "Unknown error"
3. **Complete Context**: Full tracebacks and result objects
4. **Easier Troubleshooting**: Know which processing path is being used
5. **Production Ready**: Detailed logs for bug reports

---

## 🎯 Action Required

**Run the pipeline again** to see the enhanced error messages. The logs will now provide complete diagnostic information to identify the exact failure point.

Once you see the detailed logs, share them and I can provide a targeted fix for the specific issue.

---

**Status**: ✅ Enhanced logging deployed  
**Next**: Run pipeline to capture detailed error information

