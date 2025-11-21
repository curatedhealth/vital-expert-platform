# Workflows Page - Industry Filter Visual Guide

## UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOWS PAGE                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  STATISTICS CARDS                                                │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │    │
│  │  │  135    │ │   120   │ │   85    │ │   250   │ │    6    │  │    │
│  │  │ Total   │ │  Medical│ │Workflows│ │  Tasks  │ │ Domains │  │    │
│  │  │ Items   │ │ Affairs │ │         │ │         │ │         │  │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  SEARCH & FILTERS                                                │    │
│  │  ┌────────────────────────────────────────────┐  ┌───┐          │    │
│  │  │ 🔍 Search use cases...                     │  │ ⚙ │          │    │
│  │  └────────────────────────────────────────────┘  └───┘          │    │
│  │                                                                   │    │
│  │  Industry:  ┌──────────────┐ ┌────────────────┐ ┌──────────┐   │    │
│  │             │All Industries│ │Digital Health  │ │  Pharma  │   │    │
│  │             │   (Active)   │ │   Startups     │ │& Life Sci│   │    │
│  │             └──────────────┘ └────────────────┘ └──────────┘   │    │
│  │                                                                   │    │
│  │  Showing 135 of 135 use cases                                    │    │
│  │  Pharma: 120  |  Digital Health Startup: 15                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DOMAIN TABS                                                      │    │
│  │  [ All ] [ Clinical ] [ Medical ] [ Regulatory ] [ Product ]...  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Filter States

### State 1: All Industries (Default)

```
Industry:  [All Industries*] [Digital Health Startups] [Pharma & Life Sciences]
           ^^^^^^^^^^^^^^^^
              Active (Blue)

Showing 135 of 135 use cases
Pharma: 120  |  Digital Health Startup: 15
```

**Result**: Shows all 135 use cases from both industries

---

### State 2: Digital Health Startups Selected

```
Industry:  [All Industries] [Digital Health Startups*] [Pharma & Life Sciences]
                            ^^^^^^^^^^^^^^^^^^^^^^^^^
                               Active (Green)

Showing 15 of 135 use cases
Digital Health Startup: 15
```

**Result**: Shows only 15 Digital Health startup use cases
**Cards Display**: Green "Startup" badges

---

### State 3: Pharma & Life Sciences Selected

```
Industry:  [All Industries] [Digital Health Startups] [Pharma & Life Sciences*]
                                                       ^^^^^^^^^^^^^^^^^^^^^^^^
                                                          Active (Blue)

Showing 120 of 135 use cases
Pharma: 120
```

**Result**: Shows only 120 Medical Affairs pharma use cases
**Cards Display**: Blue "Pharma" badges

---

## Workflow Card Examples

### Startup Use Case Card

```
┌────────────────────────────────────────────────────────┐
│  📄 DTx Clinical Endpoint Selection          [Startup] │ ← Green badge
│                                               ^^^^^^^^^ │
│  Select appropriate clinical endpoints for               │
│  digital therapeutics in regulatory submissions          │
│                                                          │
│  [UC_CD_001] [INTERMEDIATE] [60 min] [3 deliverables]  │
│  [DH Use Case]                                          │ ← Source
│                                                          │
│  Click to view details                        Execute → │
└────────────────────────────────────────────────────────┘
```

### Pharma Use Case Card

```
┌────────────────────────────────────────────────────────┐
│  📈 Annual Strategic Planning                 [Pharma] │ ← Blue badge
│                                               ^^^^^^^^ │
│  Develop comprehensive medical affairs strategic         │
│  plan aligned with commercial objectives                 │
│                                                          │
│  [JTBD-MA-001] [EXPERT] [SP01] [Annual] [Priority: 9/10]│
│  [MA JTBD]                                              │ ← Source
│                                                          │
│  Click to view details                        Execute → │
└────────────────────────────────────────────────────────┘
```

---

## Color Coding Reference

### Startup (Green Theme)
```
┌─────────────────────────────────────┐
│  Button Active State                │
│  Background: bg-green-600           │
│  Hover: hover:bg-green-700          │
│  Text: white                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Card Badge                         │
│  Background: bg-green-100           │
│  Text: text-green-800               │
│  Border: border-green-300           │
│  Label: "Startup"                   │
└─────────────────────────────────────┘
```

