# VITAL Path - Cloud Supabase Configuration

## Overview
VITAL Path has been fully migrated to use the **cloud Supabase instance** instead of local Supabase. All local Supabase references have been deprecated and removed.

## Cloud Instance Details
- **URL**: `https://xazinxsiglqokwfmogyk.supabase.co`
- **Status**: Active and fully operational
- **Agents**: 372 available agents
- **Performance**: Optimized for cloud infrastructure

## Quick Setup

### 1. Run the Setup Script
```bash
node scripts/setup-cloud-env.js
```

This will create a `.env.local` file with the correct cloud configuration.

### 2. Update Your Credentials
Edit `.env.local` and add your actual credentials:
```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Verify Configuration
```bash
node scripts/check-cloud-config.js
```

### 4. Restart Development Server
```bash
npm run dev
```

## Environment Variables

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Optional Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://postgres:[password]@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuration Files Updated

### API Routes
- ✅ `/api/agents/recommend` - Uses cloud instance
- ✅ `/api/chat` - Uses cloud instance
- ✅ `/api/chat/autonomous` - Uses cloud instance
- ✅ All other API routes - Use cloud instance

### Components
- ✅ `src/lib/supabase/client.ts` - Cloud instance with fallback
- ✅ `src/lib/supabase/server.ts` - Cloud instance with fallback
- ✅ `src/lib/database/database-service.ts` - Cloud instance only

### Scripts
- ✅ `scripts/check-cloud-config.js` - Configuration checker
- ✅ `scripts/setup-cloud-env.js` - Environment setup
- ✅ `scripts/import-agents-from-remote.js` - Uses cloud instance
- ✅ `scripts/setup-supabase.ts` - Uses cloud instance

## Fallback Configuration

All components now include fallback configuration to ensure the cloud instance is always used:

```javascript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Local Supabase Deprecation

### What Was Removed
- ❌ Local Supabase Docker services
- ❌ Local database connections
- ❌ Local Supabase Studio references
- ❌ All localhost/127.0.0.1 Supabase URLs

### What Was Updated
- ✅ All API routes use cloud instance
- ✅ All components use cloud instance
- ✅ All scripts use cloud instance
- ✅ Environment configuration uses cloud instance
- ✅ Database service uses cloud instance

## Troubleshooting

### Environment Variables Not Set
```bash
node scripts/check-cloud-config.js
```

### Configuration Issues
1. Check `.env.local` exists and has correct values
2. Restart development server
3. Check browser console for Supabase connection logs

### Agent Selection 500 Error
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check browser console for detailed error logs
3. Ensure cloud instance is accessible

## Benefits of Cloud Instance

- 🚀 **Performance**: Cloud infrastructure optimization
- 🔒 **Security**: Enhanced cloud authentication
- 📊 **Scalability**: Better resource management
- 🌐 **Availability**: Global CDN optimization
- 💰 **Cost**: Reduced local resource usage
- 🔄 **Sync**: Real-time data synchronization

## Support

For issues with cloud configuration:
1. Check the configuration checker script
2. Verify environment variables
3. Check cloud instance status
4. Review browser console logs

---

*This configuration ensures VITAL Path always uses the cloud Supabase instance for optimal performance and reliability.*
