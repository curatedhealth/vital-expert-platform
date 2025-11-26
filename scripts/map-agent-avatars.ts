/**
 * Intelligent Agent-Avatar Mapping Script
 *
 * Maps existing agents to appropriate avatars using multi-factor scoring algorithm:
 * - Tier Match (30%): Agent tier alignment
 * - Domain Match (25%): Specialty/domain expertise
 * - Persona Match (20%): Persona type fit
 * - Tenant Affinity (15%): Tenant identity color
 * - Visual Harmony (10%): Overall aesthetic fit
 *
 * Usage:
 *   pnpm tsx scripts/map-agent-avatars.ts [--dry-run] [--limit N] [--output file.sql]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Types & Constants
// ============================================================================

interface Agent {
  id: string
  name: string
  agent_level_id?: number
  avatar_url?: string
  function_name?: string
  department_name?: string
  role_name?: string
  expertise_level?: string
  tenant_id?: string
  metadata?: Record<string, any>
  description?: string
  tagline?: string
}

interface AvatarMetadata {
  filename: string
  personaType: PersonaType
  department: Department
  variant: number
  score: number
  breakdown: ScoreBreakdown
}

interface ScoreBreakdown {
  tierMatch: number
  domainMatch: number
  personaMatch: number
  tenantAffinity: number
  visualHarmony: number
  total: number
}

type PersonaType = 'expert' | 'foresight' | 'medical' | 'pharma' | 'startup'
type Department =
  | 'analytics_insights'
  | 'commercial_marketing'
  | 'market_access'
  | 'medical_affairs'
  | 'product_innovation'

const PERSONA_TYPES: PersonaType[] = ['expert', 'foresight', 'medical', 'pharma', 'startup']
const DEPARTMENTS: Department[] = [
  'analytics_insights',
  'commercial_marketing',
  'market_access',
  'medical_affairs',
  'product_innovation',
]

// Persona keywords for matching
const PERSONA_KEYWORDS: Record<PersonaType, string[]> = {
  expert: ['expert', 'specialist', 'advisor', 'consultant', 'professional'],
  foresight: ['strategic', 'foresight', 'innovation', 'future', 'vision', 'planning'],
  medical: ['medical', 'clinical', 'physician', 'healthcare', 'patient', 'treatment'],
  pharma: ['pharmaceutical', 'pharma', 'drug', 'therapy', 'biotech', 'compound'],
  startup: ['startup', 'entrepreneur', 'innovation', 'disrupt', 'agile', 'venture'],
}

// Department keywords for matching
const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  analytics_insights: ['analytics', 'data', 'insights', 'metrics', 'reporting', 'business intelligence'],
  commercial_marketing: ['commercial', 'marketing', 'sales', 'brand', 'promotion', 'market'],
  market_access: ['market access', 'reimbursement', 'pricing', 'payer', 'formulary', 'health economics'],
  medical_affairs: ['medical affairs', 'msl', 'kol', 'publication', 'medical education', 'clinical'],
  product_innovation: ['product', 'innovation', 'development', 'r&d', 'research', 'pipeline'],
}

// Scoring weights
const WEIGHTS = {
  tierMatch: 0.30,
  domainMatch: 0.25,
  personaMatch: 0.20,
  tenantAffinity: 0.15,
  visualHarmony: 0.10,
}

// ============================================================================
// Configuration
// ============================================================================

const config = {
  dryRun: process.argv.includes('--dry-run'),
  limit: parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0', 10) || undefined,
  outputFile: process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'agent-avatar-mappings.sql',
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// Avatar Scoring Functions
// ============================================================================

/**
 * Calculate tier match score (0-1)
 */
function calculateTierMatch(agent: Agent, avatarTier: number): number {
  if (!agent.agent_level_id) return 0.5 // Default score if tier unknown

  // Exact match = 1.0
  if (agent.agent_level_id === avatarTier) return 1.0

  // Adjacent tier = 0.7
  if (Math.abs(agent.agent_level_id - avatarTier) === 1) return 0.7

  // Two tiers away = 0.4
  if (Math.abs(agent.agent_level_id - avatarTier) === 2) return 0.4

  // Three+ tiers away = 0.2
  return 0.2
}

/**
 * Calculate domain match score (0-1)
 */
function calculateDomainMatch(agent: Agent, department: Department): number {
  const keywords = DEPARTMENT_KEYWORDS[department]

  // Check agent metadata for domain expertise
  const domainText = [
    agent.function_name || '',
    agent.department_name || '',
    agent.role_name || '',
    agent.description || '',
    agent.tagline || '',
    agent.name || '',
    agent.expertise_level || '',
  ].join(' ').toLowerCase()

  let matchCount = 0
  for (const keyword of keywords) {
    if (domainText.includes(keyword.toLowerCase())) {
      matchCount++
    }
  }

  return Math.min(matchCount / 3, 1.0) // Cap at 1.0, perfect score if 3+ keywords match
}

