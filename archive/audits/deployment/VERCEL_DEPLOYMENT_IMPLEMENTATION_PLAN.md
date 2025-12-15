# VITAL Frontend - Vercel Deployment Implementation Plan

**Date:** December 11, 2025
**Related Report:** [Vercel Deployment Readiness Report](./VERCEL_DEPLOYMENT_READINESS_REPORT.md)
**Target Application:** `/apps/vital-system/`

---

## Overview

This implementation plan addresses all blockers identified in the Vercel Deployment Readiness Report. The plan is organized into 4 phases, with each phase building on the previous.

---

## Phase 1: Build Blockers (Required for Build)

**Objective:** Get `pnpm build` to pass
**Estimated Time:** 2-4 hours
**Priority:** P0 - BLOCKING

### 1.1 Fix vercel.json Configuration

**File:** `apps/vital-system/vercel.json`

**Current (Broken):**
```json
{
  "buildCommand": "cd ../.. && pnpm install && cd apps/digital-health-startup && pnpm run build"
}
```

**Fixed:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm install && pnpm --filter vital-system build",
  "outputDirectory": "apps/vital-system/.next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

**Effort:** 5 minutes

---

### 1.2 Resolve Missing Chat Modules

**Problem:** 13 modules in `@/features/chat/` are imported but don't exist

**Option A: Stub Implementation (Faster)**
Create minimal stub files that export empty implementations:

```
src/features/chat/
├── services/
│   └── langchain-service.ts      # Export stub functions
├── memory/
│   └── long-term-memory.ts       # Export stub class
├── components/
│   └── metrics-dashboard.tsx     # Export empty component
├── types/
│   └── conversation.types.ts     # Export interfaces
├── hooks/
│   ├── useConversationMemory.ts  # Export no-op hook
│   ├── useAgentMetrics.ts        # Export no-op hook
│   └── useStreamingChat.ts       # Export no-op hook
├── context/
│   └── ChatProvider.tsx          # Export minimal context
├── utils/
│   ├── message-formatter.ts      # Export identity function
│   └── token-counter.ts          # Export stub counter
└── config/
    └── model-configs.ts          # Export default configs
```

**Option B: Remove Unused Imports (Cleaner)**
Find and remove all imports from `@/features/chat/` if the feature isn't used:

```bash
grep -rn "@/features/chat" src/ --include="*.ts" --include="*.tsx"
```

**Recommendation:** Option A for faster deployment, Option B for cleaner codebase

**Effort:** 1-2 hours

---

### 1.3 Resolve langchain/text_splitter Import

**Problem:** `langchain/text_splitter` module not found

**Solutions:**

1. **If langchain is needed:**
   ```bash
   pnpm add langchain @langchain/core @langchain/textsplitters
   ```
   Then update imports:
   ```typescript
   // Old (broken)
   import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

   // New (correct)
   import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
   ```

2. **If langchain is not needed:**
   Remove or comment out the import and related code.

**Effort:** 30 minutes

---

### 1.4 Resolve @vital/ai-ui Package

**Problem:** `@vital/ai-ui` package referenced but doesn't exist in workspace

**Solutions:**

1. **Check if package exists elsewhere:**
   ```bash
   find . -name "package.json" -exec grep -l "ai-ui" {} \;
   ```

2. **If it's a typo:** Update to correct package name (possibly `@vital/ui`)

3. **If package is missing:** Create stub or remove imports

**Effort:** 30 minutes

---

### 1.5 Build Verification

After completing 1.1-1.4:

```bash
cd apps/vital-system
pnpm build
```

**Success Criteria:** Build completes without module resolution errors

---

## Phase 2: Security Fixes (Required for Production)

**Objective:** Address critical security vulnerabilities
**Estimated Time:** 3-5 hours
**Priority:** P0 - CRITICAL

### 2.1 Remove Service-Role Key from Frontend

**Files to audit:**
- `src/app/api/ask-expert/route.ts`
- `src/app/api/ask-expert/stream/route.ts`
- `src/app/api/ask-expert/hitl-response/route.ts`

**Current Pattern (Vulnerable):**
```typescript
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

**Fixed Pattern:**
```typescript
// Use anon key for client-side operations
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// For server-side operations requiring elevated permissions,
// validate the user session first
const { data: { session }, error } = await supabase.auth.getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Effort:** 1-2 hours

---

### 2.2 Implement Session Validation

**Add to all API routes:**

```typescript
// src/lib/auth/validateSession.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function validateSession() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return { valid: false, session: null, error: 'Unauthorized' };
  }

  return { valid: true, session, error: null };
}
```

**Apply to routes:**
```typescript
// In each API route
import { validateSession } from '@/lib/auth/validateSession';

export async function POST(request: Request) {
  const { valid, session, error } = await validateSession();
  if (!valid) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // Continue with authenticated request...
}
```

**Effort:** 1-2 hours

---

### 2.3 Fix Gateway Bypass

**Problem:** Direct calls to `AI_ENGINE_URL` bypass authentication

**Solution:** All AI engine calls must go through authenticated Next.js API routes

```typescript
// src/lib/ai-engine/client.ts
export async function callAIEngine(endpoint: string, data: any, session: Session) {
  // Validate session before calling AI engine
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${process.env.AI_ENGINE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'X-Tenant-ID': session.user.user_metadata.tenant_id,
    },
    body: JSON.stringify(data),
  });

  return response;
}
```

**Effort:** 1-2 hours

---

### 2.4 Add HITL Authentication

