import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Check which Supabase database has agents
 */
export async function GET() {
  const results: any[] = [];

  // Database 1: NEW SUPABASE (bomltkhixeatxuoxmolq)
  const newSupabaseUrl = 'https://bomltkhixeatxuoxmolq.supabase.co';
  const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q';

  // Database 2: OLD SUPABASE (xazinxsiglqokwfmogyk)
  const oldSupabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
  const oldSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

  // Check NEW database
  try {
    const newClient = createClient(newSupabaseUrl, newSupabaseKey);
    const { data, error, count } = await newClient
      .from('agents')
      .select('id, name, slug, description, status', { count: 'exact', head: false })
      .limit(5);

    results.push({
      database: 'NEW SUPABASE',
      url: newSupabaseUrl,
      ref: 'bomltkhixeatxuoxmolq',
      success: !error,
      agentCount: count || data?.length || 0,
      sampleAgents: data || [],
      error: error?.message,
    });
  } catch (error: any) {
    results.push({
      database: 'NEW SUPABASE',
      url: newSupabaseUrl,
      ref: 'bomltkhixeatxuoxmolq',
      success: false,
      agentCount: 0,
      sampleAgents: [],
      error: error.message,
    });
  }

  // Check OLD database
  try {
    const oldClient = createClient(oldSupabaseUrl, oldSupabaseKey);
    const { data, error, count } = await oldClient
      .from('agents')
      .select('id, name, slug, description, status', { count: 'exact', head: false })
      .limit(5);

    results.push({
      database: 'OLD SUPABASE',
      url: oldSupabaseUrl,
      ref: 'xazinxsiglqokwfmogyk',
      success: !error,
      agentCount: count || data?.length || 0,
      sampleAgents: data || [],
      error: error?.message,
    });
  } catch (error: any) {
    results.push({
      database: 'OLD SUPABASE',
      url: oldSupabaseUrl,
      ref: 'xazinxsiglqokwfmogyk',
      success: false,
      agentCount: 0,
      sampleAgents: [],
      error: error.message,
    });
  }

  return NextResponse.json({
    results,
    recommendation: results.find(r => r.agentCount > 0) 
      ? `Use ${results.find(r => r.agentCount > 0)?.database} - it has ${results.find(r => r.agentCount > 0)?.agentCount} agents`
      : 'No agents found in either database',
  });
}

