# 🚀 PHASE 7: PRODUCTION & LAUNCH PROMPTS

## PROMPT 7.1: Healthcare Compliance Testing
```markdown
@workspace Create healthcare compliance test suite:

COMPLIANCE AREAS TO TEST:

1. HIPAA Security Rule (All 45 safeguards)
   Administrative Safeguards:
   - Security Officer designation
   - Workforce training records
   - Access management procedures
   - Security incident procedures
   
   Physical Safeguards:
   - Facility access controls
   - Workstation use policies
   - Device and media controls
   
   Technical Safeguards:
   - Access control (unique user ID, encryption)
   - Audit logs and monitoring
   - Integrity controls
   - Transmission security

2. HIPAA Privacy Rule
   - Minimum necessary standard
   - Notice of Privacy Practices
   - Patient access rights
   - Accounting of disclosures
   - Business Associate Agreements

3. FDA 21 CFR Part 11
   - Electronic signatures
   - Audit trails
   - System validation
   - Record retention
   - Change control

4. GDPR Compliance
   - Consent management
   - Right to erasure
   - Data portability
   - Privacy by design
   - Data breach notification

5. State Privacy Laws
   - CCPA (California)
   - BIPA (Illinois biometrics)
   - State breach notification laws

TEST IMPLEMENTATION:
```python
import pytest
from typing import List, Dict
import asyncio
from datetime import datetime, timedelta

