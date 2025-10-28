/**
 * Chain-of-Thought Engine for Autonomous Modes
 * 
 * This engine handles goal decomposition and structured reasoning
 * using Chain-of-Thought methodology for Mode 3 and Mode 4.
 */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { 
  GoalUnderstanding, 
  CoTSubQuestion, 
  ExecutionPlan, 
  ExecutionPhase,
  Agent 
} from './autonomous-types';

// ============================================================================
// ZOD SCHEMAS FOR STRUCTURED OUTPUT
// ============================================================================

const GoalUnderstandingSchema = z.object({
  originalQuery: z.string().describe('The original user query'),
  translatedGoal: z.string().describe('Clear, actionable goal statement'),
  goalType: z.enum(['research', 'analysis', 'planning', 'problem-solving', 'creative']).describe('Type of goal'),
  complexity: z.enum(['low', 'medium', 'high', 'very-high']).describe('Complexity level'),
  estimatedSteps: z.number().describe('Estimated number of steps needed'),
  requiredTools: z.array(z.string()).describe('Tools needed to achieve the goal'),
  requiredDomains: z.array(z.string()).describe('Knowledge domains required'),
  successCriteria: z.array(z.string()).describe('Criteria for success'),
  constraints: z.array(z.string()).optional().describe('Any constraints or limitations')
});

const CoTSubQuestionSchema = z.object({
  id: z.string().describe('Unique identifier for the sub-question'),
  question: z.string().describe('The specific question to be answered'),
  priority: z.enum(['critical', 'important', 'nice-to-have']).describe('Priority level'),
  reasoning: z.string().describe('Why this question is important'),
  dependencies: z.array(z.string()).optional().describe('IDs of other questions this depends on')
});

const ExecutionPhaseSchema = z.object({
  id: z.string().describe('Unique identifier for the phase'),
  name: z.string().describe('Name of the phase'),
  description: z.string().describe('What this phase accomplishes'),
  order: z.number().describe('Order of execution'),
  subQuestions: z.array(z.string()).describe('IDs of sub-questions in this phase'),
  requiredTools: z.array(z.string()).describe('Tools needed for this phase'),
  successCriteria: z.array(z.string()).describe('Success criteria for this phase'),
  estimatedIterations: z.number().describe('Estimated iterations needed')
});

const ExecutionPlanSchema = z.object({
  goalId: z.string().describe('Unique identifier for the goal'),
  phases: z.array(ExecutionPhaseSchema).describe('Execution phases'),
  estimatedDuration: z.number().describe('Estimated duration in seconds'),
  maxIterations: z.number().describe('Maximum iterations allowed'),
  checkpointStrategy: z.enum(['none', 'phase', 'iteration']).describe('Checkpoint strategy')
});

// ============================================================================
// CHAIN-OF-THOUGHT ENGINE CLASS
// ============================================================================

