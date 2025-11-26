# Agent Store Redesign - Production-Grade Specification
## AgentOS 3.0 Five-Level Hierarchy Implementation

**Version**: 2.0
**Status**: Design & Planning Phase
**Target**: Full-Featured Production Implementation
**Timeline**: 10 weeks (5 phases)

---

## ⚠️ IMPORTANT: Multi-Tenant Architecture

**This UI serves a multi-tenant platform where agents are SHARED RESOURCES.**

Before implementing, read:
- **[Multi-Tenant Architecture Guide](./MULTI_TENANT_ARCHITECTURE.md)** - Required reading for all developers
- **[Project Structure Guide](../../PROJECT_STRUCTURE.md)** - Code and documentation organization

### Key Multi-Tenant Principles

1. **Agents are Shared** - One agent serves multiple tenants via junction table (`tenant_agents`)
2. **RLS Enforcement** - Database-level security filters agents per tenant automatically
3. **Tenant Context** - UI must respect tenant isolation (no hardcoded tenant filtering)
4. **Vital System = Super Admin** - Sees all 489 agents; other tenants see assigned agents only
5. **Status Filtering** - Regular tenants see only `active` and `testing` agents

**Code Location**: `/apps/vital-system/src/features/agents/` (shared feature module)
**Documentation**: `.claude/docs/platform/agents/` (centralized docs)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Design System](#design-system)
4. [Information Architecture](#information-architecture)
5. [Component Specifications](#component-specifications)
6. [Multi-Phase Implementation Plan](#multi-phase-implementation-plan)
7. [Technical Standards](#technical-standards)
8. [Testing Strategy](#testing-strategy)
9. [Performance Requirements](#performance-requirements)
10. [Accessibility Standards](#accessibility-standards)

---

## Executive Summary

The Agent Store redesign transforms a flat, tier-based catalog into an intelligent hierarchical browser that educates users about AgentOS 3.0's spawning model while maintaining exceptional UX. This is **NOT an MVP** - this is a production-grade implementation following industry best practices.

### Key Objectives
- **Education First**: Users understand the 5-level hierarchy intuitively
- **Performance**: Handle 500+ agents with <100ms interaction latency
- **Accessibility**: WCAG 2.1 AA compliance minimum (targeting AAA)
- **Scalability**: Architecture supports 10,000+ agents
- **Multi-Tenant**: Proper RLS enforcement with tenant isolation

### Current State vs. Target State

| Aspect | Current | Target |
|--------|---------|--------|
| **Architecture** | Flat tier-based (3 tiers) | Hierarchical 5-level system |
| **Agent Count** | 489 agents | 489 agents (5 levels) |
| **Visualization** | Grid view only | Grid + Tree + Graph views |
| **Filtering** | Basic tier filter | Multi-dimensional filtering |
| **Performance** | Unoptimized | <100ms interactions, virtualized |
| **Accessibility** | Basic | WCAG 2.1 AA+ compliant |
| **Testing** | Manual | 80%+ automated coverage |

---

## Design Philosophy

### 1. Progressive Disclosure
- **Level 1 (Default)**: Clean grid with essential info (name, level, function)
- **Level 2 (Hover)**: Additional metadata (role, department, spawning capability)
- **Level 3 (Click)**: Full detail modal with all attributes and relationships
- **Level 4 (Advanced)**: Hierarchy tree and graph visualizations

### 2. Cognitive Load Reduction
- **Color Coding**: Consistent level colors throughout UI
  - **Master (L1)**: Purple (#8B5CF6) - Power and orchestration
  - **Expert (L2)**: Blue (#3B82F6) - Trust and expertise
  - **Specialist (L3)**: Green (#10B981) - Growth and specialization
  - **Worker (L4)**: Orange (#F59E0B) - Action and execution
  - **Tool (L5)**: Gray (#6B7280) - Utility and integration

- **Visual Hierarchy**: Level badge → Agent name → Function → Details
- **Spawning Indicators**: Clear parent→child relationship visualization

### 3. Performance First
- **Virtual Scrolling**: Only render visible agents
- **Optimistic Updates**: Instant UI feedback
- **Incremental Loading**: Load on demand, cache aggressively
- **Debounced Search**: 300ms debounce with instant local filtering

### 4. Accessibility By Design
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Readers**: Proper ARIA labels and live regions
- **Focus Management**: Clear focus indicators, skip links
- **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI elements

---

## Design System

### Color Tokens

```typescript
// Level Colors (Primary)
export const LEVEL_COLORS = {
  1: { base: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrast: '#FFFFFF' },
  2: { base: '#3B82F6', light: '#60A5FA', dark: '#2563EB', contrast: '#FFFFFF' },
  3: { base: '#10B981', light: '#34D399', dark: '#059669', contrast: '#FFFFFF' },
  4: { base: '#F59E0B', light: '#FBBF24', dark: '#D97706', contrast: '#000000' },
  5: { base: '#6B7280', light: '#9CA3AF', dark: '#4B5563', contrast: '#FFFFFF' },
} as const;

// Semantic Colors
export const SEMANTIC_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds
  bg: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },

  // Borders
  border: {
    default: '#E5E7EB',
    hover: '#D1D5DB',
    focus: '#3B82F6',
    error: '#EF4444',
  },
} as const;

// Spacing Scale (8px base)
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  display: { size: '3rem', weight: 700, lineHeight: 1.2 },
  h1: { size: '2.25rem', weight: 700, lineHeight: 1.2 },
  h2: { size: '1.875rem', weight: 600, lineHeight: 1.3 },
  h3: { size: '1.5rem', weight: 600, lineHeight: 1.4 },
  h4: { size: '1.25rem', weight: 600, lineHeight: 1.5 },
  body: { size: '1rem', weight: 400, lineHeight: 1.6 },
  small: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  tiny: { size: '0.75rem', weight: 400, lineHeight: 1.4 },
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Animation Timings
export const TRANSITIONS = {
  fast: '150ms',
  base: '250ms',
  slow: '350ms',
  slower: '500ms',
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;
```

### Responsive Breakpoints

```typescript
export const BREAKPOINTS = {
  xs: '320px',   // Mobile portrait
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
} as const;

// Grid Columns per Breakpoint
export const GRID_COLUMNS = {
  xs: 1,   // 1 column on mobile
  sm: 2,   // 2 columns on large mobile
  md: 3,   // 3 columns on tablet
  lg: 4,   // 4 columns on desktop
  xl: 5,   // 5 columns on large desktop
  '2xl': 6, // 6 columns on XL screens
} as const;
```

---

## Information Architecture

### View Hierarchy

```
Agent Store Root
├── Primary View: Level-Based Grid (Default)
│   ├── Filter Bar
│   │   ├── Level Filters (L1-L5)
│   │   ├── Function Filters
│   │   ├── Department Filters
│   │   ├── Status Filters
│   │   └── Search Input
│   ├── Sort Controls
│   │   ├── Name (A-Z, Z-A)
│   │   ├── Level (1-5, 5-1)
│   │   ├── Recent (Newest, Oldest)
│   │   └── Usage (Most, Least)
│   ├── View Toggle
│   │   ├── Grid View (Active)
│   │   ├── Tree View
│   │   └── Graph View
│   └── Agent Grid
│       ├── Agent Card (Component)
│       │   ├── Level Badge
│       │   ├── Avatar
│       │   ├── Name & Title
│       │   ├── Function & Department
│       │   ├── Spawning Indicator
│       │   └── Quick Actions
│       └── Infinite Scroll / Pagination
│
├── Secondary View: Hierarchy Tree
│   ├── Collapsible Level Sections
│   │   ├── Master Agents (L1)
│   │   │   └── Can spawn: Expert, Specialist, Worker, Tool
│   │   ├── Expert Agents (L2)
│   │   │   └── Can spawn: Specialist, Worker, Tool
│   │   ├── Specialist Agents (L3)
│   │   │   └── Can spawn: Worker, Tool
│   │   ├── Worker Agents (L4)
│   │   │   └── Can spawn: Tool
│   │   └── Tool Agents (L5)
│   │       └── Cannot spawn
│   └── Drag-to-Compose (Future)
│
├── Advanced View: Knowledge Graph
│   ├── Force-Directed Graph
│   ├── Level Clustering
│   ├── Spawning Edges (Directed)
│   └── Interactive Exploration
│
└── Agent Detail Modal
    ├── Header
    │   ├── Avatar & Name
    │   ├── Level Badge
    │   └── Status Indicator
    ├── Tabs
    │   ├── Overview
    │   │   ├── Description
    │   │   ├── System Prompt Preview
    │   │   ├── Capabilities
    │   │   └── Metadata
    │   ├── Hierarchy
    │   │   ├── Level Details
    │   │   ├── Spawning Rules
    │   │   ├── Can Spawn (Links)
    │   │   └── Spawned By (Links)
    │   ├── Configuration
    │   │   ├── Model Details
    │   │   ├── Temperature & Tokens
    │   │   ├── Tools & Integrations
    │   │   └── Knowledge Domains
    │   ├── Performance (if available)
    │   │   ├── Usage Stats
    │   │   ├── Success Rate
    │   │   ├── Avg Response Time
    │   │   └── Cost Metrics
    │   └── Relationships
    │       ├── Function & Department
    │       ├── Role Mapping
    │       ├── Related Agents
    │       └── Tenant Access
    └── Actions
        ├── Use Agent (Mode 1)
        ├── Edit Agent (Admin)
        ├── Clone Agent
        └── View in Graph
```

### URL State Management

```typescript
// Query Parameters for Deep Linking
interface AgentStoreURLState {
  view?: 'grid' | 'tree' | 'graph';
  levels?: string; // Comma-separated: "1,2,3"
  functions?: string; // Comma-separated
  departments?: string;
  status?: 'active' | 'development' | 'inactive' | 'all';
  search?: string;
  sort?: 'name-asc' | 'name-desc' | 'level-asc' | 'level-desc' | 'recent' | 'usage';
  agent?: string; // Agent ID for modal
  page?: number;
}

// Example URLs:
// /agents?view=grid&levels=1,2&status=active&sort=name-asc
// /agents?view=tree&functions=medical-affairs&search=pharmacist
// /agents?agent=agent-123 (opens modal)
```

---

## Component Specifications

### 1. AgentCard Component

**Purpose**: Display agent in grid view with essential info and quick actions

```typescript
interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  onQuickAction?: (agent: Agent, action: string) => void;
  view?: 'compact' | 'comfortable' | 'detailed';
  showSpawningIndicator?: boolean;
  highlightQuery?: string;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  title?: string;
  tagline?: string;
  description: string;
  avatar_url?: string;
  avatar_description?: string;

  // Hierarchy
  agent_level_id: string;
  agent_levels: AgentLevel;

  // Organization
  function_name?: string;
  department_name?: string;
  role_name?: string;

  // Configuration
  base_model: string;
  temperature: number;
  max_tokens: number;
  communication_style?: string;

  // Status
  status: 'active' | 'development' | 'inactive' | 'testing';

  // Metadata
  expertise_level?: string;
  system_prompt?: string;
  metadata?: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

interface AgentLevel {
  id: string;
  name: string; // "Master", "Expert", "Specialist", "Worker", "Tool"
  slug: string;
  level_number: number; // 1-5
  description: string;
  can_spawn_lower_levels: boolean;
  can_spawn_specialists: boolean;
  can_spawn_workers: boolean;
  can_spawn_tools: boolean;
  max_spawned_agents?: number;
}
```

**Visual Specification**:
```
┌─────────────────────────────────────┐
│ [L1]                    [●] Status  │ ← Level Badge + Status Dot
│  ⬡                                  │ ← Avatar (64x64)
│ Agent Name                          │ ← H3, truncate
│ Short descriptive title             │ ← Caption, gray
│                                     │
│ 📊 Function Name                    │ ← Icon + Function
│ 🏛️  Department Name                 │ ← Icon + Department
│                                     │
│ ⚡ Can spawn: L2, L3, L4, L5        │ ← Spawning indicator
│                                     │
│ [Use Agent] [More ⋮]                │ ← Actions
└─────────────────────────────────────┘

States:
- Default: Base colors, shadow-sm
- Hover: Lift (shadow-md), border color matches level
- Active/Selected: Border-2 in level color, shadow-lg
- Disabled: Opacity 50%, no hover effects
```

**Implementation Requirements**:
- Virtual scrolling compatible (fixed height: 320px comfortable, 240px compact)
- Keyboard navigable (Tab, Enter to select, Arrow keys for navigation)
- Accessible (proper ARIA labels, role="article")
- Search highlight support (mark.js or custom)
- Optimistic loading states

### 2. LevelFilterBar Component

```typescript
interface LevelFilterBarProps {
  selectedLevels: number[];
  onLevelToggle: (level: number) => void;
  agentCounts: Record<number, number>; // Level → Count
  showCounts?: boolean;
  orientation?: 'horizontal' | 'vertical';
}
```

**Visual Specification**:
```
┌──────────────────────────────────────────────────────────┐
│ Filter by Level:                                         │
│ [L1: Master (24)] [L2: Expert (110)] [L3: Specialist...│ ← Pills
│                                                          │
│ ✓ Selected  ○ Unselected                                │
└──────────────────────────────────────────────────────────┘
```

**Behavior**:
- Click to toggle level
- Multi-select enabled (can select multiple levels)
- Show agent count per level
- Color matches level color (see LEVEL_COLORS)
- Keyboard: Arrow keys to navigate, Space/Enter to toggle
- Clear All / Select All buttons

### 3. AgentDetailModal Component

```typescript
interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onUseAgent?: (agent: Agent) => void;
  onEditAgent?: (agent: Agent) => void;
  defaultTab?: 'overview' | 'hierarchy' | 'configuration' | 'performance' | 'relationships';
}
```

**Visual Specification**:
```
┌─────────────────────────────────────────────────────────┐
│  Agent Details                              [✕ Close]   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [L2]  ⬡  Agent Name                             │   │
│  │           Expert Level - Medical Affairs        │   │
│  │           Status: ● Active                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Overview] [Hierarchy] [Configuration] [Performance]  │ ← Tabs
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TAB CONTENT AREA                                │   │
│  │                                                 │   │
│  │ (Scrollable content based on active tab)       │   │
│  │                                                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Use Agent]  [Edit Agent]  [Clone]  [View in Graph]  │ ← Actions
└─────────────────────────────────────────────────────────┘
```

**Tab Content Specifications**:

**Overview Tab**:
- Full description (markdown support)
- System prompt (code block, collapsible)
- Capabilities list (badges)
- Key metadata (model, temperature, tokens)

**Hierarchy Tab**:
- Level details card
- Spawning rules visualization
- "Can Spawn" section with linked agent cards (clickable to navigate)
- "Spawned By" section (if applicable)

**Configuration Tab**:
- Model details table
- Temperature, max_tokens, context_window
- Tools list with integration status
- Knowledge domains list

**Performance Tab** (if data available):
- Usage metrics (chart)
- Success rate gauge
- Average response time
- Cost per query

**Relationships Tab**:
- Organization tree (Function → Department → Role)
- Related agents (same function/department)
- Tenant access list
- Dependencies (tools, knowledge domains)

### 4. HierarchyTreeView Component

```typescript
interface HierarchyTreeViewProps {
  agents: Agent[];
  expandedLevels?: number[];
  onAgentSelect: (agent: Agent) => void;
  onLevelToggle: (level: number) => void;
  showSpawningLines?: boolean;
}
```

**Visual Specification**:
```
┌──────────────────────────────────────────────────────┐
│ Agent Hierarchy Tree                                 │
│                                                      │
│ ▼ Level 1: Master Agents (24)                       │
│   ├─ ⬡ Master Agent 1                               │
│   │  └─ Can spawn: L2, L3, L4, L5                   │
│   ├─ ⬡ Master Agent 2                               │
│   └─ ⬡ Master Agent 3                               │
│                                                      │
│ ▼ Level 2: Expert Agents (110)                      │
│   ├─ ⬡ Expert Agent 1                               │
│   │  └─ Can spawn: L3, L4, L5                       │
│   └─ [+89 more...]                                  │
│                                                      │
│ ▶ Level 3: Specialist Agents (266)                  │
│ ▶ Level 4: Worker Agents (39)                       │
│ ▶ Level 5: Tool Agents (50)                         │
└──────────────────────────────────────────────────────┘
```

**Behavior**:
- Collapsible level sections
- Virtual scrolling for large agent lists
- Drag-and-drop to compose workflows (future)
- Keyboard navigation (Arrow keys, Enter to expand/collapse)
- Search highlights matching agents

### 5. SearchInput Component

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  showSuggestions?: boolean;
  suggestions?: SearchSuggestion[];
}

interface SearchSuggestion {
  type: 'agent' | 'function' | 'department' | 'level';
  label: string;
  value: string;
  count?: number;
}
```

**Features**:
- 300ms debounce for API calls
- Instant local filtering for <500 agents
- Fuzzy matching support (Fuse.js)
- Autocomplete suggestions
- Search history (localStorage)
- Keyboard shortcuts (Cmd/Ctrl + K to focus)
- Search across: name, title, description, function, department, role

---

## Multi-Phase Implementation Plan

### Phase 1: Foundation & Design System (Weeks 1-2)

**Objectives**:
- Establish design system with full type safety
- Set up component library infrastructure
- Implement base components with accessibility
- Configure testing and Storybook

**Deliverables**:

#### Week 1: Design System Setup
```typescript
// 1.1 Create design tokens package
// apps/vital-system/src/design-system/tokens/index.ts
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './transitions';

// 1.2 Create theme provider
// apps/vital-system/src/design-system/ThemeProvider.tsx
import { createContext, useContext } from 'react';

export const ThemeProvider = ({ children }) => {
  // Theme context implementation
};

// 1.3 Set up Storybook
// .storybook/main.ts
// .storybook/preview.ts

// 1.4 Create base components
// - Button (with all variants)
// - Badge
// - Card
// - Input
// - Select
// - Modal
// - Tooltip
// - Skeleton

// 1.5 Document components in Storybook
// Each component gets:
// - Default story
// - All variants story
// - Interactive controls
// - Accessibility tests
```

#### Week 2: Core Infrastructure
```typescript
// 2.1 Set up testing infrastructure
// - Jest configuration
// - React Testing Library
// - MSW for API mocking
// - Test utilities

// 2.2 Create agent service layer
// apps/vital-system/src/services/agent-service.ts
export class AgentService {
  async getAgents(filters: AgentFilters): Promise<Agent[]>
  async getAgentById(id: string): Promise<Agent>
  async searchAgents(query: string): Promise<Agent[]>
  async getAgentsByLevel(level: number): Promise<Agent[]>
  async getSpawnableAgents(parentId: string): Promise<Agent[]>
}

// 2.3 Set up state management
// Using Zustand for simplicity and performance
// apps/vital-system/src/stores/agent-store.ts
interface AgentStore {
  agents: Agent[];
  selectedLevels: number[];
  selectedFunctions: string[];
  selectedDepartments: string[];
  searchQuery: string;
  sortBy: SortOption;
  viewMode: ViewMode;

  // Actions
  setAgents: (agents: Agent[]) => void;
  toggleLevel: (level: number) => void;
  setSearchQuery: (query: string) => void;
  // ... more actions

  // Computed
  filteredAgents: () => Agent[];
  agentCountsByLevel: () => Record<number, number>;
}

// 2.4 Create custom hooks
// apps/vital-system/src/hooks/useAgents.ts
export function useAgents(filters?: AgentFilters) {
  // Fetch, cache, and manage agent data
}

// apps/vital-system/src/hooks/useAgentSearch.ts
export function useAgentSearch(query: string) {
  // Debounced search with fuzzy matching
}

// 2.5 Set up performance monitoring
// - React DevTools Profiler
// - Web Vitals tracking
// - Custom performance marks
```

**Acceptance Criteria**:
- [ ] All design tokens defined and typed
- [ ] 8+ base components in Storybook with documentation
- [ ] Theme provider implemented and working
- [ ] Testing infrastructure set up (Jest + RTL)
- [ ] Agent service layer complete with TypeScript types
- [ ] State management configured (Zustand)
- [ ] Performance monitoring configured
- [ ] All components pass accessibility audit (axe-core)

**Testing Checklist**:
- [ ] Unit tests for design tokens
- [ ] Unit tests for all base components
- [ ] Integration tests for theme switching
- [ ] Accessibility tests for all components (WCAG 2.1 AA)

---

### Phase 2: Core Features (Weeks 3-4)

**Objectives**:
- Implement level-based grid view
- Build filtering and search
- Create agent detail modal
- Add sorting and view controls

**Deliverables**:

#### Week 3: Grid View & Filtering
```typescript
// 3.1 Create AgentCard component
// apps/vital-system/src/features/agents/components/AgentCard.tsx
export const AgentCard = ({ agent, onSelect, view = 'comfortable' }: AgentCardProps) => {
  // Implementation with:
  // - Level badge with color coding
  // - Avatar with fallback
  // - Name with highlight support
  // - Function/Department display
  // - Spawning indicator
  // - Quick actions menu
  // - Hover effects
  // - Keyboard navigation
};

// 3.2 Create AgentGrid component with virtualization
// apps/vital-system/src/features/agents/components/AgentGrid.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const AgentGrid = ({ agents, onAgentSelect }: AgentGridProps) => {
  // Virtual scrolling for performance
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(agents.length / columnsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 5,
  });

  // Render only visible rows
};

// 3.3 Create LevelFilterBar component
// apps/vital-system/src/features/agents/components/LevelFilterBar.tsx
export const LevelFilterBar = ({
  selectedLevels,
  onLevelToggle,
  agentCounts
}: LevelFilterBarProps) => {
  // Multi-select level filter with counts
};

// 3.4 Create FunctionFilterSelect component
// apps/vital-system/src/features/agents/components/FunctionFilterSelect.tsx
export const FunctionFilterSelect = ({ ... }: FunctionFilterSelectProps) => {
  // Multi-select dropdown for functions
};

// 3.5 Create SearchInput component with debounce
// apps/vital-system/src/features/agents/components/SearchInput.tsx
export const SearchInput = ({
  value,
  onChange,
  debounceMs = 300
}: SearchInputProps) => {
  // Debounced search with autocomplete
  const debouncedOnChange = useMemo(
    () => debounce(onChange, debounceMs),
    [onChange, debounceMs]
  );
};
```

#### Week 4: Agent Detail Modal
```typescript
// 4.1 Create AgentDetailModal component
// apps/vital-system/src/features/agents/components/AgentDetailModal.tsx
export const AgentDetailModal = ({
  agent,
  isOpen,
  onClose,
  defaultTab = 'overview'
}: AgentDetailModalProps) => {
  // Tab-based modal with:
  // - Overview tab
  // - Hierarchy tab
  // - Configuration tab
  // - Performance tab (if available)
  // - Relationships tab

  // Features:
  // - Keyboard shortcuts (Esc to close)
  // - Focus trap
  // - Scroll lock on body
  // - Transition animations
};

// 4.2 Create tab content components
// - OverviewTab.tsx
// - HierarchyTab.tsx
// - ConfigurationTab.tsx
// - PerformanceTab.tsx
// - RelationshipsTab.tsx

// 4.3 Create SpawningRulesVisualizer component
// apps/vital-system/src/features/agents/components/SpawningRulesVisualizer.tsx
export const SpawningRulesVisualizer = ({
  agent
}: SpawningRulesVisualizerProps) => {
  // Visual diagram showing:
  // - Current agent level
  // - What it can spawn
  // - What spawned it (if applicable)
  // - Spawning limits
};

// 4.4 Create RelatedAgentsSection component
// apps/vital-system/src/features/agents/components/RelatedAgentsSection.tsx
export const RelatedAgentsSection = ({
  agent,
  onAgentSelect
}: RelatedAgentsSectionProps) => {
  // Show related agents:
  // - Same function
  // - Same department
  // - Same level
  // - Spawnable agents
};

// 4.5 Add sorting controls
// apps/vital-system/src/features/agents/components/SortControls.tsx
export const SortControls = ({
  sortBy,
  onSortChange
}: SortControlsProps) => {
  // Dropdown with sort options:
  // - Name (A-Z, Z-A)
  // - Level (1-5, 5-1)
  // - Recent (Newest, Oldest)
  // - Usage (Most, Least) - if available
};
```

**Acceptance Criteria**:
- [ ] AgentCard component complete with all features
- [ ] Virtual scrolling working with 500+ agents (<100ms scroll)
- [ ] Level filtering working with multi-select
- [ ] Function/Department filtering working
- [ ] Search working with 300ms debounce
- [ ] Agent detail modal complete with all tabs
- [ ] Spawning rules visualizer working
- [ ] Related agents section working
- [ ] Sorting working for all options
- [ ] All components keyboard accessible
- [ ] All components screen reader compatible

**Testing Checklist**:
- [ ] Unit tests for AgentCard (all views)
- [ ] Unit tests for filtering logic
- [ ] Unit tests for search (with debounce)
- [ ] Integration tests for grid + filters
- [ ] Integration tests for modal + tabs
- [ ] E2E test: Filter by level
- [ ] E2E test: Search for agent
- [ ] E2E test: Open agent detail
- [ ] Performance test: 500 agents render time <2s
- [ ] Performance test: Scroll performance 60fps
- [ ] Accessibility audit: All components WCAG AA

---

### Phase 3: Advanced Visualization (Weeks 5-6)

**Objectives**:
- Implement hierarchy tree view
- Enhance knowledge graph visualization
- Add interactive spawning graph
- Implement real-time updates

**Deliverables**:

#### Week 5: Hierarchy Tree View
```typescript
// 5.1 Create HierarchyTreeView component
// apps/vital-system/src/features/agents/components/HierarchyTreeView.tsx
import { TreeView } from '@mui/x-tree-view'; // or custom implementation

export const HierarchyTreeView = ({
  agents,
  onAgentSelect,
  expandedLevels = [1, 2]
}: HierarchyTreeViewProps) => {
  // Tree structure:
  // Level 1 (Master)
  //   ├─ Agent 1
  //   │  └─ Can spawn: L2, L3, L4, L5
  //   └─ Agent 2
  // Level 2 (Expert)
  //   └─ ...

  // Features:
  // - Collapsible levels
  // - Virtual scrolling for large lists
  // - Drag-and-drop (future)
  // - Search filtering
  // - Keyboard navigation
};

// 5.2 Create LevelSection component
// apps/vital-system/src/features/agents/components/LevelSection.tsx
export const LevelSection = ({
  level,
  agents,
  isExpanded,
  onToggle,
  onAgentSelect
}: LevelSectionProps) => {
  // Collapsible section for one level
  // Shows agent count, level description
  // Virtual list of agents
};

// 5.3 Create SpawningConnectionLine component
// apps/vital-system/src/features/agents/components/SpawningConnectionLine.tsx
export const SpawningConnectionLine = ({
  from,
  to,
  type = 'can_spawn'
}: SpawningConnectionLineProps) => {
  // SVG line with arrow showing spawning relationship
};

// 5.4 Add tree view toggle
// Update main AgentStore page to switch between views
```

#### Week 6: Enhanced Graph Visualization
```typescript
// 6.1 Enhance KnowledgeGraphView component
// apps/vital-system/src/features/agents/components/knowledge-graph-view.tsx
// (Already exists, enhance it)

// Enhancements:
// - Add level clustering (group by level)
// - Add force simulation controls
// - Add minimap for navigation
// - Add zoom controls
// - Add node labels toggle
// - Add edge labels (spawning relationship)
// - Add filtering in graph
// - Add path highlighting

// 6.2 Create GraphControls component
// apps/vital-system/src/features/agents/components/GraphControls.tsx
export const GraphControls = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleMinimap,
  onToggleLabels,
  onToggleClustering
}: GraphControlsProps) => {
  // Control panel for graph
};

// 6.3 Create MiniMap component
// apps/vital-system/src/features/agents/components/MiniMap.tsx
export const MiniMap = ({
  nodes,
  edges,
  viewport,
  onViewportChange
}: MiniMapProps) => {
  // Small overview map in corner
};

// 6.4 Add graph node customization
// Custom node component for React Flow
const CustomAgentNode = ({ data }: NodeProps) => {
  // Enhanced node with:
  // - Level badge
  // - Avatar
  // - Name
  // - Spawning indicator
  // - Quick actions
};

// 6.5 Implement real-time updates
// apps/vital-system/src/hooks/useRealtimeAgents.ts
export function useRealtimeAgents() {
  // Subscribe to Supabase realtime
  // Update agents when they change
  // Show notifications for updates

  useEffect(() => {
    const subscription = supabase
      .channel('agents')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => {
          // Handle insert/update/delete
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);
}
```

**Acceptance Criteria**:
- [ ] Hierarchy tree view complete
- [ ] Tree view supports collapsible levels
- [ ] Tree view has virtual scrolling
- [ ] Knowledge graph enhanced with clustering
- [ ] Graph has zoom and pan controls
- [ ] Graph has minimap
- [ ] Graph shows spawning relationships
- [ ] Custom node design implemented
- [ ] Real-time updates working
- [ ] View switching animation smooth
- [ ] All views keyboard accessible

**Testing Checklist**:
- [ ] Unit tests for tree view logic
- [ ] Unit tests for graph enhancements
- [ ] Integration test: Tree view + filtering
- [ ] Integration test: Graph + real-time updates
- [ ] E2E test: Switch between views
- [ ] E2E test: Expand/collapse tree sections
- [ ] E2E test: Graph zoom and pan
- [ ] Performance test: Tree view with 500 agents
- [ ] Performance test: Graph rendering <3s
- [ ] Accessibility audit: All new components

---

### Phase 4: User Experience Polish (Weeks 7-8)

**Objectives**:
- Implement keyboard shortcuts
- Add URL state management
- Create onboarding tour
- Add analytics
- Implement error boundaries
- Polish animations and micro-interactions

**Deliverables**:

#### Week 7: Navigation & State Management
```typescript
// 7.1 Implement keyboard shortcuts
// apps/vital-system/src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  // Cmd/Ctrl + K: Focus search
  // Cmd/Ctrl + F: Toggle filters
  // Cmd/Ctrl + 1-5: Select level
  // G + V: Switch view
  // Esc: Close modal/clear filters
  // Arrow keys: Navigate agents
  // Enter: Select agent
  // /: Focus search (GitHub style)

  // Show keyboard shortcuts help (Cmd/Ctrl + ?)
}

// 7.2 Create KeyboardShortcutsHelp modal
// apps/vital-system/src/features/agents/components/KeyboardShortcutsHelp.tsx
export const KeyboardShortcutsHelp = ({
  isOpen,
  onClose
}: KeyboardShortcutsHelpProps) => {
  // Modal showing all keyboard shortcuts
  // Grouped by category
};

// 7.3 Implement URL state management
// apps/vital-system/src/hooks/useAgentStoreURLState.ts
export function useAgentStoreURLState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL with app state
  // - View mode
  // - Selected levels
  // - Selected functions
  // - Search query
  // - Sort option
  // - Selected agent (for modal)

  // Deep linking support
}

// 7.4 Add browser history management
// - Back/forward navigation
// - State preservation
// - Scroll position restoration

// 7.5 Create SavedFilters feature
// apps/vital-system/src/features/agents/components/SavedFilters.tsx
export const SavedFilters = ({
  onApplyFilter
}: SavedFiltersProps) => {
  // Save current filters to localStorage
  // Load saved filters
  // Share filter combinations via URL

  // Presets:
  // - "My Function" (user's function)
  // - "Medical Affairs"
  // - "Master & Expert" (L1 + L2)
  // - "Recently Added"
};
```

#### Week 8: Onboarding & Analytics
```typescript
// 8.1 Create onboarding tour
// apps/vital-system/src/features/agents/components/OnboardingTour.tsx
import { driver } from 'driver.js'; // or react-joyride

export const OnboardingTour = ({
  isFirstVisit
}: OnboardingTourProps) => {
  // Tour steps:
  // 1. Welcome to Agent Store
  // 2. Five levels explained
  // 3. Level filter bar
  // 4. Search functionality
  // 5. Agent card (hover to see details)
  // 6. Agent detail modal
  // 7. Hierarchy visualization
  // 8. Spawning model
  // 9. How to use an agent

  // Store completion in localStorage
  // Allow user to restart tour
};

// 8.2 Create HierarchyExplainer component
// apps/vital-system/src/features/agents/components/HierarchyExplainer.tsx
export const HierarchyExplainer = ({
  onClose
}: HierarchyExplainerProps) => {
  // Interactive explainer:
  // - What are the 5 levels?
  // - What is spawning?
  // - How do I choose an agent?
  // - Visual diagram
  // - Examples
};

// 8.3 Add analytics tracking
// apps/vital-system/src/lib/analytics.ts
export class AgentStoreAnalytics {
  trackPageView(view: ViewMode): void
  trackAgentView(agentId: string): void
  trackAgentSelect(agentId: string, mode: 'mode1' | 'mode2'): void
  trackFilter(filterType: string, value: string): void
  trackSearch(query: string, resultCount: number): void
  trackViewSwitch(from: ViewMode, to: ViewMode): void
}

// Integration points:
// - Page load
// - Agent selection
// - Filter changes
// - Search queries
// - View switches
// - Modal opens
// - Tour completion

// 8.4 Implement error boundaries
// apps/vital-system/src/components/ErrorBoundary.tsx
export class AgentStoreErrorBoundary extends React.Component {
  // Catch errors in:
  // - Agent fetching
  // - Graph rendering
  // - Tree rendering
  // - Modal rendering

  // Show friendly error message
  // Log to error tracking service (Sentry)
  // Provide recovery actions
}

// 8.5 Add loading states
// apps/vital-system/src/features/agents/components/LoadingStates.tsx
export const AgentGridSkeleton = () => {
  // Grid of skeleton cards while loading
};

export const AgentDetailSkeleton = () => {
  // Skeleton for modal content
};

export const GraphLoadingState = () => {
  // Loading spinner for graph
};

// 8.6 Polish animations
// - Page transitions (view switching)
// - Card hover effects
// - Modal enter/exit
// - Filter animations
// - Loading states
// - Micro-interactions (button clicks, toggles)

// Use Framer Motion for complex animations
import { motion, AnimatePresence } from 'framer-motion';
```

**Acceptance Criteria**:
- [ ] 10+ keyboard shortcuts implemented
- [ ] Keyboard shortcuts help modal working
- [ ] URL state management complete
- [ ] Browser back/forward working
- [ ] Saved filters feature working
- [ ] Onboarding tour complete (9 steps)
- [ ] Hierarchy explainer working
- [ ] Analytics tracking implemented
- [ ] Error boundaries on all major components
- [ ] Loading states for all async operations
- [ ] Animations polished (60fps)
- [ ] All features work without mouse (keyboard only)

**Testing Checklist**:
- [ ] Unit tests for keyboard shortcuts
- [ ] Unit tests for URL state sync
- [ ] Integration test: Keyboard navigation
- [ ] Integration test: URL deep linking
- [ ] Integration test: Saved filters
- [ ] E2E test: Complete onboarding tour
- [ ] E2E test: Keyboard-only navigation
- [ ] E2E test: Browser back/forward
- [ ] E2E test: Share filtered URL
- [ ] Performance test: Animation frame rate
- [ ] Accessibility audit: Keyboard navigation
- [ ] Accessibility audit: Screen reader announcements

---

### Phase 5: Testing & Optimization (Weeks 9-10)

**Objectives**:
- Comprehensive test coverage (80%+)
- Performance optimization
- A/B testing setup
- Production monitoring
- Documentation

**Deliverables**:

#### Week 9: Testing
```typescript
// 9.1 Unit test coverage (Target: 80%+)
// Test files for each component:
// - AgentCard.test.tsx
// - AgentGrid.test.tsx
// - LevelFilterBar.test.tsx
// - SearchInput.test.tsx
// - AgentDetailModal.test.tsx
// - HierarchyTreeView.test.tsx
// - KnowledgeGraphView.test.tsx
// ... etc.

// 9.2 Integration tests
// apps/vital-system/src/features/agents/__tests__/integration/

// Test scenarios:
// - User filters by level → sees correct agents
// - User searches → sees filtered results
// - User selects agent → modal opens with correct data
// - User switches view → view changes correctly
// - Real-time update → UI updates
// - URL change → state updates

// 9.3 E2E tests (Playwright)
// apps/vital-system/e2e/agent-store.spec.ts

test('User can filter agents by level', async ({ page }) => {
  await page.goto('/agents');
  await page.click('[data-testid="level-filter-1"]');
  const agentCards = page.locator('[data-testid="agent-card"]');
  await expect(agentCards).toHaveCount(24); // 24 Master agents
});

test('User can search for agents', async ({ page }) => {
  await page.goto('/agents');
  await page.fill('[data-testid="search-input"]', 'pharmacist');
  await page.waitForTimeout(350); // Wait for debounce
  const agentCards = page.locator('[data-testid="agent-card"]');
  await expect(agentCards.count()).toBeGreaterThan(0);
});

test('User can open agent detail modal', async ({ page }) => {
  await page.goto('/agents');
  await page.click('[data-testid="agent-card"]:first-child');
  await expect(page.locator('[data-testid="agent-detail-modal"]')).toBeVisible();
});

test('Keyboard navigation works', async ({ page }) => {
  await page.goto('/agents');
  await page.keyboard.press('Tab'); // Focus first agent
  await page.keyboard.press('Enter'); // Select agent
  await expect(page.locator('[data-testid="agent-detail-modal"]')).toBeVisible();
  await page.keyboard.press('Escape'); // Close modal
  await expect(page.locator('[data-testid="agent-detail-modal"]')).not.toBeVisible();
});

// 9.4 Accessibility tests
// apps/vital-system/src/features/agents/__tests__/a11y/

import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('AgentCard has no accessibility violations', async () => {
  const { container } = render(<AgentCard agent={mockAgent} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Run on all components

// 9.5 Visual regression tests
// apps/vital-system/src/features/agents/__tests__/visual/

import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

test('AgentCard renders correctly', async () => {
  const { container } = render(<AgentCard agent={mockAgent} />);
  const image = await generateImage(container);
  expect(image).toMatchImageSnapshot();
});

// 9.6 Performance tests
// apps/vital-system/src/features/agents/__tests__/performance/

test('AgentGrid renders 500 agents in <2s', async () => {
  const agents = generateMockAgents(500);
  const startTime = performance.now();

  render(<AgentGrid agents={agents} />);

  await waitFor(() => {
    expect(screen.getAllByTestId('agent-card')).toHaveLength(expect.any(Number));
  });

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  expect(renderTime).toBeLessThan(2000);
});

test('Virtual scrolling maintains 60fps', async () => {
  // Use Lighthouse or custom performance monitoring
});
```

#### Week 10: Optimization & Launch Prep
```typescript
// 10.1 Performance optimization
// - Code splitting by route
// - Lazy load modal
// - Image optimization (avatars)
// - Bundle size reduction
// - Memoization of expensive computations
// - Debouncing and throttling

// apps/vital-system/next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    // Bundle analysis
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  },
};

// 10.2 Implement performance monitoring
// apps/vital-system/src/lib/performance.ts
export class PerformanceMonitor {
  // Track Web Vitals
  trackLCP(): void // Largest Contentful Paint
  trackFID(): void // First Input Delay
  trackCLS(): void // Cumulative Layout Shift

  // Track custom metrics
  trackAgentLoadTime(): void
  trackFilterPerformance(): void
  trackSearchPerformance(): void
  trackModalOpenTime(): void
}

// 10.3 Set up A/B testing
// apps/vital-system/src/lib/ab-testing.ts
export class ABTesting {
  // Test variants:
  // - Grid columns (3 vs 4 vs 5)
  // - Card size (compact vs comfortable)
  // - Default view (grid vs tree)
  // - Sort default (name vs level)

  getVariant(experimentName: string): string
  trackConversion(experimentName: string, variant: string): void
}

// 10.4 Production monitoring
// - Error tracking (Sentry)
// - Performance monitoring (Vercel Analytics)
// - User analytics (PostHog or similar)
// - API monitoring
// - Database query performance

// 10.5 Create documentation
// apps/vital-system/src/features/agents/README.md
// - Architecture overview
// - Component documentation
// - State management
// - API integration
// - Testing strategy
// - Performance considerations
// - Accessibility guidelines
// - Deployment checklist

// 10.6 Create user documentation
// - How to use Agent Store
// - Understanding the 5-level hierarchy
// - Filtering and search tips
// - Keyboard shortcuts
// - FAQ

// 10.7 Final performance audit
// - Lighthouse score: 95+ on all metrics
// - Bundle size: <500KB initial load
// - Time to Interactive: <3s
// - First Contentful Paint: <1.5s
// - Total Blocking Time: <300ms

// 10.8 Security audit
// - RLS policies verified
// - No exposed secrets
// - XSS protection
// - CSRF protection
// - Rate limiting on API
// - Input sanitization

// 10.9 Launch checklist
// [ ] All tests passing
// [ ] Performance benchmarks met
// [ ] Accessibility audit passed
// [ ] Security audit passed
// [ ] Documentation complete
// [ ] Monitoring configured
// [ ] Feature flags ready
// [ ] Rollback plan documented
// [ ] Stakeholder approval
// [ ] User training materials ready
```

**Acceptance Criteria**:
- [ ] Test coverage ≥80% (lines, branches, functions)
- [ ] All E2E tests passing
- [ ] Zero accessibility violations (axe-core)
- [ ] Lighthouse score ≥95 on all metrics
- [ ] Bundle size ≤500KB initial load
- [ ] Render 500 agents in <2s
- [ ] Maintain 60fps during interactions
- [ ] A/B testing framework ready
- [ ] Production monitoring configured
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Ready for production deployment

---

## Technical Standards

### Code Quality

```typescript
// 1. TypeScript Strict Mode
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
  }
}

// 2. ESLint Configuration
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  rules: {
    // Custom rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': 'error',
  },
};

// 3. Prettier Configuration
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}

// 4. Component Structure (Example)
// Good component structure following best practices

import { memo, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  view?: 'compact' | 'comfortable' | 'detailed';
  className?: string;
}

/**
 * AgentCard displays an agent in the grid view
 *
 * @param agent - Agent data
 * @param onSelect - Callback when agent is selected
 * @param view - Display density (default: 'comfortable')
 * @param className - Additional CSS classes
 */
export const AgentCard = memo<AgentCardProps>(({
  agent,
  onSelect,
  view = 'comfortable',
  className
}) => {
  // Memoize callbacks
  const handleClick = useCallback(() => {
    onSelect(agent);
  }, [agent, onSelect]);

  // Memoize computed values
  const levelColor = useMemo(
    () => LEVEL_COLORS[agent.agent_levels.level_number].base,
    [agent.agent_levels.level_number]
  );

  // Early return for loading/error states
  if (!agent.agent_levels) {
    return <AgentCardSkeleton />;
  }

  return (
    <article
      className={cn(
        'agent-card',
        `agent-card--${view}`,
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      aria-label={`Select ${agent.name}`}
      data-testid="agent-card"
    >
      {/* Component content */}
    </article>
  );
});

AgentCard.displayName = 'AgentCard';

// 5. Custom Hooks (Example)
// Good custom hook structure

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useAgentSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await agentService.searchAgents(searchQuery);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  return { results, isLoading, error };
}
```

### Performance Standards

```typescript
// 1. Virtual Scrolling for Large Lists
import { useVirtualizer } from '@tanstack/react-virtual';

export const AgentGrid = ({ agents }: AgentGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(agents.length / COLUMNS_PER_ROW),
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 5, // Render 5 extra rows
  });

  return (
    <div ref={parentRef} className="agent-grid-container">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {/* Render row of agent cards */}
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Memoization
import { memo, useMemo } from 'react';

// Memoize expensive components
export const AgentCard = memo<AgentCardProps>(({ agent }) => {
  // ...
});

// Memoize expensive computations
const filteredAgents = useMemo(() => {
  return agents.filter(agent => {
    if (selectedLevels.length > 0 && !selectedLevels.includes(agent.agent_levels.level_number)) {
      return false;
    }
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
}, [agents, selectedLevels, searchQuery]);

// 3. Debouncing
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Perform search
  }, 300),
  []
);

// 4. Code Splitting
import dynamic from 'next/dynamic';

// Lazy load heavy components
const AgentDetailModal = dynamic(
  () => import('./AgentDetailModal').then(mod => mod.AgentDetailModal),
  {
    loading: () => <ModalSkeleton />,
    ssr: false, // Don't render on server
  }
);

const KnowledgeGraphView = dynamic(
  () => import('./knowledge-graph-view').then(mod => mod.KnowledgeGraphView),
  {
    loading: () => <GraphLoadingSkeleton />,
    ssr: false,
  }
);

// 5. Image Optimization
import Image from 'next/image';

<Image
  src={agent.avatar_url || '/default-avatar.png'}
  alt={agent.avatar_description || agent.name}
  width={64}
  height={64}
  loading="lazy"
  placeholder="blur"
  blurDataURL={generateBlurDataURL(agent.avatar_url)}
/>

// 6. Performance Monitoring
import { useEffect } from 'react';

export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);

    return () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      if (measure.duration > 100) {
        console.warn(`${componentName} took ${measure.duration.toFixed(2)}ms to render`);
      }

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    };
  }, [componentName]);
}

