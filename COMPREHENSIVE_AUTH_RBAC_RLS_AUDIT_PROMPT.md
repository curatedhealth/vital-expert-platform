# Comprehensive Authentication, RBAC, and RLS Audit Prompt

## Overview
This prompt is designed to conduct a thorough security audit of the VITAL Path platform's authentication, Role-Based Access Control (RBAC), and Row Level Security (RLS) implementations across all frontend, backend, and third-party integrations.

## Audit Scope

### 1. Authentication System Audit

#### 1.1 Frontend Authentication
**Audit Areas:**
- Authentication context providers and hooks
- Session management and persistence
- Token handling and storage
- Authentication state synchronization
- Multi-tab session handling
- Auto-refresh mechanisms
- Error handling and recovery

**Key Files to Examine:**
- `src/hooks/useAuth.ts`
- `src/shared/hooks/useAuth.ts`
- `src/lib/auth/auth-provider.tsx`
- `src/lib/auth/supabase-auth-context.tsx`
- `src/lib/auth/session-sync.ts`

**Audit Questions:**
1. Are authentication tokens stored securely (httpOnly cookies vs localStorage)?
2. Is session state properly synchronized across browser tabs?
3. Are there proper error boundaries for authentication failures?
4. Is the authentication context properly isolated and not leaking state?
5. Are there race conditions in authentication initialization?
6. Is session refresh handled gracefully without user interruption?
7. Are authentication errors properly logged and monitored?

#### 1.2 Backend Authentication
**Audit Areas:**
- API route authentication middleware
- JWT token validation and verification
- Session validation and management
- Rate limiting and abuse prevention
- Authentication bypass vulnerabilities
- Token expiration and refresh handling

**Key Files to Examine:**
- `src/middleware.ts`
- `src/middleware/auth.middleware.ts`
- `src/middleware/auth.ts`
- `src/lib/auth/api-auth-middleware.ts`
- `src/middleware/healthcare-api.middleware.ts`

**Audit Questions:**
1. Are all API routes properly protected with authentication middleware?
2. Is JWT token validation consistent across all endpoints?
3. Are there any authentication bypass vulnerabilities?
4. Is rate limiting properly implemented and enforced?
5. Are authentication errors properly handled and logged?
6. Is session validation performed on every request?
7. Are there any hardcoded secrets or credentials in the code?

#### 1.3 Supabase Integration
**Audit Areas:**
- Supabase client configuration
- Authentication flow implementation
- Service role key usage
- RLS policy enforcement
- Database connection security