export class ChainOfThoughtEngine {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      model: 'gpt-4',
      temperature: 0.3, // Lower temperature for more structured reasoning
      maxTokens: 2000,
    });
  }

  /**
   * Understand and translate user query into structured goal
   */
  async understandGoal(
    query: string, 
    agent?: Agent
  ): Promise<GoalUnderstanding> {
    console.log('🧠 [CoT] Understanding goal...');

    try {
      // Create structured output parser
      const parser = StructuredOutputParser.fromZodSchema(GoalUnderstandingSchema);
      
      // Create prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at understanding and translating user queries into structured goals.

{agentContext}

Given a user query, analyze and translate it into a structured goal understanding.

Consider:
1. What is the user really trying to achieve?
2. What type of goal is this (research, analysis, planning, problem-solving, creative)?
3. What is the complexity level?
4. What tools and domains are needed?
5. What are the success criteria?

{format_instructions}

User Query: {query}
`);

      const agentContext = agent 
        ? `You are ${agent.name}, an expert in ${agent.specialties?.join(', ') || 'general expertise'}.`
        : 'You are a general-purpose AI assistant.';

      const prompt = await promptTemplate.format({
        agentContext,
        query,
        format_instructions: parser.getFormatInstructions()
      });

      const messages = [
        new SystemMessage(prompt)
      ];

      const response = await this.llm.invoke(messages);
      const understanding = await parser.parse(response.content as string) as GoalUnderstanding;
      
      console.log('✅ [CoT] Goal understanding completed');
      return understanding;
    } catch (error) {
      console.error('❌ [CoT] Goal understanding failed:', error);
      throw new Error(`Goal understanding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decompose goal into sub-questions using Chain-of-Thought
   */
  async decomposeGoal(
    goalUnderstanding: GoalUnderstanding,
    agent?: Agent
  ): Promise<CoTSubQuestion[]> {
    console.log('🔍 [CoT] Decomposing goal into sub-questions...');

    try {
      // Create structured output parser for array of sub-questions
      const parser = StructuredOutputParser.fromZodSchema(z.array(CoTSubQuestionSchema));
      
      // Create prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at breaking down complex goals into structured sub-questions using Chain-of-Thought reasoning.

{agentContext}

Given a goal understanding, create 3-7 sub-questions that need to be answered to achieve the goal.

For each sub-question, consider:
1. What information is needed?
2. What are the dependencies between questions?
3. What is the priority level?
4. Why is this question important?

{format_instructions}

Goal Understanding:
- Original Query: {originalQuery}
- Translated Goal: {translatedGoal}
- Goal Type: {goalType}
- Complexity: {complexity}
- Required Domains: {requiredDomains}
- Success Criteria: {successCriteria}

Please decompose this into sub-questions using Chain-of-Thought reasoning.
`);

      const agentContext = agent 
        ? `You are ${agent.name}, an expert in ${agent.specialties?.join(', ') || 'goal decomposition'}.`
        : 'You are a general-purpose AI assistant.';

      const prompt = await promptTemplate.format({
        agentContext,
        originalQuery: goalUnderstanding.originalQuery,
        translatedGoal: goalUnderstanding.translatedGoal,
        goalType: goalUnderstanding.goalType,
        complexity: goalUnderstanding.complexity,
        requiredDomains: goalUnderstanding.requiredDomains.join(', '),
        successCriteria: goalUnderstanding.successCriteria.join(', '),
        format_instructions: parser.getFormatInstructions()
      });

      const messages = [
        new SystemMessage(prompt)
      ];

      const response = await this.llm.invoke(messages);
      const subQuestions = await parser.parse(response.content as string) as CoTSubQuestion[];
      
      // Add default values
      const enrichedSubQuestions = subQuestions.map((q, index) => ({
        ...q,
        status: 'pending' as const,
        confidence: 0,
        answer: undefined,
        reasoning: q.reasoning || `Sub-question ${index + 1} for goal decomposition`
      }));

      console.log(`✅ [CoT] Decomposed into ${enrichedSubQuestions.length} sub-questions`);
      return enrichedSubQuestions;
    } catch (error) {
      console.error('❌ [CoT] Goal decomposition failed:', error);
      throw new Error(`Goal decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create execution plan from sub-questions
   */
  async createExecutionPlan(
    goalUnderstanding: GoalUnderstanding,
    subQuestions: CoTSubQuestion[],
    agent?: Agent
  ): Promise<ExecutionPlan> {
    console.log('📋 [CoT] Creating execution plan...');

    try {
      // Create structured output parser
      const parser = StructuredOutputParser.fromZodSchema(ExecutionPlanSchema);
      
      // Create prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at creating structured execution plans for complex goals.

{agentContext}

Given a goal understanding and sub-questions, create a phased execution plan that:
1. Groups related sub-questions into logical phases
2. Orders phases based on dependencies
3. Estimates duration and iterations
4. Defines success criteria for each phase

{format_instructions}

Goal Understanding:
- Goal: {translatedGoal}
- Type: {goalType}
- Complexity: {complexity}
- Required Tools: {requiredTools}
- Required Domains: {requiredDomains}

Sub-Questions:
{subQuestionsList}

Create a structured execution plan.
`);

      const agentContext = agent 
        ? `You are ${agent.name}, an expert in ${agent.specialties?.join(', ') || 'execution planning'}.`
        : 'You are a general-purpose AI assistant.';

      const subQuestionsList = subQuestions.map(q => `- ${q.id}: ${q.question} (${q.priority})`).join('\n');

      const prompt = await promptTemplate.format({
        agentContext,
        translatedGoal: goalUnderstanding.translatedGoal,
        goalType: goalUnderstanding.goalType,
        complexity: goalUnderstanding.complexity,
        requiredTools: goalUnderstanding.requiredTools.join(', '),
        requiredDomains: goalUnderstanding.requiredDomains.join(', '),
        subQuestionsList,
        format_instructions: parser.getFormatInstructions()
      });

      const messages = [
        new SystemMessage(prompt)
      ];

      const response = await this.llm.invoke(messages);
      const plan = await parser.parse(response.content as string) as ExecutionPlan;
      
      console.log(`✅ [CoT] Created execution plan with ${plan.phases.length} phases`);
      return plan;
    } catch (error) {
      console.error('❌ [CoT] Execution plan creation failed:', error);
      throw new Error(`Execution plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prioritize sub-questions based on dependencies and importance
   */
  async prioritizeQuestions(subQuestions: CoTSubQuestion[]): Promise<CoTSubQuestion[]> {
    console.log('📊 [CoT] Prioritizing sub-questions...');

    // Sort by priority and dependencies
    const prioritized = [...subQuestions].sort((a, b) => {
      // First by priority
      const priorityOrder = { 'critical': 3, 'important': 2, 'nice-to-have': 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by dependencies (questions with fewer dependencies first)
      const aDeps = a.dependencies?.length || 0;
      const bDeps = b.dependencies?.length || 0;
      
      return aDeps - bDeps;
    });

    console.log('✅ [CoT] Sub-questions prioritized');
    return prioritized;
  }

  /**
   * Validate if a sub-question has been adequately answered
   */
  async validateAnswer(
    question: CoTSubQuestion,
    answer: string,
    context?: string
  ): Promise<{ isValid: boolean; confidence: number; reasoning: string }> {
    console.log(`🔍 [CoT] Validating answer for question: ${question.id}`);

    try {
      // Create validation schema
      const ValidationSchema = z.object({
        isValid: z.boolean().describe('Whether the answer is valid and complete'),
        confidence: z.number().min(0).max(1).describe('Confidence level from 0 to 1'),
        reasoning: z.string().describe('Explanation of the validation assessment')
      });

      const parser = StructuredOutputParser.fromZodSchema(ValidationSchema);
      
      const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at validating answers to complex questions.

Given a sub-question and its answer, assess:
1. Is the answer complete and relevant?
2. Does it address the question adequately?
3. What is the confidence level (0-1)?
4. What reasoning supports this assessment?

{format_instructions}

Question: {question}
Priority: {priority}
Answer: {answer}
{context}

Validate this answer.
`);

      const prompt = await promptTemplate.format({
        question: question.question,
        priority: question.priority,
        answer,
        context: context ? `Context: ${context}` : '',
        format_instructions: parser.getFormatInstructions()
      });

      const messages = [
        new SystemMessage(prompt)
      ];

      const response = await this.llm.invoke(messages);
      const validation = await parser.parse(response.content as string);
      
      console.log(`✅ [CoT] Answer validation completed (confidence: ${validation.confidence})`);
      return validation;
    } catch (error) {
      console.error('❌ [CoT] Answer validation failed:', error);
      return {
        isValid: false,
        confidence: 0,
        reasoning: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const chainOfThoughtEngine = new ChainOfThoughtEngine();
