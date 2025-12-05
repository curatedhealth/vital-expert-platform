# VITAL Frontend Directory

This directory contains frontend documentation, design system references, and archived deprecated code.

## Directory Structure

```
frontend/
├── _archive/                    # Archived deprecated code (DO NOT USE)
│   ├── api-routes/             # Disabled API routes
│   ├── components/             # Deprecated UI components
│   ├── core/                   # Disabled core systems
│   ├── features/               # Deprecated feature code
│   └── ...                     # Other archived system files
├── docs/                       # Frontend documentation
└── design-system/              # Design tokens and guidelines
```

## Archive Contents

The `_archive/` folder contains code that has been deprecated and is kept for reference only.
These files should NOT be used in production:

- **Core systems**: Advanced consensus builders, workflow orchestrators, monitoring systems
- **API routes**: Secured routes, enhanced chat endpoints, analytics dashboards
- **Components**: Legacy chat interfaces, workflow orchestrators
- **Features**: Deprecated service files, backup components

## Active Frontend Code

The active frontend codebase remains in:
- `apps/vital-system/src/` - Main application source
- `packages/ui/` - Shared UI components

## Design System

See `.claude/docs/architecture/frontend/DESIGN_TOKENS.md` for the design token specification.

### Key Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--canvas-primary` | #FFFAFA (Snow) | Main background (80-90% of UI) |
| `--canvas-surface` | #FFFFFF | Elevated cards, modals |
| `--vital-primary-500` | #9B5DE0 | Expert Purple - brand color |
| `--neutral-{50-900}` | Cool gray scale | Text, borders, surfaces |

## Navigation Structure

The frontend uses a 5-group navigation:

1. **Hub** - Dashboard home
2. **Consult** - AI consultation (Ask Expert, Ask Panel, Quick Chat)
3. **Craft** - Build tools (Agent Builder, Workflow Studio, etc.)
4. **Discover** - Browse assets (Agents, Knowledge, Personas, etc.)
5. **Optimize** - Analytics (Value View, Insights, Tools)
