/**
 * Drizzle Kit Configuration
 *
 * Configuration for Drizzle migration generator and introspection tools.
 * This file is used by the Drizzle CLI for schema management.
 *
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default {
  // Schema definition location
  schema: './src/lib/db/drizzle/schema.ts',

  // Output directory for migrations
  out: './database/migrations-drizzle',

  // Database dialect (driver renamed to dialect in newer versions)
  dialect: 'postgresql',

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging
  verbose: true,

  // Strict mode (fails on breaking changes)
  strict: true,

  // Table filter (optional - include/exclude tables)
  // tablesFilter: ['*'],
} satisfies Config;
