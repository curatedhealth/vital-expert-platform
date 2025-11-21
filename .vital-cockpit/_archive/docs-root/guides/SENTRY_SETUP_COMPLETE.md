# 🔒 Sentry Configuration - Error Tracking & Monitoring

## Overview

Sentry is now integrated for comprehensive error tracking and performance monitoring across both the **Next.js frontend** and **Python FastAPI backend**.

---

## 🎯 What Sentry Provides

### Error Tracking
- **Automatic error capture** - All uncaught exceptions
- **Stack traces** - Full error context
- **Breadcrumbs** - User actions leading to errors
- **Release tracking** - Track errors by deployment
- **Source maps** - Readable stack traces from minified code

### Performance Monitoring
- **Transaction tracing** - API request timing
- **Database query performance** - Slow query detection
- **External API latency** - Monitor OpenAI, Supabase calls
- **User experience metrics** - Page load times, LCP, FID

### Session Replay
- **Video-like reproductions** - See what users see
- **Console logs** - Debug JavaScript errors
- **Network requests** - API call monitoring
- **User interactions** - Click paths, form inputs

---

## 📦 Installation Complete

### Frontend (Next.js)
✅ `@sentry/nextjs` installed  
✅ Configuration files created:
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Auto-instrumentation

### Backend (Python FastAPI)
✅ `sentry-sdk[fastapi]` installed  
✅ Integration added to `main.py`:
- FastAPI integration
- Starlette integration  
- Performance tracing (10% sample rate)
- Environment-aware (disabled in development)

---

## 🔐 Environment Variables Required

### 1. Create Sentry Account (Free Tier)
```bash
# Go to https://sentry.io/signup/
# Create a new organization
# Create two projects: "vital-frontend" and "vital-backend"
```

### 2. Get DSN Keys

#### For Frontend (vital-frontend project):
```bash
# Copy from: Sentry Dashboard → Project Settings → Client Keys (DSN)
NEXT_PUBLIC_SENTRY_DSN=https://[YOUR-KEY]@o[ORG-ID].ingest.us.sentry.io/[PROJECT-ID]
```

#### For Backend (vital-backend project):
```bash
# Copy from: Sentry Dashboard → Project Settings → Client Keys (DSN)
SENTRY_DSN=https://[YOUR-KEY]@o[ORG-ID].ingest.us.sentry.io/[PROJECT-ID]
```

### 3. Add to Environment Files

#### **Vercel (Frontend)**
```bash
# In Vercel Dashboard → Project Settings → Environment Variables
NEXT_PUBLIC_SENTRY_DSN=your_frontend_dsn_here
VERCEL_ENV=production  # Automatically set by Vercel
```

#### **Railway (Backend)**
```bash
# In Railway Dashboard → Project → Variables
SENTRY_DSN=your_backend_dsn_here
RAILWAY_ENVIRONMENT=production  # Automatically set by Railway
```

#### **Local Development**
```bash
# apps/digital-health-startup/.env.local
NEXT_PUBLIC_SENTRY_DSN=your_frontend_dsn_here

# services/ai-engine/.env
SENTRY_DSN=your_backend_dsn_here
```

---

## 🚀 Features Configured

### Frontend Features

#### 1. **Error Tracking**
```typescript
// Automatic error capture
throw new Error("Something went wrong"); // ✅ Captured

// Manual error capture
import * as Sentry from "@sentry/nextjs";
Sentry.captureException(error);
```

#### 2. **Session Replay** (10% sample rate)
- Video-like reproduction of user sessions
- Automatically captures errors
- Privacy-focused (text and media masked)

#### 3. **Performance Monitoring**
- Page load times
- API request duration
- Database query performance
- Real User Monitoring (RUM)

#### 4. **Filtered Errors**
- Localhost errors excluded in development
- Common browser errors ignored:
  - "ResizeObserver loop limit exceeded"
  - "Non-Error exception captured"

### Backend Features

#### 1. **FastAPI Integration**
```python
# Automatic error capture
raise HTTPException(status_code=500, detail="Error")  # ✅ Captured

# Manual error capture
import sentry_sdk
sentry_sdk.capture_exception(exception)
```

#### 2. **Performance Tracing** (10% sample rate)
- API endpoint latency
- Database query performance
- External API calls (OpenAI, Supabase)
- Background task duration

#### 3. **Context Enrichment**
- User ID and tenant ID
- Request headers
- Environment info
- Custom tags

---

## 📊 Sentry Dashboard

### What You'll See

#### Errors Tab
- Error frequency and trends
- Top errors by volume
- Affected users
- Stack traces with source maps

#### Performance Tab
- Slowest transactions
- P50, P75, P95, P99 latency
- Database query performance
- External API latency

#### Releases Tab
- Error trends per deployment
- Regression detection
- Deploy annotations

