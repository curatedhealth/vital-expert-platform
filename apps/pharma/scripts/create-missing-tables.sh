#!/bin/bash

echo "🗄️ Creating Missing Database Tables"
echo "===================================="

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo ""
echo "📋 Creating tables:"
echo "• user_agents"
echo "• chat_sessions" 
echo "• chat_messages"

echo ""
echo "🔧 Creating user_agents table..."

curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS public.user_agents (
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      PRIMARY KEY (user_id, agent_id)
    );
    ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;
    CREATE POLICY \"Allow individual read access\" ON public.user_agents FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY \"Allow individual insert access\" ON public.user_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY \"Allow individual delete access\" ON public.user_agents FOR DELETE USING (auth.uid() = user_id);"
  }'

echo ""
echo "🔧 Creating chat_sessions table..."

curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS public.chat_sessions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title text NOT NULL DEFAULT '\''New Chat'\'',
      mode text NOT NULL DEFAULT '\''manual'\'',
      agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
      agent_name text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL,
      last_message_at timestamp with time zone DEFAULT now() NOT NULL,
      message_count integer DEFAULT 0 NOT NULL,
      is_active boolean DEFAULT true NOT NULL,
      metadata jsonb DEFAULT '\''{}'\''::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON public.chat_sessions(user_id, is_active) WHERE is_active = true;
    ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY \"Users can view their own chat sessions\" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY \"Users can insert their own chat sessions\" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY \"Users can update their own chat sessions\" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY \"Users can delete their own chat sessions\" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);"
  }'

echo ""
echo "🔧 Creating chat_messages table..."

curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS public.chat_messages (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('\''user'\'', '\''assistant'\'', '\''system'\'')),
      content text NOT NULL,
      agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
      agent_name text,
      mode text NOT NULL DEFAULT '\''manual'\'',
      metadata jsonb DEFAULT '\''{}'\''::jsonb,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(session_id, created_at);
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY \"Users can view messages from their sessions\" ON public.chat_messages FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_id AND user_id = auth.uid()
      )
    );
    CREATE POLICY \"Users can insert messages to their sessions\" ON public.chat_messages FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_id AND user_id = auth.uid()
      )
    );
    CREATE POLICY \"Users can update messages in their sessions\" ON public.chat_messages FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_id AND user_id = auth.uid()
      )
    );
    CREATE POLICY \"Users can delete messages from their sessions\" ON public.chat_messages FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_id AND user_id = auth.uid()
      )
    );"
  }'

echo ""
echo "✅ Database tables creation completed!"
echo ""
echo "📊 Tables created:"
echo "• user_agents - User-agent relationships"
echo "• chat_sessions - Chat session metadata"
echo "• chat_messages - Individual chat messages"
echo ""
echo "🔒 Security features:"
echo "• Row Level Security (RLS) enabled"
echo "• User-specific access policies"
echo "• Proper foreign key relationships"
echo ""
echo "🎯 Ready for testing!"
