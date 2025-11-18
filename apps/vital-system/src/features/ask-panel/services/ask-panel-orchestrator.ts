/**
 * Ask Panel Orchestrator - Adaptive Multi-Expert System
 * 
 * NOW USES SHARED MULTI-FRAMEWORK ORCHESTRATOR
 * 
 * Intelligently switches between LangGraph and AutoGen based on panel configuration.
 * AutoGen is NOT tightly coupled - it's a shared resource used via the orchestrator.
 * 
 * Use Cases:
 * - LangGraph: Sequential consultation, user-guided, single expert focus
 * - AutoGen: Panel debate, autonomous discussion, consensus building (via CuratedHealth fork)
 * - CrewAI: Task-based delegation (optional)
 */

import type { Message } from '@/types/chat';
import { executePanel, ExecutionMode } from '@/lib/orchestration/multi-framework-orchestrator';

export enum PanelMode {
  Sequential = 'sequential',      // One expert at a time (LangGraph)
  Collaborative = 'collaborative', // Experts discuss together (AutoGen)
  Hybrid = 'hybrid',              // Start sequential, switch to collaborative if needed
}

export enum ExpertType {
  CEO = 'ceo',
  CFO = 'cfo',
  CMO = 'cmo',
  CTO = 'cto',
  COO = 'coo',
  ChiefNurse = 'chief_nurse',
  Compliance = 'compliance',
  Legal = 'legal',
}

export interface PanelConfig {
  mode: PanelMode;
  experts: ExpertType[];
  maxRounds?: number;
  allowDebate?: boolean;
  requireConsensus?: boolean;
  userGuidance?: 'high' | 'medium' | 'low'; // How much user controls conversation
}

export interface PanelResponse {
  framework: 'langgraph' | 'autogen';
  experts: Array<{
    type: ExpertType;
    response: string;
    confidence: number;
  }>;
  consensus?: {
    reached: boolean;
    finalRecommendation?: string;
    dissenting?: string[];
  };
  conversationLog?: Message[];
}

// Expert Templates
export const EXPERT_TEMPLATES: Record<ExpertType, {
  role: string;
  goal: string;
  backstory: string;
  systemPrompt: string;
  expertise: string[];
}> = {
  [ExpertType.CEO]: {
    role: 'Healthcare CEO',
    goal: 'Provide strategic business guidance for healthcare organizations',
    backstory: 'Former Fortune 500 healthcare CEO with 25 years of experience leading hospital systems and health plans. Expert in M&A, market expansion, and organizational transformation.',
    systemPrompt: 'You are a seasoned Healthcare CEO. Focus on strategic vision, market positioning, stakeholder management, and long-term organizational sustainability. Consider financial impact, competitive dynamics, and strategic alignment.',
    expertise: ['Strategy', 'M&A', 'Market Expansion', 'Board Relations', 'Stakeholder Management']
  },
  
  [ExpertType.CFO]: {
    role: 'Healthcare CFO',
    goal: 'Provide financial analysis and fiscal guidance',
    backstory: 'Healthcare CFO with expertise in hospital finance, value-based care models, and healthcare economics. Deep experience in budgeting, capital allocation, and financial risk management.',
    systemPrompt: 'You are a Healthcare CFO. Focus on financial viability, ROI analysis, budget impact, cost-benefit analysis, and financial risk. Provide specific numbers and financial projections when possible.',
    expertise: ['Financial Analysis', 'ROI Modeling', 'Budget Management', 'Capital Allocation', 'Risk Management']
  },
  
  [ExpertType.CMO]: {
    role: 'Chief Medical Officer',
    goal: 'Provide clinical and quality of care guidance',
    backstory: 'Practicing physician and CMO with 20 years in academic medicine and health system leadership. Expert in clinical quality, patient safety, and evidence-based medicine.',
    systemPrompt: 'You are a Chief Medical Officer. Focus on clinical quality, patient safety, evidence-based practice, physician engagement, and care delivery models. Always prioritize patient outcomes and clinical excellence.',
    expertise: ['Clinical Quality', 'Patient Safety', 'Care Delivery', 'Physician Leadership', 'Clinical Outcomes']
  },
  
  [ExpertType.CTO]: {
    role: 'Healthcare CTO',
    goal: 'Provide technology and digital transformation guidance',
    backstory: 'Healthcare CTO with expertise in EHR systems, health IT infrastructure, and digital health innovation. Led multiple successful digital transformation initiatives.',
    systemPrompt: 'You are a Healthcare CTO. Focus on technology architecture, interoperability, data security, digital innovation, and IT infrastructure. Consider technical feasibility, integration challenges, and cybersecurity.',
    expertise: ['Health IT', 'EHR Systems', 'Interoperability', 'Cybersecurity', 'Digital Innovation']
  },
  
  [ExpertType.COO]: {
    role: 'Chief Operating Officer',
    goal: 'Provide operational excellence and process improvement guidance',
    backstory: 'Healthcare COO with expertise in hospital operations, supply chain management, and operational efficiency. Track record of improving margins through operational excellence.',
    systemPrompt: 'You are a Healthcare COO. Focus on operational efficiency, process improvement, supply chain optimization, staff productivity, and service delivery. Provide practical implementation guidance.',
    expertise: ['Operations', 'Process Improvement', 'Supply Chain', 'Workforce Management', 'Efficiency']
  },
  
  [ExpertType.ChiefNurse]: {
    role: 'Chief Nursing Officer',
    goal: 'Provide nursing leadership and care delivery guidance',
    backstory: 'Chief Nursing Officer with 30 years of clinical nursing experience and healthcare leadership. Expert in nursing practice, care team dynamics, and patient experience.',
    systemPrompt: 'You are a Chief Nursing Officer. Focus on nursing practice standards, care team coordination, patient experience, nurse engagement, and frontline care delivery. Advocate for both patients and nursing staff.',
    expertise: ['Nursing Practice', 'Care Coordination', 'Patient Experience', 'Staff Development', 'Clinical Excellence']
  },
  
  [ExpertType.Compliance]: {
    role: 'Chief Compliance Officer',
    goal: 'Provide regulatory compliance and risk management guidance',
    backstory: 'Healthcare compliance expert with deep knowledge of HIPAA, CMS regulations, and healthcare fraud prevention. Former federal healthcare regulator.',
    systemPrompt: 'You are a Chief Compliance Officer. Focus on regulatory compliance, legal risk, HIPAA requirements, fraud prevention, and audit readiness. Flag potential compliance issues and regulatory concerns.',
    expertise: ['Regulatory Compliance', 'HIPAA', 'Fraud Prevention', 'Risk Management', 'Audit Readiness']
  },
  
  [ExpertType.Legal]: {
    role: 'Healthcare Legal Counsel',
    goal: 'Provide legal and risk mitigation guidance',
    backstory: 'Healthcare attorney specializing in hospital law, medical malpractice, contracts, and healthcare transactions. 20 years of experience in healthcare legal matters.',
    systemPrompt: 'You are Healthcare Legal Counsel. Focus on legal risk, contract implications, liability concerns, regulatory compliance, and litigation risk. Provide cautious, legally sound recommendations.',
    expertise: ['Healthcare Law', 'Contracts', 'Liability', 'Medical Malpractice', 'Regulatory Affairs']
  },
};

