# 🚀 Supabase CLI Setup Guide

## Quick Start

1. **Login to Supabase:**
   ```bash
   supabase login
   ```

2. **Run the complete setup:**
   ```bash
   ./setup-complete.sh
   ```

3. **Update Vercel environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL 'YOUR_API_URL'
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY 'YOUR_ANON_KEY'
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Manual Setup Steps

### 1. Create New Project
```bash
supabase projects create vital-expert --region us-east-1
```

### 2. Link to Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 3. Set Up Database
```bash
supabase db push
```

### 4. Generate Types
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

### 5. Get Credentials
```bash
supabase status
```

## What's Included

✅ **User Authentication** - Email/password and Google OAuth
✅ **User Profiles** - Extended user data with organization info
✅ **Row Level Security** - Secure database access
✅ **TypeScript Types** - Auto-generated from database schema
✅ **LLM Providers** - Basic setup for AI model management
✅ **Usage Tracking** - Log LLM usage and costs

## Database Schema

- `profiles` - User profile information
- `llm_providers` - AI model providers (OpenAI, Claude, etc.)
- `llm_usage_logs` - Track API usage and costs

## Authentication Features

- Email/password registration and login
- Google OAuth integration
- Automatic profile creation on signup
- Secure user data with RLS policies
- Session management

## Troubleshooting

### Login Issues
```bash
supabase login --debug
```

### Project Not Found
```bash
supabase projects list
supabase link --project-ref YOUR_PROJECT_ID
```

### Database Issues
```bash
supabase db reset
supabase db push
```

### Type Generation Issues
```bash
supabase gen types typescript --local > src/types/supabase.ts
```
