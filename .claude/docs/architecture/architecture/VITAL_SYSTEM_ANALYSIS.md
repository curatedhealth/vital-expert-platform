# Vital System App - Tenant Switcher & Theme Analysis

**Date**: 2025-11-18
**App**: `apps/vital-system`
**Status**: ✅ Already Fully Implemented

---

## Executive Summary

The `vital-system` app already has **both** tenant switcher logos and theme-aware components fully implemented. Unlike `digital-health-startup` which needed updates, `vital-system` is already in the target state.

---

## 1. Tenant Switcher Analysis

### ✅ MainNavbar.tsx - Already Using Logos

**Location**: [apps/vital-system/src/components/navbar/MainNavbar.tsx](apps/vital-system/src/components/navbar/MainNavbar.tsx)

**Current Implementation**:
```typescript
// Lines 79-87 - Button with Actual Logo
<div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-white">
  <Image
    src={activeTenant.logo}
    alt={activeTenant.name}
    width={48}
    height={48}
    className="size-12 object-contain"
  />
</div>

// Lines 103-110 - Dropdown with Actual Logos
<div className="flex size-14 items-center justify-center rounded-lg bg-white border">
  <Image
    src={tenant.logo}
    alt={tenant.name}
    width={56}
    height={56}
    className="size-14 object-contain"
  />
</div>
```

**Tenant Configuration**:
```typescript
// Lines 42-58
const tenants = [
  {
    name: 'Vital Expert',
    logo: '/logos/vital-expert-logo.svg',
    plan: 'Enterprise',
  },
  {
    name: 'Vital Pharma',
    logo: '/logos/vital-pharma-logo.svg',
    plan: 'Pro',
  },
  {
    name: 'Vital Startup',
    logo: '/logos/vital-startup-logo.svg',
    plan: 'Free',
  },
]
```

**Status**: ✅ **Already implemented** - No changes needed

---

### ✅ Sidebar Tenant Switcher - Already Using Logos

**Location**: [apps/vital-system/src/components/tenant-switcher.tsx](apps/vital-system/src/components/tenant-switcher.tsx)

**Current Implementation**:
```typescript
// Lines 48-56 - Sidebar button with logo
<div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
  <Image
    src={activeTenant.logo}
    alt={activeTenant.name}
    width={40}
    height={40}
    className="size-10"
  />
</div>

// Lines 72-79 - Dropdown items with logos
<div className="flex size-12 items-center justify-center rounded-sm border">
  <Image
    src={tenant.logo}
    alt={tenant.name}
    width={48}
    height={48}
    className="size-12"
  />
</div>
```

**Status**: ✅ **Already implemented** - No changes needed

---

### ✅ Logo Files - Already Present

**Location**: `apps/vital-system/public/logos/`

```bash
$ ls -la apps/vital-system/public/logos/
total 24
drwxr-xr-x@ 5 hichamnaim  staff  160 Nov 18 12:11 .
drwxr-xr-x@ 7 hichamnaim  staff  224 Nov 18 12:10 ..
-rw-r--r--@ 1 hichamnaim  staff  658 Nov 18 12:11 vital-expert-logo.svg
-rw-r--r--@ 1 hichamnaim  staff  787 Nov 18 12:11 vital-pharma-logo.svg
-rw-r--r--@ 1 hichamnaim  staff  800 Nov 18 12:11 vital-startup-logo.svg
```

**Status**: ✅ All three tenant logos are present

---

## 2. Theme System Analysis

### Current State: Local Dark Mode in Ask Expert Only

