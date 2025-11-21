# ✅ Sentry Backend Configuration Complete!

## 🎯 What's Configured

### Backend (Python FastAPI)
- ✅ Sentry DSN added to Railway: `https://92be...@o4510307099279360.ingest.de.sentry.io/4510307135586384`
- ✅ Sentry integration code in `main.py`
- ✅ Test endpoint added: `/sentry-debug`

---

## 🧪 Test Your Sentry Integration

### Step 1: Deploy to Railway
```bash
cd services/ai-engine
railway up
```

### Step 2: Wait for Deployment (2-3 minutes)
Check Railway dashboard or run:
```bash
railway logs --tail 20
```

Look for:
```
✅ Sentry initialized for error tracking
```

### Step 3: Trigger Test Error
```bash
# Replace with your actual Railway URL
curl https://vital-ai-engine.railway.app/sentry-debug
```

Or visit in browser:
```
https://vital-ai-engine.railway.app/sentry-debug
```

### Step 4: Check Sentry Dashboard
1. Go to: https://sentry.io
2. Select project: `vital-backend`
3. Go to: Issues
4. You should see: `ZeroDivisionError: division by zero`

**Expected Response**:
```json
{
  "detail": "Internal Server Error"
}
```

But Sentry will have captured the full error with stack trace!

---

## 🔍 What You'll See in Sentry

### Error Details
- **Error Type**: `ZeroDivisionError`
- **Message**: `division by zero`
- **File**: `main.py:2209`
- **Endpoint**: `GET /sentry-debug`

### Context Captured
- Request headers
- Server environment
- User IP (if `send_default_pii=True`)
- Stack trace
- Breadcrumbs

---

## 🚀 Deploy Now

```bash
# From services/ai-engine directory
railway up

# Watch deployment
railway logs --follow
```

---

## ⚠️ Important: Remove Test Endpoint

**Before going to production**, either:

1. **Remove the endpoint** (recommended):
   ```python
   # Delete lines 2198-2210 in main.py
   ```

2. **Or protect it** (if you want to keep for debugging):
   ```python
   @app.get("/sentry-debug")
   async def trigger_error(secret: str = Header(None)):
       if secret != os.getenv("DEBUG_SECRET"):
           raise HTTPException(status_code=403)
       division_by_zero = 1 / 0
   ```

---

## 📊 Next: Frontend Sentry Setup

Once backend is verified, set up frontend:

1. Get **Frontend DSN** from Sentry (different from backend)
2. Add to Vercel:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your_frontend_dsn_here
   ```
3. Redeploy Vercel

---

## ✅ Verification Checklist

- [ ] Railway environment variable `SENTRY_DSN` is set
- [ ] Code deployed to Railway
- [ ] Logs show "Sentry initialized"
- [ ] Test endpoint returns error
- [ ] Error appears in Sentry dashboard
- [ ] Stack trace is readable
- [ ] Request context is captured

---

**Status**: 🟢 Backend Sentry Ready!  
**Next**: Deploy and test, then set up frontend

