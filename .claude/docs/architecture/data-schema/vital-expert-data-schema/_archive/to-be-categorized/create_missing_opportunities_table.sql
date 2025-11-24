-- ============================================================================
-- QUICK FIX: Create opportunities table if missing
-- This is a minimal version to unblock the Gen AI migration
-- ============================================================================

-- Create required enumerations if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_type') THEN
        CREATE TYPE archetype_type AS ENUM (
            'AUTOMATOR',
            'ORCHESTRATOR',
            'LEARNER',
            'SKEPTIC'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_function') THEN
        CREATE TYPE business_function AS ENUM (
            'MEDICAL_AFFAIRS', 'SALES', 'MARKETING', 'FINANCE', 'HR',
            'ENGINEERING', 'PRODUCT', 'OPERATIONS', 'CUSTOMER_SUCCESS',
            'LEGAL', 'REGULATORY', 'SUPPLY_CHAIN', 'R_AND_D',
            'MARKET_ACCESS', 'IT', 'CORPORATE_STRATEGY'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_layer') THEN
        CREATE TYPE service_layer AS ENUM (
            'ASK_EXPERT',
            'ASK_PANEL',
            'WORKFLOWS',
            'SOLUTION_BUILDER'
        );
    END IF;
END $$;

-- Create opportunities table if it doesn't exist
CREATE TABLE IF NOT EXISTS opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Opportunity Definition
    opportunity_name VARCHAR(255) NOT NULL,
    opportunity_description TEXT NOT NULL,
    opportunity_category VARCHAR(100),
    
    -- Targeting
    target_archetype archetype_type,
    target_functions business_function[],
    target_personas UUID[],
    
    -- Impact Scoring
    reach_score DECIMAL(5,2) CHECK (reach_score >= 0 AND reach_score <= 100),
    impact_score DECIMAL(5,2) CHECK (impact_score >= 0 AND impact_score <= 100),
    feasibility_score DECIMAL(5,2) CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    adoption_readiness_score DECIMAL(5,2) CHECK (adoption_readiness_score >= 0 AND adoption_readiness_score <= 100),
    overall_score DECIMAL(5,2),
    
    -- Solution
    recommended_service_layer service_layer,
    solution_description TEXT,
    
    -- Value
    estimated_time_savings_hours_per_week DECIMAL(8,2),
    estimated_annual_value_usd DECIMAL(15,2),
    
    -- Status
    status VARCHAR(50),
    priority VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    assigned_to UUID,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_opportunities_archetype ON opportunities(target_archetype);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);

-- Add comment
COMMENT ON TABLE opportunities IS 'AI opportunities discovered through persona and JTBD analysis';

