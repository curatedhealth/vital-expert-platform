#!/bin/bash

echo "🗄️ Creating Database Tables via Supabase REST API"
echo "================================================="

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo ""
echo "📋 Environment Check:"
echo "• Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "• Service Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

echo ""
echo "🔧 Creating user_agents table via REST API..."

# Create user_agents table using REST API
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/user_agents" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"user_id": "00000000-0000-0000-0000-000000000000", "agent_id": "00000000-0000-0000-0000-000000000000"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Table creation attempted (may already exist)"

echo ""
echo "🔧 Creating chat_sessions table via REST API..."

# Create chat_sessions table using REST API
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/chat_sessions" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"user_id": "00000000-0000-0000-0000-000000000000", "title": "Test Session"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Table creation attempted (may already exist)"

echo ""
echo "🔧 Creating chat_messages table via REST API..."

# Create chat_messages table using REST API
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/chat_messages" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"session_id": "00000000-0000-0000-0000-000000000000", "role": "user", "content": "test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null || echo "Table creation attempted (may already exist)"

echo ""
echo "📝 Manual Database Setup Required"
echo "=================================="
echo ""
echo "The automated table creation failed. Please create the tables manually:"
echo ""
echo "1. Go to your Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Navigate to your project"
echo "3. Go to SQL Editor"
echo "4. Run the following SQL:"
echo ""
echo "-- Create user_agents table"
echo "CREATE TABLE IF NOT EXISTS public.user_agents ("
echo "  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,"
echo "  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,"
echo "  created_at timestamp with time zone DEFAULT now() NOT NULL,"
echo "  PRIMARY KEY (user_id, agent_id)"
echo ");"
echo ""
echo "-- Create chat_sessions table"
echo "CREATE TABLE IF NOT EXISTS public.chat_sessions ("
echo "  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,"
echo "  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,"
echo "  title text NOT NULL DEFAULT 'New Chat',"
echo "  mode text NOT NULL DEFAULT 'manual',"
echo "  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,"
echo "  agent_name text,"
echo "  created_at timestamp with time zone DEFAULT now() NOT NULL,"
echo "  updated_at timestamp with time zone DEFAULT now() NOT NULL,"
echo "  last_message_at timestamp with time zone DEFAULT now() NOT NULL,"
echo "  message_count integer DEFAULT 0 NOT NULL,"
echo "  is_active boolean DEFAULT true NOT NULL,"
echo "  metadata jsonb DEFAULT '{}'::jsonb"
echo ");"
echo ""
echo "-- Create chat_messages table"
echo "CREATE TABLE IF NOT EXISTS public.chat_messages ("
echo "  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,"
echo "  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,"
echo "  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),"
echo "  content text NOT NULL,"
echo "  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,"
echo "  agent_name text,"
echo "  mode text NOT NULL DEFAULT 'manual',"
echo "  metadata jsonb DEFAULT '{}'::jsonb,"
echo "  created_at timestamp with time zone DEFAULT now() NOT NULL,"
echo "  updated_at timestamp with time zone DEFAULT now() NOT NULL"
echo ");"
echo ""
echo "-- Enable RLS and create policies"
echo "ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;"
echo "ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;"
echo "ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;"
echo ""
echo "-- Create policies (run these after creating tables)"
echo "-- Policies for user_agents"
echo "CREATE POLICY \"Allow individual read access\" ON public.user_agents FOR SELECT USING (auth.uid() = user_id);"
echo "CREATE POLICY \"Allow individual insert access\" ON public.user_agents FOR INSERT WITH CHECK (auth.uid() = user_id);"
echo "CREATE POLICY \"Allow individual delete access\" ON public.user_agents FOR DELETE USING (auth.uid() = user_id);"
echo ""
echo "-- Policies for chat_sessions"
echo "CREATE POLICY \"Users can view their own chat sessions\" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);"
echo "CREATE POLICY \"Users can insert their own chat sessions\" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);"
echo "CREATE POLICY \"Users can update their own chat sessions\" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);"
echo "CREATE POLICY \"Users can delete their own chat sessions\" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);"
echo ""
echo "-- Policies for chat_messages"
echo "CREATE POLICY \"Users can view messages from their sessions\" ON public.chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));"
echo "CREATE POLICY \"Users can insert messages to their sessions\" ON public.chat_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));"
echo "CREATE POLICY \"Users can update messages in their sessions\" ON public.chat_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));"
echo "CREATE POLICY \"Users can delete messages from their sessions\" ON public.chat_messages FOR DELETE USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()));"
echo ""
echo "5. After running the SQL, refresh your browser"
echo ""
echo "🎯 This will enable chat history persistence!"
