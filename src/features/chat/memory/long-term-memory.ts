import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { ChatOpenAI } from '@langchain/openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-4-turbo-preview',
  temperature: 0,
});

/**
 * Long-Term Memory Manager
 * Persists user preferences, facts, and context across ALL sessions
 */
export class LongTermMemory {
  private userId: string;
  private vectorStore: SupabaseVectorStore;

  constructor(userId: string) {
    this.userId = userId;
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'user_long_term_memory',
      queryName: 'match_user_memory',
    });
  }

  /**
   * Store User Fact
   * Extracts and stores important facts about user (preferences, context, history)
   */
  async storeFact(
    fact: string,
    category: 'preference' | 'context' | 'history' | 'goal' | 'constraint',
    source: 'explicit' | 'inferred',
    confidence: number = 1.0
  ) {
    await supabase.from('user_facts').insert({
      user_id: this.userId,
      fact,
      category,
      source,
      confidence,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      access_count: 1,
    });

    // Also store in vector DB for semantic search
    await this.vectorStore.addDocuments([
      {
        pageContent: fact,
        metadata: {
          user_id: this.userId,
          category,
          source,
          confidence,
          created_at: new Date().toISOString(),
        },
      },
    ]);

    console.log(`💾 Stored user fact: ${fact.substring(0, 50)}...`);
  }

  /**
   * Retrieve Relevant Facts
   * Semantic search for facts relevant to current query
   */
  async retrieveRelevantFacts(query: string, limit: number = 5) {
    try {
      // Use proper Supabase filter format
      const results = await this.vectorStore.similaritySearchWithScore(query, limit, {
        user_id: this.userId,
      });

      // Update access count and last accessed
      const factIds = results.map((r) => r[0].metadata.id).filter(Boolean);
      if (factIds.length > 0) {
        await supabase
          .from('user_facts')
          .update({
            access_count: supabase.sql`access_count + 1`,
            last_accessed: new Date().toISOString(),
          })
          .in('id', factIds);
      }

      return results.map(([doc, score]) => ({
        fact: doc.pageContent,
        category: doc.metadata.category,
        confidence: doc.metadata.confidence,
        relevanceScore: score,
        metadata: doc.metadata,
      }));
    } catch (error) {
      console.error('Error retrieving relevant facts:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get All Facts by Category
   */
  async getFactsByCategory(category: string) {
    const { data: facts } = await supabase
      .from('user_facts')
      .select('*')
      .eq('user_id', this.userId)
      .eq('category', category)
      .order('confidence', { ascending: false });

    return facts || [];
  }

  /**
   * Extract Facts from Conversation
   * Uses LLM to extract important facts from user messages
   */
  async extractFactsFromConversation(userMessage: string, assistantMessage: string) {
    const prompt = `Analyze this conversation and extract important facts about the user that should be remembered long-term.

User: ${userMessage}
Assistant: ${assistantMessage}

Extract facts in these categories:
- preference: User likes/dislikes, workflow preferences
- context: User's role, organization, projects, devices they're working on
- history: Past actions, decisions, outcomes
- goal: User's objectives, what they're trying to achieve
- constraint: Limitations, requirements, compliance needs

Return JSON array:
[
  {
    "fact": "Clear, standalone fact statement",
    "category": "preference|context|history|goal|constraint",
    "source": "explicit|inferred",
    "confidence": 0.0-1.0
  }
]

Only extract significant facts worth remembering. Return empty array if nothing important.`;

    try {
      const response = await llm.invoke(prompt);
      const facts = JSON.parse(response.content as string);

      // Store each extracted fact
      for (const fact of facts) {
        await this.storeFact(
          fact.fact,
          fact.category,
          fact.source,
          fact.confidence
        );
      }

      return facts;
    } catch (error) {
      console.error('Error extracting facts:', error);
      return [];
    }
  }

  /**
   * Build User Profile Summary
   * Generates comprehensive summary of everything known about user
   */
  async buildUserProfile() {
    const { data: allFacts } = await supabase
      .from('user_facts')
      .select('*')
      .eq('user_id', this.userId)
      .order('confidence', { ascending: false });

    if (!allFacts || allFacts.length === 0) {
      return {
        summary: 'No user profile data available yet.',
        categories: {},
      };
    }

    // Group by category
    const byCategory = allFacts.reduce((acc: any, fact: any) => {
      if (!acc[fact.category]) acc[fact.category] = [];
      acc[fact.category].push(fact);
      return acc;
    }, {});

    // Generate AI summary
    const factsText = allFacts.map((f: any) => `- ${f.fact}`).join('\n');
    const summaryPrompt = `Summarize this user profile into a concise paragraph:

${factsText}

Provide a natural language summary of who this user is, what they're working on, and how to best help them.`;

    const response = await llm.invoke(summaryPrompt);

    return {
      summary: response.content as string,
      categories: byCategory,
      totalFacts: allFacts.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Update Fact Confidence
   * Adjust confidence based on validation/invalidation
   */
  async updateFactConfidence(factId: string, newConfidence: number) {
    await supabase
      .from('user_facts')
      .update({ confidence: newConfidence })
      .eq('id', factId)
      .eq('user_id', this.userId);
  }

  /**
   * Delete Outdated or Incorrect Facts
   */
  async pruneOutdatedFacts(confidenceThreshold: number = 0.3) {
    await supabase
      .from('user_facts')
      .delete()
      .eq('user_id', this.userId)
      .lt('confidence', confidenceThreshold);

    console.log(`🗑️ Pruned facts below ${confidenceThreshold} confidence`);
  }

  /**
   * Store User Device/Project Context
   * Track devices and projects user is working on
   */
  async storeProjectContext(project: {
    name: string;
    type: 'device' | 'trial' | 'submission' | 'research';
    description: string;
    status: string;
    metadata?: any;
  }) {
    const { data } = await supabase
      .from('user_projects')
      .upsert(
        {
          user_id: this.userId,
          name: project.name,
          type: project.type,
          description: project.description,
          status: project.status,
          metadata: project.metadata,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: 'user_id,name' }
      )
      .select()
      .single();

    // Also store as fact
    await this.storeFact(
      `Working on ${project.type}: ${project.name} - ${project.description}`,
      'context',
      'explicit',
      1.0
    );

    return data;
  }

  /**
   * Get Active Projects
   */
  async getActiveProjects() {
    const { data: projects } = await supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', this.userId)
      .in('status', ['active', 'in_progress'])
      .order('last_accessed', { ascending: false });

    return projects || [];
  }

  /**
   * Store User Preferences
   */
  async storePreference(key: string, value: any, description?: string) {
    await supabase.from('user_preferences').upsert(
      {
        user_id: this.userId,
        preference_key: key,
        preference_value: value,
        description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,preference_key' }
    );

    // Also store as fact
    await this.storeFact(
      `User preference: ${key} = ${JSON.stringify(value)}${
        description ? ` (${description})` : ''
      }`,
      'preference',
      'explicit',
      1.0
    );
  }

  /**
   * Get User Preferences
   */
  async getPreferences() {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', this.userId);

    return prefs?.reduce((acc: any, pref: any) => {
      acc[pref.preference_key] = pref.preference_value;
      return acc;
    }, {});
  }

  /**
   * Track User Goals
   */
  async trackGoal(goal: {
    title: string;
    description: string;
    targetDate?: string;
    milestones?: string[];
  }) {
    const { data } = await supabase
      .from('user_goals')
      .insert({
        user_id: this.userId,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate,
        milestones: goal.milestones,
        status: 'active',
        progress: 0,
      })
      .select()
      .single();

    // Store as fact
    await this.storeFact(
      `User goal: ${goal.title} - ${goal.description}`,
      'goal',
      'explicit',
      1.0
    );

    return data;
  }

  /**
   * Get Active Goals
   */
  async getActiveGoals() {
    const { data: goals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return goals || [];
  }

  /**
   * Update Goal Progress
   */
  async updateGoalProgress(goalId: string, progress: number, notes?: string) {
    await supabase
      .from('user_goals')
      .update({
        progress,
        status: progress >= 100 ? 'completed' : 'active',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', this.userId);
  }

  /**
   * Get Personalized Context for Query
   * Combines all relevant long-term memory for current query
   */
  async getPersonalizedContext(query: string) {
    // Get relevant facts
    const relevantFacts = await this.retrieveRelevantFacts(query, 5);

    // Get active projects
    const activeProjects = await this.getActiveProjects();

    // Get active goals
    const activeGoals = await this.getActiveGoals();

    // Get preferences
    const preferences = await this.getPreferences();

    return {
      relevantFacts: relevantFacts.map((f) => f.fact),
      activeProjects: activeProjects.map((p) => ({
        name: p.name,
        type: p.type,
        description: p.description,
      })),
      activeGoals: activeGoals.map((g) => ({
        title: g.title,
        description: g.description,
        progress: g.progress,
      })),
      preferences,
      contextSummary: this.buildContextSummary(
        relevantFacts,
        activeProjects,
        activeGoals,
        preferences
      ),
    };
  }

  /**
   * Build Context Summary for Agent
   */
  private buildContextSummary(
    facts: any[],
    projects: any[],
    goals: any[],
    preferences: any
  ) {
    const parts: string[] = [];

    if (facts.length > 0) {
      parts.push(`Relevant user context:\n${facts.map((f) => `- ${f.fact}`).join('\n')}`);
    }

    if (projects.length > 0) {
      parts.push(
        `\nActive projects:\n${projects
          .map((p) => `- ${p.name} (${p.type}): ${p.description}`)
          .join('\n')}`
      );
    }

    if (goals.length > 0) {
      parts.push(
        `\nCurrent goals:\n${goals
          .map((g) => `- ${g.title}: ${g.description} (${g.progress}% complete)`)
          .join('\n')}`
      );
    }

    if (preferences && Object.keys(preferences).length > 0) {
      parts.push(
        `\nUser preferences:\n${Object.entries(preferences)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')}`
      );
    }

    return parts.join('\n') || 'No personalized context available.';
  }
}

/**
 * Auto-Learning Memory System
 * Automatically extracts and stores facts as user interacts
 */
export class AutoLearningMemory {
  private longTermMemory: LongTermMemory;
  private userId: string;
  private learningEnabled: boolean;

  constructor(userId: string, enableLearning: boolean = true) {
    this.userId = userId;
    this.longTermMemory = new LongTermMemory(userId);
    this.learningEnabled = enableLearning;
  }

  /**
   * Extract Facts From Conversation
   * Public wrapper for fact extraction
   */
  async extractFactsFromConversation(userMessage: string, assistantMessage: string) {
    if (!this.learningEnabled) return [];

    return await this.longTermMemory.extractFactsFromConversation(
      userMessage,
      assistantMessage
    );
  }

  /**
   * Process Conversation Turn
   * Automatically extracts and stores important facts
   */
  async processConversationTurn(userMessage: string, assistantMessage: string) {
    if (!this.learningEnabled) return;

    // Extract facts in background
    const facts = await this.extractFactsFromConversation(
      userMessage,
      assistantMessage
    );

    console.log(`🧠 Learned ${facts.length} new facts about user`);
    return facts;
  }

  /**
   * Get Enhanced Context
   * Returns personalized context for next query
   */
  async getEnhancedContext(query: string) {
    return await this.longTermMemory.getPersonalizedContext(query);
  }

  /**
   * Store Explicit User Information
   */
  async storeUserInfo(info: {
    type: 'project' | 'preference' | 'goal' | 'fact';
    data: any;
  }) {
    switch (info.type) {
      case 'project':
        return await this.longTermMemory.storeProjectContext(info.data);
      case 'preference':
        return await this.longTermMemory.storePreference(
          info.data.key,
          info.data.value,
          info.data.description
        );
      case 'goal':
        return await this.longTermMemory.trackGoal(info.data);
      case 'fact':
        return await this.longTermMemory.storeFact(
          info.data.fact,
          info.data.category,
          'explicit',
          1.0
        );
    }
  }

  /**
   * Get User Profile Summary
   */
  async getUserProfile() {
    return await this.longTermMemory.buildUserProfile();
  }
}

/**
 * Helper: Initialize long-term memory for user
 */
export async function initializeLongTermMemory(userId: string) {
  return new LongTermMemory(userId);
}

/**
 * Helper: Create auto-learning memory system
 */
export function createAutoLearningMemory(userId: string, enableLearning: boolean = true) {
  return new AutoLearningMemory(userId, enableLearning);
}
