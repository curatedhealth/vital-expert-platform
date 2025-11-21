# Loading Skeletons Guide

## Overview

Loading skeleton components provide visual feedback during async operations, improving perceived performance and user experience. Instead of showing spinners or blank screens, skeletons display placeholder content that matches the final layout.

## Benefits

1. **Better UX**: Users see immediate feedback that content is loading
2. **Perceived Performance**: Page feels faster even if load time is the same
3. **Reduced Layout Shift**: Skeleton matches final content layout
4. **Professional Polish**: Consistent loading states across the app
5. **Accessibility**: Screen readers announce loading states

## Implementation

### Location

All skeleton components are in [src/components/ui/loading-skeletons.tsx](../src/components/ui/loading-skeletons.tsx)

### Available Skeletons

## Chat Skeletons

### ChatMessageSkeleton
Shows 3 message placeholders with avatar and text lines.

```typescript
import { ChatMessageSkeleton } from '@/components/ui/loading-skeletons';

<ChatMessageSkeleton />
```

**Use case**: Loading chat history, fetching messages from API

### ChatInputSkeleton
Placeholder for chat input area.

```typescript
import { ChatInputSkeleton } from '@/components/ui/loading-skeletons';

<ChatInputSkeleton />
```

**Use case**: Initializing chat interface

### ChatSidebarSkeleton
Full sidebar with conversation list placeholders.

```typescript
import { ChatSidebarSkeleton } from '@/components/ui/loading-skeletons';

<ChatSidebarSkeleton />
```

**Use case**: Loading conversation history in sidebar

### PromptStartersSkeleton
Grid of 4 prompt starter placeholders.

```typescript
import { PromptStartersSkeleton } from '@/components/ui/loading-skeletons';

<PromptStartersSkeleton />
```

**Use case**: Loading agent-specific prompt starters

## Agent Skeletons

### AgentCardSkeleton
Single agent card placeholder.

```typescript
import { AgentCardSkeleton } from '@/components/ui/loading-skeletons';

<AgentCardSkeleton />
```

**Use case**: Loading individual agent data

### AgentGridSkeleton
Grid of multiple agent cards.

```typescript
import { AgentGridSkeleton } from '@/components/ui/loading-skeletons';

// Show 6 agent cards (default)
<AgentGridSkeleton />

// Show custom number of cards
<AgentGridSkeleton count={9} />
```

**Use case**: Loading agents page, agent browser, agent recommendations

### AgentProfileHeaderSkeleton
Compact agent header with avatar and name.

```typescript
import { AgentProfileHeaderSkeleton } from '@/components/ui/loading-skeletons';

<AgentProfileHeaderSkeleton />
```

**Use case**: Loading agent profile in chat header

### AgentDetailsSkeleton
Full agent details modal content.

```typescript
import { AgentDetailsSkeleton } from '@/components/ui/loading-skeletons';

<AgentDetailsSkeleton />
```

**Use case**: Loading agent details in modal or dedicated page

## Dashboard Skeletons

### DashboardStatSkeleton
Single stat card placeholder.

```typescript
import { DashboardStatSkeleton } from '@/components/ui/loading-skeletons';

<DashboardStatSkeleton />
```

**Use case**: Loading individual metrics

### DashboardStatsGridSkeleton
Grid of stat cards.

```typescript
import { DashboardStatsGridSkeleton } from '@/components/ui/loading-skeletons';

// Show 4 stats (default)
<DashboardStatsGridSkeleton />

// Show custom number
<DashboardStatsGridSkeleton count={6} />
```

**Use case**: Loading dashboard overview metrics

### ChartSkeleton
Placeholder for charts and graphs.

```typescript
import { ChartSkeleton } from '@/components/ui/loading-skeletons';

// Default height (h-64)
<ChartSkeleton />

// Custom height
<ChartSkeleton height="h-96" />
```

**Use case**: Loading analytics charts, usage graphs, performance metrics

## Table Skeletons

### TableRowSkeleton
Single table row placeholder.

```typescript
import { TableRowSkeleton } from '@/components/ui/loading-skeletons';

// 4 columns (default)
<TableRowSkeleton />

// Custom column count
<TableRowSkeleton columns={6} />
```

**Use case**: Loading table data incrementally

### TableSkeleton
Full table with header and rows.

```typescript
import { TableSkeleton } from '@/components/ui/loading-skeletons';

// Default: 5 rows, 4 columns
<TableSkeleton />

// Custom dimensions
<TableSkeleton rows={10} columns={6} />
```

**Use case**: Loading data tables, admin panels, reports

## Form Skeletons

