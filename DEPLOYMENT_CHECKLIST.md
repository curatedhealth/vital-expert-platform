# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Variables Configuration
- [ ] **Supabase Service Role Key** - Get from [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- [ ] **App URL** - Set to your Vercel domain
- [ ] **Node Environment** - Set to `production`

### 2. Database Migration
- [ ] **Run Session Store Migration** - Execute the SQL migration in Supabase
- [ ] **Verify Database Schema** - Ensure all tables exist
- [ ] **Test Database Connection** - Verify Supabase connectivity

### 3. Optional Enhancements
- [ ] **Redis Caching** - Configure Upstash Redis for performance
- [ ] **LangSmith Tracing** - Set up AI observability
- [ ] **Monitoring** - Configure error tracking and analytics

## 🔧 Vercel Configuration

### 1. Project Settings
- [ ] **Framework** - Next.js 14.2.33
- [ ] **Node Version** - 18.x or higher
- [ ] **Build Command** - `npm run build`
- [ ] **Output Directory** - `.next`

### 2. Environment Variables
Copy these to Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Optional
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=vital-path-production
```

### 3. Function Configuration
- [ ] **Chat API** - 120s timeout
- [ ] **RAG API** - 90s timeout
- [ ] **Other APIs** - 60s timeout

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] **Homepage Loads** - Check main page renders correctly
- [ ] **Authentication** - Test login/register flows
- [ ] **Chat Interface** - Verify chat functionality works
- [ ] **API Endpoints** - Test key API routes

### 2. Advanced Features
- [ ] **Agent Selection** - Test agent recommendation
- [ ] **Session Persistence** - Verify session storage works
- [ ] **Error Handling** - Test error boundaries
- [ ] **Loading States** - Verify loading screens work

### 3. Performance Testing
- [ ] **Page Load Speed** - Check Core Web Vitals
- [ ] **API Response Times** - Monitor API performance
- [ ] **Memory Usage** - Check for memory leaks
- [ ] **Error Rates** - Monitor error frequency

## 🔍 Monitoring & Maintenance

### 1. Health Checks
- [ ] **Database Connection** - Monitor Supabase connectivity
- [ ] **API Health** - Check `/api/health` endpoint
- [ ] **Error Tracking** - Set up error monitoring
- [ ] **Performance Metrics** - Track key metrics

### 2. Regular Maintenance
- [ ] **Session Cleanup** - Run periodic cleanup of old sessions
- [ ] **Database Optimization** - Monitor query performance
- [ ] **Security Updates** - Keep dependencies updated
- [ ] **Backup Verification** - Ensure data backups work

## 🚨 Troubleshooting

### Common Issues
- **Build Failures** - Check environment variables
- **Database Errors** - Verify Supabase configuration
- **API Timeouts** - Check function timeout settings
- **Authentication Issues** - Verify Supabase keys

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View build logs
vercel logs

# Test locally with production env
vercel dev

# Check deployment status
vercel ls
```

## 📞 Support Resources

- **Vercel Documentation** - https://vercel.com/docs
- **Supabase Documentation** - https://supabase.com/docs
- **Next.js Documentation** - https://nextjs.org/docs
- **Environment Setup Guide** - `ENVIRONMENT_SETUP.md`

## ✅ Final Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Build successful
- [ ] Deployment successful
- [ ] Basic functionality tested
- [ ] Performance verified
- [ ] Monitoring configured
- [ ] Documentation updated

---

**🎉 Ready for Production!**

Your VITAL Expert application is now configured for Vercel deployment with all necessary environment variables, database setup, and optional enhancements. Follow this checklist to ensure a smooth deployment process.
