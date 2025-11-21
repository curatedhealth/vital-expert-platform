# Service Templates System

A comprehensive service template system that follows the Ask Expert design patterns, allowing users to quickly deploy pre-configured AI services.

## Overview

The Service Templates system provides:
- **Pre-configured Services**: Ready-to-use service configurations for common use cases
- **Visual Design**: Beautiful, consistent UI following Ask Expert design patterns
- **Category Organization**: Templates organized by category (Advisory, Workflow, Analysis, Research, Compliance, Innovation)
- **Tier System**: Three tiers (Expert, Advanced, Standard) for different complexity levels
- **Quick Deployment**: One-click deployment of services

## Architecture

### Core Components

1. **Types** (`/types/service-templates.ts`)
   - `ServiceTemplateConfig`: Configuration interface for templates
   - `ServiceTemplateInstance`: Runtime instance of a deployed service
   - Category and tier enumerations

2. **Template Definitions** (`/lib/service-templates/template-definitions.ts`)
   - 11 pre-configured templates across 6 categories
   - Helper functions for filtering and searching templates
   - Organized by category for easy access

3. **UI Components** (`/components/service-templates/`)
   - `ServiceTemplateCard`: Full card view with gradient header
   - `ServiceTemplateCardCompact`: Condensed list view

4. **Page** (`/app/(app)/service-templates/page.tsx`)
   - Main template gallery page
   - Search and filter functionality
   - Grid and list view modes
   - Category tabs for browsing

5. **Sidebar Integration** (`/components/sidebar-view-content.tsx`)
   - `SidebarServiceTemplatesContent`: Context-aware sidebar
   - Popular templates quick access
   - Category navigation

## Available Templates

### Advisory Services (3 templates)
- **Regulatory Advisory**: FDA, EMA, and global regulatory guidance
- **Market Access Advisory**: Payer strategies and reimbursement
- **Clinical Development Advisory**: Trial design and protocol review

### Workflow Services (1 template)
- **Expert Panel Discussion**: Multi-expert collaborative analysis

### Analysis Services (2 templates)
- **Socratic Deep Analysis**: Iterative questioning methodology
- **Adversarial Review**: Structured debate for risk assessment

### Research Services (2 templates)
- **Competitive Intelligence**: Continuous competitive monitoring
- **Literature Synthesis**: Automated evidence synthesis

### Compliance Services (1 template)
- **Compliance Review**: Regulatory compliance checking and gap analysis

### Innovation Services (2 templates)
- **Innovation Sandbox**: Test strategies in risk-free environment
- **Strategic Foresight**: Delphi-style forecasting

## Design Principles

### Visual Hierarchy
- **Gradient Headers**: Each template has a unique gradient reflecting its category
- **Icon System**: Lucide icons for consistent visual language
- **Badge System**: Highlights (Most Popular, High Value, etc.)
- **Tier Indicators**: Color-coded tier badges (Expert, Advanced, Standard)

### Interaction Patterns
- **Hover Effects**: Smooth transitions and elevation changes
- **Click-to-Deploy**: Single click navigates to service or launches workflow
- **View Modes**: Grid for browsing, list for scanning
- **Filter System**: Category, tier, and search filters

### Color System
Each category has a distinct color palette:
- **Advisory**: Blue/Indigo (Trust and authority)
- **Workflow**: Purple/Pink (Collaboration)
- **Analysis**: Violet/Rose (Critical thinking)
- **Research**: Cyan/Orange (Discovery)
- **Compliance**: Green (Safety and standards)
- **Innovation**: Amber/Teal (Creativity)

## Usage

### Adding a New Template

```typescript
import { ServiceTemplateConfig } from '@/types/service-templates';
import { YourIcon } from 'lucide-react';

export const YOUR_TEMPLATE: ServiceTemplateConfig = {
  id: 'your_template_id',
  name: 'Your Template Name',
  description: 'Clear description of what this service does',
  category: 'advisory', // or workflow, analysis, research, compliance, innovation
  tier: 'expert', // or advanced, standard
  icon: YourIcon,
  visual: {
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Badge Label',
    badgeColor: 'bg-blue-500',
  },
  capabilities: [
    'Capability 1',
    'Capability 2',
    // ... more capabilities
  ],
  useCases: [
    {
      title: 'Use Case Title',
      description: 'What users can accomplish',
      icon: '📋',
    },
    // ... more use cases
  ],
  timeToValue: 'Instant', // or '5 minutes', '1 hour', etc.
  complexity: 'medium', // low, medium, or high
  config: {
    requiredAgents: ['agent_id_1', 'agent_id_2'],
    workflowType: 'ask_expert', // or panel workflow type
    defaultParams: {
      mode: 'automatic',
      autonomous: false,
    },
  },
  route: '/your-service-route',
};
```

Then add it to the `SERVICE_TEMPLATES` array in `template-definitions.ts`.

### Using the Components

```tsx
import { ServiceTemplateCard } from '@/components/service-templates';
import { REGULATORY_ADVISORY_TEMPLATE } from '@/lib/service-templates';

function MyComponent() {
  return (
    <ServiceTemplateCard
      template={REGULATORY_ADVISORY_TEMPLATE}
      onSelect={(template) => {
        // Custom handler
        console.log('Selected:', template.name);
      }}
    />
  );
}
```

### Filtering Templates

```typescript
import { getTemplatesByCategory, getTemplatesByTier } from '@/lib/service-templates';

// Get all advisory templates
const advisoryTemplates = getTemplatesByCategory('advisory');

// Get all expert-tier templates
const expertTemplates = getTemplatesByTier('expert');
```

## Integration Points

### Ask Expert Integration
Templates with `workflowType: 'ask_expert'` route to `/ask-expert` with preset parameters:
```
/ask-expert?preset=regulatory
```

### Panel Workflow Integration
Templates with specific panel workflow types route to the Designer:
```
/ask-panel-v1?workflow=structured_panel
```

### Custom Routes
Templates can define custom routes for specialized interfaces.

## Future Enhancements

Planned features:
1. **Template Customization**: Allow users to customize template parameters before deployment
2. **Template Library**: User-created templates and sharing
3. **Usage Analytics**: Track template usage and success metrics
4. **Template Recommendations**: AI-powered template suggestions based on user context
5. **Template Versioning**: Version control for template configurations
6. **A/B Testing**: Compare template variations
7. **Template Marketplace**: Community-contributed templates

## Best Practices

1. **Naming**: Use clear, descriptive names that communicate value
2. **Descriptions**: Focus on outcomes, not just features
3. **Capabilities**: List 3-5 key capabilities, most important first
4. **Use Cases**: Provide 3 concrete, relatable examples
5. **Time to Value**: Be realistic and specific
6. **Visual Consistency**: Follow the established color and gradient patterns
7. **Icon Selection**: Choose icons that reinforce the service's purpose

## Maintenance

When updating templates:
1. Test the route/navigation
2. Verify all required agents exist
3. Ensure visual design is consistent
4. Update documentation if changing structure
5. Test on mobile and desktop viewports

## Related Documentation

- [Ask Expert Design Patterns](../features/ask-expert/README.md)
- [Panel Workflow System](../components/langgraph-gui/README.md)
- [VITAL Dashboard Layout](../components/dashboard/UNIFIED-LAYOUT-SUMMARY.md)
