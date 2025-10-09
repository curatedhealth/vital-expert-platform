# VITAL Platform: Token Tracking & Cost Control System
## LangChain + LangSmith + LangGraph Architecture

**Document Version:** 2.0  
**Last Updated:** October 4, 2025  
**Status:** Production-Ready for LangChain/LangGraph Implementation

---

## 1. System Architecture Overview

### 1.1 VITAL Platform Services

Your platform has 4 distinct service types, each requiring different tracking approaches:

```typescript
enum ServiceType {
  ONE_TO_ONE = '1:1_conversation',      // Direct agent interaction
  VIRTUAL_PANEL = 'virtual_panel',       // Multiple agents as advisory board
  WORKFLOW = 'workflow',                 // Orchestrated multi-agent workflows
  SOLUTION_BUILDER = 'solution_builder'  // Multi-workflow compositions
}

// Enhanced tracking schema
interface TokenUsageLog {
  id: string;
  timestamp: Date;
  
  // Service Context
  service_type: ServiceType;
  service_id: string;  // Unique ID for this service instance
  
  // Agent Context
  agent_id: string;
  agent_name: string;
  agent_tier: 1 | 2 | 3;
  agent_role?: string;  // e.g., "panel_member", "workflow_step_1"
  
  // Workflow Context (for workflow & solution_builder)
  workflow_id?: string;
  workflow_name?: string;
  workflow_step?: number;
  workflow_step_name?: string;
  parent_workflow_id?: string;  // For solution_builder nesting
  
  // Panel Context (for virtual_panel)
  panel_id?: string;
  panel_name?: string;
  panel_member_position?: number;
  total_panel_members?: number;
  
  // User Context
  user_id: string;
  session_id: string;
  organization_id?: string;
  
  // LangSmith Integration
  langsmith_run_id?: string;
  langsmith_trace_id?: string;
  langsmith_parent_run_id?: string;
  
  // LLM Provider
  provider: 'anthropic' | 'openai' | 'azure_openai' | 'huggingface';
  model_name: string;
  model_version: string;
  
  // Token Metrics
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  
  // Cost Metrics (USD)
  input_cost: number;
  output_cost: number;
  total_cost: number;
  
  // Performance
  latency_ms: number;
  cache_hit: boolean;
  
  // Request Metadata
  request_type: 'completion' | 'embedding' | 'tool_call';
  success: boolean;
  error_code?: string;
}
```

---

## 2. LangChain + LangSmith Integration

### 2.1 Enhanced Callback Handler with LangSmith

