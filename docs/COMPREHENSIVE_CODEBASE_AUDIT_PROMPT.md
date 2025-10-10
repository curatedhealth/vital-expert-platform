# Comprehensive Codebase Audit Prompt

## Overview
This prompt provides a systematic approach to conducting a thorough codebase audit for a Next.js application with Supabase integration, focusing on error detection, syntax validation, authentication issues, and overall system health.

## Prerequisites
- Access to the codebase repository
- Supabase cloud instance credentials
- Development environment setup
- Testing tools and linters
- Database access permissions

## Phase 1: Build and Syntax Validation

### 1.1 Build Process Audit
```bash
# Run comprehensive build checks
npm run build
npm run lint
npm run type-check
npm run test
```

**Check for:**
- TypeScript compilation errors
- ESLint violations
- Missing dependencies
- Import/export issues
- Circular dependencies
- Bundle size warnings
- Static generation errors

### 1.2 Syntax and Code Quality
**Manual Review Areas:**
- Function declarations and closures
- JSX component structure
- Async/await patterns
- Error handling blocks
- Type definitions
- Interface implementations

**Common Issues to Look For:**
- Missing closing braces `}`
- Unclosed parentheses `)`
- Semicolon inconsistencies
- Variable redeclaration
- Unused imports
- Dead code paths

## Phase 2: Authentication System Audit

### 2.1 Authentication Flow Validation
**Test Scenarios:**
1. **Login Process:**
   - Valid credentials login
   - Invalid credentials handling
   - Empty field validation
   - Network error handling
   - Session persistence

2. **Authorization Checks:**
   - Role-based access control
   - Route protection
   - API endpoint security
   - Admin panel access
   - User session management

3. **Session Management:**
   - Session refresh
   - Cross-tab synchronization
   - Logout functionality
   - Token expiration handling
   - Remember me functionality

### 2.2 Authentication Code Review
**Files to Audit:**
- `src/lib/auth/auth-provider.tsx`
- `src/lib/auth/types.ts`
- `src/lib/auth/config.ts`
- `src/middleware.ts`
- `src/components/admin/AdminClientWrapper.tsx`
- `src/app/(auth)/login/page.tsx`

**Check for:**
- Proper error handling
- State management consistency
- Memory leaks
- Race conditions
- Security vulnerabilities
- Performance issues

## Phase 3: Supabase Integration Audit

### 3.1 Database Connection Validation
```bash
# Test database connectivity
npm run test:db
```

**Verify:**
- Connection string validity
- API key permissions
- Network connectivity
- SSL/TLS configuration
- Connection pooling

### 3.2 Database Schema Validation
**Check Tables:**
- `user_profiles` - User data structure
- `role_permissions` - RBAC system
- `audit_logs` - Security logging
- `user_sessions` - Session management
- `encrypted_api_keys` - API key storage

**Schema Issues to Look For:**
- Missing columns
- Incorrect data types
- Missing indexes
- Foreign key constraints
- RLS policies
- Trigger functions

### 3.3 API Integration Testing
**Test Endpoints:**
- Authentication APIs
- User management APIs
- Admin panel APIs
- Audit logging APIs
- File upload APIs

**Common Issues:**
- CORS configuration
- Rate limiting
- Request validation
- Response formatting
- Error handling
- Timeout settings

## Phase 4: Route and Navigation Audit

### 4.1 Route Protection Validation
**Test All Routes:**
- Public routes (accessible without auth)
- Protected routes (require authentication)
- Admin routes (require admin role)
- API routes (proper authentication)

**Check for:**
- Proper redirects
- 404 error handling
- Loading states
- Error boundaries
- Fallback pages

### 4.2 Navigation Flow Testing
**User Journeys:**
1. Anonymous user → Login → Dashboard
2. Admin user → Admin panel → All sections
3. Regular user → Restricted access → Proper redirect
4. Session expired → Re-authentication flow

## Phase 5: Frontend Component Audit

### 5.1 Component Structure Validation
**Check Components:**
- Props validation
- State management
- Event handling
- Lifecycle methods
- Performance optimization

**Common Issues:**
- Missing key props
- Uncontrolled components
- Memory leaks
- Re-rendering issues
- Accessibility problems

### 5.2 UI/UX Consistency
**Visual Checks:**
- Responsive design
- Theme consistency
- Loading states
- Error messages
- Success feedback
- Form validation

## Phase 6: Backend API Audit

### 6.1 API Endpoint Testing
**Test All Endpoints:**
```bash
# Run API tests
npm run test:api
```

