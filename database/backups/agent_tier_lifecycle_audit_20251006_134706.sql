--
-- PostgreSQL database dump
--

\restrict rZYZ6HCyUepTaObWbbLml0S7yaZ1GuAADgNY9jBDO9frFJIbVpXFX0m96viQBDV

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
2c3fa056-80e3-40d5-9138-261d78e27aaf	10db0789-7deb-4ee8-b5bb-aa8e1ccf99e3	\N	2	1	inactive	active	\N	2025-10-06 09:23:02.597377+00
806b82a7-fcf9-4304-88cc-0b56d07e9e9a	78dcebbb-963b-47d8-9608-73ddbf3f6b85	\N	2	1	inactive	active	\N	2025-10-06 09:23:11.614824+00
172cb354-32cf-4ffe-9c13-2c31254fb3f2	b7d310fe-63e1-4f24-97c9-4f2ced05c8f0	\N	2	1	inactive	inactive	\N	2025-10-06 09:27:24.532872+00
4e4e8f7b-ed3a-4653-89e3-e4b2226330e9	3f075968-e271-49ca-8aef-172592f24cf6	\N	2	1	inactive	testing	\N	2025-10-06 09:27:41.597667+00
bdf8a8e4-b9f8-4d21-8cff-55063533a71e	b7d310fe-63e1-4f24-97c9-4f2ced05c8f0	\N	1	1	inactive	testing	\N	2025-10-06 09:53:40.764006+00
e12204b3-bb1f-479c-bb22-08e432134aac	a148d4e4-c8eb-46b6-8e4c-3848d689e7c1	\N	2	1	inactive	development	\N	2025-10-06 09:55:03.166372+00
1d1e83df-b3d1-4ef5-943d-83edce410d79	10db0789-7deb-4ee8-b5bb-aa8e1ccf99e3	\N	1	1	active	development	\N	2025-10-06 09:56:33.408192+00
262ecc91-5c4c-4015-a21f-5e57b4cd91c7	78dcebbb-963b-47d8-9608-73ddbf3f6b85	\N	1	3	active	testing	\N	2025-10-06 10:03:54.493863+00
78645052-700c-48a8-9970-bf3402524f7b	cc4dc946-4c5b-4b97-9ae0-88b56f724204	\N	2	1	inactive	development	\N	2025-10-06 12:26:39.367575+00
84d8d9f5-019f-400c-8514-9e84025e51e4	cc4dc946-4c5b-4b97-9ae0-88b56f724204	\N	1	1	development	active	\N	2025-10-06 12:27:20.099991+00
22385374-508c-4666-86dc-19b121e6c0b8	10db0789-7deb-4ee8-b5bb-aa8e1ccf99e3	\N	1	3	development	development	\N	2025-10-06 12:27:56.86352+00
91d89bea-9940-46df-9f07-66c87e3653ea	cc4dc946-4c5b-4b97-9ae0-88b56f724204	\N	1	1	active	development	\N	2025-10-06 12:28:07.197841+00
21f4680c-58b6-4976-9ea8-e9c9eb965723	cc4dc946-4c5b-4b97-9ae0-88b56f724204	\N	1	1	development	active	\N	2025-10-06 12:28:24.715678+00
acbe0417-661b-4319-8d0f-35a291b47e0e	a148d4e4-c8eb-46b6-8e4c-3848d689e7c1	\N	1	3	development	development	\N	2025-10-06 12:40:54.586716+00
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

\unrestrict rZYZ6HCyUepTaObWbbLml0S7yaZ1GuAADgNY9jBDO9frFJIbVpXFX0m96viQBDV

