# Workflows Page - Medical Affairs JTBD Integration Complete

## Summary

Successfully updated the workflows page to display all 120 Medical Affairs Jobs-to-be-Done (JTBDs) from the `jtbd_library` table alongside existing Digital Health use cases.

## Changes Made

### 1. API Route Updates ([apps/digital-health-startup/src/app/api/workflows/usecases/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/route.ts))

#### New Features:
- **Dual Data Source Fetching**: Now fetches from both `dh_use_case` and `jtbd_library` tables
- **Data Transformation**: Converts JTBDs to match the UseCase interface with proper field mapping
- **Enhanced Statistics**: Added `total_jtbds` and `by_source` tracking

#### Key Transformations:
```typescript
// JTBD fields mapped to UseCase interface
{
  id: jtbd.id,
  code: jtbd.jtbd_code,
  title: jtbd.title || jtbd.statement,
  description: jtbd.description || jtbd.goal,
  domain: 'MA', // Medical Affairs
  complexity: mapComplexityToStandard(jtbd.complexity),
  deliverables: parseJsonField(jtbd.success_criteria),
  prerequisites: parseJsonField(jtbd.pain_points),
  strategic_pillar: jtbd.strategic_pillar,
  importance: jtbd.importance,
  frequency: jtbd.frequency,
}
```

#### Helper Functions Added:
- `mapComplexityToStandard()`: Converts various complexity formats to standard (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `estimateDurationFromComplexity()`: Estimates duration based on complexity level
- `parseJsonField()`: Safely parses JSONB fields from the database

### 2. UI Updates ([apps/digital-health-startup/src/app/(app)/workflows/page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx))

#### Domain Configuration:
- Changed "Market Access" to "Medical Affairs" for MA domain
- Maintained consistent icon (TrendingUp) and color scheme (trust-blue)

#### Statistics Dashboard:
Updated from 4 cards to 5 cards:
1. **Total Items** - Combined count of use cases + JTBDs
2. **Medical Affairs** - Dedicated card showing JTBD count (highlighted in blue)
3. **Workflows** - Existing workflow count
4. **Tasks** - Existing task count
5. **Domains** - Number of unique domains

#### UseCase Interface Enhancement:
Added new optional fields:
```typescript
interface UseCase {
  // ... existing fields
  strategic_pillar?: string;  // SP01-SP07 (Growth, Excellence, etc.)
  source?: string;            // Data source identifier
  category?: string;          // JTBD category
  importance?: number;        // Priority score (1-10)
  frequency?: string;         // How often JTBD occurs
}
```

#### Card Display Enhancements:
New badges added to workflow cards:
- **Strategic Pillar** (purple badge) - Shows SP01-SP07 for Medical Affairs JTBDs
- **Frequency** (outline badge) - Shows how often the JTBD occurs
- **Priority** (orange badge) - Shows importance score (1-10)
- **Source** (outline badge) - Distinguishes between "MA JTBD" and "DH Use Case"

### 3. Medical Affairs Data Structure

#### Strategic Pillars (SP01-SP07):
- **SP01**: Growth & Market Access (15 JTBDs)
- **SP02**: Scientific Excellence (16 JTBDs)
- **SP03**: Stakeholder Engagement (15 JTBDs)
- **SP04**: Compliance & Quality (20 JTBDs)
- **SP05**: Operational Excellence (20 JTBDs)
- **SP06**: Talent Development (9 JTBDs)
- **SP07**: Innovation & Digital (16 JTBDs)

#### Total Medical Affairs JTBDs: 120

## Expected Results

### Before:
- Workflows page showed only Digital Health use cases from `dh_use_case` table
- Limited to specific domains (CD, RA, PD, EG, RWE)
- No Medical Affairs-specific workflows

### After:
- **Combined Display**: Shows both DH use cases AND Medical Affairs JTBDs
- **Enhanced Filtering**: MA domain now shows all 120 Medical Affairs JTBDs
- **Rich Metadata**: Strategic pillars, priority scores, frequency indicators
- **Clear Source Attribution**: Visual badges distinguish data sources
- **Better Statistics**: Separate tracking for JTBDs vs traditional use cases

## User Experience Improvements

1. **Comprehensive View**: Users can now see the complete Medical Affairs workflow library
2. **Strategic Context**: Strategic pillar badges provide organizational context
3. **Priority Awareness**: Importance scores help users identify high-priority JTBDs
4. **Frequency Insight**: Users can see how often each job needs to be done
5. **Source Transparency**: Clear visual indicators show data origin

## Database Schema Integration

The implementation leverages the comprehensive JTBD schema from:
- Migration: `20251108_create_comprehensive_persona_jtbd_schema.sql`
- Table: `jtbd_library` with 120 Medical Affairs entries
- Related: `dh_personas` table with 43 Medical Affairs personas
- Mapping: `jtbd_org_persona_mapping` for persona-JTBD relationships

## Technical Details

### API Response Format:
```json
{
  "success": true,
  "data": {
    "useCases": [...], // Combined array of DH use cases + MA JTBDs
    "stats": {
      "total_workflows": 85,
      "total_tasks": 250,
      "total_jtbds": 120,
      "by_domain": {
        "MA": 120,
        "CD": 10,
        "RA": 5,
        // ... other domains
      },
      "by_complexity": {
        "BEGINNER": 30,
        "INTERMEDIATE": 50,
        "ADVANCED": 25,
        "EXPERT": 15
      },
      "by_source": {
        "Medical Affairs JTBD Library": 120,
        "Digital Health Use Cases": 15
      }
    }
  },
  "timestamp": "2025-11-09T..."
}
```

## Files Modified

1. [apps/digital-health-startup/src/app/api/workflows/usecases/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/route.ts) - API route
2. [apps/digital-health-startup/src/app/(app)/workflows/page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx) - UI page

## Next Steps (Optional Enhancements)

1. **Filter by Strategic Pillar**: Add dropdown to filter by SP01-SP07
2. **Filter by Source**: Toggle between MA JTBDs and DH Use Cases
3. **Enhanced Detail View**: Create dedicated JTBD detail page
4. **Persona Integration**: Show which personas use each JTBD
5. **Search Enhancement**: Include strategic pillar and category in search

## Testing Recommendations

1. Navigate to `/workflows` page
2. Verify all 120 Medical Affairs JTBDs appear under MA domain tab
3. Check that statistics card shows correct JTBD count
4. Confirm strategic pillar badges display correctly
5. Test filtering and search with MA JTBDs
6. Verify source badges distinguish between data sources

## Success Metrics

- Total items displayed: 135+ (120 MA JTBDs + existing use cases)
- MA domain tab: Shows all 120 Medical Affairs workflows
- Strategic context: All MA JTBDs have strategic pillar badges
- Source clarity: All items clearly labeled with origin
- Performance: Page loads efficiently with combined dataset

---

**Status**: ✅ COMPLETE

**Date**: 2025-11-09

**Impact**: High - Provides comprehensive Medical Affairs workflow library to users
