/**
 * Unit Tests for the 21 Healthcare AI Agents
 * Tests individual agent configurations and behaviors
 */

import type { AgentType } from '@/shared/types/chat.types';

// Define the 21 healthcare AI agent types
const HEALTHCARE_AGENT_TYPES: AgentType[] = [
  'digital-therapeutics-expert',
  'mhealth-innovation-architect',
  'ai-ml-clinical-specialist',
  'fda-regulatory-strategist',
  'ema-compliance-specialist',
  'clinical-trial-designer',
  'medical-safety-officer',
  'health-tech-integration-expert',
  'clinical-data-scientist',
  'regulatory-submission-specialist',
  'pharmacovigilance-analyst',
  'clinical-research-coordinator',
  'biomedical-informatics-specialist',
  'health-economics-analyst',
  'medical-affairs-strategist',
];

// Mock agent configurations for each healthcare specialization
const AGENT_CONFIGS = {
  'digital-therapeutics-expert': {
    name: 'Digital Therapeutics Expert',
    description: 'Specialized in digital therapeutic solutions and regulatory pathways',
    systemPrompt: 'You are an expert in digital therapeutics, evidence-based digital health interventions, and DTx regulatory frameworks.',
    model: 'gpt-4',
    avatar: '💊',
    color: '#10B981',
    capabilities: ['dtx-analysis', 'regulatory-guidance', 'evidence-generation', 'clinical-validation'],
    medicalSpecialty: 'Digital Therapeutics',
    accuracyRequirement: 0.95,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    clinicalValidationRequired: true,
    fdaSaMDClass: 'II',
  },
  'mhealth-innovation-architect': {
    name: 'mHealth Innovation Architect',
    description: 'Expert in mobile health innovation and digital health strategy',
    systemPrompt: 'You are a mobile health innovation architect specializing in digital health solutions, app development, and innovation strategy.',
    model: 'gpt-4',
    avatar: '📱',
    color: '#3B82F6',
    capabilities: ['innovation-strategy', 'mobile-health', 'digital-solutions', 'user-experience'],
    medicalSpecialty: 'Digital Health Innovation',
    accuracyRequirement: 0.90,
    hipaaCompliant: true,
    pharmaEnabled: false,
    verifyEnabled: true,
    fdaSaMDClass: 'I',
  },
  'ai-ml-clinical-specialist': {
    name: 'AI/ML Clinical Specialist',
    description: 'Expert in AI/ML applications in clinical settings and healthcare',
    systemPrompt: 'You are an AI/ML specialist focused on clinical applications, healthcare AI ethics, and machine learning in medicine.',
    model: 'gpt-4',
    avatar: '🤖',
    color: '#8B5CF6',
    capabilities: ['ml-algorithms', 'clinical-ai', 'data-analysis', 'predictive-modeling'],
    medicalSpecialty: 'Clinical AI/ML',
    accuracyRequirement: 0.97,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    fdaSaMDClass: 'III',
  },
  'fda-regulatory-strategist': {
    name: 'FDA Regulatory Strategist',
    description: 'Expert in FDA regulations, submissions, and compliance strategies',
    systemPrompt: 'You are an FDA regulatory expert specializing in medical device regulations, drug approvals, and compliance strategies.',
    model: 'gpt-4',
    avatar: '🏛️',
    color: '#DC2626',
    capabilities: ['fda-regulations', 'regulatory-submissions', 'compliance-strategy', '510k-pathway'],
    medicalSpecialty: 'Regulatory Affairs',
    accuracyRequirement: 0.98,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    fdaSaMDClass: 'III',
  },
  'ema-compliance-specialist': {
    name: 'EMA Compliance Specialist',
    description: 'Expert in European Medicines Agency regulations and EU compliance',
    systemPrompt: 'You are an EMA compliance specialist with expertise in European regulatory frameworks, CE marking, and EU medical device regulations.',
    model: 'gpt-4',
    avatar: '🇪🇺',
    color: '#1E40AF',
    capabilities: ['ema-regulations', 'ce-marking', 'eu-compliance', 'mdr-regulations'],
    medicalSpecialty: 'European Regulatory Affairs',
    accuracyRequirement: 0.98,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    fdaSaMDClass: 'III',
  },
  'clinical-trial-designer': {
    name: 'Clinical Trial Designer',
    description: 'Expert in clinical trial design, protocols, and execution',
    systemPrompt: 'You are a clinical trial design expert specializing in study protocols, statistical design, and regulatory compliance.',
    model: 'gpt-4',
    avatar: '🔬',
    color: '#059669',
    capabilities: ['protocol-design', 'statistical-planning', 'regulatory-compliance', 'endpoint-selection'],
    medicalSpecialty: 'Clinical Research',
    accuracyRequirement: 0.97,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    fdaSaMDClass: 'II',
  },
  'medical-safety-officer': {
    name: 'Medical Safety Officer',
    description: 'Expert in medical device safety, risk management, and post-market surveillance',
    systemPrompt: 'You are a medical safety officer specializing in device safety, adverse event reporting, and risk management frameworks.',
    model: 'gpt-4',
    avatar: '🛡️',
    color: '#DC2626',
    capabilities: ['safety-assessment', 'risk-management', 'adverse-events', 'post-market-surveillance'],
    medicalSpecialty: 'Medical Device Safety',
    accuracyRequirement: 0.99,
    hipaaCompliant: true,
    pharmaEnabled: true,
    verifyEnabled: true,
    fdaSaMDClass: 'III',
  },
};