**Key Files to Examine:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/shared/services/supabase/client.ts`
- `src/shared/services/supabase/server.ts`
- All Supabase migration files in `supabase/migrations/`

**Audit Questions:**
1. Are Supabase credentials properly secured and not exposed?
2. Is the service role key used appropriately and not in client-side code?
3. Are RLS policies properly configured and enforced?
4. Is the authentication flow properly integrated with Supabase?
5. Are there any SQL injection vulnerabilities in RLS policies?
6. Is database access properly scoped to authenticated users?

### 2. Role-Based Access Control (RBAC) Audit

#### 2.1 Role Definition and Hierarchy
**Audit Areas:**
- Role definitions and permissions
- Permission matrix implementation
- Role hierarchy enforcement
- Permission inheritance
- Role assignment and management

**Key Files to Examine:**
- `database/sql/migrations/2025/20250919150000_user_roles_rbac.sql`
- `supabase/migrations/20250919150000_user_roles_rbac.sql`
- `src/middleware/auth.middleware.ts` (ROLE_PERMISSIONS)
- `docs/AUTH_RBAC_GUIDE.md`
- `docs/AUTH_QUICK_REFERENCE.md`

**Audit Questions:**
1. Are all roles properly defined with appropriate permissions?
2. Is the permission matrix complete and consistent?
3. Are there any privilege escalation vulnerabilities?
4. Is role assignment properly validated and secured?
5. Are there any missing permissions for critical operations?
6. Is the role hierarchy properly enforced?

#### 2.2 Permission Enforcement
**Audit Areas:**
- Frontend permission checks
- Backend permission validation
- API endpoint protection
- UI component access control
- Feature flagging based on permissions

**Key Files to Examine:**
- All API route handlers in `src/app/api/`
- Frontend components with role-based rendering
- Permission checking utilities
- Route protection middleware

**Audit Questions:**
1. Are all API endpoints properly protected with permission checks?
2. Are frontend components properly gated based on user permissions?
3. Is permission checking consistent between frontend and backend?
4. Are there any client-side permission bypasses?
5. Are sensitive operations properly protected with multiple permission layers?
6. Is permission caching implemented securely?

#### 2.3 Admin and Super Admin Controls
**Audit Areas:**
- Admin route protection
- Super admin privilege management
- Administrative action logging
- User management capabilities
- System configuration access

**Key Files to Examine:**
- Admin dashboard components
- User management APIs
- System configuration endpoints
- Audit logging implementations

**Audit Questions:**
1. Are admin routes properly protected with role checks?
2. Is super admin access properly restricted and monitored?
3. Are administrative actions properly logged and auditable?
4. Is user role modification properly secured?
5. Are system configuration changes properly protected?

### 3. Row Level Security (RLS) Audit

#### 3.1 Database RLS Policies
**Audit Areas:**
- RLS policy definitions
- Policy enforcement consistency
- Data isolation between organizations
- Policy performance and optimization
- Policy testing and validation

**Key Files to Examine:**
- `database/sql/policies/20240101000001_rls_policies.sql`
- `supabase/migrations/20250102_create_missing_tables.sql`
- `supabase/migrations/20251008000004_complete_cloud_migration.sql`
- All RLS policy files in `supabase/migrations/`

**Audit Questions:**
1. Are RLS policies properly defined for all tables?
2. Is data properly isolated between organizations?
3. Are there any RLS policy bypasses or vulnerabilities?
4. Are policies optimized for performance?
5. Are there any missing RLS policies for sensitive tables?
6. Are RLS policies properly tested and validated?

#### 3.2 Data Access Patterns
**Audit Areas:**
- Query-level security
- Data filtering and scoping
- Cross-organization data access
- Sensitive data protection
- Audit trail completeness

**Key Files to Examine:**
- Database query implementations
- Data access services
- API response filtering
- Audit logging implementations

**Audit Questions:**
1. Are all database queries properly scoped to user permissions?
2. Is sensitive data properly filtered at the database level?
3. Are there any data leakage vulnerabilities?
4. Is cross-organization data access properly prevented?
5. Are audit trails complete and tamper-proof?

### 4. Integration Security Audit

#### 4.1 Third-Party Integrations
**Audit Areas:**
- External API authentication
- OAuth implementation
- Webhook security
- API key management
- Integration permission scoping

**Key Files to Examine:**
- External API integration files
- OAuth implementation
- Webhook handlers
- API key management utilities

**Audit Questions:**
1. Are external API integrations properly authenticated?
2. Are OAuth flows properly implemented and secured?
3. Are webhooks properly validated and secured?
4. Are API keys properly managed and rotated?
5. Are integration permissions properly scoped?

#### 4.2 Cross-Service Communication
**Audit Areas:**
- Service-to-service authentication
- Internal API security
- Message queue security
- Database connection security
- Cache security

**Key Files to Examine:**
- Service communication implementations
- Internal API handlers
- Message queue configurations
- Database connection pools

**Audit Questions:**
1. Are service-to-service communications properly authenticated?
2. Are internal APIs properly secured?
3. Are message queues properly protected?
4. Are database connections properly secured?
5. Is cached data properly protected?

### 5. Security Monitoring and Logging

#### 5.1 Audit Logging
**Audit Areas:**
- Authentication event logging
- Authorization decision logging
- Security event monitoring
- Log integrity and retention
- Alert mechanisms

**Key Files to Examine:**
- Audit logging implementations
- Security monitoring services
- Alert configuration
- Log retention policies

**Audit Questions:**
1. Are all authentication events properly logged?
2. Are authorization decisions properly recorded?
3. Are security events properly monitored and alerted?
4. Are logs properly secured and tamper-proof?
5. Are log retention policies appropriate?

#### 5.2 Incident Response
**Audit Areas:**
- Security incident detection
- Response procedures
- Escalation mechanisms
- Recovery procedures
- Post-incident analysis

**Key Files to Examine:**
- Incident response procedures
- Security monitoring dashboards
- Alert escalation configurations

**Audit Questions:**
1. Are security incidents properly detected and responded to?
2. Are escalation procedures properly defined and tested?
3. Are recovery procedures properly documented and tested?
4. Is post-incident analysis properly conducted?

### 6. Compliance and Standards

#### 6.1 Healthcare Compliance
**Audit Areas:**
- HIPAA compliance
- PHI protection
- Data encryption
- Access controls
- Audit requirements

**Audit Questions:**
1. Is PHI properly protected according to HIPAA requirements?
2. Are access controls appropriate for healthcare data?
3. Is data encryption properly implemented?
4. Are audit requirements properly met?

#### 6.2 Security Standards
**Audit Areas:**
- OWASP compliance
- Security best practices
- Vulnerability management
- Penetration testing
- Security documentation

**Audit Questions:**
1. Is the application compliant with OWASP security standards?
2. Are security best practices properly implemented?
3. Is vulnerability management properly conducted?
4. Are security controls properly documented?

## Audit Methodology

### Phase 1: Static Code Analysis
1. Review all authentication-related code files
2. Analyze RBAC implementation and permission matrices
3. Examine RLS policy definitions and enforcement
4. Check for hardcoded secrets and credentials
5. Identify potential security vulnerabilities

### Phase 2: Dynamic Testing
1. Test authentication flows and edge cases
2. Verify permission enforcement across all endpoints
3. Test RLS policy enforcement with different user roles
4. Attempt privilege escalation and bypass techniques
5. Test session management and token handling

### Phase 3: Integration Testing
1. Test third-party integrations and OAuth flows
2. Verify cross-service communication security
3. Test webhook security and validation
4. Verify external API authentication

### Phase 4: Compliance Verification
1. Verify HIPAA compliance for healthcare data
2. Check OWASP compliance and security standards
3. Verify audit logging and monitoring
4. Test incident response procedures

## Deliverables

### 1. Executive Summary
- Overall security posture assessment
- Critical vulnerabilities identified
- Risk level and recommendations
- Compliance status

### 2. Detailed Findings
- Vulnerability descriptions and impact
- Affected components and files
- Proof of concept demonstrations
- Remediation recommendations

### 3. Security Recommendations
- Immediate actions required
- Short-term improvements
- Long-term security roadmap
- Best practices implementation

### 4. Compliance Report
- HIPAA compliance status
- OWASP compliance assessment
- Audit trail completeness
- Regulatory requirements met

### 5. Remediation Plan
- Prioritized vulnerability fixes
- Implementation timeline
- Testing and validation procedures
- Ongoing monitoring recommendations

## Tools and Techniques

### Static Analysis Tools
- CodeQL for vulnerability detection
- ESLint security rules
- TypeScript security analysis
- SQL injection detection

### Dynamic Testing Tools
- OWASP ZAP for web application testing
- Burp Suite for API testing
- Custom penetration testing scripts
- Authentication flow testing tools

### Compliance Tools
- HIPAA compliance checkers
- OWASP compliance scanners
- Security audit frameworks
- Vulnerability assessment tools

## Success Criteria

### Security Objectives
- Zero critical vulnerabilities
- All authentication flows properly secured
- Complete RBAC implementation
- Comprehensive RLS coverage
- Full audit trail implementation

### Compliance Objectives
- HIPAA compliance for healthcare data
- OWASP compliance for web security
- Complete audit logging
- Proper incident response procedures

### Quality Objectives
- Comprehensive test coverage
- Clear documentation
- Actionable recommendations
- Measurable improvements

## Timeline and Resources

### Phase 1: Static Analysis (Week 1)
- Code review and analysis
- Vulnerability identification
- Documentation review

### Phase 2: Dynamic Testing (Week 2)
- Authentication testing
- Permission testing
- RLS policy testing

### Phase 3: Integration Testing (Week 3)
- Third-party integration testing
- Cross-service testing
- End-to-end testing

### Phase 4: Compliance Verification (Week 4)
- Compliance checking
- Documentation review
- Final report preparation

## Risk Assessment

### High Risk Areas
- Authentication bypass vulnerabilities
- Privilege escalation issues
- Data leakage through RLS bypass
- Hardcoded secrets and credentials
- Inadequate audit logging

### Medium Risk Areas
- Permission enforcement gaps
- Session management issues
- API security weaknesses
- Integration security gaps

### Low Risk Areas
- UI permission checks
- Documentation gaps
- Monitoring improvements
- Process enhancements

## Conclusion

This comprehensive audit will provide a thorough assessment of the VITAL Path platform's security posture, ensuring that all authentication, RBAC, and RLS implementations are properly secured, compliant with healthcare regulations, and following security best practices. The audit will identify vulnerabilities, provide actionable recommendations, and establish a roadmap for ongoing security improvements.