```python
# vital_langchain_tracker.py
from langchain.callbacks.base import BaseCallbackHandler
from langchain_core.tracers import LangChainTracer
from typing import Any, Dict, List, Optional, Union
from supabase import create_client, Client
from datetime import datetime
import uuid
import os

class VITALLangChainTracker(BaseCallbackHandler):
    """
    Production-ready tracker for VITAL platform
    Integrates with LangChain, LangSmith, and LangGraph
    Tracks all 4 service types with proper context
    """
    
    # Pricing (Oct 2025)
    PRICING = {
        'anthropic': {
            'claude-sonnet-4-20250514': {'input': 0.003, 'output': 0.015},
            'claude-haiku-4-20250514': {'input': 0.001, 'output': 0.005},
        },
        'openai': {
            'gpt-4o': {'input': 0.0025, 'output': 0.01},
            'gpt-4o-mini': {'input': 0.00015, 'output': 0.0006},
        }
    }
    
    def __init__(
        self,
        # Service context
        service_type: str,  # '1:1_conversation', 'virtual_panel', 'workflow', 'solution_builder'
        service_id: str,
        
        # Agent context
        agent_id: str,
        agent_name: str,
        agent_tier: int,
        agent_role: Optional[str] = None,
        
        # Workflow context (optional)
        workflow_id: Optional[str] = None,
        workflow_name: Optional[str] = None,
        workflow_step: Optional[int] = None,
        workflow_step_name: Optional[str] = None,
        parent_workflow_id: Optional[str] = None,
        
        # Panel context (optional)
        panel_id: Optional[str] = None,
        panel_name: Optional[str] = None,
        panel_member_position: Optional[int] = None,
        total_panel_members: Optional[int] = None,
        
        # User context
        user_id: str,
        session_id: str,
        organization_id: Optional[str] = None,
        
        # Configuration
        supabase_client: Optional[Client] = None,
        budget_limits: Optional[Dict] = None,
        enable_langsmith: bool = True,
        debug: bool = False
    ):
        self.service_type = service_type
        self.service_id = service_id
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.agent_tier = agent_tier
        self.agent_role = agent_role
        
        # Workflow context
        self.workflow_id = workflow_id
        self.workflow_name = workflow_name
        self.workflow_step = workflow_step
        self.workflow_step_name = workflow_step_name
        self.parent_workflow_id = parent_workflow_id
        
        # Panel context
        self.panel_id = panel_id
        self.panel_name = panel_name
        self.panel_member_position = panel_member_position
        self.total_panel_members = total_panel_members
        
        # User context
        self.user_id = user_id
        self.session_id = session_id
        self.organization_id = organization_id
        
        self.budget_limits = budget_limits or {}
        self.debug = debug
        
        # Initialize Supabase
        if supabase_client:
            self.supabase = supabase_client
        else:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
            self.supabase = create_client(url, key)
        
        # LangSmith integration
        self.enable_langsmith = enable_langsmith
        self.langsmith_run_id = None
        self.langsmith_trace_id = None
        
        # Current request
        self.current_request = {
            'start_time': None,
            'provider': None,
            'model': None,
            'prompt_tokens': 0
        }
    
    def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        **kwargs: Any
    ) -> None:
        """Called when LLM starts"""
        self.current_request['start_time'] = datetime.now()
        
        # Extract LangSmith trace IDs if available
        run_id = kwargs.get('run_id')
        if run_id:
            self.langsmith_run_id = str(run_id)
            
        parent_run_id = kwargs.get('parent_run_id')
        if parent_run_id:
            self.langsmith_trace_id = str(parent_run_id)
        
        # Extract provider and model
        invocation_params = kwargs.get('invocation_params', {})
        
        # Detect provider
        model_id = serialized.get('id', [])
        if 'anthropic' in str(model_id).lower():
            self.current_request['provider'] = 'anthropic'
        elif 'openai' in str(model_id).lower():
            if 'azure' in str(model_id).lower():
                self.current_request['provider'] = 'azure_openai'
            else:
                self.current_request['provider'] = 'openai'
        else:
            self.current_request['provider'] = 'unknown'
        
        self.current_request['model'] = (
            invocation_params.get('model') or
            invocation_params.get('model_name') or
            'unknown'
        )
        
        # Estimate prompt tokens
        self.current_request['prompt_tokens'] = sum(
            len(p.split()) * 1.3 for p in prompts
        )
        
        if self.debug:
            print(f"[VITAL] {self.service_type} - {self.agent_name} starting...")
    
    def on_llm_end(
        self,
        response: Any,
        **kwargs: Any
    ) -> None:
        """Called when LLM finishes"""
        end_time = datetime.now()
        latency_ms = int(
            (end_time - self.current_request['start_time']).total_seconds() * 1000
        )
        
        # Extract token counts
        if hasattr(response, 'llm_output') and response.llm_output:
            token_usage = response.llm_output.get('token_usage', {})
            prompt_tokens = token_usage.get('prompt_tokens', self.current_request['prompt_tokens'])
            completion_tokens = token_usage.get('completion_tokens', 0)
        else:
            prompt_tokens = int(self.current_request['prompt_tokens'])
            completion_tokens = int(len(str(response).split()) * 1.3)
        
        # Calculate cost
        input_cost, output_cost = self._calculate_cost(
            self.current_request['provider'],
            self.current_request['model'],
            prompt_tokens,
            completion_tokens
        )
        
        total_cost = input_cost + output_cost
        
        # Budget check
        self._check_budget(total_cost)
        
        # Log to Supabase
        self._log_usage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            input_cost=input_cost,
            output_cost=output_cost,
            latency_ms=latency_ms,
            success=True
        )
        
        if self.debug:
            context = f"{self.service_type}"
            if self.workflow_step:
                context += f" (Step {self.workflow_step})"
            if self.panel_member_position:
                context += f" (Panel #{self.panel_member_position}/{self.total_panel_members})"
            print(f"[VITAL] {context}: {prompt_tokens + completion_tokens} tokens, ${total_cost:.6f}")
    
    def on_llm_error(
        self,
        error: Exception,
        **kwargs: Any
    ) -> None:
        """Called on LLM error"""
        self._log_usage(
            prompt_tokens=int(self.current_request['prompt_tokens']),
            completion_tokens=0,
            input_cost=0,
            output_cost=0,
            latency_ms=0,
            success=False,
            error_code=type(error).__name__,
            error_message=str(error)
        )
    
    def _calculate_cost(
        self,
        provider: str,
        model: str,
        prompt_tokens: int,
        completion_tokens: int
    ) -> tuple[float, float]:
        """Calculate costs"""
        if provider in self.PRICING and model in self.PRICING[provider]:
            pricing = self.PRICING[provider][model]
        else:
            pricing = {'input': 0.01, 'output': 0.03}  # Conservative default
        
        input_cost = (prompt_tokens / 1000) * pricing['input']
        output_cost = (completion_tokens / 1000) * pricing['output']
        
        return (input_cost, output_cost)
    
    def _check_budget(self, cost: float) -> None:
        """Check budget limits"""
        try:
            spending = self._get_current_spending()
            
            if 'session' in self.budget_limits:
                if spending['session'] + cost > self.budget_limits['session']:
                    raise BudgetExceededError(
                        f"Session budget exceeded: ${spending['session'] + cost:.4f}"
                    )
            
            if 'daily' in self.budget_limits:
                if spending['daily'] + cost > self.budget_limits['daily']:
                    raise BudgetExceededError(
                        f"Daily budget exceeded: ${spending['daily'] + cost:.4f}"
                    )
                    
        except BudgetExceededError:
            raise
        except Exception as e:
            if self.debug:
                print(f"[VITAL] Budget check failed: {e}")
    
    def _get_current_spending(self) -> Dict[str, float]:
        """Get current spending"""
        try:
            # Session
            session_result = self.supabase.table('token_usage_logs')\
                .select('total_cost')\
                .eq('session_id', self.session_id)\
                .execute()
            
            session_total = sum(
                row['total_cost'] for row in session_result.data
            ) if session_result.data else 0
            
            # Daily
            daily_result = self.supabase.table('token_usage_logs')\
                .select('total_cost')\
                .eq('user_id', self.user_id)\
                .gte('created_at', datetime.now().date().isoformat())\
                .execute()
            
            daily_total = sum(
                row['total_cost'] for row in daily_result.data
            ) if daily_result.data else 0
            
            return {'session': session_total, 'daily': daily_total}
        except:
            return {'session': 0, 'daily': 0}
    
    def _log_usage(
        self,
        prompt_tokens: int,
        completion_tokens: int,
        input_cost: float,
        output_cost: float,
        latency_ms: int,
        success: bool,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> None:
        """Log to Supabase"""
        try:
            log_data = {
                'id': str(uuid.uuid4()),
                'created_at': datetime.now().isoformat(),
                
                # Service context
                'service_type': self.service_type,
                'service_id': self.service_id,
                
                # Agent context
                'agent_id': self.agent_id,
                'agent_name': self.agent_name,
                'agent_tier': self.agent_tier,
                'agent_role': self.agent_role,
                
                # Workflow context
                'workflow_id': self.workflow_id,
                'workflow_name': self.workflow_name,
                'workflow_step': self.workflow_step,
                'workflow_step_name': self.workflow_step_name,
                'parent_workflow_id': self.parent_workflow_id,
                
                # Panel context
                'panel_id': self.panel_id,
                'panel_name': self.panel_name,
                'panel_member_position': self.panel_member_position,
                'total_panel_members': self.total_panel_members,
                
                # User context
                'user_id': self.user_id,
                'session_id': self.session_id,
                'organization_id': self.organization_id,
                
                # LangSmith
                'langsmith_run_id': self.langsmith_run_id,
                'langsmith_trace_id': self.langsmith_trace_id,
                
                # Provider
                'provider': self.current_request['provider'],
                'model_name': self.current_request['model'],
                
                # Metrics
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'input_cost': float(input_cost),
                'output_cost': float(output_cost),
                'latency_ms': latency_ms,
                'success': success,
                'error_code': error_code,
                'error_message': error_message
            }
            
            self.supabase.table('token_usage_logs').insert(log_data).execute()
            
        except Exception as e:
            if self.debug:
                print(f"[VITAL] Failed to log: {e}")


class BudgetExceededError(Exception):
    """Budget limit exceeded"""
    pass
```