**Location**: [apps/vital-system/src/app/(app)/ask-expert/page.tsx:232](apps/vital-system/src/app/(app)/ask-expert/page.tsx#L232)

```typescript
// Line 232 - Local dark mode state
const [darkMode, setDarkMode] = useState(false);
```

**Issue**: Same as `digital-health-startup` - dark mode is local to Ask Expert page only, not global.

---

### ✅ next-themes Package - Already Installed

**Location**: [apps/vital-system/package.json:131](apps/vital-system/package.json#L131)

```json
"next-themes": "^0.4.6"
```

**Status**: ✅ Package is installed and ready

---

### ✅ Sonner.tsx - Already Theme-Aware

**Location**: [apps/vital-system/src/components/ui/sonner.tsx](apps/vital-system/src/components/ui/sonner.tsx)

```typescript
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // ... other props
    />
  )
}
```

**Status**: ✅ Already using `useTheme` from next-themes

---

### ⚠️ Root Layout - Missing ThemeProvider

**Location**: [apps/vital-system/src/app/layout.tsx](apps/vital-system/src/app/layout.tsx)

**Current State**:
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

**Missing**: ThemeProvider wrapper

**Status**: ⚠️ **Needs implementation** - Same as digital-health-startup

---

## 3. Comparison: vital-system vs digital-health-startup

| Feature | vital-system | digital-health-startup |
|---------|--------------|------------------------|
| **MainNavbar Logos** | ✅ Already implemented | ✅ Recently updated |
| **Sidebar Tenant Switcher** | ✅ Already implemented | ✅ Already had it |
| **Logo SVG Files** | ✅ All 3 present | ✅ All 3 present |
| **next-themes Package** | ✅ Installed (v0.4.6) | ✅ Installed (v0.4.6) |
| **Sonner Theme-Aware** | ✅ Already using useTheme | ✅ Already using useTheme |
| **Local Dark Mode in Ask Expert** | ⚠️ Line 232 | ⚠️ Line 232 |
| **ThemeProvider in Layout** | ❌ Missing | ❌ Missing |
| **Global Theme System** | 📝 Documented | 📝 Documented |

---

## 4. Recommendations for vital-system

### ✅ No Tenant Switcher Changes Needed

The tenant switcher in `vital-system` is **already in the target state** with:
- Actual logo images in MainNavbar
- Actual logo images in sidebar tenant-switcher
- All 3 SVG logo files present
- Proper Next.js Image components
- Correct sizing (48x48 in navbar, 56x56 in dropdown)

**Action**: None needed - already implemented correctly

---

### 📝 Global Theme System - Follow Same Plan as digital-health-startup

Since `vital-system` has the **exact same** local dark mode pattern as `digital-health-startup`, use the same implementation plan:

**Reference Documentation**: [GLOBAL_THEME_SYSTEM.md](./GLOBAL_THEME_SYSTEM.md)

**Implementation Phases**:

#### Phase 1: Create Theme Provider
```typescript
// apps/vital-system/src/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### Phase 2: Update Root Layout
```typescript
// apps/vital-system/src/app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';

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

#### Phase 3: Create Theme Toggle Component
```typescript
// apps/vital-system/src/components/theme-toggle.tsx
'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Phase 4: Add ThemeToggle to MainNavbar

**Location**: [apps/vital-system/src/components/navbar/MainNavbar.tsx:137](apps/vital-system/src/components/navbar/MainNavbar.tsx#L137)

```typescript
// Add import
import { ThemeToggle } from '@/components/theme-toggle';

// In the component, around line 137 (before user menu dropdown):
<div className="ml-auto flex items-center gap-2">
  {/* Add Theme Toggle */}
  <ThemeToggle />

  {/* Existing User Menu */}
  <DropdownMenu>
    {/* ... existing user menu code ... */}
  </DropdownMenu>
</div>
```

#### Phase 5: Remove Local Dark Mode from Ask Expert

**Location**: [apps/vital-system/src/app/(app)/ask-expert/page.tsx:232](apps/vital-system/src/app/(app)/ask-expert/page.tsx#L232)

**Changes Required**:
1. Remove line 232: `const [darkMode, setDarkMode] = useState(false);`
2. Remove dark mode toggle button from UI
3. Remove dark mode conditional className logic
4. Theme will now be controlled globally via ThemeProvider

---

## 5. Implementation Checklist for vital-system

### Tenant Switcher: ✅ COMPLETE
- [x] MainNavbar using actual logos
- [x] Sidebar tenant-switcher using actual logos
- [x] All 3 logo SVG files present
- [x] Proper Next.js Image components
- [x] Correct sizing and styling

### Global Theme System: 📝 TO-DO (Same as digital-health-startup)
- [ ] Create theme-provider.tsx
- [ ] Add ThemeProvider to root layout.tsx
- [ ] Create theme-toggle.tsx component
- [ ] Add ThemeToggle to MainNavbar.tsx
- [ ] Remove local dark mode from Ask Expert page.tsx
- [ ] Test theme switching across all views
- [ ] Verify theme persistence
- [ ] Verify SSR hydration

---

## 6. Key Findings

1. **Tenant Switcher**: ✅ **vital-system is ahead of digital-health-startup** - it already had logos implemented in MainNavbar before we updated digital-health-startup

2. **Theme System**: ⚠️ **Both apps have the same gap** - local dark mode in Ask Expert only, need global ThemeProvider

3. **Package Readiness**: ✅ Both apps have `next-themes@^0.4.6` installed and `sonner.tsx` already using `useTheme`

4. **Implementation Path**: 📝 Use the exact same 5-phase plan documented in [GLOBAL_THEME_SYSTEM.md](./GLOBAL_THEME_SYSTEM.md)

---

## 7. Related Documentation

- [TENANT_SWITCHER_LOGO_UPDATE.md](./TENANT_SWITCHER_LOGO_UPDATE.md) - digital-health-startup tenant switcher update (vital-system already had this)
- [GLOBAL_THEME_SYSTEM.md](./GLOBAL_THEME_SYSTEM.md) - Global theme implementation plan (applies to both apps)
- [ASK_EXPERT_SIDEBAR_ALIGNMENT.md](./ASK_EXPERT_SIDEBAR_ALIGNMENT.md) - Sidebar collapsible design system

---

## 8. Next Steps

### For vital-system:
1. **Skip tenant switcher updates** - already correctly implemented ✅
2. **Implement global theme system** - follow 5-phase plan from GLOBAL_THEME_SYSTEM.md 📝
3. **Test theme switching** - verify works across all views
4. **Document any vital-system-specific edge cases** - if any arise during implementation

### Cross-App Consistency:
- Both `digital-health-startup` and `vital-system` should have identical:
  - Tenant switcher implementation ✅
  - Logo files ✅
  - Global theme system (once implemented) 📝
  - Theme toggle UI component (once implemented) 📝

---

**Summary**: vital-system's tenant switcher is already in the target state. Only global theme system needs implementation, following the same plan as digital-health-startup.
