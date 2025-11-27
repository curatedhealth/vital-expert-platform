/**
 * Migrate Agent Avatars from PNG to SVG
 *
 * This script:
 * 1. Fetches all agents that need avatar updates
 * 2. Uses the suggest_avatar_for_agent() function to find best matches
 * 3. Updates agent.avatar_url with the new SVG URL
 *
 * Prerequisites:
 * 1. Run 20251126_create_avatars_table.sql migration
 * 2. Run upload-svg-avatars.ts to populate avatars table
 *
 * Usage:
 * pnpm tsx scripts/migrate-agent-avatars.ts [--dry-run] [--limit N]
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(__dirname, '../apps/vital-system/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;

interface Agent {
  id: string;
  name: string;
  avatar_url: string | null;
  agent_level_id: string | null;
  function_name: string | null;
  department_name: string | null;
  status: string;
}

interface AvatarSuggestion {
  id: string;
  filename: string;
  public_url: string;
  match_score: number;
}

/**
 * Determine the best persona type based on agent characteristics
 */
function determinePersonaType(agent: Agent): string {
  const name = agent.name.toLowerCase();
  const func = (agent.function_name || '').toLowerCase();
  const dept = (agent.department_name || '').toLowerCase();

  // Check for medical/clinical focus
  if (
    name.includes('medical') ||
    name.includes('clinical') ||
    name.includes('msl') ||
    name.includes('physician') ||
    func.includes('medical') ||
    dept.includes('medical')
  ) {
    return 'medical';
  }

  // Check for pharma focus
  if (
    name.includes('pharma') ||
    name.includes('drug') ||
    name.includes('fda') ||
    name.includes('regulatory') ||
    func.includes('regulatory')
  ) {
    return 'pharma';
  }

  // Check for strategy/foresight focus
  if (
    name.includes('strategy') ||
    name.includes('foresight') ||
    name.includes('planning') ||
    name.includes('director')
  ) {
    return 'foresight';
  }

  // Check for innovation/startup focus
  if (
    name.includes('innovation') ||
    name.includes('startup') ||
    name.includes('digital') ||
    name.includes('tech')
  ) {
    return 'startup';
  }

  // Default to expert
  return 'expert';
}

/**
 * Determine business function based on agent characteristics
 */
function determineBusinessFunction(agent: Agent): string {
  const name = agent.name.toLowerCase();
  const func = (agent.function_name || '').toLowerCase();
  const dept = (agent.department_name || '').toLowerCase();

  // Market Access
  if (
    name.includes('market access') ||
    name.includes('reimbursement') ||
    name.includes('payer') ||
    func.includes('market') ||
    dept.includes('market access')
  ) {
    return 'market_access';
  }

  // Commercial & Marketing
  if (
    name.includes('commercial') ||
    name.includes('marketing') ||
    name.includes('sales') ||
    name.includes('brand') ||
    func.includes('commercial')
  ) {
    return 'commercial_marketing';
  }

  // Medical Affairs
  if (
    name.includes('medical affairs') ||
    name.includes('msl') ||
    name.includes('scientific') ||
    func.includes('medical') ||
    dept.includes('medical')
  ) {
    return 'medical_affairs';
  }

  // Product Innovation
  if (
    name.includes('product') ||
    name.includes('innovation') ||
    name.includes('r&d') ||
    name.includes('development') ||
    func.includes('product') ||
    func.includes('r&d')
  ) {
    return 'product_innovation';
  }

  // Default to analytics
  return 'analytics_insights';
}

// Map agent_level_id to tier number for avatar selection
const LEVEL_TO_TIER: Record<string, number> = {
  '5e27905e-6f58-462e-93a4-6fad5388ebaf': 3, // Master
  'a6e394b0-6ca1-4cb1-8097-719523ee6782': 3, // Expert
  '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb': 2, // Specialist
  'c6f7eec5-3fc5-4f10-b030-bce0d22480e8': 1, // Worker
  '45420d67-67bf-44cf-a842-44bbaf3145e7': 1, // Tool
};

/**
 * Get avatar suggestion using database function or fallback logic
 */
