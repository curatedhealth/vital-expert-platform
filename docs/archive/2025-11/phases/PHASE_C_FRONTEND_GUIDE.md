# 🎨 PHASE C: FRONTEND INTEGRATION GUIDE

**Purpose:** Connect frontend to Railway backend  
**Time:** 30 minutes  
**Prerequisites:** Phase B testing complete

---

## 📍 STEP 1: LOCATE FRONTEND API CONFIGURATION

Based on codebase analysis, the frontend API URL is configured in:

### Option A: Next.js App (Main Frontend)
**Files to check:**
1. `.env.local` (root directory)
2. `apps/digital-health-startup/.env.local`
3. Environment variables in code

### Option B: Docker Compose
**File:** `docker-compose.yml`
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:3001  # ← Change this
```

### Option C: Vercel Environment Variables
If deploying to Vercel, set in Vercel Dashboard.

---

## 🔧 STEP 2: UPDATE API URL TO RAILWAY

### Get Your Railway URL First:
```bash
# From Railway Dashboard, copy your service URL
# Example: https://vital-ai-engine-production.up.railway.app
RAILWAY_URL="https://your-service.up.railway.app"
```

### Update Frontend Configuration:

#### Method 1: Environment File (.env.local)
Create or update `.env.local` in your Next.js app root:

```bash
# .env.local or apps/digital-health-startup/.env.local
NEXT_PUBLIC_API_URL=https://your-service.up.railway.app
NEXT_PUBLIC_AI_ENGINE_URL=https://your-service.up.railway.app

# If using API Gateway (recommended for Golden Rule compliance)
NEXT_PUBLIC_API_GATEWAY_URL=https://your-service.up.railway.app

# WebSocket URL (if needed)
NEXT_PUBLIC_WS_URL=wss://your-service.up.railway.app
```

#### Method 2: Docker Compose
Update `docker-compose.yml`:

```yaml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_API_URL=https://your-service.up.railway.app
      - NEXT_PUBLIC_WS_URL=wss://your-service.up.railway.app
```

#### Method 3: Direct Code Update (if using constants)
Check these files for hardcoded URLs:

```bash
# Search for API URLs in frontend
grep -r "http://localhost:3001" apps/
grep -r "http://localhost:8000" apps/
grep -r "AI_ENGINE_URL" apps/
grep -r "API_GATEWAY_URL" apps/
```

Update any hardcoded URLs to use environment variables:

```typescript
// Before:
const API_URL = 'http://localhost:3001';

// After:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

---

## 🔐 STEP 3: UPDATE CORS SETTINGS

Your Railway backend needs to allow your frontend domain.

### Update Railway Environment Variable:

1. Go to Railway Dashboard → Your Service → Variables
2. Find or add `CORS_ALLOWED_ORIGINS`
3. Update with your frontend URLs:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,https://your-frontend.vercel.app,https://your-custom-domain.com
```

### Important CORS URLs to Include:
- `http://localhost:3000` (local dev)
- `http://localhost:3002` (local dev alt port)
- `https://your-app.vercel.app` (Vercel preview)
- `https://your-app-*.vercel.app` (Vercel deployments)
- `https://your-custom-domain.com` (production domain)

**Note:** Railway will auto-restart after you update environment variables.

---

## 🧪 STEP 4: TEST FRONTEND → RAILWAY CONNECTION

### Start Frontend Locally:
```bash
# In your frontend directory
cd apps/digital-health-startup  # or root if monorepo
npm run dev

# Or if using Docker
docker-compose up frontend
```

### Test Connection in Browser:
1. Open `http://localhost:3000` (or your frontend port)
2. Open Browser DevTools (F12) → Network tab
3. Try using the Ask Expert feature
4. Check Network tab for requests to Railway URL
5. Look for successful 200 responses

### Expected Behavior:
✅ Requests go to `https://your-service.up.railway.app`  
✅ Responses return within reasonable time  
✅ No CORS errors in console  
✅ AI responses display correctly  

### Common Issues:

#### CORS Error:
```
Access to fetch at 'https://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Fix:** Update `CORS_ALLOWED_ORIGINS` on Railway and wait for restart.

#### Network Error:
```
Failed to fetch / Network request failed
```
**Fix:** Verify Railway URL is correct and service is running.

#### 404 Not Found:
```
POST https://your-service.up.railway.app/api/ask-expert-v2 404
```
**Fix:** Check endpoint path matches backend routes.

---

## 🚀 STEP 5: DEPLOY FRONTEND TO VERCEL

### Prerequisites:
- Vercel account
- GitHub repo connected to Vercel

### Deploy via Vercel Dashboard:

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → Project**

3. **Import Your GitHub Repository**

4. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Root Directory: `apps/digital-health-startup` (if monorepo) or `.` (if standalone)
   - Build Command: `npm run build` or auto-detected
   - Output Directory: `.next` or auto-detected

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-service.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

6. **Click "Deploy"**

7. **Wait for Deployment** (~3-5 minutes)

8. **Get Your Vercel URL:**
   - Vercel will provide: `https://your-app-[random].vercel.app`
   - Add custom domain if desired

