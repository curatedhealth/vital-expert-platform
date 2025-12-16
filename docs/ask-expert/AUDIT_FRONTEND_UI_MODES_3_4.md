# Frontend UI Audit - Ask Expert Modes 3 & 4

**Audit Date:** December 16, 2025
**Auditor:** Frontend UI Architect Agent
**Status:** Cross-Verified → **CORRECTED**
**Overall Grade:** ~~D+ (45%)~~ **C+ (75%)** - Revised after architecture correction

---

> **CRITICAL CORRECTION (December 16, 2025)**
>
> **Mode 3 and Mode 4 should share the SAME UI** - per the official architecture.
> The ONLY UI difference should be the agent selection mechanism:
> - Mode 3: Show agent selection dropdown/list (user selects)
> - Mode 4: Show "AI selecting best agent..." animation (auto-selection)
>
> Previous findings about "missing Mode 3 Research Interface" were **incorrect**.
> Mode 3 and Mode 4 use the same Mission Dashboard and Autonomous View.
>
> See: `AUDIT_CORRECTION_MODE_3_4_ARCHITECTURE.md` for full correction.

---

## Executive Summary

~~The frontend implementation for Ask Expert Modes 3 and 4 has significant gaps. While excellent streaming infrastructure exists (A- grade), the mode-specific UI components are either missing (Mode 3) or orphaned (Mode 4). Accessibility is severely lacking with zero ARIA labels in the main sidebar component.~~

**CORRECTED Assessment:** The frontend architecture is mostly correct. Mode 3 and Mode 4 share the `AutonomousView` and `MissionDashboard` components. The Mission Dashboard exists and should serve BOTH modes. The primary gap is connecting the existing components to the mode switcher and implementing the agent selection toggle (manual vs automatic).

---

## Grade Breakdown

| Component | Grade | Status |
|-----------|-------|--------|
| Mode 3 UI | D (40%) | Missing research interface |
| Mode 4 UI | D (30%) | Exists but orphaned |
| Streaming | A- (90%) | Excellent SSE infrastructure |
| Accessibility | D+ (55%) | Missing ARIA, keyboard nav |
| Design System | B- (80%) | Inconsistent shadcn/ui usage |

---

## 1. Mode 3: Deep Research UI

### Current State: D (40%)

**What Should Exist:**
- Research query input with complexity controls
- Depth selector (Surface, Moderate, Comprehensive)
- Source type filters (Academic, Clinical, Regulatory)
- Time budget selector
- Research progress tracker
- Stage visualization (Refining → Discovering → Analyzing → Synthesizing)
- Citation management UI
- Intermediate insights stream

**What Actually Exists:**
- Generic chat interface (same as Mode 1)
- Radio button to select "Mode 3" (does nothing)
- No mode-specific rendering

### Evidence

```bash
# Search for Mode 3 specific components
find apps/vital-system/src -type f -name "*.tsx" -exec grep -l "mode.3\|deep.research" {} \;
# Result: 0 files found

# Check conditional rendering in sidebar
grep "mode === 3\|selectedMode.*3" components/sidebar-ask-expert.tsx
# Result: 0 matches
```

### Files That Should Be Created

```
features/ask-expert/components/
├── research-interface.tsx          # Main Mode 3 interface
├── research-query-input.tsx        # Enhanced query input
├── research-options-panel.tsx      # Depth, sources, time budget
├── research-progress-tracker.tsx   # Stage visualization
├── research-insights-stream.tsx    # Live intermediate findings
└── citation-preview.tsx            # Inline citation management
```

### Recommended Implementation

