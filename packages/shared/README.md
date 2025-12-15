# @vital/shared

**Version:** 1.0.0  
**Purpose:** Shared React context providers and utilities for VITAL Platform

---

## Overview

This package provides shared React context providers for mission management and tenant context that are used across the VITAL Platform frontend.

---

## Installation

```bash
pnpm add @vital/shared
```

---

## Usage

### Tenant Context

```typescript
import { TenantContextProvider, useTenant } from '@vital/shared/lib/tenant-context';

function App() {
  return (
    <TenantContextProvider>
      <YourComponent />
    </TenantContextProvider>
  );
}

function YourComponent() {
  const { tenantId, organizationId } = useTenant();
  // Use tenant context
}
```

### Mission Context

```typescript
import { MissionContextProvider, useMission } from '@vital/shared/lib/mission-context';

function MissionView() {
  return (
    <MissionContextProvider missionId="mission-123">
      <MissionDetails />
    </MissionContextProvider>
  );
}

function MissionDetails() {
  const { mission, updateMission } = useMission();
  // Use mission context
}
```

---

## Structure

```
shared/
├── src/
│   ├── lib/
│   │   ├── tenant-context.ts      # Tenant context provider
│   │   └── mission-context.tsx     # Mission context provider
│   └── types/
│       └── tenant.types.ts         # Tenant type definitions
└── package.json
```

---

## Exports

| Export | Path | Description |
|--------|------|-------------|
| `./lib/*` | `src/lib/*` | Context providers |
| `./types/*` | `src/types/*` | Type definitions |

---

## Features

- ✅ **Tenant Context** - Multi-tenant organization management
- ✅ **Mission Context** - Mission state management
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **React Hooks** - Custom hooks for context access

---

## Dependencies

- `@supabase/supabase-js` - Supabase client for data fetching
- `next` - Next.js framework

---

## License

Private - VITAL Path Platform
