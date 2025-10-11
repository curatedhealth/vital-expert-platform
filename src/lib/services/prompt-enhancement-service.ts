import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PromptStarter {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  complexity_level: string;
  prompt_starter: string;
  system_prompt: string;
  user_prompt_template: string;
  input_schema: any;
  output_schema: any;
  success_criteria: any;
  compliance_tags: string[];
  estimated_tokens: number;
  model_requirements: any;
  tags: string[];
  target_users: string[];
  use_cases: string[];
  customization_guide: string;
  quality_assurance: string;
}

export interface AgentPrompt {
  id: string;
  agent_id: string;
  prompt_id: string;
  is_default: boolean;
  customizations: {
    priority: string;
    mapping_type: string;
    agent_name: string;
    keyword?: string;
  };
  agents: {
    display_name: string;
    business_function: string;
  };
  prompts: PromptStarter;
}

export class PromptEnhancementService {
  /**
   * Get all available prompt starters for an agent
   */
  static async getAgentPrompts(agentId: string): Promise<AgentPrompt[]> {
    try {
      const { data, error } = await supabase
        .from('agent_prompts')
        .select(`
          id,
          agent_id,
          prompt_id,
          is_default,
          customizations,
          agents!inner(display_name, business_function),
          prompts!inner(
            id,
            name,
            display_name,
            description,
            domain,
            complexity_level,
            prompt_starter,
            system_prompt,
            user_prompt_template,
            input_schema,
            output_schema,
            success_criteria,
            compliance_tags,
            estimated_tokens,
            model_requirements,
            tags,
            target_users,
            use_cases,
            customization_guide,
            quality_assurance
          )
        `)
        .eq('agent_id', agentId)
        .order('is_default', { ascending: false })
        .order('customizations->priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching agent prompts:', error);
      return [];
    }
  }

