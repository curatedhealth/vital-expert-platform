# Complete Persona Schema Reference

**Generated**: 2025-11-16
**Purpose**: Complete documentation of all persona tables, attributes, fields, and constraints

---

## 1. PERSONAS TABLE (76 Columns)

### Core Identity (4 columns)
- `id` (uuid, NOT NULL, default: uuid_generate_v4())
- `tenant_id` (uuid, NULL)
- `name` (text, NOT NULL)
- `slug` (text, NOT NULL)

### Profile Headers (2 columns)
- `title` (text, NULL)
- `tagline` (text, NULL)

### Organizational Links (6 columns)
- `role_id` (uuid, NULL)
- `function_id` (uuid, NULL)
- `department_id` (uuid, NULL)
- `role_slug` (text, NULL)
- `function_slug` (text, NULL)
- `department_slug` (text, NULL)

### Experience & Seniority (4 columns)
- `seniority_level` (text, NULL)
- `years_of_experience` (integer, NULL)
- `years_in_current_role` (integer, NULL)
- `years_in_industry` (integer, NULL)
- `years_in_function` (integer, NULL)

### Organization Context (2 columns)
- `typical_organization_size` (text, NULL)
- `organization_type` (text, NULL)

### Responsibilities & Scope (7 columns)
- `key_responsibilities` (text[], default: ARRAY[]::text[])
- `geographic_scope` (text, NULL)
- `reporting_to` (text, NULL)
- `team_size` (text, NULL)
- `team_size_typical` (integer, NULL)
- `direct_reports` (integer, NULL)
- `span_of_control` (text, NULL)
- `budget_authority` (text, NULL)

### Work Style & Preferences (8 columns)
- `work_style` (text, NULL)
- `work_style_preference` (text, NULL)
- `work_arrangement` (text, NULL)
- `learning_style` (text, NULL)
- `technology_adoption` (text, NULL)
- `risk_tolerance` (text, NULL)
- `change_readiness` (text, NULL)
- `decision_making_style` (text, NULL)

### Demographics (3 columns)
- `age_range` (text, NULL)
- `education_level` (text, NULL)
- `location_type` (text, NULL)

### JSONB Fields (4 columns)
- `pain_points` (jsonb, default: '[]'::jsonb)
- `goals` (jsonb, default: '[]'::jsonb)
- `challenges` (jsonb, default: '[]'::jsonb)
- `communication_preferences` (jsonb, default: '{}'::jsonb)

### Arrays (3 columns)
- `preferred_tools` (text[], default: ARRAY[]::text[])
- `tags` (text[], default: ARRAY[]::text[])
- `metadata` (jsonb, default: '{}'::jsonb)

### Avatar & Visual (3 columns)
- `avatar_url` (text, NULL)
- `avatar_description` (text, NULL)
- `color_code` (text, NULL)
- `icon` (text, NULL)

### Persona Classification (4 columns)
- `persona_type` (text, NULL)
- `segment` (text, NULL)
- `archetype` (text, NULL)
- `journey_stage` (text, NULL)
- `section` (text, NULL)

### Narrative Fields (3 columns)
- `background_story` (text, NULL)
- `a_day_in_the_life` (text, NULL)
- `one_liner` (text, NULL)

### Salary & Compensation (7 columns)
- `salary_min_usd` (integer, NULL)
- `salary_max_usd` (integer, NULL)
- `salary_median_usd` (integer, NULL)
- `salary_currency` (text, default: 'USD'::text)
- `salary_year` (integer, NULL)
- `salary_sources` (text, NULL)
- `geographic_benchmark_scope` (text, NULL)

### Data Quality (4 columns)
- `sample_size` (text, NULL)
- `confidence_level` (text, NULL)
- `data_recency` (text, NULL)
- `notes` (text, NULL)

### Status & Validation (5 columns)
- `is_active` (boolean, default: true)
- `validation_status` (validation_status enum, default: 'draft')
- `validated_by` (uuid, NULL)
- `validated_at` (timestamp, NULL)
- `persona_number` (integer, NULL)

### Timestamps (3 columns)
- `created_at` (timestamp, NOT NULL, default: now())
- `updated_at` (timestamp, NOT NULL, default: now())
- `deleted_at` (timestamp, NULL)

---

## 2. JUNCTION TABLES (38 Tables)

