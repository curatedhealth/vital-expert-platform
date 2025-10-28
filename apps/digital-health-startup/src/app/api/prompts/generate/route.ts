import { NextRequest, NextResponse } from 'next/server';

import { promptGenerationService } from '@/lib/services/prompt-generation-service';
import type { SystemPromptGenerationRequest } from '@/types/healthcare-compliance';

/**
 * Dynamic System Prompt Generation API
 * Generates medical-grade system prompts with PHARMA/VERIFY protocols
 * Following FDA 21 CFR Part 11 audit requirements
 */

// POST /api/prompts/generate - Generate dynamic system prompt
export async function POST(request: NextRequest) {
  try {
    const body: SystemPromptGenerationRequest = await request.json();
    // Validate required fields
    const missingFields: string[] = [];
    if (!body.selectedCapabilities) missingFields.push('selectedCapabilities');
    if (!body.medicalContext) missingFields.push('medicalContext');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }

    // Validate capabilities array
    if (!Array.isArray(body.selectedCapabilities) || body.selectedCapabilities.length === 0) {
      return NextResponse.json(
        { error: 'At least one capability must be selected' },
        { status: 400 }
      );
    }

    // Validate medical context
    if (!body.medicalContext.businessFunction || !body.medicalContext.role) {
      return NextResponse.json(
        { error: 'Medical context must include businessFunction and role' },
        { status: 400 }
      );
    }

    // Log prompt generation request
    // TODO: Implement proper logging with authentication
    // const agentCapabilities = (body as any).capabilities || [];
    // await supabase.from('usage_analytics').insert({
    //   organization_id: userProfile.organization_id,
    //   user_id: user.user.id,
    //   event_type: 'prompt_generation_requested',
    //   resource_type: 'prompt_generation',
    //   metrics: {
    //     businessFunction: body.medicalContext.businessFunction,
    //     role: body.medicalContext.role,
    //     capabilitiesCount: agentCapabilities.length,
    //     medicalSpecialty: body.medicalContext.medicalSpecialty,
    //     pharmaEnabled: body.pharmaProtocolRequired,
    //     verifyEnabled: body.verifyProtocolRequired
    //   }
    // });

    // Generate the system prompt
    const startTime = Date.now();
    const response = await promptGenerationService.generateSystemPrompt(body);
    const generationTime = Date.now() - startTime;
    // Add generation metrics to response
    const enrichedResponse = {
      ...response,
      metrics: {
        generationTimeMs: generationTime,
        capabilitiesProcessed: body.selectedCapabilities.length,
        competenciesProcessed: Object.values(body.competencySelection || { /* TODO: implement */ }).flat().length,
        protocolsIncluded: [
          ...(body.pharmaProtocolRequired ? ['PHARMA'] : []),
          ...(body.verifyProtocolRequired ? ['VERIFY'] : [])
        ],
        complianceLevel: response.metadata.complianceLevel,
        estimatedAccuracy: calculateEstimatedAccuracy(response.metadata.capabilities),
        auditTrailCreated: !!body.agentId
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(enrichedResponse, { status: 200 });

  } catch (error) {
    console.error('❌ API error in prompt generation:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Resource not found', details: error.message },
          { status: 404 }
        );
      }

      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate system prompt',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET /api/prompts/generate - Get prompt generation templates and examples
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeExamples = searchParams.get('includeExamples') === 'true';
    const specialty = searchParams.get('specialty');
    const templates = {
      pharmaProtocolTemplate: {
        purpose: "Define the medical/clinical purpose and patient outcomes focus",
        hypothesis: "Generate evidence-based hypotheses for clinical questions",
        audience: "Format responses for healthcare professionals (clinicians/regulators)",
        requirements: "Ensure compliance with applicable medical regulations",
        metrics: "Maintain medical accuracy >95% with proper evidence grading",
        actions: "Provide actionable medical insights with clear next steps"
      },
      verifyProtocolTemplate: {
        validate: "Cross-reference all medical claims with authoritative sources",
        evidence: "Require evidence from peer-reviewed sources (Impact Factor >3.0)",
        request: "When uncertain, request additional clinical context",
        identify: "Clearly identify limitations and areas requiring expert review",
        factCheck: "Verify all medical statistics and clinical data",
        yield: "Provide confidence scores for medical recommendations"
      },
      medicalDisclaimers: [
        "This AI assistant provides medical information for professional use only",
        "All recommendations should be verified by qualified healthcare professionals",
        "Clinical decisions should always consider patient-specific factors",
        "This system is not a substitute for professional medical judgment",
        "Emergency situations require immediate human medical intervention"
      ],
      complianceRequirements: {
        hipaa: "HIPAA-compliant handling required for PHI data",
        fda21cfr11: "FDA 21 CFR Part 11 audit trails for all medical decisions",
        accuracyThreshold: "Minimum 95% medical accuracy requirement",
        citationRequired: "All medical claims must include peer-reviewed citations",
        expertReview: "Clinical validation required for patient-facing recommendations"
      }
    };

    let examples: unknown = null;
    if (includeExamples) {
      examples = await getPromptExamples(specialty);
    }

    return NextResponse.json({
      templates,
      examples,
      supportedSpecialties: [
        'Regulatory Affairs',
        'Clinical Research',
        'Medical Writing',
        'Pharmacovigilance',
        'Medical Affairs',
        'Quality Assurance',
        'Biostatistics',
        'Health Economics'
      ],
      defaultSettings: {
        pharmaProtocolRequired: true,
        verifyProtocolRequired: true,
        includeTools: true,
        includeConstraints: true,
        accuracyThreshold: 0.95,
        citationRequired: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in prompt templates GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt templates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate estimated accuracy based on capabilities
 */
function calculateEstimatedAccuracy(capabilities: any[]): number {
  if (capabilities.length === 0) return 0.95; // Default

  const accuracySum = capabilities.reduce((sum, cap) => sum + (cap.accuracy_threshold || 0.95), 0);
  const averageAccuracy = accuracySum / capabilities.length;

  // Round to 2 decimal places
  return Math.round(averageAccuracy * 100) / 100;
}

/**
 * Get example prompts for different specialties
 */
async function getPromptExamples(specialty?: string | null) {
  const examples = {
    'Regulatory Affairs': {
      basicPrompt: "You are an FDA regulatory expert specializing in medical device submissions. Apply PHARMA and VERIFY protocols to all responses.",
      withCapabilities: "You are an FDA regulatory expert with capabilities in 510(k) analysis, De Novo pathways, and clinical evaluation. Apply PHARMA protocol for strategic guidance and VERIFY protocol for regulatory citations.",
      fullMedical: "# Medical AI Assistant - Regulatory Manager\n\nYou are a specialized medical AI assistant for Regulatory Affairs in Clinical Affairs department.\nYour expertise covers Medical Device Regulation with a focus on Compliance.\n\n## PHARMA Protocol Framework\n### 510(k) Analysis PHARMA Protocol:\n- **Purpose**: Guide 510(k) submission strategy and substantial equivalence determination\n- **Actions**: Actionable submission timeline with regulatory milestones"
    },
    'Clinical Research': {
      basicPrompt: "You are a clinical research expert specializing in trial design and GCP compliance. Apply evidence-based methodology with >95% accuracy.",
      withCapabilities: "You are a clinical research expert with capabilities in protocol development, biostatistics, and regulatory strategy. Apply PHARMA protocol for study design and VERIFY protocol for clinical evidence.",
      fullMedical: "# Medical AI Assistant - Clinical Research Associate\n\nYou are a specialized medical AI assistant for Clinical Development in Clinical Affairs department.\nYour expertise covers Clinical Research with a focus on Research.\n\n## VERIFY Protocol Framework\n- **Evidence**: Require evidence from peer-reviewed sources (Impact Factor >4.0)\n- **Guidelines**: ICH E6, FDA Guidance for Clinical Trials, CONSORT"
    }
  };

  if (specialty && (examples as any)[specialty]) {
    // eslint-disable-next-line security/detect-object-injection
    return (examples as any)[specialty];
  }

  return specialty ? null : examples;
}