// Usage
usePerformanceMonitoring('AgentGrid');
```

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \         10% - End-to-End (Playwright)
     /______\
    /        \
   /Integration\      20% - Integration (React Testing Library)
  /____________\
 /              \
/  Unit Tests    \    70% - Unit (Jest + React Testing Library)
/__________________\
```

### Test Coverage Requirements

| Type | Target | Tools |
|------|--------|-------|
| **Unit Tests** | 80%+ lines, 75%+ branches | Jest, RTL |
| **Integration Tests** | Key user flows | RTL, MSW |
| **E2E Tests** | Critical paths | Playwright |
| **Accessibility** | 0 violations | axe-core, pa11y |
| **Performance** | Budget met | Lighthouse, WebPageTest |
| **Visual Regression** | No unintended changes | jest-image-snapshot |

### Example Test Suite

```typescript
// apps/vital-system/src/features/agents/components/__tests__/AgentCard.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AgentCard } from '../AgentCard';
import { mockAgent } from '@/test-utils/mocks';

describe('AgentCard', () => {
  const defaultProps = {
    agent: mockAgent,
    onSelect: jest.fn(),
    view: 'comfortable' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders agent name', () => {
      render(<AgentCard {...defaultProps} />);
      expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
    });

    it('renders level badge with correct color', () => {
      render(<AgentCard {...defaultProps} />);
      const badge = screen.getByText(`L${mockAgent.agent_levels.level_number}`);
      expect(badge).toHaveStyle({ backgroundColor: LEVEL_COLORS[1].base });
    });

    it('renders avatar with correct src', () => {
      render(<AgentCard {...defaultProps} />);
      const avatar = screen.getByAltText(mockAgent.name);
      expect(avatar).toHaveAttribute('src', expect.stringContaining(mockAgent.avatar_url));
    });

    it('renders function and department', () => {
      render(<AgentCard {...defaultProps} />);
      expect(screen.getByText(mockAgent.function_name)).toBeInTheDocument();
      expect(screen.getByText(mockAgent.department_name)).toBeInTheDocument();
    });

    it('renders spawning indicator for master agents', () => {
      const masterAgent = { ...mockAgent, agent_levels: { ...mockAgent.agent_levels, level_number: 1 } };
      render(<AgentCard {...defaultProps} agent={masterAgent} />);
      expect(screen.getByText(/Can spawn: L2, L3, L4, L5/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when clicked', () => {
      render(<AgentCard {...defaultProps} />);
      fireEvent.click(screen.getByRole('button'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockAgent);
    });

    it('calls onSelect when Enter key is pressed', () => {
      render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockAgent);
    });

    it('does not call onSelect when other keys are pressed', () => {
      render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Space' });
      expect(defaultProps.onSelect).not.toHaveBeenCalled();
    });

    it('shows hover state on mouse enter', async () => {
      render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      fireEvent.mouseEnter(card);

      await waitFor(() => {
        expect(card).toHaveClass('agent-card--hovered');
      });
    });
  });

  describe('Views', () => {
    it('renders compact view correctly', () => {
      render(<AgentCard {...defaultProps} view="compact" />);
      const card = screen.getByRole('button');
      expect(card).toHaveClass('agent-card--compact');
    });

    it('renders comfortable view correctly', () => {
      render(<AgentCard {...defaultProps} view="comfortable" />);
      const card = screen.getByRole('button');
      expect(card).toHaveClass('agent-card--comfortable');
    });

    it('renders detailed view correctly', () => {
      render(<AgentCard {...defaultProps} view="detailed" />);
      const card = screen.getByRole('button');
      expect(card).toHaveClass('agent-card--detailed');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<AgentCard {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA label', () => {
      render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', `Select ${mockAgent.name}`);
    });

    it('is keyboard focusable', () => {
      render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Error States', () => {
    it('renders skeleton when agent_levels is missing', () => {
      const agentWithoutLevels = { ...mockAgent, agent_levels: null };
      render(<AgentCard {...defaultProps} agent={agentWithoutLevels} />);
      expect(screen.getByTestId('agent-card-skeleton')).toBeInTheDocument();
    });

    it('uses default avatar when avatar_url is missing', () => {
      const agentWithoutAvatar = { ...mockAgent, avatar_url: null };
      render(<AgentCard {...defaultProps} agent={agentWithoutAvatar} />);
      const avatar = screen.getByAltText(mockAgent.name);
      expect(avatar).toHaveAttribute('src', expect.stringContaining('/default-avatar.png'));
    });
  });

  describe('Performance', () => {
    it('memoizes correctly (does not re-render unnecessarily)', () => {
      const { rerender } = render(<AgentCard {...defaultProps} />);
      const card = screen.getByRole('button');
      const firstRender = card;

      rerender(<AgentCard {...defaultProps} />);
      const secondRender = screen.getByRole('button');

      expect(firstRender).toBe(secondRender); // Same DOM node
    });
  });
});
```