describe('Healthcare AI Agents - Individual Agent Tests', () => {
  describe('Agent Type Coverage', () => {
    it('should have all 15 healthcare agent types defined', () => {
      expect(HEALTHCARE_AGENT_TYPES).toHaveLength(15);
    });

    it('should have unique agent type identifiers', () => {
      const uniqueTypes = new Set(HEALTHCARE_AGENT_TYPES);
      expect(uniqueTypes.size).toBe(HEALTHCARE_AGENT_TYPES.length);
    });

    it('should follow consistent naming convention', () => {
      HEALTHCARE_AGENT_TYPES.forEach(agentType => {
        expect(agentType).toMatch(/^[a-z]+-[a-z-]+$/);
        expect(agentType).not.toContain('_');
        expect(agentType).not.toContain(' ');
      });
    });
  });

  describe('Digital Therapeutics Expert', () => {
    const agentType = 'digital-therapeutics-expert';
    const config = AGENT_CONFIGS[agentType];

    it('should have correct configuration', () => {
      expect(config.name).toBe('Digital Therapeutics Expert');
      expect(config.medicalSpecialty).toBe('Digital Therapeutics');
      expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.95);
      expect(config.hipaaCompliant).toBe(true);
      expect(config.pharmaEnabled).toBe(true);
      expect(config.verifyEnabled).toBe(true);
      expect(config.clinicalValidationRequired).toBe(true);
    });

    it('should have specialized DTx capabilities', () => {
      expect(config.capabilities).toContain('dtx-analysis');
      expect(config.capabilities).toContain('regulatory-guidance');
      expect(config.capabilities).toContain('evidence-generation');
      expect(config.capabilities).toContain('clinical-validation');
    });

    it('should have appropriate FDA SaMD classification', () => {
      expect(config.fdaSaMDClass).toBe('II');
    });

    it('should have medical-focused system prompt', () => {
      expect(config.systemPrompt).toContain('digital therapeutics');
      expect(config.systemPrompt).toContain('evidence-based');
      expect(config.systemPrompt).toContain('regulatory');
    });
  });

  describe('AI/ML Clinical Specialist', () => {
    const agentType = 'ai-ml-clinical-specialist';
    const config = AGENT_CONFIGS[agentType];

    it('should have high accuracy requirements for clinical AI', () => {
      expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.97);
    });

    it('should have AI/ML specific capabilities', () => {
      expect(config.capabilities).toContain('ml-algorithms');
      expect(config.capabilities).toContain('clinical-ai');
      expect(config.capabilities).toContain('predictive-modeling');
    });

    it('should be classified as high-risk medical device', () => {
      expect(config.fdaSaMDClass).toBe('III');
    });

    it('should require all validation features', () => {
      expect(config.hipaaCompliant).toBe(true);
      expect(config.pharmaEnabled).toBe(true);
      expect(config.verifyEnabled).toBe(true);
    });
  });

  describe('FDA Regulatory Strategist', () => {
    const agentType = 'fda-regulatory-strategist';
    const config = AGENT_CONFIGS[agentType];

    it('should have highest accuracy requirements', () => {
      expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.98);
    });

    it('should have FDA-specific capabilities', () => {
      expect(config.capabilities).toContain('fda-regulations');
      expect(config.capabilities).toContain('regulatory-submissions');
      expect(config.capabilities).toContain('510k-pathway');
    });

    it('should be high-risk classification', () => {
      expect(config.fdaSaMDClass).toBe('III');
    });

    it('should use government/regulatory color theme', () => {
      expect(config.color).toBe('#DC2626'); // Red for regulatory authority
    });
  });

  describe('Medical Safety Officer', () => {
    const agentType = 'medical-safety-officer';
    const config = AGENT_CONFIGS[agentType];

    it('should have the highest accuracy requirements', () => {
      expect(config.accuracyRequirement).toBe(0.99);
    });

    it('should have safety-focused capabilities', () => {
      expect(config.capabilities).toContain('safety-assessment');
      expect(config.capabilities).toContain('risk-management');
      expect(config.capabilities).toContain('adverse-events');
      expect(config.capabilities).toContain('post-market-surveillance');
    });

    it('should be maximum risk classification', () => {
      expect(config.fdaSaMDClass).toBe('III');
    });

    it('should have safety-focused avatar and color', () => {
      expect(config.avatar).toBe('🛡️');
      expect(config.color).toBe('#DC2626');
    });
  });

  describe('Clinical Trial Designer', () => {
    const agentType = 'clinical-trial-designer';
    const config = AGENT_CONFIGS[agentType];

    it('should have clinical research capabilities', () => {
      expect(config.capabilities).toContain('protocol-design');
      expect(config.capabilities).toContain('statistical-planning');
      expect(config.capabilities).toContain('endpoint-selection');
    });

    it('should have appropriate accuracy for clinical research', () => {
      expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.97);
    });

    it('should have research-focused avatar', () => {
      expect(config.avatar).toBe('🔬');
    });
  });

  describe('European Compliance (EMA) Specialist', () => {
    const agentType = 'ema-compliance-specialist';
    const config = AGENT_CONFIGS[agentType];

    it('should have EU-specific capabilities', () => {
      expect(config.capabilities).toContain('ema-regulations');
      expect(config.capabilities).toContain('ce-marking');
      expect(config.capabilities).toContain('mdr-regulations');
    });

    it('should have regulatory accuracy requirements', () => {
      expect(config.accuracyRequirement).toBe(0.98);
    });

    it('should have EU-themed avatar', () => {
      expect(config.avatar).toBe('🇪🇺');
    });
  });
});

