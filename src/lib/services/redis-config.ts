/**
 * Redis Configuration Service
 * Provides easy Redis setup for Vercel deployment
 */

export interface RedisConfig {
  enabled: boolean;
  type: 'upstash' | 'redis-cloud' | 'local' | 'none';
  url?: string;
  token?: string;
  restUrl?: string;
  restToken?: string;
}

export function getRedisConfig(): RedisConfig {
  // Check for Upstash Redis (recommended for Vercel)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      enabled: true,
      type: 'upstash',
      restUrl: process.env.UPSTASH_REDIS_REST_URL,
      restToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    };
  }

  // Check for Redis Cloud
  if (process.env.REDIS_URL) {
    return {
      enabled: true,
      type: 'redis-cloud',
      url: process.env.REDIS_URL,
    };
  }

  // Check for local Redis (development)
  if (process.env.NODE_ENV === 'development' && process.env.REDIS_URL) {
    return {
      enabled: true,
      type: 'local',
      url: process.env.REDIS_URL,
    };
  }

  // No Redis configured
  return {
    enabled: false,
    type: 'none',
  };
}

export function logRedisStatus(): void {
  const config = getRedisConfig();
  
  if (config.enabled) {
    console.log(`✅ Redis enabled: ${config.type}`);
    if (config.type === 'upstash') {
      console.log(`   Upstash URL: ${config.restUrl}`);
    } else if (config.type === 'redis-cloud') {
      console.log(`   Redis URL: ${config.url}`);
    }
  } else {
    console.log('⚠️  Redis not configured - using in-memory caching');
    console.log('   To enable Redis caching, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  }
}
