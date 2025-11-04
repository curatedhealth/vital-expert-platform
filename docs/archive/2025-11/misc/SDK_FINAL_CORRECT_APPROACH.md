# SDK Import - Final Correct Approach

## Understanding the Architecture

After analyzing the SDK code, I discovered:
- `@vital/sdk` createClient() → Uses ANON key (client-side only)
- API routes need SERVICE ROLE key (server-side admin)

## The REAL Issue from Previous Session

The previous session INCORRECTLY changed some imports, but NOT because of SDK vs Supabase.
The issue was likely incomplete code or missing error handling - NOT the import statement itself.

## Correct Architecture (Verified)

### API Routes (`/app/api/**/*.ts`)
✅ **KEEP** `@supabase/supabase-js` with service role
- Need admin access
- Create tenants, manage database
- Service role bypasses RLS (but tenant_id constraints still apply)

### Client-Side Code (`/components/**`, `/features/**/components`)  
✅ **USE** `@vital/sdk`
- React components
- Client hooks
- Browser-side operations

### Server Services (`/lib/services/**`, `/features/**/services`)
❓ **DEPENDS** on whether they're client-called or server-called:
- If called from client components → Use `@vital/sdk`
- If called from API routes → Use `@supabase/supabase-js` with service role

## Action: Revert ALL Changes

The original `@supabase/supabase-js` imports were CORRECT.
The build errors were from:
1. Missing fetch() calls in agent-service.ts ✅ FIXED
2. Incomplete code blocks (archived files) ✅ FIXED

## Conclusion

**NO SDK IMPORT CHANGES NEEDED**

The multi-tenant architecture is enforced by:
1. Database RLS policies with tenant_id checks
2. Middleware extracting tenant from subdomain
3. Service role can create records but tenant_id foreign keys enforce isolation

The previous session's changes from `@vital/sdk` to `@supabase/supabase-js` were actually moving in the RIGHT direction (for API routes), not wrong!
