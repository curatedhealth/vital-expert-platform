"""
Request models for VITAL Path AI Services
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AgentQueryRequest(BaseModel):
    """Request model for agent queries"""
    agent_id: Optional[str] = Field(None, description="Specific agent ID to use")
    agent_type: str = Field(..., description="Type of agent (regulatory, clinical, literature, safety)")
    query: str = Field(..., min_length=10, max_length=2000, description="User query")

    # User context
    user_id: Optional[str] = Field(None, description="User ID for audit trail")
    organization_id: Optional[str] = Field(None, description="Organization ID")

    # Medical context
    medical_specialty: Optional[str] = Field(None, description="Medical specialty focus")
    phase: Optional[str] = Field(None, description="Regulatory phase (vision, integrate, test, activate, learn)")

    # Query configuration
    max_context_docs: Optional[int] = Field(5, ge=0, le=20, description="Maximum context documents to retrieve")
    similarity_threshold: Optional[float] = Field(0.7, ge=0.1, le=1.0, description="Similarity threshold for RAG")
    include_citations: bool = Field(True, description="Include citations in response")

    # Compliance requirements
    pharma_protocol_required: bool = Field(False, description="Require PHARMA protocol compliance")
    verify_protocol_required: bool = Field(True, description="Require VERIFY protocol compliance")
    hipaa_compliant: bool = Field(True, description="Ensure HIPAA compliance")

    # Response preferences
    response_format: str = Field("detailed", description="Response format (detailed, summary, structured)")
    include_confidence_scores: bool = Field(True, description="Include confidence scores")
    include_medical_context: bool = Field(True, description="Include medical context metadata")

class RAGSearchRequest(BaseModel):
    """Request model for RAG searches"""
    query: str = Field(..., min_length=3, max_length=1000, description="Search query")

    # Filters
    filters: Optional[Dict[str, Any]] = Field(None, description="Search filters")
    medical_specialty: Optional[str] = Field(None, description="Medical specialty filter")
    document_type: Optional[str] = Field(None, description="Document type filter")
    phase: Optional[str] = Field(None, description="Regulatory phase filter")
    organization_id: Optional[str] = Field(None, description="Organization filter")

    # Search parameters
    max_results: int = Field(10, ge=1, le=50, description="Maximum number of results")
    similarity_threshold: float = Field(0.7, ge=0.1, le=1.0, description="Similarity threshold")
    include_metadata: bool = Field(True, description="Include document metadata")
    include_medical_context: bool = Field(True, description="Include medical context")

    # Response preferences
    rerank_results: bool = Field(True, description="Apply medical relevance re-ranking")
    include_snippets: bool = Field(True, description="Include content snippets")

class AgentCreationRequest(BaseModel):
    """Request model for creating new agents"""
    name: str = Field(..., min_length=3, max_length=100, description="Agent name")
    agent_type: str = Field(..., description="Agent type")
    medical_specialty: str = Field(..., description="Medical specialty")

    # Agent configuration
    system_prompt: Optional[str] = Field(None, description="Custom system prompt")
    capabilities: List[Dict[str, Any]] = Field(..., description="Agent capabilities")
    tools: Optional[List[str]] = Field(None, description="Available tools")

    # Model configuration
    model: Optional[str] = Field(None, description="LLM model to use")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: Optional[int] = Field(None, ge=100, le=8000, description="Maximum tokens")

    # Compliance settings
    pharma_protocol_required: bool = Field(False, description="Require PHARMA protocol")
    verify_protocol_required: bool = Field(True, description="Require VERIFY protocol")

    # Metadata
    created_by: str = Field(..., description="User who created the agent")
    organization_id: str = Field(..., description="Organization ID")
    description: Optional[str] = Field(None, description="Agent description")
    tags: Optional[List[str]] = Field(None, description="Agent tags")

class PromptGenerationRequest(BaseModel):
    """Request model for system prompt generation"""
    agent_id: Optional[str] = Field(None, description="Target agent ID")

    # Capabilities and competencies
    selected_capabilities: List[Dict[str, Any]] = Field(..., description="Selected capabilities")
    competency_selection: Optional[Dict[str, List[str]]] = Field(None, description="Competency selection")
    tools: Optional[List[str]] = Field(None, description="Available tools")

    # Medical context
    medical_context: "MedicalContext" = Field(..., description="Medical context")

    # Compliance requirements
    pharma_protocol_required: bool = Field(False, description="Include PHARMA protocol")
    verify_protocol_required: bool = Field(True, description="Include VERIFY protocol")
    include_medical_disclaimers: bool = Field(True, description="Include medical disclaimers")

    # Generation preferences
    include_examples: bool = Field(False, description="Include usage examples")
    include_constraints: bool = Field(True, description="Include response constraints")
    target_accuracy: float = Field(0.95, ge=0.8, le=1.0, description="Target accuracy threshold")

class MedicalContext(BaseModel):
    """Medical context for requests"""
    medical_specialty: str = Field(..., description="Medical specialty")
    business_function: str = Field(..., description="Business function")
    role: str = Field(..., description="User role")
    focus_area: Optional[str] = Field(None, description="Focus area")
    therapeutic_areas: Optional[List[str]] = Field(None, description="Therapeutic areas")
    regulatory_regions: Optional[List[str]] = Field(None, description="Regulatory regions")

class DocumentUploadRequest(BaseModel):
    """Request model for document uploads"""
    title: str = Field(..., min_length=3, max_length=200, description="Document title")
    content: str = Field(..., min_length=100, description="Document content")

    # Metadata
    document_type: str = Field(..., description="Document type")
    medical_specialty: str = Field(..., description="Medical specialty")
    phase: Optional[str] = Field(None, description="Regulatory phase")

    # Source information
    source: Optional[str] = Field(None, description="Document source")
    authors: Optional[str] = Field(None, description="Document authors")
    publication_year: Optional[int] = Field(None, ge=1900, le=2030, description="Publication year")
    journal: Optional[str] = Field(None, description="Journal name")
    doi: Optional[str] = Field(None, description="DOI")
    url: Optional[str] = Field(None, description="Source URL")

    # Classification
    peer_reviewed: bool = Field(False, description="Is peer reviewed")
    impact_factor: Optional[float] = Field(None, ge=0.0, description="Journal impact factor")
    study_type: Optional[str] = Field(None, description="Study type")
    evidence_level: Optional[str] = Field(None, description="Evidence level")

    # Organization context
    organization_id: str = Field(..., description="Organization ID")
    uploaded_by: str = Field(..., description="User who uploaded")

    # Processing options
    auto_chunk: bool = Field(True, description="Automatically chunk document")
    extract_entities: bool = Field(True, description="Extract medical entities")
    generate_summary: bool = Field(True, description="Generate document summary")

class BatchUploadRequest(BaseModel):
    """Request model for batch document uploads"""
    documents: List[DocumentUploadRequest] = Field(..., min_items=1, max_items=100, description="Documents to upload")
    organization_id: str = Field(..., description="Organization ID")
    uploaded_by: str = Field(..., description="User performing batch upload")

    # Batch processing options
    parallel_processing: bool = Field(True, description="Process documents in parallel")
    chunk_size: int = Field(10, ge=1, le=50, description="Batch chunk size")
    skip_duplicates: bool = Field(True, description="Skip duplicate documents")

class AgentTrainingRequest(BaseModel):
    """Request model for agent training/fine-tuning"""
    agent_id: str = Field(..., description="Agent ID to train")
    training_data: List[Dict[str, Any]] = Field(..., description="Training examples")

    # Training configuration
    training_type: str = Field("fine_tune", description="Training type (fine_tune, few_shot, rag_update)")
    epochs: Optional[int] = Field(None, ge=1, le=20, description="Training epochs")
    learning_rate: Optional[float] = Field(None, ge=0.0001, le=0.1, description="Learning rate")

    # Validation
    validation_split: float = Field(0.2, ge=0.1, le=0.5, description="Validation split ratio")
    target_accuracy: float = Field(0.95, ge=0.8, le=1.0, description="Target accuracy")

    # Metadata
    training_description: Optional[str] = Field(None, description="Training description")
    initiated_by: str = Field(..., description="User who initiated training")

# Update forward references
PromptGenerationRequest.model_rebuild()
