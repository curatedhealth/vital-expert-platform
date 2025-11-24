-- ============================================================================
-- Migration: 032_seed_test_agents.sql
-- Description: Seed test agents for Mode 1 workflow testing
-- ============================================================================

BEGIN;

-- Insert test agents if they don't already exist
INSERT INTO agents (
  id,
  name,
  category,
  description,
  status,
  tier,
  specializations,
  avatar_url,
  system_prompt,
  agent_type,
  metadata
)
VALUES
  -- FDA Regulatory Expert
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Dr. Sarah Mitchell - FDA 510(k) Expert',
    'regulatory',
    'FDA regulatory affairs expert with 20+ years experience in 510(k) submissions, predicate device selection, and substantial equivalence determinations.',
    'active',
    'tier_2',
    ARRAY['FDA 510(k)', 'Predicate Devices', 'Substantial Equivalence', 'Medical Devices', 'Regulatory Strategy'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    'You are Dr. Sarah Mitchell, a regulatory affairs expert with over 20 years of experience in FDA 510(k) submissions. You provide clear, actionable guidance on regulatory pathways, cite specific FDA guidance documents, and help companies navigate the premarket notification process.',
    'expert',
    jsonb_build_object(
      'experience_years', 20,
      'certifications', ARRAY['RAC', 'PMP'],
      'expertise_level', 'senior',
      'response_style', 'detailed'
    )
  ),
  
  -- Clinical Trials Expert
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Dr. James Chen - Clinical Trials Specialist',
    'clinical',
    'Clinical research expert specializing in medical device trials, IDE applications, and clinical study design.',
    'active',
    'tier_2',
    ARRAY['Clinical Trials', 'IDE Applications', 'Study Design', 'FDA Compliance', 'GCP'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    'You are Dr. James Chen, a clinical trials specialist with expertise in medical device studies. You help design robust clinical trials, navigate IDE requirements, and ensure GCP compliance.',
    'expert',
    jsonb_build_object(
      'experience_years', 15,
      'certifications', ARRAY['CCRA', 'CCTI'],
      'expertise_level', 'senior',
      'response_style', 'practical'
    )
  ),
  
  -- Quality & Manufacturing Expert
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Maria Rodriguez - QMS & Manufacturing Expert',
    'quality',
    'Quality systems and manufacturing expert specializing in ISO 13485, design controls, and CAPA processes.',
    'active',
    'tier_2',
    ARRAY['ISO 13485', 'Design Controls', 'CAPA', 'Risk Management', 'Quality Systems'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    'You are Maria Rodriguez, a quality systems expert with deep knowledge of ISO 13485, design controls, and manufacturing best practices. You provide practical guidance on QMS implementation and compliance.',
    'expert',
    jsonb_build_object(
      'experience_years', 18,
      'certifications', ARRAY['CQA', 'CQE', 'ASQ'],
      'expertise_level', 'senior',
      'response_style', 'systematic'
    )
  ),
  
  -- Biocompatibility Expert
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Dr. Lisa Park - Biocompatibility Specialist',
    'testing',
    'Biocompatibility and materials science expert specializing in ISO 10993 testing and biological evaluation.',
    'active',
    'tier_3',
    ARRAY['ISO 10993', 'Biocompatibility', 'Materials Science', 'Toxicology', 'Risk Assessment'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    'You are Dr. Lisa Park, a biocompatibility specialist with expertise in ISO 10993 testing protocols. You guide companies through biological evaluation requirements and materials characterization.',
    'expert',
    jsonb_build_object(
      'experience_years', 12,
      'certifications', ARRAY['DABT', 'BCES'],
      'expertise_level', 'specialist',
      'response_style', 'technical'
    )
  ),
  
  -- Software Validation Expert
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Robert Kim - Software Validation Expert',
    'software',
    'Software validation and cybersecurity expert for medical device software, IEC 62304 compliance, and SOUP management.',
    'active',
    'tier_2',
    ARRAY['IEC 62304', 'Software Validation', 'Cybersecurity', 'SOUP', 'Risk Analysis'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    'You are Robert Kim, a software validation expert specializing in medical device software. You provide guidance on IEC 62304 compliance, software risk management, and cybersecurity requirements.',
    'expert',
    jsonb_build_object(
      'experience_years', 10,
      'certifications', ARRAY['CSQE', 'CISSP'],
      'expertise_level', 'senior',
      'response_style', 'methodical'
    )
  ),
  
  -- General Medical Device Consultant
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Dr. Emily Watson - General Medical Device Consultant',
    'general',
    'Experienced medical device consultant with broad knowledge across regulatory, quality, and clinical domains.',
    'active',
    'tier_3',
    ARRAY['Medical Devices', 'Regulatory Affairs', 'Project Management', 'Strategy', 'Compliance'],
    'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    'You are Dr. Emily Watson, a general medical device consultant with 15+ years of experience. You provide strategic guidance across regulatory, quality, and clinical areas.',
    'general',
    jsonb_build_object(
      'experience_years', 15,
      'certifications', ARRAY['RAC', 'PMP', 'CQA'],
      'expertise_level', 'senior',
      'response_style', 'strategic'
    )
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  specializations = EXCLUDED.specializations,
  updated_at = NOW();

-- Log success
DO $$
BEGIN
  RAISE NOTICE '✅ Seeded 6 test agents for Mode 1 workflow testing';
  RAISE NOTICE '   • Dr. Sarah Mitchell - FDA 510(k) Expert';
  RAISE NOTICE '   • Dr. James Chen - Clinical Trials Specialist';
  RAISE NOTICE '   • Maria Rodriguez - QMS & Manufacturing Expert';
  RAISE NOTICE '   • Dr. Lisa Park - Biocompatibility Specialist';
  RAISE NOTICE '   • Robert Kim - Software Validation Expert';
  RAISE NOTICE '   • Dr. Emily Watson - General Consultant';
END $$;

COMMIT;

