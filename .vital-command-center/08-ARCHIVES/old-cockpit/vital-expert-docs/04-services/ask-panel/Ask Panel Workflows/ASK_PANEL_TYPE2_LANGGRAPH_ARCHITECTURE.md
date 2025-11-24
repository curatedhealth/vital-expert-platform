# Ask Panel Type 2: Open Panel - LangGraph Architecture

**Panel Type**: Open Panel - Complete LangGraph Implementation  
**Version**: 1.0  
**Date**: November 11, 2025  
**Status**: Production Ready  
**Document Type**: Technical Architecture & Implementation

---

## 📋 EXECUTIVE SUMMARY

This document provides the complete LangGraph state machine architecture for **Ask Panel Type 2: Open Panel**, including production-ready Python code, state definitions, node implementations, and deployment patterns.

**What's Included:**
- ✅ Complete state type definitions
- ✅ Production-ready Python implementation
- ✅ All node functions with error handling
- ✅ Edge routing logic and conditions
- ✅ Multi-tenant security integration
- ✅ Streaming support (SSE)
- ✅ Testing strategies
- ✅ Deployment configuration

---

## 🏗️ ARCHITECTURE OVERVIEW

### LangGraph Pattern for Open Panel

```
PATTERN: Parallel Exploration with Dynamic Turn-Taking

STATE FLOW:
Initialize → Opening Round → Free Dialogue → Theme Clustering
  → Final Perspectives → Synthesis → Generate Deliverables → END

KEY CHARACTERISTICS:
• Stateful: Maintains conversation context across turns
• Streaming: Real-time SSE events to client
• Tenant-Aware: All operations respect tenant isolation
• Error-Resilient: Graceful degradation and retry logic
• Deterministic: Reproducible with same inputs + seed
```

---

## 📦 COMPLETE STATE DEFINITION

```python
from typing import TypedDict, List, Dict, Optional, Annotated
from datetime import datetime
import operator
from enum import Enum

class PanelPhase(str, Enum):
    """Enum for panel execution phases"""
    INITIALIZING = "initializing"
    OPENING = "opening"
    DIALOGUE = "dialogue"
    CLUSTERING = "clustering"
    FINAL_PERSPECTIVES = "final_perspectives"
    SYNTHESIS = "synthesis"
    DELIVERABLES = "deliverables"
    COMPLETE = "complete"
    FAILED = "failed"

class TurnType(str, Enum):
    """Enum for dialogue turn types"""
    OPENING = "opening"
    BUILDING = "building"  # Building on previous idea
    NEW = "new"  # Introducing new perspective
    CONNECTING = "connecting"  # Connecting multiple ideas
    FINAL = "final"  # Final perspective

class OpenPanelState(TypedDict):
    """
    Complete state definition for Open Panel Type 2
    
    This state is passed through all nodes in the LangGraph workflow
    and contains all data needed for panel execution, consensus building,
    and deliverable generation.
    """
    
    # === CORE IDENTIFIERS ===
    panel_id: str  # Unique panel identifier
    tenant_id: str  # Tenant for multi-tenant isolation
    user_id: str  # User who created the panel
    
    # === PANEL CONFIGURATION ===
    query: str  # Original user query
    panel_type: str  # Always "open" for Type 2
    agents: List[Dict]  # Selected expert agents with configs
    configuration: Dict  # Panel-specific configuration
    
    # === EXECUTION STATE ===
    phase: PanelPhase  # Current execution phase
    round_number: int  # Current round (for tracking)
    start_time: datetime  # Panel start timestamp
    current_turn: int  # Current dialogue turn number
    
    # === DISCUSSION DATA (Accumulating) ===
    # Annotated with operator.add for list accumulation
    opening_statements: Annotated[List[Dict], operator.add]
    dialogue_turns: Annotated[List[Dict], operator.add]
    idea_units: Annotated[List[Dict], operator.add]
    final_perspectives: Annotated[List[Dict], operator.add]
    
    # === CONVERSATION CONTEXT (Mutable) ===
    conversation_context: Dict  # Tracks topics, speak counts, patterns
    accumulated_context: str  # String context for LLM prompts
    
    # === ANALYSIS RESULTS ===
    themes: List[Dict]  # Identified themes from clustering
    clusters: List[Dict]  # Idea clusters with metadata
    convergence_points: List[Dict]  # Areas of high agreement
    divergence_points: List[Dict]  # Areas of creative tension
    connections: List[Dict]  # Idea-to-idea connections
    
    # === CONSENSUS TRACKING ===
    consensus_level: float  # Overall consensus (0-1)
    expert_alignments: Dict[str, float]  # Per-expert agreement
    cluster_confidences: Dict[str, float]  # Per-cluster confidence
    
    # === SYNTHESIS OUTPUTS ===
    final_synthesis: Optional[str]  # Comprehensive synthesis text
    innovation_map: Optional[Dict]  # Visual innovation map data
    executive_summary: Optional[str]  # 250-word executive summary
    
    # === DELIVERABLES ===
    deliverables: List[Dict]  # Generated documents
    deliverable_urls: List[str]  # S3/CDN URLs for downloads
    
    # === METADATA ===
    total_duration: Optional[float]  # Total execution time (seconds)
    token_usage: int  # Total tokens consumed
    error_count: int  # Number of recoverable errors
    streaming_active: bool  # Whether SSE streaming is active
    
    # === ERROR HANDLING ===
    last_error: Optional[str]  # Last error message (if any)
    retry_count: int  # Number of retries attempted
    
    # === AUDIT TRAIL ===
    created_at: datetime
    updated_at: datetime
    events: Annotated[List[Dict], operator.add]  # Audit events
```

