SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict PVKg6SVlvCiMDkT1Jc9JWDvhSSs90UqJC0LcruLm5Z3tUG23OH4YPtma6mGJX2g

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."agents" ("id", "name", "display_name", "description", "avatar", "color", "version", "model", "system_prompt", "temperature", "max_tokens", "rag_enabled", "context_window", "response_format", "capabilities", "knowledge_domains", "domain_expertise", "competency_levels", "knowledge_sources", "tool_configurations", "business_function", "role", "tier", "priority", "implementation_phase", "is_custom", "cost_per_query", "target_users", "validation_status", "validation_metadata", "performance_metrics", "accuracy_score", "evidence_required", "regulatory_context", "compliance_tags", "hipaa_compliant", "gdpr_compliant", "audit_trail_enabled", "data_classification", "medical_specialty", "pharma_enabled", "verify_enabled", "jurisdiction_coverage", "legal_domains", "bar_admissions", "legal_specialties", "market_segments", "customer_segments", "sales_methodology", "geographic_focus", "payer_types", "reimbursement_models", "coverage_determination_types", "hta_experience", "status", "availability_status", "error_rate", "average_response_time", "total_interactions", "last_interaction", "last_health_check", "parent_agent_id", "compatible_agents", "incompatible_agents", "prerequisite_agents", "workflow_positions", "escalation_rules", "confidence_thresholds", "input_validation_rules", "output_format_rules", "citation_requirements", "rate_limits", "test_scenarios", "validation_history", "performance_benchmarks", "reviewer_id", "last_validation_date", "validation_expiry_date", "created_at", "updated_at", "created_by", "updated_by", "metadata", "clinical_validation_status", "medical_accuracy_score", "citation_accuracy", "hallucination_rate", "fda_samd_class", "audit_trail", "average_latency_ms", "last_clinical_review", "medical_error_rate", "medical_reviewer_id", "is_public", "user_id", "is_user_copy", "original_agent_id", "copied_at") VALUES
	('3fa240c4-abe8-4589-9cc0-0d6da0628dbc', 'Dr. Sarah Chen', 'Dr. Sarah Chen', 'Clinical research specialist focused on oncology and personalized medicine', 'avatar_0012', NULL, '1.0.0', 'gpt-4', 'You are Dr. Sarah Chen, a clinical research specialist with deep expertise in oncology and personalized medicine. Help users with clinical trial design, patient stratification, and evidence-based treatment protocols.', 0.70, 2000, true, 8000, 'markdown', '{clinical-research,oncology}', NULL, 'general', '{}', '{}', '{}', NULL, NULL, 1, NULL, NULL, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 16:52:44.357937', '2025-09-27 17:05:04.621432', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 16:52:44.357937'),
	('29ae99ae-f9cc-4780-8f00-315afa9722e6', 'Dr. Marcus Johnson', 'Dr. Marcus Johnson', 'Regulatory affairs expert specializing in FDA submissions and compliance', 'avatar_0013', NULL, '1.0.0', 'gpt-4', 'You are Dr. Marcus Johnson, a regulatory affairs expert specializing in FDA submissions and compliance. Guide users through regulatory pathways, submission requirements, and compliance frameworks.', 0.70, 2000, true, 8000, 'markdown', '{regulatory-affairs,compliance}', NULL, 'general', '{}', '{}', '{}', NULL, NULL, 1, NULL, NULL, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 16:52:44.371069', '2025-09-27 17:05:04.624761', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 16:52:44.371069'),
	('3b11cb02-2ae9-4f69-ab5b-3e0f9af314be', 'Dr. Priya Patel', 'Dr. Priya Patel', 'Digital therapeutics researcher with expertise in mobile health applications', 'avatar_0014', NULL, '1.0.0', 'gpt-4', 'You are Dr. Priya Patel, a digital therapeutics researcher with expertise in mobile health applications. Help users design and implement digital health solutions.', 0.70, 2000, true, 8000, 'markdown', '{digital-therapeutics,mobile-health}', NULL, 'general', '{}', '{}', '{}', NULL, NULL, 1, NULL, NULL, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 16:52:44.376652', '2025-09-27 17:05:04.62747', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 16:52:44.376652'),
	('11fce3e7-9c2f-4cbb-a6c8-9d0de9c658a4', 'Alex Thompson', 'Alex Thompson', 'Data scientist specializing in real-world evidence and health outcomes research', 'avatar_0004', NULL, '1.0.0', 'gpt-4', 'You are Alex Thompson, a data scientist specializing in real-world evidence and health outcomes research. Help users analyze healthcare data and derive actionable insights.', 0.70, 2000, true, 8000, 'markdown', '{data-science,analytics}', NULL, 'general', '{}', '{}', '{}', NULL, NULL, 2, NULL, NULL, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 16:52:44.380493', '2025-09-27 17:05:04.63012', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 16:52:44.380493'),
	('a7798d1b-699b-4557-847e-d08c84ad88d3', 'Dr. Emma Williams', 'Dr. Emma Williams', 'Patient safety specialist focused on pharmacovigilance and adverse event reporting', 'avatar_0015', NULL, '1.0.0', 'gpt-4', 'You are Dr. Emma Williams, a patient safety specialist focused on pharmacovigilance and adverse event reporting. Help users with safety monitoring and risk assessment.', 0.70, 2000, true, 8000, 'markdown', '{pharmacovigilance,safety-monitoring}', NULL, 'general', '{}', '{}', '{}', NULL, NULL, 1, NULL, NULL, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 16:52:44.382903', '2025-09-27 17:05:04.63261', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 16:52:44.382903'),
	('a5d3f2fb-a809-447c-b4e1-756624f5dd19', 'medical-writer_user_copy_1759003135492', 'Medical Writer (My Copy)', 'Medical Writer - Expert in Regulatory Document Writing, Marketing Materials, Clinical Documentation', 'avatar_0019', '#6366f1', '1.0.0', 'gpt-4', 'You are Medical Writer, a specialized AI agent with expertise in: Regulatory Document Writing, Marketing Materials, Clinical Documentation, Scientific Publications, Training Materials, Patient Information.', 0.70, 2000, true, 8000, 'markdown', '{"Regulatory Document Writing","Marketing Materials","Clinical Documentation","Scientific Publications","Training Materials","Patient Information"}', '{general}', 'general', '{}', '{}', '{}', NULL, NULL, 1, 100, 1, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 19:58:55.516226', '2025-09-27 19:58:55.516226', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 19:58:55.516226'),
	('fccc4f94-fc31-4be0-bd7e-d4ecb924f01b', 'medical-writer_user_copy_1759003145325', 'Medical Writer (My Copy)', 'Medical Writer - Expert in Regulatory Document Writing, Marketing Materials, Clinical Documentation', 'avatar_0019', '#6366f1', '1.0.0', 'gpt-4', 'You are Medical Writer, a specialized AI agent with expertise in: Regulatory Document Writing, Marketing Materials, Clinical Documentation, Scientific Publications, Training Materials, Patient Information.', 0.70, 2000, true, 8000, 'markdown', '{"Regulatory Document Writing","Marketing Materials","Clinical Documentation","Scientific Publications","Training Materials","Patient Information"}', '{general}', 'general', '{}', '{}', '{}', NULL, NULL, 1, 100, 1, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 19:59:05.349483', '2025-09-27 19:59:05.349483', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 19:59:05.349483'),
	('23c0fbb0-5300-440d-9eea-4faa6570e406', 'Dr. Marcus Johnson_user_copy_1759008233508', 'Dr. Marcus Johnson (My Copy)', 'Regulatory affairs expert specializing in FDA submissions and compliance', 'avatar_0013', '#6366f1', '1.0.0', 'gpt-4', 'You are Dr. Marcus Johnson, a regulatory affairs expert specializing in FDA submissions and compliance. Guide users through regulatory pathways, submission requirements, and compliance frameworks.', 0.70, 2000, true, 8000, 'markdown', '{regulatory-affairs,compliance}', '{}', 'general', '{}', '{}', '{}', NULL, NULL, 1, 1, 1, true, NULL, NULL, 'pending', '{}', '{}', NULL, false, '{"is_regulated": false}', NULL, false, false, true, 'internal', NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'available', 0.0000, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{"low": 0.7, "high": 0.95, "medium": 0.85}', '{}', '{}', '{}', '{"per_hour": 1000, "per_minute": 60}', '[]', '[]', '{}', NULL, NULL, NULL, '2025-09-27 21:23:53.533257', '2025-09-27 21:23:53.533257', NULL, NULL, '{}', 'pending', 0.950, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, false, NULL, '2025-09-27 21:23:53.533257');


--
-- Data for Name: agent_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: agent_capabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: agent_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."agent_categories" ("id", "name", "display_name", "description", "color", "icon", "sort_order", "created_at") VALUES
	('d57f939c-767f-4b80-9482-7ca853868701', 'regulatory', 'Regulatory Affairs', 'FDA, EMA, and global regulatory guidance', 'text-trust-blue', '🏛️', 1, '2025-09-27 16:49:10.992163+00'),
	('dee07e08-3741-479f-9688-fb358c126d02', 'clinical', 'Clinical Development', 'Clinical trials, evidence generation, and biomarkers', 'text-clinical-green', '🔬', 2, '2025-09-27 16:49:10.992163+00'),
	('29003f00-a71e-4026-ad2d-12071ba32e27', 'market-access', 'Market Access', 'Reimbursement, HTA, and payer strategies', 'text-market-purple', '💰', 3, '2025-09-27 16:49:10.992163+00'),
	('ffcaa121-bba0-4e44-8767-ce1694895640', 'medical-writing', 'Medical Writing', 'Regulatory and clinical documentation', 'text-regulatory-gold', '📝', 4, '2025-09-27 16:49:10.992163+00'),
	('8390a47f-3bd4-4d7f-ba4d-cbc4b2a4afd9', 'commercial', 'Commercial Intelligence', 'Competitive analysis and business development', 'text-innovation-orange', '💼', 5, '2025-09-27 16:49:10.992163+00'),
	('a477f051-4826-418e-a9ff-af86932a316b', 'quality-compliance', 'Quality & Compliance', 'GxP compliance, audits, and quality systems', 'text-medical-gray', '🛡️', 6, '2025-09-27 16:49:10.992163+00'),
	('b03611a9-99ec-45e1-9b13-0c1cf0436627', 'safety', 'Safety & Pharmacovigilance', 'Adverse events and safety monitoring', 'text-clinical-red', '⚠️', 7, '2025-09-27 16:49:10.992163+00'),
	('3a16f279-88ea-4920-b787-c3c720b49c76', 'analytics', 'Data & Analytics', 'Statistical analysis and data orchestration', 'text-progress-teal', '📊', 8, '2025-09-27 16:49:10.992163+00'),
	('b583655b-7a2d-49f0-a111-8eb3e6d3f514', 'specialized', 'Specialized Domains', 'DTx, AI/ML devices, and emerging technologies', 'text-market-purple', '🎯', 9, '2025-09-27 16:49:10.992163+00');


--
-- Data for Name: agent_category_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: agent_collaborations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: agent_performance_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: prompts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: agent_prompts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: expert_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: virtual_boards; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: board_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: business_functions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."business_functions" ("id", "name", "department", "healthcare_category", "description", "regulatory_requirements", "created_at") VALUES
	('6380d225-8d62-4aff-891b-2b1bcf0b57e2', 'regulatory_affairs', 'Regulatory Affairs', 'Compliance', 'FDA, EMA, and global regulatory guidance and submissions', '{"FDA 21 CFR","EU MDR","ICH Guidelines"}', '2025-09-27 16:49:11.038804+00'),
	('7ff145f7-5ccb-43ed-b8d7-c101e79c59cc', 'clinical_development', 'Clinical Affairs', 'Research', 'Clinical trial design, execution, and management', '{GCP,"ICH E6","FDA IND"}', '2025-09-27 16:49:11.038804+00'),
	('b476af59-372b-4392-b2ba-570a7162f179', 'market_access', 'Commercial', 'Business', 'Reimbursement strategy and payer engagement', '{"HEOR Guidelines","HTA Requirements"}', '2025-09-27 16:49:11.038804+00'),
	('8e03f774-dc20-4f1a-9938-a756318d375b', 'medical_writing', 'Medical Affairs', 'Documentation', 'Clinical and regulatory document preparation', '{"ICH E3",CONSORT,"Medical Writing Standards"}', '2025-09-27 16:49:11.038804+00'),
	('818b2b41-a20e-4a45-8c9c-3204433fb4c2', 'safety_pharmacovigilance', 'Safety', 'Patient Safety', 'Adverse event monitoring and safety reporting', '{"ICH E2A","FDA FAERS","EU EUDRA"}', '2025-09-27 16:49:11.038804+00'),
	('3ad3e5fb-9ed5-4dda-969e-f88d5cea7d62', 'quality_assurance', 'Quality', 'Compliance', 'GMP, quality systems, and compliance monitoring', '{"FDA GMP","EU GMP","ISO 13485"}', '2025-09-27 16:49:11.038804+00');


--
-- Data for Name: capability_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: capability_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tools; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tools" ("id", "name", "tool_type", "api_endpoint", "configuration", "medical_database", "data_classification", "hipaa_compliant", "required_permissions", "rate_limits", "validation_endpoint", "is_active", "last_validation_check", "created_at", "updated_at") VALUES
	('664d12d1-e64f-4b7c-9c2a-a1f2ad4af64f', 'pubmed_search', 'clinical_search', NULL, '{"rate_limit": 3, "api_key_required": false}', 'PubMed', 'Public', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00'),
	('77d3c19e-f686-4484-80ef-1f3bbc98f1a8', 'fda_database', 'regulatory_database', NULL, '{"rate_limit": 10, "api_key_required": true}', 'FDA', 'Public', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00'),
	('4d81f9ff-c2b0-4bbd-818c-a6b05b03e6a0', 'clinicaltrials_gov', 'clinical_search', NULL, '{"rate_limit": 5, "api_key_required": false}', 'ClinicalTrials.gov', 'Public', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00'),
	('0b299483-4d11-41b7-b1cf-933dc5c37189', 'medical_calculator', 'medical_calculator', NULL, '{"calculations": ["BMI", "eGFR", "QRISK"]}', 'Internal', 'Confidential', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00'),
	('3b5f508c-a930-4154-89cc-3bd8c9b9f575', 'drug_interaction_checker', 'safety_tool', NULL, '{"rate_limit": 100, "api_key_required": true}', 'DrugBank', 'Public', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00'),
	('a03336fe-ba6c-41dc-b616-811ea7b8655e', 'icd_lookup', 'coding_tool', NULL, '{"version": "2024", "languages": ["en"]}', 'WHO ICD-10', 'Public', true, '{}', '{}', NULL, true, NULL, '2025-09-27 16:49:11.038804+00', '2025-09-27 16:49:11.038804+00');


--
-- Data for Name: capability_tools; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: capability_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: clinical_validations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: competencies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: knowledge_base; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: llm_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: encrypted_api_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: icons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."icons" ("id", "name", "display_name", "category", "subcategory", "description", "file_path", "file_url", "svg_content", "tags", "is_active", "created_at", "updated_at") VALUES
	('cc5e9ce6-ffd3-4420-a8db-22203d4d2f29', 'medical_stethoscope', 'Stethoscope', 'medical', NULL, 'Medical stethoscope icon', '/icons/png/medical specialty/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', '/icons/png/medical specialty/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', NULL, '{medical,stethoscope,doctor}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('c0ad4cf5-a3a9-43ac-afba-3ef6ed1e4af0', 'medical_xray', 'X-Ray', 'medical', NULL, 'Medical X-ray scan', '/icons/png/medical specialty/healthcare, medical, hospital, xray, scan, body, bones.svg', '/icons/png/medical specialty/healthcare, medical, hospital, xray, scan, body, bones.svg', NULL, '{medical,xray,scan}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('af5a30ed-1213-4580-9b27-fea65c60dc83', 'medical_food', 'Medical Nutrition', 'medical', NULL, 'Healthcare nutrition', '/icons/png/medical specialty/food, healthcare, medical, hospital, water, glass, rice porridge.svg', '/icons/png/medical specialty/food, healthcare, medical, hospital, water, glass, rice porridge.svg', NULL, '{medical,nutrition,food}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('ad69cc11-b458-4303-bcbe-13dfc8f52cb8', 'avatar_0002', 'Young Male Avatar', 'avatar', NULL, 'Young male with freckles', '/icons/png/avatars/02_boy, people, avatar, man, male, freckles, ginger.png', '/icons/png/avatars/02_boy, people, avatar, man, male, freckles, ginger.png', NULL, '{avatar,male,young}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('aca19dbe-a2f1-4981-87c9-bbc7552d5c67', 'avatar_0003', 'Student Avatar', 'avatar', NULL, 'Male student with hat', '/icons/png/avatars/03_boy, people, avatar, man, male, hat, student.png', '/icons/png/avatars/03_boy, people, avatar, man, male, hat, student.png', NULL, '{avatar,male,student}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('71529cfa-040c-4fb1-bc17-80a01e5fff23', 'avatar_0004', 'Teen Male Avatar', 'avatar', NULL, 'Teenager with ear piercing', '/icons/png/avatars/04_boy, people, avatar, man, male, teenager, ear piercing.png', '/icons/png/avatars/04_boy, people, avatar, man, male, teenager, ear piercing.png', NULL, '{avatar,male,teenager}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('d60cb77a-b333-4f8a-ba11-5b97460bfa27', 'avatar_0005', 'Handsome Male Avatar', 'avatar', NULL, 'Handsome teenage male', '/icons/png/avatars/05_boy, people, avatar, man, male, teenager, handsome, user.png', '/icons/png/avatars/05_boy, people, avatar, man, male, teenager, handsome, user.png', NULL, '{avatar,male,handsome}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('43a1b2f0-d699-4fbc-9714-842de2d47bae', 'avatar_0006', 'Male Teen Avatar', 'avatar', NULL, 'Handsome male teenager', '/icons/png/avatars/06_boy, people, avatar, man, male, teenager, handsome.png', '/icons/png/avatars/06_boy, people, avatar, man, male, teenager, handsome.png', NULL, '{avatar,male,teenager}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('7fcc80a1-172f-43a9-b31e-ac6a8d96d43d', 'avatar_0007', 'Hooded Male Avatar', 'avatar', NULL, 'Male teenager with hood', '/icons/png/avatars/07_boy, people, avatar, man, male, teenager, hood.png', '/icons/png/avatars/07_boy, people, avatar, man, male, teenager, hood.png', NULL, '{avatar,male,casual}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('4ec99896-939a-4e5e-9d43-b656867c4c4f', 'avatar_0008', 'Portrait Male Avatar', 'avatar', NULL, 'Male teenager portrait', '/icons/png/avatars/08_boy, people, avatar, man, male, teenager, portriat.png', '/icons/png/avatars/08_boy, people, avatar, man, male, teenager, portriat.png', NULL, '{avatar,male,portrait}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('9e9b15ee-e019-473a-af64-99b6fdc653be', 'avatar_0009', 'Young User Avatar', 'avatar', NULL, 'Young male user', '/icons/png/avatars/09_boy, people, avatar, man, male, young, user.png', '/icons/png/avatars/09_boy, people, avatar, man, male, young, user.png', NULL, '{avatar,male,young}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('9b27af57-3e5e-447d-b7fe-306134f0c018', 'avatar_0010', 'Afro Male Avatar', 'avatar', NULL, 'Male with afro hairstyle', '/icons/png/avatars/10_boy, people. avatar, man, afro, teenager, user.png', '/icons/png/avatars/10_boy, people. avatar, man, afro, teenager, user.png', NULL, '{avatar,male,afro}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('a5120210-2574-418f-be4c-b7106be488e2', 'avatar_0011', 'Teen User Avatar', 'avatar', NULL, 'Male teenager user', '/icons/png/avatars/11_boy, people. avatar, man, male, teenager, user.png', '/icons/png/avatars/11_boy, people. avatar, man, male, teenager, user.png', NULL, '{avatar,male,teenager}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('c1d286cf-7d41-4f42-a001-3dbdcee8bb51', 'avatar_0012', 'Female Doctor Avatar', 'avatar', NULL, 'Female doctor/nurse', '/icons/png/avatars/12_business, female, nurse, people, woman, doctor, avatar.png', '/icons/png/avatars/12_business, female, nurse, people, woman, doctor, avatar.png', NULL, '{avatar,female,medical,doctor}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('24edc68a-f606-4f94-99c0-9ce0c15a73c2', 'avatar_0013', 'Businessman Avatar', 'avatar', NULL, 'Professional businessman', '/icons/png/avatars/13_businessman, people, avatar, man, male, employee, tie.png', '/icons/png/avatars/13_businessman, people, avatar, man, male, employee, tie.png', NULL, '{avatar,male,business,professional}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('9d9652da-a1b5-4d4c-9e0f-06abf89884b4', 'avatar_0014', 'African Female Avatar', 'avatar', NULL, 'African female with dreadlocks', '/icons/png/avatars/14_female, african, dreadlocks, girl, young, woman, avatar.png', '/icons/png/avatars/14_female, african, dreadlocks, girl, young, woman, avatar.png', NULL, '{avatar,female,african}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('9c1325ef-d1e5-4911-b0ca-075188048d93', 'avatar_0015', 'Blonde Girl Avatar', 'avatar', NULL, 'Blonde girl with curls', '/icons/png/avatars/15_girl, blonde, curl, people, woman, teenager, avatar.png', '/icons/png/avatars/15_girl, blonde, curl, people, woman, teenager, avatar.png', NULL, '{avatar,female,blonde}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('3837cf03-4409-46f9-a230-84596ac74e25', 'avatar_0016', 'Ponytail Girl Avatar', 'avatar', NULL, 'Blonde girl with ponytail', '/icons/png/avatars/16_girl, blonde, pony tail people, woman, teenager, avatar.png', '/icons/png/avatars/16_girl, blonde, pony tail people, woman, teenager, avatar.png', NULL, '{avatar,female,blonde,ponytail}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('e13fa03b-b138-40dd-abdf-1ab052fd54fc', 'avatar_0017', 'Bob Hair Girl Avatar', 'avatar', NULL, 'Girl with bob hairstyle', '/icons/png/avatars/17_girl, bobtay, people, woman, teenager, avatar, user.png', '/icons/png/avatars/17_girl, bobtay, people, woman, teenager, avatar, user.png', NULL, '{avatar,female,bob}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('541ea6b0-2ef8-4d13-9af6-4eeae80daadc', 'avatar_0018', 'Chubby Girl Avatar', 'avatar', NULL, 'Beautiful woman', '/icons/png/avatars/18_girl, chubby, beautiful, people, woman, lady, avatar.png', '/icons/png/avatars/18_girl, chubby, beautiful, people, woman, lady, avatar.png', NULL, '{avatar,female,beautiful}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('2188b47f-81c9-4c71-97b5-4502a8d3ea69', 'avatar_0019', 'Young Female Avatar', 'avatar', NULL, 'Young female teenager', '/icons/png/avatars/19_girl, female, young, people, woman, teenager, avatar.png', '/icons/png/avatars/19_girl, female, young, people, woman, teenager, avatar.png', NULL, '{avatar,female,young}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('90b7c65b-e534-4546-9e09-07ee9cb0f078', 'avatar_0020', 'Ginger Curly Avatar', 'avatar', NULL, 'Ginger girl with curly hair', '/icons/png/avatars/20_girl, ginger, curly , people, woman, teenager, avatar.png', '/icons/png/avatars/20_girl, ginger, curly , people, woman, teenager, avatar.png', NULL, '{avatar,female,ginger,curly}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('d972ac63-f8de-4b7d-ac57-b0d8006b2b61', 'medical_appointment', 'Medical Appointment', 'medical', NULL, 'Medical appointment scheduling', '/icons/png/medical specialty/times, appointment, hands, check list, to do list, tablet, pointing.svg', '/icons/png/medical specialty/times, appointment, hands, check list, to do list, tablet, pointing.svg', NULL, '{medical,appointment,schedule}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('c11e9a18-adcc-402d-a6ea-1c139a116a36', 'medical_consultation', 'Medical Consultation', 'medical', NULL, 'Healthcare consultation', '/icons/png/medical specialty/healthcare, medical, hospital, people, advice, informative, talking.svg', '/icons/png/medical specialty/healthcare, medical, hospital, people, advice, informative, talking.svg', NULL, '{medical,consultation,advice}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('e4078bf0-77f2-4ea7-b13e-d470427b6f3c', 'medical_patient', 'Patient Avatar', 'medical', NULL, 'Sick patient avatar', '/icons/png/medical specialty/avatar, people, patient, boy, fever, sick, illness.svg', '/icons/png/medical specialty/avatar, people, patient, boy, fever, sick, illness.svg', NULL, '{medical,patient,sick}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('acb9c379-fb67-4a54-95e3-980c29a6bca5', 'medical_iv', 'IV Treatment', 'medical', NULL, 'IV tubing and saline', '/icons/png/medical specialty/IV tubing, saline, healthcare, medical, hospital, treatment, medicine.svg', '/icons/png/medical specialty/IV tubing, saline, healthcare, medical, hospital, treatment, medicine.svg', NULL, '{medical,iv,treatment}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('1b8f1d7e-54e3-4629-8669-79e4c0773b77', 'medical_emergency', 'Emergency Care', 'medical', NULL, 'Emergency medical care', '/icons/png/medical specialty/emergency, gait, leg, crutches, disability, medical, hospital.svg', '/icons/png/medical specialty/emergency, gait, leg, crutches, disability, medical, hospital.svg', NULL, '{medical,emergency,care}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('064c2e7f-f934-411d-9fbb-d3f803cf46b4', 'medical_vaccine', 'Vaccine Protection', 'medical', NULL, 'Vaccine and protection', '/icons/png/medical specialty/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', '/icons/png/medical specialty/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', NULL, '{medical,vaccine,protection}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('370b3705-a96d-49ce-91a8-180900cce839', 'medical_ambulance', 'Emergency Ambulance', 'medical', NULL, 'Emergency ambulance', '/icons/png/medical specialty/emergency, medical, hospital, ambulance, truck, car, urgent.svg', '/icons/png/medical specialty/emergency, medical, hospital, ambulance, truck, car, urgent.svg', NULL, '{medical,ambulance,emergency}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00'),
	('205a05ad-128a-4789-b943-e558e0cda498', 'avatar_0001', 'Arab Male Avatar', 'avatar', NULL, 'Professional male avatar with beard', '/icons/png/avatars/01_Arab, male,  people, beard, Islam, avatar, man.png', '/icons/png/avatars/01_Arab, male,  people, beard, Islam, avatar, man.png', NULL, '{avatar,male,professional}', true, '2025-09-27 16:49:11.140115+00', '2025-09-27 16:49:11.140115+00');


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jobs" ("id", "job_type", "job_name", "description", "status", "progress", "source_id", "agent_id", "user_id", "workflow_id", "job_config", "input_data", "output_data", "error_message", "error_details", "retry_count", "max_retries", "started_at", "completed_at", "estimated_duration_minutes", "actual_duration_minutes", "priority", "scheduled_at", "cpu_usage_percent", "memory_usage_mb", "processing_cost", "tags", "metadata", "created_at", "updated_at", "created_by", "updated_by") VALUES
	('eff94b46-8c48-4cdd-a3df-d9ed396cafcf', 'document_processing', 'Process Clinical Guidelines Document', 'Process uploaded clinical guidelines PDF and generate embeddings', 'completed', 100, NULL, NULL, NULL, NULL, '{"overlap": 200, "chunk_size": 1000, "embedding_model": "clinical"}', NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, 200, '2025-09-27 16:49:11.10173+00', NULL, NULL, NULL, '{document-processing,clinical,embeddings}', NULL, '2025-09-27 16:49:11.10173+00', '2025-09-27 16:49:11.10173+00', NULL, NULL),
	('2eb8d345-cc93-4d3b-bde8-ecc535a322b4', 'workflow_execution', 'Compliance Workflow Execution', 'Execute HIPAA compliance check workflow for new agent', 'processing', 65, NULL, NULL, NULL, NULL, '{"workflow_steps": ["validate_phi_handling", "check_encryption", "audit_trail"]}', NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, 500, '2025-09-27 16:49:11.10173+00', NULL, NULL, NULL, '{compliance,hipaa,workflow}', NULL, '2025-09-27 16:49:11.10173+00', '2025-09-27 16:49:11.10173+00', NULL, NULL),
	('ef19d47b-dd7b-4ff7-a8d2-bba97a2b22dc', 'agent_training', 'Agent Training Pipeline', 'Train specialized pharmaceutical agent with new regulatory data', 'pending', 0, NULL, NULL, NULL, NULL, '{"model_config": {"temperature": 0.3}, "training_data_sources": ["fda_guidelines", "pharma_protocols"]}', NULL, NULL, NULL, NULL, 0, 3, NULL, NULL, NULL, NULL, 300, '2025-09-27 16:49:11.10173+00', NULL, NULL, NULL, '{training,pharmaceutical,fda}', NULL, '2025-09-27 16:49:11.10173+00', '2025-09-27 16:49:11.10173+00', NULL, NULL);


--
-- Data for Name: job_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: job_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jtbd_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jtbd_categories" ("id", "name", "description", "color", "sort_order", "created_at", "updated_at") VALUES
	('7f9037c2-7d2d-4598-9950-835a73b21c66', 'Healthcare Operations', 'Jobs related to healthcare delivery and operations', '#10B981', 1, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('d638d8c6-c3e0-41b5-a133-7f1954e4a0aa', 'Clinical Decision Making', 'Jobs related to clinical decisions and patient care', '#3B82F6', 2, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('114ac3a5-61bc-4593-8493-572ba5054ba6', 'Regulatory Compliance', 'Jobs related to compliance and regulatory requirements', '#EF4444', 3, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('05560047-0cf5-42b8-9d1b-5caa938e0241', 'Business Intelligence', 'Jobs related to data analysis and business insights', '#8B5CF6', 4, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('dcd33ac1-d334-4021-a7e5-8b85919ffe5e', 'Patient Experience', 'Jobs related to patient interactions and experience', '#F59E0B', 5, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00');


--
-- Data for Name: jtbd_core; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jtbd_core" ("id", "name", "job_statement", "description", "category_id", "when_situation", "desired_outcome", "pain_points", "current_solutions", "success_criteria", "target_personas", "priority", "status", "tags", "metadata", "created_at", "updated_at") VALUES
	('968d28c1-01c3-4a67-8f4a-df978a31741f', 'Get Fast Clinical Decision Support', 'When I need to make a complex clinical decision, I want to get evidence-based recommendations quickly so that I can provide optimal patient care.', 'Healthcare providers need rapid access to clinical guidelines and evidence-based decision support during patient encounters.', 'd638d8c6-c3e0-41b5-a133-7f1954e4a0aa', 'Seeing a patient with complex symptoms or multiple conditions', 'Make confident, evidence-based clinical decisions within minutes', '["Overwhelmed by information", "Time pressure", "Risk of missing important details", "Difficulty finding relevant guidelines"]', '["Manual literature search", "Consulting colleagues", "Using clinical decision tools", "Relying on experience"]', '["Decision made within 5 minutes", "Evidence clearly cited", "Confidence in recommendation", "Improved patient outcomes"]', '{physicians,nurses,clinical_specialists}', 'high', 'active', '{clinical-support,decision-making,evidence-based}', NULL, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('165b22d2-4d6f-4141-8e39-0b56bd092866', 'Ensure Regulatory Compliance', 'When implementing new healthcare processes, I want to verify compliance with all relevant regulations so that I can avoid penalties and maintain accreditation.', 'Healthcare organizations need to ensure all processes meet regulatory requirements across multiple frameworks.', '114ac3a5-61bc-4593-8493-572ba5054ba6', 'Implementing new clinical or operational processes', 'Achieve 100% compliance with all applicable regulations', '["Complex regulatory landscape", "Frequent changes in requirements", "Multiple overlapping frameworks", "High cost of non-compliance"]', '["Manual compliance checklists", "Consulting legal teams", "External compliance consultants", "Risk management systems"]', '["Zero compliance violations", "Passed audits", "Reduced legal risk", "Streamlined approval processes"]', '{compliance_officers,administrators,legal_teams}', 'critical', 'active', '{compliance,regulations,risk-management}', NULL, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00'),
	('dd74fba3-fe22-4652-a8f5-7714ba879d21', 'Optimize Operational Efficiency', 'When managing healthcare operations, I want to identify bottlenecks and improvement opportunities so that I can deliver better patient care while reducing costs.', 'Healthcare administrators need to continuously optimize operations to balance quality care with cost effectiveness.', '7f9037c2-7d2d-4598-9950-835a73b21c66', 'Reviewing operational performance metrics and patient flow', 'Improve efficiency by 20% while maintaining quality standards', '["Complex interdependencies", "Limited visibility into processes", "Resistance to change", "Competing priorities"]', '["Manual process analysis", "External consultants", "Staff feedback sessions", "Basic analytics tools"]', '["Reduced wait times", "Lower operational costs", "Improved staff satisfaction", "Better patient outcomes"]', '{administrators,operations_managers,department_heads}', 'high', 'active', '{operations,efficiency,cost-reduction}', NULL, '2025-09-27 16:49:11.057563+00', '2025-09-27 16:49:11.057563+00');


--
-- Data for Name: llm_provider_health_checks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: llm_provider_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: llm_usage_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: medical_validations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: phi_access_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role", "scope", "action", "created_at") VALUES
	('92f8f261-a89a-45cb-92db-0d17fe6ca6a2', 'super_admin', 'llm_providers', 'create', '2025-09-27 16:49:11.089989+00'),
	('3b014660-87f3-4c0b-902f-f107c4406304', 'super_admin', 'llm_providers', 'read', '2025-09-27 16:49:11.089989+00'),
	('721c2622-d8a4-43da-89c4-4302e94d60ed', 'super_admin', 'llm_providers', 'update', '2025-09-27 16:49:11.089989+00'),
	('09cd8318-f5f3-4544-9525-c858d342b03f', 'super_admin', 'llm_providers', 'delete', '2025-09-27 16:49:11.089989+00'),
	('1ef287db-a3d1-4ec3-83cf-53251e877c6b', 'super_admin', 'llm_providers', 'manage', '2025-09-27 16:49:11.089989+00'),
	('d5b5f65b-9f53-4a5c-b478-cee7b4dc788c', 'super_admin', 'agents', 'create', '2025-09-27 16:49:11.089989+00'),
	('99c2afcf-3a70-4af5-ad6b-11f4ec5c956d', 'super_admin', 'agents', 'read', '2025-09-27 16:49:11.089989+00'),
	('fae5a18d-d954-4a3c-94d7-9d678e79b050', 'super_admin', 'agents', 'update', '2025-09-27 16:49:11.089989+00'),
	('876338d5-4775-4f87-aea9-19e75cdb6296', 'super_admin', 'agents', 'delete', '2025-09-27 16:49:11.089989+00'),
	('52feb823-337a-454d-ade9-119d8c69b85a', 'super_admin', 'agents', 'manage', '2025-09-27 16:49:11.089989+00'),
	('5c160f6d-1588-4722-a8fa-c919f2df5936', 'super_admin', 'workflows', 'create', '2025-09-27 16:49:11.089989+00'),
	('f6b1f11e-afdc-4e2c-8d75-b0bd6e6ea2d3', 'super_admin', 'workflows', 'read', '2025-09-27 16:49:11.089989+00'),
	('2d271ec5-3627-49f6-9eee-999bd0ed9e0b', 'super_admin', 'workflows', 'update', '2025-09-27 16:49:11.089989+00'),
	('5760809f-4132-4d93-b45a-1aa3abd26ba2', 'super_admin', 'workflows', 'delete', '2025-09-27 16:49:11.089989+00'),
	('cee4cad4-9ac6-4d14-8157-1e90f006b1a5', 'super_admin', 'workflows', 'execute', '2025-09-27 16:49:11.089989+00'),
	('23af37e4-f7fa-4694-bc66-c59a9b16f83b', 'super_admin', 'analytics', 'read', '2025-09-27 16:49:11.089989+00'),
	('dbcb73e3-cad3-46b1-b29b-6988b69bcabf', 'super_admin', 'analytics', 'manage', '2025-09-27 16:49:11.089989+00'),
	('ce1e6419-4cba-49c4-947d-ecf0091642d3', 'super_admin', 'system_settings', 'read', '2025-09-27 16:49:11.089989+00'),
	('1a193804-8b79-4267-92d3-c19e1f8efcd3', 'super_admin', 'system_settings', 'update', '2025-09-27 16:49:11.089989+00'),
	('38a3f535-e753-4526-a1c0-da6b7402dbc5', 'super_admin', 'system_settings', 'manage', '2025-09-27 16:49:11.089989+00'),
	('d2479c64-6b88-4bc9-bdfa-57895536eaab', 'super_admin', 'user_management', 'create', '2025-09-27 16:49:11.089989+00'),
	('bee858e7-3f96-4882-b927-74b48e18f4b7', 'super_admin', 'user_management', 'read', '2025-09-27 16:49:11.089989+00'),
	('5c9f2123-b547-42d4-8bbf-b4f21ad09676', 'super_admin', 'user_management', 'update', '2025-09-27 16:49:11.089989+00'),
	('b7142c27-7ec2-4966-b8df-b0c658983f06', 'super_admin', 'user_management', 'delete', '2025-09-27 16:49:11.089989+00'),
	('5ba96481-932b-4db5-a91f-a877447b40de', 'super_admin', 'user_management', 'manage', '2025-09-27 16:49:11.089989+00'),
	('04063078-2334-48bc-8ebc-23688eddfd19', 'super_admin', 'audit_logs', 'read', '2025-09-27 16:49:11.089989+00'),
	('b2ae3c99-0594-48e1-936d-fa04f937c0c3', 'admin', 'llm_providers', 'create', '2025-09-27 16:49:11.089989+00'),
	('5bbdefe8-2755-4466-87e0-63d3cd5c5d67', 'admin', 'llm_providers', 'read', '2025-09-27 16:49:11.089989+00'),
	('d57d4253-53d8-49d8-aa0f-2bcbe2a8590f', 'admin', 'llm_providers', 'update', '2025-09-27 16:49:11.089989+00'),
	('66ad181d-e337-43bd-8db1-1b5e59f62b32', 'admin', 'llm_providers', 'delete', '2025-09-27 16:49:11.089989+00'),
	('5d1f850d-c208-4929-8536-3e7b5742c5e3', 'admin', 'llm_providers', 'manage', '2025-09-27 16:49:11.089989+00'),
	('ec2db1ae-a0d1-4abe-96ca-3bd050dabd0f', 'admin', 'agents', 'create', '2025-09-27 16:49:11.089989+00'),
	('8ec613fb-3811-468a-a54a-231dcca8fc6b', 'admin', 'agents', 'read', '2025-09-27 16:49:11.089989+00'),
	('2daa6a78-d371-487c-84e7-ac92c47d2bc4', 'admin', 'agents', 'update', '2025-09-27 16:49:11.089989+00'),
	('c9f4a25f-55a6-4894-b4ea-ea9805e7c781', 'admin', 'agents', 'delete', '2025-09-27 16:49:11.089989+00'),
	('cc38bc63-2576-4fa6-a7e6-90da08091638', 'admin', 'agents', 'manage', '2025-09-27 16:49:11.089989+00'),
	('d246f0c0-cab9-4038-80d1-f3e4d453dc23', 'admin', 'workflows', 'create', '2025-09-27 16:49:11.089989+00'),
	('2b7acb90-2b17-400a-80ca-5cba846566c9', 'admin', 'workflows', 'read', '2025-09-27 16:49:11.089989+00'),
	('d4213baa-5dbd-490f-b5bb-1242879b30f8', 'admin', 'workflows', 'update', '2025-09-27 16:49:11.089989+00'),
	('e84143d1-bf73-481a-ad19-3f91bfed4ec2', 'admin', 'workflows', 'delete', '2025-09-27 16:49:11.089989+00'),
	('5b517182-34bc-462c-8358-29df1c4824f1', 'admin', 'workflows', 'execute', '2025-09-27 16:49:11.089989+00'),
	('11fde910-d010-487f-bf8d-39e6e360021e', 'admin', 'analytics', 'read', '2025-09-27 16:49:11.089989+00'),
	('10c70a12-0953-48f4-86a2-d8eff59193d9', 'admin', 'system_settings', 'read', '2025-09-27 16:49:11.089989+00'),
	('7f0e2c71-ed61-4197-bdfb-4e277a962eec', 'admin', 'system_settings', 'update', '2025-09-27 16:49:11.089989+00'),
	('bff60d11-eaef-4219-9c8c-1503f0ec4633', 'admin', 'audit_logs', 'read', '2025-09-27 16:49:11.089989+00'),
	('c40ab54e-5986-4e6e-a357-65c7d83acafe', 'llm_manager', 'llm_providers', 'create', '2025-09-27 16:49:11.089989+00'),
	('3259c9a8-bfaa-4313-85bc-76b948b7463b', 'llm_manager', 'llm_providers', 'read', '2025-09-27 16:49:11.089989+00'),
	('68a8f3fc-d3fe-4d5a-abb9-60bd24efc73a', 'llm_manager', 'llm_providers', 'update', '2025-09-27 16:49:11.089989+00'),
	('358943d8-b9d1-4ef6-a63e-ef774a21fd06', 'llm_manager', 'llm_providers', 'delete', '2025-09-27 16:49:11.089989+00'),
	('fe533785-2587-40ad-bef8-07448cfce426', 'llm_manager', 'agents', 'read', '2025-09-27 16:49:11.089989+00'),
	('195e735d-6d9a-4e9a-b1e4-0b7142ef8736', 'llm_manager', 'workflows', 'read', '2025-09-27 16:49:11.089989+00'),
	('815fb896-8100-4f78-98d5-9853111acb6c', 'llm_manager', 'workflows', 'execute', '2025-09-27 16:49:11.089989+00'),
	('5ed3ea4a-be3b-48a7-8cba-afeeff32158a', 'llm_manager', 'analytics', 'read', '2025-09-27 16:49:11.089989+00'),
	('897afdfa-a88d-4959-af66-f77ed374822d', 'user', 'llm_providers', 'read', '2025-09-27 16:49:11.089989+00'),
	('d440d600-1425-49e3-aae7-62adc3433aed', 'user', 'agents', 'read', '2025-09-27 16:49:11.089989+00'),
	('c0e34345-5e67-4d64-8130-05a8f1e53d87', 'user', 'agents', 'create', '2025-09-27 16:49:11.089989+00'),
	('e9fea2dc-e2d3-4418-bc87-90b8d44ba58b', 'user', 'agents', 'update', '2025-09-27 16:49:11.089989+00'),
	('4def8e6a-6840-4508-8acc-b905aedba504', 'user', 'workflows', 'read', '2025-09-27 16:49:11.089989+00'),
	('c1e212da-c2a1-4641-b8bb-8ad862a4e02b', 'user', 'workflows', 'execute', '2025-09-27 16:49:11.089989+00'),
	('8f4442ef-fce3-43f5-8090-f54d0c39b397', 'user', 'analytics', 'read', '2025-09-27 16:49:11.089989+00'),
	('633a750a-4587-449f-9b27-3fbf9efd662d', 'viewer', 'llm_providers', 'read', '2025-09-27 16:49:11.089989+00'),
	('04fd1366-12d2-4c70-8bdb-b63b62562edc', 'viewer', 'agents', 'read', '2025-09-27 16:49:11.089989+00'),
	('123e32cf-1bad-4eba-8171-9edb395b24ab', 'viewer', 'workflows', 'read', '2025-09-27 16:49:11.089989+00'),
	('51bb8240-2f89-4b2e-881a-bbfd8b4fa2c7', 'viewer', 'analytics', 'read', '2025-09-27 16:49:11.089989+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "name", "clinical_title", "seniority_level", "department", "requires_medical_license", "default_capabilities", "compliance_requirements", "created_at") VALUES
	('03aa7141-9533-424c-9e27-d4f26c78d5c9', 'regulatory_manager', 'Regulatory Affairs Manager', 'Senior', 'Regulatory Affairs', false, '[]', '{"FDA Training","GxP Certification"}', '2025-09-27 16:49:11.038804+00'),
	('07a5c9d3-b069-4c27-bca8-ffd791827ad2', 'clinical_researcher', 'Clinical Research Associate', 'Mid', 'Clinical Affairs', false, '[]', '{"GCP Training","HIPAA Training"}', '2025-09-27 16:49:11.038804+00'),
	('1ea3534e-ff14-4ffe-94c7-a093cb7bf2f7', 'medical_director', 'Medical Director', 'Director', 'Medical Affairs', true, '[]', '{"Board Certification","GCP Training"}', '2025-09-27 16:49:11.038804+00'),
	('9b722d2d-0252-47a1-9ae8-325f7e031023', 'biostatistician', 'Biostatistician', 'Senior', 'Biostatistics', false, '[]', '{"Statistical Software Certification"}', '2025-09-27 16:49:11.038804+00'),
	('b7394fd6-5225-4875-87e5-d383381071e7', 'medical_writer', 'Medical Writer', 'Mid', 'Medical Affairs', false, '[]', '{"Medical Writing Certification"}', '2025-09-27 16:49:11.038804+00'),
	('f2a722d0-abcd-4306-bed3-b5185f2add8d', 'safety_officer', 'Pharmacovigilance Officer', 'Senior', 'Safety', false, '[]', '{"PV Training","Adverse Event Reporting"}', '2025-09-27 16:49:11.038804+00');


--
-- Data for Name: security_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: system_prompts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: usage_quotas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_executions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict PVKg6SVlvCiMDkT1Jc9JWDvhSSs90UqJC0LcruLm5Z3tUG23OH4YPtma6mGJX2g

RESET ALL;
