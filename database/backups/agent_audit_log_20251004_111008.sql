--
-- PostgreSQL database dump
--

\restrict Kyh5YGLf44KAWhflXZdqkApqiAxdVgi997sQqqg5nN2fxkcfGqenECzatXaILzD

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
-- Name: agent_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_audit_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    agent_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    changed_by uuid,
    changed_at timestamp without time zone DEFAULT now(),
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.agent_audit_log OWNER TO postgres;

--
-- Data for Name: agent_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_audit_log (id, agent_id, action, changed_by, changed_at, old_values, new_values, ip_address, user_agent) FROM stdin;
\.


--
-- Name: agent_audit_log agent_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_audit_log
    ADD CONSTRAINT agent_audit_log_pkey PRIMARY KEY (id);


--
-- Name: idx_agent_audit_log_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_audit_log_action ON public.agent_audit_log USING btree (action);


--
-- Name: idx_agent_audit_log_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_audit_log_agent_id ON public.agent_audit_log USING btree (agent_id);


--
-- Name: idx_agent_audit_log_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_audit_log_changed_at ON public.agent_audit_log USING btree (changed_at DESC);


--
-- Name: agent_audit_log agent_audit_log_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_audit_log
    ADD CONSTRAINT agent_audit_log_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_audit_log Users can view audit logs for agents they can see; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view audit logs for agents they can see" ON public.agent_audit_log FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.agents
  WHERE ((agents.id = agent_audit_log.agent_id) AND ((agents.data_classification = ANY (ARRAY['public'::public.data_classification, 'internal'::public.data_classification])) OR (agents.created_by = auth.uid()))))));


--
-- Name: agent_audit_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.agent_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE agent_audit_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.agent_audit_log TO anon;
GRANT ALL ON TABLE public.agent_audit_log TO authenticated;
GRANT ALL ON TABLE public.agent_audit_log TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict Kyh5YGLf44KAWhflXZdqkApqiAxdVgi997sQqqg5nN2fxkcfGqenECzatXaILzD

