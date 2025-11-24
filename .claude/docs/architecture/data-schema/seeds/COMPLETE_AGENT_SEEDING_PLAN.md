# Complete Agent Ecosystem Seeding - Execution Plan

## Overview
This document outlines the complete seeding strategy for the 133-agent ecosystem across 5 levels.

## Agent Distribution

### Level 1: Master Agents (5)
1. Medical Affairs Strategy Master → Medical Leadership → Global Chief Medical Officer
2. Clinical Operations Master → Clinical Operations Support → Global Clinical Operations Liaison
3. Scientific Communications Master → Scientific Communications → Global Scientific Affairs Lead
4. Evidence & HEOR Strategy Master → HEOR & Evidence → Global Real-World Evidence Lead
5. Field Medical Operations Master → Field Medical → Global Field Medical Director

### Level 2: Expert Agents (35)
Based on MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json + 5 additional analytics experts

**Field Medical (4):**
- Medical Science Liaison Advisor → Global Medical Science Liaison (MSL)
- Regional Medical Director → Regional Field Medical Director  
- Therapeutic Area MSL Lead → Global Senior MSL
- Field Medical Trainer → Global Field Team Lead

**Medical Information Services (3):**
- Medical Information Specialist → Global Medical Information Specialist
- Medical Information Manager → Global Medical Information Manager
- Drug Safety Information Specialist → Global Medical Info Scientist

**Scientific Communications & Publications (10):**
- Medical Writer → Global Medical Writer
- Publication Strategist → Global Publications Lead
- Regulatory Medical Writer → Global Scientific Communications Manager
- Congress Materials Specialist → Global Medical Communications Specialist
- Slide Deck Developer → Regional Medical Communications Specialist
- Medical Communications Strategist → Global Scientific Affairs Lead
- Publications Manager → Global Publications Manager

**HEOR & Evidence (8):**
- Health Economics Researcher → Global Economic Modeler
- RWE Analyst → Global Real-World Evidence Lead
- Outcomes Research Specialist → Global HEOR Project Manager
- Market Access Advisor → Regional Real-World Evidence Lead
- Evidence Synthesis Expert → Regional Economic Modeler
- HEOR Modeler → Local Economic Modeler

**Clinical Operations Support (5):**
- Clinical Data Scientist → Global Medical Liaison Clinical Trials
- Clinical Trials Insight Analyst → Global Clinical Ops Support Analyst
- Site Engagement Coordinator → Local Clinical Operations Liaison
- Patient Safety Monitor → Regional Clinical Operations Liaison

**Medical Excellence & Compliance (3):**
- Medical Compliance Officer → Global Medical Governance Officer
- Quality Assurance Specialist → Global Medical Excellence Lead
- Audit Preparation Advisor → Global Compliance Specialist

**Medical Education (2):**
- Medical Education Strategist → Global Medical Education Strategist
- Scientific Trainer → Global Scientific Trainer

### Level 3: Specialist Agents (25)
Domain-specific specialists spawned by experts for deep technical work

**Field Medical Specialists (5):**
- KOL Engagement Specialist → Regional Senior MSL
- Investigator Relations Specialist → Local Senior MSL
- Congress Coverage Specialist → Global Medical Scientific Manager
- Scientific Data Analyst → Regional Medical Scientific Manager
- Competitive Intelligence Analyst → Local Medical Scientific Manager

**Medical Information Specialists (4):**
- Dosing & Administration Specialist → Regional Medical Information Specialist
- Pharmacokinetics Information Specialist → Local Medical Information Specialist
- Indication-Specific MI Specialist → Regional Medical Info Scientist
- Off-Label Inquiry Specialist → Local Medical Info Scientist

**Scientific Writing Specialists (5):**
- Abstract Writer → Regional Medical Writer
- Poster Content Specialist → Local Medical Writer
- Manuscript Editor → Regional Medical Communications Specialist
- Bibliography Manager → Local Medical Communications Specialist
- Formatting & Style Specialist → Regional Scientific Trainer

**HEOR Specialists (5):**
- Budget Impact Modeler → Regional HEOR Project Manager
- Cost-Effectiveness Analyst → Local HEOR Project Manager
- Patient Reported Outcomes Analyst → Regional Economic Modeler
- Meta-Analysis Specialist → Global Economic Modeler
- Systematic Review Specialist → Regional Real-World Evidence Lead

