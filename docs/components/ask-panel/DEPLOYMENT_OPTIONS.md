# Ask Panel - Deployment Options

## ✅ Local Development
**Status:** Working  
**URL:** http://localhost:3002

```bash
cd apps/ask-panel
pnpm dev
```

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Prerequisites
- Vercel account
- Vercel CLI installed: `npm i -g vercel`

### Steps

1. **Login to Vercel**
```bash
vercel login
```

2. **Deploy from the ask-panel directory**
```bash
cd apps/ask-panel
vercel --prod
```

3. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`

4. **Configure Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `ask-panel.yourdomain.com`)

### Configuration Files
- ✅ `vercel.json` - Already configured
- ✅ `.vercelignore` - Already configured

---

## 🐳 Option 2: Deploy with Docker

### Build the Docker image
```bash
cd apps/ask-panel
docker build -t ask-panel:latest .
```

### Run locally
```bash
docker run -p 3002:3002 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
  -e NEXT_PUBLIC_API_URL=https://vital-expert-preprod.vercel.app/api \
  ask-panel:latest
```

### Push to a container registry
```bash
# Docker Hub
docker tag ask-panel:latest yourusername/ask-panel:latest
docker push yourusername/ask-panel:latest

# Google Container Registry
docker tag ask-panel:latest gcr.io/your-project/ask-panel:latest
docker push gcr.io/your-project/ask-panel:latest

# AWS ECR
docker tag ask-panel:latest your-account.dkr.ecr.region.amazonaws.com/ask-panel:latest
docker push your-account.dkr.ecr.region.amazonaws.com/ask-panel:latest
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
```

---

## ☁️ Option 3: Deploy to Other Platforms

### Railway
```bash
railway login
railway init
railway up
```

### Netlify
```bash
netlify login
netlify deploy --prod
```

### AWS Amplify
1. Connect your GitHub repo
2. Configure build settings:
   - Build command: `cd apps/ask-panel && pnpm build`
   - Publish directory: `apps/ask-panel/.next`
3. Add environment variables

### Google Cloud Run
```bash
gcloud run deploy ask-panel \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📋 Pre-Deployment Checklist

- [x] Build succeeds locally (`pnpm build`)
- [x] Dev server runs without errors (`pnpm dev`)
- [x] Environment variables are set
- [x] Database connection works
- [x] Landing page loads correctly
- [ ] Authentication flow tested
- [ ] Panel creation tested
- [ ] Real-time streaming tested
- [ ] Multi-tenant isolation verified

---

## 🔐 Environment Variables

Create a `.env.local` file (for local development):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
NEXT_PUBLIC_API_URL=https://vital-expert-preprod.vercel.app/api
```

---

## 🎯 Recommended: Vercel Deployment

For the fastest and easiest deployment, I recommend **Vercel**:

```bash
cd apps/ask-panel
vercel --prod
```

This will:
1. Automatically detect it's a Next.js app
2. Build and deploy in minutes
3. Provide a production URL
4. Enable automatic deployments on git push
5. Handle serverless functions automatically

**Once deployed, add your environment variables in the Vercel dashboard!**

---

## 🐛 Troubleshooting

### Build fails
```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

### Port already in use
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9
```

### Environment variables not loading
- Restart the dev server after changing `.env.local`
- For Vercel, redeploy after updating env vars in dashboard

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

