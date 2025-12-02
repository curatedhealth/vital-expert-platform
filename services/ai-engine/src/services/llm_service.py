"""
LLM service for VITAL AI Engine

Provides a simple async `generate` interface used by LangGraph workflows.
Backed by the OpenAI async client and configured via OPENAI_API_KEY.
"""

from typing import Optional
import os
import structlog

from openai import AsyncOpenAI

logger = structlog.get_logger()


class LLMService:
    """
    Thin wrapper around AsyncOpenAI with a simple `generate` method.

    This mirrors the SimpleLLMService pattern used in ask_expert.py but
    exposes a reusable service for workflows.
    """

    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning(
                "LLMService initialized without OPENAI_API_KEY – calls will fail until configured"
            )
            self.client = None
            return

        # Some macOS Python installations set SSL_CERT_FILE/REQUESTS_CA_BUNDLE
        # to a path that no longer exists, causing httpx/OpenAI to raise
        # FileNotFoundError when creating the underlying HTTP client.
        # We temporarily clear those env vars while constructing AsyncOpenAI
        # so that a bad local cert path does not break the whole backend.
        old_ssl = os.environ.pop("SSL_CERT_FILE", None)
        old_req = os.environ.pop("REQUESTS_CA_BUNDLE", None)

        try:
            self.client = AsyncOpenAI(api_key=api_key)
        except FileNotFoundError as e:
            logger.error(
                "llm_service.ssl_cert_file_not_found",
                error=str(e),
            )
            self.client = None
        except Exception as e:
            logger.error("llm_service.client_init_failed", error=str(e))
            self.client = None
        finally:
            if old_ssl is not None:
                os.environ["SSL_CERT_FILE"] = old_ssl
            if old_req is not None:
                os.environ["REQUESTS_CA_BUNDLE"] = old_req

    async def generate(
        self,
        prompt: str,
        model: str = "gpt-4o-mini",
        temperature: float = 0.3,
        max_tokens: int = 1500,
    ) -> str:
        """
        Generate a completion for the given prompt.

        Args:
            prompt: Prompt text to send to the model.
            model: OpenAI model name (defaults to a fast, cost-efficient model).
            temperature: Sampling temperature.
            max_tokens: Maximum tokens in the response.
        """
        if not self.client:
            raise RuntimeError(
                "LLMService is not configured – missing OPENAI_API_KEY or HTTP client initialization failed"
            )

        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error("llm_service.generate_failed", error=str(e))
            raise


