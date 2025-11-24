# Authentication Quick Start Guide

**5-Minute Setup** - Get authentication working in your app

---

## ✅ Pre-Flight Check

Your authentication system is **already built**! These files are ready:

- ✅ RBAC system ([lib/auth/rbac.ts](lib/auth/rbac.ts))
- ✅ Auth provider ([lib/auth/auth-provider.tsx](lib/auth/auth-provider.tsx))
- ✅ Protected routes ([lib/auth/protected-route.tsx](lib/auth/protected-route.tsx))
- ✅ RLS helpers ([lib/auth/rls-helpers.ts](lib/auth/rls-helpers.ts))
- ✅ Auth middleware ([middleware/auth-rbac.middleware.ts](middleware/auth-rbac.middleware.ts))
- ✅ Login page ([app/auth/login/page.tsx](app/auth/login/page.tsx))
- ✅ Register page ([app/auth/register/page.tsx](app/auth/register/page.tsx))

---

## 🚀 5-Step Quick Start

### Step 1: Create Profiles Table (2 minutes)

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  organization_id UUID,
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

✅ **Verify**: Run `SELECT * FROM profiles LIMIT 1;` - should return 0 rows (table exists)

---

### Step 2: Update Root Layout (1 minute)

Edit [app/layout.tsx](app/layout.tsx):

```tsx
import { AuthProvider } from '@/lib/auth/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

✅ **Verify**: Dev server should recompile without errors

---

### Step 3: Create Your First Super Admin (1 minute)

1. Go to http://localhost:3002/auth/register
2. Register with your email
3. Go to [Supabase Table Editor](https://supabase.com/dashboard/project/_/editor)
4. Open `profiles` table
5. Find your user, change `role` from `user` to `super_admin`
6. Save

✅ **Verify**: Refresh browser, you're now a super admin!

---

### Step 4: Protect a Route (30 seconds)

Edit any page (e.g., [app/chat/page.tsx](app/chat/page.tsx)):

```tsx
import { RequireAuth } from '@/lib/auth/protected-route';

export default function ChatPage() {
  return (
    <RequireAuth>
      <div>Your protected content here</div>
    </RequireAuth>
  );
}
```

✅ **Verify**:
- Logout, go to /chat → redirected to /auth/login
- Login, go to /chat → page loads

---

### Step 5: Protect an API Route (30 seconds)

Edit any API route (e.g., [src/app/api/agents/route.ts](src/app/api/agents/route.ts)):

```typescript
import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth-rbac.middleware';

async function handler(request: AuthenticatedRequest) {
  const userId = request.userId!;
  const userRole = request.userRole!;

  return NextResponse.json({
    message: 'Authenticated!',
    userId,
    userRole
  });
}

export const GET = requireAuth(handler);
```

✅ **Verify**:
```bash
# Without auth → 401
curl http://localhost:3002/api/agents

# With auth (login in browser first) → 200
curl http://localhost:3002/api/agents \
  -H "Cookie: sb-access-token=..."
```

---

## 🎉 Done! You Now Have:

- ✅ User registration
- ✅ Login/logout
- ✅ Protected pages
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Permission system

---

## 🔥 Common Patterns

### Check Permission in Component

```tsx
import { usePermission } from '@/lib/auth/auth-provider';
import { Permission } from '@/lib/auth/rbac';

function MyComponent() {
  const canCreate = usePermission(Permission.AGENTS_CREATE);

  return (
    <div>
      {canCreate && <button>Create Agent</button>}
    </div>
  );
}
```

### Protect by Permission

```tsx
import { RequirePermission } from '@/lib/auth/protected-route';
import { Permission } from '@/lib/auth/rbac';

export default function AdminPage() {
  return (
    <RequirePermission permission={Permission.USERS_MANAGE}>
      <div>Admin content</div>
    </RequirePermission>
  );
}
```

### API with Permission Check

```typescript
import { requirePermission } from '@/middleware/auth-rbac.middleware';
import { Permission } from '@/lib/auth/rbac';

export const POST = requirePermission(
  async (request: AuthenticatedRequest) => {
    return NextResponse.json({ success: true });
  },
  Permission.AGENTS_CREATE
);
```

### Query Database with RLS

```typescript
import { createClientClient } from '@/lib/supabase/client';
import { queryAgents, buildRLSContext } from '@/lib/auth/rls-helpers';
import { useAuth } from '@/lib/auth/auth-provider';

function MyComponent() {
  const { userId, role, organizationId } = useAuth();
  const supabase = createClientClient();

  const loadAgents = async () => {
    const context = buildRLSContext(userId!, role!, organizationId);
    const query = queryAgents(supabase, context);
    const { data } = await query.select('*');
    // Returns only agents user can access
  };
}
```

---

## 📚 Full Documentation

For detailed guides, see:
- [AUTH_IMPLEMENTATION_GUIDE.md](AUTH_IMPLEMENTATION_GUIDE.md) - Complete guide
- [AUTH_IMPLEMENTATION_SUMMARY.md](AUTH_IMPLEMENTATION_SUMMARY.md) - Overview
- [SECURED_ROUTES_APPLIED.md](SECURED_ROUTES_APPLIED.md) - API security

---

## 🆘 Troubleshooting

### "User not authenticated" error
- Check browser cookies (should have `sb-access-token`)
- Try logout then login again
- Check Supabase dashboard for auth errors

### "Permission denied" error
- Check user role in `profiles` table
- Verify permission is assigned to that role in [lib/auth/rbac.ts](lib/auth/rbac.ts)

### "No data returned" from queries
- Check RLS policies in Supabase
- Verify user_id/organization_id in resource
- Test as super_admin (bypasses RLS)

### Login page not found
- Verify files exist: [app/auth/login/page.tsx](app/auth/login/page.tsx)
- Check dev server compilation logs

---

## 🎯 Next Steps

1. ✅ Test login/register flow
2. ✅ Protect your existing routes
3. ✅ Update API routes with auth middleware
4. ✅ Add permission checks to UI
5. ✅ Test with different user roles

---

**Happy coding! 🚀**

*Need help? Check the full [AUTH_IMPLEMENTATION_GUIDE.md](AUTH_IMPLEMENTATION_GUIDE.md)*
