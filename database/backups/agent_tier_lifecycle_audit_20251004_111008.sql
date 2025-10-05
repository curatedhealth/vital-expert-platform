--
-- PostgreSQL database dump
--

\restrict GQIvIxzc2VbWl24Fzs8rfrsHykQE6jZzHcxUfeahumw36M11qfgJErxmdbEdW56

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
-- Name: agent_tier_lifecycle_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_tier_lifecycle_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid,
    changed_by uuid,
    old_tier integer,
    new_tier integer,
    old_status text,
    new_status text,
    change_reason text,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agent_tier_lifecycle_audit OWNER TO postgres;

--
-- Data for Name: agent_tier_lifecycle_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_tier_lifecycle_audit (id, agent_id, changed_by, old_tier, new_tier, old_status, new_status, change_reason, changed_at) FROM stdin;
\.


--
-- Name: agent_tier_lifecycle_audit agent_tier_lifecycle_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_tier_lifecycle_audit
    ADD CONSTRAINT agent_tier_lifecycle_audit_pkey PRIMARY KEY (id);


--
-- Name: idx_agent_tier_lifecycle_audit_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_tier_lifecycle_audit_agent_id ON public.agent_tier_lifecycle_audit USING btree (agent_id);


--
-- Name: idx_agent_tier_lifecycle_audit_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_tier_lifecycle_audit_changed_at ON public.agent_tier_lifecycle_audit USING btree (changed_at);


--
-- Name: agent_tier_lifecycle_audit agent_tier_lifecycle_audit_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_tier_lifecycle_audit
    ADD CONSTRAINT agent_tier_lifecycle_audit_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_tier_lifecycle_audit agent_tier_lifecycle_audit_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_tier_lifecycle_audit
    ADD CONSTRAINT agent_tier_lifecycle_audit_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: agent_tier_lifecycle_audit Admins can view all tier lifecycle changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all tier lifecycle changes" ON public.agent_tier_lifecycle_audit FOR SELECT USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['admin@vitalpath.ai'::text, 'hicham.naim@example.com'::text])));


--
-- Name: agent_tier_lifecycle_audit Users can view their own tier lifecycle changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own tier lifecycle changes" ON public.agent_tier_lifecycle_audit FOR SELECT USING ((auth.uid() = changed_by));


--
-- Name: agent_tier_lifecycle_audit; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.agent_tier_lifecycle_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE agent_tier_lifecycle_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.agent_tier_lifecycle_audit TO anon;
GRANT ALL ON TABLE public.agent_tier_lifecycle_audit TO authenticated;
GRANT ALL ON TABLE public.agent_tier_lifecycle_audit TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict GQIvIxzc2VbWl24Fzs8rfrsHykQE6jZzHcxUfeahumw36M11qfgJErxmdbEdW56

