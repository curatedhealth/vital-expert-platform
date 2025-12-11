# VITAL Platform Design Tokens Specification

**Version:** 2.0
**Status:** Aligned with Brand Guidelines v5.0
**Last Updated:** December 2024

---

## Overview

This document defines the design token system for the VITAL platform - a **transformation and innovation platform** that orchestrates intelligence.

**Brand Essence:** "Human Genius, Amplified"
**Visual Philosophy:** Clean Modernism - Bauhaus precision with soft, radiant surfaces

---

## 1. Color Tokens

### 1.1 Primary Canvas (CRITICAL)

```css
/* VITAL uses soft white tones for a clean, modern feel */
--canvas-primary: #FFFAFA;        /* Snow - Softly Radiant - 80-90% of interface */
--canvas-surface: #FFFFFF;        /* Pure white - elevated cards, modals */
--canvas-alt: #F8F8FF;            /* Ghost White - Whisper of Cool - alternate surfaces */
--canvas-muted: #FAF9F6;          /* Off White - The Soft Touch - subtle backgrounds */
```

### 1.2 Expert Purple (Brand Primary)

```css
/* Expert Purple - Primary brand color for intelligence/strategy */
--primary: #9B5DE0;               /* Expert Purple - main accent */
--primary-light: #EDE9FE;         /* Purple-50 - light backgrounds */
--primary-hover: #8B4CD0;         /* Darker for hover states */
--primary-dark: #6D28D9;          /* Purple-700 - strong emphasis */
```

### 1.3 Structural Neutrals (Cool Tones)

```css
/* Cool neutral scale - aligned with Snow/Ghost White background */
--neutral-50: #FAFAFA;            /* Lightest gray - subtle backgrounds */
--neutral-100: #F5F5F5;           /* Light gray - surface */
--neutral-200: #EEEEEE;           /* UI surfaces, borders, dividers */
--neutral-300: #E0E0E0;           /* Input borders */
--neutral-400: #BDBDBD;           /* Secondary strokes, disabled */
--neutral-500: #9E9E9E;           /* Placeholder text */
--neutral-600: #757575;           /* Secondary text, icons */
--neutral-700: #616161;           /* Body text */
--neutral-800: #424242;           /* Headings */
--neutral-900: #212121;           /* Primary text, structure */
```

### 1.4 Tenant Identity Colors

```css
/* Each tenant/domain has a signature color */
--tenant-expert: #9B5DE0;         /* Strategy, Intelligence (Primary) */
--tenant-pharma: #0046FF;         /* Precision, Compliance */
--tenant-startup: #292621;        /* Foundation, Rigor */
--tenant-medical: #EF4444;        /* Urgency, Clinical */
--tenant-foresight: #FF3796;      /* Prediction, Vision */
--tenant-systems: #00B5AD;        /* Infrastructure, Flow */
--tenant-velocity: #FF6B00;       /* Energy, Acceleration */
--tenant-research: #4F46E5;       /* Academic, Structured */
```

### 1.5 Semantic States

```css
/* Status colors for feedback */
--success: #22c55e;               /* Confirmations, completed */
--success-light: #DCFCE7;         /* Success backgrounds */
--warning: #f59e0b;               /* Cautions, review required */
--warning-light: #FEF3C7;         /* Warning backgrounds */
--error: #ef4444;                 /* Critical issues, failures */
--error-light: #FEE2E2;           /* Error backgrounds */
--info: #3b82f6;                  /* Informational messages */
--info-light: #DBEAFE;            /* Info backgrounds */
```

### 1.6 AgentOS Level Colors

```css
/* AgentOS 3.0 Hierarchy - 5 Levels */

/* Level 1: MASTER (Orchestrators) - Expert Purple */
--level-1: #9B5DE0;
--level-1-bg: #EDE9FE;

/* Level 2: EXPERT (Domain Specialists) - Strong Tenant Color */
--level-2: var(--tenant-expert);  /* Uses tenant color */
--level-2-bg: #F5F3FF;

/* Level 3: SPECIALIST (Sub-Experts) - 40% opacity of tenant */
--level-3: rgba(155, 93, 224, 0.4);
--level-3-bg: #FAF8F1;

/* Level 4: WORKER (Task Executors) - Monochrome */
--level-4: #1A1A1A;
--level-4-bg: #F5F3EC;

/* Level 5: TOOL (Integrations) - Neutral outlined */
--level-5: #555555;
--level-5-bg: transparent;
```

