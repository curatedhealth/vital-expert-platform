# 🚀 QUICK FIX GUIDE: Agent & User ID Issues

**For Developers** - Fast reference for common ID-related problems.

---

## 🔥 COMMON ERRORS & FIXES

### Error 1: "Agent ID required for update/delete"

**Cause:** Middleware not handling Next.js 15+ Promise params  
**Location:** `middleware/agent-auth.ts`, `middleware/prompt-auth.ts`

**Fix:**
```typescript
// ❌ OLD (Returns undefined)
const agentId = params?.params?.id;

// ✅ NEW (Handles Promise)
let agentId: string | undefined;
if (params?.params) {
  if (params.params instanceof Promise) {
    const resolvedParams = await params.params;
    agentId = resolvedParams?.id;
  } else {
    agentId = params.params?.id;
  }
} else if (params?.id) {
  agentId = params.id;
}
```

---

### Error 2: "user is not defined" (ReferenceError)

**Cause:** Component using `user?.id` without declaring/fetching user  
**Location:** React components (especially `agent-creator.tsx`)

**Fix:**
```typescript
// ❌ OLD (user not defined)
const handleDelete = () => {
  if (isUserCopy && user?.id) {  // ReferenceError!
    // ...
  }
};

// ✅ NEW (Fetch and store user)
const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser({ id: user.id, email: user.email || '' });
    }
  };
  getCurrentUser();
}, []);

const handleDelete = () => {
  if (isUserCopy && currentUser?.id) {  // ✅ Works!
    // ...
  }
};
```

---

### Error 3: "User profile not found" / Permission Denied

**Cause:** `user_profiles.user_id` is NULL in database  
**Location:** Database table `user_profiles`

**Fix:**
```sql
-- Check for NULL user_ids
SELECT email, role, user_id, 
  CASE WHEN user_id IS NOT NULL THEN 'OK' ELSE 'NULL' END AS status
FROM user_profiles
ORDER BY email;

-- Fix NULL user_ids
UPDATE user_profiles up
SET user_id = au.id, updated_at = NOW()
FROM auth.users au
WHERE au.email = up.email 
  AND up.user_id IS NULL;

-- Verify fix
SELECT COUNT(*) as fixed_count
FROM user_profiles
WHERE user_id IS NOT NULL;
```

---

## 📋 QUICK CHECKLIST

When you encounter Agent/User ID errors:

1. **Middleware Issue?**
   - [ ] Check if using `params?.params?.id` directly
   - [ ] Add Promise handling (see Error 1 fix)
   - [ ] Test with Postman/curl first

2. **Component Issue?**
   - [ ] Search for `user?.id` in component
   - [ ] Verify user state is fetched via `useEffect`
   - [ ] Use `currentUser?.id` instead
   - [ ] Check browser console for ReferenceError

3. **Database Issue?**
   - [ ] Query `user_profiles` for NULL `user_id`
   - [ ] Run SQL fix to populate from `auth.users`
   - [ ] Verify user role is correct

4. **Permission Issue?**
   - [ ] Check user role: `SELECT role FROM user_profiles WHERE email = 'user@example.com'`
   - [ ] Verify RLS policies in Supabase
   - [ ] Check middleware logs for permission denial reason

---

## 🛠️ FILES TO CHECK

### Middleware Files
- `apps/digital-health-startup/src/middleware/agent-auth.ts` ✅ FIXED
- `apps/digital-health-startup/src/middleware/prompt-auth.ts` ✅ FIXED
- `apps/digital-health-startup/src/middleware/knowledge-auth.ts` ✅ OK

### Component Files (High Priority)
- `apps/digital-health-startup/src/features/chat/components/agent-creator.tsx` ✅ FIXED
- `apps/digital-health-startup/src/app/(app)/agents/page.tsx` ⚠️ VERIFY
- `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` ⚠️ VERIFY

### Database Scripts
- `scripts/fix_user_profiles_user_id.sql` ✅ RUN THIS

---

## 🧪 TESTING COMMANDS

### Test Agent Operations
```bash
# Get agent (should work for everyone)
curl http://localhost:3000/api/agents/[agent-id] \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update agent (requires ownership or admin)
curl -X PUT http://localhost:3000/api/agents/[agent-id] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Updated Name"}'

# Delete agent (requires ownership or admin)
curl -X DELETE http://localhost:3000/api/agents/[agent-id] \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Database
```sql
-- Check your user profile
SELECT email, role, user_id, organization_id
FROM user_profiles
WHERE email = 'your.email@example.com';

-- Check if user_id is NULL
SELECT COUNT(*) as null_count
FROM user_profiles
WHERE user_id IS NULL;

-- Check super admin
SELECT email, role
FROM user_profiles
WHERE role = 'super_admin';
```

---

## 🎯 DECISION TREE

```
Getting Agent/User ID Error?
│
├─ "Agent ID required for update/delete"
│  └─ Fix: Update middleware (Error 1)
│
├─ "user is not defined" (ReferenceError)
│  └─ Fix: Add currentUser state (Error 2)
│
├─ "User profile not found"
│  └─ Fix: Populate user_profiles.user_id (Error 3)
│
├─ "Permission denied" (but you're admin)
│  ├─ Check: user_profiles.user_id IS NOT NULL
│  ├─ Check: user_profiles.role = 'super_admin' or 'admin'
│  └─ Fix: Run SQL fix script
│
└─ Other error
   └─ Check: Browser console, Network tab, API logs
```

---

## 📞 EMERGENCY FIX

If production is down due to Agent ID issues:

### Step 1: Quick Database Fix (2 minutes)
```sql
-- Create audit_logs table if missing
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

-- Fix NULL user_ids
UPDATE user_profiles up
SET user_id = au.id, updated_at = NOW()
FROM auth.users au
WHERE au.email = up.email AND up.user_id IS NULL;
```

### Step 2: Verify Fix (1 minute)
```sql
-- Should return 0
SELECT COUNT(*) FROM user_profiles WHERE user_id IS NULL;

-- Should show your admin account
SELECT email, role, user_id 
FROM user_profiles 
WHERE role IN ('super_admin', 'admin');
```

### Step 3: Restart Frontend (1 minute)
```bash
# Clear browser cache and hard refresh
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

---

## 📚 FULL DOCUMENTATION

For detailed information, see:
- `AGENT_USER_ID_AUDIT_COMPLETE.md` - Complete audit report
- `MIDDLEWARE_FIX_SUMMARY.md` - Middleware fixes in detail
- `scripts/fix_user_profiles_user_id.sql` - Database fix script

---

**Last Updated:** November 6, 2025  
**Keep This Handy!** Bookmark for quick troubleshooting.