### FormFieldSkeleton
Single form field with label.

```typescript
import { FormFieldSkeleton } from '@/components/ui/loading-skeletons';

<FormFieldSkeleton />
```

**Use case**: Loading individual form fields

### FormSkeleton
Complete form with multiple fields.

```typescript
import { FormSkeleton } from '@/components/ui/loading-skeletons';

// Default: 4 fields
<FormSkeleton />

// Custom field count
<FormSkeleton fields={8} />
```

**Use case**: Loading edit forms, creation forms, settings panels

## List Skeletons

### ListItemSkeleton
Single list item with avatar and text.

```typescript
import { ListItemSkeleton } from '@/components/ui/loading-skeletons';

<ListItemSkeleton />
```

**Use case**: Loading individual list items

### ListSkeleton
Full list with multiple items.

```typescript
import { ListSkeleton } from '@/components/ui/loading-skeletons';

// Default: 5 items
<ListSkeleton />

// Custom item count
<ListSkeleton items={10} />
```

**Use case**: Loading lists, feeds, notifications

## Modal Skeletons

### ModalContentSkeleton
Generic modal content placeholder.

```typescript
import { ModalContentSkeleton } from '@/components/ui/loading-skeletons';

<ModalContentSkeleton />
```

**Use case**: Loading any modal content

## Page Skeletons

### PageSkeleton
Complete page with header, stats, charts, and table.

```typescript
import { PageSkeleton } from '@/components/ui/loading-skeletons';

<PageSkeleton />
```

**Use case**: Loading full dashboard pages

## Utility Skeletons

### TextSkeleton
Multiple lines of text.

```typescript
import { TextSkeleton } from '@/components/ui/loading-skeletons';

// Default: 3 lines
<TextSkeleton />

// Custom line count
<TextSkeleton lines={5} />
```

**Use case**: Loading paragraphs, descriptions, content

### ImageSkeleton
Image placeholder with aspect ratio.

```typescript
import { ImageSkeleton } from '@/components/ui/loading-skeletons';

// Default: video aspect ratio, rounded-lg
<ImageSkeleton />

// Custom aspect ratio and rounding
<ImageSkeleton aspectRatio="aspect-square" rounded="rounded-full" />
```

**Use case**: Loading images, avatars, thumbnails

### ButtonSkeleton
Button placeholder.

```typescript
import { ButtonSkeleton } from '@/components/ui/loading-skeletons';

// Default size
<ButtonSkeleton />

// Custom size
<ButtonSkeleton size="lg" />
```

**Use case**: Loading action buttons

### AvatarWithNameSkeleton
Avatar with name and subtitle.

```typescript
import { AvatarWithNameSkeleton } from '@/components/ui/loading-skeletons';

<AvatarWithNameSkeleton />
```

**Use case**: Loading user profiles, agent profiles

## Usage Patterns

### Pattern 1: Conditional Rendering

```typescript
function MyComponent() {
  const { data, isLoading } = useQuery('agents');

  if (isLoading) {
    return <AgentGridSkeleton count={6} />;
  }

  return <AgentGrid agents={data} />;
}
```

### Pattern 2: With React Suspense

```typescript
import { Suspense } from 'react';
import { AgentGridSkeleton } from '@/components/ui/loading-skeletons';

function AgentsPage() {
  return (
    <Suspense fallback={<AgentGridSkeleton count={9} />}>
      <AgentsGrid />
    </Suspense>
  );
}
```

### Pattern 3: With Lazy Loading

```typescript
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/loading-skeletons';

const LazyChart = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton height="h-96" />
});
```

### Pattern 4: Multiple States

```typescript
function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (error) {
    return <ErrorState error={error} />;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <DashboardStatsGridSkeleton count={4} />
        <ChartSkeleton />
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return <DashboardContent data={data} />;
}
```

## Best Practices

### 1. Match Final Layout

Skeleton should closely match the final content layout:

```typescript
// ✅ Good: Skeleton matches final grid
{isLoading ? (
  <AgentGridSkeleton count={9} />
) : (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
  </div>
)}

// ❌ Bad: Skeleton doesn't match final layout
{isLoading ? (
  <ListSkeleton items={5} />
) : (
  <div className="grid gap-4 md:grid-cols-3">
    {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
  </div>
)}
```

### 2. Use Appropriate Count

Show realistic number of items:

```typescript
// ✅ Good: Shows expected number of items
<AgentGridSkeleton count={9} /> // 3x3 grid

// ❌ Bad: Shows too few items
<AgentGridSkeleton count={2} /> // Looks empty
```

### 3. Compose Multiple Skeletons