---

## 2. Typography Tokens

### 2.1 Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 2.2 Font Sizes

```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### 2.3 Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 2.4 Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 2.5 Typography Presets

| Preset | Size | Weight | Line Height | Use Case |
|--------|------|--------|-------------|----------|
| `display` | 3rem | 700 | 1.2 | Hero headings |
| `h1` | 2.25rem | 700 | 1.2 | Page titles |
| `h2` | 1.875rem | 600 | 1.3 | Section headings |
| `h3` | 1.5rem | 600 | 1.4 | Subsection headings |
| `h4` | 1.25rem | 600 | 1.4 | Card headings |
| `body-lg` | 1.125rem | 400 | 1.6 | Large body text |
| `body` | 1rem | 400 | 1.6 | Default body text |
| `body-sm` | 0.875rem | 400 | 1.5 | Secondary text |
| `caption` | 0.75rem | 400 | 1.5 | Captions, labels |
| `code` | 0.875rem | 400 | 1.6 | Code blocks |

---

## 3. Spacing Tokens

### 3.1 Base Spacing Scale

```css
--space-0: 0;
--space-px: 1px;
--space-0.5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1.5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2.5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3.5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

### 3.2 Semantic Spacing

```css
/* Component internal spacing */
--space-component-xs: var(--space-2);   /* 8px - tight */
--space-component-sm: var(--space-3);   /* 12px - compact */
--space-component-md: var(--space-4);   /* 16px - default */
--space-component-lg: var(--space-6);   /* 24px - spacious */
--space-component-xl: var(--space-8);   /* 32px - loose */

/* Section spacing */
--space-section-sm: var(--space-8);     /* 32px */
--space-section-md: var(--space-12);    /* 48px */
--space-section-lg: var(--space-16);    /* 64px */
--space-section-xl: var(--space-24);    /* 96px */
```

---

## 4. Border Radius Tokens

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.25rem;    /* 4px - inputs */
--radius-lg: 0.5rem;     /* 8px - cards */
--radius-xl: 0.75rem;    /* 12px - dialogs */
--radius-2xl: 1rem;      /* 16px - large cards */
--radius-3xl: 1.5rem;    /* 24px - hero elements */
--radius-full: 9999px;   /* Circles, pills */
```

---

## 5. Shadow Tokens

```css
/* Elevation shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
--shadow-none: none;

/* Colored shadows for focus states */
--shadow-ring: 0 0 0 2px var(--primary-500);
--shadow-ring-offset: 0 0 0 4px var(--primary-200);
```

---

## 6. Animation Tokens

### 6.1 Durations

```css
--duration-fastest: 50ms;
--duration-faster: 100ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
--duration-slowest: 500ms;
```

### 6.2 Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 6.3 Animation Presets

```css
/* Fade animations */
--animate-fade-in: fade-in var(--duration-normal) var(--ease-out);
--animate-fade-out: fade-out var(--duration-normal) var(--ease-in);

/* Scale animations */
--animate-scale-in: scale-in var(--duration-fast) var(--ease-out);
--animate-scale-out: scale-out var(--duration-fast) var(--ease-in);

/* Slide animations */
--animate-slide-in-right: slide-in-right var(--duration-normal) var(--ease-out);
--animate-slide-in-left: slide-in-left var(--duration-normal) var(--ease-out);
--animate-slide-in-up: slide-in-up var(--duration-normal) var(--ease-out);
--animate-slide-in-down: slide-in-down var(--duration-normal) var(--ease-out);

/* Shimmer loading animation */
--animate-shimmer: shimmer 2s infinite;
```

---

## 7. Z-Index Tokens

```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

---

## 8. Breakpoint Tokens

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

---

## 9. Component-Specific Tokens

### 9.1 Button Tokens

```css
/* Button heights */
--button-height-xs: 1.75rem;   /* 28px */
--button-height-sm: 2rem;      /* 32px */
--button-height-md: 2.5rem;    /* 40px */
--button-height-lg: 2.75rem;   /* 44px */
--button-height-xl: 3rem;      /* 48px */

/* Button padding */
--button-padding-x-xs: 0.5rem;
--button-padding-x-sm: 0.75rem;
--button-padding-x-md: 1rem;
--button-padding-x-lg: 1.25rem;
--button-padding-x-xl: 1.5rem;
```

