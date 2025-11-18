"""
Test Fixtures and Mocks for VITAL Workflows

Provides reusable mocks for:
- Supabase client
- Agent orchestrator
- RAG services
- Tool registry
- Compliance services
- Conversation management
"""

from unittest.mock import Mock, AsyncMock, MagicMock
import uuid
from datetime import datetime
from typing import Dict, List, Any


class MockSupabaseClient:
    """Mock Supabase client for testing"""

    def __init__(self):
        self.tables = {}
        self._setup_tables()

    def _setup_tables(self):
        """Setup mock table responses"""
        self.tables = {
            'compliance_audit_log': [],
            'consent_records': [],
            'user_data': [],
            'agent_responses': [],
            'conversation_history': [],
            'session_memory': []
        }

    def table(self, table_name: str):
        """Mock table access"""
        mock_table = Mock()
        mock_table.insert = Mock(return_value=mock_table)
        mock_table.update = Mock(return_value=mock_table)
        mock_table.delete = Mock(return_value=mock_table)
        mock_table.select = Mock(return_value=mock_table)
        mock_table.eq = Mock(return_value=mock_table)
        mock_table.execute = Mock(return_value=Mock(
            data=[{'id': str(uuid.uuid4()), 'created_at': datetime.utcnow().isoformat()}]
        ))
        return mock_table


