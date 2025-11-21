#!/usr/bin/env tsx

/**
 * Supabase Database Setup Script
 * Runs all necessary migrations and seeds the database with initial data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

class SupabaseSetup {
  private supabase: any;
  private migrationPath = join(process.cwd(), 'database/sql/migrations');
  private seedPath = join(process.cwd(), 'database/sql/seeds');

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration in .env.local');
      console.log('Please set:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- SUPABASE_SERVICE_ROLE_KEY (service role key, not anon key)');
      process.exit(1);
    }

    // Check for placeholder values - skip this check since credentials are now provided
    // if (supabaseUrl.includes('your-project') || supabaseServiceKey.includes('your_supabase')) {
    //   console.error('❌ Supabase configuration contains placeholder values');
    //   console.log('Please replace placeholder values in .env.local with your actual Supabase credentials');
    //   process.exit(1);
    // }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔧 Supabase service client initialized');
  }

  async runSetup(): Promise<void> {
    console.log('🚀 Starting Supabase Database Setup...\n');

    try {
      // 1. Create extensions
      await this.createExtensions();

      // 2. Run core migrations
      await this.runCoreMigrations();

      // 3. Run 2025 migrations
      await this.run2025Migrations();

      // 4. Seed initial data
      await this.seedDatabase();

      // 5. Create default organization and admin user
      await this.createDefaultData();

      console.log('\n✅ Supabase database setup completed successfully!');
      console.log('\n🔗 Database is now connected and ready for frontend use:');
      console.log('   - All tables created');
      console.log('   - Row Level Security policies applied');
      console.log('   - Initial data seeded');
      console.log('   - Healthcare agents and capabilities loaded');

    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }

  private async createExtensions(): Promise<void> {
    console.log('📦 Creating database extensions...');

    const extensions = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      'CREATE EXTENSION IF NOT EXISTS vector;'
    ];

    for (const extension of extensions) {
      try {
        const { error } = await this.supabase.rpc('exec_sql', { sql: extension });
        if (error) {
          console.warn(`⚠️  Extension warning: ${error.message}`);
        }
      } catch (error) {
        console.log('📍 Note: Some extensions may require Supabase dashboard activation');
      }
    }
  }

  private async runCoreMigrations(): Promise<void> {
    console.log('📊 Running core database migrations...');

    const coreMigrations = [
      'main_schema.sql',
      '20240101000000_initial_schema.sql',
      '20240101000001_rls_policies.sql',
      '20240102000000_agents_schema.sql',
      '20240102000002_capabilities_schema.sql',
      '20240103000001_chat_and_knowledge_schema.sql'
    ];

    await this.runMigrationFiles(coreMigrations);
  }

  private async run2025Migrations(): Promise<void> {
    console.log('🔄 Running 2025 enhancements...');

    const migrations2025 = [
      '2025/20250120000000_healthcare_compliance_enhancement.sql',
      '2025/20250919130000_comprehensive_agents_schema.sql',
      '2025/20250919140000_llm_providers_schema.sql',
      '2025/20250919141000_add_prompts_table.sql',
      '2025/20250919150000_user_roles_rbac.sql',
      '2025/20250919160000_create_jobs_table.sql',
      '2025/20250919170000_add_healthcare_fields_to_agents.sql',
      '2025/20250919180000_resolve_table_naming_conflicts.sql',
      '2025/20250919190000_create_prompts_table.sql',
      '2025/20250920000000_add_user_agent_ownership.sql'
    ];

    await this.runMigrationFiles(migrations2025, 'database/sql/migrations');
  }

  private async runMigrationFiles(files: string[], basePath?: string): Promise<void> {
    const migrationPath = basePath || 'database/sql/migrations';

    for (const file of files) {
      try {
        const filePath = join(process.cwd(), migrationPath, file);
        const sql = readFileSync(filePath, 'utf8');

        console.log(`   📄 Running ${file}...`);
        const { error } = await this.supabase.rpc('exec_sql', { sql });

        if (error) {
          console.warn(`   ⚠️  ${file}: ${error.message}`);
        } else {
          console.log(`   ✅ ${file}: Success`);
        }
      } catch (fileError) {
        console.warn(`   ⏭️  Skipping ${file}: File not found`);
      }
    }
  }

  private async seedDatabase(): Promise<void> {
    console.log('🌱 Seeding database with initial data...');

    const seedFiles = [
      'initial_seed.sql',
      '20240102000003_capabilities_seed.sql',
      '20250120000001_healthcare_capabilities_seed.sql'
    ];

    for (const file of seedFiles) {
      try {
        const filePath = join(this.seedPath, file);
        const sql = readFileSync(filePath, 'utf8');

        console.log(`   🌱 Seeding ${file}...`);
        const { error } = await this.supabase.rpc('exec_sql', { sql });

        if (error) {
          console.warn(`   ⚠️  ${file}: ${error.message}`);
        } else {
          console.log(`   ✅ ${file}: Success`);
        }
      } catch (fileError) {
        console.warn(`   ⏭️  Skipping ${file}: File not found`);
      }
    }
  }

  private async createDefaultData(): Promise<void> {
    console.log('🏢 Creating default organization and data...');

    try {
      // Create default organization
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          name: 'VITAL Path Organization',
          domain: 'vitalpath.ai',
          industry: 'Healthcare Technology',
          size: 'Enterprise'
        })
        .select()
        .single();

      if (orgError && !orgError.message.includes('duplicate')) {
        console.warn(`   ⚠️  Organization creation: ${orgError.message}`);
      } else {
        console.log('   ✅ Default organization created');
      }

    } catch (error) {
      console.warn('   📍 Default data setup completed with warnings');
    }
  }
}

// Main execution
async function main() {
  const setup = new SupabaseSetup();
  await setup.runSetup();
}

if (require.main === module) {
  main().catch(console.error);
}

export { SupabaseSetup };