// Icons are not used - tasks use emoji icons instead
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  config: {
    model?: string;
    temperature?: number;
    tools?: string[];
    systemPrompt?: string;
    agents?: string[];
    rags?: string[];
  };
}

// Pre-defined tasks library
export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'search_pubmed',
    name: 'Search PubMed',
    description: 'Search medical literature from PubMed database',
    icon: '🔬',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['pubmed'],
      systemPrompt: 'You are a medical research specialist. Search PubMed for relevant research papers.',
    },
  },
  {
    id: 'search_clinical_trials',
    name: 'Search Clinical Trials',
    description: 'Search for clinical trial data from ClinicalTrials.gov',
    icon: '🏥',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['clinical_trials'],
      systemPrompt: 'You are a clinical research specialist. Search ClinicalTrials.gov for trial information.',
    },
  },
  {
    id: 'fda_search',
    name: 'FDA Database Search',
    description: 'Search FDA databases for approvals and guidance',
    icon: '⚖️',
    category: 'Regulatory',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['fda'],
      systemPrompt: 'You are a regulatory affairs specialist. Search FDA databases for official information.',
    },
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for information',
    icon: '🌐',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['web_search'],
      systemPrompt: 'You are a research assistant. Search the web for relevant information.',
    },
  },
  {
    id: 'arxiv_search',
    name: 'Search arXiv',
    description: 'Search arXiv for academic papers',
    icon: '📚',
    category: 'Research',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['arxiv'],
      systemPrompt: 'You are an academic research specialist. Search arXiv for relevant papers.',
    },
  },
  {
    id: 'rag_query',
    name: 'RAG Query',
    description: 'Query internal knowledge base using RAG',
    icon: '💾',
    category: 'Data',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['rag'],
      systemPrompt: 'You are a knowledge base specialist. Query the RAG system for relevant information.',
    },
  },
  {
    id: 'rag_archive',
    name: 'RAG Archive',
    description: 'Archive data to internal knowledge base using RAG',
    icon: '📦',
    category: 'Data',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      tools: ['rag'],
      systemPrompt: 'You are a knowledge base specialist. Archive research findings and data to the RAG system for future retrieval.',
    },
  },
  {
    id: 'cache_lookup',
    name: 'Cache Lookup',
    description: 'Look up cached results from previous queries',
    icon: '🔍',
    category: 'Data',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Look up cached results from previous queries to avoid redundant computation.',
    },
  },
  {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from documents',
    icon: '📄',
    category: 'Data',
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      tools: ['scraper'],
      systemPrompt: 'You are a data extraction specialist. Extract structured data from documents accurately.',
    },
  },
  {
    id: 'text_analysis',
    name: 'Text Analysis',
    description: 'Analyze and summarize text content',
    icon: '📊',
    category: 'Analysis',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'You are a text analysis specialist. Analyze and summarize text content effectively.',
    },
  },
  // Control Flow
  {
    id: 'if_condition',
    name: 'If / Else',
    description: 'Branch execution based on a boolean condition',
    icon: '🔀',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Evaluate a boolean condition and route execution to the true or false branch.',
    },
  },
  {
    id: 'switch_case',
    name: 'Switch',
    description: 'Route execution based on a value with multiple cases',
    icon: '⏭️',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Evaluate a value and route execution based on matching case labels.',
    },
  },
  {
    id: 'loop_while',
    name: 'Loop (While)',
    description: 'Repeat tasks while a condition remains true',
    icon: '🔁',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Repeat a body of work while a boolean condition is true. Include iteration cap for safety.',
    },
  },
  {
    id: 'for_each',
    name: 'For Each',
    description: 'Iterate over a list and run tasks per item',
    icon: '📦',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Iterate over a collection and execute the inner tasks for each element.',
    },
  },
  {
    id: 'parallel',
    name: 'Parallel',
    description: 'Run multiple branches concurrently and join',
    icon: '⧉',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute branches in parallel and join results when all complete.',
    },
  },
  {
    id: 'merge',
    name: 'Merge',
    description: 'Join multiple incoming branches into one',
    icon: '🔗',
    category: 'Control Flow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Merge the outputs of multiple upstream branches into a single downstream path.',
    },
  },
  // Panel Tasks
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'AI moderator that facilitates panel discussion',
    icon: '🎤',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'You are an AI moderator facilitating a structured expert panel discussion. Manage time, pose questions, synthesize inputs, and guide consensus building.',
    },
  },
  {
    id: 'expert_agent',
    name: 'Expert',
    description: 'Domain expert task for panel participation',
    icon: '👤',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['rag', 'pubmed', 'fda'],
      systemPrompt: 'You are a domain expert participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building.',
    },
  },
  // Ask Expert Agents
  {
    id: 'clinical_researcher_agent',
    name: 'Clinical Researcher',
    description: 'Expert in clinical trials, protocols, and research methodology',
    icon: '🔬',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['pubmed', 'clinical_trials', 'rag'],
      systemPrompt: 'You are a clinical research specialist with expertise in clinical trial design, protocol development, statistical analysis, and research methodology. Provide evidence-based insights on clinical research questions.',
    },
  },
  {
    id: 'medical_specialist_agent',
    name: 'Medical Specialist',
    description: 'Expert in medical diagnosis, treatment protocols, and patient care',
    icon: '🩺',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['pubmed', 'rag'],
      systemPrompt: 'You are a medical specialist with deep expertise in clinical medicine, diagnosis, treatment protocols, and patient care. Provide medical insights based on clinical evidence and best practices.',
    },
  },
  {
    id: 'regulatory_affairs_agent',
    name: 'Regulatory Affairs Expert',
    description: 'Expert in FDA/EMA regulations, compliance, and regulatory pathways',
    icon: '📋',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.6,
      tools: ['fda', 'rag'],
      systemPrompt: 'You are a regulatory affairs specialist with expertise in FDA, EMA, and global regulatory requirements. Provide guidance on regulatory pathways, compliance, and submission strategies.',
    },
  },
  {
    id: 'pharma_intelligence_agent',
    name: 'Pharma Intelligence Expert',
    description: 'Expert in pharmaceutical industry insights, market analysis, and drug development',
    icon: '💊',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['pubmed', 'fda', 'web_search', 'rag'],
      systemPrompt: 'You are a pharmaceutical intelligence specialist with expertise in drug development, market analysis, competitive intelligence, and industry trends. Provide strategic insights on pharma-related questions.',
    },
  },
  {
    id: 'quality_assurance_agent',
    name: 'Quality Assurance Expert',
    description: 'Expert in GxP compliance, quality systems, and regulatory quality requirements',
    icon: '✅',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: ['fda', 'rag'],
      systemPrompt: 'You are a quality assurance specialist with expertise in GxP compliance, quality management systems, validation, and regulatory quality requirements. Provide guidance on quality and compliance matters.',
    },
  },
  {
    id: 'market_access_agent',
    name: 'Market Access Expert',
    description: 'Expert in payer strategies, reimbursement, HTA, and market access',
    icon: '💰',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['web_search', 'rag'],
      systemPrompt: 'You are a market access specialist with expertise in payer strategies, reimbursement models, health technology assessment (HTA), and market access planning. Provide insights on market access and reimbursement.',
    },
  },
  {
    id: 'medical_writer_agent',
    name: 'Medical Writer',
    description: 'Expert in medical writing, regulatory documents, and scientific communication',
    icon: '✍️',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.6,
      tools: ['rag'],
      systemPrompt: 'You are a medical writer with expertise in regulatory documents, scientific publications, medical communications, and ICH guidelines. Provide guidance on medical writing and documentation.',
    },
  },
  {
    id: 'biostatistician_agent',
    name: 'Biostatistician',
    description: 'Expert in biostatistics, clinical trial analysis, and statistical methodology',
    icon: '📊',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      tools: ['pubmed', 'rag'],
      systemPrompt: 'You are a biostatistician with expertise in clinical trial design, statistical analysis, data interpretation, and regulatory statistics. Provide statistical insights and methodology guidance.',
    },
  },
  {
    id: 'pharmacovigilance_agent',
    name: 'Pharmacovigilance Expert',
    description: 'Expert in drug safety, adverse event reporting, and risk management',
    icon: '⚠️',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.6,
      tools: ['fda', 'pubmed', 'rag'],
      systemPrompt: 'You are a pharmacovigilance specialist with expertise in drug safety, adverse event reporting, risk management plans, and safety signal detection. Provide guidance on pharmacovigilance and drug safety.',
    },
  },
  {
    id: 'clinical_operations_agent',
    name: 'Clinical Operations Expert',
    description: 'Expert in clinical trial operations, site management, and study execution',
    icon: '🏥',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['clinical_trials', 'rag'],
      systemPrompt: 'You are a clinical operations specialist with expertise in clinical trial management, site operations, patient recruitment, and study execution. Provide insights on clinical operations and trial management.',
    },
  },
  {
    id: 'medical_agent',
    name: 'Medical Agent',
    description: 'Medical research specialist agent for clinical trials, drug mechanisms, efficacy, safety data',
    icon: '🏥',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['pubmed', 'clinical_trials', 'rag'],
      systemPrompt: 'You are a medical research specialist. Provide expert analysis on clinical trials, drug mechanisms, efficacy, and safety data.',
    },
  },
  {
    id: 'digital_health_agent',
    name: 'Digital Health Agent',
    description: 'Digital health specialist agent for health tech innovations, digital therapeutics, AI/ML',
    icon: '💻',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['web_search', 'arxiv', 'rag'],
      systemPrompt: 'You are a digital health specialist. Provide expert analysis on health tech innovations, digital therapeutics, and AI/ML applications.',
    },
  },
  {
    id: 'regulatory_agent',
    name: 'Regulatory Agent',
    description: 'Regulatory affairs specialist agent for FDA/EMA approvals, compliance, regulatory pathways',
    icon: '⚖️',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: ['fda', 'rag'],
      systemPrompt: 'You are a regulatory affairs specialist. Provide expert analysis on FDA/EMA approvals, compliance, and regulatory pathways.',
    },
  },
  {
    id: 'aggregator_agent',
    name: 'Aggregator Agent',
    description: 'Aggregator agent that synthesizes findings and archives to RAG',
    icon: '📊',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: ['rag_archive'],
      systemPrompt: 'You are an aggregator agent. Synthesize findings from multiple sources and archive them to the RAG system.',
    },
  },
  {
    id: 'copywriter_agent',
    name: 'Copywriter Agent',
    description: 'Copywriter agent that generates professional reports and documentation',
    icon: '✍️',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'You are a copywriter agent. Generate professional reports, documentation, and written deliverables.',
    },
  },
  {
    id: 'opening_statements',
    name: 'Opening Statements',
    description: 'Sequential opening statements from all experts (60-90s each)',
    icon: '📢',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute sequential opening statements from all expert agents. Each expert has 60-90 seconds to present their initial perspective.',
    },
  },
  {
    id: 'discussion_round',
    name: 'Discussion Round',
    description: 'Moderated discussion round with Q&A (3-4 minutes)',
    icon: '💬',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Execute a moderated discussion round. Moderator poses questions, experts respond sequentially, building on each other\'s points.',
    },
  },
  {
    id: 'consensus_calculator',
    name: 'Consensus Calculator',
    description: 'Calculate consensus level and identify dissent',
    icon: '📊',
    category: 'Panel',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Calculate consensus level from expert positions. Identify majority view, minority opinions, and overall agreement percentage.',
    },
  },
  {
    id: 'qna',
    name: 'Q&A Session',
    description: 'Question and answer session where moderator fields questions and experts respond',
    icon: '❓',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Facilitate a Q&A session. Field questions from participants, route them to appropriate experts, and ensure comprehensive answers.',
    },
  },
  {
    id: 'documentation_generator',
    name: 'Documentation Generator',
    description: 'Generate formal panel documentation and deliverables',
    icon: '📄',
    category: 'Panel',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate formal panel documentation: executive summary, consensus report, voting record, evidence appendix, and action items.',
    },
  },
  // Workflow Phase Nodes (Structured Panel)
  {
    id: 'initialize',
    name: 'Initialize Panel',
    description: 'Initialize panel workflow, extract tasks, and set up state',
    icon: '🚀',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Initialize the panel workflow by extracting tasks from the workflow configuration and setting up the initial state.',
    },
  },
  {
    id: 'consensus_building',
    name: 'Consensus Building',
    description: 'Build consensus from expert positions and generate consensus statement',
    icon: '🤝',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Build consensus from expert positions. Calculate final consensus level, identify dissenting opinions, and generate a consensus statement.',
    },
  },
  {
    id: 'consensus_assessment',
    name: 'Consensus Assessment',
    description: 'Assess consensus level and decide next steps (continue discussion or proceed)',
    icon: '📊',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Assess the current consensus level from expert positions. Determine if consensus is sufficient to proceed or if another discussion round is needed.',
    },
  },
  {
    id: 'documentation',
    name: 'Documentation Phase',
    description: 'Generate final panel documentation and report',
    icon: '📋',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate comprehensive panel documentation including executive summary, consensus report, and action items.',
    },
  },
  // Workflow Phase Nodes (Open Panel)
  {
    id: 'opening_round',
    name: 'Opening Round',
    description: 'Initial perspectives from all experts in open panel format',
    icon: '🎯',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Facilitate opening round where experts provide initial, diverse perspectives on the topic.',
    },
  },
  {
    id: 'free_dialogue',
    name: 'Free Dialogue',
    description: 'Free-form collaborative discussion with idea building',
    icon: '💭',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.8,
      tools: [],
      systemPrompt: 'Facilitate free-form dialogue where experts build on each other\'s ideas and explore innovative approaches.',
    },
  },
  {
    id: 'theme_clustering',
    name: 'Theme Clustering',
    description: 'Identify themes, innovation clusters, and convergence points',
    icon: '🔍',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Analyze the discussion to identify key themes, innovation clusters, convergence points, and divergence points.',
    },
  },
  {
    id: 'final_perspectives',
    name: 'Final Perspectives',
    description: 'Collect final perspectives from all experts',
    icon: '🎤',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Collect final perspectives from all experts, considering the identified themes and clusters.',
    },
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    description: 'Final synthesis and report generation for open panel',
    icon: '✨',
    category: 'Panel Workflow',
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Generate final synthesis report combining all perspectives, themes, and innovation clusters from the open panel discussion.',
    },
  },
  // Mode 1 Workflow Nodes
  {
    id: 'load_agent_profile',
    name: 'Load Agent Profile',
    description: 'Fetch agent profile, persona, knowledge bases, and sub-agent pool (1-2s)',
    icon: '👤',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Load agent profile from database, including persona, knowledge base IDs, and available sub-agents.',
    },
  },
  {
    id: 'load_conversation_history',
    name: 'Load Conversation History',
    description: 'Load conversation history (last 10 turns) and build message history (2-3s)',
    icon: '💬',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Load last 10 conversation turns from database and build LangChain message history.',
    },
  },
  {
    id: 'rag_hybrid_search',
    name: 'RAG Hybrid Search',
    description: 'Hybrid RAG search combining semantic (Pinecone) and keyword (PostgreSQL) retrieval (3-5s)',
    icon: '🔍',
    category: 'Mode 1 Workflow',
    config: {
      model: 'text-embedding-3-large',
      temperature: 0.0,
      tools: ['pinecone_search', 'postgresql_fts'],
      systemPrompt: 'Perform hybrid RAG search using semantic vector search and keyword full-text search, then fuse results using Reciprocal Rank Fusion (RRF).',
    },
  },
  {
    id: 'chain_of_thought_reasoning',
    name: 'Chain-of-Thought Reasoning',
    description: 'Analyze query, determine tool needs, specialist needs, and plan response strategy (3-5s)',
    icon: '🧠',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Use chain-of-thought reasoning to analyze the query, determine what tools are needed, whether specialists should be spawned, and plan the response strategy.',
    },
  },
  {
    id: 'spawn_specialist_agents',
    name: 'Spawn Specialist Agents',
    description: 'Dynamically spawn Level 3 specialist sub-agents for deep analysis (2-3s)',
    icon: '🤖',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Initialize specialist sub-agents (e.g., Testing Requirements Specialist, Predicate Search Specialist) and assign them specific tasks for deep analysis.',
    },
  },
  {
    id: 'execute_tools',
    name: 'Execute Tools',
    description: 'Execute tools like predicate_device_search, regulatory_database_query, standards_search (3-7s)',
    icon: '🛠️',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: ['predicate_device_search', 'regulatory_database_query', 'standards_search', 'web_search', 'document_analysis'],
      systemPrompt: 'Execute required tools in parallel when possible. Tools include FDA API searches, regulatory database queries, standards searches, web searches, and document analysis.',
    },
  },
  {
    id: 'generate_streaming_response',
    name: 'Generate Streaming Response',
    description: 'Synthesize comprehensive expert response with streaming, extract citations (5-10s)',
    icon: '✍️',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Generate a comprehensive, expert-level response that synthesizes all context, tool results, and specialist analyses. Stream tokens in real-time and extract source citations.',
    },
  },
  {
    id: 'persist_conversation',
    name: 'Persist Conversation',
    description: 'Save conversation to database, update session statistics, log analytics (1-2s)',
    icon: '💾',
    category: 'Mode 1 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Persist user and assistant messages to database, update session statistics (total messages, tokens, cost), and log analytics events.',
    },
  },
  // Mode 2 Workflow Nodes
  {
    id: 'query_analysis',
    name: 'Query Analysis',
    description: 'Analyze user query to determine intent, domains, and complexity (2-3s)',
    icon: '🔍',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Parse user query to extract intent, identify required domains, determine complexity level, and identify expertise areas needed.',
    },
  },
  {
    id: 'automatic_expert_selection',
    name: 'Automatic Expert Selection',
    description: 'AI selects best expert(s) from pool based on query analysis (2-3s)',
    icon: '🤖',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.2,
      tools: [],
      systemPrompt: 'Query expert profiles, score by relevance, select top 1-2 experts, load expert personas, and initialize expert contexts.',
    },
  },
  {
    id: 'load_selected_agents',
    name: 'Load Selected Agents',
    description: 'Fetch selected expert profiles, personas, and knowledge bases (1-2s)',
    icon: '👤',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Load primary and secondary expert profiles, knowledge_base_ids, sub-agent pools, and create SystemMessages.',
    },
  },
  {
    id: 'rag_hybrid_search_multi_expert',
    name: 'RAG Multi-Expert Hybrid Search',
    description: 'Hybrid RAG search across multiple expert knowledge bases (3-5s)',
    icon: '🔍',
    category: 'Mode 2 Workflow',
    config: {
      model: 'text-embedding-3-large',
      temperature: 0.0,
      tools: ['pinecone_search', 'postgresql_fts'],
      systemPrompt: 'Perform hybrid RAG search across selected expert knowledge bases using semantic and keyword search, then fuse results.',
    },
  },
  {
    id: 'multi_expert_reasoning',
    name: 'Multi-Expert Reasoning',
    description: 'Chain-of-thought analysis with multi-expert coordination (4-6s)',
    icon: '🧠',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Build reasoning prompts for each expert, analyze query from multiple perspectives, determine tool and specialist needs, check for expert switching, and plan coordinated response.',
    },
  },
  {
    id: 'spawn_multi_expert_specialists',
    name: 'Spawn Multi-Expert Specialists',
    description: 'Spawn Level 3 specialists across multiple experts (2-4s)',
    icon: '🤖',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Initialize specialists for primary and secondary experts, assign coordinated tasks, register spawned IDs, and set up inter-specialist communication.',
    },
  },
  {
    id: 'execute_multi_expert_tools',
    name: 'Execute Multi-Expert Tools',
    description: 'Execute tools across multiple expert domains (3-7s)',
    icon: '🛠️',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: ['predicate_device_search', 'regulatory_database_query', 'standards_search', 'web_search', 'document_analysis', 'clinical_trials_search', 'eu_regulatory_search'],
      systemPrompt: 'Execute tools for primary and secondary experts in parallel when possible, then merge tool results.',
    },
  },
  {
    id: 'coordinate_multi_expert_input',
    name: 'Coordinate Multi-Expert Input',
    description: 'Coordinate and merge multi-expert perspectives (2-3s)',
    icon: '🤝',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Merge insights from multiple experts, resolve conflicting perspectives, create unified response outline, determine primary responder, and prepare expert attribution.',
    },
  },
  {
    id: 'generate_multi_expert_response',
    name: 'Generate Multi-Expert Response',
    description: 'Synthesize unified expert response with attribution (5-10s)',
    icon: '✍️',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Build comprehensive multi-expert prompt, generate unified response with streaming, attribute insights to experts, extract citations, and calculate metrics.',
    },
  },
  {
    id: 'persist_multi_expert_conversation',
    name: 'Persist Multi-Expert Conversation',
    description: 'Persist conversation with expert tracking (1-2s)',
    icon: '💾',
    category: 'Mode 2 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'INSERT user and assistant messages with expert attribution, UPDATE session stats, track expert usage, log analytics event, and optionally cache response.',
    },
  },
  // Mode 3 Workflow Nodes
  {
    id: 'load_autonomous_agent',
    name: 'Load Autonomous Agent',
    description: 'Fetch expert profile for autonomous execution (1-2s)',
    icon: '👤',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Query agents table, load agent profile, load knowledge_base_ids, load sub-agent pool, and initialize autonomous execution context.',
    },
  },
  {
    id: 'load_execution_context',
    name: 'Load Execution Context',
    description: 'Load historical autonomous executions and artifacts (2-3s)',
    icon: '💬',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Query previous autonomous tasks by this expert, load relevant artifacts, load user preferences, and calculate context statistics.',
    },
  },
  {
    id: 'goal_analysis',
    name: 'Goal Analysis',
    description: 'Analyze goal to understand requirements and deliverables (3-5s)',
    icon: '🎯',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Parse goal statement, identify deliverables required, determine complexity level, identify domain requirements, and assess feasibility.',
    },
  },
  {
    id: 'goal_decomposition',
    name: 'Goal Decomposition',
    description: 'Decompose goal into executable sub-tasks with plan (4-6s)',
    icon: '📋',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Break goal into sub-tasks, define execution sequence, identify dependencies, estimate time per step, define approval checkpoints, and create execution plan.',
    },
  },
  {
    id: 'rag_information_gathering',
    name: 'RAG Information Gathering',
    description: 'Gather all information needed for autonomous execution (5-10s)',
    icon: '🔍',
    category: 'Mode 3 Workflow',
    config: {
      model: 'text-embedding-3-large',
      temperature: 0.0,
      tools: ['pinecone_search', 'postgresql_fts', 'web_search'],
      systemPrompt: 'Generate embedding for goal, semantic search across knowledge bases, keyword search for relevant standards, web search for latest guidance, retrieve protocol templates, and build comprehensive context window.',
    },
  },
  {
    id: 'initialize_execution_state',
    name: 'Initialize Execution State',
    description: 'Initialize multi-step execution state (1-2s)',
    icon: '⚙️',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Set current_step = 0, initialize execution state, create artifact registry, set up progress tracking, and initialize error handling.',
    },
  },
  {
    id: 'execute_autonomous_step',
    name: 'Execute Autonomous Step',
    description: 'Execute current step of autonomous workflow (10-30s per step)',
    icon: '⚡',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Load current step from plan, execute step with tools, generate partial artifacts, update execution state, log progress, and emit status updates.',
    },
  },
  {
    id: 'spawn_step_specialists',
    name: 'Spawn Step Specialists',
    description: 'Spawn specialists for complex step execution (2-4s)',
    icon: '🤖',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Determine specialists needed for current step, initialize Protocol Writer Specialist, Statistical Design Specialist, IRB Compliance Specialist, assign step-specific tasks, and register spawned IDs.',
    },
  },
  {
    id: 'execute_step_tools',
    name: 'Execute Step Tools',
    description: 'Execute tools to complete current step (5-15s per step)',
    icon: '🛠️',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: ['clinical_trials_search', 'protocol_template_generator', 'statistical_calculator', 'budget_estimator', 'timeline_generator', 'document_generator'],
      systemPrompt: 'Execute tools needed for current step, generate intermediate artifacts, validate outputs, and store results.',
    },
  },
  {
    id: 'human_approval_checkpoint',
    name: 'Human Approval Checkpoint',
    description: 'Human-in-the-loop approval checkpoint (User-dependent)',
    icon: '✋',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Present current progress, show generated artifacts, request user approval/feedback, wait for user response, process feedback, and update execution plan if needed.',
    },
  },
  {
    id: 'finalize_deliverables',
    name: 'Finalize Deliverables',
    description: 'Compile and finalize all artifacts into deliverables (10-20s)',
    icon: '📦',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Merge all partial artifacts, format final deliverables, generate executive summary, create artifact metadata, package deliverables, and validate completeness.',
    },
  },
  {
    id: 'qa_validation',
    name: 'QA Validation',
    description: 'Quality assurance and validation of deliverables (5-10s)',
    icon: '✅',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.2,
      tools: [],
      systemPrompt: 'Validate artifact completeness, check regulatory compliance, verify citations and references, run quality checks, generate QA report, and flag issues if any.',
    },
  },
  {
    id: 'generate_final_report',
    name: 'Generate Final Report',
    description: 'Generate comprehensive final report with artifacts (5-10s)',
    icon: '📄',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Build executive summary, list all deliverables, provide usage instructions, include next steps, add expert recommendations, and generate report with streaming.',
    },
  },
  {
    id: 'persist_autonomous_execution',
    name: 'Persist Autonomous Execution',
    description: 'Persist entire autonomous execution and artifacts (2-3s)',
    icon: '💾',
    category: 'Mode 3 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'INSERT goal/task record, execution plan, each step execution, final response, STORE all artifacts, UPDATE session stats, and log analytics event with execution metrics.',
    },
  },
  // Mode 4 Workflow Nodes
  {
    id: 'complex_goal_analysis',
    name: 'Complex Goal Analysis',
    description: 'Deep analysis of complex multi-domain goal (4-6s)',
    icon: '🎯',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.2,
      tools: [],
      systemPrompt: 'Parse complex multi-domain goal, identify all required domains, determine deliverable types, assess complexity level, identify dependencies, and estimate resource requirements.',
    },
  },
  {
    id: 'team_assembly',
    name: 'Team Assembly',
    description: 'AI selects optimal team of 2-4 experts (3-5s)',
    icon: '👥',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.2,
      tools: [],
      systemPrompt: 'Query all expert profiles, score experts by domain relevance, consider expert complementarity, select optimal team (2-4 experts), define expert roles, and establish collaboration structure.',
    },
  },
  {
    id: 'load_all_team_agents',
    name: 'Load All Team Agents',
    description: 'Load all team expert profiles and contexts (2-3s)',
    icon: '📚',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Load all selected expert profiles, knowledge_base_ids for each, sub-agent pools for each, create SystemMessages for each, and initialize team coordination context.',
    },
  },
  {
    id: 'load_collaborative_context',
    name: 'Load Collaborative Context',
    description: 'Load collaborative execution context (2-3s)',
    icon: '💬',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Query previous team executions, load relevant artifacts from all domains, load user preferences, and build team collaboration history.',
    },
  },
  {
    id: 'expert_task_decomposition',
    name: 'Expert Task Decomposition',
    description: 'Decompose goal into expert-specific tasks with dependencies (5-8s)',
    icon: '🗂️',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Break goal into expert-specific sub-goals, define deliverables per expert, identify cross-expert dependencies, create execution timeline, define integration points, and establish approval checkpoints.',
    },
  },
  {
    id: 'collaborative_execution_plan',
    name: 'Collaborative Execution Plan',
    description: 'Create comprehensive collaborative execution plan (3-5s)',
    icon: '📋',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Build master execution plan, define parallel execution phases, schedule sequential dependencies, allocate resources per expert, define integration milestones, and set up monitoring.',
    },
  },
  {
    id: 'multi_expert_rag',
    name: 'Multi-Expert RAG',
    description: 'Gather information across all expert domains (8-15s)',
    icon: '🔍',
    category: 'Mode 4 Workflow',
    config: {
      model: 'text-embedding-3-large',
      temperature: 0.0,
      tools: ['pinecone_search', 'postgresql_fts', 'web_search'],
      systemPrompt: 'Generate embeddings for all sub-goals, semantic search across all expert KBs, keyword search for all domains, web search for latest guidance, retrieve templates for all deliverables, and build comprehensive multi-domain context.',
    },
  },
  {
    id: 'initialize_collaborative_state',
    name: 'Initialize Collaborative State',
    description: 'Initialize collaborative multi-expert execution state (1-2s)',
    icon: '⚙️',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Initialize execution state for each expert, set up artifact registries, initialize progress tracking, set up inter-expert communication, and initialize error handling.',
    },
  },
  {
    id: 'parallel_expert_execution',
    name: 'Parallel Expert Execution',
    description: 'Execute parallel tasks across multiple experts (30-90s per phase)',
    icon: '⚡',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Identify tasks that can run in parallel, spawn expert execution threads, execute independent tasks concurrently, monitor progress across all experts, collect partial results, and emit status updates.',
    },
  },
  {
    id: 'spawn_all_specialists',
    name: 'Spawn All Specialists',
    description: 'Spawn specialists across all team experts (3-6s)',
    icon: '🤖',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'Spawn specialists for each team expert (up to 4), coordinate specialist tasks, and register all spawned IDs.',
    },
  },
  {
    id: 'multi_expert_tool_execution',
    name: 'Multi-Expert Tool Execution',
    description: 'Execute tools across all expert domains (10-30s per phase)',
    icon: '🛠️',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: ['predicate_device_search', 'regulatory_database_query', 'clinical_trials_search', 'quality_standards_search', 'reimbursement_codes_search', 'risk_analysis_tools', 'document_generator', 'budget_estimator', 'timeline_generator'],
      systemPrompt: 'Execute tools for each expert in parallel, generate domain-specific artifacts, validate outputs per domain, and store results in artifact registry.',
    },
  },
  {
    id: 'cross_expert_integration',
    name: 'Cross-Expert Integration',
    description: 'Integrate and harmonize multi-expert results (10-20s)',
    icon: '🔗',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Collect results from all experts, identify cross-domain dependencies, merge complementary artifacts, resolve conflicts, validate cross-domain consistency, and create integrated intermediate deliverables.',
    },
  },
  {
    id: 'team_approval_checkpoint',
    name: 'Team Approval Checkpoint',
    description: 'Human-in-the-loop approval for team progress (User-dependent)',
    icon: '✋',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Present integrated progress, show artifacts from all experts, highlight key decisions, request user approval/feedback, wait for user response, process feedback across all experts, and update execution plan if needed.',
    },
  },
  {
    id: 'finalize_collaborative_deliverables',
    name: 'Finalize Collaborative Deliverables',
    description: 'Finalize and package all team deliverables (15-30s)',
    icon: '📦',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      tools: [],
      systemPrompt: 'Collect all artifacts from all experts, perform final integration, format comprehensive deliverables, generate executive summary, create cross-reference index, package complete submission, and validate completeness.',
    },
  },
  {
    id: 'comprehensive_qa',
    name: 'Comprehensive QA',
    description: 'Comprehensive QA across all domains (10-15s)',
    icon: '✅',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.2,
      tools: [],
      systemPrompt: 'Validate all expert deliverables, check cross-domain consistency, verify regulatory compliance, validate citations and references, run comprehensive quality checks, generate QA report, and flag issues if any.',
    },
  },
  {
    id: 'expert_team_review',
    name: 'Expert Team Review',
    description: 'Expert team consensus validation (5-10s)',
    icon: '👥',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      tools: [],
      systemPrompt: 'Each expert reviews final deliverables, identify any concerns or improvements, achieve team consensus, document expert sign-offs, and finalize recommendations.',
    },
  },
  {
    id: 'generate_team_final_report',
    name: 'Generate Team Final Report',
    description: 'Generate comprehensive multi-expert final report (10-20s)',
    icon: '📄',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'Build comprehensive executive summary, list all deliverables by expert, provide usage instructions, include implementation roadmap, add expert recommendations, and generate complete report with streaming.',
    },
  },
  {
    id: 'persist_team_execution',
    name: 'Persist Team Execution',
    description: 'Persist entire team execution and artifacts (3-5s)',
    icon: '💾',
    category: 'Mode 4 Workflow',
    config: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.0,
      tools: [],
      systemPrompt: 'INSERT goal/task record, team composition, execution plan, each expert execution, integration milestones, final response, STORE all artifacts, UPDATE session stats, and log comprehensive analytics.',
    },
  },
  // Agent Node - Special node type for AI agents
  {
    id: 'agent_node',
    name: 'AI Agent',
    description: 'Drag to add an AI agent to your workflow. Configure which agent to use after placing.',
    icon: '🤖',
    category: 'Agent',
    config: {
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
      systemPrompt: 'You are an AI agent in a workflow. Your behavior will be determined by the agent configuration.',
    },
  },
];

