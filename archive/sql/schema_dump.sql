


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."agent_domain" AS ENUM (
    'design_ux',
    'healthcare_clinical',
    'technology_engineering',
    'business_strategy',
    'global_regulatory',
    'patient_advocacy'
);


ALTER TYPE "public"."agent_domain" OWNER TO "postgres";


CREATE TYPE "public"."agent_status" AS ENUM (
    'development',
    'testing',
    'active',
    'deprecated'
);


ALTER TYPE "public"."agent_status" OWNER TO "postgres";


CREATE TYPE "public"."data_classification" AS ENUM (
    'public',
    'internal',
    'confidential',
    'restricted'
);


ALTER TYPE "public"."data_classification" OWNER TO "postgres";


CREATE TYPE "public"."domain_expertise" AS ENUM (
    'medical',
    'regulatory',
    'legal',
    'financial',
    'business',
    'technical',
    'commercial',
    'access',
    'general'
);


ALTER TYPE "public"."domain_expertise" OWNER TO "postgres";


CREATE TYPE "public"."lifecycle_stage" AS ENUM (
    'unmet_needs_investigation',
    'solution_design',
    'prototyping_development',
    'clinical_validation',
    'regulatory_pathway',
    'reimbursement_strategy',
    'go_to_market',
    'post_market_optimization'
);


ALTER TYPE "public"."lifecycle_stage" OWNER TO "postgres";


CREATE TYPE "public"."maturity_level" AS ENUM (
    'level_1_initial',
    'level_2_developing',
    'level_3_advanced',
    'level_4_leading',
    'level_5_transformative'
);


ALTER TYPE "public"."maturity_level" OWNER TO "postgres";


CREATE TYPE "public"."permission_action" AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'execute',
    'manage'
);


ALTER TYPE "public"."permission_action" OWNER TO "postgres";


CREATE TYPE "public"."permission_scope" AS ENUM (
    'llm_providers',
    'agents',
    'workflows',
    'analytics',
    'system_settings',
    'user_management',
    'audit_logs'
);


ALTER TYPE "public"."permission_scope" OWNER TO "postgres";


CREATE TYPE "public"."priority_level" AS ENUM (
    'critical_immediate',
    'near_term_90_days',
    'strategic_180_days',
    'future_horizon'
);


ALTER TYPE "public"."priority_level" OWNER TO "postgres";


CREATE TYPE "public"."provider_status" AS ENUM (
    'initializing',
    'active',
    'error',
    'maintenance',
    'disabled'
);


ALTER TYPE "public"."provider_status" OWNER TO "postgres";


CREATE TYPE "public"."provider_type" AS ENUM (
    'openai',
    'anthropic',
    'google',
    'azure',
    'aws_bedrock',
    'cohere',
    'huggingface',
    'custom'
);


ALTER TYPE "public"."provider_type" OWNER TO "postgres";


CREATE TYPE "public"."risk_level" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."risk_level" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'admin',
    'llm_manager',
    'user',
    'viewer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."validation_status" AS ENUM (
    'validated',
    'pending',
    'in_review',
    'expired',
    'not_required'
);


ALTER TYPE "public"."validation_status" OWNER TO "postgres";


CREATE TYPE "public"."vital_framework" AS ENUM (
    'V_value_discovery',
    'I_intelligence_gathering',
    'T_transformation_design',
    'A_acceleration_execution',
    'L_leadership_scale'
);


ALTER TYPE "public"."vital_framework" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."aggregate_daily_metrics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO llm_provider_metrics (
    provider_id,
    metric_date,
    total_requests,
    successful_requests,
    failed_requests,
    total_input_tokens,
    total_output_tokens,
    total_cost,
    avg_cost_per_request,
    avg_latency_ms,
    p95_latency_ms,
    p99_latency_ms,
    max_latency_ms,
    timeout_count,
    rate_limit_count,
    unique_users_count,
    phi_requests_count
  )
  SELECT
    llm_provider_id,
    DATE(created_at) as metric_date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_requests,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost_per_request,
    AVG(latency_ms) as avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency_ms,
    MAX(latency_ms) as max_latency_ms,
    SUM(CASE WHEN status = 'timeout' THEN 1 ELSE 0 END) as timeout_count,
    SUM(CASE WHEN status = 'rate_limited' THEN 1 ELSE 0 END) as rate_limit_count,
    COUNT(DISTINCT user_id) as unique_users_count,
    SUM(CASE WHEN contains_phi THEN 1 ELSE 0 END) as phi_requests_count
  FROM llm_usage_logs
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY llm_provider_id, DATE(created_at)
  ON CONFLICT (provider_id, metric_date, metric_hour)
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    successful_requests = EXCLUDED.successful_requests,
    failed_requests = EXCLUDED.failed_requests,
    total_input_tokens = EXCLUDED.total_input_tokens,
    total_output_tokens = EXCLUDED.total_output_tokens,
    total_cost = EXCLUDED.total_cost,
    avg_cost_per_request = EXCLUDED.avg_cost_per_request,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms,
    p99_latency_ms = EXCLUDED.p99_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    timeout_count = EXCLUDED.timeout_count,
    rate_limit_count = EXCLUDED.rate_limit_count,
    unique_users_count = EXCLUDED.unique_users_count,
    phi_requests_count = EXCLUDED.phi_requests_count;
END;
$$;


ALTER FUNCTION "public"."aggregate_daily_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_security_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := get_current_user_email();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, new_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, old_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      inet_client_addr()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."audit_security_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_job_duration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If job is completing and we have start time, calculate duration
    IF NEW.status IN ('completed', 'failed') AND OLD.status = 'processing' AND NEW.started_at IS NOT NULL THEN
        NEW.completed_at = NOW();
        NEW.actual_duration_minutes = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 60;
    END IF;

    -- If job is starting, set started_at
    IF NEW.status = 'processing' AND OLD.status IN ('pending', 'queued') THEN
        NEW.started_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_job_duration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_permission"("user_email" "text", "required_scope" "public"."permission_scope", "required_action" "public"."permission_action") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = true;

  -- If user not found, deny access
  IF user_role_val IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user has the required permission
  RETURN EXISTS (
    SELECT 1
    FROM role_permissions
    WHERE role = user_role_val
    AND scope = required_scope
    AND action = required_action
  );
END;
$$;


ALTER FUNCTION "public"."check_user_permission"("user_email" "text", "required_scope" "public"."permission_scope", "required_action" "public"."permission_action") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_jobs"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM jobs
    WHERE status IN ('completed', 'failed')
    AND completed_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_jobs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_agent_assigned_capabilities"("agent_name_param" "text") RETURNS TABLE("id" "uuid", "name" "text", "display_name" "text", "description" "text", "stage" "text", "vital_component" "text", "relationship_type" "text", "expertise_score" numeric, "competencies" "jsonb", "last_review" timestamp with time zone, "contribution_notes" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name::TEXT,
        c.capability_key::TEXT as display_name,
        c.description::TEXT,
        c.stage::TEXT,
        c.vital_component::TEXT,
        ca.relationship_type::TEXT,
        ca.expertise_score,
        c.competencies,
        ca.last_review,
        ca.contribution_notes::TEXT
    FROM capabilities c
    INNER JOIN capability_agents ca ON c.id = ca.capability_id
    INNER JOIN expert_agents ea ON ca.agent_id = ea.id
    WHERE ea.name = agent_name_param
    AND c.status = 'active'
    ORDER BY ca.expertise_score DESC, c.stage, c.name;
END;
$$;


