# UX/UI Frontend Resources Map
**Created**: 2025-11-17
**Purpose**: Comprehensive resource guide for ux-ui-architect and frontend-ui-architect agents

---

## 📋 Table of Contents

1. [Agent Team Structure](#agent-team-structure)
2. [Documentation Resources](#documentation-resources)
3. [Design System & Components](#design-system--components)
4. [Project Structure](#project-structure)
5. [Key Reference Documents](#key-reference-documents)
6. [Implementation Guides](#implementation-guides)
7. [Quick Start for UI/UX Work](#quick-start-for-uiux-work)

---

## 🎨 Agent Team Structure

### Design Authority: ux-ui-architect
**Location**: `~/.claude/agents/ux-ui-architect.md`
**Model**: Opus (for deep design thinking)
**Role**: Senior UX/UI Design Authority (IDEO/Apple philosophy)

**Responsibilities**:
- Visual design decisions (layout, hierarchy, spacing, color, typography)
- UX strategy and user flows
- Motion and animation design
- Design system standards
- Component selection and design specifications
- Review implementation for design quality

**Expertise**:
- Human-centered design
- Visual hierarchy & composition
- Motion design
- Accessibility (WCAG)
- shadcn UI component selection
- Design systems

---

### Implementation Lead: frontend-ui-architect
**Location**: `.claude/agents/frontend-ui-architect.md`
**Model**: Sonnet (for efficient implementation)
**Role**: Elite Frontend Implementation Specialist

**Responsibilities**:
- React component implementation
- Technical architecture
- Performance optimization
- Code quality
- Accessibility implementation (technical)
- Reports to ux-ui-architect for design decisions

**Expertise**:
- React ecosystem (hooks, patterns, optimization)
- shadcn/ui implementation
- React Flow (node-based interfaces)
- Tailwind CSS
- TypeScript
- Component architecture

---

### Collaboration Pattern

```
User Request (UI/UX Work)
         ↓
┌─────────────────────────┐
│   ux-ui-architect       │
├─────────────────────────┤
│ - Design UX/UI          │
│ - Visual specifications │
│ - Interaction design    │
│ - Motion design         │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│ frontend-ui-architect   │
├─────────────────────────┤
│ - Implement in React    │
│ - Build components      │
│ - Optimize performance  │
│ - Technical excellence  │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│   ux-ui-architect       │
├─────────────────────────┤
│ - Review design quality │
│ - Approve/iterate       │
└─────────────────────────┘
```

**See**: `.claude/agents/AGENT_COORDINATION_GUIDE.md` (Pattern 4: UX/UI Design & Implementation Coordination)

---

## 📚 Documentation Resources

### Strategy & Vision Documents
**Location**: `.claude/strategy-docs/`

- **VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md** - Overall platform vision
- **VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md** - Product requirements (PRD)
- **VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md** - Architecture requirements (ARD)
- **VITAL_BUSINESS_REQUIREMENTS.md** - Business context
- **AGENT_COORDINATION_GUIDE.md** - How agents work together

---

### Product Documentation
**Location**: `.claude/vital-expert-docs/03-product/`

#### Product Requirements
- `VITAL_Ask_Expert_PRD.md` - Ask Expert feature PRD
- `VITAL_Ask_Expert_PRD_ENHANCED_v2.md` - Enhanced version
- `VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md` - Complete PRD

#### User Research
**Location**: `.claude/vital-expert-docs/03-product/user-research/`

Folders:
- `personas/` - User personas
- `journey-maps/` - User journey maps
- `user-interviews/` - User interview data

**Note**: These folders exist but may need population. Use vital-data-researcher agent to gather user research data if needed.

---

### Architecture Documentation
**Location**: `.claude/vital-expert-docs/05-architecture/`

#### Architecture Documents
- `VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md` (161KB) - Complete architecture
- `VITAL_Ask_Expert_ARD.md` - Ask Expert architecture
- `VITAL_Ask_Expert_ARD_ENHANCED_v2.md` (79KB) - Enhanced architecture
- `VITAL_BACKEND_ENHANCED_ARCHITECTURE.md` (61KB) - Backend architecture

#### Frontend Architecture
**Location**: `.claude/vital-expert-docs/05-architecture/frontend/`
**Status**: Empty (needs documentation)

**Action Item**: frontend-ui-architect should create:
- Frontend architecture document
- Component architecture patterns
- State management architecture
- Routing architecture
- Performance optimization strategies

---

### Brand & Design Identity
**Location**: `.claude/vital-expert-docs/02-brand-identity/`

Folders:
- `brand-foundation/` - Brand foundation documents
- `messaging/` - Brand messaging
- `naming-and-positioning/` - Brand positioning

**Action Item**: Check if design system documentation exists here, or create it.

---

### Service Documentation
**Location**: `.claude/vital-expert-docs/04-services/`

#### Ask Expert Service Modes
**Location**: `.claude/vital-expert-docs/04-services/ask-expert/`

- `MODE_1_INTERACTIVE_MANUAL_GOLD_STANDARD.md` - Interactive Manual mode
- `MODE_2_QUERY_MANUAL_GOLD_STANDARD.md` - Query Manual mode
- `MODE_3_QUERY_AUTOMATIC_GOLD_STANDARD.md` - Query Automatic mode
- `MODE_4_CHAT_AUTO_GOLD_STANDARD.md` - Chat Auto mode
- `README.md` - Overview

**UI/UX Relevance**: These define the user experiences that need to be designed and implemented.

---

## 🎨 Design System & Components

### shadcn/ui Configuration
**Location**: `scripts/components.json`

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

### Tailwind Configuration
**Locations**:
- `packages/config/src/tailwind/tailwind.config.js` - Shared config
- `apps/ask-panel/tailwind.config.ts` - Ask Panel app
- `apps/payers/tailwind.config.ts` - Payers app
- `apps/consulting/tailwind.config.ts` - Consulting app
- `apps/pharma/tailwind.config.ts` - Pharma app

---

### UI Component Library
**Location**: `packages/ui/src/components/`

#### Available Components (68 components)

**Layout Components**:
- `card.tsx` - Card container
- `separator.tsx` - Divider
- `scroll-area.tsx` - Scrollable areas
- `resizable.tsx` - Resizable panels
- `sidebar.tsx` (23KB) - Main sidebar navigation
- `simple-nav.tsx` - Simple navigation

**Form Components**:
- `button.tsx` - Buttons
- `input.tsx` - Text inputs
- `textarea.tsx` - Multi-line text
- `checkbox.tsx` - Checkboxes
- `switch.tsx` - Toggle switches
- `slider.tsx` - Range sliders
- `select.tsx` - Dropdowns
- `label.tsx` - Form labels

**Data Display**:
- `table.tsx` - Data tables
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars
- `agent-avatar.tsx` - Agent-specific avatars
- `progress.tsx` - Progress bars
- `skeleton.tsx` - Loading skeletons
- `loading-skeletons.tsx` (11KB) - Loading states
- `enhanced-agent-card.tsx` (11KB) - Agent cards

**Feedback Components**:
- `alert.tsx` - Alerts
- `toast.tsx` - Toast notifications
- `toaster.tsx` - Toast container
- `dialog.tsx` - Modal dialogs
- `sheet.tsx` - Side sheets

**Navigation**:
- `breadcrumb.tsx` - Breadcrumbs
- `tabs.tsx` - Tab navigation
- `dropdown-menu.tsx` - Dropdown menus
- `popover.tsx` - Popovers
- `hover-card.tsx` - Hover cards
- `tooltip.tsx` - Tooltips

**Advanced Components**:
- `collapsible.tsx` - Collapsible sections
- `toggle.tsx` - Toggle buttons
- `toggle-group.tsx` - Toggle button groups
- `icon-selection-modal.tsx` - Icon picker

**AI-Specific**:
- `ai/` - AI-specific components folder

**shadcn.io Components**:
- `shadcn-io/` - Additional shadcn components

---

## 🏗️ Project Structure

### Monorepo Architecture
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
├── .claude/                           # Agent configuration & docs
│   ├── agents/                        # Agent definitions
│   ├── strategy-docs/                 # Strategic documents
│   ├── vital-expert-docs/             # Feature documentation
│   └── UX_UI_FRONTEND_RESOURCES_MAP.md # This document
│
├── apps/                              # Frontend applications
│   ├── ask-panel/                     # Ask Panel app
│   ├── consulting/                    # Consulting app
│   ├── digital-health-startup/        # Main app
│   ├── marketing/                     # Marketing app
│   ├── payers/                        # Payers app
│   └── pharma/                        # Pharma app
│
├── packages/                          # Shared packages
│   ├── ui/                            # UI component library
│   │   └── src/components/            # 68 shadcn components
│   └── config/                        # Shared configs
│       └── src/tailwind/              # Tailwind config
│
├── docs/                              # Documentation
│   ├── implementation/                # Implementation guides
│   │   ├── ui-integration-complete.md
│   │   ├── agent-tool-ui-integration.md
│   │   └── features/                  # Feature docs
│   └── guides/                        # User guides
│
└── scripts/                           # Build scripts
    └── components.json                # shadcn config
```

---

### Key Applications

#### 1. Ask Panel (`apps/ask-panel/`)
- Main Ask Expert/Panel/Committee interface
- Primary UI/UX focus area
- Uses shadcn/ui components
- Tailwind configured

#### 2. Digital Health Startup (`apps/digital-health-startup/`)
- Largest app (111 items)
- Main platform interface
- Core user experience

#### 3. Specialized Apps
- `apps/consulting/` - Consulting-focused interface
- `apps/payers/` - Payer-specific features
- `apps/pharma/` - Pharma company interface
- `apps/marketing/` - Marketing tools

---

## 📖 Key Reference Documents

### For UX/UI Design (ux-ui-architect)

1. **Product Requirements**
   - `.claude/strategy-docs/VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md`
   - Understand what features need to be designed

2. **Service Specifications**
   - `.claude/vital-expert-docs/04-services/ask-expert/MODE_*.md`
   - Detailed specifications for each Ask Expert mode

3. **User Research** (to be populated)
   - `.claude/vital-expert-docs/03-product/user-research/`
   - User personas, journey maps, interviews

4. **Brand Guidelines** (to be created/enhanced)
   - `.claude/vital-expert-docs/02-brand-identity/`
   - Visual identity, colors, typography, voice

5. **Coordination Guide**
   - `.claude/agents/AGENT_COORDINATION_GUIDE.md`
   - How to work with other agents

---

### For Frontend Implementation (frontend-ui-architect)

1. **Architecture Requirements**
   - `.claude/strategy-docs/VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md`
   - Technical architecture context

2. **Component Library**
   - `packages/ui/src/components/`
   - 68 existing components to use/extend

3. **Implementation Guides**
   - `docs/implementation/ui-integration-complete.md`
   - `docs/implementation/agent-tool-ui-integration.md`
   - How current UI is integrated

4. **Design System Config**
   - `scripts/components.json` - shadcn config
   - `packages/config/src/tailwind/tailwind.config.js` - Tailwind

5. **Coordination Guide**
   - `.claude/agents/AGENT_COORDINATION_GUIDE.md`
   - Pattern 4: UX/UI coordination

---

## 🚀 Implementation Guides

### Current Implementation Documentation
**Location**: `docs/implementation/`

#### Key Guides:
- **ui-integration-complete.md** - Complete UI integration guide
  - Current chat architecture
  - Orchestrator integration
  - Component usage patterns

- **agent-tool-ui-integration.md** - Agent-tool UI patterns
  - How agents interact with UI
  - Tool visualization
  - Real-time updates

- **agent-enhancement-complete.md** - Agent enhancement patterns
- **langgraph-summary.md** - LangGraph workflow UI patterns
- **streaming-summary.md** - Streaming UI patterns

#### Features Documentation
**Location**: `docs/implementation/features/`
- Feature-specific implementation guides
- Integration patterns
- Code examples

---

## 🎯 Quick Start for UI/UX Work

### Scenario 1: New Feature Design

**Process**:
1. **ux-ui-architect** reviews:
   - Product requirements (PRD)
   - User research (if available)
   - Existing design patterns

2. **ux-ui-architect** creates:
   - User flow diagrams
   - Wireframes/mockups
   - Visual design specifications
   - Component selection
   - Interaction patterns
   - Motion design

3. **frontend-ui-architect** implements:
   - Review existing components (`packages/ui/src/components/`)
   - Create new components if needed
   - Implement in target app
   - Optimize performance
   - Ensure accessibility

4. **ux-ui-architect** reviews:
   - Design fidelity
   - Interaction quality
   - Visual polish
   - Approve or iterate

---

### Scenario 2: Component Library Enhancement

**When to Use**: Need a new component not in the library

**Process**:
1. **ux-ui-architect** designs:
   - Component purpose and use cases
   - Visual design (states, variants)
   - Interaction patterns
   - Accessibility requirements

2. **frontend-ui-architect** implements:
   - Create in `packages/ui/src/components/`
   - Follow shadcn/ui patterns
   - Write TypeScript types
   - Handle all states (loading, error, empty, success)
   - Add to component library

3. **ux-ui-architect** approves:
   - Component quality
   - Design consistency

---

### Scenario 3: Design System Creation

**Status**: Needed for VITAL platform

**ux-ui-architect should create**:
1. **Design System Documentation**
   - Location: `.claude/vital-expert-docs/02-brand-identity/design-system/`
   - Color palette (semantic colors)
   - Typography scale
   - Spacing system
   - Grid system
   - Component guidelines
   - Motion design principles
   - Accessibility standards

2. **Component Patterns**
   - Common compositions
   - Layout patterns
   - Navigation patterns
   - Form patterns
   - Data visualization patterns

**frontend-ui-architect should create**:
1. **Frontend Architecture Doc**
   - Location: `.claude/vital-expert-docs/05-architecture/frontend/`
   - Component architecture
   - State management patterns
   - Routing strategy
   - Performance optimization
   - Build configuration

---

## 📋 Action Items & Gaps

### Documentation Gaps (To Be Created)

1. **Design System Documentation** ⚠️
   - **Owner**: ux-ui-architect
   - **Location**: `.claude/vital-expert-docs/02-brand-identity/design-system/`
   - **Contents**:
     - VITAL_DESIGN_SYSTEM.md
     - Color palette with semantic meanings
     - Typography scale and usage
     - Spacing and grid system
     - Component design guidelines
     - Motion design principles
     - Accessibility standards (WCAG 2.1 AA minimum)

2. **Frontend Architecture Documentation** ⚠️
   - **Owner**: frontend-ui-architect
   - **Location**: `.claude/vital-expert-docs/05-architecture/frontend/`
   - **Contents**:
     - FRONTEND_ARCHITECTURE.md
     - Component architecture patterns
     - State management architecture
     - Routing architecture (Next.js App Router)
     - Performance optimization strategies
     - Build and deployment configuration

3. **User Research Documentation** ⚠️
   - **Owner**: Coordinate with strategy-vision-architect
   - **Location**: `.claude/vital-expert-docs/03-product/user-research/`
   - **Contents**:
     - User personas (4 tenant types)
     - User journey maps
     - User interview findings
     - Usability testing results

4. **Component Library Documentation** ⚠️
   - **Owner**: frontend-ui-architect
   - **Location**: `packages/ui/README.md` or `packages/ui/docs/`
   - **Contents**:
     - Component catalog
     - Usage examples
     - Composition patterns
     - Best practices

---

## 🔗 Related Agents

### Agents That Collaborate with UI/UX Team

1. **vital-accessibility-auditor**
   - Location: `~/.claude/agents/vital-accessibility-auditor.md`
   - Reviews UI for WCAG compliance
   - Tests screen reader compatibility
   - Validates keyboard navigation

2. **prd-architect**
   - Location: `.claude/agents/prd-architect.md`
   - Provides product requirements for UI
   - Defines features to be designed

3. **system-architecture-architect**
   - Location: `.claude/agents/system-architecture-architect.md`
   - Provides technical constraints
   - API contracts that UI consumes

4. **documentation-qa-lead**
   - Location: `.claude/agents/documentation-qa-lead.md`
   - Reviews design documentation quality
   - Ensures consistency

---

## 💡 Best Practices

### For ux-ui-architect

1. **Always start with user needs**
   - Review product requirements
   - Consider user personas
   - Map user journeys

2. **Design systematically**
   - Use existing components when possible
   - Create reusable patterns
   - Maintain consistency

3. **Document design decisions**
   - Explain the "why" behind choices
   - Reference design principles
   - Consider accessibility

4. **Collaborate with implementation**
   - Consult frontend-ui-architect on feasibility
   - Review implementations for design quality
   - Iterate based on technical constraints

---

### For frontend-ui-architect

1. **Leverage existing components**
   - Check `packages/ui/src/components/` first
   - Use shadcn/ui patterns
   - Compose before creating new

2. **Follow design specifications**
   - Implement exactly as designed by ux-ui-architect
   - Ask for clarification if specifications unclear
   - Request design review before finalizing

3. **Optimize performance**
   - Use React best practices
   - Memoize expensive operations
   - Lazy load when appropriate
   - Monitor bundle size

4. **Ensure accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Proper contrast ratios

---

## 📞 Getting Help

### Questions About:

- **Design decisions**: Consult ux-ui-architect
- **Implementation**: Consult frontend-ui-architect
- **Product requirements**: Consult prd-architect
- **Architecture**: Consult system-architecture-architect
- **Accessibility**: Consult vital-accessibility-auditor
- **Coordination**: See `.claude/agents/AGENT_COORDINATION_GUIDE.md`

---

## 🎉 Summary

This document provides a complete map of all resources available to support UI/UX and frontend development for the VITAL platform. The ux-ui-architect and frontend-ui-architect agents work together with clear separation of concerns:

- **Design Authority**: ux-ui-architect makes all design decisions
- **Implementation Excellence**: frontend-ui-architect implements with technical excellence
- **Collaboration**: Both work together through the coordination pattern defined in AGENT_COORDINATION_GUIDE.md

**Key Resources**:
- 📁 68 shadcn/ui components in `packages/ui/src/components/`
- 📚 Complete documentation in `.claude/vital-expert-docs/`
- 🎨 Design system configuration ready (needs documentation)
- 🏗️ Monorepo with 6 apps to design/implement for
- 🤝 Clear collaboration patterns established

**Next Steps**:
1. Create Design System Documentation (ux-ui-architect)
2. Create Frontend Architecture Documentation (frontend-ui-architect)
3. Populate User Research Documentation
4. Begin designing/implementing VITAL features

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
**Maintained By**: UX/UI Agent Team
