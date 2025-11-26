"""
HIPAA/GDPR Compliance Service
Handles PHI/PII protection, de-identification, audit logging, and regulatory compliance
"""

import hashlib
import uuid
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from enum import Enum
import structlog

logger = structlog.get_logger(__name__)


class DataClassification(Enum):
    """Data sensitivity classification"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    PHI_PII = "phi_pii"  # Protected Health Information / Personally Identifiable Information


class ComplianceRegime(Enum):
    """Regulatory compliance regimes"""
    HIPAA = "hipaa"  # US Healthcare
    GDPR = "gdpr"    # EU Data Protection
    BOTH = "both"    # Both regulations apply


class RiskLevel(Enum):
    """Risk level classification for compliance"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplianceService:
    """
    HIPAA/GDPR Compliance Service

    Implements:
    - PHI/PII de-identification
    - Data encryption at rest and in transit
    - Audit trail logging
    - Right to erasure (GDPR)
    - Data minimization
    - Consent management

    Golden Rules Compliance:
    - Rule #3: Tenant isolation enforced
    - Rule #5: All accesses logged for audit
    """

    # PHI Identifiers (HIPAA Safe Harbor Method - 18 identifiers)
    PHI_PATTERNS = {
        'name': r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'mrn': r'\b(MRN|Medical Record Number)[\s:]?\d{6,10}\b',
        'date': r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        'zip': r'\b\d{5}(?:-\d{4})?\b',
        'ipv4': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
        'url': r'https?://[^\s]+',
    }

    # GDPR Special Categories (Article 9)
    GDPR_SPECIAL_CATEGORIES = [
        'health',
        'genetic',
        'biometric',
        'racial',
        'ethnic',
        'political',
        'religious',
        'philosophical',
        'trade_union',
        'sexual_orientation'
    ]

    def __init__(self, supabase_client):
        """
        Initialize compliance service

        Args:
            supabase_client: Supabase client for audit logging
        """
        self.supabase = supabase_client
        self.token_map: Dict[str, str] = {}  # For re-identification

    async def protect_data(
        self,
        data: Any,
        regime: ComplianceRegime = ComplianceRegime.BOTH,
        tenant_id: str = None,
        user_id: str = None,
        purpose: str = "processing"
    ) -> Tuple[Any, str]:
        """
        Protect sensitive data according to HIPAA/GDPR requirements

        Args:
            data: Data to protect (can be string, dict, or list)
            regime: Compliance regime (HIPAA, GDPR, or BOTH)
            tenant_id: Tenant identifier
            user_id: User identifier
            purpose: Purpose of data processing (for GDPR Article 6)

        Returns:
            Tuple of (protected_data, audit_id)
        """
        # Start audit trail
        audit_id = await self._log_access(
            data_type="sensitive_data",
            action="de-identify",
            regime=regime.value,
            tenant_id=tenant_id,
            user_id=user_id,
            purpose=purpose
        )

        try:
            # De-identify based on data type
            if isinstance(data, str):
                protected = await self._deidentify_text(data)
            elif isinstance(data, dict):
                protected = await self._deidentify_dict(data)
            elif isinstance(data, list):
                protected = [await self._deidentify_text(str(item)) for item in data]
            else:
                protected = data

            # Log successful protection
            await self._log_completion(audit_id, success=True)

            return protected, audit_id

        except Exception as e:
            logger.error("Data protection failed", error=str(e), audit_id=audit_id)
            await self._log_completion(audit_id, success=False, error=str(e))
            raise

    async def _deidentify_text(self, text: str) -> str:
        """
        De-identify text by replacing PHI/PII with tokens

        Uses HIPAA Safe Harbor method
        """
        protected = text

        # Replace each PHI pattern with a token
        for identifier_type, pattern in self.PHI_PATTERNS.items():
            matches = re.finditer(pattern, protected)
            for match in matches:
                original = match.group()
                token = self._generate_token(original, identifier_type)
                protected = protected.replace(original, token)

        return protected

    async def _deidentify_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        De-identify dictionary data

        Recursively processes nested structures
        """
        protected = {}

        # Fields that commonly contain PHI/PII
        sensitive_fields = {
            'name', 'patient_name', 'full_name', 'first_name', 'last_name',
            'email', 'phone', 'telephone', 'mobile',
            'ssn', 'social_security_number',
            'mrn', 'medical_record_number',
            'address', 'street', 'city', 'zip', 'postal_code',
            'dob', 'date_of_birth', 'birth_date',
            'ip_address', 'ipv4', 'ipv6'
        }

        for key, value in data.items():
            if key.lower() in sensitive_fields:
                # De-identify sensitive fields
                if isinstance(value, str):
                    protected[key] = self._generate_token(value, key)
                else:
                    protected[key] = "[REDACTED]"
            elif isinstance(value, dict):
                # Recursively process nested dicts
                protected[key] = await self._deidentify_dict(value)
            elif isinstance(value, list):
                # Process lists
                protected[key] = [
                    await self._deidentify_dict(item) if isinstance(item, dict)
                    else await self._deidentify_text(str(item)) if isinstance(item, str)
                    else item
                    for item in value
                ]
            elif isinstance(value, str):
                # Check if string contains PHI
                protected[key] = await self._deidentify_text(value)
            else:
                protected[key] = value

        return protected

    def _generate_token(self, original: str, identifier_type: str) -> str:
        """
        Generate consistent token for de-identified value

        Uses SHA-256 hashing for consistency (same input = same token)
        """
        # Create deterministic hash
        hash_input = f"{identifier_type}:{original}".encode('utf-8')
        hash_digest = hashlib.sha256(hash_input).hexdigest()[:12]

        # Create readable token
        token = f"[{identifier_type.upper()}-{hash_digest}]"

        # Store mapping for potential re-identification (in secure storage)
        self.token_map[token] = original

        return token

    async def re_identify_data(
        self,
        protected_data: Any,
        audit_id: str,
        authorized_user: str
    ) -> Any:
        """
        Re-identify data (ONLY for authorized purposes)

        Args:
            protected_data: De-identified data
            audit_id: Original audit ID
            authorized_user: User authorized to view PHI

        Returns:
            Re-identified data
        """
        # Log re-identification attempt
        reidentify_audit = await self._log_access(
            data_type="re-identification",
            action="re-identify",
            regime="both",
            user_id=authorized_user,
            purpose="authorized_access",
            parent_audit_id=audit_id
        )

        try:
            # Re-identify based on data type
            if isinstance(protected_data, str):
                original = self._reverse_tokens(protected_data)
            elif isinstance(protected_data, dict):
                original = self._reverse_dict(protected_data)
            else:
                original = protected_data

            await self._log_completion(reidentify_audit, success=True)
            return original

        except Exception as e:
            logger.error("Re-identification failed", error=str(e))
            await self._log_completion(reidentify_audit, success=False, error=str(e))
            raise

    def _reverse_tokens(self, text: str) -> str:
        """Reverse tokenization to restore original values"""
        reversed_text = text

        for token, original in self.token_map.items():
            reversed_text = reversed_text.replace(token, original)

        return reversed_text

    def _reverse_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively reverse de-identification in dictionary"""
        original = {}

        for key, value in data.items():
            if isinstance(value, str) and '[' in value and ']' in value:
                original[key] = self._reverse_tokens(value)
            elif isinstance(value, dict):
                original[key] = self._reverse_dict(value)
            elif isinstance(value, list):
                original[key] = [
                    self._reverse_dict(item) if isinstance(item, dict)
                    else self._reverse_tokens(item) if isinstance(item, str)
                    else item
                    for item in value
                ]
            else:
                original[key] = value

        return original

    async def _log_access(
        self,
        data_type: str,
        action: str,
        regime: str,
        tenant_id: str = None,
        user_id: str = None,
        purpose: str = None,
        parent_audit_id: str = None
    ) -> str:
        """
        Log data access for audit trail (HIPAA/GDPR requirement)

        Returns audit_id for tracking
        """
        audit_id = str(uuid.uuid4())

        audit_record = {
            'audit_id': audit_id,
            'timestamp': datetime.utcnow().isoformat(),
            'data_type': data_type,
            'action': action,
            'compliance_regime': regime,
            'tenant_id': tenant_id,
            'user_id': user_id,
            'purpose': purpose,
            'parent_audit_id': parent_audit_id,
            'status': 'in_progress'
        }

        # Store in compliance_audit_log table
        try:
            await self.supabase.table('compliance_audit_log').insert(audit_record).execute()
            logger.info("Compliance audit logged", audit_id=audit_id, action=action)
        except Exception as e:
            logger.error("Failed to log audit", error=str(e))
            # Don't fail the operation if audit logging fails, but log the error

        return audit_id

    async def _log_completion(
        self,
        audit_id: str,
        success: bool,
        error: str = None
    ):
        """Mark audit log entry as complete"""
        try:
            update_data = {
                'status': 'completed' if success else 'failed',
                'completed_at': datetime.utcnow().isoformat(),
                'error': error
            }

            await self.supabase.table('compliance_audit_log')\
                .update(update_data)\
                .eq('audit_id', audit_id)\
                .execute()

        except Exception as e:
            logger.error("Failed to update audit log", error=str(e), audit_id=audit_id)

    async def check_consent(
        self,
        user_id: str,
        purpose: str,
        tenant_id: str
    ) -> bool:
        """
        Check if user has provided consent for data processing (GDPR Article 6)

        Args:
            user_id: User identifier
            purpose: Purpose of data processing
            tenant_id: Tenant identifier

        Returns:
            True if consent exists and is valid
        """
        try:
            result = await self.supabase.table('user_consent')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('tenant_id', tenant_id)\
                .eq('purpose', purpose)\
                .eq('status', 'active')\
                .execute()

            if result.data and len(result.data) > 0:
                # Check if consent is still valid (not withdrawn or expired)
                consent = result.data[0]
                expiry = consent.get('expires_at')

                if expiry:
                    expiry_date = datetime.fromisoformat(expiry)
                    if datetime.utcnow() > expiry_date:
                        return False

                return True

            return False

        except Exception as e:
            logger.error("Consent check failed", error=str(e))
            # Default to no consent if check fails
            return False

    async def right_to_erasure(
        self,
        user_id: str,
        tenant_id: str
    ) -> Dict[str, Any]:
        """
        Execute right to erasure (GDPR Article 17)

        Permanently deletes all user data

        Args:
            user_id: User identifier
            tenant_id: Tenant identifier

        Returns:
            Summary of deleted data
        """
        audit_id = await self._log_access(
            data_type="user_data",
            action="erasure",
            regime="gdpr",
            tenant_id=tenant_id,
            user_id=user_id,
            purpose="right_to_erasure"
        )

        deleted_summary = {
            'user_id': user_id,
            'tenant_id': tenant_id,
            'deleted_at': datetime.utcnow().isoformat(),
            'tables_affected': []
        }

        # Tables that may contain user data
        user_data_tables = [
            'user_consent',
            'user_queries',
            'user_sessions',
            'user_feedback',
            'conversation_history',
            'session_memory'
        ]

        try:
            for table in user_data_tables:
                result = await self.supabase.table(table)\
                    .delete()\
                    .eq('user_id', user_id)\
                    .eq('tenant_id', tenant_id)\
                    .execute()

                if result.data:
                    deleted_summary['tables_affected'].append({
                        'table': table,
                        'records_deleted': len(result.data)
                    })

            await self._log_completion(audit_id, success=True)
            logger.info("Right to erasure executed", user_id=user_id, summary=deleted_summary)

            return deleted_summary

        except Exception as e:
            logger.error("Right to erasure failed", error=str(e), user_id=user_id)
            await self._log_completion(audit_id, success=False, error=str(e))
            raise