  /**
   * Get all available prompt starters
   */
  static async getAllPromptStarters(): Promise<PromptStarter[]> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .not('prompt_starter', 'is', null)
        .order('display_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching prompt starters:', error);
      return [];
    }
  }

  /**
   * Get prompt by name
   */
  static async getPromptByName(promptName: string): Promise<PromptStarter | null> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('name', promptName)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching prompt by name:', error);
      return null;
    }
  }

  /**
   * Enhance user prompt using PRISM framework
   */
  static async enhanceUserPrompt(
    userPrompt: string,
    agentId?: string,
    promptName?: string
  ): Promise<{
    enhancedPrompt: string;
    systemPrompt: string;
    promptInfo: PromptStarter | null;
    variables: string[];
    suggestions: string[];
  }> {
    try {
      let selectedPrompt: PromptStarter | null = null;
      let agentPrompts: AgentPrompt[] = [];

      // Get prompt by name if specified
      if (promptName) {
        selectedPrompt = await this.getPromptByName(promptName);
      }

      // Get agent prompts if agentId is provided
      if (agentId && !selectedPrompt) {
        agentPrompts = await this.getAgentPrompts(agentId);
        // Select the most relevant prompt based on user input
        selectedPrompt = this.selectMostRelevantPrompt(userPrompt, agentPrompts);
      }

      // If no specific prompt found, get all prompts and find best match
      if (!selectedPrompt) {
        const allPrompts = await this.getAllPromptStarters();
        selectedPrompt = this.findBestMatchingPrompt(userPrompt, allPrompts);
      }

      if (!selectedPrompt) {
        return {
          enhancedPrompt: userPrompt,
          systemPrompt: '',
          promptInfo: null,
          variables: [],
          suggestions: []
        };
      }

      // Extract variables from prompt starter
      const variables = this.extractVariables(selectedPrompt.prompt_starter);
      
      // Generate suggestions based on prompt template
      const suggestions = this.generateSuggestions(selectedPrompt, userPrompt);
      
      // Enhance the user prompt using the selected prompt template
      const enhancedPrompt = this.enhancePromptWithTemplate(
        userPrompt,
        selectedPrompt,
        variables
      );

      return {
        enhancedPrompt,
        systemPrompt: selectedPrompt.system_prompt,
        promptInfo: selectedPrompt,
        variables,
        suggestions
      };
    } catch (error) {
      console.error('Error enhancing user prompt:', error);
      return {
        enhancedPrompt: userPrompt,
        systemPrompt: '',
        promptInfo: null,
        variables: [],
        suggestions: []
      };
    }
  }

  /**
   * Select the most relevant prompt from agent prompts
   */
  private static selectMostRelevantPrompt(
    userPrompt: string,
    agentPrompts: AgentPrompt[]
  ): PromptStarter | null {
    if (agentPrompts.length === 0) return null;

    // Score prompts based on relevance to user input
    const scoredPrompts = agentPrompts.map(ap => ({
      prompt: ap.prompts,
      score: this.calculateRelevanceScore(userPrompt, ap.prompts)
    }));

    // Sort by score and return the best match
    scoredPrompts.sort((a, b) => b.score - a.score);
    return scoredPrompts[0].prompt;
  }

  /**
   * Find best matching prompt from all available prompts
   */
  private static findBestMatchingPrompt(
    userPrompt: string,
    allPrompts: PromptStarter[]
  ): PromptStarter | null {
    if (allPrompts.length === 0) return null;

    const scoredPrompts = allPrompts.map(prompt => ({
      prompt,
      score: this.calculateRelevanceScore(userPrompt, prompt)
    }));

    scoredPrompts.sort((a, b) => b.score - a.score);
    return scoredPrompts[0].score > 0.3 ? scoredPrompts[0].prompt : null;
  }

  /**
   * Calculate relevance score between user prompt and prompt template
   */
  private static calculateRelevanceScore(
    userPrompt: string,
    prompt: PromptStarter
  ): number {
    const userWords = userPrompt.toLowerCase().split(/\s+/);
    const promptWords = [
      ...prompt.display_name.toLowerCase().split(/\s+/),
      ...prompt.description.toLowerCase().split(/\s+/),
      ...prompt.tags.map(tag => tag.toLowerCase()),
      ...prompt.compliance_tags.map(tag => tag.toLowerCase())
    ];

    let score = 0;
    const totalWords = userWords.length;

    for (const userWord of userWords) {
      if (promptWords.some(promptWord => promptWord.includes(userWord) || userWord.includes(promptWord))) {
        score += 1;
      }
    }

    return totalWords > 0 ? score / totalWords : 0;
  }

  /**
   * Extract variables from prompt starter text
   */
  private static extractVariables(promptStarter: string): string[] {
    const variableRegex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(promptStarter)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Generate suggestions based on prompt template
   */
  private static generateSuggestions(
    prompt: PromptStarter,
    userPrompt: string
  ): string[] {
    const suggestions: string[] = [];

    // Add domain-specific suggestions
    if (prompt.domain === 'regulatory_affairs') {
      suggestions.push('Include specific FDA guidance references');
      suggestions.push('Specify regulatory pathway (510(k), PMA, De Novo)');
      suggestions.push('Add compliance requirements and timelines');
    } else if (prompt.domain === 'clinical_development') {
      suggestions.push('Define primary and secondary endpoints');
      suggestions.push('Specify patient population and inclusion criteria');
      suggestions.push('Include statistical analysis plan');
    } else if (prompt.domain === 'market_access') {
      suggestions.push('Define value proposition and economic benefits');
      suggestions.push('Specify target payer segments');
      suggestions.push('Include health economic evidence');
    }

    // Add complexity-based suggestions
    if (prompt.complexity_level === 'complex') {
      suggestions.push('Provide detailed context and background');
      suggestions.push('Include specific examples and use cases');
      suggestions.push('Specify regulatory or compliance requirements');
    }

    return suggestions;
  }

  /**
   * Enhance user prompt using the selected template
   */
  private static enhancePromptWithTemplate(
    userPrompt: string,
    prompt: PromptStarter,
    variables: string[]
  ): string {
    // If the user prompt is already well-structured, return as is
    if (userPrompt.length > 100 && variables.length === 0) {
      return userPrompt;
    }

    // Use the prompt starter as a template
    let enhancedPrompt = prompt.prompt_starter;

    // Replace variables with placeholders or user-provided values
    variables.forEach(variable => {
      const placeholder = `{${variable}}`;
      if (enhancedPrompt.includes(placeholder)) {
        // For now, keep the placeholder - in a real implementation,
        // you might want to extract values from the user prompt
        enhancedPrompt = enhancedPrompt.replace(placeholder, `[${variable}]`);
      }
    });

    // If the user prompt is short, prepend it to the enhanced prompt
    if (userPrompt.length < 50) {
      enhancedPrompt = `${userPrompt}\n\n${enhancedPrompt}`;
    } else {
      // If the user prompt is longer, use it as context
      enhancedPrompt = `Context: ${userPrompt}\n\n${enhancedPrompt}`;
    }

    return enhancedPrompt;
  }

  /**
   * Get prompt performance metrics
   */
  static async getPromptPerformance(promptId: string): Promise<any> {
    try {
      // This would typically query a metrics table
      // For now, return mock data
      return {
        usage_count: 0,
        success_rate: 0,
        average_rating: 0,
        last_used: null
      };
    } catch (error) {
      console.error('Error fetching prompt performance:', error);
      return null;
    }
  }

  /**
   * Create a new prompt (admin function)
   */
  static async createPrompt(promptData: Partial<PromptStarter>): Promise<PromptStarter | null> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert([promptData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating prompt:', error);
      return null;
    }
  }

  /**
   * Update an existing prompt (admin function)
   */
  static async updatePrompt(
    promptId: string,
    updates: Partial<PromptStarter>
  ): Promise<PromptStarter | null> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', promptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating prompt:', error);
      return null;
    }
  }

  /**
   * Duplicate a prompt (admin/user function)
   */
  static async duplicatePrompt(
    promptId: string,
    newName: string,
    userId?: string
  ): Promise<PromptStarter | null> {
    try {
      // Get the original prompt
      const originalPrompt = await this.getPromptByName(promptId);
      if (!originalPrompt) return null;

      // Create a copy with new name
      const duplicatedPrompt = {
        ...originalPrompt,
        name: newName,
        display_name: `${originalPrompt.display_name} (Copy)`,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      delete duplicatedPrompt.id; // Remove ID to create new record

      return await this.createPrompt(duplicatedPrompt);
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      return null;
    }
  }
}

export default PromptEnhancementService;
