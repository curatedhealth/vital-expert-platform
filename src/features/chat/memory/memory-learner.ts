/**
 * Memory Learning System
 * Pattern recognition and preference inference from user interactions
 */

import { createClient } from '@supabase/supabase-js';

export interface LearningPattern {
  id: string;
  userId: string;
  pattern: string;
  patternType: 'query_preference' | 'response_style' | 'domain_focus' | 'interaction_flow' | 'timing';
  confidence: number;
  frequency: number;
  lastSeen: Date;
  metadata: Record<string, any>;
}

export interface UserPreference {
  id: string;
  userId: string;
  preferenceType: 'detail_level' | 'response_format' | 'domain_expertise' | 'communication_style' | 'timing';
  value: string | number | boolean;
  confidence: number;
  source: 'explicit' | 'inferred' | 'learned';
  lastUpdated: Date;
  metadata: Record<string, any>;
}

export interface LearningInsight {
  id: string;
  userId: string;
  insightType: 'behavioral' | 'preferential' | 'contextual' | 'temporal';
  description: string;
  confidence: number;
  actionable: boolean;
  suggestedAction: string;
  createdAt: Date;
}

export interface InteractionContext {
  userId: string;
  sessionId: string;
  query: string;
  response: string;
  agentId: string;
  domain: string;
  timestamp: Date;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  responseTime: number;
  metadata: Record<string, any>;
}

