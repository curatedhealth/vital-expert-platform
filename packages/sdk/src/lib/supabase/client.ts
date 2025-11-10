import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

const isBrowser = typeof window !== 'undefined';

declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined;
}

const resolveSupabaseUrl = () => {
  if (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) {
    return supabaseUrl;
  }

  if (supabaseUrl.startsWith('https://')) {
    return supabaseUrl;
  }

  return 'https://xazinxsiglqokwfmogyk.supabase.co';
};

const getStoredClient = (): SupabaseClient | undefined => {
  if (!isBrowser) return undefined;
  return globalThis.__supabaseClient;
};

const storeClient = (client: SupabaseClient) => {
  if (!isBrowser) return;
  globalThis.__supabaseClient = client;
};

export const createClient = (): SupabaseClient => {
  if (isBrowser) {
    const existing = getStoredClient();
    if (existing) {
      return existing;
    }
  }

  const client = createSupabaseClient(resolveSupabaseUrl(), supabaseAnonKey);

  if (isBrowser) {
    storeClient(client);
  }

  return client;
};

export const supabase = createClient();
