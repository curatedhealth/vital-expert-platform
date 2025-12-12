// Healthcare compliance test setup
// Specific setup for HIPAA, FDA, and medical safety compliance tests

import '@testing-library/jest-dom';

// Healthcare compliance test environment
beforeAll(() => {
  console.log('🏥 Setting up healthcare compliance test environment');

  // HIPAA compliance test settings
  process.env.HIPAA_TEST_MODE = 'strict';
  process.env.PHI_DETECTION_ENABLED = 'true';
  process.env.AUDIT_LOGGING_REQUIRED = 'true';

  // FDA validation test settings
  process.env.FDA_VALIDATION_MODE = 'enabled';
  process.env.MEDICAL_ACCURACY_REQUIRED = 'true';
  process.env.CLINICAL_VALIDATION_STRICT = 'true';

  // Medical safety test configuration
  process.env.MEDICAL_SAFETY_CHECKS = 'enabled';
  process.env.CONFIDENCE_THRESHOLD_REQUIRED = 'true';
  process.env.PHARMA_FRAMEWORK_VALIDATION = 'enabled';
});

// Healthcare compliance test utilities
global.complianceTestUtils = {
  // HIPAA compliance validators
  validatePHIProtection: (data) => {
    const phiFields = [
      'ssn', 'social_security', 'patient_id', 'medical_record_number',
      'name', 'address', 'phone', 'email', 'date_of_birth'
    ];

    const stringData = JSON.stringify(data).toLowerCase();
    return !phiFields.some(field => stringData.includes(field));
  },

  validateEncryption: (data) => {
    // Check if sensitive data appears to be encrypted
    if (typeof data === 'string') {
      // Basic check for encrypted-like strings (not actual validation)
      return data.length > 20 && !/^[a-z\s]+$/i.test(data);
    }
    return true;
  },

  validateAuditTrail: (operation) => {
    // Ensure audit trail properties are present
    const requiredAuditFields = ['timestamp', 'user', 'action', 'resource'];
    return requiredAuditFields.every(field => operation.hasOwnProperty(field));
  },

  // FDA compliance validators
  validateMedicalAccuracy: (response) => {
    return {
      hasConfidenceScore: typeof response.confidence === 'number',
      hasValidation: !!response.validation,
      hasDisclaimer: !!response.disclaimer,
      meetsThreshold: response.confidence >= 0.8
    };
  },

  validateClinicalFramework: (framework) => {
    const supportedFrameworks = ['PHARMA', 'VERIFY', 'CONSORT', 'SPIRIT'];
    return supportedFrameworks.includes(framework);
  },

  // Medical safety validators
  validateSafetyChecks: (medicalResponse) => {
    return {
      hasSafetyWarnings: !!medicalResponse.safetyWarnings,
      hasContraindications: !!medicalResponse.contraindications,
      hasRiskAssessment: !!medicalResponse.riskAssessment,
      hasHumanOversight: medicalResponse.requiresHumanReview === true
    };
  },

  // Mock medical data generators (HIPAA-compliant test data)
  generateComplianceTestData: () => ({
    patientId: 'TEST-PATIENT-001',
    anonymizedData: {
      ageRange: '45-50',
      genderCode: 'F',
      conditionCategory: 'cardiovascular',
      treatmentPhase: 'maintenance'
    },
    metadata: {
      dataSource: 'test-environment',
      anonymized: true,
      phiRemoved: true,
      testData: true
    }
  })
};

// Medical safety test matchers
expect.extend({
  toBeHIPAACompliant(received) {
    const pass = global.complianceTestUtils.validatePHIProtection(received);
    return {
      message: () =>
        pass
          ? `Expected data not to be HIPAA compliant`
          : `Expected data to be HIPAA compliant (no PHI detected)`,
      pass,
    };
  },

  toHaveMedicalValidation(received) {
    const validation = global.complianceTestUtils.validateMedicalAccuracy(received);
    const pass = validation.hasConfidenceScore && validation.hasValidation;
    return {
      message: () =>
        pass
          ? `Expected medical response not to have proper validation`
          : `Expected medical response to have confidence score and validation framework`,
      pass,
    };
  },

  toMeetFDARequirements(received) {
    const hasFramework = global.complianceTestUtils.validateClinicalFramework(received.framework);
    const hasAccuracy = received.confidence >= 0.8;
    const pass = hasFramework && hasAccuracy;
    return {
      message: () =>
        pass
          ? `Expected response not to meet FDA requirements`
          : `Expected response to meet FDA requirements (valid framework and >80% confidence)`,
      pass,
    };
  }
});

afterEach(() => {
  // Clear any test-specific compliance state
  jest.clearAllMocks();
});

afterAll(() => {
  console.log('🏥 Healthcare compliance test environment cleaned up');
});