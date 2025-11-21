#!/usr/bin/env tsx
/**
 * Environment Validation Script
 * Validates all required environment variables before deployment
 *
 * Usage:
 *   npm run validate:env
 *   node --loader tsx scripts/validate-environment.ts
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Critical validations failed
 *   2 - Warning validations failed (optional vars missing)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationRule {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => { valid: boolean; message?: string };
  defaultValue?: string;
}

const VALIDATION_RULES: ValidationRule[] = [
  // ===== Critical - Supabase =====
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validator: (value) => {
      const isValid = value.startsWith('http://') || value.startsWith('https://');
      return {
        valid: isValid,
        message: isValid ? undefined : 'Must be a valid HTTP/HTTPS URL',
      };
    },
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    validator: (value) => ({
      valid: value.length > 20,
      message: value.length > 20 ? undefined : 'Key appears to be too short',
    }),
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (for server-side operations)',
    validator: (value) => ({
      valid: value.length > 20,
      message: value.length > 20 ? undefined : 'Key appears to be too short',
    }),
  },

  // ===== Critical - OpenAI =====
  {
    key: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API key for LLM operations',
    validator: (value) => {
      if (value === 'demo-key') {
        return {
          valid: false,
          message: 'Demo key detected - please set a real OpenAI API key',
        };
      }
      const isValid = value.startsWith('sk-');
      return {
        valid: isValid,
        message: isValid ? undefined : 'OpenAI API keys should start with "sk-"',
      };
    },
  },

  // ===== Optional - Redis (Rate Limiting) =====
  {
    key: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis REST URL (for rate limiting)',
    validator: (value) => ({
      valid: value.startsWith('https://'),
      message: 'Should be an HTTPS URL',
    }),
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis REST token',
  },

  // ===== Optional - Database Pool Configuration =====
  {
    key: 'DB_POOL_MIN',
    required: false,
    description: 'Minimum database connections',
    defaultValue: '2',
    validator: (value) => {
      const num = parseInt(value);
      return {
        valid: !isNaN(num) && num > 0 && num < 100,
        message: 'Must be a number between 1 and 99',
      };
    },
  },
  {
    key: 'DB_POOL_MAX',
    required: false,
    description: 'Maximum database connections',
    defaultValue: '50',
    validator: (value) => {
      const num = parseInt(value);
      return {
        valid: !isNaN(num) && num > 0 && num <= 100,
        message: 'Must be a number between 1 and 100',
      };
    },
  },
  {
    key: 'DB_POOL_IDLE_TIMEOUT',
    required: false,
    description: 'Connection idle timeout (ms)',
    defaultValue: '30000',
    validator: (value) => {
      const num = parseInt(value);
      return {
        valid: !isNaN(num) && num > 0,
        message: 'Must be a positive number',
      };
    },
  },
  {
    key: 'DB_POOL_ACQUIRE_TIMEOUT',
    required: false,
    description: 'Connection acquire timeout (ms)',
    defaultValue: '10000',
    validator: (value) => {
      const num = parseInt(value);
      return {
        valid: !isNaN(num) && num > 0,
        message: 'Must be a positive number',
      };
    },
  },

  // ===== Optional - External Services =====
  {
    key: 'TAVILY_API_KEY',
    required: false,
    description: 'Tavily API key (for web search)',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic API key (for Claude models)',
  },

  // ===== Optional - Monitoring =====
  {
    key: 'SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error monitoring',
  },
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for client-side error monitoring',
  },

  // ===== Environment =====
  {
    key: 'NODE_ENV',
    required: false,
    description: 'Node environment',
    defaultValue: 'development',
    validator: (value) => ({
      valid: ['development', 'production', 'test'].includes(value),
      message: 'Must be one of: development, production, test',
    }),
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Application URL (for callbacks and CORS)',
    validator: (value) => ({
      valid: value.startsWith('http://') || value.startsWith('https://'),
      message: 'Must be a valid HTTP/HTTPS URL',
    }),
  },
];

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

interface ValidationResult {
  key: string;
  status: 'pass' | 'fail' | 'warning' | 'default';
  message?: string;
  value?: string;
}

function validateEnvironment(): {
  results: ValidationResult[];
  critical_failures: number;
  warnings: number;
  passed: number;
} {
  const results: ValidationResult[] = [];
  let critical_failures = 0;
  let warnings = 0;
  let passed = 0;

  for (const rule of VALIDATION_RULES) {
    const value = process.env[rule.key];

    // Check if variable is set
    if (!value || value.trim() === '') {
      if (rule.required) {
        results.push({
          key: rule.key,
          status: 'fail',
          message: `REQUIRED: ${rule.description}`,
        });
        critical_failures++;
      } else if (rule.defaultValue) {
        results.push({
          key: rule.key,
          status: 'default',
          message: `Using default: ${rule.defaultValue}`,
          value: rule.defaultValue,
        });
        passed++;
      } else {
        results.push({
          key: rule.key,
          status: 'warning',
          message: `OPTIONAL: ${rule.description} (not set)`,
        });
        warnings++;
      }
      continue;
    }

    // Run custom validator if provided
    if (rule.validator) {
      const validation = rule.validator(value);
      if (!validation.valid) {
        if (rule.required) {
          results.push({
            key: rule.key,
            status: 'fail',
            message: validation.message || 'Validation failed',
            value: maskValue(rule.key, value),
          });
          critical_failures++;
        } else {
          results.push({
            key: rule.key,
            status: 'warning',
            message: validation.message || 'Validation warning',
            value: maskValue(rule.key, value),
          });
          warnings++;
        }
        continue;
      }
    }

    // Validation passed
    results.push({
      key: rule.key,
      status: 'pass',
      message: rule.description,
      value: maskValue(rule.key, value),
    });
    passed++;
  }

  return { results, critical_failures, warnings, passed };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function maskValue(key: string, value: string): string {
  // Don't mask URLs
  if (key.includes('URL')) {
    return value;
  }

  // Mask sensitive keys (show first 10 and last 4 characters)
  if (
    key.includes('KEY') ||
    key.includes('TOKEN') ||
    key.includes('SECRET') ||
    key.includes('DSN')
  ) {
    if (value.length <= 14) {
      return '*'.repeat(value.length);
    }
    return `${value.substring(0, 10)}...${value.substring(value.length - 4)}`;
  }

  return value;
}

function printResults(validation: ReturnType<typeof validateEnvironment>) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VITAL Platform - Environment Validation Report');
  console.log('='.repeat(80) + '\n');

  // Group results by status
  const failed = validation.results.filter((r) => r.status === 'fail');
  const warned = validation.results.filter((r) => r.status === 'warning');
  const passed = validation.results.filter((r) => r.status === 'pass');
  const defaults = validation.results.filter((r) => r.status === 'default');

  // Print critical failures
  if (failed.length > 0) {
    console.log('❌ CRITICAL FAILURES:');
    console.log('-'.repeat(80));
    for (const result of failed) {
      console.log(`  ${result.key}`);
      console.log(`    ⚠️  ${result.message}`);
      if (result.value) {
        console.log(`    📝 Current value: ${result.value}`);
      }
      console.log('');
    }
  }

  // Print warnings
  if (warned.length > 0) {
    console.log('⚠️  WARNINGS (Optional):');
    console.log('-'.repeat(80));
    for (const result of warned) {
      console.log(`  ${result.key}`);
      console.log(`    ℹ️  ${result.message}`);
      if (result.value) {
        console.log(`    📝 Current value: ${result.value}`);
      }
      console.log('');
    }
  }

  // Print passed validations
  if (passed.length > 0) {
    console.log('✅ PASSED:');
    console.log('-'.repeat(80));
    for (const result of passed) {
      console.log(`  ${result.key}`);
      console.log(`    ✓ ${result.message}`);
      if (result.value) {
        console.log(`    📝 Value: ${result.value}`);
      }
      console.log('');
    }
  }

  // Print defaults
  if (defaults.length > 0) {
    console.log('📋 USING DEFAULTS:');
    console.log('-'.repeat(80));
    for (const result of defaults) {
      console.log(`  ${result.key}`);
      console.log(`    ℹ️  ${result.message}`);
      console.log('');
    }
  }

  // Summary
  console.log('='.repeat(80));
  console.log('📊 SUMMARY:');
  console.log('-'.repeat(80));
  console.log(`  Total checks:        ${validation.results.length}`);
  console.log(`  ✅ Passed:           ${validation.passed}`);
  console.log(`  ⚠️  Warnings:         ${validation.warnings}`);
  console.log(`  ❌ Critical failures: ${validation.critical_failures}`);
  console.log('='.repeat(80) + '\n');

  // Final verdict
  if (validation.critical_failures > 0) {
    console.log('🚨 VALIDATION FAILED');
    console.log('   Please fix the critical failures before deploying.\n');
    return 1;
  } else if (validation.warnings > 0) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('   Optional configuration is missing. The app will work but some features may be limited.\n');
    return 2;
  } else {
    console.log('✅ VALIDATION PASSED');
    console.log('   All required environment variables are configured correctly.\n');
    return 0;
  }
}

// ============================================================================
// ENVIRONMENT FILE CHECKER
// ============================================================================

function checkEnvironmentFiles() {
  const fs = require('fs');
  const files = ['.env.local', '.env', '.env.example'];

  console.log('📁 Environment Files:');
  console.log('-'.repeat(80));

  for (const file of files) {
    const path = resolve(process.cwd(), file);
    const exists = fs.existsSync(path);
    console.log(`  ${file.padEnd(20)} ${exists ? '✅ Found' : '❌ Not found'}`);
  }
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  try {
    checkEnvironmentFiles();

    const validation = validateEnvironment();
    const exitCode = printResults(validation);

    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Validation script error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { validateEnvironment, VALIDATION_RULES };
