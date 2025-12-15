# @vital/sdk

**Version:** 0.1.0  
**Purpose:** Multi-tenant SDK for VITAL Platform backend integration

---

## Overview

The VITAL SDK provides a unified client for interacting with Supabase (authentication, database) and the VITAL backend API. It includes multi-tenant context management and type-safe API clients.

---

## Installation

```bash
pnpm add @vital/sdk
```

---

## Usage

### Supabase Client

```typescript
import { createClient } from '@vital/sdk/client';

// Server-side client
const supabase = createClient();

// Client-side client
const supabase = createClient({ 
  cookies: cookies() 
});
```

### Backend Integration Client

```typescript
import { BackendIntegrationClient } from '@vital/sdk';

const client = new BackendIntegrationClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Make authenticated requests
const response = await client.expert.ask({
  message: 'What is the mechanism of action?',
  mode: 'mode_1_instant',
});
```

### Auth Context

```typescript
import { AuthContextProvider } from '@vital/sdk';

function App() {
  return (
    <AuthContextProvider>
      {/* Your app */}
    </AuthContextProvider>
  );
}
```

---

## Structure

```
sdk/
├── src/
│   ├── lib/
│   │   ├── backend-integration-client.ts  # Backend API client
│   │   └── supabase/
│   │       ├── auth-context.tsx          # React auth context
│   │       ├── client.ts                 # Supabase client factory
│   │       ├── server.ts                 # Server-side client
│   │       └── types.ts                  # Supabase types
│   └── types/
│       ├── auth.types.ts                 # Auth types
│       ├── database.types.ts             # Database types
│       └── index.ts                      # Type exports
└── package.json
```

---

## Exports

| Export | Path | Description |
|--------|------|-------------|
| `.` | `src/index.ts` | Main SDK exports |
| `./client` | `src/lib/supabase/client.ts` | Supabase client |
| `./types` | `src/types/index.ts` | Type definitions |

---

## Features

- ✅ **Multi-tenant Support** - Automatic tenant context management
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Server & Client** - Works in both environments
- ✅ **Auth Helpers** - Next.js auth integration
- ✅ **Backend Integration** - Unified API client

---

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Next.js auth helpers
- `@supabase/ssr` - Server-side rendering support

---

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## License

Private - VITAL Path Platform