describe('Healthcare AI Agents - Cross-Agent Validation', () => {
  describe('Compliance Standards', () => {
    it('should ensure all agents are HIPAA compliant', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.hipaaCompliant).toBe(true);
      });
    });

    it('should have appropriate accuracy thresholds by risk level', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.fdaSaMDClass === 'III') {
          expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.97);
        } else if (config.fdaSaMDClass === 'II') {
          expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.95);
        } else {
          expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.90);
        }
      });
    });

    it('should enable verification for all high-risk agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.fdaSaMDClass === 'III' || config.fdaSaMDClass === 'II') {
          expect(config.verifyEnabled).toBe(true);
        }
      });
    });
  });

  describe('Capability Completeness', () => {
    it('should have unique capability sets per agent', () => {
      const capabilitySets = Object.values(AGENT_CONFIGS).map(config =>
        JSON.stringify(config.capabilities.sort())
      );
      const uniqueCapabilitySets = new Set(capabilitySets);
      expect(uniqueCapabilitySets.size).toBe(Object.keys(AGENT_CONFIGS).length);
    });

    it('should have minimum capability count per agent', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.capabilities.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should use healthcare domain-specific capabilities', () => {
      const allCapabilities = Object.values(AGENT_CONFIGS)
        .flatMap(config => config.capabilities);

      const healthcareKeywords = [
        'clinical', 'medical', 'regulatory', 'fda', 'ema', 'safety',
        'dtx', 'pharma', 'trial', 'compliance', 'device', 'health'
      ];

      const healthcareCapabilities = allCapabilities.filter(capability =>
        healthcareKeywords.some(keyword => capability.includes(keyword))
      );

      expect(healthcareCapabilities.length).toBeGreaterThan(allCapabilities.length * 0.8);
    });
  });

  describe('Visual Identity', () => {
    it('should have unique avatars for each agent', () => {
      const avatars = Object.values(AGENT_CONFIGS).map(config => config.avatar);
      const uniqueAvatars = new Set(avatars);
      expect(uniqueAvatars.size).toBe(avatars.length);
    });

    it('should use medical/healthcare-themed avatars', () => {
      const medicalAvatars = ['💊', '🔬', '🛡️', '📱', '🤖', '🏛️', '🇪🇺'];
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(medicalAvatars).toContain(config.avatar);
      });
    });

    it('should have distinct color schemes', () => {
      const colors = Object.values(AGENT_CONFIGS).map(config => config.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThanOrEqual(5); // Allow some color reuse
    });
  });

  describe('System Prompts', () => {
    it('should have specialized system prompts', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.systemPrompt.length).toBeGreaterThan(50);
        expect(config.systemPrompt).toContain('You are');
        expect(config.systemPrompt).toContain('expert');
      });
    });

    it('should reference domain-specific expertise', () => {
      Object.entries(AGENT_CONFIGS).forEach(([agentType, config]) => {
        const domainKeywords = agentType.split('-');
        const promptLower = config.systemPrompt.toLowerCase();

        // At least one domain keyword should appear in the prompt
        const hasRelevantKeyword = domainKeywords.some(keyword =>
          promptLower.includes(keyword) ||
          promptLower.includes(keyword.replace('-', ' '))
        );

        expect(hasRelevantKeyword).toBe(true);
      });
    });
  });

  describe('Model Selection', () => {
    it('should use appropriate models for healthcare agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.model).toMatch(/gpt-4|gpt-3.5-turbo|claude-3/);
      });
    });

    it('should prefer GPT-4 for high-risk agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.fdaSaMDClass === 'III' || config.accuracyRequirement >= 0.97) {
          expect(config.model).toBe('gpt-4');
        }
      });
    });
  });
});

