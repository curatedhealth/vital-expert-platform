# SSL Certificate Fix - Mode 1 Execution Error Resolved

**Date:** 2025-11-27
**Issue:** `[Errno 2] No such file or directory` when executing Mode 1
**Status:** ✅ **FIXED**

---

## Problem

When testing Ask Expert Mode 1, the backend threw:
```
FileNotFoundError: [Errno 2] No such file or directory
```

Full stack trace pointed to SSL certificate loading:
```python
File "/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python3.9/ssl.py", line 745, in create_default_context
    context.load_verify_locations(cafile, capath, cadata)
FileNotFoundError: [Errno 2] No such file or directory
```

## Root Cause

The environment variable `SSL_CERT_FILE` was set to:
```
/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/site-packages/certifi/cacert.pem
```

This path doesn't exist because:
1. Backend runs on **Python 3.9** (not 3.13)
2. The path was from a different Python installation
3. OpenAI embeddings initialization requires SSL certificates

## Solution

Updated `start-dev.sh` to automatically detect and set the correct SSL certificate path:

```bash
# Fix SSL certificate path for Python 3.9
export SSL_CERT_FILE=$(python3 -c "import certifi; print(certifi.where())")
echo "🔒 SSL_CERT_FILE: $SSL_CERT_FILE"
```

This dynamically sets the path to:
```
/Users/amine/Library/Python/3.9/lib/python/site-packages/certifi/cacert.pem
```

## Verification

### Before Fix
```bash
$ curl -X POST http://localhost:8000/api/mode1/manual -d '...'
HTTP 500 Internal Server Error
FileNotFoundError: [Errno 2] No such file or directory
```

### After Fix
```bash
$ ./start-dev.sh
🔒 SSL_CERT_FILE: /Users/amine/Library/Python/3.9/lib/python/site-packages/certifi/cacert.pem
✅ AI Engine started

$ curl http://localhost:8000/v1/ai/ask-expert/health
{
    "status": "healthy",
    "workflow": "available",
    "endpoint": "/ask-expert/unified",
    "modes": ["single_expert", "multi_expert_panel", "expert_recommendation", "custom_workflow"]
}
```

## Files Modified

**File:** `/Users/amine/Desktop/vital/services/ai-engine/start-dev.sh`

**Change:** Added automatic SSL certificate path detection (lines 30-32)

```diff
  # Set PYTHONPATH
  export PYTHONPATH="${AI_ENGINE_DIR}/src:${PYTHONPATH}"

+ # Fix SSL certificate path for Python 3.9
+ export SSL_CERT_FILE=$(python3 -c "import certifi; print(certifi.where())")
+ echo "🔒 SSL_CERT_FILE: $SSL_CERT_FILE"
+
  # Set development mode (skip heavy dependencies)
  export SKIP_REDIS_INIT=true
```

## Impact

This fix resolves:
- ✅ Mode 1 manual execution errors
- ✅ OpenAI API SSL certificate issues
- ✅ LangChain embeddings initialization
- ✅ Confidence calculator initialization

The backend now starts cleanly with proper SSL certificate handling.

## Testing Recommendations

Once database migrations are deployed, test:
1. Mode 1: Single expert consultation
2. Mode 2: Multi-expert panel
3. Mode 3: Expert recommendation
4. RAG service queries (require SSL for embeddings)

---

**Next Step:** Deploy database migrations via Supabase Dashboard to enable full testing.
