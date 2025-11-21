# 🔧 Knowledge Pipeline Troubleshooting Guide

## ❌ Error: "Pipeline execution failed"

This error occurs when the Python pipeline script fails to execute. Follow these steps to diagnose and fix the issue.

---

## 🔍 Step 1: Check Console Logs

### Browser Console (Frontend)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for log: `Pipeline API response: { ... }`
4. Note the `status` and `result` details

### Server Console (Backend)
1. Check your Next.js terminal
2. Look for these log messages:
   - `📥 Pipeline execution request received`
   - `📁 Creating temp directory`
   - `💾 Writing config to`
   - `🔍 Checking Python script path`
   - `🚀 Executing command`
   - `✅ Pipeline execution completed` (success)
   - `❌ Pipeline execution error` (failure)

---

## 🐍 Step 2: Verify Python Installation

### Check Python Version
```bash
python3 --version
# Should output: Python 3.8+ (3.10 or 3.11 recommended)
```

### Check if Python3 exists
```bash
which python3
# Should output: /usr/bin/python3 or /usr/local/bin/python3
```

### If Python3 is not found:
**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

---

## 📦 Step 3: Install Python Dependencies

### Navigate to Scripts Directory
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
```

### Install Requirements
```bash
pip3 install -r requirements.txt
```

### Verify Installation
```bash
python3 -c "import aiohttp, bs4, supabase; print('✅ All dependencies installed')"
```

**If you see errors**, install missing packages individually:
```bash
pip3 install aiohttp
pip3 install beautifulsoup4
pip3 install supabase
pip3 install sentence-transformers
pip3 install python-dotenv
pip3 install backoff
```

---

## 🔐 Step 4: Check Environment Variables

### Verify .env.local exists
```bash
ls -la "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/.env.local"
```

### Check Required Variables
Open `.env.local` and verify these exist:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key...
```

### Optional (for Pinecone):
```bash
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment
```

---

## 🧪 Step 5: Test Python Script Manually

### Create Test Config
Create `/tmp/test-config.json`:
```json
{
  "sources": [
    {
      "url": "https://example.com",
      "domain": "digital_health",
      "category": "test",
      "tags": ["test"],
      "priority": "medium",
      "description": "Test source"
    }
  ],
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

### Run Script Manually
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"

# Dry run (no uploads)
python3 knowledge-pipeline.py --config /tmp/test-config.json --dry-run

# If that works, check what error you get without dry-run:
python3 knowledge-pipeline.py --config /tmp/test-config.json
```

### Common Errors and Fixes:

#### Error: "No module named 'aiohttp'"
```bash
pip3 install aiohttp
```

#### Error: "No module named 'bs4'"
```bash
pip3 install beautifulsoup4
```

#### Error: "No module named 'supabase'"
```bash
pip3 install supabase
```

#### Error: "SUPABASE_URL not found"
Your environment variables aren't being loaded. The script looks for:
1. `.env.local` (in Next.js apps directory)
2. `.env.vercel` (in root)
3. `.env` (in scripts directory)

**Fix**: Create `.env` in scripts directory:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

---

## 📂 Step 6: Check File Permissions

### Make Script Executable
```bash
chmod +x "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge-pipeline.py"
```

### Check Script Exists
```bash
ls -la "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge-pipeline.py"
```

---

## 🌐 Step 7: Check Network Access

### Test URL Access
```bash
curl -I https://example.com
# Should return: HTTP/1.1 200 OK
```

### Test Supabase Connection
```bash
curl -H "apikey: your-anon-key" \
     "https://your-project.supabase.co/rest/v1/"
# Should return: {"message": "..."}
```

---

## 🔄 Step 8: Restart Development Server

Sometimes the Next.js server needs a restart:

```bash
# Stop current server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart server
pnpm dev
# or
npm run dev
```

---

## 📋 Step 9: Check Temp Directory

### Verify Temp Files are Created
```bash
ls -la "/Users/hichamnaim/Downloads/Cursor/VITAL path/temp/"
```

You should see files like:
- `pipeline-config-1699200300000.json`

### If No Files:
The API route isn't being called. Check:
1. Browser Network tab (DevTools)
2. Look for POST to `/api/pipeline/run`
3. Check request payload

---

## 🐛 Common Error Codes

### Error Code: ENOENT
**Meaning**: File or directory not found

**Fix**: Check paths in API route:
```typescript
const scriptsDir = path.join(process.cwd(), 'scripts');
const pythonScript = path.join(scriptsDir, 'knowledge-pipeline.py');
console.log('Script path:', pythonScript); // Should match actual file location
```

