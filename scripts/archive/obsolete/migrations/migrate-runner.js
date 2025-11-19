#!/usr/bin/env node

/**
 * Production-Ready Database Migration CLI Runner
 *
 * This JavaScript runner loads the TypeScript migration system
 * and provides a stable CLI interface.
 */

const { program } = require('commander');
const { config } = require('dotenv');
const { join, resolve } = require('path');
const { existsSync } = require('fs');

// Register TypeScript support
require('ts-node').register({
  project: resolve(__dirname, '..', 'tsconfig.migration.json'),
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

// Load environment variables
const envPath = resolve(join(__dirname, '..', '.env.local'));
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

// Load the TypeScript migration system
const {
  createMigrationSystemFromEnv,
  MigrationSystem,
  LogLevel
} = require('../src/lib/database/migration-system.ts');

class MigrationCLI {
  constructor() {
    this.migrationSystem = null;
  }

  createMigrationSystem(options = {}) {
    if (!this.migrationSystem) {
      this.migrationSystem = createMigrationSystemFromEnv({
        verbose: options.verbose || false,
        dryRun: options.dryRun || false,
        lockTimeoutMs: (options.timeout || 300) * 1000,
        maxRetries: options.maxRetries || 3,
        migrationsPath: options.migrationsPath,
        backupBeforeMigration: options.backup || false
      });
    }
    return this.migrationSystem;
  }

  async run(options = {}) {
    console.log('🚀 JTBD Platform Migration System');
    console.log('=====================================');

    try {
      const migrationSystem = this.createMigrationSystem(options);
      await migrationSystem.initialize();

      const batch = await migrationSystem.runMigrations();

      if (batch.migrations.length === 0) {
        console.log('✅ Database is up to date - no pending migrations');
        return;
      }

      console.log('\n📊 Migration Results:');
      console.log(`   Batch ID: ${batch.id}`);
      console.log(`   Total Migrations: ${batch.totalMigrations}`);
      console.log(`   Completed: ${batch.completedMigrations}`);
      console.log(`   Failed: ${batch.failedMigrations}`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Duration: ${this.formatDuration(batch.startedAt, batch.completedAt)}`);

      if (batch.status === 'completed') {
        console.log('\n🎉 All migrations completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Migration batch failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('\n💥 Migration system error:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async status(options = {}) {
    console.log('📊 Migration Status Report');
    console.log('==========================');

    try {
      const migrationSystem = this.createMigrationSystem(options);
      await migrationSystem.initialize();

      const status = await migrationSystem.getMigrationStatus();

      console.log(`\n📈 Database Status:`);
      console.log(`   Pending Migrations: ${status.pendingCount}`);
      console.log(`   Applied Migrations: ${status.appliedCount}`);
      console.log(`   Failed Migrations: ${status.failedCount}`);

      if (status.lastBatch) {
        console.log(`\n🔄 Last Migration Batch:`);
        console.log(`   Batch ID: ${status.lastBatch.id}`);
        console.log(`   Status: ${status.lastBatch.status}`);
        console.log(`   Started: ${status.lastBatch.startedAt}`);
        console.log(`   Completed: ${status.lastBatch.completedAt || 'N/A'}`);
        console.log(`   Migrations: ${status.lastBatch.completedMigrations}/${status.lastBatch.totalMigrations}`);
      }

      if (status.pendingCount > 0) {
        console.log(`\n⚠️  ${status.pendingCount} migration(s) pending execution`);
        console.log('   Run "npm run db:migrate" to apply pending migrations');
      } else {
        console.log('\n✅ Database schema is up to date');
      }

      if (status.failedCount > 0) {
        console.log(`\n🚨 ${status.failedCount} migration(s) have failed`);
        console.log('   Manual intervention may be required');
      }
    } catch (error) {
      console.error('\n💥 Status check failed:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async validate(options = {}) {
    console.log('🔍 Validating Migration Files');
    console.log('=============================');

    try {
      const migrationSystem = this.createMigrationSystem(options);
      const validation = await migrationSystem.validateMigrations();

      if (validation.valid) {
        console.log('\n✅ All migration files are valid');
      } else {
        console.log('\n❌ Migration validation failed:');
        validation.issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.error('\n💥 Validation failed:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  formatDuration(start, end) {
    if (!end) return 'N/A';

    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.round(durationMs / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

// CLI Program Setup
const cli = new MigrationCLI();

program
  .name('migrate')
  .description('JTBD Platform Database Migration System')
  .version('1.0.0');

program
  .command('run')
  .alias('up')
  .description('Run all pending migrations')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-d, --dry-run', 'Perform a dry run without executing changes')
  .option('-t, --timeout <seconds>', 'Lock timeout in seconds', '300')
  .option('-r, --max-retries <count>', 'Maximum retry attempts', '3')
  .option('-m, --migrations-path <path>', 'Custom migrations directory path')
  .option('-b, --backup', 'Create backup before migration')
  .action(async (options) => {
    await cli.run(options);
  });

program
  .command('status')
  .description('Show migration status and statistics')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-m, --migrations-path <path>', 'Custom migrations directory path')
  .action(async (options) => {
    await cli.status(options);
  });

program
  .command('validate')
  .description('Validate migration files and dependencies')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-m, --migrations-path <path>', 'Custom migrations directory path')
  .action(async (options) => {
    await cli.validate(options);
  });

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Migration process interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Migration process terminated');
  process.exit(0);
});

// Execute CLI
if (require.main === module) {
  program.parse();
}

module.exports = { MigrationCLI };