ALTER FUNCTION "public"."get_agent_assigned_capabilities"("agent_name_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_capabilities_for_agent"("agent_name_param" "text") RETURNS TABLE("id" "uuid", "name" "text", "display_name" "text", "description" "text", "stage" "text", "vital_component" "text", "priority" "text", "maturity" "text", "competencies" "jsonb", "is_assigned" boolean, "assignment_priority" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name::TEXT,
        c.capability_key::TEXT as display_name,
        c.description::TEXT,
        c.stage::TEXT,
        c.vital_component::TEXT,
        c.priority::TEXT,
        c.maturity::TEXT,
        c.competencies,
        CASE WHEN ca.capability_id IS NOT NULL THEN true ELSE false END as is_assigned,
        COALESCE(ca.expertise_score * 100, 0)::INTEGER as assignment_priority
    FROM capabilities c
    LEFT JOIN capability_agents ca ON c.id = ca.capability_id
        AND ca.agent_id = (
            SELECT ea.id FROM expert_agents ea
            WHERE ea.name = agent_name_param
            LIMIT 1
        )
    WHERE c.status = 'active'
    ORDER BY
        is_assigned DESC,
        assignment_priority DESC,
        c.stage,
        c.name;
END;
$$;


ALTER FUNCTION "public"."get_available_capabilities_for_agent"("agent_name_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_capabilities_by_stage"("stage_param" "text") RETURNS TABLE("id" "uuid", "capability_key" "text", "name" "text", "description" "text", "vital_component" "text", "priority" "text", "maturity" "text", "is_new" boolean, "panel_recommended" boolean, "competencies" "jsonb", "lead_agent_name" "text", "lead_agent_org" "text", "supporting_agents_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.capability_key::TEXT,
        c.name::TEXT,
        c.description::TEXT,
        c.vital_component::TEXT,
        c.priority::TEXT,
        c.maturity::TEXT,
        c.is_new,
        c.panel_recommended,
        c.competencies,
        lead_agent.name::TEXT as lead_agent_name,
        lead_agent.organization::TEXT as lead_agent_org,
        COALESCE(supporting_count.count, 0)::INTEGER as supporting_agents_count
    FROM capabilities c
    LEFT JOIN capability_agents lead_ca ON c.id = lead_ca.capability_id AND lead_ca.relationship_type = 'lead'
    LEFT JOIN expert_agents lead_agent ON lead_ca.agent_id = lead_agent.id
    LEFT JOIN (
        SELECT
            capability_id,
            COUNT(*) as count
        FROM capability_agents
        WHERE relationship_type != 'lead'
        GROUP BY capability_id
    ) supporting_count ON c.id = supporting_count.capability_id
    WHERE c.stage::TEXT = stage_param
    AND c.status = 'active'
    ORDER BY
        CASE c.priority
            WHEN 'critical_immediate' THEN 1
            WHEN 'near_term_90_days' THEN 2
            WHEN 'strategic_180_days' THEN 3
            WHEN 'future_horizon' THEN 4
        END,
        c.name;
END;
$$;


ALTER FUNCTION "public"."get_capabilities_by_stage"("stage_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_email"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  );
END;
$$;


ALTER FUNCTION "public"."get_current_user_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = true;

  RETURN user_role_val IN ('admin', 'super_admin');
END;
$$;


ALTER FUNCTION "public"."is_admin_user"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_llm_provider_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_llm_provider_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quota_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update user quotas
  IF NEW.user_id IS NOT NULL THEN
    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_cost,
        updated_at = NOW()
    WHERE entity_type = 'user'
      AND entity_id = NEW.user_id
      AND quota_type = 'cost'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);

    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_tokens,
        updated_at = NOW()
    WHERE entity_type = 'user'
      AND entity_id = NEW.user_id
      AND quota_type = 'tokens'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);
  END IF;

  -- Update agent quotas
  IF NEW.agent_id IS NOT NULL THEN
    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_cost,
        updated_at = NOW()
    WHERE entity_type = 'agent'
      AND entity_id = NEW.agent_id
      AND quota_type = 'cost'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_quota_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "avatar" character varying(100),
    "color" character varying(7),
    "version" character varying(20) DEFAULT '1.0.0'::character varying,
    "model" character varying(50) DEFAULT 'gpt-4'::character varying NOT NULL,
    "system_prompt" "text" NOT NULL,
    "temperature" numeric(3,2) DEFAULT 0.7,
    "max_tokens" integer DEFAULT 2000,
    "rag_enabled" boolean DEFAULT true,
    "context_window" integer DEFAULT 8000,
    "response_format" character varying(20) DEFAULT 'markdown'::character varying,
    "capabilities" "text"[] NOT NULL,
    "knowledge_domains" "text"[],
    "domain_expertise" "public"."domain_expertise" DEFAULT 'general'::"public"."domain_expertise" NOT NULL,
    "competency_levels" "jsonb" DEFAULT '{}'::"jsonb",
    "knowledge_sources" "jsonb" DEFAULT '{}'::"jsonb",
    "tool_configurations" "jsonb" DEFAULT '{}'::"jsonb",
    "business_function" character varying(100),
    "role" character varying(100),
    "tier" integer,
    "priority" integer,
    "implementation_phase" integer,
    "is_custom" boolean DEFAULT true,
    "cost_per_query" numeric(10,4),
    "target_users" "text"[],
    "validation_status" "public"."validation_status" DEFAULT 'pending'::"public"."validation_status",
    "validation_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "performance_metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "accuracy_score" numeric(3,2),
    "evidence_required" boolean DEFAULT false,
    "regulatory_context" "jsonb" DEFAULT '{"is_regulated": false}'::"jsonb",
    "compliance_tags" "text"[],
    "hipaa_compliant" boolean DEFAULT false,
    "gdpr_compliant" boolean DEFAULT false,
    "audit_trail_enabled" boolean DEFAULT true,
    "data_classification" "public"."data_classification" DEFAULT 'internal'::"public"."data_classification",
    "medical_specialty" character varying(100),
    "pharma_enabled" boolean DEFAULT false,
    "verify_enabled" boolean DEFAULT false,
    "jurisdiction_coverage" "text"[],
    "legal_domains" "text"[],
    "bar_admissions" "text"[],
    "legal_specialties" "jsonb",
    "market_segments" "text"[],
    "customer_segments" "text"[],
    "sales_methodology" character varying(100),
    "geographic_focus" "text"[],
    "payer_types" "text"[],
    "reimbursement_models" "text"[],
    "coverage_determination_types" "text"[],
    "hta_experience" "text"[],
    "status" "public"."agent_status" DEFAULT 'development'::"public"."agent_status",
    "availability_status" character varying(50) DEFAULT 'available'::character varying,
    "error_rate" numeric(5,4) DEFAULT 0,
    "average_response_time" integer,
    "total_interactions" integer DEFAULT 0,
    "last_interaction" timestamp without time zone,
    "last_health_check" timestamp without time zone,
    "parent_agent_id" "uuid",
    "compatible_agents" "uuid"[],
    "incompatible_agents" "uuid"[],
    "prerequisite_agents" "uuid"[],
    "workflow_positions" "text"[],
    "escalation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "confidence_thresholds" "jsonb" DEFAULT '{"low": 0.7, "high": 0.95, "medium": 0.85}'::"jsonb",
    "input_validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "output_format_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "citation_requirements" "jsonb" DEFAULT '{}'::"jsonb",
    "rate_limits" "jsonb" DEFAULT '{"per_hour": 1000, "per_minute": 60}'::"jsonb",
    "test_scenarios" "jsonb" DEFAULT '[]'::"jsonb",
    "validation_history" "jsonb" DEFAULT '[]'::"jsonb",
    "performance_benchmarks" "jsonb" DEFAULT '{}'::"jsonb",
    "reviewer_id" "uuid",
    "last_validation_date" timestamp without time zone,
    "validation_expiry_date" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (((((((((COALESCE("name", ''::character varying))::"text" || ' '::"text") || (COALESCE("display_name", ''::character varying))::"text") || ' '::"text") || COALESCE("description", ''::"text")) || ' '::"text") || (COALESCE("role", ''::character varying))::"text") || ' '::"text") || (COALESCE("business_function", ''::character varying))::"text"))) STORED,
    "clinical_validation_status" character varying(20) DEFAULT 'pending'::character varying,
    "medical_accuracy_score" numeric(4,3) DEFAULT 0.95,
    "citation_accuracy" numeric(4,3),
    "hallucination_rate" numeric(4,3),
    "fda_samd_class" character varying(20),
    "audit_trail" "jsonb",
    "average_latency_ms" integer,
    "last_clinical_review" timestamp with time zone,
    "medical_error_rate" numeric(4,3),
    "medical_reviewer_id" "uuid",
    "is_public" boolean DEFAULT true,
    "user_id" "uuid",
    "is_user_copy" boolean DEFAULT false,
    "original_agent_id" "uuid",
    "copied_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "agents_accuracy_score_check" CHECK ((("accuracy_score" >= (0)::numeric) AND ("accuracy_score" <= (1)::numeric))),
    CONSTRAINT "agents_citation_accuracy_check" CHECK ((("citation_accuracy" IS NULL) OR (("citation_accuracy" >= (0)::numeric) AND ("citation_accuracy" <= (1)::numeric)))),
    CONSTRAINT "agents_clinical_validation_status_check" CHECK ((("clinical_validation_status")::"text" = ANY ((ARRAY['pending'::character varying, 'in_review'::character varying, 'validated'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "agents_color_check" CHECK ((("color")::"text" ~ '^#[0-9A-Fa-f]{6}$'::"text")),
    CONSTRAINT "agents_cost_per_query_check" CHECK (("cost_per_query" >= (0)::numeric)),
    CONSTRAINT "agents_fda_samd_class_check" CHECK ((("fda_samd_class" IS NULL) OR (("fda_samd_class")::"text" = ANY ((ARRAY[''::character varying, 'I'::character varying, 'II'::character varying, 'III'::character varying, 'IV'::character varying])::"text"[])))),
    CONSTRAINT "agents_hallucination_rate_check" CHECK ((("hallucination_rate" IS NULL) OR (("hallucination_rate" >= (0)::numeric) AND ("hallucination_rate" <= (1)::numeric)))),
    CONSTRAINT "agents_implementation_phase_check" CHECK (("implementation_phase" = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT "agents_max_tokens_check" CHECK ((("max_tokens" > 0) AND ("max_tokens" <= 10000))),
    CONSTRAINT "agents_medical_accuracy_score_check" CHECK ((("medical_accuracy_score" >= (0)::numeric) AND ("medical_accuracy_score" <= (1)::numeric))),
    CONSTRAINT "agents_medical_error_rate_check" CHECK ((("medical_error_rate" IS NULL) OR (("medical_error_rate" >= (0)::numeric) AND ("medical_error_rate" <= (1)::numeric)))),
    CONSTRAINT "agents_priority_check" CHECK ((("priority" >= 0) AND ("priority" <= 999))),
    CONSTRAINT "agents_response_format_check" CHECK ((("response_format")::"text" = ANY ((ARRAY['markdown'::character varying, 'json'::character varying, 'text'::character varying, 'html'::character varying])::"text"[]))),
    CONSTRAINT "agents_temperature_check" CHECK ((("temperature" >= (0)::numeric) AND ("temperature" <= (1)::numeric))),
    CONSTRAINT "agents_tier_check" CHECK (("tier" = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE "public"."agents" OWNER TO "postgres";


COMMENT ON TABLE "public"."agents" IS 'Comprehensive agents table with healthcare compliance and domain-agnostic design';



COMMENT ON COLUMN "public"."agents"."business_function" IS 'Primary business function the agent serves';



COMMENT ON COLUMN "public"."agents"."role" IS 'Specific role or job function the agent fulfills';



COMMENT ON COLUMN "public"."agents"."cost_per_query" IS 'Average cost per query execution';



COMMENT ON COLUMN "public"."agents"."hipaa_compliant" IS 'Whether agent meets HIPAA compliance requirements';



COMMENT ON COLUMN "public"."agents"."medical_specialty" IS 'Medical specialty focus area for healthcare agents';



COMMENT ON COLUMN "public"."agents"."pharma_enabled" IS 'Whether agent is enabled for pharmaceutical use cases';



COMMENT ON COLUMN "public"."agents"."verify_enabled" IS 'Whether agent responses require verification';



COMMENT ON COLUMN "public"."agents"."clinical_validation_status" IS 'Validation status for clinical use';



COMMENT ON COLUMN "public"."agents"."medical_accuracy_score" IS 'Measured accuracy score for medical responses (0-1)';



COMMENT ON COLUMN "public"."agents"."citation_accuracy" IS 'Accuracy of medical citations provided (0-1)';



COMMENT ON COLUMN "public"."agents"."hallucination_rate" IS 'Rate of factual errors or hallucinations (0-1)';



COMMENT ON COLUMN "public"."agents"."fda_samd_class" IS 'FDA Software as Medical Device classification';



COMMENT ON COLUMN "public"."agents"."audit_trail" IS 'JSON audit trail for compliance tracking';



COMMENT ON COLUMN "public"."agents"."average_latency_ms" IS 'Average response time in milliseconds';



COMMENT ON COLUMN "public"."agents"."last_clinical_review" IS 'Timestamp of last clinical review';



COMMENT ON COLUMN "public"."agents"."medical_error_rate" IS 'Rate of medical errors in responses (0-1)';



COMMENT ON COLUMN "public"."agents"."medical_reviewer_id" IS 'ID of medical professional who reviewed this agent';



CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_type" character varying(50) NOT NULL,
    "job_name" character varying(255) NOT NULL,
    "description" "text",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "progress" integer DEFAULT 0,
    "source_id" "uuid",
    "agent_id" "uuid",
    "user_id" "uuid",
    "workflow_id" "uuid",
    "job_config" "jsonb",
    "input_data" "jsonb",
    "output_data" "jsonb",
    "error_message" "text",
    "error_details" "jsonb",
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "estimated_duration_minutes" integer,
    "actual_duration_minutes" integer,
    "priority" integer DEFAULT 100,
    "scheduled_at" timestamp with time zone DEFAULT "now"(),
    "cpu_usage_percent" numeric(5,2),
    "memory_usage_mb" integer,
    "processing_cost" numeric(10,4),
    "tags" "text"[],
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "jobs_job_type_check" CHECK ((("job_type")::"text" = ANY ((ARRAY['document_processing'::character varying, 'workflow_execution'::character varying, 'agent_training'::character varying, 'data_sync'::character varying, 'embedding_generation'::character varying, 'compliance_check'::character varying, 'batch_operation'::character varying])::"text"[]))),
    CONSTRAINT "jobs_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 1000))),
    CONSTRAINT "jobs_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "jobs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'queued'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying, 'paused'::character varying])::"text"[])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "workflow_type" "text" NOT NULL,
    "template_id" "text",
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "definition" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "is_template" boolean DEFAULT false,
    "trigger_conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "last_run_at" timestamp with time zone,
    "last_run_status" "text",
    "run_count" integer DEFAULT 0,
    "version" "text" DEFAULT '1.0'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflows_last_run_status_check" CHECK (("last_run_status" = ANY (ARRAY['success'::"text", 'error'::"text", 'running'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "workflows_workflow_type_check" CHECK (("workflow_type" = ANY (ARRAY['regulatory_submission'::"text", 'clinical_protocol_review'::"text", 'market_access_assessment'::"text", 'rwe_data_collection'::"text", 'compliance_check'::"text", 'document_generation'::"text", 'jtbd_execution'::"text"])))
);


ALTER TABLE "public"."workflows" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_jobs_view" AS
 SELECT "j"."id",
    "j"."job_type",
    "j"."job_name",
    "j"."description",
    "j"."status",
    "j"."progress",
    "j"."source_id",
    "j"."agent_id",
    "j"."user_id",
    "j"."workflow_id",
    "j"."job_config",
    "j"."input_data",
    "j"."output_data",
    "j"."error_message",
    "j"."error_details",
    "j"."retry_count",
    "j"."max_retries",
    "j"."started_at",
    "j"."completed_at",
    "j"."estimated_duration_minutes",
    "j"."actual_duration_minutes",
    "j"."priority",
    "j"."scheduled_at",
    "j"."cpu_usage_percent",
    "j"."memory_usage_mb",
    "j"."processing_cost",
    "j"."tags",
    "j"."metadata",
    "j"."created_at",
    "j"."updated_at",
    "j"."created_by",
    "j"."updated_by",
    "a"."display_name" AS "agent_name",
    "w"."name" AS "workflow_name",
        CASE
            WHEN ((("j"."status")::"text" = 'processing'::"text") AND ("j"."started_at" IS NOT NULL)) THEN (EXTRACT(epoch FROM ("now"() - "j"."started_at")) / (60)::numeric)
            ELSE NULL::numeric
        END AS "running_minutes",
    ((COALESCE("j"."estimated_duration_minutes", 0))::numeric - COALESCE(
        CASE
            WHEN (("j"."status")::"text" = 'processing'::"text") THEN (EXTRACT(epoch FROM ("now"() - "j"."started_at")) / (60)::numeric)
            ELSE (0)::numeric
        END, (0)::numeric)) AS "estimated_remaining_minutes"
   FROM (("public"."jobs" "j"
     LEFT JOIN "public"."agents" "a" ON (("j"."agent_id" = "a"."id")))
     LEFT JOIN "public"."workflows" "w" ON (("j"."workflow_id" = "w"."id")))
  WHERE (("j"."status")::"text" <> ALL ((ARRAY['completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[]))
  ORDER BY "j"."priority" DESC, "j"."scheduled_at";


ALTER VIEW "public"."active_jobs_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "action" character varying(50) NOT NULL,
    "changed_by" "uuid",
    "changed_at" timestamp without time zone DEFAULT "now"(),
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text"
);


ALTER TABLE "public"."agent_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_capabilities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "capability_id" "uuid" NOT NULL,
    "proficiency_level" character varying(20) DEFAULT 'intermediate'::character varying,
    "custom_config" "jsonb" DEFAULT '{}'::"jsonb",
    "is_primary" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "success_rate" numeric(5,2) DEFAULT 0.0,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_capabilities_proficiency_level_check" CHECK ((("proficiency_level")::"text" = ANY ((ARRAY['basic'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'expert'::character varying])::"text"[])))
);


ALTER TABLE "public"."agent_capabilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(50) DEFAULT 'text-medical-gray'::character varying NOT NULL,
    "icon" character varying(10) DEFAULT '📁'::character varying NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_category_mapping" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid",
    "category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_category_mapping" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_collaborations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "workflow_pattern" "jsonb" NOT NULL,
    "primary_agent_id" "uuid",
    "secondary_agents" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "trigger_conditions" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "success_metrics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_collaborations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid",
    "user_id" "uuid",
    "query_count" integer DEFAULT 0 NOT NULL,
    "success_rate" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "avg_response_time_ms" integer DEFAULT 0 NOT NULL,
    "user_satisfaction_score" numeric(3,2),
    "time_saved_minutes" integer DEFAULT 0 NOT NULL,
    "documents_generated" integer DEFAULT 0 NOT NULL,
    "decisions_supported" integer DEFAULT 0 NOT NULL,
    "accuracy_score" numeric(3,2),
    "relevance_score" numeric(3,2),
    "completeness_score" numeric(3,2),
    "metric_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "prompt_id" "uuid" NOT NULL,
    "is_default" boolean DEFAULT false,
    "customizations" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agent_prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."board_memberships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "board_id" "uuid" NOT NULL,
    "agent_id" integer NOT NULL,
    "role" character varying(50) NOT NULL,
    "voting_weight" numeric(3,2) DEFAULT 1.0,
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."board_memberships" OWNER TO "postgres";


COMMENT ON TABLE "public"."board_memberships" IS 'Membership records for virtual advisory boards';



CREATE TABLE IF NOT EXISTS "public"."business_functions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "department" character varying(100),
    "healthcare_category" character varying(100),
    "description" "text",
    "regulatory_requirements" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."business_functions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."capabilities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "capability_key" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "stage" "public"."lifecycle_stage" NOT NULL,
    "vital_component" "public"."vital_framework" NOT NULL,
    "priority" "public"."priority_level" NOT NULL,
    "maturity" "public"."maturity_level" NOT NULL,
    "is_new" boolean DEFAULT false,
    "panel_recommended" boolean DEFAULT false,
    "competencies" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "tools" "jsonb" DEFAULT '[]'::"jsonb",
    "knowledge_base" "jsonb" DEFAULT '[]'::"jsonb",
    "success_metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "implementation_timeline" integer,
    "depends_on" "uuid"[] DEFAULT '{}'::"uuid"[],
    "enables" "uuid"[] DEFAULT '{}'::"uuid"[],
    "category" character varying(100) DEFAULT 'general'::character varying,
    "icon" character varying(10) DEFAULT '⚡'::character varying,
    "color" character varying(50) DEFAULT 'text-trust-blue'::character varying,
    "complexity_level" character varying(20) DEFAULT 'intermediate'::character varying,
    "domain" character varying(100) DEFAULT 'general'::character varying,
    "prerequisites" "jsonb" DEFAULT '[]'::"jsonb",
    "usage_count" integer DEFAULT 0,
    "success_rate" numeric(5,2) DEFAULT 0.0,
    "average_execution_time" integer DEFAULT 0,
    "is_premium" boolean DEFAULT false,
    "requires_training" boolean DEFAULT false,
    "requires_api_access" boolean DEFAULT false,
    "status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "version" character varying(20) DEFAULT '1.0.0'::character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_by" "uuid",
    "search_vector" "tsvector" GENERATED ALWAYS AS ((("setweight"("to_tsvector"('"english"'::"regconfig", ("name")::"text"), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", "description"), 'B'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE(("competencies")::"text", ''::"text")), 'C'::"char"))) STORED
);


ALTER TABLE "public"."capabilities" OWNER TO "postgres";


COMMENT ON TABLE "public"."capabilities" IS 'Enhanced capabilities registry for digital health interventions';



CREATE TABLE IF NOT EXISTS "public"."capability_agents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "capability_id" "uuid" NOT NULL,
    "agent_id" integer NOT NULL,
    "relationship_type" character varying(50) NOT NULL,
    "expertise_score" numeric(3,2),
    "assigned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "last_review" timestamp with time zone,
    "contribution_notes" "text",
    CONSTRAINT "capability_agents_expertise_score_check" CHECK ((("expertise_score" >= (0)::numeric) AND ("expertise_score" <= (1)::numeric)))
);


ALTER TABLE "public"."capability_agents" OWNER TO "postgres";


COMMENT ON TABLE "public"."capability_agents" IS 'Links agents to their assigned capabilities with expertise scores';



CREATE TABLE IF NOT EXISTS "public"."capability_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text",
    "icon" character varying(10) DEFAULT '📁'::character varying,
    "color" character varying(50) DEFAULT 'text-medical-gray'::character varying,
    "sort_order" integer DEFAULT 0,
    "parent_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."capability_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."capability_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "capability_id" "uuid" NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "is_required" boolean DEFAULT false,
    "auto_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."capability_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."capability_workflows" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "stage" "public"."lifecycle_stage" NOT NULL,
    "workflow_steps" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "required_capabilities" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "required_agents" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "estimated_duration" integer,
    "prerequisites" "jsonb" DEFAULT '[]'::"jsonb",
    "deliverables" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."capability_workflows" OWNER TO "postgres";


COMMENT ON TABLE "public"."capability_workflows" IS 'Workflow definitions for capability implementation';



CREATE TABLE IF NOT EXISTS "public"."chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "project_id" "uuid",
    "user_id" "uuid",
    "title" "text",
    "agent_id" "text",
    "agent_name" "text",
    "session_type" "text" DEFAULT 'chat'::"text",
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "message_count" integer DEFAULT 0,
    "total_tokens" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_sessions_session_type_check" CHECK (("session_type" = ANY (ARRAY['chat'::"text", 'workflow'::"text", 'analysis'::"text"])))
);


ALTER TABLE "public"."chat_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinical_validations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "validation_type" "text" NOT NULL,
    "validator_id" "uuid",
    "validator_credentials" "text",
    "validation_date" timestamp with time zone DEFAULT "now"(),
    "validation_result" "jsonb",
    "accuracy_score" numeric(5,4),
    "notes" "text",
    "expiration_date" timestamp with time zone,
    "is_current" boolean DEFAULT true,
    "audit_trail" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "clinical_validations_accuracy_score_check" CHECK ((("accuracy_score" >= (0)::numeric) AND ("accuracy_score" <= (1)::numeric))),
    CONSTRAINT "clinical_validations_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['agent'::"text", 'capability'::"text", 'workflow'::"text", 'document'::"text", 'knowledge'::"text"]))),
    CONSTRAINT "clinical_validations_validation_type_check" CHECK (("validation_type" = ANY (ARRAY['clinical_accuracy'::"text", 'safety_review'::"text", 'efficacy_assessment'::"text", 'regulatory_compliance'::"text"])))
);


ALTER TABLE "public"."clinical_validations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."competencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "capability_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "prompt_snippet" "text",
    "medical_accuracy_requirement" numeric(3,2) DEFAULT 0.95,
    "evidence_level" character varying(50),
    "clinical_guidelines_reference" "text"[],
    "required_knowledge" "jsonb" DEFAULT '{}'::"jsonb",
    "quality_metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "icd_codes" "text"[],
    "snomed_codes" "text"[],
    "order_priority" integer DEFAULT 0,
    "is_required" boolean DEFAULT false,
    "requires_medical_review" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "audit_log" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "competencies_medical_accuracy_requirement_check" CHECK ((("medical_accuracy_requirement" >= (0)::numeric) AND ("medical_accuracy_requirement" <= (1)::numeric)))
);


ALTER TABLE "public"."competencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."competencies" IS 'Medical competencies within capabilities with clinical requirements';



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "user_id" "uuid",
    "title" "text",
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "project_id" "uuid",
    "knowledge_base_id" "uuid",
    "name" "text" NOT NULL,
    "file_name" "text",
    "file_size" integer,
    "mime_type" "text",
    "file_path" "text",
    "document_type" "text" NOT NULL,
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "content_text" "text",
    "content_summary" "text",
    "extract_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "processing_status" "text" DEFAULT 'pending'::"text",
    "embedding_model" "text",
    "vector_ids" "text"[],
    "source_url" "text",
    "page_count" integer,
    "language" "text" DEFAULT 'en'::"text",
    "is_processed" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "access_level" "text" DEFAULT 'private'::"text",
    "created_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "documents_access_level_check" CHECK (("access_level" = ANY (ARRAY['public'::"text", 'organization'::"text", 'project'::"text", 'private'::"text"]))),
    CONSTRAINT "documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['regulatory_guidance'::"text", 'clinical_protocol'::"text", 'market_research'::"text", 'internal'::"text", 'sop'::"text", 'template'::"text", 'reference'::"text", 'data_sheet'::"text"]))),
    CONSTRAINT "documents_processing_status_check" CHECK (("processing_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."encrypted_api_keys" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "key_name" character varying(100) NOT NULL,
    "encrypted_key" "text" NOT NULL,
    "key_hash" character varying(255) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "last_used_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."encrypted_api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expert_agents" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "organization" character varying(255) NOT NULL,
    "title" character varying(255) NOT NULL,
    "domain" "public"."agent_domain" NOT NULL,
    "focus_area" "text" NOT NULL,
    "key_expertise" "text" NOT NULL,
    "years_experience" integer,
    "credentials" "jsonb" DEFAULT '[]'::"jsonb",
    "publications" "jsonb" DEFAULT '[]'::"jsonb",
    "specializations" "jsonb" DEFAULT '[]'::"jsonb",
    "availability" character varying(50),
    "engagement_tier" integer,
    "timezone" character varying(50),
    "languages" "jsonb" DEFAULT '["English"]'::"jsonb",
    "communication_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "virtual_board_memberships" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean DEFAULT true,
    "search_vector" "tsvector" GENERATED ALWAYS AS ((("setweight"("to_tsvector"('"english"'::"regconfig", ("name")::"text"), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", ("organization")::"text"), 'B'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", "key_expertise"), 'C'::"char"))) STORED,
    CONSTRAINT "expert_agents_engagement_tier_check" CHECK ((("engagement_tier" >= 1) AND ("engagement_tier" <= 4)))
);


ALTER TABLE "public"."expert_agents" OWNER TO "postgres";


COMMENT ON TABLE "public"."expert_agents" IS '100 expert agents for capability leadership and support';



CREATE TABLE IF NOT EXISTS "public"."icons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "category" character varying(50) NOT NULL,
    "subcategory" character varying(100),
    "description" "text",
    "file_path" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "svg_content" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "icons_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['avatar'::character varying, 'prompt'::character varying, 'process'::character varying, 'medical'::character varying, 'regulatory'::character varying, 'general'::character varying])::"text"[])))
);


ALTER TABLE "public"."icons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_dependencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "depends_on_job_id" "uuid" NOT NULL,
    "dependency_type" character varying(20) DEFAULT 'prerequisite'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "job_dependencies_dependency_type_check" CHECK ((("dependency_type")::"text" = ANY ((ARRAY['prerequisite'::character varying, 'trigger'::character varying, 'resource_lock'::character varying])::"text"[])))
);


ALTER TABLE "public"."job_dependencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "log_level" character varying(10) DEFAULT 'info'::character varying,
    "message" "text" NOT NULL,
    "details" "jsonb",
    "logged_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "job_logs_log_level_check" CHECK ((("log_level")::"text" = ANY ((ARRAY['debug'::character varying, 'info'::character varying, 'warn'::character varying, 'error'::character varying])::"text"[])))
);


ALTER TABLE "public"."job_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jtbd_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6366f1'::character varying,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."jtbd_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jtbd_core" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "job_statement" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "when_situation" "text",
    "desired_outcome" "text",
    "pain_points" "jsonb",
    "current_solutions" "jsonb",
    "success_criteria" "jsonb",
    "target_personas" "text"[],
    "priority" character varying(20),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "tags" "text"[],
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "jtbd_core_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "jtbd_core_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'deprecated'::character varying])::"text"[])))
);


