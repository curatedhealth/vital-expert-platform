/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup.
 * Fails fast if critical configuration is missing.
 *
 * Features:
 * - Type-safe validation using Zod
 * - Clear error messages
 * - Optional vs required distinction
 * - Environment-specific validation
 *
 * @module lib/env/validate
 */

import { z } from 'zod';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Required environment variables (fail if missing)
 */
const requiredEnvSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Redis
  REDIS_URL: z.string().url().startsWith('redis://'),

  // LLM Providers (at least one required)
  OPENAI_API_KEY: z.string().min(1),

  // Security
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  CSRF_SECRET: z.string().min(32),
});

/**
 * Optional environment variables (warnings if missing)
 */
const optionalEnvSchema = z.object({
  // Database
  DATABASE_POOL_MIN: z.string().optional(),
  DATABASE_POOL_MAX: z.string().optional(),
  DATABASE_TIMEOUT: z.string().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().optional(),
  CACHE_TTL: z.string().optional(),

  // LLM Providers
  ANTHROPIC_API_KEY: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),

  // Vector Stores
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().optional(),

  // Feature Flags
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).optional(),
  ENABLE_CIRCUIT_BREAKERS: z.enum(['true', 'false']).optional(),
  ENABLE_AUDIT_LOGGING: z.enum(['true', 'false']).optional(),
  DEBUG: z.enum(['true', 'false']).optional(),

  // Compliance
  HIPAA_ENABLED: z.enum(['true', 'false']).optional(),
  GDPR_ENABLED: z.enum(['true', 'false']).optional(),
  DATA_RETENTION_DAYS: z.string().optional(),
  AUDIT_RETENTION_DAYS: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_PER_MINUTE: z.string().optional(),
  RATE_LIMIT_PER_HOUR: z.string().optional(),
  RATE_LIMIT_PER_DAY_IP: z.string().optional(),

  // Timeouts
  ORCHESTRATION_TIMEOUT: z.string().optional(),
  LLM_TIMEOUT: z.string().optional(),
  DB_QUERY_TIMEOUT: z.string().optional(),
  VECTOR_SEARCH_TIMEOUT: z.string().optional(),
});

/**
 * Combined environment schema
 */
const envSchema = requiredEnvSchema.merge(optionalEnvSchema);

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

/**
 * Validate environment variables
 *
 * @throws Error if required variables are missing
 * @returns Validated environment object
 */
export function validateEnv(): z.infer<typeof envSchema> {
  try {
    const env = envSchema.parse(process.env);

    // Success - log confirmation
    console.log('✅ Environment variables validated successfully');

    // Warning for missing optional variables
    warnMissingOptionals();

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  - ${path}: ${err.message}`);
      });

      console.error('\n💡 Check your .env file and ensure all required variables are set.\n');

      throw new Error('Environment validation failed');
    }

    throw error;
  }
}

/**
 * Warn about missing optional variables
 */
function warnMissingOptionals(): void {
  const warnings: string[] = [];

  // Check critical optional variables
  if (!process.env.ANTHROPIC_API_KEY && !process.env.HUGGINGFACE_API_KEY) {
    warnings.push(
      'No fallback LLM providers configured (ANTHROPIC_API_KEY, HUGGINGFACE_API_KEY)'
    );
  }

  if (!process.env.PINECONE_API_KEY) {
    warnings.push('PINECONE_API_KEY not set - vector search will use pgvector only (slower)');
  }

  if (!process.env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error tracking disabled');
  }

  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    warnings.push('OTEL_EXPORTER_OTLP_ENDPOINT not set - distributed tracing disabled');
  }

  if (process.env.ENABLE_RATE_LIMITING !== 'true') {
    warnings.push('Rate limiting disabled - recommended for production');
  }

  if (process.env.ENABLE_AUDIT_LOGGING !== 'true') {
    warnings.push('Audit logging disabled - required for HIPAA/SOC 2 compliance');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Optional configuration warnings:\n');
    warnings.forEach((warning) => {
      console.warn(`  - ${warning}`);
    });
    console.warn('');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get validated environment variable
 *
 * @param key - Environment variable key
 * @returns Environment variable value
 * @throws Error if variable is not set
 */
export function getEnvVar(key: keyof z.infer<typeof envSchema>): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Get optional environment variable
 *
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
export function getOptionalEnvVar(
  key: keyof z.infer<typeof envSchema>,
  defaultValue: string
): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Check if feature flag is enabled
 *
 * @param flag - Feature flag name
 * @returns True if enabled
 */
export function isFeatureEnabled(
  flag: 'ENABLE_RATE_LIMITING' | 'ENABLE_CIRCUIT_BREAKERS' | 'ENABLE_AUDIT_LOGGING' | 'DEBUG'
): boolean {
  return process.env[flag] === 'true';
}

/**
 * Check if compliance mode is enabled
 *
 * @param mode - Compliance mode
 * @returns True if enabled
 */
export function isComplianceModeEnabled(mode: 'HIPAA_ENABLED' | 'GDPR_ENABLED'): boolean {
  return process.env[mode] === 'true';
}

// ============================================================================
// AUTO-VALIDATE (if not in test environment)
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Env = z.infer<typeof envSchema>;
export type RequiredEnv = z.infer<typeof requiredEnvSchema>;
export type OptionalEnv = z.infer<typeof optionalEnvSchema>;
