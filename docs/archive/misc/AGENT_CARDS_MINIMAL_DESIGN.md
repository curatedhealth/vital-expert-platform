# Agent Cards - Minimal Design Implementation

## Overview
Enhanced the Tool Detail Modal's Agents tab to display actual agents from the database as minimal, professional agent cards with proper avatar handling, expertise tags, and improved UX.

## Changes Implemented

### 1. Enhanced Agent Interface
Updated the `Agent` interface to match the full Supabase schema:

```typescript
interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  is_active: boolean;
  avatar?: string;
  icon?: string;
  role?: string;
  expertise?: string[];
  specialties?: string[];
  metadata?: {
    avatar?: string;
    display_name?: string;
    [key: string]: any;
  };
}
```

### 2. Enhanced Data Loading
Updated `loadAgents` to fetch complete agent data:

```typescript
const { data, error } = await supabase
  .from('agents')
  .select('id, name, title, description, is_active, slug, expertise, specialties, metadata')
  .eq('is_active', true)
  .order('name');
```

### 3. Display Name Helper
Created utility to prioritize display names:

```typescript
const getDisplayName = (agent: Agent) => {
  return agent.metadata?.display_name || agent.title || agent.name;
};
```

### 4. Avatar Path Handler
Implemented flexible avatar path resolution:

```typescript
const getAvatarPath = (agent: Agent) => {
  const avatar = agent.metadata?.avatar;
  if (!avatar) return null;
  
  // Handle different avatar formats
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('avatar')) {
    return `/avatars/${avatar}.png`;
  }
  return null;
};
```

### 5. Minimal Agent Card Design

#### Layout
- **2-column grid** on medium+ screens
- **Compact card design** with hover effects
- **Selected state** with blue ring and background
- **Clickable cards** for easy selection

#### Card Components
1. **Avatar Section (Left)**
   - 48x48px circular avatar
   - Color-coded background based on name
   - Shows: Image → Initials → Fallback
   - Automatic fallback on image load error

2. **Info Section (Center)**
   - **Display Name** (bold, single line with ellipsis)
   - **Title** (if different from display name)
   - **Description** (2 lines max with ellipsis)
   - **Expertise Tags** (first 3 + count badge)

3. **Toggle Section (Right)**
   - Switch component for selection
   - Prevents event bubbling to card

#### Visual Features
- **Selection State**:
  - Blue ring (2px)
  - Light blue background
  - Blue border
  
- **Hover State**:
  - Shadow elevation
  - Border color change
  
- **Expertise Badges**:
  - Shows first 3 expertise areas
  - "+N" badge for remaining items
  - Secondary variant styling

## User Experience

### Selection Behavior
1. **Click Card**: Toggles selection
2. **Click Switch**: Toggles selection (event doesn't bubble)
3. **Visual Feedback**: Immediate ring and background change
4. **Counter**: Shows "X of Y selected" in header

### Information Hierarchy
1. **Primary**: Display Name + Avatar
2. **Secondary**: Title (if different)
3. **Tertiary**: Description
4. **Tags**: Expertise areas

### Empty State
- Shows "No active agents found" message
- Centered with icon
- Muted styling

## Technical Features

### Avatar Fallback Chain
1. **Image from metadata**: `agent.metadata.avatar`
2. **Initials**: First letters of display name
3. **Error Handling**: Falls back to initials on load error

### Display Name Priority
1. `metadata.display_name`
2. `title`
3. `name`

### Responsive Design
- **Mobile**: Single column
- **Medium+**: 2 columns
- **All sizes**: Maintains readability

### Performance
- **Efficient rendering**: Only loads active agents
- **Lazy loading**: Avatar images load as needed
- **Error boundaries**: Graceful fallback on errors

## Sample Agent Data
Based on actual Supabase data:

```json
{
  "id": "63990464-b89e-4de6-8ab8-d8d95a02ddbf",
  "name": "risk_management_plan_developer",
  "title": "Risk Management & Pharmacovigilance Planning Expert",
  "description": "Expert in developing Risk Management Plans...",
  "expertise": [
    "Risk Management Plans",
    "REMS",
    "Pharmacovigilance",
    "Safety Planning",
    "Benefit-Risk Assessment"
  ],
  "specialties": [
    "Digital Health Safety",
    "Algorithm Error Detection",
    "Cybersecurity Risk"
  ],
  "metadata": {
    "avatar": "avatar_png_0113",
    "display_name": "Risk Management Plan Developer"
  }
}
```

## Files Modified
- `apps/digital-health-startup/src/components/tools/ToolDetailModal.tsx`
  - Enhanced Agent interface
  - Updated loadAgents function
  - Added display name and avatar helpers
  - Redesigned Agents tab with card grid
  - Improved selection UX

## Styling Details

### Card States
```typescript
// Default
hover:shadow-md hover:border-gray-300

// Selected
ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-500
```

### Avatar Colors
```typescript
const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500',
];
```

### Typography
- **Display Name**: font-semibold, text-sm
- **Title**: text-xs, text-gray-600
- **Description**: text-xs, text-muted-foreground
- **Badges**: text-xs, px-2, py-0

## Benefits

### For Users
✅ **Cleaner interface** - Cards are more compact and scannable
✅ **Better context** - See expertise at a glance
✅ **Faster selection** - Click anywhere on card
✅ **Visual clarity** - Clear selected state

### For Developers
✅ **Real data** - Fetches from actual agent store
✅ **Flexible avatars** - Handles multiple formats
✅ **Maintainable** - Clear helper functions
✅ **Responsive** - Works on all screen sizes

## Future Enhancements

### Potential Additions
1. **Search/Filter**: Add search bar for large agent lists
2. **Sorting**: Sort by name, expertise, etc.
3. **Agent Details**: Quick view modal on hover
4. **Bulk Actions**: Select all / deselect all
5. **Groups**: Group agents by category or role
6. **Statistics**: Show usage stats per agent

### Performance Optimizations
1. **Virtualization**: For very large agent lists
2. **Pagination**: Load agents in chunks
3. **Caching**: Cache agent data with SWR
4. **Optimistic Updates**: Update UI before API response

## Testing Checklist

- [x] Agents load from Supabase
- [x] Display names show correctly
- [x] Avatars fall back to initials
- [x] Card selection works
- [x] Switch toggle works
- [x] Expertise badges display
- [x] Counter updates
- [x] Empty state shows
- [x] Responsive grid works
- [x] TypeScript types are correct

## Documentation Updated
- Created: `AGENT_CARDS_MINIMAL_DESIGN.md`

---

**Status**: ✅ Complete
**Date**: November 4, 2025
**Component**: Tool Detail Modal - Agents Tab
**Impact**: Enhanced UX, Real Data Integration, Professional Design

