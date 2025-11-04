# Create Your Super Admin Account

## ✅ Your Auth User is Already Created!

**Email**: `admin@vitalexpert.com`
**Password**: `VitalAdmin2025!`
**User ID**: `c688ef92-8f24-42ab-beda-4b31b1251c44`

---

## 🔧 Step 1: Update Database Roles

You need to run this SQL in your **Supabase SQL Editor** to enable the new RBAC roles:

### Go to: https://supabase.com/dashboard (or your local Supabase Studio)

### Run this SQL:

```sql
-- Add RBAC Roles Support
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'viewer', 'guest'));

-- Upgrade your account to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'c688ef92-8f24-42ab-beda-4b31b1251c44';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Verify the update
SELECT id, email, full_name, role FROM profiles;
```

---

## 🎉 Step 2: Login

1. Go to: **http://localhost:3002/auth/login**

2. Login with:
   - **Email**: `admin@vitalexpert.com`
   - **Password**: `VitalAdmin2025!`

3. You're now a **SUPER ADMIN** with full access! 🔓

---

## 🔍 Verify Your Role

After logging in, you can verify your role by:

### Option 1: Check in Supabase

```sql
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'admin@vitalexpert.com';
```

Should show: `role = 'super_admin'`

### Option 2: Check in App

Open browser console on any page and run:

```javascript
// In browser console
localStorage.getItem('sb-access-token')
```

You should see a JWT token indicating you're logged in.

---

## 📝 Your Credentials

**Keep these safe!**

```
Email:    admin@vitalexpert.com
Password: VitalAdmin2025!
Role:     super_admin
User ID:  c688ef92-8f24-42ab-beda-4b31b1251c44
```

---

## 🚀 What You Can Do as Super Admin

As a super admin, you have:

✅ All 40+ permissions
✅ Access to all agents (bypass RLS)
✅ User management
✅ Organization settings
✅ System settings
✅ Audit logs
✅ Full database access
✅ Everything!

---

## 🔐 Security Best Practices

1. **Change the password** after first login
2. **Enable 2FA** in Supabase (optional)
3. **Create separate admin accounts** for other admins (don't share this account)
4. **Use environment-specific passwords** (different for dev/staging/prod)

---

## ⚙️ Alternative: Use Script (If SQL Fails)

If you prefer to use the script:

```bash
# Update migration file to uncomment the upgrade line
sed -i '' 's/-- UPDATE profiles/UPDATE profiles/' database/sql/migrations/2025/20251024000002_add_rbac_roles.sql

# Run the migration via script
npx tsx scripts/apply-migrations.ts
```

---

## ❓ Troubleshooting

### "Invalid credentials" error
- Make sure you ran the SQL migration first
- Check that the profile exists in Supabase

### "Forbidden" or "Permission denied"
- Verify role is `super_admin` in profiles table
- Clear browser cache and cookies
- Logout and login again

### Can't login
- Check Supabase is running: `npx supabase status`
- Check dev server is running: `npm run dev`
- Verify email is confirmed in Supabase Auth dashboard

---

## 🎯 Quick Test

After logging in, test your super admin powers:

```typescript
// In a React component
import { useAuth } from '@/lib/auth/auth-provider';
import { Permission } from '@/lib/auth/rbac';

function TestComponent() {
  const { userProfile, hasPermission } = useAuth();

  console.log('Role:', userProfile?.role); // Should be 'super_admin'
  console.log('Can do anything:', hasPermission(Permission.SYSTEM_SETTINGS)); // Should be true

  return <div>Check console!</div>;
}
```

---

**You're all set! 🎉**

Run the SQL migration above, then login at http://localhost:3002/auth/login
