--
-- PostgreSQL database dump
--

\restrict 4n1kDNlChxknahOnuRwAHvjjnnoIyW9wnqcTsJZTDY6GhvBHRRBPuc3XkDZ1fdE

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
-- Name: capability_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capability_agents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    capability_id uuid NOT NULL,
    agent_id integer NOT NULL,
    relationship_type character varying(50) NOT NULL,
    expertise_score numeric(3,2),
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    last_review timestamp with time zone,
    contribution_notes text,
    CONSTRAINT capability_agents_expertise_score_check CHECK (((expertise_score >= (0)::numeric) AND (expertise_score <= (1)::numeric)))
);


ALTER TABLE public.capability_agents OWNER TO postgres;

--
-- Name: TABLE capability_agents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.capability_agents IS 'Links agents to their assigned capabilities with expertise scores';


--
-- Data for Name: capability_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capability_agents (id, capability_id, agent_id, relationship_type, expertise_score, assigned_at, last_review, contribution_notes) FROM stdin;
\.


--
-- Name: capability_agents capability_agents_capability_id_agent_id_relationship_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capability_agents
    ADD CONSTRAINT capability_agents_capability_id_agent_id_relationship_type_key UNIQUE (capability_id, agent_id, relationship_type);


--
-- Name: capability_agents capability_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capability_agents
    ADD CONSTRAINT capability_agents_pkey PRIMARY KEY (id);


--
-- Name: idx_cap_agents_agent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cap_agents_agent ON public.capability_agents USING btree (agent_id);


--
-- Name: idx_cap_agents_capability; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cap_agents_capability ON public.capability_agents USING btree (capability_id);


--
-- Name: idx_cap_agents_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cap_agents_type ON public.capability_agents USING btree (relationship_type);


--
-- Name: capability_agents capability_agents_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capability_agents
    ADD CONSTRAINT capability_agents_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.expert_agents(id) ON DELETE CASCADE;


--
-- Name: capability_agents capability_agents_capability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capability_agents
    ADD CONSTRAINT capability_agents_capability_id_fkey FOREIGN KEY (capability_id) REFERENCES public.capabilities(id) ON DELETE CASCADE;


--
-- Name: capability_agents Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.capability_agents USING ((auth.role() = 'authenticated'::text));


--
-- Name: capability_agents Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.capability_agents FOR SELECT USING (true);


--
-- Name: capability_agents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.capability_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE capability_agents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.capability_agents TO anon;
GRANT ALL ON TABLE public.capability_agents TO authenticated;
GRANT ALL ON TABLE public.capability_agents TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict 4n1kDNlChxknahOnuRwAHvjjnnoIyW9wnqcTsJZTDY6GhvBHRRBPuc3XkDZ1fdE

