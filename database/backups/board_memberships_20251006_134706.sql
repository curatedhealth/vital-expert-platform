--
-- PostgreSQL database dump
--

\restrict S0MfXu6Tc2wXIvVu7WCV41Rv9YHpXBvZXaC6iUo0PsccLLqTNFH2AnGh66E2vUX

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
-- Name: board_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_memberships (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    board_id uuid NOT NULL,
    agent_id integer NOT NULL,
    role character varying(50) NOT NULL,
    voting_weight numeric(3,2) DEFAULT 1.0,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.board_memberships OWNER TO postgres;

--
-- Name: TABLE board_memberships; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.board_memberships IS 'Membership records for virtual advisory boards';


--
-- Data for Name: board_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_memberships (id, board_id, agent_id, role, voting_weight, joined_at) FROM stdin;
\.


--
-- Name: board_memberships board_memberships_board_id_agent_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_memberships
    ADD CONSTRAINT board_memberships_board_id_agent_id_key UNIQUE (board_id, agent_id);


--
-- Name: board_memberships board_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_memberships
    ADD CONSTRAINT board_memberships_pkey PRIMARY KEY (id);


--
-- Name: board_memberships board_memberships_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_memberships
    ADD CONSTRAINT board_memberships_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.expert_agents(id) ON DELETE CASCADE;


--
-- Name: board_memberships board_memberships_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_memberships
    ADD CONSTRAINT board_memberships_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.virtual_boards(id) ON DELETE CASCADE;


--
-- Name: board_memberships Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.board_memberships USING ((auth.role() = 'authenticated'::text));


--
-- Name: board_memberships Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.board_memberships FOR SELECT USING (true);


--
-- Name: board_memberships; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.board_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE board_memberships; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.board_memberships TO anon;
GRANT ALL ON TABLE public.board_memberships TO authenticated;
GRANT ALL ON TABLE public.board_memberships TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict S0MfXu6Tc2wXIvVu7WCV41Rv9YHpXBvZXaC6iUo0PsccLLqTNFH2AnGh66E2vUX

