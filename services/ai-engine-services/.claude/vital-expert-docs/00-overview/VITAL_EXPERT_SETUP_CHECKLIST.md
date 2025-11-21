# 📋 Quick Setup Checklist: vital.expert

Use this as you create the new Vercel project.

---

## ✅ Step 1: Create Project

### Via Vercel Dashboard
- [ ] Go to https://vercel.com/new
- [ ] Click "Add New..." → "Project"
- [ ] Import your Git repository
- [ ] Select **main** branch

---

## ⚙️ Step 2: Project Configuration

```
✅ Project Name: vital-expert

✅ Framework Preset: Next.js

✅ Root Directory: apps/digital-health-startup

✅ Build Settings:
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install

✅ Production Branch: main
```

---

## 🔐 Step 3: Environment Variables

Copy and paste these (fill in your values):

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (Required)
OPENAI_API_KEY=

# Sentry (Pre-configured)
NEXT_PUBLIC_SENTRY_DSN=https://c116ec533535b9117345233aaa3814d5@o4510307099279360.ingest.de.sentry.io/4510307121102928

# Backend API (Pre-configured)
NEXT_PUBLIC_API_URL=https://vital-ai-engine.railway.app

# Optional: Pinecone
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=

# Optional: Redis
REDIS_URL=
```

**Tip**: Get values from your local `.env` file or existing Vercel project.

---

## 🚀 Step 4: Deploy

- [ ] Review all settings
- [ ] Click **"Deploy"**
- [ ] Wait 2-3 minutes for build
- [ ] Get deployment URL: `https://vital-expert.vercel.app`

---

## 🧪 Step 5: Test Deployment

### Basic Tests
- [ ] App loads without errors
- [ ] No console errors (F12)
- [ ] Homepage renders correctly
- [ ] Navigation works

### Authentication Tests  
- [ ] Login page loads
- [ ] Can log in
- [ ] Protected routes work
- [ ] Can log out

### Feature Tests
- [ ] Ask Expert page loads
- [ ] Dashboard accessible
- [ ] API calls work

### Sentry Test
```javascript
// Open browser console (F12)
throw new Error("Sentry test - vital.expert");

// Check: https://sentry.io → vital-frontend
```

---

## 🌐 Step 6: Custom Domain (Optional)

### Add Domain in Vercel
- [ ] Go to Project → Settings → Domains
- [ ] Add domain: `vital.expert`
- [ ] Copy DNS records

### Update DNS Provider
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

- [ ] Wait for propagation (5-60 minutes)
- [ ] SSL auto-provisions
- [ ] Test: https://vital.expert

---

## 📊 Step 7: Configure Existing Marketing Site

### Update vital-marketing-site Project
- [ ] Go to Settings → General
- [ ] Change Root Directory (if needed)
- [ ] Verify it's focused on marketing pages
- [ ] Redeploy to test

---

## ✅ Final Verification

- [ ] Production app: https://vital.expert (or vercel.app URL)
- [ ] Marketing site: Your existing domain
- [ ] Backend API: https://vital-ai-engine.railway.app
- [ ] Sentry tracking: Both projects monitored
- [ ] All environment variables set
- [ ] No errors in deployment logs
- [ ] SSL certificate valid

---

## 🎉 Success Criteria

✅ App deployed and accessible  
✅ Authentication works  
✅ Features functional  
✅ Sentry tracking errors  
✅ Fast load times (< 3s)  
✅ Mobile responsive  
✅ HTTPS enabled  

---

## 📞 If You Need Help

**Stuck on environment variables?**
- Check your local `.env` file
- Or existing Vercel project settings

**Build failing?**
- Check deployment logs in Vercel
- Verify root directory is correct
- Ensure all dependencies in `package.json`

**Domain not working?**
- Wait 30-60 minutes for DNS propagation
- Verify DNS records are correct
- Check domain registrar settings

---

**Time to Complete**: 10-15 minutes  
**Next**: Go to https://vercel.com/new and start! 🚀

