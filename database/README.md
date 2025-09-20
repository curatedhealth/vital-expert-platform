# Supabase Setup for VITALpath

This directory contains the database schema and configuration for VITALpath's Supabase integration.

## Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon public** key
3. Copy your **service_role** key (keep this secret!)

### 3. Update Environment Variables
Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Enable Required Extensions
In your Supabase dashboard:
1. Go to **Database > Extensions**
2. Enable the following extensions:
   - `uuid-ossp` (usually enabled by default)
   - `vector` (for AI embeddings - optional but recommended)

### 5. Run Database Schema

#### Option A: With Vector Support (Recommended)
If you successfully enabled the `vector` extension:
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `schema.sql`
3. Click **Run**

#### Option B: Without Vector Support
If the `vector` extension is not available:
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `schema-no-vector.sql`
3. Click **Run**

### 6. Run Seed Data
1. In the **SQL Editor**, create a new query
2. Copy and paste the contents of `seed.sql`
3. Click **Run**

### 7. Set up Vector Search Functions
1. In the **SQL Editor**, create a new query
2. Copy and paste the contents of `vector-search-function.sql`
3. Click **Run**

This adds the necessary functions for vector similarity search used by the RAG system.

### 8. Configure Authentication
1. Go to **Authentication > Providers**
2. Configure the providers you want to use:
   - **Email**: Usually enabled by default
   - **Google**: Add your Google OAuth credentials
3. Set up redirect URLs:
   - Site URL: `http://localhost:3001` (for development)
   - Redirect URLs: `http://localhost:3001/auth/callback`

## Database Schema Overview

### Core Tables
- **organizations**: Multi-tenant organization data
- **user_profiles**: Extended user information
- **projects**: VITAL Framework projects
- **vital_milestones**: Project phase tracking

### AI & Chat System
- **ai_agents**: Custom and default AI agents
- **chat_conversations**: User chat sessions
- **chat_messages**: Individual messages
- **knowledge_base**: RAG content storage

### Security Features
- **Row Level Security (RLS)**: Enabled on all tables
- **Organization isolation**: Users only see their org data
- **Audit logs**: Track all important actions

## Files

- `schema.sql`: Full schema with vector support
- `schema-no-vector.sql`: Schema without vector extension
- `seed.sql`: Default AI agents and sample data
- `README.md`: This setup guide

## Troubleshooting

### Vector Extension Not Available
If you get an error about the `vector` type:
1. Use `schema-no-vector.sql` instead
2. Embeddings will be stored as JSON arrays
3. Performance may be slightly reduced for large datasets

### Authentication Issues
1. Check that your environment variables are correct
2. Verify redirect URLs in Supabase dashboard
3. Ensure RLS policies are properly set up

### Connection Issues
1. Check your project URL and keys
2. Verify your Supabase project is active
3. Check network connectivity

## Next Steps

Once setup is complete:
1. Restart your development server
2. Visit `http://localhost:3001`
3. Try registering a new account
4. Test the AI chat functionality

For production deployment, update your environment variables and redirect URLs accordingly.
