/**
 * Avatar Mapping Validation Script
 *
 * Validates avatar assignments after application to ensure quality and correctness.
 * Checks for:
 * - Duplicate avatars (multiple agents with same avatar)
 * - Missing avatars (agents without avatar set)
 * - Invalid avatar paths (broken references)
 * - Tier mismatches (avatar tier doesn't match agent tier)
 * - Visual distribution (avatar variants well-distributed)
 *
 * Usage:
 *   pnpm tsx scripts/validate-avatar-mappings.ts [--fix] [--report]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  passed: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ValidationStats
}

interface ValidationError {
  type: 'missing' | 'invalid' | 'duplicate' | 'tier_mismatch'
  agentId: string
  agentName: string
  message: string
  severity: 'critical' | 'high' | 'medium'
}

interface ValidationWarning {
  type: 'distribution' | 'persona_mismatch' | 'department_mismatch'
  message: string
  affectedAgents: number
}

interface ValidationStats {
  totalAgents: number
  withAvatars: number
  withoutAvatars: number
  uniqueAvatars: number
  duplicateAvatars: number
  tierMatches: number
  tierMismatches: number
}

interface Agent {
  id: string
  name: string
  agent_level_id?: number
  avatar_url?: string
  function_name?: string
  department_name?: string
  role_name?: string
}

// ============================================================================
// Configuration
// ============================================================================

const config = {
  fix: process.argv.includes('--fix'),
  generateReport: process.argv.includes('--report'),
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Parse avatar filename to extract metadata
 */
function parseAvatarPath(avatarPath: string): {
  personaType: string
  department: string
  variant: number
} | null {
  const match = avatarPath.match(/vital_avatar_(\w+)_(\w+)_(\d{2})/)
  if (!match) return null

  const [, personaType, department, variantStr] = match
  return {
    personaType,
    department,
    variant: parseInt(variantStr, 10),
  }
}

/**
 * Check for missing avatars
 */
function validateMissingAvatars(agents: Agent[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const agent of agents) {
    if (!agent.avatar_url || agent.avatar_url.trim() === '') {
      errors.push({
        type: 'missing',
        agentId: agent.id,
        agentName: agent.name,
        message: 'Agent has no avatar assigned',
        severity: 'medium',
      })
    }
  }

  return errors
}

/**
 * Check for invalid avatar paths
 */
function validateInvalidPaths(agents: Agent[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const agent of agents) {
    if (!agent.avatar_url) continue

    // Check if avatar path follows expected format
    const parsed = parseAvatarPath(agent.avatar_url)
    if (!parsed) {
      errors.push({
        type: 'invalid',
        agentId: agent.id,
        agentName: agent.name,
        message: `Invalid avatar path: ${agent.avatar_url}`,
        severity: 'high',
      })
    }
  }

  return errors
}

/**
 * Check for duplicate avatars
 */
function validateDuplicates(agents: Agent[]): ValidationError[] {
  const errors: ValidationError[] = []
  const avatarMap = new Map<string, Agent[]>()

  // Group agents by avatar
  for (const agent of agents) {
    if (!agent.avatar_url) continue

    if (!avatarMap.has(agent.avatar_url)) {
      avatarMap.set(agent.avatar_url, [])
    }
    avatarMap.get(agent.avatar_url)!.push(agent)
  }

  // Find duplicates
  for (const [avatar, agentList] of avatarMap.entries()) {
    if (agentList.length > 1) {
      for (const agent of agentList) {
        errors.push({
          type: 'duplicate',
          agentId: agent.id,
          agentName: agent.name,
          message: `Shares avatar with ${agentList.length - 1} other agent(s): ${avatar}`,
          severity: 'medium',
        })
      }
    }
  }

  return errors
}

/**
 * Check for tier mismatches
 */
function validateTierMatches(agents: Agent[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const agent of agents) {
    if (!agent.avatar_url || !agent.agent_level_id) continue

    // All avatars in library are Tier 2 (Expert level)
    // Tier 1 agents should ideally have custom avatars or Super Agent icons
    if (agent.agent_level_id === 1) {
      errors.push({
        type: 'tier_mismatch',
        agentId: agent.id,
        agentName: agent.name,
        message: 'Tier 1 Master agent using Tier 2 Expert avatar',
        severity: 'medium',
      })
    }
  }

  return errors
}

/**
 * Check avatar distribution
 */
