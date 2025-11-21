/**
 * LangChain & LangGraph Type Definitions
 *
 * Comprehensive type definitions for LangChain/LangGraph integration.
 * Extends official types with custom domain-specific types.
 *
 * @module types/langchain
 */

import type {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  FunctionMessage
} from '@langchain/core/messages';
import type { Document } from '@langchain/core/documents';
import type { VectorStore, VectorStoreRetriever } from '@langchain/core/vectorstores';
import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseLLM } from '@langchain/core/language_models/llms';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import type { ChainValues } from '@langchain/core/utils/types';

// ============================================================================
// RE-EXPORT LANGCHAIN CORE TYPES
// ============================================================================

export type {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  FunctionMessage,
  Document,
  VectorStore,
  VectorStoreRetriever,
  Embeddings,
  BaseLLM,
  BaseChatModel,
  BaseCallbackHandler,
  ChainValues
};

// ============================================================================
// LANGGRAPH STATE TYPES
// ============================================================================

/**
 * Base state for all LangGraph workflows
 */
export interface BaseGraphState {
  readonly messages: ReadonlyArray<BaseMessage>;
  readonly [key: string]: unknown;
}

/**
 * State reducer function type for LangGraph
 */
export type StateReducer<T> = (currentState: T | undefined, update: T) => T;

/**
 * State channel configuration for LangGraph
 */
export interface StateChannel<T> {
  readonly value?: StateReducer<T>;
  readonly default?: () => T;
}

/**
 * LangGraph state schema definition
 */
export type StateSchema<T> = {
  readonly [K in keyof T]: StateChannel<T[K]>;
};

/**
 * LangGraph node function type
 */
export type GraphNode<TState extends BaseGraphState> = (
  state: TState
) => Promise<Partial<TState>> | Partial<TState>;

/**
 * LangGraph edge routing function type
 */
export type EdgeRouter<TState extends BaseGraphState> = (
  state: TState
) => string;

/**
 * LangGraph conditional edges configuration
 */
export interface ConditionalEdges<TState extends BaseGraphState> {
  readonly [key: string]: string;
}

// ============================================================================
// CHECKPOINTER TYPES
// ============================================================================

/**
 * Checkpoint data structure
 */
export interface Checkpoint<TState = unknown> {
  readonly id: string;
  readonly threadId: string;
  readonly state: TState;
  readonly timestamp: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Checkpointer interface for state persistence
 */
export interface Checkpointer<TState = unknown> {
  get(threadId: string): Promise<Checkpoint<TState> | null>;
  put(checkpoint: Checkpoint<TState>): Promise<void>;
  list(threadId: string, limit?: number): Promise<ReadonlyArray<Checkpoint<TState>>>;
  delete(threadId: string, checkpointId?: string): Promise<void>;
}

// ============================================================================
// STREAMING TYPES
// ============================================================================

/**
 * Streaming chunk from LLM
 */
export interface StreamingChunk {
  readonly content: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Streaming callback for real-time updates
 */
export type StreamingCallback = (chunk: StreamingChunk) => void | Promise<void>;

/**
 * Streaming options for LLM calls
 */
export interface StreamingOptions {
  readonly onToken?: StreamingCallback;
  readonly onStart?: () => void | Promise<void>;
  readonly onEnd?: () => void | Promise<void>;
  readonly onError?: (error: Error) => void | Promise<void>;
}

// ============================================================================
// VECTOR STORE TYPES
// ============================================================================

/**
 * Vector search result with score
 */
export interface VectorSearchResult {
  readonly document: Document;
  readonly score: number;
}

/**
 * Vector search options
 */
export interface VectorSearchOptions {
  readonly k?: number;
  readonly filter?: Record<string, unknown>;
  readonly scoreThreshold?: number;
}

/**
 * Vector store configuration
 */
export interface VectorStoreConfig {
  readonly embeddings: Embeddings;
  readonly dimension?: number;
  readonly metric?: 'cosine' | 'euclidean' | 'dotProduct';
}

// ============================================================================
// EMBEDDINGS TYPES
// ============================================================================

/**
 * Embedding result
 */
export type Embedding = ReadonlyArray<number>;

/**
 * Batch embedding result
 */
export type EmbeddingBatch = ReadonlyArray<Embedding>;

/**
 * Embedding options
 */
export interface EmbeddingOptions {
  readonly model?: string;
  readonly dimensions?: number;
  readonly batchSize?: number;
  readonly timeout?: number;
}

// ============================================================================
// LLM TYPES
// ============================================================================

/**
 * LLM generation result
 */
export interface LLMResult {
  readonly text: string;
  readonly metadata?: Readonly<{
    finishReason?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    model?: string;
  }>;
}

/**
 * LLM call options
 */
export interface LLMCallOptions {
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly stop?: ReadonlyArray<string>;
  readonly presencePenalty?: number;
  readonly frequencyPenalty?: number;
  readonly timeout?: number;
  readonly stream?: boolean;
}

/**
 * Chat model message with role
 */
export interface ChatMessage {
  readonly role: 'user' | 'assistant' | 'system' | 'function';
  readonly content: string;
  readonly name?: string;
  readonly functionCall?: {
    readonly name: string;
    readonly arguments: string;
  };
}

// ============================================================================
// CALLBACK TYPES
// ============================================================================

/**
 * Callback events for monitoring
 */
export interface CallbackEvents {
  readonly onLLMStart?: (
    llm: { name: string },
    prompts: ReadonlyArray<string>
  ) => void | Promise<void>;

  readonly onLLMEnd?: (
    output: LLMResult
  ) => void | Promise<void>;

  readonly onLLMError?: (
    error: Error
  ) => void | Promise<void>;

  readonly onChainStart?: (
    chain: { name: string },
    inputs: ChainValues
  ) => void | Promise<void>;

  readonly onChainEnd?: (
    outputs: ChainValues
  ) => void | Promise<void>;

  readonly onChainError?: (
    error: Error
  ) => void | Promise<void>;

  readonly onToolStart?: (
    tool: { name: string },
    input: string
  ) => void | Promise<void>;

  readonly onToolEnd?: (
    output: string
  ) => void | Promise<void>;

  readonly onToolError?: (
    error: Error
  ) => void | Promise<void>;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

/**
 * Agent action (tool call)
 */
export interface AgentAction {
  readonly tool: string;
  readonly toolInput: string | Record<string, unknown>;
  readonly log: string;
}

/**
 * Agent finish (final response)
 */
export interface AgentFinish {
  readonly returnValues: Record<string, unknown>;
  readonly log: string;
}

/**
 * Agent step result
 */
export type AgentStep = AgentAction | AgentFinish;

/**
 * Tool definition for agents
 */
export interface Tool {
  readonly name: string;
  readonly description: string;
  readonly call: (input: string | Record<string, unknown>) => Promise<string>;
}

// ============================================================================
// RETRIEVAL TYPES
// ============================================================================

/**
 * Retrieval QA chain input
 */
export interface RetrievalQAInput {
  readonly query: string;
  readonly chatHistory?: ReadonlyArray<BaseMessage>;
  readonly k?: number;
  readonly filter?: Record<string, unknown>;
}

/**
 * Retrieval QA chain output
 */
export interface RetrievalQAOutput {
  readonly answer: string;
  readonly sourceDocuments: ReadonlyArray<Document>;
}

// ============================================================================
// CUSTOM LANGCHAIN EXTENSIONS
// ============================================================================

/**
 * Enhanced document with vector metadata
 */
export interface EnhancedDocument extends Document {
  readonly metadata: Readonly<{
    source: string;
    title?: string;
    domain?: string;
    agentId?: string;
    createdAt?: string;
    [key: string]: unknown;
  }>;
}

/**
 * RAG context with multiple sources
 */
export interface RAGContext {
  readonly documents: ReadonlyArray<EnhancedDocument>;
  readonly combinedText: string;
  readonly sourceCount: number;
  readonly averageScore: number;
}

/**
 * Multi-query result
 */
export interface MultiQueryResult {
  readonly originalQuery: string;
  readonly generatedQueries: ReadonlyArray<string>;
  readonly allDocuments: ReadonlyArray<EnhancedDocument>;
  readonly deduplicatedDocuments: ReadonlyArray<EnhancedDocument>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * LangChain error with retry metadata
 */
export class LangChainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly metadata?: Readonly<Record<string, unknown>>
  ) {
    super(message);
    this.name = 'LangChainError';
  }
}

/**
 * Vector store error
 */
export class VectorStoreError extends LangChainError {
  constructor(
    message: string,
    public readonly operation: 'search' | 'insert' | 'delete' | 'update',
    metadata?: Readonly<Record<string, unknown>>
  ) {
    super(message, 'VECTOR_STORE_ERROR', true, metadata);
    this.name = 'VectorStoreError';
  }
}

/**
 * LLM timeout error
 */
export class LLMTimeoutError extends LangChainError {
  constructor(
    message: string,
    public readonly timeout: number,
    metadata?: Readonly<Record<string, unknown>>
  ) {
    super(message, 'LLM_TIMEOUT', true, metadata);
    this.name = 'LLMTimeoutError';
  }
}

// ============================================================================
// UTILITY TYPES FOR LANGCHAIN
// ============================================================================

/**
 * Extract state type from a LangGraph workflow
 */
export type ExtractStateType<T> = T extends GraphNode<infer TState> ? TState : never;

/**
 * Make a state property optional
 */
export type OptionalStateProperty<TState, K extends keyof TState> = Omit<TState, K> & {
  [P in K]?: TState[P];
};

/**
 * Require a state property
 */
export type RequiredStateProperty<TState, K extends keyof TState> = Omit<TState, K> & {
  [P in K]-?: NonNullable<TState[P]>;
};
