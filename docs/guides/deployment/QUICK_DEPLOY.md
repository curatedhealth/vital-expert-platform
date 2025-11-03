# Quick Deploy Commands - Copy & Paste

## 1. Link to Railway
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway link -p vital-ai-engine
```

## 2. Set Variables (All at Once)
```bash
railway variables \
  --set "OPENAI_API_KEY=<your-openai-api-key>" \
  --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co" \
  --set "SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>" \
  --set "ENVIRONMENT=production" \
  --set "LOG_LEVEL=info"
```

**Replace:**
- `<your-openai-api-key>` with your actual OpenAI API key
- `<your-supabase-service-role-key>` with your actual Supabase service role key

## 3. Deploy
```bash
railway up
```

## 4. Verify
```bash
# Get the URL
railway domain

# Test health endpoint (replace URL with yours)
curl https://your-service-url.up.railway.app/health
```

---

## Alternative: Set Variables One at a Time

If the multi-line command doesn't work, set them individually:

```bash
railway variables --set "OPENAI_API_KEY=your-key-here"
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=your-key-here"
railway variables --set "ENVIRONMENT=production"
railway variables --set "LOG_LEVEL=info"
```

Then deploy:
```bash
railway up
```
