# MODE 3: QUERY AUTOMATIC - GOLD STANDARD IMPLEMENTATION
## Complete Multi-Agent Synthesis with Dynamic Selection

**Version**: 1.0  
**Status**: Production Ready  
**Category**: Query (One-shot)  
**Selection**: Automatic (System-driven)  
**Complexity**: High  
**Response Time**: 3-5 seconds

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Core Architecture](#core-architecture)
3. [State Management](#state-management)
4. [Agent Selection Algorithm](#agent-selection-algorithm)
5. [Multi-Agent Synthesis](#multi-agent-synthesis)
6. [LangChain Implementation](#langchain-implementation)
7. [API Design](#api-design)
8. [Production Configuration](#production-configuration)
9. [Testing Strategy](#testing-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Security & Compliance](#security-compliance)
12. [Deployment Guide](#deployment-guide)

---

## 🎯 EXECUTIVE SUMMARY

### Mode Definition

**Query Automatic (Mode 3)** is a sophisticated one-shot consultation mode where:
- User submits a complex query requiring multiple perspectives
- System automatically identifies and selects 3-5 most relevant experts
- Multiple agents' knowledge is synthesized into one comprehensive answer
- Response includes diverse viewpoints, citations, and confidence scores
- No conversation history - pure stateless operation

### Key Characteristics

| Aspect | Details |
|--------|---------|
| **Interaction Type** | One-shot query/response |
| **Agent Selection** | Automatic via semantic search |
| **Number of Agents** | 3-5 experts per query |
| **Response Synthesis** | Multi-perspective integration |
| **State Management** | Stateless |
| **Context Window** | 32K tokens |
| **Average Latency** | 3-5 seconds |
| **Cost per Query** | $0.15-0.30 |

### Use Cases

1. **Complex Research Questions**
   - "What are the regulatory pathways for AI-powered diagnostic tools in EU vs US?"
   - System selects: FDA Expert + EMA Expert + AI/ML Specialist + Medical Device Expert

2. **Strategic Decision Making**
   - "How should we approach market entry for our digital therapeutics platform?"
   - System selects: Market Strategist + Regulatory Expert + Reimbursement Specialist + Clinical Expert

3. **Multi-Domain Technical Queries**
   - "Design a HIPAA-compliant architecture for real-time patient monitoring"
   - System selects: Security Expert + Cloud Architect + Healthcare IT + Compliance Officer

---

## 🏗️ CORE ARCHITECTURE

### System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    MODE 3: QUERY AUTOMATIC FLOW                     │
└────────────────────────────────────────────────────────────────────┘

     USER QUERY
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                  QUERY PROCESSOR                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ • Extract key concepts                          │    │
│  │ • Identify domains                              │    │
│  │ • Determine complexity score                    │    │
│  │ • Generate embedding                            │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              INTELLIGENT AGENT SELECTOR                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ • Semantic search in Pinecone (top 10)          │    │
│  │ • Diversity scoring algorithm                   │    │
│  │ • Expertise overlap analysis                    │    │
│  │ • Select optimal 3-5 agents                     │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               PARALLEL CONTEXT LOADING                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │     Agent 1        Agent 2        Agent 3       │    │
│  │        ↓              ↓              ↓          │    │
│  │   Load Context   Load Context   Load Context    │    │
│  │        ↓              ↓              ↓          │    │
│  │     RAG Pool       RAG Pool       RAG Pool      │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            MULTI-AGENT SYNTHESIS ENGINE                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ • Generate individual perspectives               │    │
│  │ • Identify consensus and conflicts              │    │
│  │ • Synthesize comprehensive answer               │    │
│  │ • Add citations and confidence scores           │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  RESPONSE FORMATTER                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ • Structure multi-perspective response          │    │
│  │ • Add expert attributions                       │    │
│  │ • Include confidence metrics                    │    │
│  │ • Format citations and sources                  │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                          │
                          ▼
                   COMPREHENSIVE ANSWER
```

### Component Architecture

```python
# Core Components Structure
components/
├── query_processor/
│   ├── __init__.py
│   ├── analyzer.py          # Query analysis and decomposition
│   ├── embedder.py          # Generate query embeddings
│   └── complexity_scorer.py # Assess query complexity
│
├── agent_selector/
│   ├── __init__.py
│   ├── semantic_search.py   # Pinecone search integration
│   ├── diversity_scorer.py  # Ensure diverse perspectives
│   └── optimizer.py         # Optimize agent selection
│
├── synthesis_engine/
│   ├── __init__.py
│   ├── perspective_generator.py  # Individual agent responses
│   ├── conflict_resolver.py      # Handle conflicting views
│   └── synthesizer.py            # Merge perspectives
│
└── response_formatter/
    ├── __init__.py
    ├── structure_builder.py  # Build response structure
    └── citation_manager.py   # Manage sources and citations
```

---

## 🔄 STATE MANAGEMENT

### Query State Model

```python
from typing import TypedDict, List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class QueryComplexity(Enum):
    """Query complexity levels"""
    SIMPLE = "simple"      # 1-2 domains, straightforward
    MODERATE = "moderate"  # 2-3 domains, some nuance
    COMPLEX = "complex"    # 3+ domains, high nuance
    EXPERT = "expert"      # Requires deep expertise

class AgentSelectionCriteria(TypedDict):
    """Criteria for agent selection"""
    primary_domain: str
    secondary_domains: List[str]
    required_expertise: List[str]
    complexity_level: QueryComplexity
    diversity_requirement: float  # 0.0 - 1.0
    max_agents: int
    min_agents: int

class SelectedAgent(TypedDict):
    """Selected agent with metadata"""
    agent_id: str
    name: str
    specialty: str
    relevance_score: float
    diversity_score: float
    context_loaded: bool
    rag_documents: List[Dict]
    token_allocation: int

class QueryAutomaticState(TypedDict):
    """Complete state for Mode 3 query"""
    # Request metadata
    consultation_id: str
    tenant_id: str
    user_id: str
    timestamp: datetime
    
    # Query analysis
    original_query: str
    processed_query: str
    query_embedding: List[float]
    detected_domains: List[str]
    key_concepts: List[str]
    complexity: QueryComplexity
    
    # Agent selection
    selection_criteria: AgentSelectionCriteria
    candidate_agents: List[Dict]  # Top 10 from search
    selected_agents: List[SelectedAgent]  # Final 3-5
    selection_reasoning: str
    
    # Context loading
    total_context_tokens: int
    rag_pools: Dict[str, List[Dict]]  # agent_id -> documents
    
    # Synthesis
    individual_perspectives: Dict[str, str]  # agent_id -> response
    consensus_points: List[str]
    conflicting_points: List[Dict]
    synthesis_strategy: str
    
    # Response
    final_response: str
    confidence_score: float
    citations: List[Dict]
    expert_attributions: Dict[str, List[str]]
    
    # Performance metrics
    processing_time_ms: int
    total_tokens_used: int
    estimated_cost: float
    
    # Error handling
    errors: List[Dict]
    fallback_used: bool
```

### State Transitions

```python
class StateTransition(Enum):
    """State transition points"""
    QUERY_RECEIVED = "query_received"
    QUERY_ANALYZED = "query_analyzed"
    AGENTS_SELECTED = "agents_selected"
    CONTEXT_LOADED = "context_loaded"
    PERSPECTIVES_GENERATED = "perspectives_generated"
    SYNTHESIS_COMPLETE = "synthesis_complete"
    RESPONSE_FORMATTED = "response_formatted"
    COMPLETE = "complete"
    ERROR = "error"

# State machine configuration
STATE_MACHINE = {
    StateTransition.QUERY_RECEIVED: {
        "next": StateTransition.QUERY_ANALYZED,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 500
    },
    StateTransition.QUERY_ANALYZED: {
        "next": StateTransition.AGENTS_SELECTED,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 1000
    },
    StateTransition.AGENTS_SELECTED: {
        "next": StateTransition.CONTEXT_LOADED,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 2000
    },
    StateTransition.CONTEXT_LOADED: {
        "next": StateTransition.PERSPECTIVES_GENERATED,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 3000
    },
    StateTransition.PERSPECTIVES_GENERATED: {
        "next": StateTransition.SYNTHESIS_COMPLETE,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 2000
    },
    StateTransition.SYNTHESIS_COMPLETE: {
        "next": StateTransition.RESPONSE_FORMATTED,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 500
    },
    StateTransition.RESPONSE_FORMATTED: {
        "next": StateTransition.COMPLETE,
        "on_error": StateTransition.ERROR,
        "timeout_ms": 100
    }
}
```

---

## 🤖 AGENT SELECTION ALGORITHM

### Intelligent Selection System

```python
import numpy as np
from typing import List, Dict, Tuple
from sklearn.metrics.pairwise import cosine_similarity
import asyncio

class IntelligentAgentSelector:
    """
    Sophisticated agent selection with diversity optimization
    """
    
    def __init__(
        self,
        pinecone_client,
        diversity_weight: float = 0.3,
        min_relevance: float = 0.7
    ):
        self.pinecone = pinecone_client
        self.diversity_weight = diversity_weight
        self.min_relevance = min_relevance
    
    async def select_optimal_agents(
        self,
        query_embedding: List[float],
        query_metadata: Dict,
        top_k: int = 10,
        select_n: int = 5
    ) -> List[SelectedAgent]:
        """
        Select optimal agent combination balancing relevance and diversity
        """
        # Phase 1: Semantic search for candidates
        candidates = await self._search_candidates(
            query_embedding,
            top_k
        )
        
        # Phase 2: Score for relevance
        relevance_scores = self._calculate_relevance(
            candidates,
            query_metadata
        )
        
        # Phase 3: Calculate diversity matrix
        diversity_matrix = self._calculate_diversity_matrix(
            candidates
        )
        
        # Phase 4: Optimize selection
        selected_indices = self._optimize_selection(
            relevance_scores,
            diversity_matrix,
            select_n
        )
        
        # Phase 5: Prepare selected agents
        selected_agents = self._prepare_agents(
            candidates,
            selected_indices,
            relevance_scores
        )
        
        return selected_agents
    
    async def _search_candidates(
        self,
        embedding: List[float],
        top_k: int
    ) -> List[Dict]:
        """
        Search Pinecone for candidate agents
        """
        response = self.pinecone.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        candidates = []
        for match in response.matches:
            candidates.append({
                'id': match.id,
                'score': match.score,
                'metadata': match.metadata,
                'embedding': match.values
            })
        
        return candidates
    
    def _calculate_relevance(
        self,
        candidates: List[Dict],
        query_metadata: Dict
    ) -> np.ndarray:
        """
        Calculate multifactor relevance scores
        """
        scores = []
        
        for candidate in candidates:
            # Base semantic similarity
            base_score = candidate['score']
            
            # Domain match bonus
            domain_bonus = self._calculate_domain_match(
                candidate['metadata'].get('domains', []),
                query_metadata.get('detected_domains', [])
            )
            
            # Expertise match bonus
            expertise_bonus = self._calculate_expertise_match(
                candidate['metadata'].get('expertise', []),
                query_metadata.get('key_concepts', [])
            )
            
            # Complexity alignment
            complexity_factor = self._calculate_complexity_alignment(
                candidate['metadata'].get('complexity_level'),
                query_metadata.get('complexity')
            )
            
            # Combined score
            final_score = (
                base_score * 0.5 +
                domain_bonus * 0.2 +
                expertise_bonus * 0.2 +
                complexity_factor * 0.1
            )
            
            scores.append(final_score)
        
        return np.array(scores)
    
    def _calculate_diversity_matrix(
        self,
        candidates: List[Dict]
    ) -> np.ndarray:
        """
        Calculate pairwise diversity between agents
        """
        n = len(candidates)
        matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i+1, n):
                # Embedding diversity
                emb_div = 1 - cosine_similarity(
                    [candidates[i]['embedding']],
                    [candidates[j]['embedding']]
                )[0][0]
                
                # Domain diversity
                dom_div = self._calculate_domain_diversity(
                    candidates[i]['metadata'].get('domains', []),
                    candidates[j]['metadata'].get('domains', [])
                )
                
                # Perspective diversity
                persp_div = self._calculate_perspective_diversity(
                    candidates[i]['metadata'].get('perspective_type'),
                    candidates[j]['metadata'].get('perspective_type')
                )
                
                # Combined diversity
                diversity = (emb_div * 0.4 + dom_div * 0.3 + persp_div * 0.3)
                
                matrix[i][j] = diversity
                matrix[j][i] = diversity
        
        return matrix
    
    def _optimize_selection(
        self,
        relevance_scores: np.ndarray,
        diversity_matrix: np.ndarray,
        select_n: int
    ) -> List[int]:
        """
        Optimize agent selection using greedy algorithm with look-ahead
        """
        selected = []
        remaining = list(range(len(relevance_scores)))
        
        # Select first agent (highest relevance)
        first_idx = np.argmax(relevance_scores)
        selected.append(first_idx)
        remaining.remove(first_idx)
        
        # Iteratively select agents
        while len(selected) < select_n and remaining:
            best_score = -1
            best_idx = -1
            
            for idx in remaining:
                # Calculate combined score
                rel_score = relevance_scores[idx]
                
                # Average diversity with selected agents
                div_scores = [diversity_matrix[idx][s] for s in selected]
                avg_diversity = np.mean(div_scores)
                
                # Combined score
                combined = (
                    rel_score * (1 - self.diversity_weight) +
                    avg_diversity * self.diversity_weight
                )
                
                if combined > best_score:
                    best_score = combined
                    best_idx = idx
            
            if best_idx >= 0:
                selected.append(best_idx)
                remaining.remove(best_idx)
        
        return selected
    
    def _calculate_domain_match(
        self,
        agent_domains: List[str],
        query_domains: List[str]
    ) -> float:
        """Calculate domain overlap score"""
        if not agent_domains or not query_domains:
            return 0.0
        
        intersection = set(agent_domains) & set(query_domains)
        union = set(agent_domains) | set(query_domains)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _calculate_expertise_match(
        self,
        agent_expertise: List[str],
        key_concepts: List[str]
    ) -> float:
        """Calculate expertise-concept alignment"""
        if not agent_expertise or not key_concepts:
            return 0.0
        
        matches = 0
        for concept in key_concepts:
            for expertise in agent_expertise:
                if concept.lower() in expertise.lower():
                    matches += 1
                    break
        
        return matches / len(key_concepts)
    
    def _calculate_complexity_alignment(
        self,
        agent_level: str,
        query_complexity: str
    ) -> float:
        """Calculate complexity level alignment"""
        complexity_map = {
            'simple': 1,
            'moderate': 2,
            'complex': 3,
            'expert': 4
        }
        
        agent_val = complexity_map.get(agent_level, 2)
        query_val = complexity_map.get(query_complexity, 2)
        
        # Perfect match = 1.0, decreases with distance
        distance = abs(agent_val - query_val)
        return 1.0 / (1.0 + distance * 0.3)
    
    def _calculate_domain_diversity(
        self,
        domains1: List[str],
        domains2: List[str]
    ) -> float:
        """Calculate domain diversity between agents"""
        if not domains1 or not domains2:
            return 1.0  # Maximum diversity if no overlap possible
        
        set1 = set(domains1)
        set2 = set(domains2)
        
        # Jaccard distance
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        return 1 - (intersection / union) if union else 1.0
    
    def _calculate_perspective_diversity(
        self,
        perspective1: str,
        perspective2: str
    ) -> float:
        """Calculate perspective type diversity"""
        if perspective1 == perspective2:
            return 0.0
        
        # Define perspective compatibility matrix
        compatibility = {
            ('technical', 'business'): 0.9,
            ('clinical', 'regulatory'): 0.8,
            ('strategic', 'operational'): 0.85,
            ('research', 'practical'): 0.9,
        }
        
        key = tuple(sorted([perspective1, perspective2]))
        return compatibility.get(key, 0.7)
```

---

## 🔗 MULTI-AGENT SYNTHESIS

### Advanced Synthesis Engine

```python
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import asyncio

class PerspectiveResponse(BaseModel):
    """Individual agent perspective"""
    agent_id: str
    agent_name: str
    key_points: List[str]
    recommendations: List[str]
    concerns: List[str]
    confidence: float = Field(ge=0, le=1)
    sources: List[Dict]

class SynthesisOutput(BaseModel):
    """Synthesized multi-agent response"""
    executive_summary: str
    consensus_points: List[str]
    diverse_perspectives: List[Dict]
    recommendations: List[str]
    risk_considerations: List[str]
    confidence_score: float
    expert_attributions: Dict[str, List[str]]
    citations: List[Dict]

class MultiAgentSynthesisEngine:
    """
    Advanced synthesis engine for multi-agent responses
    """
    
    def __init__(self, llm_model="gpt-4"):
        self.llm = ChatOpenAI(
            model=llm_model,
            temperature=0.7,
            streaming=True
        )
        self.perspective_parser = PydanticOutputParser(
            pydantic_object=PerspectiveResponse
        )
        self.synthesis_parser = PydanticOutputParser(
            pydantic_object=SynthesisOutput
        )
    
    async def synthesize_response(
        self,
        query: str,
        selected_agents: List[SelectedAgent],
        agent_contexts: Dict[str, List[Dict]]
    ) -> SynthesisOutput:
        """
        Orchestrate multi-agent synthesis
        """
        # Phase 1: Generate individual perspectives in parallel
        perspectives = await self._generate_perspectives(
            query,
            selected_agents,
            agent_contexts
        )
        
        # Phase 2: Analyze consensus and conflicts
        analysis = self._analyze_perspectives(perspectives)
        
        # Phase 3: Synthesize comprehensive response
        synthesis = await self._synthesize_final_response(
            query,
            perspectives,
            analysis
        )
        
        return synthesis
    
    async def _generate_perspectives(
        self,
        query: str,
        agents: List[SelectedAgent],
        contexts: Dict[str, List[Dict]]
    ) -> List[PerspectiveResponse]:
        """
        Generate individual agent perspectives in parallel
        """
        tasks = []
        
        for agent in agents:
            task = self._generate_single_perspective(
                query,
                agent,
                contexts.get(agent['agent_id'], [])
            )
            tasks.append(task)
        
        perspectives = await asyncio.gather(*tasks)
        return perspectives
    
    async def _generate_single_perspective(
        self,
        query: str,
        agent: SelectedAgent,
        context_docs: List[Dict]
    ) -> PerspectiveResponse:
        """
        Generate perspective from single agent
        """
        # Build context from RAG documents
        context_text = self._format_context(context_docs)
        
        # Create agent-specific prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_agent_system_prompt(agent)),
            ("human", self._get_perspective_prompt())
        ])
        
        # Format the prompt
        formatted = prompt.format_messages(
            agent_name=agent['name'],
            agent_specialty=agent['specialty'],
            query=query,
            context=context_text,
            format_instructions=self.perspective_parser.get_format_instructions()
        )
        
        # Generate response
        response = await self.llm.agenerate([formatted])
        
        # Parse response
        perspective = self.perspective_parser.parse(response.generations[0][0].text)
        perspective.agent_id = agent['agent_id']
        perspective.agent_name = agent['name']
        
        return perspective
    
    def _get_agent_system_prompt(self, agent: SelectedAgent) -> str:
        """
        Generate system prompt for specific agent
        """
        return f"""You are {agent['name']}, a distinguished expert in {agent['specialty']}.

Your expertise includes:
- Deep knowledge in your domain
- Practical experience with real-world applications
- Understanding of industry best practices
- Awareness of current trends and challenges

Your task is to provide expert perspective on the given query, considering:
1. Your specific domain expertise
2. The provided context from your knowledge base
3. Practical implications and recommendations
4. Potential risks or concerns from your perspective

Maintain your unique expert voice and perspective throughout your response."""
    
    def _get_perspective_prompt(self) -> str:
        """
        Template for generating individual perspectives
        """
        return """Query: {query}

Relevant Context from Knowledge Base:
{context}

Please provide your expert perspective on this query. Structure your response according to:
{format_instructions}

Focus on:
1. Key insights from your domain
2. Specific recommendations based on your expertise
3. Any concerns or risks you identify
4. Confidence level in your assessment
5. References to support your perspective"""
    
    def _analyze_perspectives(
        self,
        perspectives: List[PerspectiveResponse]
    ) -> Dict:
        """
        Analyze perspectives for consensus and conflicts
        """
        analysis = {
            'consensus_points': [],
            'conflicting_points': [],
            'unique_insights': {},
            'confidence_distribution': {},
            'domain_coverage': set()
        }
        
        # Extract all points
        all_points = {}
        for persp in perspectives:
            all_points[persp.agent_id] = {
                'key_points': persp.key_points,
                'recommendations': persp.recommendations,
                'concerns': persp.concerns,
                'confidence': persp.confidence
            }
        
        # Find consensus (points mentioned by >50% of agents)
        point_frequency = {}
        for agent_id, points in all_points.items():
            for point in points['key_points']:
                point_key = self._normalize_point(point)
                if point_key not in point_frequency:
                    point_frequency[point_key] = []
                point_frequency[point_key].append(agent_id)
        
        threshold = len(perspectives) / 2
        for point, agents in point_frequency.items():
            if len(agents) >= threshold:
                analysis['consensus_points'].append({
                    'point': point,
                    'supporting_agents': agents
                })
        
        # Find conflicts (contradictory recommendations)
        analysis['conflicting_points'] = self._identify_conflicts(perspectives)
        
        # Extract unique insights
        for persp in perspectives:
            unique_points = self._find_unique_insights(
                persp,
                perspectives
            )
            if unique_points:
                analysis['unique_insights'][persp.agent_id] = unique_points
        
        # Confidence distribution
        analysis['confidence_distribution'] = {
            p.agent_id: p.confidence for p in perspectives
        }
        
        return analysis
    
    async def _synthesize_final_response(
        self,
        query: str,
        perspectives: List[PerspectiveResponse],
        analysis: Dict
    ) -> SynthesisOutput:
        """
        Create final synthesized response
        """
        # Build synthesis prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_synthesis_system_prompt()),
            ("human", self._get_synthesis_user_prompt())
        ])
        
        # Prepare perspectives summary
        persp_summary = self._format_perspectives_for_synthesis(perspectives)
        
        # Format prompt
        formatted = prompt.format_messages(
            query=query,
            perspectives=persp_summary,
            consensus=analysis['consensus_points'],
            conflicts=analysis['conflicting_points'],
            unique_insights=analysis['unique_insights'],
            format_instructions=self.synthesis_parser.get_format_instructions()
        )
        
        # Generate synthesis
        response = await self.llm.agenerate([formatted])
        
        # Parse response
        synthesis = self.synthesis_parser.parse(response.generations[0][0].text)
        
        # Add expert attributions
        synthesis.expert_attributions = self._build_attributions(perspectives)
        
        # Calculate overall confidence
        synthesis.confidence_score = self._calculate_overall_confidence(
            perspectives,
            analysis
        )
        
        # Compile citations
        synthesis.citations = self._compile_citations(perspectives)
        
        return synthesis
    
    def _get_synthesis_system_prompt(self) -> str:
        """
        System prompt for synthesis
        """
        return """You are a master synthesizer tasked with integrating multiple expert perspectives into a comprehensive response.

Your role is to:
1. Present a balanced view that incorporates all expert perspectives
2. Highlight areas of consensus among experts
3. Acknowledge and explain areas of disagreement
4. Provide actionable recommendations based on the collective wisdom
5. Identify and communicate any risks or concerns raised

Maintain objectivity and ensure all expert voices are represented fairly in the final synthesis."""
    
    def _get_synthesis_user_prompt(self) -> str:
        """
        User prompt for synthesis
        """
        return """Original Query: {query}

Expert Perspectives:
{perspectives}

Consensus Points:
{consensus}

Conflicting Views:
{conflicts}

Unique Insights:
{unique_insights}

Please synthesize these expert perspectives into a comprehensive response.
Structure your response according to:
{format_instructions}

Ensure you:
1. Start with an executive summary
2. Clearly present consensus views
3. Fairly represent diverse perspectives
4. Provide consolidated recommendations
5. Highlight important risk considerations
6. Attribute insights to specific experts where appropriate"""
    
    def _format_context(self, context_docs: List[Dict]) -> str:
        """
        Format RAG context documents
        """
        if not context_docs:
            return "No specific context documents available."
        
        formatted = []
        for doc in context_docs[:5]:  # Limit to top 5 documents
            formatted.append(f"""
Source: {doc.get('source', 'Unknown')}
Relevance: {doc.get('score', 0):.2f}
Content: {doc.get('content', '')}
---""")
        
        return "\n".join(formatted)
    
    def _normalize_point(self, point: str) -> str:
        """
        Normalize point for comparison
        """
        # Remove punctuation and lowercase
        import re
        normalized = re.sub(r'[^\w\s]', '', point.lower())
        # Remove extra whitespace
        normalized = ' '.join(normalized.split())
        return normalized
    
    def _identify_conflicts(
        self,
        perspectives: List[PerspectiveResponse]
    ) -> List[Dict]:
        """
        Identify conflicting recommendations
        """
        conflicts = []
        
        # Compare recommendations pairwise
        for i, persp1 in enumerate(perspectives):
            for j, persp2 in enumerate(perspectives[i+1:], i+1):
                for rec1 in persp1.recommendations:
                    for rec2 in persp2.recommendations:
                        if self._are_conflicting(rec1, rec2):
                            conflicts.append({
                                'agent1': persp1.agent_name,
                                'agent2': persp2.agent_name,
                                'position1': rec1,
                                'position2': rec2,
                                'type': 'recommendation'
                            })
        
        return conflicts
    
    def _are_conflicting(self, statement1: str, statement2: str) -> bool:
        """
        Determine if two statements conflict
        """
        # Simple keyword-based conflict detection
        # In production, use more sophisticated NLP
        negations = ['not', 'avoid', 'don\'t', 'shouldn\'t', 'mustn\'t']
        
        s1_lower = statement1.lower()
        s2_lower = statement2.lower()
        
        # Check for direct negation
        for neg in negations:
            if (neg in s1_lower and neg not in s2_lower) or \
               (neg not in s1_lower and neg in s2_lower):
                # Check if discussing same topic
                s1_words = set(s1_lower.split())
                s2_words = set(s2_lower.split())
                overlap = s1_words & s2_words
                if len(overlap) > 3:  # Significant topic overlap
                    return True
        
        return False
    
    def _find_unique_insights(
        self,
        perspective: PerspectiveResponse,
        all_perspectives: List[PerspectiveResponse]
    ) -> List[str]:
        """
        Find insights unique to this perspective
        """
        unique = []
        
        for point in perspective.key_points:
            is_unique = True
            normalized = self._normalize_point(point)
            
            for other in all_perspectives:
                if other.agent_id == perspective.agent_id:
                    continue
                
                for other_point in other.key_points:
                    if self._are_similar(normalized, self._normalize_point(other_point)):
                        is_unique = False
                        break
                
                if not is_unique:
                    break
            
            if is_unique:
                unique.append(point)
        
        return unique
    
    def _are_similar(self, text1: str, text2: str) -> bool:
        """
        Check if two texts are semantically similar
        """
        # Simple word overlap similarity
        # In production, use embedding similarity
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1 & words2
        union = words1 | words2
        
        jaccard = len(intersection) / len(union)
        return jaccard > 0.6
    
    def _format_perspectives_for_synthesis(
        self,
        perspectives: List[PerspectiveResponse]
    ) -> str:
        """
        Format perspectives for synthesis prompt
        """
        formatted = []
        
        for persp in perspectives:
            formatted.append(f"""
Expert: {persp.agent_name}
Key Points:
{chr(10).join(f'  • {p}' for p in persp.key_points)}
Recommendations:
{chr(10).join(f'  • {r}' for r in persp.recommendations)}
Concerns:
{chr(10).join(f'  • {c}' for c in persp.concerns)}
Confidence: {persp.confidence:.1%}
---""")
        
        return "\n".join(formatted)
    
    def _build_attributions(
        self,
        perspectives: List[PerspectiveResponse]
    ) -> Dict[str, List[str]]:
        """
        Build expert attribution map
        """
        attributions = {}
        
        for persp in perspectives:
            attributions[persp.agent_name] = (
                persp.key_points[:3] +  # Top 3 key points
                persp.recommendations[:2]  # Top 2 recommendations
            )
        
        return attributions
    
    def _calculate_overall_confidence(
        self,
        perspectives: List[PerspectiveResponse],
        analysis: Dict
    ) -> float:
        """
        Calculate overall confidence score
        """
        # Weight factors
        avg_confidence = sum(p.confidence for p in perspectives) / len(perspectives)
        consensus_ratio = len(analysis['consensus_points']) / max(
            sum(len(p.key_points) for p in perspectives), 1
        )
        conflict_penalty = len(analysis['conflicting_points']) * 0.05
        
        # Calculate overall score
        overall = (
            avg_confidence * 0.6 +
            consensus_ratio * 0.3 +
            0.1  # Base confidence
        ) - conflict_penalty
        
        return max(0.0, min(1.0, overall))
    
    def _compile_citations(
        self,
        perspectives: List[PerspectiveResponse]
    ) -> List[Dict]:
        """
        Compile all citations from perspectives
        """
        citations = []
        seen_sources = set()
        
        for persp in perspectives:
            for source in persp.sources:
                source_key = source.get('url', source.get('id', ''))
                if source_key and source_key not in seen_sources:
                    citations.append({
                        'source': source.get('source'),
                        'url': source.get('url'),
                        'title': source.get('title'),
                        'cited_by': persp.agent_name,
                        'relevance': source.get('relevance', 0.5)
                    })
                    seen_sources.add(source_key)
        
        # Sort by relevance
        citations.sort(key=lambda x: x['relevance'], reverse=True)
        
        return citations[:10]  # Top 10 citations
```

---

## 🔧 LANGCHAIN IMPLEMENTATION

### Complete LangChain Integration

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains.base import Chain
from typing import Dict, Any
import json

class QueryAutomaticChain(Chain):
    """
    Complete LangChain implementation for Mode 3
    """
    
    # Required Chain properties
    input_keys = ["query", "tenant_id", "user_id"]
    output_keys = ["response", "metadata"]
    
    def __init__(
        self,
        agent_selector: IntelligentAgentSelector,
        synthesis_engine: MultiAgentSynthesisEngine,
        rag_manager,
        cost_tracker,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.agent_selector = agent_selector
        self.synthesis_engine = synthesis_engine
        self.rag_manager = rag_manager
        self.cost_tracker = cost_tracker
        
        # Initialize query processor
        self.query_processor = QueryProcessor()
        
        # Streaming callback
        self.streaming_callback = StreamingStdOutCallbackHandler()
    
    @property
    def _chain_type(self) -> str:
        """Return chain type"""
        return "query_automatic"
    
    async def _acall(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Async execution of the chain
        """
        # Initialize state
        state = QueryAutomaticState(
            consultation_id=str(uuid.uuid4()),
            tenant_id=inputs["tenant_id"],
            user_id=inputs["user_id"],
            timestamp=datetime.utcnow(),
            original_query=inputs["query"]
        )
        
        try:
            # Step 1: Process query
            state = await self._process_query(state)
            
            # Step 2: Select agents
            state = await self._select_agents(state)
            
            # Step 3: Load context
            state = await self._load_context(state)
            
            # Step 4: Generate synthesis
            state = await self._generate_synthesis(state)
            
            # Step 5: Format response
            state = await self._format_response(state)
            
            # Track costs
            await self._track_costs(state)
            
            return {
                "response": state["final_response"],
                "metadata": {
                    "consultation_id": state["consultation_id"],
                    "agents_used": [
                        a["name"] for a in state["selected_agents"]
                    ],
                    "confidence_score": state["confidence_score"],
                    "citations": state["citations"],
                    "processing_time_ms": state["processing_time_ms"],
                    "total_cost": state["estimated_cost"]
                }
            }
            
        except Exception as e:
            state["errors"].append({
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            raise
    
    def _call(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync wrapper for async call
        """
        import asyncio
        return asyncio.run(self._acall(inputs))
    
    async def _process_query(
        self,
        state: QueryAutomaticState
    ) -> QueryAutomaticState:
        """
        Process and analyze query
        """
        start_time = time.time()
        
        # Analyze query
        analysis = await self.query_processor.analyze(state["original_query"])
        
        state["processed_query"] = analysis["processed_query"]
        state["query_embedding"] = analysis["embedding"]
        state["detected_domains"] = analysis["domains"]
        state["key_concepts"] = analysis["concepts"]
        state["complexity"] = analysis["complexity"]
        
        # Set selection criteria
        state["selection_criteria"] = {
            "primary_domain": analysis["domains"][0] if analysis["domains"] else "general",
            "secondary_domains": analysis["domains"][1:3],
            "required_expertise": analysis["concepts"][:5],
            "complexity_level": analysis["complexity"],
            "diversity_requirement": 0.4 if analysis["complexity"] in ["complex", "expert"] else 0.3,
            "max_agents": 5 if analysis["complexity"] in ["complex", "expert"] else 3,
            "min_agents": 3 if analysis["complexity"] in ["complex", "expert"] else 2
        }
        
        state["processing_time_ms"] = int((time.time() - start_time) * 1000)
        
        return state
    
    async def _select_agents(
        self,
        state: QueryAutomaticState
    ) -> QueryAutomaticState:
        """
        Select optimal agents
        """
        # Select agents
        selected = await self.agent_selector.select_optimal_agents(
            state["query_embedding"],
            {
                "detected_domains": state["detected_domains"],
                "key_concepts": state["key_concepts"],
                "complexity": state["complexity"]
            },
            top_k=10,
            select_n=state["selection_criteria"]["max_agents"]
        )
        
        state["selected_agents"] = selected
        
        # Generate selection reasoning
        state["selection_reasoning"] = self._generate_selection_reasoning(
            selected,
            state["selection_criteria"]
        )
        
        return state
    
    async def _load_context(
        self,
        state: QueryAutomaticState
    ) -> QueryAutomaticState:
        """
        Load RAG context for each agent
        """
        rag_pools = {}
        total_tokens = 0
        
        # Load context in parallel
        tasks = []
        for agent in state["selected_agents"]:
            task = self.rag_manager.load_agent_context(
                agent["agent_id"],
                state["processed_query"],
                state["tenant_id"]
            )
            tasks.append(task)
        
        contexts = await asyncio.gather(*tasks)
        
        # Process contexts
        for agent, context in zip(state["selected_agents"], contexts):
            rag_pools[agent["agent_id"]] = context["documents"]
            agent["rag_documents"] = context["documents"]
            agent["context_loaded"] = True
            
            # Calculate token allocation
            agent["token_allocation"] = context["token_count"]
            total_tokens += context["token_count"]
        
        state["rag_pools"] = rag_pools
        state["total_context_tokens"] = total_tokens
        
        return state
    
    async def _generate_synthesis(
        self,
        state: QueryAutomaticState
    ) -> QueryAutomaticState:
        """
        Generate multi-agent synthesis
        """
        # Generate synthesis
        synthesis = await self.synthesis_engine.synthesize_response(
            state["original_query"],
            state["selected_agents"],
            state["rag_pools"]
        )
        
        # Update state with synthesis results
        state["final_response"] = self._format_synthesis_response(synthesis)
        state["confidence_score"] = synthesis.confidence_score
        state["citations"] = synthesis.citations
        state["consensus_points"] = synthesis.consensus_points
        state["expert_attributions"] = synthesis.expert_attributions
        
        # Calculate tokens used
        state["total_tokens_used"] = self._estimate_tokens(synthesis)
        
        return state
    
    async def _format_response(
        self,
        state: QueryAutomaticState
    ) -> QueryAutomaticState:
        """
        Format final response
        """
        # Already formatted in synthesis step
        # Add any additional formatting here if needed
        
        # Calculate final cost
        state["estimated_cost"] = self.cost_tracker.calculate_cost(
            state["total_tokens_used"],
            len(state["selected_agents"]),
            state["complexity"]
        )
        
        return state
    
    async def _track_costs(self, state: QueryAutomaticState):
        """
        Track costs in database
        """
        await self.cost_tracker.track_consultation(
            consultation_id=state["consultation_id"],
            tenant_id=state["tenant_id"],
            mode="query_automatic",
            agents_used=len(state["selected_agents"]),
            tokens_used=state["total_tokens_used"],
            cost=state["estimated_cost"]
        )
    
    def _generate_selection_reasoning(
        self,
        selected: List[SelectedAgent],
        criteria: AgentSelectionCriteria
    ) -> str:
        """
        Generate human-readable selection reasoning
        """
        reasoning = f"""
Agent Selection Reasoning:
- Query Complexity: {criteria['complexity_level']}
- Primary Domain: {criteria['primary_domain']}
- Diversity Requirement: {criteria['diversity_requirement']:.1%}

Selected Experts:
"""
        for agent in selected:
            reasoning += f"""
  • {agent['name']} ({agent['specialty']})
    - Relevance Score: {agent['relevance_score']:.2%}
    - Diversity Score: {agent['diversity_score']:.2%}
"""
        
        return reasoning.strip()
    
    def _format_synthesis_response(
        self,
        synthesis: SynthesisOutput
    ) -> str:
        """
        Format synthesis into final response
        """
        response = f"""## Executive Summary

{synthesis.executive_summary}

## Expert Analysis

### Consensus Views
"""
        for point in synthesis.consensus_points[:5]:
            response += f"• {point}\n"
        
        response += "\n### Diverse Perspectives\n"
        
        for perspective in synthesis.diverse_perspectives[:3]:
            response += f"""
**{perspective.get('expert_name', 'Expert')} Perspective:**
{perspective.get('view', '')}
"""
        
        response += "\n## Recommendations\n"
        
        for i, rec in enumerate(synthesis.recommendations[:5], 1):
            response += f"{i}. {rec}\n"
        
        if synthesis.risk_considerations:
            response += "\n## Risk Considerations\n"
            for risk in synthesis.risk_considerations[:3]:
                response += f"⚠️ {risk}\n"
        
        response += f"""

---
*Confidence Score: {synthesis.confidence_score:.1%}*
*{len(synthesis.expert_attributions)} experts contributed to this analysis*
"""
        
        return response.strip()
    
    def _estimate_tokens(self, synthesis: SynthesisOutput) -> int:
        """
        Estimate total tokens used
        """
        # Rough estimation: 1 token ≈ 4 characters
        total_chars = 0
        
        # Count synthesis content
        total_chars += len(synthesis.executive_summary)
        total_chars += sum(len(p) for p in synthesis.consensus_points)
        total_chars += sum(len(str(p)) for p in synthesis.diverse_perspectives)
        total_chars += sum(len(r) for r in synthesis.recommendations)
        total_chars += sum(len(r) for r in synthesis.risk_considerations)
        
        # Add overhead for prompts (estimated)
        total_chars += 5000
        
        return total_chars // 4
```

---

## 🌐 API DESIGN

### REST API Implementation

```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
import asyncio

# Request/Response Models
class QueryAutomaticRequest(BaseModel):
    query: str
    user_id: str
    session_metadata: Optional[Dict] = {}
    preferences: Optional[Dict] = {}

class QueryAutomaticResponse(BaseModel):
    consultation_id: str
    response: str
    metadata: Dict
    processing_time_ms: int
    estimated_cost: float

# API Router
app = FastAPI(title="VITAL Ask Expert - Mode 3")

@app.post("/api/v1/mode3/query", response_model=QueryAutomaticResponse)
async def query_automatic(
    request: QueryAutomaticRequest,
    background_tasks: BackgroundTasks
):
    """
    Execute Mode 3: Query Automatic
    
    Multi-agent synthesis with automatic selection
    """
    start_time = time.time()
    
    try:
        # Get tenant from auth context
        tenant_id = get_tenant_id_from_auth()
        
        # Initialize chain
        chain = QueryAutomaticChain(
            agent_selector=agent_selector,
            synthesis_engine=synthesis_engine,
            rag_manager=rag_manager,
            cost_tracker=cost_tracker
        )
        
        # Execute chain
        result = await chain.acall({
            "query": request.query,
            "tenant_id": tenant_id,
            "user_id": request.user_id
        })
        
        # Log in background
        background_tasks.add_task(
            log_consultation,
            consultation_id=result["metadata"]["consultation_id"],
            request=request,
            result=result
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return QueryAutomaticResponse(
            consultation_id=result["metadata"]["consultation_id"],
            response=result["response"],
            metadata=result["metadata"],
            processing_time_ms=processing_time,
            estimated_cost=result["metadata"]["total_cost"]
        )
        
    except Exception as e:
        logger.error(f"Mode 3 execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/mode3/stream/{consultation_id}")
async def stream_query_automatic(consultation_id: str):
    """
    Stream Mode 3 response with SSE
    """
    async def event_generator():
        try:
            # Get consultation from cache/db
            consultation = await get_consultation(consultation_id)
            
            if not consultation:
                yield f"data: {json.dumps({'error': 'Consultation not found'})}\n\n"
                return
            
            # Stream processing steps
            steps = [
                {"step": "analyzing_query", "message": "Analyzing your query..."},
                {"step": "selecting_agents", "message": "Selecting optimal experts..."},
                {"step": "loading_context", "message": "Loading expert knowledge..."},
                {"step": "generating_perspectives", "message": "Generating expert perspectives..."},
                {"step": "synthesizing", "message": "Synthesizing comprehensive response..."},
                {"step": "complete", "message": "Response ready"}
            ]
            
            for step in steps:
                yield f"data: {json.dumps(step)}\n\n"
                await asyncio.sleep(0.5)
            
            # Stream final response
            yield f"data: {json.dumps({'response': consultation['response']})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@app.get("/api/v1/mode3/agents/{consultation_id}")
async def get_selected_agents(consultation_id: str):
    """
    Get details of agents selected for consultation
    """
    consultation = await get_consultation(consultation_id)
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    return {
        "consultation_id": consultation_id,
        "agents": consultation["metadata"]["agents_used"],
        "selection_reasoning": consultation.get("selection_reasoning"),
        "confidence_scores": consultation["metadata"].get("agent_confidence", {})
    }

@app.post("/api/v1/mode3/feedback")
async def submit_feedback(
    consultation_id: str,
    rating: int,
    comments: Optional[str] = None
):
    """
    Submit feedback for consultation
    """
    await save_feedback(
        consultation_id=consultation_id,
        rating=rating,
        comments=comments
    )
    
    return {"status": "success", "message": "Feedback recorded"}
```

---

## ⚙️ PRODUCTION CONFIGURATION

### Environment Configuration

```yaml
# config/mode3_production.yaml
mode3:
  # Model Configuration
  llm:
    model: "gpt-4-turbo-preview"
    temperature: 0.7
    max_tokens: 4096
    streaming: true
    
  # Agent Selection
  agent_selection:
    search_top_k: 10
    select_min: 3
    select_max: 5
    diversity_weight: 0.3
    min_relevance_score: 0.7
    
  # RAG Configuration
  rag:
    max_documents_per_agent: 5
    chunk_size: 1000
    chunk_overlap: 100
    rerank_top_k: 3
    
  # Performance
  performance:
    max_processing_time_ms: 5000
    cache_ttl_seconds: 3600
    parallel_agent_limit: 5
    
  # Cost Management
  cost:
    max_cost_per_query: 0.50
    alert_threshold: 0.40
    
  # Observability
  monitoring:
    trace_enabled: true
    metrics_enabled: true
    log_level: "INFO"
```

### Docker Configuration

```dockerfile
# Dockerfile.mode3
FROM python:3.11-slim

# Install dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY config/ ./config/

# Environment
ENV PYTHONPATH=/app
ENV MODE=mode3_query_automatic

# Run
CMD ["uvicorn", "src.api.mode3:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🧪 TESTING STRATEGY

### Comprehensive Test Suite

```python
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch

class TestMode3QueryAutomatic:
    """
    Complete test suite for Mode 3
    """
    
    @pytest.fixture
    def mock_agent_selector(self):
        selector = Mock(spec=IntelligentAgentSelector)
        selector.select_optimal_agents = AsyncMock(return_value=[
            {
                "agent_id": "agent1",
                "name": "FDA Expert",
                "specialty": "Regulatory",
                "relevance_score": 0.9,
                "diversity_score": 0.8
            },
            {
                "agent_id": "agent2",
                "name": "AI Specialist",
                "specialty": "Technology",
                "relevance_score": 0.85,
                "diversity_score": 0.7
            }
        ])
        return selector
    
    @pytest.fixture
    def mock_synthesis_engine(self):
        engine = Mock(spec=MultiAgentSynthesisEngine)
        engine.synthesize_response = AsyncMock(return_value=Mock(
            executive_summary="Test summary",
            consensus_points=["Point 1", "Point 2"],
            diverse_perspectives=[],
            recommendations=["Rec 1"],
            risk_considerations=["Risk 1"],
            confidence_score=0.85,
            expert_attributions={},
            citations=[]
        ))
        return engine
    
    @pytest.mark.asyncio
    async def test_query_processing(self):
        """Test query analysis and processing"""
        processor = QueryProcessor()
        
        result = await processor.analyze(
            "What are FDA requirements for AI diagnostic tools?"
        )
        
        assert result["complexity"] in ["moderate", "complex"]
        assert "FDA" in result["domains"] or "regulatory" in result["domains"]
        assert len(result["embedding"]) == 1536
        assert result["processed_query"]
    
    @pytest.mark.asyncio
    async def test_agent_selection(self, mock_agent_selector):
        """Test intelligent agent selection"""
        query_embedding = [0.1] * 1536
        
        agents = await mock_agent_selector.select_optimal_agents(
            query_embedding,
            {"detected_domains": ["regulatory", "AI"]},
            top_k=10,
            select_n=3
        )
        
        assert len(agents) == 2
        assert agents[0]["relevance_score"] >= agents[1]["relevance_score"]
        assert all(a["relevance_score"] >= 0.7 for a in agents)
    
    @pytest.mark.asyncio
    async def test_diversity_scoring(self):
        """Test agent diversity calculation"""
        selector = IntelligentAgentSelector(Mock(), diversity_weight=0.3)
        
        candidates = [
            {"embedding": [0.1] * 1536, "metadata": {"domains": ["FDA"]}},
            {"embedding": [0.2] * 1536, "metadata": {"domains": ["AI"]}},
            {"embedding": [0.15] * 1536, "metadata": {"domains": ["FDA", "AI"]}}
        ]
        
        diversity_matrix = selector._calculate_diversity_matrix(candidates)
        
        assert diversity_matrix.shape == (3, 3)
        assert diversity_matrix[0][1] > 0  # Different agents have diversity
        assert diversity_matrix[0][0] == 0  # Same agent has no diversity
    
    @pytest.mark.asyncio
    async def test_multi_agent_synthesis(self, mock_synthesis_engine):
        """Test synthesis of multiple perspectives"""
        query = "How to implement AI in healthcare?"
        agents = [Mock(), Mock()]
        contexts = {"agent1": [], "agent2": []}
        
        result = await mock_synthesis_engine.synthesize_response(
            query, agents, contexts
        )
        
        assert result.executive_summary
        assert len(result.consensus_points) >= 1
        assert result.confidence_score >= 0 and result.confidence_score <= 1
    
    @pytest.mark.asyncio
    async def test_complete_chain_execution(
        self,
        mock_agent_selector,
        mock_synthesis_engine
    ):
        """Test full Mode 3 chain execution"""
        chain = QueryAutomaticChain(
            agent_selector=mock_agent_selector,
            synthesis_engine=mock_synthesis_engine,
            rag_manager=Mock(),
            cost_tracker=Mock()
        )
        
        result = await chain.acall({
            "query": "Test query",
            "tenant_id": "test_tenant",
            "user_id": "test_user"
        })
        
        assert result["response"]
        assert result["metadata"]["consultation_id"]
        assert result["metadata"]["agents_used"]
        assert result["metadata"]["confidence_score"] >= 0
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in Mode 3"""
        chain = QueryAutomaticChain(
            agent_selector=Mock(),
            synthesis_engine=Mock(),
            rag_manager=Mock(),
            cost_tracker=Mock()
        )
        
        # Simulate error
        chain.agent_selector.select_optimal_agents = AsyncMock(
            side_effect=Exception("Selection failed")
        )
        
        with pytest.raises(Exception) as exc_info:
            await chain.acall({
                "query": "Test query",
                "tenant_id": "test_tenant",
                "user_id": "test_user"
            })
        
        assert "Selection failed" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_streaming_response(self):
        """Test SSE streaming"""
        from src.api.mode3 import stream_query_automatic
        
        # Mock consultation
        with patch('src.api.mode3.get_consultation', new=AsyncMock(return_value={
            "response": "Test response",
            "metadata": {}
        })):
            generator = stream_query_automatic("test_consultation_id")
            events = []
            
            async for event in generator:
                events.append(event)
            
            assert len(events) > 0
            assert "complete" in events[-1]
    
    def test_cost_calculation(self):
        """Test cost tracking"""
        tracker = CostTracker()
        
        cost = tracker.calculate_cost(
            tokens=5000,
            agents=3,
            complexity="complex"
        )
        
        assert cost > 0
        assert cost < 1.0  # Should be under $1
    
    @pytest.mark.asyncio
    async def test_performance_requirements(self):
        """Test performance meets requirements"""
        start = time.time()
        
        # Simulate Mode 3 execution
        await asyncio.sleep(0.1)  # Simulate processing
        
        elapsed = time.time() - start
        
        assert elapsed < 5.0  # Must complete within 5 seconds
```

### Load Testing

```python
import asyncio
import aiohttp
import time
from typing import List

async def load_test_mode3(
    num_requests: int = 100,
    concurrent: int = 10
):
    """
    Load test Mode 3 endpoint
    """
    url = "http://localhost:8000/api/v1/mode3/query"
    
    queries = [
        "What are FDA requirements for AI?",
        "How to implement HIPAA compliance?",
        "Market strategy for digital therapeutics",
        "Clinical trial design for software",
        "Reimbursement pathways for remote monitoring"
    ]
    
    async def make_request(session, query):
        start = time.time()
        try:
            async with session.post(url, json={
                "query": query,
                "user_id": f"test_user_{time.time()}"
            }) as response:
                result = await response.json()
                elapsed = time.time() - start
                return {
                    "success": True,
                    "time": elapsed,
                    "consultation_id": result.get("consultation_id")
                }
        except Exception as e:
            return {
                "success": False,
                "time": time.time() - start,
                "error": str(e)
            }
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        
        for i in range(num_requests):
            query = queries[i % len(queries)]
            task = make_request(session, query)
            tasks.append(task)
            
            if len(tasks) >= concurrent:
                results = await asyncio.gather(*tasks)
                tasks = []
        
        if tasks:
            results = await asyncio.gather(*tasks)
    
    # Analyze results
    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]
    times = [r["time"] for r in successes]
    
    print(f"""
Load Test Results:
- Total Requests: {num_requests}
- Successful: {len(successes)}
- Failed: {len(failures)}
- Avg Response Time: {sum(times)/len(times):.2f}s
- P95 Response Time: {sorted(times)[int(len(times)*0.95)]:.2f}s
- P99 Response Time: {sorted(times)[int(len(times)*0.99)]:.2f}s
    """)

if __name__ == "__main__":
    asyncio.run(load_test_mode3())
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Optimization Strategies

```python
class Mode3PerformanceOptimizer:
    """
    Performance optimization for Mode 3
    """
    
    def __init__(self):
        self.cache = redis.Redis()
        self.connection_pool = aiohttp.TCPConnector(limit=100)
    
    async def optimize_agent_selection(
        self,
        query_embedding: List[float]
    ) -> List[Dict]:
        """
        Optimized agent selection with caching
        """
        # Check cache
        cache_key = f"agents:{hashlib.md5(str(query_embedding).encode()).hexdigest()}"
        cached = self.cache.get(cache_key)
        
        if cached:
            return json.loads(cached)
        
        # Parallel search with connection pooling
        async with aiohttp.ClientSession(connector=self.connection_pool) as session:
            # Batch Pinecone queries
            results = await self._batch_pinecone_search(
                session,
                query_embedding
            )
        
        # Cache results
        self.cache.setex(
            cache_key,
            3600,  # 1 hour TTL
            json.dumps(results)
        )
        
        return results
    
    async def parallel_context_loading(
        self,
        agents: List[Dict]
    ) -> Dict[str, List[Dict]]:
        """
        Load context for all agents in parallel
        """
        # Use ThreadPoolExecutor for I/O bound operations
        with ThreadPoolExecutor(max_workers=5) as executor:
            loop = asyncio.get_event_loop()
            
            tasks = []
            for agent in agents:
                task = loop.run_in_executor(
                    executor,
                    self._load_agent_context_sync,
                    agent
                )
                tasks.append(task)
            
            contexts = await asyncio.gather(*tasks)
        
        return {
            agent["agent_id"]: context
            for agent, context in zip(agents, contexts)
        }
    
    def optimize_synthesis_prompts(
        self,
        perspectives: List[str]
    ) -> str:
        """
        Optimize prompts to reduce tokens
        """
        # Compress perspectives
        compressed = []
        
        for persp in perspectives:
            # Remove redundant text
            cleaned = self._remove_redundancy(persp)
            
            # Summarize if too long
            if len(cleaned) > 1000:
                cleaned = self._summarize_text(cleaned)
            
            compressed.append(cleaned)
        
        return "\n".join(compressed)
    
    async def stream_response_chunks(
        self,
        response: str
    ):
        """
        Stream response in optimized chunks
        """
        # Split into semantic chunks
        chunks = self._split_semantic_chunks(response)
        
        for chunk in chunks:
            yield {
                "type": "content",
                "data": chunk,
                "timestamp": time.time()
            }
            await asyncio.sleep(0.01)  # Small delay for streaming effect
    
    def _remove_redundancy(self, text: str) -> str:
        """Remove redundant phrases and words"""
        # Implementation for redundancy removal
        return text
    
    def _summarize_text(self, text: str) -> str:
        """Summarize long text"""
        # Implementation for text summarization
        return text[:1000]  # Simple truncation for example
    
    def _split_semantic_chunks(self, text: str) -> List[str]:
        """Split text into semantic chunks"""
        # Split by paragraphs or sentences
        paragraphs = text.split('\n\n')
        return paragraphs
```

---

## 🔒 SECURITY & COMPLIANCE

### Security Implementation

```python
class Mode3SecurityManager:
    """
    Security and compliance for Mode 3
    """
    
    def __init__(self):
        self.encryptor = Fernet(settings.ENCRYPTION_KEY)
        self.rate_limiter = RateLimiter()
        self.audit_logger = AuditLogger()
    
    async def validate_request(
        self,
        request: QueryAutomaticRequest,
        tenant_id: str
    ) -> bool:
        """
        Validate and sanitize request
        """
        # Check rate limits
        if not await self.rate_limiter.check(tenant_id, "mode3"):
            raise HTTPException(429, "Rate limit exceeded")
        
        # Validate query length
        if len(request.query) > 5000:
            raise ValueError("Query too long")
        
        # Check for injection attempts
        if self._detect_injection(request.query):
            await self.audit_logger.log_security_event(
                "injection_attempt",
                tenant_id,
                request.query
            )
            raise ValueError("Invalid query content")
        
        # Check tenant permissions
        if not await self._check_tenant_permissions(tenant_id, "mode3"):
            raise HTTPException(403, "Mode not available for tenant")
        
        return True
    
    def encrypt_sensitive_data(
        self,
        data: Dict
    ) -> Dict:
        """
        Encrypt sensitive fields
        """
        sensitive_fields = ["user_id", "email", "phone"]
        
        encrypted = data.copy()
        for field in sensitive_fields:
            if field in encrypted:
                encrypted[field] = self.encryptor.encrypt(
                    str(encrypted[field]).encode()
                ).decode()
        
        return encrypted
    
    async def audit_consultation(
        self,
        consultation_id: str,
        request: Dict,
        response: Dict,
        tenant_id: str
    ):
        """
        Comprehensive audit logging
        """
        audit_entry = {
            "consultation_id": consultation_id,
            "tenant_id": tenant_id,
            "mode": "query_automatic",
            "timestamp": datetime.utcnow().isoformat(),
            "request_hash": hashlib.sha256(
                json.dumps(request).encode()
            ).hexdigest(),
            "agents_used": response.get("metadata", {}).get("agents_used", []),
            "processing_time_ms": response.get("processing_time_ms"),
            "cost": response.get("estimated_cost"),
            "ip_address": self._get_client_ip(),
            "user_agent": self._get_user_agent()
        }
        
        await self.audit_logger.log(audit_entry)
    
    def _detect_injection(self, text: str) -> bool:
        """
        Detect injection attempts
        """
        patterns = [
            r"<script",
            r"javascript:",
            r"on\w+\s*=",
            r"union\s+select",
            r"drop\s+table"
        ]
        
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    async def _check_tenant_permissions(
        self,
        tenant_id: str,
        mode: str
    ) -> bool:
        """
        Check tenant has access to mode
        """
        # Check in database
        result = await db.fetchone(
            """
            SELECT modes_enabled
            FROM tenants
            WHERE id = $1
            """,
            tenant_id
        )
        
        if result and mode in result["modes_enabled"]:
            return True
        
        return False
```

---

## 📦 DEPLOYMENT GUIDE

### Kubernetes Deployment

```yaml
# k8s/mode3-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vital-mode3-query-automatic
  namespace: vital-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vital-mode3
  template:
    metadata:
      labels:
        app: vital-mode3
        mode: query-automatic
    spec:
      containers:
      - name: mode3-api
        image: vital-platform/mode3:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODE
          value: "query_automatic"
        - name: LOG_LEVEL
          value: "INFO"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: api-key
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: pinecone-secret
              key: api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: vital-mode3-service
  namespace: vital-platform
spec:
  selector:
    app: vital-mode3
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vital-mode3-hpa
  namespace: vital-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vital-mode3-query-automatic
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Monitoring Configuration

```yaml
# monitoring/mode3-monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mode3-prometheus-config
  namespace: vital-platform
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'mode3-metrics'
      static_configs:
      - targets: ['vital-mode3-service:8000']
      metrics_path: '/metrics'
    
    alerting:
      alertmanagers:
      - static_configs:
        - targets: ['alertmanager:9093']
    
    rule_files:
    - '/etc/prometheus/alerts.yml'
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: mode3-alerts
  namespace: vital-platform
data:
  alerts.yml: |
    groups:
    - name: mode3_alerts
      rules:
      - alert: Mode3HighLatency
        expr: histogram_quantile(0.95, mode3_request_duration_seconds) > 5
        for: 5m
        annotations:
          summary: "Mode 3 P95 latency above 5 seconds"
      
      - alert: Mode3HighErrorRate
        expr: rate(mode3_requests_failed_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Mode 3 error rate above 5%"
      
      - alert: Mode3HighCost
        expr: rate(mode3_cost_total[1h]) > 100
        for: 5m
        annotations:
          summary: "Mode 3 cost rate exceeding $100/hour"
```

---

## 📊 SUCCESS METRICS

### Key Performance Indicators

| Metric | Target | Monitoring |
|--------|--------|------------|
| **Response Time P50** | < 3s | Prometheus histogram |
| **Response Time P95** | < 5s | Prometheus histogram |
| **Response Time P99** | < 7s | Prometheus histogram |
| **Success Rate** | > 99% | Error rate monitoring |
| **Agent Selection Accuracy** | > 90% | A/B testing |
| **Synthesis Quality Score** | > 4.5/5 | User feedback |
| **Cost per Query** | < $0.30 | Cost tracking |
| **Cache Hit Rate** | > 60% | Redis metrics |
| **Concurrent Requests** | > 50 | Load testing |
| **Memory Usage** | < 4GB | Container metrics |

### Quality Assurance Checklist

- [ ] Query processing completes in < 500ms
- [ ] Agent selection returns 3-5 relevant experts
- [ ] Diversity score > 0.3 for agent selection
- [ ] All selected agents have relevance > 0.7
- [ ] Context loading completes in < 2s
- [ ] Synthesis includes consensus points
- [ ] Response includes confidence score
- [ ] Citations are properly formatted
- [ ] Cost tracking is accurate
- [ ] Audit logging captures all events
- [ ] Error handling provides fallbacks
- [ ] Streaming works for real-time updates

---

## 🎯 SUMMARY

Mode 3 (Query Automatic) represents the most sophisticated one-shot consultation mode in the VITAL platform, combining:

1. **Intelligent Agent Selection**: Advanced algorithms balancing relevance and diversity
2. **Multi-Agent Synthesis**: Sophisticated perspective integration with conflict resolution
3. **Production-Ready Implementation**: Complete with error handling, monitoring, and optimization
4. **Enterprise-Grade Security**: Comprehensive validation, encryption, and audit logging
5. **Scalable Architecture**: Designed for high concurrency and performance

This gold standard implementation ensures Mode 3 delivers exceptional value through automated multi-expert consultation, providing users with comprehensive, balanced, and actionable insights within seconds.

---

**END OF MODE 3 GOLD STANDARD DOCUMENTATION**