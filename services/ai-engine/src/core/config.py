"""
Configuration management for VITAL Path AI Services
"""

import os
from typing import Optional
from pydantic import BaseSettings, Field
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # API Configuration
    api_title: str = "VITAL Path AI Services"
    api_version: str = "2.0.0"
    debug: bool = Field(default=False, env="DEBUG")

    # Supabase Configuration (optional to allow graceful startup)
    supabase_url: Optional[str] = Field(default=None, env="SUPABASE_URL")
    supabase_anon_key: Optional[str] = Field(default=None, env="SUPABASE_ANON_KEY")
    supabase_service_role_key: Optional[str] = Field(default=None, env="SUPABASE_SERVICE_ROLE_KEY")

    # Database Configuration (optional to allow graceful startup)
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")

    # OpenAI Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4-turbo-preview", env="OPENAI_MODEL")
    openai_embedding_model: str = Field(default="text-embedding-3-large", env="OPENAI_EMBEDDING_MODEL")
    
    # HuggingFace Configuration
    huggingface_api_key: Optional[str] = Field(default=None, env="HUGGINGFACE_API_KEY")
    hf_token: Optional[str] = Field(default=None, env="HF_TOKEN")  # Alternative HuggingFace token
    embedding_provider: str = Field(default="openai", env="EMBEDDING_PROVIDER")  # 'openai' or 'huggingface'
    huggingface_embedding_model: str = Field(default="bge-base-en-v1.5", env="HUGGINGFACE_EMBEDDING_MODEL")
    use_huggingface_api: bool = Field(default=False, env="USE_HUGGINGFACE_API")  # Use API vs local model

    # Google/Gemini Configuration
    google_api_key: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")
    gemini_api_key: Optional[str] = Field(default=None, env="GEMINI_API_KEY")

    # Anthropic Configuration
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")

    # Tavily Configuration (Web Search)
    tavily_api_key: Optional[str] = Field(default=None, env="TAVILY_API_KEY")

    # Vector Database Configuration
    vector_dimension: int = Field(default=1536, env="VECTOR_DIMENSION")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    max_search_results: int = Field(default=10, env="MAX_SEARCH_RESULTS")
    
    # Pinecone Configuration
    pinecone_api_key: Optional[str] = Field(default=None, env="PINECONE_API_KEY")
    pinecone_index_name: str = Field(default="vital-knowledge", env="PINECONE_INDEX_NAME")
    pinecone_environment: Optional[str] = Field(default=None, env="PINECONE_ENVIRONMENT")

    # Redis Configuration (for caching and task queue)
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")

    # Monitoring Configuration
    prometheus_port: int = Field(default=9090, env="PROMETHEUS_PORT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    # Medical AI Configuration
    medical_accuracy_threshold: float = Field(default=0.95, env="MEDICAL_ACCURACY_THRESHOLD")
    pharma_protocol_enabled: bool = Field(default=True, env="PHARMA_PROTOCOL_ENABLED")
    verify_protocol_enabled: bool = Field(default=True, env="VERIFY_PROTOCOL_ENABLED")

    # Agent Configuration
    max_concurrent_agents: int = Field(default=10, env="MAX_CONCURRENT_AGENTS")
    agent_timeout_seconds: int = Field(default=300, env="AGENT_TIMEOUT_SECONDS")
    max_context_length: int = Field(default=16000, env="MAX_CONTEXT_LENGTH")

    # WebSocket Configuration
    websocket_heartbeat_interval: int = Field(default=30, env="WEBSOCKET_HEARTBEAT_INTERVAL")
    max_websocket_connections: int = Field(default=100, env="MAX_WEBSOCKET_CONNECTIONS")

    # Security Configuration
    cors_origins: list = Field(
        default=["http://localhost:3002", "http://localhost:3001"],
        env="CORS_ORIGINS"
    )
    api_key_header: str = Field(default="X-API-Key", env="API_KEY_HEADER")

    # Healthcare Compliance
    hipaa_compliance_enabled: bool = Field(default=True, env="HIPAA_COMPLIANCE_ENABLED")
    fda_21cfr11_enabled: bool = Field(default=True, env="FDA_21CFR11_ENABLED")
    audit_trail_enabled: bool = Field(default=True, env="AUDIT_TRAIL_ENABLED")

    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(default=100, env="RATE_LIMIT_RPM")
    rate_limit_tokens_per_minute: int = Field(default=100000, env="RATE_LIMIT_TPM")

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings"""
    return Settings()

# Medical specialties configuration
MEDICAL_SPECIALTIES = {
    "regulatory_affairs": {
        "name": "Regulatory Affairs",
        "description": "FDA, EMA, and global regulatory guidance",
        "accuracy_threshold": 0.98,
        "required_protocols": ["PHARMA", "VERIFY"]
    },
    "clinical_research": {
        "name": "Clinical Research",
        "description": "Clinical trial design and GCP compliance",
        "accuracy_threshold": 0.97,
        "required_protocols": ["VERIFY"]
    },
    "medical_writing": {
        "name": "Medical Writing",
        "description": "Scientific communication and documentation",
        "accuracy_threshold": 0.95,
        "required_protocols": ["VERIFY"]
    },
    "pharmacovigilance": {
        "name": "Pharmacovigilance",
        "description": "Drug safety monitoring and adverse event reporting",
        "accuracy_threshold": 0.98,
        "required_protocols": ["PHARMA", "VERIFY"]
    },
    "medical_affairs": {
        "name": "Medical Affairs",
        "description": "Medical strategy and scientific engagement",
        "accuracy_threshold": 0.96,
        "required_protocols": ["VERIFY"]
    },
    "quality_assurance": {
        "name": "Quality Assurance",
        "description": "GMP, GCP, and quality systems",
        "accuracy_threshold": 0.98,
        "required_protocols": ["PHARMA", "VERIFY"]
    }
}

# Agent types configuration
AGENT_TYPES = {
    "regulatory": {
        "models": ["gpt-4-turbo-preview", "claude-3-opus"],
        "temperature": 0.1,
        "max_tokens": 4000,
        "specialties": ["regulatory_affairs", "quality_assurance"]
    },
    "clinical": {
        "models": ["gpt-4-turbo-preview", "claude-3-opus"],
        "temperature": 0.2,
        "max_tokens": 4000,
        "specialties": ["clinical_research", "medical_affairs"]
    },
    "literature": {
        "models": ["gpt-4-turbo-preview"],
        "temperature": 0.1,
        "max_tokens": 6000,
        "specialties": ["medical_writing", "clinical_research"]
    },
    "safety": {
        "models": ["gpt-4-turbo-preview"],
        "temperature": 0.05,
        "max_tokens": 4000,
        "specialties": ["pharmacovigilance", "regulatory_affairs"]
    }
}

# Compliance protocols
PHARMA_PROTOCOL = {
    "purpose": "Define the medical/clinical purpose and patient outcomes focus",
    "hypothesis": "Generate evidence-based hypotheses for clinical questions",
    "audience": "Format responses for healthcare professionals (clinicians/regulators)",
    "requirements": "Ensure compliance with applicable medical regulations",
    "metrics": "Maintain medical accuracy >95% with proper evidence grading",
    "actions": "Provide actionable medical insights with clear next steps"
}

VERIFY_PROTOCOL = {
    "validate": "Cross-reference all medical claims with authoritative sources",
    "evidence": "Require evidence from peer-reviewed sources (Impact Factor >3.0)",
    "request": "When uncertain, request additional clinical context",
    "identify": "Clearly identify limitations and areas requiring expert review",
    "fact_check": "Verify all medical statistics and clinical data",
    "yield": "Provide confidence scores for medical recommendations"
}