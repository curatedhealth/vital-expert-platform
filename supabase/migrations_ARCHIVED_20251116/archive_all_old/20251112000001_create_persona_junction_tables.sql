-- ============================================================================
-- NEW DB SETUP: Persona Junction Tables
-- Creates proper normalized structure for persona attributes
-- No more JSON strings! Use proper junction tables for many-to-many relationships
-- ============================================================================

-- ============================================================================
-- 1. PERSONA RESPONSIBILITIES (what they do)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_responsibilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    org_responsibility_id uuid REFERENCES public.org_responsibilities(id) ON DELETE SET NULL,
    responsibility_text text NOT NULL,
    priority integer CHECK (priority BETWEEN 1 AND 10),
    time_allocation_pct integer CHECK (time_allocation_pct BETWEEN 0 AND 100),
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, org_responsibility_id),
    UNIQUE(persona_id, responsibility_text)
);

CREATE INDEX idx_persona_responsibilities_persona ON public.persona_responsibilities(persona_id);
CREATE INDEX idx_persona_responsibilities_org_resp ON public.persona_responsibilities(org_responsibility_id);

COMMENT ON TABLE public.persona_responsibilities IS 'Junction table linking personas to their responsibilities';
COMMENT ON COLUMN public.persona_responsibilities.org_responsibility_id IS 'Link to standard org responsibility if applicable';
COMMENT ON COLUMN public.persona_responsibilities.responsibility_text IS 'Free text responsibility if not in standard list';

-- ============================================================================
-- 2. PERSONA PAIN POINTS (what frustrates them)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_pain_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    pain_point_text text NOT NULL,
    category text CHECK (category IN ('process', 'technology', 'resource', 'knowledge', 'communication', 'compliance', 'other')),
    severity integer CHECK (severity BETWEEN 1 AND 10),
    frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rarely')),
    impact_area text, -- 'productivity', 'quality', 'time', 'budget', 'morale'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, pain_point_text)
);

CREATE INDEX idx_persona_pain_points_persona ON public.persona_pain_points(persona_id);
CREATE INDEX idx_persona_pain_points_category ON public.persona_pain_points(category);
CREATE INDEX idx_persona_pain_points_severity ON public.persona_pain_points(severity DESC);

COMMENT ON TABLE public.persona_pain_points IS 'Specific pain points and frustrations for each persona';

-- ============================================================================
-- 3. PERSONA GOALS (what they want to achieve)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    goal_text text NOT NULL,
    goal_type text CHECK (goal_type IN ('strategic', 'tactical', 'personal', 'team', 'organizational')),
    time_horizon text CHECK (time_horizon IN ('immediate', 'short_term', 'medium_term', 'long_term')),
    priority integer CHECK (priority BETWEEN 1 AND 10),
    measurable_outcome text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, goal_text)
);

CREATE INDEX idx_persona_goals_persona ON public.persona_goals(persona_id);
CREATE INDEX idx_persona_goals_type ON public.persona_goals(goal_type);
CREATE INDEX idx_persona_goals_priority ON public.persona_goals(priority DESC);

COMMENT ON TABLE public.persona_goals IS 'Goals and objectives for each persona';

-- ============================================================================
-- 4. PERSONA NEEDS (what they require to succeed)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_needs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    need_text text NOT NULL,
    need_category text CHECK (need_category IN ('information', 'tool', 'skill', 'resource', 'support', 'authority', 'other')),
    urgency integer CHECK (urgency BETWEEN 1 AND 10),
    current_gap text, -- How well is this need currently met?
    desired_state text, -- What would ideal look like?
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, need_text)
);

CREATE INDEX idx_persona_needs_persona ON public.persona_needs(persona_id);
CREATE INDEX idx_persona_needs_category ON public.persona_needs(need_category);
CREATE INDEX idx_persona_needs_urgency ON public.persona_needs(urgency DESC);

COMMENT ON TABLE public.persona_needs IS 'Specific needs and requirements for each persona';

-- ============================================================================
-- 5. PERSONA BEHAVIORS (how they work)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_behaviors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    behavior_text text NOT NULL,
    behavior_type text CHECK (behavior_type IN ('communication', 'decision_making', 'work_style', 'collaboration', 'learning', 'risk_taking', 'other')),
    frequency text CHECK (frequency IN ('always', 'usually', 'sometimes', 'rarely', 'never')),
    context text, -- When does this behavior occur?
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, behavior_text)
);

CREATE INDEX idx_persona_behaviors_persona ON public.persona_behaviors(persona_id);
CREATE INDEX idx_persona_behaviors_type ON public.persona_behaviors(behavior_type);

COMMENT ON TABLE public.persona_behaviors IS 'Behavioral patterns and work styles for each persona';

-- ============================================================================
-- 6. PERSONA TYPICAL TITLES (alternative job titles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.persona_typical_titles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    title text NOT NULL,
    is_primary boolean DEFAULT false,
    seniority_level text CHECK (seniority_level IN ('entry', 'mid', 'senior', 'executive', 'c_level')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(persona_id, title)
);

CREATE INDEX idx_persona_typical_titles_persona ON public.persona_typical_titles(persona_id);

COMMENT ON TABLE public.persona_typical_titles IS 'Alternative job titles for each persona';

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================================================

ALTER TABLE public.persona_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_typical_titles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming personas table has tenant_id)
CREATE POLICY persona_responsibilities_tenant_isolation ON public.persona_responsibilities
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY persona_pain_points_tenant_isolation ON public.persona_pain_points
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY persona_goals_tenant_isolation ON public.persona_goals
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY persona_needs_tenant_isolation ON public.persona_needs
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY persona_behaviors_tenant_isolation ON public.persona_behaviors
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY persona_typical_titles_tenant_isolation ON public.persona_typical_titles
    USING (persona_id IN (SELECT id FROM public.personas WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- ============================================================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_persona_responsibilities_updated_at BEFORE UPDATE ON public.persona_responsibilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_pain_points_updated_at BEFORE UPDATE ON public.persona_pain_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_goals_updated_at BEFORE UPDATE ON public.persona_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_needs_updated_at BEFORE UPDATE ON public.persona_needs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_behaviors_updated_at BEFORE UPDATE ON public.persona_behaviors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify data:

-- SELECT p.name, COUNT(pr.id) as num_responsibilities
-- FROM personas p
-- LEFT JOIN persona_responsibilities pr ON p.id = pr.persona_id
-- GROUP BY p.id, p.name
-- ORDER BY num_responsibilities DESC;

-- SELECT p.name, COUNT(pp.id) as num_pain_points, AVG(pp.severity) as avg_severity
-- FROM personas p
-- LEFT JOIN persona_pain_points pp ON p.id = pp.persona_id
-- GROUP BY p.id, p.name
-- ORDER BY avg_severity DESC NULLS LAST;

-- SELECT p.name, COUNT(pg.id) as num_goals
-- FROM personas p
-- LEFT JOIN persona_goals pg ON p.id = pg.persona_id
-- GROUP BY p.id, p.name
-- ORDER BY num_goals DESC;
