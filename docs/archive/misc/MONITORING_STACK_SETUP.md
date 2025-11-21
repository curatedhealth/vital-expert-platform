# Monitoring Stack Setup - Complete Guide

This guide covers setting up the complete monitoring stack for VITAL Path.

---

## 📊 Monitoring Tools Overview

| Tool | Purpose | Priority | Cost |
|------|---------|----------|------|
| **Sentry** | Error tracking & Performance monitoring | 🔴 Critical | $0-26/mo |
| **UptimeRobot** | Uptime monitoring & Alerting | 🔴 Critical | Free |
| **Better Stack** | Log aggregation & Analysis | 🔴 Critical | $10/mo |
| **Railway Metrics** | Infrastructure monitoring | ✅ Built-in | Free |
| **Vercel Analytics** | Frontend analytics | ✅ Built-in | Free |

---

## 1️⃣ Sentry Setup (Error Tracking)

**Status**: ✅ **Code integrated, awaiting configuration**

### Quick Start
```bash
# 1. Create account: https://sentry.io/signup/
# 2. Create 2 projects:
#    - vital-frontend (Next.js)
#    - vital-backend (Python)

# 3. Add to Vercel:
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# 4. Add to Railway:
SENTRY_DSN=https://...@sentry.io/...
```

See `SENTRY_SETUP_COMPLETE.md` for detailed instructions.

---

## 2️⃣ UptimeRobot Setup (Uptime Monitoring)

### Step 1: Create Account
```
1. Go to: https://uptimerobot.com/signUp
2. Choose FREE plan (50 monitors, 5-min intervals)
3. Verify email
```

### Step 2: Add Monitors

#### Monitor 1: Frontend Health
```
Type: HTTP(s)
URL: https://your-app.vercel.app/
Name: VITAL Frontend
Interval: 5 minutes
Alert Contacts: your@email.com
```

#### Monitor 2: Frontend API Health
```
Type: HTTP(s)
URL: https://your-app.vercel.app/api/health
Name: VITAL Frontend API
Interval: 5 minutes
Expected Status: 200
```

#### Monitor 3: Backend Health
```
Type: HTTP(s)
URL: https://vital-ai-engine.railway.app/health
Name: VITAL AI Engine
Interval: 5 minutes
Expected Response: "status": "healthy"
```

#### Monitor 4: Backend Frameworks
```
Type: HTTP(s)
URL: https://vital-ai-engine.railway.app/frameworks/info
Name: VITAL Frameworks API
Interval: 5 minutes
```

### Step 3: Configure Alerts

#### Email Alerts
```
- Down: Immediate
- Up: Immediate
- Still Down: Every 30 minutes
```

#### Optional: Slack Integration
```
1. UptimeRobot Settings → Alert Contacts
2. Choose "Add Alert Contact" → Webhook
3. Add Slack webhook URL
4. Format: JSON
5. Test notification
```

### Step 4: Status Page (Optional)
```
1. UptimeRobot → Status Pages → Create
2. Select monitors to display
3. Customize URL: vital-status
4. Add custom domain (optional)
5. Public URL: https://stats.uptimerobot.com/vital-status
```

---

## 3️⃣ Better Stack Setup (Log Aggregation)

### Step 1: Create Account
```
1. Go to: https://betterstack.com/logs
2. Choose Logs plan: $10/mo (10GB/mo)
3. Verify email
```

### Step 2: Connect Railway Logs

#### Method A: Railway Log Drain (Recommended)
```bash
# In Railway project settings
1. Settings → Integrations → Log Drains
2. Add Drain → Better Stack
3. Paste Better Stack source token
4. Save
```

#### Method B: Manual Forwarding
```bash
# Add to Railway service
# Create log forwarder script
railway logs --follow | curl -X POST \
  https://in.logs.betterstack.com/[YOUR-SOURCE-TOKEN] \
  -H "Content-Type: application/json" \
  -d @-
```

### Step 3: Connect Vercel Logs

```bash
# Vercel Dashboard
1. Project Settings → Integrations
2. Browse Marketplace → Better Stack
3. Add Integration
4. Configure log forwarding
```

### Step 4: Create Log Views

#### Backend Errors View
```
Filter: level:error OR level:critical
Name: Backend Errors
Alert: > 10 errors in 5 minutes
```

#### Frontend Errors View
```
Filter: level:error AND source:frontend
Name: Frontend Errors
Alert: > 5 errors in 5 minutes
```

#### Performance Issues View
```
Filter: duration:>2000 OR "slow query"
Name: Performance Issues
Alert: > 20 slow requests in 10 minutes
```

---

## 4️⃣ Railway Metrics (Built-in)

### What's Available
- CPU usage
- Memory usage
- Network I/O
- Deployment logs
- Build logs

### Access
```
1. Railway Dashboard → Your Project
2. Metrics tab
3. Set up alerts (optional)
```

### Recommended Alerts
```
- CPU > 80% for 5 minutes
- Memory > 90% for 5 minutes
- High error rate in logs
```

---

## 5️⃣ Vercel Analytics (Built-in)

