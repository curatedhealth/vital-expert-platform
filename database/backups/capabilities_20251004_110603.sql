--
-- PostgreSQL database dump
--

\restrict wXWTmKRNSaEqivhVEkzOn5BLbdKg705nhv7rvr9mfhLGm0mnoPbcMzaJ5AtUZfp

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: capabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capabilities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    capability_key character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    stage public.lifecycle_stage NOT NULL,
    vital_component public.vital_framework NOT NULL,
    priority public.priority_level NOT NULL,
    maturity public.maturity_level NOT NULL,
    is_new boolean DEFAULT false,
    panel_recommended boolean DEFAULT false,
    competencies jsonb DEFAULT '[]'::jsonb NOT NULL,
    tools jsonb DEFAULT '[]'::jsonb,
    knowledge_base jsonb DEFAULT '[]'::jsonb,
    success_metrics jsonb DEFAULT '{}'::jsonb,
    implementation_timeline integer,
    depends_on uuid[] DEFAULT '{}'::uuid[],
    enables uuid[] DEFAULT '{}'::uuid[],
    category character varying(100) DEFAULT 'general'::character varying,
    icon character varying(10) DEFAULT '⚡'::character varying,
    color character varying(50) DEFAULT 'text-trust-blue'::character varying,
    complexity_level character varying(20) DEFAULT 'intermediate'::character varying,
    domain character varying(100) DEFAULT 'general'::character varying,
    prerequisites jsonb DEFAULT '[]'::jsonb,
    usage_count integer DEFAULT 0,
    success_rate numeric(5,2) DEFAULT 0.0,
    average_execution_time integer DEFAULT 0,
    is_premium boolean DEFAULT false,
    requires_training boolean DEFAULT false,
    requires_api_access boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    version character varying(20) DEFAULT '1.0.0'::character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    created_by uuid,
    search_vector tsvector GENERATED ALWAYS AS (((setweight(to_tsvector('english'::regconfig, (name)::text), 'A'::"char") || setweight(to_tsvector('english'::regconfig, description), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, COALESCE((competencies)::text, ''::text)), 'C'::"char"))) STORED
);


ALTER TABLE public.capabilities OWNER TO postgres;

--
-- Name: TABLE capabilities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.capabilities IS 'Enhanced capabilities registry for digital health interventions';


--
-- Data for Name: capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capabilities (id, capability_key, name, description, stage, vital_component, priority, maturity, is_new, panel_recommended, competencies, tools, knowledge_base, success_metrics, implementation_timeline, depends_on, enables, category, icon, color, complexity_level, domain, prerequisites, usage_count, success_rate, average_execution_time, is_premium, requires_training, requires_api_access, status, version, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Name: capabilities capabilities_capability_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capabilities
    ADD CONSTRAINT capabilities_capability_key_key UNIQUE (capability_key);


--
-- Name: capabilities capabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capabilities
    ADD CONSTRAINT capabilities_pkey PRIMARY KEY (id);


--
-- Name: idx_capabilities_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_category ON public.capabilities USING btree (category);


--
-- Name: idx_capabilities_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_domain ON public.capabilities USING btree (domain);


--
-- Name: idx_capabilities_maturity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_maturity ON public.capabilities USING btree (maturity);


--
-- Name: idx_capabilities_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_priority ON public.capabilities USING btree (priority);


--
-- Name: idx_capabilities_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_search ON public.capabilities USING gin (search_vector);


--
-- Name: idx_capabilities_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_stage ON public.capabilities USING btree (stage);


--
-- Name: idx_capabilities_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_status ON public.capabilities USING btree (status);


--
-- Name: idx_capabilities_vital; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_capabilities_vital ON public.capabilities USING btree (vital_component);


--
-- Name: capabilities update_capabilities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_capabilities_updated_at BEFORE UPDATE ON public.capabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: capabilities Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.capabilities USING ((auth.role() = 'authenticated'::text));


--
-- Name: capabilities Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.capabilities FOR SELECT USING (true);


--
-- Name: capabilities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE capabilities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.capabilities TO anon;
GRANT ALL ON TABLE public.capabilities TO authenticated;
GRANT ALL ON TABLE public.capabilities TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict wXWTmKRNSaEqivhVEkzOn5BLbdKg705nhv7rvr9mfhLGm0mnoPbcMzaJ5AtUZfp

