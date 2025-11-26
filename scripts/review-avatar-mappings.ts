/**
 * Avatar Mapping Review Script
 *
 * Interactive CLI tool to review, validate, and approve agent-avatar mappings
 * before applying them to the database.
 *
 * Usage:
 *   pnpm tsx scripts/review-avatar-mappings.ts [--input file.sql] [--approve-all] [--interactive]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// ============================================================================
// Types
// ============================================================================

interface MappingReview {
  agentId: string
  agentName: string
  currentAvatar?: string
  proposedAvatar: string
  score: number
  breakdown: string
  approved: boolean
  notes?: string
}

// ============================================================================
// Configuration
// ============================================================================

const config = {
  inputFile: process.argv.find(arg => arg.startsWith('--input='))?.split('=')[1] || 'agent-avatar-mappings.sql',
  approveAll: process.argv.includes('--approve-all'),
  interactive: process.argv.includes('--interactive'),
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse SQL file and extract mappings
 */
function parseMappings(sqlContent: string): MappingReview[] {
  const mappings: MappingReview[] = []
  const lines = sqlContent.split('\n')

  let currentMapping: Partial<MappingReview> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Parse comment with agent name and score
    if (line.startsWith('-- ') && line.includes('Score:')) {
      const nameMatch = line.match(/^-- (.+) \(Score: ([\d.]+)\)/)
      if (nameMatch) {
        currentMapping.agentName = nameMatch[1]
        currentMapping.score = parseFloat(nameMatch[2])
      }
    }

    // Parse breakdown comment
    if (line.startsWith('-- Breakdown:')) {
      currentMapping.breakdown = line.replace('-- Breakdown: ', '')
    }

    // Parse UPDATE statement
    if (line.startsWith('UPDATE agents')) {
      // Get avatar from SET clause (next line)
      const setLine = lines[i + 1]?.trim()
      if (setLine?.startsWith("SET avatar_url = '")) {
        const avatarMatch = setLine.match(/SET avatar_url = '(.+?)'/)
        if (avatarMatch) {
          currentMapping.proposedAvatar = avatarMatch[1]
        }
      }

      // Get agent ID from WHERE clause
      const whereLine = lines[i + 3]?.trim()
      if (whereLine?.startsWith("WHERE id = '")) {
        const idMatch = whereLine.match(/WHERE id = '(.+?)'/)
        if (idMatch) {
          currentMapping.agentId = idMatch[1]

          // Complete mapping found
          if (currentMapping.agentName && currentMapping.proposedAvatar) {
            mappings.push({
              ...currentMapping,
              approved: false,
            } as MappingReview)
          }

          currentMapping = {}
        }
      }
    }
  }

  return mappings
}

// ============================================================================
// Interactive Review
// ============================================================================

/**
 * Prompt user for approval
 */
async function promptApproval(mapping: MappingReview): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    console.log()
    console.log('─'.repeat(60))
    console.log(`Agent: ${mapping.agentName}`)
    console.log(`ID: ${mapping.agentId}`)
    console.log(`Current Avatar: ${mapping.currentAvatar || 'None'}`)
    console.log(`Proposed Avatar: ${mapping.proposedAvatar}`)
    console.log(`Confidence Score: ${mapping.score.toFixed(2)}`)
    console.log(`Breakdown: ${mapping.breakdown}`)
    console.log()

    rl.question('Approve this mapping? (y/n/s=skip): ', (answer) => {
      rl.close()

      if (answer.toLowerCase() === 'y') {
        resolve(true)
      } else if (answer.toLowerCase() === 's') {
        console.log('⏭️  Skipped')
        resolve(false)
      } else {
        console.log('❌ Rejected')
        resolve(false)
      }
    })
  })
}

// ============================================================================
// Application Functions
// ============================================================================

/**
 * Apply approved mappings to database
 */
