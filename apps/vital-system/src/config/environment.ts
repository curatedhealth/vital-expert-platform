/**
 * Environment Configuration Service
 * 
 * Enterprise-grade environment variable management with:
 * - Zod schema validation on module load
 * - Type-safe access with autocomplete
 * - Singleton pattern for consistency
 * - Detailed error messages for missing/invalid vars
 * - Runtime validation before operations
 * 
 * Follows best practices from LangChain and OpenAI SDK patterns.
 * 
 * @module config/environment
 */

import { z } from 'zod';

/**
 * Environment variable schema with validation
 * All required variables must be present and valid
 */
const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: 'SUPABASE_SERVICE_ROLE_KEY is required (server-side only)',
  }),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, {
    message: 'OPENAI_API_KEY is required',
  }),

  // Pinecone Configuration
  PINECONE_API_KEY: z.string().min(1, {
    message: 'PINECONE_API_KEY is required',
  }).optional(),
  PINECONE_ENVIRONMENT: z.string().min(1).optional(),
  PINECONE_INDEX_NAME: z.string().min(1).optional(),

  // Anthropic Configuration (optional for Claude)
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Multi-tenancy
  NEXT_PUBLIC_PLATFORM_TENANT_ID: z
    .string()
    .uuid({
      message: 'NEXT_PUBLIC_PLATFORM_TENANT_ID must be a valid UUID',
    })
    .default('00000000-0000-0000-0000-000000000001'),
  NEXT_PUBLIC_STARTUP_TENANT_ID: z.string().uuid().optional(),

  // Optional Configuration
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      errorMap: () => ({
        message:
          'NODE_ENV must be one of: development, test, production',
      }),
    })
    .default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Redis (optional for caching)
  REDIS_URL: z.string().url().optional(),

  // Monitoring (optional)
  LANGFUSE_API_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().url().optional(),
});

/**
 * Validated environment configuration type
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Environment Configuration Singleton
 * 
 * Validates all environment variables on first access and provides
 * type-safe access throughout the application.
 */
class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig;

  private constructor() {
    try {
      // Parse and validate environment variables
      this.config = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Create detailed error message
        const missingVars = error.errors
          .filter((e) => e.code === 'invalid_type' && e.received === 'undefined')
          .map((e) => e.path.join('.'))
          .join(', ');

        const invalidVars = error.errors
          .filter((e) => e.code !== 'invalid_type' || e.received !== 'undefined')
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');

        let errorMessage = '❌ Environment Configuration Error\n';
        errorMessage += '===================================\n\n';

        if (missingVars) {
          errorMessage += `Missing Required Variables:\n${missingVars}\n\n`;
        }

        if (invalidVars) {
          errorMessage += `Invalid Variables:\n${invalidVars}\n\n`;
        }

        errorMessage +=
          'Please check your .env.local file and ensure all required variables are set.\n';
        errorMessage +=
          'See docs/environment-setup.md for configuration details.\n';

        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get singleton instance
   * Lazy initialization on first access
   */
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Get validated configuration
   * All values are guaranteed to be present and valid
   */
  public get(): EnvConfig {
    return this.config;
  }

  /**
   * Get tenant IDs (type-safe)
   */
  public getTenantIds(): {
    platform: string;
    startup: string | undefined;
  } {
    return {
      platform: this.config.NEXT_PUBLIC_PLATFORM_TENANT_ID,
      startup: this.config.NEXT_PUBLIC_STARTUP_TENANT_ID,
    };
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Get Supabase configuration
   */
  public getSupabaseConfig(): {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  } {
    return {
      url: this.config.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: this.config.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  /**
   * Get OpenAI configuration
   */
  public getOpenAIConfig(): {
    apiKey: string;
  } {
    return {
      apiKey: this.config.OPENAI_API_KEY,
    };
  }

  /**
   * Get Pinecone configuration (if available)
   */
  public getPineconeConfig(): {
    apiKey: string;
    environment?: string;
    indexName?: string;
  } | null {
    if (!this.config.PINECONE_API_KEY) {
      return null;
    }

    return {
      apiKey: this.config.PINECONE_API_KEY,
      environment: this.config.PINECONE_ENVIRONMENT,
      indexName: this.config.PINECONE_INDEX_NAME,
    };
  }

  /**
   * Check if optional service is configured
   */
  public hasAnthropic(): boolean {
    return !!this.config.ANTHROPIC_API_KEY;
  }

  public hasRedis(): boolean {
    return !!this.config.REDIS_URL;
  }

  public hasLangfuse(): boolean {
    return !!(
      this.config.LANGFUSE_API_KEY &&
      this.config.LANGFUSE_SECRET_KEY &&
      this.config.LANGFUSE_HOST
    );
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    // Force validation
    env.get();
    if (env.isDevelopment()) {
      console.log('✅ Environment variables validated successfully');
    }
  } catch (error) {
    // In production, fail fast
    if (env.isProduction()) {
      console.error(error);
      throw error;
    }
    // In development, warn but don't fail
    console.warn('⚠️ Environment validation warning:', error);
  }
}

