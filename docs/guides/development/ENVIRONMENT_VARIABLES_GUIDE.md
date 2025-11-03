# 🔐 ENVIRONMENT VARIABLES TEMPLATE

**Purpose:** Copy this template and fill in your actual values  
**Location:** Use in Railway/Modal environment configuration  
**Security:** NEVER commit actual keys to git  

---

## ✅ REQUIRED (Service Won't Start Without These)

```bash
# ============================================
# OpenAI API (CRITICAL)
# ============================================
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# ============================================
# Supabase Database (CRITICAL)
# ============================================
# Get from: Your Supabase project → Settings → API
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxx...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxx...

# Database connection (from Supabase → Settings → Database → Connection String)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## ⚠️ HIGHLY RECOMMENDED (Service Works But Limited)

```bash
# ============================================
# Tavily Web Search API (for web tools)
# ============================================
# Get from: https://tavily.com → Sign up → API Keys
TAVILY_API_KEY=tvly-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# LangFuse Monitoring (for observability)
# ============================================
# Get from: https://cloud.langfuse.com → Project → Settings
LANGFUSE_PUBLIC_KEY=pk-lf-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
LANGFUSE_SECRET_KEY=sk-lf-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
LANGFUSE_HOST=https://cloud.langfuse.com
```

---

## 🟢 OPTIONAL (Has Fallbacks)

```bash
# ============================================
# Redis Caching (Railway auto-provides)
# ============================================
# Railway: Use ${{Redis.REDIS_URL}} (auto-populated)
# Manual: redis://default:password@host:port
REDIS_URL=redis://default:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@redis.railway.internal:6379

# ============================================
# Application Configuration
# ============================================
# Railway auto-sets PORT, no need to specify
PORT=8000

# Environment
ENVIRONMENT=production  # or staging, development
LOG_LEVEL=INFO  # or DEBUG, WARNING, ERROR

# ============================================
# Security Configuration
# ============================================
# CORS - Update with your actual frontend domain
CORS_ORIGINS=https://app.yourdomain.com,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Admin API Key - Generate with: openssl rand -base64 32
ADMIN_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# Performance Tuning
# ============================================
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT_SECONDS=300
AGENT_TIMEOUT_SECONDS=300

# Tool Configuration
WEB_SEARCH_MAX_RESULTS=10
SCRAPER_TIMEOUT_SECONDS=30

# Memory Configuration
MEMORY_RECALL_LIMIT=10
MEMORY_CACHE_TTL_SECONDS=300

# ============================================
# Feature Flags (Optional)
# ============================================
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_COST_TRACKING=true
ENABLE_MEMORY_PERSISTENCE=true
```

---

## 📋 QUICK START CHECKLIST

### Before Deployment, Make Sure You Have:

**Critical (Must Have):**
- [ ] OpenAI API key (`OPENAI_API_KEY`)
- [ ] Supabase URL (`SUPABASE_URL`)
- [ ] Supabase Service Key (`SUPABASE_SERVICE_KEY`)

**Highly Recommended:**
- [ ] Tavily API key (`TAVILY_API_KEY`) - for web search
- [ ] LangFuse keys (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`) - for monitoring

**Optional:**
- [ ] Redis URL (if not using Railway auto-provision)
- [ ] Admin API key (generate secure key)
- [ ] Custom CORS origins (your frontend domain)

---

## 🔒 SECURITY BEST PRACTICES

### DO ✅
- ✅ Use environment variables (never hardcode)
- ✅ Keep service keys secret (never commit to git)
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use different keys for staging/production
- ✅ Generate strong admin API keys (32+ characters)
- ✅ Limit CORS to specific domains (not *)
- ✅ Enable rate limiting in production

### DON'T ❌
- ❌ Commit `.env` files to git
- ❌ Share keys in chat/email
- ❌ Use same keys across environments
- ❌ Use weak admin API keys
- ❌ Allow CORS from * in production
- ❌ Leave debug mode on in production
- ❌ Expose service keys in client code

---

## 🛠️ HOW TO GET EACH KEY

