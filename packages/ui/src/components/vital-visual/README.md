# VITAL Visual Asset Component Library

Production-ready React components for rendering visual assets from the VITAL platform, based on **Brand Guidelines v5.0** - Atomic Geometry & Warm Modernism design system.

## Overview

This library provides 5 core components for working with VITAL's 635 visual assets:
- **5 Super Agent Icons** (Level 1 Master orchestrators)
- **130 General Icons** (50 black + 80 purple variants)
- **500 Agent Avatars** (5 personas × 5 departments × 20 variants)

## Components

### 1. SuperAgentIcon

Display Level 1 Master orchestrator icons with size and color variants.

```tsx
import { SuperAgentIcon } from '@vital/ui'

<SuperAgentIcon
  name="super_orchestrator"
  size="lg"
  variant="purple"
  backgroundColor="#FAF8F1"
/>
```

**Props:**
- `name`: Super agent name (e.g., "super_orchestrator", "master_strategist")
- `size`: "sm" | "md" | "lg" | "xl" | "2xl" (default: "md")
- `variant`: Tenant Identity Color - "purple" | "blue" | "black" | "red" | "pink" | "teal" | "orange" | "indigo"
- `backgroundColor`: Canvas background (default: "#FAF8F1" Warm Ivory)
- `loading`: Boolean loading state
- `onError`: Error callback

### 2. Icon

General purpose icon component with black/purple variants.

```tsx
import { Icon } from '@vital/ui'

<Icon
  name="analytics_chart"
  variant="purple"
  size="md"
/>
```

**Props:**
- `name`: Icon name (e.g., "analytics_chart", "workflow_node")
- `size`: "xs" | "sm" | "md" | "lg" | "xl" (default: "md")
- `variant`: "black" | "purple" (default: "black")
- `customColor`: Hex color override
- `loading`: Boolean loading state
- `onError`: Error callback

### 3. AgentAvatar

Display Level 2 Expert agent avatars from the 500-avatar library.

```tsx
import { AgentAvatar } from '@vital/ui'

<AgentAvatar
  personaType="expert"
  department="medical_affairs"
  variant={1}
  tier={2}
  size="lg"
  showName={true}
  name="Dr. Sarah Chen"
/>
```

**Props:**
- `personaType`: "expert" | "foresight" | "medical" | "pharma" | "startup"
- `department`: "analytics_insights" | "commercial_marketing" | "market_access" | "medical_affairs" | "product_innovation"
- `variant`: Avatar variant number (1-20)
- `avatar`: Direct avatar filename (overrides persona/department/variant)
- `tier`: Agent tier 1-5 for visual styling
- `size`: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
- `name`: Agent name for alt text
- `showName`: Display name badge below avatar
- `badgeColor`: Badge color based on tenant
- `loading`: Boolean loading state
- `lazy`: Lazy load image (default: true)
- `onError`: Error callback

**Tier Styling (AgentOS 3.0 Hierarchy):**
- Tier 1 (Master): `ring-4 ring-purple-500 ring-offset-2`
- Tier 2 (Expert): `ring-2 ring-blue-500 ring-offset-1`
- Tier 3 (Specialist): `ring-2 ring-teal-400`
- Tier 4 (Worker): `border-2 border-gray-300`
- Tier 5 (Tool): `border border-gray-200`

### 4. IconPicker

Searchable icon selection UI with category filters.

```tsx
import { IconPicker } from '@vital/ui'

<IconPicker
  onSelect={(iconName) => console.log('Selected:', iconName)}
  selectedIcon="analytics_chart"
  variant="both"
  maxHeight="400px"
/>
```

**Props:**
- `onSelect`: Callback when icon is selected `(iconName: string) => void`
- `selectedIcon`: Currently selected icon name
- `variant`: "black" | "purple" | "both" (default: "both")
- `categories`: Array of category strings (default: analytics, workflow, medical, etc.)
- `maxHeight`: Maximum picker height (default: "400px")
- `className`: Custom class name

### 5. AvatarGrid

Browsable avatar library with persona and department filters.

```tsx
import { AvatarGrid } from '@vital/ui'

<AvatarGrid
  onSelect={(avatarPath) => console.log('Selected:', avatarPath)}
  selectedAvatar="vital_avatar_expert_medical_affairs_01"
  tier={2}
  maxHeight="600px"
  columns={6}
  showDetails={true}
/>
```