### Enable Analytics
```
1. Vercel Dashboard → Project
2. Analytics tab
3. Enable if not already active
4. Upgrade to paid for more features (optional)
```

### What You Get (Free Tier)
- Page views
- Top pages
- Referrers
- Countries
- Devices

### What You Get (Paid - $10/mo)
- Web Vitals (LCP, FID, CLS)
- Custom events
- Audience insights
- Real User Monitoring

---

## 📱 Alert Configuration

### Priority Matrix

| Alert Type | Channel | Response Time | On-Call |
|------------|---------|---------------|---------|
| **Production Down** | Slack + SMS | Immediate | Yes |
| **High Error Rate** | Slack + Email | 5 minutes | Yes |
| **Performance Degradation** | Slack | 15 minutes | No |
| **Quota Warning** | Email | 1 hour | No |

### Slack Webhook Setup
```
1. Slack Workspace → Apps → Incoming Webhooks
2. Add to Channel → #vital-alerts
3. Copy webhook URL
4. Add to monitoring tools:
   - UptimeRobot
   - Better Stack  
   - Sentry
```

---

## 📊 Dashboard Setup

### Create Monitoring Dashboard

#### Option A: Better Stack Dashboard
```
1. Better Stack → Dashboards → Create
2. Add widgets:
   - Error rate (last 24h)
   - Response time P95
   - Active users
   - Log volume
3. Share with team
```

#### Option B: Custom Grafana (Advanced)
```
1. Self-host Grafana or use Grafana Cloud
2. Connect data sources:
   - Sentry API
   - Better Stack API
   - Railway metrics
3. Create dashboards
```

---

## ✅ Verification Checklist

### Sentry
- [ ] Account created
- [ ] Frontend DSN added to Vercel
- [ ] Backend DSN added to Railway
- [ ] Test error sent and received
- [ ] Alerts configured
- [ ] Team invited

### UptimeRobot
- [ ] Account created
- [ ] 4 monitors configured
- [ ] Email alerts working
- [ ] Slack alerts working (optional)
- [ ] Status page created (optional)

### Better Stack
- [ ] Account created
- [ ] Railway log drain configured
- [ ] Vercel logs forwarding
- [ ] Log views created
- [ ] Alerts configured

### Railway & Vercel
- [ ] Railway alerts enabled
- [ ] Vercel Analytics enabled
- [ ] Team has access

---

## 🚨 Incident Response Plan

### When Alert Fires

#### 1. Acknowledge (30 seconds)
```
- Check alert in Slack
- Click "Acknowledge" to stop repeat alerts
- Note incident start time
```

#### 2. Assess (2 minutes)
```
- Check UptimeRobot: Is service down?
- Check Sentry: What errors are occurring?
- Check Better Stack logs: What's the root cause?
- Check Railway/Vercel: Deployment issues?
```

#### 3. Communicate (1 minute)
```
- Post in #vital-incidents channel
- Update status page (if applicable)
- Notify affected users (if critical)
```

#### 4. Fix (varies)
```
- Deploy hotfix
- Rollback deployment
- Scale resources
- Contact support (Railway/Vercel)
```

#### 5. Verify (5 minutes)
```
- Check UptimeRobot: Service UP?
- Check Sentry: Error rate decreased?
- Check logs: No more errors?
- Monitor for 10 minutes
```

#### 6. Document (10 minutes)
```
- Create incident report
- Root cause analysis
- Prevention measures
- Update runbook
```

---

## 📈 Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Sentry (Team) | 50K errors, 100K transactions | $26 |
| UptimeRobot | 50 monitors, 5-min checks | **FREE** |
| Better Stack | 10GB logs/mo | $10 |
| Railway | Included with service | **FREE** |
| Vercel Analytics | Basic analytics | **FREE** |
| **Total** | | **$36/mo** |

**Upgrade to paid when needed**:
- Sentry Team: When free tier quota exceeded
- Better Stack: When 10GB/mo not enough
- Vercel Analytics Pro: When need Web Vitals ($10/mo)

---

## 🎯 Success Metrics

After 1 week of monitoring:
- [ ] Zero downtime incidents
- [ ] Mean Time To Detect (MTTD) < 2 minutes
- [ ] Mean Time To Resolve (MTTR) < 15 minutes
- [ ] Error rate < 1%
- [ ] P95 response time < 2 seconds

---

## 📞 Support Contacts

| Service | Support | SLA |
|---------|---------|-----|
| **Railway** | support@railway.app | 24h |
| **Vercel** | support@vercel.com | 24h |
| **Sentry** | support@sentry.io | 48h |
| **UptimeRobot** | support@uptimerobot.com | 48h |
| **Better Stack** | support@betterstack.com | 24h |

---

**Status**: 🔴 **ACTION REQUIRED**  
**Next Steps**:
1. Create Sentry account and add DSN keys
2. Set up UptimeRobot monitors
3. Configure Better Stack log aggregation
4. Test alert flow end-to-end

**Estimated Setup Time**: 30-45 minutes  
**Impact**: Production monitoring will be fully operational 🚀

