# VITAL Path - Database Connection Setup Guide

This guide explains how to connect your Supabase database to the VITAL Path Digital Health Platform frontend.

## 🚀 Quick Setup

### Step 1: Configure Environment Variables

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from the Supabase dashboard
3. Update your `.env.local` file with your actual credentials:

```env
# Supabase Configuration - REPLACE WITH YOUR VALUES
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### Step 2: Set Up the Database Schema

Run the database setup script to create all required tables and seed initial data:

```bash
# Setup database tables and initial data
npx tsx scripts/setup-supabase.ts
```

### Step 3: Test Database Connection

Verify that all database connections are working:

```bash
# Test database connectivity
npx tsx scripts/test-db-connection.ts
```

### Step 4: Launch the Application

```bash
# Start the development server
npm run dev
```

Your application should now be fully connected to Supabase!

## 📊 Database Schema Overview

The VITAL Path platform uses the following core tables:

### Core Tables
- **organizations** - Healthcare organizations and companies
- **user_profiles** - Extended user information (linked to Supabase auth)
- **projects** - Digital health projects and initiatives
- **ai_agents** - Healthcare AI agent configurations
- **llm_providers** - LLM provider configurations and settings

### Chat & Communication
- **chat_conversations** - User conversations with AI agents
- **chat_messages** - Individual messages in conversations
- **prompts** - AI prompt templates and configurations

### Knowledge Management
- **knowledge_documents** - Uploaded documents and files
- **document_chunks** - Text chunks for RAG functionality
- **embeddings** - Vector embeddings for semantic search

### Healthcare Specific
- **agent_capabilities** - Healthcare-specific agent abilities
- **compliance_logs** - HIPAA and regulatory compliance tracking
- **clinical_validations** - Clinical validation records

## 🔧 Frontend Database Integration

The frontend connects to Supabase through several service layers:

### 1. Supabase Client Configuration
```typescript
// src/lib/supabase/client.ts - Browser client
// src/lib/supabase/server.ts - Server-side client
```

### 2. Service Layer Integration
- **LLM Provider Service** (`src/shared/services/llm/llm-provider.service.ts`)
- **RAG Service** (`src/shared/services/rag/supabase-rag-service.ts`)
- **Agent Services** (Multiple agent-specific services)

### 3. API Route Integration
All API routes in `src/app/api/` use Supabase for data persistence:
- `/api/llm/providers` - LLM provider management
- `/api/knowledge/*` - Knowledge base operations
- `/api/agents/*` - AI agent management
- `/api/chat/*` - Chat functionality

### 4. Real-time Features
The platform supports real-time updates through Supabase realtime:
- Live chat messages
- Real-time collaboration
- Status updates
- Notification system

## 🛡️ Security & Compliance

### Row Level Security (RLS)
All tables have Row Level Security policies that:
- Restrict access based on organization membership
- Enforce user permissions
- Protect sensitive healthcare data
- Comply with HIPAA requirements

### Authentication
- Users authenticate through Supabase Auth
- JWT tokens are automatically handled
- Role-based access control (RBAC) is implemented
- Session management is built-in

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify Supabase URL and API keys are correct
   - Check that your Supabase project is active
   - Ensure RLS policies allow access

2. **Missing Tables**
   - Run the setup script: `npx tsx scripts/setup-supabase.ts`
   - Check Supabase dashboard for any migration errors

3. **Permission Denied**
   - Verify RLS policies are correctly configured
   - Check user authentication status
   - Ensure service role key has proper permissions

4. **Vector Extension Issues**
   - Enable pgvector extension in Supabase dashboard
   - Some features may require manual extension activation

### Database Testing Commands

```bash
# Test basic connectivity
npx tsx scripts/test-db-connection.ts

# Reset and recreate database
npx tsx scripts/setup-supabase.ts

# Check specific table
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('ai_agents').select('*').limit(5).then(console.log);
"
```

## 📈 Performance Optimization

### Database Indexes
The schema includes optimized indexes for:
- Frequent query patterns
- Search functionality
- Vector similarity searches
- Time-series data

### Connection Pooling
- Supabase handles connection pooling automatically
- No additional configuration needed for development
- Production deployments benefit from built-in scaling

### Caching Strategy
- Client-side caching through React Query
- Server-side caching for static data
- Real-time invalidation for dynamic content

## 🚀 Production Deployment

### Environment Configuration
```env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key

# Additional security
ENCRYPTION_MASTER_KEY=your_secure_256_bit_key
```

### Security Checklist
- [ ] RLS policies are properly configured
- [ ] API keys are securely stored
- [ ] Service role key is restricted to server-side only
- [ ] Audit logging is enabled
- [ ] Backup procedures are in place

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [VITAL Path Architecture Documentation](./docs/platform_description.md)
- [Healthcare Compliance Guide](./docs/compliance/HIPAA_COMPLIANCE.md)

## 🆘 Support

If you encounter issues with database connectivity:

1. Check the console logs in your browser developer tools
2. Review the server logs for detailed error messages
3. Run the database test script to identify specific issues
4. Refer to the troubleshooting section above
5. Check Supabase dashboard for service status

For production issues, ensure you have proper monitoring and alerting in place.