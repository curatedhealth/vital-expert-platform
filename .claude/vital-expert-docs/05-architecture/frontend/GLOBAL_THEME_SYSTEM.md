# Global Dark/Light Mode Theme System

**Date**: November 18, 2025
**Status**: 📋 TO BE IMPLEMENTED
**Package**: `next-themes@^0.4.6` (already installed)

---

## Current State

### Ask Expert Page (Local Dark Mode)
**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Current Implementation**:
```typescript
// Line 232 - Local state (Ask Expert only)
const [darkMode, setDarkMode] = useState(false);

// Line 1784 - Applied only to Ask Expert view
<div className={`flex flex-col h-full w-full ${darkMode ? 'dark bg-gray-950' : 'bg-white'}`}>

// Line 1828 - Toggle button (Ask Expert only)
<button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? (
    <Sun className="w-4 h-4 text-gray-400" />
  ) : (
    <Moon className="w-4 h-4 text-gray-600" />
  )}
</button>
```

**Issues**:
- ❌ Dark mode only works in Ask Expert view
- ❌ Does not persist across page navigation
- ❌ Not available in other views (Dashboard, Agents, Workflows, etc.)
- ❌ State is lost on page refresh
- ❌ No system preference detection

---

## Target State (Global Theme System)

### Goal
Move from **local Ask Expert dark mode** → **global application-wide theme system** that:
- ✅ Works across ALL views (Dashboard, Ask Expert, Agents, Workflows, Knowledge, Admin, etc.)
- ✅ Persists user preference in localStorage
- ✅ Respects system dark mode preference
- ✅ Provides 3 options: Light, Dark, System
- ✅ Smooth transitions between theme changes
- ✅ Single source of truth for theme state

---

## Implementation Plan

### Phase 1: Create Global Theme Provider

**File**: `apps/digital-health-startup/src/components/providers/theme-provider.tsx`

```typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### Phase 2: Add ThemeProvider to Root Layout

**File**: `apps/digital-health-startup/src/app/layout.tsx`

**Before**:
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <SupabaseAuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </SupabaseAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

**After**:
```typescript
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SupabaseAuthProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Changes**:
- Added `suppressHydrationWarning` to `<html>` tag (required for next-themes)
- Wrapped entire app in `ThemeProvider`
- Configured with `attribute="class"` (adds/removes `dark` class to `<html>`)
- `defaultTheme="system"` respects user's OS preference
- `enableSystem` enables system preference detection

### Phase 3: Create Global Theme Toggle Component

**File**: `apps/digital-health-startup/src/components/theme-toggle.tsx`

```typescript
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle version (no dropdown)
export function ThemeToggleSimple() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### Phase 4: Add Theme Toggle to MainNavbar

**File**: `apps/digital-health-startup/src/components/navbar/MainNavbar.tsx`

```typescript
import { ThemeToggle } from '@/components/theme-toggle';

// Inside the navbar, add to user menu section
<div className="ml-auto flex items-center gap-2">
  {/* Theme Toggle */}
  <ThemeToggle />

  {/* User Dropdown */}
  <DropdownMenu>
    {/* ... existing user menu ... */}
  </DropdownMenu>
</div>
```

### Phase 5: Update Ask Expert Page

**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Remove local dark mode state**:
```typescript
// DELETE LINE 232
const [darkMode, setDarkMode] = useState(false);
```

**Remove local toggle button** (line 1828):
```typescript
// DELETE LINES 1827-1836
<button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? (
    <Sun className="w-4 h-4 text-gray-400" />
  ) : (
    <Moon className="w-4 h-4 text-gray-600" />
  )}
</button>
```

**Update container div** (line 1784):
```typescript
// BEFORE
<div className={`flex flex-col h-full w-full ${darkMode ? 'dark bg-gray-950' : 'bg-white'}`}>

// AFTER (remove manual dark class, let ThemeProvider handle it)
<div className="flex flex-col h-full w-full bg-white dark:bg-gray-950">
```

**All `dark:` classes will now work automatically** based on global theme!

---

## Tailwind Configuration

**File**: `apps/digital-health-startup/tailwind.config.ts`

Ensure dark mode is set to `class`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // ✅ Must be 'class' for next-themes
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ... your theme extensions
    },
  },
  plugins: [],
};

export default config;
```

---

## Global CSS Updates

**File**: `apps/digital-health-startup/src/app/globals.css`

Add smooth theme transitions:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other CSS variables ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other CSS variables for dark mode ... */
  }
}

/* Smooth transitions for theme changes */
* {
  @apply transition-colors duration-200;
}

/* Prevent flash of wrong theme */
html {
  color-scheme: light dark;
}

html.dark {
  color-scheme: dark;
}
```

---

## Usage Across Views

Once implemented, **any component** can use the theme:

### Example 1: Dashboard
```typescript
'use client';

