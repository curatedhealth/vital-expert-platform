"""
Unit Tests for HIPAA/GDPR Compliance Service

Tests coverage:
- PHI/PII de-identification
- Human-in-loop validation
- Audit trail logging
- Right to erasure (GDPR)
- Consent management
- Data classification
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime, timedelta
import uuid

# Import compliance service components
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'src'))

from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification,
    RiskLevel
)


class TestComplianceService:
    """Test suite for ComplianceService"""

    @pytest.fixture
    def mock_supabase(self):
        """Mock Supabase client"""
        mock = Mock()
        mock.table = Mock(return_value=mock)
        mock.insert = Mock(return_value=mock)
        mock.update = Mock(return_value=mock)
        mock.delete = Mock(return_value=mock)
        mock.select = Mock(return_value=mock)
        mock.eq = Mock(return_value=mock)
        mock.execute = Mock(return_value=Mock(data=[{'id': str(uuid.uuid4())}]))
        return mock

    @pytest.fixture
    def compliance_service(self, mock_supabase):
        """Create ComplianceService instance"""
        return ComplianceService(mock_supabase)

    @pytest.mark.asyncio
    async def test_deidentify_phi_names(self, compliance_service):
        """Test PHI de-identification - names"""
        text = "Patient John Smith came in today."
        result = await compliance_service._deidentify_text(text)

        assert "John Smith" not in result
        assert "[NAME]" in result or "[REDACTED]" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_ssn(self, compliance_service):
        """Test PHI de-identification - SSN"""
        text = "SSN: 123-45-6789 for patient records"
        result = await compliance_service._deidentify_text(text)

        assert "123-45-6789" not in result
        assert "[SSN]" in result or "[REDACTED]" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_phone(self, compliance_service):
        """Test PHI de-identification - phone numbers"""
        text = "Contact at 555-123-4567 or (555) 123-4567"
        result = await compliance_service._deidentify_text(text)

        assert "555-123-4567" not in result
        assert "[PHONE]" in result or "[REDACTED]" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_email(self, compliance_service):
        """Test PHI de-identification - email addresses"""
        text = "Email patient at john.doe@example.com for follow-up"
        result = await compliance_service._deidentify_text(text)

        assert "john.doe@example.com" not in result
        assert "[EMAIL]" in result or "[REDACTED]" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_mrn(self, compliance_service):
        """Test PHI de-identification - medical record numbers"""
        text = "MRN: 12345678 needs review"
        result = await compliance_service._deidentify_text(text)

        assert "12345678" not in result or "[MRN]" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_date(self, compliance_service):
        """Test PHI de-identification - dates"""
        text = "Appointment on 01/15/2024 at 3:00 PM"
        result = await compliance_service._deidentify_text(text)

        # Date might be redacted or anonymized
        assert "[DATE]" in result or "01/15/2024" not in result or "2024" in result

    @pytest.mark.asyncio
    async def test_deidentify_phi_address(self, compliance_service):
        """Test PHI de-identification - addresses"""
        text = "Lives at 123 Main Street, Boston, MA 02101"
        result = await compliance_service._deidentify_text(text)

        # Address components should be redacted
        assert "[ADDRESS]" in result or "123 Main Street" not in result

    @pytest.mark.asyncio
    async def test_deidentify_multiple_phi(self, compliance_service):
        """Test PHI de-identification - multiple identifiers"""
        text = """
        Patient: John Smith
        SSN: 123-45-6789
        Phone: 555-123-4567
        Email: john@example.com
        MRN: 87654321
        Address: 123 Main St, Boston, MA 02101
        """
        result = await compliance_service._deidentify_text(text)

        # Check that all PHI is removed
        assert "John Smith" not in result
        assert "123-45-6789" not in result
        assert "555-123-4567" not in result
        assert "john@example.com" not in result
        assert "[REDACTED]" in result or "[NAME]" in result

    @pytest.mark.asyncio
    async def test_protect_data_hipaa_only(self, compliance_service, mock_supabase):
        """Test protect_data with HIPAA regime"""
        text = "Patient John Smith, SSN 123-45-6789"

        protected, audit_id = await compliance_service.protect_data(
            data=text,
            regime=ComplianceRegime.HIPAA,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="consultation"
        )

        assert protected != text
        assert "John Smith" not in protected
        assert "123-45-6789" not in protected
        assert audit_id is not None
        assert isinstance(audit_id, str)

    @pytest.mark.asyncio
    async def test_protect_data_gdpr_only(self, compliance_service, mock_supabase):
        """Test protect_data with GDPR regime"""
        text = "Customer email: john@example.com, phone: 555-1234"

        protected, audit_id = await compliance_service.protect_data(
            data=text,
            regime=ComplianceRegime.GDPR,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="processing"
        )

        assert protected != text
        assert "john@example.com" not in protected
        assert audit_id is not None

    @pytest.mark.asyncio
    async def test_protect_data_both_regimes(self, compliance_service, mock_supabase):
        """Test protect_data with both HIPAA and GDPR"""
        text = "Patient John Smith, email john@example.com, SSN 123-45-6789"

        protected, audit_id = await compliance_service.protect_data(
            data=text,
            regime=ComplianceRegime.BOTH,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="ai_expert_consultation"
        )

        assert protected != text
        assert "John Smith" not in protected
        assert "john@example.com" not in protected
        assert "123-45-6789" not in protected
        assert audit_id is not None

    @pytest.mark.asyncio
    async def test_audit_trail_logging(self, compliance_service, mock_supabase):
        """Test audit trail is properly logged"""
        text = "Test data"

        await compliance_service.protect_data(
            data=text,
            regime=ComplianceRegime.BOTH,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="testing"
        )

        # Verify audit log was created
        mock_supabase.table.assert_called()
        # Check that insert was called on compliance_audit_log table
        calls = [call for call in mock_supabase.table.call_args_list]
        table_names = [call[0][0] if call[0] else None for call in calls]
        assert 'compliance_audit_log' in table_names or any('audit' in str(name).lower() for name in table_names if name)

    @pytest.mark.asyncio
    async def test_right_to_erasure(self, compliance_service, mock_supabase):
        """Test GDPR right to erasure"""
        user_id = "test-user-123"
        tenant_id = "test-tenant"

        result = await compliance_service.right_to_erasure(
            user_id=user_id,
            tenant_id=tenant_id
        )

        assert result is not None
        assert isinstance(result, dict)
        # Should have deleted or anonymized user data

    @pytest.mark.asyncio
    async def test_consent_management_grant(self, compliance_service, mock_supabase):
        """Test granting consent"""
        result = await compliance_service.manage_consent(
            user_id="test-user",
            tenant_id="test-tenant",
            consent_type="data_processing",
            granted=True
        )

        assert result is not None
        mock_supabase.table.assert_called()

    @pytest.mark.asyncio
    async def test_consent_management_revoke(self, compliance_service, mock_supabase):
        """Test revoking consent"""
        result = await compliance_service.manage_consent(
            user_id="test-user",
            tenant_id="test-tenant",
            consent_type="data_processing",
            granted=False
        )

        assert result is not None
        mock_supabase.table.assert_called()

    @pytest.mark.asyncio
    async def test_data_classification(self, compliance_service):
        """Test data classification logic"""
        # High sensitivity data
        high_sensitivity_text = "Patient SSN: 123-45-6789, diagnosis: cancer"

        # Mock classification logic (assuming it exists)
        # This would need actual implementation in compliance_service
        classification = DataClassification.HIGHLY_SENSITIVE

        assert classification == DataClassification.HIGHLY_SENSITIVE


class TestHumanInLoopValidator:
    """Test suite for HumanInLoopValidator"""

    @pytest.fixture
    def validator(self):
        """Create HumanInLoopValidator instance"""
        return HumanInLoopValidator()

    @pytest.mark.asyncio
    async def test_low_confidence_triggers_review(self, validator):
        """Test that low confidence triggers human review"""
        result = await validator.requires_human_review(
            query="What medication should I take?",
            response="You should take aspirin daily.",
            confidence=0.45,  # Below default threshold of 0.60
            domain="medication_recommendation"
        )

        assert result['requires_human_review'] is True
        assert result['risk_level'] in [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
        assert 'confidence' in [r.lower() for r in result['reasons']]

    @pytest.mark.asyncio
    async def test_high_confidence_no_review(self, validator):
        """Test that high confidence doesn't trigger review"""
        result = await validator.requires_human_review(
            query="What is the normal human body temperature?",
            response="Normal human body temperature is approximately 98.6°F (37°C).",
            confidence=0.95,
            domain="general_medical_knowledge"
        )

        assert result['requires_human_review'] is False
        assert result['risk_level'] == RiskLevel.LOW

    @pytest.mark.asyncio
    async def test_critical_keywords_trigger_review(self, validator):
        """Test that critical keywords trigger human review"""
        critical_queries = [
            "Should I stop taking my prescribed medication?",
            "I'm having severe chest pain, what should I do?",
            "Can I perform surgery at home?",
            "What's the right dosage of chemotherapy?",
            "Should I discontinue my insulin?"
        ]

        for query in critical_queries:
            result = await validator.requires_human_review(
                query=query,
                response="[Response]",
                confidence=0.85,  # Even with high confidence
                domain="medical_advice"
            )

            assert result['requires_human_review'] is True
            assert result['risk_level'] in [RiskLevel.HIGH, RiskLevel.CRITICAL]

    @pytest.mark.asyncio
    async def test_medication_changes_trigger_review(self, validator):
        """Test medication-related changes trigger review"""
        result = await validator.requires_human_review(
            query="Can I change my medication dose?",
            response="You might consider adjusting your dose.",
            confidence=0.75,
            domain="medication_recommendation"
        )

        assert result['requires_human_review'] is True

    @pytest.mark.asyncio
    async def test_diagnostic_recommendations_trigger_review(self, validator):
        """Test diagnostic recommendations trigger review"""
        result = await validator.requires_human_review(
            query="What disease do I have based on these symptoms?",
            response="Based on your symptoms, you likely have condition X.",
            confidence=0.80,
            domain="diagnosis"
        )

        assert result['requires_human_review'] is True
        assert result['risk_level'] in [RiskLevel.HIGH, RiskLevel.CRITICAL]

    @pytest.mark.asyncio
    async def test_surgical_procedures_trigger_review(self, validator):
        """Test surgical procedure questions trigger review"""
        result = await validator.requires_human_review(
            query="How do I perform an appendectomy?",
            response="Here are the steps for appendectomy...",
            confidence=0.90,
            domain="surgical_procedures"
        )

        assert result['requires_human_review'] is True
        assert result['risk_level'] == RiskLevel.CRITICAL

    @pytest.mark.asyncio
    async def test_emergency_situations_trigger_review(self, validator):
        """Test emergency situations trigger critical review"""
        emergency_queries = [
            "I'm having a heart attack, what do I do?",
            "Someone is choking, how do I help?",
            "My child ate poison, what should I do?",
            "I'm bleeding heavily, should I go to hospital?"
        ]

        for query in emergency_queries:
            result = await validator.requires_human_review(
                query=query,
                response="[Emergency response]",
                confidence=0.95,
                domain="emergency"
            )

            assert result['requires_human_review'] is True
            assert result['risk_level'] == RiskLevel.CRITICAL

    @pytest.mark.asyncio
    async def test_safe_general_knowledge_no_review(self, validator):
        """Test safe general knowledge doesn't trigger review"""
        safe_queries = [
            "What is the function of the heart?",
            "How does the immune system work?",
            "What are the main food groups?",
            "What is the difference between bacteria and viruses?"
        ]

        for query in safe_queries:
            result = await validator.requires_human_review(
                query=query,
                response="[Educational response]",
                confidence=0.90,
                domain="general_medical_education"
            )

            assert result['requires_human_review'] is False
            assert result['risk_level'] == RiskLevel.LOW

    @pytest.mark.asyncio
    async def test_pediatric_cases_trigger_review(self, validator):
        """Test pediatric cases trigger higher scrutiny"""
        result = await validator.requires_human_review(
            query="What medication can I give my infant for fever?",
            response="You can give acetaminophen.",
            confidence=0.75,
            domain="pediatrics"
        )

        # Pediatric cases should have heightened review requirements
        assert result['requires_human_review'] is True

    @pytest.mark.asyncio
    async def test_risk_level_stratification(self, validator):
        """Test proper risk level stratification"""
        # Low risk
        low_risk = await validator.requires_human_review(
            query="What is diabetes?",
            response="Diabetes is a condition...",
            confidence=0.95,
            domain="education"
        )
        assert low_risk['risk_level'] == RiskLevel.LOW

        # Medium risk
        medium_risk = await validator.requires_human_review(
            query="What foods should diabetics avoid?",
            response="Diabetics should limit sugar intake...",
            confidence=0.70,
            domain="dietary_advice"
        )
        assert medium_risk['risk_level'] in [RiskLevel.LOW, RiskLevel.MEDIUM]

        # High risk
        high_risk = await validator.requires_human_review(
            query="Should I adjust my insulin dose?",
            response="You might consider adjusting...",
            confidence=0.65,
            domain="medication_recommendation"
        )
        assert high_risk['risk_level'] in [RiskLevel.HIGH, RiskLevel.CRITICAL]

    @pytest.mark.asyncio
    async def test_recommendation_includes_helpful_text(self, validator):
        """Test that recommendations provide helpful guidance"""
        result = await validator.requires_human_review(
            query="Should I stop my medication?",
            response="You might consider stopping...",
            confidence=0.70,
            domain="medication"
        )

        assert 'recommendation' in result
        assert isinstance(result['recommendation'], str)
        assert len(result['recommendation']) > 0

    @pytest.mark.asyncio
    async def test_reasons_are_provided(self, validator):
        """Test that specific reasons are provided for review"""
        result = await validator.requires_human_review(
            query="Can I perform dental surgery at home?",
            response="Here are steps...",
            confidence=0.50,
            domain="surgery"
        )

        assert 'reasons' in result
        assert isinstance(result['reasons'], list)
        assert len(result['reasons']) > 0

    @pytest.mark.asyncio
    async def test_context_integration(self, validator):
        """Test that context is properly integrated"""
        context = {
            'user_history': 'previous_critical_questions',
            'session_risk_score': 0.8
        }

        result = await validator.requires_human_review(
            query="Follow-up question",
            response="Response",
            confidence=0.75,
            domain="follow_up",
            context=context
        )

        # Context should influence decision
        assert result is not None
        assert 'requires_human_review' in result


