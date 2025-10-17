import { WorkingMemory, EpisodicMemory, Concept, ToolCombination, Task, CompletedTask } from './autonomous-state';

export interface MemoryStats {
  workingMemorySize: number;
  episodicMemoryCount: number;
  semanticMemoryCount: number;
  toolMemoryCount: number;
  lastUpdated: Date;
}

export interface MemoryRetrieval {
  working: WorkingMemory;
  episodes: EpisodicMemory[];
  concepts: Concept[];
  tools: ToolCombination[];
  relevanceScores: Map<string, number>;
}

export interface ToolPerformance {
  toolName: string;
  successRate: number;
  avgCost: number;
  avgDuration: number;
  usageCount: number;
  lastUsed: Date;
}

export interface ConceptAssociation {
  conceptA: string;
  conceptB: string;
  strength: number;
  createdAt: Date;
}

export class MemoryManager {
  private workingMemory: WorkingMemory;
  private episodicMemory: EpisodicMemory[];
  private semanticMemory: Map<string, Concept>;
  private toolMemory: ToolCombination[];
  private conceptAssociations: ConceptAssociation[];

  constructor() {
    this.workingMemory = { facts: [], insights: [], hypotheses: [] };
    this.episodicMemory = [];
    this.semanticMemory = new Map();
    this.toolMemory = [];
    this.conceptAssociations = [];
  }

  /**
   * Working Memory Management
   */

  updateWorkingMemory(update: Partial<WorkingMemory>): WorkingMemory {
    console.log('🧠 [MemoryManager] Updating working memory');
    
    this.workingMemory = {
      facts: [...(this.workingMemory.facts || []), ...(update.facts || [])],
      insights: [...(this.workingMemory.insights || []), ...(update.insights || [])],
      hypotheses: [...(this.workingMemory.hypotheses || []), ...(update.hypotheses || [])],
      lastUpdated: new Date()
    };

    // Consolidate and deduplicate
    this.consolidateWorkingMemory();

    console.log('✅ [MemoryManager] Working memory updated:', {
      facts: this.workingMemory.facts.length,
      insights: this.workingMemory.insights.length,
      hypotheses: this.workingMemory.hypotheses.length
    });

    return this.workingMemory;
  }

  getWorkingMemory(): WorkingMemory {
    return { ...this.workingMemory };
  }

  consolidateWorkingMemory(): void {
    console.log('🔄 [MemoryManager] Consolidating working memory');

    // Remove duplicates and merge similar items
    this.workingMemory.facts = this.deduplicateAndMerge(this.workingMemory.facts);
    this.workingMemory.insights = this.deduplicateAndMerge(this.workingMemory.insights);
    this.workingMemory.hypotheses = this.deduplicateAndMerge(this.workingMemory.hypotheses);

    // Keep only most recent and relevant items
    this.workingMemory.facts = this.workingMemory.facts.slice(-50); // Keep last 50 facts
    this.workingMemory.insights = this.workingMemory.insights.slice(-30); // Keep last 30 insights
    this.workingMemory.hypotheses = this.workingMemory.hypotheses.slice(-20); // Keep last 20 hypotheses
  }

  pruneStaleMemory(maxAge: number): void {
    console.log('🧹 [MemoryManager] Pruning stale memory (max age: ${maxAge}ms)');
    
    const cutoff = new Date(Date.now() - maxAge);
    
    // Prune old episodic memories
    this.episodicMemory = this.episodicMemory.filter(episode => 
      new Date(episode.timestamp) > cutoff
    );

    // Prune old tool memories
    this.toolMemory = this.toolMemory.filter(tool => 
      new Date(tool.timestamp) > cutoff
    );

    console.log('✅ [MemoryManager] Stale memory pruned');
  }

  /**
   * Episodic Memory Management
   */

  recordEpisode(episode: EpisodicMemory): void {
    console.log('📝 [MemoryManager] Recording episode:', {
      taskId: episode.taskId,
      description: episode.description.substring(0, 50),
      success: episode.success
    });

    this.episodicMemory.push({
      ...episode,
      timestamp: new Date()
    });

    // Keep only last 100 episodes (memory decay)
    if (this.episodicMemory.length > 100) {
      this.episodicMemory = this.episodicMemory.slice(-100);
    }

    // Extract concepts from episode for semantic memory
    this.extractConceptsFromEpisode(episode);
  }

