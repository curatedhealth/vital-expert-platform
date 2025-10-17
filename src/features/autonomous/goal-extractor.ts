import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { Goal, SuccessCriterion, MedicalContext, RegulatoryRequirement, EvidenceRequirement } from './autonomous-state';

// Schema for structured goal extraction
const GoalExtractionSchema = z.object({
  goal: z.object({
    description: z.string().describe('Clear, specific goal statement'),
    successCriteria: z.array(z.object({
      id: z.string(),
      description: z.string(),
      measurable: z.boolean(),
      target: z.string(),
      achieved: z.boolean().default(false),
      evidence: z.array(z.string()).default([])
    })).describe('3-5 measurable success criteria'),
    medicalContext: z.object({
      domain: z.enum(['oncology', 'cardiology', 'neurology', 'endocrinology', 'general']),
      patientPopulation: z.string().optional(),
      interventionType: z.string().optional(),
      comparators: z.array(z.string()).optional(),
      studyPhase: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'post_market']).optional()
    }).optional(),
    regulatoryRequirements: z.array(z.object({
      region: z.enum(['FDA', 'EMA', 'MHRA', 'PMDA', 'Health_Canada']),
      complianceType: z.string(),
      guidelines: z.array(z.string()),
      deadline: z.string().optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending')
    })).optional(),
    evidenceRequirements: z.array(z.object({
      level: z.enum(['1a', '1b', '2a', '2b', '3', '4', '5']),
      sources: z.array(z.string()),
      minimumStudies: z.number(),
      qualityThreshold: z.number()
    })).optional(),
    maxCost: z.number().optional(),
    deadline: z.string().optional()
  }),
  complexity: z.object({
    score: z.number().min(1).max(10).describe('Complexity score 1-10'),
    factors: z.array(z.string()).describe('Factors contributing to complexity'),
    estimatedIterations: z.number().min(1).max(100).describe('Estimated iterations needed'),
    requiresSpecialist: z.boolean().describe('Whether specialist agents are needed'),
    requiresRegulatory: z.boolean().describe('Whether regulatory compliance is needed'),
    requiresClinical: z.boolean().describe('Whether clinical expertise is needed'),
    requiresResearch: z.boolean().describe('Whether research capabilities are needed')
  }),
  context: z.object({
    userIntent: z.string().describe('What the user is trying to achieve'),
    domain: z.string().describe('Primary knowledge domain'),
    urgency: z.enum(['low', 'medium', 'high', 'critical']).describe('Urgency level'),
    scope: z.enum(['narrow', 'moderate', 'broad']).describe('Scope of the request')
  })
});

export type GoalExtractionResult = z.infer<typeof GoalExtractionSchema>;

export class GoalExtractor {
  private llm: ChatOpenAI;
  private model: string;

