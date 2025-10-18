"""
Interactive Mode Handler for VITAL Ask Expert Service

Handles real-time Q&A interactions without autonomous reasoning.
Supports both automatic and manual agent selection modes.
"""

from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
import json

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from ..orchestration.agent_selector import AutomaticAgentSelector, ManualAgentSelector
from ..orchestration.llm_selector import LLMSelector, TaskType
from ..orchestration.query_classifier import QueryClassifier
from ..orchestration.context_loader import ContextLoader
from ..orchestration.prompt_builder import PromptBuilder
from ..knowledge.agent_store_connector import AgentStoreConnector
from ..knowledge.rag_connector import MultiDomainRAGConnector


@dataclass
class InteractiveMessage:
    """Individual message in interactive conversation"""
    id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    confidence: Optional[float] = None
    sources: List[Dict[str, Any]] = None
    cost: float = 0.0


@dataclass
class InteractiveSession:
    """Interactive conversation session"""
    session_id: str
    user_id: str
    agent_mode: str  # "automatic" or "manual"
    selected_agent: Optional[Dict[str, Any]] = None
    messages: List[InteractiveMessage] = None
    context: Dict[str, Any] = None
    created_at: datetime = None
    last_activity: datetime = None
    total_cost: float = 0.0


class InteractiveModeHandler:
    """Handles interactive Q&A mode for both automatic and manual agent selection"""
    
    def __init__(
        self,
        agent_store: AgentStoreConnector,
        rag_connector: MultiDomainRAGConnector,
        llm: ChatOpenAI
    ):
        self.agent_store = agent_store
        self.rag_connector = rag_connector
        self.llm = llm
        
        # Initialize orchestration components
        self.automatic_selector = AutomaticAgentSelector(agent_store, rag_connector, llm)
        self.manual_selector = ManualAgentSelector(agent_store, rag_connector, llm)
        self.llm_selector = LLMSelector()
        self.query_classifier = QueryClassifier(llm)
        self.context_loader = ContextLoader(rag_connector, llm)
        self.prompt_builder = PromptBuilder(llm)
        
        # Active sessions
        self.active_sessions: Dict[str, InteractiveSession] = {}
    
    async def start_session(
        self,
        user_id: str,
        agent_mode: str,
        selected_agent_id: Optional[str] = None,
        context: Dict[str, Any] = None
    ) -> InteractiveSession:
        """Start a new interactive session"""
        
        session_id = f"interactive_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Get selected agent
        selected_agent = None
        if agent_mode == "manual" and selected_agent_id:
            selected_agent = await self.agent_store.get_agent_details(selected_agent_id)
        elif agent_mode == "automatic":
            # Will be selected on first query
            pass
        
        session = InteractiveSession(
            session_id=session_id,
            user_id=user_id,
            agent_mode=agent_mode,
            selected_agent=selected_agent,
            messages=[],
            context=context or {},
            created_at=datetime.now(),
            last_activity=datetime.now()
        )
        
        self.active_sessions[session_id] = session
        return session
    
    async def process_query(
        self,
        session_id: str,
        query: str,
        stream: bool = False
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process a query in interactive mode"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        session.last_activity = datetime.now()
        
        # Add user message
        user_message = InteractiveMessage(
            id=f"msg_{datetime.now().strftime('%Y%M%d_%H%M%S_%f')}",
            role="user",
            content=query,
            timestamp=datetime.now()
        )
        session.messages.append(user_message)
        
        try:
            # Auto-select agent if needed
            if session.agent_mode == "automatic" and not session.selected_agent:
                agent_selection = await self.automatic_selector.select_agent(query, session.context)
                session.selected_agent = agent_selection.selected_agent
            
            # Classify query
            query_analysis = await self.query_classifier.classify_query(query, session.context)
            
            # Load context if needed
            context_result = None
            if query_analysis.requires_tools or query_analysis.complexity_score > 0.5:
                context_result = await self.context_loader.load_context(
                    query, session.context, max_domains=3, token_budget=4000
                )
            
            # Select optimal LLM
            llm, llm_selection = await self.llm_selector.get_llm(
                query=query,
                task_type=TaskType.CHAT,
                complexity_score=query_analysis.complexity_score,
                budget=5.0
            )
            
            # Build prompt
            prompt_result = await self.prompt_builder.build_agent_prompt(
                agent_info=session.selected_agent,
                query=query,
                context=context_result.format_context_for_prompt(context_result) if context_result else "",
                mode="interactive",
                available_tools=[]  # No tools in interactive mode
            )
            
            # Generate response
            if stream:
                async for chunk in self._generate_streaming_response(
                    llm, prompt_result, query, session
                ):
                    yield chunk
            else:
                response = await self._generate_response(llm, prompt_result, query, session)
                yield response
        
        except Exception as e:
            # Handle errors gracefully
            error_response = {
                "type": "error",
                "content": f"I apologize, but I encountered an error processing your query: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "agent_id": session.selected_agent.get("id") if session.selected_agent else None,
                "agent_name": session.selected_agent.get("name") if session.selected_agent else None
            }
            yield error_response
    
    async def _generate_response(
        self,
        llm: ChatOpenAI,
        prompt_result,
        query: str,
        session: InteractiveSession
    ) -> Dict[str, Any]:
        """Generate a single response"""
        
        # Build messages
        messages = [
            SystemMessage(content=prompt_result.system_prompt),
            HumanMessage(content=prompt_result.user_prompt)
        ]
        
        # Add conversation history
        for msg in session.messages[-6:]:  # Last 6 messages for context
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))
        
        # Generate response
        response = await llm.ainvoke(messages)
        
        # Create assistant message
        assistant_message = InteractiveMessage(
            id=f"msg_{datetime.now().strftime('%Y%M%d_%H%M%S_%f')}",
            role="assistant",
            content=response.content,
            timestamp=datetime.now(),
            agent_id=session.selected_agent.get("id") if session.selected_agent else None,
            agent_name=session.selected_agent.get("name") if session.selected_agent else None,
            confidence=0.8,  # Default confidence
            cost=0.01  # Estimated cost
        )
        
        session.messages.append(assistant_message)
        session.total_cost += assistant_message.cost
        
        return {
            "type": "response",
            "content": response.content,
            "timestamp": assistant_message.timestamp.isoformat(),
            "agent_id": assistant_message.agent_id,
            "agent_name": assistant_message.agent_name,
            "confidence": assistant_message.confidence,
            "cost": assistant_message.cost,
            "session_id": session.session_id
        }
    
    async def _generate_streaming_response(
        self,
        llm: ChatOpenAI,
        prompt_result,
        query: str,
        session: InteractiveSession
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate a streaming response"""
        
        # Build messages
        messages = [
            SystemMessage(content=prompt_result.system_prompt),
            HumanMessage(content=prompt_result.user_prompt)
        ]
        
        # Add conversation history
        for msg in session.messages[-6:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))
        
        # Stream response
        full_content = ""
        async for chunk in llm.astream(messages):
            if hasattr(chunk, 'content') and chunk.content:
                full_content += chunk.content
                yield {
                    "type": "chunk",
                    "content": chunk.content,
                    "timestamp": datetime.now().isoformat(),
                    "agent_id": session.selected_agent.get("id") if session.selected_agent else None,
                    "agent_name": session.selected_agent.get("name") if session.selected_agent else None
                }
        
        # Create final assistant message
        assistant_message = InteractiveMessage(
            id=f"msg_{datetime.now().strftime('%Y%M%d_%H%M%S_%f')}",
            role="assistant",
            content=full_content,
            timestamp=datetime.now(),
            agent_id=session.selected_agent.get("id") if session.selected_agent else None,
            agent_name=session.selected_agent.get("name") if session.selected_agent else None,
            confidence=0.8,
            cost=0.01
        )
        
        session.messages.append(assistant_message)
        session.total_cost += assistant_message.cost
        
        # Send completion signal
        yield {
            "type": "complete",
            "content": full_content,
            "timestamp": assistant_message.timestamp.isoformat(),
            "agent_id": assistant_message.agent_id,
            "agent_name": assistant_message.agent_name,
            "confidence": assistant_message.confidence,
            "cost": assistant_message.cost,
            "session_id": session.session_id
        }
    
    async def get_session(self, session_id: str) -> Optional[InteractiveSession]:
        """Get session by ID"""
        return self.active_sessions.get(session_id)
    
    async def get_session_history(self, session_id: str) -> List[InteractiveMessage]:
        """Get conversation history for a session"""
        session = self.active_sessions.get(session_id)
        return session.messages if session else []
    
    async def update_session_context(
        self,
        session_id: str,
        context: Dict[str, Any]
    ) -> bool:
        """Update session context"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id].context.update(context)
            return True
        return False
    
    async def switch_agent(
        self,
        session_id: str,
        agent_id: str
    ) -> bool:
        """Switch to a different agent in the session"""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        if session.agent_mode != "manual":
            return False
        
        # Get new agent details
        new_agent = await self.agent_store.get_agent_details(agent_id)
        if not new_agent:
            return False
        
        session.selected_agent = new_agent
        session.last_activity = datetime.now()
        
        return True
    
    async def end_session(self, session_id: str) -> Optional[InteractiveSession]:
        """End a session and return final session data"""
        if session_id in self.active_sessions:
            session = self.active_sessions.pop(session_id)
            return session
        return None
    
    def get_active_sessions(self, user_id: str = None) -> List[InteractiveSession]:
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
            self.active_sessions.pop(session_id, None)