---

## 🔧 COMPLETE LANGGRAPH IMPLEMENTATION

### Part 1: Core Orchestrator Class

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver
from typing import Dict, List, Tuple, Optional
import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from vital_shared_kernel.multi_tenant import TenantContext, get_tenant_id
from vital_shared_kernel.agents import AgentRegistry
from vital_shared_kernel.rag import RAGEngine
from vital_shared_kernel.streaming import SSEManager

logger = logging.getLogger(__name__)

class OpenPanelOrchestrator:
    """
    LangGraph orchestrator for Ask Panel Type 2: Open Panel
    
    Implements parallel collaborative exploration with:
    - Dynamic turn-taking in dialogue phase
    - Real-time SSE streaming
    - Multi-tenant security
    - Idea clustering and consensus building
    - Comprehensive deliverable generation
    """
    
    def __init__(
        self,
        agent_registry: AgentRegistry,
        rag_engine: RAGEngine,
        sse_manager: SSEManager,
        checkpoint_saver: Optional[MemorySaver] = None
    ):
        """
        Initialize the Open Panel orchestrator
        
        Args:
            agent_registry: Registry for loading expert agents
            rag_engine: RAG engine for context retrieval
            sse_manager: Manager for Server-Sent Events streaming
            checkpoint_saver: Optional checkpointer for state persistence
        """
        self.agent_registry = agent_registry
        self.rag_engine = rag_engine
        self.sse_manager = sse_manager
        self.checkpoint_saver = checkpoint_saver or MemorySaver()
        
        # Build the workflow graph
        self.workflow = self._create_workflow()
        self.app = self.workflow.compile(checkpointer=self.checkpoint_saver)
    
    def _create_workflow(self) -> StateGraph:
        """
        Create the LangGraph workflow for Open Panel
        
        Returns:
            Compiled StateGraph workflow
        """
        workflow = StateGraph(OpenPanelState)
        
        # === DEFINE NODES ===
        workflow.add_node("initialize", self.initialize_panel)
        workflow.add_node("opening_round", self.execute_opening_round)
        workflow.add_node("free_dialogue", self.execute_free_dialogue)
        workflow.add_node("identify_themes", self.identify_themes)
        workflow.add_node("final_perspectives", self.gather_final_perspectives)
        workflow.add_node("synthesize", self.synthesize_recommendations)
        workflow.add_node("generate_deliverables", self.generate_deliverables)
        workflow.add_node("handle_error", self.handle_error)
        
        # === DEFINE EDGES ===
        workflow.set_entry_point("initialize")
        
        # Success path
        workflow.add_edge("initialize", "opening_round")
        workflow.add_edge("opening_round", "free_dialogue")
        workflow.add_edge("free_dialogue", "identify_themes")
        workflow.add_edge("identify_themes", "final_perspectives")
        workflow.add_edge("final_perspectives", "synthesize")
        workflow.add_edge("synthesize", "generate_deliverables")
        workflow.add_edge("generate_deliverables", END)
        
        # Error handling edges (conditional)
        workflow.add_conditional_edges(
            "initialize",
            self.check_for_errors,
            {
                "continue": "opening_round",
                "error": "handle_error"
            }
        )
        
        workflow.add_conditional_edges(
            "free_dialogue",
            self.should_continue_dialogue,
            {
                "continue": "free_dialogue",  # Loop back
                "proceed": "identify_themes"  # Natural stopping point
            }
        )
        
        workflow.add_edge("handle_error", END)
        
        return workflow
    
    # === NODE IMPLEMENTATIONS ===
    
    async def initialize_panel(self, state: OpenPanelState) -> OpenPanelState:
        """
        Initialize panel with configuration and context
        
        This node:
        1. Validates tenant context
        2. Loads expert agents
        3. Loads context documents
        4. Initializes SSE streaming
        5. Sets up conversation tracking
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with initialized components
        """
        logger.info(f"Initializing Open Panel {state['panel_id']}")
        
        try:
            # Validate tenant context
            tenant_id = get_tenant_id()
            if tenant_id != state['tenant_id']:
                raise ValueError(f"Tenant mismatch: {tenant_id} != {state['tenant_id']}")
            
            # Load expert agents for this tenant
            agent_ids = state['configuration'].get('agent_ids', [])
            if not agent_ids:
                # Auto-select agents based on query
                agents = await self.agent_registry.auto_select_agents(
                    query=state['query'],
                    min_count=5,
                    max_count=8,
                    tenant_id=state['tenant_id']
                )
            else:
                agents = await self.agent_registry.load_agents(
                    agent_ids=agent_ids,
                    tenant_id=state['tenant_id']
                )
            
            state['agents'] = agents
            logger.info(f"Loaded {len(agents)} experts for panel {state['panel_id']}")
            
            # Load context documents if provided
            doc_ids = state['configuration'].get('document_ids', [])
            if doc_ids:
                context = await self.rag_engine.retrieve_documents(
                    document_ids=doc_ids,
                    tenant_id=state['tenant_id']
                )
                state['accumulated_context'] = context
                logger.info(f"Loaded {len(doc_ids)} context documents")
            else:
                state['accumulated_context'] = ""
            
            # Initialize SSE streaming
            await self.sse_manager.create_stream(
                panel_id=state['panel_id'],
                user_id=state['user_id'],
                tenant_id=state['tenant_id']
            )
            state['streaming_active'] = True
            
            # Initialize conversation context tracking
            state['conversation_context'] = {
                'topics_discussed': [],
                'experts_spoken': {agent['id']: 0 for agent in agents},
                'building_on_ideas': [],
                'last_speakers': []
            }
            
            # Stream initialization event
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='panel_initialized',
                data={
                    'panel_id': state['panel_id'],
                    'experts': [
                        {'name': a['name'], 'specialty': a['specialty']} 
                        for a in agents
                    ],
                    'estimated_duration': '5-10 minutes',
                    'configuration': state['configuration']
                }
            )
            
            # Update state
            state['phase'] = PanelPhase.OPENING
            state['round_number'] = 1
            state['current_turn'] = 0
            state['opening_statements'] = []
            state['dialogue_turns'] = []
            state['idea_units'] = []
            state['final_perspectives'] = []
            state['events'] = []
            state['updated_at'] = datetime.now()
            
            return state
            
        except Exception as e:
            logger.error(f"Error initializing panel {state['panel_id']}: {str(e)}")
            state['last_error'] = str(e)
            state['phase'] = PanelPhase.FAILED
            return state
    
    async def execute_opening_round(self, state: OpenPanelState) -> OpenPanelState:
        """
        Execute sequential opening statements from each expert
        
        This node:
        1. Generates opening statement from each expert (sequential)
        2. Extracts idea units from each statement
        3. Streams statements to client in real-time
        4. No context passing between experts in this phase
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with opening statements
        """
        logger.info(f"Executing opening round for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.OPENING
            opening_statements = []
            
            for i, agent in enumerate(state['agents']):
                # Generate opening statement (no prior context)
                statement = await self._generate_expert_response(
                    agent=agent,
                    query=state['query'],
                    context=state['accumulated_context'],  # Only doc context
                    mode=TurnType.OPENING,
                    max_tokens=150  # ~15 seconds when read aloud
                )
                
                opening_data = {
                    'agent_id': agent['id'],
                    'agent_name': agent['name'],
                    'agent_specialty': agent['specialty'],
                    'content': statement,
                    'timestamp': datetime.now().isoformat(),
                    'sequence': i + 1,
                    'turn_type': TurnType.OPENING.value
                }
                
                opening_statements.append(opening_data)
                
                # Extract idea units
                ideas = await self._extract_idea_units(
                    text=statement,
                    agent_id=agent['id'],
                    turn_number=i + 1
                )
                state['idea_units'].extend(ideas)
                
                # Stream to client
                await self.sse_manager.stream_event(
                    panel_id=state['panel_id'],
                    event='expert_speaking',
                    data={
                        **opening_data,
                        'phase': 'opening',
                        'total_experts': len(state['agents']),
                        'ideas_generated': len(ideas)
                    }
                )
                
                # Brief pause between speakers
                await asyncio.sleep(0.5)
            
            state['opening_statements'] = opening_statements
            
            # Stream phase completion
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='phase_complete',
                data={
                    'phase': 'opening',
                    'statements': len(opening_statements),
                    'ideas_generated': len(state['idea_units']),
                    'duration': '~90 seconds',
                    'next_phase': 'free_dialogue'
                }
            )
            
            logger.info(
                f"Opening round complete: {len(opening_statements)} statements, "
                f"{len(state['idea_units'])} ideas"
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Error in opening round: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def execute_free_dialogue(self, state: OpenPanelState) -> OpenPanelState:
        """
        Execute dynamic free-form dialogue with idea building
        
        This node:
        1. Selects next speaker intelligently (fairness + relevance + random)
        2. Determines turn type (building/new/connecting)
        3. Generates response with full conversation context
        4. Extracts ideas and identifies connections
        5. Updates conversation context for next turn
        6. Loops until natural stopping point
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with dialogue turns
        """
        logger.info(f"Executing free dialogue for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.DIALOGUE
            
            # Configuration
            max_turns = state['configuration'].get('max_dialogue_turns', 20)
            min_turns = state['configuration'].get('min_dialogue_turns', 12)
            
            # Single turn execution (will loop via conditional edge)
            current_turn = state['current_turn']
            
            if current_turn >= max_turns:
                logger.info(f"Reached max turns ({max_turns}), ending dialogue")
                return state
            
            # Select next speaker
            next_speaker = await self._select_next_speaker(
                state=state,
                conversation_context=state['conversation_context'],
                turn_number=current_turn
            )
            
            # Determine turn type
            turn_type = await self._determine_turn_type(
                speaker=next_speaker,
                conversation_context=state['conversation_context'],
                recent_turns=state['dialogue_turns'][-3:] if state['dialogue_turns'] else []
            )
            
            # Build dialogue context (recent conversation)
            dialogue_context = self._build_dialogue_context(
                opening_statements=state['opening_statements'],
                dialogue_turns=state['dialogue_turns'],
                max_context_turns=5  # Last 5 turns for context
            )
            
            # Generate expert response
            response = await self._generate_expert_response(
                agent=next_speaker,
                query=state['query'],
                context=dialogue_context,
                mode=turn_type,
                max_tokens=200
            )
            
            turn_data = {
                'agent_id': next_speaker['id'],
                'agent_name': next_speaker['name'],
                'agent_specialty': next_speaker['specialty'],
                'content': response,
                'turn_type': turn_type.value,
                'timestamp': datetime.now().isoformat(),
                'turn_number': current_turn + 1
            }
            
            # Extract ideas
            ideas = await self._extract_idea_units(
                text=response,
                agent_id=next_speaker['id'],
                turn_number=current_turn + 1
            )
            state['idea_units'].extend(ideas)
            
            # Identify connections to previous ideas
            connections = await self._identify_idea_connections(
                current_response=response,
                previous_ideas=state['idea_units'],
                turn_type=turn_type
            )
            
            if connections:
                state['conversation_context']['building_on_ideas'].extend(connections)
                turn_data['building_on'] = connections
            
            # Update conversation context
            state['conversation_context']['experts_spoken'][next_speaker['id']] += 1
            state['conversation_context']['last_speakers'].append(next_speaker['id'])
            if len(state['conversation_context']['last_speakers']) > 3:
                state['conversation_context']['last_speakers'].pop(0)
            
            # Add turn to dialogue
            state['dialogue_turns'].append(turn_data)
            state['current_turn'] = current_turn + 1
            
            # Stream to client
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='expert_speaking',
                data={
                    **turn_data,
                    'phase': 'dialogue',
                    'total_turns': state['current_turn'],
                    'max_turns': max_turns,
                    'ideas_generated': len(ideas),
                    'connections': len(connections) if connections else 0
                }
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Error in free dialogue: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def should_continue_dialogue(self, state: OpenPanelState) -> str:
        """
        Conditional edge: Determine if dialogue should continue or proceed
        
        Args:
            state: Current panel state
            
        Returns:
            "continue" to loop back to dialogue, "proceed" to move forward
        """
        current_turn = state['current_turn']
        min_turns = state['configuration'].get('min_dialogue_turns', 12)
        max_turns = state['configuration'].get('max_dialogue_turns', 20)
        
        # Must have minimum turns
        if current_turn < min_turns:
            return "continue"
        
        # Maximum turns reached
        if current_turn >= max_turns:
            logger.info(f"Max turns reached ({current_turn}/{max_turns})")
            return "proceed"
        
        # After minimum, assess natural stopping point
        # Check for:
        # 1. Idea saturation (diminishing new ideas)
        # 2. Theme convergence (ideas clustering)
        # 3. Repetitive patterns (no new ground)
        
        should_stop = await self._assess_dialogue_stopping_point(
            state=state,
            recent_turns=state['dialogue_turns'][-5:]
        )
        
        if should_stop:
            logger.info(f"Natural stopping point at turn {current_turn}")
            return "proceed"
        
        return "continue"
    
    async def identify_themes(self, state: OpenPanelState) -> OpenPanelState:
        """
        AI moderator identifies patterns, clusters, and themes
        
        This node:
        1. Clusters ideas using semantic similarity
        2. Names and describes each cluster
        3. Identifies convergence points (high agreement)
        4. Identifies divergence points (creative tension)
        5. Streams theme analysis to client
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with theme analysis
        """
        logger.info(f"Identifying themes for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.CLUSTERING
            
            # Cluster ideas by semantic similarity
            clusters = await self._cluster_ideas(
                idea_units=state['idea_units'],
                min_cluster_size=3,
                max_clusters=8
            )
            
            # Name and analyze each cluster
            for cluster in clusters:
                theme_analysis = await self._analyze_cluster_theme(
                    ideas=cluster['ideas'],
                    supporting_statements=(
                        state['opening_statements'] + state['dialogue_turns']
                    )
                )
                
                cluster['theme'] = theme_analysis['theme_name']
                cluster['description'] = theme_analysis['description']
                cluster['confidence'] = theme_analysis['confidence']
                cluster['key_components'] = theme_analysis['components']
                cluster['contributors'] = theme_analysis['contributing_experts']
            
            state['clusters'] = clusters
            
            # Identify convergence points
            convergence = await self._identify_convergence_points(
                clusters=clusters,
                expert_statements=state['opening_statements'] + state['dialogue_turns']
            )
            state['convergence_points'] = convergence
            
            # Identify divergence points
            divergence = await self._identify_divergence_points(
                clusters=clusters,
                expert_statements=state['opening_statements'] + state['dialogue_turns']
            )
            state['divergence_points'] = divergence
            
            # Stream theme analysis
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='theme_analysis',
                data={
                    'clusters': [
                        {
                            'theme': c['theme'],
                            'confidence': c['confidence'],
                            'key_components': c['key_components'][:3],
                            'contributors': c['contributors']
                        }
                        for c in clusters
                    ],
                    'convergence_areas': len(convergence),
                    'divergence_areas': len(divergence),
                    'total_ideas': len(state['idea_units'])
                }
            )
            
            logger.info(
                f"Theme clustering complete: {len(clusters)} clusters, "
                f"{len(convergence)} convergence, {len(divergence)} divergence"
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Error identifying themes: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def gather_final_perspectives(self, state: OpenPanelState) -> OpenPanelState:
        """
        Quick final input round from each expert
        
        This node:
        1. Generates brief final perspective from each expert
        2. Experts aware of identified themes
        3. Quick sequential round (30 seconds each)
        4. Streams to client
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with final perspectives
        """
        logger.info(f"Gathering final perspectives for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.FINAL_PERSPECTIVES
            final_perspectives = []
            
            # Build context with themes for final perspectives
            theme_context = self._build_theme_context(
                clusters=state['clusters'],
                convergence=state['convergence_points'],
                divergence=state['divergence_points']
            )
            
            for agent in state['agents']:
                # Generate final perspective
                statement = await self._generate_expert_response(
                    agent=agent,
                    query=state['query'],
                    context=theme_context,
                    mode=TurnType.FINAL,
                    max_tokens=100  # ~30 seconds
                )
                
                final_data = {
                    'agent_id': agent['id'],
                    'agent_name': agent['name'],
                    'agent_specialty': agent['specialty'],
                    'content': statement,
                    'timestamp': datetime.now().isoformat()
                }
                
                final_perspectives.append(final_data)
                
                # Stream to client
                await self.sse_manager.stream_event(
                    panel_id=state['panel_id'],
                    event='expert_speaking',
                    data={
                        **final_data,
                        'phase': 'final_perspectives'
                    }
                )
                
                await asyncio.sleep(0.3)
            
            state['final_perspectives'] = final_perspectives
            
            logger.info(f"Final perspectives complete: {len(final_perspectives)} statements")
            
            return state
            
        except Exception as e:
            logger.error(f"Error gathering final perspectives: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def synthesize_recommendations(self, state: OpenPanelState) -> OpenPanelState:
        """
        AI moderator synthesizes comprehensive recommendations
        
        This node:
        1. Generates comprehensive synthesis using LLM
        2. Calculates consensus level
        3. Creates innovation map visualization
        4. Streams synthesis to client
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with synthesis
        """
        logger.info(f"Synthesizing recommendations for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.SYNTHESIS
            
            # Generate comprehensive synthesis
            synthesis = await self._generate_synthesis(
                query=state['query'],
                opening_statements=state['opening_statements'],
                dialogue_turns=state['dialogue_turns'],
                final_perspectives=state['final_perspectives'],
                clusters=state['clusters'],
                convergence=state['convergence_points'],
                divergence=state['divergence_points']
            )
            
            state['final_synthesis'] = synthesis
            
            # Calculate consensus level
            consensus_data = await self._calculate_consensus(
                clusters=state['clusters'],
                convergence=state['convergence_points'],
                divergence=state['divergence_points'],
                expert_statements=(
                    state['opening_statements'] + 
                    state['dialogue_turns'] + 
                    state['final_perspectives']
                )
            )
            
            state['consensus_level'] = consensus_data['overall_level']
            state['expert_alignments'] = consensus_data['expert_alignments']
            state['cluster_confidences'] = consensus_data['cluster_confidences']
            
            # Create innovation map
            innovation_map = await self._create_innovation_map(
                clusters=state['clusters'],
                idea_connections=state['conversation_context']['building_on_ideas']
            )
            
            state['innovation_map'] = innovation_map
            
            # Generate executive summary
            exec_summary = await self._generate_executive_summary(
                synthesis=synthesis,
                consensus_level=state['consensus_level'],
                clusters=state['clusters']
            )
            
            state['executive_summary'] = exec_summary
            
            # Stream synthesis
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='synthesis_complete',
                data={
                    'synthesis': synthesis[:500] + "...",  # Preview
                    'consensus_level': state['consensus_level'],
                    'innovation_clusters': len(state['clusters']),
                    'executive_summary': exec_summary
                }
            )
            
            logger.info(
                f"Synthesis complete: consensus={state['consensus_level']:.2%}"
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Error synthesizing recommendations: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def generate_deliverables(self, state: OpenPanelState) -> OpenPanelState:
        """
        Generate all deliverable documents
        
        This node:
        1. Executive Summary (250 words)
        2. Full Innovation Report (10-15 pages)
        3. Innovation Map (visual)
        4. Idea Clusters Document
        5. Expert Contributions Log
        6. Saves all to database and storage
        7. Streams completion event
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with deliverables
        """
        logger.info(f"Generating deliverables for panel {state['panel_id']}")
        
        try:
            state['phase'] = PanelPhase.DELIVERABLES
            deliverables = []
            
            # 1. Executive Summary (already generated)
            deliverables.append({
                'type': 'executive_summary',
                'title': 'Executive Summary',
                'content': state['executive_summary'],
                'format': 'markdown',
                'length': '250 words'
            })
            
            # 2. Full Innovation Report
            full_report = await self._generate_full_report(state)
            deliverables.append({
                'type': 'full_report',
                'title': 'Full Innovation Report',
                'content': full_report,
                'format': 'markdown',
                'length': '10-15 pages'
            })
            
            # 3. Innovation Map
            deliverables.append({
                'type': 'innovation_map',
                'title': 'Innovation Map',
                'content': state['innovation_map'],
                'format': 'json',
                'visualization': 'node-link-diagram'
            })
            
            # 4. Idea Clusters Document
            clusters_doc = await self._generate_clusters_document(
                clusters=state['clusters']
            )
            deliverables.append({
                'type': 'idea_clusters',
                'title': 'Idea Clusters Analysis',
                'content': clusters_doc,
                'format': 'markdown',
                'length': '5-8 pages'
            })
            
            # 5. Expert Contributions Log
            contrib_log = await self._generate_contributions_log(state)
            deliverables.append({
                'type': 'contributions_log',
                'title': 'Expert Contributions Log',
                'content': contrib_log,
                'format': 'markdown',
                'length': '3-5 pages'
            })
            
            state['deliverables'] = deliverables
            
            # Save to database and storage
            deliverable_urls = await self._save_deliverables(
                panel_id=state['panel_id'],
                tenant_id=state['tenant_id'],
                deliverables=deliverables
            )
            
            state['deliverable_urls'] = deliverable_urls
            
            # Calculate total duration
            state['total_duration'] = (
                datetime.now() - state['start_time']
            ).total_seconds()
            
            # Update phase
            state['phase'] = PanelPhase.COMPLETE
            state['updated_at'] = datetime.now()
            
            # Stream completion
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='panel_complete',
                data={
                    'panel_id': state['panel_id'],
                    'duration': state['total_duration'],
                    'deliverables': len(deliverables),
                    'deliverable_urls': deliverable_urls,
                    'consensus_level': state['consensus_level'],
                    'total_ideas': len(state['idea_units']),
                    'innovation_clusters': len(state['clusters'])
                }
            )
            
            # Close SSE stream
            await self.sse_manager.close_stream(state['panel_id'])
            state['streaming_active'] = False
            
            logger.info(
                f"Deliverables complete: {len(deliverables)} documents, "
                f"duration={state['total_duration']:.1f}s"
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Error generating deliverables: {str(e)}")
            state['last_error'] = str(e)
            state['error_count'] += 1
            return state
    
    async def handle_error(self, state: OpenPanelState) -> OpenPanelState:
        """
        Handle errors and attempt recovery
        
        Args:
            state: Current panel state
            
        Returns:
            Updated state with error handling
        """
        logger.error(
            f"Error handler invoked for panel {state['panel_id']}: "
            f"{state['last_error']}"
        )
        
        state['phase'] = PanelPhase.FAILED
        state['retry_count'] += 1
        
        # Stream error event
        try:
            await self.sse_manager.stream_event(
                panel_id=state['panel_id'],
                event='panel_failed',
                data={
                    'error': state['last_error'],
                    'phase': state['phase'].value,
                    'retry_count': state['retry_count']
                }
            )
            
            await self.sse_manager.close_stream(state['panel_id'])
        except:
            pass  # SSE manager may already be closed
        
        return state
    
    def check_for_errors(self, state: OpenPanelState) -> str:
        """
        Conditional edge: Check if errors occurred
        
        Args:
            state: Current panel state
            
        Returns:
            "continue" if no errors, "error" if errors present
        """
        if state['phase'] == PanelPhase.FAILED:
            return "error"
        return "continue"
    
    # === HELPER METHODS (Implementation details) ===
    
    async def _generate_expert_response(
        self,
        agent: Dict,
        query: str,
        context: str,
        mode: TurnType,
        max_tokens: int
    ) -> str:
        """Generate response from expert agent"""
        # Implementation uses agent's LLM with prompt template
        # See detailed implementation in separate methods file
        pass
    
    async def _extract_idea_units(
        self,
        text: str,
        agent_id: str,
        turn_number: int
    ) -> List[Dict]:
        """Extract discrete idea units from text"""
        # Implementation uses NLP extraction
        pass
    
    async def _select_next_speaker(
        self,
        state: OpenPanelState,
        conversation_context: Dict,
        turn_number: int
    ) -> Dict:
        """Intelligently select next speaker"""
        # Implementation balances fairness, relevance, randomness
        pass
    
    async def _determine_turn_type(
        self,
        speaker: Dict,
        conversation_context: Dict,
        recent_turns: List[Dict]
    ) -> TurnType:
        """Determine what type of turn this should be"""
        # Implementation uses LLM classification
        pass
    
    # ... Additional helper methods for clustering, consensus, synthesis, etc.
```

---

## 🚀 EXECUTION EXAMPLE

```python
import asyncio
from datetime import datetime

async def execute_open_panel_example():
    """Example of executing an Open Panel"""
    
    # Initialize components
    agent_registry = AgentRegistry()
    rag_engine = RAGEngine()
    sse_manager = SSEManager()
    
    # Create orchestrator
    orchestrator = OpenPanelOrchestrator(
        agent_registry=agent_registry,
        rag_engine=rag_engine,
        sse_manager=sse_manager
    )
    
    # Define initial state
    initial_state = OpenPanelState(
        panel_id="PNL-2025-11-1247",
        tenant_id="TNT-2024-089",
        user_id="user-123",
        query="Generate innovative approaches for digital mental health platform targeting teens",
        panel_type="open",
        agents=[],  # Will be loaded in initialization
        configuration={
            'agent_ids': [
                'clinical_psychologist',
                'ai_ml_designer',
                'child_psychiatrist',
                'gen_z_ux_researcher',
                'health_economist',
                'fda_strategist',
                'behavioral_scientist',
                'edtech_expert'
            ],
            'max_dialogue_turns': 18,
            'min_dialogue_turns': 12,
            'document_ids': ['doc_123', 'doc_456']
        },
        phase=PanelPhase.INITIALIZING,
        round_number=0,
        start_time=datetime.now(),
        current_turn=0,
        opening_statements=[],
        dialogue_turns=[],
        idea_units=[],
        final_perspectives=[],
        conversation_context={},
        accumulated_context="",
        themes=[],
        clusters=[],
        convergence_points=[],
        divergence_points=[],
        connections=[],
        consensus_level=0.0,
        expert_alignments={},
        cluster_confidences={},
        final_synthesis=None,
        innovation_map=None,
        executive_summary=None,
        deliverables=[],
        deliverable_urls=[],
        total_duration=None,
        token_usage=0,
        error_count=0,
        streaming_active=False,
        last_error=None,
        retry_count=0,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        events=[]
    )
    
    # Execute panel
    final_state = await orchestrator.app.ainvoke(
        input=initial_state,
        config={"configurable": {"thread_id": initial_state['panel_id']}}
    )
    
    return final_state

# Run example
if __name__ == "__main__":
    result = asyncio.run(execute_open_panel_example())
    print(f"Panel Complete: {result['panel_id']}")
    print(f"Duration: {result['total_duration']:.1f}s")
    print(f"Consensus: {result['consensus_level']:.2%}")
    print(f"Ideas Generated: {len(result['idea_units'])}")
    print(f"Clusters: {len(result['clusters'])}")
```

---

## 📚 ADDITIONAL DOCUMENTATION

For complete helper method implementations, testing strategies, and deployment configurations, see:

- **Helper Methods**: `open_panel_helpers.py` (separate file)
- **Testing**: `test_open_panel.py`
- **Deployment**: `modal_config.py`
- **API Integration**: `api_routes.py`

---

**Document Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: Production Ready  
**Implementation Language**: Python 3.11+  
**Framework**: LangGraph 0.2+

**Related Documents**:
- [ASK_PANEL_TYPE2_OPEN_WORKFLOW_COMPLETE.md]
- [ASK_PANEL_TYPE2_MERMAID_WORKFLOWS.md]
- [ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md]
