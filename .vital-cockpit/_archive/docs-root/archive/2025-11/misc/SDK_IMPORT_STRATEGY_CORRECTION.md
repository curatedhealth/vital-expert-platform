# SDK Import Strategy - Correction

## Problem Discovered
The `@vital/sdk` createClient() only supports **anon key** (client-side) access.
API routes need **service role key** for admin operations.

## Corrected Strategy

### Use `@vital/sdk` for:
1. **Client-side components** (React hooks, UI components)
2. **Client-facing services** (frontend services)
3. **Tenant-aware client operations** (uses anon key + RLS)

### Use `@supabase/supabase-js` for:
1. **API routes** (need service role key)
2. **Server-side operations** (need admin access)
3. **Database migrations** (need service role)
4. **Auth contexts** (need service role)

## Action Required
Revert API route changes back to `@supabase/supabase-js` since they need service role access.

Keep SDK changes for:
- Client-side services
- Frontend RAG services  
- Tenant-aware client operations

## Architecture Principle (Revised)

**Client-Side**: Use `@vital/sdk` → Automatic RLS, tenant isolation via anon key
**Server-Side/API**: Use `@supabase/supabase-js` with service role → Admin access for server operations

The multi-tenant security is enforced by:
1. RLS policies on the database
2. Middleware checking tenant context
3. Service role operations respect database constraints
