# @vital/ai-components

Shared AI components for VITAL platform.

## Overview

This package contains reusable AI components used across all VITAL services:
- **Ask Expert** (Mode 1, 2, 3, 4)
- **Ask Panel**
- **Pharma Intelligence**
- Any other service needing AI UI components

## Installation

```bash
# From workspace root
pnpm install
```

## Components

### KeyInsights

Extracts and displays actionable insights from AI responses.

```tsx
import { KeyInsights } from '@vital/ai-components';

<KeyInsights 
  content="AI response text with **bold insights**"
  isStreaming={false}
/>
```

**Features:**
- Extracts bullet points with bold headers
- Identifies actionable insight markers
- Proper markdown rendering (bold, formatting)
- Dark mode support
- Animated appearance

### References

Displays Chicago-style references with metadata.

```tsx
import { References } from '@vital/ai-components';

<References 
  sources={[
    {
      id: '1',
      title: 'FDA Guidance',
      url: 'https://fda.gov/...',
      organization: 'FDA',
      sourceType: 'fda_guidance',
      similarity: 0.95
    }
  ]}
  onSourceClick={(id) => console.log('Clicked:', id)}
/>
```

**Features:**
- Chicago citation format
- Clickable hyperlinks
- Source type badges
- Similarity scores
- Excerpt preview
- Scroll-to-source functionality

## Hooks

### useKeyInsights

Extract insights without rendering.

```tsx
import { useKeyInsights } from '@vital/ai-components';

const insights = useKeyInsights(content);
// Returns: string[]
```

### useSourceScroll

Scroll to specific sources.

```tsx
import { useSourceScroll } from '@vital/ai-components';

const { sourceRefs, scrollToSource } = useSourceScroll();

scrollToSource('source-id');
```

## Types

```tsx
import type { Source, KeyInsightsProps, ReferencesProps } from '@vital/ai-components';
```

## Development

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Benefits

- ✅ **Fix once, use everywhere** - Update one component, all services get the fix
- ✅ **Consistent UX** - Same look and feel across all modes
- ✅ **Easy testing** - Test components independently
- ✅ **Fast development** - Import and use, no need to rebuild

## Tags

- `TAG: SHARED_AI_COMPONENTS_PACKAGE`
- `TAG: KEY_INSIGHTS_SHARED_COMPONENT`
- `TAG: REFERENCES_SHARED_COMPONENT`