class HIPAAComplianceTestSuite:
    """Comprehensive HIPAA compliance testing"""
    
    @pytest.fixture
    def setup_test_environment(self):
        """Setup test environment with PHI data"""
        # Create test patients with PHI
        self.test_patients = self.create_test_patients()
        self.test_users = self.create_test_users()
        yield
        # Cleanup
        self.cleanup_test_data()
    
    # ADMINISTRATIVE SAFEGUARDS
    
    def test_security_officer_designation(self):
        """Verify security officer is designated"""
        security_officer = self.system.get_security_officer()
        assert security_officer is not None
        assert security_officer.trained == True
        assert security_officer.contact_info is not None
    
    def test_workforce_training_compliance(self):
        """Verify all workforce members completed training"""
        workforce = self.system.get_all_users()
        
        for user in workforce:
            training_record = self.system.get_training_record(user.id)
            assert training_record is not None
            assert training_record.hipaa_training_completed == True
            assert training_record.last_training_date > datetime.now() - timedelta(days=365)
            assert training_record.quiz_score >= 0.8  # 80% passing score
    
    def test_access_authorization(self):
        """Test access authorization procedures"""
        # Test role-based access
        roles = ['physician', 'nurse', 'admin', 'billing']
        
        for role in roles:
            user = self.create_user_with_role(role)
            permissions = self.system.get_permissions(user)
            
            # Verify minimum necessary access
            assert self.verify_minimum_necessary(role, permissions)
            
            # Test access to PHI
            for patient in self.test_patients:
                can_access = self.system.check_access(user, patient)
                expected_access = self.should_have_access(role, patient)
                assert can_access == expected_access
    
    def test_password_management(self):
        """Test password policies"""
        weak_passwords = ['password', '12345678', 'qwerty']
        strong_password = 'Complex!Pass123'
        
        for weak in weak_passwords:
            with pytest.raises(WeakPasswordException):
                self.system.set_password(self.test_user, weak)
        
        # Test strong password
        assert self.system.set_password(self.test_user, strong_password)
        
        # Test password expiration
        self.system.set_password_age(self.test_user, days=91)
        assert self.system.requires_password_change(self.test_user)
    
    # PHYSICAL SAFEGUARDS
    
    def test_facility_access_controls(self):
        """Test facility access logging"""
        # Simulate facility access
        access_log = self.system.log_facility_access(
            user=self.test_user,
            facility='Server Room',
            action='enter',
            timestamp=datetime.now()
        )
        
        assert access_log.id is not None
        assert access_log.logged_at is not None
        assert access_log.is_immutable == True
    
    def test_workstation_security(self):
        """Test workstation security controls"""
        # Test automatic logoff
        session = self.system.create_session(self.test_user)
        self.system.simulate_inactivity(minutes=15)
        assert session.is_active == False
        
        # Test encryption at rest
        workstation = self.system.get_workstation()
        assert workstation.disk_encrypted == True
        assert workstation.encryption_algorithm == 'AES-256'
    
    # TECHNICAL SAFEGUARDS
    
    def test_unique_user_identification(self):
        """Test unique user ID assignment"""
        users = self.system.get_all_users()
        user_ids = [user.id for user in users]
        
        # Check uniqueness
        assert len(user_ids) == len(set(user_ids))
        
        # Check format compliance
        for user_id in user_ids:
            assert self.is_valid_user_id_format(user_id)
    
    def test_automatic_logoff(self):
        """Test automatic logoff functionality"""
        session = self.system.create_session(self.test_user)
        
        # Test timeout
        self.system.simulate_inactivity(minutes=15)
        assert session.is_active == False
        
        # Verify audit log entry
        audit_log = self.system.get_audit_log(
            user=self.test_user,
            event_type='AUTO_LOGOFF'
        )
        assert audit_log is not None
    
    def test_encryption_decryption(self):
        """Test encryption of PHI"""
        phi_data = "Patient SSN: 123-45-6789"
        
        # Test encryption
        encrypted = self.system.encrypt(phi_data)
        assert encrypted != phi_data
        assert len(encrypted) > len(phi_data)
        
        # Test decryption with proper authorization
        decrypted = self.system.decrypt(encrypted, user=self.authorized_user)
        assert decrypted == phi_data
        
        # Test decryption without authorization
        with pytest.raises(UnauthorizedException):
            self.system.decrypt(encrypted, user=self.unauthorized_user)
    
    def test_audit_log_integrity(self):
        """Test audit log completeness and integrity"""
        # Perform actions that should be logged
        actions = [
            ('login', self.test_user),
            ('view_patient', self.test_patient),
            ('modify_record', self.test_patient),
            ('export_data', self.test_patient)
        ]
        
        for action_type, target in actions:
            self.system.perform_action(action_type, target)
        
        # Verify all actions are logged
        audit_logs = self.system.get_audit_logs(
            start_date=datetime.now() - timedelta(minutes=5)
        )
        
        assert len(audit_logs) >= len(actions)
        
        for log in audit_logs:
            # Verify log integrity
            assert log.hash == self.calculate_hash(log)
            assert log.timestamp is not None
            assert log.user_id is not None
            assert log.action is not None
            
            # Verify immutability
            with pytest.raises(ImmutableException):
                log.modify()
    
    def test_data_integrity_controls(self):
        """Test data integrity mechanisms"""
        patient_record = self.test_patient
        
        # Calculate checksum
        original_checksum = self.system.calculate_checksum(patient_record)
        
        # Modify record through proper channels
        self.system.update_patient(patient_record, {'name': 'Updated Name'})
        new_checksum = self.system.calculate_checksum(patient_record)
        
        assert original_checksum != new_checksum
        
        # Verify audit trail shows modification
        audit = self.system.get_audit_log(
            target=patient_record,
            event_type='MODIFY'
        )
        assert audit.before_checksum == original_checksum
        assert audit.after_checksum == new_checksum
    
    def test_transmission_security(self):
        """Test secure transmission of PHI"""
        phi_data = {"patient_id": "12345", "diagnosis": "Hypertension"}
        
        # Test TLS encryption
        connection = self.system.create_connection('external_system')
        assert connection.protocol == 'TLS 1.3'
        assert connection.cipher_suite in self.approved_ciphers
        
        # Test data transmission
        transmission_log = self.system.transmit_data(
            data=phi_data,
            destination='partner_hospital',
            encryption='AES-256'
        )
        
        assert transmission_log.encrypted == True
        assert transmission_log.integrity_check == 'PASSED'
        assert transmission_log.recipient_verified == True

class FDA21CFRPart11TestSuite:
    """FDA 21 CFR Part 11 compliance tests"""
    
    def test_electronic_signatures(self):
        """Test electronic signature requirements"""
        document = self.create_test_document()
        
        # Test signature components
        signature = self.system.sign_document(
            document=document,
            user=self.test_user,
            password='password123',
            reason='Approval'
        )
        
        assert signature.signer_name == self.test_user.full_name
        assert signature.timestamp is not None
        assert signature.meaning == 'Approval'
        assert signature.is_unique == True
        
        # Verify signature binding
        assert document.is_signed == True
        assert document.signature_valid == True
        
        # Test signature verification
        verification = self.system.verify_signature(document)
        assert verification.is_valid == True
        assert verification.signer == self.test_user.id
    
    def test_audit_trail_requirements(self):
        """Test audit trail per 21 CFR Part 11"""
        # Test computer-generated timestamp
        audit_entry = self.system.create_audit_entry('CREATE', self.test_record)
        assert audit_entry.timestamp is not None
        assert audit_entry.timestamp_source == 'SYSTEM'
        
        # Test record lifecycle tracking
        lifecycle_events = ['CREATE', 'MODIFY', 'DELETE', 'VIEW']
        for event in lifecycle_events:
            self.system.perform_action(event, self.test_record)
        
        audit_trail = self.system.get_audit_trail(self.test_record)
        assert len(audit_trail) == len(lifecycle_events)
        
        # Verify audit trail is not editable
        with pytest.raises(AuditTrailProtectedException):
            audit_trail[0].modify()