#### Alerts
- Email/Slack notifications
- Custom alert rules
- Threshold-based alerts
- Anomaly detection

---

## 🧪 Testing Sentry Integration

### Frontend Test
```bash
# Visit your app and open DevTools console
# Run this in the console:
throw new Error("Sentry Frontend Test Error");

# Check Sentry dashboard for the error
```

### Backend Test
```bash
# Make a request to trigger an error
curl -X POST https://your-ai-engine.railway.app/test-error

# Or add a test endpoint (temporary):
@app.get("/test-error")
async def test_error():
    raise HTTPException(status_code=500, detail="Sentry Backend Test Error")
```

### Verify Setup
```bash
# Check Sentry logs
# Railway: railway logs | grep Sentry
# Vercel: Check deployment logs

# Look for:
# ✅ Sentry initialized for error tracking
```

---

## 🔧 Configuration Options

### Adjusting Sample Rates

#### Frontend (`sentry.client.config.ts`)
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1,  // 10% of transactions (increase for more data)
  
  // Session Replay
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors
});
```

#### Backend (`main.py`)
```python
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=0.1,  # 10% (increase for more data)
    profiles_sample_rate=0.1,  # 10% profiling
)
```

### Environment-Specific Behavior

| Environment | Behavior |
|-------------|----------|
| **Development** | Errors logged to console, not sent to Sentry |
| **Production** | All errors sent to Sentry |
| **Localhost** | Frontend errors filtered out |

---

## 📈 Best Practices

### 1. **Use Breadcrumbs**
```typescript
// Frontend
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked on "Ask Expert"',
  level: 'info',
});

// Backend
from sentry_sdk import add_breadcrumb
add_breadcrumb(
    category='database',
    message='Querying agents table',
    level='info',
)
```

### 2. **Add Context**
```typescript
// Frontend
Sentry.setUser({ id: userId, email: userEmail });
Sentry.setTag('page', 'ask-expert');
Sentry.setContext('consultation', { agentId, question });

// Backend
sentry_sdk.set_user({"id": user_id, "email": user_email})
sentry_sdk.set_tag("agent_id", agent_id)
sentry_sdk.set_context("consultation", {"mode": "autonomous"})
```

### 3. **Filter Sensitive Data**
```typescript
// Frontend - already configured
beforeSend(event, hint) {
  // Remove sensitive data from error reports
  if (event.request?.url?.includes('password')) {
    return null;  // Don't send
  }
  return event;
}
```

### 4. **Alert Configuration**
```
Sentry Dashboard → Alerts → Create Alert Rule

Suggested Alerts:
1. Error rate exceeds 10 per minute
2. Response time P95 > 2 seconds
3. New errors appear (first seen)
4. Error volume spike (50% increase)
```

---

## 💰 Pricing (as of November 2025)

| Tier | Price | Errors/Month | Transactions/Month | Replays/Month |
|------|-------|--------------|-------------------|---------------|
| **Developer** | **FREE** | 5,000 | 10,000 | 50 |
| **Team** | **$26/mo** | 50,000 | 100,000 | 500 |
| **Business** | $80/mo | 500,000 | 1,000,000 | 5,000 |

**Recommendation**: Start with **FREE**, upgrade to **Team** when needed ($26/mo)

---

## 🚨 Common Issues & Solutions

### Issue: "DSN not configured"
**Solution**: Set `NEXT_PUBLIC_SENTRY_DSN` (frontend) and `SENTRY_DSN` (backend)

### Issue: Errors not appearing in dashboard
**Solution**: 
1. Check DSN is correct
2. Verify environment is "production" (not "development")
3. Wait 1-2 minutes for Sentry to process

### Issue: Too many events (quota exceeded)
**Solution**: 
1. Lower sample rates
2. Add more filters in `beforeSend`
3. Upgrade Sentry plan

### Issue: Source maps not working
**Solution**:
```typescript
// next.config.js
module.exports = {
  sentry: {
    hideSourceMaps: false,  // Enable source maps
  },
};
```

---

## ✅ Verification Checklist

- [ ] Sentry account created
- [ ] Frontend project created in Sentry
- [ ] Backend project created in Sentry
- [ ] `NEXT_PUBLIC_SENTRY_DSN` added to Vercel
- [ ] `SENTRY_DSN` added to Railway
- [ ] Test error sent and received in dashboard
- [ ] Alert rules configured
- [ ] Team members invited to Sentry

---

## 📚 Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry FastAPI Docs](https://docs.sentry.io/platforms/python/integrations/fastapi/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Session Replay Guide](https://docs.sentry.io/product/session-replay/)

---

**Status**: ✅ **Sentry Integration Complete**  
**Next**: Set up environment variables and verify error tracking

**Estimated Setup Time**: 10 minutes  
**Impact**: 🔴 **CRITICAL** - Essential for production monitoring

