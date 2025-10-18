"""
Mode Manager for VITAL Ask Expert Service

Manages the 4 interaction modes and provides unified interface for mode switching.
Coordinates between Interactive and Autonomous modes with seamless transitions.
"""

from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json

from langchain_openai import ChatOpenAI

from interactive_mode import InteractiveModeHandler, InteractiveSession
from orchestration.agent_selector import AutomaticAgentSelector, ManualAgentSelector
from orchestration.llm_selector import LLMSelector
from orchestration.query_classifier import QueryClassifier, ProcessingMode
from knowledge.agent_store_connector import AgentStoreConnector
from knowledge.rag_connector import MultiDomainRAGConnector


class InteractionMode(Enum):
    """Interaction modes"""
    INTERACTIVE = "interactive"
    AUTONOMOUS = "autonomous"


class AgentSelectionMode(Enum):
    """Agent selection modes"""
    AUTOMATIC = "automatic"
    MANUAL = "manual"


@dataclass
class ModeConfiguration:
    """Configuration for a specific mode combination"""
    interaction_mode: InteractionMode
    agent_mode: AgentSelectionMode
    description: str
    features: List[str]
    use_cases: List[str]


@dataclass
class SessionState:
    """Unified session state across all modes"""
    session_id: str
    user_id: str
    current_interaction_mode: InteractionMode
    current_agent_mode: AgentSelectionMode
    selected_agent: Optional[Dict[str, Any]] = None
    context: Dict[str, Any] = None
    created_at: datetime = None
    last_activity: datetime = None
    mode_history: List[Dict[str, Any]] = None
    total_cost: float = 0.0


