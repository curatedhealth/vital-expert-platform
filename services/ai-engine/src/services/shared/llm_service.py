"""
LLM Service - Simple wrapper for LLM generation

This service provides a simple interface for LLM calls,
used by the Ask Panel Enhanced workflow.

It uses LangChain's ChatOpenAI for consistency with other services.
"""

from typing import Optional, Dict, Any
import os
import structlog
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

logger = structlog.get_logger()


class LLMService:
    """
    Simple LLM service for generating text responses.
    
    This is a lightweight wrapper around LangChain's ChatOpenAI that provides
    the generate() method expected by the Ask Panel Enhanced workflow.
    """

    def __init__(self):
        """Initialize LLM service with OpenAI client."""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not set - LLM calls will fail")

    async def generate(
        self,
        prompt: str,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Generate text response from LLM.
        
        Args:
            prompt: The prompt to send to the LLM
            model: Model name (default: gpt-4o-mini)
            temperature: Temperature setting (default: 0.7)
            max_tokens: Maximum tokens to generate (default: 2000)
            
        Returns:
            Generated text response
        """
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        
        try:
            # Create LangChain ChatOpenAI instance
            llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                openai_api_key=self.openai_api_key
            )
            
            # Generate response
            messages = [HumanMessage(content=prompt)]
            response = await llm.ainvoke(messages)
            
            return response.content
            
        except Exception as e:
            logger.error(
                "llm_service_generate_error",
                model=model,
                error=str(e)
            )
            raise


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the singleton LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def initialize_llm_service() -> LLMService:
    """Initialize and return the LLM service."""
    global _llm_service
    _llm_service = LLMService()
    logger.info("LLM Service initialized")
    return _llm_service
