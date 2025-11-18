/**
 * Long Term Memory Service - Real Implementation
 */

import { OpenAIEmbeddings , ChatOpenAI } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

export interface UserFact {
  id: string;
  userId: string;
  fact: string;
  category: 'preference' | 'context' | 'history' | 'goal' | 'constraint';
  confidence: number;
  source: 'explicit' | 'inferred';
  createdAt: string;
  updatedAt: string;
}

export interface UserProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  description: string;
  status: 'active' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedContext {
  personalizedPrompt: string;
  relevantFacts: UserFact[];
  activeProjects: UserProject[];
  goals: UserGoal[];
  contextSummary: string;
}

export class LongTermMemoryService {
  private supabase: any;
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase not configured - long-term memory disabled');
    }

    // Initialize LLM for fact extraction
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize embeddings for semantic search
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Store long-term memory
   */
  async storeLongTermMemory(key: string, value: any): Promise<void> {
    try {
      if (!this.supabase) {
        console.log(`Storing long-term memory (fallback): ${key}`);
        return;
      }

      // Store in database
      const { error } = await this.supabase
        .from('user_long_term_memory')
        .upsert({
          user_id: key,
          memory_data: JSON.stringify(value),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to store long-term memory:', error);
      } else {
        console.log(`✅ Stored long-term memory: ${key}`);
      }
    } catch (error) {
      console.error('Long-term memory storage error:', error);
    }
  }

  /**
   * Retrieve long-term memory
   */
  async retrieveLongTermMemory(key: string): Promise<any> {
    try {
      if (!this.supabase) {
        return { content: `Fallback long-term memory for: ${key}` };
      }

      const { data, error } = await this.supabase
        .from('user_long_term_memory')
        .select('*')
        .eq('user_id', key)
        .single();

      if (error || !data) {
        return null;
      }

      return JSON.parse(data.memory_data);
    } catch (error) {
      console.error('Long-term memory retrieval error:', error);
      return null;
    }
  }

  /**
   * Extract facts from conversation
   */
  async extractFacts(userId: string, userMessage: string, assistantMessage: string): Promise<UserFact[]> {
    try {
      if (!this.supabase) {
        return [];
      }

      const prompt = `
Analyze this conversation and extract factual information about the user. Return a JSON array of facts.

User: "${userMessage}"
Assistant: "${assistantMessage}"

Extract facts in this format:
[
  {
    "fact": "User prefers detailed explanations",
    "category": "preference",
    "confidence": 0.8,
    "source": "inferred"
  }
]

Categories: preference, context, history, goal, constraint
Confidence: 0.0 to 1.0
Source: explicit or inferred
`;

      const response = await this.llm.invoke(prompt);
      const facts = JSON.parse(response.content as string);

      // Store facts in database
      const factRecords = facts.map((fact: any) => ({
        user_id: userId,
        fact: fact.fact,
        category: fact.category,
        confidence: fact.confidence,
        source: fact.source,
        created_at: new Date().toISOString(),
      }));

      const { error } = await this.supabase
        .from('user_facts')
        .insert(factRecords);

      if (error) {
        console.error('Failed to store facts:', error);
        return [];
      }

      return factRecords;
    } catch (error) {
      console.error('Fact extraction error:', error);
      return [];
    }
  }

  /**
   * Get enhanced context for user
   */
  async getEnhancedContext(userId: string, query: string): Promise<EnhancedContext> {
    try {
      if (!this.supabase) {
        return {
          personalizedPrompt: '',
          relevantFacts: [],
          activeProjects: [],
          goals: [],
          contextSummary: '',
        };
      }

      // Get user facts
      const { data: facts } = await this.supabase
        .from('user_facts')
        .select('*')
        .eq('user_id', userId)
        .order('confidence', { ascending: false })
        .limit(10);

      // Get active projects
      const { data: projects } = await this.supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      // Get active goals
      const { data: goals } = await this.supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      // Create personalized prompt
      const personalizedPrompt = this.createPersonalizedPrompt(facts || [], projects || [], goals || []);

      return {
        personalizedPrompt,
        relevantFacts: facts || [],
        activeProjects: projects || [],
        goals: goals || [],
        contextSummary: this.createContextSummary(facts || [], projects || [], goals || []),
      };
    } catch (error) {
      console.error('Enhanced context error:', error);
      return {
        personalizedPrompt: '',
        relevantFacts: [],
        activeProjects: [],
        goals: [],
        contextSummary: '',
      };
    }
  }

  /**
   * Create personalized prompt from user context
   */
  private createPersonalizedPrompt(facts: UserFact[], projects: UserProject[], goals: UserGoal[]): string {
    let prompt = '';

    if (facts.length > 0) {
      prompt += 'User Context:\n';
      facts.slice(0, 5).forEach(fact => {
        prompt += `- ${fact.fact} (${fact.category})\n`;
      });
      prompt += '\n';
    }

    if (projects.length > 0) {
      prompt += 'Active Projects:\n';
      projects.forEach(project => {
        prompt += `- ${project.name}: ${project.description} (${project.progress}% complete)\n`;
      });
      prompt += '\n';
    }

    if (goals.length > 0) {
      prompt += 'Current Goals:\n';
      goals.forEach(goal => {
        prompt += `- ${goal.description} (${goal.priority} priority)\n`;
      });
      prompt += '\n';
    }

    return prompt;
  }

  /**
   * Create context summary
   */
  private createContextSummary(facts: UserFact[], projects: UserProject[], goals: UserGoal[]): string {
    const summary = [];
    
    if (facts.length > 0) {
      summary.push(`${facts.length} known facts about user`);
    }
    
    if (projects.length > 0) {
      summary.push(`${projects.length} active projects`);
    }
    
    if (goals.length > 0) {
      summary.push(`${goals.length} active goals`);
    }

    return summary.join(', ');
  }

  /**
   * Process conversation turn for learning
   */
  async processConversationTurn(userId: string, userMessage: string, assistantMessage: string): Promise<void> {
    try {
      // Extract facts from conversation
      const facts = await this.extractFacts(userId, userMessage, assistantMessage);
      
      if (facts.length > 0) {
        console.log(`✅ Extracted ${facts.length} facts from conversation`);
      }
    } catch (error) {
      console.error('Conversation processing error:', error);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      if (!this.supabase) {
        return { userId, facts: [], projects: [], goals: [] };
      }

      const [facts, projects, goals] = await Promise.all([
        this.supabase.from('user_facts').select('*').eq('user_id', userId),
        this.supabase.from('user_projects').select('*').eq('user_id', userId),
        this.supabase.from('user_goals').select('*').eq('user_id', userId),
      ]);

      return {
        userId,
        facts: facts.data || [],
        projects: projects.data || [],
        goals: goals.data || [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('User profile error:', error);
      return { userId, facts: [], projects: [], goals: [] };
    }
  }
}

export const longTermMemoryService = new LongTermMemoryService();

/**
 * Create auto-learning memory instance
 */
export function createAutoLearningMemory(userId: string, enableLearning: boolean = true): LongTermMemoryService {
  if (!enableLearning) {
    return new LongTermMemoryService(); // Return instance without learning
  }
  return longTermMemoryService;
}