### 2.1 persona_goals (9 columns)
**Purpose**: Specific goals the persona is trying to achieve

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `goal_type` (text, NULL) - CHECK: primary, secondary, long_term, personal
- `goal_text` (text, NULL)
- `priority` (integer, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `goal_type` IN ('primary', 'secondary', 'long_term', 'personal')

---

### 2.2 persona_pain_points (10 columns)
**Purpose**: Problems and pain points the persona experiences

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `pain_category` (text, NULL) - CHECK: operational, strategic, technology, interpersonal
- `pain_description` (text, NULL)
- `pain_point_text` (text, NULL)
- `severity` (text, NULL) - CHECK: critical, high, medium, low
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `pain_category` IN ('operational', 'strategic', 'technology', 'interpersonal')
- `severity` IN ('critical', 'high', 'medium', 'low')

---

### 2.3 persona_challenges (10 columns)
**Purpose**: Challenges the persona faces in their role

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `challenge_type` (text, NULL) - CHECK: daily, weekly, strategic, external
- `challenge_description` (text, NULL)
- `challenge_text` (text, NULL)
- `impact_level` (text, NULL) - CHECK: critical, high, medium, low
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `challenge_type` IN ('daily', 'weekly', 'strategic', 'external')
- `impact_level` IN ('critical', 'high', 'medium', 'low')

---

### 2.4 persona_tools (11 columns) ⚠️ WITH CHECK CONSTRAINTS
**Purpose**: Tools and software the persona uses

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `tool_name` (text, NULL)
- `tool_category` (text, NULL)
- `usage_frequency` (text, NULL) - CHECK: daily, weekly, monthly, occasional, rarely
- `proficiency_level` (text, NULL) - CHECK: expert, proficient, competent, beginner
- `satisfaction_level` (text, NULL) - CHECK: very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `proficiency_level` IN ('expert', 'proficient', 'competent', 'beginner')
- `satisfaction_level` IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')
- `usage_frequency` IN ('daily', 'weekly', 'monthly', 'occasional', 'rarely')

**VALUE MAPPINGS REQUIRED**:
- JSON "advanced" → "proficient"
- JSON "high" → "very_satisfied"
- JSON "medium" → "satisfied"
- JSON "low" → "dissatisfied"

---

### 2.5 persona_frustrations (8 columns)
**Purpose**: What frustrates the persona

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `frustration_text` (text, NULL)
- `emotional_intensity` (text, NULL) - CHECK: high, medium, low
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `emotional_intensity` IN ('high', 'medium', 'low')

---

### 2.6 persona_motivations (9 columns)
**Purpose**: What motivates the persona

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `motivation_category` (text, NULL) - CHECK: professional, personal, organizational
- `motivation_text` (text, NULL)
- `importance` (text, NULL) - CHECK: critical, high, medium, low
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `motivation_category` IN ('professional', 'personal', 'organizational')
- `importance` IN ('critical', 'high', 'medium', 'low')

---

### 2.7 persona_responsibilities (9 columns)
**Purpose**: Key responsibilities of the persona

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `responsibility_type` (text, NULL) - CHECK: key, daily, weekly, periodic
- `responsibility_text` (text, NULL)
- `time_allocation_percent` (integer, NULL) - CHECK: 0-100
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `responsibility_type` IN ('key', 'daily', 'weekly', 'periodic')
- `time_allocation_percent` >= 0 AND <= 100

---

### 2.8 persona_quotes (9 columns)
**Purpose**: Actual or representative quotes from the persona

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `quote_text` (text, NULL)
- `context` (text, NULL)
- `emotion` (text, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.9 persona_vpanes_scoring (14 columns) ⚠️ WITH GENERATED COLUMNS
**Purpose**: VPANES prioritization scoring for personas

- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `value_score` (numeric, NULL) - CHECK: >= 0
- `priority_score` (numeric, NULL) - CHECK: >= 0
- `addressability_score` (numeric, NULL) - CHECK: >= 0
- `need_score` (numeric, NULL) - CHECK: >= 0
- `engagement_score` (numeric, NULL) - CHECK: >= 0
- `scale_score` (numeric, NULL) - CHECK: >= 0
- `scoring_rationale` (text, NULL)
- `created_at` (timestamp, NULL, default: now())
- `updated_at` (timestamp, NULL, default: now())
- **`total_score` (numeric, NULL) - GENERATED COLUMN - DO NOT INSERT**
- **`priority_tier` (text, NULL) - GENERATED COLUMN - DO NOT INSERT**

**Check Constraints**:
- All score fields >= 0

**CRITICAL**: total_score and priority_tier are GENERATED columns and should NOT be included in INSERT statements.

---

### 2.10 persona_evidence_sources (13 columns)
**Purpose**: Research and evidence backing the persona

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `source_type` (text, NULL)
- `citation` (text, NULL)
- `key_finding` (text, NULL)
- `sample_size` (integer, NULL)
- `methodology` (text, NULL)
- `publication_date` (date, NULL)
- `confidence_level` (text, NULL) - CHECK: low, medium, high, very_high
- `url` (text, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `confidence_level` IN ('low', 'medium', 'high', 'very_high')

---

### 2.11 persona_decision_makers (10 columns)
**Purpose**: Key decision makers the persona interacts with

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `stakeholder_role` (text, NULL)
- `decision_maker_role` (text, NULL)
- `influence_level` (text, NULL) - CHECK: final_approver, strong_influence, moderate_influence, low_influence, advisor
- `relationship_quality` (text, NULL) - CHECK: strong, good, neutral, weak
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `influence_level` IN ('final_approver', 'strong_influence', 'moderate_influence', 'low_influence', 'advisor')
- `relationship_quality` IN ('strong', 'good', 'neutral', 'weak')

---

### 2.12 persona_education (11 columns)
**Purpose**: Educational background

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `degree` (text, NULL)
- `degree_level` (text, NULL)
- `field_of_study` (text, NULL)
- `institution` (text, NULL)
- `year_completed` (integer, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.13 persona_certifications (10 columns)
**Purpose**: Professional certifications

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `certification_name` (text, NULL)
- `issuing_organization` (text, NULL)
- `year_obtained` (integer, NULL)
- `is_current` (boolean, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.14 persona_success_metrics (8 columns)
**Purpose**: How the persona measures success

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `metric_name` (text, NULL)
- `metric_description` (text, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.15 persona_communication_channels (11 columns)
**Purpose**: Preferred communication channels

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `channel_name` (text, NULL)
- `preference_level` (text, NULL) - CHECK: preferred, acceptable, avoid, never
- `best_time_of_day` (text, NULL)
- `best_day_of_week` (text, NULL)
- `response_time_expectation` (text, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `preference_level` IN ('preferred', 'acceptable', 'avoid', 'never')

---

### 2.16 persona_typical_day (10 columns)
**Purpose**: A day in the life activities

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `time_of_day` (text, NULL)
- `activity_description` (text, NULL)
- `energy_level` (text, NULL) - CHECK: high, medium, low
- `sort_order` (integer, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `energy_level` IN ('high', 'medium', 'low')

---

### 2.17 persona_information_sources (7 columns)
**Purpose**: Trusted information sources

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `source_type` (text, NULL) - CHECK: publication, conference, network, analyst, vendor, social_media, podcast, newsletter
- `source_name` (text, NOT NULL)
- `trust_level` (text, NULL) - CHECK: highly_trusted, trusted, somewhat_trusted, not_trusted
- `usage_frequency` (text, NULL) - CHECK: daily, weekly, monthly, quarterly, as_needed
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `source_type` IN ('publication', 'conference', 'network', 'analyst', 'vendor', 'social_media', 'podcast', 'newsletter')
- `trust_level` IN ('highly_trusted', 'trusted', 'somewhat_trusted', 'not_trusted')
- `usage_frequency` IN ('daily', 'weekly', 'monthly', 'quarterly', 'as_needed')

---

### 2.18 persona_values (9 columns)
**Purpose**: Core values

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `value_name` (text, NULL)
- `value_description` (text, NULL)
- `rank_order` (integer, NULL)
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.19 persona_personality_traits (9 columns)
**Purpose**: Personality characteristics

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NULL)
- `trait_name` (text, NULL)
- `trait_description` (text, NULL)
- `strength` (text, NULL) - CHECK: dominant, strong, moderate, mild
- `sequence_order` (integer, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `strength` IN ('dominant', 'strong', 'moderate', 'mild')

---

### 2.20 persona_decision_authority (6 columns)
**Purpose**: Decision-making authority

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `decision_area` (text, NOT NULL)
- `authority_level` (text, NULL) - CHECK: full, approval_required, recommend_only, none
- `budget_limit` (text, NULL)
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `authority_level` IN ('full', 'approval_required', 'recommend_only', 'none')

---

### 2.21 persona_buying_process (7 columns)
**Purpose**: Buying/procurement process involvement

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `role_in_purchase` (text, NULL)
- `decision_timeframe` (text, NULL)
- `typical_budget_range` (text, NULL)
- `approval_process_complexity` (text, NULL) - CHECK: simple, moderate, complex, very_complex
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `approval_process_complexity` IN ('simple', 'moderate', 'complex', 'very_complex')

---

### 2.22 persona_buying_triggers (6 columns)
**Purpose**: What triggers a buying decision

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `trigger_type` (text, NULL) - CHECK: regulatory, competitive, internal_initiative, crisis, growth
- `trigger_description` (text, NOT NULL)
- `urgency_level` (text, NULL) - CHECK: immediate, high, medium, low
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `trigger_type` IN ('regulatory', 'competitive', 'internal_initiative', 'crisis', 'growth')
- `urgency_level` IN ('immediate', 'high', 'medium', 'low')

---

### 2.23 persona_purchase_barriers (6 columns)
**Purpose**: Barriers to purchase

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `barrier_type` (text, NULL) - CHECK: budget, political, technical, organizational, timing
- `barrier_description` (text, NOT NULL)
- `severity` (text, NULL) - CHECK: blocking, significant, moderate, minor
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `barrier_type` IN ('budget', 'political', 'technical', 'organizational', 'timing')
- `severity` IN ('blocking', 'significant', 'moderate', 'minor')

---

### 2.24 persona_purchase_influencers (6 columns)
**Purpose**: Who influences purchasing decisions

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `influencer_type` (text, NULL)
- `influencer_name` (text, NULL)
- `influence_strength` (text, NULL) - CHECK: very_strong, strong, moderate, weak
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `influence_strength` IN ('very_strong', 'strong', 'moderate', 'weak')

---

### 2.25 persona_evaluation_criteria (7 columns)
**Purpose**: How solutions are evaluated

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `criterion_name` (text, NOT NULL)
- `criterion_category` (text, NULL) - CHECK: must_have, important, nice_to_have
- `criterion_description` (text, NULL)
- `weight` (integer, NULL)
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `criterion_category` IN ('must_have', 'important', 'nice_to_have')

---

### 2.26 persona_fears (5 columns)
**Purpose**: Professional fears

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `fear_description` (text, NOT NULL)
- `likelihood` (text, NULL) - CHECK: high, medium, low
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `likelihood` IN ('high', 'medium', 'low')

---

### 2.27 persona_aspirations (5 columns)
**Purpose**: Career aspirations

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `aspiration_text` (text, NOT NULL)
- `timeframe` (text, NULL) - CHECK: short_term, medium_term, long_term
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `timeframe` IN ('short_term', 'medium_term', 'long_term')

---

### 2.28 persona_typical_locations (8 columns)
**Purpose**: Where the persona typically works

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `location_name` (text, NULL)
- `location_type` (text, NULL) - CHECK: city, region, country, hub
- `is_primary` (boolean, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

**Check Constraints**:
- `location_type` IN ('city', 'region', 'country', 'hub')

---

### 2.29 persona_organization_types (7 columns)
**Purpose**: Types of organizations this persona works in

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tenant_id` (uuid, NOT NULL)
- `organization_type` (text, NULL)
- `is_typical` (boolean, NULL)
- `created_at` (timestamp, NULL)
- `updated_at` (timestamp, NULL)

---

### 2.30 persona_communication_style (7 columns)
**Purpose**: Communication preferences

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `preferred_style` (text, NULL)
- `meeting_length_preference` (text, NULL)
- `presentation_style` (text, NULL)
- `decision_pace` (text, NULL) - CHECK: fast, moderate, deliberate, slow
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `decision_pace` IN ('fast', 'moderate', 'deliberate', 'slow')

---

### 2.31 persona_content_preferences (7 columns)
**Purpose**: Content type preferences

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `content_type` (text, NOT NULL)
- `preference_level` (text, NULL) - CHECK: strongly_prefer, prefer, neutral, avoid
- `ideal_length` (text, NULL)
- `ideal_format` (text, NULL)
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `preference_level` IN ('strongly_prefer', 'prefer', 'neutral', 'avoid')

---

### 2.32 persona_content_format_preferences (5 columns)
**Purpose**: Specific content format preferences

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `format_element` (text, NOT NULL)
- `preference` (text, NULL) - CHECK: required, preferred, neutral, avoid
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `preference` IN ('required', 'preferred', 'neutral', 'avoid')

---

### 2.33 persona_social_media (8 columns)
**Purpose**: Social media usage

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `platform_name` (text, NOT NULL)
- `activity_level` (text, NULL) - CHECK: very_active, active, moderate, low, inactive
- `primary_usage` (text, NULL)
- `post_frequency` (text, NULL)
- `follower_count_range` (text, NULL)
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `activity_level` IN ('very_active', 'active', 'moderate', 'low', 'inactive')

---

### 2.34 persona_groups_memberships (6 columns)
**Purpose**: Professional group memberships

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `group_name` (text, NOT NULL)
- `platform` (text, NULL)
- `participation_level` (text, NULL) - CHECK: very_active, active, lurker, inactive
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `participation_level` IN ('very_active', 'active', 'lurker', 'inactive')

---

### 2.35 persona_influencers_followed (6 columns)
**Purpose**: Industry influencers followed

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `influencer_name` (text, NOT NULL)
- `influencer_type` (text, NULL)
- `platform` (text, NULL)
- `created_at` (timestamp, NULL)

---

### 2.36 persona_touchpoints (7 columns)
**Purpose**: Key customer/user touchpoints

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `touchpoint_name` (text, NOT NULL)
- `touchpoint_type` (text, NULL)
- `importance` (text, NULL) - CHECK: critical, high, medium, low
- `frequency` (text, NULL)
- `created_at` (timestamp, NULL)

**Check Constraints**:
- `importance` IN ('critical', 'high', 'medium', 'low')

---

### 2.37 persona_tags (5 columns)
**Purpose**: Tags for categorization

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `tag_name` (text, NOT NULL)
- `tag_category` (text, NULL)
- `created_at` (timestamp, NULL)

---

### 2.38 persona_metadata (6 columns)
**Purpose**: Additional key-value metadata

- `id` (uuid, NOT NULL)
- `persona_id` (uuid, NOT NULL)
- `meta_key` (text, NOT NULL)
- `meta_value` (text, NOT NULL)
- `data_type` (text, NULL)
- `created_at` (timestamp, NULL)

---

## 3. Summary of Check Constraints (45 Total)

### Critical Enum Mappings for Data Loading

#### persona_tools
- `proficiency_level`: expert, proficient, competent, beginner
  - **JSON Mapping**: "advanced" → "proficient"
- `satisfaction_level`: very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied
  - **JSON Mapping**: "high" → "very_satisfied", "medium" → "satisfied", "low" → "dissatisfied"
- `usage_frequency`: daily, weekly, monthly, occasional, rarely

#### persona_goals
- `goal_type`: primary, secondary, long_term, personal
- `priority`: integer (1, 2, 3)
  - **JSON Mapping**: "high" → 1, "medium" → 2, "low" → 3

#### persona_pain_points
- `pain_category`: operational, strategic, technology, interpersonal
- `severity`: critical, high, medium, low

#### persona_challenges
- `challenge_type`: daily, weekly, strategic, external
- `impact_level`: critical, high, medium, low

#### persona_vpanes_scoring
- All score fields must be >= 0
- **total_score**: GENERATED COLUMN - DO NOT INSERT
- **priority_tier**: GENERATED COLUMN - DO NOT INSERT

---

## 4. Loading Checklist

Before loading persona data, ensure:

- [ ] All enum values are mapped correctly (see section 3)
- [ ] GENERATED columns (total_score, priority_tier) are NOT in INSERT statements
- [ ] Priority values are integers (1, 2, 3) not strings ('high', 'medium', 'low')
- [ ] NULL values are unquoted (not 'NULL')
- [ ] Single quotes in text are properly escaped (doubled)
- [ ] Foreign keys (function_id, department_id, role_id) are valid UUIDs
- [ ] Tenant_id is set correctly for all records
- [ ] Check constraints are validated before attempting load

---

**Generated from database**: 2025-11-16
**Status**: Production-ready reference
**Tested with**: Medical Affairs (67 personas)