/**
 * Calculate persona match score (0-1)
 */
function calculatePersonaMatch(agent: Agent, personaType: PersonaType): number {
  const keywords = PERSONA_KEYWORDS[personaType]

  const personaText = [
    agent.name || '',
    agent.description || '',
    agent.tagline || '',
    agent.role_name || '',
    JSON.stringify(agent.metadata || {}),
  ].join(' ').toLowerCase()

  let matchCount = 0
  for (const keyword of keywords) {
    if (personaText.includes(keyword.toLowerCase())) {
      matchCount++
    }
  }

  return Math.min(matchCount / 2, 1.0) // Cap at 1.0, perfect score if 2+ keywords match
}

/**
 * Calculate tenant affinity score (0-1)
 */
function calculateTenantAffinity(agent: Agent, personaType: PersonaType): number {
  // Map persona types to tenant affinities
  const affinityMap: Record<PersonaType, number> = {
    expert: 1.0,    // Expert Purple - general expertise
    pharma: 0.9,    // Pharma Blue - pharmaceutical
    medical: 0.9,   // Medical Red - clinical/medical
    foresight: 0.8, // Foresight Pink - strategic
    startup: 0.7,   // Startup Black - innovation
  }

  return affinityMap[personaType] || 0.5
}

/**
 * Calculate visual harmony score (0-1)
 */
function calculateVisualHarmony(agent: Agent, variant: number): number {
  // Distribute avatars evenly
  // Higher tier agents get lower variant numbers (1-5)
  // Mid tier agents get mid variant numbers (6-15)
  // Lower tier agents get higher variant numbers (16-20)

  if (!agent.agent_level_id) return 0.5

  if (agent.agent_level_id === 1 || agent.agent_level_id === 2) {
    // High tier: prefer variants 1-7
    return variant <= 7 ? 1.0 : Math.max(0.3, 1.0 - ((variant - 7) / 13))
  } else if (agent.agent_level_id === 3) {
    // Mid tier: prefer variants 6-14
    return variant >= 6 && variant <= 14 ? 1.0 : 0.6
  } else {
    // Low tier: prefer variants 15-20
    return variant >= 15 ? 1.0 : Math.max(0.3, 0.5 + ((variant - 1) / 28))
  }
}

/**
 * Calculate total score for an avatar-agent pairing
 */
