# 🚀 VITALpath Platform Setup Guide

Welcome to VITALpath! Follow this guide to set up your Digital Health Transformation Platform.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- Accounts for the required services (see below)

## 🔧 Required Services

### 1. Supabase (Database & Authentication)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API** to get your credentials:
   - Project URL
   - Anon (public) key
   - Service role key (for admin operations)

### 2. Pinecone (Vector Database)
1. Go to [pinecone.io](https://pinecone.io) and create a free account
2. Create a new index with these settings:
   - **Dimensions**: 1536 (for OpenAI embeddings)
   - **Metric**: Cosine
   - **Index Name**: `vitalpath-knowledge-base`
3. Get your API key from the dashboard

### 3. OpenAI (LLM & Embeddings)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key with access to:
   - GPT-4 models
   - text-embedding-ada-002

### 4. Anthropic (Claude Models)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key with access to Claude models

## ⚙️ Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Pinecone Configuration
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_INDEX_NAME=vitalpath-knowledge-base

   # LLM Configuration
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

## 🗄️ Database Setup

1. **Run the database migrations:**

   In your Supabase dashboard:
   - Go to **SQL Editor**
   - Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Run the migration
   - Then copy and paste `supabase/migrations/20240101000001_rls_policies.sql`
   - Run the RLS policies

2. **Verify the setup:**
   - Check that all tables are created in the **Table Editor**
   - Verify RLS is enabled on all tables

## 🚀 Start the Platform

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✅ Verification Checklist

- [ ] **Homepage loads** without errors
- [ ] **Demo banner is gone** (indicates Supabase is connected)
- [ ] **Registration works** (try creating a test account)
- [ ] **Login works** (sign in with your test account)
- [ ] **No console errors** in browser developer tools

## 🔍 Troubleshooting

### Common Issues

**"supabaseUrl is required" error:**
- Check that `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`
- Make sure the URL starts with `https://`

**Database connection errors:**
- Verify your Supabase service role key is correct
- Check that RLS policies are properly applied

**LLM query failures:**
- Confirm OpenAI and Anthropic API keys are valid
- Check API usage limits and billing

**Pinecone errors:**
- Verify your index name matches exactly
- Ensure the index has 1536 dimensions

### Getting Help

1. **Check the console logs** for specific error messages
2. **Verify environment variables** are loaded correctly
3. **Test individual services** (Supabase, Pinecone, OpenAI) separately
4. **Review the implementation docs** in `IMPLEMENTATION_COMPLETE.md`

## 🌟 Next Steps

Once everything is working:

1. **Create your first project** and explore the VITAL framework
2. **Upload documents** to test the RAG pipeline
3. **Try AI queries** in different phases
4. **Invite team members** to collaborate
5. **Explore the dashboard** and analytics

## 🎯 Production Deployment

For production deployment:

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set production environment variables** in Vercel dashboard

3. **Configure custom domain** and SSL

4. **Set up monitoring** and error tracking

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Next.js 14 App Router](https://nextjs.org/docs)

---

🎉 **Congratulations!** Your VITALpath platform is ready to transform digital health development!

For support, please check the implementation documentation or create an issue in the repository.