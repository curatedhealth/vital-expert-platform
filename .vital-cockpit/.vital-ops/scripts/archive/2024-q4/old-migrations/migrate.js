#!/usr/bin/env node

// Register TypeScript loader
require('ts-node/register');

const { createMigrationRunner } = require('../src/lib/database/migration-runner.ts');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const command = process.argv[2];

  try {
    const migrationRunner = createMigrationRunner();

    switch (command) {
      case 'run':
      case 'up':
        console.log('🔄 Running pending migrations...');
        const results = await migrationRunner.runPendingMigrations();

        if (results.length === 0) {
          console.log('✅ Database is up to date');
          process.exit(0);
        }

        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`❌ ${failed.length} migrations failed`);
          failed.forEach(result => {
            console.error(`  - ${result.migration.name}: ${result.error}`);
          });
          process.exit(1);
        }

        console.log(`✅ Successfully applied ${results.length} migrations`);
        break;

      case 'status':
        console.log('📊 Checking migration status...');
        const isValid = await migrationRunner.validateMigrations();

        if (isValid) {
          console.log('✅ All migrations are valid');
        } else {
          console.log('⚠️  Migration inconsistencies detected');
          process.exit(1);
        }
        break;

      case 'validate':
        console.log('🔍 Validating migration files...');
        const valid = await migrationRunner.validateMigrations();

        if (valid) {
          console.log('✅ All migration files are valid');
        } else {
          console.log('❌ Migration validation failed');
          process.exit(1);
        }
        break;

      default:
        console.log(`
JTBD Migration Tool

Usage:
  npm run migrate [command]

Commands:
  run, up      Apply all pending migrations
  status       Check migration status
  validate     Validate migration files

Examples:
  npm run migrate run
  npm run migrate status
  npm run migrate validate
        `);
        break;
    }
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };