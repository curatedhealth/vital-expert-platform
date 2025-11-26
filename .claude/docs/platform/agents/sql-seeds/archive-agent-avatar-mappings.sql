-- VITAL Agent-Avatar Mapping
-- Generated: 2025-11-24T20:56:09.809Z
-- Total Agents: 770
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

-- CSV Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '2bc53c76-5503-4281-89c4-397457285f0f';

-- Data Aggregator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '3f022b35-10cd-4172-9ee4-2c782ca1be02';

-- Data Filter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'dbfe5741-2dcd-4f43-a445-8bba12ea9591';

-- Data Sorter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '18cb53f8-3f0a-4855-99ee-5843a4804e14';

-- Data Transformer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '12826d4c-587c-4690-8335-703d2f302183';

-- Data Validator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'ee6bd75c-d6de-4b6f-9b60-8e09f88ca3fa';

-- Disclosure Statement Checker (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '483ddfc9-03a3-487b-864b-4f5f7ff863e1';

-- DOCX Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd3619999-ae38-4749-83e7-565a8b18ebfc';

-- DOI Resolver (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'ef77e871-8854-46e5-b8ac-c53a9b803f62';

-- Embase Searcher (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '694d1fe3-af02-418e-8896-0283b279048a';

-- Entity Extractor (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd73b3abf-f931-4e23-8700-cbe4908ed557';

-- Excel Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'e4c49157-eec9-4c73-96bb-7519aa0853bd';

-- File Converter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '8e412049-5486-47ae-aa37-b8c3605ee508';

-- Formulary Status Checker (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'e6a97c1c-9eb7-4503-97bf-4f9679072cea';

-- Google Scholar Searcher (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '734c83c8-0eaa-49d9-981c-58226b90c208';

-- Gross-to-Net Calculator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '96ad6749-3b6a-4e76-b10a-7bf7c44c1f37';

-- Heading Detector (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3ff50ce0-ec6e-4596-b438-5582322ef723';

-- HEOR Evidence Generator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '6451689e-37bf-4e89-826f-12a020ce0d55';

-- HTML Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3f7f1b15-a881-495d-bdd6-6dd8925aa8ad';

-- Image Extractor (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '6e48de80-9761-4e1c-ac62-b4e3907ffb4a';

-- Internal Database Searcher (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '85257b74-a8e8-40c2-b629-e09f8aed3b36';

-- JSON Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '8d5573c8-024f-46e6-b8c8-e9eeef658f6e';

-- Keyword Extractor (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '27f078ef-6baf-48b7-bf55-61f8e8454008';

-- Language Detector (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3a023cd1-ef39-460c-a9c0-5cf44f87262d';

-- Markdown Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '194264a5-047d-4f63-b8b6-30df049cdc78';

-- MLR Reference Checker (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '94135417-5474-4974-a460-0727d28e7a3b';

-- Off-Label Term Detector (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'db9f1171-e7c4-4c12-ba58-e11744aa7bb0';

-- Paragraph Formatter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '73d55ed7-2d87-41a0-8d93-49ce86c130d1';

-- Patient Assistance Eligibility Checker (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '4169b0bd-b110-468f-930b-342d062717ac';

-- Payer Policy Monitor (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '4f1e057a-bdd7-4ef0-9140-e18940960c1d';

-- PDF Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'ecacf82d-68e0-4c87-9d5b-ff14b7560692';

-- PowerPoint Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '222889ee-9d65-4b40-86bb-fb14c02b7e99';

-- Price Calculator Tool (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'd268100c-6041-4388-a575-461a4248772c';

-- Prior Authorization Validator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '989ade33-88ad-4a45-8c49-9129429cace5';

-- PubMed Searcher (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '1d1f2791-17d9-4fde-a5d2-4846a655f717';

-- Readability Scorer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '058e863f-b7dd-4d3a-93d4-a102a310a60d';

-- Regulatory Term Validator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'bb2c2e98-b45c-45da-837c-82f5a805e9c3';

-- Reimbursement Code Lookup (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'a153508f-6252-43c8-8e32-9bbd71a0b357';

-- Relationship Extractor (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '86fb0c63-19b7-452f-9c93-a3fa422dfb01';

-- Sentiment Analyzer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '369c8f19-2e82-48e0-816f-383fc95ab086';

-- Specialty Pharmacy Network Mapper (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '70a9a025-175e-4d93-97a5-6ef127d50751';

-- Table Generator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'c5154e83-c656-42f4-be21-cae037d7f1c8';

-- Table Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '5e229891-96e0-4f4e-acb8-51c6a11eafc8';

-- Text Cleaner (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '36cc8034-1320-43b6-8a57-216f317c75e5';

-- Text Merger (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0a1e79af-5e1c-4b01-bb46-305a84f5923a';

-- Text Similarity Calculator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ba1944c9-c442-4fbc-a723-b4dd9cec7312';

-- Text Splitter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7ac4a37b-10f6-4ee3-b236-3ef5b6d29b95';

-- Text Validator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '5987e72b-2665-42ec-9116-a4fc8ae9e4a2';

-- Topic Classifier (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '27806851-f2a8-49af-ba79-fd87858bec8f';

-- Value Dossier Generator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'b0d8d2db-95b2-4e5c-a505-197b87a791fa';

-- Word Counter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'a7388385-e18b-49a4-928c-110e8961d521';

-- XML Parser (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '5d0c5cfe-7694-48e4-a28e-f8d73f7dd3f6';

-- 3Rs Implementation Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e77bb027-1474-46e5-b01e-a1e81ef15e6f';

-- Access Analytics Manager (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'ab0133ba-facf-4c2c-b8de-d73c76289e08';

-- Adaptive Trial Designer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e14fb571-86bf-49d3-a6ba-968e3e88e109';

-- Adverse Event Reporter (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '699c8345-c68e-4e3e-876b-686c412641a7';

-- Advisory Board Organizer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fd544a5b-5335-4bf8-addb-38c2223f4069';

-- Aggregate Report Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '2a9628b6-6998-4ded-a457-c86c5542459c';

-- AI Drug Discovery Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9d596190-f812-4088-ba41-9e06ef44d06c';

-- AI/ML Model Validator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c3ed2a7f-c328-43b6-9d0b-64db910a39d0';

-- Analytical Method Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '489c147a-e1b3-4fa6-ac9b-567aae687a39';

-- Anti-Corruption Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9b8a0fb3-a279-468a-ab0a-5fbf9a5a87ed';

-- Antibody-Drug Conjugate Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '15c9fa9f-4157-4a2a-b9a2-50866b791f22';

-- Anticoagulation Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '4aabad72-0c0e-4f14-abdb-a7b8f3ba5caa';

-- Artificial Organ Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '2d1a99ba-b4c0-46a7-903f-06bba98c3515';

-- Basket/Umbrella Trial Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '35be4346-38b3-4fa2-b10a-dbfe0b15f9f6';

-- Batch Record Reviewer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e7d5c3e5-6ac8-4334-963f-6b7306ec84c0';

-- Benefit-Risk Assessor (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '621461bc-fd9f-4e55-9054-56f853393138';

-- Bioanalytical Method Developer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'b9131d87-8584-40d9-9a78-7e253c303508';

-- Biomarker Strategy Advisor (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '8a75445b-f3f8-4cf8-9a6b-0265aeab9caa';

-- Biosimilar Regulatory Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = 'edfa4260-6432-41ab-b363-6ae51e359d84';

-- Biostatistician (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '773821f5-0350-496c-91e0-a6387a6a163b';

-- Blood-Brain Barrier Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0b8099d8-18a2-4218-b59a-d10b9c11e3e4';

-- Brand Manager (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '239efbbb-aa67-4f40-935c-5840aaf409ef';

-- Breakthrough Therapy Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e7fc4e23-15b7-42ca-bcfe-ee5c13898cdd';

-- CAPA Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '21df494f-48fc-457e-add0-146e926586ca';

-- CAR-T Cell Therapy Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'acd14421-a639-4efd-8f5d-5235b0c3596d';

-- Carcinogenicity Study Designer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '41302a13-2f54-4ca1-bea5-8cab6d879969';

-- Cell Therapy Clinical Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f412258c-14d2-4295-8830-f3fa875f4377';

-- Change Control Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c00f98b9-9b8d-43fa-8687-5f95ead8a538';

-- Cleaning Validation Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0106460e-d9be-469e-9ed2-8d17231ea5ba';

-- Clinical Data Analyst Agent (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '1aa8b546-9c97-4235-9305-6fcf578a1820';

-- Clinical Data Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'a8cc26a0-c790-4a04-9ad3-0082a9124e09';

-- Clinical Imaging Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4d2dd8f4-d992-4cbf-97ab-040bbb79d8b3';

-- Clinical Operations Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '6584a9a3-d671-4d93-956f-f06577deb3e0';

-- Clinical Pharmacologist (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'f3cdb180-6244-41a5-81cd-f8aaf122c973';

-- Clinical Protocol Writer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '49018c66-ce44-408a-ae1d-df0fd10907bc';

-- Clinical Study Liaison (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '2ba6f55c-c5f3-47f3-81f2-6c2d5ede2940';

-- Clinical Trial Budget Estimator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '6a54be17-848d-4b09-bd47-8a4affb2377d';

-- Clinical Trial Designer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '12fe5a69-d045-4fe7-b580-3379bc3eae7b';

-- Clinical Trial Disclosure Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f8b5b8e1-af66-4a1c-96a6-098006bcbe0f';

-- Clinical Trial Protocol Designer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '4e1ae41d-a68f-41f8-b23a-200f06952821';

-- Clinical Trial Transparency Officer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'ffb727fe-8d5a-4da5-ade9-41da1cd23141';

-- CMC Regulatory Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '847adbd8-a798-4113-97b1-ddce5e1478da';

-- Cold Chain Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '8884073e-e848-482f-946e-683e091c28d7';

-- Combination Product Specialist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c2d12ac7-8e48-4af6-bba3-42693c4b5817';

-- Companion Diagnostic Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '2b8a01f5-1d6c-45ef-ba88-f9110faf16e2';

-- Companion Diagnostic Regulatory Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = '60729aea-faaf-4273-b9c6-1ee70cf63447';

-- comparability_study_designer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '498f4525-3674-4ec3-b666-e07c501b142f';

-- Competitive Intelligence Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '8d3888f5-6f8b-411b-81b6-9e21ebdd99f3';

-- Compliance Officer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'c67f63ad-3894-45e1-9104-95efda430831';

-- Congress & Events Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '4252f915-c267-4990-a03e-f61a2047bd2d';

-- Congress Planning Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ff42a2e8-5bb7-45b5-8a2b-e853e035c37f';

-- Container Closure Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '5dc65208-e9fa-4451-9e85-8fad0293d0a6';

-- Contract Manufacturing Manager (Score: 0.40)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '1606c379-929c-4c50-823e-94aa6f78b8d9';

-- Copay Program Manager (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fcbf0f6f-0ce1-46ec-9c1d-fc77efb616e6';

-- CRISPR Therapeutic Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0c6a4817-591d-48e5-b008-fa8e4e9eb392';

-- Data Quality Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '5771026e-a8fa-4525-abbf-95c544dc5cdf';

-- Data Visualization Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '676d29fb-076c-48ca-b840-31c3c5450188';

-- Demand Forecaster (Score: 0.46)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.8 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0cb37e50-6cad-4202-a9f2-42ec3f09940c';

-- Deviation Investigator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'deaa26b4-74e4-4c5e-8f76-e1093dc7ab5f';

-- Digital Learning Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '587b8d3c-095b-4d0b-afdb-a0c17baab343';

-- Digital Therapeutic Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = '79e27e58-becb-4875-87ac-cc553efebdbb';

-- Distribution Network Designer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'aa85f164-c5de-4fb9-a10b-0f5dece75e8c';

-- DMPK Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '2bc0f1b4-334f-430d-8a98-421eefd29f4f';

-- Document Control Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '27ce8816-24e4-423a-af0a-6272c398c6ae';

-- Document Generator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'bf43e3d3-b701-4652-8d35-3e726fef878f';

-- Dosing Calculator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '69a2beda-608e-4a55-a3ab-56f9256e931d';

-- Drug Information Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '03a72def-ea09-4b21-8b44-fb4c204b8b79';

-- Drug Interaction Checker (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '2e87af56-46f2-40a5-8556-a7867a70f36d';

-- Drug Substance Characterization Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '83e85d0f-e7e7-4c43-ae30-3ae04e587fee';

-- DSMB Liaison (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'acbd4c59-2f16-48a7-8ff5-7213cf90f5a2';

-- Endpoint Committee Coordinator (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'a9345d18-85ba-4c83-9ce8-a1995192315f';

-- Epidemiologist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '90049468-049c-4dc1-ac8a-9b59f919306c';

-- Equipment Qualification Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9be4e73f-a8dc-4a45-934f-d1760c83876b';

-- Ethics Committee Liaison (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'a73afe44-5ea4-4dae-88e0-ff9f980ac311';

-- ETL Developer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '0fae3e95-210c-46fc-a8f0-40e4544df861';

-- Evidence Generation Planner (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'df1abd6b-9259-422f-b28e-1c3775d92829';

-- Evidence Synthesis Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '43ec2190-221f-44cc-9173-0147c7da2562';

-- Exosome Therapy Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '472f4167-b06e-42a3-a10c-b71a2d1dab84';

-- FDA Guidance Interpreter (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '076618d7-6b3d-4369-bc14-ae6740d53693';

-- Field Medical Trainer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '279f001d-d9a8-409d-b3d8-8ab765fda55f';

-- Formulary Access Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_13.svg',
    updated_at = NOW()
WHERE id = 'ddbad674-2c8c-4fb5-9e52-8bdab81caf9a';

-- Formulary Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_13.svg',
    updated_at = NOW()
WHERE id = 'f2d91a39-4f0b-469f-bcec-d8c0268360ee';

-- Formulary Strategy Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_13.svg',
    updated_at = NOW()
WHERE id = 'd37fe1a8-434f-4c53-b4f8-a93d4a28cb2e';

-- Fragment-Based Drug Design Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '395ba71d-d0f1-4af6-a8a1-23c805228cc3';

-- Genotoxicity Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '63324ce5-d79e-4fda-aed0-a45fd59749f0';

-- Geriatric Clinical Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '40e05f9b-a92d-46df-a487-f517ded28765';

-- Geriatric Medication Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c5d1ce7d-dd7d-4967-b09b-1e7281a8b67d';

-- Global Brand Lead (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a232e683-2c98-463b-9e8b-861bb2b0d6bc';

-- Global Business Development Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '76254912-e644-4213-8cae-da612954b950';

-- Global Business Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '50d378c8-c186-4842-9d3f-7a3846987dc9';

-- Global Clinical Ops Support Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '8d9f6ec2-29fc-4d6b-b99f-e126c322b32b';

-- Global Commercial Operations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '501b0898-391c-4bb6-ba61-6511f6558f25';

-- Global Compliance Review Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '33cb5d08-d57a-4749-aa22-583df225e5ba';

-- Global Compliance Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e90c477a-df48-4f44-88de-396c69a1b2f0';

-- Global Customer Success Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '291af271-befd-45fe-8ad9-bfc68a04a049';

-- Global CX Program Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '3574bb0c-8ae6-473f-a362-7a4d8892d215';

-- Global Digital Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '2157ed04-3e32-4a2a-a732-1b73e4ab3911';

-- Global District Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '4f2c7561-27c0-4b98-a54d-bb8a1edf7bb3';

-- Global Economic Modeler (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_13.svg',
    updated_at = NOW()
WHERE id = 'ee5e8467-5a85-43fd-b24e-aaf01281befd';

-- Global Field Team Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'cdcc1798-7e08-49ec-9152-cb3b2cb5477e';

-- Global Global Access Policy Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '67d8de85-bd87-406d-a100-5056c94d6637';

-- Global Global Access Process Excellence Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '02b62ed6-3b3b-4c85-8861-a041cd52218e';

-- Global Global Contract Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '4bc12911-a824-440c-84d0-66b8daaab24a';

-- Global Global Data Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '4578008b-addf-4df4-9fdb-efb5f778f1dd';

-- Global Global Distribution Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '2bdc7f4a-1fd0-4b7c-8842-01fe3ba463d6';

-- Global Global Evidence Synthesis Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '88fd36ab-8e83-4024-bfba-10829f2b8836';

-- Global Global Global Pricing Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '746c6fe7-e54a-4d05-aed6-962278c6c822';

-- Global Global HEOR Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'af7dc1ca-059b-43d8-9e6f-c410f2478819';

-- Global Global HEOR Project Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '7c32242b-2860-40e2-bfc1-47fcabd5f399';

-- Global Global HTA Access Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'fab89f76-e34c-462b-9e81-fb14e05eb3a3';

-- Global Global Insights Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '206e8e56-d911-484b-aca4-e1085e1ea85f';

-- Global Global Market Access Operations Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'ea67d67d-5411-4469-a498-919ca85f20cc';

-- Global Global Operations Excellence Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '8e4a0860-cc48-4b85-a025-c07440832e6f';

-- Global Global Outcomes Research Scientist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '5a13041a-1a5b-4ddf-b965-e1e4459270ef';

-- Global Global Patient Access Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'b98a7e0d-fe5b-4259-a347-575d8fe8a232';

-- Global Global Patient Journey Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '65b8f38c-c02a-45f3-b48a-8d9b26d37dfb';

-- Global Global Patient Support Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'c6f44905-a0ef-41d2-813a-5f80d035743d';

-- Global Global Payer Relations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '0e2022fa-6e74-4916-a862-4f8458b826fa';

-- Global Global Payer Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '4bc23a39-5aa1-4358-bace-9dfc09bde8a4';

-- Global Global Pricing Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'e9dd7c13-bbaa-4d11-a2bd-578429756c0f';

-- Global Global Public Affairs Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '1fbd5a71-c074-41ce-8cf5-5c3b4dad82a2';

-- Global Global Reimbursement Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'e83f6489-caa5-4845-8183-9ae8c1740e5f';

-- Global Global Value Evidence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'fb46ab4f-c22e-436b-826f-6b653a5232d2';

-- Global Global Value Proposition Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '75c0ecdc-c914-4868-ae63-305374e2c341';

-- Global Global Wholesale Channel Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'c3c4da8b-f1f0-49ca-aa4c-6d95df06b3ca';

-- Global HEOR Project Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'cb0c6b74-9897-41e7-9dcc-1499fb08ef53';

-- Global Hospital Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '968de86a-fd5e-4d37-b1cd-590b89b51410';

-- Global Licensing Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '98720282-fe33-465e-a774-22c04712b508';

-- Global Lifecycle Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '93244a78-5b62-4770-8be9-80d0819efe0a';

-- Global Medical Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '27407d7c-1b88-4c13-be7d-c2f358c0f218';

-- Global Medical Communications Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '4b8a52d3-e67a-45f4-96a7-e3d3d6377fd7';

-- Global Medical Info Associate (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = 'dd2d309d-5791-4272-88c3-a1a2b5cd2d7d';

-- Global Medical Information Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'f47cb036-8b26-47fc-849b-3ea2a7526fa4';

-- Global Medical Liaison Clinical Trials (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'e31375ca-ec95-423a-8546-593866828837';

-- Global Medical Science Liaison (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c9e6ecfc-cf15-4e03-863a-07501ec212c9';

-- Global Medical Scientific Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '626b7623-e5db-4ae6-a3e1-bae8cce23f52';

-- Global Medical Writer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c915eaec-b07d-4924-a3b9-979abbe5537b';

-- Global Multichannel Ops Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '2dd318cf-56ec-4c1b-a811-15e9432e3e9b';

-- Global Omnichannel CRM Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'dffdb550-8f2c-4fee-9ff6-a4f03e61dd5a';

-- Global Product Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b40a7244-8186-4e98-a680-ad2e5bcc8a0d';

-- Global Publication Planner (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c11566ef-6f91-4234-8b69-55df4e7c29de';

-- Global Regional Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '04b8512b-d6f5-4c59-8a83-1c42b4da5bae';

-- Global Remote Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '863f2a46-6887-493f-8323-94a2d9b216c4';

-- Global Sales Analytics Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'd1f33924-6d03-4e2b-8a2d-f2c181dca978';

-- Global Sales Enablement Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'fe43965f-589c-4e00-b22b-ca3ebc0466ab';

-- Global Sales Territory Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'c83a7e45-6884-4b97-b8b9-6b56e2d37762';

-- Global Sales Training Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'bdbe89a3-ae20-4c5f-a6cf-82f1de9daea4';

-- Global Scientific Trainer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'aff2932c-d411-4bba-997b-13cebbecbae9';

-- Global Specialty Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'c4464653-68ae-4938-963e-436beb145830';

-- Global Trade Compliance Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '547c2d68-6e42-4b37-ade9-fb6b4a4207d3';

-- GMP Compliance Advisor (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'f7712428-adbd-4f50-9e42-7c7a67932819';

-- Government Affairs Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'af9a2750-7334-4b7f-bcaf-e3f85f54ae90';

-- HCP Engagement Analytics Specialist (Score: 0.76)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '28acb344-f9bc-48f0-991f-a819d3c30c96';

-- Health Economics Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '0f12e180-1f45-41c4-8333-5ce8356b66a7';

-- Health Economics Modeler (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '26391c1f-4414-487b-a8f6-8704881f25ad';

-- Health Economics Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '1594d0cd-e80c-4816-9666-ba074b6b0682';

-- HIPAA Compliance Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '73b1f4e4-a8f7-47b0-ac8f-c6cff3863f58';

-- HTA Submission Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '4003d857-8260-418b-8b9f-78c79ea0f47e';

-- Hub Services Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd4eef048-cbf4-4c0b-b1c4-819a2d03a61d';

-- Immune Checkpoint Inhibitor Specialist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '8f4b31dd-2d66-441e-b50b-a6fecac83fdd';

-- Immunosuppression Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '57f14ea1-3a2e-4a33-8c87-52101d30d984';

-- Import/Export Compliance Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '02e66bb7-2160-409f-bbe7-3f9358a4c25b';

-- In Vitro Model Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = '181f2b71-1cbc-4c1d-9677-adfb0e42a574';

-- In Vivo Model Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7283c932-2b9f-4d80-b0e0-8c6a8a7b6d31';

-- IND Application Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7aa6ffca-1092-447b-9995-662567a00bf0';

-- IND-Enabling Study Coordinator (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '148d921b-8a1a-471c-9171-5313fa3aeafc';

-- Infectious Disease Pharmacist (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4362f051-a08a-4ee8-b0fe-dafdef84123e';

-- Informed Consent Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '8f4fe15b-c9d2-435e-bee8-2198b1c22a2c';

-- Inventory Optimization Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1ec1276b-7f3b-4089-9d7d-727e18069adf';

-- Investigator-Initiated Study Reviewer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '8b177a15-0d6a-4a3d-ae98-6c68ec0ddf1b';

-- Key Account Manager Support (Score: 0.46)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.8 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '7eba08ee-c720-4e7d-9cce-e3dd233f0523';

-- KOL Engagement Coordinator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '52da6221-bfa7-48d5-bc1e-84ec17f821ec';

-- Liquid Biopsy Specialist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '115d04e3-acf7-483f-8223-a0ac8d137c7b';

-- Local Brand Lead (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b3568bc2-572f-41d0-a31b-365ff36ed6d6';

-- Local Business Development Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'afad6275-8821-461a-a73c-6e3e0775915e';

-- Local Business Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'e9c1b0eb-00e5-41d5-b32a-ec4848247231';

-- Local Clinical Ops Support Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'f704f962-c239-42c7-bf98-c534b7695681';

-- Local Commercial Operations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0512ccec-0e99-4214-8134-9e75a8f76d9e';

-- Local Compliance Review Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '22010f25-b378-4ed3-8066-285eb0568789';

-- Local Compliance Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1f991705-4ab0-47b0-88db-b0a4e5c35fed';

-- Local Customer Success Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '34ecbebc-53ec-4ea8-880d-179df586484e';

-- Local CX Program Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '5bfabfec-a76d-4521-be0d-1465aac8fd7d';

-- Local Digital Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'e431fb16-ed65-42b5-bc79-a47c9555a705';

-- Local District Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '1bcd8374-d354-44bb-81cf-179b74fdaa99';

-- Local Economic Modeler (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '63d13232-f46c-43d2-ab01-a0fc29ab0b14';

-- Local Field Team Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '6cb6cca8-bde1-40d9-8f10-62784bfe6f97';

-- Local HEOR Project Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'bb857759-e4df-420c-bb6f-e48937722c18';

-- Local Hospital Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '67466736-69e7-4907-bf81-e7270e7ecfb3';

-- Local Licensing Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '9496f742-b231-4c74-9436-5f29c6273dde';

-- Local Lifecycle Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '562f95fa-960e-4080-859a-d6b3a9938f78';

-- Local Local Access Data Scientist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '012ae1ea-0123-4ff7-a20c-f4b0533d5dc7';

-- Local Local Access Policy Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'a4d8baa4-85b8-45ab-b08e-00ff4b44e4e3';

-- Local Local Access Process Excellence Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '19c1a111-15c4-462d-bcc7-137d1ea4db64';

-- Local Local Contract Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '0c04fa71-4d65-4d32-86cd-8db604147266';

-- Local Local Data Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '5c45c7e5-52f6-4eeb-865f-e9a975a6a509';

-- Local Local Distribution Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'b1ba5da4-3548-4fc1-bde4-e07e7923c634';

-- Local Local Evidence Synthesis Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '8f629399-1d69-4064-9943-a631e5cb972f';

-- Local Local HEOR Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'd2f7f8ff-6458-4407-8b4c-21a8f4e387dc';

-- Local Local HEOR Project Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '048da808-0d0c-4501-9d63-4d97ef3bcc61';

-- Local Local HTA Access Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '96ec00b7-33d3-4928-bfdd-8d6b540a3691';

-- Local Local Insights Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '1d7e38e8-a5a5-425c-8961-854c412fa859';

-- Local Local Market Access Operations Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '8d7d6d43-e190-4876-bbfc-b1c88172aa6a';

-- Local Local Operations Excellence Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '6a270a2e-c592-4123-a5a2-d4f03689876e';

-- Local Local Outcomes Research Scientist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '099f247d-3576-4641-89df-99ee220a157c';

-- Local Local Patient Access Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '10122daa-3c01-442b-b149-79e6413e4bca';

-- Local Local Patient Journey Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'b6e00acb-4ca8-4210-a5dd-a3b8d5a3fb9a';

-- Local Local Patient Support Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'bfdc06c8-9c24-4489-b677-ba61a70da061';

-- Local Local Payer Relations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'de59fc82-d869-4fca-81a2-8d8ef1ed0452';

-- Local Local Payer Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '03484508-035c-4359-81e8-c9fdf2c6eb30';

-- Local Local Pricing Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'a3d96a6b-0acd-45fa-bc0e-4073fe5a5ad1';

-- Local Local Public Affairs Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'c574c81a-448a-4141-9aaa-d83da31e6a93';

-- Local Local Reimbursement Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '5626c04e-aa6f-4c7d-96b6-cf46041ad2c2';

-- Local Local Value Evidence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'f0878d49-b10e-456f-a35d-3d8d605f6d75';

-- Local Local Value Proposition Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '9df1ef63-735f-4306-8fae-47d0277ca93f';

-- Local Local Wholesale Channel Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'dd7f91e0-ec74-46d6-963d-27d5d7d8c4c9';

-- Local Medical Communications Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b3377bd0-488a-407e-96c3-68df41d20040';

-- Local Medical Info Associate (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '94fe3050-5071-450b-b7c2-4d799092b52c';

-- Local Medical Information Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b4f07aa4-a14a-414c-93e1-3ca94c848844';

-- Local Medical Liaison Clinical Trials (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'ac81dbf1-53a8-48f4-bd36-2bc1155b2ea9';

-- Local Medical Science Liaison (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'dc5a076a-0d1b-47bb-897a-4137c36b6f5c';

-- Local Medical Scientific Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '1a769213-991f-44c5-8830-c51ad2ec811b';

-- Local Medical Writer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '553bada9-645c-4a3a-8a8a-0eedc270267f';

-- Local Multichannel Ops Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '6710a60c-caea-4ced-8c3a-a753149b508e';

-- Local Omnichannel CRM Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a43cb5f3-6497-4a91-ba87-9cace5dd0c9c';

-- Local Product Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '38c18a62-bcc9-4c7c-a6c2-2bc2559d83e9';

-- Local Publication Planner (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '33c78211-605b-45b9-93eb-d5d501a6a624';

-- Local Regional Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '99c9a8b4-d9d3-424e-a528-923ef2798103';

-- Local Remote Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '99a5bb8e-f0b8-41cf-b021-0f1681cc5bd0';

-- Local Sales Analytics Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'efca9c3c-993f-4f44-b5e8-56bf4cc4d554';

-- Local Sales Enablement Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'a7703138-8d43-47e8-abc5-2663a599640c';

-- Local Sales Territory Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '502c9bed-b957-45d9-91b0-8b9753b9f689';

-- Local Sales Training Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'c90b8d25-7897-435e-80f8-bc7cac7fd550';

-- Local Scientific Trainer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '7ce76dfd-0185-4bff-a34c-61facde8526d';

-- Local Specialty Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'ead8ea42-dd13-4ca3-bf55-7d675bc94b36';

-- Lyophilization Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fc57ba89-570e-453f-a6cc-b72629a553f3';

-- Machine Learning Engineer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'fbcc697d-dd10-4c52-b84d-bd0d9072b143';

-- Macrocycle Therapeutics Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c24ab0d2-dba2-48c8-a25d-736c1251a0a7';

-- Managed Care Contracting Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '442a2321-902a-4ebe-b0a7-9e42107293b4';

-- Manufacturing Capacity Planner (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = 'e1038ce7-1afc-462c-b9c3-c0ff81aa8a72';

-- Manufacturing Deviation Handler (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = 'fcc89d6c-d7da-4e59-aa00-7b484ce91509';

-- Materials Management Coordinator (Score: 0.46)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.8 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '59647674-6f7c-4b65-a510-c02e044a6e47';

-- Medical Affairs Commercial Liaison (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '318b56fc-2f8e-4021-8d67-7c61715e500e';

-- Medical Affairs Metrics Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '50d64452-da4d-4e47-b3dc-50579eee494f';

-- Medical Affairs Operations Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '836a0c7b-d4f1-4b33-8e30-afb324993e23';

-- Medical Communications Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3ac00df1-c774-4739-8fe1-0d143b972efb';

-- Medical Content Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '3083b43c-dc30-4f94-964a-8008a96220ca';

-- Medical Editor (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'b01b09a2-c36c-4d88-86be-00b5c95cf934';

-- Medical Information Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '97d204d1-3fb0-4268-b1fd-dafd86f81f0c';

-- Medical Librarian (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '4d352b8a-cc0d-4769-8db2-60f36e1fc28f';

-- Medical Literature Researcher (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '7883923c-a1d5-4bb2-bf42-6baa24cc3df4';

-- Medical Monitor (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '9f6e9092-0273-4633-b042-41aed68e7907';

-- Medical Quality Assurance Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ec3700fe-351e-4a77-9dd6-710ae6a73f48';

-- Medical Review Committee Coordinator (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ae43a81c-0b2c-40c6-bccd-ba63205e39b7';

-- Medical Science Liaison Advisor (Score: 0.76)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'b254c0ab-04c8-42df-b698-880c8657131d';

-- Medical Science Liaison Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '6a97d9fd-b071-4c78-9702-a1700cf436d1';

-- Medical Writer (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '497e2ee1-d22f-4eb4-832f-43cfe2317b6c';

-- Medical Writer - Regulatory (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '9042d980-a40f-4b76-af9b-a47079d93313';

-- Medical Writer - Scientific (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '9da24659-87e0-43f5-9339-74cf43538635';

-- Medication Therapy Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '5c4e05bb-52f6-46c4-ad8f-cb85832ddf04';

-- Metabolic Reprogramming Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fd753286-8171-44d5-8377-30b6da79598f';

-- Monitoring Plan Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = 'b3f17ddd-4c44-4331-9307-d6af61bf91a1';

-- Multi-Omics Integration Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'f5b73e4d-b2f7-4187-a8c7-c56960f5cd51';

-- NDA/BLA Coordinator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '4cab8cb4-1120-4b19-8420-a28c48cdfced';

-- Needs Assessment Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '5505c587-db3e-4710-8595-9267ce845999';

-- Neurodegenerative Disease Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7858a622-7e94-441f-9068-d91078445a71';

-- oligonucleotide_therapy_specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '584179b1-c11e-409e-a2e5-609cdc85cb0a';

-- Oncology Clinical Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd1967fb1-edd5-4341-8d5a-cbdc442c4404';

-- Oncology Medication Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4dced354-f116-4df9-92a3-ef1aedc2bc47';

-- Organ-on-Chip Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ede58b40-d729-4240-a496-2e2b3be56ddf';

-- Orphan Drug Designator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '8ab59ac5-482a-42af-a3bc-43e501e3daca';

-- Outcomes Research Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '17319d09-7a53-4617-b072-45bb32f2aa8d';

-- Outcomes Research Specialist (Score: 0.76)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_14.svg',
    updated_at = NOW()
WHERE id = 'dc9d4086-b189-4037-8d27-3c25e2b7ea0b';

-- Pain Management Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0b8c96ed-91bb-4df2-8af5-79cd6e93444c';

-- Patient Access Coordinator (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '73112f2d-a875-4e3c-a441-7cc09a1bb4a4';

-- Patient Advocacy Relations (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '1482129f-fb49-4639-82a0-74c412628856';

-- Patient Journey Mapper (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4af2e224-0749-464c-b918-af29fb1b35c9';

-- Patient-Reported Outcomes Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '884c4be1-0bb7-43e7-b40a-c3f1286a69bd';

-- Payer Marketing Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '94cddf34-57fe-485a-8ba3-a54f8d9305c4';

-- Payer Strategy Advisor (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '1c80e497-0cd9-4802-b143-1bdb519d7de3';

-- Pediatric Clinical Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '965ca25b-979f-4ca4-be24-29a294faaef6';

-- Pediatric Dosing Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c6a38bcb-cb95-4748-8cab-2d5fd77ef64d';

-- Pediatric Regulatory Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = '558d6ccf-52d2-4ab2-a60a-bf544e4952c7';

-- Peptide Therapeutics Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1b075440-64c4-40fe-aac3-396e44a962cb';

-- Personalized Medicine Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '312c106f-a66a-4b3d-b1f4-06ce3e0c0536';

-- Pharmaceutical Technology Specialist (Score: 0.50)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '256aae72-ac53-43ca-9ae2-528274d1f9ad';

-- Pharmacokinetics Advisor (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '87e66e33-5d40-4cdf-b082-795839dc04fd';

-- Pharmacology Study Planner (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = 'a98e94b6-1634-4539-81b4-ef5ca6e9cb28';

-- Post-Approval Change Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '437d20a4-91ee-44f7-907c-0c7c521712a4';

-- Post-Marketing Commitment Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '0fa60911-c7ac-48fa-b568-5470fed10767';

-- Post-Marketing Surveillance Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'c04bb70e-e913-4564-a4d0-9eaed0e573c7';

-- Predictive Modeling Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'faaae331-6f50-48c4-8963-8b0ad0b1d391';

-- Pricing Strategy Advisor (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '904be429-211c-4701-9ca6-9317e2bf4415';

-- Prior Authorization Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd35084d8-186d-40ab-85ad-9d97142e7f66';

-- Prior Authorization Navigator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '5ac5ad05-e64a-4ed4-9b87-2b3433d3e8d9';

-- Process Development Engineer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = 'fc47b9db-25fc-4b69-b645-652e45e0a78e';

-- Production Scheduler (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '071d6654-f13a-4d6f-a006-8d036fbb981b';

-- Project Coordination Agent (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '2cca74a0-5f47-48c3-bed2-4709f373699f';

-- Promotional Material Developer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '31fc16e6-3b7f-4357-80bc-f46f072926a5';

-- PSUR/PBRER Writer (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'a56390ae-418f-46ac-9484-2e095211a2e6';

-- Publication Planner (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '43e28311-769d-44f0-b64a-50875ebbc9e9';

-- Quality by Design Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'ed49e322-769e-4603-b884-d99e4e58437a';

-- Quality Metrics Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '84fb2626-af5d-4062-856c-ebe037b794b0';

-- Quality Systems Auditor (Score: 0.40)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '027c3187-d68d-4173-aa96-e3307f6b8990';

-- Radiopharmaceutical Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '78b16641-ee3b-4fbd-8766-7e451508dcc2';

-- Rare Disease Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd48d7869-f181-455d-81b2-9b4d32f41a82';

-- Real-World Evidence Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'a3b34589-ad9f-4759-afb9-d1b718d0da61';

-- Regional Brand Lead (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '896977d9-ddb0-4dbd-bb2a-08badd9627a5';

-- Regional Business Development Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '09638f5f-7017-46c2-a743-1791e39ebc75';

-- Regional Business Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '07c7588c-0761-4620-a09b-8a6e8796867e';

-- Regional Clinical Ops Support Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '7071ac16-a9d6-4ac8-8e5d-5b5b287aa557';

-- Regional Commercial Operations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a9b8d050-ae6d-4d37-add9-4e32a769df7a';

-- Regional Compliance Review Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '8943eeea-b5a1-40cf-911c-87d497d1d1f7';

-- Regional Compliance Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e960c954-594c-4092-bb14-19ec9645e903';

-- Regional Customer Success Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0dc0f81c-f3e2-44e3-b2d2-7df872efa77e';

-- Regional CX Program Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '007cb8aa-9a7f-49c9-9c3f-d6b373d9be4d';

-- Regional Digital Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '837aaeb3-62cd-4920-b05c-5ae7285ccfbc';

-- Regional District Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'd63f0122-1189-408c-9bbf-9a3cae973f89';

-- Regional Economic Modeler (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '35bd62bc-775f-4b2a-a3e1-aefb299e2237';

-- Regional Field Team Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9a9e2b70-6621-4320-807f-3cfe7a28e127';

-- Regional HEOR Project Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '80b7cbbd-0f79-4201-a84a-381a0f7a48f4';

-- Regional Hospital Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'a9b2e9ec-2a9d-434e-8919-fa0e26cdb767';

-- Regional Licensing Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'f26042ce-fe70-4188-aec1-902759b4f5ca';

-- Regional Lifecycle Marketing Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '2750b72c-5d2b-4b32-857c-f363d59f1d77';

-- Regional Medical Communications Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '22655eed-250c-4ad7-9c06-e90c5a1172f6';

-- Regional Medical Info Associate (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '4a0f25df-aebd-4b12-9dd6-eaf1c804bf5f';

-- Regional Medical Information Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '0c985e2c-8960-494e-98ab-be6cc4b8c769';

-- Regional Medical Liaison Clinical Trials (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '01895977-f4ea-438b-953a-9b2faef58895';

-- Regional Medical Science Liaison (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'f547c2ce-01e1-43d6-bbcf-2831976c11e9';

-- Regional Medical Scientific Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c062428e-6a75-4314-87bb-610aba1054d1';

-- Regional Medical Writer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '728ea6ad-1629-4de7-919c-49a916f0e1e9';

-- Regional Multichannel Ops Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'e54771d6-ff65-4223-a6ea-1ac04b2911eb';

-- Regional Omnichannel CRM Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'bf30f2e3-9231-438d-bb8b-994ca203e26c';

-- Regional Product Manager (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '1773e92e-6537-4395-8fbc-41d018f8217c';

-- Regional Publication Planner (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f3860be3-0a03-4aa4-9570-b1658a8cb961';

-- Regional Regional Access Data Scientist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '7348b7bc-c5fb-43a9-a294-aa1c5177519a';

-- Regional Regional Access Policy Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'cb75e282-58fd-4f29-8278-d519e978be9b';

-- Regional Regional Access Process Excellence Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '577cc588-4253-48bf-a64d-047841691271';

-- Regional Regional Contract Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '79786794-46f4-471a-bd6d-c8f51a08cf68';

-- Regional Regional Data Insights Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '2503136e-a9dd-491d-87a1-6bce662207c3';

-- Regional Regional Distribution Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '5388ad33-7036-4a99-899b-8fea2c40d401';

-- Regional Regional Evidence Synthesis Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '49a3a0ea-d9a7-4c76-ab6b-25da73f1b06b';

-- Regional Regional Global Pricing Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '6b04d67b-32ef-46d9-89be-e158150acff6';

-- Regional Regional HEOR Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '08fdd4d2-8dfb-4685-a6fc-2a8e2600164c';

-- Regional Regional HEOR Project Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'a89e4f26-81de-4c77-8497-6e59da364e3b';

-- Regional Regional HTA Access Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'f625dc3e-8083-4413-9f6a-b2c5d65eb9ad';

-- Regional Regional Insights Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '78071b9f-a83d-4122-bc5c-fba5767ce563';

-- Regional Regional Market Access Operations Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'c9dd564d-867a-41bc-aa0d-f90b9ff45f9d';

-- Regional Regional Operations Excellence Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'a198f11a-67e7-44c6-98be-ab2fc3a9f3c3';

-- Regional Regional Outcomes Research Scientist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'c7f03b77-e715-4177-b7f9-c5c241b08ee3';

-- Regional Regional Patient Access Manager (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '7930c6e7-96b8-460b-953d-7d14809fa9e8';

-- Regional Regional Patient Journey Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '9f696c95-a895-4243-be9c-92a5153eef5b';

-- Regional Regional Patient Support Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'bc863630-b542-4bf8-9cf7-fa9bfb153805';

-- Regional Regional Payer Relations Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '587fe365-7bed-4366-9d01-021310898e51';

-- Regional Regional Payer Strategy Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '7c004f4c-5c35-43ec-8438-66e26710da5b';

-- Regional Regional Pricing Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'dd622d78-8e24-4af0-be66-8f7faafe031b';

-- Regional Regional Public Affairs Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'bf95b230-9bf0-4b8c-87b3-7457ac50fcf8';

-- Regional Regional Reimbursement Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'b3a5671d-ce69-44b9-9ba2-9cb1053d141e';

-- Regional Regional Sales Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '290ab758-925f-4788-b874-da8c844301b0';

-- Regional Regional Value Evidence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '81b26ed5-9aed-4aad-96ac-1367778f1549';

-- Regional Regional Value Proposition Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'feba495e-366a-4d14-b2a9-b655a6ce15f5';

-- Regional Regional Wholesale Channel Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '4c7215d9-8fd1-4bf5-8734-1c34bb35e785';

-- Regional Remote Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'f21dcb6e-0756-48e9-a469-c698be2b0021';

-- Regional Sales Analytics Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '5d93d656-75fe-4552-aed2-b61bc8f31af2';

-- Regional Sales Enablement Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'cd65ca4e-5ac1-4a59-8b44-62655e56a988';

-- Regional Sales Territory Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '9557d3f0-dcda-420f-8535-9f04e0d88996';

-- Regional Sales Training Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'e457e0c3-f923-4469-85db-9b48385a538c';

-- Regional Scientific Trainer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '0987f187-01f9-423c-9a3f-dba00523932b';

-- Regional Specialty Sales Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '15b68f97-bf1b-44d3-8d05-c9b6c34cc18f';

-- Regulatory Compliance Validator (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '3555e7e9-b6f7-4e70-9550-3020fb5fb2be';

-- Regulatory Intelligence Analyst (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '9eacab2d-fa8f-4856-aad0-d1475f1b0fe5';

-- Regulatory Lifecycle Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = 'a4c20984-beca-4529-9341-eb339976c36f';

-- Regulatory Risk Assessment Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '736d4987-8d74-4f50-af0a-133ca5f12f85';

-- Regulatory Strategy Advisor (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = 'dad2f053-7d05-4aba-9f1e-bb0779921e1e';

-- Reimbursement Strategy Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '3d44c73a-a84a-4db2-a9e7-73718fced314';

-- Reproductive Toxicology Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '01f52700-407c-46b1-a5f1-daf13febe6c9';

-- Returns & Recall Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '65868d26-0b7c-4f34-b9c3-5f2eee23ad3e';

-- Risk Management Plan Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7224d2bb-0596-4201-a98d-8efb7036c136';

-- RNA Interference Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '4765a89a-b1f1-4e67-97e0-2a6ed65e6cad';

-- Safety Communication Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '45aaf742-c464-49ba-bdc4-3be9def1d215';

-- Safety Database Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '66fbd89c-b083-483c-84f7-80a8a4926e5d';

-- Safety Labeling Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'af89d54d-df1c-4234-8033-015249381094';

-- Safety Reporting Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '16448bcf-a566-43ad-bd9c-b8a13589e56f';

-- Safety Signal Detector (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '556871b4-47b5-4cbc-931b-783809265c0a';

-- Safety Signal Evaluator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'dba7ef26-abe3-407a-8f50-965876666403';

-- Scale-Up Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'dec2c8fb-7c5c-4e66-b2fd-6bda9e44df71';

-- Senolytic Therapy Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'f9ac2f7a-f051-476b-bcde-11fc38430f50';

-- Site Selection Advisor (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'bd404c24-9e8e-46d9-aebc-b521666881d5';

-- Spatial Transcriptomics Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '6012cb6c-6170-43fd-abe8-daf3a4e796ce';

-- Stability Study Designer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = 'e7e28eca-e61a-4ed8-9e95-f162f7fa4152';

-- Statistical Programmer (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'cea8b345-2007-4108-9d93-519b25222d85';

-- Sterile Manufacturing Specialist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '98c3485a-5d8f-4352-a51b-ba2d2fa7e9d4';

-- Study Closeout Specialist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_14.svg',
    updated_at = NOW()
WHERE id = 'ded94692-78f7-4fa0-b8fd-4ea95e7a7e84';

-- Supplier Quality Manager (Score: 0.40)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '198aec17-d539-4dba-8540-71c10506aa00';

-- Supplier Relationship Manager (Score: 0.46)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.8 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'a2f38676-10ef-408d-9356-954c3b618d12';

-- Supply Chain Risk Manager (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '2f9ec169-da9d-408a-9592-2b15d5d13d4c';

-- Technology Transfer Coordinator (Score: 0.31)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'a35fbd20-636d-4f3c-b2fb-804ee81f05e0';

-- Territory Design Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '318fcb64-c0f8-4169-b2b0-6cedbf00c91a';

-- Tissue Engineering Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7e6bc6c6-0152-4e5f-b3b4-d742910f5ccc';

-- Toxicology Study Designer (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '295961fd-8250-438e-be28-0d5cff3704e1';

-- Training Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '61bab030-cccb-4d99-b5eb-0a67d619db36';

-- Translational Medicine Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c95acbe3-068c-41bc-a599-17c039f17199';

-- Transportation Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9b02c3eb-c8af-4d0a-ba2b-79157fce6b8f';

-- Vaccine Clinical Specialist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'cc47b3a9-a55e-48cf-99e4-e4d1cc38dc0e';

-- Validation Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '73607605-4f66-4a79-86c4-72fdc53b07d8';

-- Value Dossier Developer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'b1e25814-3ce3-4d60-b76f-2066b8e63253';

-- Value-Based Contracting Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'bf09cf22-c310-47df-93c0-7116571efe56';

-- Warehouse Operations Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '8c898d68-a0ce-4022-8fd2-6b06c0b737c7';

-- Workflow Orchestration Agent (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd48a41ea-33b2-4f81-8349-644c205e17c8';

-- Brand Strategy Director (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'd7e163c3-73ff-4154-9112-9a27e09da373';

-- Clinical Operations Support Master (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '708663ed-4e9c-42f7-952c-757a843048ed';

-- Digital Strategy Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '39c0894d-daae-435d-9644-26a65f5de81a';

-- Director of Medical Analytics (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'f4f1b842-7808-4381-9596-5d0f1ac8d9d1';

-- Field Medical Master (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '15e1c2db-6264-4705-aa87-6b1aa7f36f51';

-- Global Account Manager - IDNs/GPOs (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'c9a69f37-2da3-4c4a-9734-119981f12166';

-- Global Chief Commercial Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '9955f111-4a91-461e-8fb9-50a05090fb70';

-- Global Global Chief Market Access Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '2e346dbe-c563-46ae-acd1-7e0573dfd735';

-- Global Global VP Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '410ae37d-a277-40cc-93b6-ddf69f704aec';

-- Global Institutional Accounts Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'a1b8387b-d774-41e2-bf3e-0edfa3879c00';

-- Global Key Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '7baa3829-757f-49fb-936a-d5767470de9a';

-- Global Pricing Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '31512f74-e6de-4faf-83fe-70afde8f1e7d';

-- Global Strategic Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0f88699d-b15b-4b86-a8a6-b5d6093de511';

-- Global Strategic Accounts Head (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b5e2daf8-1f90-4b94-9cc0-083d8e860647';

-- Global SVP Commercial (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b354c075-bb16-48d7-a484-cfb2d659adbe';

-- Global VP Commercial Strategy (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'bab07ca8-acd7-4fbb-92c1-7a0ab8f8d1d4';

-- HEOR & Evidence Master (Score: 0.46)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.8 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_market_access_13.svg',
    updated_at = NOW()
WHERE id = '8ecb0f01-9411-429f-91b3-1c3e42049ace';

-- HEOR Director (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_market_access_14.svg',
    updated_at = NOW()
WHERE id = '1eb25131-03b8-49f3-bde6-4314586bede5';

-- Local Account Manager - IDNs/GPOs (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '27551178-d372-42e7-8d17-315a45396370';

-- Local Chief Commercial Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0e9506d1-0bfc-4307-ab71-ac1c4193d99e';

-- Local Institutional Accounts Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'bdb11b18-24ed-4705-a153-7fada2385495';

-- Local Key Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0e9250a7-b756-461b-91fe-e40e0df75150';

-- Local Local Chief Market Access Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'd92a777f-8d7e-4bc0-8526-9ff9ec4d6ec3';

-- Local Local VP Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'baa477e2-201f-417e-b548-20b13b4331db';

-- Local Strategic Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '77d9fa7d-7058-461e-afbf-85c41769ffa2';

-- Local Strategic Accounts Head (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'f36f08d9-69c6-4863-a9d7-f05a8ea4624b';

-- Local SVP Commercial (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'dd5e49ab-72c1-4e4a-99ba-02e63c85a487';

-- Local VP Commercial Strategy (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '76fb7f93-5f38-40e1-9b94-c9f97d59b7de';

-- Market Access Operations Director (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '0cfe361b-cdaf-4575-9945-c2379a51f8ca';

-- Marketing Analytics Director (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '2ce900f4-57c6-4062-b441-e958bfa8331c';

-- Medical Education Director (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '2fb0f883-b87d-4597-b8e0-a0f405b252db';

-- Medical Education Master (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'c988940f-1103-4cc9-95d0-41edfc4b8dad';

-- Medical Excellence & Compliance Master (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '8e2b4ce0-1af2-413e-8085-874e306f967e';

-- Medical Excellence Director (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f7b7c445-c43a-47a9-b686-e0f0ed084418';

-- Medical Information Services Master (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '9e8d1dc5-06b2-4004-86bb-015c1cd95f46';

-- Medical Leadership Master (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '67585e10-af0b-4d93-806e-30ec28add7f5';

-- National Account Director (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '42ff9745-14d7-4548-a02b-27696f957141';

-- Patient Access Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '37c3c77c-4822-4210-94c1-0842fefb016b';

-- Payer Strategy Director (Score: 0.63)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.8 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'b11c24bd-6d8d-4af1-8894-5ca50d2f4050';

-- Policy & Advocacy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '1f098245-6a74-48f8-a1ce-32e5799757d4';

-- Pricing Strategy Director (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'b98a88c4-79ba-4620-a494-dc7c5ba547ce';

-- Publications Master (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '8337f756-df4c-43a2-9dd1-b5b943ba5e95';

-- Regional Account Manager - IDNs/GPOs (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'd977ab1b-5191-4ea7-91d6-2806a60fe048';

-- Regional Chief Commercial Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'dea29f2c-5da9-43f3-b065-47914ca98d31';

-- Regional Institutional Accounts Manager (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'b295f922-4aee-47ac-aa23-4c0d5d80e5da';

-- Regional Key Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b817ae07-de0f-46a9-a565-a4a66b7a166a';

-- Regional Medical Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '17f060cd-8124-4c08-ab8a-8d482e3833ea';

-- Regional Regional Chief Market Access Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '80cc918d-27e6-4d87-9b6c-95d7b57b3811';

-- Regional Regional VP Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '955a8a28-a927-471c-815a-cd4e1b83a5cc';

-- Regional Strategic Account Manager (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a5e7b567-a755-4c9c-98aa-07700ab2434b';

-- Regional Strategic Accounts Head (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'fadf1ac0-8127-4e7c-89ef-3cf3a676cdad';

-- Regional SVP Commercial (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '5458cb31-3b30-4ae8-ad3e-d756681a36c6';

-- Regional VP Commercial Strategy (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b12916f9-b6ec-41cd-876b-f46ba61d241a';

-- Scientific Communications Master (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b08e5343-d1a7-48cc-a547-bb06b6826296';

-- 3D Bioprinting Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '40d84d6f-00ba-4713-8aec-091577016ef2';

-- Accelerated Approval Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '73999e4a-9e43-4ce9-8886-7fb326efd1bd';

-- Advanced Therapy Regulatory Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c934e9bf-19e0-4952-a46e-a7460ae43418';

-- Agency Meeting Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd3d53328-1296-4429-99d7-cf982bb6acbe';

-- Base/Prime Editing Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '36fa60ac-503c-4fed-8fc8-bd02502dec05';

-- Biomarker Validation Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '482bcb2b-5fa6-42eb-9e41-ecba756d9bdf';

-- Bispecific Antibody Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '518379c2-1c52-4a76-9e26-96e38911662f';

-- Cancer Vaccine Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'c1c8be26-4771-4c06-919a-5b1930dc0907';

-- Clinical Data Scientist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '00b3854f-318a-48a7-a37d-6ab02b6e8c7b';

-- Clinical Data Scientist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'fb39bb6a-e46f-4858-afe9-c6be0e2bb2af';

-- Clinical Trial Simulation Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'a5fdcb98-6fcf-47ab-a9e0-9ced03157596';

-- Continuous Manufacturing Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'a0bb42c6-af9c-47dd-8723-3d3b31e83b9b';

-- Contracting Strategy Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_13.svg',
    updated_at = NOW()
WHERE id = 'ed4b1d86-6233-40d9-ab60-1dd8929c140f';

-- Database Architect (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '75913118-13e7-427b-8f24-7fa90080857d';

-- Digital Marketing Strategist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '429d91bd-330f-4aa7-9d04-a75fb7203e4c';

-- Dissolution Testing Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '212f652f-a613-4c53-8aad-f4196a419471';

-- DNA-Encoded Library Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9c9207e3-c8ef-40e7-af3e-00f90efe927a';

-- Epigenetic Therapy Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ee756509-9c42-441a-b3c7-57512dd39b73';

-- Evidence Synthesis Lead (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '6dc6104d-cacc-4e89-bd03-85e4d99fb059';

-- Excipient Compatibility Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c0124faf-c5ae-4ac8-84af-7a2980c4d088';

-- Expedited Program Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'f3a1f19c-fde5-46b6-9862-a595b3db6c83';

-- FDA Regulatory Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_product_innovation_13.svg',
    updated_at = NOW()
WHERE id = 'bdedb696-b865-42ca-ad52-01ad8a53638d';

-- formulation_development_scientist (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '983fb8d3-11e2-4f56-bef8-2eaa0a04d6f8';

-- Gene Therapy Clinical Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'a4def93e-81d5-4143-b329-bda1d0131008';

-- Gene Therapy Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b1d4f3cc-428d-4408-91ec-c52e720b3541';

-- Global BD Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '25dbefbe-6487-497a-920e-255e6918f3d8';

-- Global Clinical Operations Liaison (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '0435bef8-8970-4eac-a968-235007fff5dd';

-- Global Commercial Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '681cf2ec-6305-4015-b5d6-2427977c65b1';

-- Global Customer Experience Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '04d18553-670c-4de9-8514-0474723d6b4d';

-- Global Digital Engagement Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '41c226e1-00d6-4814-9a1d-5b5142a40de1';

-- Global Digital Medical Education Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '2ab6240a-6a29-4482-a8eb-954a94f5096d';

-- Global Economic Modeler (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '407b7bce-2d30-460e-85dc-c750c3509414';

-- Global Field Medical Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'c6761731-7be0-4cf8-a329-63f21242afe1';

-- Global Field Team Lead (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4da46579-d8c6-4b49-b8c0-ffdf00130d2a';

-- Global Global Government Affairs Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'ead6d59e-1f43-4943-a57f-2f1c1fadc398';

-- Global Global Head Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'aaaa7dbe-c10c-476a-bfa7-f94b77f281c3';

-- Global Global HEOR Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '6214f00d-8564-4167-83e0-7a30215da6c6';

-- Global Global Market Access Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'e5c257a8-9aaa-4e3b-b5b7-72b81a180545';

-- Global Global Trade Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '4a8a2aee-47e4-42ba-aba2-238749442d08';

-- Global KAM Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '5e43f2c3-73cb-4a8e-9ee9-aa519fa75f97';

-- Global Marketing Director (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '3cc66d2f-f0fa-403b-bbb4-7022b52cd0dc';

-- Global Medical Affairs Director (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'd63d8c6b-9a4e-46bf-98a5-97f623b4aec2';

-- Global Medical Education Manager (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '18c12e37-d181-4fe2-a87e-a77a296c745d';

-- Global Medical Education Strategist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'b424c93b-e9f7-4014-8d5a-2d7f4b58f902';

-- Global Medical Excellence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '392790f5-5e9e-457a-bbec-68f699943809';

-- Global Medical Governance Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '5728c655-f410-4284-a65d-3bc0a256d357';

-- Global Medical Info Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '04aaffed-1711-459d-bfad-046709b8f50b';

-- Global Medical Information Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '710c6080-e80f-471e-ac4a-4a593aae72a2';

-- Global Medical Liaison Clinical Trials (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '5f6e8d02-7465-4ba8-9ceb-ca904cc42082';

-- Global Medical Scientific Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '4850231c-f8ff-4edd-b142-4f6d9db156b9';

-- Global MI Operations Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ddc0e2bf-26d1-4fb0-9d34-dbc223741602';

-- Global National Sales Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '31caf623-8f9b-4fe7-ab8f-a232d9b4466e';

-- Global Publications Lead (Score: 0.55)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.8 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c4e0e030-77da-488a-92fa-10c38868e363';

-- Global Publications Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '87cda02f-8752-4d85-91bd-1e6646d33c3a';

-- Global Real-World Evidence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '9e87b38e-adb1-4dae-9153-0f16ac745ff8';

-- Global Regulatory Strategist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '1c6cb791-7c5a-45ba-a135-c216a09148ec';

-- Global Scientific Affairs Lead (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '3b0ecfc7-13ae-424f-a13d-9544da8f80bd';

-- Global Scientific Communications Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '637b3473-3229-4993-87b1-917fa3916d4f';

-- Global Senior Medical Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '8384c7cb-995d-4c81-98ae-a262e32bb8bf';

-- Global Senior MSL (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '5b008523-7a82-4582-bdf1-9d2e96dddd2d';

-- Global VP Medical Affairs (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '116b72e5-a1d3-466d-b16d-6fac66a8a419';

-- Immunometabolism Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1a850f1e-2e79-4602-a204-c229dea8bff1';

-- Immunotoxicology Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b0a44cc1-5c58-4887-a288-d84d52f0c209';

-- Impurity Assessment Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'fea5e764-8e17-4437-834a-7bcf432bc12a';

-- In Silico Clinical Trial Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '08075cce-0113-4d9b-bc1f-546e7f5bfd29';

-- International Regulatory Harmonization Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'fa85d612-79e2-47c8-85b7-cf2d1d321477';

-- Intranasal Delivery Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '732ddf5d-7f26-4faa-b6a5-1c0c12192eb4';

-- Local BD Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'ff0be1ba-a6fd-4bfa-bbc2-04918c10961e';

-- Local Commercial Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b07d2b5f-0995-4473-ad35-7c9d53329e07';

-- Local Customer Experience Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '779f518f-261d-49b8-8b91-5c32d69b6130';

-- Local Digital Engagement Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'ffc9aa82-38bb-45cf-ab74-f52fc95e82b2';

-- Local KAM Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '897062c9-f90a-4a52-8097-3ae3f8299490';

-- Local Local Government Affairs Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '9ef2f2d0-cca4-48ef-a66a-ea219b974ec8';

-- Local Local Head Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '65cdfbe2-eaaf-4e4a-b466-086697f61bc0';

-- Local Local Market Access Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '362656d0-7d54-449b-b00b-3c2a11e3e1be';

-- Local Local Trade Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '41eb257b-9915-44a3-8956-61018b21c775';

-- Local Marketing Director (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'c27cb4d6-8641-4166-9399-85e73f21806e';

-- Local Medical Info Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7e08e50c-8256-4419-b9bf-f012fc0e660a';

-- Local Medical Information Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'fb2f3603-c543-4876-b0cc-5418245fd686';

-- Local MI Operations Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1e3b7760-be61-43dd-a4d4-d1d94bf9f27f';

-- Local National Sales Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '027c112b-bf36-478b-8c1d-9998e77e5e77';

-- Market Access Communications Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '89694e63-3a6f-4aec-bc9e-7ebb5d571622';

-- Mass Spectrometry Imaging Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fb89b752-9cfc-48b9-bc77-343e399c91db';

-- Medical Affairs Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e97e9c48-550d-4a58-b7db-89733dcc2f89';

-- Microbiome Therapeutics Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '47aa7eea-ac1c-49a0-a6c2-1baec281675b';

-- Mitochondrial Medicine Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '72983086-f214-4fe3-b5a5-6d2b45d117f2';

-- mRNA Vaccine Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '7b7aecbb-8f91-46d1-9008-aa06b3af6783';

-- Nanomedicine Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1ae5014a-ba37-4630-9b30-581602eb4321';

-- Natural Language Processing Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '0f85ff09-e901-41dc-b85e-35ae3ec17543';

-- Omnichannel Strategist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a0cf1579-cec7-4302-b01a-1a81c43ddc5d';

-- Oncolytic Virus Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '4383ca6a-da94-41b6-97df-056a6225706d';

-- Organoid Platform Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '106b61d1-b784-4c4f-b304-704e27a0c59e';

-- Patient Recruitment Strategist (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '671f9921-9077-431e-9f08-ee881051e729';

-- Payor Account Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'e9a93a75-8ce0-4416-9a40-f39021440e18';

-- Pharmacogenomics Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'a2220734-ccb4-42b0-9857-7d1a6804934a';

-- Procurement Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'a7194fba-4d14-4fff-b2a4-3cc30adaf26d';

-- Product Launch Strategist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'a4416d55-6088-4531-b39b-f9eae883d121';

-- PROTAC Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9328b26f-0d5e-480f-9e9e-2f78a5ee34db';

-- Publication Strategy Lead (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f8c41642-a805-4b1b-a7aa-2b2c35f4f16e';

-- Quantum Chemistry Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '53d4467c-a52c-497e-822e-b6f9e21e10ac';

-- Rare Disease Clinical Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '1ca5749f-1737-48d6-bd6c-1a6a7077c202';

-- Regional BD Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '9efb2049-e777-4dc8-8920-27e748f7f95d';

-- Regional Clinical Operations Liaison (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'f35b2a46-e39e-450c-a781-9f1eb9102dc1';

-- Regional Commercial Strategy Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0232107d-8e91-486a-8bfe-27a70034e358';

-- Regional Customer Experience Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'a4789f16-28ff-41c7-9884-b094db92a256';

-- Regional Digital Engagement Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b0f91c81-686c-41df-98a3-3cc99be49328';

-- Regional Digital Medical Education Lead (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '3b10dd9a-0fa9-49aa-b594-3589b3eedbe0';

-- Regional Field Medical Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'b62db9cc-0a48-4e3f-b33a-354db160dcdc';

-- Regional KAM Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '7a1a7380-fc6a-4705-ae5c-b9dafbf8ad7b';

-- Regional Marketing Director (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '84f59988-eb3a-45df-bf07-0ff29a09e29b';

-- Regional Medical Affairs Director (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'bd8161ee-e55c-4178-bffd-a6250819de62';

-- Regional Medical Education Manager (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '7f30a920-28d0-465e-a414-e4e6532ab365';

-- Regional Medical Education Strategist (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'b9df42d3-49a7-4893-b663-b8e820fe57b4';

-- Regional Medical Excellence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e6104b2b-c87f-4745-b34c-b3bfa3507ea6';

-- Regional Medical Governance Officer (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'ebc858b1-5e47-484c-8bcc-7d2e1a05daf8';

-- Regional Medical Info Scientist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '792aec46-b5fe-49b7-852b-b1b214734005';

-- Regional Medical Information Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'e4cdadce-38be-4a20-8a21-5a1768f504f2';

-- Regional MI Operations Lead (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3108553b-9b33-4f1a-9fe8-bbb05d94bd6c';

-- Regional National Sales Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '33483e50-f188-4baa-b01f-034231a4af99';

-- Regional Publications Lead (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '7ce4d615-bcae-454c-983b-76260c9e883e';

-- Regional Publications Manager (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'cf758692-0ab4-4d72-8e8d-7e02d9078721';

-- Regional Real-World Evidence Lead (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'b1d247aa-9a18-4a6a-86e8-84780c00984a';

-- Regional Regional Government Affairs Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '8ad12b89-ebf3-45a8-9bc7-89fbe371973b';

-- Regional Regional Head Market Access (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '18eba358-465f-4c63-ac34-8ace97cf41a5';

-- Regional Regional HEOR Director (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'c51a0200-42c8-450b-a0df-3a80d8f2df7e';

-- Regional Regional Market Access Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '764fce5c-36d8-4094-944c-a0accd43ec10';

-- Regional Regional Trade Director (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '6ca49176-85e6-4ce9-a8bb-68f20c065c16';

-- Regional Scientific Affairs Lead (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'c50d1fea-ccd5-4d1d-8b9a-19a4f705f44a';

-- Regional Scientific Communications Manager (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '1e60bd47-4000-4493-bc28-4a586c89d395';

-- Regional Senior Medical Director (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '67b8d262-eb71-437b-87ce-a6600417b5fd';

-- Regional Senior MSL (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '6944fa97-5a58-4c28-8ffd-4aa160b323c5';

-- Regional VP Medical Affairs (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '3f0e5e93-50d1-4953-8410-5e372547df38';

-- Regulatory Deficiency Response Lead (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '5e08fa33-8e9b-444e-98b4-fab224c7d2b4';

-- Regulatory Dossier Architect (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'fde5e77c-8a3d-4d7c-bea0-68e71fd3a026';

-- Regulatory Submissions Quality Lead (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '1730c463-36e8-46cd-adf6-ba71464788b4';

-- Reimbursement Strategist (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'cbff9006-43c3-4610-bd28-32f231b48c5c';

-- Risk-Benefit Assessment Expert (Score: 0.41)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c9632fa6-b9ba-4eda-8934-62653dd1680e';

-- Safety Pharmacology Expert (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '565b4ca6-f4e6-4817-a50c-a6bd25d8ca7d';

-- Serialization & Track-Trace Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '45d14199-a29a-4fd1-84e7-ad11749f11fd';

-- Single-Cell Analysis Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '277420a5-6baf-4095-ac27-7efc69576c95';

-- Stem Cell Therapy Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '89273310-848a-4ffb-8fab-8408f71cbc97';

-- Structure-Based Design Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '53de8d82-8834-4aba-a655-598cd5eb7d9d';

-- Targeted Protein Degradation Expert (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'e5bcc939-fd06-451f-94b4-10554ec22731';

-- Therapeutic Area Expert (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'ca9468e7-4f59-4c26-8be2-d0e515002f6d';

-- Therapeutic Area MSL Lead (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = 'e7102e53-579a-4b26-8956-999405569889';

-- Action Item Tracker (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '9ebe8c9c-05c5-410f-b2bf-1221d0318a37';

-- Adverse Event Detector (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'dc312e20-87bd-4fed-bef7-c55a4b0e9f92';

-- Benefits Verification Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'd9367e05-6e45-4a03-a047-2b7f50f23ede';

-- Business Intelligence Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'de0e1960-43ef-41b2-ab41-235a276fb996';

-- Channel Operations Analyst (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'c20fc515-0aa6-4df6-8773-cd84b41aaf62';

-- Citation Formatter (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '5c4d658f-a1df-4998-b7a4-8d5e3c946e99';

-- Competitive Intelligence Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '27091396-fefb-4e18-a531-0ac3ebaa8a5d';

-- Compliance Checker (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'e4e3a466-726d-4e45-9a5d-e20bdf6b8055';

-- Contract Administrator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '921efdba-2526-454c-b4b7-c62e2fa81576';

-- Contract Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'c6518e14-5da0-4de3-aa84-bd91cdeb9e22';

-- Customer Insights Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'd4286bfb-fdc2-4254-a2e9-5dc1a99613b6';

-- Data Extraction Worker (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = 'ec1bd0e5-25b0-4218-8416-a7b9fd716569';

-- Distribution Coordinator (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '840e32b3-e7d1-4a61-8323-903930863e20';

-- Document Archiver (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '185c3c1f-d72b-45f4-8050-6f4cf0e14b43';

-- Email Drafter (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '20668a39-2f02-4483-bebe-3bbbec00f4a2';

-- Global Acquisitions Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '12df78c9-eb7e-4730-9695-2d1dc59dd247';

-- Global Commercial Compliance Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '86c3fdd7-cc5a-4063-83b1-eebe8900cce4';

-- Global Commercial Data Scientist (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '8600ee5d-e4d0-4453-a652-fc2ddaae7200';

-- Global CX Insights Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '2003872a-d186-4ac0-bb94-9f2c5aa06c2d';

-- Global Forecasting Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'd7b9d33f-5917-4a70-b648-e660768abc14';

-- Global Global Access Contract Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '4c81ade4-b668-4ba5-b65a-2b37ab524189';

-- Global Global Access Programs Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'ae4e71e8-02cb-4fa8-8b28-dbcd3066daa6';

-- Global Global HEOR Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'f34d24bf-824e-4014-94ff-22ec974027d4';

-- Global Global HTA Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '83c5aaa0-6078-496d-a095-b2890e0e2262';

-- Global Global Market Access Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '433ce52d-0aed-44dd-aebf-84db9bbaec8a';

-- Global Global Policy Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'f9e7170b-3cce-4cc4-b206-c786c1a77b74';

-- Global Global Trade Operations Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '57c44aa8-b1fc-4a4c-8711-64a47b3a1dcc';

-- Global Global Value & Pricing Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = '838235f5-e847-4895-97d0-02222179113a';

-- Global Hospital Sales Rep (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = 'd42f4243-5d3c-4250-adff-739dcfb7325f';

-- Global Learning & Development Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '103667ba-224b-40be-85ba-8da08c274314';

-- Global Sales Representative (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '30a2ce33-0248-4c17-84b4-bb2c53e7a79f';

-- Government Programs Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '01921511-7ee4-406f-ada6-5c7bb3826fde';

-- Gross-to-Net Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'fc1efe45-4b6f-4c30-a42f-c3dc14d0cb2e';

-- Healthcare Policy Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '3a80f3da-d415-4c7e-9a45-1d781a87a9c6';

-- HEOR Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '91c022d6-a14c-4b1c-92ad-eef2af6fa1de';

-- HEOR Research Associate (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '65fa4707-d468-4b72-92df-af3405436b9f';

-- Literature Search Worker (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '1cfc875b-cdf3-46c2-a022-c14a11d41e55';

-- Local Acquisitions Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'd685dacb-0395-430c-a15b-0aaf95ac82a2';

-- Local Commercial Compliance Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '9257cf93-77cd-4772-a763-a2ba045bf553';

-- Local Commercial Data Scientist (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = 'f9626516-8d2c-4027-8a23-44631e5e1d47';

-- Local CX Insights Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '089db91f-2c96-441b-a54a-f5d7f7b7e4fa';

-- Local Forecasting Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c9d45d03-db3b-44f6-a788-d7e2a83e4db2';

-- Local Hospital Sales Rep (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '08ef9f07-88a9-47a0-b52f-57ef0c7262c4';

-- Local Learning & Development Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '27091cbf-c63e-491c-9e59-35df3e202a12';

-- Local Local Access Programs Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '3d9d2424-c36f-4002-b496-de2ebb56a6fd';

-- Local Local HTA Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '5a6584ba-b765-4a06-b2a6-eb29286e7e3a';

-- Local Local Market Access Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = 'b9d50d62-553a-4d44-87f4-526168a94c6b';

-- Local Local Policy Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '80eb54fd-4720-493b-8e8b-5e6137710386';

-- Local Local Trade Operations Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '2efc3127-1783-425d-8ac0-f2f3019b99d0';

-- Local Sales Representative (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '93273c0d-a68b-4409-8e36-100493957889';

-- Market Access Data Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '15b534e0-c4cb-4c44-8816-e037e6c1e2fe';

-- Market Access Data Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '5e2de524-75f7-49d7-a48b-0ee8c88ea363';

-- Market Access Operations Coordinator (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'fc226720-9249-4b91-ace1-7e8233dba3aa';

-- Market Insights Analyst (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '0e26cf36-bec0-48de-9ea2-7ca88c54dae7';

-- Market Research Analyst (Score: 0.65)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_product_innovation_15.svg',
    updated_at = NOW()
WHERE id = '496cdbfe-37a7-4f62-8b80-8682299299ea';

-- Medication Reconciliation Assistant (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'd454dbf8-f11e-42ab-a5a0-e4c7de7c3523';

-- Meeting Notes Compiler (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '763b62c4-0056-4cc0-bbe8-a5fe5ab78081';

-- Metadata Tagger (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '25589683-70ba-4c1c-8fa4-55df49cd2eee';

-- Off-Label Use Monitor (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '04930cb1-776e-4a3f-a80e-dee2b7d85d26';

-- Outcomes Data Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'c63a919b-9728-4cef-8b78-e7056c4a3462';

-- Patient Services Coordinator (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '90cb040e-71cb-4aac-8a73-0721c48e9ad4';

-- PDF Generator (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '80817069-e4a4-4ba0-a25f-e759fdd2779c';

-- Policy Research Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_product_innovation_14.svg',
    updated_at = NOW()
WHERE id = '3ab27def-a65e-400f-a39a-325cd0690601';

-- Population Health Analyst (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = '21b3a565-1af5-4d52-90cc-67372ef3c63c';

-- Pricing Analyst (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '0f33f069-61df-4916-a3fd-2a826ad83053';

-- Pricing Data Analyst (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_market_access_15.svg',
    updated_at = NOW()
WHERE id = '19811e41-d43b-42d1-81ab-9084f14c8eb0';

-- Prior Authorization Specialist (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '90412c20-cd3e-4edd-ab40-15e4c4cf4142';

-- Privacy Officer (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'eb6019dd-b999-4b0b-8b6e-5ca6eb856d8a';

-- Process Improvement Analyst (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '2183f868-3c3e-4061-bc0f-938e89f53de7';

-- Process Optimization Analyst (Score: 0.40)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = 'e657f920-f11c-42e6-8c14-df94b197d159';

-- Quality Reviewer (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '8415c2f9-842e-40c4-8760-d1ee69428c4a';

-- Real-World Data Analyst (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = '6c487a6e-8066-41ec-86c1-862aba119eb8';

-- Real-World Evidence Analyst (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '983990cb-8bf8-4615-ab9f-cb16f34f3226';

-- Real-World Evidence Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_13.svg',
    updated_at = NOW()
WHERE id = 'f969d697-fd79-41f3-b15f-4ba82e77ab39';

-- Rebate Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '9934eaaa-5718-429c-9b74-44f09945b460';

-- Regional Acquisitions Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '0c0dcf0c-b67c-4a81-96a7-37f4fe578f5a';

-- Regional Commercial Compliance Officer (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '9c4ab82f-18f3-4339-a5b9-5b35137436e4';

-- Regional Commercial Data Scientist (Score: 0.75)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = 'e06b1b33-46ba-42ba-b84d-9b0b2987b549';

-- Regional CX Insights Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '8938fa7f-7d21-43ad-b482-73784c825dc8';

-- Regional Forecasting Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'f049df56-b785-49bb-ad8d-2e00559af788';

-- Regional Hospital Sales Rep (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '7fb94c48-11b8-4d47-81e0-b656e0717bd0';

-- Regional Learning & Development Specialist (Score: 0.68)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = '23433488-fa24-4c89-9e57-a25377ffe71a';

-- Regional Regional Access Contract Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'dbcf7759-1284-49bd-86e9-20373929a604';

-- Regional Regional Access Programs Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = 'a8796324-3947-4449-8a78-99aa498bdb9d';

-- Regional Regional HEOR Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = 'c5e0d7da-98d5-4a5c-bb05-5f0118ea0183';

-- Regional Regional HTA Specialist (Score: 0.59)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 1 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '0d7551a9-e5ea-48c6-b8ae-43892f3e6947';

-- Regional Regional Market Access Analyst (Score: 0.58)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_15.svg',
    updated_at = NOW()
WHERE id = '325433bc-46cf-4b67-a261-6b18b06d47b4';

-- Regional Regional Policy Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '811c6e82-8bfd-46c1-8073-e3aaee0a6d29';

-- Regional Regional Trade Operations Analyst (Score: 0.49)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_13.svg',
    updated_at = NOW()
WHERE id = '4efe8603-5291-4407-8f8e-92ffaa086168';

-- Regional Regional Value & Pricing Analyst (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0.5 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'c69cfd79-1317-4465-835e-549510dad55e';

-- Regional Sales Representative (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_pharma_commercial_marketing_14.svg',
    updated_at = NOW()
WHERE id = '32b3e2f6-0d9b-454f-8100-a5091937258c';

-- Reimbursement Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_15.svg',
    updated_at = NOW()
WHERE id = '27c352dd-139f-4af1-9373-b37bd2692d40';

-- Reimbursement Coordinator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 1 | Persona 0 | Tenant 1 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_market_access_14.svg',
    updated_at = NOW()
WHERE id = 'c9ce24c9-f7af-4b46-87be-de3b6e985828';

-- Report Compiler (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '89496761-fcf1-41b9-bb4c-e3fbf5949353';

-- Sales Force Effectiveness Analyst (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0 | Tenant 1 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_commercial_marketing_15.svg',
    updated_at = NOW()
WHERE id = 'b0526fda-2435-4e47-9eb9-02df1f8e7c75';

-- Signal Detection Analyst (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = '6ff14b9f-0ad8-4373-9748-e9203e6d79d8';

-- Slide Builder (Score: 0.48)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0.5 | Tenant 0.9 | Visual 1
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_15.svg',
    updated_at = NOW()
WHERE id = '36c0bbaf-1122-4d4b-b480-a732fcbc8fdf';

-- Summary Generator (Score: 0.56)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 0.5 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '94dd8546-f77e-4d8d-9213-8c17dfd485a5';

-- Supply Planning Analyst (Score: 0.38)
-- Breakdown: Tier 0.2 | Domain 0 | Persona 0.5 | Tenant 0.8 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_foresight_analytics_insights_14.svg',
    updated_at = NOW()
WHERE id = 'c6e140a6-1f3b-4eb3-bc19-fb250446ad89';

-- Translation Worker (Score: 0.66)
-- Breakdown: Tier 0.2 | Domain 0.67 | Persona 1 | Tenant 0.9 | Visual 0.96
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_medical_medical_affairs_14.svg',
    updated_at = NOW()
WHERE id = '35561450-e248-4a46-b9d2-5c382026dabe';

-- Version Controller (Score: 0.39)
-- Breakdown: Tier 0.2 | Domain 0.33 | Persona 0 | Tenant 1 | Visual 0.93
UPDATE agents
SET avatar_url = '/assets/vital/avatars/vital_avatar_expert_medical_affairs_13.svg',
    updated_at = NOW()
WHERE id = 'f8cf47fe-f5b9-4780-a403-b6f927f4d723';


COMMIT;

-- Summary Statistics
-- Total agents updated: 770
-- Average score: 0.53
-- High confidence (score >= 0.8): 0
-- Medium confidence (0.6 <= score < 0.8): 152
-- Low confidence (score < 0.6): 618
