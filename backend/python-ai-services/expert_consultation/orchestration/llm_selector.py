"""
LLM Selection Algorithm for VITAL Ask Expert Service

Provides intelligent LLM selection based on query type, complexity, and cost optimization.
Supports multiple LLM providers (OpenAI, Anthropic, etc.) with fallback strategies.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage


class ModelProvider(Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class TaskType(Enum):
    """Types of tasks for model selection"""
    REASONING = "reasoning"  # Complex multi-step reasoning
    CHAT = "chat"           # Interactive conversation
    ANALYSIS = "analysis"   # Data analysis and interpretation
    CREATIVE = "creative"   # Creative writing and ideation
    TECHNICAL = "technical" # Technical documentation
    QUICK = "quick"         # Fast, simple responses


@dataclass
class ModelCapabilities:
    """Model capability profile"""
    reasoning_strength: float  # 0-1, strength in complex reasoning
    speed: float              # 0-1, response speed
    context_length: int       # Maximum context window
    cost_per_1k_tokens: float # Cost per 1000 tokens
    reliability: float        # 0-1, uptime and consistency
    creativity: float         # 0-1, creative capabilities


@dataclass
class ModelSelectionResult:
    """Result of model selection process"""
    selected_model: str
    provider: ModelProvider
    reasoning: str
    confidence: float
    estimated_cost: float
    estimated_tokens: int
    fallback_models: List[str]


class ModelRouter:
    """Routes queries to optimal LLM based on task requirements"""
    
    def __init__(self):
        self.models = self._initialize_models()
        self.performance_tracker = {}  # Track model performance
    
    def _initialize_models(self) -> Dict[str, ModelCapabilities]:
        """Initialize available models with their capabilities"""
        return {
            "gpt-4": ModelCapabilities(
                reasoning_strength=0.95,
                speed=0.7,
                context_length=128000,
                cost_per_1k_tokens=0.03,
                reliability=0.98,
                creativity=0.85
            ),
            "gpt-4-turbo": ModelCapabilities(
                reasoning_strength=0.9,
                speed=0.9,
                context_length=128000,
                cost_per_1k_tokens=0.01,
                reliability=0.98,
                creativity=0.85
            ),
            "gpt-3.5-turbo": ModelCapabilities(
                reasoning_strength=0.7,
                speed=0.95,
                context_length=16385,
                cost_per_1k_tokens=0.001,
                reliability=0.99,
                creativity=0.8
            ),
            "claude-3-opus": ModelCapabilities(
                reasoning_strength=0.98,
                speed=0.6,
                context_length=200000,
                cost_per_1k_tokens=0.015,
                reliability=0.97,
                creativity=0.9
            ),
            "claude-3-sonnet": ModelCapabilities(
                reasoning_strength=0.9,
                speed=0.8,
                context_length=200000,
                cost_per_1k_tokens=0.003,
                reliability=0.98,
                creativity=0.88
            ),
            "claude-3-haiku": ModelCapabilities(
                reasoning_strength=0.75,
                speed=0.95,
                context_length=200000,
                cost_per_1k_tokens=0.00025,
                reliability=0.99,
                creativity=0.8
            )
        }
    
    async def select_model(
        self, 
        query: str, 
        task_type: TaskType,
        complexity_score: float,
        budget: float,
        context_length: int = 0
    ) -> ModelSelectionResult:
        """Select optimal model for the given task"""
        
        # Filter models by context length requirement
        suitable_models = {
            name: caps for name, caps in self.models.items()
            if caps.context_length >= context_length
        }
        
        if not suitable_models:
            # Fallback to highest context model
            suitable_models = {"gpt-4": self.models["gpt-4"]}
        
        # Score models based on task requirements
        model_scores = {}
        for model_name, capabilities in suitable_models.items():
            score = self._calculate_model_score(
                capabilities, task_type, complexity_score, budget
            )
            model_scores[model_name] = score
        
        # Select best model
        best_model = max(model_scores.items(), key=lambda x: x[1])
        selected_model = best_model[0]
        selected_caps = suitable_models[selected_model]
        
        # Calculate cost estimate
        estimated_tokens = self._estimate_tokens(query, context_length, complexity_score)
        estimated_cost = (estimated_tokens / 1000) * selected_caps.cost_per_1k_tokens
        
        # Get fallback models
        fallback_models = sorted(
            model_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[1:3]  # Top 2 alternatives
        
        return ModelSelectionResult(
            selected_model=selected_model,
            provider=self._get_provider(selected_model),
            reasoning=self._generate_reasoning(selected_model, task_type, complexity_score),
            confidence=best_model[1],
            estimated_cost=estimated_cost,
            estimated_tokens=estimated_tokens,
            fallback_models=[model[0] for model in fallback_models]
        )
    
    def _calculate_model_score(
        self, 
        capabilities: ModelCapabilities, 
        task_type: TaskType, 
        complexity: float,
        budget: float
    ) -> float:
        """Calculate suitability score for a model"""
        
        # Base score from capabilities
        if task_type == TaskType.REASONING:
            base_score = capabilities.reasoning_strength * 0.4 + capabilities.reliability * 0.3
        elif task_type == TaskType.CHAT:
            base_score = capabilities.speed * 0.4 + capabilities.creativity * 0.3
        elif task_type == TaskType.ANALYSIS:
            base_score = capabilities.reasoning_strength * 0.5 + capabilities.reliability * 0.3
        elif task_type == TaskType.CREATIVE:
            base_score = capabilities.creativity * 0.5 + capabilities.speed * 0.3
        elif task_type == TaskType.TECHNICAL:
            base_score = capabilities.reasoning_strength * 0.4 + capabilities.reliability * 0.4
        else:  # QUICK
            base_score = capabilities.speed * 0.6 + capabilities.reliability * 0.3
        
        # Adjust for complexity
        if complexity > 0.8:  # High complexity
            base_score += capabilities.reasoning_strength * 0.2
        elif complexity < 0.3:  # Low complexity
            base_score += capabilities.speed * 0.2
        
        # Adjust for budget constraints
        if budget < 1.0:  # Low budget
            cost_factor = 1.0 - (capabilities.cost_per_1k_tokens * 10)  # Penalize expensive models
            base_score *= max(0.1, cost_factor)
        
        return base_score
    
    def _get_provider(self, model_name: str) -> ModelProvider:
        """Get provider for model"""
        if model_name.startswith("gpt"):
            return ModelProvider.OPENAI
        elif model_name.startswith("claude"):
            return ModelProvider.ANTHROPIC
        else:
            return ModelProvider.OPENAI
    
    def _estimate_tokens(self, query: str, context_length: int, complexity: float) -> int:
        """Estimate token usage for the query"""
        # Rough estimation: 1 token ≈ 4 characters
        query_tokens = len(query) // 4
        context_tokens = context_length
        
        # Add overhead for reasoning (complexity factor)
        reasoning_overhead = int(query_tokens * complexity * 2)
        
        return query_tokens + context_tokens + reasoning_overhead
    
    def _generate_reasoning(
        self, 
        model_name: str, 
        task_type: TaskType, 
        complexity: float
    ) -> str:
        """Generate human-readable reasoning for model selection"""
        capabilities = self.models[model_name]
        
        reasons = []
        
        if task_type == TaskType.REASONING and capabilities.reasoning_strength > 0.9:
            reasons.append("Excellent reasoning capabilities for complex tasks")
        
        if task_type == TaskType.CHAT and capabilities.speed > 0.8:
            reasons.append("Fast response time for interactive chat")
        
        if complexity > 0.8 and capabilities.reasoning_strength > 0.9:
            reasons.append("High complexity requires strong reasoning ability")
        
        if capabilities.cost_per_1k_tokens < 0.01:
            reasons.append("Cost-effective for the task requirements")
        
        if capabilities.reliability > 0.95:
            reasons.append("High reliability and uptime")
        
        return "; ".join(reasons) if reasons else "Balanced performance across all metrics"


class LLMSelector:
    """Main LLM selection service"""
    
    def __init__(self):
        self.router = ModelRouter()
        self.model_instances = {}  # Cache of model instances
    
    async def get_llm(
        self, 
        query: str,
        task_type: TaskType = TaskType.CHAT,
        complexity_score: float = 0.5,
        budget: float = 10.0,
        context_length: int = 0
    ) -> Tuple[Any, ModelSelectionResult]:
        """Get the optimal LLM instance for the task"""
        
        # Select model
        selection = await self.router.select_model(
            query, task_type, complexity_score, budget, context_length
        )
        
        # Get or create model instance
        model_instance = await self._get_model_instance(
            selection.selected_model, 
            selection.provider
        )
        
        return model_instance, selection
    
    async def _get_model_instance(self, model_name: str, provider: ModelProvider) -> Any:
        """Get or create model instance"""
        cache_key = f"{provider.value}:{model_name}"
        
        if cache_key not in self.model_instances:
            if provider == ModelProvider.OPENAI:
                self.model_instances[cache_key] = ChatOpenAI(
                    model_name=model_name,
                    temperature=0.7,
                    max_tokens=4000
                )
            elif provider == ModelProvider.ANTHROPIC:
                self.model_instances[cache_key] = ChatAnthropic(
                    model=model_name,
                    temperature=0.7,
                    max_tokens=4000
                )
        
        return self.model_instances[cache_key]
    
    async def get_fallback_llm(self, primary_model: str, provider: ModelProvider) -> Any:
        """Get fallback model if primary fails"""
        # Simple fallback strategy
        if provider == ModelProvider.OPENAI:
            fallback_model = "gpt-3.5-turbo" if "gpt-4" in primary_model else "gpt-4"
        else:
            fallback_model = "claude-3-haiku" if "opus" in primary_model else "claude-3-sonnet"
        
        return await self._get_model_instance(fallback_model, provider)
    
    def track_performance(self, model_name: str, success: bool, response_time: float):
        """Track model performance for future optimization"""
        if model_name not in self.router.performance_tracker:
            self.router.performance_tracker[model_name] = {
                "total_requests": 0,
                "successful_requests": 0,
                "avg_response_time": 0.0
            }
        
        tracker = self.router.performance_tracker[model_name]
        tracker["total_requests"] += 1
        
        if success:
            tracker["successful_requests"] += 1
        
        # Update average response time
        tracker["avg_response_time"] = (
            (tracker["avg_response_time"] * (tracker["total_requests"] - 1) + response_time) 
            / tracker["total_requests"]
        )
    
    def get_model_performance(self, model_name: str) -> Dict[str, Any]:
        """Get performance statistics for a model"""
        return self.router.performance_tracker.get(model_name, {
            "total_requests": 0,
            "successful_requests": 0,
            "avg_response_time": 0.0,
            "success_rate": 0.0
        })