---

## 3. Service-Specific Implementations

### 3.1 Service 1: 1:1 Conversations

```python
# vital_services/one_to_one.py
from vital_langchain_tracker import VITALLangChainTracker
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage
import uuid

class OneToOneConversation:
    """1:1 agent conversation - manual or orchestrator selection"""
    
    def __init__(self, user_id: str, session_id: str):
        self.user_id = user_id
        self.session_id = session_id
        self.service_id = f"1:1_{uuid.uuid4().hex[:8]}"
    
    def chat_with_agent(
        self,
        agent_config: dict,
        user_message: str,
        use_orchestrator: bool = False
    ):
        """Execute 1:1 conversation"""
        
        # Create tracker
        tracker = VITALLangChainTracker(
            service_type='1:1_conversation',
            service_id=self.service_id,
            agent_id=agent_config['id'],
            agent_name=agent_config['name'],
            agent_tier=agent_config['tier'],
            agent_role='direct_conversation',
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 0.50, 'daily': 2.00}
        )
        
        # Create LLM
        llm = ChatAnthropic(
            model=agent_config.get('model', 'claude-sonnet-4-20250514'),
            callbacks=[tracker]
        )
        
        # Execute
        response = llm.invoke([HumanMessage(content=user_message)])
        
        return response.content

# Usage
conversation = OneToOneConversation(
    user_id="user_123",
    session_id="session_456"
)

agent = {
    'id': 'regulatory_strategy_001',
    'name': 'Regulatory Strategy Agent',
    'tier': 1,
    'model': 'claude-sonnet-4-20250514'
}

result = conversation.chat_with_agent(
    agent_config=agent,
    user_message="What's the FDA pathway for our biosimilar?"
)
```