**File:** `src/app/api/ask-expert/hitl-response/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Validate session
  const { valid, session } = await validateSession();
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate request body
  const body = await request.json();
  const validation = HITLResponseSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // 3. Verify user owns the session/conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', body.conversation_id)
    .single();

  if (conversation?.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Process HITL response...
}
```

**Effort:** 1 hour

---

## Phase 3: TypeScript Stability (Recommended)

**Objective:** Fix high-severity TypeScript errors
**Estimated Time:** 4-8 hours
**Priority:** P1 - HIGH

### 3.1 Fix TS2339 - Property Doesn't Exist (373 errors)

**Common patterns:**

```typescript
// Problem: Accessing undefined property
agent.unknownProp  // TS2339

// Fix: Add type guard or optional chaining
agent?.unknownProp
// Or: Update type definition
interface Agent {
  unknownProp?: string;
}
```

**Files to prioritize:**
1. `agent-creator.tsx` (96 errors)
2. `agent-edit-form-enhanced.tsx` (85 errors)

---

### 3.2 Fix TS2322 - Type Mismatch (335 errors)

**Common patterns:**

```typescript
// Problem: Wrong type assignment
const value: string = 123;  // TS2322

// Fix: Correct the type or cast
const value: string = String(123);
// Or: Fix the type definition
const value: number = 123;
```

---

### 3.3 Fix TS2304 - Cannot Find Name (247 errors)

**Common causes:**
- Missing imports
- Typos in variable names
- Missing type definitions

```typescript
// Problem: Using undefined name
const result = unknownFunction();  // TS2304

// Fix: Import or define
import { unknownFunction } from './utils';
```

---

### 3.4 Fix TS18048 - Possibly Undefined (230 errors)

**Common patterns:**

```typescript
// Problem: Accessing possibly undefined
const value = data.prop.nested;  // TS18048

// Fix: Add null checks
const value = data?.prop?.nested;
// Or: Add assertion if certain
const value = data!.prop!.nested;
// Or: Add default
const value = data?.prop?.nested ?? defaultValue;
```

---

## Phase 4: Code Quality Cleanup (Optional)

**Objective:** Remove technical debt
**Estimated Time:** 4-8 hours
**Priority:** P2 - LOW

### 4.1 Remove Unused Variables (967 errors)

```bash
# Find files with most unused variables
pnpm type-check 2>&1 | grep TS6133 | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -20
```

**Automated fix option:**
```bash
# Use eslint with --fix
pnpm eslint --fix --rule 'no-unused-vars: error' src/
```

---

### 4.2 Fix Index Signature Access (513 errors)

**Pattern:**
```typescript
// Problem: Unsafe index access
const value = obj[key];  // TS4111

// Fix: Use type-safe access
const value = obj[key as keyof typeof obj];
// Or: Enable noUncheckedIndexedAccess in tsconfig
```

---

### 4.3 Remove Console Statements (610 files)

```bash
# Find all console statements
grep -rn "console\." --include="*.ts" --include="*.tsx" src/

# Automated removal (use with caution)
sed -i '' '/console\.\(log\|warn\|error\|debug\|info\)/d' src/**/*.ts src/**/*.tsx
```

**Better approach:** Replace with proper logging service
```typescript
// src/lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(msg, data);
    }
    // In production, send to logging service
  },
  error: (msg: string, error?: any) => {
    // Always log errors to service
    console.error(msg, error);
    // Send to Sentry, etc.
  }
};
```

---

## Execution Checklist

### Pre-Implementation
- [ ] Create git branch: `fix/vercel-deployment-blockers`
- [ ] Backup current state
- [ ] Notify team of planned changes

### Phase 1: Build Blockers
- [ ] 1.1 Fix vercel.json
- [ ] 1.2 Stub/fix chat modules
- [ ] 1.3 Fix langchain imports
- [ ] 1.4 Fix @vital/ai-ui
- [ ] 1.5 Verify build passes

### Phase 2: Security
- [ ] 2.1 Remove service-role key
- [ ] 2.2 Add session validation
- [ ] 2.3 Fix gateway bypass
- [ ] 2.4 Add HITL auth

### Phase 3: TypeScript (Optional)
- [ ] 3.1 Fix TS2339 errors
- [ ] 3.2 Fix TS2322 errors
- [ ] 3.3 Fix TS2304 errors
- [ ] 3.4 Fix TS18048 errors

### Phase 4: Cleanup (Optional)
- [ ] 4.1 Remove unused variables
- [ ] 4.2 Fix index signature access
- [ ] 4.3 Remove console statements

### Post-Implementation
- [ ] Run full test suite
- [ ] Run security audit
- [ ] Update documentation
- [ ] Create PR for review
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Deploy to production

---

## Success Criteria

| Phase | Success Metric |
|-------|----------------|
| Phase 1 | `pnpm build` completes successfully |
| Phase 2 | Security audit shows no critical/high issues |
| Phase 3 | TypeScript errors < 500 |
| Phase 4 | TypeScript errors < 100 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes | Feature branch + staging deploy |
| Security regression | Security audit before production |
| Build time increase | Monitor CI/CD pipeline |
| Runtime errors | Comprehensive testing |

---

## Related Documents

- [Vercel Deployment Readiness Report](./VERCEL_DEPLOYMENT_READINESS_REPORT.md)
- [Ask Expert Audit](./ask-expert-audit.md)
- [Architecture Overview](../architecture/overview.md)

---

*Implementation plan generated by Claude AI Assistant*
