-- VITAL Agent-Avatar Mapping
-- Generated: 2025-11-24T19:51:43.336Z
-- Total Agents: 10
-- Algorithm: Multi-factor scoring (Tier 30%, Domain 25%, Persona 20%, Tenant 15%, Visual 10%)
--
-- DO NOT RUN THIS DIRECTLY IN PRODUCTION WITHOUT REVIEW
-- This is a suggestion-based mapping that requires manual validation

BEGIN;


-- Acronym Expander (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '7fbbc217-3816-4260-aa57-1a9788781a5f';

-- AE Term Detector (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '14b50cf7-78d8-4acd-a3af-f22efaa843f1';

-- Bullet Point Extractor (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'a5cc0e3c-07dc-423d-8a38-b7fc4be2e1ff';

-- Character Counter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd0e82f0d-9a51-46d5-bacd-5de23494ef53';

-- Citation Finder (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '83f3dfce-54ed-40c8-b3c8-09df1c6eb8ff';

-- Claim Validator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd51ef9a4-60cd-4585-bbec-325da10c483f';

-- ClinicalTrials.gov Searcher (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'f8c8fca7-c4cb-4aa4-b56d-bf3056db43aa';

-- Cochrane Searcher (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'f7e8d207-8076-41d1-aaa9-82629d232627';

-- Contract Modeling Tool (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '0acc9240-f878-40de-a14e-20305332cad8';

-- Coverage Gap Analyzer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '185bd1ed-a3ef-4c70-bee3-e41f8cf2ea9c';


COMMIT;

-- Summary Statistics
-- Total agents updated: 10
-- Average score: 0.45
-- High confidence (score >= 0.8): 0
-- Medium confidence (0.6 <= score < 0.8): 0
-- Low confidence (score < 0.6): 10
