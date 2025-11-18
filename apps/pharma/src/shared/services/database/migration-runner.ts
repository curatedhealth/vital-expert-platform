import fs from 'fs';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

import { SQLExecutor } from './sql-executor';

export interface Migration {
  id: string;
  name: string;
  sql: string;
  checksum: string;
}

export interface MigrationResult {
  success: boolean;
  migration: Migration;
  error?: string;
  appliedAt?: Date;
}

export class MigrationRunner {
  private supabase;
  private sqlExecutor: SQLExecutor;
  private migrationsPath: string;

  constructor(supabaseUrl: string, supabaseKey: string, migrationsPath?: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    this.sqlExecutor = new SQLExecutor(supabaseUrl, supabaseKey);
    this.migrationsPath = migrationsPath || path.join(process.cwd(), 'supabase', 'migrations');
  }

  private generateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private async ensureMigrationTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(32) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time_ms INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_id ON schema_migrations(migration_id);
    `;

    const { error } = await this.sqlExecutor.executeSQL(createTableSQL);

    if (error) {
      throw new Error(`Failed to create migration table: ${error.message}`);
    }
  }

  private async executeSQL(sql: string): Promise<void> {
    const { error } = await this.sqlExecutor.executeSQL(sql);

    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }

  private async getMigrationFiles(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const filePath = path.join(this.migrationsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const migrationId = file.replace('.sql', '');

      return {
        id: migrationId,
        name: file,
        sql: content,
        checksum: this.generateChecksum(content)
      };
    });
  }

  private async getAppliedMigrations(): Promise<Set<string>> {
    try {
      const { data, error } = await this.supabase
        .from('schema_migrations')
        .select('migration_id');

      if (error) {
        console.warn('Could not fetch applied migrations, assuming none applied:', error.message);
        return new Set();
      }

      return new Set(data?.map(row => row.migration_id) || []);
    } catch (error) {
      console.warn('Migration table may not exist yet, will create it');
      return new Set();
    }
  }

  private async recordMigration(migration: Migration, executionTime: number): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .insert({
        migration_id: migration.id,
        name: migration.name,
        checksum: migration.checksum,
        execution_time_ms: executionTime
      });

    if (error) {
      throw new Error(`Failed to record migration: ${error.message}`);
    }
  }

  async runPendingMigrations(): Promise<MigrationResult[]> {
    try {
      // Ensure migration tracking table exists
      await this.ensureMigrationTable();

      // Get all migration files and applied migrations
      const [allMigrations, appliedMigrations] = await Promise.all([
        this.getMigrationFiles(),
        this.getAppliedMigrations()
      ]);

      // Filter to pending migrations
      const pendingMigrations = allMigrations.filter(
        migration => !appliedMigrations.has(migration.id)
      );

      if (pendingMigrations.length === 0) {
        return [];
      }
      const results: MigrationResult[] = [];

      // Apply each pending migration
      for (const migration of pendingMigrations) {
        const startTime = Date.now();

        try {
          await this.executeSQL(migration.sql);
          const executionTime = Date.now() - startTime;

          await this.recordMigration(migration, executionTime);

          `);

          results.push({
            success: true,
            migration,
            appliedAt: new Date()
          });
        } catch (error) {
          console.error(`❌ Migration ${migration.name} failed:`, error);

          results.push({
            success: false,
            migration,
            error: error instanceof Error ? error.message : String(error)
          });

          // Stop on first failure to maintain consistency
          break;
        }
      }

      return results;
    } catch (error) {
      console.error('💥 Migration process failed:', error);
      throw error;
    }
  }

  async rollbackMigration(migrationId: string): Promise<void> {
    // Future enhancement: implement rollback functionality
    throw new Error('Migration rollback not yet implemented');
  }

  async validateMigrations(): Promise<boolean> {
    try {
      const [allMigrations, appliedMigrations] = await Promise.all([
        this.getMigrationFiles(),
        this.getAppliedMigrations()
      ]);

      // Check if all applied migrations still exist and have correct checksums
      for (const appliedId of appliedMigrations) {
        const migration = allMigrations.find((m: any) => m.id === appliedId);
        if (!migration) {
          console.warn(`⚠️  Applied migration ${appliedId} no longer exists in filesystem`);
          return false;
        }

        // Could add checksum validation here if needed
      }

      return true;
    } catch (error) {
      console.error('Migration validation failed:', error);
      return false;
    }
  }
}

// Factory function for easy instantiation
export function createMigrationRunner(
  supabaseUrl?: string,
  supabaseKey?: string,
  migrationsPath?: string
): MigrationRunner {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required for migrations');
  }

  return new MigrationRunner(url, key, migrationsPath);
}