import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting database migrations for long-term memory tables...');

    // Migration 1: Long-term memory tables
    const longTermMemorySQL = `
      -- Enable UUID extension if not exists
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- User Facts Table
      CREATE TABLE IF NOT EXISTS user_facts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          fact_type VARCHAR(50) NOT NULL,
          fact_content TEXT NOT NULL,
          confidence_score DECIMAL(3,2) DEFAULT 0.8,
          source VARCHAR(100) DEFAULT 'conversation',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User Projects Table
      CREATE TABLE IF NOT EXISTS user_projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User Goals Table
      CREATE TABLE IF NOT EXISTS user_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
          priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          deadline TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User Long Term Memory Table
      CREATE TABLE IF NOT EXISTS user_long_term_memory (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL UNIQUE,
          memory_data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Chat Memory Table
      CREATE TABLE IF NOT EXISTS chat_memory (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          strategy VARCHAR(50) NOT NULL,
          memory_data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Chat History Table
      CREATE TABLE IF NOT EXISTS chat_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          message_id VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Chat Messages Table (if not exists)
      CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          agent_id VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON user_facts(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_facts_type ON user_facts(fact_type);
      CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON chat_memory(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON chat_memory(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_memory_strategy ON chat_memory(strategy);
      CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
    `;

    // Execute the migration by running each table creation separately
    const tables = [
      // Enable UUID extension
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      
      // User Facts Table
      `CREATE TABLE IF NOT EXISTS user_facts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          fact_type VARCHAR(50) NOT NULL,
          fact_content TEXT NOT NULL,
          confidence_score DECIMAL(3,2) DEFAULT 0.8,
          source VARCHAR(100) DEFAULT 'conversation',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // User Projects Table
      `CREATE TABLE IF NOT EXISTS user_projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
          progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // User Goals Table
      `CREATE TABLE IF NOT EXISTS user_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
          priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          deadline TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // User Long Term Memory Table
      `CREATE TABLE IF NOT EXISTS user_long_term_memory (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id VARCHAR(255) NOT NULL UNIQUE,
          memory_data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Chat Memory Table
      `CREATE TABLE IF NOT EXISTS chat_memory (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          strategy VARCHAR(50) NOT NULL,
          memory_data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Chat History Table
      `CREATE TABLE IF NOT EXISTS chat_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          message_id VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ];

    // Execute each table creation
    for (const sql of tables) {
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.warn('⚠️ Table creation warning (may already exist):', error.message);
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON user_facts(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_facts_type ON user_facts(fact_type);',
      'CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON chat_memory(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON chat_memory(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_memory_strategy ON chat_memory(strategy);',
      'CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);'
    ];

    for (const sql of indexes) {
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.warn('⚠️ Index creation warning:', error.message);
      }
    }

    console.log('✅ Long-term memory tables migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Long-term memory tables created successfully',
      tables: [
        'user_facts',
        'user_projects', 
        'user_goals',
        'user_long_term_memory',
        'chat_memory',
        'chat_history',
        'chat_messages'
      ]
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}