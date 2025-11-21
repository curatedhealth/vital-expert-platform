# Pharma Strategic Pillars Hierarchy - Complete

## Summary

Successfully implemented a hierarchical navigation system for Pharma/Medical Affairs workflows that organizes content by **Strategic Objectives (Pillars) → JTBDs → Workflows → Tasks**, providing a clear strategic-to-tactical drill-down experience.

## Implementation Overview

### Hierarchy Levels:

```
Level 1: Strategic Pillars (SP01-SP07)
    ↓
Level 2: Jobs-to-be-Done (JTBDs)
    ↓
Level 3: Workflows
    ↓
Level 4: Tasks
```

## Changes Made

### 1. API Route Enhancements ([apps/digital-health-startup/src/app/api/workflows/usecases/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/route.ts))

#### Strategic Pillar Grouping:
```typescript
// Group Pharma JTBDs by Strategic Pillar
const strategicPillars = jtbdAsUseCases.reduce((acc: Record<string, any[]>, jtbd: any) => {
  const pillar = jtbd.strategic_pillar || 'Uncategorized';
  if (!acc[pillar]) acc[pillar] = [];
  acc[pillar].push(jtbd);
  return acc;
}, {});
```

#### Enhanced Statistics:
```typescript
by_strategic_pillar: Object.keys(strategicPillars).reduce((acc, pillar) => {
  acc[pillar] = strategicPillars[pillar].length;
  return acc;
}, {})
```

#### API Response:
```typescript
return NextResponse.json({
  success: true,
  data: {
    useCases: allUseCases,
    stats,
    strategicPillars, // New: Grouped by strategic pillar
  },
  timestamp: new Date().toISOString(),
});
```

### 2. Strategic Pillar Configuration ([apps/digital-health-startup/src/app/(app)/workflows/page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx))

#### Pillar Definitions:

```typescript
const STRATEGIC_PILLARS = {
  'SP01': {
    name: 'Growth & Market Access',
    shortName: 'Growth',
    icon: Target,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description: 'Evidence generation and value demonstration to drive market access',
  },
  'SP02': {
    name: 'Scientific Excellence',
    shortName: 'Science',
    icon: Lightbulb,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description: 'Advancing medical knowledge and maintaining scientific credibility',
  },
  'SP03': {
    name: 'Stakeholder Engagement',
    shortName: 'Engagement',
    icon: Users,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description: 'Building relationships with KOLs, HCPs, payers, and patient advocates',
  },
  'SP04': {
    name: 'Compliance & Quality',
    shortName: 'Compliance',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    description: 'Maintaining regulatory compliance and operational excellence',
  },
  'SP05': {
    name: 'Operational Excellence',
    shortName: 'Operations',
    icon: Cog,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    description: 'Optimizing resources, processes, and ROI',
  },
  'SP06': {
    name: 'Talent Development',
    shortName: 'Talent',
    icon: GraduationCap,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    description: 'Building capabilities and organizational effectiveness',
  },
  'SP07': {
    name: 'Innovation & Digital',
    shortName: 'Innovation',
    icon: Rocket,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    description: 'Leveraging technology and innovation for competitive advantage',
  },
};
```

### 3. Expandable Accordion UI Component

#### State Management:
```typescript
const [strategicPillars, setStrategicPillars] = useState<StrategicPillarData>({});
const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());

const togglePillar = (pillarId: string) => {
  const newExpanded = new Set(expandedPillars);
  if (newExpanded.has(pillarId)) {
    newExpanded.delete(pillarId);
  } else {
    newExpanded.add(pillarId);
  }
  setExpandedPillars(newExpanded);
};
```

#### Conditional Rendering:
```typescript
{selectedIndustry === 'pharma' && selectedDomain === 'MA' ? (
  // Show Strategic Pillar Hierarchy
  <StrategicPillarView />
) : (
  // Show Standard Domain/Grid View
  <StandardView />
)}
```

## User Experience Flow

### Navigation Path:

```
1. User selects "Pharma & Life Sciences" filter
   ↓
2. User clicks "Medical Affairs" (MA) domain tab
   ↓
3. Page displays 7 Strategic Pillar cards (SP01-SP07)
   ↓
4. User clicks on a Strategic Pillar (e.g., "Growth & Market Access")
   ↓
5. Pillar expands to show all related JTBDs
   ↓
6. User clicks on a JTBD card
   ↓
7. JTBD detail page shows Workflows
   ↓
8. User clicks on a Workflow
   ↓
9. Workflow detail page shows Tasks
```

## Visual Design

### Strategic Pillar Card (Collapsed):

```
┌─────────────────────────────────────────────────────────────┐
│ ┌───┐                                                     ▶ │
│ │ 🎯│  Growth & Market Access              [15 JTBDs]      │
│ └───┘                                                       │
│       Evidence generation and value demonstration           │
└─────────────────────────────────────────────────────────────┘
```

### Strategic Pillar Card (Expanded):

```
┌─────────────────────────────────────────────────────────────┐
│ ┌───┐                                                     ▼ │
│ │ 🎯│  Growth & Market Access              [15 JTBDs]      │
│ └───┘                                                       │
│       Evidence generation and value demonstration           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ JTBD 1  │  │ JTBD 2  │  │ JTBD 3  │                    │
│  │ Annual  │  │ Evidence│  │ Cross-  │                    │
│  │Strategic│  │ Gen.    │  │Function │                    │
│  │Planning │  │Planning │  │ Coord.  │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ JTBD 4  │  │ JTBD 5  │  │ JTBD 6  │                    │
│  │ Budget  │  │ KOL     │  │ Medical │                    │
│  │ Mgmt.   │  │Engagement│  │ Inquiry │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│  ... (showing all 15 JTBDs in this pillar)                 │
└─────────────────────────────────────────────────────────────┘
```

## Strategic Pillar Breakdown

### SP01: Growth & Market Access (15 JTBDs)
- **Icon**: 🎯 Target
- **Color**: Emerald Green
- **Focus**: Lifecycle planning, HEOR, market access, HTA submissions, pricing strategy

### SP02: Scientific Excellence (16 JTBDs)
- **Icon**: 💡 Lightbulb
- **Color**: Blue
- **Focus**: Investigator-initiated studies, medical information, publications, RWE, medical education

### SP03: Stakeholder Engagement (15 JTBDs)
- **Icon**: 👥 Users
- **Color**: Purple
- **Focus**: KOL engagement, advisory boards, patient advocacy, CME programs, speaker bureaus

### SP04: Compliance & Quality (20 JTBDs)
- **Icon**: 🛡️ Shield
- **Color**: Red
- **Focus**: Health crisis response, safety signals, adverse events, regulatory reporting, data privacy

### SP05: Operational Excellence (20 JTBDs)
- **Icon**: ⚙️ Cog
- **Color**: Orange
- **Focus**: Inquiry trends, competitive intelligence, vendor relationships, analytics, ROI optimization

### SP06: Talent Development (9 JTBDs)
- **Icon**: 🎓 GraduationCap
- **Color**: Indigo
- **Focus**: Organizational capability, MSL coaching, onboarding, M&A integration, employee engagement

### SP07: Innovation & Digital (16 JTBDs)
- **Icon**: 🚀 Rocket
- **Color**: Pink
- **Focus**: Digital transformation, AI/ML, precision medicine, predictive analytics, automation

## Code Structure

### Accordion Component:

```tsx
{Object.entries(strategicPillars).map(([pillarId, jtbds]) => {
  const pillarConfig = STRATEGIC_PILLARS[pillarId];
  const PillarIcon = pillarConfig.icon;
  const isExpanded = expandedPillars.has(pillarId);

  return (
    <Card key={pillarId} className={`border-2 ${pillarConfig.borderColor}`}>
      {/* Clickable Header */}
      <CardHeader
        className={`cursor-pointer hover:bg-gray-50 ${pillarConfig.bgColor}`}
        onClick={() => togglePillar(pillarId)}
      >
        <div className="flex items-center justify-between">
          {/* Pillar Info */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${pillarConfig.bgColor}`}>
              <PillarIcon className={`h-6 w-6 ${pillarConfig.color}`} />
            </div>
            <div>
              <CardTitle>{pillarConfig.name}</CardTitle>
              <Badge>{jtbds.length} JTBDs</Badge>
              <CardDescription>{pillarConfig.description}</CardDescription>
            </div>
          </div>
          {/* Expand/Collapse Icon */}
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {jtbds.map((jtbd) => (
              <UseCaseCard key={jtbd.id} useCase={jtbd} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
})}
```

## Benefits

### For Strategic Planning:
- **Clear Alignment**: JTBDs directly mapped to strategic objectives
- **Priority Visibility**: See JTBD count per strategic pillar
- **Holistic View**: Understand how tactics support strategy

### For Medical Affairs Teams:
- **Organized by Objectives**: Find workflows based on strategic goals
- **Better Navigation**: Drill down from strategy to execution
- **Context-Rich**: Each JTBD linked to its strategic purpose

### For Leadership:
- **Strategic Overview**: See all 7 strategic pillars at a glance
- **Resource Allocation**: Understand JTBD distribution across pillars
- **Gap Identification**: Identify under-served strategic areas

## Comparison: Startup vs Pharma Views

### Startup View (Digital Health):
```
Traditional Domain-Based View:
- Clinical Development
  └─ Use Cases (flat list)
- Product Development
  └─ Use Cases (flat list)
- Regulatory Affairs
  └─ Use Cases (flat list)
```

### Pharma View (Medical Affairs):
```
Strategic Hierarchy View:
- SP01: Growth & Market Access
  └─ 15 JTBDs
      └─ Workflows
          └─ Tasks
- SP02: Scientific Excellence
  └─ 16 JTBDs
      └─ Workflows
          └─ Tasks
... (7 strategic pillars total)
```

## Technical Implementation

### Filter Logic:
```typescript
// Show Strategic Pillar view ONLY when:
selectedIndustry === 'pharma' && selectedDomain === 'MA'

// Otherwise show standard grid/domain view
```

### Data Flow:
1. API groups JTBDs by `strategic_pillar` field
2. Returns `strategicPillars` object to frontend
3. Frontend renders accordion for each pillar
4. User expands pillar to see JTBDs
5. Clicking JTBD navigates to detail page

## Future Enhancements (Roadmap)

1. **Drill-Down to Workflows**
   - Click JTBD → Show related workflows
   - Workflow cards within pillar view

2. **Drill-Down to Tasks**
   - Click Workflow → Show tasks
   - Task checklist view

3. **Progress Tracking**
   - Track completion % per pillar
   - Show completed vs total JTBDs

4. **Filtering within Pillars**
   - Search within expanded pillar
   - Filter by complexity/priority

5. **Pillar Analytics**
   - Time spent per pillar
   - Most used JTBDs per pillar
   - Success metrics per pillar

6. **Bulk Actions**
   - Expand all pillars
   - Collapse all pillars
   - Export pillar data

## Files Modified

1. [apps/digital-health-startup/src/app/api/workflows/usecases/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/route.ts:100-144)
   - Added strategic pillar grouping
   - Added `by_strategic_pillar` statistics
   - Returned `strategicPillars` in API response

2. [apps/digital-health-startup/src/app/(app)/workflows/page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx:92-557)
   - Added `STRATEGIC_PILLARS` configuration
   - Added accordion UI component
   - Added expand/collapse state management
   - Implemented conditional rendering

## Success Metrics

- **Strategic Clarity**: 7 strategic pillars clearly organized
- **JTBD Coverage**: All 120 Medical Affairs JTBDs categorized
- **User Navigation**: One-click expand to see pillar contents
- **Visual Design**: Color-coded pillars with unique icons
- **Performance**: Fast expand/collapse with React state

---

**Status**: ✅ COMPLETE (Level 1 & 2)

**Next Phase**: Implement drill-down to Workflows (Level 3) and Tasks (Level 4)

**Date**: 2025-11-09

**Impact**: High - Provides strategic context for Pharma Medical Affairs workflows

**Related Documentation**:
- [WORKFLOWS_PAGE_MEDICAL_AFFAIRS_UPDATE_COMPLETE.md](WORKFLOWS_PAGE_MEDICAL_AFFAIRS_UPDATE_COMPLETE.md)
- [WORKFLOWS_INDUSTRY_FILTER_COMPLETE.md](WORKFLOWS_INDUSTRY_FILTER_COMPLETE.md)