ALTER TABLE "public"."jtbd_core" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_base" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "knowledge_type" "text" NOT NULL,
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "content" "text",
    "content_format" "text" DEFAULT 'markdown'::"text",
    "source_url" "text",
    "source_type" "text",
    "embedding_model" "text",
    "vector_ids" "text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_public" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "version" "text" DEFAULT '1.0'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "knowledge_base_content_format_check" CHECK (("content_format" = ANY (ARRAY['markdown'::"text", 'html'::"text", 'text'::"text", 'json'::"text"]))),
    CONSTRAINT "knowledge_base_knowledge_type_check" CHECK (("knowledge_type" = ANY (ARRAY['regulatory_guidance'::"text", 'clinical_protocol'::"text", 'market_research'::"text", 'internal'::"text", 'sop'::"text", 'template'::"text", 'faq'::"text", 'policy'::"text"])))
);


ALTER TABLE "public"."knowledge_base" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."llm_provider_health_checks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "check_timestamp" timestamp with time zone DEFAULT "now"(),
    "is_healthy" boolean NOT NULL,
    "response_time_ms" integer,
    "test_prompt" "text" DEFAULT 'Health check'::"text",
    "test_response" "text",
    "test_tokens_used" integer,
    "test_cost" numeric(10,6),
    "error_type" character varying(100),
    "error_message" "text",
    "error_code" character varying(50),
    "http_status_code" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."llm_provider_health_checks" OWNER TO "postgres";


