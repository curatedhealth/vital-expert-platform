# VITAL Agent-Avatar Mapping Guide

Complete guide for intelligently mapping existing agents to appropriate avatars from the 500-avatar VITAL library.

## Overview

The avatar mapping system uses a **multi-factor scoring algorithm** to recommend optimal avatar assignments:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Tier Match** | 30% | Agent tier alignment (1-5) |
| **Domain Match** | 25% | Specialty/domain expertise keywords |
| **Persona Match** | 20% | Persona type fit (expert, medical, pharma, etc.) |
| **Tenant Affinity** | 15% | Tenant identity color alignment |
| **Visual Harmony** | 10% | Overall aesthetic fit based on variant |

## Workflow

### Step 1: Generate Mappings

Generate avatar recommendations for all agents in the database:

```bash
# Generate mappings for all agents
pnpm tsx scripts/map-agent-avatars.ts --dry-run

# Limit to first 50 agents (for testing)
pnpm tsx scripts/map-agent-avatars.ts --dry-run --limit=50

# Generate and save to custom file
pnpm tsx scripts/map-agent-avatars.ts --output=my-mappings.sql
```

**Output:**
- SQL file with UPDATE statements
- Console summary with statistics
- Top 10 highest-confidence mappings

### Step 2: Review Mappings

Review and approve recommendations before applying:

```bash
# Non-interactive: Auto-approve high-confidence mappings (score >= 0.7)
pnpm tsx scripts/review-avatar-mappings.ts --input=agent-avatar-mappings.sql

# Interactive: Review each mapping individually
pnpm tsx scripts/review-avatar-mappings.ts --input=agent-avatar-mappings.sql --interactive

# Auto-approve all (skip review)
pnpm tsx scripts/review-avatar-mappings.ts --input=agent-avatar-mappings.sql --approve-all
```

**Interactive Review:**
- View agent name, current avatar, proposed avatar
- See confidence score and breakdown
- Approve (y), Reject (n), or Skip (s) each mapping

**Output:**
- Review report (Markdown)
- Approved/rejected counts
- Option to apply to database

### Step 3: Apply to Database

Mappings are applied during the review step. Alternatively, run SQL directly:

```bash
# Apply SQL file directly (requires manual review first!)
psql $DATABASE_URL -f agent-avatar-mappings.sql

# Or using Supabase CLI
supabase db execute -f agent-avatar-mappings.sql
```

### Step 4: Verify in UI

After applying mappings:

1. **Visual QA**: Check agent cards/profiles display correct avatars
2. **Performance Test**: Ensure lazy loading works with 500 avatars
3. **Accessibility Check**: Verify alt text and screen reader support
4. **Cross-Browser Test**: Test on Chrome, Firefox, Safari

## Scoring Algorithm Details

### 1. Tier Match (30%)

```typescript
Exact match (tier = tier)     → 1.0
Adjacent tier (diff = 1)      → 0.7
Two tiers away (diff = 2)     → 0.4
Three+ tiers away (diff >= 3) → 0.2
```

**Example:**
- Agent (Tier 2) + Avatar (Tier 2) → 1.0
- Agent (Tier 2) + Avatar (Tier 3) → 0.7

### 2. Domain Match (25%)

Keyword matching against agent metadata:
- Knowledge domains
- Capabilities
- Specialization
- Display name

**Keywords by Department:**
- `analytics_insights`: analytics, data, insights, metrics, reporting, business intelligence
- `medical_affairs`: medical affairs, msl, kol, publication, medical education, clinical
- `market_access`: market access, reimbursement, pricing, payer, formulary, health economics
- `commercial_marketing`: commercial, marketing, sales, brand, promotion, market
- `product_innovation`: product, innovation, development, r&d, research, pipeline

**Score:**
- 3+ keyword matches → 1.0
- 2 keyword matches → 0.67
- 1 keyword match → 0.33
- 0 keyword matches → 0.0

### 3. Persona Match (20%)

Keyword matching against agent name/metadata:

**Keywords by Persona:**
- `expert`: expert, specialist, advisor, consultant, professional
- `foresight`: strategic, foresight, innovation, future, vision, planning
- `medical`: medical, clinical, physician, healthcare, patient, treatment
- `pharma`: pharmaceutical, pharma, drug, therapy, biotech, compound
- `startup`: startup, entrepreneur, innovation, disrupt, agile, venture

**Score:**
- 2+ keyword matches → 1.0
- 1 keyword match → 0.5
- 0 keyword matches → 0.0

### 4. Tenant Affinity (15%)

Persona-tenant alignment based on Brand Guidelines v5.0:

```typescript
expert  → 1.0  // Expert Purple - general expertise
pharma  → 0.9  // Pharma Blue - pharmaceutical
medical → 0.9  // Medical Red - clinical/medical
foresight → 0.8  // Foresight Pink - strategic
startup → 0.7  // Startup Black - innovation
```

### 5. Visual Harmony (10%)

Variant distribution based on agent tier:

```typescript
High tier (1-2):  Variants 1-7   → 1.0
Mid tier (3):     Variants 6-14  → 1.0
Low tier (4-5):   Variants 15-20 → 1.0
```

Ensures visual diversity and appropriate avatar selection across tiers.

## Confidence Levels

### High Confidence (≥ 0.8)
- **Action**: Auto-approve
- **Characteristics**: Strong match across multiple factors
- **Example**: Clinical Trials expert → medical_affairs avatar

### Medium Confidence (0.6 - 0.8)
- **Action**: Manual review recommended
- **Characteristics**: Good match but some uncertainty
- **Example**: Strategic advisor → foresight or expert persona

### Low Confidence (< 0.6)
- **Action**: Requires manual assignment
- **Characteristics**: Weak or conflicting signals
- **Example**: General manager → unclear department/persona

## Manual Override

For agents requiring custom avatars:

```sql
-- Update individual agent
UPDATE agents
SET avatar = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_05.svg'
WHERE id = 'agent-uuid-here';

-- Bulk update by criteria
UPDATE agents
SET avatar = '/assets/vital/avatars/vital_avatar_pharma_market_access_12.svg'
WHERE specialization ILIKE '%market access%'
  AND tier = 2;
```

## Troubleshooting

### Issue: Low Scores Across All Agents

**Cause**: Missing agent metadata (knowledge_domains, specialization, etc.)

**Solution**:
1. Enrich agent metadata before running mapping
2. Add knowledge domains to agent records
3. Ensure tier is set for all agents

### Issue: Duplicate Avatars Assigned

**Cause**: Multiple agents with identical metadata

**Solution**:
1. Use variant numbers to ensure diversity
2. Manually reassign variants within same persona/department
3. Rotate through variants 1-20

### Issue: Avatars Not Displaying

**Cause**: Assets not copied to public directory

**Solution**:
```bash
# Copy assets from Downloads to public
cp -r ~/Downloads/vital_avatars_500_svg/* public/assets/vital/avatars/

# Verify file permissions
chmod -R 755 public/assets/vital/
```

### Issue: SQL Syntax Errors

**Cause**: Special characters in agent names

**Solution**:
- SQL file uses single quotes correctly
- Review generated SQL before applying
- Use Supabase dashboard to manually update if needed

## Avatar Library Structure

### 500 Avatars = 5 × 5 × 20