### 3.2 Service 2: Virtual Panel / Advisory Boards

```python
# vital_services/virtual_panel.py
from vital_langchain_tracker import VITALLangChainTracker
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
import uuid

class VirtualAdvisoryPanel:
    """Virtual panel of multiple expert agents"""
    
    def __init__(self, user_id: str, session_id: str, panel_name: str):
        self.user_id = user_id
        self.session_id = session_id
        self.panel_name = panel_name
        self.panel_id = f"panel_{uuid.uuid4().hex[:8]}"
    
    def convene_panel(
        self,
        panel_members: List[dict],
        question: str
    ) -> List[dict]:
        """Get responses from all panel members"""
        
        responses = []
        total_members = len(panel_members)
        
        for idx, member in enumerate(panel_members, 1):
            # Create tracker for this panel member
            tracker = VITALLangChainTracker(
                service_type='virtual_panel',
                service_id=self.panel_id,
                agent_id=member['id'],
                agent_name=member['name'],
                agent_tier=member['tier'],
                agent_role='panel_member',
                panel_id=self.panel_id,
                panel_name=self.panel_name,
                panel_member_position=idx,
                total_panel_members=total_members,
                user_id=self.user_id,
                session_id=self.session_id,
                budget_limits={'session': 2.00}  # Higher for panels
            )
            
            # Create LLM
            if member['tier'] == 1:
                llm = ChatAnthropic(
                    model='claude-sonnet-4-20250514',
                    callbacks=[tracker]
                )
            else:
                llm = ChatOpenAI(
                    model='gpt-4o',
                    callbacks=[tracker]
                )
            
            # Get panel member's perspective
            prompt = f"""As a {member['expertise']} expert on this advisory panel, 
            provide your perspective on: {question}"""
            
            response = llm.invoke([HumanMessage(content=prompt)])
            
            responses.append({
                'member': member['name'],
                'expertise': member['expertise'],
                'response': response.content
            })
        
        return responses

# Usage
panel = VirtualAdvisoryPanel(
    user_id="user_123",
    session_id="session_456",
    panel_name="Oncology Launch Advisory Board"
)

members = [
    {
        'id': 'kol_oncology_001',
        'name': 'KOL - Oncology Expert',
        'tier': 1,
        'expertise': 'Clinical Oncology'
    },
    {
        'id': 'payer_expert_001',
        'name': 'Payer Strategy Expert',
        'tier': 1,
        'expertise': 'Market Access & Reimbursement'
    },
    {
        'id': 'patient_advocate_001',
        'name': 'Patient Advocate',
        'tier': 2,
        'expertise': 'Patient Experience'
    }
]

insights = panel.convene_panel(
    panel_members=members,
    question="What are the key success factors for our Q1 2026 launch?"
)
```