---

## Performance Requirements

### Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| **Initial Load** | <2s | 3s |
| **Time to Interactive** | <2.5s | 3.5s |
| **First Contentful Paint** | <1s | 1.5s |
| **Largest Contentful Paint** | <2s | 2.5s |
| **Total Blocking Time** | <200ms | 300ms |
| **Cumulative Layout Shift** | <0.1 | 0.25 |
| **Bundle Size (Initial)** | <400KB | 500KB |
| **Agent Grid Render (500 agents)** | <1.5s | 2s |
| **Filter Response** | <50ms | 100ms |
| **Search Response (debounced)** | <100ms | 200ms |
| **Modal Open** | <100ms | 200ms |
| **Scroll Performance** | 60fps | 30fps |
| **Graph Render (500 nodes)** | <2s | 3s |

### Optimization Techniques

1. **Code Splitting**
   - Route-based splitting
   - Component-based splitting (modal, graph)
   - Vendor chunking

2. **Asset Optimization**
   - Image compression (WebP, AVIF)
   - Lazy loading images
   - SVG optimization
   - Icon sprite sheets

3. **Rendering Optimization**
   - Virtual scrolling
   - Memoization (React.memo, useMemo, useCallback)
   - Debouncing/Throttling
   - Progressive enhancement

4. **Data Optimization**
   - Efficient queries (only fetch needed columns)
   - Pagination/Infinite scroll
   - Client-side caching
   - Request deduplication

