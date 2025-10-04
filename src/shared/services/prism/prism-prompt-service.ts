/**
 * VITAL Path PRISM Prompt Service
 * Manages the PRISM specialized prompt library for healthcare domains
 * Provides intelligent prompt selection and template generation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type PRISMSuite = 'RULES' | 'TRIALS' | 'GUARD' | 'VALUE' | 'BRIDGE' | 'PROOF' | 'CRAFT' | 'SCOUT' | 'PROJECT' | 'FORGE';
export type KnowledgeDomain = 'medical_affairs' | 'regulatory_compliance' | 'clinical_research' | 'digital_health' | 'market_access' | 'commercial_strategy' | 'methodology_frameworks' | 'technology_platforms';

export interface PRISMPrompt {
  id: string;
  name: string;
  displayName: string;
  acronym: string;
  prismSuite: PRISMSuite;
  domain: KnowledgeDomain;
  systemPrompt: string;
  userPromptTemplate: string;
  description: string;
  version: string;
  tags: string[];
  parameters: Record<string, unknown>;
  usageCount: number;
  averageRating: number;
  isActive: boolean;
  isUserCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptSelectionCriteria {
  domain?: KnowledgeDomain;
  prismSuite?: PRISMSuite;
  tags?: string[];
  query?: string;
  context?: string;
  userRole?: string;
  complexityLevel?: 'basic' | 'intermediate' | 'advanced';
}

export interface PromptTemplate {
  promptId: string;
  compiledSystemPrompt: string;
  compiledUserPrompt: string;
  requiredParameters: string[];
  optionalParameters: string[];
  usageGuidelines: string;
  examples: Array<{
    scenario: string;
    parameters: Record<string, string>;
    expectedOutcome: string;
  }>;
}

export interface PRISMAnalytics {
  totalPrompts: number;
  suiteDistribution: Record<PRISMSuite, number>;
  domainDistribution: Record<KnowledgeDomain, number>;
  topUsedPrompts: Array<{
    id: string;
    name: string;
    usageCount: number;
    averageRating: number;
  }>;
  qualityMetrics: {
    averageRating: number;
    highPerformingPrompts: number;
    userCreatedPrompts: number;
  };
}

export class PRISMPromptService {
  private supabase: SupabaseClient;
  private defaultTenantId: string;

  // PRISM Suite descriptions and use cases
  private prismSuiteInfo = {
    'RULES': {
      description: 'Regulatory Excellence',
      primaryDomain: 'regulatory_compliance' as KnowledgeDomain,
      useCases: ['regulatory compliance assessment', 'pathway optimization', 'submission planning'],
      keyWords: ['regulatory', 'compliance', 'FDA', 'EMA', 'guidance', 'submission']
    },
    'TRIALS': {
      description: 'Clinical Development',
      primaryDomain: 'clinical_research' as KnowledgeDomain,
      useCases: ['trial design', 'endpoint selection', 'statistical planning'],
      keyWords: ['clinical', 'trial', 'study', 'endpoint', 'design', 'statistics']
    },
    'GUARD': {
      description: 'Safety Framework',
      primaryDomain: 'regulatory_compliance' as KnowledgeDomain,
      useCases: ['pharmacovigilance', 'risk management', 'safety assessment'],
      keyWords: ['safety', 'pharmacovigilance', 'adverse events', 'risk', 'REMS']
    },
    'VALUE': {
      description: 'Market Access',
      primaryDomain: 'market_access' as KnowledgeDomain,
      useCases: ['health economics', 'payer strategy', 'value proposition'],
      keyWords: ['health economics', 'cost-effectiveness', 'payer', 'value', 'HEOR']
    },
    'BRIDGE': {
      description: 'Stakeholder Engagement',
      primaryDomain: 'medical_affairs' as KnowledgeDomain,
      useCases: ['KOL engagement', 'advisory boards', 'scientific communication'],
      keyWords: ['stakeholder', 'KOL', 'engagement', 'medical affairs', 'communication']
    },
    'PROOF': {
      description: 'Evidence Analytics',
      primaryDomain: 'medical_affairs' as KnowledgeDomain,
      useCases: ['evidence synthesis', 'systematic review', 'meta-analysis'],
      keyWords: ['evidence', 'systematic review', 'meta-analysis', 'synthesis', 'literature']
    },
    'CRAFT': {
      description: 'Medical Writing',
      primaryDomain: 'medical_affairs' as KnowledgeDomain,
      useCases: ['regulatory writing', 'publication planning', 'document creation'],
      keyWords: ['medical writing', 'publication', 'manuscript', 'regulatory document']
    },
    'SCOUT': {
      description: 'Competitive Intelligence',
      primaryDomain: 'commercial_strategy' as KnowledgeDomain,
      useCases: ['competitive analysis', 'market intelligence', 'landscape assessment'],
      keyWords: ['competitive', 'intelligence', 'market', 'landscape', 'analysis']
    },
    'PROJECT': {
      description: 'Project Management Excellence',
      primaryDomain: 'methodology_frameworks' as KnowledgeDomain,
      useCases: ['project planning', 'resource allocation', 'timeline management', 'stakeholder coordination', 'risk mitigation', 'agile execution'],
      keyWords: ['project', 'management', 'planning', 'milestone', 'deliverable', 'resource', 'timeline', 'gantt', 'agile', 'sprint', 'backlog', 'coordination']
    },
    'FORGE': {
      description: 'Digital Health Development',
      primaryDomain: 'technology_platforms' as KnowledgeDomain,
      useCases: ['SaMD development', 'DTx platform design', 'API integration', 'data architecture', 'cybersecurity', 'interoperability'],
      keyWords: ['digital', 'health', 'SaMD', 'DTx', 'software', 'development', 'architecture', 'API', 'cloud', 'security', 'FHIR', 'HL7', 'interoperability', 'platform']
    }
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.defaultTenantId = '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Get all available PRISM prompts with filtering
   */
  async getPRISMPrompts(
    criteria: PromptSelectionCriteria = { /* TODO: implement */ },
    tenantId?: string
  ): Promise<PRISMPrompt[]> {
    try {

        .from('prism_prompts')
        .select('*')
        .eq('tenant_id', tenantId || this.defaultTenantId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      // Apply filters
      if (criteria.domain) {
        query = query.eq('domain', criteria.domain);
      }

      if (criteria.prismSuite) {
        query = query.eq('prism_suite', criteria.prismSuite);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        query = query.overlaps('tags', criteria.tags);
      }

      const { data, error } = await query;

      if (error) {
        // console.error('Error fetching PRISM prompts:', error);
        throw new Error(`Failed to fetch PRISM prompts: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToPrompt);
    } catch (error) {
      // console.error('PRISM prompt service error:', error);
      throw error;
    }
  }

  /**
   * Intelligent prompt selection based on query and context
   */
  async selectOptimalPrompt(
    query: string,
    context: string,
    criteria: PromptSelectionCriteria = { /* TODO: implement */ }
  ): Promise<PRISMPrompt | null> {
    try {
      // Analyze query to determine domain and suite

      // Enhance criteria with analysis results
      const enhancedCriteria: PromptSelectionCriteria = {
        ...criteria,
        domain: criteria.domain || analysisResult.suggestedDomain,
        prismSuite: criteria.prismSuite || analysisResult.suggestedSuite,
        tags: [...(criteria.tags || []), ...analysisResult.relevantTags]
      };

      // Get matching prompts

      if (prompts.length === 0) {
        return null;
      }

      // Score prompts based on relevance

        prompt,
        score: this.calculatePromptRelevanceScore(prompt, query, context, analysisResult)
      }));

      // Sort by score and return the best match
      scoredPrompts.sort((a, b) => b.score - a.score);

      return scoredPrompts[0].prompt;
    } catch (error) {
      // console.error('Error selecting optimal prompt:', error);
      return null;
    }
  }

  /**
   * Compile a prompt template with provided parameters
   */
  async compilePromptTemplate(
    promptId: string,
    parameters: Record<string, string>,
    tenantId?: string
  ): Promise<PromptTemplate> {
    try {
      // Get the prompt
      const { data, error } = await this.supabase
        .from('prism_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('tenant_id', tenantId || this.defaultTenantId)
        .single();

      if (error || !data) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      // Extract parameter placeholders

      // Compile prompts with parameters

      // Generate usage guidelines

      // Generate examples

      return {
        promptId,
        compiledSystemPrompt,
        compiledUserPrompt,
        requiredParameters,
        optionalParameters,
        usageGuidelines,
        examples
      };
    } catch (error) {
      // console.error('Error compiling prompt template:', error);
      throw error;
    }
  }

  /**
   * Get PRISM analytics and usage statistics
   */
  async getPRISMAnalytics(tenantId?: string): Promise<PRISMAnalytics> {
    try {
      const { data, error } = await this.supabase
        .from('prism_prompts')
        .select('*')
        .eq('tenant_id', tenantId || this.defaultTenantId);

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      // Calculate distributions
      const suiteDistribution: Record<PRISMSuite, number> = { /* TODO: implement */ } as unknown;
      const domainDistribution: Record<KnowledgeDomain, number> = { /* TODO: implement */ } as unknown;

      // eslint-disable-next-line security/detect-object-injection
      prompts.forEach(prompt => {
        // eslint-disable-next-line security/detect-object-injection
        suiteDistribution[prompt.prismSuite] = (suiteDistribution[prompt.prismSuite] || 0) + 1;
        // eslint-disable-next-line security/detect-object-injection
        domainDistribution[prompt.domain] = (domainDistribution[prompt.domain] || 0) + 1;
      });

      // Top used prompts

        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(prompt => ({
          id: prompt.id,
          name: prompt.displayName,
          usageCount: prompt.usageCount,
          averageRating: prompt.averageRating
        }));

      // Quality metrics

        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return {
        totalPrompts: prompts.length,
        suiteDistribution,
        domainDistribution,
        topUsedPrompts,
        qualityMetrics: {
          averageRating,
          highPerformingPrompts,
          userCreatedPrompts
        }
      };
    } catch (error) {
      // console.error('Error fetching PRISM analytics:', error);
      throw error;
    }
  }

  /**
   * Create a new custom PRISM prompt
   */
  async createCustomPrompt(
    promptData: Omit<PRISMPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'averageRating'>,
    tenantId?: string
  ): Promise<PRISMPrompt> {
    try {
      const { data, error } = await this.supabase
        .from('prism_prompts')
        .insert({
          tenant_id: tenantId || this.defaultTenantId,
          name: promptData.name,
          display_name: promptData.displayName,
          acronym: promptData.acronym,
          prism_suite: promptData.prismSuite,
          domain: promptData.domain,
          system_prompt: promptData.systemPrompt,
          user_prompt_template: promptData.userPromptTemplate,
          description: promptData.description,
          version: promptData.version,
          tags: promptData.tags,
          parameters: promptData.parameters,
          is_active: promptData.isActive,
          is_user_created: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create prompt: ${error.message}`);
      }

      return this.mapDatabaseToPrompt(data);
    } catch (error) {
      // console.error('Error creating custom prompt:', error);
      throw error;
    }
  }

  /**
   * Record prompt usage for analytics
   */
  async recordPromptUsage(
    promptId: string,
    queryText: string,
    rating?: number,
    processingTime?: number,
    tenantId?: string
  ): Promise<void> {
    try {
      // Insert usage record
      const { error: usageError } = await this.supabase
        .from('prompt_usage_analytics')
        .insert({
          prompt_id: promptId,
          tenant_id: tenantId || this.defaultTenantId,
          query_text: queryText,
          response_quality_rating: rating,
          processing_time_ms: processingTime
        });

      if (usageError) {
        // console.warn('Failed to record prompt usage:', usageError);
      }

      // Update prompt usage count
      const { error: updateError } = await this.supabase
        .rpc('increment_prompt_usage', { prompt_id: promptId });

      if (updateError) {
        // console.warn('Failed to update prompt usage count:', updateError);
      }

    } catch (error) {
      // console.warn('Error recording prompt usage:', error);
    }
  }

  /**
   * Analyze query to suggest optimal PRISM suite and domain
   */
  private analyzeQueryForPRISM(query: string, context: string): {
    suggestedDomain: KnowledgeDomain;
    suggestedSuite: PRISMSuite;
    relevantTags: string[];
    confidence: number;
  } {

    let bestSuite: PRISMSuite = 'PROOF'; // Default
    let bestDomain: KnowledgeDomain = 'medical_affairs'; // Default

    const relevantTags: string[] = [];

    // Score each PRISM suite based on keyword matches
    // eslint-disable-next-line security/detect-object-injection
    Object.entries(this.prismSuiteInfo).forEach(([suite, info]) => {

      // eslint-disable-next-line security/detect-object-injection
      info.keyWords.forEach(keyword => {
        // eslint-disable-next-line security/detect-object-injection
        if (combinedText.includes(keyword)) {
          score += 1;
          relevantTags.push(keyword);
        }
      });

      // Boost score for exact use case matches
      // eslint-disable-next-line security/detect-object-injection
      info.useCases.forEach(useCase => {
        // eslint-disable-next-line security/detect-object-injection
        if (combinedText.includes(useCase)) {
          score += 2;
          relevantTags.push(useCase);
        }
      });

      // eslint-disable-next-line security/detect-object-injection
      if (score > maxScore) {
        maxScore = score;
        bestSuite = suite as PRISMSuite;
        bestDomain = info.primaryDomain;
      }
    });

    return {
      suggestedDomain: bestDomain,
      suggestedSuite: bestSuite,
      relevantTags: [...new Set(relevantTags)],
      confidence: Math.min(maxScore / 3, 1.0) // Normalize confidence
    };
  }

  /**
   * Calculate relevance score for prompt selection
   */
  private calculatePromptRelevanceScore(
    prompt: PRISMPrompt,
    query: string,
    context: string,
    analysis: unknown
  ): number {

    // Base score from usage and rating
    score += (prompt.usageCount / 100) * 0.3; // Usage popularity
    score += (prompt.averageRating / 5) * 0.2; // Quality rating

    // Domain and suite match
    if (prompt.domain === analysis.suggestedDomain) score += 0.3;
    if (prompt.prismSuite === analysis.suggestedSuite) score += 0.3;

    // Tag relevance
    // eslint-disable-next-line security/detect-object-injection

      // eslint-disable-next-line security/detect-object-injection
      analysis.relevantTags.includes(tag)
    );
    // eslint-disable-next-line security/detect-object-injection
    score += (matchingTags.length / prompt.tags.length) * 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Extract parameter placeholders from prompt text
   */
  private extractPlaceholders(text: string): string[] {

    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(text)) !== null) {
      placeholders.push(match[1]);
    }

    return [...new Set(placeholders)];
  }

  /**
   * Replace placeholders with actual values
   */
  private replacePlaceholders(text: string, parameters: Record<string, string>): string {

    // eslint-disable-next-line security/detect-object-injection
    Object.entries(parameters).forEach(([key, value]) => {

      // eslint-disable-next-line security/detect-object-injection
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${ /* TODO: implement */ }()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    return result;
  }

  /**
   * Generate usage guidelines for a prompt
   */
  private generateUsageGuidelines(prompt: PRISMPrompt): string {
    // eslint-disable-next-line security/detect-object-injection

    return `
**${prompt.displayName} (${prompt.acronym})**

**Purpose**: ${prompt.description}

**PRISM Suite**: ${prompt.prismSuite} - ${suiteInfo.description}

**Domain**: ${prompt.domain}

**Best Used For**: ${suiteInfo.useCases.join(', ')}

**Key Parameters**: Ensure you provide relevant context for ${this.extractPlaceholders(prompt.userPromptTemplate).join(', ')}

**Tips**:
- Be specific with your context information
- Include relevant medical/regulatory background
- Consider the target audience when framing your request
    `.trim();
  }

  /**
   * Generate example usage scenarios
   */
  private generateExamples(prompt: PRISMPrompt): Array<{
    scenario: string;
    parameters: Record<string, string>;
    expectedOutcome: string;
  }> {
    // This would ideally be populated from a database of examples
    // For now, return basic examples based on prompt type
    const suiteExamples: Record<PRISMSuite, Array<{
      scenario: string;
      parameters: Record<string, string>;
      expectedOutcome: string;
    }>> = {
      'RULES': [{
        scenario: 'Assessing FDA pathway for a new digital health device',
        parameters: {
          'regulatory_context': 'Digital therapeutics for diabetes management',
          'product_details': 'Mobile app with AI-driven insulin dosing recommendations',
          'target_markets': 'United States, European Union',
          'current_status': 'Pre-clinical development completed'
        },
        expectedOutcome: 'Comprehensive regulatory strategy with timeline and requirements'
      }],
      'TRIALS': [{
        scenario: 'Designing a Phase II clinical trial',
        parameters: {
          'intervention_details': 'Novel oncology combination therapy',
          'therapeutic_area': 'Oncology - Non-small cell lung cancer',
          'target_population': 'Treatment-naive NSCLC patients',
          'regulatory_goals': 'FDA Breakthrough Therapy designation'
        },
        expectedOutcome: 'Optimized trial design with endpoints and statistical plan'
      }],
      'GUARD': [{
        scenario: 'Implementing HIPAA compliance monitoring',
        parameters: {
          'system_context': 'Healthcare data processing platform',
          'compliance_requirements': 'HIPAA, GDPR, FDA Part 11',
          'data_types': 'Patient health records, clinical trial data'
        },
        expectedOutcome: 'Comprehensive compliance monitoring and audit framework'
      }],
      'VALUE': [{
        scenario: 'Demonstrating health economic value',
        parameters: {
          'intervention': 'Digital health monitoring device',
          'comparison': 'Standard of care treatment',
          'outcome_measures': 'Quality-adjusted life years, healthcare costs'
        },
        expectedOutcome: 'Health economic evaluation with cost-effectiveness analysis'
      }],
      'BRIDGE': [{
        scenario: 'Connecting clinical evidence to market access',
        parameters: {
          'clinical_data': 'Phase III trial results',
          'target_market': 'US commercial payers',
          'value_proposition': 'Reduced hospital readmissions'
        },
        expectedOutcome: 'Market access strategy with payer evidence requirements'
      }],
      'PROOF': [{
        scenario: 'Validating clinical evidence quality',
        parameters: {
          'study_design': 'Randomized controlled trial',
          'endpoints': 'Primary efficacy and safety outcomes',
          'regulatory_requirements': 'FDA approval pathway'
        },
        expectedOutcome: 'Evidence validation report with quality assessment'
      }],
      'CRAFT': [{
        scenario: 'Developing medical communication strategy',
        parameters: {
          'audience': 'Key opinion leaders in oncology',
          'message': 'Novel mechanism of action benefits',
          'channels': 'Scientific conferences, peer-reviewed publications'
        },
        expectedOutcome: 'Strategic communication plan with key messages and tactics'
      }],
      'SCOUT': [{
        scenario: 'Exploring emerging therapeutic opportunities',
        parameters: {
          'therapeutic_area': 'Rare diseases',
          'technology_platform': 'Gene therapy approaches',
          'market_factors': 'Orphan drug incentives'
        },
        expectedOutcome: 'Opportunity assessment with strategic recommendations'
      }],
      'PROJECT': [{
        scenario: 'Planning digital health product launch',
        parameters: {
          'project_scope': 'DTx platform for chronic disease management',
          'timeline': '18-month development and launch cycle',
          'resources': 'Cross-functional team of 15 (engineering, clinical, regulatory)',
          'constraints': 'Budget $2M, regulatory submission Q4 target'
        },
        expectedOutcome: 'Comprehensive project plan with milestones, resource allocation, and risk mitigation strategies'
      }],
      'FORGE': [{
        scenario: 'Developing SaMD architecture for FDA submission',
        parameters: {
          'product_type': 'AI-powered diagnostic decision support',
          'technical_stack': 'Cloud-native microservices, FHIR API',
          'regulatory_class': 'Class II medical device',
          'security_requirements': 'HIPAA, SOC 2, ISO 27001'
        },
        expectedOutcome: 'Technical architecture design with regulatory compliance mapping and security framework'
      }]
    };

    // eslint-disable-next-line security/detect-object-injection
    return suiteExamples[prompt.prismSuite] || [];
  }

  /**
   * Map database record to PRISMPrompt interface
   */
  private mapDatabaseToPrompt(data: unknown): PRISMPrompt {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      acronym: data.acronym,
      prismSuite: data.prism_suite,
      domain: data.domain,
      systemPrompt: data.system_prompt,
      userPromptTemplate: data.user_prompt_template,
      description: data.description,
      version: data.version,
      tags: data.tags || [],
      parameters: data.parameters || { /* TODO: implement */ },
      usageCount: data.usage_count || 0,
      averageRating: data.average_rating || 0,
      isActive: data.is_active,
      isUserCreated: data.is_user_created || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Export singleton instance
export const __prismPromptService = new PRISMPromptService();