--
-- PostgreSQL database dump
--

\restrict dxvRAsorTzMRjOaVlj9j74BxzhmdjCHb7DZLR0p00FOsUK5r8ySe2fy6wDggMeB

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
-- Name: agent_capabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_capabilities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    agent_id uuid NOT NULL,
    capability_id uuid NOT NULL,
    proficiency_level character varying(20) DEFAULT 'intermediate'::character varying,
    custom_config jsonb DEFAULT '{}'::jsonb,
    is_primary boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    success_rate numeric(5,2) DEFAULT 0.0,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agent_capabilities_proficiency_level_check CHECK (((proficiency_level)::text = ANY ((ARRAY['basic'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'expert'::character varying])::text[])))
);


ALTER TABLE public.agent_capabilities OWNER TO postgres;

--
-- Data for Name: agent_capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_capabilities (id, agent_id, capability_id, proficiency_level, custom_config, is_primary, usage_count, success_rate, last_used_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: agent_capabilities agent_capabilities_agent_id_capability_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_capabilities
    ADD CONSTRAINT agent_capabilities_agent_id_capability_id_key UNIQUE (agent_id, capability_id);


--
-- Name: agent_capabilities agent_capabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_capabilities
    ADD CONSTRAINT agent_capabilities_pkey PRIMARY KEY (id);


--
-- Name: idx_agent_capabilities_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_capabilities_agent_id ON public.agent_capabilities USING btree (agent_id);


--
-- Name: idx_agent_capabilities_capability_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_capabilities_capability_id ON public.agent_capabilities USING btree (capability_id);


--
-- Name: idx_agent_capabilities_proficiency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_capabilities_proficiency ON public.agent_capabilities USING btree (proficiency_level);


--
-- Name: agent_capabilities update_agent_capabilities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_agent_capabilities_updated_at BEFORE UPDATE ON public.agent_capabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agent_capabilities agent_capabilities_capability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_capabilities
    ADD CONSTRAINT agent_capabilities_capability_id_fkey FOREIGN KEY (capability_id) REFERENCES public.capabilities(id) ON DELETE CASCADE;


--
-- Name: agent_capabilities Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.agent_capabilities USING ((auth.role() = 'authenticated'::text));


--
-- Name: agent_capabilities Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.agent_capabilities FOR SELECT USING (true);


--
-- Name: agent_capabilities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE agent_capabilities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.agent_capabilities TO anon;
GRANT ALL ON TABLE public.agent_capabilities TO authenticated;
GRANT ALL ON TABLE public.agent_capabilities TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict dxvRAsorTzMRjOaVlj9j74BxzhmdjCHb7DZLR0p00FOsUK5r8ySe2fy6wDggMeB