function validateDistribution(agents: Agent[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  const personaCounts = new Map<string, number>()
  const departmentCounts = new Map<string, number>()
  const variantCounts = new Map<number, number>()

  for (const agent of agents) {
    if (!agent.avatar_url) continue

    const parsed = parseAvatarPath(agent.avatar_url)
    if (!parsed) continue

    // Count persona types
    personaCounts.set(parsed.personaType, (personaCounts.get(parsed.personaType) || 0) + 1)

    // Count departments
    departmentCounts.set(parsed.department, (departmentCounts.get(parsed.department) || 0) + 1)

    // Count variants
    variantCounts.set(parsed.variant, (variantCounts.get(parsed.variant) || 0) + 1)
  }

  // Check for heavily skewed distributions
  const totalAgents = agents.filter(a => a.avatar_url).length

  // Persona distribution
  for (const [persona, count] of personaCounts.entries()) {
    const percentage = (count / totalAgents) * 100
    if (percentage > 50) {
      warnings.push({
        type: 'distribution',
        message: `${percentage.toFixed(1)}% of agents use '${persona}' persona (may lack diversity)`,
        affectedAgents: count,
      })
    }
  }

  // Variant distribution
  const overusedVariants = Array.from(variantCounts.entries())
    .filter(([, count]) => count > totalAgents * 0.1) // More than 10% using same variant
    .sort((a, b) => b[1] - a[1])

  if (overusedVariants.length > 0) {
    warnings.push({
      type: 'distribution',
      message: `Variants ${overusedVariants.map(([v]) => v).join(', ')} are overused (>10% of agents each)`,
      affectedAgents: overusedVariants.reduce((sum, [, count]) => sum + count, 0),
    })
  }

  return warnings
}

/**
 * Calculate statistics
 */
function calculateStats(agents: Agent[], errors: ValidationError[]): ValidationStats {
  const withAvatars = agents.filter(a => a.avatar_url && a.avatar_url.trim() !== '').length
  const uniqueAvatars = new Set(
    agents.filter(a => a.avatar_url).map(a => a.avatar_url)
  ).size

  const duplicateErrors = errors.filter(e => e.type === 'duplicate')
  const tierMismatchErrors = errors.filter(e => e.type === 'tier_mismatch')

  return {
    totalAgents: agents.length,
    withAvatars,
    withoutAvatars: agents.length - withAvatars,
    uniqueAvatars,
    duplicateAvatars: duplicateErrors.length,
    tierMatches: withAvatars - tierMismatchErrors.length,
    tierMismatches: tierMismatchErrors.length,
  }
}

// ============================================================================
// Fix Functions
// ============================================================================

/**
 * Auto-fix duplicate avatars by reassigning variants
 */
async function fixDuplicates(errors: ValidationError[]): Promise<number> {
  const duplicateErrors = errors.filter(e => e.type === 'duplicate')
  if (duplicateErrors.length === 0) return 0

  console.log('🔧 Fixing duplicate avatar assignments...')

  // Group by avatar path
  const avatarGroups = new Map<string, ValidationError[]>()
  for (const error of duplicateErrors) {
    const agents = await supabase
      .from('agents')
      .select('avatar_url')
      .eq('id', error.agentId)
      .single()

    if (agents.data?.avatar_url) {
      if (!avatarGroups.has(agents.data.avatar_url)) {
        avatarGroups.set(agents.data.avatar_url, [])
      }
      avatarGroups.get(agents.data.avatar_url)!.push(error)
    }
  }

  let fixedCount = 0

  // For each group of duplicates, reassign to different variants
  for (const [originalAvatar, groupErrors] of avatarGroups.entries()) {
    const parsed = parseAvatarPath(originalAvatar)
    if (!parsed) continue

    // Keep first agent with original, reassign others to next variants
    for (let i = 1; i < groupErrors.length; i++) {
      const error = groupErrors[i]
      const newVariant = ((parsed.variant + i - 1) % 20) + 1
      const paddedVariant = String(newVariant).padStart(2, '0')
      const newAvatar = `/assets/vital/avatars/vital_avatar_${parsed.personaType}_${parsed.department}_${paddedVariant}.svg`

      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar_url: newAvatar, updated_at: new Date().toISOString() })
        .eq('id', error.agentId)

      if (!updateError) {
        console.log(`  ✅ Reassigned ${error.agentName} to variant ${newVariant}`)
        fixedCount++
      } else {
        console.error(`  ❌ Failed to update ${error.agentName}:`, updateError.message)
      }
    }
  }

  return fixedCount
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate validation report
 */
