"""
VITAL Path Security and Compliance Layer
Comprehensive HIPAA, FDA, GDPR compliance framework
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import hashlib
import uuid
from abc import ABC, abstractmethod
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

logger = logging.getLogger(__name__)

class ComplianceStandard(str, Enum):
    HIPAA = "hipaa"
    GDPR = "gdpr"
    FDA_510K = "fda_510k"
    FDA_QSIT = "fda_qsit"
    SOC2 = "soc2"
    ISO27001 = "iso27001"
    NIST = "nist"

class DataClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    PHI = "phi"  # Protected Health Information
    PII = "pii"  # Personally Identifiable Information

class AccessLevel(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    AUDIT = "audit"

class AuditEventType(str, Enum):
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    DATA_DELETION = "data_deletion"
    DATA_EXPORT = "data_export"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    SYSTEM_ACCESS = "system_access"
    CONFIGURATION_CHANGE = "configuration_change"
    SECURITY_INCIDENT = "security_incident"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ComplianceRule:
    rule_id: str
    standard: ComplianceStandard
    title: str
    description: str
    requirement: str
    implementation_guidance: str
    validation_method: str
    mandatory: bool
    risk_level: RiskLevel
    data_types: List[DataClassification]
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AuditEvent:
    event_id: str
    event_type: AuditEventType
    timestamp: datetime
    user_id: str
    session_id: str
    resource_id: Optional[str]
    action: str
    outcome: str
    data_classification: DataClassification
    ip_address: str
    user_agent: str
    risk_score: float
    additional_data: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ComplianceViolation:
    violation_id: str
    rule_id: str
    standard: ComplianceStandard
    severity: RiskLevel
    description: str
    detected_at: datetime
    user_id: Optional[str]
    resource_id: Optional[str]
    auto_remediated: bool
    remediation_actions: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DataProcessingRecord:
    record_id: str
    data_subject_id: str
    processing_purpose: str
    data_types: List[str]
    legal_basis: str
    retention_period: timedelta
    data_location: str
    third_parties: List[str]
    consent_obtained: bool
    consent_timestamp: Optional[datetime]
    processing_start: datetime
    processing_end: Optional[datetime]
    metadata: Dict[str, Any] = field(default_factory=dict)

class EncryptionManager:
    def __init__(self, master_key: Optional[bytes] = None):
        if master_key:
            self.master_key = master_key
        else:
            self.master_key = self._generate_master_key()
        self.fernet = Fernet(base64.urlsafe_b64encode(self.master_key))

    def _generate_master_key(self) -> bytes:
        """Generate a new master encryption key"""
        return os.urandom(32)

    def encrypt_data(self, data: Union[str, bytes]) -> str:
        """Encrypt sensitive data"""
        if isinstance(data, str):
            data = data.encode('utf-8')

        encrypted_data = self.fernet.encrypt(data)
        return base64.urlsafe_b64encode(encrypted_data).decode('utf-8')

    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
            decrypted_data = self.fernet.decrypt(encrypted_bytes)
            return decrypted_data.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError("Invalid or corrupted encrypted data")

    def hash_data(self, data: str, salt: Optional[bytes] = None) -> str:
        """Create a secure hash of data"""
        if salt is None:
            salt = os.urandom(32)

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(data.encode('utf-8')))
        return f"{base64.urlsafe_b64encode(salt).decode('utf-8')}:{key.decode('utf-8')}"

    def verify_hash(self, data: str, hashed_data: str) -> bool:
        """Verify data against its hash"""
        try:
            salt_b64, hash_b64 = hashed_data.split(':')
            salt = base64.urlsafe_b64decode(salt_b64.encode('utf-8'))

            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(data.encode('utf-8')))
            return key.decode('utf-8') == hash_b64
        except Exception as e:
            logger.error(f"Hash verification failed: {e}")
            return False

class PHIClassifier:
    def __init__(self):
        self.phi_patterns = {
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'date_of_birth': r'\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b',
            'medical_record_number': r'\bMRN:?\s*\d{6,}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'address': r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b'
        }

    def classify_text(self, text: str) -> Dict[str, List[str]]:
        """Classify text for PHI/PII content"""
        findings = {}

        for phi_type, pattern in self.phi_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                findings[phi_type] = matches

        return findings

    def contains_phi(self, text: str) -> bool:
        """Check if text contains any PHI"""
        return len(self.classify_text(text)) > 0

    def redact_phi(self, text: str) -> str:
        """Redact PHI from text"""
        redacted_text = text

        for phi_type, pattern in self.phi_patterns.items():
            redacted_text = re.sub(pattern, f"[REDACTED_{phi_type.upper()}]", redacted_text, flags=re.IGNORECASE)

        return redacted_text

class HIPAAComplianceChecker:
    def __init__(self):
        self.rules = self._load_hipaa_rules()

    def _load_hipaa_rules(self) -> List[ComplianceRule]:
        """Load HIPAA compliance rules"""
        return [
            ComplianceRule(
                rule_id="HIPAA_164.306",
                standard=ComplianceStandard.HIPAA,
                title="Security Standards for PHI",
                description="Ensure appropriate administrative, physical, and technical safeguards for PHI",
                requirement="Implement security measures to protect PHI",
                implementation_guidance="Use encryption, access controls, and audit logging",
                validation_method="Security assessment and penetration testing",
                mandatory=True,
                risk_level=RiskLevel.HIGH,
                data_types=[DataClassification.PHI]
            ),
            ComplianceRule(
                rule_id="HIPAA_164.312",
                standard=ComplianceStandard.HIPAA,
                title="Technical Safeguards",
                description="Access control, audit controls, integrity, person authentication, transmission security",
                requirement="Implement technical controls for PHI access and transmission",
                implementation_guidance="Role-based access, audit logging, data integrity checks, strong authentication",
                validation_method="Technical security review",
                mandatory=True,
                risk_level=RiskLevel.HIGH,
                data_types=[DataClassification.PHI]
            ),
            ComplianceRule(
                rule_id="HIPAA_164.308",
                standard=ComplianceStandard.HIPAA,
                title="Administrative Safeguards",
                description="Security officer, workforce training, information access management, contingency plan",
                requirement="Implement administrative controls for PHI security",
                implementation_guidance="Assign security officer, conduct training, manage access, create contingency plans",
                validation_method="Policy review and compliance audit",
                mandatory=True,
                risk_level=RiskLevel.MEDIUM,
                data_types=[DataClassification.PHI]
            ),
            ComplianceRule(
                rule_id="HIPAA_164.310",
                standard=ComplianceStandard.HIPAA,
                title="Physical Safeguards",
                description="Facility access controls, workstation use, device and media controls",
                requirement="Implement physical controls for PHI security",
                implementation_guidance="Secure facilities, control workstation access, manage devices and media",
                validation_method="Physical security assessment",
                mandatory=True,
                risk_level=RiskLevel.MEDIUM,
                data_types=[DataClassification.PHI]
            )
        ]

    async def check_compliance(self, data: Dict[str, Any], operation: str) -> List[ComplianceViolation]:
        """Check HIPAA compliance for data operation"""
        violations = []

        # Check if data contains PHI
        phi_classifier = PHIClassifier()
        text_data = json.dumps(data) if isinstance(data, dict) else str(data)

        if phi_classifier.contains_phi(text_data):
            # Check encryption requirement
            if not data.get('encrypted', False) and operation in ['store', 'transmit']:
                violations.append(ComplianceViolation(
                    violation_id=str(uuid.uuid4()),
                    rule_id="HIPAA_164.312",
                    standard=ComplianceStandard.HIPAA,
                    severity=RiskLevel.HIGH,
                    description="PHI data must be encrypted during storage and transmission",
                    detected_at=datetime.now(),
                    user_id=data.get('user_id'),
                    resource_id=data.get('resource_id'),
                    auto_remediated=False,
                    remediation_actions=["Encrypt data before storage/transmission"]
                ))

            # Check access control
            if not data.get('access_controlled', False):
                violations.append(ComplianceViolation(
                    violation_id=str(uuid.uuid4()),
                    rule_id="HIPAA_164.312",
                    standard=ComplianceStandard.HIPAA,
                    severity=RiskLevel.HIGH,
                    description="PHI access must be controlled and authenticated",
                    detected_at=datetime.now(),
                    user_id=data.get('user_id'),
                    resource_id=data.get('resource_id'),
                    auto_remediated=False,
                    remediation_actions=["Implement proper access controls"]
                ))

            # Check audit logging
            if not data.get('audit_logged', False):
                violations.append(ComplianceViolation(
                    violation_id=str(uuid.uuid4()),
                    rule_id="HIPAA_164.312",
                    standard=ComplianceStandard.HIPAA,
                    severity=RiskLevel.MEDIUM,
                    description="PHI access must be logged for audit purposes",
                    detected_at=datetime.now(),
                    user_id=data.get('user_id'),
                    resource_id=data.get('resource_id'),
                    auto_remediated=False,
                    remediation_actions=["Enable audit logging for PHI access"]
                ))

        return violations

class GDPRComplianceChecker:
    def __init__(self):
        self.rules = self._load_gdpr_rules()

    def _load_gdpr_rules(self) -> List[ComplianceRule]:
        """Load GDPR compliance rules"""
        return [
            ComplianceRule(
                rule_id="GDPR_Art6",
                standard=ComplianceStandard.GDPR,
                title="Lawfulness of Processing",
                description="Processing must have a lawful basis",
                requirement="Establish and document lawful basis for processing",
                implementation_guidance="Obtain consent or establish legitimate interest",
                validation_method="Legal basis documentation review",
                mandatory=True,
                risk_level=RiskLevel.HIGH,
                data_types=[DataClassification.PII]
            ),
            ComplianceRule(
                rule_id="GDPR_Art25",
                standard=ComplianceStandard.GDPR,
                title="Data Protection by Design and by Default",
                description="Implement privacy by design principles",
                requirement="Build in data protection from system design",
                implementation_guidance="Use privacy-enhancing technologies and minimize data collection",
                validation_method="Technical privacy review",
                mandatory=True,
                risk_level=RiskLevel.HIGH,
                data_types=[DataClassification.PII]
            ),
            ComplianceRule(
                rule_id="GDPR_Art32",
                standard=ComplianceStandard.GDPR,
                title="Security of Processing",
                description="Implement appropriate technical and organisational measures",
                requirement="Ensure security of personal data processing",
                implementation_guidance="Use encryption, access controls, and regular security testing",
                validation_method="Security assessment",
                mandatory=True,
                risk_level=RiskLevel.HIGH,
                data_types=[DataClassification.PII]
            )
        ]

    async def check_compliance(self, processing_record: DataProcessingRecord) -> List[ComplianceViolation]:
        """Check GDPR compliance for data processing"""
        violations = []

        # Check consent requirement
        if processing_record.legal_basis == "consent" and not processing_record.consent_obtained:
            violations.append(ComplianceViolation(
                violation_id=str(uuid.uuid4()),
                rule_id="GDPR_Art6",
                standard=ComplianceStandard.GDPR,
                severity=RiskLevel.CRITICAL,
                description="Consent required but not obtained for data processing",
                detected_at=datetime.now(),
                user_id=processing_record.data_subject_id,
                resource_id=processing_record.record_id,
                auto_remediated=False,
                remediation_actions=["Obtain valid consent or establish alternative legal basis"]
            ))

        # Check data retention
        if processing_record.processing_end and \
           (datetime.now() - processing_record.processing_end) > processing_record.retention_period:
            violations.append(ComplianceViolation(
                violation_id=str(uuid.uuid4()),
                rule_id="GDPR_Art5",
                standard=ComplianceStandard.GDPR,
                severity=RiskLevel.HIGH,
                description="Data retained beyond legally permitted period",
                detected_at=datetime.now(),
                user_id=processing_record.data_subject_id,
                resource_id=processing_record.record_id,
                auto_remediated=False,
                remediation_actions=["Delete or anonymize expired data"]
            ))

        return violations

class AuditLogger:
    def __init__(self, encryption_manager: EncryptionManager):
        self.encryption_manager = encryption_manager
        self.audit_events: List[AuditEvent] = []

    async def log_event(self, event: AuditEvent):
        """Log an audit event"""
        # Encrypt sensitive data in the event
        if event.additional_data:
            sensitive_fields = ['patient_id', 'medical_record', 'diagnosis', 'medication']
            for field in sensitive_fields:
                if field in event.additional_data:
                    event.additional_data[field] = self.encryption_manager.encrypt_data(
                        str(event.additional_data[field])
                    )

        self.audit_events.append(event)
        logger.info(f"Audit event logged: {event.event_type} by {event.user_id}")

    async def get_audit_trail(self, user_id: Optional[str] = None,
                            start_time: Optional[datetime] = None,
                            end_time: Optional[datetime] = None) -> List[AuditEvent]:
        """Retrieve audit trail with optional filters"""
        filtered_events = self.audit_events

        if user_id:
            filtered_events = [e for e in filtered_events if e.user_id == user_id]

        if start_time:
            filtered_events = [e for e in filtered_events if e.timestamp >= start_time]

        if end_time:
            filtered_events = [e for e in filtered_events if e.timestamp <= end_time]

        return filtered_events

    async def generate_compliance_report(self, standard: ComplianceStandard) -> Dict[str, Any]:
        """Generate compliance report for audit events"""
        relevant_events = [e for e in self.audit_events if e.data_classification in [
            DataClassification.PHI, DataClassification.PII
        ]]

        report = {
            "standard": standard,
            "report_generated": datetime.now(),
            "total_events": len(relevant_events),
            "event_types": {},
            "risk_distribution": {},
            "users": set(),
            "time_range": {
                "start": min(e.timestamp for e in relevant_events) if relevant_events else None,
                "end": max(e.timestamp for e in relevant_events) if relevant_events else None
            }
        }

        for event in relevant_events:
            # Count event types
            event_type = event.event_type
            report["event_types"][event_type] = report["event_types"].get(event_type, 0) + 1

            # Risk distribution
            risk_level = self._calculate_risk_level(event)
            report["risk_distribution"][risk_level] = report["risk_distribution"].get(risk_level, 0) + 1

            # Unique users
            report["users"].add(event.user_id)

        report["users"] = list(report["users"])
        return report

    def _calculate_risk_level(self, event: AuditEvent) -> str:
        """Calculate risk level for an audit event"""
        if event.risk_score >= 0.8:
            return "high"
        elif event.risk_score >= 0.5:
            return "medium"
        else:
            return "low"

class ComplianceOrchestrator:
    def __init__(self):
        self.encryption_manager = EncryptionManager()
        self.phi_classifier = PHIClassifier()
        self.hipaa_checker = HIPAAComplianceChecker()
        self.gdpr_checker = GDPRComplianceChecker()
        self.audit_logger = AuditLogger(self.encryption_manager)
        self.processing_records: Dict[str, DataProcessingRecord] = {}

    async def validate_data_operation(self, data: Dict[str, Any], operation: str,
                                    user_id: str, session_id: str) -> Dict[str, Any]:
        """Validate data operation for compliance"""
        start_time = datetime.now()

        try:
            # Classify data
            data_classification = await self._classify_data(data)

            # Check compliance
            violations = []

            if data_classification in [DataClassification.PHI]:
                hipaa_violations = await self.hipaa_checker.check_compliance(data, operation)
                violations.extend(hipaa_violations)

            if data_classification in [DataClassification.PII]:
                # For GDPR, we need a processing record
                if operation in ['collect', 'store', 'process']:
                    processing_record = DataProcessingRecord(
                        record_id=str(uuid.uuid4()),
                        data_subject_id=data.get('subject_id', user_id),
                        processing_purpose=data.get('purpose', 'healthcare_ai_processing'),
                        data_types=data.get('data_types', ['personal_data']),
                        legal_basis=data.get('legal_basis', 'consent'),
                        retention_period=timedelta(days=data.get('retention_days', 2555)),  # 7 years default
                        data_location=data.get('location', 'secure_server'),
                        third_parties=data.get('third_parties', []),
                        consent_obtained=data.get('consent_obtained', False),
                        consent_timestamp=datetime.now() if data.get('consent_obtained') else None,
                        processing_start=datetime.now()
                    )

                    self.processing_records[processing_record.record_id] = processing_record
                    gdpr_violations = await self.gdpr_checker.check_compliance(processing_record)
                    violations.extend(gdpr_violations)

            # Log audit event
            audit_event = AuditEvent(
                event_id=str(uuid.uuid4()),
                event_type=self._map_operation_to_event_type(operation),
                timestamp=datetime.now(),
                user_id=user_id,
                session_id=session_id,
                resource_id=data.get('resource_id'),
                action=operation,
                outcome="success" if not violations else "compliance_violations",
                data_classification=data_classification,
                ip_address=data.get('ip_address', 'unknown'),
                user_agent=data.get('user_agent', 'unknown'),
                risk_score=self._calculate_operation_risk(data, operation, violations),
                additional_data={
                    'violations_count': len(violations),
                    'operation_type': operation
                }
            )

            await self.audit_logger.log_event(audit_event)

            # Apply security measures
            secured_data = await self._apply_security_measures(data, data_classification)

            processing_time = (datetime.now() - start_time).total_seconds()

            return {
                'status': 'compliant' if not violations else 'violations_detected',
                'data': secured_data,
                'violations': [asdict(v) for v in violations],
                'data_classification': data_classification,
                'processing_time': processing_time,
                'audit_event_id': audit_event.event_id
            }

        except Exception as e:
            logger.error(f"Compliance validation error: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'processing_time': (datetime.now() - start_time).total_seconds()
            }

    async def _classify_data(self, data: Dict[str, Any]) -> DataClassification:
        """Classify data based on content"""
        text_data = json.dumps(data) if isinstance(data, dict) else str(data)

        if self.phi_classifier.contains_phi(text_data):
            return DataClassification.PHI

        # Check for PII patterns
        pii_indicators = ['email', 'phone', 'address', 'name', 'birth']
        if any(indicator in text_data.lower() for indicator in pii_indicators):
            return DataClassification.PII

        # Check for medical content
        medical_indicators = ['diagnosis', 'treatment', 'medication', 'symptom', 'patient']
        if any(indicator in text_data.lower() for indicator in medical_indicators):
            return DataClassification.CONFIDENTIAL

        return DataClassification.INTERNAL

    def _map_operation_to_event_type(self, operation: str) -> AuditEventType:
        """Map operation to audit event type"""
        mapping = {
            'read': AuditEventType.DATA_ACCESS,
            'write': AuditEventType.DATA_MODIFICATION,
            'update': AuditEventType.DATA_MODIFICATION,
            'delete': AuditEventType.DATA_DELETION,
            'export': AuditEventType.DATA_EXPORT,
            'store': AuditEventType.DATA_MODIFICATION,
            'transmit': AuditEventType.DATA_ACCESS
        }
        return mapping.get(operation, AuditEventType.DATA_ACCESS)

    def _calculate_operation_risk(self, data: Dict[str, Any], operation: str,
                                violations: List[ComplianceViolation]) -> float:
        """Calculate risk score for operation"""
        base_risk = 0.1

        # Increase risk based on operation type
        operation_risk = {
            'delete': 0.3,
            'export': 0.4,
            'transmit': 0.3,
            'modify': 0.2,
            'access': 0.1
        }.get(operation, 0.1)

        # Increase risk for violations
        violation_risk = len(violations) * 0.2

        # Increase risk for sensitive data
        if any(keyword in str(data).lower() for keyword in ['ssn', 'medical_record', 'diagnosis']):
            base_risk += 0.3

        return min(1.0, base_risk + operation_risk + violation_risk)

    async def _apply_security_measures(self, data: Dict[str, Any],
                                     classification: DataClassification) -> Dict[str, Any]:
        """Apply security measures based on data classification"""
        secured_data = data.copy()

        if classification in [DataClassification.PHI, DataClassification.PII]:
            # Encrypt sensitive fields
            sensitive_fields = ['ssn', 'medical_record_number', 'patient_id', 'diagnosis']
            for field in sensitive_fields:
                if field in secured_data:
                    secured_data[field] = self.encryption_manager.encrypt_data(str(secured_data[field]))
                    secured_data[f'{field}_encrypted'] = True

        if classification == DataClassification.PHI:
            # Redact PHI from text fields
            text_fields = ['notes', 'description', 'comments', 'content']
            for field in text_fields:
                if field in secured_data and isinstance(secured_data[field], str):
                    secured_data[field] = self.phi_classifier.redact_phi(secured_data[field])

        secured_data['security_applied'] = True
        secured_data['classification'] = classification
        secured_data['secured_at'] = datetime.now().isoformat()

        return secured_data

    async def generate_compliance_report(self, standard: ComplianceStandard,
                                       start_date: Optional[datetime] = None,
                                       end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Generate comprehensive compliance report"""
        audit_report = await self.audit_logger.generate_compliance_report(standard)

        # Add processing records information for GDPR
        if standard == ComplianceStandard.GDPR:
            audit_report['data_processing_records'] = {
                'total_records': len(self.processing_records),
                'active_processing': len([r for r in self.processing_records.values()
                                        if r.processing_end is None]),
                'consent_based': len([r for r in self.processing_records.values()
                                    if r.legal_basis == 'consent' and r.consent_obtained]),
                'expired_data': len([r for r in self.processing_records.values()
                                   if r.processing_end and
                                      (datetime.now() - r.processing_end) > r.retention_period])
            }

        return audit_report

# Global compliance orchestrator instance
compliance_orchestrator = ComplianceOrchestrator()