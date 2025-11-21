# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Directory
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
vercel
```

### 4. Follow the Prompts
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account or team
- **Link to existing project?** → No (for first deployment)
- **Project name** → `vital-expert-platform` (or your preferred name)
- **Directory** → `./` (current directory)

## 🔧 Environment Variables Setup

After deployment, configure these environment variables in Vercel dashboard:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Optional Variables
```
NEXT_PUBLIC_DEV_MODE=false
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

## 📁 Project Structure for Vercel

The project is already optimized for Vercel with:
- ✅ `vercel.json` configuration
- ✅ Next.js 14 App Router
- ✅ API routes in `/api` directory
- ✅ Static assets optimization
- ✅ Production build tested

## 🔄 Continuous Deployment

### Option 1: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Connect repository to Vercel
3. Automatic deployments on every push

### Option 2: Manual Deployment
```bash
vercel --prod
```

## 🛠️ Development Workflow

### Local Development
```bash
npm run dev
```

### Production Build Test
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
vercel --prod
```

## 📊 Performance Optimizations

The project includes:
- ✅ Static page generation
- ✅ API route optimization
- ✅ Image optimization
- ✅ Bundle size optimization
- ✅ Edge runtime compatibility

## 🔍 Monitoring

After deployment, monitor:
- Function execution time
- API response times
- Error rates
- Build logs

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**: Check environment variables
2. **API Errors**: Verify Supabase configuration
3. **Static Assets**: Ensure proper file paths

### Debug Commands:
```bash
vercel logs
vercel inspect
```

## 📈 Scaling Considerations

- Vercel automatically handles scaling
- API routes have 30-second timeout
- Static pages are CDN-cached
- Database connections are optimized

## 🔐 Security

- Environment variables are encrypted
- API routes are serverless
- No sensitive data in client bundle
- CORS headers configured

---

**Ready to deploy!** 🎉