### 9.2 Input Tokens

```css
/* Input heights */
--input-height-sm: 2rem;       /* 32px */
--input-height-md: 2.5rem;     /* 40px */
--input-height-lg: 2.75rem;    /* 44px */

/* Input padding */
--input-padding-x: 0.75rem;
--input-padding-y: 0.5rem;
```

### 9.3 Card Tokens

```css
/* Card padding */
--card-padding-sm: var(--space-4);
--card-padding-md: var(--space-6);
--card-padding-lg: var(--space-8);

/* Card border radius */
--card-radius: var(--radius-lg);
```

### 9.4 Sidebar Tokens

```css
/* Sidebar widths */
--sidebar-width: 16rem;          /* 256px - default */
--sidebar-width-collapsed: 4rem; /* 64px - collapsed */
--sidebar-width-expanded: 20rem; /* 320px - expanded */
```

---

## 10. Implementation

### 10.1 CSS Variables Setup

```css
/* globals.css */
:root {
  /* Import all tokens here */
  @import './tokens/colors.css';
  @import './tokens/typography.css';
  @import './tokens/spacing.css';
  @import './tokens/shadows.css';
  @import './tokens/animations.css';
}

/* Dark mode overrides */
.dark {
  --primary-50: hsl(221, 83%, 15%);
  --primary-100: hsl(221, 83%, 20%);
  /* ... dark mode colors */
}
```

### 10.2 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          // ...
        },
      },
      spacing: {
        'component-xs': 'var(--space-component-xs)',
        'component-sm': 'var(--space-component-sm)',
        // ...
      },
      borderRadius: {
        'card': 'var(--card-radius)',
      },
      boxShadow: {
        'ring': 'var(--shadow-ring)',
        'ring-offset': 'var(--shadow-ring-offset)',
      },
    },
  },
};
```

### 10.3 TypeScript Types

```typescript
// types/tokens.ts
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Tokens {
  colors: {
    primary: ColorScale;
    success: Pick<ColorScale, 50 | 500 | 700>;
    warning: Pick<ColorScale, 50 | 500 | 700>;
    error: Pick<ColorScale, 50 | 500 | 700>;
    neutral: ColorScale;
  };
  typography: {
    fontFamily: { sans: string; mono: string };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  zIndex: Record<string, number>;
  breakpoint: Record<string, string>;
}
```

---

---

## 11. Migration Notes

### 11.1 Gray to Neutral Migration (Dec 2024)

All hardcoded Tailwind CSS `gray-*` classes have been migrated to `neutral-*` to align with the token system defined in Section 1.3.

**Migration Pattern:**
```
bg-gray-* → bg-neutral-*
text-gray-* → text-neutral-*
border-gray-* → border-neutral-*
hover:bg-gray-* → hover:bg-neutral-*
dark:*-gray-* → dark:*-neutral-*
```

**Exceptions (preserved):**
- `vital-gray-*` - Brand CSS variables
- `bg-white/20`, `bg-black/10` - Opacity overlays

**Files migrated:** ~120 files
**Tokens fixed:** ~900+ occurrences

See `GRAY_TO_NEUTRAL_MIGRATION.md` for complete migration log.

### 11.2 Recommended Usage

| Use Case | Token | Example Class |
|----------|-------|---------------|
| Page background | `--neutral-50` | `bg-neutral-50` |
| Card surface | `--neutral-100` | `bg-neutral-100` |
| Borders/dividers | `--neutral-200` | `border-neutral-200` |
| Input borders | `--neutral-300` | `border-neutral-300` |
| Disabled text | `--neutral-400` | `text-neutral-400` |
| Placeholder | `--neutral-500` | `placeholder-neutral-500` |
| Secondary text | `--neutral-600` | `text-neutral-600` |
| Body text | `--neutral-700` | `text-neutral-700` |
| Headings | `--neutral-800` | `text-neutral-800` |
| Primary text | `--neutral-900` | `text-neutral-900` |
| Dark code blocks | `--neutral-950` | `bg-neutral-950` |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Design Team | Initial specification |
| 2.0 | Dec 2024 | Claude | Added gray→neutral migration notes |