**Props:**
- `onSelect`: Callback when avatar is selected `(avatarPath: string) => void`
- `selectedAvatar`: Currently selected avatar path
- `tier`: Filter by agent tier 1-5 (default: 2)
- `personaType`: Filter by persona type
- `department`: Filter by department
- `maxHeight`: Maximum grid height (default: "600px")
- `columns`: Grid columns 4 | 6 | 8 (default: 6)
- `showDetails`: Show avatar details (default: true)
- `className`: Custom class name

## Asset Taxonomy

### Persona Types (5)
- **expert**: Expert Purple (#9B5DE0) - Domain experts and specialists
- **foresight**: Foresight Pink (#FF3796) - Strategic advisors and futurists
- **medical**: Medical Red (#EF4444) - Healthcare and clinical specialists
- **pharma**: Pharma Blue (#0046FF) - Pharmaceutical industry experts
- **startup**: Startup Black (#292621) - Innovation and entrepreneurship

### Departments (5)
- **analytics_insights**: Data analytics and business intelligence
- **commercial_marketing**: Commercial strategy and marketing
- **market_access**: Reimbursement and market access
- **medical_affairs**: Medical strategy and affairs
- **product_innovation**: Product development and innovation

### Avatar Naming Convention
```
vital_avatar_{persona}_{department}_{01-20}.svg
```

Example: `vital_avatar_expert_medical_affairs_01.svg`

## Design System

Based on **VITAL Brand Guidelines v5.0**:

### Color Palette
- **Warm Ivory**: #FAF8F1 (Background)
- **Neutral Scale**: #F5F2EB, #E8E5DE, #292621, #000000
- **Tenant Identity Colors**: Expert Purple, Pharma Blue, Startup Black, Medical Red, Foresight Pink, Systems Teal, Velocity Orange, Research Indigo

### Typography
- **UI**: Inter (400, 500, 600)
- **Technical**: JetBrains Mono (monospace)

### Atomic Geometry Primitives
- **Circle** (●): Insight, cognition - Used for avatars, intelligence hubs
- **Square** (■): Structure, stability - Used for containers, modules
- **Triangle** (▲): Growth, direction - Used for analytics, metrics
- **Line** (—): Connection, flow - Used for relationships, pathways
- **Diamond** (◆): Value, precision - Used for highlights, key data

## Usage Examples

### Example 1: Agent Card with Avatar
```tsx
import { AgentAvatar } from '@vital/ui'

function AgentCard({ agent }) {
  return (
    <div className="p-4 bg-white rounded-lg border">
      <AgentAvatar
        personaType="expert"
        department="medical_affairs"
        variant={1}
        tier={agent.tier}
        size="xl"
        showName={true}
        name={agent.name}
        badgeColor="#9B5DE0"
      />
      <div className="mt-4">
        <h3 className="font-semibold">{agent.name}</h3>
        <p className="text-sm text-gray-600">{agent.description}</p>
      </div>
    </div>
  )
}
```

### Example 2: Icon Grid with Picker
```tsx
import { IconPicker } from '@vital/ui'
import { useState } from 'react'

function IconSelector() {
  const [selectedIcon, setSelectedIcon] = useState('')

  return (
    <IconPicker
      onSelect={setSelectedIcon}
      selectedIcon={selectedIcon}
      variant="purple"
      maxHeight="500px"
    />
  )
}
```

### Example 3: Avatar Browser
```tsx
import { AvatarGrid } from '@vital/ui'
import { useState } from 'react'

function AvatarBrowser() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <AvatarGrid
      onSelect={setSelectedAvatar}
      selectedAvatar={selectedAvatar}
      tier={2}
      personaType="expert"
      maxHeight="700px"
      columns={8}
    />
  )
}
```

## Asset Paths

Components expect assets to be available at:
- Super Agent Icons: `/assets/vital/super_agents/{name}.svg`
- General Icons: `/assets/vital/icons/{black|purple}/{name}.svg`
- Agent Avatars: `/assets/vital/avatars/vital_avatar_{persona}_{department}_{01-20}.svg`

## Performance Considerations

1. **Lazy Loading**: AgentAvatar uses `loading="lazy"` by default
2. **Image Preloading**: Icons preload for faster rendering
3. **Error Fallbacks**: Graceful degradation with fallback UI
4. **Optimized SVGs**: All assets are optimized SVGs (2-10KB each)

## Accessibility

- All images include descriptive `alt` text
- Color contrast ratios meet WCAG 2.1 AA standards
- Keyboard navigation support in picker components
- Screen reader friendly labels

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- React 18+

## License

Proprietary - VITAL Platform