export class MemoryLearner {
  private supabase: any;
  private learningModels: Map<string, any> = new Map();
  private patternCache: Map<string, LearningPattern[]> = new Map();
  private preferenceCache: Map<string, UserPreference[]> = new Map();
  private isLearning: boolean = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase not configured - using fallback learning');
    }

    this.initializeLearningModels();
    this.startLearningProcess();
  }

  /**
   * Initialize learning models for different pattern types
   */
  private initializeLearningModels(): void {
    // Query preference model
    this.learningModels.set('query_preference', {
      analyze: this.analyzeQueryPreferences.bind(this),
      extract: this.extractQueryPatterns.bind(this)
    });

    // Response style model
    this.learningModels.set('response_style', {
      analyze: this.analyzeResponseStyles.bind(this),
      extract: this.extractResponsePatterns.bind(this)
    });

    // Domain focus model
    this.learningModels.set('domain_focus', {
      analyze: this.analyzeDomainFocus.bind(this),
      extract: this.extractDomainPatterns.bind(this)
    });

    // Interaction flow model
    this.learningModels.set('interaction_flow', {
      analyze: this.analyzeInteractionFlows.bind(this),
      extract: this.extractFlowPatterns.bind(this)
    });

    // Timing model
    this.learningModels.set('timing', {
      analyze: this.analyzeTimingPatterns.bind(this),
      extract: this.extractTimingPatterns.bind(this)
    });
  }

  /**
   * Start the learning process
   */
  private startLearningProcess(): void {
    this.isLearning = true;

    // Process interactions every 5 minutes
    setInterval(() => {
      this.processRecentInteractions();
    }, 5 * 60 * 1000);

    // Update patterns every hour
    setInterval(() => {
      this.updateLearningPatterns();
    }, 60 * 60 * 1000);

    // Generate insights every 6 hours
    setInterval(() => {
      this.generateLearningInsights();
    }, 6 * 60 * 60 * 1000);

    console.log('🧠 Memory learning system started');
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(context: InteractionContext): Promise<void> {
    try {
      console.log(`🧠 Learning from interaction for user ${context.userId}`);

      // Store interaction data
      await this.storeInteraction(context);

      // Analyze patterns
      const patterns = await this.analyzeInteractionPatterns(context);
      
      // Update user preferences
      const preferences = await this.updateUserPreferences(context, patterns);

      // Generate insights
      const insights = await this.generateInsightsFromInteraction(context, patterns, preferences);

      // Cache results
      this.updateCaches(context.userId, patterns, preferences);

      console.log(`✅ Learned ${patterns.length} patterns and ${preferences.length} preferences`);

    } catch (error) {
      console.error('❌ Error learning from interaction:', error);
    }
  }

  /**
   * Store interaction data
   */
  private async storeInteraction(context: InteractionContext): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('learning_interactions')
        .insert({
          user_id: context.userId,
          session_id: context.sessionId,
          query: context.query,
          response: context.response,
          agent_id: context.agentId,
          domain: context.domain,
          timestamp: context.timestamp.toISOString(),
          user_feedback: context.userFeedback,
          response_time: context.responseTime,
          metadata: context.metadata
        });

      if (error) {
        console.error('❌ Error storing interaction:', error);
      }
    } catch (error) {
      console.error('❌ Error storing interaction:', error);
    }
  }

  /**
   * Analyze interaction patterns
   */
  private async analyzeInteractionPatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];

    // Analyze each pattern type
    for (const [patternType, model] of this.learningModels.entries()) {
      try {
        const extractedPatterns = await model.extract(context);
        patterns.push(...extractedPatterns);
      } catch (error) {
        console.error(`❌ Error analyzing ${patternType} patterns:`, error);
      }
    }

    return patterns;
  }

  /**
   * Extract query preference patterns
   */
  private async extractQueryPatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    const query = context.query.toLowerCase();

    // Analyze query structure
    const queryLength = query.length;
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
    const hasQuestion = questionWords.some(word => query.includes(word));
    const hasNumbers = /\d+/.test(query);
    const hasTechnicalTerms = this.hasTechnicalTerms(query);

    // Create pattern based on query characteristics
    const pattern = {
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      pattern: this.generateQueryPatternString(queryLength, hasQuestion, hasNumbers, hasTechnicalTerms),
      patternType: 'query_preference' as const,
      confidence: 0.7,
      frequency: 1,
      lastSeen: new Date(),
      metadata: {
        queryLength,
        hasQuestion,
        hasNumbers,
        hasTechnicalTerms,
        domain: context.domain
      }
    };

    patterns.push(pattern);

    return patterns;
  }

  /**
   * Extract response style patterns
   */
  private async extractResponsePatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    const response = context.response;

    // Analyze response characteristics
    const responseLength = response.length;
    const hasBulletPoints = response.includes('•') || response.includes('-');
    const hasNumberedList = /\d+\./.test(response);
    const hasCodeBlocks = response.includes('```');
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(response);
    const hasReferences = response.includes('[') && response.includes(']');

    const pattern = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      pattern: this.generateResponsePatternString(responseLength, hasBulletPoints, hasNumberedList, hasCodeBlocks, hasEmojis, hasReferences),
      patternType: 'response_style' as const,
      confidence: 0.8,
      frequency: 1,
      lastSeen: new Date(),
      metadata: {
        responseLength,
        hasBulletPoints,
        hasNumberedList,
        hasCodeBlocks,
        hasEmojis,
        hasReferences,
        responseTime: context.responseTime
      }
    };

    patterns.push(pattern);

    return patterns;
  }

  /**
   * Extract domain focus patterns
   */
  private async extractDomainPatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    const domain = context.domain;

    const pattern = {
      id: `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      pattern: `domain_focus_${domain}`,
      patternType: 'domain_focus' as const,
      confidence: 0.9,
      frequency: 1,
      lastSeen: new Date(),
      metadata: {
        domain,
        agentId: context.agentId,
        query: context.query.substring(0, 100)
      }
    };

    patterns.push(pattern);

    return patterns;
  }

  /**
   * Extract interaction flow patterns
   */
  private async extractFlowPatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    // Analyze interaction timing and flow
    const hour = context.timestamp.getHours();
    const dayOfWeek = context.timestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const pattern = {
      id: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      pattern: `interaction_${hour}_${isWeekend ? 'weekend' : 'weekday'}`,
      patternType: 'interaction_flow' as const,
      confidence: 0.6,
      frequency: 1,
      lastSeen: new Date(),
      metadata: {
        hour,
        dayOfWeek,
        isWeekend,
        sessionId: context.sessionId
      }
    };

    patterns.push(pattern);

    return patterns;
  }

  /**
   * Extract timing patterns
   */
  private async extractTimingPatterns(context: InteractionContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    const responseTime = context.responseTime;
    const timeCategory = responseTime < 1000 ? 'fast' : responseTime < 3000 ? 'medium' : 'slow';

    const pattern = {
      id: `timing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      pattern: `response_timing_${timeCategory}`,
      patternType: 'timing' as const,
      confidence: 0.7,
      frequency: 1,
      lastSeen: new Date(),
      metadata: {
        responseTime,
        timeCategory,
        domain: context.domain
      }
    };

    patterns.push(pattern);

    return patterns;
  }

  /**
   * Update user preferences based on patterns
   */
  private async updateUserPreferences(
    context: InteractionContext, 
    patterns: LearningPattern[]
  ): Promise<UserPreference[]> {
    const preferences: UserPreference[] = [];

    // Extract preferences from patterns
    for (const pattern of patterns) {
      const preference = this.patternToPreference(pattern, context);
      if (preference) {
        preferences.push(preference);
      }
    }

    // Store preferences
    if (preferences.length > 0 && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('user_preferences')
          .upsert(preferences.map(p => ({
            user_id: p.userId,
            preference_type: p.preferenceType,
            value: p.value,
            confidence: p.confidence,
            source: p.source,
            last_updated: p.lastUpdated.toISOString(),
            metadata: p.metadata
          })));

        if (error) {
          console.error('❌ Error storing preferences:', error);
        }
      } catch (error) {
        console.error('❌ Error storing preferences:', error);
      }
    }

    return preferences;
  }

  /**
   * Convert pattern to preference
   */
  private patternToPreference(pattern: LearningPattern, context: InteractionContext): UserPreference | null {
    switch (pattern.patternType) {
      case 'query_preference':
        return {
          id: `pref_${pattern.id}`,
          userId: pattern.userId,
          preferenceType: 'detail_level',
          value: this.inferDetailLevel(pattern.metadata),
          confidence: pattern.confidence,
          source: 'inferred',
          lastUpdated: new Date(),
          metadata: pattern.metadata
        };

      case 'response_style':
        return {
          id: `pref_${pattern.id}`,
          userId: pattern.userId,
          preferenceType: 'response_format',
          value: this.inferResponseFormat(pattern.metadata),
          confidence: pattern.confidence,
          source: 'inferred',
          lastUpdated: new Date(),
          metadata: pattern.metadata
        };

      case 'domain_focus':
        return {
          id: `pref_${pattern.id}`,
          userId: pattern.userId,
          preferenceType: 'domain_expertise',
          value: pattern.metadata.domain,
          confidence: pattern.confidence,
          source: 'learned',
          lastUpdated: new Date(),
          metadata: pattern.metadata
        };

      case 'timing':
        return {
          id: `pref_${pattern.id}`,
          userId: pattern.userId,
          preferenceType: 'timing',
          value: pattern.metadata.timeCategory,
          confidence: pattern.confidence,
          source: 'learned',
          lastUpdated: new Date(),
          metadata: pattern.metadata
        };

      default:
        return null;
    }
  }

  /**
   * Generate insights from interaction
   */
  private async generateInsightsFromInteraction(
    context: InteractionContext,
    patterns: LearningPattern[],
    preferences: UserPreference[]
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Generate behavioral insights
    const behavioralInsight = this.generateBehavioralInsight(context, patterns);
    if (behavioralInsight) {
      insights.push(behavioralInsight);
    }

    // Generate preferential insights
    const preferentialInsight = this.generatePreferentialInsight(preferences);
    if (preferentialInsight) {
      insights.push(preferentialInsight);
    }

    // Generate contextual insights
    const contextualInsight = this.generateContextualInsight(context);
    if (contextualInsight) {
      insights.push(contextualInsight);
    }

    return insights;
  }

  /**
   * Generate behavioral insight
   */
  private generateBehavioralInsight(context: InteractionContext, patterns: LearningPattern[]): LearningInsight | null {
    if (patterns.length === 0) return null;

    const domainPatterns = patterns.filter(p => p.patternType === 'domain_focus');
    const queryPatterns = patterns.filter(p => p.patternType === 'query_preference');

    if (domainPatterns.length > 0) {
      return {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: context.userId,
        insightType: 'behavioral',
        description: `User shows strong interest in ${domainPatterns[0].metadata.domain} domain`,
        confidence: 0.8,
        actionable: true,
        suggestedAction: `Prioritize ${domainPatterns[0].metadata.domain} expertise in future responses`,
        createdAt: new Date()
      };
    }

    return null;
  }

  /**
   * Generate preferential insight
   */
  private generatePreferentialInsight(preferences: UserPreference[]): LearningInsight | null {
    if (preferences.length === 0) return null;

    const formatPrefs = preferences.filter(p => p.preferenceType === 'response_format');
    if (formatPrefs.length > 0) {
      return {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: preferences[0].userId,
        insightType: 'preferential',
        description: `User prefers ${formatPrefs[0].value} response format`,
        confidence: formatPrefs[0].confidence,
        actionable: true,
        suggestedAction: `Adapt response format to ${formatPrefs[0].value}`,
        createdAt: new Date()
      };
    }

    return null;
  }

  /**
   * Generate contextual insight
   */
  private generateContextualInsight(context: InteractionContext): LearningInsight | null {
    const hour = context.timestamp.getHours();
    const isBusinessHours = hour >= 9 && hour <= 17;

    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: context.userId,
      insightType: 'contextual',
      description: `User typically interacts during ${isBusinessHours ? 'business hours' : 'off hours'}`,
      confidence: 0.6,
      actionable: false,
      suggestedAction: 'Consider time-based response adjustments',
      createdAt: new Date()
    };
  }

  // Helper methods
  private hasTechnicalTerms(query: string): boolean {
    const technicalTerms = ['api', 'database', 'algorithm', 'protocol', 'framework', 'architecture', 'implementation'];
    return technicalTerms.some(term => query.includes(term));
  }

  private generateQueryPatternString(length: number, hasQuestion: boolean, hasNumbers: boolean, hasTechnical: boolean): string {
    let pattern = `query_${length < 50 ? 'short' : length < 150 ? 'medium' : 'long'}`;
    if (hasQuestion) pattern += '_question';
    if (hasNumbers) pattern += '_numeric';
    if (hasTechnical) pattern += '_technical';
    return pattern;
  }

  private generateResponsePatternString(
    length: number, 
    hasBullets: boolean, 
    hasNumbers: boolean, 
    hasCode: boolean, 
    hasEmojis: boolean, 
    hasRefs: boolean
  ): string {
    let pattern = `response_${length < 200 ? 'brief' : length < 500 ? 'moderate' : 'detailed'}`;
    if (hasBullets) pattern += '_bulleted';
    if (hasNumbers) pattern += '_numbered';
    if (hasCode) pattern += '_code';
    if (hasEmojis) pattern += '_emojis';
    if (hasRefs) pattern += '_references';
    return pattern;
  }

  private inferDetailLevel(metadata: Record<string, any>): string {
    if (metadata.hasTechnicalTerms) return 'technical';
    if (metadata.queryLength > 100) return 'detailed';
    if (metadata.hasQuestion) return 'explanatory';
    return 'summary';
  }

  private inferResponseFormat(metadata: Record<string, any>): string {
    if (metadata.hasCodeBlocks) return 'technical';
    if (metadata.hasBulletPoints) return 'structured';
    if (metadata.hasNumberedList) return 'step-by-step';
    if (metadata.hasEmojis) return 'friendly';
    return 'narrative';
  }

  private updateCaches(userId: string, patterns: LearningPattern[], preferences: UserPreference[]): void {
    // Update pattern cache
    const existingPatterns = this.patternCache.get(userId) || [];
    this.patternCache.set(userId, [...existingPatterns, ...patterns]);

    // Update preference cache
    const existingPreferences = this.preferenceCache.get(userId) || [];
    this.preferenceCache.set(userId, [...existingPreferences, ...preferences]);
  }

  /**
   * Process recent interactions for learning
   */
  private async processRecentInteractions(): Promise<void> {
    if (!this.supabase) return;

    try {
      // Get recent interactions (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: interactions, error } = await this.supabase
        .from('learning_interactions')
        .select('*')
        .gte('timestamp', oneHourAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error fetching recent interactions:', error);
        return;
      }

      if (!interactions || interactions.length === 0) return;

      console.log(`🧠 Processing ${interactions.length} recent interactions for learning`);

      // Process each interaction
      for (const interaction of interactions) {
        const context: InteractionContext = {
          userId: interaction.user_id,
          sessionId: interaction.session_id,
          query: interaction.query,
          response: interaction.response,
          agentId: interaction.agent_id,
          domain: interaction.domain,
          timestamp: new Date(interaction.timestamp),
          userFeedback: interaction.user_feedback,
          responseTime: interaction.response_time,
          metadata: interaction.metadata || {}
        };

        await this.learnFromInteraction(context);
      }

    } catch (error) {
      console.error('❌ Error processing recent interactions:', error);
    }
  }

  /**
   * Update learning patterns
   */
  private async updateLearningPatterns(): Promise<void> {
    console.log('🔄 Updating learning patterns...');
    
    // This would implement pattern consolidation and refinement
    // For now, we'll just log the action
    console.log('✅ Learning patterns updated');
  }

  /**
   * Generate learning insights
   */
  private async generateLearningInsights(): Promise<void> {
    console.log('💡 Generating learning insights...');
    
    // This would implement insight generation from accumulated patterns
    // For now, we'll just log the action
    console.log('✅ Learning insights generated');
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    // Check cache first
    const cached = this.preferenceCache.get(userId);
    if (cached) return cached;

    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user preferences:', error);
        return [];
      }

      const preferences = (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        preferenceType: p.preference_type,
        value: p.value,
        confidence: p.confidence,
        source: p.source,
        lastUpdated: new Date(p.last_updated),
        metadata: p.metadata || {}
      }));

      // Cache the results
      this.preferenceCache.set(userId, preferences);

      return preferences;

    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      return [];
    }
  }

  /**
   * Get learning patterns for user
   */
  async getUserPatterns(userId: string): Promise<LearningPattern[]> {
    // Check cache first
    const cached = this.patternCache.get(userId);
    if (cached) return cached;

    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('learning_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user patterns:', error);
        return [];
      }

      const patterns = (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        pattern: p.pattern,
        patternType: p.pattern_type,
        confidence: p.confidence,
        frequency: p.frequency,
        lastSeen: new Date(p.last_seen),
        metadata: p.metadata || {}
      }));

      // Cache the results
      this.patternCache.set(userId, patterns);

      return patterns;

    } catch (error) {
      console.error('❌ Error fetching user patterns:', error);
      return [];
    }
  }

  /**
   * Get learning statistics
   */
  getLearningStatistics(): {
    totalPatterns: number;
    totalPreferences: number;
    activeUsers: number;
    learningRate: number;
  } {
    const totalPatterns = Array.from(this.patternCache.values())
      .reduce((sum, patterns) => sum + patterns.length, 0);
    
    const totalPreferences = Array.from(this.preferenceCache.values())
      .reduce((sum, prefs) => sum + prefs.length, 0);
    
    const activeUsers = this.patternCache.size;
    
    const learningRate = activeUsers > 0 ? totalPatterns / activeUsers : 0;

    return {
      totalPatterns,
      totalPreferences,
      activeUsers,
      learningRate
    };
  }
}

export const memoryLearner = new MemoryLearner();
