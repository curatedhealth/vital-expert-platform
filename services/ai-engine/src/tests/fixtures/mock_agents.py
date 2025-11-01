"""Mock agent configurations for testing"""

MOCK_REGULATORY_AGENT = {
    "id": "agent_reg_001",
    "name": "FDA Regulatory Expert",
    "type": "regulatory_expert",
    "tier": 1,
    "specialties": ["fda_regulatory", "ema_regulatory", "ich_guidelines"],
    "status": "active",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01T00:00:00Z"
}

MOCK_MEDICAL_AGENT = {
    "id": "agent_med_002",
    "name": "Medical Specialist",
    "type": "medical_specialist",
    "tier": 1,
    "specialties": ["clinical_research", "medical_writing"],
    "status": "active",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01T00:00:00Z"
}

MOCK_CLINICAL_AGENT = {
    "id": "agent_clin_003",
    "name": "Clinical Researcher",
    "type": "clinical_researcher",
    "tier": 2,
    "specialties": ["clinical_trial_design", "biostatistics"],
    "status": "active",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-01T00:00:00Z"
}