COMMENT ON TABLE "public"."llm_provider_health_checks" IS 'Health monitoring logs for LLM providers';



CREATE TABLE IF NOT EXISTS "public"."llm_provider_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "metric_hour" integer,
    "total_requests" integer DEFAULT 0,
    "successful_requests" integer DEFAULT 0,
    "failed_requests" integer DEFAULT 0,
    "cancelled_requests" integer DEFAULT 0,
    "total_input_tokens" bigint DEFAULT 0,
    "total_output_tokens" bigint DEFAULT 0,
    "total_tokens" bigint GENERATED ALWAYS AS (("total_input_tokens" + "total_output_tokens")) STORED,
    "total_cost" numeric(15,4) DEFAULT 0,
    "avg_cost_per_request" numeric(10,6),
    "avg_latency_ms" numeric(10,2),
    "p50_latency_ms" numeric(10,2),
    "p95_latency_ms" numeric(10,2),
    "p99_latency_ms" numeric(10,2),
    "max_latency_ms" integer,
    "avg_confidence_score" numeric(3,2),
    "avg_medical_accuracy" numeric(5,2),
    "error_rate" numeric(5,2) GENERATED ALWAYS AS (
CASE
    WHEN ("total_requests" > 0) THEN ((("failed_requests")::numeric / ("total_requests")::numeric) * (100)::numeric)
    ELSE (0)::numeric
END) STORED,
    "timeout_count" integer DEFAULT 0,
    "rate_limit_count" integer DEFAULT 0,
    "auth_error_count" integer DEFAULT 0,
    "server_error_count" integer DEFAULT 0,
    "health_check_success_rate" numeric(5,2),
    "uptime_minutes" integer DEFAULT 1440,
    "unique_users_count" integer DEFAULT 0,
    "unique_agents_count" integer DEFAULT 0,
    "peak_concurrent_requests" integer DEFAULT 0,
    "phi_requests_count" integer DEFAULT 0,
    "clinical_validations_passed" integer DEFAULT 0,
    "clinical_validations_failed" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_metric_hour" CHECK ((("metric_hour" IS NULL) OR (("metric_hour" >= 0) AND ("metric_hour" <= 23))))
);


ALTER TABLE "public"."llm_provider_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."llm_provider_metrics" IS 'Aggregated performance metrics for LLM providers';



CREATE TABLE IF NOT EXISTS "public"."llm_providers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider_name" character varying(100) NOT NULL,
    "provider_type" "public"."provider_type" NOT NULL,
    "api_endpoint" character varying(500),
    "api_key_encrypted" "text",
    "model_id" character varying(200) NOT NULL,
    "model_version" character varying(50),
    "capabilities" "jsonb" DEFAULT '{"streaming": false, "supports_phi": false, "context_window": 4096, "code_generation": false, "function_calling": false, "medical_knowledge": false, "image_understanding": false}'::"jsonb",
    "cost_per_1k_input_tokens" numeric(10,6) DEFAULT 0,
    "cost_per_1k_output_tokens" numeric(10,6) DEFAULT 0,
    "max_tokens" integer DEFAULT 4096,
    "temperature_default" numeric(3,2) DEFAULT 0.7,
    "rate_limit_rpm" integer DEFAULT 60,
    "rate_limit_tpm" integer DEFAULT 10000,
    "rate_limit_concurrent" integer DEFAULT 10,
    "priority_level" integer DEFAULT 1,
    "weight" numeric(3,2) DEFAULT 1.0,
    "status" "public"."provider_status" DEFAULT 'initializing'::"public"."provider_status",
    "is_active" boolean DEFAULT true,
    "is_hipaa_compliant" boolean DEFAULT false,
    "is_production_ready" boolean DEFAULT false,
    "medical_accuracy_score" numeric(5,2),
    "average_latency_ms" integer,
    "uptime_percentage" numeric(5,2) DEFAULT 100.0,
    "health_check_enabled" boolean DEFAULT true,
    "health_check_interval_minutes" integer DEFAULT 5,
    "health_check_timeout_seconds" integer DEFAULT 30,
    "custom_headers" "jsonb" DEFAULT '{}'::"jsonb",
    "retry_config" "jsonb" DEFAULT '{"max_retries": 3, "retry_delay_ms": 1000, "backoff_multiplier": 2, "exponential_backoff": true}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "valid_accuracy" CHECK ((("medical_accuracy_score" IS NULL) OR (("medical_accuracy_score" >= (0)::numeric) AND ("medical_accuracy_score" <= (100)::numeric)))),
    CONSTRAINT "valid_priority" CHECK (("priority_level" > 0)),
    CONSTRAINT "valid_uptime" CHECK ((("uptime_percentage" >= (0)::numeric) AND ("uptime_percentage" <= (100)::numeric))),
    CONSTRAINT "valid_weight" CHECK ((("weight" > (0)::numeric) AND ("weight" <= (10)::numeric)))
);


ALTER TABLE "public"."llm_providers" OWNER TO "postgres";


COMMENT ON TABLE "public"."llm_providers" IS 'Registry of all LLM providers and their configurations';



COMMENT ON COLUMN "public"."llm_providers"."api_key_encrypted" IS 'API key encrypted using application-level encryption';



COMMENT ON COLUMN "public"."llm_providers"."capabilities" IS 'JSON object describing model capabilities and features';



COMMENT ON COLUMN "public"."llm_providers"."retry_config" IS 'JSON configuration for retry logic and backoff';



CREATE TABLE IF NOT EXISTS "public"."llm_usage_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "llm_provider_id" "uuid" NOT NULL,
    "agent_id" "uuid",
    "user_id" "uuid",
    "request_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "parent_request_id" "uuid",
    "input_tokens" integer DEFAULT 0 NOT NULL,
    "output_tokens" integer DEFAULT 0 NOT NULL,
    "total_tokens" integer GENERATED ALWAYS AS (("input_tokens" + "output_tokens")) STORED,
    "cost_input" numeric(10,6) DEFAULT 0,
    "cost_output" numeric(10,6) DEFAULT 0,
    "total_cost" numeric(10,6) GENERATED ALWAYS AS (("cost_input" + "cost_output")) STORED,
    "latency_ms" integer NOT NULL,
    "queue_time_ms" integer DEFAULT 0,
    "processing_time_ms" integer,
    "status" character varying(50) DEFAULT 'success'::character varying NOT NULL,
    "error_message" "text",
    "error_type" character varying(100),
    "medical_context" character varying(100),
    "contains_phi" boolean DEFAULT false,
    "patient_context_id" "uuid",
    "clinical_validation_status" character varying(50) DEFAULT 'pending'::character varying,
    "request_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "response_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "confidence_score" numeric(3,2),
    "quality_score" numeric(3,2),
    "medical_accuracy_score" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text"
);


ALTER TABLE "public"."llm_usage_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."llm_usage_logs" IS 'Detailed usage tracking for all LLM requests';



COMMENT ON COLUMN "public"."llm_usage_logs"."contains_phi" IS 'Flag indicating if request/response contained PHI (for HIPAA compliance)';



COMMENT ON COLUMN "public"."llm_usage_logs"."clinical_validation_status" IS 'Status of clinical validation for medical responses';



CREATE TABLE IF NOT EXISTS "public"."medical_validations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "validation_type" character varying(50),
    "validation_result" "jsonb" DEFAULT '{}'::"jsonb",
    "accuracy_score" numeric(3,2),
    "validator_id" "uuid",
    "validator_credentials" "text",
    "validation_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expiration_date" timestamp with time zone,
    "notes" "text",
    "audit_trail" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."medical_validations" OWNER TO "postgres";


