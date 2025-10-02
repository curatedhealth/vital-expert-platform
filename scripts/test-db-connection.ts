#!/usr/bin/env tsx

/**
 * Database Connection Test Script
 * Tests all Supabase database connections and table accessibility
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

interface DatabaseTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
}

class DatabaseConnectionTester {
  private supabase: any;
  private results: Map<string, { success: boolean; error?: string; data?: any }> = new Map();

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration in .env.local');
      console.log('Please set:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
      process.exit(1);
    }

    // Check for placeholder values - skip this check since credentials are now provided
    // if (supabaseUrl.includes('your-project') || supabaseKey.includes('your_supabase')) {
    //   console.error('❌ Supabase configuration contains placeholder values');
    //   console.log('Please replace placeholder values in .env.local with your actual Supabase credentials');
    //   process.exit(1);
    // }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🔧 Supabase client initialized');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 10)}...`);
  }

  async runTests(): Promise<void> {
    console.log('\n🧪 Starting Database Connection Tests...\n');

    const tests: DatabaseTest[] = [
      {
        name: 'connection',
        description: 'Basic connection test',
        test: () => this.testBasicConnection()
      },
      {
        name: 'organizations',
        description: 'Organizations table',
        test: () => this.testTable('organizations')
      },
      {
        name: 'user_profiles',
        description: 'User profiles table',
        test: () => this.testTable('user_profiles')
      },
      {
        name: 'projects',
        description: 'Projects table',
        test: () => this.testTable('projects')
      },
      {
        name: 'ai_agents',
        description: 'AI Agents table',
        test: () => this.testTable('ai_agents')
      },
      {
        name: 'llm_providers',
        description: 'LLM Providers table',
        test: () => this.testTable('llm_providers')
      },
      {
        name: 'chat_conversations',
        description: 'Chat conversations table',
        test: () => this.testTable('chat_conversations')
      },
      {
        name: 'chat_messages',
        description: 'Chat messages table',
        test: () => this.testTable('chat_messages')
      },
      {
        name: 'knowledge_documents',
        description: 'Knowledge documents table',
        test: () => this.testTable('knowledge_documents')
      },
      {
        name: 'prompts',
        description: 'Prompts table',
        test: () => this.testTable('prompts')
      }
    ];

    let passedTests = 0;

    for (const test of tests) {
      try {
        const success = await test.test();
        if (success) {
          console.log(`✅ ${test.description}: PASSED`);
          passedTests++;
          this.results.set(test.name, { success: true });
        } else {
          console.log(`❌ ${test.description}: FAILED`);
          this.results.set(test.name, { success: false });
        }
      } catch (error) {
        console.log(`❌ ${test.description}: ERROR - ${error instanceof Error ? error.message : String(error)}`);
        this.results.set(test.name, { success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    console.log(`\n📊 Test Results: ${passedTests}/${tests.length} passed`);

    if (passedTests === tests.length) {
      console.log('🎉 All database connections are working correctly!');
    } else {
      console.log('⚠️  Some database connections failed. Please check your Supabase configuration.');
      this.printDiagnostics();
    }
  }

  private async testBasicConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      return false;
    }
  }

  private async testTable(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   Error accessing ${tableName}: ${error.message}`);
        return false;
      }

      this.results.set(tableName, { success: true, data: { recordCount: data?.length || 0 } });
      return true;
    } catch (error) {
      return false;
    }
  }

  private printDiagnostics(): void {
    console.log('\n🔍 Diagnostics:');
    console.log('1. Verify your Supabase project URL and anon key in .env.local');
    console.log('2. Check that your Supabase project has the required tables:');

    const failedTables = Array.from(this.results.entries())
      .filter(([_, result]) => !result.success)
      .map(([name, _]) => name);

    if (failedTables.length > 0) {
      console.log('   Missing or inaccessible tables:');
      failedTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n3. Run database migrations to create missing tables:');
      console.log('   npm run db:migrate');
    }

    console.log('\n4. Verify Row Level Security (RLS) policies allow access');
    console.log('5. Check Supabase dashboard for any service issues');
  }
}

// Main execution
async function main() {
  const tester = new DatabaseConnectionTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseConnectionTester };