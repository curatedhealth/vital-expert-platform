--
-- PostgreSQL database dump
--

\restrict zQ5ljZFqQXZre63arxIoJWfGxed0kteev81vbzPSNFfClihxbXsGFuHwKBdt1vL

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
-- Name: capability_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capability_workflows (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    stage public.lifecycle_stage NOT NULL,
    workflow_steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    required_capabilities uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    required_agents integer[] DEFAULT '{}'::integer[] NOT NULL,
    estimated_duration integer,
    prerequisites jsonb DEFAULT '[]'::jsonb,
    deliverables jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.capability_workflows OWNER TO postgres;

--
-- Name: TABLE capability_workflows; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.capability_workflows IS 'Workflow definitions for capability implementation';


--
-- Data for Name: capability_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capability_workflows (id, name, stage, workflow_steps, required_capabilities, required_agents, estimated_duration, prerequisites, deliverables, created_at, updated_at) FROM stdin;
\.


--
-- Name: capability_workflows capability_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capability_workflows
    ADD CONSTRAINT capability_workflows_pkey PRIMARY KEY (id);


--
-- Name: capability_workflows Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.capability_workflows USING ((auth.role() = 'authenticated'::text));


--
-- Name: capability_workflows Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.capability_workflows FOR SELECT USING (true);


--
-- Name: capability_workflows; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.capability_workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE capability_workflows; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.capability_workflows TO anon;
GRANT ALL ON TABLE public.capability_workflows TO authenticated;
GRANT ALL ON TABLE public.capability_workflows TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict zQ5ljZFqQXZre63arxIoJWfGxed0kteev81vbzPSNFfClihxbXsGFuHwKBdt1vL