### Pharma (Blue Theme)
```
┌─────────────────────────────────────┐
│  Button Active State                │
│  Background: bg-blue-600            │
│  Hover: hover:bg-blue-700           │
│  Text: white                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Card Badge                         │
│  Background: bg-blue-100            │
│  Text: text-blue-800                │
│  Border: border-blue-300            │
│  Label: "Pharma"                    │
└─────────────────────────────────────┘
```

---

## Combined Filtering Example

### Scenario: "Show me Medical Affairs workflows for Pharma"

```
┌──────────────────────────────────────────────────────────┐
│  Search: [                                     ]  [⚙]    │
│                                                           │
│  Industry:  [ All ] [Startups] [Pharma & Life Sciences*] │
│                                 ^^^^^^^^^^^^^^^^^^^^^^^   │
│  Domain:    [ All ] [ CD ] [ MA* ] [ RA ] [ PD ]...      │
│                            ^^^^^                          │
│                                                           │
│  Showing 120 of 135 use cases                            │
│  Pharma: 120                                             │
└──────────────────────────────────────────────────────────┘

Result: 120 Medical Affairs JTBDs
- All have "Pharma" blue badges
- All are in Medical Affairs domain
- Grouped by Strategic Pillars (SP01-SP07)
```

---

## User Interaction Flow

```
User lands on page
       ↓
Sees "All Industries" filter (default)
       ↓
Views 135 total use cases
       ↓
Clicks "Digital Health Startups"
       ↓
Filter activates (green background)
       ↓
Page filters to 15 startup use cases
       ↓
Green "Startup" badges appear on cards
       ↓
Statistics update to show only startup counts
       ↓
User can further filter by domain or search
```

---

## Responsive Behavior

### Desktop (> 768px)
```
Industry: [All Industries] [Digital Health Startups] [Pharma & Life Sciences]
          ←─────────────── All buttons in one row ────────────────────────→
```

### Tablet (768px - 1024px)
```
Industry: [All Industries]
          [Digital Health Startups]
          [Pharma & Life Sciences]
          ↑ Buttons stack vertically
```

### Mobile (< 768px)
```
Industry:
[All Industries      ]  ← Full width
[Digital Health Startups]
[Pharma & Life Sciences ]
```

---

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through filter buttons
   - Enter/Space to activate
   - Escape to clear all filters

2. **Screen Reader Support**
   - Button labels clearly state industry
   - Active state announced
   - Count updates announced

3. **Visual Indicators**
   - High contrast badges
   - Clear active state (colored background)
   - Visible focus rings

4. **Touch Targets**
   - Minimum 44px height for buttons
   - Adequate spacing between buttons
   - Large tap areas for mobile

---

## Statistics Panel Examples

### All Industries
```
Showing 135 of 135 use cases
Pharma: 120  |  Digital Health Startup: 15
```

### Startup Filter Active
```
Showing 15 of 135 use cases
Digital Health Startup: 15
```

### Pharma Filter Active
```
Showing 120 of 135 use cases
Pharma: 120
```

### With Search/Domain Filters
```
Showing 10 of 135 use cases (filtered by Pharma + MA domain + "evidence")
Pharma: 10
```

---

## Badge Placement on Cards

```
┌──────────────────────────────────────┐
│  Icon  Title                  [Badge]│ ← Top-right corner
│  ^     ^                       ^     │
│  │     │                       │     │
│  │     └─ Workflow title       │     │
│  │                             │     │
│  └─ Domain icon                │     │
│                                │     │
│  Description text...           │     │
│                                │     │
│  [Code] [Complexity] [More badges]   │
│                                      │
│  Click to view        Execute →     │
└──────────────────────────────────────┘
```

Industry badge is:
- Always visible
- Color-coded (green/blue)
- In top-right corner
- Not obstructing title
- Clearly labeled

---

## Quick Reference

| Filter State | Button Color | Card Badge | Count |
|--------------|--------------|------------|-------|
| All Industries | Default (gray) | Mixed (green/blue) | 135 |
| Digital Health Startups | Green (`bg-green-600`) | Green "Startup" | ~15 |
| Pharma & Life Sciences | Blue (`bg-blue-600`) | Blue "Pharma" | ~120 |

---

**Visual Consistency**: All industry indicators use the same color scheme for instant recognition
**User Clarity**: Large, prominent filter buttons with clear labels
**Data Transparency**: Statistics always visible to show distribution