interface TaskLibraryProps {
  onTaskDragStart: (task: TaskDefinition, event: React.DragEvent) => void;
  onCreateTask?: () => void;
  onCombineTasks?: () => void;
}

export const TaskLibrary: React.FC<TaskLibraryProps> = ({ 
  onTaskDragStart, 
  onCreateTask, 
  onCombineTasks 
}) => {
  // Get custom tasks from localStorage
  const [customTasks, setCustomTasks] = React.useState<TaskDefinition[]>(() => {
    try {
      const stored = localStorage.getItem('custom_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen for storage changes to refresh custom tasks
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('custom_tasks');
        if (stored) {
          setCustomTasks(JSON.parse(stored));
        }
      } catch {
        // Ignore errors
      }
    };

    // Listen for storage events (when custom tasks are saved from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (when custom tasks are saved in same tab)
    window.addEventListener('customTasksUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customTasksUpdated', handleStorageChange);
    };
  }, [customTasks]);

  // Combine predefined and custom tasks
  const allTasks = [...TASK_DEFINITIONS, ...customTasks];
  
  const tasksByCategory = allTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, TaskDefinition[]>);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-2 border-b border-neutral-200 space-y-2">
        <div>
          <h2 className="text-sm font-semibold">Task Library</h2>
          <p className="text-[10px] text-neutral-500 mt-0.5">Drag to canvas</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            disabled={!onCreateTask}
            title="Create custom task"
            className="flex-1 h-7 text-xs px-2"
          >
            <span className="mr-1 text-xs">➕</span> Create
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCombineTasks}
            disabled={!onCombineTasks}
            title="Combine multiple tasks"
            className="flex-1 h-7 text-xs px-2"
          >
            <span className="mr-1 text-xs">🔗</span> Combine
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div key={category} className="space-y-1.5">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">{category}</h3>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => onTaskDragStart(task, e)}
                  className={cn(
                    "cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                  )}
                  title={task.description}
                >
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{task.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-neutral-900 mb-0.5">{task.name}</div>
                        <div className="text-[10px] text-neutral-600 line-clamp-1">{task.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

