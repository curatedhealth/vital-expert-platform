import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseServiceClient: SupabaseClient | null = null;

export function getServiceSupabaseClient(): SupabaseClient {
  if (!supabaseServiceClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase service configuration is missing');
    }

    supabaseServiceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseServiceClient;
}
