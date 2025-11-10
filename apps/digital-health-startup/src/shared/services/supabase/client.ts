/**
 * Shared Supabase client wrapper.
 *
 * Historically this file implemented its own singleton which caused duplicate
 * GoTrue clients whenever both @/lib/supabase/client and this module were
 * imported in the same browser session. We now delegate directly to the
 * canonical client so every consumer hits the exact same instance.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  createClient as createBrowserClient,
  supabase as browserSingleton,
} from '@/lib/supabase/client';

export const createClient = (): SupabaseClient => createBrowserClient();

export const supabase = browserSingleton;