  getRecentEpisodes(count: number): EpisodicMemory[] {
    return this.episodicMemory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  findSimilarEpisodes(taskDescription: string): EpisodicMemory[] {
    console.log('🔍 [MemoryManager] Finding similar episodes for:', taskDescription.substring(0, 50));

    const similarEpisodes = this.episodicMemory
      .map(episode => ({
        episode,
        similarity: this.calculateSimilarity(taskDescription, episode.description)
      }))
      .filter(item => item.similarity > 0.3) // Threshold for similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Top 5 similar episodes
      .map(item => item.episode);

    console.log('✅ [MemoryManager] Found', similarEpisodes.length, 'similar episodes');
    return similarEpisodes;
  }

  /**
   * Semantic Memory Management
   */

  addConcept(concept: Concept): void {
    console.log('🧩 [MemoryManager] Adding concept:', concept.name);

    this.semanticMemory.set(concept.id, {
      ...concept,
      lastUpdated: new Date()
    });

    // Create associations with existing concepts
    this.createConceptAssociations(concept);
  }

  getConcept(id: string): Concept | undefined {
    return this.semanticMemory.get(id);
  }

  createConceptAssociation(conceptA: string, conceptB: string, strength: number): void {
    console.log('🔗 [MemoryManager] Creating concept association:', conceptA, '->', conceptB);

    this.conceptAssociations.push({
      conceptA,
      conceptB,
      strength,
      createdAt: new Date()
    });

    // Keep only recent associations
    if (this.conceptAssociations.length > 1000) {
      this.conceptAssociations = this.conceptAssociations.slice(-1000);
    }
  }

  searchConcepts(query: string): Concept[] {
    console.log('🔍 [MemoryManager] Searching concepts for:', query);

    const queryLower = query.toLowerCase();
    const matchingConcepts = Array.from(this.semanticMemory.values())
      .map(concept => ({
        concept,
        relevance: this.calculateConceptRelevance(queryLower, concept)
      }))
      .filter(item => item.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map(item => item.concept);

    console.log('✅ [MemoryManager] Found', matchingConcepts.length, 'matching concepts');
    return matchingConcepts;
  }

  /**
   * Tool Memory Management
   */

  recordToolUse(toolCombo: ToolCombination): void {
    console.log('🔧 [MemoryManager] Recording tool use:', toolCombo.tools.join(', '));

    this.toolMemory.push({
      ...toolCombo,
      timestamp: new Date()
    });

    // Keep only recent tool combinations
    if (this.toolMemory.length > 200) {
      this.toolMemory = this.toolMemory.slice(-200);
    }
  }

  getBestTools(taskType: string): string[] {
    console.log('🎯 [MemoryManager] Getting best tools for task type:', taskType);

    const relevantTools = this.toolMemory
      .filter(tool => tool.taskType === taskType)
      .map(tool => ({
        tools: tool.tools,
        successRate: tool.successRate,
        avgCost: tool.avgCost,
        usageCount: tool.usageCount
      }))
      .sort((a, b) => {
        // Sort by success rate first, then by cost efficiency
        const scoreA = a.successRate - (a.avgCost / 10);
        const scoreB = b.successRate - (b.avgCost / 10);
        return scoreB - scoreA;
      })
      .slice(0, 3) // Top 3 tool combinations
      .map(tool => tool.tools)
      .flat();

    console.log('✅ [MemoryManager] Recommended tools:', relevantTools);
    return relevantTools;
  }

  getToolPerformance(toolName: string): ToolPerformance {
    const toolUses = this.toolMemory.filter(tool => 
      tool.tools.includes(toolName)
    );

    if (toolUses.length === 0) {
      return {
        toolName,
        successRate: 0,
        avgCost: 0,
        avgDuration: 0,
        usageCount: 0,
        lastUsed: new Date()
      };
    }

    const successRate = toolUses.reduce((sum, tool) => sum + tool.successRate, 0) / toolUses.length;
    const avgCost = toolUses.reduce((sum, tool) => sum + tool.avgCost, 0) / toolUses.length;
    const avgDuration = toolUses.reduce((sum, tool) => sum + tool.avgDuration, 0) / toolUses.length;
    const lastUsed = toolUses
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      .timestamp;

    return {
      toolName,
      successRate,
      avgCost,
      avgDuration,
      usageCount: toolUses.length,
      lastUsed: new Date(lastUsed)
    };
  }

  /**
   * Memory Retrieval
   */

  retrieveRelevantMemories(context: string): MemoryRetrieval {
    console.log('🔍 [MemoryManager] Retrieving relevant memories for context');

    const working = this.getWorkingMemory();
    const episodes = this.findSimilarEpisodes(context);
    const concepts = this.searchConcepts(context);
    const tools = this.getRelevantTools(context);

    const relevanceScores = new Map<string, number>();
    
    // Calculate relevance scores
    episodes.forEach(episode => {
      const score = this.calculateSimilarity(context, episode.description);
      relevanceScores.set(episode.taskId, score);
    });

    concepts.forEach(concept => {
      const score = this.calculateConceptRelevance(context.toLowerCase(), concept);
      relevanceScores.set(concept.id, score);
    });

    return {
      working,
      episodes,
      concepts,
      tools,
      relevanceScores
    };
  }

  /**
   * Memory Management
   */

  getMemoryStats(): MemoryStats {
    return {
      workingMemorySize: this.workingMemory.facts.length + 
                        this.workingMemory.insights.length + 
                        this.workingMemory.hypotheses.length,
      episodicMemoryCount: this.episodicMemory.length,
      semanticMemoryCount: this.semanticMemory.size,
      toolMemoryCount: this.toolMemory.length,
      lastUpdated: new Date()
    };
  }

  reset(): void {
    console.log('🔄 [MemoryManager] Resetting all memory');
    
    this.workingMemory = { facts: [], insights: [], hypotheses: [] };
    this.episodicMemory = [];
    this.semanticMemory.clear();
    this.toolMemory = [];
    this.conceptAssociations = [];
  }

  exportMemory(): string {
    const memoryData = {
      workingMemory: this.workingMemory,
      episodicMemory: this.episodicMemory,
      semanticMemory: Array.from(this.semanticMemory.entries()),
      toolMemory: this.toolMemory,
      conceptAssociations: this.conceptAssociations,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(memoryData, null, 2);
  }

  importMemory(data: string): void {
    try {
      const memoryData = JSON.parse(data);
      
      this.workingMemory = memoryData.workingMemory || { facts: [], insights: [], hypotheses: [] };
      this.episodicMemory = memoryData.episodicMemory || [];
      this.semanticMemory = new Map(memoryData.semanticMemory || []);
      this.toolMemory = memoryData.toolMemory || [];
      this.conceptAssociations = memoryData.conceptAssociations || [];

      console.log('✅ [MemoryManager] Memory imported successfully');
    } catch (error) {
      console.error('❌ [MemoryManager] Failed to import memory:', error);
      throw new Error('Invalid memory data format');
    }
  }

  // Private helper methods

  private deduplicateAndMerge(items: string[]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];

    for (const item of items) {
      const normalized = item.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        merged.push(item);
      }
    }

    return merged;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateConceptRelevance(query: string, concept: Concept): number {
    const conceptText = `${concept.name} ${concept.description}`.toLowerCase();
    return this.calculateSimilarity(query, conceptText);
  }

  private extractConceptsFromEpisode(episode: EpisodicMemory): void {
    // Extract key concepts from episode description
    const words = episode.description.toLowerCase().split(/\s+/);
    const medicalTerms = ['treatment', 'drug', 'therapy', 'clinical', 'patient', 'disease', 'symptom'];
    const regulatoryTerms = ['fda', 'approval', 'guideline', 'compliance', 'regulation'];
    
    const relevantTerms = words.filter(word => 
      medicalTerms.includes(word) || regulatoryTerms.includes(word)
    );

    relevantTerms.forEach(term => {
      const conceptId = `concept_${term}_${Date.now()}`;
      this.addConcept({
        id: conceptId,
        name: term,
        description: `Concept extracted from episode: ${episode.taskId}`,
        domain: this.determineDomain(term),
        confidence: 0.7,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    });
  }

  private determineDomain(term: string): string {
    const medicalTerms = ['treatment', 'drug', 'therapy', 'clinical', 'patient', 'disease', 'symptom'];
    const regulatoryTerms = ['fda', 'approval', 'guideline', 'compliance', 'regulation'];
    
    if (medicalTerms.includes(term)) return 'medical';
    if (regulatoryTerms.includes(term)) return 'regulatory';
    return 'general';
  }

  private createConceptAssociations(concept: Concept): void {
    // Create associations with existing concepts in the same domain
    const existingConcepts = Array.from(this.semanticMemory.values())
      .filter(c => c.domain === concept.domain && c.id !== concept.id);

    existingConcepts.forEach(existingConcept => {
      const strength = this.calculateSimilarity(concept.name, existingConcept.name);
      if (strength > 0.3) {
        this.createConceptAssociation(concept.id, existingConcept.id, strength);
      }
    });
  }

  private getRelevantTools(context: string): ToolCombination[] {
    // Extract task type from context
    const taskType = this.extractTaskType(context);
    
    return this.toolMemory
      .filter(tool => tool.taskType === taskType)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  }

  private extractTaskType(context: string): string {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('research') || contextLower.includes('search')) return 'research';
    if (contextLower.includes('analyze') || contextLower.includes('analysis')) return 'analysis';
    if (contextLower.includes('validate') || contextLower.includes('verify')) return 'validation';
    if (contextLower.includes('synthesize') || contextLower.includes('summarize')) return 'synthesis';
    if (contextLower.includes('compliance') || contextLower.includes('regulatory')) return 'compliance_check';
    
    return 'general';
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
