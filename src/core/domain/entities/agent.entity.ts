/**
 * Agent Entity - Core domain entity for AI agents
 * 
 * Represents an AI agent with capabilities, knowledge domains, and configuration.
 * This is the central entity in the agent orchestration system.
 */

export interface QueryIntent {
  domain: string;
  requiredCapabilities: string[];
  complexity: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export class Agent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly systemPrompt: string,
    public readonly capabilities: string[],
    public readonly tier: 1 | 2 | 3,
    public readonly knowledgeDomains: string[],
    public readonly model: string,
    public readonly temperature: number,
    public readonly maxTokens: number,
    public readonly ragEnabled: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if this agent can handle a specific query intent
   */
  canHandleQuery(intent: QueryIntent): boolean {
    return this.capabilities.some(cap => 
      intent.requiredCapabilities.includes(cap)
    );
  }

  /**
   * Check if this agent matches a specific knowledge domain
   */
  matchesDomain(domain: string): boolean {
    return this.knowledgeDomains.includes(domain);
  }

  /**
   * Get agent's expertise level for a specific domain
   */
  getExpertiseLevel(domain: string): number {
    if (!this.matchesDomain(domain)) return 0;
    
    // Tier-based expertise scoring
    const tierScore = this.tier === 3 ? 1.0 : this.tier === 2 ? 0.7 : 0.4;
    
    // Capability-based bonus
    const capabilityBonus = this.capabilities.length * 0.1;
    
    return Math.min(1.0, tierScore + capabilityBonus);
  }

  /**
   * Check if agent is suitable for autonomous mode
   */
  isAutonomousCapable(): boolean {
    return this.tier >= 2 && this.ragEnabled;
  }

  /**
   * Get agent's performance score based on configuration
   */
  getPerformanceScore(): number {
    let score = 0;
    
    // Tier contributes to base score
    score += this.tier * 0.3;
    
    // Capabilities contribute to versatility
    score += Math.min(0.3, this.capabilities.length * 0.05);
    
    // RAG capability adds reliability
    if (this.ragEnabled) score += 0.2;
    
    // Model quality (simplified scoring)
    if (this.model.includes('gpt-4')) score += 0.2;
    else if (this.model.includes('gpt-3.5')) score += 0.1;
    
    return Math.min(1.0, score);
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      tier: this.tier,
      capabilities: this.capabilities,
      knowledgeDomains: this.knowledgeDomains,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      ragEnabled: this.ragEnabled,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Create a copy with updated fields
   */
  withUpdates(updates: Partial<Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>>): Agent {
    return new Agent(
      this.id,
      updates.name ?? this.name,
      updates.displayName ?? this.displayName,
      updates.description ?? this.description,
      updates.systemPrompt ?? this.systemPrompt,
      updates.capabilities ?? this.capabilities,
      updates.tier ?? this.tier,
      updates.knowledgeDomains ?? this.knowledgeDomains,
      updates.model ?? this.model,
      updates.temperature ?? this.temperature,
      updates.maxTokens ?? this.maxTokens,
      updates.ragEnabled ?? this.ragEnabled,
      this.createdAt,
      new Date() // Updated timestamp
    );
  }

  /**
   * Validate agent configuration
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === '') {
      errors.push('Agent ID is required');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Agent name is required');
    }

    if (!this.displayName || this.displayName.trim() === '') {
      errors.push('Agent display name is required');
    }

    if (!this.systemPrompt || this.systemPrompt.trim() === '') {
      errors.push('Agent system prompt is required');
    }

    if (this.capabilities.length === 0) {
      errors.push('Agent must have at least one capability');
    }

    if (this.knowledgeDomains.length === 0) {
      errors.push('Agent must have at least one knowledge domain');
    }

    if (this.temperature < 0 || this.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (this.maxTokens < 1 || this.maxTokens > 8000) {
      errors.push('Max tokens must be between 1 and 8000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
