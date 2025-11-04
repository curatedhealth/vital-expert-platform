# ✅ Backend Sentry Monitoring Setup

## 📊 Current Status

Your **Railway backend** already has Sentry configured and should be monitoring!

---

## 🔍 **1. Verify Sentry is Running**

### Check Railway Logs

Go to Railway dashboard and check recent logs for:
```
✅ Sentry initialized for error tracking
```

If you see this, Sentry is working! ✅

### Test Sentry Error Tracking

**Method 1: Via API Call**
```bash
curl https://vital-ai-engine.railway.app/sentry-debug
```

**Expected Response**: 500 error
**Expected in Sentry**: New error appears in your Sentry dashboard

**Method 2: Via Browser**
```
https://vital-ai-engine.railway.app/sentry-debug
```
Should show an error, which gets tracked in Sentry.

---

## 🎯 **2. Check Sentry Dashboard**

### Go to Your Sentry Project
```
https://sentry.io/organizations/crossroads-catalyst/projects/vital-backend/
```

Or find it at: https://sentry.io → Projects → `vital-backend`

### What to Look For
- ✅ Recent errors from Railway
- ✅ Environment: `production` or `railway`
- ✅ Stack traces from your Python code
- ✅ Request details (URL, headers, etc.)

---

## 🔐 **3. Verify Environment Variables on Railway**

Go to Railway dashboard → Your service → Variables

**Required**:
```bash
SENTRY_DSN=https://92be1e79deb9618565537788834a6387@o4510307099279360.ingest.de.sentry.io/4510307135586384
```

**Optional (but recommended)**:
```bash
RAILWAY_ENVIRONMENT=production
ENV=production
```

---

## 🛠️ **4. Current Sentry Configuration**

Your backend (`services/ai-engine/src/main.py`) has:

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

# Sentry initialization
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[
            FastApiIntegration(),
            StarletteIntegration(),
        ],
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,  # 10% performance profiling
        environment=os.getenv("RAILWAY_ENVIRONMENT", "development"),
        before_send=lambda event, hint: None if os.getenv("ENV") == "development" else event,
    )
    print("✅ Sentry initialized for error tracking")
else:
    print("ℹ️ Sentry DSN not configured - error tracking disabled")
```

**Features**:
- ✅ FastAPI integration (automatic error tracking)
- ✅ Starlette integration (middleware support)
- ✅ 10% transaction sampling (performance monitoring)
- ✅ 10% profiling (find bottlenecks)
- ✅ Environment tagging (production/development)
- ✅ Development mode filter (no spam)

---

## 🧪 **5. Test Sentry Monitoring**

### Test 1: Debug Endpoint
```bash
# Trigger a test error
curl https://vital-ai-engine.railway.app/sentry-debug

# Check Sentry dashboard
# You should see: ZeroDivisionError
```

### Test 2: Real Error (Controlled)
```bash
# Call an endpoint with bad data
curl -X POST https://vital-ai-engine.railway.app/api/frameworks/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Check Sentry for the validation error
```

### Test 3: Check Info Endpoint
```bash
# This should work (no error)
curl https://vital-ai-engine.railway.app/frameworks/info

# Verify in Railway logs that it succeeds
```

---

## 📊 **6. What Sentry Tracks**

### Automatically Tracked
- ✅ **Unhandled exceptions** in API endpoints
- ✅ **HTTP errors** (500, 400, etc.)
- ✅ **Performance** (slow endpoints)
- ✅ **Request context** (URL, method, headers)
- ✅ **User context** (if authenticated)
- ✅ **Stack traces** (full Python traceback)

### Custom Tracking (Optional)
You can add custom tracking:

```python
import sentry_sdk

# Track custom errors
try:
    risky_operation()
except Exception as e:
    sentry_sdk.capture_exception(e)

# Add custom context
sentry_sdk.set_context("business_logic", {
    "user_id": user_id,
    "panel_id": panel_id,
    "framework": "langgraph"
})

# Add breadcrumbs
sentry_sdk.add_breadcrumb(
    category='agent',
    message='Agent consultation started',
    level='info'
)
```

---

## 🚨 **7. Sentry Alerts (Recommended Setup)**

### Go to Sentry Dashboard
```
https://sentry.io/organizations/crossroads-catalyst/alerts/
```

### Create Alerts For:

**Alert 1: High Error Rate**
- Condition: More than 10 errors in 1 hour
- Action: Email + Slack notification

**Alert 2: New Error Type**
- Condition: First time seeing this error
- Action: Email notification

**Alert 3: Performance Degradation**
- Condition: P95 latency > 2 seconds
- Action: Email notification

---

## 📈 **8. Monitoring Dashboard**

### Key Metrics to Watch

**In Sentry Dashboard**:
- **Error Rate**: Should be < 1%
- **Response Time**: P95 < 2 seconds
- **User Impact**: How many users affected
- **Environment**: Confirm it says "production"

**In Railway Dashboard**:
- **Logs**: Check for Sentry initialization message
- **Metrics**: CPU, Memory, Response times
- **Deployments**: Ensure latest code is deployed

---

## ✅ **9. Quick Verification Checklist**

Run these checks now:

- [ ] **Check Railway Logs**
  ```
  Railway Dashboard → Logs → Search for "Sentry"
  ```

- [ ] **Verify SENTRY_DSN**
  ```
  Railway Dashboard → Variables → Check SENTRY_DSN exists
  ```

- [ ] **Test Debug Endpoint**
  ```bash
  curl https://vital-ai-engine.railway.app/sentry-debug
  ```

- [ ] **Check Sentry Dashboard**
  ```
  https://sentry.io → vital-backend → Issues
  ```

- [ ] **Verify Recent Events**
  ```
  Should see test error from debug endpoint
  ```

---

## 🔧 **10. Troubleshooting**

### If Sentry is Not Working:

**Problem 1**: No errors appearing in Sentry
```bash
# Check Railway logs for Sentry initialization
# Look for: "✅ Sentry initialized for error tracking"
```

**Problem 2**: Wrong environment showing
```bash
# Add/update in Railway:
RAILWAY_ENVIRONMENT=production
ENV=production
```

**Problem 3**: Too many events
```python
# Reduce sampling rates in main.py:
traces_sample_rate=0.01,  # 1% instead of 10%
profiles_sample_rate=0.01,
```

---

## 📞 **Next Steps**

### Immediate (5 minutes)
1. Go to Railway dashboard
2. Check logs for Sentry initialization
3. Test the `/sentry-debug` endpoint
4. Verify error appears in Sentry

### Optional (10 minutes)
1. Set up Sentry alerts
2. Configure Slack notifications
3. Invite team members to Sentry project
4. Create custom dashboards

---

## 🎯 **Summary**

**Status**: 🟢 **Sentry is configured and ready**

**Your Backend Monitoring**:
- ✅ Sentry SDK installed
- ✅ FastAPI integration active
- ✅ DSN configured on Railway
- ✅ Debug endpoint available
- ✅ Error tracking enabled

**To Verify Now**:
```bash
# 1. Test the debug endpoint
curl https://vital-ai-engine.railway.app/sentry-debug

# 2. Check Sentry
open https://sentry.io
```

---

**Want me to help you test it right now?** I can guide you through the verification steps! 🚀