function generateReport(result: ValidationResult): string {
  const report = `# Avatar Mapping Validation Report
Generated: ${new Date().toISOString()}

## Overall Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}

## Statistics

- **Total Agents**: ${result.stats.totalAgents}
- **With Avatars**: ${result.stats.withAvatars} (${((result.stats.withAvatars / result.stats.totalAgents) * 100).toFixed(1)}%)
- **Without Avatars**: ${result.stats.withoutAvatars}
- **Unique Avatars**: ${result.stats.uniqueAvatars}
- **Duplicate Assignments**: ${result.stats.duplicateAvatars}
- **Tier Matches**: ${result.stats.tierMatches}
- **Tier Mismatches**: ${result.stats.tierMismatches}

## Errors (${result.errors.length})

${result.errors.length === 0 ? 'No errors found! 🎉' : ''}

${result.errors
  .map(
    (error, i) => `### ${i + 1}. ${error.type.toUpperCase()} - ${error.severity.toUpperCase()}
- **Agent**: ${error.agentName} (\`${error.agentId}\`)
- **Issue**: ${error.message}
`
  )
  .join('\n')}

## Warnings (${result.warnings.length})

${result.warnings.length === 0 ? 'No warnings! 🎉' : ''}

${result.warnings
  .map(
    (warning, i) => `### ${i + 1}. ${warning.type.toUpperCase()}
- **Message**: ${warning.message}
- **Affected Agents**: ${warning.affectedAgents}
`
  )
  .join('\n')}

## Recommendations

${result.errors.some(e => e.type === 'missing') ? '- Run mapping script for agents without avatars: `pnpm avatars:map --limit=N`\n' : ''}${result.errors.some(e => e.type === 'duplicate') ? '- Fix duplicate assignments: `pnpm avatars:validate --fix`\n' : ''}${result.errors.some(e => e.type === 'invalid') ? '- Review and correct invalid avatar paths manually\n' : ''}${result.errors.some(e => e.type === 'tier_mismatch') ? '- Consider custom avatars for Tier 1 Master agents\n' : ''}${result.warnings.some(w => w.type === 'distribution') ? '- Improve avatar diversity by using more personas/variants\n' : ''}
`

  return report
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔍 VITAL Avatar Mapping Validation')
  console.log('=' .repeat(60))
  console.log()

  // Fetch all agents
  console.log('📊 Fetching agents from database...')
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, agent_level_id, avatar_url, function_name, department_name, role_name')
    .order('name', { ascending: true })

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

  // Run validations
  console.log('🔍 Running validations...')
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  errors.push(...validateMissingAvatars(agents))
  errors.push(...validateInvalidPaths(agents))
  errors.push(...validateDuplicates(agents))
  errors.push(...validateTierMatches(agents))
  warnings.push(...validateDistribution(agents))

  const stats = calculateStats(agents, errors)

  const result: ValidationResult = {
    passed: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
    errors,
    warnings,
    stats,
  }

  console.log()
  console.log('📊 Validation Results:')
  console.log(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`  Errors: ${errors.length} (Critical/High: ${errors.filter(e => e.severity === 'critical' || e.severity === 'high').length})`)
  console.log(`  Warnings: ${warnings.length}`)
  console.log()

  // Display summary
  console.log('📈 Statistics:')
  console.log(`  Total agents: ${stats.totalAgents}`)
  console.log(`  With avatars: ${stats.withAvatars} (${((stats.withAvatars / stats.totalAgents) * 100).toFixed(1)}%)`)
  console.log(`  Unique avatars: ${stats.uniqueAvatars}`)
  console.log(`  Duplicate assignments: ${stats.duplicateAvatars}`)
  console.log()

  // Show errors by type
  if (errors.length > 0) {
    console.log('❌ Errors by Type:')
    const errorsByType = new Map<string, number>()
    for (const error of errors) {
      errorsByType.set(error.type, (errorsByType.get(error.type) || 0) + 1)
    }
    for (const [type, count] of errorsByType.entries()) {
      console.log(`  ${type}: ${count}`)
    }
    console.log()
  }

  // Auto-fix if requested
  if (config.fix && errors.some(e => e.type === 'duplicate')) {
    const fixedCount = await fixDuplicates(errors)
    console.log(`✅ Fixed ${fixedCount} duplicate assignments`)
    console.log()
  }

  // Generate report
  if (config.generateReport) {
    const reportPath = 'avatar-validation-report.md'
    const report = generateReport(result)
    fs.writeFileSync(reportPath, report, 'utf-8')
    console.log(`📄 Validation report saved to: ${reportPath}`)
    console.log()
  }

  // Exit with appropriate code
  if (!result.passed) {
    console.error('❌ Validation failed - review errors above')
    process.exit(1)
  }

  console.log('✨ Validation complete - all checks passed!')
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
