# VITAL Path API Security Guidelines

## Table of Contents
1. [Overview](#overview)
2. [API Authentication](#api-authentication)
3. [API Authorization](#api-authorization)
4. [Security Best Practices](#security-best-practices)
5. [OWASP API Security Top 10](#owasp-api-security-top-10)
6. [Input Validation](#input-validation)
7. [Output Sanitization](#output-sanitization)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Logging and Monitoring](#logging-and-monitoring)
11. [Security Headers](#security-headers)
12. [CORS Configuration](#cors-configuration)
13. [API Security Checklist](#api-security-checklist)
14. [Common Vulnerabilities](#common-vulnerabilities)
15. [Code Examples](#code-examples)

---

## Overview

This document provides comprehensive security guidelines for the VITAL Path API. All API endpoints must follow these guidelines to ensure the security and integrity of the healthcare platform.

### Security Principles

- **Zero Trust**: Never trust, always verify
- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimum necessary access
- **Fail Secure**: Default to secure state
- **Complete Mediation**: Check every access

### API Security Framework

```
┌─────────────────────────────────────────────────────────────┐
│                    API Security Layers                     │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Input Validation & Sanitization                  │
│ Layer 2: Authentication & Authorization                   │
│ Layer 3: Rate Limiting & Throttling                       │
│ Layer 4: Business Logic & Data Access                     │
│ Layer 5: Output Sanitization & Response Security          │
│ Layer 6: Logging & Monitoring                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Authentication

### Authentication Methods

**Primary Method: JWT Tokens**
```typescript
// JWT Token Structure
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  role: UserRole;        // User role
  organization_id: string; // Organization ID
  permissions: string[]; // User permissions
  iat: number;          // Issued at
  exp: number;          // Expires at
}
```

**Secondary Method: API Keys**
```typescript
// API Key Structure
interface APIKey {
  id: string;
  name: string;
  key: string;           // Hashed key
  organization_id: string;
  permissions: string[];
  expires_at: Date;
  last_used_at: Date;
  is_active: boolean;
}
```

### Authentication Implementation

**JWT Token Validation**:
```typescript
import { withAuth } from '@/lib/auth/api-auth-middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // Handle authenticated request
    return NextResponse.json({ data: 'success' });
  });
}
```

**API Key Validation**:
```typescript
import { validateAPIKey } from '@/lib/auth/api-key-validator';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }
  
  const validation = await validateAPIKey(apiKey);
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Handle request with validated API key
}
```

### Token Management

**Token Lifecycle**:
- **Access Tokens**: 1 hour expiration
- **Refresh Tokens**: 30 days expiration
- **API Keys**: Configurable expiration (max 1 year)
- **Rotation**: Automatic token rotation on refresh

**Token Security**:
- **Storage**: Secure HTTP-only cookies for web, secure storage for mobile
- **Transmission**: HTTPS only
- **Validation**: Cryptographic signature verification
- **Revocation**: Immediate revocation capability

---

## API Authorization

### Role-Based Access Control (RBAC)

**Permission Matrix**:

| Endpoint | Method | Super Admin | Admin | Manager | User | Viewer |
|----------|--------|-------------|-------|---------|------|--------|
| `/api/users` | GET | ✅ | ✅ (org) | ❌ | ❌ | ❌ |
| `/api/users` | POST | ✅ | ✅ (org) | ❌ | ❌ | ❌ |
| `/api/agents` | GET | ✅ | ✅ (org) | ✅ (org) | ✅ | ✅ |
| `/api/agents` | POST | ✅ | ✅ (org) | ✅ (org) | ❌ | ❌ |
| `/api/workflows` | GET | ✅ | ✅ (org) | ✅ (org) | ✅ | ✅ |
| `/api/workflows` | POST | ✅ | ✅ (org) | ✅ (org) | ❌ | ❌ |
| `/api/admin/*` | ALL | ✅ | ❌ | ❌ | ❌ | ❌ |

### Permission Enforcement

**Frontend Permission Checks**:
```typescript
import { useAuth } from '@/hooks/useAuth';

function AgentManagement() {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('agents', 'create')) {
    return <AccessDenied />;
  }
  
  return <AgentForm />;
}
```

**Backend Permission Checks**:
```typescript
import { requirePermission } from '@/lib/auth/api-auth-middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // Check specific permission
    if (!requirePermission('agents', 'create')(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Handle request
  });
}
```

### Row-Level Security (RLS)

**Organization Isolation**:
```typescript
// Database query with RLS
const agents = await supabase
  .from('agents')
  .select('*')
  .eq('organization_id', user.organization_id);
```

**Cross-Organization Access**:
```typescript
// Only super admins can access cross-organization data
if (user.role === 'super_admin') {
  const allAgents = await supabase.from('agents').select('*');
} else {
  const orgAgents = await supabase
    .from('agents')
    .select('*')
    .eq('organization_id', user.organization_id);
}
```

---

## Security Best Practices

### 1. Input Validation

**Schema Validation**:
```typescript
import { z } from 'zod';

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organization_id: z.string().uuid(),
  configuration: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().min(1).max(4000)
  })
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  try {
    const validatedData = createAgentSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid input data',
      details: error.errors 
    }, { status: 400 });
  }
}
```

**Sanitization**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

### 2. Output Sanitization

**Response Sanitization**:
```typescript
function sanitizeResponse(data: any): any {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeResponse(value);
    }
    return sanitized;
  }
  
  return data;
}
```

### 3. Error Handling

**Secure Error Responses**:
```typescript
export async function GET(request: NextRequest) {
  try {
    // API logic
    return NextResponse.json({ data: result });
  } catch (error) {
    // Log detailed error for debugging
    console.error('API Error:', error);
    
    // Return generic error to client
    return NextResponse.json({ 
      error: 'Internal server error',
      request_id: generateRequestId()
    }, { status: 500 });
  }
}
```

**Error Response Format**:
```typescript
interface APIError {
  error: string;
  message?: string;
  code?: string;
  request_id?: string;
  timestamp: string;
}
```

### 4. Request Validation

**Request Size Limits**:
```typescript
// Middleware for request size validation
export function validateRequestSize(maxSize: number) {
  return (request: NextRequest) => {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json({ 
        error: 'Request too large' 
      }, { status: 413 });
    }
  };
}
```

**Content Type Validation**:
```typescript
export function validateContentType(allowedTypes: string[]) {
  return (request: NextRequest) => {
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json({ 
        error: 'Unsupported content type' 
      }, { status: 415 });
    }
  };
}
```

---

## OWASP API Security Top 10

### 1. Broken Object Level Authorization

**Problem**: APIs expose endpoints that handle object identifiers, creating a wide attack surface for object-level authorization issues.

**Prevention**:
```typescript
// Always validate object ownership
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const agent = await supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id) // RLS protection
      .single();
    
    if (!agent.data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data: agent.data });
  });
}
```

### 2. Broken User Authentication

**Problem**: Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise authentication tokens or to exploit implementation flaws.

**Prevention**:
```typescript
// Secure token validation
import jwt from 'jsonwebtoken';

export function validateToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Additional validation
    if (payload.exp < Date.now() / 1000) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    return null; // Invalid token
  }
}
```

### 3. Excessive Data Exposure

**Problem**: APIs tend to expose more data than necessary, relying on clients to filter the data before displaying it.

**Prevention**:
```typescript
// Return only necessary fields
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const agents = await supabase
      .from('agents')
      .select('id, name, status, created_at') // Only necessary fields
      .eq('organization_id', user.organization_id);
    
    return NextResponse.json({ data: agents.data });
  });
}
```

### 4. Lack of Resources & Rate Limiting

**Problem**: APIs often do not impose any restrictions on the size or number of resources that can be requested by the client or API consumer.

**Prevention**:
```typescript
import { withRateLimit } from '@/lib/rate-limiting/rate-limit-middleware';

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    return withAuth(req, async (authReq, user) => {
      // Handle request
    });
  }, {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  });
}
```

### 5. Broken Function Level Authorization

**Problem**: Complex access control policies with different hierarchies, groups, and roles, and an unclear separation between administrative and regular functions, tend to lead to authorization flaws.

**Prevention**:
```typescript
// Clear permission checks
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // Check specific permission
    if (!user.permissions.includes('agents:delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Additional role check
    if (user.role === 'viewer') {
      return NextResponse.json({ error: 'Viewers cannot delete agents' }, { status: 403 });
    }
    
    // Handle deletion
  });
}
```

### 6. Mass Assignment

**Problem**: Binding client provided data (JSON, XML) to data models without proper filtering based on an allowlist usually leads to mass assignment.

**Prevention**:
```typescript
// Explicit field mapping
const allowedFields = ['name', 'description', 'configuration'];
const updateData = {};

for (const field of allowedFields) {
  if (body[field] !== undefined) {
    updateData[field] = body[field];
  }
}

const result = await supabase
  .from('agents')
  .update(updateData)
  .eq('id', agentId);
```

### 7. Security Misconfiguration

**Problem**: Security misconfiguration is commonly a result of insecure default configurations, incomplete or ad-hoc configurations, open cloud storage, misconfigured HTTP headers, unnecessary HTTP methods, permissive CORS policies, and verbose error messages.

**Prevention**:
```typescript
// Security headers middleware
export function securityHeaders() {
  return (request: NextRequest) => {
    const response = NextResponse.next();
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  };
}
```

### 8. Injection

**Problem**: Injection flaws, such as SQL, NoSQL, Command Injection, etc., occur when untrusted data is sent to an interpreter as part of a command or query.

**Prevention**:
```typescript
// Parameterized queries
export async function GET(request: NextRequest) {
  const { search } = await request.json();
  
  // Use parameterized query
  const result = await supabase
    .from('agents')
    .select('*')
    .ilike('name', `%${search}%`); // Safe parameterized query
  
  return NextResponse.json({ data: result.data });
}
```

### 9. Improper Assets Management

**Problem**: APIs tend to expose more endpoints than traditional web applications, making proper and updated documentation highly important.

**Prevention**:
- Maintain API documentation
- Version API endpoints
- Deprecate old endpoints
- Monitor API usage

### 10. Insufficient Logging & Monitoring

**Problem**: Insufficient logging and monitoring, coupled with ineffective or nonexistent incident response, allows attackers to persist with attacks.

**Prevention**:
```typescript
import { logSecurityEvent } from '@/lib/security/audit-logger';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // Log API access
    await logSecurityEvent({
      event_type: 'api_access',
      user_id: user.id,
      organization_id: user.organization_id,
      ip_address: req.ip,
      endpoint: '/api/agents',
      method: 'POST',
      success: true
    });
    
    // Handle request
  });
}
```

---

## Rate Limiting

### Implementation

**User-Based Rate Limiting**:
```typescript
import { UserRateLimiter } from '@/lib/rate-limiting/user-rate-limiter';

const userRateLimiter = new UserRateLimiter(redisStore, {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000
});

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  
  const allowed = await userRateLimiter.checkLimit(userId, '/api/agents');
  if (!allowed) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded' 
    }, { status: 429 });
  }
  
  // Handle request
}
```

**Organization-Based Rate Limiting**:
```typescript
import { OrgRateLimiter } from '@/lib/rate-limiting/org-rate-limiter';

const orgRateLimiter = new OrgRateLimiter(redisStore, {
  requestsPerMinute: 300,
  requestsPerHour: 5000,
  requestsPerDay: 50000
});

export async function GET(request: NextRequest) {
  const orgId = getOrgIdFromRequest(request);
  
  const allowed = await orgRateLimiter.checkLimit(orgId, '/api/agents');
  if (!allowed) {
    return NextResponse.json({ 
      error: 'Organization rate limit exceeded' 
    }, { status: 429 });
  }
  
  // Handle request
}
```

### Rate Limit Headers

```typescript
export function addRateLimitHeaders(response: NextResponse, limits: RateLimitInfo) {
  response.headers.set('X-RateLimit-Limit', limits.limit.toString());
  response.headers.set('X-RateLimit-Remaining', limits.remaining.toString());
  response.headers.set('X-RateLimit-Reset', limits.resetTime.toString());
  
  return response;
}
```

---

## Logging and Monitoring

### Security Event Logging

**Event Types**:
```typescript
interface SecurityEvent {
  event_type: 'api_access' | 'auth_success' | 'auth_failure' | 'permission_denied' | 'rate_limit_exceeded';
  user_id?: string;
  organization_id?: string;
  ip_address: string;
  user_agent?: string;
  endpoint: string;
  method: string;
  success: boolean;
  details?: Record<string, any>;
  timestamp: Date;
}
```

**Logging Implementation**:
```typescript
import { logSecurityEvent } from '@/lib/security/audit-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const result = await handleRequest(request);
    
    // Log successful request
    await logSecurityEvent({
      event_type: 'api_access',
      user_id: result.user_id,
      organization_id: result.organization_id,
      ip_address: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent'),
      endpoint: '/api/agents',
      method: 'POST',
      success: true,
      details: {
        response_time: Date.now() - startTime,
        agent_id: result.agent_id
      }
    });
    
    return NextResponse.json({ data: result });
  } catch (error) {
    // Log failed request
    await logSecurityEvent({
      event_type: 'api_access',
      ip_address: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent'),
      endpoint: '/api/agents',
      method: 'POST',
      success: false,
      details: {
        error: error.message,
        response_time: Date.now() - startTime
      }
    });
    
    throw error;
  }
}
```

### Monitoring and Alerting

**Key Metrics**:
- API response times
- Error rates by endpoint
- Authentication failure rates
- Rate limit violations
- Unusual access patterns

**Alert Thresholds**:
- Response time > 5 seconds
- Error rate > 5%
- Auth failures > 10 per minute
- Rate limit violations > 100 per hour

---

## Security Headers

### Required Headers

```typescript
export function securityHeaders() {
  return (request: NextRequest) => {
    const response = NextResponse.next();
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');
    
    // XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // HTTPS enforcement
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.vitalpath.com;"
    );
    
    return response;
  };
}
```

### CORS Configuration

```typescript
export function corsHeaders() {
  return (request: NextRequest) => {
    const response = NextResponse.next();
    
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://app.vitalpath.com',
      'https://admin.vitalpath.com'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  };
}
```

---

## API Security Checklist

### Pre-Deployment Checklist

- [ ] **Authentication**: All endpoints require valid authentication
- [ ] **Authorization**: Proper permission checks implemented
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Output Sanitization**: All outputs properly sanitized
- [ ] **Rate Limiting**: Appropriate rate limits configured
- [ ] **Error Handling**: Secure error responses (no sensitive data)
- [ ] **Logging**: Security events properly logged
- [ ] **Headers**: Security headers configured
- [ ] **CORS**: CORS policy properly configured
- [ ] **HTTPS**: All communication encrypted
- [ ] **Testing**: Security tests implemented
- [ ] **Documentation**: API documentation updated

### Ongoing Security Checklist

- [ ] **Monitoring**: Security metrics monitored
- [ ] **Updates**: Dependencies regularly updated
- [ ] **Reviews**: Code reviews include security checks
- [ ] **Testing**: Regular security testing performed
- [ ] **Audits**: Periodic security audits conducted
- [ ] **Training**: Team security training up to date

---

## Common Vulnerabilities

### 1. SQL Injection

**Vulnerable Code**:
```typescript
// DON'T DO THIS
const query = `SELECT * FROM agents WHERE name = '${name}'`;
```

**Secure Code**:
```typescript
// DO THIS
const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('name', name);
```

### 2. Cross-Site Scripting (XSS)

**Vulnerable Code**:
```typescript
// DON'T DO THIS
return NextResponse.json({ 
  message: `<script>alert('XSS')</script>` 
});
```

**Secure Code**:
```typescript
// DO THIS
import DOMPurify from 'isomorphic-dompurify';

const sanitizedMessage = DOMPurify.sanitize(message);
return NextResponse.json({ message: sanitizedMessage });
```

### 3. Insecure Direct Object References

**Vulnerable Code**:
```typescript
// DON'T DO THIS
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const agent = await supabase
    .from('agents')
    .select('*')
    .eq('id', params.id)
    .single();
  
  return NextResponse.json({ data: agent.data });
}
```

**Secure Code**:
```typescript
// DO THIS
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const agent = await supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id) // RLS protection
      .single();
    
    if (!agent.data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data: agent.data });
  });
}
```

### 4. Missing Authentication

**Vulnerable Code**:
```typescript
// DON'T DO THIS
export async function GET(request: NextRequest) {
  const agents = await supabase.from('agents').select('*');
  return NextResponse.json({ data: agents.data });
}
```

**Secure Code**:
```typescript
// DO THIS
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const agents = await supabase
      .from('agents')
      .select('*')
      .eq('organization_id', user.organization_id);
    
    return NextResponse.json({ data: agents.data });
  });
}
```

---

## Code Examples

### Complete Secure API Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth-middleware';
import { withRateLimit } from '@/lib/rate-limiting/rate-limit-middleware';
import { z } from 'zod';
import { logSecurityEvent } from '@/lib/security/audit-logger';

// Input validation schema
const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  configuration: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().min(1).max(4000)
  })
});

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    return withAuth(req, async (authReq, user) => {
      try {
        // Parse and validate input
        const body = await authReq.json();
        const validatedData = createAgentSchema.parse(body);
        
        // Check permissions
        if (!user.permissions.includes('agents:create')) {
          await logSecurityEvent({
            event_type: 'permission_denied',
            user_id: user.id,
            organization_id: user.organization_id,
            ip_address: authReq.ip || 'unknown',
            endpoint: '/api/agents',
            method: 'POST',
            success: false,
            details: { required_permission: 'agents:create' }
          });
          
          return NextResponse.json({ 
            error: 'Insufficient permissions' 
          }, { status: 403 });
        }
        
        // Create agent with RLS protection
        const { data: agent, error } = await supabase
          .from('agents')
          .insert({
            ...validatedData,
            organization_id: user.organization_id,
            created_by: user.id
          })
          .select()
          .single();
        
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
        
        // Log successful creation
        await logSecurityEvent({
          event_type: 'api_access',
          user_id: user.id,
          organization_id: user.organization_id,
          ip_address: authReq.ip || 'unknown',
          endpoint: '/api/agents',
          method: 'POST',
          success: true,
          details: { agent_id: agent.id }
        });
        
        return NextResponse.json({ 
          data: agent,
          message: 'Agent created successfully' 
        }, { status: 201 });
        
      } catch (error) {
        // Log error
        await logSecurityEvent({
          event_type: 'api_access',
          user_id: user.id,
          organization_id: user.organization_id,
          ip_address: authReq.ip || 'unknown',
          endpoint: '/api/agents',
          method: 'POST',
          success: false,
          details: { error: error.message }
        });
        
        // Return secure error response
        if (error instanceof z.ZodError) {
          return NextResponse.json({ 
            error: 'Invalid input data',
            details: error.errors 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          error: 'Internal server error',
          request_id: generateRequestId()
        }, { status: 500 });
      }
    });
  }, {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  });
}
```

---

## Conclusion

Following these API security guidelines ensures that the VITAL Path platform maintains the highest security standards while providing a robust and reliable API for healthcare applications. Regular security reviews, testing, and updates are essential to maintain security posture over time.

For questions or concerns about API security, please contact the security team at security@vitalpath.com.

---

*Last Updated: January 13, 2025*
*Version: 1.0*
*Classification: Internal Use Only*