COMMENT ON TABLE "public"."medical_validations" IS 'Clinical validation records for agents, capabilities, and competencies';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "session_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "content_type" "text" DEFAULT 'text'::"text",
    "agent_id" "text",
    "agent_name" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tokens_used" integer DEFAULT 0,
    "processing_time_ms" integer,
    "citations" "jsonb" DEFAULT '[]'::"jsonb",
    "feedback" "jsonb",
    "is_edited" boolean DEFAULT false,
    "is_deleted" boolean DEFAULT false,
    "parent_message_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_content_type_check" CHECK (("content_type" = ANY (ARRAY['text'::"text", 'markdown'::"text", 'code'::"text", 'json'::"text"]))),
    CONSTRAINT "messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text", 'function'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "subscription_tier" "text" DEFAULT 'starter'::"text",
    "subscription_status" "text" DEFAULT 'active'::"text",
    "trial_ends_at" timestamp with time zone,
    "max_projects" integer DEFAULT 3,
    "max_users" integer DEFAULT 5,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organizations_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'trial'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "organizations_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['starter'::"text", 'professional'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phi_access_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid",
    "user_id" "uuid",
    "access_type" character varying(50),
    "data_classification" character varying(50),
    "purpose" "text",
    "patient_id_hash" character varying(255),
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "session_id" "uuid",
    "audit_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."phi_access_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."phi_access_log" IS 'HIPAA-compliant audit logging for PHI access by agents';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "project_type" "text" NOT NULL,
    "current_phase" "text" DEFAULT 'vision'::"text",
    "phase_progress" "jsonb" DEFAULT '{"test": 0, "learn": 0, "vision": 0, "activate": 0, "integrate": 0}'::"jsonb",
    "milestones" "jsonb" DEFAULT '[]'::"jsonb",
    "regulatory_pathway" "text",
    "target_markets" "text"[],
    "clinical_indication" "text",
    "patient_population" "text",
    "primary_endpoints" "text"[],
    "secondary_endpoints" "text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_archived" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "projects_current_phase_check" CHECK (("current_phase" = ANY (ARRAY['vision'::"text", 'integrate'::"text", 'test'::"text", 'activate'::"text", 'learn'::"text"]))),
    CONSTRAINT "projects_project_type_check" CHECK (("project_type" = ANY (ARRAY['digital_therapeutic'::"text", 'ai_diagnostic'::"text", 'clinical_decision_support'::"text", 'remote_monitoring'::"text", 'telemedicine_platform'::"text", 'health_analytics'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "category" character varying(100) NOT NULL,
    "system_prompt" "text" NOT NULL,
    "user_prompt_template" "text",
    "execution_instructions" "jsonb" DEFAULT '{}'::"jsonb",
    "success_criteria" "jsonb" DEFAULT '{}'::"jsonb",
    "model_requirements" "jsonb" DEFAULT '{"model": "gpt-4", "max_tokens": 2000, "temperature": 0.7}'::"jsonb",
    "input_schema" "jsonb" DEFAULT '{}'::"jsonb",
    "output_schema" "jsonb" DEFAULT '{}'::"jsonb",
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "complexity_level" character varying(20) DEFAULT 'intermediate'::character varying,
    "domain" character varying(100) DEFAULT 'general'::character varying NOT NULL,
    "estimated_tokens" integer DEFAULT 1000,
    "prerequisite_prompts" "text"[],
    "related_capabilities" "text"[],
    "required_context" "text"[],
    "validation_status" character varying(20) DEFAULT 'active'::character varying,
    "accuracy_threshold" numeric(3,2) DEFAULT 0.85,
    "testing_scenarios" "jsonb" DEFAULT '[]'::"jsonb",
    "hipaa_relevant" boolean DEFAULT false,
    "phi_handling_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "compliance_tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "version" character varying(20) DEFAULT '1.0.0'::character varying,
    "status" character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT "prompts_accuracy_threshold_check" CHECK ((("accuracy_threshold" >= (0)::numeric) AND ("accuracy_threshold" <= (1)::numeric))),
    CONSTRAINT "prompts_complexity_level_check" CHECK ((("complexity_level")::"text" = ANY ((ARRAY['basic'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'expert'::character varying])::"text"[]))),
    CONSTRAINT "prompts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'deprecated'::character varying, 'archived'::character varying])::"text"[]))),
    CONSTRAINT "prompts_validation_status_check" CHECK ((("validation_status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'beta'::character varying, 'deprecated'::character varying])::"text"[])))
);


ALTER TABLE "public"."prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "scope" "public"."permission_scope" NOT NULL,
    "action" "public"."permission_action" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "clinical_title" character varying(100),
    "seniority_level" character varying(50),
    "department" character varying(100),
    "requires_medical_license" boolean DEFAULT false,
    "default_capabilities" "jsonb" DEFAULT '[]'::"jsonb",
    "compliance_requirements" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" character varying(100) NOT NULL,
    "resource_type" character varying(100),
    "resource_id" character varying(255),
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "success" boolean DEFAULT true NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."security_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "generated_prompt" "text" NOT NULL,
    "capability_contributions" "jsonb" DEFAULT '{}'::"jsonb",
    "tool_configurations" "jsonb" DEFAULT '{}'::"jsonb",
    "pharma_protocol_included" boolean DEFAULT true,
    "verify_protocol_included" boolean DEFAULT true,
    "medical_disclaimers" "text"[] DEFAULT '{}'::"text"[],
    "version" integer DEFAULT 1,
    "clinical_validation_status" character varying(50) DEFAULT 'pending'::character varying,
    "is_active" boolean DEFAULT true,
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "generated_by" "uuid",
    "approved_by" "uuid",
    "approval_date" timestamp with time zone,
    "audit_log" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."system_prompts" OWNER TO "postgres";


COMMENT ON TABLE "public"."system_prompts" IS 'FDA 21 CFR Part 11 compliant system prompt generation audit trail';



CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "tool_type" character varying(100),
    "api_endpoint" "text",
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "medical_database" character varying(100),
    "data_classification" character varying(50),
    "hipaa_compliant" boolean DEFAULT false,
    "required_permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "rate_limits" "jsonb" DEFAULT '{}'::"jsonb",
    "validation_endpoint" "text",
    "is_active" boolean DEFAULT true,
    "last_validation_check" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_quotas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid",
    "quota_type" character varying(50) NOT NULL,
    "quota_period" character varying(20) NOT NULL,
    "quota_limit" numeric(15,2) NOT NULL,
    "current_usage" numeric(15,2) DEFAULT 0,
    "period_start" timestamp with time zone DEFAULT "now"(),
    "period_end" timestamp with time zone,
    "alert_threshold_percent" integer DEFAULT 80,
    "hard_limit" boolean DEFAULT false,
    "grace_requests" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "last_reset" timestamp with time zone DEFAULT "now"(),
    "next_reset" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "valid_alert_threshold" CHECK ((("alert_threshold_percent" > 0) AND ("alert_threshold_percent" <= 100))),
    CONSTRAINT "valid_quota_limit" CHECK (("quota_limit" > (0)::numeric))
);


ALTER TABLE "public"."usage_quotas" OWNER TO "postgres";


COMMENT ON TABLE "public"."usage_quotas" IS 'Usage quotas and limits for users, agents, and departments';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "department" character varying(100),
    "organization" character varying(255),
    "is_active" boolean DEFAULT true NOT NULL,
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_token" character varying(255) NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'member'::"text",
    "avatar_url" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "last_seen_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'clinician'::"text", 'researcher'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."virtual_boards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "board_type" character varying(100) NOT NULL,
    "focus_areas" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "lead_agent_id" integer,
    "consensus_method" character varying(50),
    "quorum_requirement" integer DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."virtual_boards" OWNER TO "postgres";


COMMENT ON TABLE "public"."virtual_boards" IS 'Virtual advisory boards for capability governance';



CREATE TABLE IF NOT EXISTS "public"."workflow_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "execution_name" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "input_data" "jsonb",
    "output_data" "jsonb",
    "step_results" "jsonb" DEFAULT '{}'::"jsonb",
    "current_step" integer DEFAULT 1,
    "error_message" "text",
    "error_details" "jsonb",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "finished_at" timestamp with time zone,
    "duration_ms" integer,
    "triggered_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflow_executions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."workflow_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "step_name" "text" NOT NULL,
    "step_type" "text" NOT NULL,
    "step_order" integer NOT NULL,
    "description" "text",
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "input_schema" "jsonb",
    "output_schema" "jsonb",
    "agent_id" "text",
    "required_capabilities" "text"[],
    "is_optional" boolean DEFAULT false,
    "retry_config" "jsonb",
    "timeout_seconds" integer DEFAULT 300,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflow_steps_step_type_check" CHECK (("step_type" = ANY (ARRAY['agent'::"text", 'human'::"text", 'system'::"text", 'condition'::"text", 'loop'::"text"])))
);


ALTER TABLE "public"."workflow_steps" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agent_audit_log"
    ADD CONSTRAINT "agent_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_capabilities"
    ADD CONSTRAINT "agent_capabilities_agent_id_capability_id_key" UNIQUE ("agent_id", "capability_id");



ALTER TABLE ONLY "public"."agent_capabilities"
    ADD CONSTRAINT "agent_capabilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_categories"
    ADD CONSTRAINT "agent_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."agent_categories"
    ADD CONSTRAINT "agent_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_category_mapping"
    ADD CONSTRAINT "agent_category_mapping_agent_id_category_id_key" UNIQUE ("agent_id", "category_id");



ALTER TABLE ONLY "public"."agent_category_mapping"
    ADD CONSTRAINT "agent_category_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_collaborations"
    ADD CONSTRAINT "agent_collaborations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_performance_metrics"
    ADD CONSTRAINT "agent_performance_metrics_agent_id_user_id_metric_date_key" UNIQUE ("agent_id", "user_id", "metric_date");



ALTER TABLE ONLY "public"."agent_performance_metrics"
    ADD CONSTRAINT "agent_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_prompts"
    ADD CONSTRAINT "agent_prompts_agent_id_prompt_id_key" UNIQUE ("agent_id", "prompt_id");



ALTER TABLE ONLY "public"."agent_prompts"
    ADD CONSTRAINT "agent_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."board_memberships"
    ADD CONSTRAINT "board_memberships_board_id_agent_id_key" UNIQUE ("board_id", "agent_id");



ALTER TABLE ONLY "public"."board_memberships"
    ADD CONSTRAINT "board_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_functions"
    ADD CONSTRAINT "business_functions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."business_functions"
    ADD CONSTRAINT "business_functions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capabilities"
    ADD CONSTRAINT "capabilities_capability_key_key" UNIQUE ("capability_key");



ALTER TABLE ONLY "public"."capabilities"
    ADD CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capability_agents"
    ADD CONSTRAINT "capability_agents_capability_id_agent_id_relationship_type_key" UNIQUE ("capability_id", "agent_id", "relationship_type");



ALTER TABLE ONLY "public"."capability_agents"
    ADD CONSTRAINT "capability_agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capability_categories"
    ADD CONSTRAINT "capability_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."capability_categories"
    ADD CONSTRAINT "capability_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capability_tools"
    ADD CONSTRAINT "capability_tools_capability_id_tool_id_key" UNIQUE ("capability_id", "tool_id");



ALTER TABLE ONLY "public"."capability_tools"
    ADD CONSTRAINT "capability_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capability_workflows"
    ADD CONSTRAINT "capability_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinical_validations"
    ADD CONSTRAINT "clinical_validations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."competencies"
    ADD CONSTRAINT "competencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."encrypted_api_keys"
    ADD CONSTRAINT "encrypted_api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expert_agents"
    ADD CONSTRAINT "expert_agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."icons"
    ADD CONSTRAINT "icons_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."icons"
    ADD CONSTRAINT "icons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_dependencies"
    ADD CONSTRAINT "job_dependencies_job_id_depends_on_job_id_key" UNIQUE ("job_id", "depends_on_job_id");



ALTER TABLE ONLY "public"."job_dependencies"
    ADD CONSTRAINT "job_dependencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_logs"
    ADD CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jtbd_categories"
    ADD CONSTRAINT "jtbd_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."jtbd_categories"
    ADD CONSTRAINT "jtbd_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jtbd_core"
    ADD CONSTRAINT "jtbd_core_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."jtbd_core"
    ADD CONSTRAINT "jtbd_core_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_base"
    ADD CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_provider_health_checks"
    ADD CONSTRAINT "llm_provider_health_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_provider_metrics"
    ADD CONSTRAINT "llm_provider_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_providers"
    ADD CONSTRAINT "llm_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_usage_logs"
    ADD CONSTRAINT "llm_usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_validations"
    ADD CONSTRAINT "medical_validations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."phi_access_log"
    ADD CONSTRAINT "phi_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_scope_action_key" UNIQUE ("role", "scope", "action");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_prompts"
    ADD CONSTRAINT "system_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_quotas"
    ADD CONSTRAINT "unique_entity_quota" UNIQUE ("entity_type", "entity_id", "quota_type", "quota_period");



ALTER TABLE ONLY "public"."llm_provider_metrics"
    ADD CONSTRAINT "unique_provider_metric_period" UNIQUE ("provider_id", "metric_date", "metric_hour");



ALTER TABLE ONLY "public"."llm_providers"
    ADD CONSTRAINT "unique_provider_model" UNIQUE ("provider_type", "model_id", "api_endpoint");



ALTER TABLE ONLY "public"."usage_quotas"
    ADD CONSTRAINT "usage_quotas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."virtual_boards"
    ADD CONSTRAINT "virtual_boards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_executions"
    ADD CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_steps"
    ADD CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_steps"
    ADD CONSTRAINT "workflow_steps_workflow_id_step_order_key" UNIQUE ("workflow_id", "step_order");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_agent_audit_log_action" ON "public"."agent_audit_log" USING "btree" ("action");



CREATE INDEX "idx_agent_audit_log_agent_id" ON "public"."agent_audit_log" USING "btree" ("agent_id");



CREATE INDEX "idx_agent_audit_log_changed_at" ON "public"."agent_audit_log" USING "btree" ("changed_at" DESC);



CREATE INDEX "idx_agent_capabilities_agent_id" ON "public"."agent_capabilities" USING "btree" ("agent_id");



CREATE INDEX "idx_agent_capabilities_capability_id" ON "public"."agent_capabilities" USING "btree" ("capability_id");



CREATE INDEX "idx_agent_capabilities_proficiency" ON "public"."agent_capabilities" USING "btree" ("proficiency_level");



CREATE INDEX "idx_agent_performance_agent_id" ON "public"."agent_performance_metrics" USING "btree" ("agent_id");



CREATE INDEX "idx_agent_performance_date" ON "public"."agent_performance_metrics" USING "btree" ("metric_date");



CREATE INDEX "idx_agent_prompts_agent_id" ON "public"."agent_prompts" USING "btree" ("agent_id");



CREATE INDEX "idx_agent_prompts_default" ON "public"."agent_prompts" USING "btree" ("agent_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_agent_prompts_prompt_id" ON "public"."agent_prompts" USING "btree" ("prompt_id");



CREATE INDEX "idx_agents_business_function" ON "public"."agents" USING "btree" ("business_function");



CREATE INDEX "idx_agents_capabilities" ON "public"."agents" USING "gin" ("capabilities");



CREATE INDEX "idx_agents_clinical_validation_status" ON "public"."agents" USING "btree" ("clinical_validation_status");



CREATE INDEX "idx_agents_compliance_tags" ON "public"."agents" USING "gin" ("compliance_tags");



CREATE INDEX "idx_agents_domain" ON "public"."expert_agents" USING "btree" ("domain");



CREATE INDEX "idx_agents_domain_expertise" ON "public"."agents" USING "btree" ("domain_expertise");



CREATE INDEX "idx_agents_fda_samd_class" ON "public"."agents" USING "btree" ("fda_samd_class");



CREATE INDEX "idx_agents_hipaa_compliant" ON "public"."agents" USING "btree" ("hipaa_compliant");



CREATE INDEX "idx_agents_is_public" ON "public"."agents" USING "btree" ("is_public");



CREATE INDEX "idx_agents_knowledge_domains" ON "public"."agents" USING "gin" ("knowledge_domains");



CREATE INDEX "idx_agents_medical_reviewer_id" ON "public"."agents" USING "btree" ("medical_reviewer_id");



CREATE INDEX "idx_agents_medical_specialty" ON "public"."agents" USING "btree" ("medical_specialty");



CREATE INDEX "idx_agents_original_id" ON "public"."agents" USING "btree" ("original_agent_id");



CREATE INDEX "idx_agents_pharma_enabled" ON "public"."agents" USING "btree" ("pharma_enabled");



CREATE INDEX "idx_agents_search" ON "public"."agents" USING "gin" ("search_vector");



CREATE INDEX "idx_agents_status" ON "public"."agents" USING "btree" ("status");



CREATE INDEX "idx_agents_tier" ON "public"."expert_agents" USING "btree" ("engagement_tier");



CREATE INDEX "idx_agents_tier_priority" ON "public"."agents" USING "btree" ("tier", "priority");



CREATE INDEX "idx_agents_user_copy" ON "public"."agents" USING "btree" ("is_user_copy");



CREATE INDEX "idx_agents_user_id" ON "public"."agents" USING "btree" ("user_id");



CREATE INDEX "idx_agents_validation_status" ON "public"."agents" USING "btree" ("validation_status");



CREATE INDEX "idx_cap_agents_agent" ON "public"."capability_agents" USING "btree" ("agent_id");



CREATE INDEX "idx_cap_agents_capability" ON "public"."capability_agents" USING "btree" ("capability_id");



CREATE INDEX "idx_cap_agents_type" ON "public"."capability_agents" USING "btree" ("relationship_type");



CREATE INDEX "idx_capabilities_category" ON "public"."capabilities" USING "btree" ("category");



CREATE INDEX "idx_capabilities_domain" ON "public"."capabilities" USING "btree" ("domain");



CREATE INDEX "idx_capabilities_maturity" ON "public"."capabilities" USING "btree" ("maturity");



CREATE INDEX "idx_capabilities_priority" ON "public"."capabilities" USING "btree" ("priority");



CREATE INDEX "idx_capabilities_search" ON "public"."capabilities" USING "gin" ("search_vector");



CREATE INDEX "idx_capabilities_stage" ON "public"."capabilities" USING "btree" ("stage");



CREATE INDEX "idx_capabilities_status" ON "public"."capabilities" USING "btree" ("status");



CREATE INDEX "idx_capabilities_vital" ON "public"."capabilities" USING "btree" ("vital_component");



CREATE INDEX "idx_capability_categories_parent" ON "public"."capability_categories" USING "btree" ("parent_id");



CREATE INDEX "idx_chat_sessions_active" ON "public"."chat_sessions" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_chat_sessions_project" ON "public"."chat_sessions" USING "btree" ("project_id");



CREATE INDEX "idx_chat_sessions_user" ON "public"."chat_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_clinical_validations_current" ON "public"."clinical_validations" USING "btree" ("is_current") WHERE ("is_current" = true);



CREATE INDEX "idx_clinical_validations_entity" ON "public"."clinical_validations" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_clinical_validations_type" ON "public"."clinical_validations" USING "btree" ("validation_type");



CREATE INDEX "idx_competencies_capability" ON "public"."competencies" USING "btree" ("capability_id");



CREATE INDEX "idx_competencies_medical_accuracy" ON "public"."competencies" USING "btree" ("medical_accuracy_requirement");



CREATE INDEX "idx_conversations_session" ON "public"."conversations" USING "btree" ("session_id");



CREATE INDEX "idx_conversations_user" ON "public"."conversations" USING "btree" ("user_id");



CREATE INDEX "idx_documents_knowledge_base" ON "public"."documents" USING "btree" ("knowledge_base_id");



CREATE INDEX "idx_documents_organization" ON "public"."documents" USING "btree" ("organization_id");



CREATE INDEX "idx_documents_project" ON "public"."documents" USING "btree" ("project_id");



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("processing_status");



CREATE INDEX "idx_documents_tags" ON "public"."documents" USING "gin" ("tags");



CREATE INDEX "idx_documents_type" ON "public"."documents" USING "btree" ("document_type");



CREATE INDEX "idx_documents_vector_ids" ON "public"."documents" USING "gin" ("vector_ids");



CREATE INDEX "idx_encrypted_api_keys_active" ON "public"."encrypted_api_keys" USING "btree" ("is_active");



CREATE INDEX "idx_encrypted_api_keys_provider_id" ON "public"."encrypted_api_keys" USING "btree" ("provider_id");



CREATE INDEX "idx_health_checks_recent" ON "public"."llm_provider_health_checks" USING "btree" ("provider_id", "check_timestamp");



CREATE INDEX "idx_health_provider_timestamp" ON "public"."llm_provider_health_checks" USING "btree" ("provider_id", "check_timestamp");



CREATE INDEX "idx_health_status" ON "public"."llm_provider_health_checks" USING "btree" ("is_healthy");



CREATE INDEX "idx_health_timestamp" ON "public"."llm_provider_health_checks" USING "btree" ("check_timestamp");



CREATE INDEX "idx_icons_category" ON "public"."icons" USING "btree" ("category");



CREATE INDEX "idx_icons_is_active" ON "public"."icons" USING "btree" ("is_active");



CREATE INDEX "idx_icons_name" ON "public"."icons" USING "btree" ("name");



CREATE INDEX "idx_icons_tags" ON "public"."icons" USING "gin" ("tags");



CREATE INDEX "idx_job_dependencies_depends_on" ON "public"."job_dependencies" USING "btree" ("depends_on_job_id");



CREATE INDEX "idx_job_dependencies_job_id" ON "public"."job_dependencies" USING "btree" ("job_id");



CREATE INDEX "idx_job_logs_job_id" ON "public"."job_logs" USING "btree" ("job_id");



CREATE INDEX "idx_job_logs_level" ON "public"."job_logs" USING "btree" ("log_level");



CREATE INDEX "idx_job_logs_logged_at" ON "public"."job_logs" USING "btree" ("logged_at");



CREATE INDEX "idx_jobs_agent_id" ON "public"."jobs" USING "btree" ("agent_id");



CREATE INDEX "idx_jobs_created_at" ON "public"."jobs" USING "btree" ("created_at");



CREATE INDEX "idx_jobs_job_type" ON "public"."jobs" USING "btree" ("job_type");



CREATE INDEX "idx_jobs_priority" ON "public"."jobs" USING "btree" ("priority");



CREATE INDEX "idx_jobs_scheduled_at" ON "public"."jobs" USING "btree" ("scheduled_at");



CREATE INDEX "idx_jobs_source_id" ON "public"."jobs" USING "btree" ("source_id");



CREATE INDEX "idx_jobs_status" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "idx_jobs_tags" ON "public"."jobs" USING "gin" ("tags");



CREATE INDEX "idx_jobs_workflow_id" ON "public"."jobs" USING "btree" ("workflow_id");



CREATE INDEX "idx_jtbd_core_category_id" ON "public"."jtbd_core" USING "btree" ("category_id");



CREATE INDEX "idx_jtbd_core_priority" ON "public"."jtbd_core" USING "btree" ("priority");



CREATE INDEX "idx_jtbd_core_status" ON "public"."jtbd_core" USING "btree" ("status");



CREATE INDEX "idx_jtbd_core_tags" ON "public"."jtbd_core" USING "gin" ("tags");



CREATE INDEX "idx_jtbd_core_target_personas" ON "public"."jtbd_core" USING "gin" ("target_personas");



CREATE INDEX "idx_knowledge_base_active" ON "public"."knowledge_base" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_knowledge_base_organization" ON "public"."knowledge_base" USING "btree" ("organization_id");



CREATE INDEX "idx_knowledge_base_project" ON "public"."knowledge_base" USING "btree" ("project_id");



CREATE INDEX "idx_knowledge_base_tags" ON "public"."knowledge_base" USING "gin" ("tags");



CREATE INDEX "idx_knowledge_base_type" ON "public"."knowledge_base" USING "btree" ("knowledge_type");



CREATE INDEX "idx_llm_providers_active" ON "public"."llm_providers" USING "btree" ("is_active", "status") WHERE ("is_active" = true);



CREATE INDEX "idx_llm_providers_priority" ON "public"."llm_providers" USING "btree" ("priority_level", "weight") WHERE ("is_active" = true);



CREATE INDEX "idx_llm_providers_type" ON "public"."llm_providers" USING "btree" ("provider_type");



CREATE INDEX "idx_medical_validations_date" ON "public"."medical_validations" USING "btree" ("validation_date");



CREATE INDEX "idx_medical_validations_entity" ON "public"."medical_validations" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_role" ON "public"."messages" USING "btree" ("role");



CREATE INDEX "idx_messages_session" ON "public"."messages" USING "btree" ("session_id");



CREATE INDEX "idx_metrics_provider_date" ON "public"."llm_provider_metrics" USING "btree" ("provider_id", "metric_date");



CREATE INDEX "idx_phi_access_log_agent" ON "public"."phi_access_log" USING "btree" ("agent_id", "timestamp");



CREATE INDEX "idx_prompts_category" ON "public"."prompts" USING "btree" ("category");



CREATE INDEX "idx_prompts_domain" ON "public"."prompts" USING "btree" ("domain");



CREATE INDEX "idx_prompts_name" ON "public"."prompts" USING "btree" ("name");



CREATE INDEX "idx_prompts_status" ON "public"."prompts" USING "btree" ("status");



CREATE INDEX "idx_quotas_entity" ON "public"."usage_quotas" USING "btree" ("entity_type", "entity_id") WHERE ("is_active" = true);



CREATE INDEX "idx_quotas_period" ON "public"."usage_quotas" USING "btree" ("period_start", "period_end") WHERE ("is_active" = true);



CREATE INDEX "idx_role_permissions_role" ON "public"."role_permissions" USING "btree" ("role");



CREATE INDEX "idx_role_permissions_scope_action" ON "public"."role_permissions" USING "btree" ("scope", "action");



CREATE INDEX "idx_security_audit_action" ON "public"."security_audit_log" USING "btree" ("action");



CREATE INDEX "idx_security_audit_created_at" ON "public"."security_audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_security_audit_user_id" ON "public"."security_audit_log" USING "btree" ("user_id");



CREATE INDEX "idx_system_prompts_agent" ON "public"."system_prompts" USING "btree" ("agent_id", "is_active");



CREATE INDEX "idx_usage_agent_date" ON "public"."llm_usage_logs" USING "btree" ("agent_id", "created_at");



CREATE INDEX "idx_usage_cost" ON "public"."llm_usage_logs" USING "btree" ("total_cost");



CREATE INDEX "idx_usage_logs_agent_date" ON "public"."llm_usage_logs" USING "btree" ("agent_id", "created_at");



CREATE INDEX "idx_usage_logs_composite" ON "public"."llm_usage_logs" USING "btree" ("llm_provider_id", "created_at", "status");



CREATE INDEX "idx_usage_logs_user_date" ON "public"."llm_usage_logs" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_usage_medical_context" ON "public"."llm_usage_logs" USING "btree" ("medical_context");



CREATE INDEX "idx_usage_phi" ON "public"."llm_usage_logs" USING "btree" ("contains_phi");



CREATE INDEX "idx_usage_provider_date" ON "public"."llm_usage_logs" USING "btree" ("llm_provider_id", "created_at");



CREATE INDEX "idx_usage_request" ON "public"."llm_usage_logs" USING "btree" ("request_id");



CREATE INDEX "idx_usage_session" ON "public"."llm_usage_logs" USING "btree" ("session_id");



CREATE INDEX "idx_usage_status" ON "public"."llm_usage_logs" USING "btree" ("status");



CREATE INDEX "idx_usage_user_date" ON "public"."llm_usage_logs" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_user_profiles_active" ON "public"."user_profiles" USING "btree" ("is_active");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING "btree" ("role");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_active" ON "public"."user_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_user_sessions_expires" ON "public"."user_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_workflow_executions_started" ON "public"."workflow_executions" USING "btree" ("started_at" DESC);



CREATE INDEX "idx_workflow_executions_status" ON "public"."workflow_executions" USING "btree" ("status");



CREATE INDEX "idx_workflow_executions_workflow" ON "public"."workflow_executions" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflow_steps_order" ON "public"."workflow_steps" USING "btree" ("workflow_id", "step_order");



CREATE INDEX "idx_workflow_steps_workflow" ON "public"."workflow_steps" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflows_active" ON "public"."workflows" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_workflows_organization" ON "public"."workflows" USING "btree" ("organization_id");



CREATE INDEX "idx_workflows_project" ON "public"."workflows" USING "btree" ("project_id");



CREATE INDEX "idx_workflows_type" ON "public"."workflows" USING "btree" ("workflow_type");



CREATE OR REPLACE TRIGGER "audit_encrypted_api_keys" AFTER INSERT OR DELETE OR UPDATE ON "public"."encrypted_api_keys" FOR EACH ROW EXECUTE FUNCTION "public"."audit_security_event"();



CREATE OR REPLACE TRIGGER "audit_llm_providers" AFTER INSERT OR DELETE OR UPDATE ON "public"."llm_providers" FOR EACH ROW EXECUTE FUNCTION "public"."audit_security_event"();



CREATE OR REPLACE TRIGGER "audit_user_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."audit_security_event"();



CREATE OR REPLACE TRIGGER "calculate_job_duration_trigger" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_job_duration"();



CREATE OR REPLACE TRIGGER "update_agent_capabilities_updated_at" BEFORE UPDATE ON "public"."agent_capabilities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_agent_collaborations_updated_at" BEFORE UPDATE ON "public"."agent_collaborations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_agents_updated_at" BEFORE UPDATE ON "public"."agents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_capabilities_updated_at" BEFORE UPDATE ON "public"."capabilities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_capability_categories_updated_at" BEFORE UPDATE ON "public"."capability_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_chat_sessions_updated_at" BEFORE UPDATE ON "public"."chat_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clinical_validations_updated_at" BEFORE UPDATE ON "public"."clinical_validations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_competencies_updated_at" BEFORE UPDATE ON "public"."competencies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_expert_agents_updated_at" BEFORE UPDATE ON "public"."expert_agents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_jobs_updated_at" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_jtbd_categories_updated_at" BEFORE UPDATE ON "public"."jtbd_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_jtbd_core_updated_at" BEFORE UPDATE ON "public"."jtbd_core" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_knowledge_base_updated_at" BEFORE UPDATE ON "public"."knowledge_base" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_llm_providers_updated_at" BEFORE UPDATE ON "public"."llm_providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_llm_provider_updated_at"();



CREATE OR REPLACE TRIGGER "update_messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_prompts_updated_at" BEFORE UPDATE ON "public"."prompts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_quota_usage_trigger" AFTER INSERT ON "public"."llm_usage_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_quota_usage"();



CREATE OR REPLACE TRIGGER "update_tools_updated_at" BEFORE UPDATE ON "public"."tools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_virtual_boards_updated_at" BEFORE UPDATE ON "public"."virtual_boards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_steps_updated_at" BEFORE UPDATE ON "public"."workflow_steps" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflows_updated_at" BEFORE UPDATE ON "public"."workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."agent_audit_log"
    ADD CONSTRAINT "agent_audit_log_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_capabilities"
    ADD CONSTRAINT "agent_capabilities_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_category_mapping"
    ADD CONSTRAINT "agent_category_mapping_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."agent_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_performance_metrics"
    ADD CONSTRAINT "agent_performance_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."agent_prompts"
    ADD CONSTRAINT "agent_prompts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_prompts"
    ADD CONSTRAINT "agent_prompts_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_medical_reviewer_id_fkey" FOREIGN KEY ("medical_reviewer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_original_agent_id_fkey" FOREIGN KEY ("original_agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_parent_agent_id_fkey" FOREIGN KEY ("parent_agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."board_memberships"
    ADD CONSTRAINT "board_memberships_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."expert_agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."board_memberships"
    ADD CONSTRAINT "board_memberships_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."virtual_boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."capability_agents"
    ADD CONSTRAINT "capability_agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."expert_agents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."capability_agents"
    ADD CONSTRAINT "capability_agents_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."capability_categories"
    ADD CONSTRAINT "capability_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."capability_categories"("id");



ALTER TABLE ONLY "public"."capability_tools"
    ADD CONSTRAINT "capability_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinical_validations"
    ADD CONSTRAINT "clinical_validations_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."encrypted_api_keys"
    ADD CONSTRAINT "encrypted_api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."encrypted_api_keys"
    ADD CONSTRAINT "encrypted_api_keys_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_dependencies"
    ADD CONSTRAINT "job_dependencies_depends_on_job_id_fkey" FOREIGN KEY ("depends_on_job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_dependencies"
    ADD CONSTRAINT "job_dependencies_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_logs"
    ADD CONSTRAINT "job_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jtbd_core"
    ADD CONSTRAINT "jtbd_core_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."jtbd_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knowledge_base"
    ADD CONSTRAINT "knowledge_base_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."knowledge_base"
    ADD CONSTRAINT "knowledge_base_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_base"
    ADD CONSTRAINT "knowledge_base_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."llm_provider_health_checks"
    ADD CONSTRAINT "llm_provider_health_checks_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."llm_provider_metrics"
    ADD CONSTRAINT "llm_provider_metrics_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."llm_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."llm_providers"
    ADD CONSTRAINT "llm_providers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."llm_providers"
    ADD CONSTRAINT "llm_providers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."llm_usage_logs"
    ADD CONSTRAINT "llm_usage_logs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id");



ALTER TABLE ONLY "public"."llm_usage_logs"
    ADD CONSTRAINT "llm_usage_logs_llm_provider_id_fkey" FOREIGN KEY ("llm_provider_id") REFERENCES "public"."llm_providers"("id");



ALTER TABLE ONLY "public"."llm_usage_logs"
    ADD CONSTRAINT "llm_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."medical_validations"
    ADD CONSTRAINT "medical_validations_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."phi_access_log"
    ADD CONSTRAINT "phi_access_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."system_prompts"
    ADD CONSTRAINT "system_prompts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."system_prompts"
    ADD CONSTRAINT "system_prompts_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."usage_quotas"
    ADD CONSTRAINT "usage_quotas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."virtual_boards"
    ADD CONSTRAINT "virtual_boards_lead_agent_id_fkey" FOREIGN KEY ("lead_agent_id") REFERENCES "public"."expert_agents"("id");



ALTER TABLE ONLY "public"."workflow_executions"
    ADD CONSTRAINT "workflow_executions_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workflow_executions"
    ADD CONSTRAINT "workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_steps"
    ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



CREATE POLICY "Agent categories are viewable by authenticated users" ON "public"."agent_categories" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Agent category mapping is viewable by authenticated users" ON "public"."agent_category_mapping" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Agent collaborations are viewable by authenticated users" ON "public"."agent_collaborations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create agents" ON "public"."agents" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can manage LLM providers" ON "public"."llm_providers" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update agents" ON "public"."agents" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR ("is_custom" = true))) WITH CHECK ((("created_by" = "auth"."uid"()) OR ("is_custom" = true)));



CREATE POLICY "Authenticated users can view agents" ON "public"."agents" FOR SELECT TO "authenticated" USING ((("data_classification" = ANY (ARRAY['public'::"public"."data_classification", 'internal'::"public"."data_classification"])) OR ("is_public" = true) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Authenticated users can view all usage logs" ON "public"."llm_usage_logs" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view internal agents" ON "public"."agents" FOR SELECT TO "authenticated" USING (("data_classification" = ANY (ARRAY['public'::"public"."data_classification", 'internal'::"public"."data_classification"])));



CREATE POLICY "Authenticated write access" ON "public"."agent_capabilities" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."board_memberships" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."capabilities" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."capability_agents" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."capability_workflows" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."expert_agents" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated write access" ON "public"."virtual_boards" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."jobs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."job_dependencies" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."job_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."jobs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."jtbd_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."jtbd_core" FOR SELECT USING (true);



CREATE POLICY "Enable update for job owners" ON "public"."jobs" FOR UPDATE USING (true);



CREATE POLICY "Public agents are viewable by everyone" ON "public"."agents" FOR SELECT USING (("data_classification" = 'public'::"public"."data_classification"));



CREATE POLICY "Public read access" ON "public"."agent_capabilities" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."board_memberships" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."capabilities" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."capability_agents" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."capability_workflows" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."expert_agents" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."virtual_boards" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own custom agents" ON "public"."agents" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) AND ("is_custom" = true)));



CREATE POLICY "Users can insert their own agent metrics" ON "public"."agent_performance_metrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own agent metrics" ON "public"."agent_performance_metrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own agents" ON "public"."agents" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR ("is_custom" = true)));



CREATE POLICY "Users can view active LLM providers" ON "public"."llm_providers" FOR SELECT TO "authenticated" USING ((("is_active" = true) AND ("status" = 'active'::"public"."provider_status")));



CREATE POLICY "Users can view audit logs for agents they can see" ON "public"."agent_audit_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."agents"
  WHERE (("agents"."id" = "agent_audit_log"."agent_id") AND (("agents"."data_classification" = ANY (ARRAY['public'::"public"."data_classification", 'internal'::"public"."data_classification"])) OR ("agents"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Users can view own quotas" ON "public"."usage_quotas" FOR SELECT TO "authenticated" USING ((((("entity_type")::"text" = 'user'::"text") AND ("entity_id" = "auth"."uid"())) OR (("entity_type")::"text" = 'global'::"text")));



CREATE POLICY "Users can view own usage logs" ON "public"."llm_usage_logs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own agent metrics" ON "public"."agent_performance_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."agent_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_capabilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_category_mapping" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_collaborations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_performance_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_prompts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agent_prompts_admin_write_policy" ON "public"."agent_prompts" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "agent_prompts_read_policy" ON "public"."agent_prompts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."board_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_functions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "business_functions_read_policy" ON "public"."business_functions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."capabilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."capability_agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."capability_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "capability_categories_admin_write_policy" ON "public"."capability_categories" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "capability_categories_read_policy" ON "public"."capability_categories" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."capability_tools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "capability_tools_read_policy" ON "public"."capability_tools" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."capability_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chat_sessions_delete" ON "public"."chat_sessions" FOR DELETE USING (true);



CREATE POLICY "chat_sessions_insert" ON "public"."chat_sessions" FOR INSERT WITH CHECK (true);



CREATE POLICY "chat_sessions_select" ON "public"."chat_sessions" FOR SELECT USING (true);



CREATE POLICY "chat_sessions_update" ON "public"."chat_sessions" FOR UPDATE USING (true);



ALTER TABLE "public"."clinical_validations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinical_validations_delete" ON "public"."clinical_validations" FOR DELETE USING (true);



CREATE POLICY "clinical_validations_insert" ON "public"."clinical_validations" FOR INSERT WITH CHECK (true);



CREATE POLICY "clinical_validations_select" ON "public"."clinical_validations" FOR SELECT USING (true);



CREATE POLICY "clinical_validations_update" ON "public"."clinical_validations" FOR UPDATE USING (true);



ALTER TABLE "public"."competencies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "competencies_admin_write_policy" ON "public"."competencies" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "competencies_read_policy" ON "public"."competencies" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_delete" ON "public"."conversations" FOR DELETE USING (true);



CREATE POLICY "conversations_insert" ON "public"."conversations" FOR INSERT WITH CHECK (true);



CREATE POLICY "conversations_select" ON "public"."conversations" FOR SELECT USING (true);



CREATE POLICY "conversations_update" ON "public"."conversations" FOR UPDATE USING (true);



ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "documents_delete" ON "public"."documents" FOR DELETE USING (true);



CREATE POLICY "documents_insert" ON "public"."documents" FOR INSERT WITH CHECK (true);



CREATE POLICY "documents_select" ON "public"."documents" FOR SELECT USING (true);



CREATE POLICY "documents_update" ON "public"."documents" FOR UPDATE USING (true);



ALTER TABLE "public"."encrypted_api_keys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "encrypted_api_keys_delete_policy" ON "public"."encrypted_api_keys" FOR DELETE USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'delete'::"public"."permission_action"));



CREATE POLICY "encrypted_api_keys_insert_policy" ON "public"."encrypted_api_keys" FOR INSERT WITH CHECK ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'create'::"public"."permission_action"));



CREATE POLICY "encrypted_api_keys_select_policy" ON "public"."encrypted_api_keys" FOR SELECT USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'read'::"public"."permission_action"));



CREATE POLICY "encrypted_api_keys_update_policy" ON "public"."encrypted_api_keys" FOR UPDATE USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'update'::"public"."permission_action"));



ALTER TABLE "public"."expert_agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_dependencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jtbd_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jtbd_core" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_base" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "knowledge_base_delete" ON "public"."knowledge_base" FOR DELETE USING (true);



CREATE POLICY "knowledge_base_insert" ON "public"."knowledge_base" FOR INSERT WITH CHECK (true);



CREATE POLICY "knowledge_base_select" ON "public"."knowledge_base" FOR SELECT USING (true);



CREATE POLICY "knowledge_base_update" ON "public"."knowledge_base" FOR UPDATE USING (true);



ALTER TABLE "public"."llm_provider_health_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."llm_provider_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."llm_providers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "llm_providers_delete_policy" ON "public"."llm_providers" FOR DELETE USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'delete'::"public"."permission_action"));



CREATE POLICY "llm_providers_insert_policy" ON "public"."llm_providers" FOR INSERT WITH CHECK ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'create'::"public"."permission_action"));



CREATE POLICY "llm_providers_select_policy" ON "public"."llm_providers" FOR SELECT USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'read'::"public"."permission_action"));