**5 Persona Types:**
1. expert (Expert Purple #9B5DE0)
2. foresight (Foresight Pink #FF3796)
3. medical (Medical Red #EF4444)
4. pharma (Pharma Blue #0046FF)
5. startup (Startup Black #292621)

**5 Departments:**
1. analytics_insights
2. commercial_marketing
3. market_access
4. medical_affairs
5. product_innovation

**20 Variants per Combination:**
- Variants 01-20 for visual diversity
- Same persona/department, different artistic styles

### Example Avatar Paths

```
/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg
/assets/vital/avatars/vital_avatar_medical_medical_affairs_08.svg
/assets/vital/avatars/vital_avatar_pharma_market_access_15.svg
/assets/vital/avatars/vital_avatar_foresight_product_innovation_03.svg
/assets/vital/avatars/vital_avatar_startup_commercial_marketing_11.svg
```

## Best Practices

### 1. Test with Small Batch First
```bash
# Test with 10 agents
pnpm tsx scripts/map-agent-avatars.ts --limit=10 --dry-run
```

### 2. Review Low-Confidence Mappings
```bash
# Interactive review for scores < 0.7
pnpm tsx scripts/review-avatar-mappings.ts --interactive
```

### 3. Backup Before Applying
```bash
# Create backup SQL
pg_dump -t agents -d $DATABASE_URL > agents-backup-$(date +%Y%m%d).sql
```

### 4. Apply in Batches
```bash
# Apply 50 agents at a time
pnpm tsx scripts/map-agent-avatars.ts --limit=50 --output=batch1.sql
pnpm tsx scripts/review-avatar-mappings.ts --input=batch1.sql
# Repeat for next 50...
```

### 5. Monitor Performance
- Check lazy loading works with many avatars
- Verify image caching is enabled
- Test on slow networks

## Integration with Frontend Components

After mapping, use components from `@vital/ui`:

```tsx
import { AgentAvatar } from '@vital/ui'

function AgentCard({ agent }) {
  // Parse avatar path to extract persona/department/variant
  const avatarMatch = agent.avatar.match(/vital_avatar_(\w+)_(\w+)_(\d{2})/)

  if (avatarMatch) {
    const [, personaType, department, variant] = avatarMatch

    return (
      <AgentAvatar
        personaType={personaType}
        department={department}
        variant={parseInt(variant, 10)}
        tier={agent.tier}
        size="lg"
        showName={true}
        name={agent.display_name}
      />
    )
  }

  // Fallback for direct avatar URL
  return (
    <AgentAvatar
      avatar={agent.avatar}
      tier={agent.tier}
      size="lg"
      name={agent.display_name}
    />
  )
}
```

## Advanced Customization

### Custom Scoring Weights

Edit `scripts/map-agent-avatars.ts`:

```typescript
const WEIGHTS = {
  tierMatch: 0.40,      // Increase tier importance
  domainMatch: 0.30,    // Increase domain importance
  personaMatch: 0.15,   // Decrease persona importance
  tenantAffinity: 0.10, // Decrease tenant importance
  visualHarmony: 0.05,  // Decrease visual importance
}
```

### Custom Keywords

Add domain-specific keywords:

```typescript
const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  medical_affairs: [
    'medical affairs', 'msl', 'kol',
    // Add custom keywords
    'thought leader', 'advisory board', 'congress'
  ],
  // ... other departments
}
```

### Exclude Specific Avatars

Skip certain variants:

```typescript
// In findBestAvatar() function
for (let variant = 1; variant <= 20; variant++) {
  // Skip variants 13 (unlucky) or specific styles
  if (variant === 13) continue

  // ... rest of scoring logic
}
```

## API Integration (Future)

For programmatic avatar recommendations:

```typescript
// Future API endpoint
POST /api/agents/:agentId/recommend-avatar

Response:
{
  "recommendations": [
    {
      "avatar": "/assets/vital/avatars/vital_avatar_expert_medical_affairs_03.svg",
      "score": 0.87,
      "breakdown": {
        "tierMatch": 1.0,
        "domainMatch": 0.92,
        "personaMatch": 0.85,
        "tenantAffinity": 1.0,
        "visualHarmony": 0.8
      }
    },
    // ... more recommendations
  ]
}
```

## Resources

- **Brand Guidelines v5.0**: `.claude/docs/brand/VITAL_BRAND_GUIDELINES_V5.0.md`
- **Asset Inventory**: `.claude/docs/brand/VITAL_VISUAL_ASSET_INVENTORY.md`
- **Component Library**: `packages/ui/src/components/vital-visual/README.md`
- **AgentOS 3.0 Hierarchy**: See Brand Guidelines Section 3

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review generated SQL file for errors
3. Test with `--dry-run` flag first
4. Verify asset files are in place

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Status**: Production Ready
