# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: []
"""
VITAL Path - Configuration Management

Centralized configuration with environment-based settings.
Supports development, staging, and production environments.
"""

import os
from typing import Optional, List
from dataclasses import dataclass, field
from functools import lru_cache
from enum import Enum


class Environment(str, Enum):
    """Application environments."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


@dataclass
class DatabaseConfig:
    """Database configuration."""
    url: str = ""
    pool_size: int = 10
    max_overflow: int = 20
    pool_timeout: int = 30
    echo: bool = False
    
    @classmethod
    def from_env(cls, env: Environment) -> "DatabaseConfig":
        """Create config from environment variables."""
        return cls(
            url=os.getenv("DATABASE_URL", ""),
            pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
            max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
            pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "30")),
            echo=env == Environment.DEVELOPMENT,
        )


@dataclass
class RedisConfig:
    """Redis configuration for caching and Celery."""
    url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    cache_ttl: int = 3600
    
    @classmethod
    def from_env(cls) -> "RedisConfig":
        """Create config from environment variables."""
        base_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        return cls(
            url=f"{base_url}/0",
            celery_broker_url=os.getenv("CELERY_BROKER_URL", f"{base_url}/1"),
            celery_result_backend=os.getenv("CELERY_RESULT_BACKEND", f"{base_url}/2"),
            cache_ttl=int(os.getenv("CACHE_TTL", "3600")),
        )


@dataclass
class SupabaseConfig:
    """Supabase configuration."""
    url: str = ""
    anon_key: str = ""
    service_role_key: str = ""
    jwt_secret: str = ""
    
    @classmethod
    def from_env(cls) -> "SupabaseConfig":
        """Create config from environment variables."""
        return cls(
            url=os.getenv("SUPABASE_URL", ""),
            anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
            service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
            jwt_secret=os.getenv("SUPABASE_JWT_SECRET", ""),
        )


@dataclass
class LLMConfig:
    """LLM provider configuration."""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    default_model: str = "gpt-4o"
    default_temperature: float = 0.7
    max_tokens: int = 4096
    request_timeout: int = 120
    
    @classmethod
    def from_env(cls) -> "LLMConfig":
        """Create config from environment variables."""
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
            default_model=os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
            default_temperature=float(os.getenv("DEFAULT_LLM_TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("DEFAULT_LLM_MAX_TOKENS", "4096")),
            request_timeout=int(os.getenv("LLM_REQUEST_TIMEOUT", "120")),
        )


@dataclass
class SecurityConfig:
    """Security configuration."""
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24
    allowed_origins: List[str] = field(default_factory=list)
    rate_limit_per_minute: int = 60
    
    @classmethod
    def from_env(cls, env: Environment) -> "SecurityConfig":
        """Create config from environment variables."""
        # Default origins based on environment
        default_origins = {
            Environment.DEVELOPMENT: ["http://localhost:3000", "http://localhost:8000"],
            Environment.STAGING: ["https://staging.vital.ai"],
            Environment.PRODUCTION: ["https://app.vital.ai", "https://vital.ai"],
            Environment.TESTING: ["http://localhost:3000"],
        }
        
        origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
        if not origins or origins == [""]:
            origins = default_origins.get(env, [])
        
        # SECURITY: Require JWT_SECRET in production - no insecure defaults
        jwt_secret = os.getenv("JWT_SECRET")
        if not jwt_secret:
            if env == "production":
                raise RuntimeError("JWT_SECRET environment variable is required in production")
            # Generate random secret for development only
            import secrets
            jwt_secret = f"dev-only-{secrets.token_hex(32)}"

        return cls(
            jwt_secret=jwt_secret,
            jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
            jwt_expiry_hours=int(os.getenv("JWT_EXPIRY_HOURS", "24")),
            allowed_origins=origins,
            rate_limit_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "60")),
        )


@dataclass
class BudgetConfig:
    """Token budget configuration."""
    default_monthly_limit: int = 1_000_000
    warning_threshold_percent: float = 80.0
    hard_limit_enabled: bool = True

    @classmethod
    def from_env(cls) -> "BudgetConfig":
        """Create config from environment variables."""
        return cls(
            default_monthly_limit=int(os.getenv("DEFAULT_MONTHLY_TOKEN_LIMIT", "1000000")),
            warning_threshold_percent=float(os.getenv("BUDGET_WARNING_THRESHOLD", "80.0")),
            hard_limit_enabled=os.getenv("BUDGET_HARD_LIMIT_ENABLED", "true").lower() == "true",
        )


@dataclass
class WorkflowConfig:
    """LangGraph workflow configuration - centralizes previously hardcoded values."""
    # Confidence thresholds
    default_response_confidence: float = 0.85
    min_confidence_threshold: float = 0.7
    high_confidence_threshold: float = 0.9

    # Budget defaults for autonomous modes
    default_budget_remaining: float = 100.0
    default_estimated_cost: float = 1.0
    budget_warning_threshold: float = 20.0

    # HITL (Human-in-the-Loop) settings
    hitl_auto_approve_in_dev: bool = True  # Auto-approve plans in development
    hitl_timeout_seconds: int = 300  # 5 minutes to respond to HITL checkpoint

    # Quality gates
    quality_gate_enabled: bool = True
    min_citation_count: int = 1
    max_reflection_rounds: int = 3

    @classmethod
    def from_env(cls, env: Environment) -> "WorkflowConfig":
        """Create config from environment variables."""
        return cls(
            default_response_confidence=float(os.getenv("WORKFLOW_DEFAULT_CONFIDENCE", "0.85")),
            min_confidence_threshold=float(os.getenv("WORKFLOW_MIN_CONFIDENCE", "0.7")),
            high_confidence_threshold=float(os.getenv("WORKFLOW_HIGH_CONFIDENCE", "0.9")),
            default_budget_remaining=float(os.getenv("WORKFLOW_DEFAULT_BUDGET", "100.0")),
            default_estimated_cost=float(os.getenv("WORKFLOW_ESTIMATED_COST", "1.0")),
            budget_warning_threshold=float(os.getenv("WORKFLOW_BUDGET_WARNING", "20.0")),
            hitl_auto_approve_in_dev=env in (Environment.DEVELOPMENT, Environment.TESTING),
            hitl_timeout_seconds=int(os.getenv("WORKFLOW_HITL_TIMEOUT", "300")),
            quality_gate_enabled=os.getenv("WORKFLOW_QUALITY_GATE_ENABLED", "true").lower() == "true",
            min_citation_count=int(os.getenv("WORKFLOW_MIN_CITATIONS", "1")),
            max_reflection_rounds=int(os.getenv("WORKFLOW_MAX_REFLECTIONS", "3")),
        )


@dataclass
class WorkerConfig:
    """Celery worker configuration."""
    concurrency: int = 4
    prefetch_multiplier: int = 4
    max_tasks_per_child: int = 100
    task_soft_time_limit: int = 540
    task_time_limit: int = 600
    
    @classmethod
    def from_env(cls, env: Environment) -> "WorkerConfig":
        """Create config from environment variables."""
        # Scale concurrency based on environment
        default_concurrency = {
            Environment.DEVELOPMENT: 2,
            Environment.STAGING: 4,
            Environment.PRODUCTION: 8,
            Environment.TESTING: 1,
        }
        
        return cls(
            concurrency=int(os.getenv("WORKER_CONCURRENCY", str(default_concurrency.get(env, 4)))),
            prefetch_multiplier=int(os.getenv("WORKER_PREFETCH_MULTIPLIER", "4")),
            max_tasks_per_child=int(os.getenv("WORKER_MAX_TASKS_PER_CHILD", "100")),
            task_soft_time_limit=int(os.getenv("TASK_SOFT_TIME_LIMIT", "540")),
            task_time_limit=int(os.getenv("TASK_TIME_LIMIT", "600")),
        )


@dataclass
class ObservabilityConfig:
    """Observability configuration."""
    log_level: str = "INFO"
    json_logs: bool = False
    prometheus_enabled: bool = True
    prometheus_port: int = 9090
    tracing_enabled: bool = False
    tracing_endpoint: str = ""
    sentry_dsn: str = ""
    
    @classmethod
    def from_env(cls, env: Environment) -> "ObservabilityConfig":
        """Create config from environment variables."""
        return cls(
            log_level=os.getenv("LOG_LEVEL", "INFO" if env != Environment.DEVELOPMENT else "DEBUG"),
            json_logs=env in (Environment.STAGING, Environment.PRODUCTION),
            prometheus_enabled=os.getenv("PROMETHEUS_ENABLED", "true").lower() == "true",
            prometheus_port=int(os.getenv("PROMETHEUS_PORT", "9090")),
            tracing_enabled=os.getenv("TRACING_ENABLED", "false").lower() == "true",
            tracing_endpoint=os.getenv("TRACING_ENDPOINT", ""),
            sentry_dsn=os.getenv("SENTRY_DSN", ""),
        )


@dataclass
class AppConfig:
    """Main application configuration."""
    environment: Environment
    app_name: str
    app_version: str
    debug: bool
    host: str
    port: int
    
    # Sub-configurations
    database: DatabaseConfig
    redis: RedisConfig
    supabase: SupabaseConfig
    llm: LLMConfig
    security: SecurityConfig
    budget: BudgetConfig
    workflow: WorkflowConfig
    worker: WorkerConfig
    observability: ObservabilityConfig
    
    # Platform-specific
    platform_organization_id: str = ""
    
    @classmethod
    def from_env(cls) -> "AppConfig":
        """Create complete config from environment variables."""
        env_str = os.getenv("ENVIRONMENT", "development").lower()
        try:
            env = Environment(env_str)
        except ValueError:
            env = Environment.DEVELOPMENT
        
        return cls(
            environment=env,
            app_name=os.getenv("APP_NAME", "vital-ai-engine"),
            app_version=os.getenv("APP_VERSION", "3.7.0"),
            debug=env == Environment.DEVELOPMENT,
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "8000")),
            database=DatabaseConfig.from_env(env),
            redis=RedisConfig.from_env(),
            supabase=SupabaseConfig.from_env(),
            llm=LLMConfig.from_env(),
            security=SecurityConfig.from_env(env),
            budget=BudgetConfig.from_env(),
            workflow=WorkflowConfig.from_env(env),
            worker=WorkerConfig.from_env(env),
            observability=ObservabilityConfig.from_env(env),
            platform_organization_id=os.getenv(
                "PLATFORM_ORGANIZATION_ID",
                "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"
            ),
        )
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == Environment.PRODUCTION
    
    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == Environment.DEVELOPMENT
    
    def validate(self) -> List[str]:
        """Validate configuration and return list of errors."""
        errors = []
        
        # Required in production
        if self.is_production:
            if not self.supabase.url:
                errors.append("SUPABASE_URL is required in production")
            if not self.supabase.service_role_key:
                errors.append("SUPABASE_SERVICE_ROLE_KEY is required in production")
            if not self.llm.openai_api_key and not self.llm.anthropic_api_key:
                errors.append("At least one LLM API key is required in production")
            if self.security.jwt_secret == "dev-secret-change-in-prod":
                errors.append("JWT_SECRET must be changed from default in production")
        
        return errors


@lru_cache()
def get_config() -> AppConfig:
    """
    Get application configuration (cached).
    
    Returns:
        AppConfig instance
    """
    config = AppConfig.from_env()
    
    # Validate and warn
    errors = config.validate()
    if errors:
        import warnings
        for error in errors:
            warnings.warn(f"Configuration warning: {error}")
    
    return config


# =============================================================================
# BACKWARDS COMPATIBILITY: Settings class for legacy code
# =============================================================================

@dataclass
class Settings:
    """
    Backwards-compatible Settings class.
    
    This class provides the flat attribute access pattern that legacy code expects
    (e.g., settings.openai_api_key) while using AppConfig under the hood.
    
    DEPRECATED: New code should use get_config() instead.
    """
    # LLM Settings
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-large"
    embedding_provider: str = "openai"
    huggingface_api_key: str = ""
    huggingface_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    use_huggingface_api: bool = False
    
    # Supabase Settings
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    
    # Database Settings
    database_url: str = ""
    vector_dimension: int = 1536
    
    # Redis Settings
    redis_url: str = ""

    # Neo4j Settings (GraphRAG)
    neo4j_uri: str = ""
    neo4j_username: str = ""
    neo4j_password: str = ""
    neo4j_database: str = "neo4j"

    # Elasticsearch Settings (GraphRAG)
    elasticsearch_hosts: str = ""
    elasticsearch_api_key: str = ""
    elasticsearch_index: str = "vital-medical-docs"

    # Security Settings
    cors_origins: str = "http://localhost:3000,http://localhost:8000"
    
    # Feature Flags
    verify_protocol_enabled: bool = True
    pharma_protocol_enabled: bool = True
    
    # Defaults
    default_tenant_id: str = "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"
    
    @classmethod
    def from_env(cls) -> "Settings":
        """Create Settings from environment variables."""
        return cls(
            # LLM
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
            openai_model=os.getenv("OPENAI_MODEL", os.getenv("DEFAULT_LLM_MODEL", "gpt-4o")),
            openai_embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large"),
            embedding_provider=os.getenv("EMBEDDING_PROVIDER", "openai"),
            huggingface_api_key=os.getenv("HUGGINGFACE_API_KEY", ""),
            huggingface_embedding_model=os.getenv("HUGGINGFACE_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            use_huggingface_api=os.getenv("USE_HUGGINGFACE_API", "false").lower() == "true",
            
            # Supabase
            supabase_url=os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")),
            supabase_anon_key=os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")),
            supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
            
            # Database
            database_url=os.getenv("DATABASE_URL", ""),
            vector_dimension=int(os.getenv("VECTOR_DIMENSION", "1536")),
            
            # Redis (supports both standard REDIS_URL and Upstash REST URL)
            redis_url=os.getenv("REDIS_URL", os.getenv("UPSTASH_REDIS_REST_URL", "")),

            # Neo4j (GraphRAG)
            neo4j_uri=os.getenv("NEO4J_URI", ""),
            neo4j_username=os.getenv("NEO4J_USERNAME", os.getenv("NEO4J_USER", "")),
            neo4j_password=os.getenv("NEO4J_PASSWORD", ""),
            neo4j_database=os.getenv("NEO4J_DATABASE", "neo4j"),

            # Elasticsearch (GraphRAG)
            elasticsearch_hosts=os.getenv("ELASTICSEARCH_HOSTS", ""),
            elasticsearch_api_key=os.getenv("ELASTICSEARCH_API_KEY", ""),
            elasticsearch_index=os.getenv("ELASTICSEARCH_INDEX", "vital-medical-docs"),

            # Security
            cors_origins=os.getenv("CORS_ORIGINS", os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000")),
            
            # Feature Flags
            verify_protocol_enabled=os.getenv("VERIFY_PROTOCOL_ENABLED", "true").lower() == "true",
            pharma_protocol_enabled=os.getenv("PHARMA_PROTOCOL_ENABLED", "true").lower() == "true",
            
            # Defaults
            default_tenant_id=os.getenv("DEFAULT_TENANT_ID", os.getenv("PLATFORM_ORGANIZATION_ID", "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244")),
        )


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings (cached).
    
    BACKWARDS COMPATIBILITY: This function provides the legacy flat settings
    object that many files expect. New code should use get_config() instead.
    
    Returns:
        Settings instance with flat attribute access
    """
    return Settings.from_env()