### 3.3 Service 3: Orchestrated Workflows (LangGraph)

```python
# vital_services/workflow_orchestration.py
from vital_langchain_tracker import VITALLangChainTracker
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage
from typing import TypedDict
import uuid

class WorkflowState(TypedDict):
    """State for LangGraph workflow"""
    input: str
    market_research: str
    competitive_analysis: str
    strategic_imperatives: str
    final_report: str

class OrchestatedWorkflow:
    """Multi-agent workflow using LangGraph"""
    
    def __init__(
        self,
        user_id: str,
        session_id: str,
        workflow_name: str
    ):
        self.user_id = user_id
        self.session_id = session_id
        self.workflow_name = workflow_name
        self.workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
    
    def create_tracker(self, agent_config: dict, step: int, step_name: str):
        """Create tracker for workflow step"""
        return VITALLangChainTracker(
            service_type='workflow',
            service_id=self.workflow_id,
            agent_id=agent_config['id'],
            agent_name=agent_config['name'],
            agent_tier=agent_config['tier'],
            agent_role='workflow_step',
            workflow_id=self.workflow_id,
            workflow_name=self.workflow_name,
            workflow_step=step,
            workflow_step_name=step_name,
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 3.00}  # Higher for workflows
        )
    
    def build_graph(self):
        """Build LangGraph workflow"""
        
        workflow = StateGraph(WorkflowState)
        
        # Step 1: Market Research
        def market_research_step(state):
            tracker = self.create_tracker(
                {'id': 'market_research_001', 'name': 'Market Research Agent', 'tier': 2},
                step=1,
                step_name='market_research'
            )
            
            llm = ChatAnthropic(
                model='claude-haiku-4-20250514',
                callbacks=[tracker]
            )
            
            response = llm.invoke([
                HumanMessage(content=f"Conduct market research for: {state['input']}")
            ])
            
            return {'market_research': response.content}
        
        # Step 2: Competitive Analysis
        def competitive_analysis_step(state):
            tracker = self.create_tracker(
                {'id': 'competitive_analysis_001', 'name': 'Competitive Analysis Agent', 'tier': 1},
                step=2,
                step_name='competitive_analysis'
            )
            
            llm = ChatAnthropic(
                model='claude-sonnet-4-20250514',
                callbacks=[tracker]
            )
            
            response = llm.invoke([
                HumanMessage(content=f"Analyze competition based on: {state['market_research']}")
            ])
            
            return {'competitive_analysis': response.content}
        
        # Step 3: Strategic Imperatives
        def strategic_imperatives_step(state):
            tracker = self.create_tracker(
                {'id': 'strategic_planning_001', 'name': 'Strategic Planning Agent', 'tier': 1},
                step=3,
                step_name='strategic_imperatives'
            )
            
            llm = ChatAnthropic(
                model='claude-sonnet-4-20250514',
                callbacks=[tracker]
            )
            
            response = llm.invoke([
                HumanMessage(content=f"""Define strategic imperatives based on:
                Market Research: {state['market_research']}
                Competitive Analysis: {state['competitive_analysis']}
                """)
            ])
            
            return {'strategic_imperatives': response.content}
        
        # Build graph
        workflow.add_node("market_research", market_research_step)
        workflow.add_node("competitive_analysis", competitive_analysis_step)
        workflow.add_node("strategic_imperatives", strategic_imperatives_step)
        
        workflow.set_entry_point("market_research")
        workflow.add_edge("market_research", "competitive_analysis")
        workflow.add_edge("competitive_analysis", "strategic_imperatives")
        workflow.add_edge("strategic_imperatives", END)
        
        return workflow.compile()
    
    def execute(self, input_prompt: str):
        """Execute workflow"""
        graph = self.build_graph()
        
        result = graph.invoke({
            'input': input_prompt,
            'market_research': '',
            'competitive_analysis': '',
            'strategic_imperatives': '',
            'final_report': ''
        })
        
        return result

# Usage
workflow = OrchestatedWorkflow(
    user_id="user_123",
    session_id="session_456",
    workflow_name="Market Research & Strategic Planning"
)

result = workflow.execute(
    input_prompt="Oncology product launch in EU market Q1 2026"
)
```

