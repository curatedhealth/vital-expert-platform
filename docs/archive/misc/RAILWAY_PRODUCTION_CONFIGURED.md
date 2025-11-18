# RAILWAY PRODUCTION CONFIGURATION ✅

**Railway Production URL**: `vital-expert-platform-production.up.railway.app`
**Status**: ✅ CONFIGURED

---

## ✅ CHANGES APPLIED

### Updated `.env.local`:
```bash
# Before
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# After (Railway Production)
API_GATEWAY_URL=https://vital-expert-platform-production.up.railway.app
NEXT_PUBLIC_API_GATEWAY_URL=https://vital-expert-platform-production.up.railway.app
```

---

## 🏗️ ARCHITECTURE (PRODUCTION)

```
Frontend (localhost:3000)
    ↓
POST /api/ask-expert/orchestrate
    ↓
mode1-manual-interactive.ts
    ↓
fetch(`${API_GATEWAY_URL}/api/mode1/manual`)
    ↓
Railway API Gateway (vital-expert-platform-production.up.railway.app) ← ✅
    ↓
Railway AI Engine (internal routing)
    ↓
Response streams back
```

---

## 🎯 MODE 1 ENDPOINT

**Mode 1 will now call**:
```
https://vital-expert-platform-production.up.railway.app/api/mode1/manual
```

**With headers**:
```typescript
{
  'Content-Type': 'application/json',
  'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID
}
```

---

## ✅ VERIFICATION STEPS

### 1. Check Railway Service is Running
```bash
# Test API Gateway health
curl https://vital-expert-platform-production.up.railway.app/health

# Or test Mode 1 endpoint
curl -X POST https://vital-expert-platform-production.up.railway.app/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{"agent_id":"test","message":"test"}'
```

### 2. Test in Browser
1. **Wait 10-15 seconds** for dev server to restart
2. **Hard refresh**: Cmd+Shift+R
3. **Open**: http://localhost:3000/ask-expert
4. **Select Mode 1** (Manual)
5. **Select an agent** (e.g., "Biomarker Strategy Advisor")
6. **Send query**: "I want to monitor signal Statistical Detection"
7. **Check console** - should see:
   ```
   [Mode1] Calling AI Engine: https://vital-expert-platform-production.up.railway.app/api/mode1/manual
   ```

---

## ⚠️ POTENTIAL ISSUES

### Issue 1: CORS Error
**Symptom**: Browser console shows CORS error
**Cause**: Railway API Gateway not allowing `localhost:3000`
**Fix**: Add CORS headers in Railway API Gateway:
```javascript
// In API Gateway code
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### Issue 2: Network Error / Connection Refused
**Symptom**: "Failed to connect" error
**Cause**: Railway service not running or URL incorrect
**Fix**: 
- Check Railway dashboard - service should be running
- Verify URL is correct: `vital-expert-platform-production.up.railway.app`
- Check Railway logs for errors

### Issue 3: 404 Not Found
**Symptom**: 404 on `/api/mode1/manual`
**Cause**: Route not configured in Railway API Gateway
**Fix**: Verify Railway API Gateway has the route `/api/mode1/manual`

### Issue 4: Authentication Error
**Symptom**: 401/403 Unauthorized
**Cause**: Missing or invalid tenant ID
**Fix**: Check `x-tenant-id` header is being sent correctly

---

## 📊 EXPECTED BEHAVIOR

### Success Case:
1. ✅ Frontend sends request to Railway
2. ✅ Railway API Gateway receives request
3. ✅ Railway routes to AI Engine
4. ✅ AI Engine processes Mode 1 query
5. ✅ Response streams back to frontend
6. ✅ User sees response in chat

### Error Case:
1. ❌ Connection fails → Check Railway status
2. ❌ CORS error → Add CORS headers
3. ❌ 404 → Check route exists
4. ❌ 500 → Check Railway logs

---

## 🔍 DEBUGGING

### Check Railway Logs:
1. Go to Railway Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for incoming requests from `localhost:3000`

### Check Browser Console:
- Network tab: See if request reaches Railway
- Console tab: See error messages
- Response tab: See what Railway returns

---

## ✅ STATUS

- ✅ API Gateway URL: Railway production configured
- ✅ Dev server: Restarting with new config
- ✅ Mode 1: Ready to test with Railway backend

**Next**: Test Mode 1 in browser - should connect to Railway! 🚀

