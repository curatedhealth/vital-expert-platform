/**
 * Environment Variables Type Definitions
 *
 * This file provides strict TypeScript types for all environment variables.
 * All variables are readonly to prevent accidental mutation.
 *
 * @module types/environment
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /* =================================================================
       * NEXT.JS & APPLICATION
       * ================================================================= */

      /** Application environment */
      readonly NODE_ENV: 'development' | 'production' | 'test';

      /** Public application URL */
      readonly NEXT_PUBLIC_APP_URL: string;

      /** Application port */
      readonly PORT?: string;

      /* =================================================================
       * DATABASE
       * ================================================================= */

      /** PostgreSQL connection string */
      readonly DATABASE_URL: string;

      /** Database connection pool minimum size */
      readonly DATABASE_POOL_MIN?: string;

      /** Database connection pool maximum size */
      readonly DATABASE_POOL_MAX?: string;

      /** Database connection timeout (ms) */
      readonly DATABASE_TIMEOUT?: string;

      /* =================================================================
       * SUPABASE
       * ================================================================= */

      /** Supabase project URL (public) */
      readonly NEXT_PUBLIC_SUPABASE_URL: string;

      /** Supabase anonymous key (public) */
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      /** Supabase service role key (server-side only) */
      readonly SUPABASE_SERVICE_ROLE_KEY: string;

      /** Supabase JWT secret */
      readonly SUPABASE_JWT_SECRET?: string;

      /* =================================================================
       * REDIS & CACHING
       * ================================================================= */

      /** Redis connection URL */
      readonly REDIS_URL: string;

      /** Upstash Redis REST URL (alternative to standard Redis) */
      readonly UPSTASH_REDIS_REST_URL?: string;

      /** Upstash Redis REST token */
      readonly UPSTASH_REDIS_REST_TOKEN?: string;

      /** Redis key prefix for namespacing */
      readonly REDIS_KEY_PREFIX?: string;

      /** Cache TTL in seconds */
      readonly CACHE_TTL?: string;

      /* =================================================================
       * LLM PROVIDERS
       * ================================================================= */

      /** OpenAI API key */
      readonly OPENAI_API_KEY: string;

      /** OpenAI organization ID (optional) */
      readonly OPENAI_ORG_ID?: string;

      /** Public OpenAI API key (for client-side, if needed) */
      readonly NEXT_PUBLIC_OPENAI_API_KEY?: string;

      /** Anthropic API key */
      readonly ANTHROPIC_API_KEY?: string;

      /** Google AI (Gemini) API key */
      readonly GOOGLE_API_KEY?: string;

      /** Google Gemini model name */
      readonly GOOGLE_GEMINI_MODEL?: string;

      /** Groq API key */
      readonly GROQ_API_KEY?: string;

      /** Together AI API key */
      readonly TOGETHER_API_KEY?: string;

      /** Replicate API token */
      readonly REPLICATE_API_TOKEN?: string;

      /** HuggingFace API key */
      readonly HUGGINGFACE_API_KEY?: string;

      /** HuggingFace medical model ID */
      readonly HUGGINGFACE_MEDICAL_MODEL?: string;

      /** HuggingFace clinical model ID */
      readonly HUGGINGFACE_CLINICAL_MODEL?: string;

      /** HuggingFace research model ID */
      readonly HUGGINGFACE_RESEARCH_MODEL?: string;

      /** Cohere API key */
      readonly COHERE_API_KEY?: string;

      /** Mistral API key */
      readonly MISTRAL_API_KEY?: string;

      /* =================================================================
       * VECTOR STORES
       * ================================================================= */

      /** Pinecone API key */
      readonly PINECONE_API_KEY?: string;

      /** Pinecone environment */
      readonly PINECONE_ENVIRONMENT?: string;

      /** Pinecone index name */
      readonly PINECONE_INDEX_NAME?: string;

      /* =================================================================
       * OBSERVABILITY & MONITORING
       * ================================================================= */

      /** Sentry DSN for error tracking */
      readonly SENTRY_DSN?: string;

      /** Sentry authentication token */
      readonly SENTRY_AUTH_TOKEN?: string;

      /** Sentry organization slug */
      readonly SENTRY_ORG?: string;

      /** Sentry project slug */
      readonly SENTRY_PROJECT?: string;

      /** OpenTelemetry exporter endpoint */
      readonly OTEL_EXPORTER_OTLP_ENDPOINT?: string;

      /** OpenTelemetry service name */
      readonly OTEL_SERVICE_NAME?: string;

      /** Prometheus metrics port */
      readonly PROMETHEUS_PORT?: string;

      /* =================================================================
       * SECURITY & AUTHENTICATION
       * ================================================================= */

      /** JWT secret for signing tokens */
      readonly JWT_SECRET: string;

      /** JWT expiration time */
      readonly JWT_EXPIRATION?: string;

      /** Encryption key for sensitive data */
      readonly ENCRYPTION_KEY: string;

      /** CSRF secret */
      readonly CSRF_SECRET: string;

      /** Session secret */
      readonly SESSION_SECRET?: string;

      /** Allowed origins for CORS (comma-separated) */
      readonly ALLOWED_ORIGINS?: string;

      /* =================================================================
       * FEATURE FLAGS
       * ================================================================= */

      /** Enable rate limiting */
      readonly ENABLE_RATE_LIMITING?: 'true' | 'false';

      /** Enable circuit breakers */
      readonly ENABLE_CIRCUIT_BREAKERS?: 'true' | 'false';

      /** Enable audit logging */
      readonly ENABLE_AUDIT_LOGGING?: 'true' | 'false';

      /** Enable experimental features */
      readonly ENABLE_EXPERIMENTAL?: 'true' | 'false';

      /** Enable debug mode */
      readonly DEBUG?: 'true' | 'false';

      /* =================================================================
       * COMPLIANCE & REGULATION
       * ================================================================= */

      /** HIPAA compliance mode */
      readonly HIPAA_ENABLED?: 'true' | 'false';

      /** GDPR compliance mode */
      readonly GDPR_ENABLED?: 'true' | 'false';

      /** Data retention period (days) */
      readonly DATA_RETENTION_DAYS?: string;

      /** Audit log retention period (days) */
      readonly AUDIT_RETENTION_DAYS?: string;

      /* =================================================================
       * AGENT CONFIGURATION
       * ================================================================= */

      /** Agent selection weight for semantic similarity */
      readonly AGENT_WEIGHT_SEMANTIC?: string;

      /** Agent selection weight for domain match */
      readonly AGENT_WEIGHT_DOMAIN?: string;

      /** Agent selection weight for tier */
      readonly AGENT_WEIGHT_TIER?: string;

      /** Agent selection weight for popularity */
      readonly AGENT_WEIGHT_POPULARITY?: string;

      /** Agent selection weight for availability */
      readonly AGENT_WEIGHT_AVAILABILITY?: string;

      /* =================================================================
       * RATE LIMITING
       * ================================================================= */

      /** Rate limit: requests per minute per user */
      readonly RATE_LIMIT_PER_MINUTE?: string;

      /** Rate limit: requests per hour per user */
      readonly RATE_LIMIT_PER_HOUR?: string;

      /** Rate limit: requests per day per IP */
      readonly RATE_LIMIT_PER_DAY_IP?: string;

      /* =================================================================
       * TIMEOUTS
       * ================================================================= */

      /** Orchestration timeout (ms) */
      readonly ORCHESTRATION_TIMEOUT?: string;

      /** LLM call timeout (ms) */
      readonly LLM_TIMEOUT?: string;

      /** Database query timeout (ms) */
      readonly DB_QUERY_TIMEOUT?: string;

      /** Vector search timeout (ms) */
      readonly VECTOR_SEARCH_TIMEOUT?: string;

      /* =================================================================
       * AWS (Optional)
       * ================================================================= */

      /** AWS region */
      readonly AWS_REGION?: string;

      /** AWS access key ID */
      readonly AWS_ACCESS_KEY_ID?: string;

      /** AWS secret access key */
      readonly AWS_SECRET_ACCESS_KEY?: string;

      /** S3 bucket for file storage */
      readonly AWS_S3_BUCKET?: string;
    }
  }
}

export {};
