# 🗄️ Manual Database Setup

## Step 1: Set Up Database Schema

1. **Go to your Supabase dashboard:**
   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk

2. **Go to SQL Editor**

3. **Run this SQL script:**

```sql
-- Initial setup for VITAL Expert
-- This migration sets up the basic database schema for authentication and user management

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'organization'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create basic application tables
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES public.llm_providers(id),
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on application tables
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_usage_logs ENABLE ROW LEVEL SECURITY;

-- Basic policies for application tables
CREATE POLICY "Authenticated users can view providers" ON public.llm_providers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own usage logs" ON public.llm_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.llm_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some default LLM providers
INSERT INTO public.llm_providers (name, provider_type, is_active) VALUES
  ('OpenAI GPT-4', 'openai', true),
  ('OpenAI GPT-3.5 Turbo', 'openai', true),
  ('Claude 3.5 Sonnet', 'anthropic', true),
  ('Claude 3 Haiku', 'anthropic', true)
ON CONFLICT DO NOTHING;
```

## Step 2: Configure Authentication

1. **Go to Authentication → Settings**

2. **Configure these settings:**
   - **Site URL**: `https://vital-expert-*.vercel.app` (your Vercel domain)
   - **Redirect URLs**: Add `https://vital-expert-*.vercel.app/dashboard`
   - **Enable Email authentication**
   - **Enable Google OAuth** (optional)

## Step 3: Get Your Anon Key

1. **Go to Settings → API**
2. **Copy the 'anon public' key**
3. **Update Vercel environment variable:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY 'your-anon-key-here'
   ```

## Step 4: Deploy

```bash
vercel --prod
```

## What This Sets Up

✅ **User Authentication** - Email/password and Google OAuth
✅ **User Profiles** - Extended user data with organization info
✅ **Row Level Security** - Secure database access
✅ **LLM Providers** - Basic setup for AI model management
✅ **Usage Tracking** - Log LLM usage and costs
