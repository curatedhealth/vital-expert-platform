import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Running long-term memory migration...');

    // Create user_facts table
    const { error: userFactsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_facts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          fact_type VARCHAR(50) NOT NULL,
          fact_content TEXT NOT NULL,
          confidence_score FLOAT DEFAULT 1.0,
          source_session_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (userFactsError) {
      console.error('❌ Error creating user_facts:', userFactsError);
    } else {
      console.log('✅ user_facts table created');
    }

    // Create user_long_term_memory table
    const { error: longTermMemoryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_long_term_memory (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          memory_type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          embedding VECTOR(1536),
          importance_score FLOAT DEFAULT 0.5,
          access_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (longTermMemoryError) {
      console.error('❌ Error creating user_long_term_memory:', longTermMemoryError);
    } else {
      console.log('✅ user_long_term_memory table created');
    }

    // Create chat_memory_vectors table
    const { error: chatMemoryVectorsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_memory_vectors (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          session_id UUID NOT NULL,
          message_id UUID NOT NULL,
          content TEXT NOT NULL,
          embedding VECTOR(1536),
          message_type VARCHAR(20) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (chatMemoryVectorsError) {
      console.error('❌ Error creating chat_memory_vectors:', chatMemoryVectorsError);
    } else {
      console.log('✅ chat_memory_vectors table created');
    }

    // Create conversation_entities table
    const { error: conversationEntitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS conversation_entities (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          session_id UUID,
          entity_type VARCHAR(50) NOT NULL,
          entity_name VARCHAR(200) NOT NULL,
          entity_value TEXT,
          context TEXT,
          frequency INTEGER DEFAULT 1,
          first_mentioned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_mentioned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (conversationEntitiesError) {
      console.error('❌ Error creating conversation_entities:', conversationEntitiesError);
    } else {
      console.log('✅ conversation_entities table created');
    }

    // Create user_projects table
    const { error: userProjectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          project_type VARCHAR(50) NOT NULL,
          project_name VARCHAR(200) NOT NULL,
          project_description TEXT,
          status VARCHAR(20) DEFAULT 'active',
          priority INTEGER DEFAULT 1,
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (userProjectsError) {
      console.error('❌ Error creating user_projects:', userProjectsError);
    } else {
      console.log('✅ user_projects table created');
    }

    // Create user_preferences table
    const { error: userPreferencesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          preference_key VARCHAR(100) NOT NULL,
          preference_value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, preference_key)
        );
      `
    });

    if (userPreferencesError) {
      console.error('❌ Error creating user_preferences:', userPreferencesError);
    } else {
      console.log('✅ user_preferences table created');
    }

    // Create user_goals table
    const { error: userGoalsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_goals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          goal_type VARCHAR(50) NOT NULL,
          goal_title VARCHAR(200) NOT NULL,
          goal_description TEXT,
          status VARCHAR(20) DEFAULT 'active',
          priority INTEGER DEFAULT 1,
          target_date DATE,
          progress_percentage INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (userGoalsError) {
      console.error('❌ Error creating user_goals:', userGoalsError);
    } else {
      console.log('✅ user_goals table created');
    }

    // Create chat_memory table
    const { error: chatMemoryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_memory (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          session_id UUID NOT NULL,
          memory_strategy VARCHAR(50) NOT NULL,
          memory_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (chatMemoryError) {
      console.error('❌ Error creating chat_memory:', chatMemoryError);
    } else {
      console.log('✅ chat_memory table created');
    }

    // Create chat_history table
    const { error: chatHistoryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          session_id UUID NOT NULL,
          message_id UUID NOT NULL,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (chatHistoryError) {
      console.error('❌ Error creating chat_history:', chatHistoryError);
    } else {
      console.log('✅ chat_history table created');
    }

    console.log('✅ Long-term memory migration completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Long-term memory tables created successfully' 
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