5. **Build Optimization**
   - Tree shaking
   - Minification
   - Compression (Gzip, Brotli)
   - Critical CSS extraction

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance (Minimum)

**Targeting AAA where feasible**

#### 1. Perceivable

**1.1 Text Alternatives**
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Icons have aria-labels
- [ ] Avatar descriptions available

**1.2 Time-based Media**
- [ ] N/A (no video/audio content)

**1.3 Adaptable**
- [ ] Semantic HTML (article, nav, main, section)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Tables use proper markup (if any)
- [ ] Forms have proper labels

**1.4 Distinguishable**
- [ ] Color contrast ≥4.5:1 for text (AA)
- [ ] Color contrast ≥7:1 for text (AAA target)
- [ ] Color contrast ≥3:1 for UI components
- [ ] Information not conveyed by color alone
- [ ] Text resizable to 200% without loss of content
- [ ] No images of text (use actual text)

#### 2. Operable

**2.1 Keyboard Accessible**
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Focus order is logical
- [ ] Keyboard shortcuts documented
- [ ] Skip links provided

**2.2 Enough Time**
- [ ] No time limits on interactions
- [ ] Debounced actions have visual feedback

**2.3 Seizures**
- [ ] No flashing content ≥3 times per second

**2.4 Navigable**
- [ ] Page title descriptive
- [ ] Focus order is meaningful
- [ ] Link purpose clear from text
- [ ] Multiple navigation methods (search, filters, direct access)
- [ ] Focus visible (clear focus indicators)
- [ ] Breadcrumbs for context

