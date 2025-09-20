/**
 * Digital Health Agent Base Class
 * Core implementation for all digital health AI agents
 */

import {
  DigitalHealthAgentConfig,
  Capability,
  PromptTemplate,
  AgentResponse,
  ExecutionContext,
  AuditLogEntry,
  ComplianceLevel,
  AgentError,
  CapabilityError,
  PromptError
} from '@/types/digital-health-agent.types';
import { DatabaseLibraryLoader } from '@/lib/utils/database-library-loader';

export class DigitalHealthAgent {
  protected config: DigitalHealthAgentConfig;
  protected capabilities: Map<string, Capability> = new Map();
  protected prompts: Map<string, PromptTemplate> = new Map();
  protected conversationHistory: Array<{
    input: Record<string, any>;
    output: AgentResponse;
    timestamp: string;
  }> = [];
  protected auditLog: AuditLogEntry[] = [];
  protected libraryLoader: DatabaseLibraryLoader;

  constructor(config: DigitalHealthAgentConfig) {
    this.config = config;
    this.libraryLoader = new DatabaseLibraryLoader();
  }

  /**
   * Initialize the agent by loading capabilities and prompts
   */
  async initialize(): Promise<void> {
    try {
      await this.loadCapabilities();
      await this.loadPrompts();
      console.log(`✅ Agent ${this.config.display_name} initialized successfully`);
      console.log(`   - Loaded ${this.capabilities.size} capabilities`);
      console.log(`   - Loaded ${this.prompts.size} prompts`);
    } catch (error) {
      console.error(`❌ Failed to initialize agent ${this.config.name}:`, error);
      throw new AgentError(
        `Failed to initialize agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.name,
        'INITIALIZATION_FAILED'
      );
    }
  }

  /**
   * Load capabilities from the capabilities library
   */
  private async loadCapabilities(): Promise<void> {
    const loadPromises = this.config.capabilities_list.map(async (capabilityTitle) => {
      try {
        const capability = await this.libraryLoader.loadCapability(capabilityTitle);
        if (capability) {
          this.capabilities.set(capabilityTitle, capability);
          console.log(`   ✓ Loaded capability: ${capabilityTitle}`);
        } else {
          console.warn(`   ⚠️  Could not load capability: ${capabilityTitle}`);
        }
      } catch (error) {
        console.error(`   ❌ Error loading capability ${capabilityTitle}:`, error);
        throw new CapabilityError(
          `Failed to load capability: ${capabilityTitle}`,
          capabilityTitle,
          'CAPABILITY_LOAD_FAILED'
        );
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Load prompts from the prompts library
   */
  private async loadPrompts(): Promise<void> {
    const loadPromises = this.config.prompt_starters.map(async (promptTitle) => {
      try {
        const prompt = await this.libraryLoader.loadPrompt(promptTitle);
        if (prompt) {
          this.prompts.set(promptTitle, prompt);
          console.log(`   ✓ Loaded prompt: ${promptTitle}`);
        } else {
          console.warn(`   ⚠️  Could not load prompt: ${promptTitle}`);
        }
      } catch (error) {
        console.error(`   ❌ Error loading prompt ${promptTitle}:`, error);
        throw new PromptError(
          `Failed to load prompt: ${promptTitle}`,
          promptTitle,
          'PROMPT_LOAD_FAILED'
        );
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Execute a prompt with given inputs
   */
  async executePrompt(
    promptTitle: string,
    userInputs: Record<string, any>,
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Validate prompt exists
      const prompt = this.prompts.get(promptTitle);
      if (!prompt) {
        throw new PromptError(
          `Prompt '${promptTitle}' not found in agent ${this.config.name}`,
          promptTitle,
          'PROMPT_NOT_FOUND'
        );
      }

      // Check required capabilities
      for (const requiredCapability of prompt.required_capabilities) {
        const capabilityExists = Array.from(this.capabilities.values()).some(
          cap => cap.capability_id === requiredCapability
        );
        if (!capabilityExists) {
          throw new CapabilityError(
            `Required capability '${requiredCapability}' not loaded for prompt '${promptTitle}'`,
            requiredCapability,
            'REQUIRED_CAPABILITY_MISSING'
          );
        }
      }

      // Log execution for HIPAA compliance
      if (context) {
        this.logExecution(promptTitle, userInputs, context);
      }

      // Validate inputs
      this.validateInputs(prompt, userInputs);

      // Prepare the prompt
      const preparedPrompt = this.preparePrompt(prompt, userInputs);

      // Execute with the AI model
      const response = await this.callAIModel(preparedPrompt);

      // Validate response
      const validatedResponse = this.validateResponse(response, prompt);

      const executionTime = Date.now() - startTime;

      const agentResponse: AgentResponse = {
        success: true,
        content: validatedResponse.content,
        data: validatedResponse.data,
        execution_time: executionTime,
        validation_status: "passed",
        validation_details: "Response meets success criteria"
      };

      // Store in conversation history
      this.conversationHistory.push({
        input: userInputs,
        output: agentResponse,
        timestamp: new Date().toISOString()
      });

      return agentResponse;

    } catch (error) {
      const executionTime = Date.now() - startTime;

      const errorResponse: AgentResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        execution_time: executionTime,
        validation_status: "failed",
        validation_details: error instanceof Error ? error.message : 'Execution failed'
      };

      // Log error
      console.error(`❌ Error executing prompt ${promptTitle} on agent ${this.config.name}:`, error);

      return errorResponse;
    }
  }

  /**
   * Validate user inputs against prompt requirements
   */
  private validateInputs(prompt: PromptTemplate, userInputs: Record<string, any>): void {
    for (const requiredInput of prompt.input_requirements) {
      // Extract variable names from requirements (simple implementation)
      const variableMatch = requiredInput.match(/\{\{(\w+)\}\}/g);
      if (variableMatch) {
        for (const variable of variableMatch) {
          const varName = variable.replace(/[{}]/g, '');
          if (!(varName in userInputs)) {
            throw new Error(`Required input missing: ${varName}`);
          }
        }
      }
    }
  }

  /**
   * Replace placeholders in prompt with user inputs
   */
  private preparePrompt(prompt: PromptTemplate, userInputs: Record<string, any>): string {
    let prepared = prompt.detailed_prompt;

    // Replace all {{variable}} placeholders
    for (const [key, value] of Object.entries(userInputs)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prepared = prepared.replace(placeholder, String(value));
    }

    return prepared;
  }

  /**
   * Call the configured AI model (to be implemented with actual LLM integrations)
   */
  private async callAIModel(prompt: string): Promise<{ content: string; data?: Record<string, any> }> {
    // For now, this is a mock implementation
    // In production, this would integrate with OpenAI, Anthropic, etc.

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock response based on agent type
    const mockResponses = this.generateMockResponse(prompt);

    return {
      content: mockResponses.content,
      data: mockResponses.data
    };
  }

  /**
   * Generate mock responses for testing (to be replaced with real AI calls)
   */
  private generateMockResponse(prompt: string): { content: string; data: Record<string, any> } {
    const agentType = this.config.name;

    switch (agentType) {
      case 'fda-regulatory-strategist':
        return {
          content: `## FDA Regulatory Strategy Analysis

Based on the provided device information, I recommend the following regulatory pathway:

### Classification Assessment
- **Recommended Class**: Class II Medical Device
- **Regulatory Pathway**: 510(k) Premarket Notification
- **Product Code**: To be determined based on intended use

### Predicate Device Strategy
- Conduct comprehensive predicate search
- Identify 3-5 potential predicates
- Perform substantial equivalence comparison

### Testing Requirements
- Bench testing per applicable standards
- Software validation (if applicable)
- Clinical data assessment

### Timeline Estimate
- Testing completion: 3-4 months
- Submission preparation: 2 months
- FDA review: 90 days (MDUFA V)
- **Total estimated timeline**: 8-9 months

### Risk Assessment
- **Medium risk** pathway
- Key success factors: Strong predicate analysis, comprehensive testing
- Probability of success: 85%`,
          data: {
            pathway: "510k",
            classification: "Class II",
            timeline_months: 9,
            success_probability: 0.85,
            estimated_cost: "$150,000 - $250,000"
          }
        };

      case 'clinical-trial-designer':
        return {
          content: `## Clinical Trial Protocol Design

### Study Design
- **Type**: Prospective, multi-center, controlled study
- **Phase**: Pivotal trial for regulatory submission
- **Duration**: 12 months enrollment + 6 months follow-up

### Primary Endpoint
- Safety and effectiveness compared to current standard of care
- **Success Criteria**: Non-inferiority with 95% confidence

### Sample Size Calculation
- **Target enrollment**: 300 subjects
- **Power**: 80%
- **Alpha**: 0.05
- **Expected effect size**: Based on predicate device data

### Site Selection
- 5-8 clinical sites
- Academic medical centers preferred
- Geographic distribution across US

### Regulatory Considerations
- IDE application required
- IRB approval at each site
- Data Safety Monitoring Board (DSMB)`,
          data: {
            study_type: "pivotal",
            sample_size: 300,
            duration_months: 18,
            sites_needed: 7,
            estimated_cost: "$2.5M - $3.5M"
          }
        };

      case 'hipaa-compliance-officer':
        return {
          content: `## HIPAA Compliance Assessment

### Risk Assessment Summary
- **Overall Risk Level**: Medium
- **PHI Exposure Potential**: Moderate
- **Required Safeguards**: Administrative, Physical, Technical

### Administrative Safeguards
- Workforce training required
- Access management procedures
- Business Associate Agreements (BAAs)

### Physical Safeguards
- Facility access controls
- Workstation security
- Device and media controls

### Technical Safeguards
- Access control systems
- Audit controls
- Integrity controls
- Transmission security

### Recommendations
1. Implement role-based access controls
2. Conduct annual HIPAA training
3. Establish incident response procedures
4. Regular compliance audits

### Timeline
- Initial implementation: 30 days
- Full compliance: 90 days
- Ongoing monitoring: Continuous`,
          data: {
            risk_level: "medium",
            implementation_days: 90,
            training_required: true,
            audit_frequency: "quarterly"
          }
        };

      default:
        return {
          content: `## Analysis Complete

I have processed your request using the capabilities available to ${this.config.display_name}.

The analysis includes relevant domain expertise and follows industry best practices for ${this.config.metadata.domain} applications.

### Key Recommendations
- Detailed analysis based on provided inputs
- Risk assessment and mitigation strategies
- Implementation timeline and milestones
- Next steps and action items

### Quality Metrics
- Analysis accuracy: >95%
- Compliance with applicable regulations
- Best practice alignment

Please review the analysis and let me know if you need any clarification or additional details.`,
          data: {
            agent_used: this.config.name,
            domain: this.config.metadata.domain,
            compliance_level: this.config.metadata.compliance_level,
            processing_time: "2-3 minutes"
          }
        };
    }
  }

  /**
   * Validate response meets success criteria
   */
  private validateResponse(
    response: { content: string; data?: Record<string, any> },
    prompt: PromptTemplate
  ): { content: string; data?: Record<string, any> } {
    // Basic validation - ensure content is present and meaningful
    if (!response.content || response.content.trim().length < 100) {
      throw new Error("Response too short or empty");
    }

    // Additional validation based on success criteria could be added here
    return response;
  }

  /**
   * Log execution for HIPAA compliance
   */
  private logExecution(
    promptTitle: string,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): void {
    const auditEntry: AuditLogEntry = {
      log_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user_id: context.user_id,
      agent_name: this.config.name,
      action: `execute_prompt:${promptTitle}`,
      inputs_hash: this.hashInputs(inputs), // Hash for PHI protection
      success: true, // Will be updated based on actual execution
      execution_time: 0, // Will be updated when execution completes
      compliance_level: context.compliance_level,
      session_id: context.session_id
    };

    this.auditLog.push(auditEntry);
  }

  /**
   * Hash inputs for PHI protection
   */
  private hashInputs(inputs: Record<string, any>): string {
    // Simple hash implementation - in production use a proper crypto library
    const inputString = JSON.stringify(inputs);
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get agent status and health information
   */
  getStatus(): {
    name: string;
    display_name: string;
    status: "active" | "inactive";
    capabilities_loaded: number;
    prompts_loaded: number;
    total_executions: number;
    last_execution?: string;
  } {
    return {
      name: this.config.name,
      display_name: this.config.display_name,
      status: this.capabilities.size > 0 && this.prompts.size > 0 ? "active" : "inactive",
      capabilities_loaded: this.capabilities.size,
      prompts_loaded: this.prompts.size,
      total_executions: this.conversationHistory.length,
      last_execution: this.conversationHistory.length > 0
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp
        : undefined
    };
  }

  /**
   * Get available capabilities
   */
  getCapabilities(): string[] {
    return Array.from(this.capabilities.keys());
  }

  /**
   * Get available prompts
   */
  getPrompts(): string[] {
    return Array.from(this.prompts.keys());
  }

  /**
   * Get agent configuration
   */
  getConfig(): DigitalHealthAgentConfig {
    return { ...this.config };
  }

  /**
   * Get audit log entries
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear conversation history (for memory management)
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}