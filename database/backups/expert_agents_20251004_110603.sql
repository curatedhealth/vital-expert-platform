--
-- PostgreSQL database dump
--

\restrict ofGdZfpsmmRf2fmM86Bkpp4nBZFIBlnCsYKgFfxfmdCn84ujafZgsRRnEpiWGE2

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
-- Name: expert_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expert_agents (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    organization character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    domain public.agent_domain NOT NULL,
    focus_area text NOT NULL,
    key_expertise text NOT NULL,
    years_experience integer,
    credentials jsonb DEFAULT '[]'::jsonb,
    publications jsonb DEFAULT '[]'::jsonb,
    specializations jsonb DEFAULT '[]'::jsonb,
    availability character varying(50),
    engagement_tier integer,
    timezone character varying(50),
    languages jsonb DEFAULT '["English"]'::jsonb,
    communication_preferences jsonb DEFAULT '{}'::jsonb,
    virtual_board_memberships jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_active boolean DEFAULT true,
    search_vector tsvector GENERATED ALWAYS AS (((setweight(to_tsvector('english'::regconfig, (name)::text), 'A'::"char") || setweight(to_tsvector('english'::regconfig, (organization)::text), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, key_expertise), 'C'::"char"))) STORED,
    CONSTRAINT expert_agents_engagement_tier_check CHECK (((engagement_tier >= 1) AND (engagement_tier <= 4)))
);


ALTER TABLE public.expert_agents OWNER TO postgres;

--
-- Name: TABLE expert_agents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.expert_agents IS '100 expert agents for capability leadership and support';


--
-- Data for Name: expert_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expert_agents (id, name, organization, title, domain, focus_area, key_expertise, years_experience, credentials, publications, specializations, availability, engagement_tier, timezone, languages, communication_preferences, virtual_board_memberships, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Name: expert_agents expert_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expert_agents
    ADD CONSTRAINT expert_agents_pkey PRIMARY KEY (id);


--
-- Name: idx_agents_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agents_domain ON public.expert_agents USING btree (domain);


--
-- Name: idx_agents_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agents_tier ON public.expert_agents USING btree (engagement_tier);


--
-- Name: expert_agents update_expert_agents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_expert_agents_updated_at BEFORE UPDATE ON public.expert_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: expert_agents Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.expert_agents USING ((auth.role() = 'authenticated'::text));


--
-- Name: expert_agents Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.expert_agents FOR SELECT USING (true);


--
-- Name: expert_agents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expert_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE expert_agents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.expert_agents TO anon;
GRANT ALL ON TABLE public.expert_agents TO authenticated;
GRANT ALL ON TABLE public.expert_agents TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict ofGdZfpsmmRf2fmM86Bkpp4nBZFIBlnCsYKgFfxfmdCn84ujafZgsRRnEpiWGE2