### Deploy via Vercel CLI (Alternative):

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/digital-health-startup  # or your frontend root
vercel --prod

# Follow prompts
# - Link to existing project or create new
# - Set environment variables
# - Confirm deployment
```

---

## 🔄 STEP 6: UPDATE CORS FOR VERCEL URL

After Vercel deployment:

1. Copy your Vercel URL: `https://your-app.vercel.app`

2. Update Railway `CORS_ALLOWED_ORIGINS`:
   ```bash
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,https://your-app.vercel.app,https://your-app-*.vercel.app
   ```

3. Wait for Railway to restart (~30 seconds)

4. Test Vercel deployment by visiting your Vercel URL

---

## ✅ STEP 7: END-TO-END TESTING

### Test Complete Flow:

1. **Open Vercel Deployment:**
   ```
   https://your-app.vercel.app
   ```

2. **Test Mode 1 (Interactive-Auto):**
   - Start new conversation
   - Ask: "What are FDA IND requirements?"
   - Verify response from Railway backend
   - Continue conversation to test memory

3. **Test Mode 2 (Interactive-Manual):**
   - Select specific agent
   - Ask medical/regulatory question
   - Verify agent-specific response

4. **Test Mode 3 (Autonomous-Auto):**
   - Request: "Create comprehensive FDA submission plan"
   - Verify autonomous execution
   - Check progress updates (if streaming enabled)
   - Verify final comprehensive response

5. **Test Mode 4 (Autonomous-Manual):**
   - Select specific expert
   - Request complex autonomous task
   - Verify expert-guided autonomous execution

6. **Test Tool Features:**
   - RAG toggle on/off
   - Tools toggle on/off
   - LLM model selection
   - Verify each works correctly

7. **Test Memory:**
   - Have multi-turn conversation
   - Reference previous answers
   - Verify context is maintained

8. **Monitor Performance:**
   - Response times < 10s for simple queries
   - Response times < 30s for complex queries
   - Autonomous mode completes within runtime limit
   - No console errors

---

## 📊 STEP 8: PRODUCTION CHECKLIST

Before going live:

### Backend (Railway):
- ✅ All environment variables set
- ✅ Database migration run
- ✅ CORS includes production domain
- ✅ Health check returns 200
- ✅ All 4 modes tested
- ✅ Logs show no critical errors
- ✅ Cost limits configured appropriately
- ✅ Runtime limits configured appropriately

### Frontend (Vercel):
- ✅ API URL points to Railway
- ✅ Environment variables set
- ✅ Build completes successfully
- ✅ No console errors
- ✅ All routes work
- ✅ Authentication works (if applicable)
- ✅ Mobile responsive
- ✅ Performance acceptable (Lighthouse > 80)

### Database (Supabase):
- ✅ Migration run successfully
- ✅ RLS policies active
- ✅ Tenants configured
- ✅ Users can authenticate
- ✅ Data persists correctly

### Integration:
- ✅ Frontend → Railway → works
- ✅ Railway → Supabase → works
- ✅ Railway → OpenAI → works
- ✅ Memory recall works
- ✅ Tool chaining works
- ✅ Autonomous control works

---

## 🚨 TROUBLESHOOTING

### Vercel Build Fails:
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Check Node version compatibility
- Try local build first: `npm run build`

### Frontend Can't Reach Backend:
- Verify Railway URL is correct
- Check CORS settings
- Verify Railway service is running
- Check browser console for errors

### Slow Response Times:
- Check Railway metrics for CPU/memory
- Consider upgrading Railway plan
- Implement caching if not already
- Optimize expensive operations

### Authentication Issues:
- Verify Supabase URL/keys in Vercel
- Check RLS policies in Supabase
- Test auth flow locally first

---

## 📝 PHASE C COMPLETION CHECKLIST

```
□ Frontend API URL updated to Railway
□ CORS settings updated for Vercel
□ Local frontend connects to Railway
□ Frontend deployed to Vercel
□ Vercel deployment URL added to CORS
□ Mode 1 works end-to-end
□ Mode 2 works end-to-end
□ Mode 3 works end-to-end
□ Mode 4 works end-to-end
□ Tool chaining works
□ Memory recall works
□ No console errors
□ Performance acceptable
□ Production checklist complete
```

---

## 🎉 SUCCESS!

When all checkboxes are complete, you have:
- ✅ Backend deployed on Railway
- ✅ Frontend deployed on Vercel
- ✅ Full stack integrated and working
- ✅ All 4 modes operational
- ✅ Tool chaining functional
- ✅ Long-term memory active
- ✅ Autonomous control working
- ✅ Production-ready platform

**Your VITAL AI Platform is now LIVE! 🚀**

---

## 📚 NEXT STEPS (Optional)

1. **Custom Domain:** Add custom domain in Vercel
2. **Monitoring:** Set up error tracking (Sentry, LogRocket)
3. **Analytics:** Add analytics (Google Analytics, Mixpanel)
4. **Performance:** Optimize with caching, CDN
5. **Security:** Add rate limiting, DDoS protection
6. **Scaling:** Monitor usage, upgrade plans as needed
7. **Documentation:** Update API docs with production URLs