```

Output COMPLIANCE_TESTS.py with:
- Complete test coverage for all regulations
- Automated compliance checks
- Penetration testing scenarios
- Audit report generation
- Remediation tracking
- Continuous compliance monitoring
- Performance impact assessment
- Documentation generation
- Certification preparation
- Regular re-validation scheduling
```

## PROMPT 7.2: Medical Documentation Suite
```markdown
@workspace Generate complete medical platform documentation:

DOCUMENTATION STRUCTURE:

1. Clinical User Guide
   - Getting started for physicians
   - Clinical workflows and best practices
   - Evidence interpretation guide
   - Case studies and examples
   - Troubleshooting common issues

2. Regulatory Compliance Manual
   - FDA submission preparation
   - Clinical trial documentation
   - Audit preparation checklists
   - Validation documentation
   - Change control procedures

3. IT Administrator Guide
   - Installation and deployment
   - HIPAA configuration
   - Security settings
   - Backup and recovery
   - Performance tuning

4. API Documentation
   - HL7 FHIR endpoints
   - Authentication and authorization
   - Rate limiting and quotas
   - Code examples
   - SDKs and libraries

5. Training Materials
   - Video tutorials
   - Quick reference guides
   - Clinical scenarios
   - Certification programs
   - Ongoing education

Generate comprehensive documentation:

```python
from typing import List, Dict
import markdown
from jinja2 import Template
import pdfkit

