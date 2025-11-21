#!/usr/bin/env tsx

/**
 * Mock Database Setup Script
 * Creates mock database tables to prevent build errors when no database is configured
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

class MockDatabaseSetup {
  private mockDbPath = join(process.cwd(), 'mock-database');
  private schemaPath = join(this.mockDbPath, 'schema.sql');

  constructor() {
    // Create mock database directory if it doesn't exist
    if (!existsSync(this.mockDbPath)) {
      mkdirSync(this.mockDbPath, { recursive: true });
    }
  }

  async setupMockDatabase(): Promise<void> {
    console.log('🔧 Setting up mock database to prevent build errors...\n');

    try {
      // Create a minimal schema that includes the required tables
      const mockSchema = this.generateMockSchema();
      
      // Write the schema to a file
      writeFileSync(this.schemaPath, mockSchema);
      
      // Create a simple database connection mock
      this.createDatabaseMock();
      
      console.log('✅ Mock database setup completed!');
      console.log('📁 Mock database files created in:', this.mockDbPath);
      console.log('🔗 This will prevent build errors when no real database is configured');
      
    } catch (error) {
      console.error('❌ Mock database setup failed:', error);
      throw error;
    }
  }

  private generateMockSchema(): string {
    return `-- Mock Database Schema for VITAL Path
-- This is a minimal schema to prevent build errors when no database is configured

-- Create enum types for LLM providers
CREATE TYPE provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'azure',
  'aws_bedrock',
  'cohere',
  'huggingface',
  'custom'
);

CREATE TYPE provider_status AS ENUM (
  'initializing',
  'active',
  'error',
  'maintenance',
  'disabled'
);

-- Minimal LLM Providers table
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(100) NOT NULL,
  provider_type provider_type NOT NULL,
  api_endpoint VARCHAR(500),
  model_id VARCHAR(200) NOT NULL,
  status provider_status DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Minimal LLM Usage Logs table
CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  llm_provider_id UUID NOT NULL REFERENCES llm_providers(id),
  agent_id UUID,
  user_id UUID,
  request_id UUID NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_input DECIMAL(10, 6) DEFAULT 0,
  cost_output DECIMAL(10, 6) DEFAULT 0,
  total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (cost_input + cost_output) STORED,
  latency_ms INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some mock data
INSERT INTO llm_providers (provider_name, provider_type, model_id) VALUES
('OpenAI GPT-4', 'openai', 'gpt-4'),
('Anthropic Claude', 'anthropic', 'claude-3-sonnet'),
('Google Gemini', 'google', 'gemini-pro');

-- Create indexes
CREATE INDEX idx_llm_providers_active ON llm_providers(is_active, status) WHERE is_active = true;
CREATE INDEX idx_usage_logs_provider_date ON llm_usage_logs(llm_provider_id, created_at);
CREATE INDEX idx_usage_logs_user_date ON llm_usage_logs(user_id, created_at);

-- Comments
COMMENT ON TABLE llm_providers IS 'Mock registry of LLM providers for development';
COMMENT ON TABLE llm_usage_logs IS 'Mock usage tracking for LLM requests';
`;
  }

  private createDatabaseMock(): void {
    const mockConnectionPath = join(this.mockDbPath, 'connection.ts');
    const mockConnection = `// Mock database connection for development
// This prevents build errors when no real database is configured

export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      limit: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  }),
  rpc: () => Promise.resolve({ data: null, error: null })
};

export default mockSupabase;
`;

    writeFileSync(mockConnectionPath, mockConnection);
  }
}

// Main execution
async function main() {
  const setup = new MockDatabaseSetup();
  await setup.setupMockDatabase();
}

if (require.main === module) {
  main().catch(console.error);
}

export { MockDatabaseSetup };