#### 3. Understandable

**3.1 Readable**
- [ ] Language of page identified (lang="en")
- [ ] Language changes marked up
- [ ] Technical terms explained (hierarchy explainer)

**3.2 Predictable**
- [ ] Navigation consistent across views
- [ ] Components behave consistently
- [ ] No unexpected context changes
- [ ] Help available (onboarding tour, keyboard shortcuts)

**3.3 Input Assistance**
- [ ] Error messages clear and specific
- [ ] Labels and instructions provided
- [ ] Error prevention (confirmations)
- [ ] Error recovery (undo, retry)

#### 4. Robust

**4.1 Compatible**
- [ ] Valid HTML
- [ ] ARIA roles used correctly
- [ ] ARIA states/properties used correctly
- [ ] Name, Role, Value available for all components

### Accessibility Testing Checklist

```typescript
// Automated tests (run in CI/CD)
- [ ] axe-core (0 violations)
- [ ] pa11y (0 errors)
- [ ] Lighthouse accessibility score ≥95
- [ ] eslint-plugin-jsx-a11y (0 errors)

// Manual tests
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode (Windows, macOS)
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] Color blindness simulation (deuteranopia, protanopia, tritanopia)
- [ ] Forced colors mode (Windows)
```

### Screen Reader Announcements

