"""
Panel Task Executor
Executes panel-specific tasks (moderator, expert_agent, opening_statements, etc.)
Uses system prompts from TaskLibrary.tsx or workflow metadata
"""

from typing import Dict, Any, Optional, List, Union
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel
import json
import os

# Try to import Ollama
try:
    from langchain_ollama import ChatOllama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    ChatOllama = None


class PanelTaskExecutor:
    """Executes panel-specific tasks with system prompt resolution"""
    
    # Default system prompts from TaskLibrary.tsx
    DEFAULT_SYSTEM_PROMPTS = {
        "moderator": "You are an AI moderator facilitating a structured expert panel discussion. Manage time, pose questions, synthesize inputs, and guide consensus building.",
        "expert_agent": "You are a domain expert task participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building.",
        "opening_statements": "Execute sequential opening statements from all experts. Each expert has 60-90 seconds to present their initial perspective.",
        "discussion_round": "Execute a moderated discussion round. Moderator poses questions, experts respond sequentially, building on each other's points.",
        "consensus_calculator": "Calculate consensus level from expert positions. Identify majority view, minority opinions, and overall agreement percentage.",
        "documentation_generator": "Generate formal panel documentation: executive summary, consensus report, voting record, evidence appendix, and action items.",
    }
    
    def __init__(
        self, 
        openai_api_key: Optional[str] = None,
        provider: str = "openai",  # "openai" or "ollama"
        ollama_base_url: str = "http://localhost:11434",
        default_model: str = "gpt-4o"  # Will be overridden by provider
    ):
        """Initialize task executor with API key or Ollama config"""
        self.openai_api_key = openai_api_key
        self.provider = provider
        self.ollama_base_url = ollama_base_url
        self.default_model = default_model
        self.llm_cache = {}  # Cache LLM instances by provider/model/temperature
    
    def get_llm(
        self, 
        model: Optional[str] = None, 
        temperature: float = 0.7
    ) -> Union[ChatOpenAI, BaseChatModel]:
        """Get or create LLM instance (OpenAI or Ollama)"""
        if model is None:
            model = self.default_model
        
        cache_key = f"{self.provider}_{model}_{temperature}"
        if cache_key not in self.llm_cache:
            if self.provider == "ollama":
                if not OLLAMA_AVAILABLE:
                    raise ImportError("langchain_ollama is not installed. Install with: pip install langchain-ollama")
                self.llm_cache[cache_key] = ChatOllama(
                    model=model,
                    base_url=self.ollama_base_url,
                    temperature=temperature
                )
            else:  # OpenAI
                if not self.openai_api_key:
                    raise ValueError("OpenAI API key is required when using OpenAI provider")
                self.llm_cache[cache_key] = ChatOpenAI(
                    model=model,
                    api_key=self.openai_api_key,
                    temperature=temperature
                )
        return self.llm_cache[cache_key]
    
    def resolve_system_prompt(
        self,
        task_id: str,
        task_config: Dict[str, Any],
        workflow_system_prompt: Optional[str] = None
    ) -> str:
        """
        Resolve system prompt with priority:
        1. Task-level system prompt (from task config)
        2. Workflow-level system prompt (from metadata)
        3. Default system prompt (from DEFAULT_SYSTEM_PROMPTS)
        """
        # Priority 1: Task-level system prompt
        if task_config.get("systemPrompt"):
            return task_config["systemPrompt"]
        
        # Priority 2: Workflow-level system prompt
        if workflow_system_prompt:
            return workflow_system_prompt
        
        # Priority 3: Default system prompt
        return self.DEFAULT_SYSTEM_PROMPTS.get(task_id, "You are a helpful assistant.")
    
    async def execute_task(
        self,
        task_id: str,
        task_config: Dict[str, Any],
        inputs: Dict[str, Any],
        workflow_system_prompt: Optional[str] = None,
        log_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Execute a panel task
        
        Args:
            task_id: Task identifier (moderator, expert_agent, etc.)
            task_config: Task configuration from TaskLibrary
            inputs: Input data for the task
            workflow_system_prompt: Optional workflow-level system prompt
            log_callback: Optional callback function to send log messages
            
        Returns:
            Task output
        """
        def log(message: str, level: str = "info"):
            if log_callback:
                log_callback(message, level)
            else:
                print(f"[{task_id}] {message}")
        
        log(f"Starting task: {task_id}")
        
        # Resolve system prompt
        system_prompt = self.resolve_system_prompt(
            task_id,
            task_config,
            workflow_system_prompt
        )
        log(f"Using system prompt (length: {len(system_prompt)} chars)")
        
        # Get model and temperature from config
        # If using Ollama and model is OpenAI default, use Ollama default instead
        config_model = task_config.get("model", "gpt-4o")
        if self.provider == "ollama" and config_model in ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]:
            model = self.default_model
            log(f"Using Ollama default model '{model}' instead of OpenAI model '{config_model}'")
        else:
            model = config_model
        temperature = task_config.get("temperature", 0.7)
        log(f"Model: {model}, Temperature: {temperature}, Provider: {self.provider}")
        
        # Get LLM
        try:
            llm = self.get_llm(model, temperature)
            log(f"LLM initialized successfully")
        except Exception as e:
            log(f"Failed to initialize LLM: {str(e)}", "error")
            return {
                "task_id": task_id,
                "output": None,
                "error": f"LLM initialization failed: {str(e)}",
                "success": False
            }
        
        # Build prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        
        # Format input
        input_text = json.dumps(inputs, indent=2) if isinstance(inputs, dict) else str(inputs)
        log(f"Input prepared (length: {len(input_text)} chars)")
        log(f"Calling LLM API...")
        
        # Execute with timeout for Ollama
        try:
            import asyncio
            # Add timeout for Ollama calls (60 seconds)
            if self.provider == "ollama":
                response = await asyncio.wait_for(
                    llm.ainvoke(prompt.format(input=input_text)),
                    timeout=60.0
                )
            else:
                response = await llm.ainvoke(prompt.format(input=input_text))
            
            log(f"LLM response received (length: {len(response.content)} chars)", "success")
            return {
                "task_id": task_id,
                "output": response.content,
                "success": True
            }
        except asyncio.TimeoutError:
            error_msg = f"LLM call timed out after 60 seconds (provider: {self.provider}, model: {model})"
            log(f"Task execution timed out: {error_msg}", "error")
            return {
                "task_id": task_id,
                "output": None,
                "error": error_msg,
                "success": False
            }
        except Exception as e:
            error_msg = str(e)
            log(f"Task execution failed: {error_msg}", "error")
            import traceback
            log(f"Traceback: {traceback.format_exc()}", "error")
            return {
                "task_id": task_id,
                "output": None,
                "error": error_msg,
                "success": False
            }
    
    async def execute_moderator_task(
        self,
        task_config: Dict[str, Any],
        query: str,
        context: Dict[str, Any],
        workflow_system_prompt: Optional[str] = None,
        log_callback: Optional[callable] = None
    ) -> str:
        """Execute moderator task"""
        inputs = {
            "query": query,
            "context": context,
            "role": "moderator"
        }
        result = await self.execute_task("moderator", task_config, inputs, workflow_system_prompt, log_callback)
        return result.get("output", "")
    
    async def execute_expert_task(
        self,
        task_config: Dict[str, Any],
        expert_name: str,
        query: str,
        context: Dict[str, Any],
        previous_statements: List[str],
        workflow_system_prompt: Optional[str] = None,
        log_callback: Optional[callable] = None
    ) -> str:
        """Execute expert agent task"""
        if log_callback:
            log_callback(f"Executing expert task for: {expert_name}", "info")
        inputs = {
            "expert_name": expert_name,
            "query": query,
            "context": context,
            "previous_statements": previous_statements,
            "role": "expert"
        }
        result = await self.execute_task("expert_agent", task_config, inputs, workflow_system_prompt, log_callback)
        if log_callback:
            if result.get("success"):
                log_callback(f"Expert {expert_name} completed successfully", "success")
            else:
                log_callback(f"Expert {expert_name} failed: {result.get('error', 'Unknown error')}", "error")
        return result.get("output", "")
    
    async def execute_opening_statements(
        self,
        task_config: Dict[str, Any],
        experts: List[Dict[str, Any]],
        query: str,
        workflow_system_prompt: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Execute opening statements task"""
        statements = []
        for expert in experts:
            statement = await self.execute_expert_task(
                task_config,
                expert.get("name", "Expert"),
                query,
                expert.get("context", {}),
                [],
                workflow_system_prompt
            )
            statements.append({
                "expert": expert.get("name", "Expert"),
                "statement": statement
            })
        return statements
    
    async def execute_consensus_calculation(
        self,
        task_config: Dict[str, Any],
        expert_positions: List[Dict[str, Any]],
        workflow_system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute consensus calculator task"""
        inputs = {
            "expert_positions": expert_positions
        }
        result = await self.execute_task("consensus_calculator", task_config, inputs, workflow_system_prompt)
        
        # Parse consensus result
        try:
            consensus_data = json.loads(result.get("output", "{}"))
        except:
            # Fallback if not JSON
            consensus_data = {
                "consensus_level": 0.75,
                "majority_view": result.get("output", ""),
                "dissenting_opinions": []
            }
        
        return consensus_data
    
    async def execute_documentation_generation(
        self,
        task_config: Dict[str, Any],
        panel_data: Dict[str, Any],
        workflow_system_prompt: Optional[str] = None,
        log_callback: Optional[callable] = None
    ) -> str:
        """Execute documentation generator task"""
        result = await self.execute_task("documentation_generator", task_config, panel_data, workflow_system_prompt, log_callback)
        return result.get("output", "")

