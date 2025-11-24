# Deploy AI Engine to Railway - 3 Simple Steps

**Fix Applied:** ✅ pip is now included in nixpacks.toml

---

## Step 1: Link to Railway Project

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway link -p vital-ai-engine
```

When prompted, select:
- **Environment:** production

---

## Step 2: Set Environment Variables

```bash
# Set all variables in one command (replace <your-key> with actual values)
railway variables \
  --set "OPENAI_API_KEY=<your-openai-api-key>" \
  --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co" \
  --set "SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>" \
  --set "ENVIRONMENT=production" \
  --set "LOG_LEVEL=info"
```

**Or set them one at a time:**
```bash
railway variables --set "OPENAI_API_KEY=your-key-here"
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=your-key-here"
railway variables --set "ENVIRONMENT=production"
railway variables --set "LOG_LEVEL=info"
```

**Or use Railway Dashboard:**
1. Go to https://railway.app/project/dffb9616-2d0c-4367-9252-9c14d6d16802
2. Click on your service
3. Go to "Variables" tab
4. Add each variable

---

## Step 3: Deploy

```bash
railway up
```

**Expected output:**
```
╔═══════════════════════ Nixpacks v1.38.0 ══════════════════════╗
║ setup      │ python311, python311Packages.pip, gcc            ║
║ install    │ python3 -m pip install --upgrade pip             ║
║            │ python3 -m pip install -r requirements.txt       ║
║ start      │ uvicorn src.main:app --host 0.0.0.0 --port $PORT ║
╚═══════════════════════════════════════════════════════════════╝

Building...
[1/7] FROM ghcr.io/railwayapp/nixpacks
[2/7] WORKDIR /app/
[3/7] COPY .nixpacks/nixpkgs-*.nix
[4/7] RUN nix-env -if .nixpacks/nixpkgs-*.nix
[5/7] COPY . /app/.
[6/7] RUN python3 -m pip install --upgrade pip       ✅
[7/7] RUN python3 -m pip install -r requirements.txt ✅

✅ Deployment successful!
```

---

## Verify Deployment

### Get your service URL:
```bash
railway domain
```

### Test health endpoint:
```bash
curl https://your-url.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "ai-engine",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## Troubleshooting

### If railway link fails:
Try interactive link:
```bash
railway link
```
Then select your project from the list.

### If deployment fails:
View logs:
```bash
railway logs
```

### If "pip: command not found" appears:
Check that nixpacks.toml has this:
```bash
cat nixpacks.toml | grep -A3 "\[phases.setup\]"
```

Should show:
```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip", "gcc"]
```

---

## What Changed (The Fix)

**Before:**
```toml
nixPkgs = ["python3", "gcc"]  # ❌ pip missing
```

**After:**
```toml
nixPkgs = ["python311", "python311Packages.pip", "gcc"]  # ✅ pip included
```

This ensures pip is available during the install phase.

---

## That's It!

Just 3 commands:
```bash
# 1. Link
railway link -p vital-ai-engine

# 2. Set variables (via CLI or Dashboard)
railway variables set OPENAI_API_KEY="..."

# 3. Deploy
railway up
```

Once deployed, you'll get a URL like:
`https://vital-ai-engine-production.up.railway.app`

Save this URL - you'll need it for the API Gateway deployment next.
