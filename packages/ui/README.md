# @vital/ui

**Version:** 0.1.0  
**Purpose:** Shared UI components for VITAL Platform (shadcn/ui based)

---

## Overview

This package provides shared UI components built on top of shadcn/ui and Radix UI primitives. These components are used across the VITAL Platform frontend for consistent UI/UX.

---

## Installation

```bash
pnpm add @vital/ui
```

---

## Usage

### Basic Components

```typescript
import { Button, Card, Dialog } from '@vital/ui';

function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
      <Dialog>
        {/* Dialog content */}
      </Dialog>
    </Card>
  );
}
```

### Component Exports

```typescript
// Import specific components
import { Button } from '@vital/ui/components/button';
import { Card } from '@vital/ui/components/card';
import { Dialog } from '@vital/ui/components/dialog';
```

### Utilities

```typescript
import { cn } from '@vital/ui/lib/utils';

// Merge Tailwind classes
const className = cn('base-class', condition && 'conditional-class');
```

---

## Structure

```
ui/
├── src/
│   ├── components/        # UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── lib/
│       └── utils.ts        # Utility functions (cn, etc.)
└── package.json
```

---

## Exports

| Export | Path | Description |
|--------|------|-------------|
| `.` | `src/index.ts` | Main component exports |
| `./components/*` | `src/components/*` | Individual components |
| `./lib/*` | `src/lib/*` | Utility functions |

---

## Available Components

- **Button** - Button component with variants
- **Card** - Card container component
- **Dialog** - Modal dialog component
- **Input** - Form input component
- **Label** - Form label component
- **Select** - Dropdown select component
- **Tabs** - Tab navigation component
- **Toast** - Toast notification component
- And more...

---

## Features

- ✅ **shadcn/ui Based** - Built on Radix UI primitives
- ✅ **Tailwind CSS** - Styled with Tailwind
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Accessible** - ARIA compliant components
- ✅ **Customizable** - Easy to theme and extend

---

## Dependencies

- `@radix-ui/*` - Radix UI primitives
- `class-variance-authority` - Component variants
- `clsx` - Class name utilities
- `tailwind-merge` - Tailwind class merging
- `lucide-react` - Icons

---

## Styling

Components use Tailwind CSS and can be customized via:

1. **Tailwind Config** - Extend theme in `tailwind.config.js`
2. **CSS Variables** - Override CSS variables for theming
3. **Component Props** - Use variant props for styling

---

## License

Private - VITAL Path Platform
