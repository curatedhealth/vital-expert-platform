import { supabase } from '@vital/sdk/client';
import type {
  MedicalCapability,
  MedicalCompetency,
  MedicalTool,
  PHARMAProtocol,
  VERIFYProtocol,
  SystemPromptGenerationRequest,
  SystemPromptGenerationResponse
} from '@/types/healthcare-compliance';

/**
 * Dynamic System Prompt Generation Service
 * Generates medical-grade system prompts with PHARMA and VERIFY protocols
 * Following FDA 21 CFR Part 11 compliance requirements
 */
export class PromptGenerationService {
  /**
   * Generate a dynamic system prompt based on capabilities and medical requirements
   */
  async generateSystemPrompt(request: SystemPromptGenerationRequest): Promise<SystemPromptGenerationResponse> {
    try {
      // 1. Fetch selected capabilities with their competencies
      const capabilities = await this.fetchCapabilitiesWithCompetencies(request.selectedCapabilities);

      // 2. Fetch selected competencies
      const selectedCompetencies = await this.fetchSelectedCompetencies(request.competencySelection);

      // 3. Fetch associated tools
      const tools = await this.fetchCapabilityTools(request.selectedCapabilities);

      // 4. Generate prompt content
      const promptContent = this.buildSystemPrompt({
        capabilities,
        competencies: selectedCompetencies,
        tools,
        request
      });

      // 5. Generate metadata
      const metadata = this.generateMetadata(capabilities, selectedCompetencies, tools, request);

      // 6. Create audit entry if required
      if (request.agentId) {
        await this.createAuditEntry(request.agentId, promptContent, metadata);
      }

      return {
        content: promptContent,
        metadata,
        contributions: this.generateContributions(capabilities, selectedCompetencies, tools),
        version: 1,
        validationRequired: this.requiresValidation(capabilities, selectedCompetencies)
      };

    } catch (error) {
      console.error('Failed to generate system prompt:', error);
      throw new Error('System prompt generation failed');
    }
  }