  constructor(model: string = 'gpt-4-turbo-preview') {
    this.model = model;
    this.llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.3, // Lower temperature for more consistent extraction
      maxTokens: 2000,
      streaming: false
    });
  }

  /**
   * Extract structured goal from user input
   */
  async extractGoal(userInput: string, context?: {
    userId?: string;
    sessionId?: string;
    previousGoals?: Goal[];
    userPreferences?: any;
  }): Promise<GoalExtractionResult> {
    console.log('🎯 [GoalExtractor] Extracting goal from user input');
    console.log(`📝 Input: "${userInput.substring(0, 100)}..."`);

    try {
      const prompt = this.buildExtractionPrompt(userInput, context);
      const response = await this.llm.invoke(prompt);
      
      // Parse the response using structured output
      const content = response.content || response.text || response;
      const extracted = await this.parseStructuredResponse(content);
      
      console.log('✅ [GoalExtractor] Goal extracted successfully:', {
        description: extracted.goal.description.substring(0, 100),
        criteriaCount: extracted.goal.successCriteria.length,
        complexity: extracted.complexity.score,
        domain: extracted.context.domain
      });

      return extracted;
    } catch (error) {
      console.error('❌ [GoalExtractor] Goal extraction failed:', error);
      throw new Error(`Failed to extract goal: ${error.message}`);
    }
  }

  /**
   * Build the extraction prompt with medical/regulatory context
   */
  private buildExtractionPrompt(userInput: string, context?: any): string {
    return `You are an expert goal extraction system for healthcare and life sciences. Extract a structured goal from the user's input.

USER INPUT: "${userInput}"

CONTEXT:
${context?.previousGoals ? `Previous goals: ${context.previousGoals.length} completed` : 'No previous goals'}
${context?.userPreferences ? `User preferences: ${JSON.stringify(context.userPreferences)}` : 'No user preferences'}

INSTRUCTIONS:
1. Extract a clear, specific goal statement
2. Define 3-5 measurable success criteria
3. Identify medical/regulatory context if applicable
4. Assess complexity (1-10 scale) and estimate iterations needed
5. Determine if specialist agents are required
6. Consider regulatory compliance requirements
7. Set appropriate cost and time limits

MEDICAL DOMAINS TO CONSIDER:
- Oncology: Cancer treatments, clinical trials, drug development
- Cardiology: Heart disease, cardiovascular treatments, devices
- Neurology: Brain disorders, neurological treatments, cognitive health
- Endocrinology: Diabetes, hormonal disorders, metabolic health
- General: Broad medical topics, health policy, general research

REGULATORY REGIONS TO CONSIDER:
- FDA: United States Food and Drug Administration
- EMA: European Medicines Agency
- MHRA: UK Medicines and Healthcare products Regulatory Agency
- PMDA: Japan Pharmaceuticals and Medical Devices Agency
- Health_Canada: Canadian regulatory authority

EVIDENCE LEVELS:
- 1a: Systematic review of RCTs
- 1b: Individual RCT with narrow confidence interval
- 2a: Systematic review of cohort studies
- 2b: Individual cohort study
- 3: Case-control studies
- 4: Case series
- 5: Expert opinion

COMPLEXITY FACTORS:
- Multiple questions or sub-goals
- Cross-domain expertise required
- Regulatory compliance needed
- Clinical trial data analysis
- Meta-analysis or systematic review
- Multi-step research process
- Time-sensitive requirements

Respond with a JSON object matching this structure:
{
  "goal": {
    "description": "Clear, specific goal statement",
    "successCriteria": [
      {
        "id": "criteria_1",
        "description": "Specific, measurable criterion",
        "measurable": true,
        "target": "Specific target or threshold",
        "achieved": false,
        "evidence": []
      }
    ],
    "medicalContext": {
      "domain": "oncology|cardiology|neurology|endocrinology|general",
      "patientPopulation": "Specific patient group if applicable",
      "interventionType": "Type of intervention if applicable",
      "comparators": ["Comparison groups if applicable"],
      "studyPhase": "preclinical|phase1|phase2|phase3|post_market"
    },
    "regulatoryRequirements": [
      {
        "region": "FDA|EMA|MHRA|PMDA|Health_Canada",
        "complianceType": "Type of compliance needed",
        "guidelines": ["Relevant guidelines"],
        "deadline": "ISO date string if applicable",
        "status": "pending"
      }
    ],
    "evidenceRequirements": [
      {
        "level": "1a|1b|2a|2b|3|4|5",
        "sources": ["PubMed", "ClinicalTrials.gov", "FDA Database"],
        "minimumStudies": 5,
        "qualityThreshold": 0.8
      }
    ],
    "maxCost": 50,
    "deadline": "2025-02-15T00:00:00Z"
  },
  "complexity": {
    "score": 7,
    "factors": ["Multiple domains", "Regulatory compliance", "Clinical data analysis"],
    "estimatedIterations": 25,
    "requiresSpecialist": true,
    "requiresRegulatory": true,
    "requiresClinical": true,
    "requiresResearch": true
  },
  "context": {
    "userIntent": "What the user is trying to achieve",
    "domain": "Primary knowledge domain",
    "urgency": "low|medium|high|critical",
    "scope": "narrow|moderate|broad"
  }
}`;
  }

  /**
   * Parse the LLM response into structured data
   */
  private async parseStructuredResponse(content: string): Promise<GoalExtractionResult> {
    try {
      // Extract JSON from the response (handle cases where LLM adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate against schema
      return GoalExtractionSchema.parse(parsed);
    } catch (error) {
      console.error('❌ [GoalExtractor] JSON parsing failed:', error);
      console.error('Raw content:', content);
      
      // Fallback: create a basic goal structure
      return this.createFallbackGoal(content);
    }
  }

  /**
   * Create a fallback goal if parsing fails
   */
  private createFallbackGoal(userInput: string): GoalExtractionResult {
    console.log('⚠️ [GoalExtractor] Using fallback goal structure');
    
    return {
      goal: {
        description: userInput,
        successCriteria: [
          {
            id: 'criteria_1',
            description: 'Complete the requested task successfully',
            measurable: true,
            target: 'Task completion',
            achieved: false,
            evidence: []
          }
        ],
        medicalContext: {
          domain: 'general'
        },
        maxCost: 25,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      },
      complexity: {
        score: 5,
        factors: ['Standard complexity'],
        estimatedIterations: 10,
        requiresSpecialist: false,
        requiresRegulatory: false,
        requiresClinical: false,
        requiresResearch: false
      },
      context: {
        userIntent: 'Complete the requested task',
        domain: 'general',
        urgency: 'medium',
        scope: 'moderate'
      }
    };
  }

  /**
   * Validate extracted goal for completeness
   */
  validateGoal(extraction: GoalExtractionResult): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check goal description
    if (!extraction.goal.description || extraction.goal.description.length < 10) {
      issues.push('Goal description is too vague or short');
      recommendations.push('Provide a more specific and detailed goal description');
    }

    // Check success criteria
    if (extraction.goal.successCriteria.length < 2) {
      issues.push('Insufficient success criteria (need at least 2)');
      recommendations.push('Add more specific, measurable success criteria');
    }

    // Check if criteria are measurable
    const nonMeasurable = extraction.goal.successCriteria.filter(c => !c.measurable);
    if (nonMeasurable.length > 0) {
      issues.push(`${nonMeasurable.length} success criteria are not measurable`);
      recommendations.push('Make all success criteria quantifiable and measurable');
    }

    // Check complexity assessment
    if (extraction.complexity.score < 1 || extraction.complexity.score > 10) {
      issues.push('Invalid complexity score (must be 1-10)');
      recommendations.push('Provide a valid complexity score between 1 and 10');
    }

    // Check iteration estimate
    if (extraction.complexity.estimatedIterations < 1 || extraction.complexity.estimatedIterations > 100) {
      issues.push('Invalid iteration estimate (must be 1-100)');
      recommendations.push('Provide a realistic iteration estimate');
    }

    // Check medical context for medical queries
    const medicalKeywords = ['treatment', 'drug', 'clinical', 'patient', 'medical', 'disease', 'therapy'];
    const hasMedicalKeywords = medicalKeywords.some(keyword => 
      extraction.goal.description.toLowerCase().includes(keyword)
    );

    if (hasMedicalKeywords && !extraction.goal.medicalContext) {
      issues.push('Medical keywords detected but no medical context provided');
      recommendations.push('Specify medical domain and context for medical queries');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Refine goal based on validation feedback
   */
  async refineGoal(extraction: GoalExtractionResult, feedback: {
    issues: string[];
    recommendations: string[];
  }): Promise<GoalExtractionResult> {
    console.log('🔧 [GoalExtractor] Refining goal based on feedback');
    
    const refinementPrompt = `Refine this goal extraction based on the feedback provided.

ORIGINAL GOAL:
${JSON.stringify(extraction, null, 2)}

FEEDBACK ISSUES:
${feedback.issues.map(issue => `- ${issue}`).join('\n')}

RECOMMENDATIONS:
${feedback.recommendations.map(rec => `- ${rec}`).join('\n')}

Please provide an improved version of the goal extraction that addresses all the issues and incorporates the recommendations.`;

    try {
      const response = await this.llm.invoke(refinementPrompt);
      const refined = await this.parseStructuredResponse(response.content);
      
      console.log('✅ [GoalExtractor] Goal refined successfully');
      return refined;
    } catch (error) {
      console.error('❌ [GoalExtractor] Goal refinement failed:', error);
      return extraction; // Return original if refinement fails
    }
  }

  /**
   * Extract goal from conversation history
   */
  async extractGoalFromConversation(conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>): Promise<GoalExtractionResult | null> {
    console.log('📚 [GoalExtractor] Extracting goal from conversation history');
    
    // Look for goal-related messages in the conversation
    const goalMessages = conversationHistory.filter(msg => 
      msg.role === 'user' && 
      (msg.content.toLowerCase().includes('goal') || 
       msg.content.toLowerCase().includes('achieve') ||
       msg.content.toLowerCase().includes('need to') ||
       msg.content.toLowerCase().includes('want to'))
    );

    if (goalMessages.length === 0) {
      console.log('⚠️ [GoalExtractor] No goal-related messages found in conversation');
      return null;
    }

    // Use the most recent goal-related message
    const latestGoalMessage = goalMessages[goalMessages.length - 1];
    return await this.extractGoal(latestGoalMessage.content);
  }

  /**
   * Check if a goal is achievable with available resources
   */
  async assessGoalFeasibility(goal: Goal, availableResources: {
    maxCost: number;
    maxTime: number; // in hours
    availableAgents: string[];
    availableTools: string[];
  }): Promise<{
    feasible: boolean;
    confidence: number;
    constraints: string[];
    recommendations: string[];
  }> {
    const constraints: string[] = [];
    const recommendations: string[] = [];
    let confidence = 1.0;

    // Check cost constraints
    if (goal.maxCost && goal.maxCost > availableResources.maxCost) {
      constraints.push(`Goal cost ($${goal.maxCost}) exceeds available budget ($${availableResources.maxCost})`);
      confidence *= 0.5;
    }

    // Check time constraints
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const now = new Date();
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDeadline < availableResources.maxTime) {
        constraints.push(`Goal deadline is too soon (${hoursUntilDeadline.toFixed(1)} hours vs ${availableResources.maxTime} hours available)`);
        confidence *= 0.3;
      }
    }

    // Check agent availability
    if (goal.medicalContext?.domain && goal.medicalContext.domain !== 'general') {
      const domainAgents = availableResources.availableAgents.filter(agent => 
        agent.toLowerCase().includes(goal.medicalContext!.domain)
      );
      
      if (domainAgents.length === 0) {
        constraints.push(`No ${goal.medicalContext.domain} specialists available`);
        confidence *= 0.7;
        recommendations.push(`Consider using general medical agents or expanding agent pool`);
      }
    }

    // Check regulatory requirements
    if (goal.regulatoryRequirements && goal.regulatoryRequirements.length > 0) {
      const hasRegulatoryTools = availableResources.availableTools.some(tool => 
        tool.toLowerCase().includes('fda') || 
        tool.toLowerCase().includes('regulatory') ||
        tool.toLowerCase().includes('compliance')
      );
      
      if (!hasRegulatoryTools) {
        constraints.push('Regulatory requirements specified but no regulatory tools available');
        confidence *= 0.6;
        recommendations.push('Add regulatory compliance tools to available toolset');
      }
    }

    return {
      feasible: constraints.length === 0,
      confidence,
      constraints,
      recommendations
    };
  }
}

// Export singleton instance
export const goalExtractor = new GoalExtractor();