CREATE POLICY "llm_providers_update_policy" ON "public"."llm_providers" FOR UPDATE USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'llm_providers'::"public"."permission_scope", 'update'::"public"."permission_action"));



ALTER TABLE "public"."llm_usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_validations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "medical_validations_admin_write_policy" ON "public"."medical_validations" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "medical_validations_read_policy" ON "public"."medical_validations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_delete" ON "public"."messages" FOR DELETE USING (true);



CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT WITH CHECK (true);



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT USING (true);



CREATE POLICY "messages_update" ON "public"."messages" FOR UPDATE USING (true);



ALTER TABLE "public"."phi_access_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "phi_access_log_user_policy" ON "public"."phi_access_log" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "prompts_admin_write_policy" ON "public"."prompts" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "prompts_read_policy" ON "public"."prompts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_select_policy" ON "public"."role_permissions" FOR SELECT USING (true);



ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_read_policy" ON "public"."roles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "security_audit_insert_policy" ON "public"."security_audit_log" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."security_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "security_audit_select_policy" ON "public"."security_audit_log" FOR SELECT USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'audit_logs'::"public"."permission_scope", 'read'::"public"."permission_action"));



ALTER TABLE "public"."system_prompts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "system_prompts_read_policy" ON "public"."system_prompts" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND ("is_active" = true)));



ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tools_admin_write_policy" ON "public"."tools" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['admin@vitalpath.ai'::"text", 'hicham@vitalpath.ai'::"text"])));