### Error Code: EACCES
**Meaning**: Permission denied

**Fix**:
```bash
chmod +x "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge-pipeline.py"
```

### Error Code: 127
**Meaning**: Command not found (python3 doesn't exist)

**Fix**: Install Python or use `python` instead of `python3`

### Error Code: 1
**Meaning**: Python script error (check script output)

**Fix**: Run script manually to see actual error

---

## 🔍 Step 10: Enable Verbose Logging

### Update API Route for More Logs
Already done in latest version! Check your server console for:
- `📥 Pipeline execution request received`
- `📁 Creating temp directory`
- `💾 Writing config to`
- `🔍 Checking Python script path`
- `🚀 Executing command`

### Update Frontend for More Logs
Already done! Check browser console for:
- `Pipeline API response: { ... }`

---

## 🧰 Quick Diagnostic Script

Run this in your terminal:

```bash
#!/bin/bash
echo "🔍 Knowledge Pipeline Diagnostics"
echo "=================================="

echo ""
echo "1. Python Version:"
python3 --version || echo "❌ Python3 not found"

echo ""
echo "2. Python Location:"
which python3 || echo "❌ Python3 not in PATH"

echo ""
echo "3. Python Dependencies:"
python3 -c "import aiohttp; print('✅ aiohttp')" 2>/dev/null || echo "❌ aiohttp missing"
python3 -c "import bs4; print('✅ beautifulsoup4')" 2>/dev/null || echo "❌ beautifulsoup4 missing"
python3 -c "import supabase; print('✅ supabase')" 2>/dev/null || echo "❌ supabase missing"

echo ""
echo "4. Pipeline Script:"
if [ -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/knowledge-pipeline.py" ]; then
    echo "✅ Script exists"
else
    echo "❌ Script not found"
fi

echo ""
echo "5. Environment Variables:"
if [ -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup/.env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "❌ .env.local not found"
fi

echo ""
echo "6. Temp Directory:"
if [ -d "/Users/hichamnaim/Downloads/Cursor/VITAL path/temp" ]; then
    echo "✅ Temp directory exists"
    ls -la "/Users/hichamnaim/Downloads/Cursor/VITAL path/temp" | tail -5
else
    echo "⚠️  Temp directory doesn't exist (will be created)"
fi

echo ""
echo "=================================="
echo "Diagnostics complete!"
```

Save as `diagnose.sh` and run:
```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## 🎯 Most Common Issues & Quick Fixes

### Issue 1: Python Not Installed
**Symptom**: "python3: command not found"  
**Fix**: `brew install python3` (macOS) or `apt install python3` (Linux)

### Issue 2: Missing Dependencies
**Symptom**: "No module named 'aiohttp'"  
**Fix**: `pip3 install -r scripts/requirements.txt`

### Issue 3: Environment Variables Missing
**Symptom**: "SUPABASE_URL not found"  
**Fix**: Create `scripts/.env` with required variables

### Issue 4: Script Not Executable
**Symptom**: "Permission denied"  
**Fix**: `chmod +x scripts/knowledge-pipeline.py`

### Issue 5: Wrong Working Directory
**Symptom**: "FileNotFoundError" or "No such file"  
**Fix**: API route now sets `cwd: scriptsDir`

---

## ✅ Verification Checklist

Before running pipeline, verify:

- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] All dependencies installed (`pip3 list | grep aiohttp`)
- [ ] Environment variables set (`.env.local` exists)
- [ ] Script exists and is executable (`ls -la scripts/knowledge-pipeline.py`)
- [ ] Next.js dev server running (`pnpm dev`)
- [ ] Browser console open (F12)
- [ ] Server console visible (terminal)

---

## 🆘 Still Having Issues?

### Collect This Information:

1. **Python Version**: `python3 --version`
2. **Server Console Output**: Copy all logs from terminal
3. **Browser Console Output**: Copy errors from DevTools
4. **Error Message**: Full error text from UI
5. **Config File**: Your sources JSON (remove sensitive data)

### Test Command:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
python3 knowledge-pipeline.py --help
```

This should show usage information. If it doesn't, there's an issue with the script itself.

---

## 🔄 Reset Everything (Last Resort)

If nothing works, do a complete reset:

```bash
# 1. Reinstall Python dependencies
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
pip3 uninstall -y -r requirements.txt
pip3 install -r requirements.txt

# 2. Clear Next.js cache
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
rm -rf .next
rm -rf temp

# 3. Restart server
pnpm dev
```

---

*Troubleshooting Guide v1.0 - November 5, 2025*  
*For additional help, check server and browser console logs*