```typescript
// features/ask-expert/components/research-interface.tsx
interface ResearchInterfaceProps {
  onSubmit: (query: string, options: ResearchOptions) => void
  isResearching: boolean
  researchProgress?: ResearchProgress
}

export function ResearchInterface({
  onSubmit,
  isResearching,
  researchProgress
}: ResearchInterfaceProps) {
  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-600" />
          <CardTitle>Deep Research Mode</CardTitle>
          <Badge variant="outline">Comprehensive Analysis</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResearchQueryInput />
        <ResearchOptionsPanel />
        {isResearching && (
          <ResearchProgressTracker progress={researchProgress} />
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 2. Mode 4: Background/Autonomous UI

### Current State: D (30%)

**Critical Discovery:** Mission Dashboard EXISTS but is ORPHANED

**What Should Exist:**
- Mission creation dialog
- Mission dashboard with active/completed missions
- Mission cards with progress bars
- Notification settings
- Mission results viewer
- Export/share functionality

**What Actually Exists:**
```
features/missions/
├── components/
│   ├── mission-dashboard.tsx  ✅ EXISTS (380 lines)
│   ├── mission-card.tsx       ✅ EXISTS (150 lines)
│   └── mission-list.tsx       ✅ EXISTS
└── hooks/
    └── use-missions.ts        ✅ EXISTS
```

**BUT:** Zero integration with Ask Expert Mode 4

### Evidence

```bash
# Mission components exist
ls apps/vital-system/src/features/missions/components/
# Output: mission-dashboard.tsx, mission-card.tsx, mission-list.tsx

# Check integration with Ask Expert
grep -r "mission" components/sidebar-ask-expert.tsx
# Result: 0 matches

# Check for Mode 4 conditional rendering
grep "mode === 4\|selectedMode.*4" components/sidebar-ask-expert.tsx
# Result: 0 matches
```

### Root Cause

The Mission feature was built but never wired to the Ask Expert mode switcher. When a user selects Mode 4, they see the exact same interface as Mode 1.

### Fix Required

```typescript
// In sidebar-ask-expert.tsx, add:
import { MissionDashboard } from '@/features/missions/components/mission-dashboard'

// In render function:
{selectedMode === 'mode4' && (
  <MissionDashboard
    onCreateMission={handleCreateMission}
    activeMissions={missions}
  />
)}
```

---

## 3. Streaming Infrastructure

### Current State: A- (90%)

**This is the strongest part of the frontend.**

### What Exists

```
features/streaming/
├── components/
│   ├── activity-feed.tsx       ✅ 380+ lines, production-ready
│   ├── streaming-message.tsx   ✅ Real-time text rendering
│   ├── vital-stream-event.tsx  ✅ Event type handling
│   └── vital-stream-text.tsx   ✅ Word-by-word animation
├── hooks/
│   ├── use-streaming.ts        ✅ SSE connection management
│   └── use-activity-feed.ts    ✅ Event persistence
└── types/
    └── streaming.ts             ✅ TypeScript definitions
```

### Strengths
- Proper SSE (Server-Sent Events) implementation
- Event type discrimination with type-safe rendering
- localStorage persistence for activity history
- Auto-scroll with UX polish
- Error handling and loading states
- Word-by-word text animation

### Minor Issues
- No progress indicators for long operations
- No intermediate results display
- No stream cancellation UI

---

## 4. Accessibility

### Current State: D+ (55%)

### Evidence

```bash
# ARIA labels in sidebar
grep -n "aria-label\|aria-describedby" sidebar-ask-expert.tsx
# Result: 0 matches

# Keyboard handlers
grep -n "onKeyDown\|onKeyPress" sidebar-ask-expert.tsx
# Result: 0 matches

# Semantic roles
grep -n "role=" sidebar-ask-expert.tsx
# Result: 0 matches
```

### Critical Gaps

| Issue | Impact | Priority |
|-------|--------|----------|
| No ARIA labels | Screen readers can't navigate | P1 |
| No keyboard shortcuts | Keyboard users blocked | P1 |
| No focus management | Tab order broken | P1 |
| No live regions | Updates not announced | P2 |
| Poor color contrast | Visually impaired users | P2 |

### Required Fixes

```typescript
// Add to mode selector
<div role="tablist" aria-label="Ask Expert Modes">
  {modes.map((mode, idx) => (
    <Button
      key={mode}
      role="tab"
      aria-selected={selectedMode === mode}
      aria-controls={`${mode}-panel`}
      tabIndex={selectedMode === mode ? 0 : -1}
      onClick={() => setSelectedMode(mode)}
    >
      {mode} <kbd className="ml-2">Alt+{idx + 1}</kbd>
    </Button>
  ))}
</div>