CREATE POLICY "tools_read_policy" ON "public"."tools" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."usage_quotas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_delete_policy" ON "public"."user_profiles" FOR DELETE USING ("public"."check_user_permission"("public"."get_current_user_email"(), 'user_management'::"public"."permission_scope", 'delete'::"public"."permission_action"));



CREATE POLICY "user_profiles_insert_policy" ON "public"."user_profiles" FOR INSERT WITH CHECK ("public"."check_user_permission"("public"."get_current_user_email"(), 'user_management'::"public"."permission_scope", 'create'::"public"."permission_action"));



CREATE POLICY "user_profiles_select_policy" ON "public"."user_profiles" FOR SELECT USING (((("email")::"text" = "public"."get_current_user_email"()) OR "public"."is_admin_user"("public"."get_current_user_email"())));



CREATE POLICY "user_profiles_update_policy" ON "public"."user_profiles" FOR UPDATE USING (((("email")::"text" = "public"."get_current_user_email"()) OR "public"."check_user_permission"("public"."get_current_user_email"(), 'user_management'::"public"."permission_scope", 'update'::"public"."permission_action")));



ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_sessions_insert_policy" ON "public"."user_sessions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_sessions_select_policy" ON "public"."user_sessions" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin_user"("public"."get_current_user_email"())));



