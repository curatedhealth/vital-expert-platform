# 🚀 Manual Vercel Deployment Guide

## Step 1: Push to Git (Already Done ✅)

Your changes are already committed and pushed to Git.

---

## Step 2: Vercel Will Auto-Deploy

Since your repository is connected to Vercel, it will automatically deploy when you push. However, if you want to trigger manually:

### Option A: Through Vercel Dashboard

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project**
   - Click on `vital-marketing-site` (or your project name)

3. **Trigger Deployment**
   - Click the **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - OR click **"Deploy"** button at top right

4. **Wait for Build** (2-3 minutes)
   - Watch the build logs
   - Wait for "✓ Build Completed"

5. **Verify Deployment**
   - Click on the deployment URL
   - Should see your app running

---

## Step 3: Test Sentry Frontend

Once deployed:

### Method 1: Browser Console
1. Open your deployed app: `https://your-app.vercel.app`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Type and press Enter:
   ```javascript
   throw new Error("Sentry frontend test");
   ```

### Method 2: Visit 404 Page
```
https://your-app.vercel.app/this-page-does-not-exist
```

### Method 3: Trigger React Error
Navigate around your app and any JavaScript error will be captured.

---

## Step 4: Check Sentry Dashboard

1. Go to: **https://sentry.io**
2. Select organization: **crossroads-catalyst**
3. Select project: **vital-frontend**
4. Click **Issues** tab
5. You should see your test error!

---

## 🎯 What You Should See in Sentry

### Error Details
- **Error**: "Sentry frontend test"
- **Platform**: JavaScript
- **Browser**: Chrome/Firefox/Safari
- **URL**: Your Vercel deployment URL
- **Stack Trace**: Full JavaScript stack
- **Breadcrumbs**: User actions before error
- **Device Info**: Browser, OS, screen size

### Performance Data
- Page load times
- API request durations
- Component render times
- Web Vitals (LCP, FID, CLS)

---

## ✅ Verification Checklist

- [ ] Git changes pushed
- [ ] Vercel deployment triggered
- [ ] Deployment completed successfully
- [ ] App accessible at Vercel URL
- [ ] Test error triggered in browser
- [ ] Error appears in Sentry dashboard
- [ ] Stack trace is readable
- [ ] User context is captured

---

## 🔧 If Vercel Doesn't Auto-Deploy

### Manual Git Push
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Make a small change to trigger deploy
echo "# Deploy trigger" >> apps/digital-health-startup/README.md

# Commit and push
git add .
git commit -m "Trigger Vercel deployment"
git push
```

### Or Use Vercel CLI (when available)
```bash
cd apps/digital-health-startup
vercel --prod
```

---

## 📊 Current Status

### Backend (Railway)
- ✅ Sentry DSN configured
- ✅ Code deployed
- ⏳ Test endpoint troubleshooting
- ✅ **Will track real errors automatically**

### Frontend (Vercel)
- ✅ Sentry DSN configured  
- ✅ Config files complete
- ✅ Code committed
- ⏳ **Deploy manually now**
- 🎯 **Ready to track errors once deployed**

---

## 🎉 Final Step

**Once Vercel deployment is complete:**

1. Visit your app
2. Trigger a test error
3. Check Sentry dashboard
4. **Celebrate!** 🎊 Your monitoring is live!

---

## 💡 Pro Tips

### Set Environment Variable (Optional)
Even though DSN is hardcoded as fallback, you can add to Vercel:

1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   ```
   Name: NEXT_PUBLIC_SENTRY_DSN
   Value: https://c116ec533535b9117345233aaa3814d5@o4510307099279360.ingest.de.sentry.io/4510307121102928
   ```
4. Click "Save"
5. Redeploy

### Check Build Logs
If deployment fails:
1. Vercel Dashboard → Deployments
2. Click on failed deployment
3. Check **Build Logs** for errors
4. Common issues:
   - Missing dependencies
   - Build errors
   - Environment variables

---

## 📞 Need Help?

### Vercel Dashboard Links
- Projects: https://vercel.com/dashboard
- Deployments: https://vercel.com/[your-project]/deployments
- Settings: https://vercel.com/[your-project]/settings

### Sentry Dashboard Links
- Backend: https://sentry.io/organizations/crossroads-catalyst/issues/?project=4510307135586384
- Frontend: https://sentry.io/organizations/crossroads-catalyst/issues/?project=4510307121102928

---

**Status**: Ready to deploy manually! 🚀

**Next**: Go to Vercel Dashboard and click "Redeploy" or push a small change to Git.