/**
 * Intelligent Panel Orchestrator
 * Chooses framework based on configuration
 */
export class AskPanelOrchestrator {
  /**
   * Determine optimal framework for panel configuration
   */
  private selectFramework(config: PanelConfig): 'langgraph' | 'autogen' {
    // AutoGen is better for:
    // - Collaborative mode
    // - Multiple rounds of debate
    // - Low user guidance
    // - Consensus building
    if (
      config.mode === PanelMode.Collaborative ||
      (config.allowDebate && config.experts.length >= 3) ||
      config.userGuidance === 'low' ||
      config.requireConsensus
    ) {
      return 'autogen';
    }
    
    // LangGraph is better for:
    // - Sequential consultation
    // - User-guided conversation
    // - Single expert focus
    // - State management needs
    return 'langgraph';
  }
  
  /**
   * Execute panel consultation
   */
  async consultPanel(
    question: string,
    config: PanelConfig,
    context?: {
      conversationHistory?: Message[];
      organizationProfile?: any;
    }
  ): Promise<PanelResponse> {
    const framework = this.selectFramework(config);
    
    console.log(`🎯 [Panel] Using ${framework.toUpperCase()} for panel consultation`);
    console.log(`📋 [Panel] Experts: ${config.experts.join(', ')}`);
    console.log(`⚙️ [Panel] Mode: ${config.mode}`);
    
    // Build agent definitions from expert templates
    const agents = config.experts.map(expertType => {
      const expert = EXPERT_TEMPLATES[expertType];
      return {
        id: expertType,
        role: expert.role,
        goal: expert.goal,
        backstory: expert.backstory,
        systemPrompt: expert.systemPrompt,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000,
        tools: [],
        allowDelegation: config.allowDebate || false,
      };
    });
    
    // Determine execution mode
    const mode: ExecutionMode = 
      config.mode === PanelMode.Sequential ? 'sequential' :
      config.mode === PanelMode.Collaborative ? 'conversational' :
      'conversational'; // Default to conversational for hybrid
    
    try {
      // Use shared orchestrator
      const result = await executePanel(agents, question, {
        mode,
        maxRounds: config.maxRounds || 10,
        requireConsensus: config.requireConsensus,
        streaming: false,
        source: 'ask-panel',
      });
      
      // Transform result to PanelResponse format
      const experts: PanelResponse['experts'] = agents.map((agent, index) => {
        const agentResponse = result.outputs.messages?.[index];
        return {
          type: agent.id as ExpertType,
          response: agentResponse?.content || '',
          confidence: result.outputs.confidence || 0.85,
        };
      });
      
      const consensus: PanelResponse['consensus'] | undefined = config.requireConsensus ? {
        reached: result.outputs.consensusReached || false,
        finalRecommendation: result.outputs.recommendation,
        dissenting: result.outputs.dissenting || [],
      } : undefined;
      
      return {
        framework: result.framework as 'langgraph' | 'autogen',
        experts,
        consensus,
        conversationLog: result.outputs.messages as Message[],
      };
      
    } catch (error) {
      console.error('❌ [Panel] Execution failed:', error);
      throw new Error(`Panel consultation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const askPanelOrchestrator = new AskPanelOrchestrator();

