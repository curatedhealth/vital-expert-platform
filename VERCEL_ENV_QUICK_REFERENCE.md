# 🔑 Vercel Environment Variables - Quick Reference

Copy-paste this list into Vercel Dashboard → Settings → Environment Variables

---

## ✅ REQUIRED (Must Have)

| Variable | Example Value | Where to Get |
|----------|--------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc123.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Dashboard → Settings → API (Service Role) |
| `DATABASE_URL` | `postgresql://postgres:pass@db.abc.supabase.co:5432/postgres` | Supabase Dashboard → Settings → Database |
| `REDIS_URL` | `redis://default:pass@redis-12345.upstash.io:6379` | Upstash Dashboard or local Redis |
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
| `JWT_SECRET` | (Generate: `openssl rand -base64 32`) | Generate locally |
| `ENCRYPTION_KEY` | (Generate: `openssl rand -base64 32`) | Generate locally |
| `CSRF_SECRET` | (Generate: `openssl rand -base64 32`) | Generate locally |

---

## 🎯 HIGHLY RECOMMENDED

| Variable | Example Value | Where to Get |
|----------|--------------|--------------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...@o...ingest.sentry.io/...` | Sentry Dashboard → Settings → Projects → vital-frontend → Keys |
| `PYTHON_AI_ENGINE_URL` | `https://vital-ai-engine.railway.app` | Railway Dashboard → Service → Settings |
| `NEXT_PUBLIC_API_URL` | `https://vital-ai-engine.railway.app` | Railway Dashboard → Service → Settings |

---

## 🚀 OPTIONAL LLM PROVIDERS (Add at least 1-2)

| Variable | Example Value | Where to Get | Use Case |
|----------|--------------|--------------|----------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com/settings/keys | Medical reasoning |
| `GOOGLE_API_KEY` | `AIzaSy...` | https://makersuite.google.com/app/apikey | Cost-effective |
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com/keys | Fast responses (FREE) |
| `TOGETHER_API_KEY` | `...` | https://api.together.xyz/settings/api-keys | Open source models |
| `HUGGINGFACE_API_KEY` | `hf_...` | https://huggingface.co/settings/tokens | Medical models |

---

## ⚙️ OPTIONAL CONFIGURATION

| Variable | Example Value | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://vital.expert` | Your production URL |
| `ENABLE_RATE_LIMITING` | `true` | Enable rate limiting |
| `HIPAA_ENABLED` | `true` | HIPAA compliance mode |
| `GDPR_ENABLED` | `true` | GDPR compliance mode |
| `DEBUG` | `false` | Disable in production |

---

## 📋 How to Add to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/your-team/vital-expert
2. Click **Settings** → **Environment Variables**
3. For each variable above:
   - Click **Add New**
   - Enter **Key** (e.g., `OPENAI_API_KEY`)
   - Enter **Value** (e.g., `sk-proj-...`)
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**
4. After adding all variables, redeploy:
   - Go to **Deployments**
   - Click **⋯** on latest deployment → **Redeploy**

### Option 2: Vercel CLI

```bash
# Add one at a time
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add ENCRYPTION_KEY
vercel env add CSRF_SECRET
vercel env add NEXT_PUBLIC_SENTRY_DSN
vercel env add PYTHON_AI_ENGINE_URL
vercel env add NEXT_PUBLIC_API_URL

# Optional LLM providers
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_API_KEY
vercel env add GROQ_API_KEY

# Redeploy
vercel --prod
```

### Option 3: Bulk Import (Fastest)

1. Create a file `vercel-env.txt`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=...
ENCRYPTION_KEY=...
CSRF_SECRET=...
NEXT_PUBLIC_SENTRY_DSN=https://...
PYTHON_AI_ENGINE_URL=https://vital-ai-engine.railway.app
NEXT_PUBLIC_API_URL=https://vital-ai-engine.railway.app
```

2. Import via CLI:
```bash
vercel env pull .env.production
# Copy values from vercel-env.txt
vercel env add < vercel-env.txt  # Not supported, must add manually
```

**Note**: Vercel doesn't support bulk import via CLI. Use the dashboard for fastest bulk import.

---

## 🔐 Security Keys Generation

Generate all security keys at once:

```bash
# Run this in your terminal
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "CSRF_SECRET=$(openssl rand -base64 32)"
```

Copy the output and paste into Vercel.

---

## ✅ Verification Checklist

After adding all variables to Vercel:

- [ ] All REQUIRED variables added (9 total)
- [ ] All HIGHLY RECOMMENDED variables added (3 total)
- [ ] At least 1 LLM provider added (OpenAI is required)
- [ ] Security keys are 32+ characters
- [ ] Variables set for **Production**, **Preview**, and **Development**
- [ ] Redeployed after adding variables
- [ ] Check deployment logs for errors
- [ ] Test production site: https://vital.expert
- [ ] Check Sentry for any errors

---

## 🆘 Troubleshooting

### Build fails with "Missing environment variable"
1. Check deployment logs for which variable is missing
2. Add the variable to Vercel dashboard
3. Make sure it's enabled for "Production" environment
4. Redeploy

### API calls fail in production
1. Check if `PYTHON_AI_ENGINE_URL` is correct
2. Verify Railway backend is running
3. Check Sentry for detailed error messages
4. Verify all LLM API keys are valid

### Page loads but features don't work
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_*` variables are set (they're needed client-side)
3. Check Network tab for failed API calls
4. Review Sentry issues

---

## 📚 Full Documentation

- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)** - Complete list of all 50+ variables
- **[MULTI_LLM_SETUP_GUIDE.md](./MULTI_LLM_SETUP_GUIDE.md)** - Detailed setup guide
- **[MULTI_LLM_COMPLETE.md](./MULTI_LLM_COMPLETE.md)** - Summary of changes

---

## 🎉 Quick Copy-Paste Template

```bash
# === REQUIRED ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
JWT_SECRET=
ENCRYPTION_KEY=
CSRF_SECRET=

# === RECOMMENDED ===
NEXT_PUBLIC_SENTRY_DSN=
PYTHON_AI_ENGINE_URL=https://vital-ai-engine.railway.app
NEXT_PUBLIC_API_URL=https://vital-ai-engine.railway.app

# === OPTIONAL LLM ===
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=

# === CONFIG ===
NEXT_PUBLIC_APP_URL=https://vital.expert
ENABLE_RATE_LIMITING=true
HIPAA_ENABLED=true
GDPR_ENABLED=true
DEBUG=false
```

Fill in the values and add to Vercel! 🚀