**Clinical Ops Specialists (3):**
- Protocol Design Reviewer → Regional Medical Liaison Clinical Trials
- Data Quality Auditor → Local Medical Liaison Clinical Trials
- IRB/Ethics Support Specialist → Regional Clinical Ops Support Analyst

**Compliance Specialists (3):**
- Promotional Review Specialist → Regional Medical Governance Officer
- Transparency Reporting Specialist → Local Medical Governance Officer
- MLR Process Coordinator → Regional Compliance Specialist

### Level 4: Worker Agents (18)
Task-execution agents for routine, repeatable work

**Document Processors (5):**
- Reference Formatter → Tool Type
- Citation Manager → Tool Type
- Template Populator → Tool Type
- Document Converter → Tool Type
- Version Controller → Tool Type

**Data Processors (5):**
- Data Extractor → Tool Type
- Data Validator → Tool Type
- Statistical Calculator → Tool Type
- Chart Generator → Tool Type
- Report Assembler → Tool Type

**Communication Workers (4):**
- Email Drafter → Tool Type
- Meeting Summarizer → Tool Type
- Action Item Tracker → Tool Type
- Follow-up Scheduler → Tool Type

**Compliance Workers (4):**
- Reference Checker → Tool Type
- Claim Validator → Tool Type
- Disclosure Tracker → Tool Type
- Audit Log Maintainer → Tool Type

### Level 5: Tool Agents (50+)
Micro-agents wrapping specific tools/APIs

**Search & Retrieval (10):**
- PubMed Searcher, ClinicalTrials.gov Querier, WHO Trial Registry Searcher, FDA Label Retriever, EMA SmPC Retriever, Patent Database Searcher, KOL Profile Searcher, Medical Dictionary Lookup, ICD/CPT Code Lookup, Drug Interaction Checker

**Data & Analytics (10):**
- Statistical Test Runner, P-value Calculator, Confidence Interval Calculator, Sample Size Calculator, Forest Plot Generator, Kaplan-Meier Curve Plotter, ROC Curve Generator, Sensitivity Analysis Runner, Meta-Analysis Calculator, Subgroup Analysis Tool

**Document Tools (10):**
- PDF Text Extractor, Word Document Merger, PowerPoint Slide Extractor, Excel Data Parser, CSV File Converter, Reference Manager (Zotero/Mendeley), Bibliography Formatter (APA/AMA/Vancouver), Table Generator, Figure Captioner, Watermark Applicator

**Compliance & Regulatory (10):**
- MLR Submission Tool, Veeva Vault Connector, Regulatory Database Querier, AE Reporting Tool, Safety Signal Detector, Transparency DB Checker, FCPA Compliance Checker, Sunshine Act Reporter, Code of Conduct Validator, Training Completion Tracker

**Communication & Collaboration (10):**
- Email Sender (via SMTP), Calendar Event Creator, Slack Notifier, Teams Message Poster, Zoom Meeting Scheduler, Survey Creator, Poll Generator, Translation Service (via API), Proofreading Service, Readability Scorer

## Execution Order

1. **Run `seed_complete_5_level_agents_part1_masters_and_experts.sql`** (5 Masters)
2. **Run `seed_complete_5_level_agents_part2_experts_1to10.sql`** (First 10 Experts)
3. **Run `seed_complete_5_level_agents_part3_experts_11to30.sql`** (Remaining 20 Experts)
4. **Run `seed_complete_5_level_agents_part4_specialists.sql`** (25 Specialists)
5. **Run `seed_complete_5_level_agents_part5_workers.sql`** (18 Workers)
6. **Run `seed_complete_5_level_agents_part6_tools.sql`** (50+ Tools)
7. **Run `seed_agent_hierarchies.sql`** (Build all parent-child relationships)
8. **Run `verify_complete_ecosystem.sql`** (Final verification)

## Organizational Mapping

All agents include complete org mapping:
- `function_id` + `function_name` = 'Medical Affairs'
- `department_id` + `department_name` = One of 9 departments
- `role_id` + `role_name` = One of 102 roles
- `tenant_id` = 'pharmaceuticals'

This ensures perfect Graph-RAG connectivity and semantic search across the agent hierarchy.

## Status
- ✅ Master Agents (Part 1): Created
- 🔄 Expert Agents (Parts 2-3): In Progress
- ⏳ Specialist Agents (Part 4): Pending
- ⏳ Worker Agents (Part 5): Pending
- ⏳ Tool Agents (Part 6): Pending
- ⏳ Hierarchies: Pending
- ⏳ Verification: Pending