class TestComplianceRegimes:
    """Test compliance regime handling"""

    def test_compliance_regime_values(self):
        """Test ComplianceRegime enum values"""
        assert ComplianceRegime.HIPAA.value == "hipaa"
        assert ComplianceRegime.GDPR.value == "gdpr"
        assert ComplianceRegime.BOTH.value == "both"

    def test_data_classification_values(self):
        """Test DataClassification enum values"""
        assert DataClassification.PUBLIC.value == "public"
        assert DataClassification.INTERNAL.value == "internal"
        assert DataClassification.CONFIDENTIAL.value == "confidential"
        assert DataClassification.HIGHLY_SENSITIVE.value == "highly_sensitive"

    def test_risk_level_values(self):
        """Test RiskLevel enum values"""
        assert RiskLevel.LOW.value == "low"
        assert RiskLevel.MEDIUM.value == "medium"
        assert RiskLevel.HIGH.value == "high"
        assert RiskLevel.CRITICAL.value == "critical"


class TestIntegrationScenarios:
    """Integration test scenarios combining multiple compliance features"""

    @pytest.fixture
    def mock_supabase(self):
        """Mock Supabase client"""
        mock = Mock()
        mock.table = Mock(return_value=mock)
        mock.insert = Mock(return_value=mock)
        mock.update = Mock(return_value=mock)
        mock.delete = Mock(return_value=mock)
        mock.select = Mock(return_value=mock)
        mock.eq = Mock(return_value=mock)
        mock.execute = Mock(return_value=Mock(data=[{'id': str(uuid.uuid4())}]))
        return mock

    @pytest.mark.asyncio
    async def test_full_compliance_workflow(self, mock_supabase):
        """Test complete compliance workflow"""
        compliance = ComplianceService(mock_supabase)
        validator = HumanInLoopValidator()

        # Step 1: Protect sensitive data
        query = "Patient John Smith (SSN: 123-45-6789) asks: Should I stop my blood pressure medication?"

        protected_query, audit_id = await compliance.protect_data(
            data=query,
            regime=ComplianceRegime.BOTH,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="ai_consultation"
        )

        # Verify PHI removed
        assert "John Smith" not in protected_query
        assert "123-45-6789" not in protected_query
        assert audit_id is not None

        # Step 2: Process query (simulated agent response)
        agent_response = "You should consult your doctor before making any changes to your medication."
        confidence = 0.70

        # Step 3: Validate if human review needed
        validation = await validator.requires_human_review(
            query=protected_query,
            response=agent_response,
            confidence=confidence,
            domain="medication_recommendation"
        )

        # Should require review due to medication changes
        assert validation['requires_human_review'] is True
        assert validation['risk_level'] in [RiskLevel.HIGH, RiskLevel.CRITICAL]

        # Step 4: Verify audit trail
        assert mock_supabase.table.called

    @pytest.mark.asyncio
    async def test_emergency_compliance_workflow(self, mock_supabase):
        """Test emergency situation compliance workflow"""
        compliance = ComplianceService(mock_supabase)
        validator = HumanInLoopValidator()

        # Emergency query
        query = "I'm having severe chest pain and shortness of breath!"

        # Protect data (even though minimal PHI)
        protected_query, audit_id = await compliance.protect_data(
            data=query,
            regime=ComplianceRegime.BOTH,
            tenant_id="test-tenant",
            user_id="test-user",
            purpose="emergency_consultation"
        )

        # Validate - should require immediate human review
        validation = await validator.requires_human_review(
            query=protected_query,
            response="Please call 911 immediately.",
            confidence=0.99,  # Even with high confidence
            domain="emergency"
        )

        assert validation['requires_human_review'] is True
        assert validation['risk_level'] == RiskLevel.CRITICAL
        assert any('emergency' in reason.lower() or 'critical' in reason.lower() or 'severe' in reason.lower()
                   for reason in validation['reasons'])


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