async function applyMappings(mappings: MappingReview[]) {
  const approved = mappings.filter(m => m.approved)

  if (approved.length === 0) {
    console.log('⚠️  No mappings approved - nothing to apply')
    return
  }

  console.log()
  console.log(`📝 Applying ${approved.length} approved mappings...`)

  let successCount = 0
  let errorCount = 0

  for (const mapping of approved) {
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          avatar_url: mapping.proposedAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mapping.agentId)

      if (error) {
        console.error(`❌ Failed to update ${mapping.agentName}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Updated ${mapping.agentName}`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Error updating ${mapping.agentName}:`, err)
      errorCount++
    }
  }

  console.log()
  console.log('📊 Application Summary:')
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
  console.log(`  Total: ${approved.length}`)
}

/**
 * Generate review report
 */
function generateReport(mappings: MappingReview[], outputPath: string) {
  const approved = mappings.filter(m => m.approved)
  const rejected = mappings.filter(m => !m.approved)

  const report = `# Avatar Mapping Review Report
Generated: ${new Date().toISOString()}

## Summary
- Total Mappings: ${mappings.length}
- Approved: ${approved.length}
- Rejected/Skipped: ${rejected.length}
- Approval Rate: ${((approved.length / mappings.length) * 100).toFixed(1)}%

## Approved Mappings

${approved
  .map(
    m => `### ${m.agentName}
- ID: \`${m.agentId}\`
- Avatar: \`${m.proposedAvatar}\`
- Score: ${m.score.toFixed(2)}
- Breakdown: ${m.breakdown}
${m.notes ? `- Notes: ${m.notes}` : ''}
`
  )
  .join('\n')}

## Rejected/Skipped Mappings

${rejected
  .map(
    m => `### ${m.agentName}
- ID: \`${m.agentId}\`
- Proposed Avatar: \`${m.proposedAvatar}\`
- Score: ${m.score.toFixed(2)}
- Reason: Manual review required
`
  )
  .join('\n')}

## Score Distribution

- High Confidence (≥0.8): ${mappings.filter(m => m.score >= 0.8).length}
- Medium Confidence (0.6-0.8): ${mappings.filter(m => m.score >= 0.6 && m.score < 0.8).length}
- Low Confidence (<0.6): ${mappings.filter(m => m.score < 0.6).length}

## Next Steps

1. Review any low-confidence mappings manually
2. Apply approved mappings: \`pnpm tsx scripts/apply-avatar-mappings.ts --report review-report.md\`
3. Verify in UI that avatars display correctly
4. Run visual QA on agent cards/profiles
`

  fs.writeFileSync(outputPath, report, 'utf-8')
  console.log(`📄 Review report saved to: ${outputPath}`)
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔍 VITAL Avatar Mapping Review Tool')
  console.log('=' .repeat(60))
  console.log()

  // Read SQL file
  const inputPath = path.join(process.cwd(), config.inputFile)

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`)
    console.error('   Run map-agent-avatars.ts first to generate mappings')
    process.exit(1)
  }

  console.log(`📂 Reading mappings from: ${config.inputFile}`)
  const sqlContent = fs.readFileSync(inputPath, 'utf-8')
  const mappings = parseMappings(sqlContent)

  console.log(`✅ Found ${mappings.length} mappings`)
  console.log()

  // Fetch current avatars from database
  console.log('📊 Fetching current avatar data...')
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, avatar_url')
    .in('id', mappings.map(m => m.agentId))

  if (!error && agents) {
    for (const agent of agents) {
      const mapping = mappings.find(m => m.agentId === agent.id)
      if (mapping) {
        mapping.currentAvatar = agent.avatar_url
      }
    }
  }

  console.log()

  // Review mode
  if (config.approveAll) {
    console.log('⚡ Auto-approving all mappings (--approve-all)')
    mappings.forEach(m => (m.approved = true))
  } else if (config.interactive) {
    console.log('🎯 Interactive Review Mode')
    console.log('   Review each mapping and approve/reject individually')

    for (const mapping of mappings) {
      const approved = await promptApproval(mapping)
      mapping.approved = approved
    }
  } else {
    console.log('📋 Non-interactive Review Mode')
    console.log('   Auto-approving high-confidence mappings (score >= 0.7)')
    console.log('   Use --interactive for manual review')
    console.log()

    mappings.forEach(m => {
      m.approved = m.score >= 0.7
      if (m.approved) {
        console.log(`✅ Auto-approved: ${m.agentName} (${m.score.toFixed(2)})`)
      } else {
        console.log(`⚠️  Requires review: ${m.agentName} (${m.score.toFixed(2)})`)
      }
    })
  }

  console.log()
  console.log('📊 Review Summary:')
  console.log(`  Approved: ${mappings.filter(m => m.approved).length}`)
  console.log(`  Rejected/Skipped: ${mappings.filter(m => !m.approved).length}`)
  console.log()

  // Generate report
  const reportPath = 'avatar-mapping-review-report.md'
  generateReport(mappings, reportPath)
  console.log()

  // Apply mappings
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question('Apply approved mappings to database? (y/n): ', async (answer) => {
    rl.close()

    if (answer.toLowerCase() === 'y') {
      await applyMappings(mappings)
    } else {
      console.log('⏭️  Skipped database update')
      console.log('   To apply later, use the generated SQL file directly')
    }

    console.log()
    console.log('✨ Review complete!')
  })
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
