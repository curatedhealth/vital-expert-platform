"""
VITAL Path - Budget Middleware

Enforces token budget limits before LLM requests.
Prevents runaway costs from recursive agents or loops.
"""

import logging
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from core.context import get_request_context, set_request_context
from domain.services.budget_service import BudgetService
from domain.exceptions import BudgetExceededException

logger = logging.getLogger(__name__)


class BudgetMiddleware(BaseHTTPMiddleware):
    """
    Token budget enforcement middleware.
    
    Checks user's remaining token budget before expensive operations.
    Updates context with budget information for downstream services.
    """
    
    # Paths that consume tokens (require budget check)
    TOKEN_CONSUMING_PATHS = [
        "/api/v1/expert/ask",
        "/api/v1/expert/chat",
        "/api/v1/panel/simulate",
        "/api/v1/workflow/execute",
    ]
    
    # Estimated tokens per request type (for pre-check)
    ESTIMATED_TOKENS = {
        "/api/v1/expert/ask": 2000,      # Mode 1/2 chat
        "/api/v1/expert/chat": 2000,     # Streaming chat
        "/api/v1/panel/simulate": 10000, # Panel simulation
        "/api/v1/workflow/execute": 5000, # Workflow execution
    }
    
    def __init__(self, app, budget_service: BudgetService = None):
        super().__init__(app)
        self.budget_service = budget_service or BudgetService()
    
    async def dispatch(self, request: Request, call_next):
        """Process request through budget check."""
        
        # Skip budget check for non-consuming paths
        if not self._is_token_consuming_path(request.url.path):
            return await call_next(request)
        
        context = get_request_context()
        
        if not context:
            # No context = no budget check (will fail auth anyway)
            return await call_next(request)
        
        try:
            # Get estimated tokens for this request type
            estimated_tokens = self._estimate_tokens(request)
            
            # Check budget with BudgetService
            budget_check = await self.budget_service.check_budget(
                tenant_id=context.tenant_id,
                user_id=context.user_id,
                estimated_tokens=estimated_tokens,
            )
            
            if not budget_check.can_proceed:
                logger.warning(
                    f"Budget exceeded for tenant={context.tenant_id} "
                    f"user={context.user_id} "
                    f"used={budget_check.monthly_used}/{budget_check.monthly_limit}"
                )
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "TOKEN_BUDGET_EXCEEDED",
                        "message": "Monthly token budget exceeded",
                        "monthly_limit": budget_check.monthly_limit,
                        "monthly_used": budget_check.monthly_used,
                        "remaining": budget_check.remaining,
                        "percent_used": float(budget_check.percent_used),
                    }
                )
            
            # Update context with budget info
            updated_context = context.with_budget(
                remaining=budget_check.remaining,
                limit=budget_check.monthly_limit,
            )
            set_request_context(updated_context)
            
            # Log budget warning if approaching limit
            if budget_check.percent_used >= 80:
                logger.warning(
                    f"Budget warning for tenant={context.tenant_id}: "
                    f"{budget_check.percent_used}% used"
                )
            
            # Process request
            response = await call_next(request)
            
            # Note: Actual token recording happens in LLM tracking wrapper,
            # not in this middleware (we only check here, not record)
            
            return response
            
        except BudgetExceededException as e:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "TOKEN_BUDGET_EXCEEDED",
                    "message": str(e),
                }
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Budget check failed: {str(e)}")
            # On budget check error, allow request but log warning
            # This prevents budget service failures from blocking all requests
            logger.warning(
                f"Budget check failed for tenant={context.tenant_id}, "
                f"allowing request: {str(e)}"
            )
            return await call_next(request)
    
    def _is_token_consuming_path(self, path: str) -> bool:
        """Check if path consumes tokens."""
        return any(path.startswith(p) for p in self.TOKEN_CONSUMING_PATHS)
    
    def _estimate_tokens(self, request: Request) -> int:
        """
        Estimate tokens for this request.
        
        In a more sophisticated implementation, this could look at:
        - Request body size
        - Conversation history length
        - Requested mode (Mode 3/4 use more tokens)
        """
        path = request.url.path
        
        for prefix, tokens in self.ESTIMATED_TOKENS.items():
            if path.startswith(prefix):
                return tokens
        
        # Default estimate
        return 1000



