**Validation Areas:**
- Request/response schemas
- Error handling
- Status codes
- Authentication middleware
- Rate limiting
- Input validation

### 6.2 Database Query Optimization
**Performance Checks:**
- Query execution time
- Index usage
- N+1 query problems
- Connection pooling
- Caching strategies

## Phase 7: Security Audit

### 7.1 Security Vulnerabilities
**Check for:**
- SQL injection risks
- XSS vulnerabilities
- CSRF protection
- Input sanitization
- File upload security
- API key exposure

### 7.2 Data Protection
**Verify:**
- Sensitive data encryption
- PII handling
- Audit logging
- Data retention policies
- Backup security

## Phase 8: Performance Audit

### 8.1 Frontend Performance
**Metrics to Check:**
- Page load times
- Bundle sizes
- Image optimization
- Code splitting
- Caching strategies

### 8.2 Backend Performance
**Database Performance:**
- Query optimization
- Connection management
- Caching implementation
- Resource usage

## Phase 9: Error Handling Audit

### 9.1 Error Boundary Implementation
**Check for:**
- Global error boundaries
- Component-level error handling
- API error handling
- User-friendly error messages
- Error logging

### 9.2 Logging and Monitoring
**Verify:**
- Error tracking
- Performance monitoring
- User analytics
- Security logging
- Debug information

## Phase 10: Integration Testing

### 10.1 End-to-End Testing
**Test Complete Flows:**
1. User registration and login
2. Admin panel functionality
3. Data CRUD operations
4. File upload/download
5. Email notifications
6. Payment processing (if applicable)

### 10.2 Cross-Browser Testing
**Browser Compatibility:**
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

## Phase 11: Documentation Audit

### 11.1 Code Documentation
**Check for:**
- Function documentation
- API documentation
- README files
- Setup instructions
- Deployment guides

### 11.2 User Documentation
**Verify:**
- User guides
- Admin documentation
- Troubleshooting guides
- FAQ sections

## Phase 12: Deployment Readiness

### 12.1 Production Configuration
**Environment Variables:**
- Database URLs
- API keys
- Feature flags
- Debug settings
- Logging levels

### 12.2 Deployment Checklist
**Verify:**
- Build process
- Environment setup
- Database migrations
- SSL certificates
- CDN configuration
- Monitoring setup

## Audit Execution Checklist

### Pre-Audit Setup
- [ ] Clone fresh repository
- [ ] Install all dependencies
- [ ] Set up test database
- [ ] Configure environment variables
- [ ] Set up monitoring tools

### During Audit
- [ ] Run automated tests
- [ ] Manual testing
- [ ] Code review
- [ ] Performance testing
- [ ] Security scanning

### Post-Audit
- [ ] Document findings
- [ ] Prioritize issues
- [ ] Create fix plan
- [ ] Implement fixes
- [ ] Re-test solutions

## Common Error Patterns to Look For

### Syntax Errors
- Missing semicolons
- Unclosed brackets
- Incorrect function syntax
- Type mismatches

### Authentication Issues
- Session management problems
- Role-based access failures
- Token expiration handling
- Redirect loops

### Database Issues
- Connection failures
- Query errors
- Schema mismatches
- RLS policy problems

### Integration Issues
- API endpoint failures
- CORS errors
- Network timeouts
- Data synchronization problems

## Tools and Commands

### Development Tools
```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Build
npm run build
npm run start

# Database
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Debugging Tools
- Browser DevTools
- React DevTools
- Network tab
- Console logs
- Error tracking (Sentry, etc.)

## Reporting Template

### Audit Report Structure
1. **Executive Summary**
2. **Critical Issues** (P0)
3. **High Priority Issues** (P1)
4. **Medium Priority Issues** (P2)
5. **Low Priority Issues** (P3)
6. **Recommendations**
7. **Action Plan**

### Issue Documentation
For each issue found:
- **Description**: What is the problem?
- **Impact**: How does it affect users/system?
- **Priority**: P0, P1, P2, P3
- **Steps to Reproduce**: How to trigger the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Suggested Fix**: How to resolve the issue
- **Files Affected**: Which files need changes

## Conclusion

This comprehensive audit prompt covers all critical aspects of a Next.js application with Supabase integration. Follow this systematically to ensure your application is robust, secure, and error-free. Regular audits should be conducted to maintain code quality and system reliability.

Remember to document all findings and create a prioritized action plan for addressing any issues discovered during the audit process.
