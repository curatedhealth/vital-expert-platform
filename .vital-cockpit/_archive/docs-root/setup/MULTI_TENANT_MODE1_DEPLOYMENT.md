# Multi-Tenant Mode 1 Deployment Guide

This guide covers deploying Mode 1 Interactive Manual in a multi-tenant environment with subdomain-based tenant isolation.

---

## 🏢 Multi-Tenant Architecture

### Tenant Subdomains

Your application runs on three subdomains:

| Subdomain | URL | Tenant |
|-----------|-----|--------|
| **vital-system** | http://vital-system.localhost:3000 | VITAL System (Main) |
| **pharma** | http://pharma.localhost:3000 | Pharmaceutical Companies |
| **digital-health** | http://digital-health.localhost:3000 | Digital Health Startups |

### How It Works

```
User visits: http://pharma.localhost:3000/ask-expert
    ↓
Frontend detects subdomain: "pharma"
    ↓
Maps to tenant_id: "pharma-tenant-uuid"
    ↓
Sends to API: /api/ask-expert/mode1/chat
    ↓
API includes tenant_id in request to Python backend
    ↓
Python backend filters all queries by tenant_id
    ↓
Response returned to pharma subdomain
```

---

## 📝 Environment Variables Setup

### Backend (services/ai-engine/.env.local)

**Already configured!** ✅ Your current file works as-is.

Just ensure:
```bash
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE
```

### Frontend (All apps need .env.local)

Create `.env.local` in **each app**:

#### 1. apps/vital-system/.env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE
AI_ENGINE_URL=http://localhost:8080
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
PINECONE_API_KEY=YOUR_PINECONE_API_KEY_HERE
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1-aws
NEXT_PUBLIC_TENANT_ID=vital-system
NEXT_PUBLIC_APP_URL=http://vital-system.localhost:3000
COOKIE_DOMAIN=.localhost
```

#### 2. apps/pharma/.env.local
```bash
# Same as above, but change:
NEXT_PUBLIC_TENANT_ID=pharma
NEXT_PUBLIC_APP_URL=http://pharma.localhost:3000
```

#### 3. apps/digital-health-startup/.env.local
```bash
# Same as above, but change:
NEXT_PUBLIC_TENANT_ID=digital-health
NEXT_PUBLIC_APP_URL=http://digital-health.localhost:3000
```

---

## 🚀 Deployment Steps

### Step 1: Update Backend CORS (Python)

Edit: `services/ai-engine/src/api/main.py`

```python
# Add CORS middleware for multi-tenant
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://vital-system.localhost:3000",
        "http://pharma.localhost:3000",
        "http://digital-health.localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Or use environment variable:
```python
import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

And in `.env.local`:
```bash
ALLOWED_ORIGINS=http://vital-system.localhost:3000,http://pharma.localhost:3000,http://digital-health.localhost:3000
```

---

### Step 2: Start Python Backend (Terminal 1)

```bash
cd services/ai-engine
uvicorn src.api.main:app --reload --port 8080
```

**Verify**:
```bash
curl http://localhost:8080/api/mode1/health
```

---

### Step 3: Start Each Frontend App

#### Terminal 2: VITAL System
```bash
cd apps/vital-system
npm run dev -- --port 3001
```

#### Terminal 3: Pharma
```bash
cd apps/pharma
npm run dev -- --port 3002
```

#### Terminal 4: Digital Health
```bash
cd apps/digital-health-startup
npm run dev -- --port 3000
```

---

### Step 4: Configure Local DNS (Subdomains)

#### Option A: Edit /etc/hosts (Recommended for local dev)

```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1 vital-system.localhost
127.0.0.1 pharma.localhost
127.0.0.1 digital-health.localhost
```

Save and exit.

#### Option B: Use a reverse proxy (nginx)

Create `nginx.conf`:
```nginx
server {
    listen 3000;
    server_name vital-system.localhost;
    location / {
        proxy_pass http://localhost:3001;
    }
}

server {
    listen 3000;
    server_name pharma.localhost;
    location / {
        proxy_pass http://localhost:3002;
    }
}

