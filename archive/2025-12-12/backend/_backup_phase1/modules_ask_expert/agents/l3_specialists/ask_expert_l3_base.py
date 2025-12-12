"""
VITAL Path AI Services - Ask Expert L3 Task Specialist

L3 Specialists handle focused task execution, spawned by L2 Experts.
Uses Claude Sonnet 4 for efficient processing.

Naming Convention:
- Class: AskExpertL3TaskSpecialist
- Methods: execute
- Logs: ask_expert_l3_{action}
"""

from typing import Dict, Any, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()


class AskExpertL3TaskSpecialist:
    """
    L3 Task Specialist - Focused task execution.
    
    Spawned by L2 Experts for specific sub-tasks:
    - Literature review
    - Data analysis
    - Comparison
    - Summarization
    
    Uses Claude Sonnet 4 for efficiency.
    """
    
    TASK_PROMPTS = {
        "analysis": """You are a specialist analyst. Analyze the provided data and produce clear, 
actionable insights. Be specific and cite your sources.""",
        
        "literature_review": """You are a literature review specialist. Synthesize the provided 
sources into a coherent summary. Highlight key findings, gaps, and areas of consensus/disagreement.""",
        
        "comparison": """You are a comparison specialist. Compare the provided options/alternatives 
using a structured framework. Highlight pros, cons, and recommendations.""",
        
        "summarization": """You are a summarization specialist. Create a clear, concise summary 
of the provided content. Preserve key information while reducing length.""",
    }
    
    def __init__(
        self,
        task_type: str,
        parent_expert_id: str,
        llm=None,
        model: str = "claude-sonnet-4-20250514",
        token_budget: int = 2000,
    ):
        """
        Initialize L3 Task Specialist.
        
        Args:
            task_type: Type of task (analysis, literature_review, comparison, summarization)
            parent_expert_id: ID of the L2 expert that spawned this specialist
            llm: Pre-configured LLM
            model: Model to use
            token_budget: Maximum tokens
        """
        self.task_type = task_type
        self.parent_expert_id = parent_expert_id
        self.token_budget = token_budget
        self.model = model
        
        if llm:
            self.llm = llm
        else:
            try:
                from langchain_anthropic import ChatAnthropic
                self.llm = ChatAnthropic(
                    model=model,
                    temperature=0.1,  # Low temp for focused tasks
                    max_tokens=token_budget,
                )
            except ImportError:
                self.llm = None
        
        logger.info(
            "ask_expert_l3_specialist_initialized",
            task_type=task_type,
            parent_expert_id=parent_expert_id,
        )
    
    @property
    def system_prompt(self) -> str:
        """Get task-specific system prompt."""
        return self.TASK_PROMPTS.get(self.task_type, self.TASK_PROMPTS["analysis"])
    
    async def execute(
        self,
        task: str,
        context: Dict[str, Any],
        tenant_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute the specialized task.
        
        Args:
            task: Task description
            context: Context and data for the task
            tenant_id: Tenant UUID
            
        Returns:
            Task result
        """
        logger.info(
            "ask_expert_l3_execute_started",
            task_type=self.task_type,
            parent_expert_id=self.parent_expert_id,
        )
        
        try:
            if not self.llm:
                return {
                    'task_type': self.task_type,
                    'result': 'LLM not available',
                    'error': True,
                }
            
            from langchain_core.messages import SystemMessage, HumanMessage
            
            task_prompt = f"""## Task
{task}

## Context
{self._format_context(context)}

Execute this task thoroughly and provide your output."""
            
            response = await self.llm.ainvoke([
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=task_prompt),
            ])
            
            result = {
                'task_type': self.task_type,
                'parent_expert_id': self.parent_expert_id,
                'result': response.content,
                'timestamp': datetime.utcnow().isoformat(),
            }
            
            logger.info(
                "ask_expert_l3_execute_completed",
                task_type=self.task_type,
                result_length=len(response.content),
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "ask_expert_l3_execute_failed",
                task_type=self.task_type,
                error=str(e),
            )
            return {
                'task_type': self.task_type,
                'result': f"Error: {str(e)}",
                'error': True,
            }
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for prompt."""
        if isinstance(context, str):
            return context
        
        parts = []
        for key, value in context.items():
            if isinstance(value, list):
                parts.append(f"### {key}")
                for item in value[:10]:
                    parts.append(f"- {str(item)[:200]}")
            else:
                parts.append(f"### {key}\n{str(value)[:500]}")
        
        return "\n".join(parts)