```typescript
// Example ARIA live regions for dynamic content

// When agents are filtered
<div role="status" aria-live="polite" aria-atomic="true">
  {`Showing ${filteredAgents.length} of ${totalAgents} agents`}
</div>

// When loading
<div role="status" aria-live="polite" aria-atomic="true">
  Loading agents...
</div>

// When error occurs
<div role="alert" aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>

// Agent card
<article
  role="article"
  aria-labelledby={`agent-${agent.id}-name`}
  aria-describedby={`agent-${agent.id}-description`}
>
  <h3 id={`agent-${agent.id}-name`}>{agent.name}</h3>
  <p id={`agent-${agent.id}-description`}>{agent.description}</p>
  <span aria-label={`Level ${agent.agent_levels.level_number}: ${agent.agent_levels.name}`}>
    L{agent.agent_levels.level_number}
  </span>
</article>
```

---

## Summary

This specification defines a **production-grade, full-featured** Agent Store redesign that goes far beyond an MVP. It includes:

✅ **Comprehensive Design System** with tokens, typography, spacing, colors, and animations
✅ **Three Visualization Modes** (Grid, Tree, Graph) with seamless switching
✅ **Advanced Filtering & Search** with multi-dimensional filtering and fuzzy matching
✅ **Rich Agent Details** with tabbed modal showing hierarchy, configuration, and relationships
✅ **5-Phase Implementation Plan** spanning 10 weeks with clear milestones
✅ **Industry Best Practices** including atomic design, SOLID principles, and performance optimization
✅ **Comprehensive Testing** with 80%+ coverage across unit, integration, E2E, and accessibility tests
✅ **Performance Optimization** with virtual scrolling, code splitting, and caching
✅ **WCAG 2.1 AA+ Compliance** with keyboard navigation, screen reader support, and high contrast
✅ **Real-time Updates** with Supabase subscriptions and optimistic UI
✅ **Production Monitoring** with error tracking, analytics, and performance monitoring
✅ **User Education** with onboarding tour and hierarchy explainer

### Success Metrics

**Technical:**
- Lighthouse score ≥95 on all metrics
- Bundle size ≤500KB
- Render 500 agents in <2s
- 80%+ test coverage
- 0 accessibility violations

**User Experience:**
- <3 clicks to find any agent
- <5 seconds to understand hierarchy
- 60fps scroll performance
- Keyboard-navigable
- Mobile-responsive

**Business:**
- Increased agent discovery
- Reduced support queries about agent selection
- Higher agent utilization
- Improved user satisfaction

---

## Next Steps

1. **Review & Approval** - Stakeholder sign-off on this specification
2. **Team Assembly** - Frontend developers, designers, QA engineers
3. **Environment Setup** - Development, staging, production environments
4. **Sprint Planning** - Break down phases into 2-week sprints
5. **Kickoff** - Begin Phase 1: Foundation & Design System

**Estimated Timeline**: 10 weeks (5 phases)
**Estimated Effort**: 3-4 full-time engineers
**Go-Live Target**: Week 11 (with 1 week buffer for production readiness)

---

**Document Version**: 2.0
**Last Updated**: 2025-11-24
**Author**: Agent Store Redesign Team
**Status**: Ready for Implementation
