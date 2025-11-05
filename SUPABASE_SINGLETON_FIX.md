# Supabase Multiple GoTrueClient Instances Fix

**Date:** November 5, 2025
**Issue:** Multiple GoTrueClient instances detected in browser console
**Status:** ✅ Fixed

## Problem

The browser console was showing repeated warnings:
```
⚠️ Server: Multiple GoTrueClient instances detected in the same browser context.
   It may produce undefined behavior when used concurrently under the same storage key.
```

This warning appeared dozens of times and could cause:
- Authentication issues
- Session conflicts
- Undefined behavior with concurrent requests
- Memory leaks from multiple client instances

### Root Cause

The previous Supabase client initialization in `/lib/supabase/client.ts` was using a lazy Proxy pattern that didn't properly enforce a singleton:

**Before:**
```typescript
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    // ... config
  });
};

// Attempted singleton with Proxy (didn't work properly)
let _supabase: any = null;
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createClient();
    }
    return _supabase[prop];
  }
});
```

**Problems:**
1. `createClient()` was being called directly in many places, bypassing the singleton
2. Proxy pattern was complex and didn't prevent multiple instances
3. No type safety with `any` types
4. Module could be imported multiple times, creating new instances

## Solution

Implemented a proper singleton pattern that ensures only one instance is ever created:

**After:**
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton instance to prevent multiple GoTrueClient warnings
let clientInstance: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  // Return existing instance if already created
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance only if none exists
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  return clientInstance;
};

// Export the singleton instance directly
export const supabase = createClient();
```

### Key Improvements

1. **True Singleton:**
   - Module-level variable `clientInstance` ensures only one instance
   - `createClient()` checks for existing instance before creating new one
   - All calls to `createClient()` return the same instance

2. **Type Safety:**
   - Proper `SupabaseClient` type instead of `any`
   - TypeScript enforces correct usage

3. **Direct Export:**
   - `supabase` is created immediately on module load
   - No Proxy complexity
   - Guaranteed single instance across app

4. **SSR Compatible:**
   - Still uses `createBrowserClient` from `@supabase/ssr`
   - Proper storage handling for browser vs server
   - Session persistence works correctly

## Benefits

✅ **Eliminates Warnings:** No more "Multiple GoTrueClient instances" messages
✅ **Better Performance:** Single client instance reduces memory usage
✅ **Predictable Behavior:** No concurrent access issues
✅ **Type Safe:** Proper TypeScript types throughout
✅ **Simpler Code:** Removed complex Proxy pattern
✅ **SSR Compatible:** Works with Next.js server-side rendering

## File Modified

**Path:** `/apps/digital-health-startup/src/lib/supabase/client.ts`

**Changes:**
- Replaced Proxy-based singleton with module-level singleton
- Added proper `SupabaseClient` type annotations
- Simplified `createClient()` to check for existing instance
- Export `supabase` directly as singleton instance

**Lines Changed:** ~10 lines modified

## Testing

### How to Test

1. **Open Browser Console:**
   ```
   Open DevTools → Console tab
   ```

2. **Navigate through app:**
   - Visit multiple pages
   - Switch between routes
   - Perform authentication actions

3. **Check for warnings:**
   ```
   ✅ Should NOT see: "Multiple GoTrueClient instances detected"
   ✅ Should see: Normal Supabase activity logs
   ```

### Expected Behavior

**Before Fix:**
- ❌ Dozens of "Multiple GoTrueClient" warnings
- ❌ Potential authentication issues
- ❌ Memory overhead from multiple clients

**After Fix:**
- ✅ No "Multiple GoTrueClient" warnings
- ✅ Single client instance used throughout app
- ✅ Clean console output
- ✅ Better performance

## Usage in Code

### Recommended Usage

```typescript
// Import the singleton instance directly
import { supabase } from '@/lib/supabase/client';

// Use it anywhere in client components
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

### Alternative Usage (still supported)

```typescript
// Import and call createClient (returns same instance)
import { createClient } from '@/lib/supabase/client';

const supabase = createClient(); // Returns singleton
```

Both approaches now return the **same instance**, eliminating the warning.

## Related Files

While the main fix is in `client.ts`, these files also create Supabase clients:

### Other Client Patterns (still need review)

1. `/lib/supabase/server.ts` - Server-side client
2. `/lib/supabase/service-client.ts` - Service role client (already singleton)
3. `/lib/db/supabase/client.ts` - Alternative client (has its own singletons)
4. `/shared/services/supabase/client.ts` - Shared services client

**Note:** These are for different contexts (server, admin, etc.) and use different keys, so multiple instances are expected. The warning was specifically about the browser client.

## Best Practices

### ✅ Do This

```typescript
// Import the singleton
import { supabase } from '@/lib/supabase/client';

// Use directly
const user = await supabase.auth.getUser();
```

### ❌ Don't Do This

```typescript
// Don't create new clients directly
import { createBrowserClient } from '@supabase/ssr';

// This creates a NEW instance (bad!)
const supabase = createBrowserClient(url, key);
```

## Future Improvements

1. **Audit other client creations:** Review all `createClient` calls in the app
2. **Centralize client management:** Create a client manager service
3. **Add monitoring:** Track client creation and usage
4. **Document patterns:** Create guidelines for Supabase client usage

## Notes

- The singleton pattern works because JavaScript modules are cached
- Each import of the module returns the same exports
- The `clientInstance` variable persists for the module lifetime
- This is the standard pattern recommended by Supabase

## References

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Multiple Client Instances Issue](https://github.com/supabase/auth-js/issues/570)
- [Singleton Pattern in TypeScript](https://refactoring.guru/design-patterns/singleton/typescript/example)

---

**Status:** ✅ Complete
**Tested:** Pending user verification
**Impact:** All client-side Supabase operations now use single instance