import { useTheme } from 'next-themes';

export function Dashboard() {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

### Example 2: Agent Card
```typescript
<Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
  <CardContent>
    <h3 className="text-gray-900 dark:text-white">Agent Name</h3>
    <p className="text-gray-600 dark:text-gray-400">Description</p>
  </CardContent>
</Card>
```

### Example 3: Buttons
```typescript
<Button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
  Click Me
</Button>
```

---

## Where to Add Theme Toggle

### Primary Location (Recommended)
**MainNavbar** - Visible on all pages
- File: `apps/digital-health-startup/src/components/navbar/MainNavbar.tsx`
- Location: Next to user menu in top-right corner

### Secondary Locations (Optional)
1. **Settings Page** - Full theme configuration
2. **User Profile Dropdown** - Quick access
3. **AppSidebar Footer** - Alternative location

---

## Files to Modify

### New Files
1. ✅ `src/components/providers/theme-provider.tsx` - Theme provider wrapper
2. ✅ `src/components/theme-toggle.tsx` - Theme toggle component

### Modified Files
1. ✅ `src/app/layout.tsx` - Add ThemeProvider
2. ✅ `src/components/navbar/MainNavbar.tsx` - Add theme toggle
3. ✅ `src/app/(app)/ask-expert/page.tsx` - Remove local dark mode
4. ✅ `tailwind.config.ts` - Verify `darkMode: 'class'`
5. ✅ `src/app/globals.css` - Add smooth transitions

---

## Benefits

### User Experience
- ✅ Consistent theme across entire application
- ✅ Theme persists across navigation
- ✅ Respects system dark mode preference
- ✅ Choice of Light, Dark, or System
- ✅ No flash of wrong theme on load

### Developer Experience
- ✅ Single source of truth (`useTheme` hook)
- ✅ No prop drilling for theme state
- ✅ Easy to use `dark:` Tailwind classes anywhere
- ✅ Automatic localStorage persistence
- ✅ SSR-safe implementation

### Performance
- ✅ No layout shift on theme change
- ✅ Optimized with CSS variables
- ✅ Minimal JavaScript for theme switching
- ✅ Fast transitions (200ms)

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create `theme-provider.tsx`
- [ ] Add ThemeProvider to root layout
- [ ] Verify `darkMode: 'class'` in Tailwind config
- [ ] Add smooth transitions to globals.css

### Phase 2: Theme Toggle
- [ ] Create `theme-toggle.tsx` component
- [ ] Add ThemeToggle to MainNavbar
- [ ] Test toggle functionality

### Phase 3: Remove Local Dark Mode
- [ ] Remove `darkMode` state from Ask Expert (line 232)
- [ ] Remove local toggle button (lines 1827-1836)
- [ ] Update container div to use global dark class
- [ ] Remove any `darkMode` prop passing

### Phase 4: Testing
- [ ] Test theme works in Ask Expert
- [ ] Test theme works in Dashboard
- [ ] Test theme works in all other views
- [ ] Test theme persists after page refresh
- [ ] Test theme syncs across tabs
- [ ] Test system preference detection
- [ ] Test smooth transitions

### Phase 5: Documentation
- [ ] Update component documentation
- [ ] Add theme usage examples
- [ ] Document dark mode color palette
- [ ] Create style guide for dark mode

---

## Related Documentation

- [Ask Expert Header Standardization](./ASK_EXPERT_HEADER_STANDARDIZATION.md)
- [Lucide Modern Theme Implementation](../../../docs/archive/misc/LUCIDE_MODERN_THEME_IMPLEMENTATION.md)
- [Sidebar Design System](./SIDEBAR_DESIGN_SYSTEM.md)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)

---

## Current vs Future State

| Feature | Current (Local) | Future (Global) |
|---------|----------------|-----------------|
| **Scope** | Ask Expert only | All views |
| **Persistence** | ❌ Lost on refresh | ✅ localStorage |
| **System Preference** | ❌ Not supported | ✅ Auto-detect |
| **Toggle Location** | Ask Expert header | MainNavbar |
| **State Management** | `useState` (local) | `next-themes` (global) |
| **SSR Support** | ❌ Client-only | ✅ SSR-safe |
| **Options** | Light/Dark | Light/Dark/System |

---

## Status

**Current**: ❌ Local dark mode in Ask Expert only
**Target**: ✅ Global theme system across all views
**Package**: `next-themes@^0.4.6` ✅ Already installed
**Ready to Implement**: ✅ Yes - All dependencies available

---

## Next Steps

1. Create theme provider component
2. Add to root layout
3. Create theme toggle component
4. Add toggle to MainNavbar
5. Remove local dark mode from Ask Expert
6. Test across all views
7. Update documentation