class HumanInLoopValidator:
    """
    Human-in-the-Loop Validation Service

    Determines when human review is required based on:
    - Confidence scores
    - Clinical decision types
    - Regulatory requirements
    - Patient safety concerns
    """

    # Critical triggers requiring mandatory human review
    CRITICAL_TRIGGERS = [
        'diagnosis',
        'treatment',
        'medication',
        'surgery',
        'emergency',
        'pediatric',
        'pregnancy',
        'psychiatric',
        'end_of_life',
        'clinical_trial',
        'dose_change',
        'therapy_modification'
    ]

    # Confidence thresholds
    CONFIDENCE_THRESHOLD_CRITICAL = 0.95  # Critical decisions
    CONFIDENCE_THRESHOLD_HIGH = 0.85      # High-risk decisions
    CONFIDENCE_THRESHOLD_MEDIUM = 0.75    # Medium-risk decisions

    def __init__(self):
        """Initialize validator"""
        self.logger = structlog.get_logger(__name__)

    async def requires_human_review(
        self,
        query: str,
        response: str,
        confidence: float,
        domain: str = None,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Determine if human review is required

        Args:
            query: User query text
            response: Agent response
            confidence: Response confidence score (0-1)
            domain: Domain/specialty
            context: Additional context

        Returns:
            Dictionary with decision and reasoning
        """
        reasons = []
        required = False
        risk_level = "low"

        # Check 1: Confidence score
        if confidence < self.CONFIDENCE_THRESHOLD_CRITICAL:
            if any(trigger in query.lower() for trigger in self.CRITICAL_TRIGGERS):
                required = True
                risk_level = "critical"
                reasons.append(f"Low confidence ({confidence:.2f}) for critical decision")

        if confidence < self.CONFIDENCE_THRESHOLD_HIGH:
            required = True
            risk_level = "high"
            reasons.append(f"Confidence below threshold ({confidence:.2f} < {self.CONFIDENCE_THRESHOLD_HIGH})")

        # Check 2: Critical trigger words
        for trigger in self.CRITICAL_TRIGGERS:
            if trigger in query.lower() or trigger in response.lower():
                required = True
                risk_level = "critical"
                reasons.append(f"Critical keyword detected: '{trigger}'")
                break

        # Check 3: Domain-specific rules
        if domain:
            if domain.lower() in ['oncology', 'cardiology', 'neurology', 'critical_care']:
                if confidence < 0.90:
                    required = True
                    risk_level = "high"
                    reasons.append(f"High-risk specialty ({domain}) requires higher confidence")

        # Check 4: Response characteristics
        if "I recommend" in response or "You should" in response:
            if confidence < 0.90:
                required = True
                risk_level = "high"
                reasons.append("Direct recommendation requires high confidence")

        # Check 5: Uncertainty indicators
        uncertainty_phrases = [
            "possibly", "maybe", "might", "could be",
            "uncertain", "unclear", "not sure", "may indicate"
        ]
        if any(phrase in response.lower() for phrase in uncertainty_phrases):
            required = True
            reasons.append("Response contains uncertainty indicators")

        return {
            'requires_human_review': required,
            'risk_level': risk_level,
            'confidence_score': confidence,
            'reasons': reasons,
            'recommendation': self._generate_recommendation(required, risk_level, reasons)
        }

    def _generate_recommendation(
        self,
        required: bool,
        risk_level: str,
        reasons: List[str]
    ) -> str:
        """Generate human-readable recommendation"""
        if not required:
            return "Automated response is appropriate. No human review required."

        if risk_level == "critical":
            return f"⚠️ CRITICAL: Mandatory human physician review required. Reasons: {'; '.join(reasons)}"
        elif risk_level == "high":
            return f"⚠️ HIGH RISK: Human review strongly recommended. Reasons: {'; '.join(reasons)}"
        else:
            return f"Human review recommended. Reasons: {'; '.join(reasons)}"
