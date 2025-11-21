#!/usr/bin/env tsx

/**
 * Environment Validation CLI Script
 *
 * Validates environment configuration and provides detailed feedback.
 * Run manually: pnpm validate:env
 *
 * @module scripts/validate-environment
 */

import { validateEnv, isFeatureEnabled, isComplianceModeEnabled } from '../src/lib/env/validate';

function main(): void {
  console.log('🔍 Validating environment configuration...\n');

  try {
    // Validate environment
    const env = validateEnv();

    // Environment info
    console.log('📊 Environment Summary:');
    console.log(`  - Environment: ${env.NODE_ENV}`);
    console.log(`  - App URL: ${env.NEXT_PUBLIC_APP_URL}`);
    console.log(`  - Database: ${maskConnectionString(env.DATABASE_URL)}`);
    console.log(`  - Redis: ${maskConnectionString(env.REDIS_URL)}`);
    console.log('');

    // Feature flags
    console.log('🚩 Feature Flags:');
    console.log(`  - Rate Limiting: ${isFeatureEnabled('ENABLE_RATE_LIMITING') ? '✅' : '❌'}`);
    console.log(
      `  - Circuit Breakers: ${isFeatureEnabled('ENABLE_CIRCUIT_BREAKERS') ? '✅' : '❌'}`
    );
    console.log(`  - Audit Logging: ${isFeatureEnabled('ENABLE_AUDIT_LOGGING') ? '✅' : '❌'}`);
    console.log(`  - Debug Mode: ${isFeatureEnabled('DEBUG') ? '✅' : '❌'}`);
    console.log('');

    // Compliance
    console.log('🔒 Compliance Modes:');
    console.log(`  - HIPAA: ${isComplianceModeEnabled('HIPAA_ENABLED') ? '✅' : '❌'}`);
    console.log(`  - GDPR: ${isComplianceModeEnabled('GDPR_ENABLED') ? '✅' : '❌'}`);
    console.log('');

    // LLM Providers
    console.log('🤖 LLM Providers:');
    console.log(`  - OpenAI: ✅ (${env.OPENAI_API_KEY.substring(0, 10)}...)`);
    console.log(
      `  - Anthropic: ${env.ANTHROPIC_API_KEY ? `✅ (${env.ANTHROPIC_API_KEY.substring(0, 10)}...)` : '❌'}`
    );
    console.log(
      `  - HuggingFace: ${env.HUGGINGFACE_API_KEY ? `✅ (${env.HUGGINGFACE_API_KEY.substring(0, 10)}...)` : '❌'}`
    );
    console.log('');

    // Vector Stores
    console.log('🔍 Vector Stores:');
    console.log(`  - Pinecone: ${env.PINECONE_API_KEY ? '✅' : '❌ (using pgvector only)'}`);
    console.log('  - pgvector: ✅ (via PostgreSQL)');
    console.log('');

    // Observability
    console.log('📈 Observability:');
    console.log(`  - Sentry: ${env.SENTRY_DSN ? '✅' : '❌'}`);
    console.log(`  - OpenTelemetry: ${env.OTEL_EXPORTER_OTLP_ENDPOINT ? '✅' : '❌'}`);
    console.log('');

    // Production checks
    if (env.NODE_ENV === 'production') {
      console.log('🚨 Production Environment Checks:');

      const productionIssues: string[] = [];

      if (!isFeatureEnabled('ENABLE_RATE_LIMITING')) {
        productionIssues.push('Rate limiting is disabled');
      }

      if (!isFeatureEnabled('ENABLE_AUDIT_LOGGING')) {
        productionIssues.push('Audit logging is disabled (required for compliance)');
      }

      if (!env.SENTRY_DSN) {
        productionIssues.push('Error tracking (Sentry) is not configured');
      }

      if (!env.PINECONE_API_KEY) {
        productionIssues.push('Pinecone is not configured (slower vector search)');
      }

      if (env.JWT_SECRET.length < 64) {
        productionIssues.push('JWT_SECRET should be at least 64 characters in production');
      }

      if (productionIssues.length > 0) {
        console.log('  ❌ Issues found:\n');
        productionIssues.forEach((issue) => {
          console.log(`    - ${issue}`);
        });
        console.log('');
        process.exit(1);
      } else {
        console.log('  ✅ All production checks passed\n');
      }
    }

    console.log('✅ Environment validation complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Environment validation failed\n');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

/**
 * Mask connection string for security
 */
function maskConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '****';
    }
    return url.toString();
  } catch {
    return '****';
  }
}

// Run main function
main();