# Legacy constants for backwards compatibility
AGENT_TYPES = ["regulatory", "clinical", "safety", "medical_affairs", "commercial", "market_access"]
PHARMA_PROTOCOL = os.getenv("PHARMA_PROTOCOL_ENABLED", "true").lower() == "true"
VERIFY_PROTOCOL = os.getenv("VERIFY_PROTOCOL_ENABLED", "true").lower() == "true"
MEDICAL_SPECIALTIES = [
    "cardiology", "oncology", "neurology", "immunology", "endocrinology",
    "gastroenterology", "pulmonology", "nephrology", "rheumatology", "hematology"
]


# Export convenience functions
def get_env() -> Environment:
    """Get current environment."""
    return get_config().environment


def is_production() -> bool:
    """Check if running in production."""
    return get_config().is_production


def is_development() -> bool:
    """Check if running in development."""
    return get_config().is_development


__all__ = [
    # New config classes
    "Environment",
    "AppConfig",
    "DatabaseConfig",
    "RedisConfig",
    "SupabaseConfig",
    "LLMConfig",
    "SecurityConfig",
    "BudgetConfig",
    "WorkerConfig",
    "ObservabilityConfig",
    "get_config",
    "get_env",
    "is_production",
    "is_development",
    # Backwards compatibility
    "Settings",
    "get_settings",
    "AGENT_TYPES",
    "PHARMA_PROTOCOL",
    "VERIFY_PROTOCOL",
    "MEDICAL_SPECIALTIES",
]