Build complex layouts from simple skeletons:

```typescript
function ComplexPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <TextSkeleton lines={1} />
        <ButtonSkeleton />
      </div>
      <DashboardStatsGridSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={10} columns={5} />
    </div>
  );
}
```

### 4. Consider Mobile

Ensure skeletons work on mobile:

```typescript
// ✅ Good: Responsive skeleton
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <AgentGridSkeleton count={6} />
</div>

// Consider showing fewer items on mobile
const skeletonCount = useIsMobile() ? 4 : 9;
<AgentGridSkeleton count={skeletonCount} />
```

### 5. Add Aria Labels

Improve accessibility:

```typescript
<div role="status" aria-label="Loading agents" aria-live="polite">
  <AgentGridSkeleton count={6} />
  <span className="sr-only">Loading agents...</span>
</div>
```

## Performance Considerations

### Keep Skeletons Lightweight

Skeletons should render faster than actual content:

```typescript
// ✅ Good: Simple skeleton
<Skeleton className="h-4 w-full" />

// ❌ Bad: Complex skeleton with animations
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ repeat: Infinity }}
>
  <Skeleton className="h-4 w-full" />
</motion.div>
```

### Avoid Over-Nesting

```typescript
// ✅ Good: Flat structure
<AgentGridSkeleton count={6} />

// ❌ Bad: Deeply nested
<div>
  <div>
    <div>
      <AgentGridSkeleton count={6} />
    </div>
  </div>
</div>
```

## Testing

### Visual Regression Tests

```typescript
describe('AgentGridSkeleton', () => {
  it('matches snapshot', () => {
    const { container } = render(<AgentGridSkeleton count={6} />);
    expect(container).toMatchSnapshot();
  });
});
```

### Accessibility Tests

```typescript
describe('AgentGridSkeleton', () => {
  it('has proper aria labels', () => {
    render(
      <div role="status" aria-label="Loading agents">
        <AgentGridSkeleton count={6} />
      </div>
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading agents');
  });
});
```

## Integration with Lazy Components

Skeletons are integrated with lazy-loaded components in [src/lib/utils/lazy-components.tsx](../src/lib/utils/lazy-components.tsx):

```typescript
export const LazyAgentsBoard = dynamic(
  () => import('@/features/agents/components/agents-board'),
  {
    loading: () => <div className="p-6"><AgentGridSkeleton count={9} /></div>,
    ssr: false,
  }
);
```

## Migration Guide

### Before (Spinner)

```typescript
{isLoading ? (
  <div className="flex justify-center p-12">
    <Spinner />
  </div>
) : (
  <AgentGrid agents={data} />
)}
```

### After (Skeleton)

```typescript
{isLoading ? (
  <AgentGridSkeleton count={9} />
) : (
  <AgentGrid agents={data} />
)}
```

## Troubleshooting

### Skeleton doesn't match final layout

**Solution**: Adjust skeleton props to match your grid/list configuration

```typescript
// If your grid is 4 columns with 12 items
<AgentGridSkeleton count={12} />
```

### Flash of skeleton

**Solution**: Add minimum display time

```typescript
const [showSkeleton, setShowSkeleton] = useState(true);

useEffect(() => {
  if (!isLoading) {
    setTimeout(() => setShowSkeleton(false), 300);
  }
}, [isLoading]);
```

### Skeleton causes layout shift

**Solution**: Ensure skeleton has same dimensions as content

```typescript
// ✅ Good: Same container styles
<div className="grid gap-4 md:grid-cols-3">
  {isLoading ? <AgentGridSkeleton count={6} /> : <AgentGrid />}
</div>
```

## Related Documentation

- [Code Splitting Guide](./CODE_SPLITTING_GUIDE.md)
- [Loading States Best Practices](./LOADING_STATES_BEST_PRACTICES.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

## Component Inventory

Total: 26 skeleton components

**Chat** (4): Message, Input, Sidebar, PromptStarters
**Agents** (4): Card, Grid, ProfileHeader, Details
**Dashboard** (3): Stat, StatsGrid, Chart
**Tables** (2): Row, Table
**Forms** (2): Field, Form
**Lists** (2): Item, List
**Modals** (1): Content
**Pages** (1): Page
**Utilities** (7): Text, Image, Button, AvatarWithName

## Next Steps

1. ✅ Create skeleton components library (Complete)
2. ✅ Integrate with lazy loading (Complete)
3. Add skeleton components to agents page
4. Add skeleton components to dashboard
5. Add skeleton components to admin panels
6. Run visual regression tests
7. Measure perceived performance improvements
