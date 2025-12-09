# @vital/ai-ui

VITAL AI UI Component Library - Shared components for AI-powered healthcare applications.

## Overview

A comprehensive 39-component library designed for the VITAL platform with:

- **Vercel AI SDK** integration for streaming and generative UI
- **Streamdown** for jitter-free markdown streaming
- **TypeScript** first with complete type definitions
- **Tailwind CSS** styling with shadcn/ui patterns

## Installation

```bash
npm install @vital/ai-ui
# or
pnpm add @vital/ai-ui
```

## Usage

### Import all components

```tsx
import { 
  VitalMessage, 
  VitalThinking, 
  VitalFusionExplanation,
  useAskExpert 
} from '@vital/ai-ui';
```

### Import specific domains

```tsx
// Conversation components
import { VitalMessage, VitalStreamText, VitalPromptInput } from '@vital/ai-ui/conversation';

// Reasoning & Evidence
import { VitalThinking, VitalCitation, VitalDelegationTrace } from '@vital/ai-ui/reasoning';

// Fusion Intelligence
import { VitalFusionExplanation, VitalRetrieverResults } from '@vital/ai-ui/fusion';

// Hooks
import { useAskExpert, useExpertCompletion } from '@vital/ai-ui/hooks';
```

## Component Domains

| Domain | Components | Description |
|--------|------------|-------------|
| A: Conversation | 6 | Chat interface, messages, input |
| B: Reasoning | 7 | Thinking, citations, evidence, delegation |
| C: Workflow | 6 | Checkpoints, progress, cost, approval |
| D: Data | 2 | Tables, metrics |
| E: Documents | 5 | Preview, artifacts, downloads |
| F: Agents | 2 | Agent cards, teams |
| G: Layout | 6 | Sidebar, panels, layouts |
| H: Fusion | 5 | RRF, decisions, retrievers |

## Key Components

### VitalStreamText
Jitter-free streaming markdown using Streamdown.

```tsx
<VitalStreamText 
  content={streamingContent}
  isStreaming={true}
/>
```

### VitalFusionExplanation
Visualize Fusion Intelligence team selection evidence.

```tsx
<VitalFusionExplanation 
  evidence={fusionEvidence}
  selectedExperts={experts}
  reasoning={l1Reasoning}
/>
```

### useAskExpert Hook
Vercel AI SDK integration for the 4-Mode system.

```tsx
const { 
  messages, 
  askExpert, 
  isLoading, 
  currentAgent,
  fusionEvidence 
} = useAskExpert({
  mode: 1,
  tenantId: 'tenant-123',
});
```

## Shared Across Services

This package is designed to be shared across all VITAL services:

- Ask Expert
- Ask Panel
- Admin Dashboard
- Knowledge Graph
- Value Framework

## Dependencies

- `ai` - Vercel AI SDK
- `@ai-sdk/react` - React hooks for AI SDK
- `streamdown` - Jitter-free markdown streaming
- `lucide-react` - Icons
- `tailwind-merge` - Tailwind class merging

## License

PROPRIETARY - VITAL Platform
