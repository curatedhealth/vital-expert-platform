"""Base Task Runner - Abstract base class for all 88 cognitive runners."""
# TODO: Implement base class with InputT/OutputT generics
# See: VITAL_TASK_RUNNER_ARCHITECTURE_ENRICHED.md Part 5.1

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

class TaskRunnerCategory(str, Enum):
    """22 categories of cognitive operations."""
    UNDERSTAND = "understand"
    EVALUATE = "evaluate"
    DECIDE = "decide"
    INVESTIGATE = "investigate"
    WATCH = "watch"
    SOLVE = "solve"
    PREPARE = "prepare"
    CREATE = "create"
    REFINE = "refine"
    VALIDATE = "validate"
    SYNTHESIZE = "synthesize"
    PLAN = "plan"
    PREDICT = "predict"
    ENGAGE = "engage"
    ALIGN = "align"
    INFLUENCE = "influence"
    ADAPT = "adapt"
    DISCOVER = "discover"
    DESIGN = "design"
    GOVERN = "govern"
    SECURE = "secure"
    EXECUTE = "execute"

class TaskRunnerInput(BaseModel):
    """Base input schema."""
    trace_id: Optional[str] = None
    tenant_id: Optional[str] = None
    max_duration_seconds: int = 180

class TaskRunnerOutput(BaseModel):
    """Base output schema for all task runners."""
    success: bool = True
    error: Optional[str] = None
    confidence_score: float = 0.0
    quality_score: float = 0.0
    duration_seconds: float = 0.0
    tokens_used: int = 0
    runner_id: str = ""

InputT = TypeVar("InputT", bound=TaskRunnerInput)
OutputT = TypeVar("OutputT", bound=TaskRunnerOutput)

class TaskRunner(ABC, Generic[InputT, OutputT]):
    """Base class for atomic cognitive operations."""
    runner_id: str = "base"
    name: str = "Base Task Runner"
    description: str = "Abstract base task runner"
    category: TaskRunnerCategory = TaskRunnerCategory.UNDERSTAND
    algorithmic_core: str = "none"
    max_duration_seconds: int = 180

    # Type hints for subclasses
    InputType: type = TaskRunnerInput
    OutputType: type = TaskRunnerOutput

    def __init__(self, llm: Any = None, **kwargs: Any):
        """
        Initialize the task runner.

        Args:
            llm: Language model instance (e.g., ChatOpenAI)
            **kwargs: Additional configuration options
        """
        self.llm = llm
        self.config = kwargs

    @abstractmethod
    async def execute(self, input: InputT) -> OutputT:
        """Execute the cognitive operation."""
        pass
