# Authentication System Documentation

## Overview

The VITAL Expert platform uses a comprehensive authentication system built on Supabase Auth with Role-Based Access Control (RBAC). This system provides secure user authentication, session management, and role-based authorization.

## Architecture

### Core Components

1. **AuthProvider** (`src/lib/auth/auth-provider.tsx`)
   - Central authentication context provider
   - Manages user state, session, and loading states
   - Handles sign in, sign out, and session refresh
   - Integrates with Supabase Auth

2. **Auth Types** (`src/lib/auth/types.ts`)
   - TypeScript interfaces for user roles and auth state
   - Defines `UserRole`, `AuthUser`, `UserProfile`, and `AuthState` types

3. **Auth Config** (`src/lib/auth/config.ts`)
   - Centralized configuration for authentication
   - Defines super admin emails, redirects, and retry settings

4. **Redirect Handler** (`src/lib/auth/redirect-handler.ts`)
   - Smart redirect logic based on user roles
   - Handles post-login routing and admin access

5. **Session Sync** (`src/lib/auth/session-sync.ts`)
   - Cross-tab session synchronization
   - Automatic session refresh on tab focus

6. **Error Recovery** (`src/lib/auth/error-recovery.ts`)
   - Retry logic with exponential backoff
   - User-friendly error messages
   - Network error handling

## User Roles

The system supports five user roles with different access levels:

| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | Full system access | All features, user management, system settings |
| `admin` | Administrative access | Most features, limited system settings |
| `llm_manager` | LLM management | LLM-related features, prompt management |
| `user` | Standard user | Basic platform features |
| `viewer` | Read-only access | View-only features |

## Authentication Flow

### 1. Initial Load
```
User visits app → AuthProvider initializes → Check existing session → Load user profile → Set auth state
```

### 2. Sign In
```
User enters credentials → Validate input → Call Supabase Auth → Fetch user profile → Set auth state → Redirect based on role
```

### 3. Sign Out
```
User clicks sign out → Clear local state → Call Supabase Auth → Redirect to home
```

### 4. Session Refresh
```
Automatic every 5 minutes → On window focus → On tab sync → Handle failures gracefully
```

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  organization_id UUID,
  job_title TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_role ENUM
```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin', 
  'llm_manager',
  'user',
  'viewer'
);
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/status` - Check authentication status

### User Management
- `GET /api/admin/users` - List users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Security Features

### 1. Row Level Security (RLS)
All database tables have RLS policies that enforce role-based access:
- Users can only see their own data
- Admins can see all user data
- Super admins have full access

### 2. Session Management
- Automatic session refresh
- Cross-tab synchronization
- Secure token storage
- Session expiry handling

### 3. Error Handling
- Retry logic with exponential backoff
- Network error recovery
- User-friendly error messages
- Graceful degradation

### 4. Input Validation
- Client-side validation
- Server-side validation
- SQL injection prevention
- XSS protection

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Auth Config
```typescript
export const AUTH_CONFIG = {
  superAdminEmails: ['hn@vitalexpert.com'],
  sessionRefreshInterval: 5 * 60 * 1000, // 5 minutes
  redirects: {
    login: '/login',
    afterLogin: '/dashboard',
    adminAfterLogin: '/admin',
    forbidden: '/admin/forbidden'
  },
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  sessionWaitTime: 500, // 500ms
} as const;
```

## Usage Examples

### Using Auth in Components
```typescript
import { useAuth } from '@/lib/auth/auth-provider';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>Role: {user.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Role-Based Access Control
```typescript
import { useAuth } from '@/lib/auth/auth-provider';

function AdminPanel() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

### Redirect After Login
```typescript
import { getPostLoginRedirect } from '@/lib/auth/redirect-handler';

function handleLoginSuccess(user: AuthUser) {
  const redirectPath = getPostLoginRedirect(user);
  router.push(redirectPath);
}
```

## Troubleshooting

### Common Issues

#### 1. Login Redirect Loop
**Symptoms**: User gets stuck in redirect loop between login and admin pages
**Causes**: 
- Conflicting redirect handlers
- Server/client auth mismatch
- Session not properly established

**Solutions**:
- Check for multiple redirect handlers
- Ensure single auth state source
- Add session wait time before redirect

#### 2. "Auth session missing!" Error
**Symptoms**: Admin pages show "Auth session missing!" error
**Causes**:
- Server-side auth check failing
- Cookie sync issues
- Session not available in server context

**Solutions**:
- Use client-side auth checks
- Disable server-side auth in middleware
- Ensure proper session initialization

#### 3. Role Not Recognized
**Symptoms**: User has correct role in database but access is denied
**Causes**:
- Profile not fetched from database
- Role check using email patterns instead of database
- Caching issues

**Solutions**:
- Check user_profiles table
- Verify role fetching logic
- Clear browser cache

#### 4. Session Expires Too Quickly
**Symptoms**: User gets logged out frequently
**Causes**:
- Short session timeout
- Refresh token issues
- Network problems

**Solutions**:
- Check session refresh interval
- Verify refresh token logic
- Test network connectivity

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('auth-debug', 'true');
```

This will log detailed authentication events to the console.

### Health Check

Visit `/api/auth/status` to check authentication system health:
```bash
curl https://your-domain.com/api/auth/status
```

## Development Guidelines

### 1. Adding New Roles
1. Update `user_role` ENUM in database
2. Add role to `UserRole` type in `types.ts`
3. Update role checks in components
4. Add RLS policies for new role
5. Update documentation

### 2. Adding New Protected Routes
1. Create client-side auth guard component
2. Wrap route with auth guard
3. Add role-based access checks
4. Test with different user roles

### 3. Modifying Auth Flow
1. Update `AuthProvider` logic
2. Test all authentication scenarios
3. Update error handling
4. Verify cross-tab sync
5. Update documentation

## Testing

### Manual Testing Checklist
- [ ] Fresh login works
- [ ] Page refresh maintains session
- [ ] Admin access works correctly
- [ ] Logout clears session
- [ ] Invalid credentials show error
- [ ] Network errors recover
- [ ] Session expiry handles gracefully
- [ ] Cross-tab sync works
- [ ] Role-based redirects work
- [ ] Error recovery works

### Automated Testing
Run the test suite:
```bash
npm test src/lib/auth/__tests__/auth-flow.test.ts
```

## Security Considerations

1. **Never store sensitive data in localStorage**
2. **Always validate user input**
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Regular security audits**
6. **Keep dependencies updated**
7. **Monitor for suspicious activity**
8. **Use strong password policies**

## Performance Optimization

1. **Lazy load auth components**
2. **Cache user profiles**
3. **Debounce auth state changes**
4. **Optimize database queries**
5. **Use connection pooling**
6. **Implement request caching**

## Monitoring

### Key Metrics
- Login success rate
- Session duration
- Error rates by type
- User role distribution
- API response times

### Alerts
- High error rates
- Unusual login patterns
- Failed authentication attempts
- Session refresh failures

## Support

For authentication issues:
1. Check this documentation
2. Review error logs
3. Test with different browsers
4. Verify environment variables
5. Contact development team

## Changelog

### v2.0.0 (Current)
- Unified authentication architecture
- Database-driven role management
- Cross-tab session sync
- Comprehensive error recovery
- Client-side only authentication
- Removed server-side auth conflicts

### v1.0.0 (Previous)
- Basic Supabase authentication
- Email-based admin detection
- Server-side auth checks
- Multiple auth providers (removed)
