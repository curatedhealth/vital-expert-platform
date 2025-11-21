# Architecture Clarification

## Current Service Ports

| Port | Service | Status | Purpose |
|------|---------|--------|---------|
| 3000 | Next.js Frontend (digital-health-startup) | ✅ Running | User interface |
| 3001 | Node.js API Gateway | ❌ NOT Running | Auth + Proxy to AI Engine |
| 8000 | Python AI Engine (FastAPI) | ✅ Running | AI/ML processing |

## The Confusion

### What I Did (Direct Connection):
```
Frontend (3000) → AI Engine (8000) ❌
```
**Problem**: Skips authentication and tenant isolation

### What Should Happen (Proper Flow):
```
Frontend (3000) → API Gateway (3001) → AI Engine (8000) ✅
```
**Benefit**: Includes authentication, rate limiting, tenant isolation

## Why Direct to 8000 Was Working Locally

Port 8000 (AI Engine) DOES have the Mode endpoints:
- `/api/mode1/manual` ✅
- `/api/mode2/automatic` ✅  
- `/api/mode3/autonomous-automatic` ✅
- `/api/mode4/autonomous-manual` ✅

So technically it works, BUT:
- ❌ No authentication
- ❌ No rate limiting
- ❌ No tenant isolation
- ❌ Not production-ready

## Solution Options

### Option 1: Start API Gateway (Port 3001) - RECOMMENDED
Start the API Gateway so requests flow properly:
```bash
cd services/api-gateway
npm install
npm start
```

Then **revert my changes** to use port 3001:
```typescript
const API_GATEWAY_URL = 'http://localhost:3001'; // ✅ Proper
```

### Option 2: Keep Direct Connection (Development Only)
Keep using port 8000 directly for local development:
```typescript
const API_GATEWAY_URL = 'http://localhost:8000'; // ⚠️ Development only
```

**Pros**: Simpler, no auth headaches  
**Cons**: Not production-ready

## What Do You Want To Do?

1. **Start API Gateway (3001)** and use proper flow?
2. **Keep direct AI Engine (8000)** for simpler local dev?

Let me know and I'll help you set it up properly!

