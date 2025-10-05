--
-- PostgreSQL database dump
--

\restrict uvNXEdLLZamFdmTmDYLPaDKodh8XAIZXplNijCj5iYNXCuawkS4sAbkmlXnPyYm

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
-- Name: virtual_boards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.virtual_boards (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    board_type character varying(100) NOT NULL,
    focus_areas jsonb DEFAULT '[]'::jsonb NOT NULL,
    lead_agent_id integer,
    consensus_method character varying(50),
    quorum_requirement integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_active boolean DEFAULT true
);


ALTER TABLE public.virtual_boards OWNER TO postgres;

--
-- Name: TABLE virtual_boards; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.virtual_boards IS 'Virtual advisory boards for capability governance';


--
-- Data for Name: virtual_boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.virtual_boards (id, name, board_type, focus_areas, lead_agent_id, consensus_method, quorum_requirement, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Name: virtual_boards virtual_boards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.virtual_boards
    ADD CONSTRAINT virtual_boards_pkey PRIMARY KEY (id);


--
-- Name: virtual_boards update_virtual_boards_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_virtual_boards_updated_at BEFORE UPDATE ON public.virtual_boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: virtual_boards virtual_boards_lead_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.virtual_boards
    ADD CONSTRAINT virtual_boards_lead_agent_id_fkey FOREIGN KEY (lead_agent_id) REFERENCES public.expert_agents(id);


--
-- Name: virtual_boards Authenticated write access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated write access" ON public.virtual_boards USING ((auth.role() = 'authenticated'::text));


--
-- Name: virtual_boards Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.virtual_boards FOR SELECT USING (true);


--
-- Name: virtual_boards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.virtual_boards ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE virtual_boards; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.virtual_boards TO anon;
GRANT ALL ON TABLE public.virtual_boards TO authenticated;
GRANT ALL ON TABLE public.virtual_boards TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict uvNXEdLLZamFdmTmDYLPaDKodh8XAIZXplNijCj5iYNXCuawkS4sAbkmlXnPyYm

