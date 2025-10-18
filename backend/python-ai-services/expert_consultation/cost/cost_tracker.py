from langchain_core.callbacks import BaseCallbackHandler
from typing import Dict, Any, Optional
import asyncio

class CostTrackingCallback(BaseCallbackHandler):
    """Track LLM costs in real-time"""
    
    PRICING = {
        "gpt-4": {"input": 3.0, "output": 15.0},  # $3 per 1M input, $15 per 1M output
        "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},  # $0.5 per 1M input, $1.5 per 1M output
        "claude-3": {"input": 3.0, "output": 15.0},  # Similar to GPT-4
    }
    
    def __init__(self, session_id: str, budget: float, streamer=None):
        self.session_id = session_id
        self.budget = budget
        self.accumulated_cost = 0.0
        self.cost_by_phase = {}
        self.token_usage = {"input": 0, "output": 0}
        self.streamer = streamer
        self.warnings_sent = set()
    
    async def on_llm_start(self, serialized: Dict[str, Any], prompts: list, **kwargs):
        """Called when LLM starts"""
        self.current_phase = kwargs.get("tags", ["unknown"])[0] if kwargs.get("tags") else "unknown"
    
    async def on_llm_end(self, response, **kwargs):
        """Called when LLM ends - track costs"""
        try:
            # Get token usage
            usage = response.llm_output.get("token_usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)
            
            # Get model name for pricing
            model_name = response.llm_output.get("model_name", "gpt-4")
            pricing = self.PRICING.get(model_name, self.PRICING["gpt-4"])
            
            # Calculate cost
            input_cost = (input_tokens / 1_000_000) * pricing["input"]
            output_cost = (output_tokens / 1_000_000) * pricing["output"]
            total_cost = input_cost + output_cost
            
            # Update tracking
            self.accumulated_cost += total_cost
            self.token_usage["input"] += input_tokens
            self.token_usage["output"] += output_tokens
            
            # Update cost by phase
            phase = getattr(self, 'current_phase', 'unknown')
            self.cost_by_phase[phase] = self.cost_by_phase.get(phase, 0.0) + total_cost
            
            # Create cost data
            cost_data = {
                "session_id": self.session_id,
                "accumulated_cost": self.accumulated_cost,
                "budget": self.budget,
                "budget_remaining": self.budget - self.accumulated_cost,
                "budget_used_percent": (self.accumulated_cost / self.budget) * 100,
                "cost_by_phase": self.cost_by_phase.copy(),
                "token_usage": self.token_usage.copy(),
                "last_update": {
                    "phase": phase,
                    "cost": total_cost,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens
                }
            }
            
            # Stream cost update
            if self.streamer:
                await self.streamer.stream_cost_update(self.session_id, cost_data)
            
            # Check for budget warnings
            await self._check_budget_warnings(cost_data)
            
        except Exception as e:
            print(f"Error tracking cost: {e}")
    
    async def _check_budget_warnings(self, cost_data: Dict[str, Any]):
        """Check for budget warnings and send alerts"""
        budget_used_percent = cost_data["budget_used_percent"]
        
        # 90% warning
        if budget_used_percent >= 90 and "90_percent" not in self.warnings_sent:
            await self._send_budget_warning("90% of budget used", cost_data)
            self.warnings_sent.add("90_percent")
        
        # 95% warning
        elif budget_used_percent >= 95 and "95_percent" not in self.warnings_sent:
            await self._send_budget_warning("95% of budget used - execution may be paused", cost_data)
            self.warnings_sent.add("95_percent")
        
        # 100% warning
        elif budget_used_percent >= 100 and "100_percent" not in self.warnings_sent:
            await self._send_budget_warning("Budget exceeded - execution stopped", cost_data)
            self.warnings_sent.add("100_percent")
    
    async def _send_budget_warning(self, message: str, cost_data: Dict[str, Any]):
        """Send budget warning"""
        if self.streamer:
            await self.streamer.stream_intervention_request(self.session_id, {
                "type": "budget_warning",
                "message": message,
                "cost_data": cost_data
            })
    
    def get_cost_summary(self) -> Dict[str, Any]:
        """Get current cost summary"""
        return {
            "session_id": self.session_id,
            "accumulated_cost": self.accumulated_cost,
            "budget": self.budget,
            "budget_remaining": self.budget - self.accumulated_cost,
            "budget_used_percent": (self.accumulated_cost / self.budget) * 100,
            "cost_by_phase": self.cost_by_phase.copy(),
            "token_usage": self.token_usage.copy()
        }
    
    def is_budget_exceeded(self) -> bool:
        """Check if budget is exceeded"""
        return self.accumulated_cost >= self.budget
    
    def get_remaining_budget(self) -> float:
        """Get remaining budget"""
        return max(0, self.budget - self.accumulated_cost)