async function getAvatarSuggestion(agent: Agent): Promise<AvatarSuggestion | null> {
  // Convert agent_level_id to tier
  const tier = agent.agent_level_id ? (LEVEL_TO_TIER[agent.agent_level_id] || 2) : 2;

  // First try the database function
  const { data: suggestions, error } = await supabase.rpc('suggest_avatar_for_agent', {
    p_agent_name: agent.name,
    p_tier: tier,
    p_knowledge_domains: [], // No knowledge_domains column, pass empty array
  });

  if (!error && suggestions && suggestions.length > 0) {
    return suggestions[0];
  }

  // Fallback: Manual selection based on analysis
  const personaType = determinePersonaType(agent);
  const businessFunction = determineBusinessFunction(agent);

  // Get random avatar from the matching category
  const { data: fallback } = await supabase
    .from('avatars')
    .select('id, filename, public_url')
    .eq('persona_type', personaType)
    .eq('business_function', businessFunction)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (fallback) {
    return {
      ...fallback,
      match_score: 50, // Fallback match
    };
  }

  // Last resort: any avatar
  const { data: anyAvatar } = await supabase
    .from('avatars')
    .select('id, filename, public_url')
    .eq('is_active', true)
    .limit(1)
    .single();

  return anyAvatar
    ? {
        ...anyAvatar,
        match_score: 25,
      }
    : null;
}

/**
 * Check if avatar URL is old PNG format
 */
function isOldPngAvatar(avatarUrl: string | null): boolean {
  if (!avatarUrl) return true;

  // Old PNG avatars have these patterns
  return (
    avatarUrl.includes('/icons/png/avatars/') ||
    avatarUrl.includes('avatar_0') ||
    avatarUrl.endsWith('.png') ||
    avatarUrl.startsWith('/icons/')
  );
}

/**
 * Main migration function
 */
async function migrateAgentAvatars() {
  console.log('='.repeat(60));
  console.log('Agent Avatar Migration: PNG to SVG');
  console.log('='.repeat(60));
  console.log(`\nMode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  if (LIMIT) console.log(`Limit: ${LIMIT} agents`);
  console.log();

  // First, check if avatars table has data
  const { count: avatarCount } = await supabase
    .from('avatars')
    .select('*', { count: 'exact', head: true });

  if (!avatarCount || avatarCount === 0) {
    console.error('ERROR: No avatars in database. Run upload-svg-avatars.ts first.');
    process.exit(1);
  }
  console.log(`Found ${avatarCount} avatars in database`);

  // Get agents that need avatar updates
  let query = supabase
    .from('agents')
    .select('id, name, avatar_url, agent_level_id, function_name, department_name, status')
    .order('name');

  if (LIMIT) {
    query = query.limit(LIMIT);
  }

  const { data: agents, error } = await query;

  if (error) {
    console.error('Error fetching agents:', error.message);
    process.exit(1);
  }

  if (!agents || agents.length === 0) {
    console.log('No agents found.');
    return;
  }

  console.log(`Found ${agents.length} agents to process\n`);

  // Process agents
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const agent of agents) {
    // Skip if already has SVG avatar
    if (agent.avatar_url && !isOldPngAvatar(agent.avatar_url)) {
      console.log(`  SKIP: ${agent.name} - Already has SVG avatar`);
      skipped++;
      continue;
    }

    // Get avatar suggestion
    const suggestion = await getAvatarSuggestion(agent);
    if (!suggestion) {
      console.log(`  ERROR: ${agent.name} - No avatar suggestion found`);
      errors++;
      continue;
    }

    const newUrl = suggestion.public_url;
    console.log(
      `  ${DRY_RUN ? '[DRY]' : 'UPDATE'}: ${agent.name}`
    );
    console.log(
      `    Old: ${agent.avatar_url || 'none'}`
    );
    console.log(
      `    New: ${newUrl} (score: ${suggestion.match_score})`
    );

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar_url: newUrl })
        .eq('id', agent.id);

      if (updateError) {
        console.log(`    ERROR: ${updateError.message}`);
        errors++;
        continue;
      }

      // Increment avatar usage count
      await supabase
        .from('avatars')
        .update({
          usage_count: supabase.rpc('increment_usage_count', { row_id: suggestion.id }),
        })
        .eq('id', suggestion.id);
    }

    updated++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log(`Agents processed: ${agents.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already SVG): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log();

  if (DRY_RUN) {
    console.log('This was a DRY RUN. Run without --dry-run to apply changes.');
  } else if (errors === 0) {
    console.log('SUCCESS! All agent avatars migrated to SVG.');
  } else {
    console.log(`WARNING: ${errors} errors occurred. Check logs above.`);
  }
}

// Run migration
migrateAgentAvatars().catch(console.error);
