# Copy-Paste Reference - All Values

## Marketing Site Project

### Project Configuration
```
Project Name: vital-marketing-site
Framework: Next.js
Root Directory: apps/digital-health-startup
```

### Environment Variables (4 total)
```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY

NEXT_PUBLIC_APP_URL=https://www.vital.expert

NODE_ENV=production
```

### Domains
```
www.vital.expert
vital.expert (redirect to www)
```

---

## Platform App Project

### Project Configuration
```
Project Name: vital-platform-app
Framework: Next.js
Root Directory: apps/digital-health-startup
```

### Environment Variables (15 total)

**Public Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY

NEXT_PUBLIC_APP_URL=https://app.vital.expert

NODE_ENV=production

NEXT_PUBLIC_ENABLE_MULTI_TENANT=true

NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001

NEXT_PUBLIC_ENABLE_ANALYTICS=true

NEXT_PUBLIC_ENABLE_DEBUG=false
```

**⚠️ IMPORTANT: All environment variables are now consolidated in ONE file**

**Location:** `apps/digital-health-startup/.env.local`

**Setup:** See `ENVIRONMENT_SETUP.md` for complete configuration guide.

All API keys, secrets, and configuration should be added to `.env.local` only.

### Domains
```
*.vital.expert (wildcard)
app.vital.expert
```

---

## DNS Configuration

### At Your DNS Provider:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com
```

---

## Quick Links

**Vercel Dashboard:**
https://vercel.com/crossroads-catalysts-projects

**Import New Project:**
https://vercel.com/new

**GitHub Repo:**
curatedhealth/vital-expert-platform

**Branch:**
restructure/world-class-architecture
