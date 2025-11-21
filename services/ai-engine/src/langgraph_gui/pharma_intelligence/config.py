"""
Configuration management for Pharma Intelligence System

Handles environment variables, API keys, and system settings.
"""

import os
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator


# Load environment variables
load_dotenv()


class APIConfig(BaseModel):
    """API keys and credentials configuration."""
    
    openai_api_key: str = Field(..., env='OPENAI_API_KEY')
    anthropic_api_key: str = Field(..., env='ANTHROPIC_API_KEY')
    pinecone_api_key: str = Field(..., env='PINECONE_API_KEY')
    pinecone_index_name: str = Field(default='pharma-intelligence', env='PINECONE_INDEX_NAME')
    ncbi_email: str = Field(..., env='NCBI_EMAIL')
    
    # Optional
    serpapi_key: Optional[str] = Field(None, env='SERPAPI_KEY')
    brave_api_key: Optional[str] = Field(None, env='BRAVE_API_KEY')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


class SystemConfig(BaseModel):
    """System-level configuration."""
    
    max_iterations: int = Field(default=2, env='MAX_ITERATIONS')
    log_level: str = Field(default='INFO', env='LOG_LEVEL')
    timeout: int = Field(default=300, env='TIMEOUT')
    
    # Tool settings
    max_results_per_tool: int = Field(default=10, env='MAX_RESULTS_PER_TOOL')
    
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


def get_api_config() -> APIConfig:
    """Get API configuration from environment variables."""
    return APIConfig(
        openai_api_key=os.getenv('OPENAI_API_KEY', ''),
        anthropic_api_key=os.getenv('ANTHROPIC_API_KEY', ''),
        pinecone_api_key=os.getenv('PINECONE_API_KEY', ''),
        pinecone_index_name=os.getenv('PINECONE_INDEX_NAME', 'pharma-intelligence'),
        ncbi_email=os.getenv('NCBI_EMAIL', ''),
        serpapi_key=os.getenv('SERPAPI_KEY'),
        brave_api_key=os.getenv('BRAVE_API_KEY'),
    )


def get_system_config() -> SystemConfig:
    """Get system configuration from environment variables."""
    return SystemConfig(
        max_iterations=int(os.getenv('MAX_ITERATIONS', '2')),
        log_level=os.getenv('LOG_LEVEL', 'INFO'),
        timeout=int(os.getenv('TIMEOUT', '300')),
        max_results_per_tool=int(os.getenv('MAX_RESULTS_PER_TOOL', '10')),
    )


# Global configuration instances
api_config = get_api_config()
system_config = get_system_config()