class MedicalDocumentationGenerator:
    """Generate comprehensive platform documentation"""
    
    def __init__(self):
        self.templates = self.load_templates()
        self.examples = self.load_examples()
        self.screenshots = self.capture_screenshots()
    
    def generate_clinical_user_guide(self) -> str:
        """Generate guide for clinical users"""
        
        guide_structure = """
# VITAL Path Clinical User Guide

## Table of Contents
1. Introduction to VITAL Path
2. Getting Started
3. Clinical Workflows
4. Evidence-Based Decision Support
5. Clinical Trial Matching
6. Safety Monitoring
7. Best Practices
8. Case Studies
9. Troubleshooting
10. Support Resources

## 1. Introduction to VITAL Path

VITAL Path is an AI-powered clinical intelligence platform designed to support 
healthcare professionals in making evidence-based decisions. This guide will 
help you leverage the platform's capabilities to improve patient outcomes.

### Key Features
- **Clinical Decision Support**: Real-time, evidence-based recommendations
- **Literature Synthesis**: Automated review of medical literature
- **Trial Matching**: Connect patients with eligible clinical trials
- **Safety Monitoring**: Proactive adverse event detection
- **Regulatory Intelligence**: Stay updated with guidelines

## 2. Getting Started

### Initial Setup

#### Step 1: Account Activation
1. Check your email for activation link
2. Click the link to set your password
3. Complete your profile with:
   - Medical license number
   - Specialty and subspecialties
   - Institution affiliation
   - Preferred clinical areas

#### Step 2: Configure Your Dashboard
[Screenshot: Dashboard Configuration]

**Customize your clinical dashboard:**
- Drag and drop widgets to arrange layout
- Select relevant specialties for content filtering
- Set alert preferences for critical updates
- Configure quick access tools

### Navigation Overview
[Diagram: Platform Navigation]

The platform consists of five main sections:
1. **Dashboard**: Personalized clinical insights
2. **Patient Tools**: Individual patient analysis
3. **Evidence Hub**: Literature and guidelines
4. **Trial Finder**: Clinical trial search
5. **Reports**: Analytics and documentation

## 3. Clinical Workflows

### 3.1 Differential Diagnosis Workflow

**Scenario**: Patient presents with chest pain

1. **Enter Chief Complaint**
   ```
   Navigate to: Patient Tools > Differential Diagnosis
   Input: "45-year-old male with acute chest pain"
   ```

2. **Add Clinical Context**
   - Vital signs
   - Risk factors
   - Associated symptoms
   - Physical exam findings

3. **Review AI-Generated Differentials**
   [Screenshot: Differential List]
   
   The system provides:
   - Ranked list of possible diagnoses
   - Probability scores
   - Supporting evidence
   - Recommended next steps

4. **Explore Each Diagnosis**
   Click any diagnosis to see:
   - Diagnostic criteria
   - Recommended tests
   - Treatment guidelines
   - Recent literature

### 3.2 Treatment Planning Workflow

**Example**: Selecting therapy for Type 2 Diabetes

1. **Patient Profile Entry**
   ```
   Patient Details:
   - Age: 58
   - BMI: 32
   - HbA1c: 8.5%
   - Comorbidities: Hypertension, CKD Stage 2
   - Current Medications: Metformin 1000mg BID
   ```

2. **Generate Treatment Options**
   [Screenshot: Treatment Recommendations]
   
   System provides:
   - First-line recommendations
   - Alternative options
   - Contraindications highlighted
   - Cost-effectiveness analysis

3. **Review Evidence**
   For each recommendation:
   - Clinical trial data
   - Real-world evidence
   - Guideline alignment
   - Safety profile

4. **Document Decision**
   - Select chosen therapy
   - Document reasoning
   - Generate patient education materials
   - Create follow-up plan

### 3.3 Clinical Trial Matching

**Process for matching patients to trials:**

1. **Access Trial Matcher**
   ```
   Navigate to: Trial Finder > Patient Match
   ```

2. **Input Patient Criteria**
   - Primary diagnosis
   - Stage/severity
   - Previous treatments
   - Key lab values
   - Geographic preferences

3. **Review Matches**
   [Screenshot: Trial Matches]
   
   Each match shows:
   - Eligibility score (0-100%)
   - Distance to site
   - Trial phase and status
   - Primary endpoints
   - Contact information

4. **Generate Referral**
   - One-click referral letter
   - Include relevant medical records
   - Track referral status

## 4. Evidence-Based Decision Support

### Understanding Evidence Quality Indicators

[Diagram: Evidence Pyramid]

**Evidence Levels:**
- **Level 1A**: Systematic Reviews of RCTs
- **Level 1B**: Individual RCTs
- **Level 2A**: Systematic Reviews of Cohort Studies
- **Level 2B**: Individual Cohort Studies
- **Level 3**: Case-Control Studies
- **Level 4**: Case Series
- **Level 5**: Expert Opinion

### Interpreting Confidence Scores

The platform provides confidence scores for all recommendations:

- **High Confidence (90-100%)**: Strong evidence, clear guidelines
- **Moderate Confidence (70-89%)**: Good evidence, some uncertainty
- **Low Confidence (<70%)**: Limited evidence, consider expert consultation

[Example Box: Confidence Score Interpretation]

## 5. Best Practices

### Do's and Don'ts

**DO:**
✅ Verify critical decisions with primary sources
✅ Document your clinical reasoning
✅ Report any suspected errors
✅ Keep your profile updated
✅ Complete regular training updates

**DON'T:**
❌ Rely solely on AI without clinical judgment
❌ Share login credentials
❌ Ignore low confidence warnings
❌ Skip verification for high-risk decisions
❌ Disable security features

### Clinical Scenarios

#### Scenario 1: Rare Disease Diagnosis

**Challenge**: Patient with unusual symptom constellation

**Approach**:
1. Use broad search terms initially
2. Review rare disease database matches
3. Consult orphan disease resources
4. Connect with specialist network
5. Document diagnostic journey

[Case Study Box: Successful Rare Disease Diagnosis]

## 6. Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Slow response times | Check internet connection; Clear cache |
| Missing patient data | Verify EHR integration; Manual entry |
| Incorrect recommendations | Report to support; Provide feedback |
| Login problems | Reset password; Check 2FA settings |
| Export failures | Check file size limits; Try different format |

## 7. Support Resources

### Getting Help

**Immediate Clinical Support**
- Phone: 1-800-VITAL-MD (24/7)
- Priority Email: clinical-support@vitalpath.ai
- In-app chat: Click the help icon

**Technical Support**
- Email: support@vitalpath.ai
- Hours: Monday-Friday, 8 AM - 8 PM EST
- Average response time: <2 hours

**Training Resources**
- Weekly webinars: Every Tuesday, 12 PM EST
- On-demand videos: portal.vitalpath.ai/training
- Clinical forums: community.vitalpath.ai

## Appendices

### Appendix A: Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+P | Patient search |
| Ctrl+E | Evidence search |
| Ctrl+T | Trial search |
| Ctrl+D | Return to dashboard |
| Ctrl+H | Help menu |

### Appendix B: Medical Abbreviations
[Comprehensive list of supported medical abbreviations]

### Appendix C: Integration Guides
- Epic Integration Setup
- Cerner Connection Guide
- Allscripts Configuration
"""
        
        # Process with markdown and add styling
        html = markdown.markdown(guide_structure, extensions=['tables', 'toc'])
        
        # Add medical-specific formatting
        html = self.apply_medical_styling(html)
        
        # Generate PDF version
        pdf = pdfkit.from_string(html, options=self.pdf_options)
        
        return {
            'markdown': guide_structure,
            'html': html,
            'pdf': pdf
        }
    
    def generate_api_documentation(self) -> Dict:
        """Generate comprehensive API documentation"""
        
        api_doc = """
# VITAL Path API Documentation

## Base URL
```
https://api.vitalpath.ai/v1
```

## Authentication

### OAuth 2.0 Flow

```python
import requests

# Get authorization code
auth_url = "https://auth.vitalpath.ai/oauth/authorize"
params = {
    "client_id": "your_client_id",
    "redirect_uri": "https://your-app.com/callback",
    "response_type": "code",
    "scope": "patient:read clinical:write",
    "state": "random_state_string"
}

# Exchange code for token
token_url = "https://auth.vitalpath.ai/oauth/token"
data = {
    "grant_type": "authorization_code",
    "code": authorization_code,
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "redirect_uri": "https://your-app.com/callback"
}

response = requests.post(token_url, data=data)
access_token = response.json()["access_token"]
```

## HL7 FHIR Endpoints

### Patient Resource

**GET /fhir/Patient/{id}**

Retrieve patient demographics

```json
{
  "resourceType": "Patient",
  "id": "12345",
  "identifier": [{
    "system": "http://hospital.org/patients",
    "value": "98765"
  }],
  "name": [{
    "use": "official",
    "family": "Smith",
    "given": ["John", "Q"]
  }],
  "gender": "male",
  "birthDate": "1970-01-15"
}
```

### Observation Resource

**POST /fhir/Observation**

Create new observation

```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "85354-9",
      "display": "Blood pressure"
    }]
  },
  "subject": {
    "reference": "Patient/12345"
  },
  "effectiveDateTime": "2024-01-15T14:30:00Z",
  "component": [{
    "code": {
      "coding": [{
        "system": "http://loinc.org",
        "code": "8480-6",
        "display": "Systolic blood pressure"
      }]
    },
    "valueQuantity": {
      "value": 120,
      "unit": "mmHg"
    }
  }]
}
```

## Clinical Intelligence Endpoints

### Differential Diagnosis

**POST /clinical/differential**

Generate differential diagnosis

```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

data = {
    "chief_complaint": "chest pain",
    "patient": {
        "age": 45,
        "gender": "male",
        "risk_factors": ["smoking", "hypertension"],
        "symptoms": {
            "duration": "2 hours",
            "character": "crushing",
            "radiation": "left arm"
        }
    }
}

response = requests.post(
    "https://api.vitalpath.ai/v1/clinical/differential",
    headers=headers,
    json=data
)

differentials = response.json()
```

### Trial Matching

**POST /trials/match**

Find matching clinical trials

```python
data = {
    "patient_id": "12345",
    "condition": "non-small cell lung cancer",
    "stage": "IIIB",
    "biomarkers": {
        "EGFR": "positive",
        "ALK": "negative"
    },
    "location": {
        "city": "Boston",
        "state": "MA",
        "max_distance": 50
    }
}

response = requests.post(
    "https://api.vitalpath.ai/v1/trials/match",
    headers=headers,
    json=data
)
```

## Rate Limiting

| Tier | Requests/Hour | Burst |
|------|---------------|-------|
| Basic | 100 | 10 |
| Professional | 1,000 | 50 |
| Enterprise | 10,000 | 200 |

Headers returned:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Verify authentication |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 429 | Too Many Requests | Implement backoff |
| 500 | Internal Error | Contact support |

## SDKs

### Python SDK

```bash
pip install vitalpath-sdk
```

```python
from vitalpath import Client

client = Client(api_key="your_api_key")

# Get patient
patient = client.patients.get("12345")

# Run differential diagnosis
differential = client.clinical.differential(
    chief_complaint="headache",
    patient_context=patient
)
```

### JavaScript SDK

```bash
npm install @vitalpath/sdk
```

```javascript
import { VitalPathClient } from '@vitalpath/sdk';

const client = new VitalPathClient({
  apiKey: 'your_api_key'
});

// Get patient
const patient = await client.patients.get('12345');

// Run differential diagnosis
const differential = await client.clinical.differential({
  chiefComplaint: 'headache',
  patientContext: patient
});
```
"""
        
        return self.process_documentation(api_doc)
    
    def generate_training_materials(self) -> Dict:
        """Generate comprehensive training materials"""
        
        return {
            'videos': self.generate_video_scripts(),
            'quick_guides': self.generate_quick_references(),
            'scenarios': self.generate_clinical_scenarios(),
            'quizzes': self.generate_assessment_quizzes()
        }
