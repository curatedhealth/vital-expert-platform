# ⚠️ CRITICAL: Supabase Client Singleton Pattern

## Problem

Creating multiple Supabase client instances causes:
- **"Multiple GoTrueClient instances detected"** warnings in console
- **Undefined behavior** when used concurrently under the same storage key
- **Authentication state conflicts** - user session not persisting
- **User ID missing** - `user?.id` is undefined in contexts
- **Agents being cleared** - AskExpertContext clears agents when `user?.id` is missing

## Root Cause

When multiple Supabase clients are created:
1. Each client creates its own GoTrueClient instance
2. They use the same localStorage key for session storage
3. Auth state changes in one client don't sync to others
4. Components using different client instances see different auth states
5. `user?.id` becomes undefined, causing agents to be cleared

## Solution: Singleton Pattern

**ALWAYS use a singleton pattern for Supabase clients.**

### ✅ Correct Implementation

```typescript
// lib/supabase/client.ts
let clientInstance: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  // ⚠️ CRITICAL: Always check for existing instance first
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance only if none exists
  clientInstance = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  return clientInstance;
};
```

### ❌ Wrong Implementation

```typescript
// ❌ WRONG: Creates new instance every time
export const createClient = () => {
  return createSupabaseClient(url, key); // New instance each call!
};
```

## Files That Must Use Singleton

1. **`apps/digital-health-startup/src/lib/supabase/client.ts`**
   - Used by `SupabaseAuthProvider`
   - **CRITICAL**: If this creates multiple instances, authentication breaks

2. **`apps/digital-health-startup/src/shared/services/supabase/client.ts`**
   - Used by various services
   - **CRITICAL**: Must also use singleton pattern

3. **Any other file that creates Supabase clients**
   - Must implement singleton pattern
   - Must check for existing instance before creating new one

## How to Verify

1. **Check Console for Warnings**
   ```
   Multiple GoTrueClient instances detected in the same browser context.
   ```

2. **Check for User ID Issues**
   ```
   [AskExpertContext] No user ID, clearing agents
   ```

3. **Search Codebase**
   ```bash
   # Find all Supabase client creations
   grep -r "createBrowserClient\|createSupabaseClient" apps/digital-health-startup/src
   
   # Find all createClient imports
   grep -r "from.*supabase.*client" apps/digital-health-startup/src
   ```

## Prevention Checklist

Before modifying any Supabase client code:

- [ ] Does the file use a singleton pattern?
- [ ] Does it check for existing instance before creating new one?
- [ ] Are there comments explaining why singleton is required?
- [ ] Have you tested that only one instance is created?
- [ ] Have you checked console for "Multiple GoTrueClient" warnings?
- [ ] Have you verified `user?.id` is available in contexts?

## Related Issues

- **Agents not showing**: Check if `user?.id` is undefined in `AskExpertContext`
- **Authentication not persisting**: Check for multiple client instances
- **"No user ID, clearing agents"**: Check auth context and client singleton

## Files Modified

1. `apps/digital-health-startup/src/lib/supabase/client.ts` - Added singleton with comments
2. `apps/digital-health-startup/src/shared/services/supabase/client.ts` - Added singleton with comments
3. `apps/digital-health-startup/src/lib/auth/supabase-auth-context.tsx` - Added comment about using singleton
4. `apps/digital-health-startup/src/contexts/ask-expert-context.tsx` - Added comment about user ID check

## Last Updated

2025-01-XX - Fixed multiple GoTrueClient instances issue