CREATE POLICY "user_sessions_update_policy" ON "public"."user_sessions" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin_user"("public"."get_current_user_email"())));



ALTER TABLE "public"."virtual_boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_executions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_executions_delete" ON "public"."workflow_executions" FOR DELETE USING (true);



CREATE POLICY "workflow_executions_insert" ON "public"."workflow_executions" FOR INSERT WITH CHECK (true);



CREATE POLICY "workflow_executions_select" ON "public"."workflow_executions" FOR SELECT USING (true);



CREATE POLICY "workflow_executions_update" ON "public"."workflow_executions" FOR UPDATE USING (true);



ALTER TABLE "public"."workflow_steps" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_steps_delete" ON "public"."workflow_steps" FOR DELETE USING (true);



CREATE POLICY "workflow_steps_insert" ON "public"."workflow_steps" FOR INSERT WITH CHECK (true);



CREATE POLICY "workflow_steps_select" ON "public"."workflow_steps" FOR SELECT USING (true);



CREATE POLICY "workflow_steps_update" ON "public"."workflow_steps" FOR UPDATE USING (true);



ALTER TABLE "public"."workflows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflows_delete" ON "public"."workflows" FOR DELETE USING (true);



CREATE POLICY "workflows_insert" ON "public"."workflows" FOR INSERT WITH CHECK (true);



CREATE POLICY "workflows_select" ON "public"."workflows" FOR SELECT USING (true);



CREATE POLICY "workflows_update" ON "public"."workflows" FOR UPDATE USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_security_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_security_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_security_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_job_duration"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_job_duration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_job_duration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_permission"("user_email" "text", "required_scope" "public"."permission_scope", "required_action" "public"."permission_action") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_permission"("user_email" "text", "required_scope" "public"."permission_scope", "required_action" "public"."permission_action") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_permission"("user_email" "text", "required_scope" "public"."permission_scope", "required_action" "public"."permission_action") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_jobs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_agent_assigned_capabilities"("agent_name_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_agent_assigned_capabilities"("agent_name_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_agent_assigned_capabilities"("agent_name_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_capabilities_for_agent"("agent_name_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_capabilities_for_agent"("agent_name_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_capabilities_for_agent"("agent_name_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_capabilities_by_stage"("stage_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_capabilities_by_stage"("stage_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_capabilities_by_stage"("stage_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_llm_provider_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_llm_provider_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_llm_provider_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quota_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_quota_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quota_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."agents" TO "anon";
GRANT ALL ON TABLE "public"."agents" TO "authenticated";
GRANT ALL ON TABLE "public"."agents" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."workflows" TO "anon";
GRANT ALL ON TABLE "public"."workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."workflows" TO "service_role";



GRANT ALL ON TABLE "public"."active_jobs_view" TO "anon";
GRANT ALL ON TABLE "public"."active_jobs_view" TO "authenticated";
GRANT ALL ON TABLE "public"."active_jobs_view" TO "service_role";



GRANT ALL ON TABLE "public"."agent_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."agent_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."agent_capabilities" TO "anon";
GRANT ALL ON TABLE "public"."agent_capabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_capabilities" TO "service_role";



GRANT ALL ON TABLE "public"."agent_categories" TO "anon";
GRANT ALL ON TABLE "public"."agent_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_categories" TO "service_role";



GRANT ALL ON TABLE "public"."agent_category_mapping" TO "anon";
GRANT ALL ON TABLE "public"."agent_category_mapping" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_category_mapping" TO "service_role";



GRANT ALL ON TABLE "public"."agent_collaborations" TO "anon";
GRANT ALL ON TABLE "public"."agent_collaborations" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_collaborations" TO "service_role";



GRANT ALL ON TABLE "public"."agent_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."agent_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."agent_prompts" TO "anon";
GRANT ALL ON TABLE "public"."agent_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_prompts" TO "service_role";



GRANT ALL ON TABLE "public"."board_memberships" TO "anon";
GRANT ALL ON TABLE "public"."board_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."board_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."business_functions" TO "anon";
GRANT ALL ON TABLE "public"."business_functions" TO "authenticated";
GRANT ALL ON TABLE "public"."business_functions" TO "service_role";



GRANT ALL ON TABLE "public"."capabilities" TO "anon";
GRANT ALL ON TABLE "public"."capabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."capabilities" TO "service_role";



GRANT ALL ON TABLE "public"."capability_agents" TO "anon";
GRANT ALL ON TABLE "public"."capability_agents" TO "authenticated";
GRANT ALL ON TABLE "public"."capability_agents" TO "service_role";



GRANT ALL ON TABLE "public"."capability_categories" TO "anon";
GRANT ALL ON TABLE "public"."capability_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."capability_categories" TO "service_role";



GRANT ALL ON TABLE "public"."capability_tools" TO "anon";
GRANT ALL ON TABLE "public"."capability_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."capability_tools" TO "service_role";



GRANT ALL ON TABLE "public"."capability_workflows" TO "anon";
GRANT ALL ON TABLE "public"."capability_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."capability_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."chat_sessions" TO "anon";
GRANT ALL ON TABLE "public"."chat_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."clinical_validations" TO "anon";
GRANT ALL ON TABLE "public"."clinical_validations" TO "authenticated";
GRANT ALL ON TABLE "public"."clinical_validations" TO "service_role";



GRANT ALL ON TABLE "public"."competencies" TO "anon";
GRANT ALL ON TABLE "public"."competencies" TO "authenticated";
GRANT ALL ON TABLE "public"."competencies" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."encrypted_api_keys" TO "anon";
GRANT ALL ON TABLE "public"."encrypted_api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."encrypted_api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."expert_agents" TO "anon";
GRANT ALL ON TABLE "public"."expert_agents" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_agents" TO "service_role";



GRANT ALL ON TABLE "public"."icons" TO "anon";
GRANT ALL ON TABLE "public"."icons" TO "authenticated";
GRANT ALL ON TABLE "public"."icons" TO "service_role";



GRANT ALL ON TABLE "public"."job_dependencies" TO "anon";
GRANT ALL ON TABLE "public"."job_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."job_dependencies" TO "service_role";



GRANT ALL ON TABLE "public"."job_logs" TO "anon";
GRANT ALL ON TABLE "public"."job_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."job_logs" TO "service_role";



GRANT ALL ON TABLE "public"."jtbd_categories" TO "anon";
GRANT ALL ON TABLE "public"."jtbd_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."jtbd_categories" TO "service_role";



GRANT ALL ON TABLE "public"."jtbd_core" TO "anon";
GRANT ALL ON TABLE "public"."jtbd_core" TO "authenticated";
GRANT ALL ON TABLE "public"."jtbd_core" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_base" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_base" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_base" TO "service_role";



GRANT ALL ON TABLE "public"."llm_provider_health_checks" TO "anon";
GRANT ALL ON TABLE "public"."llm_provider_health_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_provider_health_checks" TO "service_role";



GRANT ALL ON TABLE "public"."llm_provider_metrics" TO "anon";
GRANT ALL ON TABLE "public"."llm_provider_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_provider_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."llm_providers" TO "anon";
GRANT ALL ON TABLE "public"."llm_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_providers" TO "service_role";



GRANT ALL ON TABLE "public"."llm_usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."llm_usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_usage_logs" TO "service_role";



GRANT ALL ON TABLE "public"."medical_validations" TO "anon";
GRANT ALL ON TABLE "public"."medical_validations" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_validations" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."phi_access_log" TO "anon";
GRANT ALL ON TABLE "public"."phi_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."phi_access_log" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."prompts" TO "anon";
GRANT ALL ON TABLE "public"."prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."prompts" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."system_prompts" TO "anon";
GRANT ALL ON TABLE "public"."system_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."system_prompts" TO "service_role";



GRANT ALL ON TABLE "public"."tools" TO "anon";
GRANT ALL ON TABLE "public"."tools" TO "authenticated";
GRANT ALL ON TABLE "public"."tools" TO "service_role";



GRANT ALL ON TABLE "public"."usage_quotas" TO "anon";
GRANT ALL ON TABLE "public"."usage_quotas" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_quotas" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."virtual_boards" TO "anon";
GRANT ALL ON TABLE "public"."virtual_boards" TO "authenticated";
GRANT ALL ON TABLE "public"."virtual_boards" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_executions" TO "anon";
GRANT ALL ON TABLE "public"."workflow_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_executions" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_steps" TO "anon";
GRANT ALL ON TABLE "public"."workflow_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_steps" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
