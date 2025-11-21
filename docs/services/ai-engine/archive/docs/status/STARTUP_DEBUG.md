# 🔍 Startup Debugging Guide

## Current Status

✅ **Build:** Successful (Nixpacks)
❌ **Healthcheck:** Failing (app not starting)

## Potential Issues

### 1. **Import Path Issues**
- App might not be finding modules correctly
- Working directory might be wrong
- Python path might not be set correctly

### 2. **Virtual Environment**
- Nixpacks creates venv at `/opt/venv`
- PATH should include `/opt/venv/bin`
- Script might not be using venv Python

### 3. **Module Resolution**
- Relative imports in `main.py` might fail
- String vs direct app reference in uvicorn

---

## Recent Fixes Applied

1. ✅ **Explicit working directory:** `os.chdir(script_dir)`
2. ✅ **Python path:** Add `src` to `sys.path`
3. ✅ **String path for uvicorn:** Use `"main:app"` instead of direct reference
4. ✅ **Root path:** Set `root_path` in uvicorn.run()
5. ✅ **Error logging:** Print detailed errors to stderr

---

## How to Debug

### Check Railway Logs

Look for these messages in Railway logs:

**Expected successful startup:**
```
🚀 Starting VITAL AI Engine on port 8000
📂 Working directory: /app
✅ Uvicorn imported successfully
✅ Main module imported successfully
🌐 Starting server on 0.0.0.0:8000
```

**If failing, you'll see:**
```
❌ Failed to import main module: [error details]
[traceback]
```

### Common Errors

**1. ModuleNotFoundError:**
- **Cause:** Dependencies not installed or path wrong
- **Fix:** Check if venv is activated, verify PATH includes `/opt/venv/bin`

**2. ImportError:**
- **Cause:** Relative imports failing
- **Fix:** Verify working directory is correct

**3. No module named 'X':**
- **Cause:** Missing dependency in requirements.txt
- **Fix:** Add to requirements.txt and redeploy

---

## Next Steps

1. Check Railway logs for the actual error message
2. Verify environment variables are set
3. Confirm virtual environment is being used
4. Test import path resolution

---

**Status:** Waiting for Railway logs to identify specific startup failure. ✅