describe('Healthcare AI Agents - Safety and Ethics', () => {
  describe('Medical Safety Requirements', () => {
    it('should enforce clinical validation for medical agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.medicalSpecialty.includes('Clinical') ||
            config.medicalSpecialty.includes('Medical') ||
            config.capabilities.some(cap => cap.includes('clinical'))) {
          expect(config.verifyEnabled).toBe(true);
        }
      });
    });

    it('should have appropriate risk classifications', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(['I', 'II', 'III']).toContain(config.fdaSaMDClass);
      });
    });

    it('should enable pharma features for drug-related agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.capabilities.some(cap =>
          cap.includes('pharma') ||
          cap.includes('drug') ||
          cap.includes('trial'))) {
          expect(config.pharmaEnabled).toBe(true);
        }
      });
    });
  });

  describe('Regulatory Compliance', () => {
    it('should have higher accuracy for regulatory agents', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.name.includes('Regulatory') ||
            config.name.includes('Compliance') ||
            config.capabilities.some(cap => cap.includes('regulatory'))) {
          expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.95);
        }
      });
    });

    it('should classify safety-critical agents as high-risk', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.name.includes('Safety') ||
            config.capabilities.some(cap => cap.includes('safety'))) {
          expect(config.fdaSaMDClass).toBe('III');
          expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.98);
        }
      });
    });
  });

  describe('Data Privacy and Security', () => {
    it('should ensure all agents are HIPAA compliant', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.hipaaCompliant).toBe(true);
      });
    });

    it('should enable verification for sensitive data handling', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        if (config.capabilities.some(cap =>
          cap.includes('data') ||
          cap.includes('analysis') ||
          cap.includes('clinical'))) {
          expect(config.verifyEnabled).toBe(true);
        }
      });
    });
  });
});

describe('Healthcare AI Agents - Performance Requirements', () => {
  describe('Accuracy Benchmarks', () => {
    it('should meet minimum accuracy thresholds', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        expect(config.accuracyRequirement).toBeGreaterThanOrEqual(0.90);
      });
    });

    it('should have progressive accuracy requirements by risk', () => {
      const classIAgents = Object.values(AGENT_CONFIGS)
        .filter(config => config.fdaSaMDClass === 'I');
      const classIIAgents = Object.values(AGENT_CONFIGS)
        .filter(config => config.fdaSaMDClass === 'II');
      const classIIIAgents = Object.values(AGENT_CONFIGS)
        .filter(config => config.fdaSaMDClass === 'III');

      if (classIAgents.length > 0 && classIIAgents.length > 0) {
        const avgClassI = classIAgents.reduce((sum, config) => sum + config.accuracyRequirement, 0) / classIAgents.length;
        const avgClassII = classIIAgents.reduce((sum, config) => sum + config.accuracyRequirement, 0) / classIIAgents.length;
        expect(avgClassII).toBeGreaterThan(avgClassI);
      }

      if (classIIAgents.length > 0 && classIIIAgents.length > 0) {
        const avgClassII = classIIAgents.reduce((sum, config) => sum + config.accuracyRequirement, 0) / classIIAgents.length;
        const avgClassIII = classIIIAgents.reduce((sum, config) => sum + config.accuracyRequirement, 0) / classIIIAgents.length;
        expect(avgClassIII).toBeGreaterThanOrEqual(avgClassII);
      }
    });
  });

  describe('Capability Validation', () => {
    it('should have measurable capabilities', () => {
      Object.values(AGENT_CONFIGS).forEach(config => {
        config.capabilities.forEach(capability => {
          expect(capability).toMatch(/^[a-z0-9-]+$/);
          expect(capability.length).toBeGreaterThan(3);
        });
      });
    });

    it('should have healthcare-relevant capabilities', () => {
      const healthcareTerms = [
        'clinical', 'medical', 'regulatory', 'compliance', 'safety',
        'therapeutic', 'diagnostic', 'treatment', 'analysis', 'validation',
        'protocol', 'trial', 'research', 'device', 'pharma', 'health'
      ];

      Object.values(AGENT_CONFIGS).forEach(config => {
        const hasHealthcareCapability = config.capabilities.some(capability =>
          healthcareTerms.some(term => capability.includes(term))
        );
        expect(hasHealthcareCapability).toBe(true);
      });
    });
  });
});