### OpenAI API Key:
1. Go to https://platform.openai.com
2. Sign in or create account
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy immediately (won't show again)
6. **Cost:** Pay per use (~$0.01-0.10 per query)

### Supabase Keys:
1. Go to your Supabase project
2. Settings → API
3. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_KEY`
4. Settings → Database → Connection String → Copy `DATABASE_URL`
5. **Cost:** Free tier available, paid plans from $25/month

### Tavily API Key:
1. Go to https://tavily.com
2. Sign up for account
3. Go to API section
4. Copy your API key
5. **Cost:** Free tier: 1000 searches/month, paid from $50/month

### LangFuse Keys:
1. Go to https://cloud.langfuse.com
2. Create account
3. Create project
4. Settings → API Keys
5. Copy public and secret keys
6. **Cost:** Free tier: 50k events/month, paid from $59/month

### Redis URL (if manual):
1. **Railway:** Automatically provided as `${{Redis.REDIS_URL}}`
2. **Manual:** Set up Redis server and use connection string
3. **Redis Cloud:** https://redis.com/try-free
4. **Cost:** Railway includes Redis, or Redis Cloud from $0-5/month

---

## 🧪 TESTING YOUR CONFIGURATION

### Test 1: Validate Environment Variables
```bash
# Check all required vars set
echo $OPENAI_API_KEY
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
echo $TAVILY_API_KEY

# Should output: Set (not empty)
```

### Test 2: Test OpenAI Connection
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return: List of models
```

### Test 3: Test Supabase Connection
```bash
curl "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Should return: 200 OK
```

### Test 4: Test Tavily Connection
```bash
curl https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'"$TAVILY_API_KEY"'",
    "query": "test"
  }'

# Should return: Search results
```

---

## 🚨 TROUBLESHOOTING

### Issue: "Invalid OpenAI API key"
**Solution:**
- Check key starts with `sk-proj-` or `sk-`
- Verify no extra spaces
- Check key hasn't been revoked
- Create new key if needed

### Issue: "Cannot connect to Supabase"
**Solution:**
- Verify URL format: `https://xxxxx.supabase.co`
- Check service key (not anon key) for backend
- Verify project is not paused
- Check database connection string format

### Issue: "Tavily API error"
**Solution:**
- Check key starts with `tvly-`
- Verify account has credits
- Check free tier limits (1000/month)

### Issue: "LangFuse not receiving traces"
**Solution:**
- Verify both public and secret keys set
- Check LANGFUSE_HOST is correct
- Verify project is active
- Check network access

---

## 📊 COST ESTIMATION

### Monthly Costs (Estimated for 1000 queries):

**Infrastructure:**
- Railway: $20-50/month (includes Redis, hosting)
- OR Modal: $10-30/month (pay per use)

**API Costs:**
- OpenAI: $10-100/month (depends on model/query length)
- Tavily: $0-50/month (free tier: 1000 searches)
- LangFuse: $0-59/month (free tier: 50k events)

**Total for 1000 queries/month:**
- Low: ~$40/month (Railway + GPT-3.5 + free tiers)
- Medium: ~$100/month (Railway + GPT-4 + paid tiers)
- High: ~$200/month (More queries/complex operations)

**Per Query:**
- Simple: $0.01-0.05
- Complex: $0.10-0.50

---

## ✅ FINAL CHECKLIST

**Before clicking "Deploy", verify:**

- [ ] All REQUIRED vars set correctly ✅
- [ ] All HIGHLY RECOMMENDED vars set ✅
- [ ] CORS_ORIGINS updated (not *) ✅
- [ ] ADMIN_API_KEY generated (secure) ✅
- [ ] Keys tested (all working) ✅
- [ ] No keys committed to git ✅
- [ ] Different keys for staging/prod ✅

**If all checked, you're ready to deploy!** 🚀

---

**Document Status:** ✅ PRODUCTION-READY  
**Last Updated:** November 2, 2025  
**Security Level:** HIGH (never commit actual values)  
**Maintenance:** Update keys every 90 days

**Remember:** Keep this file as a template only. Never commit actual keys. Use your deployment platform's environment variable settings to store real values. 🔐