  /**
   * Fetch capabilities with their competencies from database
   */
  private async fetchCapabilitiesWithCompetencies(capabilityIds: string[]): Promise<MedicalCapability[]> {
    if (capabilityIds.length === 0) return [];

    const { data, error } = await supabase
      .from('capabilities')
      .select(`
        *,
        competencies:competencies(*)
      `)
      .in('id', capabilityIds)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch selected competencies from database
   */
  private async fetchSelectedCompetencies(competencySelection: Record<string, string[]>): Promise<MedicalCompetency[]> {
    const allCompetencyIds = Object.values(competencySelection).flat();
    if (allCompetencyIds.length === 0) return [];

    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .in('id', allCompetencyIds);

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch tools associated with capabilities
   */
  private async fetchCapabilityTools(capabilityIds: string[]): Promise<MedicalTool[]> {
    if (capabilityIds.length === 0) return [];

    const { data, error } = await supabase
      .from('capability_tools')
      .select(`
        tools:tools(*)
      `)
      .in('capability_id', capabilityIds)
      .eq('tools.is_active', true);

    if (error) throw error;
    return data?.map(ct => ct.tools).filter(Boolean).flat() as MedicalTool[] || [];
  }

  /**
   * Build the complete system prompt with medical compliance
   */
  private buildSystemPrompt({
    capabilities,
    competencies,
    tools,
    request
  }: {
    capabilities: MedicalCapability[];
    competencies: MedicalCompetency[];
    tools: MedicalTool[];
    request: SystemPromptGenerationRequest;
  }): string {
    const sections: string[] = [];

    // 1. Base Role Definition
    sections.push(this.generateRoleSection(request));

    // 2. PHARMA Protocol Integration
    if (request.pharmaProtocolRequired) {
      sections.push(this.generatePHARMASection(capabilities));
    }

    // 3. VERIFY Protocol Integration
    if (request.verifyProtocolRequired) {
      sections.push(this.generateVERIFYSection(capabilities));
    }

    // 4. Medical Capabilities Section
    if (capabilities.length > 0) {
      sections.push(this.generateCapabilitiesSection(capabilities));
    }

    // 5. Competencies Section
    if (competencies.length > 0) {
      sections.push(this.generateCompetenciesSection(competencies));
    }

    // 6. Tools and Resources Section
    if (tools.length > 0 && request.includeTools) {
      sections.push(this.generateToolsSection(tools));
    }

    // 7. Medical Compliance Requirements
    sections.push(this.generateComplianceSection(request));

    // 8. Medical Disclaimers
    sections.push(this.generateDisclaimersSection());

    return sections.join('\n\n');
  }

  /**
   * Generate role definition section
   */
  private generateRoleSection(request: SystemPromptGenerationRequest): string {
    const context = request.medicalContext;

    return `# Medical AI Assistant - ${context.role}

You are a specialized medical AI assistant for ${context.businessFunction.name} in ${context.businessFunction.department}.
Your expertise covers ${context.medicalSpecialty} with a focus on ${context.businessFunction.healthcare_category}.

## Core Responsibilities:
- Provide evidence-based medical guidance with >95% accuracy
- Ensure all medical claims are properly cited with peer-reviewed sources
- Maintain strict adherence to regulatory requirements: ${context.complianceRequirements.join(', ')}
- Apply clinical reasoning appropriate for ${context.role} level decisions`;
  }

  /**
   * Generate PHARMA protocol section
   */
  private generatePHARMASection(capabilities: MedicalCapability[]): string {
    const pharmaCapabilities = capabilities.filter(cap => cap.pharma_protocol);

    if (pharmaCapabilities.length === 0) {
      return `# PHARMA Protocol Framework

Apply the PHARMA framework to all medical responses:
- **Purpose**: Align responses with medical objectives and patient outcomes
- **Hypothesis**: Generate evidence-based hypotheses for clinical questions
- **Audience**: Format responses appropriately for healthcare professionals
- **Requirements**: Ensure compliance with applicable medical regulations
- **Metrics**: Maintain medical accuracy >95% with proper evidence grading
- **Actions**: Provide actionable medical insights with clear next steps`;
    }

    return `# PHARMA Protocol Framework

${pharmaCapabilities.map(cap => {
  const protocol = cap.pharma_protocol as PHARMAProtocol;
  return `## ${cap.display_name} PHARMA Protocol:
- **Purpose**: ${protocol.purpose}
- **Hypothesis**: ${protocol.hypothesis}
- **Audience**: ${protocol.audience}
- **Requirements**: ${protocol.requirements}
- **Metrics**: ${protocol.metrics}
- **Actions**: ${protocol.actions}`;
}).join('\n\n')}`;
  }

  /**
   * Generate VERIFY protocol section
   */
  private generateVERIFYSection(capabilities: MedicalCapability[]): string {
    const verifyCapabilities = capabilities.filter(cap => cap.verify_protocol);

    if (verifyCapabilities.length === 0) {
      return `# VERIFY Protocol Framework

Apply the VERIFY framework for all medical fact-checking:
- **Validate**: Cross-reference all medical claims with authoritative sources
- **Evidence**: Require evidence from peer-reviewed sources (Impact Factor >3.0)
- **Request**: When uncertain, request additional clinical context
- **Identify**: Clearly identify limitations and areas requiring expert review
- **Fact-check**: Verify all medical statistics and clinical data
- **Yield**: Provide confidence scores for medical recommendations`;
    }

    return `# VERIFY Protocol Framework

${verifyCapabilities.map(cap => {
  const protocol = cap.verify_protocol as VERIFYProtocol;
  return `## ${cap.display_name} VERIFY Protocol:
- **Minimum Impact Factor**: ${protocol.min_impact_factor}
- **Required Guidelines**: ${protocol.guidelines.join(', ')}
- **Expert Review Threshold**: ${protocol.expert_threshold}
- **Citation Format**: ${protocol.citation_format}
- **Evidence Requirements**: ${protocol.evidence_requirements}`;
}).join('\n\n')}`;
  }

  /**
   * Generate capabilities section
   */
  private generateCapabilitiesSection(capabilities: MedicalCapability[]): string {
    return `# Medical Capabilities

You have been configured with the following medical capabilities:

${capabilities.map(cap => `## ${cap.display_name}
**Domain**: ${cap.medical_domain}
**Description**: ${cap.description}
**Accuracy Requirement**: ${(cap.accuracy_threshold * 100).toFixed(0)}%
**Citation Required**: ${cap.citation_required ? 'Yes' : 'No'}
**FDA Classification**: ${cap.fda_classification || 'Not specified'}
**Validation Status**: ${cap.clinical_validation_status}

${cap.system_prompt_template || ''}
`).join('\n')}`;
  }

  /**
   * Generate competencies section
   */
  private generateCompetenciesSection(competencies: MedicalCompetency[]): string {
    return `# Specialized Competencies

Apply these specialized competencies when relevant:

${competencies.map(comp => `## ${comp.name}
**Description**: ${comp.description}
**Accuracy Requirement**: ${(comp.medical_accuracy_requirement * 100).toFixed(0)}%
**Evidence Level**: ${comp.evidence_level}
**Guidelines**: ${comp.clinical_guidelines_reference?.join(', ') || 'Standard medical guidelines'}

### Implementation Guide:
${comp.prompt_snippet}
`).join('\n')}`;
  }

  /**
   * Generate tools section
   */
  private generateToolsSection(tools: MedicalTool[]): string {
    return `# Available Medical Tools

You have access to the following medical tools and databases:

${tools.map((tool: any) => `## ${tool.name}
**Type**: ${tool.tool_type}
**Database**: ${tool.medical_database}
**HIPAA Compliant**: ${tool.hipaa_compliant ? 'Yes' : 'No'}
**Data Classification**: ${tool.data_classification}
`).join('\n')}

Always use appropriate tools for medical fact-checking and clinical data verification.`;
  }

  /**
   * Generate compliance requirements section
   */
  private generateComplianceSection(request: SystemPromptGenerationRequest): string {
    const context = request.medicalContext;

    return `# Medical Compliance Requirements

## Regulatory Compliance:
${context.complianceRequirements.map(req => `- ${req}`).join('\n')}

## Accuracy Standards:
- Medical accuracy threshold: ${(context.accuracyThreshold * 100).toFixed(0)}%
- All medical claims must be cited with authoritative sources
- Confidence scores required for clinical recommendations

## HIPAA Compliance:
${context.hipaaRequired ? '- This agent handles PHI - ensure all interactions comply with HIPAA requirements' : '- This agent does not handle PHI'}

## FDA Regulation:
${context.fdaRegulated ? '- This agent falls under FDA oversight - maintain audit trails for all medical decisions' : '- This agent is not subject to FDA regulation'}`;
  }

  /**
   * Generate medical disclaimers section
   */
  private generateDisclaimersSection(): string {
    return `# Medical Disclaimers and Limitations

## Important Medical Disclaimers:
- This AI assistant provides medical information for professional use only
- All recommendations should be verified by qualified healthcare professionals
- Clinical decisions should always consider patient-specific factors
- This system is not a substitute for professional medical judgment
- Emergency situations require immediate human medical intervention

## Limitations:
- AI-generated content may contain errors requiring expert validation
- Clinical guidelines and regulations are subject to frequent updates
- Patient safety always takes precedence over AI recommendations
- Consult latest medical literature for most current evidence

## Audit Trail:
All interactions are logged for quality assurance and regulatory compliance.`;
  }

  /**
   * Generate metadata for the prompt
   */
  private generateMetadata(
    capabilities: MedicalCapability[],
    competencies: MedicalCompetency[],
    tools: MedicalTool[],
    request: SystemPromptGenerationRequest
  ) {
    const disclaimers = [
      'For professional medical use only',
      'Requires expert validation for clinical decisions',
      'Not a substitute for professional medical judgment'
    ];

    if (request.medicalContext.hipaaRequired) {
      disclaimers.push('HIPAA-compliant handling required');
    }

    if (request.medicalContext.fdaRegulated) {
      disclaimers.push('Subject to FDA oversight and audit requirements');
    }

    return {
      tokenCount: this.estimateTokenCount(capabilities, competencies, tools),
      capabilities,
      competencies,
      tools,
      pharmaProtocolIncluded: request.pharmaProtocolRequired,
      verifyProtocolIncluded: request.verifyProtocolRequired,
      medicalDisclaimers: disclaimers,
      complianceLevel: this.calculateComplianceLevel(request.medicalContext)
    };
  }

  /**
   * Generate contribution tracking
   */
  private generateContributions(
    capabilities: MedicalCapability[],
    competencies: MedicalCompetency[],
    tools: MedicalTool[]
  ) {
    return {
      capabilities: capabilities.reduce((acc, cap) => {
        acc[cap.id] = {
          name: cap.display_name,
          domain: cap.medical_domain,
          accuracy_threshold: cap.accuracy_threshold,
          system_prompt_contribution: cap.system_prompt_template?.length || 0
        };
        return acc;
      }, { /* TODO: implement */ } as Record<string, unknown>),
      competencies: competencies.reduce((acc, comp) => {
        acc[comp.id] = {
          name: comp.name,
          capability_id: comp.capability_id,
          prompt_snippet_length: comp.prompt_snippet?.length || 0,
          accuracy_requirement: comp.medical_accuracy_requirement
        };
        return acc;
      }, { /* TODO: implement */ } as Record<string, unknown>),
      tools: tools.reduce((acc, tool) => {
        acc[tool.id] = {
          name: tool.name,
          type: tool.tool_type,
          database: tool.medical_database,
          hipaa_compliant: tool.hipaa_compliant
        };
        return acc;
      }, { /* TODO: implement */ } as Record<string, unknown>)
    };
  }

  /**
   * Estimate token count for the generated prompt
   */
  private estimateTokenCount(
    capabilities: MedicalCapability[],
    competencies: MedicalCompetency[],
    tools: MedicalTool[]
  ): number {
    // Rough estimation: 4 characters per token
    const basePromptLength = 2000; // Base sections
    const capabilityLength = capabilities.reduce((sum, cap) =>
      sum + (cap.system_prompt_template?.length || 0) + cap.description.length + 200, 0);
    const competencyLength = competencies.reduce((sum, comp) =>
      sum + (comp.prompt_snippet?.length || 0) + comp.description.length + 100, 0);
    const toolLength = tools.length * 150; // Average tool description

    return Math.ceil((basePromptLength + capabilityLength + competencyLength + toolLength) / 4);
  }

  /**
   * Determine if validation is required
   */
  private requiresValidation(capabilities: MedicalCapability[], competencies: MedicalCompetency[]): boolean {
    // Require validation if any capability or competency requires medical review
    return capabilities.some(cap => cap.clinical_validation_status === 'pending') ||
           competencies.some(comp => comp.requires_medical_review);
  }

  /**
   * Calculate compliance level
   */
  private calculateComplianceLevel(context: unknown): string {
    let score = 0;

    if (context.hipaaRequired) score += 3;
    if (context.fdaRegulated) score += 3;
    if (context.accuracyThreshold >= 0.95) score += 2;
    if (context.complianceRequirements.length > 2) score += 2;

    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Standard';
  }

  /**
   * Create audit entry for FDA 21 CFR Part 11 compliance
   */
  private async createAuditEntry(
    agentId: string,
    promptContent: string,
    metadata: unknown
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_prompts')
        .insert({
          agent_id: agentId,
          generated_prompt: promptContent,
          capability_contributions: metadata.capabilities,
          tool_configurations: metadata.tools,
          pharma_protocol_included: metadata.pharmaProtocolIncluded,
          verify_protocol_included: metadata.verifyProtocolIncluded,
          medical_disclaimers: metadata.medicalDisclaimers,
          version: 1,
          clinical_validation_status: metadata.validationRequired ? 'pending' : 'auto_validated',
          is_active: true,
          generated_at: new Date().toISOString(),
          audit_log: {
            generation_timestamp: new Date().toISOString(),
            compliance_level: metadata.complianceLevel,
            token_count: metadata.tokenCount,
            medical_capabilities_count: Object.keys(metadata.capabilities).length,
            competencies_count: Object.keys(metadata.competencies).length,
            tools_count: Object.keys(metadata.tools).length
          }
        });

      if (error) {
        console.error('Failed to create audit entry:', error);
        // Don't throw error as this shouldn't block prompt generation
      }
    } catch (error) {
      console.error('Audit entry creation failed:', error);
    }
  }
}

// Export singleton instance
const _promptGenerationService = new PromptGenerationService();
export const promptGenerationService = _promptGenerationService;