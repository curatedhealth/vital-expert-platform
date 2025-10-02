"""
Response models for VITAL Path AI Services
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AgentQueryResponse(BaseModel):
    """Response model for agent queries"""
    agent_id: str = Field(..., description="Agent that processed the query")
    response: str = Field(..., description="Agent response")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence score")

    # Citations and sources
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Source citations")
    source_documents: Optional[int] = Field(None, description="Number of source documents used")

    # Medical context
    medical_context: Optional[Dict[str, Any]] = Field(None, description="Medical context metadata")
    compliance_protocols: Optional[List[str]] = Field(None, description="Applied compliance protocols")

    # Processing metadata
    processing_metadata: Dict[str, Any] = Field(default_factory=dict, description="Processing metadata")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

    # Structured data (for API integrations)
    structured_data: Optional[Dict[str, Any]] = Field(None, description="Structured response data")

class RAGSearchResponse(BaseModel):
    """Response model for RAG searches"""
    query: str = Field(..., description="Original search query")
    results: List[Dict[str, Any]] = Field(..., description="Search results")

    # Search metadata
    total_results: int = Field(..., description="Total number of results found")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    similarity_threshold: float = Field(..., description="Applied similarity threshold")

    # Context information
    context_summary: Dict[str, Any] = Field(default_factory=dict, description="Context summary")
    filters_applied: Optional[Dict[str, Any]] = Field(None, description="Applied filters")

    # Quality metrics
    average_confidence: Optional[float] = Field(None, description="Average confidence score")
    high_confidence_results: Optional[int] = Field(None, description="Number of high-confidence results")

class AgentCreationResponse(BaseModel):
    """Response model for agent creation"""
    agent_id: str = Field(..., description="Created agent ID")
    name: str = Field(..., description="Agent name")
    agent_type: str = Field(..., description="Agent type")
    status: str = Field(..., description="Agent status")

    # Configuration
    capabilities: List[Dict[str, Any]] = Field(..., description="Agent capabilities")
    model_config: Optional[Dict[str, Any]] = Field(None, description="Model configuration")

    # Metadata
    created_at: str = Field(..., description="Creation timestamp")
    validation_status: Optional[str] = Field(None, description="Validation status")

class PromptGenerationResponse(BaseModel):
    """Response model for prompt generation"""
    system_prompt: str = Field(..., description="Generated system prompt")
    metadata: Dict[str, Any] = Field(..., description="Generation metadata")

    # Validation information
    validation_required: bool = Field(..., description="Whether validation is required")
    estimated_accuracy: float = Field(..., description="Estimated accuracy")

    # Compliance information
    compliance_protocols: List[Optional[str]] = Field(..., description="Applied compliance protocols")
    medical_disclaimers_included: bool = Field(True, description="Medical disclaimers included")

    # Generation metrics
    token_count: Optional[int] = Field(None, description="Token count")
    generation_time_ms: Optional[float] = Field(None, description="Generation time")

class DocumentUploadResponse(BaseModel):
    """Response model for document uploads"""
    document_id: str = Field(..., description="Uploaded document ID")
    title: str = Field(..., description="Document title")
    status: str = Field(..., description="Upload status")

    # Processing results
    chunks_created: Optional[int] = Field(None, description="Number of chunks created")
    embeddings_generated: bool = Field(False, description="Embeddings generated")
    entities_extracted: Optional[int] = Field(None, description="Number of entities extracted")

    # Metadata
    upload_time_ms: float = Field(..., description="Upload processing time")
    file_size_bytes: Optional[int] = Field(None, description="File size in bytes")

    # Validation results
    validation_warnings: Optional[List[str]] = Field(None, description="Validation warnings")
    quality_score: Optional[float] = Field(None, description="Document quality score")

class BatchUploadResponse(BaseModel):
    """Response model for batch uploads"""
    batch_id: str = Field(..., description="Batch upload ID")
    total_documents: int = Field(..., description="Total documents in batch")
    successful_uploads: int = Field(..., description="Number of successful uploads")
    failed_uploads: int = Field(..., description="Number of failed uploads")

    # Processing details
    processing_time_ms: float = Field(..., description="Total processing time")
    documents: List[DocumentUploadResponse] = Field(..., description="Individual document results")

    # Error handling
    errors: Optional[List[Dict[str, Any]]] = Field(None, description="Upload errors")
    warnings: Optional[List[str]] = Field(None, description="Batch warnings")

class AgentMetricsResponse(BaseModel):
    """Response model for agent metrics"""
    agent_id: str = Field(..., description="Agent ID")
    metrics: Dict[str, Any] = Field(..., description="Agent metrics")

    # Performance metrics
    total_queries: int = Field(..., description="Total queries processed")
    average_confidence: float = Field(..., description="Average confidence score")
    average_response_time_ms: float = Field(..., description="Average response time")
    success_rate: float = Field(..., description="Success rate")

    # Usage metrics
    last_used: Optional[datetime] = Field(None, description="Last usage timestamp")
    usage_trend: Optional[str] = Field(None, description="Usage trend")

    # Quality metrics
    user_satisfaction: Optional[float] = Field(None, description="User satisfaction score")
    accuracy_score: Optional[float] = Field(None, description="Accuracy score")

class SystemStatusResponse(BaseModel):
    """Response model for system status"""
    status: str = Field(..., description="Overall system status")
    timestamp: datetime = Field(default_factory=datetime.now, description="Status timestamp")

    # Service status
    services: Dict[str, str] = Field(..., description="Individual service statuses")
    database_status: str = Field(..., description="Database connection status")
    vector_db_status: str = Field(..., description="Vector database status")

    # Performance metrics
    active_agents: int = Field(..., description="Number of active agents")
    total_queries_24h: Optional[int] = Field(None, description="Total queries in last 24 hours")
    average_response_time_ms: Optional[float] = Field(None, description="Average response time")

    # Resource usage
    memory_usage_mb: Optional[float] = Field(None, description="Memory usage in MB")
    cpu_usage_percent: Optional[float] = Field(None, description="CPU usage percentage")

class KnowledgeBaseStatsResponse(BaseModel):
    """Response model for knowledge base statistics"""
    total_documents: int = Field(..., description="Total documents in knowledge base")
    document_types: Dict[str, int] = Field(..., description="Document counts by type")
    medical_specialties: Dict[str, int] = Field(..., description="Document counts by specialty")

    # Quality metrics
    average_quality_score: Optional[float] = Field(None, description="Average document quality")
    peer_reviewed_percentage: Optional[float] = Field(None, description="Percentage of peer-reviewed docs")

    # Freshness metrics
    documents_last_30_days: int = Field(..., description="Documents added in last 30 days")
    oldest_document_date: Optional[str] = Field(None, description="Oldest document date")
    newest_document_date: Optional[str] = Field(None, description="Newest document date")

    # Vector metrics
    total_embeddings: int = Field(..., description="Total embeddings stored")
    embedding_model: str = Field(..., description="Embedding model used")
    vector_dimension: int = Field(..., description="Vector dimension")

class CitationResponse(BaseModel):
    """Response model for citations"""
    source: str = Field(..., description="Citation source")
    title: Optional[str] = Field(None, description="Document title")
    authors: Optional[str] = Field(None, description="Authors")
    publication_year: Optional[str] = Field(None, description="Publication year")
    journal: Optional[str] = Field(None, description="Journal name")
    doi: Optional[str] = Field(None, description="DOI")
    url: Optional[str] = Field(None, description="Source URL")

    # Quality indicators
    evidence_level: Optional[str] = Field(None, description="Evidence level")
    confidence_score: float = Field(..., description="Citation confidence score")
    peer_reviewed: Optional[bool] = Field(None, description="Is peer reviewed")
    impact_factor: Optional[float] = Field(None, description="Journal impact factor")

    # Context information
    relevant_quote: Optional[str] = Field(None, description="Relevant quote from source")
    page_number: Optional[int] = Field(None, description="Page number")
    section: Optional[str] = Field(None, description="Document section")

class ValidationResponse(BaseModel):
    """Response model for validation results"""
    is_valid: bool = Field(..., description="Validation result")
    validation_score: float = Field(..., description="Validation score")

    # Validation details
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")

    # Compliance checks
    hipaa_compliant: bool = Field(..., description="HIPAA compliance status")
    fda_21cfr11_compliant: bool = Field(..., description="FDA 21 CFR Part 11 compliance")
    medical_accuracy_score: Optional[float] = Field(None, description="Medical accuracy score")

    # Validation metadata
    validated_by: str = Field(..., description="Validation method or validator")
    validation_timestamp: datetime = Field(default_factory=datetime.now, description="Validation timestamp")

class ErrorResponse(BaseModel):
    """Response model for errors"""
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    details: Optional[str] = Field(None, description="Error details")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")

    # Context information
    request_id: Optional[str] = Field(None, description="Request ID")
    user_id: Optional[str] = Field(None, description="User ID")
    endpoint: Optional[str] = Field(None, description="API endpoint")

    # Suggestions
    suggestions: Optional[List[str]] = Field(None, description="Error resolution suggestions")
    documentation_url: Optional[str] = Field(None, description="Relevant documentation URL")

class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    type: str = Field(..., description="Message type")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.now, description="Message timestamp")

    # Connection metadata
    connection_id: Optional[str] = Field(None, description="WebSocket connection ID")
    user_id: Optional[str] = Field(None, description="User ID")
    agent_id: Optional[str] = Field(None, description="Agent ID")

    # Message handling
    requires_response: bool = Field(False, description="Whether message requires response")
    broadcast: bool = Field(False, description="Whether to broadcast to other connections")

class HealthCheckResponse(BaseModel):
    """Response model for health checks"""
    status: str = Field(..., description="Health status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: float = Field(..., description="Health check timestamp")

    # Detailed health information
    uptime_seconds: Optional[float] = Field(None, description="Service uptime in seconds")
    dependencies: Optional[Dict[str, str]] = Field(None, description="Dependency health status")

    # Performance indicators
    response_time_ms: Optional[float] = Field(None, description="Health check response time")
    memory_usage_mb: Optional[float] = Field(None, description="Current memory usage")
    active_connections: Optional[int] = Field(None, description="Active connections count")