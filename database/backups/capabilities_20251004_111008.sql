--
-- PostgreSQL database dump
--

\restrict vLx3xRxp4kDlC7aEqRIX9TKf6A4VI6huQoyS7IUek6HemqzVjGSoAipuEEvrwvB

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
b268d8bc-266f-4767-a180-b1f3910148c6	clinical-trial-design	Clinical Trial Design	Design and structure clinical trials for medical devices including protocol development, endpoint selection, and statistical planning	clinical_validation	T_transformation_design	critical_immediate	level_4_leading	f	t	{"methodology": {"approach": "evidence-based"}, "quality_metrics": {"accuracy_target": "95%", "compliance_requirements": ["ICH-GCP", "FDA 21 CFR Part 820", "ISO 14155"]}}	[]	[]	{}	4	{}	{}	clinical	⚡	text-trust-blue	advanced	medical	[]	0	0.00	0	f	f	f	active	1.0.0	2025-10-04 09:09:36.992251+00	2025-10-04 09:09:36.992251+00	\N
fbe46488-1b58-47f8-9c37-44d63254d252	regulatory-submission	Regulatory Submission Preparation	Prepare comprehensive regulatory submissions including 510(k), PMA, CE-MDR technical documentation	regulatory_pathway	A_acceleration_execution	critical_immediate	level_5_transformative	f	t	{"methodology": {"approach": "systematic"}, "quality_metrics": {"accuracy_target": "98%", "compliance_requirements": ["FDA 21 CFR 807", "CE-MDR Annex II", "ISO 13485"]}}	[]	[]	{}	8	{}	{}	regulatory	⚡	text-trust-blue	expert	regulatory	[]	0	0.00	0	f	f	f	active	1.0.0	2025-10-04 09:09:36.992251+00	2025-10-04 09:09:36.992251+00	\N
55e6a88d-baf0-4eaa-9bb7-4aaf12321716	health-economics	Health Economic Analysis	Conduct health economic evaluations, budget impact analyses, and cost-effectiveness studies for medical technologies	reimbursement_strategy	V_value_discovery	near_term_90_days	level_4_leading	f	t	{"methodology": {"approach": "evidence-based"}, "quality_metrics": {"accuracy_target": "92%", "compliance_requirements": ["ISPOR Guidelines", "NICE Methods Guide", "ICER Framework"]}}	[]	[]	{}	6	{}	{}	commercial	⚡	text-trust-blue	advanced	commercial	[]	0	0.00	0	f	f	f	active	1.0.0	2025-10-04 09:09:36.992251+00	2025-10-04 09:09:36.992251+00	\N
546438d6-cf95-4d5e-85ba-2525b384a6b5	quality-systems	Quality Management Systems	Develop and implement quality management systems compliant with ISO 13485 and FDA QSR	regulatory_pathway	T_transformation_design	critical_immediate	level_5_transformative	f	t	{"methodology": {"approach": "systematic"}, "quality_metrics": {"accuracy_target": "96%", "compliance_requirements": ["ISO 13485", "FDA 21 CFR 820", "ISO 9001"]}}	[]	[]	{}	5	{}	{}	quality	⚡	text-trust-blue	advanced	technical	[]	0	0.00	0	f	f	f	active	1.0.0	2025-10-04 09:09:36.992251+00	2025-10-04 09:09:36.992251+00	\N
3ae6fae3-6e72-42bd-af21-3859978b1f54	statistical-analysis	Clinical Statistical Analysis	Perform statistical analyses for clinical studies including descriptive statistics, hypothesis testing, and survival analysis	clinical_validation	I_intelligence_gathering	critical_immediate	level_4_leading	f	t	{"methodology": {"approach": "statistical"}, "quality_metrics": {"accuracy_target": "97%", "compliance_requirements": ["ICH E9", "FDA Statistical Guidance", "EMA Statistical Guidelines"]}}	[]	[]	{}	4	{}	{}	clinical	⚡	text-trust-blue	advanced	medical	[]	0	0.00	0	f	f	f	active	1.0.0	2025-10-04 09:09:36.992251+00	2025-10-04 09:09:36.992251+00	\N
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

\unrestrict vLx3xRxp4kDlC7aEqRIX9TKf6A4VI6huQoyS7IUek6HemqzVjGSoAipuEEvrwvB

