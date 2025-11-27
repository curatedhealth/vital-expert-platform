# VITAL Platform - Security Framework

**Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Active
**Owner**: VITAL Security Team
**Classification**: Internal

---

## Executive Summary

This document outlines the comprehensive security framework for the VITAL Platform, a business operations and strategic intelligence platform for healthcare organizations. Our security posture is designed to protect customer data, ensure service availability, and maintain compliance with global security standards.

### Security Certifications & Standards

| Certification | Status | Scope |
|---------------|--------|-------|
| **SOC 2 Type II** | Active | Security, Availability, Confidentiality |
| **ISO 27001** | Active | Information Security Management |
| **ISO 27701** | Planned | Privacy Information Management |
| **CSA STAR** | Planned | Cloud Security |
| **Cyber Essentials Plus** | Active | UK deployments |

---

## Table of Contents

1. [Security Governance](#1-security-governance)
2. [Infrastructure Security](#2-infrastructure-security)
3. [Application Security](#3-application-security)
4. [Data Security](#4-data-security)
5. [Identity & Access Management](#5-identity--access-management)
6. [Network Security](#6-network-security)
7. [Endpoint Security](#7-endpoint-security)
8. [Security Operations](#8-security-operations)
9. [Incident Response](#9-incident-response)
10. [Business Continuity](#10-business-continuity)
11. [Third-Party Security](#11-third-party-security)
12. [Security Awareness](#12-security-awareness)

---

## 1. Security Governance

### 1.1 Security Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                  VITAL Security Organization                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Board of Directors                                             │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Executive Leadership                    │      │
│  │  (Ultimate security accountability)                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   CISO     │  │    DPO     │  │   CTO      │               │
│  │            │  │            │  │            │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Security  │  │  Privacy   │  │Engineering │               │
│  │    Team    │  │    Team    │  │   Team     │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Security Policies

| Policy | Description | Review Cycle |
|--------|-------------|--------------|
| **Information Security Policy** | Master security policy | Annual |
| **Acceptable Use Policy** | Employee technology usage | Annual |
| **Access Control Policy** | User access management | Annual |
| **Data Classification Policy** | Data handling standards | Annual |
| **Incident Response Policy** | Security incident handling | Annual |
| **Password Policy** | Authentication requirements | Annual |
| **Remote Work Policy** | Secure remote access | Annual |
| **Vendor Security Policy** | Third-party requirements | Annual |
| **Change Management Policy** | System change controls | Annual |
| **Backup & Recovery Policy** | Data protection procedures | Annual |

### 1.3 Risk Management Framework

```yaml
Risk Assessment Process:
  frequency: "Quarterly"
  methodology: "NIST RMF / ISO 27005"

  steps:
    1. Asset Identification
    2. Threat Identification
    3. Vulnerability Assessment
    4. Risk Analysis (Likelihood x Impact)
    5. Risk Treatment (Accept, Mitigate, Transfer, Avoid)
    6. Risk Monitoring

Risk Categories:
  - Strategic Risk
  - Operational Risk
  - Technical Risk
  - Compliance Risk
  - Reputational Risk

Risk Tolerance Levels:
  critical: "Immediate action required"
  high: "Action within 7 days"
  medium: "Action within 30 days"
  low: "Action within 90 days"
```

---

## 2. Infrastructure Security

### 2.1 Cloud Infrastructure

```yaml
Primary Cloud Provider: AWS / Google Cloud Platform

Security Controls:
  compute:
    - Hardened AMIs/images
    - Auto-scaling groups
    - Instance metadata service v2
    - No public IPs on compute instances

  storage:
    - Encryption at rest (AES-256)
    - Versioning enabled
    - Access logging
    - Lifecycle policies

  networking:
    - VPC isolation
    - Private subnets for compute
    - NAT gateways for outbound
    - VPC flow logs enabled

  identity:
    - IAM roles (no long-term keys)
    - Service accounts with least privilege
    - MFA enforced for console access
```

### 2.2 Infrastructure Hardening

| Component | Hardening Standard | Verification |
|-----------|-------------------|--------------|
| **Operating Systems** | CIS Benchmarks | Automated scanning |
| **Containers** | CIS Docker/Kubernetes | Container scanning |
| **Databases** | CIS Database Benchmarks | Configuration audit |
| **Network Devices** | CIS Network Benchmarks | Network scanning |
| **Cloud Services** | CIS Cloud Benchmarks | Cloud security posture |

### 2.3 Kubernetes Security

```yaml
Kubernetes Security Controls:

  cluster_security:
    - Private API server endpoint
    - RBAC enabled
    - Network policies enforced
    - Pod security standards (restricted)
    - Secrets encryption at rest

  workload_security:
    - Non-root containers
    - Read-only root filesystem
    - Resource limits defined
    - Security contexts enforced
    - No privileged containers

  image_security:
    - Private container registry
    - Image signing (cosign)
    - Vulnerability scanning
    - Base image from trusted sources
    - Regular image updates

  runtime_security:
    - Runtime threat detection
    - Syscall filtering (seccomp)
    - AppArmor/SELinux profiles
    - Network segmentation
```

### 2.4 Infrastructure as Code (IaC) Security

```yaml
IaC Security Controls:

  terraform:
    - State encryption
    - Remote state locking
    - Sentinel policies
    - Pre-commit hooks

  scanning:
    - Checkov / tfsec
    - KICS
    - Trivy (IaC mode)

  secrets_management:
    - No secrets in code
    - HashiCorp Vault integration
    - AWS Secrets Manager
    - Environment variable injection
```

---

## 3. Application Security

### 3.1 Secure Development Lifecycle (SDLC)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Secure SDLC Process                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │ Design  │──▶│  Code   │──▶│  Test   │──▶│ Deploy  │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│       │             │             │             │               │
│       ▼             ▼             ▼             ▼               │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │ Threat  │   │  SAST   │   │  DAST   │   │ Security│        │
│  │Modeling │   │ Scanning│   │ Testing │   │ Review  │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│                                                                  │
│  Security Gates:                                                │
│  ├─ Design Review (threat model required)                       │
│  ├─ Code Review (security checklist)                           │
│  ├─ SAST scan (no high/critical findings)                      │
│  ├─ DAST scan (no high/critical findings)                      │
│  ├─ Dependency scan (no known vulnerabilities)                 │
│  └─ Security sign-off for production                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Application Security Testing

| Test Type | Tool | Frequency | Gate |
|-----------|------|-----------|------|
| **SAST** | Semgrep, CodeQL | Every PR | High/Critical blocks |
| **DAST** | OWASP ZAP | Weekly | High/Critical blocks |
| **SCA** | Snyk, Dependabot | Every build | Known CVEs block |
| **Container Scanning** | Trivy | Every build | Critical blocks |
| **Secrets Detection** | GitLeaks, TruffleHog | Every commit | Any finding blocks |
| **Penetration Testing** | Third-party | Bi-annual | Findings remediated |

### 3.3 OWASP Top 10 Mitigations

| OWASP Risk | Mitigation |
|------------|------------|
| **A01: Broken Access Control** | RBAC, multi-tenant isolation (RLS), server-side organization determination, automatic context setting, membership validation, unauthorized access logging |
| **A02: Cryptographic Failures** | TLS 1.3, AES-256, secure key management |
| **A03: Injection** | Parameterized queries, input validation, ORM |
| **A04: Insecure Design** | Threat modeling, security requirements |
| **A05: Security Misconfiguration** | CIS benchmarks, automated hardening |
| **A06: Vulnerable Components** | SCA scanning, dependency updates |
| **A07: Auth Failures** | MFA, strong passwords, session management (15-min auto-logoff), secure cookies (sameSite: strict) |
| **A08: Data Integrity Failures** | Code signing, integrity checks |
| **A09: Logging Failures** | Comprehensive logging, SIEM integration, unauthorized access attempt tracking |
| **A10: SSRF** | Egress filtering, URL validation |

### 3.4 API Security

```yaml
API Security Controls:

  authentication:
    - OAuth 2.0 / OpenID Connect
    - JWT tokens (short-lived)
    - API key rotation
    - Mutual TLS (for service-to-service)

  authorization:
    - Scope-based access control
    - Rate limiting per client
    - Request validation
    - Response filtering

  protection:
    - WAF (Web Application Firewall)
    - DDoS protection
    - Bot detection
    - Input sanitization

  monitoring:
    - API access logging
    - Anomaly detection
    - Abuse detection
    - Usage analytics
```

---

## 4. Data Security

### 4.1 Data Classification

| Classification | Description | Examples | Controls |
|----------------|-------------|----------|----------|
| **Public** | No confidentiality requirements | Marketing content, public docs | Standard controls |
| **Internal** | Internal use only | Policies, procedures | Access control |
| **Confidential** | Business sensitive | Customer data, strategies | Encryption, access logging |
| **Regulated** | Subject to compliance | PHI, EU personal data | Full controls, DPA/BAA |

### 4.2 Encryption Standards

```yaml
Encryption at Rest:
  algorithm: "AES-256-GCM"
  key_management: "AWS KMS / GCP Cloud KMS"
  key_rotation: "Annual (automatic)"

  implementations:
    - Database: Transparent Data Encryption (TDE)
    - Object Storage: Server-side encryption (SSE-KMS)
    - Backups: Encrypted with separate keys
    - Secrets: Vault/KMS encrypted

Encryption in Transit:
  protocol: "TLS 1.3"
  minimum_version: "TLS 1.2"
  cipher_suites:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
    - TLS_AES_128_GCM_SHA256

  certificate_management:
    - CA: Let's Encrypt / AWS ACM
    - Rotation: Automatic (90 days)
    - Monitoring: Certificate expiry alerts

Application-Level Encryption:
  sensitive_fields:
    - PII: Field-level encryption
    - API Keys: Envelope encryption
    - Tokens: Hashed (bcrypt/argon2)
```

### 4.3 Data Loss Prevention (DLP)

```yaml
DLP Controls:

  prevention:
    - Email DLP scanning
    - Cloud DLP policies
    - Endpoint DLP agents
    - API egress controls

  detection:
    - Pattern matching (PII, PHI)
    - Anomalous data access
    - Large data exports
    - Unusual download patterns

  response:
    - Automatic blocking
    - Alert generation
    - Incident creation
    - Forensic logging
```

### 4.4 Data Retention & Disposal

| Data Type | Retention Period | Disposal Method |
|-----------|------------------|-----------------|
| **Customer Data** | Contract term + 30 days | Secure deletion |
| **Audit Logs** | 7 years | Archive then delete |
| **Backups** | 90 days | Automatic expiry |
| **Session Data** | 24 hours | Automatic purge |
| **Analytics** | 2 years (aggregated) | Anonymization |

---

## 4.5 Multi-Tenant Data Isolation

### Architecture Overview

VITAL implements a 3-level organizational hierarchy with Row-Level Security (RLS) enforcement:

```
Platform (VITAL)
  └── Tenant (Industry Vertical: Pharma, Digital Health)
      └── Organization (Company Workspace: Novartis, Pfizer)
          └── Solutions (Department-specific configurations)
```

### Multi-Tenant Security Controls

```yaml
Organization Determination:
  method: "Server-side only (subdomain or user profile)"
  enforcement: "Middleware layer"
  prohibited: "Client-controllable headers (x-tenant-id), cookies (tenant_id)"

  validation:
    - Subdomain parsing (e.g., novartis.localhost)
    - User profile organization_id lookup
    - User-organization membership verification
    - NEVER trust client-provided values

Row-Level Security (RLS):
  implementation: "PostgreSQL RLS policies"
  scope: "All multi-tenant tables"
  context_setting: "Automatic on every request"
  session_variable: "app.current_organization_id"

  enforcement_layers:
    - Database RLS policies (automatic filtering)
    - Application-level checks (defense in depth)
    - Middleware validation (request interception)
    - Audit logging (unauthorized access attempts)

Membership Validation:
  function: "validate_user_organization_membership(user_id, org_id)"
  frequency: "Every request requiring organization access"
  audit: "Unauthorized attempts logged to unauthorized_access_attempts table"

  process:
    1. Extract authenticated user ID from session
    2. Determine target organization (subdomain or profile)
    3. Query user_organizations junction table
    4. Deny access if membership not found
    5. Log unauthorized attempt for audit

Automatic Context Setting:
  function: "set_organization_context(organization_id)"
  timing: "Before any database query"
  session_variables:
    - app.current_organization_id
    - app.tenant_id (legacy compatibility)

  fail_secure: "Deny request if context cannot be set"
```

### Cross-Organization Isolation Verification

| Test | Expected Behavior | Implementation |
|------|------------------|----------------|
| **Query Filtering** | Organization A cannot query Organization B's data | RLS policies filter by app.current_organization_id |
| **Header Manipulation** | Changing x-tenant-id header has no effect | Middleware ignores client-provided headers |
| **Cookie Manipulation** | Changing tenant_id cookie has no effect | Middleware ignores client-provided cookies |
| **Direct Access** | Cannot access resources by guessing IDs | RLS policies and authorization checks block |
| **API Bypass** | Cannot bypass via direct API calls | Every endpoint validates organization context |

### Sharing Scopes

```yaml
Sharing Levels:
  platform:
    visibility: "All organizations across all tenants"
    use_case: "Platform-wide resources (system agents, templates)"

  tenant:
    visibility: "All organizations within same tenant"
    use_case: "Industry-specific resources (pharma protocols)"

  organization:
    visibility: "Only owning organization"
    use_case: "Company-private resources (custom workflows)"
```

### Security Monitoring

```yaml
Audit Events:
  - organization_context_set: Log every context setting
  - organization_context_failed: Log context setting failures
  - unauthorized_access_attempt: Log failed membership validations
  - cross_organization_query_blocked: Log RLS policy blocks

Metrics:
  - unauthorized_access_attempts_per_day
  - organization_context_failures_per_hour
  - rls_policy_blocks_per_user
  - cross_organization_query_attempts

Alerting:
  critical:
    - Multiple unauthorized access attempts from single user (>5 in 1 hour)
    - Organization context consistently failing to set
    - Pattern of cross-organization access attempts

  warning:
    - Single unauthorized access attempt (may be user error)
    - RLS policy block (expected behavior, log for audit)
```

---

## 5. Identity & Access Management

### 5.1 Authentication

```yaml
Authentication Methods:

  primary:
    - Email/Password (strong requirements)
    - OAuth 2.0 (Google, Microsoft, Okta)
    - SAML 2.0 (Enterprise SSO)

  multi_factor:
    - TOTP (Authenticator apps)
    - WebAuthn/FIDO2 (Hardware keys)
    - Push notifications
    - SMS (backup only)

  password_policy:
    minimum_length: 12
    complexity: "Upper, lower, number, special"
    history: 10
    max_age: 90 days
    lockout_threshold: 5 attempts
    lockout_duration: 30 minutes

  session_management:
    session_timeout: 15 minutes (idle) # HIPAA §164.312(a)(2)(iii) compliance
    absolute_timeout: 15 minutes # HIPAA automatic logoff requirement
    concurrent_sessions: Limited
    secure_cookies: true # Always HTTPS, even in development
    httpOnly: true # Prevents XSS cookie theft
    sameSite: Strict # Prevents CSRF attacks (changed from 'lax')

    cookie_security_hardening:
      - No client-controllable cookies for security decisions
      - tenant_id cookie informational only (not trusted for authorization)
      - Automatic cookie expiration after 15 minutes
      - Cookies cleared on logout
```

### 5.2 Authorization

```yaml
Authorization Model: RBAC + ABAC

Role-Based Access Control (RBAC):
  roles:
    - Platform Admin: Full platform access
    - Tenant Admin: Full tenant access
    - User Manager: User management within tenant
    - Analyst: Read access to analytics
    - User: Standard application access
    - Viewer: Read-only access

Attribute-Based Access Control (ABAC):
  attributes:
    - Tenant ID (mandatory)
    - Department
    - Geographic region
    - Data classification clearance

Multi-Tenant Isolation:
  implementation: "Row-Level Security (RLS) + Application-level validation"
  enforcement: "Database level (automatic), Middleware level (validation)"
  verification: "Automated tests, Penetration testing, Audit logging"

  security_layers:
    1. Middleware: Organization determination and membership validation
    2. Application: Authorization checks before operations
    3. Database: RLS policies automatic filtering
    4. Audit: Comprehensive logging of access attempts

  critical_controls:
    - Server-side organization determination ONLY
    - User-organization membership validation on EVERY request
    - Automatic RLS context setting before queries
    - Fail-secure error handling (deny on error)
    - Unauthorized access attempt logging (audit trail)
```

### 5.3 Privileged Access Management

```yaml
PAM Controls:

  privileged_accounts:
    - Just-in-time access (JIT)
    - Time-limited sessions
    - Session recording
    - Approval workflows

  admin_access:
    - Separate admin accounts
    - No standing privileges
    - Break-glass procedures
    - Quarterly access reviews

  service_accounts:
    - Managed identities (no passwords)
    - Least privilege
    - Regular rotation
    - Usage monitoring
```

---

## 6. Network Security

### 6.1 Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Network Security Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Internet                                                        │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    CDN / WAF                          │      │
│  │         (DDoS protection, bot detection)             │      │
│  └──────────────────────────────────────────────────────┘      │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Load Balancer (Public)                │      │
│  │              (TLS termination, health checks)         │      │
│  └──────────────────────────────────────────────────────┘      │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              DMZ / Public Subnet                      │      │
│  │        (API Gateway, reverse proxy)                  │      │
│  └──────────────────────────────────────────────────────┘      │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Private Subnet - Application               │      │
│  │         (Application servers, containers)            │      │
│  └──────────────────────────────────────────────────────┘      │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Private Subnet - Data                    │      │
│  │              (Databases, caches)                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Network Security Controls

| Control | Implementation |
|---------|----------------|
| **Segmentation** | VPC with public/private subnets |
| **Firewall** | Security groups, NACLs, WAF |
| **DDoS Protection** | AWS Shield / CloudFlare |
| **Intrusion Detection** | AWS GuardDuty / GCP SCC |
| **VPN** | Site-to-site for enterprise |
| **DNS Security** | DNSSEC, DNS filtering |
| **Traffic Inspection** | VPC flow logs, packet mirroring |

### 6.3 Web Application Firewall (WAF)

```yaml
WAF Rules:

  managed_rules:
    - OWASP Core Rule Set
    - Known Bad Inputs
    - SQL Injection
    - XSS Protection
    - Bot Control

  custom_rules:
    - Rate limiting (by IP, by user)
    - Geographic restrictions (if required)
    - Payload size limits
    - Request frequency limits

  monitoring:
    - Real-time alerting
    - Attack analytics
    - False positive tuning
```

---

## 7. Endpoint Security

### 7.1 Corporate Device Security

```yaml
Endpoint Protection:

  requirements:
    - Managed by MDM (Mobile Device Management)
    - Full disk encryption (FileVault/BitLocker)
    - EDR agent installed
    - Automatic OS updates
    - Firewall enabled
    - Screen lock (5 min timeout)

  software:
    - Approved software list
    - Automatic patch management
    - Application whitelisting (high-risk roles)

  monitoring:
    - Endpoint Detection & Response (EDR)
    - File integrity monitoring
    - Behavioral analysis
    - Threat intelligence integration
```

### 7.2 BYOD Policy

```yaml
BYOD Requirements:

  allowed_use:
    - Email access (with MDM container)
    - Collaboration tools (web-based)

  prohibited:
    - Direct database access
    - Admin consoles
    - Customer data downloads

  security_requirements:
    - Device passcode/biometric
    - Remote wipe capability
    - Containerized apps
    - No jailbroken/rooted devices
```

---

## 8. Security Operations

### 8.1 Security Monitoring

```yaml
Security Information & Event Management (SIEM):

  log_sources:
    - Application logs
    - Infrastructure logs
    - Security tool logs
    - Cloud audit logs
    - Network flow logs
    - Authentication logs

  detection_rules:
    - Brute force attempts
    - Anomalous access patterns
    - Privilege escalation
    - Data exfiltration indicators
    - Malware indicators
    - Policy violations

  response:
    - Automated alerting
    - Runbook integration
    - Ticket creation
    - Escalation procedures
```

### 8.2 Vulnerability Management

```yaml
Vulnerability Management Program:

  scanning:
    infrastructure:
      frequency: "Weekly"
      tool: "Qualys / Nessus"
      scope: "All hosts"

    application:
      frequency: "Every deployment"
      tools: "SAST, DAST, SCA"
      scope: "All code and dependencies"

    container:
      frequency: "Every build"
      tool: "Trivy / Snyk"
      scope: "All container images"

  remediation_sla:
    critical: "24 hours"
    high: "7 days"
    medium: "30 days"
    low: "90 days"

  exceptions:
    - Documented justification required
    - Compensating controls identified
    - Time-limited (max 90 days)
    - Executive approval for critical/high
```

### 8.3 Threat Intelligence

```yaml
Threat Intelligence Sources:

  external:
    - Commercial threat feeds
    - ISAC (Information Sharing and Analysis Center)
    - CISA advisories
    - Vendor security bulletins

  internal:
    - Incident learnings
    - Penetration test findings
    - Red team exercises

  usage:
    - IOC blocking
    - Detection rule creation
    - Risk assessment updates
    - Threat modeling input
```

---

## 9. Incident Response

### 9.1 Incident Response Plan

```yaml
Incident Classification:

  severity_1_critical:
    definition: "Active breach, data exfiltration, service unavailable"
    response_time: "15 minutes"
    escalation: "Immediate executive notification"

  severity_2_high:
    definition: "Potential breach, significant vulnerability"
    response_time: "1 hour"
    escalation: "Security team lead"

  severity_3_medium:
    definition: "Security policy violation, suspicious activity"
    response_time: "4 hours"
    escalation: "Security analyst"

  severity_4_low:
    definition: "Minor security issue, informational"
    response_time: "24 hours"
    escalation: "Queue for review"
```

### 9.2 Incident Response Process

```
┌─────────────────────────────────────────────────────────────────┐
│                  Incident Response Process                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DETECTION & REPORTING                                       │
│     ├─ Automated detection (SIEM, EDR)                         │
│     ├─ User reports                                             │
│     └─ Third-party notification                                 │
│                                                                  │
│  2. TRIAGE & CLASSIFICATION                                     │
│     ├─ Initial assessment                                       │
│     ├─ Severity classification                                  │
│     └─ Incident ticket creation                                 │
│                                                                  │
│  3. CONTAINMENT                                                 │
│     ├─ Isolate affected systems                                │
│     ├─ Preserve evidence                                        │
│     └─ Prevent further damage                                   │
│                                                                  │
│  4. ERADICATION                                                 │
│     ├─ Remove threat                                            │
│     ├─ Patch vulnerabilities                                    │
│     └─ Verify removal                                           │
│                                                                  │
│  5. RECOVERY                                                    │
│     ├─ Restore services                                         │
│     ├─ Monitor for recurrence                                   │
│     └─ Validate recovery                                        │
│                                                                  │
│  6. POST-INCIDENT                                               │
│     ├─ Root cause analysis                                      │
│     ├─ Lessons learned                                          │
│     └─ Process improvements                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Breach Notification

```yaml
Notification Requirements:

  regulatory:
    gdpr:
      authority: "72 hours"
      individuals: "Without undue delay"
    hipaa:
      authority: "60 days"
      individuals: "60 days"
    state_laws:
      varies: "Check applicable state law"

  internal:
    executive: "Immediate for Sev 1"
    legal: "Within 4 hours"
    communications: "Within 8 hours"

  external:
    customers: "Per contract and regulation"
    partners: "As required"
    law_enforcement: "When appropriate"
```

---

## 10. Business Continuity

### 10.1 Backup Strategy

```yaml
Backup Configuration:

  database:
    type: "Continuous replication + point-in-time"
    retention: "90 days"
    geographic: "Cross-region"
    encryption: "AES-256"
    testing: "Monthly restore test"

  file_storage:
    type: "Incremental daily, full weekly"
    retention: "90 days"
    geographic: "Cross-region"
    versioning: "Enabled"

  configuration:
    type: "Infrastructure as Code"
    storage: "Git repository"
    encryption: "Encrypted secrets"
```

### 10.2 Disaster Recovery

```yaml
Recovery Objectives:

  tier_1_critical:
    systems: "Core platform, database"
    rto: "1 hour"
    rpo: "5 minutes"

  tier_2_important:
    systems: "Analytics, reporting"
    rto: "4 hours"
    rpo: "1 hour"

  tier_3_standard:
    systems: "Development, testing"
    rto: "24 hours"
    rpo: "24 hours"

DR Strategy:
  type: "Active-Passive with automatic failover"
  primary_region: "US-West / EU-West"
  secondary_region: "US-East / EU-Central"
  testing: "Quarterly DR drill"
```

### 10.3 High Availability

```yaml
Availability Architecture:

  compute:
    - Multi-AZ deployment
    - Auto-scaling groups
    - Health checks
    - Automatic replacement

  database:
    - Multi-AZ replication
    - Read replicas
    - Automatic failover
    - Connection pooling

  caching:
    - Clustered Redis
    - Multi-node deployment
    - Automatic failover

  target_availability: "99.9%"
  maintenance_windows: "Scheduled, customer notified"
```

---

## 11. Third-Party Security

### 11.1 Vendor Assessment

```yaml
Vendor Security Assessment:

  risk_tiers:
    critical:
      criteria: "Access to customer data, critical infrastructure"
      assessment: "Full security questionnaire, SOC 2, penetration test"
      review_cycle: "Annual"

    high:
      criteria: "Access to internal data, important services"
      assessment: "Security questionnaire, certifications"
      review_cycle: "Annual"

    medium:
      criteria: "Limited access, non-critical services"
      assessment: "Basic questionnaire"
      review_cycle: "Biennial"

    low:
      criteria: "No data access, commodity services"
      assessment: "Self-attestation"
      review_cycle: "Triennial"

  required_controls:
    - SOC 2 Type II (for critical vendors)
    - Encryption at rest and in transit
    - Access controls
    - Incident notification clause
    - Right to audit clause
```

### 11.2 Subprocessor Management

| Subprocessor | Purpose | Data Processed | Security |
|--------------|---------|----------------|----------|
| **AWS/GCP** | Cloud infrastructure | All platform data | SOC 2, ISO 27001 |
| **Supabase** | Database platform | Application data | SOC 2, GDPR |
| **Anthropic/OpenAI** | AI services | Query content | SOC 2, DPA |
| **Pinecone** | Vector database | Embeddings | SOC 2 |

---

## 12. Security Awareness

### 12.1 Training Program

```yaml
Security Training:

  all_employees:
    frequency: "Annual + onboarding"
    topics:
      - Security fundamentals
      - Phishing awareness
      - Data handling
      - Incident reporting
      - Password security
      - Physical security

  developers:
    frequency: "Annual + ongoing"
    topics:
      - Secure coding practices
      - OWASP Top 10
      - Code review security
      - Dependency management

  privileged_users:
    frequency: "Annual"
    topics:
      - Privileged access management
      - Admin security best practices
      - Audit and monitoring

  security_team:
    frequency: "Continuous"
    topics:
      - Threat intelligence
      - Incident response
      - Emerging threats
      - Tool training
```

### 12.2 Phishing Simulation

```yaml
Phishing Program:

  frequency: "Monthly"

  scenarios:
    - Credential harvesting
    - Malware delivery
    - Business email compromise
    - Vendor impersonation

  metrics:
    - Click rate
    - Report rate
    - Repeat offenders

  remediation:
    - Immediate feedback
    - Additional training for failures
    - Recognition for reporters
```

---

## Appendix A: Security Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **Security Team** | security@vital.ai | 24/7 |
| **Incident Response** | incident@vital.ai | 24/7 |
| **Privacy/DPO** | dpo@vital.ai | Business hours |
| **Bug Bounty** | security@vital.ai | Ongoing |

---

## Appendix B: Security Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Mean Time to Detect (MTTD)** | <1 hour | Incident data |
| **Mean Time to Respond (MTTR)** | <4 hours | Incident data |
| **Vulnerability Remediation** | Per SLA | Vulnerability tracking |
| **Phishing Click Rate** | <5% | Simulation data |
| **Security Training Completion** | 100% | LMS data |
| **Patch Compliance** | >95% | Vulnerability scanning |
| **Uptime** | 99.9% | Monitoring data |

---

## Appendix C: Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-26 | Initial release | VITAL Security Team |

---

**Document Classification**: Internal
**Next Review Date**: 2026-02-26
**Contact**: security@vital.ai