### 3.4 Service 4: Solution Builder (Multi-Workflow)

```python
# vital_services/solution_builder.py
from vital_services.workflow_orchestration import OrchestatedWorkflow
from vital_langchain_tracker import VITALLangChainTracker
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage
import uuid

class SolutionBuilder:
    """Connect multiple workflows into end-to-end solution (e.g., Brand Plan)"""
    
    def __init__(
        self,
        user_id: str,
        session_id: str,
        solution_name: str
    ):
        self.user_id = user_id
        self.session_id = session_id
        self.solution_name = solution_name
        self.solution_id = f"solution_{uuid.uuid4().hex[:8]}"
    
    def build_brand_plan(self, product_info: dict):
        """
        End-to-end brand plan combining multiple workflows:
        1. Market Research Workflow
        2. Strategic Planning Workflow
        3. Tactical Execution Workflow
        4. Synthesis & Recommendations
        """
        
        results = {}
        
        # Workflow 1: Market Research
        market_workflow = OrchestatedWorkflow(
            user_id=self.user_id,
            session_id=self.session_id,
            workflow_name="Market Research - Brand Plan Component"
        )
        
        results['market_research'] = market_workflow.execute(
            input_prompt=f"Market analysis for {product_info['name']}"
        )
        
        # Workflow 2: Strategic Planning
        strategy_workflow = OrchestatedWorkflow(
            user_id=self.user_id,
            session_id=self.session_id,
            workflow_name="Strategic Planning - Brand Plan Component"
        )
        
        results['strategy'] = strategy_workflow.execute(
            input_prompt=f"Strategic positioning for {product_info['name']}"
        )
        
        # Workflow 3: Tactical Execution
        tactics_workflow = OrchestatedWorkflow(
            user_id=self.user_id,
            session_id=self.session_id,
            workflow_name="Tactical Execution - Brand Plan Component"
        )
        
        results['tactics'] = tactics_workflow.execute(
            input_prompt=f"Tactical execution plan for {product_info['name']}"
        )
        
        # Step 4: Synthesize into comprehensive brand plan
        tracker = VITALLangChainTracker(
            service_type='solution_builder',
            service_id=self.solution_id,
            agent_id='brand_plan_synthesizer_001',
            agent_name='Brand Plan Synthesizer',
            agent_tier=1,
            agent_role='solution_synthesizer',
            workflow_id=self.solution_id,
            workflow_name=self.solution_name,
            workflow_step=4,
            workflow_step_name='synthesis',
            user_id=self.user_id,
            session_id=self.session_id,
            budget_limits={'session': 5.00}  # Highest for full solutions
        )
        
        llm = ChatAnthropic(
            model='claude-sonnet-4-20250514',
            callbacks=[tracker]
        )
        
        synthesis_prompt = f"""
        Create comprehensive brand plan synthesizing these components:
        
        Market Research: {results['market_research']['strategic_imperatives']}
        Strategic Plan: {results['strategy']['strategic_imperatives']}
        Tactical Plan: {results['tactics']['strategic_imperatives']}
        
        Deliver executive-ready brand plan document.
        """
        
        final_plan = llm.invoke([HumanMessage(content=synthesis_prompt)])
        
        return {
            'components': results,
            'brand_plan': final_plan.content,
            'solution_id': self.solution_id
        }

# Usage
builder = SolutionBuilder(
    user_id="user_123",
    session_id="session_456",
    solution_name="Complete Brand Plan - Oncology Launch"
)

brand_plan = builder.build_brand_plan(
    product_info={
        'name': 'OncoRx-500',
        'indication': 'Metastatic Breast Cancer',
        'launch_date': '2026-Q1'
    }
)
```

---

## 4. Updated Database Schema

See `supabase-migration-langchain-updated.sql` for full schema with new fields:
- `service_type`
- `service_id`
- `workflow_id`, `workflow_name`, `workflow_step`, `workflow_step_name`
- `panel_id`, `panel_name`, `panel_member_position`, `total_panel_members`
- `parent_workflow_id` (for solution_builder)
- `langsmith_run_id`, `langsmith_trace_id`