class MockAgentOrchestrator:
    """Mock Agent Orchestrator for testing"""

    def __init__(self):
        self.execute_agent = AsyncMock(side_effect=self._execute_agent)
        self.execution_history = []

    async def _execute_agent(
        self,
        agent_id: str,
        query: str,
        system_prompt: str = None,
        tenant_id: str = None,
        context: Dict = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Mock agent execution"""
        response = {
            'agent_id': agent_id,
            'response': f"Mock response from {agent_id} for: {query[:50]}...",
            'confidence': 0.85,
            'sources': [
                {'title': 'Medical Source 1', 'url': 'https://example.com/1'},
                {'title': 'Medical Source 2', 'url': 'https://example.com/2'}
            ],
            'execution_time': 1.234,
            'tokens_used': 500
        }

        self.execution_history.append({
            'agent_id': agent_id,
            'query': query,
            'timestamp': datetime.utcnow().isoformat()
        })

        return response


class MockUnifiedRAGService:
    """Mock Unified RAG Service for testing"""

    def __init__(self):
        self.retrieve = AsyncMock(side_effect=self._retrieve)
        self.retrieval_history = []

    async def _retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 5,
        filters: Dict = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Mock RAG retrieval"""
        documents = [
            {
                'content': f"Relevant medical document {i+1} for query: {query[:30]}",
                'metadata': {
                    'source': f'Medical Database {i+1}',
                    'confidence': 0.9 - (i * 0.1),
                    'relevance_score': 0.95 - (i * 0.05)
                }
            }
            for i in range(min(top_k, 3))
        ]

        self.retrieval_history.append({
            'query': query,
            'tenant_id': tenant_id,
            'timestamp': datetime.utcnow().isoformat()
        })

        return {
            'documents': documents,
            'context': '\n\n'.join([doc['content'] for doc in documents]),
            'total_retrieved': len(documents)
        }


class MockToolRegistry:
    """Mock Tool Registry for testing"""

    def __init__(self):
        self.tools = {
            'medical_calculator': MockTool('medical_calculator', 'Medical calculations'),
            'drug_interaction_checker': MockTool('drug_interaction_checker', 'Drug interactions'),
            'symptom_checker': MockTool('symptom_checker', 'Symptom analysis'),
            'lab_interpreter': MockTool('lab_interpreter', 'Lab result interpretation'),
            'dosage_calculator': MockTool('dosage_calculator', 'Medication dosage')
        }

        self.analyze_query_for_tools = AsyncMock(side_effect=self._analyze_query)
        self.get_tool = Mock(side_effect=self._get_tool)
        self.execute_tool = AsyncMock(side_effect=self._execute_tool)

    async def _analyze_query(self, query: str, context: Dict = None) -> Dict[str, Any]:
        """Mock tool analysis"""
        # Simple keyword-based tool recommendation
        recommended_tools = []
        priorities = []

        if any(word in query.lower() for word in ['calculate', 'bmi', 'dose', 'dosage']):
            recommended_tools.append('medical_calculator')
            priorities.append(0.9)

        if any(word in query.lower() for word in ['drug', 'medication', 'interaction']):
            recommended_tools.append('drug_interaction_checker')
            priorities.append(0.85)

        if any(word in query.lower() for word in ['symptom', 'feel', 'pain']):
            recommended_tools.append('symptom_checker')
            priorities.append(0.8)

        return {
            'recommended_tools': recommended_tools[:3],
            'tool_priorities': priorities[:3],
            'analysis': f'Analyzed query for tools: {query[:50]}'
        }

    def _get_tool(self, tool_name: str):
        """Get mock tool"""
        return self.tools.get(tool_name)

    async def _execute_tool(
        self,
        tool_name: str,
        input_data: Dict,
        context: Dict = None
    ) -> Dict[str, Any]:
        """Execute mock tool"""
        tool = self.tools.get(tool_name)
        if tool:
            return await tool.execute(input_data, context)
        return {'error': f'Tool {tool_name} not found'}


class MockTool:
    """Mock individual tool"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.execute = AsyncMock(side_effect=self._execute)

    async def _execute(self, input_data: Dict, context: Dict = None) -> Dict[str, Any]:
        """Mock tool execution"""
        return {
            'tool': self.name,
            'result': f"Mock result from {self.name}",
            'data': input_data,
            'success': True,
            'execution_time': 0.5
        }


class MockSubAgentSpawner:
    """Mock Sub-Agent Spawner for testing"""

    def __init__(self):
        self.spawn_specialist = AsyncMock(side_effect=self._spawn_specialist)
        self.execute_sub_agent = AsyncMock(side_effect=self._execute_sub_agent)
        self.cleanup_sub_agent = AsyncMock(side_effect=self._cleanup)
        self.spawned_agents = {}

    async def _spawn_specialist(
        self,
        parent_agent_id: str,
        task: str,
        specialty: str,
        context: Dict = None
    ) -> str:
        """Mock sub-agent spawning"""
        sub_agent_id = f"sub-agent-{uuid.uuid4().hex[:8]}"

        self.spawned_agents[sub_agent_id] = {
            'parent': parent_agent_id,
            'task': task,
            'specialty': specialty,
            'status': 'spawned',
            'spawned_at': datetime.utcnow().isoformat()
        }

        return sub_agent_id

    async def _execute_sub_agent(self, sub_agent_id: str) -> Dict[str, Any]:
        """Mock sub-agent execution"""
        if sub_agent_id in self.spawned_agents:
            self.spawned_agents[sub_agent_id]['status'] = 'completed'

            return {
                'sub_agent_id': sub_agent_id,
                'response': f"Detailed specialist analysis from {sub_agent_id}",
                'confidence': 0.88,
                'analysis_depth': 'deep',
                'execution_time': 2.5
            }
        return {'error': 'Sub-agent not found'}

    async def _cleanup(self, sub_agent_id: str) -> bool:
        """Mock cleanup"""
        if sub_agent_id in self.spawned_agents:
            del self.spawned_agents[sub_agent_id]
            return True
        return False


class MockConsensusCalculator:
    """Mock Consensus Calculator for testing"""

    def __init__(self):
        self.calculate_consensus = AsyncMock(side_effect=self._calculate)

    async def _calculate(
        self,
        responses: List[Dict],
        weights: List[float] = None
    ) -> Dict[str, Any]:
        """Mock consensus calculation"""
        # Simulate consensus building
        num_responses = len(responses)

        if num_responses == 0:
            return {
                'synthesis': '',
                'agreement_score': 0.0,
                'conflicts': [],
                'confidence': 0.0
            }

        # Mock agreement score based on number of responses
        agreement_score = 0.9 if num_responses <= 2 else 0.75

        # Mock conflicts
        conflicts = []
        if num_responses > 3 or agreement_score < 0.8:
            conflicts = ['Minor disagreement on approach']

        synthesis = f"Synthesized consensus from {num_responses} expert responses. " + \
                   "All experts agree on the fundamental approach with minor variations in details."

        return {
            'synthesis': synthesis,
            'agreement_score': agreement_score,
            'conflicts': conflicts,
            'confidence': 0.85,
            'expert_count': num_responses,
            'individual_confidences': [r.get('confidence', 0.8) for r in responses]
        }


class MockConfidenceCalculator:
    """Mock Confidence Calculator for testing"""

    def __init__(self):
        self.calculate_confidence = AsyncMock(side_effect=self._calculate)

    async def _calculate(
        self,
        response: str,
        sources: List[Dict] = None,
        context: Dict = None
    ) -> float:
        """Mock confidence calculation"""
        # Simple heuristic based on response length and sources
        base_confidence = 0.7

        if len(response) > 100:
            base_confidence += 0.1

        if sources and len(sources) > 0:
            base_confidence += 0.1

        return min(base_confidence, 0.95)


class MockAgentSelector:
    """Mock Agent Selector for testing"""

    def __init__(self):
        self.select_agents = AsyncMock(side_effect=self._select)

    async def _select(
        self,
        query: str,
        tenant_id: str,
        max_agents: int = 3,
        context: Dict = None
    ) -> List[Dict[str, Any]]:
        """Mock agent selection"""
        # Return mock selected agents
        selected = [
            {
                'agent_id': f'agent-cardiology-{uuid.uuid4().hex[:6]}',
                'specialty': 'Cardiology',
                'confidence': 0.92,
                'selection_reason': 'Expert in cardiovascular conditions'
            },
            {
                'agent_id': f'agent-internal-medicine-{uuid.uuid4().hex[:6]}',
                'specialty': 'Internal Medicine',
                'confidence': 0.88,
                'selection_reason': 'General medical expertise'
            },
            {
                'agent_id': f'agent-pharmacology-{uuid.uuid4().hex[:6]}',
                'specialty': 'Pharmacology',
                'confidence': 0.85,
                'selection_reason': 'Medication specialist'
            }
        ]

        return selected[:max_agents]


class MockPanelOrchestrator:
    """Mock Panel Orchestrator for testing"""

    def __init__(self):
        self.execute_panel = AsyncMock(side_effect=self._execute)

    async def _execute(
        self,
        agents: List[str],
        query: str,
        context: Dict = None
    ) -> Dict[str, Any]:
        """Mock panel execution"""
        panel_responses = [
            {
                'agent_id': agent_id,
                'response': f"Expert analysis from {agent_id}: {query[:30]}...",
                'confidence': 0.85 + (i * 0.02),
                'execution_time': 1.2 + (i * 0.3)
            }
            for i, agent_id in enumerate(agents)
        ]

        return {
            'panel_responses': panel_responses,
            'total_agents': len(agents),
            'total_execution_time': sum(r['execution_time'] for r in panel_responses)
        }


class MockConversationManager:
    """Mock Enhanced Conversation Manager for testing"""

    def __init__(self):
        self.conversations = {}
        self.get_conversation_history = AsyncMock(side_effect=self._get_history)
        self.add_turn = AsyncMock(side_effect=self._add_turn)
        self.clear_conversation = AsyncMock(side_effect=self._clear)

    async def _get_history(self, session_id: str) -> List[Dict]:
        """Get mock conversation history"""
        return self.conversations.get(session_id, [])

    async def _add_turn(
        self,
        session_id: str,
        user_message: str,
        assistant_message: str
    ) -> bool:
        """Add conversation turn"""
        if session_id not in self.conversations:
            self.conversations[session_id] = []

        self.conversations[session_id].extend([
            {'role': 'user', 'content': user_message, 'timestamp': datetime.utcnow().isoformat()},
            {'role': 'assistant', 'content': assistant_message, 'timestamp': datetime.utcnow().isoformat()}
        ])

        return True

    async def _clear(self, session_id: str) -> bool:
        """Clear conversation"""
        if session_id in self.conversations:
            del self.conversations[session_id]
            return True
        return False


class MockSessionMemory:
    """Mock Session Memory Service for testing"""

    def __init__(self):
        self.sessions = {}
        self.get_session = AsyncMock(side_effect=self._get)
        self.update_session = AsyncMock(side_effect=self._update)

    async def _get(self, session_id: str) -> Dict:
        """Get session data"""
        return self.sessions.get(session_id, {
            'context': '',
            'user_preferences': {},
            'session_data': {}
        })

    async def _update(self, session_id: str, data: Dict) -> bool:
        """Update session data"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {}

        self.sessions[session_id].update(data)
        return True


class MockComplianceService:
    """Mock Compliance Service for testing"""

    def __init__(self):
        self.protect_data = AsyncMock(side_effect=self._protect)
        self.right_to_erasure = AsyncMock(side_effect=self._erasure)
        self.manage_consent = AsyncMock(side_effect=self._consent)
        self.audit_logs = []

    async def _protect(
        self,
        data: str,
        regime: str,
        tenant_id: str,
        user_id: str,
        purpose: str
    ) -> tuple:
        """Mock data protection"""
        # Simple PHI redaction
        protected = data
        phi_patterns = {
            'John Smith': '[NAME]',
            'Jane Doe': '[NAME]',
            '123-45-6789': '[SSN]',
            '555-123-4567': '[PHONE]'
        }

        for phi, replacement in phi_patterns.items():
            protected = protected.replace(phi, replacement)

        audit_id = f"audit-{uuid.uuid4().hex[:12]}"

        self.audit_logs.append({
            'audit_id': audit_id,
            'regime': regime,
            'tenant_id': tenant_id,
            'user_id': user_id,
            'purpose': purpose,
            'timestamp': datetime.utcnow().isoformat()
        })

        return (protected, audit_id)

    async def _erasure(self, user_id: str, tenant_id: str) -> Dict:
        """Mock right to erasure"""
        return {
            'user_id': user_id,
            'tenant_id': tenant_id,
            'status': 'erased',
            'timestamp': datetime.utcnow().isoformat()
        }

    async def _consent(
        self,
        user_id: str,
        tenant_id: str,
        consent_type: str,
        granted: bool
    ) -> Dict:
        """Mock consent management"""
        return {
            'user_id': user_id,
            'tenant_id': tenant_id,
            'consent_type': consent_type,
            'granted': granted,
            'timestamp': datetime.utcnow().isoformat()
        }


class MockHumanInLoopValidator:
    """Mock Human-in-Loop Validator for testing"""

    def __init__(self):
        self.requires_human_review = AsyncMock(side_effect=self._validate)

    async def _validate(
        self,
        query: str,
        response: str,
        confidence: float,
        domain: str = None,
        context: Dict = None
    ) -> Dict[str, Any]:
        """Mock human review validation"""
        # Simple rule-based validation
        requires_review = False
        risk_level = 'low'
        reasons = []

        # Low confidence trigger
        if confidence < 0.65:
            requires_review = True
            risk_level = 'medium'
            reasons.append('Low confidence score')

        # Critical keywords
        critical_keywords = [
            'stop medication', 'surgery', 'emergency', 'severe', 'critical',
            'chest pain', 'heart attack', 'discontinue', 'diagnosis'
        ]

        if any(keyword in query.lower() or keyword in response.lower() for keyword in critical_keywords):
            requires_review = True
            risk_level = 'high'
            reasons.append('Critical medical decision detected')

        # Domain-based rules
        high_risk_domains = ['diagnosis', 'surgery', 'emergency', 'medication_recommendation']
        if domain in high_risk_domains:
            requires_review = True
            risk_level = 'high'
            reasons.append(f'High-risk domain: {domain}')

        return {
            'requires_human_review': requires_review,
            'risk_level': risk_level,
            'reasons': reasons if reasons else ['Safe automated response'],
            'recommendation': 'Consult healthcare professional' if requires_review else 'Safe to proceed',
            'confidence_threshold': 0.65,
            'actual_confidence': confidence
        }


def create_mock_services() -> Dict[str, Any]:
    """
    Factory function to create all mock services at once

    Returns:
        Dict containing all mocked services
    """
    return {
        'supabase_client': MockSupabaseClient(),
        'agent_orchestrator': MockAgentOrchestrator(),
        'unified_rag': MockUnifiedRAGService(),
        'tool_registry': MockToolRegistry(),
        'sub_agent_spawner': MockSubAgentSpawner(),
        'consensus_calculator': MockConsensusCalculator(),
        'confidence_calculator': MockConfidenceCalculator(),
        'agent_selector': MockAgentSelector(),
        'panel_orchestrator': MockPanelOrchestrator(),
        'conversation_manager': MockConversationManager(),
        'session_memory': MockSessionMemory(),
        'compliance_service': MockComplianceService(),
        'human_validator': MockHumanInLoopValidator()
    }
