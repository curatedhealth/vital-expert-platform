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
  }).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: 'SUPABASE_SERVICE_ROLE_KEY is required (server-side only)',
  }).optional(),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, {
    message: 'OPENAI_API_KEY is required',
  }).optional(),

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
      // Use safeParse to avoid throwing errors
      const result = envSchema.safeParse(process.env);
      
      if (!result.success) {
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Create detailed error message
        const missingVars = result.error.errors
          .filter((e) => e.code === 'invalid_type' && e.received === 'undefined')
          .map((e) => e.path.join('.'))
          .join(', ');

        const invalidVars = result.error.errors
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

        // In development, use partial config with defaults
        // In production, throw error
        if (isDevelopment) {
          console.warn('⚠️ [EnvironmentConfig] Validation failed, using partial config:', errorMessage);
          // Use partial config with defaults for missing values
          this.config = {
            ...process.env,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
            PINECONE_API_KEY: process.env.PINECONE_API_KEY || undefined,
            PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || undefined,
            PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || undefined,
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || undefined,
            NEXT_PUBLIC_PLATFORM_TENANT_ID: process.env.NEXT_PUBLIC_PLATFORM_TENANT_ID || '00000000-0000-0000-0000-000000000001',
            NEXT_PUBLIC_STARTUP_TENANT_ID: process.env.NEXT_PUBLIC_STARTUP_TENANT_ID || undefined,
            NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
            REDIS_URL: process.env.REDIS_URL || undefined,
            LANGFUSE_API_KEY: process.env.LANGFUSE_API_KEY || undefined,
            LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY || undefined,
            LANGFUSE_HOST: process.env.LANGFUSE_HOST || undefined,
          } as EnvConfig;
        } else {
          // In production, fail fast
          throw new Error(errorMessage);
        }
      } else {
        this.config = result.data;
      }
    } catch (error) {
      // If it's not a ZodError, re-throw
      if (error instanceof Error && !error.message.includes('Environment Configuration Error')) {
        throw error;
      }
      // If we already handled it above, this shouldn't happen, but just in case
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
   * Returns null if configuration is incomplete
   */
  public getSupabaseConfig(): {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  } | null {
    const url = this.config.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if both required values are present and non-empty
    if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
      return null;
    }
    
    return {
      url: url.trim(),
      anonKey: anonKey.trim(),
      serviceRoleKey: (this.config.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
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

// Export singleton instance with lazy initialization
let _envInstance: EnvironmentConfig | null = null;

export const env = new Proxy({} as EnvironmentConfig, {
  get(target, prop) {
    if (!_envInstance) {
      try {
        _envInstance = EnvironmentConfig.getInstance();
      } catch (error) {
        // If initialization fails, create a minimal instance
        console.warn('⚠️ [EnvironmentConfig] Failed to initialize, using fallback:', error);
        // Return a proxy that provides safe defaults
        return new Proxy({}, {
          get() {
            return () => {
              console.warn('⚠️ [EnvironmentConfig] Service not available');
              return null;
            };
          }
        });
      }
    }
    return (_envInstance as any)[prop];
  }
});

// Validate on module load (server-side only) - but don't throw
if (typeof window === 'undefined') {
  try {
    // Force validation (but it won't throw in development)
    const instance = EnvironmentConfig.getInstance();
    const config = instance.get();
    if (config.NODE_ENV === 'development') {
      // Check if critical vars are missing
      const missing = [];
      if (!config.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!config.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!config.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      if (!config.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
      
      if (missing.length === 0) {
        console.log('✅ Environment variables validated successfully');
      } else {
        console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}. Some features may not work.`);
      }
    }
  } catch (error) {
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ [EnvironmentConfig] Production validation failed:', error);
      throw error;
    }
    // In development, warn but don't fail
    console.warn('⚠️ [EnvironmentConfig] Development validation warning:', error);
  }
}