---

## 5. Analytics for Your 4 Services

```python
# vital_analytics_services.py
from supabase import create_client
import pandas as pd

class VITALServiceAnalytics:
    """Analytics for all 4 service types"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)
    
    def get_service_breakdown(self, days: int = 7):
        """Cost breakdown by service type"""
        result = self.supabase.table('token_usage_logs')\
            .select('service_type, total_cost, total_tokens')\
            .gte('created_at', f'now() - interval \'{days} days\'')\
            .execute()
        
        df = pd.DataFrame(result.data)
        
        summary = df.groupby('service_type').agg({
            'total_cost': 'sum',
            'total_tokens': 'sum'
        }).reset_index()
        
        return summary
    
    def get_workflow_efficiency(self, workflow_id: str):
        """Analyze workflow step costs"""
        result = self.supabase.table('token_usage_logs')\
            .select('workflow_step, workflow_step_name, total_cost, latency_ms')\
            .eq('workflow_id', workflow_id)\
            .order('workflow_step')\
            .execute()
        
        df = pd.DataFrame(result.data)
        
        return df.groupby(['workflow_step', 'workflow_step_name']).agg({
            'total_cost': 'sum',
            'latency_ms': 'mean'
        })
    
    def get_panel_performance(self, panel_id: str):
        """Analyze panel member contributions"""
        result = self.supabase.table('token_usage_logs')\
            .select('agent_name, panel_member_position, total_cost, total_tokens')\
            .eq('panel_id', panel_id)\
            .execute()
        
        df = pd.DataFrame(result.data)
        
        return df.groupby(['panel_member_position', 'agent_name']).agg({
            'total_cost': 'sum',
            'total_tokens': 'sum'
        })
    
    def get_solution_cost_breakdown(self, solution_id: str):
        """Breakdown cost for multi-workflow solutions"""
        result = self.supabase.table('token_usage_logs')\
            .select('workflow_name, workflow_step_name, total_cost')\
            .eq('service_id', solution_id)\
            .execute()
        
        df = pd.DataFrame(result.data)
        
        return df.groupby(['workflow_name', 'workflow_step_name']).agg({
            'total_cost': 'sum'
        })
```

---

## 6. Cost Projections by Service Type

```python
# Estimated costs per service (based on typical usage)

SERVICE_COST_ESTIMATES = {
    '1:1_conversation': {
        'avg_tokens_per_session': 2000,
        'avg_cost_per_session': 0.036,  # ~$0.04
        'typical_sessions_per_user_month': 10,
        'monthly_cost_per_user': 0.36
    },
    
    'virtual_panel': {
        'avg_tokens_per_panel': 8000,  # 4 members × 2000 tokens
        'avg_cost_per_panel': 0.144,    # ~$0.14
        'typical_panels_per_user_month': 5,
        'monthly_cost_per_user': 0.72
    },
    
    'workflow': {
        'avg_tokens_per_workflow': 6000,  # 3 steps × 2000 tokens
        'avg_cost_per_workflow': 0.108,    # ~$0.11
        'typical_workflows_per_user_month': 8,
        'monthly_cost_per_user': 0.86
    },
    
    'solution_builder': {
        'avg_tokens_per_solution': 15000,  # 3 workflows + synthesis
        'avg_cost_per_solution': 0.270,     # ~$0.27
        'typical_solutions_per_user_month': 2,
        'monthly_cost_per_user': 0.54
    }
}

# TOTAL ESTIMATED COST PER USER PER MONTH
total_monthly_cost = sum(
    service['monthly_cost_per_user'] 
    for service in SERVICE_COST_ESTIMATES.values()
)
# = $2.48/user/month

# For 100 MVP users: $248/month
# With 30% buffer: $322/month
# With caching (30% reduction): $226/month
```

---

## 7. Next Steps

1. **Update database** with new schema (see attached SQL)
2. **Install dependencies**: `pip install langchain langsmith langgraph anthropic openai supabase`
3. **Configure LangSmith** (optional but recommended for tracing)
4. **Implement trackers** for each of your 4 services
5. **Test** with sample workflows
6. **Monitor** in dashboard

Your cost structure is highly favorable - even with all 4 services, you're looking at ~$2.50/user/month, giving you excellent margins at $20/month pricing.