```

Output DOCUMENTATION_SUITE.md with:
- Complete user guides for all roles
- API reference with examples
- Video tutorial scripts
- Quick reference cards
- Clinical scenario library
- Training assessments
- Certification programs
- FAQ sections
- Glossary of terms
- Troubleshooting guides
```

## PROMPT 7.3: Healthcare Monitoring & Alerts
```markdown
@workspace Implement healthcare-specific monitoring:

MONITORING REQUIREMENTS:

1. Clinical Decision Tracking
   - Decision accuracy metrics
   - Outcome correlation
   - Guideline adherence
   - Expert agreement rates

2. PHI Access Monitoring
   - Access patterns analysis
   - Anomaly detection
   - Privilege escalation detection
   - Data exfiltration prevention

3. System Health Monitoring
   - Critical path availability
   - Response time tracking
   - Resource utilization
   - Error rate monitoring

4. Regulatory Compliance Metrics
   - Audit completeness
   - Consent compliance
   - Retention policy adherence
   - Breach detection

5. Clinical Accuracy Metrics
   - Diagnostic accuracy
   - Treatment appropriateness
   - Safety signal detection
   - Literature currency

Implementation:
```python
from typing import Dict, List, Optional
import asyncio
from datetime import datetime, timedelta
from dataclasses import dataclass
import prometheus_client as prom

