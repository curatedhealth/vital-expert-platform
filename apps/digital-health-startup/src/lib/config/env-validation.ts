/**
 * Environment Variable Validation
 * 
 * Validates required environment variables on startup to fail fast
 * with clear error messages rather than runtime failures.
 */

export interface Mode1EnvConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  openaiApiKey: string;
  anthropicApiKey?: string; // Optional, only needed for Claude models
  tavilyApiKey?: string;
  braveApiKey?: string;
  googleSearchApiKey?: string;
  googleSearchEngineId?: string;
}

/**
 * Validates Mode 1 required environment variables
 * @throws Error if any required variables are missing
 */
export function validateMode1Env(): Mode1EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const braveApiKey = process.env.BRAVE_API_KEY;
  const googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseServiceKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!openaiApiKey) {
    missing.push('OPENAI_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for Mode 1: ${missing.join(', ')}\n` +
      `Please set these variables in your .env.local file or environment.`
    );
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    openaiApiKey,
    anthropicApiKey,
    tavilyApiKey,
    braveApiKey,
    googleSearchApiKey,
    googleSearchEngineId,
  };
}

/**
 * Validates optional environment variables with warnings
 */
export function validateOptionalEnv(): void {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const braveApiKey = process.env.BRAVE_API_KEY;
  const googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!anthropicApiKey) {
    console.warn(
      '⚠️  [Env Validation] ANTHROPIC_API_KEY not set. Claude models will not be available.'
    );
  }

  if (!tavilyApiKey && !braveApiKey && (!googleSearchApiKey || !googleSearchEngineId)) {
    console.warn(
      '⚠️  [Env Validation] No web search provider configured (TAVILY_API_KEY, BRAVE_API_KEY, or GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_ENGINE_ID). Mode 1 web search tool will operate in mock mode.'
    );
  }
}