function calculateTotalScore(
  agent: Agent,
  personaType: PersonaType,
  department: Department,
  variant: number
): ScoreBreakdown {
  const tierMatch = calculateTierMatch(agent, 2) // Most avatars are tier 2 (Expert)
  const domainMatch = calculateDomainMatch(agent, department)
  const personaMatch = calculatePersonaMatch(agent, personaType)
  const tenantAffinity = calculateTenantAffinity(agent, personaType)
  const visualHarmony = calculateVisualHarmony(agent, variant)

  const total =
    tierMatch * WEIGHTS.tierMatch +
    domainMatch * WEIGHTS.domainMatch +
    personaMatch * WEIGHTS.personaMatch +
    tenantAffinity * WEIGHTS.tenantAffinity +
    visualHarmony * WEIGHTS.visualHarmony

  return {
    tierMatch: Math.round(tierMatch * 100) / 100,
    domainMatch: Math.round(domainMatch * 100) / 100,
    personaMatch: Math.round(personaMatch * 100) / 100,
    tenantAffinity: Math.round(tenantAffinity * 100) / 100,
    visualHarmony: Math.round(visualHarmony * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// ============================================================================
// Main Mapping Logic
// ============================================================================

/**
 * Find best avatar match for an agent
 */
function findBestAvatar(agent: Agent): AvatarMetadata {
  let bestAvatar: AvatarMetadata | null = null
  let highestScore = 0

  // Iterate through all 500 avatars (5 personas × 5 departments × 20 variants)
  for (const personaType of PERSONA_TYPES) {
    for (const department of DEPARTMENTS) {
      for (let variant = 1; variant <= 20; variant++) {
        const breakdown = calculateTotalScore(agent, personaType, department, variant)

        if (breakdown.total > highestScore) {
          highestScore = breakdown.total
          const paddedVariant = String(variant).padStart(2, '0')
          bestAvatar = {
            filename: `vital_avatar_${personaType}_${department}_${paddedVariant}`,
            personaType,
            department,
            variant,
            score: breakdown.total,
            breakdown,
          }
        }
      }
    }
  }

  return bestAvatar!
}

/**
 * Generate SQL UPDATE statement
 */
function generateUpdateSQL(agent: Agent, avatar: AvatarMetadata): string {
  const avatarPath = `/assets/vital/avatars/${avatar.filename}.svg`

  return `-- ${agent.name} (Score: ${avatar.score.toFixed(2)})
-- Breakdown: Tier ${avatar.breakdown.tierMatch} | Domain ${avatar.breakdown.domainMatch} | Persona ${avatar.breakdown.personaMatch} | Tenant ${avatar.breakdown.tenantAffinity} | Visual ${avatar.breakdown.visualHarmony}
UPDATE agents
SET avatar_url = '${avatarPath}',
    updated_at = NOW()
WHERE id = '${agent.id}';
`
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 VITAL Agent-Avatar Mapping Script')
  console.log('=' .repeat(60))
  console.log()
  console.log('Configuration:')
  console.log(`  Dry Run: ${config.dryRun ? 'YES' : 'NO'}`)
  console.log(`  Limit: ${config.limit || 'All agents'}`)
  console.log(`  Output: ${config.outputFile}`)
  console.log()

  // Fetch agents from database
  console.log('📊 Fetching agents from database...')
  let query = supabase
    .from('agents')
    .select('id, name, agent_level_id, avatar_url, function_name, department_name, role_name, expertise_level, tenant_id, metadata, description, tagline')
    .order('agent_level_id', { ascending: true })
    .order('name', { ascending: true })

  if (config.limit) {
    query = query.limit(config.limit)
  }

  const { data: agents, error } = await query

  if (error) {
    console.error('❌ Error fetching agents:', error.message)
    process.exit(1)
  }

  if (!agents || agents.length === 0) {
    console.error('❌ No agents found in database')
    process.exit(1)
  }

  console.log(`✅ Found ${agents.length} agents`)
  console.log()

  // Process each agent
  console.log('🔍 Calculating avatar assignments...')
  const mappings: Array<{ agent: Agent; avatar: AvatarMetadata }> = []
  const sqlStatements: string[] = []

  // SQL file header
  sqlStatements.push(`-- VITAL Agent-Avatar Mapping
-- Generated: ${new Date().toISOString()}
-- Total Agents: ${agents.length}
-- Algorithm: Multi-factor scoring (Tier 30%, Domain 25%, Persona 20%, Tenant 15%, Visual 10%)
--
-- DO NOT RUN THIS DIRECTLY IN PRODUCTION WITHOUT REVIEW
-- This is a suggestion-based mapping that requires manual validation

BEGIN;

`)

  for (const agent of agents) {
    const bestAvatar = findBestAvatar(agent)
    mappings.push({ agent, avatar: bestAvatar })
    sqlStatements.push(generateUpdateSQL(agent, bestAvatar))
  }

  sqlStatements.push(`
COMMIT;

-- Summary Statistics
-- Total agents updated: ${agents.length}
-- Average score: ${(mappings.reduce((sum, m) => sum + m.avatar.score, 0) / mappings.length).toFixed(2)}
-- High confidence (score >= 0.8): ${mappings.filter(m => m.avatar.score >= 0.8).length}
-- Medium confidence (0.6 <= score < 0.8): ${mappings.filter(m => m.avatar.score >= 0.6 && m.avatar.score < 0.8).length}
-- Low confidence (score < 0.6): ${mappings.filter(m => m.avatar.score < 0.6).length}
`)

  // Write to file
  const outputPath = path.join(process.cwd(), config.outputFile)
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8')

  console.log('✅ Mapping complete!')
  console.log()

  // Display summary
  console.log('📈 Summary Statistics:')
  console.log(`  Total agents: ${agents.length}`)
  console.log(`  Average score: ${(mappings.reduce((sum, m) => sum + m.avatar.score, 0) / mappings.length).toFixed(2)}`)
  console.log(`  High confidence (≥0.8): ${mappings.filter(m => m.avatar.score >= 0.8).length}`)
  console.log(`  Medium confidence (0.6-0.8): ${mappings.filter(m => m.avatar.score >= 0.6 && m.avatar.score < 0.8).length}`)
  console.log(`  Low confidence (<0.6): ${mappings.filter(m => m.avatar.score < 0.6).length}`)
  console.log()

  // Show top 10 mappings
  console.log('🏆 Top 10 Mappings (Highest Confidence):')
  const topMappings = [...mappings].sort((a, b) => b.avatar.score - a.avatar.score).slice(0, 10)

  for (const mapping of topMappings) {
    console.log(`  ${mapping.agent.name}`)
    console.log(`    Avatar: ${mapping.avatar.filename}`)
    console.log(`    Score: ${mapping.avatar.score.toFixed(2)} (T:${mapping.avatar.breakdown.tierMatch} D:${mapping.avatar.breakdown.domainMatch} P:${mapping.avatar.breakdown.personaMatch} A:${mapping.avatar.breakdown.tenantAffinity} V:${mapping.avatar.breakdown.visualHarmony})`)
    console.log()
  }

  console.log(`💾 SQL file written to: ${outputPath}`)
  console.log()

  if (config.dryRun) {
    console.log('ℹ️  This was a DRY RUN - no database changes were made')
    console.log('   Remove --dry-run flag to apply changes')
  } else {
    console.log('⚠️  IMPORTANT: Review the SQL file before running in production!')
    console.log('   This is a suggestion-based mapping that requires validation')
  }
  console.log()
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