server {
    listen 3000;
    server_name digital-health.localhost;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

Start nginx:
```bash
nginx -c /path/to/nginx.conf
```

---

## 🧪 Testing Multi-Tenant Mode 1

### Test Tenant 1: VITAL System
```bash
# Open browser
open http://vital-system.localhost:3000/ask-expert

# Or curl
curl -X POST http://vital-system.localhost:3000/api/ask-expert/mode1/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: tenant=vital-system" \
  -d '{
    "agentId": "agent-id",
    "message": "Test from VITAL System"
  }'
```

### Test Tenant 2: Pharma
```bash
# Open browser
open http://pharma.localhost:3000/ask-expert

# Or curl
curl -X POST http://pharma.localhost:3000/api/ask-expert/mode1/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: tenant=pharma" \
  -d '{
    "agentId": "agent-id",
    "message": "Test from Pharma"
  }'
```

### Test Tenant 3: Digital Health
```bash
# Open browser
open http://digital-health.localhost:3000/ask-expert
```

---

## 🔒 Tenant Isolation Verification

### 1. Check Tenant ID Extraction

The API route should extract tenant from subdomain:

```typescript
// apps/*/src/app/api/ask-expert/mode1/chat/route.ts

export async function POST(request: NextRequest) {
  // Extract tenant from subdomain
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  
  // Map subdomain to tenant ID
  const tenantMapping: Record<string, string> = {
    'vital-system': process.env.TENANT_VITAL_SYSTEM_ID!,
    'pharma': process.env.TENANT_PHARMA_ID!,
    'digital-health': process.env.TENANT_DIGITAL_HEALTH_ID!,
  };
  
  const tenantId = tenantMapping[subdomain] || subdomain;
  
  // Get user (should be filtered by tenant)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Verify user belongs to this tenant
  const { data: userTenant } = await supabase
    .from('user_tenants')
    .select('*')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single();
  
  if (!userTenant) {
    return new Response('Unauthorized - Wrong tenant', { status: 403 });
  }
  
  // Continue with request...
}
```

### 2. Verify Database Isolation

Test that each tenant only sees their own data:

```sql
-- Test isolation: Pharma should only see pharma agents
SELECT * FROM agents WHERE tenant_id = 'pharma-tenant-id';

-- Test isolation: VITAL System should only see their agents
SELECT * FROM agents WHERE tenant_id = 'vital-system-tenant-id';

-- Verify RLS policies are working
SELECT * FROM ask_expert_sessions; -- Should be filtered by tenant
```

---

## 📊 Monitoring Multi-Tenant

### Check Tenant Usage

```sql
-- Sessions per tenant
SELECT 
  s.tenant_id,
  t.name as tenant_name,
  COUNT(*) as total_sessions,
  SUM(s.total_messages) as total_messages,
  SUM(s.total_tokens) as total_tokens,
  SUM(s.total_cost) as total_cost
FROM ask_expert_sessions s
JOIN tenants t ON s.tenant_id = t.id
WHERE s.mode = 'mode_1_interactive_manual'
GROUP BY s.tenant_id, t.name
ORDER BY total_sessions DESC;
```

### Backend Logs by Tenant

```bash
# Filter logs by tenant
grep "tenant_id.*vital-system" services/ai-engine/ai-engine.log
grep "tenant_id.*pharma" services/ai-engine/ai-engine.log
grep "tenant_id.*digital-health" services/ai-engine/ai-engine.log
```

---

## 🐛 Troubleshooting

### Issue: Subdomain not resolving

**Solution 1**: Check `/etc/hosts`
```bash
cat /etc/hosts | grep localhost
# Should show:
# 127.0.0.1 vital-system.localhost
# 127.0.0.1 pharma.localhost
# 127.0.0.1 digital-health.localhost
```

**Solution 2**: Flush DNS cache
```bash
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

### Issue: Wrong tenant data showing

**Check**: Tenant ID extraction
```typescript
console.log('Host:', request.headers.get('host'));
console.log('Subdomain:', subdomain);
console.log('Tenant ID:', tenantId);
```

**Verify**: RLS policies are enabled
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'ask_expert_sessions', 'ask_expert_messages');
```

### Issue: CORS errors between subdomains

**Check**: CORS configuration allows all subdomains
```python
# In main.py
allow_origins=[
    "http://vital-system.localhost:3000",
    "http://pharma.localhost:3000", 
    "http://digital-health.localhost:3000",
]
```

---

## 🎯 Quick Start Commands

```bash
# Terminal 1: Python Backend
cd services/ai-engine
uvicorn src.api.main:app --reload --port 8080

# Terminal 2: VITAL System
cd apps/vital-system
npm run dev -- --port 3001

# Terminal 3: Pharma
cd apps/pharma  
npm run dev -- --port 3002

# Terminal 4: Digital Health
cd apps/digital-health-startup
npm run dev -- --port 3000

# Test all three:
open http://vital-system.localhost:3000/ask-expert
open http://pharma.localhost:3000/ask-expert
open http://digital-health.localhost:3000/ask-expert
```

---

## ✅ Multi-Tenant Checklist

- [ ] Backend CORS configured for all subdomains
- [ ] Each app has its own `.env.local`
- [ ] `/etc/hosts` configured with subdomains
- [ ] Backend running on port 8080
- [ ] Each frontend running on different port
- [ ] Can access all three subdomains
- [ ] Tenant isolation working (each sees only their data)
- [ ] Mode 1 works on all three subdomains
- [ ] Sessions are tenant-specific
- [ ] Agents are tenant-specific

---

**Ready for multi-tenant Mode 1!** 🚀🏢

Each tenant will have isolated conversations, agents, and sessions.


