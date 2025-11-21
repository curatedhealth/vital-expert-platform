-- Create jtbd_core table for Jobs-to-be-Done framework
-- This table stores the core jobs that users need to accomplish

-- First create jtbd_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS jtbd_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- hex color for UI
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jtbd_core table
CREATE TABLE IF NOT EXISTS jtbd_core (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    job_statement TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES jtbd_categories(id) ON DELETE SET NULL,

    -- Core JTBD framework fields
    when_situation TEXT, -- When the user is in this situation
    desired_outcome TEXT, -- What they want to accomplish
    pain_points JSONB, -- Array of pain points/frustrations
    current_solutions JSONB, -- How they currently solve this
    success_criteria JSONB, -- How they measure success

    -- Metadata
    target_personas TEXT[], -- Target user personas
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    tags TEXT[],
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jtbd_core_category_id ON jtbd_core(category_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_core_status ON jtbd_core(status);
CREATE INDEX IF NOT EXISTS idx_jtbd_core_priority ON jtbd_core(priority);
CREATE INDEX IF NOT EXISTS idx_jtbd_core_tags ON jtbd_core USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_jtbd_core_target_personas ON jtbd_core USING GIN(target_personas);

-- Create updated_at trigger for jtbd_core
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jtbd_core_updated_at
    BEFORE UPDATE ON jtbd_core
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jtbd_categories_updated_at
    BEFORE UPDATE ON jtbd_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO jtbd_categories (name, description, color, sort_order)
VALUES
    ('Healthcare Operations', 'Jobs related to healthcare delivery and operations', '#10B981', 1),
    ('Clinical Decision Making', 'Jobs related to clinical decisions and patient care', '#3B82F6', 2),
    ('Regulatory Compliance', 'Jobs related to compliance and regulatory requirements', '#EF4444', 3),
    ('Business Intelligence', 'Jobs related to data analysis and business insights', '#8B5CF6', 4),
    ('Patient Experience', 'Jobs related to patient interactions and experience', '#F59E0B', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample JTBD records
INSERT INTO jtbd_core (name, job_statement, description, category_id, when_situation, desired_outcome, pain_points, current_solutions, success_criteria, target_personas, priority, tags)
VALUES
    (
        'Get Fast Clinical Decision Support',
        'When I need to make a complex clinical decision, I want to get evidence-based recommendations quickly so that I can provide optimal patient care.',
        'Healthcare providers need rapid access to clinical guidelines and evidence-based decision support during patient encounters.',
        (SELECT id FROM jtbd_categories WHERE name = 'Clinical Decision Making'),
        'Seeing a patient with complex symptoms or multiple conditions',
        'Make confident, evidence-based clinical decisions within minutes',
        '["Overwhelmed by information", "Time pressure", "Risk of missing important details", "Difficulty finding relevant guidelines"]'::jsonb,
        '["Manual literature search", "Consulting colleagues", "Using clinical decision tools", "Relying on experience"]'::jsonb,
        '["Decision made within 5 minutes", "Evidence clearly cited", "Confidence in recommendation", "Improved patient outcomes"]'::jsonb,
        ARRAY['physicians', 'nurses', 'clinical_specialists'],
        'high',
        ARRAY['clinical-support', 'decision-making', 'evidence-based']
    ),
    (
        'Ensure Regulatory Compliance',
        'When implementing new healthcare processes, I want to verify compliance with all relevant regulations so that I can avoid penalties and maintain accreditation.',
        'Healthcare organizations need to ensure all processes meet regulatory requirements across multiple frameworks.',
        (SELECT id FROM jtbd_categories WHERE name = 'Regulatory Compliance'),
        'Implementing new clinical or operational processes',
        'Achieve 100% compliance with all applicable regulations',
        '["Complex regulatory landscape", "Frequent changes in requirements", "Multiple overlapping frameworks", "High cost of non-compliance"]'::jsonb,
        '["Manual compliance checklists", "Consulting legal teams", "External compliance consultants", "Risk management systems"]'::jsonb,
        '["Zero compliance violations", "Passed audits", "Reduced legal risk", "Streamlined approval processes"]'::jsonb,
        ARRAY['compliance_officers', 'administrators', 'legal_teams'],
        'critical',
        ARRAY['compliance', 'regulations', 'risk-management']
    ),
    (
        'Optimize Operational Efficiency',
        'When managing healthcare operations, I want to identify bottlenecks and improvement opportunities so that I can deliver better patient care while reducing costs.',
        'Healthcare administrators need to continuously optimize operations to balance quality care with cost effectiveness.',
        (SELECT id FROM jtbd_categories WHERE name = 'Healthcare Operations'),
        'Reviewing operational performance metrics and patient flow',
        'Improve efficiency by 20% while maintaining quality standards',
        '["Complex interdependencies", "Limited visibility into processes", "Resistance to change", "Competing priorities"]'::jsonb,
        '["Manual process analysis", "External consultants", "Staff feedback sessions", "Basic analytics tools"]'::jsonb,
        '["Reduced wait times", "Lower operational costs", "Improved staff satisfaction", "Better patient outcomes"]'::jsonb,
        ARRAY['administrators', 'operations_managers', 'department_heads'],
        'high',
        ARRAY['operations', 'efficiency', 'cost-reduction']
    )
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE jtbd_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_core ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON jtbd_categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON jtbd_core FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON jtbd_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON jtbd_core TO authenticated;