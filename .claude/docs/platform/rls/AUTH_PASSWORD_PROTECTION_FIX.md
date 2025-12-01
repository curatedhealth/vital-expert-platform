# Auth Leaked Password Protection Fix

**Issue:** `auth_leaked_password_protection` warning
**Severity:** WARN (Low Priority)
**Status:** ⚠️ MANUAL FIX REQUIRED (Supabase Dashboard)

---

## Problem

Supabase Security Linter Warning:
```
auth_leaked_password_protection

HaveIBeenPwned.org password breach protection is disabled in Auth configuration.
This allows users to set passwords that have been exposed in known data breaches.
```

**Risk:**
- Users can set passwords that appear in known breach databases
- Increased vulnerability to credential stuffing attacks
- Does not meet security best practices for password hygiene

**Current State:** DISABLED (default Supabase setting)

---

## Solution

Enable HaveIBeenPwned.org password breach protection in Supabase Auth configuration.

### Step-by-Step Fix (Supabase Dashboard)

1. **Navigate to Auth Settings**
   - Open your Supabase project: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
   - Click **Authentication** in the left sidebar
   - Click **Settings** tab

2. **Enable Password Protection**
   - Scroll to **Password Settings** section
   - Find **"Check passwords against HaveIBeenPwned breach database"** toggle
   - Toggle it **ON** (enable)

3. **Save Changes**
   - Click **Save** button at the bottom of the page
   - Wait for confirmation message

4. **Verify Fix**
   - Run Supabase Security Linter again
   - Confirm `auth_leaked_password_protection` warning is gone

---

## What This Does

When enabled, this feature:
- Checks user passwords against the HaveIBeenPwned.org API during signup/password change
- Rejects passwords that appear in known data breaches
- Does NOT send the actual password to HaveIBeenPwned (uses k-anonymity model)
- Improves overall security posture for user accounts

**How k-anonymity works:**
1. Password is hashed locally (SHA-1)
2. Only first 5 characters of hash are sent to HaveIBeenPwned API
3. API returns all breached passwords matching those 5 characters
4. Client checks locally if full hash matches any breached password
5. User's actual password is never transmitted

---

## Impact

**Before:**
- Users can set weak, breached passwords like `password123`
- No protection against known compromised credentials
- Higher risk of account takeover

**After:**
- Users are forced to choose unique, uncompromised passwords
- Protection against credential stuffing attacks
- Compliance with NIST password guidelines

---

## Alternative: API Configuration (Not Recommended)

If you have access to Supabase API keys, you can also enable via SQL:

```sql
-- NOTE: This requires superuser privileges
-- In Supabase Cloud, use the Dashboard instead

UPDATE auth.config
SET value = 'true'
WHERE parameter = 'password_breach_protection_enabled';
```

**WARNING:** This approach may not work in Supabase Cloud. Always use the Dashboard for Auth settings.

---

## Testing

After enabling, test that it works:

1. **Test Breached Password (Should Fail)**
   ```javascript
   // Try to sign up with a known breached password
   const { data, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'password123' // Known breached password
   })

   // Expected: error.message = "Password is too weak or has been breached"
   ```

2. **Test Strong Password (Should Succeed)**
   ```javascript
   // Sign up with a unique, strong password
   const { data, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'X9$mK#pL2@qR5nW8' // Strong unique password
   })

   // Expected: success
   ```

---

## Timeline

**Estimated Time:** 2 minutes
**Downtime:** None
**Risk Level:** VERY LOW

---

## Rollback

If this causes issues (unlikely), you can disable it:

1. Go to Supabase Dashboard → Authentication → Settings
2. Toggle **"Check passwords against HaveIBeenPwned"** to **OFF**
3. Click **Save**

**NOTE:** Rolling back is NOT recommended for production systems. This is a critical security feature.

---

## Completion Checklist

- [ ] Navigate to Supabase Dashboard → Authentication → Settings
- [ ] Enable "Check passwords against HaveIBeenPwned breach database"
- [ ] Click Save
- [ ] Run Supabase Security Linter
- [ ] Verify `auth_leaked_password_protection` warning is gone
- [ ] Test with a known breached password (should fail)
- [ ] Test with a strong unique password (should succeed)
- [ ] Document completion in MIGRATION_HISTORY.md

---

## References

- [HaveIBeenPwned API Documentation](https://haveibeenpwned.com/API/v3)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-password-configuration)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)

---

**Document Version:** 1.0
**Created:** 2025-11-26
**Owner:** Platform Security Team
**Related Migrations:** 015, 016 (function/extension warnings)