// Add to activity feed
<div
  role="feed"
  aria-live="polite"
  aria-busy={isStreaming}
  aria-label="Research activity feed"
>
  {events.map((event, index) => (
    <article
      key={event.id}
      role="article"
      aria-posinset={index + 1}
      aria-setsize={events.length}
    >
      <VitalStreamEvent event={event} />
    </article>
  ))}
</div>
```

---

## 5. Design System Compliance

### Current State: B- (80%)

### Strengths
- shadcn/ui components used (Button, Card, Badge)
- CSS variables for theming
- Tailwind CSS consistency

### Issues
- No mode-specific color tokens
- Inconsistent component usage
- Missing loading skeletons

### Recommended Color Tokens

```css
/* Add to globals.css */
@layer base {
  :root {
    /* Mode 1 - Interactive (Blue) */
    --mode1-primary: 221 83% 53%;
    --mode1-accent: 221 83% 95%;

    /* Mode 3 - Research (Purple) */
    --mode3-primary: 262 83% 58%;
    --mode3-accent: 262 83% 95%;

    /* Mode 4 - Mission (Amber) */
    --mode4-primary: 38 92% 50%;
    --mode4-accent: 38 92% 95%;
  }
}
```

---

## Priority Actions

### P0 - Critical (This Week)

1. **Connect Mission Dashboard to Mode 4**
   - File: `components/sidebar-ask-expert.tsx`
   - Add conditional rendering for `selectedMode === 'mode4'`
   - Import and render `MissionDashboard` component

### P1 - High (Next Sprint)

2. **Create Mode 3 Research Interface**
   - Create `features/ask-expert/components/research-interface.tsx`
   - Add research options panel
   - Add progress tracker

3. **Add Accessibility**
   - Add ARIA labels to all interactive elements
   - Implement keyboard navigation (Alt+1-4 for modes)
   - Add focus management

### P2 - Medium (Next Month)

4. **Add Mode-Specific Color Tokens**
   - Purple for Mode 3 (research)
   - Amber for Mode 4 (missions)

5. **Add Loading Skeletons**
   - Create skeleton components for async content
   - Improve perceived performance

---

## Component Checklist

### Mode 3 Components

| Component | Status | Priority |
|-----------|--------|----------|
| ResearchInterface | Missing | P1 |
| ResearchQueryInput | Missing | P1 |
| ResearchOptionsPanel | Missing | P1 |
| ResearchProgressTracker | Missing | P1 |
| ResearchInsightsStream | Missing | P2 |
| CitationPreview | Missing | P2 |
| DepthSelector | Missing | P1 |
| SourceTypeFilters | Missing | P2 |
| TimeBudgetSelector | Missing | P2 |

### Mode 4 Components

| Component | Status | Priority |
|-----------|--------|----------|
| MissionDashboard | EXISTS (orphaned) | P0 - Connect |
| MissionCard | EXISTS (orphaned) | P0 - Connect |
| MissionCreator | Missing | P1 |
| MissionResults | Missing | P1 |
| NotificationSettings | Missing | P2 |

### Accessibility Components

| Component | Status | Priority |
|-----------|--------|----------|
| ScreenReaderAnnouncer | Missing | P1 |
| KeyboardShortcutsHelp | Missing | P2 |
| FocusTrap | Missing | P1 |

---

## Files Audited

- `/apps/vital-system/src/components/sidebar-ask-expert.tsx`
- `/apps/vital-system/src/contexts/ask-expert-context.tsx`
- `/apps/vital-system/src/features/streaming/components/activity-feed.tsx`
- `/apps/vital-system/src/features/streaming/components/vital-stream-text.tsx`
- `/apps/vital-system/src/features/streaming/components/vital-stream-event.tsx`
- `/apps/vital-system/src/features/missions/components/mission-dashboard.tsx`
- `/apps/vital-system/src/features/missions/components/mission-card.tsx`
- `/apps/vital-system/src/app/globals.css`
- `/apps/vital-system/src/components/ui/button.tsx`
- `/apps/vital-system/src/components/ui/card.tsx`

---

**Agent IDs:** af5205c (initial), ab12e3c (cross-check)
**Next Review:** After P0 items completed