class HealthcareMonitoringSystem:
    """Comprehensive healthcare monitoring and alerting"""
    
    def __init__(self):
        self.metrics = self.setup_metrics()
        self.alert_manager = AlertManager()
        self.dashboards = self.setup_dashboards()
        self.incident_handler = IncidentHandler()
    
    def setup_metrics(self) -> Dict:
        """Define Prometheus metrics for healthcare monitoring"""
        
        return {
            # Clinical metrics
            'clinical_decision_accuracy': prom.Histogram(
                'clinical_decision_accuracy_score',
                'Accuracy of clinical decisions',
                ['decision_type', 'specialty'],
                buckets=[0.5, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0]
            ),
            
            'diagnostic_confidence': prom.Histogram(
                'diagnostic_confidence_score',
                'Confidence scores for diagnoses',
                ['diagnosis_category'],
                buckets=[0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
            ),
            
            'treatment_guideline_compliance': prom.Gauge(
                'treatment_guideline_compliance_rate',
                'Rate of guideline-compliant treatment recommendations',
                ['guideline_source', 'condition']
            ),
            
            # PHI access metrics
            'phi_access_count': prom.Counter(
                'phi_access_total',
                'Total PHI access events',
                ['user_role', 'access_type', 'data_category']
            ),
            
            'unusual_access_pattern': prom.Counter(
                'unusual_phi_access_detected',
                'Unusual PHI access patterns detected',
                ['pattern_type', 'user_role']
            ),
            
            # System performance
            'api_response_time': prom.Histogram(
                'api_response_duration_seconds',
                'API response time',
                ['endpoint', 'method'],
                buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
            ),
            
            'llm_response_time': prom.Histogram(
                'llm_response_duration_seconds',
                'LLM response time',
                ['model', 'query_type'],
                buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
            ),
            
            # Compliance metrics
            'audit_log_completeness': prom.Gauge(
                'audit_log_completeness_percentage',
                'Percentage of actions with complete audit logs'
            ),
            
            'consent_compliance': prom.Gauge(
                'consent_compliance_rate',
                'Rate of consent compliance',
                ['consent_type']
            ),
            
            # Safety metrics
            'adverse_event_detection': prom.Counter(
                'adverse_events_detected_total',
                'Total adverse events detected',
                ['severity', 'drug_class']
            ),
            
            'safety_alert_triggered': prom.Counter(
                'safety_alerts_triggered_total',
                'Safety alerts triggered',
                ['alert_type', 'severity']
            )
        }
    
    async def monitor_clinical_decisions(self):
        """Monitor clinical decision quality"""
        
        while True:
            # Get recent clinical decisions
            decisions = await self.get_recent_decisions()
            
            for decision in decisions:
                # Calculate accuracy
                accuracy = await self.calculate_decision_accuracy(decision)
                self.metrics['clinical_decision_accuracy'].labels(
                    decision_type=decision.type,
                    specialty=decision.specialty
                ).observe(accuracy)
                
                # Check guideline compliance
                compliance = await self.check_guideline_compliance(decision)
                self.metrics['treatment_guideline_compliance'].labels(
                    guideline_source=compliance.source,
                    condition=decision.condition
                ).set(compliance.rate)
                
                # Alert if accuracy below threshold
                if accuracy < 0.85:
                    await self.alert_manager.send_alert(
                        severity='WARNING',
                        title='Low Clinical Decision Accuracy',
                        description=f'Accuracy {accuracy:.2%} for {decision.type}',
                        decision_id=decision.id,
                        recommendation='Expert review required'
                    )
                
                # Critical alert for potential harm
                if await self.detect_potential_harm(decision):
                    await self.alert_manager.send_alert(
                        severity='CRITICAL',
                        title='Potential Patient Harm Detected',
                        description=f'Decision {decision.id} may cause harm',
                        immediate_action='Halt recommendation and escalate',
                        on_call_required=True
                    )
            
            await asyncio.sleep(60)  # Check every minute
    
    async def monitor_phi_access(self):
        """Monitor PHI access patterns for anomalies"""
        
        class AccessAnalyzer:
            def __init__(self):
                self.baseline = {}
                self.ml_model = self.load_anomaly_model()
            
            async def analyze_access_pattern(self, user_id: str, accesses: List[PHIAccess]):
                """Detect unusual access patterns"""
                
                features = self.extract_features(accesses)
                anomaly_score = self.ml_model.predict_proba(features)[0, 1]
                
                if anomaly_score > 0.8:
                    return {
                        'anomaly_detected': True,
                        'score': anomaly_score,
                        'patterns': self.identify_patterns(accesses),
                        'risk_level': self.calculate_risk_level(accesses)
                    }
                
                return {'anomaly_detected': False}
        
        analyzer = AccessAnalyzer()
        
        while True:
            # Get PHI access logs for last hour
            access_logs = await self.get_phi_access_logs(
                since=datetime.now() - timedelta(hours=1)
            )
            
            # Group by user
            user_accesses = self.group_by_user(access_logs)
            
            for user_id, accesses in user_accesses.items():
                # Track metrics
                for access in accesses:
                    self.metrics['phi_access_count'].labels(
                        user_role=access.user_role,
                        access_type=access.type,
                        data_category=access.data_category
                    ).inc()
                
                # Analyze for anomalies
                analysis = await analyzer.analyze_access_pattern(user_id, accesses)
                
                if analysis['anomaly_detected']:
                    self.metrics['unusual_access_pattern'].labels(
                        pattern_type=analysis['patterns'][0],
                        user_role=accesses[0].user_role
                    ).inc()
                    
                    # Generate alert based on risk
                    if analysis['risk_level'] == 'HIGH':
                        await self.alert_manager.send_alert(
                            severity='CRITICAL',
                            title='Potential PHI Breach Detected',
                            description=f'User {user_id} showing unusual access pattern',
                            anomaly_score=analysis['score'],
                            patterns=analysis['patterns'],
                            immediate_action='Suspend access and investigate',
                            notify=['security_team', 'compliance_officer']
                        )
                    
                    # Auto-remediation for critical risks
                    if analysis['risk_level'] == 'CRITICAL':
                        await self.auto_remediate_access(user_id, analysis)
            
            await asyncio.sleep(300)  # Check every 5 minutes
    
    async def auto_remediate_access(self, user_id: str, analysis: Dict):
        """Automatically remediate suspicious access"""
        
        # Suspend user access
        await self.system.suspend_user_access(user_id)
        
        # Create incident
        incident = await self.incident_handler.create_incident(
            type='POTENTIAL_PHI_BREACH',
            severity='CRITICAL',
            user_id=user_id,
            details=analysis,
            auto_remediated=True
        )
        
        # Notify stakeholders
        await self.notify_incident_response_team(incident)
        
        # Log for compliance
        await self.compliance_logger.log_security_incident(incident)

class AlertManager:
    """Healthcare-specific alert management"""
    
    def __init__(self):
        self.alert_rules = self.load_alert_rules()
        self.notification_channels = self.setup_channels()
        self.on_call_schedule = self.load_on_call_schedule()
    
    async def send_alert(self, severity: str, title: str, **kwargs):
        """Send alert through appropriate channels"""
        
        alert = Alert(
            severity=severity,
            title=title,
            timestamp=datetime.now(),
            details=kwargs
        )
        
        # Determine notification channels based on severity
        if severity == 'CRITICAL':
            # Page on-call immediately
            await self.page_on_call(alert)
            # Send to all channels
            await self.notify_all_channels(alert)
            # Create automatic incident
            await self.create_incident(alert)
            
        elif severity == 'WARNING':
            # Email and Slack
            await self.send_email(alert, self.get_recipients(alert))
            await self.send_slack(alert, '#alerts-warning')
            
        elif severity == 'INFO':
            # Just log and dashboard
            await self.log_alert(alert)
        
        # Store alert for audit
        await self.store_alert(alert)
        
        return alert.id
    
    async def page_on_call(self, alert: Alert):
        """Page on-call personnel for critical alerts"""
        
        on_call = self.get_current_on_call(alert.details.get('team', 'default'))
        
        # Primary on-call
        await self.send_page(
            on_call['primary'],
            message=f"CRITICAL: {alert.title}",
            callback_number=self.incident_hotline
        )
        
        # If medical emergency
        if 'potential_harm' in alert.details:
            # Also page medical director
            await self.send_page(
                self.medical_director,
                message=f"MEDICAL EMERGENCY: {alert.title}"
            )

class DashboardManager:
    """Real-time monitoring dashboards"""
    
    def setup_clinical_dashboard(self) -> Dict:
        """Setup clinical monitoring dashboard"""
        
        return {
            'panels': [
                {
                    'title': 'Clinical Decision Accuracy',
                    'type': 'graph',
                    'metrics': ['clinical_decision_accuracy'],
                    'threshold_lines': [
                        {'value': 0.95, 'color': 'green', 'label': 'Target'},
                        {'value': 0.85, 'color': 'yellow', 'label': 'Warning'},
                        {'value': 0.75, 'color': 'red', 'label': 'Critical'}
                    ]
                },
                {
                    'title': 'Active Safety Alerts',
                    'type': 'stat',
                    'metric': 'safety_alerts_active',
                    'thresholds': {
                        'green': [0, 5],
                        'yellow': [6, 10],
                        'red': [11, None]
                    }
                },
                {
                    'title': 'Guideline Compliance Rate',
                    'type': 'gauge',
                    'metric': 'guideline_compliance_rate',
                    'target': 0.98
                },
                {
                    'title': 'Patient Outcome Correlation',
                    'type': 'heatmap',
                    'metrics': ['decision_outcome_correlation'],
                    'dimensions': ['decision_type', 'outcome_category']
                }
            ]
        }
    
    def setup_compliance_dashboard(self) -> Dict:
        """Setup compliance monitoring dashboard"""
        
        return {
            'panels': [
                {
                    'title': 'HIPAA Compliance Score',
                    'type': 'gauge',
                    'metric': 'hipaa_compliance_score',
                    'target': 1.0,
                    'critical_threshold': 0.95
                },
                {
                    'title': 'PHI Access Anomalies',
                    'type': 'timeseries',
                    'metric': 'unusual_phi_access_detected',
                    'alert_on_increase': True
                },
                {
                    'title': 'Audit Log Coverage',
                    'type': 'stat',
                    'metric': 'audit_log_completeness_percentage',
                    'format': 'percentage',
                    'target': 100
                },
                {
                    'title': 'Consent Compliance by Type',
                    'type': 'bar',
                    'metric': 'consent_compliance_rate',
                    'group_by': 'consent_type'
                }
            ]
        }
```

Output HEALTHCARE_MONITORING.py with:
- Real-time clinical metrics tracking
- PHI access anomaly detection
- Compliance monitoring dashboards
- Alert routing by severity
- Incident response automation
- On-call management system
- Performance analytics
- Safety signal detection
- Regulatory reporting automation
- Executive dashboards
```