class ModeManager:
    """Manages all 4 interaction modes and provides unified interface"""
    
    def __init__(
        self,
        agent_store: AgentStoreConnector,
        rag_connector: MultiDomainRAGConnector,
        llm: ChatOpenAI
    ):
        self.agent_store = agent_store
        self.rag_connector = rag_connector
        self.llm = llm
        
        # Initialize mode handlers
        self.interactive_handler = InteractiveModeHandler(agent_store, rag_connector, llm)
        self.automatic_selector = AutomaticAgentSelector(agent_store, rag_connector, llm)
        self.manual_selector = ManualAgentSelector(agent_store, rag_connector, llm)
        self.query_classifier = QueryClassifier(llm)
        
        # Mode configurations
        self.mode_configs = self._initialize_mode_configurations()
        
        # Active sessions
        self.active_sessions: Dict[str, SessionState] = {}
    
    def _initialize_mode_configurations(self) -> Dict[str, ModeConfiguration]:
        """Initialize mode configurations"""
        return {
            "auto_interactive": ModeConfiguration(
                interaction_mode=InteractionMode.INTERACTIVE,
                agent_mode=AgentSelectionMode.AUTOMATIC,
                description="System automatically selects the best agent for real-time Q&A",
                features=[
                    "Automatic agent selection",
                    "Real-time responses",
                    "Conversational flow",
                    "Quick answers"
                ],
                use_cases=[
                    "Quick questions",
                    "General inquiries",
                    "Clarifications",
                    "Simple explanations"
                ]
            ),
            "manual_interactive": ModeConfiguration(
                interaction_mode=InteractionMode.INTERACTIVE,
                agent_mode=AgentSelectionMode.MANUAL,
                description="User selects specific agent for real-time Q&A",
                features=[
                    "Manual agent selection",
                    "Agent browser",
                    "Real-time responses",
                    "Expert-specific guidance"
                ],
                use_cases=[
                    "Expert consultation",
                    "Domain-specific questions",
                    "Preferred agent interaction",
                    "Specialized guidance"
                ]
            ),
            "auto_autonomous": ModeConfiguration(
                interaction_mode=InteractionMode.AUTONOMOUS,
                agent_mode=AgentSelectionMode.AUTOMATIC,
                description="System automatically selects agent for autonomous execution",
                features=[
                    "Automatic agent selection",
                    "Multi-step reasoning",
                    "Tool usage",
                    "Comprehensive analysis"
                ],
                use_cases=[
                    "Complex analysis",
                    "Research tasks",
                    "Strategic planning",
                    "Multi-step problem solving"
                ]
            ),
            "manual_autonomous": ModeConfiguration(
                interaction_mode=InteractionMode.AUTONOMOUS,
                agent_mode=AgentSelectionMode.MANUAL,
                description="User selects agent for autonomous execution",
                features=[
                    "Manual agent selection",
                    "Agent browser",
                    "Multi-step reasoning",
                    "Expert-guided execution"
                ],
                use_cases=[
                    "Expert-led analysis",
                    "Specialized research",
                    "Domain-specific execution",
                    "Customized workflows"
                ]
            )
        }
    
    async def start_session(
        self,
        user_id: str,
        interaction_mode: InteractionMode,
        agent_mode: AgentSelectionMode,
        selected_agent_id: Optional[str] = None,
        context: Dict[str, Any] = None
    ) -> SessionState:
        """Start a new session with specified mode"""
        
        session_id = f"session_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Get selected agent if manual mode
        selected_agent = None
        if agent_mode == AgentSelectionMode.MANUAL and selected_agent_id:
            selected_agent = await self.agent_store.get_agent_details(selected_agent_id)
        elif agent_mode == AgentSelectionMode.AUTOMATIC:
            # Will be selected on first query
            pass
        
        session = SessionState(
            session_id=session_id,
            user_id=user_id,
            current_interaction_mode=interaction_mode,
            current_agent_mode=agent_mode,
            selected_agent=selected_agent,
            context=context or {},
            created_at=datetime.now(),
            last_activity=datetime.now(),
            mode_history=[{
                "mode": f"{interaction_mode.value}_{agent_mode.value}",
                "timestamp": datetime.now().isoformat(),
                "reason": "session_start"
            }],
            total_cost=0.0
        )
        
        self.active_sessions[session_id] = session
        
        # Initialize mode-specific session if needed
        if interaction_mode == InteractionMode.INTERACTIVE:
            await self.interactive_handler.start_session(
                user_id, agent_mode.value, selected_agent_id, context
            )
        
        return session
    
    async def process_query(
        self,
        session_id: str,
        query: str,
        stream: bool = False
    ) -> Union[Dict[str, Any], AsyncGenerator[Dict[str, Any], None]]:
        """Process a query in the current mode"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        session.last_activity = datetime.now()
        
        # Auto-select agent if needed
        if (session.current_agent_mode == AgentSelectionMode.AUTOMATIC and 
            not session.selected_agent):
            agent_selection = await self.automatic_selector.select_agent(query, session.context)
            session.selected_agent = agent_selection.selected_agent
        
        # Route to appropriate handler
        if session.current_interaction_mode == InteractionMode.INTERACTIVE:
            return await self.interactive_handler.process_query(session_id, query, stream)
        elif session.current_interaction_mode == InteractionMode.AUTONOMOUS:
            # This would route to the autonomous handler
            # For now, return a placeholder
            return {
                "type": "autonomous_placeholder",
                "message": "Autonomous mode not yet implemented",
                "session_id": session_id
            }
        else:
            raise ValueError(f"Unknown interaction mode: {session.current_interaction_mode}")
    
    async def switch_mode(
        self,
        session_id: str,
        new_interaction_mode: InteractionMode,
        new_agent_mode: AgentSelectionMode,
        selected_agent_id: Optional[str] = None,
        preserve_context: bool = True
    ) -> bool:
        """Switch session to a different mode"""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        # Check if mode change is valid
        if (session.current_interaction_mode == new_interaction_mode and 
            session.current_agent_mode == new_agent_mode):
            return True  # Already in the requested mode
        
        # Get new agent if switching to manual mode
        new_agent = None
        if new_agent_mode == AgentSelectionMode.MANUAL and selected_agent_id:
            new_agent = await self.agent_store.get_agent_details(selected_agent_id)
            if not new_agent:
                return False
        
        # Update session state
        old_mode = f"{session.current_interaction_mode.value}_{session.current_agent_mode.value}"
        new_mode = f"{new_interaction_mode.value}_{new_agent_mode.value}"
        
        session.current_interaction_mode = new_interaction_mode
        session.current_agent_mode = new_agent_mode
        session.selected_agent = new_agent
        session.last_activity = datetime.now()
        
        # Add to mode history
        session.mode_history.append({
            "mode": new_mode,
            "timestamp": datetime.now().isoformat(),
            "reason": "mode_switch",
            "previous_mode": old_mode
        })
        
        # Handle mode-specific transitions
        if new_interaction_mode == InteractionMode.INTERACTIVE:
            # Initialize interactive session if needed
            await self.interactive_handler.start_session(
                session.user_id, new_agent_mode.value, selected_agent_id, 
                session.context if preserve_context else {}
            )
        
        return True
    
    async def get_available_agents(
        self,
        session_id: str,
        filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Get available agents for manual selection"""
        
        if session_id not in self.active_sessions:
            return []
        
        session = self.active_sessions[session_id]
        
        # Use manual selector to get agents
        from ..orchestration.agent_selector import AgentSearchFilters
        
        search_filters = AgentSearchFilters(
            domains=filters.get("domains"),
            tiers=filters.get("tiers"),
            capabilities=filters.get("capabilities"),
            business_functions=filters.get("business_functions"),
            search_query=filters.get("search_query"),
            limit=filters.get("limit", 20)
        )
        
        return await self.manual_selector.search_agents(search_filters)
    
    async def get_mode_recommendation(
        self,
        query: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Get recommended mode for a query"""
        
        # Analyze query
        query_analysis = await self.query_classifier.classify_query(query, context)
        
        # Determine recommended modes
        recommended_modes = []
        
        if query_analysis.recommended_mode == ProcessingMode.INTERACTIVE:
            recommended_modes.append("auto_interactive")
            if query_analysis.complexity_score > 0.3:
                recommended_modes.append("manual_interactive")
        elif query_analysis.recommended_mode == ProcessingMode.AUTONOMOUS:
            recommended_modes.append("auto_autonomous")
            recommended_modes.append("manual_autonomous")
        else:  # HYBRID
            recommended_modes.extend([
                "auto_interactive",
                "manual_interactive", 
                "auto_autonomous",
                "manual_autonomous"
            ])
        
        return {
            "query_analysis": {
                "intent": query_analysis.intent.value,
                "complexity": query_analysis.complexity.value,
                "complexity_score": query_analysis.complexity_score,
                "recommended_mode": query_analysis.recommended_mode.value,
                "confidence": query_analysis.confidence
            },
            "recommended_modes": recommended_modes,
            "mode_configurations": {
                mode: {
                    "description": config.description,
                    "features": config.features,
                    "use_cases": config.use_cases
                }
                for mode, config in self.mode_configs.items()
                if mode in recommended_modes
            }
        }
    
    async def get_session(self, session_id: str) -> Optional[SessionState]:
        """Get session by ID"""
        return self.active_sessions.get(session_id)
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get session history including mode switches"""
        session = self.active_sessions.get(session_id)
        if not session:
            return []
        
        # Get conversation history from appropriate handler
        if session.current_interaction_mode == InteractionMode.INTERACTIVE:
            messages = await self.interactive_handler.get_session_history(session_id)
            return [{
                "type": "message",
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "agent_id": msg.agent_id,
                "agent_name": msg.agent_name
            } for msg in messages]
        else:
            # Would get autonomous history here
            return []
    
    async def end_session(self, session_id: str) -> Optional[SessionState]:
        """End a session and return final state"""
        if session_id in self.active_sessions:
            session = self.active_sessions.pop(session_id)
            
            # Clean up mode-specific sessions
            if session.current_interaction_mode == InteractionMode.INTERACTIVE:
                await self.interactive_handler.end_session(session_id)
            
            return session
        return None
    
    def get_mode_configurations(self) -> Dict[str, ModeConfiguration]:
        """Get all available mode configurations"""
        return self.mode_configs
    
    def get_active_sessions(self, user_id: str = None) -> List[SessionState]:
        """Get active sessions, optionally filtered by user"""
        if user_id:
            return [s for s in self.active_sessions.values() if s.user_id == user_id]
        return list(self.active_sessions.values())
    
    async def cleanup_old_sessions(self, max_age_hours: int = 24):
        """Clean up old inactive sessions"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        sessions_to_remove = [
            session_id for session_id, session in self.active_sessions.items()
            if session.last_activity < cutoff_time
        ]
        
        for session_id in sessions_to_remove:
            await self.end_session(session_id)
