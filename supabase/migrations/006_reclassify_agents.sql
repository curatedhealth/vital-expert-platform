-- ============================================================================
-- Migration 006: Reclassify Agents by Proper Tier Levels
-- ============================================================================
-- Fixes critical issue: ALL agents incorrectly classified as "Tier 2 EXPERT"
-- Based on VITAL Enhanced Agent System specification
-- Generated: 2025-11-17
-- ============================================================================

BEGIN;

-- Update agent tier levels based on reclassification


-- ============================================================================
-- MASTER AGENTS (1 agents)
-- ============================================================================

-- Workflow Orchestration Agent (confidence: 0.95)
-- Reasoning: The Workflow Orchestration Agent serves as a master orchestrator that coordinates multi-agent workflows, making it a top-level orchestrator. It manages task dependencies and handles error recovery, which aligns with the responsibilities of a MASTER tier agent that oversees complex workflows and strategic planning.
UPDATE agents SET agent_level = 'MASTER' WHERE name = 'Workflow Orchestration Agent';


-- ============================================================================
-- EXPERT AGENTS (239 agents)
-- ============================================================================

-- HEOR Director (confidence: 0.90)
-- Reasoning: The HEOR Director possesses deep expertise in health economics and outcomes research, which is critical for market access. The role involves strategic guidance and decision-making that requires years of domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'HEOR Director';

-- Health Economics Manager (confidence: 0.90)
-- Reasoning: The Health Economics Manager demonstrates deep expertise in health economics, specifically in cost-effectiveness modeling and budget impact analysis, which requires complex reasoning and analysis. This role involves providing strategic guidance and making decisions that rely on years of domain knowledge in market access.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Health Economics Manager';

-- Outcomes Research Specialist (confidence: 0.85)
-- Reasoning: The Outcomes Research Specialist demonstrates deep expertise in conducting real-world evidence studies and comparative effectiveness research, which requires complex reasoning and analysis. Their role involves strategic guidance in evaluating clinical and economic value, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Outcomes Research Specialist';

-- HTA Submission Specialist (confidence: 0.90)
-- Reasoning: The HTA Submission Specialist has deep expertise in preparing and managing health technology assessment submissions, which requires complex reasoning and analysis. Their role involves strategic guidance and decision-making based on years of domain knowledge in market access.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'HTA Submission Specialist';

-- Evidence Synthesis Lead (confidence: 0.90)
-- Reasoning: The Evidence Synthesis Lead demonstrates deep expertise in systematic reviews and evidence synthesis, which are critical for market access and HTA submissions. This role requires complex reasoning and analysis, as well as strategic guidance, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Evidence Synthesis Lead';

-- Payer Strategy Director (confidence: 0.90)
-- Reasoning: The Payer Strategy Director exhibits deep expertise in market access and payer engagement strategies, which aligns with the characteristics of an Expert tier agent. The role involves complex reasoning, strategic guidance, and decision-making that requires significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Payer Strategy Director';

-- National Account Director (confidence: 0.85)
-- Reasoning: The National Account Director possesses deep expertise in market access and strategic partnership development, which aligns with the characteristics of a domain expert. Their role involves complex reasoning and strategic decision-making, particularly in managing relationships with national payers and optimizing market access.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'National Account Director';

-- Contracting Strategy Lead (confidence: 0.90)
-- Reasoning: The Contracting Strategy Lead demonstrates deep expertise in market access and contracting strategies, which requires complex reasoning and analysis. The role involves high-level strategic decision-making and negotiation with payers, aligning with the characteristics of an expert in the domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Contracting Strategy Lead';

-- Formulary Access Manager (confidence: 0.90)
-- Reasoning: The Formulary Access Manager demonstrates deep expertise in market access, specifically in managing P&T processes and developing formulary strategies. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Formulary Access Manager';

-- Value-Based Contracting Specialist (confidence: 0.85)
-- Reasoning: The Value-Based Contracting Specialist demonstrates deep expertise in market access and innovative contracting strategies, making complex decisions that require extensive domain knowledge. Their capabilities in designing outcomes-based contracts and negotiating with payers indicate a high level of strategic guidance and specialized judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Value-Based Contracting Specialist';

-- Pricing Strategy Director (confidence: 0.90)
-- Reasoning: The Pricing Strategy Director demonstrates deep expertise in market access and strategic pricing, making complex decisions that require extensive domain knowledge. The role involves high-level strategic guidance and analysis, aligning with the characteristics of an expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pricing Strategy Director';

-- Global Pricing Lead (confidence: 0.90)
-- Reasoning: The Global Pricing Lead possesses deep expertise in international pricing strategies and reference pricing implications, which aligns with the characteristics of an Expert tier agent. Their role involves complex reasoning and strategic guidance in market access, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Global Pricing Lead';

-- Reimbursement Strategy Manager (confidence: 0.90)
-- Reasoning: The Reimbursement Strategy Manager demonstrates deep expertise in market access, specifically in coding strategy development, coverage policy optimization, and payment optimization. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Reimbursement Strategy Manager';

-- Patient Access Director (confidence: 0.85)
-- Reasoning: The Patient Access Director demonstrates deep expertise in designing and implementing patient support programs, which requires complex reasoning and a high level of strategic decision-making. The role involves leadership and guidance in a specialized domain focused on therapy access, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Patient Access Director';

-- Prior Authorization Manager (confidence: 0.85)
-- Reasoning: The Prior Authorization Manager demonstrates deep expertise in optimizing prior authorization processes and improving patient access, which aligns with the characteristics of an expert in the operational domain. The role requires complex reasoning and strategic guidance to navigate regulatory and clinical challenges effectively.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Prior Authorization Manager';

-- Copay Program Manager (confidence: 0.85)
-- Reasoning: The Copay Program Manager demonstrates deep expertise in financial assistance and patient affordability programs, which aligns with the characteristics of a domain expert. The role involves complex reasoning and strategic guidance in managing and designing programs that require years of specialized knowledge in market access.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Copay Program Manager';

-- Policy & Advocacy Director (confidence: 0.90)
-- Reasoning: The Policy & Advocacy Director demonstrates deep expertise in shaping healthcare policy, which requires complex reasoning and analysis. The role involves strategic decision-making to improve patient access and optimize market conditions, aligning with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Policy & Advocacy Director';

-- Government Affairs Manager (confidence: 0.85)
-- Reasoning: The Government Affairs Manager possesses deep expertise in regulatory affairs and demonstrates complex reasoning and analysis in influencing policy and advancing legislative priorities. This role requires strategic guidance and decision-making based on years of domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Government Affairs Manager';

-- Healthcare Policy Analyst (confidence: 0.85)
-- Reasoning: The Healthcare Policy Analyst demonstrates deep expertise in healthcare legislation and evidence-based policy development, which aligns with the characteristics of an Expert tier agent. Their role involves complex reasoning and analysis, providing strategic guidance based on years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Healthcare Policy Analyst';

-- Market Access Communications Lead (confidence: 0.85)
-- Reasoning: The Market Access Communications Lead demonstrates deep expertise in market access strategy and payer engagement, which aligns with the characteristics of an expert. The role involves complex reasoning and the development of strategic materials, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Market Access Communications Lead';

-- Market Access Operations Director (confidence: 0.85)
-- Reasoning: The Market Access Operations Director possesses deep expertise in market access processes and systems, indicating a high level of domain knowledge. Their role involves strategic guidance and coordination across various departments, aligning with the characteristics of an expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Market Access Operations Director';

-- Access Analytics Manager (confidence: 0.85)
-- Reasoning: The Access Analytics Manager demonstrates deep expertise in market access strategies and provides strategic decision support based on complex analysis of access performance. This role requires significant domain knowledge and the ability to deliver actionable insights, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Access Analytics Manager';

-- Medical Science Liaison Advisor (confidence: 0.90)
-- Reasoning: The Medical Science Liaison Advisor demonstrates deep expertise in engaging with Key Opinion Leaders and providing strategic guidance on healthcare provider education, which requires significant domain knowledge. The role involves complex reasoning and analysis, particularly in clinical insights gathering and scientific exchange, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Science Liaison Advisor';

-- Regional Medical Director (confidence: 0.90)
-- Reasoning: The Regional Medical Director possesses deep expertise in medical strategy and stakeholder management, which aligns with the characteristics of an expert. The role involves making strategic decisions and providing guidance that requires significant domain knowledge, particularly in managing MSL teams and developing regional medical plans.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regional Medical Director';

-- Therapeutic Area MSL Lead (confidence: 0.85)
-- Reasoning: The Therapeutic Area MSL Lead possesses deep expertise in a specific therapeutic area and provides strategic guidance to MSL teams. Their role involves complex reasoning and analysis related to scientific engagement strategies, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Therapeutic Area MSL Lead';

-- Medical Information Specialist (confidence: 0.90)
-- Reasoning: The Medical Information Specialist possesses deep expertise in the regulatory domain, particularly in providing accurate and compliant medical information. This role requires complex reasoning and analysis to ensure adherence to FDA regulations, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Information Specialist';

-- Medical Content Manager (confidence: 0.85)
-- Reasoning: The Medical Content Manager demonstrates deep expertise in managing medical information assets and knowledge management systems, which aligns with the characteristics of a domain expert. The role involves strategic guidance and oversight of content governance, indicating a high level of responsibility and decision-making that requires specialized knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Content Manager';

-- Publication Strategy Lead (confidence: 0.85)
-- Reasoning: The Publication Strategy Lead demonstrates deep expertise in scientific publication planning and author engagement, which requires complex reasoning and analysis. This role involves strategic guidance and decision-making that aligns with the characteristics of an expert in the domain of clinical research dissemination.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Publication Strategy Lead';

-- Medical Education Director (confidence: 0.85)
-- Reasoning: The Medical Education Director demonstrates deep expertise in the domain of continuing medical education, requiring complex reasoning and analysis to develop and implement programs. The role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Education Director';

-- Medical Writer - Regulatory (confidence: 0.85)
-- Reasoning: The Medical Writer - Regulatory possesses deep expertise in regulatory document creation and compliance, which requires complex reasoning and analysis. This role involves strategic guidance in the regulatory domain, making it more than just a focused specialist or task executor.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Writer - Regulatory';

-- Medical Communications Manager (confidence: 0.85)
-- Reasoning: The Medical Communications Manager demonstrates deep expertise in medical communication strategies and content creation, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning it closely with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Communications Manager';

-- Medical Editor (confidence: 0.85)
-- Reasoning: The Medical Editor possesses deep expertise in medical content review and ensures compliance with style guidelines, indicating a high level of specialized knowledge. Their role in ensuring editorial excellence and accuracy suggests they provide strategic guidance within the medical domain, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Editor';

-- Real-World Evidence Specialist (confidence: 0.85)
-- Reasoning: The Real-World Evidence Specialist demonstrates deep expertise in designing and analyzing studies that require complex reasoning and analysis. Their role involves providing strategic guidance and making decisions based on years of domain knowledge in real-world evidence, which aligns with the criteria for Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Real-World Evidence Specialist';

-- Health Economics Specialist (confidence: 0.85)
-- Reasoning: The Health Economics Specialist demonstrates deep expertise in health economics and market access, conducting complex analyses and developing economic models that require significant domain knowledge. Their role involves strategic guidance and decision-making related to cost-effectiveness and value propositions, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Health Economics Specialist';

-- Biostatistician (confidence: 0.85)
-- Reasoning: The Biostatistician possesses deep expertise in clinical trial analysis and data interpretation, which aligns with the characteristics of an Expert tier agent. Their role involves complex reasoning and strategic guidance in the context of clinical studies, requiring significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Biostatistician';

-- Epidemiologist (confidence: 0.85)
-- Reasoning: The Epidemiologist possesses deep expertise in the domain of population health and disease patterns, which aligns with the characteristics of an Expert tier agent. Their capabilities in conducting complex epidemiological research and providing strategic insights based on their findings demonstrate the high-level analytical reasoning and decision-making required for this classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Epidemiologist';

-- Outcomes Research Manager (confidence: 0.85)
-- Reasoning: The Outcomes Research Manager possesses deep expertise in patient-reported outcomes and quality of life assessments, which aligns with the characteristics of an expert. Their role involves complex reasoning and analysis to generate patient-centered evidence, indicating a high level of strategic guidance and decision-making based on years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Outcomes Research Manager';

-- Clinical Study Liaison (confidence: 0.85)
-- Reasoning: The Clinical Study Liaison possesses deep expertise in clinical trial execution and investigator relationship management, which are critical for strategic guidance in clinical development. This role requires complex reasoning and analysis, as well as the ability to facilitate collaboration among various stakeholders, aligning with the characteristics of an expert tier.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Study Liaison';

-- Medical Monitor (confidence: 0.90)
-- Reasoning: The Medical Monitor possesses deep expertise in clinical oversight, ensuring patient safety and compliance within clinical trials. This role requires complex reasoning and analysis, as well as strategic guidance based on years of domain knowledge in the clinical field.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Monitor';

-- Clinical Data Manager (confidence: 0.85)
-- Reasoning: The Clinical Data Manager possesses deep expertise in managing clinical trial data, ensuring compliance with regulatory standards, and supporting data analysis. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Data Manager';

-- Clinical Trial Disclosure Manager (confidence: 0.85)
-- Reasoning: The Clinical Trial Disclosure Manager possesses deep expertise in regulatory compliance and clinical trial management, making strategic decisions regarding registration and results disclosure. This role requires complex reasoning and a thorough understanding of global transparency regulations, aligning it with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Disclosure Manager';

-- Medical Excellence Director (confidence: 0.85)
-- Reasoning: The Medical Excellence Director demonstrates deep expertise in medical affairs, focusing on optimization and quality frameworks. This role involves strategic guidance and decision-making that requires extensive domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Excellence Director';

-- Medical Quality Assurance Manager (confidence: 0.85)
-- Reasoning: The Medical Quality Assurance Manager possesses deep expertise in quality assurance processes and regulatory compliance within the medical affairs domain. Their role involves complex reasoning and analysis to ensure that activities meet high standards, indicating a level of strategic guidance and decision-making that aligns with Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Quality Assurance Manager';

-- Medical Affairs Strategist (confidence: 0.85)
-- Reasoning: The Medical Affairs Strategist demonstrates deep expertise in developing and implementing strategic medical plans, which requires complex reasoning and analysis. Their role involves leading initiatives and driving cross-functional collaboration, indicating a high level of strategic guidance and decision-making that aligns with Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Affairs Strategist';

-- Therapeutic Area Expert (confidence: 0.90)
-- Reasoning: The Therapeutic Area Expert possesses deep clinical expertise and provides strategic guidance across medical affairs initiatives, which aligns with the characteristics of a domain expert. Their role involves complex reasoning and analysis, making decisions that require extensive domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Therapeutic Area Expert';

-- Global Medical Advisor (confidence: 0.90)
-- Reasoning: The Global Medical Advisor is a senior medical leader with deep expertise in coordinating global medical strategies and ensuring regional alignment. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the medical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Global Medical Advisor';

-- Brand Strategy Director (confidence: 0.85)
-- Reasoning: The Brand Strategy Director demonstrates deep expertise in strategic brand development and execution of commercial plans, which requires years of domain knowledge. The role involves making high-level strategic decisions and providing guidance on brand positioning, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Brand Strategy Director';

-- Digital Strategy Director (confidence: 0.85)
-- Reasoning: The Digital Strategy Director demonstrates deep expertise in developing omnichannel strategies and overseeing digital transformation, which requires complex reasoning and analysis within the pharmaceutical marketing domain. The role involves strategic guidance and decision-making that aligns with business goals and regulatory compliance, indicating a high level of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Digital Strategy Director';

-- Marketing Analytics Director (confidence: 0.85)
-- Reasoning: The Marketing Analytics Director possesses deep expertise in marketing analytics and drives strategic decisions based on complex data analysis. Their role involves providing strategic guidance and optimizing marketing performance, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Marketing Analytics Director';

-- Regulatory Compliance Validator (confidence: 0.85)
-- Reasoning: The Regulatory Compliance Validator demonstrates deep expertise in regulatory standards and compliance assessment, which requires complex reasoning and analysis. It provides strategic guidance on regulatory submissions, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Compliance Validator';

-- Safety Signal Detector (confidence: 0.85)
-- Reasoning: The Safety Signal Detector has deep expertise in regulatory matters, particularly in monitoring adverse events and performing risk assessments. Its capabilities require complex reasoning and analysis, making it a domain expert that provides strategic guidance in safety signal detection.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Signal Detector';

-- Clinical Trial Protocol Designer (confidence: 0.85)
-- Reasoning: The Clinical Trial Protocol Designer demonstrates deep expertise in designing and optimizing clinical trial protocols, which requires complex reasoning and extensive domain knowledge. This role provides strategic guidance and ensures scientific rigor, aligning with the characteristics of an Expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Protocol Designer';

-- Anticoagulation Specialist (confidence: 0.85)
-- Reasoning: The Anticoagulation Specialist demonstrates deep expertise in clinical pharmacotherapy, particularly in anticoagulation management. Its capabilities, such as evidence-based medication guidance and drug interaction assessment, require complex reasoning and a high level of domain knowledge, aligning it with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Anticoagulation Specialist';

-- Clinical Trial Designer (confidence: 0.85)
-- Reasoning: The Clinical Trial Designer demonstrates deep expertise in clinical trial design, including protocol design, endpoint selection, and statistical analysis advising. These capabilities require complex reasoning and a high level of domain knowledge, aligning with the characteristics of an Expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Designer';

-- HIPAA Compliance Officer (confidence: 0.90)
-- Reasoning: The HIPAA Compliance Officer possesses deep expertise in regulatory matters related to HIPAA, demonstrating complex reasoning and analysis in interpreting privacy and security rules. Their role involves providing strategic guidance and advice, which requires years of domain knowledge in healthcare compliance.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'HIPAA Compliance Officer';

-- Reimbursement Strategist (confidence: 0.90)
-- Reasoning: The Reimbursement Strategist demonstrates deep expertise in healthcare reimbursement and market access, which aligns with the characteristics of an Expert tier agent. Their capabilities involve complex reasoning and strategic guidance in developing reimbursement strategies and navigating coding systems, requiring significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Reimbursement Strategist';

-- Pediatric Dosing Specialist (confidence: 0.85)
-- Reasoning: The Pediatric Dosing Specialist demonstrates deep expertise in pediatric pharmacotherapy and age-appropriate dosing, which aligns with the characteristics of an Expert agent. The capabilities listed, such as evidence-based medication guidance and drug interaction assessment, require complex reasoning and specialized knowledge, justifying its classification as an Expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pediatric Dosing Specialist';

-- Accelerated Approval Strategist (confidence: 0.90)
-- Reasoning: The Accelerated Approval Strategist provides strategic regulatory guidance and interprets complex FDA regulations, which requires deep expertise in the regulatory domain. The role involves developing submission strategies and ensuring compliance, indicating a high level of decision-making that relies on years of specialized knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Accelerated Approval Strategist';

-- comparability_study_designer (confidence: 0.85)
-- Reasoning: The agent ''comparability_study_designer'' demonstrates deep expertise in the regulatory domain, particularly in medication guidance and pharmacotherapy decision support. Its capabilities require complex reasoning and analysis, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'comparability_study_designer';

-- Drug Information Specialist (confidence: 0.85)
-- Reasoning: The Drug Information Specialist demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance and complex reasoning for drug interactions and dosing calculations. This role requires significant domain knowledge and the ability to make informed decisions regarding medication safety and efficacy.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Drug Information Specialist';

-- oligonucleotide_therapy_specialist (confidence: 0.85)
-- Reasoning: The oligonucleotide_therapy_specialist demonstrates deep expertise in the clinical domain, specifically in antisense and siRNA therapeutics. The capabilities listed, such as clinical protocol design and trial operations management, indicate a high level of strategic guidance and decision-making that aligns with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'oligonucleotide_therapy_specialist';

-- Pharmacokinetics Advisor (confidence: 0.85)
-- Reasoning: The Pharmacokinetics Advisor provides deep expertise in clinical pharmacotherapy, offering evidence-based medication guidance and complex decision support. Its capabilities require significant domain knowledge and involve strategic reasoning in medication management, aligning it with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pharmacokinetics Advisor';

-- NDA/BLA Coordinator (confidence: 0.85)
-- Reasoning: The NDA/BLA Coordinator demonstrates deep expertise in regulatory affairs, particularly in the coordination and submission of marketing applications. The role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'NDA/BLA Coordinator';

-- Mass Spectrometry Imaging Expert (confidence: 0.85)
-- Reasoning: The Mass Spectrometry Imaging Expert demonstrates deep expertise in clinical applications of MSI techniques, providing complex reasoning and analysis related to pharmacotherapy. The capabilities listed, such as evidence-based medication guidance and drug interaction assessment, require significant domain knowledge and strategic decision-making.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Mass Spectrometry Imaging Expert';

-- Infectious Disease Pharmacist (confidence: 0.85)
-- Reasoning: The Infectious Disease Pharmacist demonstrates deep expertise in clinical pharmacotherapy, particularly in antimicrobial stewardship. Their capabilities involve complex reasoning and analysis related to medication guidance, dosing calculations, and drug interactions, which require years of domain knowledge and strategic judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Infectious Disease Pharmacist';

-- Regulatory Intelligence Analyst (confidence: 0.85)
-- Reasoning: The Regulatory Intelligence Analyst possesses deep expertise in regulatory affairs and compliance, providing strategic guidance and interpretation of complex FDA regulations. This role requires significant domain knowledge and the ability to make complex decisions regarding regulatory submissions, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Intelligence Analyst';

-- Medication Reconciliation Assistant (confidence: 0.85)
-- Reasoning: The Medication Reconciliation Assistant demonstrates deep expertise in clinical medication management, providing evidence-based guidance and performing complex assessments such as drug interactions and dosing calculations. Its capabilities require significant domain knowledge and strategic decision-making, aligning it with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medication Reconciliation Assistant';

-- Validation Specialist (confidence: 0.85)
-- Reasoning: The Validation Specialist demonstrates deep expertise in validation planning and execution, ensuring GMP compliance and managing CAPA systems. This role requires complex reasoning and analysis, as well as strategic guidance in maintaining quality standards, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Validation Specialist';

-- GMP Compliance Advisor (confidence: 0.85)
-- Reasoning: The GMP Compliance Advisor demonstrates deep expertise in GMP compliance, which involves complex reasoning and analysis of regulatory standards. Its capabilities in deviation investigation and CAPA system management indicate a high level of strategic guidance and decision-making that requires years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'GMP Compliance Advisor';

-- Geriatric Medication Specialist (confidence: 0.85)
-- Reasoning: The Geriatric Medication Specialist demonstrates deep expertise in geriatric medication optimization and deprescribing, which requires complex reasoning and analysis specific to the clinical domain. This role provides strategic guidance and makes decisions based on extensive domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Geriatric Medication Specialist';

-- Quality Systems Auditor (confidence: 0.85)
-- Reasoning: The Quality Systems Auditor possesses deep expertise in internal audit planning, deviation investigation, and CAPA system management, which requires complex reasoning and analysis. This role involves strategic guidance and decision-making that necessitates years of domain knowledge in quality systems and GMP compliance.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Quality Systems Auditor';

-- PSUR/PBRER Writer (confidence: 0.85)
-- Reasoning: The PSUR/PBRER Writer demonstrates deep expertise in the regulatory domain, particularly in pharmacovigilance. Its capabilities in safety signal detection, benefit-risk assessment, and detailed report preparation require complex reasoning and specialized knowledge, aligning it closely with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'PSUR/PBRER Writer';

-- Pediatric Regulatory Advisor (confidence: 0.95)
-- Reasoning: The Pediatric Regulatory Advisor demonstrates deep expertise in regulatory guidance specific to pediatric investigation plans. The role involves complex reasoning, strategic decision-making, and interpretation of FDA regulations, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pediatric Regulatory Advisor';

-- Clinical Trial Budget Estimator (confidence: 0.85)
-- Reasoning: The Clinical Trial Budget Estimator demonstrates deep expertise in the clinical domain, particularly in clinical trial management and budget development. Its capabilities involve complex reasoning and analysis related to trial operations and patient safety, which require years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Budget Estimator';

-- CMC Regulatory Specialist (confidence: 0.90)
-- Reasoning: The CMC Regulatory Specialist demonstrates deep expertise in regulatory strategy and compliance, which requires complex reasoning and analysis of FDA regulations. The role involves providing strategic guidance and developing submission strategies, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'CMC Regulatory Specialist';

-- Supplier Quality Manager (confidence: 0.85)
-- Reasoning: The Supplier Quality Manager possesses deep expertise in ensuring GMP compliance and managing CAPA systems, which requires complex reasoning and analysis. This role involves strategic oversight of supplier qualifications, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Supplier Quality Manager';

-- Breakthrough Therapy Advisor (confidence: 0.90)
-- Reasoning: The Breakthrough Therapy Advisor provides strategic regulatory guidance and interprets FDA regulations, which requires deep expertise in the regulatory domain. Its capabilities involve complex reasoning and analysis to develop effective submission strategies, indicating a high level of domain knowledge and strategic decision-making.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Breakthrough Therapy Advisor';

-- Clinical Protocol Writer (confidence: 0.85)
-- Reasoning: The Clinical Protocol Writer demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. This role provides strategic guidance and makes decisions that rely on extensive domain knowledge, aligning it with the characteristics of an EXPERT tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Protocol Writer';

-- Regulatory Strategy Advisor (confidence: 0.85)
-- Reasoning: The Regulatory Strategy Advisor provides strategic regulatory guidance and interprets FDA regulations, indicating a high level of domain expertise. The role requires complex reasoning and analysis to develop submission strategies and ensure compliance, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Strategy Advisor';

-- Study Closeout Specialist (confidence: 0.85)
-- Reasoning: The Study Closeout Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for ensuring data quality and patient safety. The role requires complex reasoning and analysis, as well as strategic guidance in clinical study closure activities, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Study Closeout Specialist';

-- Investigator-Initiated Study Reviewer (confidence: 0.85)
-- Reasoning: The Investigator-Initiated Study Reviewer demonstrates deep expertise in clinical evaluation and regulatory compliance, which aligns with the characteristics of an Expert tier agent. The role involves complex reasoning, strategic guidance, and engagement with key opinion leaders, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Investigator-Initiated Study Reviewer';

-- Equipment Qualification Specialist (confidence: 0.85)
-- Reasoning: The Equipment Qualification Specialist possesses deep expertise in equipment validation and qualification, which requires complex reasoning and analysis. Their role involves making strategic decisions related to pharmaceutical equipment, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Equipment Qualification Specialist';

-- Pricing Strategy Advisor (confidence: 0.85)
-- Reasoning: The Pricing Strategy Advisor exhibits deep expertise in market access and pricing strategies, providing evidence-based guidance and complex reasoning for pharmacotherapy decisions. Its capabilities suggest a high level of strategic guidance and expert judgment, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pricing Strategy Advisor';

-- Patient-Reported Outcomes Specialist (confidence: 0.85)
-- Reasoning: The Patient-Reported Outcomes Specialist demonstrates deep expertise in clinical trial processes, particularly in the development and validation of patient-reported outcome instruments. The role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Patient-Reported Outcomes Specialist';

-- Companion Diagnostic Regulatory Specialist (confidence: 0.90)
-- Reasoning: The Companion Diagnostic Regulatory Specialist demonstrates deep expertise in regulatory matters specifically related to CDx codevelopment. Their role involves providing strategic regulatory guidance and interpreting complex FDA regulations, which requires significant domain knowledge and expert judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Companion Diagnostic Regulatory Specialist';

-- Safety Database Manager (confidence: 0.85)
-- Reasoning: The Safety Database Manager possesses deep expertise in pharmacovigilance and safety assessment, which aligns with the characteristics of an expert agent. The capabilities listed, such as safety signal detection and benefit-risk assessment, require complex reasoning and domain knowledge, indicating a high level of specialization.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Database Manager';

-- Congress Planning Specialist (confidence: 0.85)
-- Reasoning: The Congress Planning Specialist demonstrates deep expertise in medical congress strategy and planning, which requires complex reasoning and analysis. Their role involves strategic guidance and decision-making based on extensive domain knowledge, particularly in medical publications and compliance, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Congress Planning Specialist';

-- Vaccine Clinical Specialist (confidence: 0.85)
-- Reasoning: The Vaccine Clinical Specialist possesses deep expertise in vaccine development and immunogenicity, which aligns with the characteristics of an Expert tier agent. Their role involves complex reasoning and analysis in clinical protocol design and trial operations management, requiring significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Vaccine Clinical Specialist';

-- Oncology Clinical Specialist (confidence: 0.85)
-- Reasoning: The Oncology Clinical Specialist demonstrates deep expertise in the clinical domain, particularly in oncology trial design and management. Their role involves complex reasoning and decision-making that requires years of specialized knowledge, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Oncology Clinical Specialist';

-- Gene Therapy Clinical Expert (confidence: 0.85)
-- Reasoning: The Gene Therapy Clinical Expert possesses deep expertise in clinical development specifically for gene therapy, which aligns with the characteristics of an Expert tier agent. Their responsibilities include designing clinical protocols, managing trial operations, and ensuring data quality and patient safety, all of which require complex reasoning and significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Gene Therapy Clinical Expert';

-- Stability Study Designer (confidence: 0.85)
-- Reasoning: The Stability Study Designer demonstrates deep expertise in clinical strategies and protocols, particularly in medication guidance and pharmacotherapy. The capabilities outlined require complex reasoning and analysis, fitting the criteria for an expert-level agent that provides strategic guidance based on extensive domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Stability Study Designer';

-- Impurity Assessment Expert (confidence: 0.90)
-- Reasoning: The Impurity Assessment Expert possesses deep expertise in the regulatory domain, specifically focusing on impurity qualification and safety assessment. This role requires complex reasoning and analysis, as well as strategic guidance based on years of domain knowledge, aligning it closely with the characteristics of an EXPERT tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Impurity Assessment Expert';

-- Sterile Manufacturing Specialist (confidence: 0.85)
-- Reasoning: The Sterile Manufacturing Specialist possesses deep expertise in aseptic processing and sterilization techniques, which are critical in the pharmaceutical manufacturing domain. Their ability to provide medication guidance and assess drug interactions further demonstrates their complex reasoning and analysis capabilities, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Sterile Manufacturing Specialist';

-- Omnichannel Strategist (confidence: 0.85)
-- Reasoning: The Omnichannel Strategist demonstrates deep expertise in multi-channel marketing coordination specifically within the pharmaceutical industry, which aligns with the characteristics of an expert. Additionally, the agent provides strategic guidance on safe pharmacotherapy decisions and evidence-based medication guidance, indicating a high level of domain knowledge and complex reasoning.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Omnichannel Strategist';

-- Contract Manufacturing Manager (confidence: 0.85)
-- Reasoning: The Contract Manufacturing Manager possesses deep expertise in managing relationships with Contract Manufacturing Organizations and provides strategic guidance in medication management and safety protocols. This role requires complex reasoning and analysis, aligning with the characteristics of an expert in the technical CMC domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Contract Manufacturing Manager';

-- Database Architect (confidence: 0.85)
-- Reasoning: The Database Architect demonstrates deep expertise in clinical data architecture, providing complex reasoning and analysis related to medication guidance, dosing calculations, and drug interactions. This role requires significant domain knowledge and the ability to support pharmacotherapy decisions, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Database Architect';

-- Stem Cell Therapy Expert (confidence: 0.90)
-- Reasoning: The Stem Cell Therapy Expert possesses deep expertise in the clinical domain, specifically in designing clinical protocols and managing trial operations. Their role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Stem Cell Therapy Expert';

-- Oncolytic Virus Expert (confidence: 0.90)
-- Reasoning: The Oncolytic Virus Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. Their role involves strategic guidance in virotherapy development, aligning with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Oncolytic Virus Expert';

-- Companion Diagnostic Developer (confidence: 0.85)
-- Reasoning: The Companion Diagnostic Developer exhibits deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance in the development of companion diagnostics, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Companion Diagnostic Developer';

-- Digital Therapeutic Specialist (confidence: 0.85)
-- Reasoning: The Digital Therapeutic Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for DTx development and validation. Their role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Digital Therapeutic Specialist';

-- Intranasal Delivery Expert (confidence: 0.85)
-- Reasoning: The Intranasal Delivery Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and extensive domain knowledge. The agent''s capabilities in ensuring data quality and maintaining patient safety further emphasize its role as a domain expert rather than a generalist or task executor.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Intranasal Delivery Expert';

-- Formulary Strategy Specialist (confidence: 0.85)
-- Reasoning: The Formulary Strategy Specialist possesses deep expertise in clinical medication guidance, formulary access, and drug interactions, which aligns with the characteristics of an expert. The role requires complex reasoning and strategic guidance, indicating a high level of domain knowledge and decision-making capabilities.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Formulary Strategy Specialist';

-- AI Drug Discovery Specialist (confidence: 0.85)
-- Reasoning: The AI Drug Discovery Specialist demonstrates deep expertise in the clinical domain, particularly in drug discovery and pharmacotherapy. Its capabilities involve complex reasoning and analysis, such as assessing drug interactions and providing evidence-based medication guidance, which aligns with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'AI Drug Discovery Specialist';

-- Distribution Network Designer (confidence: 0.85)
-- Reasoning: The Distribution Network Designer exhibits deep expertise in clinical decision-making related to medication guidance, dosing calculations, and drug interactions. This requires complex reasoning and a high level of domain knowledge, aligning it with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Distribution Network Designer';

-- Clinical Trial Simulation Expert (confidence: 0.85)
-- Reasoning: The Clinical Trial Simulation Expert demonstrates deep expertise in clinical trial modeling and pharmacotherapy decisions, which requires complex reasoning and analysis. The capabilities listed indicate a high level of strategic guidance and decision-making based on extensive domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Simulation Expert';

-- Peptide Therapeutics Specialist (confidence: 0.85)
-- Reasoning: The Peptide Therapeutics Specialist possesses deep expertise in therapeutic peptide development, which aligns with the characteristics of an Expert tier agent. The role involves complex reasoning and strategic guidance in clinical protocol design and trial operations management, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Peptide Therapeutics Specialist';

-- Antibody-Drug Conjugate Specialist (confidence: 0.85)
-- Reasoning: The Antibody-Drug Conjugate Specialist possesses deep expertise in the clinical domain, specifically focusing on the optimization of ADC linkers and payloads. This role involves complex reasoning and strategic guidance in clinical protocol design and trial management, which aligns with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Antibody-Drug Conjugate Specialist';

-- Radiopharmaceutical Specialist (confidence: 0.85)
-- Reasoning: The Radiopharmaceutical Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for the development of radioligand therapy. The role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Radiopharmaceutical Specialist';

-- Senolytic Therapy Specialist (confidence: 0.90)
-- Reasoning: The Senolytic Therapy Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for the development of senolytic therapies. The role requires complex reasoning and strategic guidance in a specialized domain, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Senolytic Therapy Specialist';

-- FDA Guidance Interpreter (confidence: 0.90)
-- Reasoning: The FDA Guidance Interpreter demonstrates deep expertise in regulatory affairs, particularly in interpreting FDA regulations and developing submission strategies. Its capabilities require complex reasoning and strategic guidance, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'FDA Guidance Interpreter';

-- Site Selection Advisor (confidence: 0.85)
-- Reasoning: The Site Selection Advisor possesses deep expertise in clinical trial feasibility, protocol design, and operations management, which aligns with the characteristics of a domain expert. The role requires complex reasoning and strategic guidance, making high-level decisions based on extensive knowledge in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Site Selection Advisor';

-- Patient Recruitment Strategist (confidence: 0.85)
-- Reasoning: The Patient Recruitment Strategist demonstrates deep expertise in clinical trial processes, particularly in patient enrollment optimization and data quality assurance. The role involves complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Patient Recruitment Strategist';

-- Evidence Generation Planner (confidence: 0.85)
-- Reasoning: The Evidence Generation Planner exhibits deep expertise in the domain of medical affairs and real-world evidence strategy. Its capabilities in scientific support provision, key opinion leader engagement, and medical publication development indicate a high level of strategic guidance and complex reasoning, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Evidence Generation Planner';

-- Payer Strategy Advisor (confidence: 0.85)
-- Reasoning: The Payer Strategy Advisor demonstrates deep expertise in market access and payer engagement strategies, which aligns with the characteristics of an Expert tier agent. Its capabilities in evidence-based medication guidance and drug interaction assessment indicate complex reasoning and analysis, essential for making strategic decisions in the healthcare domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Payer Strategy Advisor';

-- Biomarker Strategy Advisor (confidence: 0.85)
-- Reasoning: The Biomarker Strategy Advisor demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning it closely with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Biomarker Strategy Advisor';

-- Regulatory Lifecycle Manager (confidence: 0.85)
-- Reasoning: The Regulatory Lifecycle Manager provides strategic regulatory guidance and interprets FDA regulations, indicating a deep expertise in the regulatory domain. The role involves complex reasoning and the development of submission strategies, which require years of domain knowledge and expert judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Lifecycle Manager';

-- Regulatory Dossier Architect (confidence: 0.90)
-- Reasoning: The Regulatory Dossier Architect provides strategic regulatory guidance and interprets FDA regulations, indicating a high level of expertise in the regulatory domain. The agent''s capabilities involve complex reasoning and decision-making that require years of domain knowledge, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Dossier Architect';

-- Excipient Compatibility Expert (confidence: 0.85)
-- Reasoning: The Excipient Compatibility Expert demonstrates deep expertise in the domain of excipient selection and compatibility, providing strategic guidance and complex reasoning in pharmaceutical formulations. Its capabilities require specialized knowledge and expert judgment, aligning it closely with the criteria for Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Excipient Compatibility Expert';

-- Carcinogenicity Study Designer (confidence: 0.85)
-- Reasoning: The Carcinogenicity Study Designer demonstrates deep expertise in clinical study planning, particularly in carcinogenicity, which requires complex reasoning and analysis. The agent provides strategic guidance based on extensive domain knowledge, making it suitable for the EXPERT tier.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Carcinogenicity Study Designer';

-- 3Rs Implementation Specialist (confidence: 0.85)
-- Reasoning: The 3Rs Implementation Specialist demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based guidance and complex decision support. The role requires significant domain knowledge and analytical skills to assess drug interactions and dosing calculations, aligning with the criteria for an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = '3Rs Implementation Specialist';

-- Digital Marketing Strategist (confidence: 0.85)
-- Reasoning: The Digital Marketing Strategist demonstrates deep expertise in digital engagement strategies, which aligns with the characteristics of an Expert agent. It provides strategic guidance and requires domain knowledge to navigate complex marketing landscapes, making high-level decisions that impact overall digital marketing effectiveness.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Digital Marketing Strategist';

-- Benefit-Risk Assessor (confidence: 0.85)
-- Reasoning: The Benefit-Risk Assessor demonstrates deep expertise in regulatory matters, particularly in assessing the benefits and risks of pharmaceuticals and medical devices. Its capabilities involve complex reasoning and analysis, which align with the characteristics of an expert agent that provides strategic guidance based on extensive domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Benefit-Risk Assessor';

-- In Silico Clinical Trial Expert (confidence: 0.85)
-- Reasoning: The In Silico Clinical Trial Expert demonstrates deep expertise in the clinical domain, particularly in virtual clinical trial modeling and management. Its capabilities in designing clinical protocols and ensuring data quality reflect a high level of specialized knowledge and complex reasoning, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'In Silico Clinical Trial Expert';

-- Safety Labeling Specialist (confidence: 0.85)
-- Reasoning: The Safety Labeling Specialist possesses deep expertise in regulatory matters related to product labeling safety. The capabilities outlined, such as safety signal detection and benefit-risk assessment, require complex reasoning and expert judgment, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Labeling Specialist';

-- Gene Therapy Expert (confidence: 0.90)
-- Reasoning: The Gene Therapy Expert possesses deep expertise in clinical protocols and trial management, which aligns with the characteristics of an Expert tier agent. The capabilities listed indicate a high level of strategic guidance and decision-making that requires extensive domain knowledge in gene therapy.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Gene Therapy Expert';

-- Ethics Committee Liaison (confidence: 0.85)
-- Reasoning: The Ethics Committee Liaison possesses deep expertise in regulatory coordination with IRB and EC, which requires complex reasoning and analysis. Their role involves providing strategic guidance and making decisions that necessitate years of domain knowledge in pharmaceutical submissions.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Ethics Committee Liaison';

-- FDA Regulatory Strategist (confidence: 0.95)
-- Reasoning: The FDA Regulatory Strategist possesses deep expertise in FDA regulations and provides strategic guidance on complex regulatory pathways for digital health products. This role requires extensive domain knowledge and the ability to interpret regulatory documents, making high-level decisions that impact compliance and strategy.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'FDA Regulatory Strategist';

-- Production Scheduler (confidence: 0.85)
-- Reasoning: The Production Scheduler demonstrates deep expertise in manufacturing schedule optimization, which is a complex domain requiring significant knowledge and analysis. It also provides evidence-based medication guidance and performs dosing calculations, indicating a high level of specialized knowledge and strategic judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Production Scheduler';

-- RNA Interference Specialist (confidence: 0.85)
-- Reasoning: The RNA Interference Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for RNAi therapeutic development. The role requires complex reasoning and analysis, as well as strategic guidance in clinical development, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'RNA Interference Specialist';

-- Cancer Vaccine Expert (confidence: 0.90)
-- Reasoning: The Cancer Vaccine Expert possesses deep expertise in therapeutic cancer vaccine development, particularly in clinical protocol design and trial operations management. This role requires complex reasoning and strategic guidance, aligning with the characteristics of a domain expert who makes decisions based on years of specialized knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Cancer Vaccine Expert';

-- Endpoint Committee Coordinator (confidence: 0.85)
-- Reasoning: The Endpoint Committee Coordinator demonstrates deep expertise in clinical trial management and protocol design, which requires years of domain knowledge. Their role involves strategic guidance and oversight of clinical operations, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Endpoint Committee Coordinator';

-- Safety Communication Specialist (confidence: 0.85)
-- Reasoning: The Safety Communication Specialist possesses deep expertise in regulatory matters, particularly in safety signal detection and benefit-risk assessment. This role requires complex reasoning and analysis, as well as strategic guidance based on years of domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Communication Specialist';

-- Organoid Platform Expert (confidence: 0.90)
-- Reasoning: The Organoid Platform Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge in clinical development.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Organoid Platform Expert';

-- 3D Bioprinting Expert (confidence: 0.90)
-- Reasoning: The 3D Bioprinting Expert demonstrates deep expertise in clinical protocols and trial management, which requires complex reasoning and analysis. The agent''s capabilities in designing clinical protocols and ensuring patient safety indicate a high level of domain knowledge and strategic guidance.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = '3D Bioprinting Expert';

-- CRISPR Therapeutic Specialist (confidence: 0.85)
-- Reasoning: The CRISPR Therapeutic Specialist possesses deep expertise in the clinical domain, specifically in CRISPR-based therapies. This role involves complex reasoning and strategic guidance in clinical protocol design and trial management, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'CRISPR Therapeutic Specialist';

-- Drug Interaction Checker (confidence: 0.85)
-- Reasoning: The Drug Interaction Checker demonstrates deep expertise in clinical pharmacotherapy, particularly in assessing drug interactions and providing evidence-based medication guidance. Its capabilities require complex reasoning and analysis, aligning with the characteristics of an expert agent in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Drug Interaction Checker';

-- Neurodegenerative Disease Specialist (confidence: 0.85)
-- Reasoning: The Neurodegenerative Disease Specialist has deep expertise in clinical protocols and trial management specifically related to CNS degeneration therapeutics. This role involves complex reasoning and analysis, as well as strategic guidance in clinical development, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Neurodegenerative Disease Specialist';

-- DNA-Encoded Library Expert (confidence: 0.85)
-- Reasoning: The DNA-Encoded Library Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The agent''s capabilities suggest it provides strategic guidance and makes decisions that necessitate years of domain knowledge, aligning it with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'DNA-Encoded Library Expert';

-- Managed Care Contracting Specialist (confidence: 0.85)
-- Reasoning: The Managed Care Contracting Specialist demonstrates deep expertise in contract negotiation and strategy within the pharmaceutical domain, which aligns with the characteristics of an Expert tier agent. The role requires complex reasoning and analysis, as well as strategic guidance that necessitates years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Managed Care Contracting Specialist';

-- Clinical Pharmacologist (confidence: 0.85)
-- Reasoning: The Clinical Pharmacologist possesses deep expertise in clinical pharmacology and PK/PD modeling, which aligns with the characteristics of an expert. Their responsibilities, such as designing clinical protocols and ensuring patient safety, require complex reasoning and significant domain knowledge, indicating a high level of strategic guidance.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Pharmacologist';

-- Regulatory Submissions Quality Lead (confidence: 0.90)
-- Reasoning: The Regulatory Submissions Quality Lead demonstrates deep expertise in regulatory affairs and compliance, providing strategic guidance and developing submission strategies. This role requires complex reasoning and decision-making based on extensive domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Submissions Quality Lead';

-- Dissolution Testing Expert (confidence: 0.85)
-- Reasoning: The Dissolution Testing Expert possesses deep expertise in regulatory aspects of pharmaceutical development, specifically in dissolution method development and IVIVC assessment. This role requires complex reasoning and analysis, as well as strategic guidance based on years of domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Dissolution Testing Expert';

-- PROTAC Expert (confidence: 0.90)
-- Reasoning: The PROTAC Expert demonstrates deep expertise in clinical trial management and proteolysis targeting chimera design, which requires complex reasoning and analysis. Its capabilities in managing trial operations and ensuring data quality indicate a high level of strategic guidance and decision-making that aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'PROTAC Expert';

-- Clinical Imaging Specialist (confidence: 0.85)
-- Reasoning: The Clinical Imaging Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance related to patient safety and data quality assurance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Imaging Specialist';

-- Global Regulatory Strategist (confidence: 0.90)
-- Reasoning: The Global Regulatory Strategist possesses deep expertise in regulatory strategies and provides strategic guidance that requires expert judgment. The capabilities listed indicate a high level of complexity and decision-making that aligns with the characteristics of an expert in the regulatory domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Global Regulatory Strategist';

-- Publication Planner (confidence: 0.85)
-- Reasoning: The Publication Planner demonstrates deep expertise in the domain of medical affairs and publication planning, engaging key opinion leaders and generating medical evidence. The role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Publication Planner';

-- Scale-Up Specialist (confidence: 0.85)
-- Reasoning: The Scale-Up Specialist demonstrates deep expertise in commercial scale-up planning and execution, which requires complex reasoning and analysis. The agent also provides strategic guidance on medication and safe pharmacotherapy decisions, indicating a high level of domain knowledge and the ability to make informed decisions.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Scale-Up Specialist';

-- Value Dossier Developer (confidence: 0.85)
-- Reasoning: The Value Dossier Developer demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance and complex decision support. Its capabilities require significant domain knowledge and involve complex reasoning, aligning it with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Value Dossier Developer';

-- Combination Product Specialist (confidence: 0.85)
-- Reasoning: The Combination Product Specialist demonstrates deep expertise in clinical protocol design and trial operations management specific to combination products. Their role requires complex reasoning and strategic guidance in a specialized domain, aligning with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Combination Product Specialist';

-- Cleaning Validation Specialist (confidence: 0.85)
-- Reasoning: The Cleaning Validation Specialist demonstrates deep expertise in executing cleaning validation protocols within the pharmaceutical industry, which requires complex reasoning and analysis. Additionally, their role involves providing strategic guidance related to medication and pharmacotherapy, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Cleaning Validation Specialist';

-- Pediatric Clinical Specialist (confidence: 0.85)
-- Reasoning: The Pediatric Clinical Specialist possesses deep expertise in pediatric clinical development, which aligns with the characteristics of an Expert tier agent. Their capabilities in clinical protocol design and trial operations management indicate a high level of strategic guidance and decision-making that requires years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pediatric Clinical Specialist';

-- Regulatory Risk Assessment Specialist (confidence: 0.90)
-- Reasoning: The Regulatory Risk Assessment Specialist demonstrates deep expertise in regulatory matters, providing strategic guidance and developing submission strategies. Their role requires complex reasoning and extensive domain knowledge, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Risk Assessment Specialist';

-- Translational Medicine Specialist (confidence: 0.85)
-- Reasoning: The Translational Medicine Specialist demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance and complex decision support. The role requires significant domain knowledge and the ability to analyze drug interactions and dosing, aligning with the characteristics of an Expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Translational Medicine Specialist';

-- Adaptive Trial Designer (confidence: 0.85)
-- Reasoning: The Adaptive Trial Designer possesses deep expertise in clinical trial design and management, which aligns with the characteristics of an Expert tier agent. Its capabilities in clinical protocol design and patient safety maintenance indicate a high level of specialized knowledge and strategic guidance in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Adaptive Trial Designer';

-- Risk-Benefit Assessment Expert (confidence: 0.90)
-- Reasoning: The Risk-Benefit Assessment Expert demonstrates deep expertise in regulatory affairs, specifically in integrated benefit-risk frameworks. This role involves complex reasoning, strategic guidance, and decision-making that requires extensive domain knowledge, aligning it closely with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Risk-Benefit Assessment Expert';

-- Basket/Umbrella Trial Specialist (confidence: 0.85)
-- Reasoning: The Basket/Umbrella Trial Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. Their role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning well with the characteristics of an EXPERT tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Basket/Umbrella Trial Specialist';

-- Regulatory Deficiency Response Lead (confidence: 0.90)
-- Reasoning: The Regulatory Deficiency Response Lead demonstrates deep expertise in regulatory matters, particularly in interpreting FDA regulations and developing submission strategies. The role requires complex reasoning and strategic guidance, aligning with the characteristics of an Expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Regulatory Deficiency Response Lead';

-- Adverse Event Reporter (confidence: 0.85)
-- Reasoning: The Adverse Event Reporter demonstrates deep expertise in regulatory documentation and reporting, which requires complex reasoning and analysis. Its capabilities in providing medication guidance and pharmacotherapy decision support further emphasize its role as a domain expert in the regulatory field.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Adverse Event Reporter';

-- Agency Meeting Strategist (confidence: 0.90)
-- Reasoning: The Agency Meeting Strategist provides strategic regulatory guidance and interprets FDA regulations, indicating a deep expertise in the regulatory domain. The agent''s capabilities involve complex reasoning and analysis, which aligns with the characteristics of an expert who makes decisions requiring years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Agency Meeting Strategist';

-- Medication Therapy Advisor (confidence: 0.85)
-- Reasoning: The Medication Therapy Advisor demonstrates deep expertise in clinical medication management, providing evidence-based guidance, dosing calculations, and drug interaction assessments. Its capabilities require complex reasoning and analysis, aligning with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medication Therapy Advisor';

-- Advanced Therapy Regulatory Expert (confidence: 0.95)
-- Reasoning: The Advanced Therapy Regulatory Expert possesses deep expertise in ATMP and cell/gene therapy regulations, providing strategic guidance and interpreting complex FDA regulations. This role requires significant domain knowledge and the ability to make informed decisions regarding regulatory submissions, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Advanced Therapy Regulatory Expert';

-- Quality by Design Specialist (confidence: 0.85)
-- Reasoning: The Quality by Design Specialist demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance and supporting complex decision-making regarding drug interactions and dosing. This aligns with the characteristics of an Expert agent, as it requires specialized knowledge and the ability to perform complex reasoning within the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Quality by Design Specialist';

-- Expedited Program Expert (confidence: 0.90)
-- Reasoning: The Expedited Program Expert demonstrates deep expertise in regulatory affairs, specifically in fast track and priority review programs. The agent provides strategic guidance and develops submission strategies, which require complex reasoning and years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Expedited Program Expert';

-- Territory Design Specialist (confidence: 0.85)
-- Reasoning: The Territory Design Specialist demonstrates deep expertise in sales territory optimization, which requires complex reasoning and analysis. The capabilities outlined, such as evidence-based medication guidance and drug interaction assessment, indicate a high level of specialized knowledge, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Territory Design Specialist';

-- Post-Marketing Commitment Coordinator (confidence: 0.85)
-- Reasoning: The Post-Marketing Commitment Coordinator exhibits deep expertise in regulatory affairs, particularly in post-marketing commitments and requirements. The role involves strategic regulatory guidance and complex reasoning to ensure compliance, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Post-Marketing Commitment Coordinator';

-- Organ-on-Chip Specialist (confidence: 0.85)
-- Reasoning: The Organ-on-Chip Specialist demonstrates deep expertise in clinical protocols and trial operations management, which requires complex reasoning and analysis. The role involves ensuring patient safety and data quality, indicating a high level of strategic guidance and expert judgment in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Organ-on-Chip Specialist';

-- Quantum Chemistry Expert (confidence: 0.85)
-- Reasoning: The Quantum Chemistry Expert demonstrates deep expertise in computational chemistry and pharmacotherapy decision support, which requires complex reasoning and analysis. Its capabilities include evidence-based medication guidance and drug interaction assessment, indicating a high level of specialized knowledge and strategic judgment in the domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Quantum Chemistry Expert';

-- Toxicology Study Designer (confidence: 0.85)
-- Reasoning: The Toxicology Study Designer possesses deep expertise in clinical safety study design, which involves complex reasoning and analysis related to pharmacotherapy. The capabilities listed, such as evidence-based medication guidance and drug interaction assessment, indicate a high level of domain knowledge and strategic decision-making, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Toxicology Study Designer';

-- Orphan Drug Designator (confidence: 0.90)
-- Reasoning: The Orphan Drug Designator provides strategic regulatory guidance and interprets FDA regulations, indicating a high level of expertise in the regulatory domain. Its capabilities involve complex reasoning and the development of submission strategies, which require deep knowledge and experience in regulatory affairs.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Orphan Drug Designator';

-- Supplier Relationship Manager (confidence: 0.85)
-- Reasoning: The Supplier Relationship Manager demonstrates deep expertise in clinical decision-making related to medication guidance and pharmacotherapy. The capabilities listed indicate a high level of strategic guidance and complex reasoning, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Supplier Relationship Manager';

-- Medical Affairs Commercial Liaison (confidence: 0.85)
-- Reasoning: The Medical Affairs Commercial Liaison demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based guidance and assessing drug interactions. This role requires complex reasoning and expert judgment, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Medical Affairs Commercial Liaison';

-- Biomarker Validation Expert (confidence: 0.85)
-- Reasoning: The Biomarker Validation Expert demonstrates deep expertise in the clinical domain, specifically in biomarker qualification and validation. This role requires complex reasoning and analysis, as well as strategic guidance in medication management, which aligns with the characteristics of an EXPERT tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Biomarker Validation Expert';

-- Immunotoxicology Expert (confidence: 0.85)
-- Reasoning: The Immunotoxicology Expert possesses deep expertise in immune safety assessments and provides complex reasoning and analysis related to pharmacotherapy decisions. This role requires extensive domain knowledge and strategic guidance, aligning it with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Immunotoxicology Expert';

-- Continuous Manufacturing Expert (confidence: 0.85)
-- Reasoning: The Continuous Manufacturing Expert possesses deep expertise in the specific domain of continuous processing implementation within pharmaceutical manufacturing. This role requires complex reasoning and analysis, as well as strategic guidance that necessitates years of domain knowledge, aligning it with the characteristics of an EXPERT tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Continuous Manufacturing Expert';

-- Reproductive Toxicology Specialist (confidence: 0.85)
-- Reasoning: The Reproductive Toxicology Specialist possesses deep expertise in reproductive and developmental toxicology, providing complex reasoning and analysis related to medication guidance and drug interactions. This role requires significant domain knowledge and strategic judgment, aligning it with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Reproductive Toxicology Specialist';

-- Payor Account Strategist (confidence: 0.85)
-- Reasoning: The Payor Account Strategist demonstrates deep expertise in payer relationship management and market access, which aligns with the characteristics of an expert agent. The role involves complex reasoning and strategic guidance in managing payer relationships and ensuring effective pharmacotherapy decisions.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Payor Account Strategist';

-- Clinical Trial Transparency Officer (confidence: 0.85)
-- Reasoning: The Clinical Trial Transparency Officer possesses deep expertise in regulatory compliance related to clinical trials, which aligns with the characteristics of an expert. Their responsibilities involve complex reasoning and strategic guidance in trial registration and data disclosure, requiring significant domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Clinical Trial Transparency Officer';

-- Product Launch Strategist (confidence: 0.85)
-- Reasoning: The Product Launch Strategist demonstrates deep expertise in commercial launch planning and execution within the pharmaceutical domain, which requires complex reasoning and strategic guidance. The role involves high-level decision-making and specialized knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Product Launch Strategist';

-- Key Account Manager Support (confidence: 0.85)
-- Reasoning: The Key Account Manager Support agent demonstrates deep expertise in clinical account management, particularly in medication guidance and pharmacotherapy. Its capabilities require complex reasoning and expert judgment, aligning with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Key Account Manager Support';

-- Import/Export Compliance Specialist (confidence: 0.85)
-- Reasoning: The Import/Export Compliance Specialist has deep expertise in international trade compliance, which is a complex regulatory domain. The role requires significant knowledge and the ability to provide strategic guidance on compliance matters, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Import/Export Compliance Specialist';

-- CAR-T Cell Therapy Specialist (confidence: 0.85)
-- Reasoning: The CAR-T Cell Therapy Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and specialized knowledge in the clinical domain. Their role involves strategic guidance and decision-making that aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'CAR-T Cell Therapy Specialist';

-- Serialization & Track-Trace Expert (confidence: 0.85)
-- Reasoning: The Serialization & Track-Trace Expert possesses deep expertise in regulatory compliance specific to serialization in pharmaceuticals. This role involves complex reasoning and analysis, particularly in medication guidance and drug interaction assessment, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Serialization & Track-Trace Expert';

-- Base/Prime Editing Expert (confidence: 0.85)
-- Reasoning: The Base/Prime Editing Expert demonstrates deep expertise in precision genome editing and clinical trial management, which aligns with the characteristics of an Expert tier agent. Their capabilities in clinical protocol design, trial operations management, and data quality assurance require significant domain knowledge and complex reasoning.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Base/Prime Editing Expert';

-- Natural Language Processing Expert (confidence: 0.85)
-- Reasoning: The Natural Language Processing Expert demonstrates deep expertise in the clinical domain, specifically in medical text analysis. Its capabilities in evidence-based medication guidance, dosing calculations, and drug interaction assessments indicate a high level of complex reasoning and analysis, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Natural Language Processing Expert';

-- Batch Record Reviewer (confidence: 0.85)
-- Reasoning: The Batch Record Reviewer possesses deep expertise in regulatory processes, particularly in the review and release of pharmaceutical batch records. This role requires complex reasoning, analysis, and strategic guidance, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Batch Record Reviewer';

-- Pharmacogenomics Expert (confidence: 0.90)
-- Reasoning: The Pharmacogenomics Expert possesses deep expertise in clinical protocol design and PGx-guided therapy optimization, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pharmacogenomics Expert';

-- Targeted Protein Degradation Expert (confidence: 0.90)
-- Reasoning: The Targeted Protein Degradation Expert possesses deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. Their role involves strategic guidance and decision-making that necessitates years of domain knowledge in clinical development.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Targeted Protein Degradation Expert';

-- Compliance Officer (confidence: 0.85)
-- Reasoning: The Compliance Officer has deep expertise in regulatory oversight, which involves complex reasoning and analysis related to medication guidance and pharmacotherapy. The role requires strategic judgment and decision-making based on years of domain knowledge, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Compliance Officer';

-- Personalized Medicine Specialist (confidence: 0.85)
-- Reasoning: The Personalized Medicine Specialist demonstrates deep expertise in precision oncology and biomarkers, which aligns with the characteristics of an Expert agent. Their responsibilities include designing clinical protocols and managing trial operations, indicating a high level of strategic guidance and decision-making that requires years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Personalized Medicine Specialist';

-- Anti-Corruption Specialist (confidence: 0.85)
-- Reasoning: The Anti-Corruption Specialist demonstrates deep expertise in regulatory compliance, specifically in FCPA and anti-bribery laws within the pharmaceutical industry. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Anti-Corruption Specialist';

-- Structure-Based Design Expert (confidence: 0.85)
-- Reasoning: The Structure-Based Design Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The agent''s capabilities suggest a high level of strategic guidance and decision-making that is characteristic of domain experts.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Structure-Based Design Expert';

-- Global Trade Compliance Specialist (confidence: 0.85)
-- Reasoning: The Global Trade Compliance Specialist demonstrates deep expertise in international trade regulations, particularly within the pharmaceutical industry. The agent''s capabilities involve complex reasoning and analysis related to compliance and medication guidance, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Global Trade Compliance Specialist';

-- Metabolic Reprogramming Specialist (confidence: 0.85)
-- Reasoning: The Metabolic Reprogramming Specialist demonstrates deep expertise in clinical protocols related to metabolic therapeutic approaches and manages complex trial operations, ensuring data quality and patient safety. This role requires significant domain knowledge and strategic guidance, aligning with the characteristics of an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Metabolic Reprogramming Specialist';

-- Privacy Officer (confidence: 0.85)
-- Reasoning: The Privacy Officer exhibits deep expertise in regulatory compliance, particularly in GDPR, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Privacy Officer';

-- Mitochondrial Medicine Expert (confidence: 0.95)
-- Reasoning: The Mitochondrial Medicine Expert possesses deep expertise in clinical protocols and trial management specific to mitochondrial therapeutics, which aligns with the characteristics of an Expert tier agent. The capabilities listed indicate complex reasoning and strategic guidance in a specialized domain, making it suitable for this classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Mitochondrial Medicine Expert';

-- Immunometabolism Expert (confidence: 0.90)
-- Reasoning: The Immunometabolism Expert demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The agent''s capabilities align with strategic guidance and decision-making based on years of domain knowledge, fitting the criteria for an Expert tier classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Immunometabolism Expert';

-- Macrocycle Therapeutics Specialist (confidence: 0.85)
-- Reasoning: The Macrocycle Therapeutics Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which are critical for macrocyclic drug development. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Macrocycle Therapeutics Specialist';

-- Spatial Transcriptomics Specialist (confidence: 0.85)
-- Reasoning: The Spatial Transcriptomics Specialist possesses deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance, dosing calculations, and drug interaction assessments. This role requires complex reasoning and analysis, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Spatial Transcriptomics Specialist';

-- Formulary Advisor (confidence: 0.85)
-- Reasoning: The Formulary Advisor provides complex clinical guidance and decision support, indicating a deep expertise in the clinical domain. Its capabilities, such as evidence-based medication guidance and drug interaction assessment, require significant domain knowledge and strategic judgment, aligning it with the characteristics of an Expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Formulary Advisor';

-- Oncology Medication Specialist (confidence: 0.85)
-- Reasoning: The Oncology Medication Specialist demonstrates deep expertise in cancer pharmacotherapy and supportive care, providing evidence-based guidance and complex decision-making regarding medication dosing and interactions. This aligns with the characteristics of an Expert agent, as it requires years of specialized knowledge and complex reasoning in a clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Oncology Medication Specialist';

-- IND Application Specialist (confidence: 0.85)
-- Reasoning: The IND Application Specialist demonstrates deep expertise in regulatory affairs, specifically in the preparation and management of IND applications. Their role involves complex reasoning and strategic guidance, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'IND Application Specialist';

-- Informed Consent Developer (confidence: 0.85)
-- Reasoning: The Informed Consent Developer demonstrates deep expertise in clinical trial processes, particularly in designing protocols and optimizing informed consent forms. This role requires complex reasoning and strategic guidance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Informed Consent Developer';

-- Monitoring Plan Developer (confidence: 0.85)
-- Reasoning: The Monitoring Plan Developer demonstrates deep expertise in clinical protocol design and risk-based monitoring strategies, which require complex reasoning and extensive domain knowledge. This role provides strategic guidance in clinical trial operations, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Monitoring Plan Developer';

-- Deviation Investigator (confidence: 0.85)
-- Reasoning: The Deviation Investigator demonstrates deep expertise in quality standards and compliance, particularly in the context of GMP. Its capabilities in deviation investigation, CAPA management, and root cause analysis indicate a high level of complex reasoning and analysis, which aligns with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Deviation Investigator';

-- Change Control Manager (confidence: 0.85)
-- Reasoning: The Change Control Manager demonstrates deep expertise in managing compliance and quality standards within the technical change management category. Its responsibilities, such as investigating deviations and managing the CAPA system, require complex reasoning and extensive domain knowledge, aligning it with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Change Control Manager';

-- Risk Management Plan Developer (confidence: 0.85)
-- Reasoning: The Risk Management Plan Developer demonstrates deep expertise in regulatory matters, particularly in pharmacovigilance and safety signal detection. The agent''s capabilities involve complex reasoning and analysis, particularly in benefit-risk assessment and regulatory compliance, which require years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Risk Management Plan Developer';

-- Safety Signal Evaluator (confidence: 0.85)
-- Reasoning: The Safety Signal Evaluator demonstrates deep expertise in pharmacovigilance and safety signal evaluation, which requires complex reasoning and analysis. Its capabilities in benefit-risk assessment and proactive patient safety monitoring indicate a high level of domain knowledge and strategic guidance.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Signal Evaluator';

-- Advisory Board Organizer (confidence: 0.85)
-- Reasoning: The Advisory Board Organizer demonstrates deep expertise in the medical field, particularly in advisory board planning and execution. The capabilities listed, such as engaging key opinion leaders and generating medical evidence, indicate a level of strategic guidance and decision-making that aligns with the characteristics of an expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Advisory Board Organizer';

-- Health Economics Modeler (confidence: 0.85)
-- Reasoning: The Health Economics Modeler demonstrates deep expertise in economic modeling and value demonstration, which requires complex reasoning and analysis. Its capabilities in evidence-based medication guidance and pharmacotherapy decision support indicate a high level of domain knowledge, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Health Economics Modeler';

-- DSMB Liaison (confidence: 0.90)
-- Reasoning: The DSMB Liaison possesses deep expertise in clinical trial management, particularly in areas such as clinical protocol design and patient safety maintenance. The role requires complex reasoning and strategic guidance, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'DSMB Liaison';

-- Geriatric Clinical Specialist (confidence: 0.90)
-- Reasoning: The Geriatric Clinical Specialist demonstrates deep expertise in geriatric clinical trial design, which requires complex reasoning and analysis. Their responsibilities include managing trial operations and ensuring high standards of data quality and patient safety, indicating a level of strategic guidance that aligns with the EXPERT tier.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Geriatric Clinical Specialist';

-- Rare Disease Clinical Expert (confidence: 0.85)
-- Reasoning: The Rare Disease Clinical Expert possesses deep expertise in clinical trial design and management specifically for rare diseases. This role involves complex reasoning and strategic guidance, making decisions that require extensive domain knowledge, which aligns with the criteria for Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Rare Disease Clinical Expert';

-- Cell Therapy Clinical Specialist (confidence: 0.85)
-- Reasoning: The Cell Therapy Clinical Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires extensive domain knowledge and complex reasoning. Their role involves strategic guidance and decision-making that aligns with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Cell Therapy Clinical Specialist';

-- Post-Approval Change Manager (confidence: 0.90)
-- Reasoning: The Post-Approval Change Manager demonstrates deep expertise in regulatory guidance and compliance, particularly in the pharmaceutical and medical device sectors. The role involves complex reasoning and strategic decision-making, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Post-Approval Change Manager';

-- Biosimilar Regulatory Specialist (confidence: 0.90)
-- Reasoning: The Biosimilar Regulatory Specialist possesses deep expertise in regulatory processes specific to biosimilar development and approval. The role involves complex reasoning and strategic guidance, which aligns with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Biosimilar Regulatory Specialist';

-- International Regulatory Harmonization Expert (confidence: 0.90)
-- Reasoning: The International Regulatory Harmonization Expert demonstrates deep expertise in regulatory affairs and provides strategic guidance that requires extensive domain knowledge. The capabilities outlined, such as interpreting FDA regulations and developing submission strategies, indicate a high level of complexity and expert judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'International Regulatory Harmonization Expert';

-- Pharmaceutical Technology Specialist (confidence: 0.85)
-- Reasoning: The Pharmaceutical Technology Specialist demonstrates deep expertise in clinical pharmacotherapy, providing complex reasoning and analysis related to medication guidance and drug interactions. This role requires years of domain knowledge to support strategic decisions in medication management.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Pharmaceutical Technology Specialist';

-- Container Closure Specialist (confidence: 0.85)
-- Reasoning: The Container Closure Specialist demonstrates deep expertise in packaging system development and validation, which requires complex reasoning and analysis. Their role involves strategic guidance in ensuring compliance with regulations and safety standards, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Container Closure Specialist';

-- Safety Pharmacology Expert (confidence: 0.85)
-- Reasoning: The Safety Pharmacology Expert demonstrates deep expertise in the clinical domain, particularly in safety pharmacology assessments. Its capabilities involve complex reasoning and analysis related to medication guidance, dosing calculations, and drug interactions, which require years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Safety Pharmacology Expert';

-- In Vivo Model Specialist (confidence: 0.85)
-- Reasoning: The In Vivo Model Specialist demonstrates deep expertise in animal model selection and design, which requires complex reasoning and analysis within the clinical domain. Their role involves providing strategic guidance on pharmacotherapy decisions and ensuring safety protocol adherence, indicating a high level of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'In Vivo Model Specialist';

-- Competitive Intelligence Specialist (confidence: 0.85)
-- Reasoning: The Competitive Intelligence Specialist demonstrates deep expertise in competitor analysis within the pharmaceutical industry, which requires complex reasoning and analysis. The capabilities listed, such as medication guidance and drug interaction assessment, indicate a high level of specialized knowledge and strategic judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Competitive Intelligence Specialist';

-- Patient Journey Mapper (confidence: 0.85)
-- Reasoning: The Patient Journey Mapper demonstrates deep expertise in clinical decision-making, particularly in medication guidance and pharmacotherapy. Its capabilities involve complex reasoning and analysis, which align with the characteristics of an expert agent that provides strategic guidance in a specialized domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Patient Journey Mapper';

-- Patient Advocacy Relations (confidence: 0.85)
-- Reasoning: The Patient Advocacy Relations agent demonstrates deep expertise in clinical engagement and medication guidance, which requires complex reasoning and analysis. Its capabilities, such as evidence-based medication guidance and drug interaction assessment, indicate a level of strategic guidance and decision-making that aligns with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Patient Advocacy Relations';

-- Cold Chain Specialist (confidence: 0.85)
-- Reasoning: The Cold Chain Specialist possesses deep expertise in temperature-controlled logistics, particularly for pharmaceuticals, which requires complex reasoning and analysis. Their role in providing medication guidance and pharmacotherapy decision support indicates a high level of strategic judgment and specialized knowledge in the domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Cold Chain Specialist';

-- Procurement Strategist (confidence: 0.85)
-- Reasoning: The Procurement Strategist demonstrates deep expertise in strategic sourcing and procurement, which requires complex reasoning and analysis. The role involves developing and implementing procurement strategies that align with company objectives, indicating a high level of strategic guidance and expert judgment.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Procurement Strategist';

-- Rare Disease Specialist (confidence: 0.85)
-- Reasoning: The Rare Disease Specialist possesses deep expertise in ultra-rare diseases and orphan drugs, which aligns with the criteria for an Expert classification. Their capabilities in clinical protocol design, trial operations management, and patient safety maintenance indicate a high level of strategic guidance and decision-making that requires years of domain knowledge.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Rare Disease Specialist';

-- Bispecific Antibody Expert (confidence: 0.90)
-- Reasoning: The Bispecific Antibody Expert possesses deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance in clinical development, aligning with the characteristics of an expert-level agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Bispecific Antibody Expert';

-- mRNA Vaccine Expert (confidence: 0.90)
-- Reasoning: The mRNA Vaccine Expert possesses deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. Their role involves making strategic decisions related to patient safety and data quality assurance, aligning with the characteristics of a domain expert.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'mRNA Vaccine Expert';

-- Tissue Engineering Specialist (confidence: 0.85)
-- Reasoning: The Tissue Engineering Specialist demonstrates deep expertise in the clinical domain, particularly in regenerative medicine. Their responsibilities include designing clinical protocols and managing trial operations, which require complex reasoning and strategic guidance, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Tissue Engineering Specialist';

-- Nanomedicine Expert (confidence: 0.90)
-- Reasoning: The Nanomedicine Expert possesses deep expertise in the clinical domain, specifically related to nanoparticle drug delivery. Their responsibilities involve complex reasoning and strategic guidance in clinical protocol design and trial operations management, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Nanomedicine Expert';

-- Microbiome Therapeutics Expert (confidence: 0.85)
-- Reasoning: The Microbiome Therapeutics Expert possesses deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The agent''s capabilities suggest it provides strategic guidance and makes decisions that necessitate years of domain knowledge in clinical development.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Microbiome Therapeutics Expert';

-- Exosome Therapy Specialist (confidence: 0.85)
-- Reasoning: The Exosome Therapy Specialist demonstrates deep expertise in the clinical development of exosome-based drug delivery, which involves complex reasoning and analysis. Their role requires specialized knowledge in clinical trial management, patient safety, and GCP compliance, aligning with the characteristics of an expert in the clinical domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Exosome Therapy Specialist';

-- Immune Checkpoint Inhibitor Specialist (confidence: 0.85)
-- Reasoning: The Immune Checkpoint Inhibitor Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance in clinical development, aligning with the characteristics of an expert in the domain.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Immune Checkpoint Inhibitor Specialist';

-- Liquid Biopsy Specialist (confidence: 0.85)
-- Reasoning: The Liquid Biopsy Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and extensive domain knowledge. The role involves strategic guidance in clinical development, particularly in ctDNA and CTC analysis, aligning with the characteristics of an expert agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Liquid Biopsy Specialist';

-- Artificial Organ Developer (confidence: 0.85)
-- Reasoning: The Artificial Organ Developer demonstrates deep expertise in the clinical domain, particularly in bioartificial organ engineering. The key capabilities outlined involve complex reasoning and strategic guidance in clinical protocol design and trial management, which aligns with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Artificial Organ Developer';

-- Epigenetic Therapy Expert (confidence: 0.85)
-- Reasoning: The Epigenetic Therapy Expert possesses deep expertise in clinical protocols related to epigenetic modulation strategies, which requires complex reasoning and analysis. This agent''s capabilities in trial operations management and patient safety maintenance indicate a high level of strategic guidance and decision-making that aligns with Tier 2 classification.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Epigenetic Therapy Expert';

-- Blood-Brain Barrier Specialist (confidence: 0.85)
-- Reasoning: The Blood-Brain Barrier Specialist demonstrates deep expertise in clinical protocols related to BBB penetration technologies, which requires complex reasoning and analysis. The role involves strategic guidance in clinical trial design and operations, indicating a high level of domain knowledge and decision-making capability.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Blood-Brain Barrier Specialist';

-- Fragment-Based Drug Design Specialist (confidence: 0.90)
-- Reasoning: The Fragment-Based Drug Design Specialist demonstrates deep expertise in clinical protocol design and trial operations management, which requires complex reasoning and analysis. The role involves strategic guidance and decision-making that necessitates years of domain knowledge in clinical development.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Fragment-Based Drug Design Specialist';

-- Single-Cell Analysis Expert (confidence: 0.85)
-- Reasoning: The Single-Cell Analysis Expert demonstrates deep expertise in clinical pharmacotherapy, providing evidence-based medication guidance and complex decision support. Its capabilities require significant domain knowledge and involve strategic reasoning, aligning with the characteristics of an Expert tier agent.
UPDATE agents SET agent_level = 'EXPERT' WHERE name = 'Single-Cell Analysis Expert';


-- ============================================================================
-- SPECIALIST AGENTS (75 agents)
-- ============================================================================

-- HEOR Analyst (confidence: 0.85)
-- Reasoning: The HEOR Analyst has a focused expertise in health economics and outcomes research, which aligns with the characteristics of a Specialist. Their role involves specific analytical tasks such as economic modeling and data analysis, indicating a narrow focus within the domain rather than high-level strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'HEOR Analyst';

-- Contract Analyst (confidence: 0.85)
-- Reasoning: The Contract Analyst has a focused expertise in contract management and compliance monitoring, which aligns with the characteristics of a Specialist. Their role involves specific analytical tasks related to contract performance and compliance, indicating a narrow focus rather than a broad strategic or orchestration role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Contract Analyst';

-- Pricing Analyst (confidence: 0.85)
-- Reasoning: The Pricing Analyst has a focused expertise in pricing strategies, competitive analysis, and elasticity modeling, which aligns with the characteristics of a Specialist. While the role involves analytical tasks, it does not encompass the broader strategic decision-making or orchestration required for higher tiers.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Pricing Analyst';

-- Gross-to-Net Analyst (confidence: 0.85)
-- Reasoning: The Gross-to-Net Analyst has a focused expertise in managing revenue deductions and analyzing discount trends, which aligns with the characteristics of a specialist. While they possess specialized knowledge in their domain, their role does not involve high-level strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Gross-to-Net Analyst';

-- Patient Access Coordinator (confidence: 0.85)
-- Reasoning: The Patient Access Coordinator has a focused expertise in patient navigation and therapy initiation, which aligns with the characteristics of a Specialist. While they provide valuable support and guidance, their role does not involve high-level strategic decision-making or coordination of multiple agents, which would be indicative of higher tiers.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Patient Access Coordinator';

-- Payer Marketing Manager (confidence: 0.85)
-- Reasoning: The Payer Marketing Manager demonstrates focused expertise in creating targeted marketing materials and account support tools specifically for payer engagement. This role involves specialized knowledge within the market access domain, but does not encompass broader strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Payer Marketing Manager';

-- Market Access Data Analyst (confidence: 0.85)
-- Reasoning: The Market Access Data Analyst has a focused expertise in market access data analysis, report generation, and data quality maintenance. This role involves handling well-defined tasks within the market access domain, which aligns with the characteristics of a specialist.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Market Access Data Analyst';

-- Field Medical Trainer (confidence: 0.85)
-- Reasoning: The Field Medical Trainer has a focused expertise in training and onboarding Medical Science Liaisons (MSLs), which aligns with the characteristics of a Specialist. While they possess specialized knowledge in training program design and competency assessment, their role does not involve high-level strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Field Medical Trainer';

-- Medical Librarian (confidence: 0.85)
-- Reasoning: The Medical Librarian operates within a specific domain of medical literature and database management, providing focused support for research tasks. While the agent possesses specialized knowledge in managing medical literature and resources, it does not coordinate multiple agents or make high-level strategic decisions, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Librarian';

-- Medical Writer - Scientific (confidence: 0.85)
-- Reasoning: The Medical Writer - Scientific possesses a focused expertise in creating scientific manuscripts, abstracts, and peer-reviewed publications, which aligns with the characteristics of a specialist. While the role requires specialized knowledge in medical writing, it does not involve high-level strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Writer - Scientific';

-- Congress & Events Manager (confidence: 0.85)
-- Reasoning: The Congress & Events Manager has a focused expertise in managing medical events, which aligns with the characteristics of a Specialist. This role involves handling specific tasks related to event logistics and execution, but does not engage in high-level strategic decision-making or coordination of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Congress & Events Manager';

-- Medical Review Committee Coordinator (confidence: 0.85)
-- Reasoning: The Medical Review Committee Coordinator focuses on managing specific operational tasks related to medical review processes and committee coordination. While they possess specialized knowledge in this area, their role does not involve high-level strategic decisions or coordination of multiple agents, which aligns with the characteristics of a Specialist.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Review Committee Coordinator';

-- Clinical Data Analyst Agent (confidence: 0.90)
-- Reasoning: The Clinical Data Analyst Agent has a focused expertise in analyzing clinical trial data, identifying trends, and generating insights, which aligns with the characteristics of a Specialist. Its capabilities are well-defined within a specific sub-domain of clinical data analysis, indicating a narrow focus rather than broader strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Clinical Data Analyst Agent';

-- Medical Literature Researcher (confidence: 0.85)
-- Reasoning: The Medical Literature Researcher operates within a focused domain of medical literature retrieval and synthesis, demonstrating specialized knowledge in searching and analyzing medical databases. While it handles complex tasks related to literature retrieval and synthesis, it does not coordinate multiple agents or make high-level strategic decisions, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Literature Researcher';

-- Document Generator (confidence: 0.85)
-- Reasoning: The Document Generator has a focused expertise in generating regulatory documents and clinical study reports, which aligns with the characteristics of a Specialist. It handles well-defined tasks within the regulatory domain but does not engage in high-level strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Document Generator';

-- formulation_development_scientist (confidence: 0.85)
-- Reasoning: The formulation_development_scientist has a focused expertise in drug product formulation development, which aligns with the characteristics of a Specialist. The key capabilities listed indicate a narrow focus on specific tasks within the technical CMC domain, rather than broader strategic decision-making or orchestration.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'formulation_development_scientist';

-- Dosing Calculator (confidence: 0.85)
-- Reasoning: The Dosing Calculator has a focused expertise in pharmacokinetic-based dose calculations and drug interaction assessments, which aligns with the characteristics of a Specialist. It operates within a well-defined sub-domain of clinical pharmacotherapy, providing specific guidance on medication usage and adjustments.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Dosing Calculator';

-- Promotional Material Developer (confidence: 0.85)
-- Reasoning: The Promotional Material Developer has a focused expertise in creating marketing collateral related to clinical medication guidance, dosing calculations, and drug interactions. This role requires specialized knowledge within a narrow domain, making it suitable for Tier 3 classification as a specialist.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Promotional Material Developer';

-- Immunosuppression Specialist (confidence: 0.85)
-- Reasoning: The Immunosuppression Specialist focuses on a narrow area of expertise related to immunosuppressive therapy for transplant patients. It provides specific capabilities such as medication guidance and dosing calculations, which indicate a well-defined sub-domain task rather than a broader strategic role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Immunosuppression Specialist';

-- Pain Management Specialist (confidence: 0.85)
-- Reasoning: The Pain Management Specialist has a focused expertise in pain therapy optimization and opioid stewardship, which aligns with the characteristics of a Specialist tier. It performs specific tasks such as medication guidance, dosing calculation, and drug interaction assessment, indicating a narrow focus within the clinical domain.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Pain Management Specialist';

-- Document Control Specialist (confidence: 0.85)
-- Reasoning: The Document Control Specialist has a focused expertise in document lifecycle management, ensuring GMP compliance and managing CAPA systems. This role requires specialized knowledge in quality standards but operates within a well-defined scope rather than making high-level strategic decisions.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Document Control Specialist';

-- Safety Reporting Coordinator (confidence: 0.85)
-- Reasoning: The Safety Reporting Coordinator has a focused expertise in clinical safety data management and reporting, which aligns with the characteristics of a specialist. The role involves specific tasks related to clinical protocols and patient safety, indicating a narrow focus within the clinical domain.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Safety Reporting Coordinator';

-- Post-Marketing Surveillance Coordinator (confidence: 0.85)
-- Reasoning: The Post-Marketing Surveillance Coordinator has a focused expertise in post-market safety monitoring, which aligns with the characteristics of a specialist. While the role involves important tasks such as safety signal detection and report preparation, it does not encompass the broader strategic decision-making or orchestration seen in higher tiers.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Post-Marketing Surveillance Coordinator';

-- Aggregate Report Coordinator (confidence: 0.85)
-- Reasoning: The Aggregate Report Coordinator has a focused expertise in safety reporting coordination within the regulatory domain. It handles specific tasks such as safety signal detection and report preparation, indicating a narrow but specialized role rather than a broad strategic or orchestration function.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Aggregate Report Coordinator';

-- Medical Science Liaison Coordinator (confidence: 0.85)
-- Reasoning: The Medical Science Liaison Coordinator has a focused role in coordinating MSL activities and providing scientific support, which aligns with a specialist''s narrow expertise within the clinical domain. The use of the term ''coordinator'' indicates a specific area of responsibility rather than a broader strategic or orchestrational role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Science Liaison Coordinator';

-- Reimbursement Analyst (confidence: 0.85)
-- Reasoning: The Reimbursement Analyst has a focused expertise in analyzing the reimbursement landscape and providing evidence-based guidance, which aligns with the characteristics of a specialist. The key capabilities indicate a narrow focus on specific tasks within the market access domain, rather than broader strategic decision-making or orchestration.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Reimbursement Analyst';

-- Market Research Analyst (confidence: 0.85)
-- Reasoning: The Market Research Analyst has a focused expertise in market intelligence and sizing within the pharmaceutical domain. Their capabilities involve specific analytical tasks such as market sizing and medication safety assessments, which align with the characteristics of a specialist role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Market Research Analyst';

-- Clinical Operations Coordinator (confidence: 0.85)
-- Reasoning: The Clinical Operations Coordinator has a focused expertise in clinical trial operations and management, which aligns with the characteristics of a Specialist. While they manage trial operations and ensure data quality, their role is more about executing specific tasks within the clinical domain rather than making high-level strategic decisions or coordinating multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Clinical Operations Coordinator';

-- Genotoxicity Specialist (confidence: 0.85)
-- Reasoning: The Genotoxicity Specialist has a focused expertise in genetic toxicology, which aligns with the characteristics of a Specialist tier. It handles specific tasks related to evaluating the genotoxic potential of pharmaceutical compounds and provides evidence-based medication guidance, indicating a narrow but important scope of knowledge.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Genotoxicity Specialist';

-- Quality Metrics Analyst (confidence: 0.85)
-- Reasoning: The Quality Metrics Analyst focuses on specific tasks related to quality assurance, such as KPI tracking and deviation investigation. While they possess specialized knowledge in quality metrics and compliance, their role does not involve high-level strategic decision-making or coordination of multiple agents, which aligns with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Quality Metrics Analyst';

-- Materials Management Coordinator (confidence: 0.85)
-- Reasoning: The Materials Management Coordinator has a focused expertise in raw material planning and tracking within the pharmaceutical domain. While it possesses specialized knowledge in areas such as drug interaction assessment and dosing calculation, it does not coordinate multiple agents or make high-level strategic decisions, which are characteristics of higher tiers.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Materials Management Coordinator';

-- Pharmacology Study Planner (confidence: 0.85)
-- Reasoning: The Pharmacology Study Planner has a focused expertise in pharmacology, specifically in providing medication guidance, dosing calculations, and assessing drug interactions. Its capabilities are well-defined within the clinical domain, but it does not coordinate multiple agents or make high-level strategic decisions, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Pharmacology Study Planner';

-- In Vitro Model Specialist (confidence: 0.85)
-- Reasoning: The In Vitro Model Specialist has a focused expertise in cell and tissue model development, which aligns with the characteristics of a Specialist. It handles specific tasks related to medication guidance, dosing calculations, and drug interactions, indicating a narrow scope of specialized knowledge.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'In Vitro Model Specialist';

-- Inventory Optimization Specialist (confidence: 0.85)
-- Reasoning: The Inventory Optimization Specialist has a focused expertise in inventory management optimization, which aligns with the characteristics of a Specialist. It handles well-defined tasks related to medication guidance, dosing calculations, and drug interaction assessments, indicating a narrow scope of specialized knowledge.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Inventory Optimization Specialist';

-- Machine Learning Engineer (confidence: 0.85)
-- Reasoning: The Machine Learning Engineer focuses on specific tasks related to ML model development in healthcare, showcasing narrow expertise in areas such as medication guidance and drug interaction assessment. While the role requires specialized knowledge, it does not involve high-level strategic decision-making or orchestration of multiple agents, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Machine Learning Engineer';

-- Data Visualization Specialist (confidence: 0.85)
-- Reasoning: The Data Visualization Specialist has focused expertise in developing interactive dashboards and performing specific analytical tasks related to medication guidance and safety. While the role requires specialized knowledge, it does not involve high-level strategic decision-making or orchestration of multiple agents, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Data Visualization Specialist';

-- ETL Developer (confidence: 0.85)
-- Reasoning: The ETL Developer has a focused expertise in data pipeline development and automation, specifically within the pharmaceutical domain. While they possess specialized knowledge in medication guidance and drug interaction assessment, their role is more about executing well-defined tasks rather than making high-level strategic decisions or coordinating multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'ETL Developer';

-- Medical Writer (confidence: 0.85)
-- Reasoning: The Medical Writer has a focused expertise in creating regulatory documents, clinical study reports, and scientific manuscripts, which aligns with the characteristics of a specialist. While they possess significant knowledge in their specific domain, their role does not involve high-level strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Writer';

-- Manufacturing Capacity Planner (confidence: 0.85)
-- Reasoning: The Manufacturing Capacity Planner has a focused expertise in production capacity planning and related tasks such as dosing calculations and drug interaction assessments. While it provides valuable insights and guidance, its scope is limited to specific operational tasks within the pharmaceutical domain rather than high-level strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Manufacturing Capacity Planner';

-- Multi-Omics Integration Specialist (confidence: 0.85)
-- Reasoning: The Multi-Omics Integration Specialist has focused expertise in systems biology approaches within the clinical domain, providing specific capabilities such as medication guidance and drug interaction assessment. This indicates a narrow focus on specialized tasks rather than broader strategic decision-making or orchestration.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Multi-Omics Integration Specialist';

-- Medical Affairs Metrics Analyst (confidence: 0.85)
-- Reasoning: The Medical Affairs Metrics Analyst has a focused expertise in tracking and analyzing key performance indicators specific to medical affairs. This role requires specialized knowledge in a narrow area, making it fit for the Specialist tier rather than a broader strategic or expert role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Medical Affairs Metrics Analyst';

-- KOL Engagement Coordinator (confidence: 0.85)
-- Reasoning: The KOL Engagement Coordinator has a focused expertise in managing relationships with key opinion leaders and developing medical publications, which aligns with the characteristics of a specialist. While it requires specialized knowledge, the role does not involve high-level strategic decision-making or orchestration of multiple agents, which would be indicative of a higher tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'KOL Engagement Coordinator';

-- Process Optimization Analyst (confidence: 0.85)
-- Reasoning: The Process Optimization Analyst has a focused expertise in manufacturing process improvement, which aligns with the characteristics of a specialist. The key capabilities listed indicate a narrow focus on specific tasks related to pharmacotherapy, suggesting a well-defined sub-domain expertise rather than broad strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Process Optimization Analyst';

-- Manufacturing Deviation Handler (confidence: 0.85)
-- Reasoning: The Manufacturing Deviation Handler focuses on specific tasks related to production deviation management, which requires specialized knowledge in a narrow domain. Its capabilities suggest it handles well-defined sub-domain tasks rather than making high-level strategic decisions or coordinating multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Manufacturing Deviation Handler';

-- Prior Authorization Navigator (confidence: 0.85)
-- Reasoning: The Prior Authorization Navigator focuses on specific clinical tasks such as medication guidance, dosing calculations, and drug interaction assessments. Its capabilities indicate a narrow expertise within the clinical domain, aligning with the characteristics of a specialist who handles well-defined sub-domain tasks.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Prior Authorization Navigator';

-- Demand Forecaster (confidence: 0.85)
-- Reasoning: The Demand Forecaster has a focused expertise in demand planning and forecasting, which aligns with the characteristics of a Specialist. While it possesses analytical capabilities, its scope is limited to specific tasks related to medication supply rather than broader strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Demand Forecaster';

-- Analytical Method Developer (confidence: 0.85)
-- Reasoning: The Analytical Method Developer has a focused expertise in analytical method development and validation, which aligns with the characteristics of a specialist. While they possess significant knowledge and skills, their role is more about executing specific tasks within the domain rather than making high-level strategic decisions or coordinating multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Analytical Method Developer';

-- Signal Detection Analyst (confidence: 0.85)
-- Reasoning: The Signal Detection Analyst has a focused expertise in safety signal identification and assessment within the clinical domain. This role involves handling specific tasks related to pharmacovigilance and patient safety monitoring, which aligns with the characteristics of a specialist rather than a broader domain expert or orchestrator.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Signal Detection Analyst';

-- Process Development Engineer (confidence: 0.85)
-- Reasoning: The Process Development Engineer has a focused expertise in manufacturing process development, which aligns with the characteristics of a Specialist. The key capabilities listed indicate a narrow focus on specific tasks related to medication guidance and pharmacotherapy, rather than broader strategic decision-making or orchestration.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Process Development Engineer';

-- Drug Substance Characterization Specialist (confidence: 0.85)
-- Reasoning: The Drug Substance Characterization Specialist has a focused expertise in the physicochemical characterization of APIs and performs specific tasks such as dosing calculations and drug interaction assessments. This indicates a narrow scope of specialized knowledge, aligning with the criteria for a Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Drug Substance Characterization Specialist';

-- IND-Enabling Study Coordinator (confidence: 0.85)
-- Reasoning: The IND-Enabling Study Coordinator has a focused expertise in regulatory tasks related to IND package coordination. Its key capabilities indicate a narrow scope of specialized knowledge, particularly in medication guidance and pharmacotherapy decision support, aligning it with the characteristics of a specialist.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'IND-Enabling Study Coordinator';

-- Transportation Manager (confidence: 0.85)
-- Reasoning: The Transportation Manager has a focused expertise in logistics and transportation coordination, specifically for pharmaceutical products. While it performs complex tasks like dosing calculations and drug interaction assessments, its scope remains narrow and specific to the logistics domain rather than broader strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Transportation Manager';

-- Returns & Recall Coordinator (confidence: 0.85)
-- Reasoning: The Returns & Recall Coordinator has a focused expertise in managing product returns and recalls within the regulatory domain. While it requires specialized knowledge and adherence to safety protocols, it does not engage in high-level strategic decision-making or coordination of multiple agents, which aligns it more closely with a specialist role.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Returns & Recall Coordinator';

-- DMPK Specialist (confidence: 0.85)
-- Reasoning: The DMPK Specialist has a focused expertise in drug metabolism and pharmacokinetics, handling specific tasks such as dosing calculations and drug interaction assessments. This aligns with the characteristics of a Specialist, as it requires specialized knowledge within a well-defined sub-domain of clinical pharmacotherapy.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'DMPK Specialist';

-- Sales Force Effectiveness Analyst (confidence: 0.85)
-- Reasoning: The Sales Force Effectiveness Analyst focuses on specific tasks related to sales force optimization within the clinical domain. Their capabilities, such as evidence-based medication guidance and drug interaction assessment, indicate a narrow expertise that aligns with the characteristics of a specialist rather than a domain expert or orchestrator.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Sales Force Effectiveness Analyst';

-- Evidence Synthesis Specialist (confidence: 0.85)
-- Reasoning: The Evidence Synthesis Specialist has a focused expertise in performing meta-analysis and systematic reviews, which falls under a well-defined sub-domain of analytical tasks. While it requires specialized knowledge in evidence synthesis and medication guidance, it does not coordinate multiple agents or make high-level strategic decisions, placing it firmly in the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Evidence Synthesis Specialist';

-- Customer Insights Analyst (confidence: 0.85)
-- Reasoning: The Customer Insights Analyst has a focused expertise in customer research and segmentation within the pharmaceutical field, which aligns with the characteristics of a Specialist. While the agent possesses analytical capabilities, its primary function is narrow and specific, rather than involving complex reasoning or high-level strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Customer Insights Analyst';

-- Supply Chain Risk Manager (confidence: 0.85)
-- Reasoning: The Supply Chain Risk Manager focuses on managing supply chain risks specifically within the pharmaceutical sector, indicating a narrow but specialized expertise. While it handles critical operational tasks related to supply chain resilience, it does not coordinate multiple agents or make high-level strategic decisions, which aligns it more closely with the Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Supply Chain Risk Manager';

-- AI/ML Model Validator (confidence: 0.85)
-- Reasoning: The AI/ML Model Validator has a focused expertise in validating AI models specifically within the pharmaceutical domain. Its capabilities such as medication guidance and drug interaction assessment indicate a narrow but specialized knowledge, aligning it with the characteristics of a Specialist tier agent.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'AI/ML Model Validator';

-- Warehouse Operations Specialist (confidence: 0.85)
-- Reasoning: The Warehouse Operations Specialist has a focused expertise in warehousing optimization and related tasks, which aligns with the characteristics of a Specialist. While it possesses specialized knowledge in optimizing warehouse operations, it does not coordinate multiple agents or make high-level strategic decisions, which would be required for a higher tier classification.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Warehouse Operations Specialist';

-- Statistical Programmer (confidence: 0.85)
-- Reasoning: The Statistical Programmer has focused expertise in clinical programming, specifically in the context of clinical trials. Their capabilities, such as dosing calculation and drug interaction assessment, indicate a narrow but specialized skill set within the clinical domain, aligning with the characteristics of a Specialist tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Statistical Programmer';

-- Predictive Modeling Specialist (confidence: 0.85)
-- Reasoning: The Predictive Modeling Specialist has a focused expertise in predictive analytics specifically for trials, which aligns with the characteristics of a Specialist. The agent performs well-defined tasks such as medication guidance and dosing calculations, indicating a narrow focus within the analytical domain.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Predictive Modeling Specialist';

-- Clinical Data Scientist (confidence: 0.85)
-- Reasoning: The Clinical Data Scientist has focused expertise in clinical data analysis and medication guidance, which aligns with the characteristics of a specialist. The key capabilities indicate a narrow focus on specific tasks such as dosing calculations and drug interaction assessments, rather than broader strategic decision-making or orchestration.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Clinical Data Scientist';

-- Business Intelligence Analyst (confidence: 0.85)
-- Reasoning: The Business Intelligence Analyst focuses on specific analytical tasks related to evidence-based medication guidance, dosing calculations, and drug interaction assessments. This indicates a narrow expertise within the domain of pharmacotherapy decision support, aligning with the characteristics of a Specialist agent.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Business Intelligence Analyst';

-- CAPA Coordinator (confidence: 0.85)
-- Reasoning: The CAPA Coordinator has a focused expertise in managing the Corrective and Preventive Action systems within the technical CMC domain. While the role involves ensuring compliance and maintaining quality standards, it does not encompass the broader strategic decision-making or orchestration of multiple agents, which would be characteristic of a higher tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'CAPA Coordinator';

-- Training Coordinator (confidence: 0.85)
-- Reasoning: The Training Coordinator has a focused expertise in managing GMP training programs and ensuring compliance, which aligns with the characteristics of a specialist. The role involves specific tasks such as deviation investigation and CAPA system management, indicating a narrow focus within the technical_cmc domain.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Training Coordinator';

-- Needs Assessment Coordinator (confidence: 0.85)
-- Reasoning: The Needs Assessment Coordinator has a focused expertise in medical education needs analysis and engages with key opinion leaders, which aligns with the characteristics of a specialist. While they provide scientific support and develop publications, their role is more about coordinating specific tasks within the medical education domain rather than making high-level strategic decisions.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Needs Assessment Coordinator';

-- Technology Transfer Coordinator (confidence: 0.85)
-- Reasoning: The Technology Transfer Coordinator has a focused expertise in technology transfer management and specific capabilities related to medication guidance, dosing calculations, and drug interaction assessments. This indicates a narrow, specialized role within the broader technical CMC domain, aligning with the characteristics of a Specialist.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Technology Transfer Coordinator';

-- Real-World Evidence Analyst (confidence: 0.85)
-- Reasoning: The Real-World Evidence Analyst has a focused expertise in designing and analyzing real-world evidence studies, which aligns with the characteristics of a specialist. While they manage trial operations and ensure data quality, their role is primarily centered on specific tasks within the clinical domain rather than broader strategic decision-making.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Real-World Evidence Analyst';

-- Lyophilization Specialist (confidence: 0.85)
-- Reasoning: The Lyophilization Specialist has a focused expertise in freeze-drying cycle development specifically for pharmaceutical applications, which aligns with the characteristics of a Specialist. While the agent possesses valuable capabilities in medication guidance and safety protocol adherence, its primary function is narrow and well-defined within the domain of freeze-drying.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Lyophilization Specialist';

-- Bioanalytical Method Developer (confidence: 0.85)
-- Reasoning: The Bioanalytical Method Developer has a focused expertise in bioanalytical method development, which falls within a specific sub-domain of technical CMC. While the agent possesses specialized knowledge and capabilities related to medication guidance and drug interaction assessment, it does not coordinate multiple agents or make high-level strategic decisions, which are characteristics of higher tiers.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Bioanalytical Method Developer';

-- Supply Planning Analyst (confidence: 0.85)
-- Reasoning: The Supply Planning Analyst has a focused expertise in supply-demand balance optimization within the pharmaceutical industry, which aligns with the characteristics of a Specialist. While the role requires specialized knowledge and analytical capabilities, it does not involve high-level strategic decision-making or orchestration of multiple agents, which would be indicative of a higher tier.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Supply Planning Analyst';

-- Real-World Data Analyst (confidence: 0.85)
-- Reasoning: The Real-World Data Analyst has a focused expertise in analyzing real-world data to provide insights related to medication guidance, dosing calculations, and drug interactions. This indicates a narrow scope of specialized knowledge within the domain of pharmacotherapy, aligning with the characteristics of a Specialist tier agent.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Real-World Data Analyst';

-- Data Quality Analyst (confidence: 0.85)
-- Reasoning: The Data Quality Analyst has a focused expertise in data quality monitoring and validation, which aligns with the characteristics of a specialist. The capabilities listed indicate a narrow focus on specific tasks related to data quality and medication guidance, rather than broader strategic decision-making or orchestration of multiple agents.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Data Quality Analyst';

-- Population Health Analyst (confidence: 0.85)
-- Reasoning: The Population Health Analyst has a focused expertise in population-level analytics within the clinical domain. Their capabilities, such as evidence-based medication guidance and drug interaction assessment, indicate a specialized knowledge that aligns with Tier 3 classification.
UPDATE agents SET agent_level = 'SPECIALIST' WHERE name = 'Population Health Analyst';


-- ============================================================================
-- WORKER AGENTS (4 agents)
-- ============================================================================

-- Hub Services Manager (confidence: 0.85)
-- Reasoning: The Hub Services Manager primarily focuses on managing operational tasks related to patient support services, such as vendor management and service optimization. While they ensure a good patient experience, their role does not involve high-level strategic decision-making or coordination of multiple agents, which aligns more closely with a worker tier.
UPDATE agents SET agent_level = 'WORKER' WHERE name = 'Hub Services Manager';

-- Medical Affairs Operations Manager (confidence: 0.85)
-- Reasoning: The Medical Affairs Operations Manager primarily focuses on operational tasks such as budget management, process optimization, and resource coordination. While they play a crucial role in ensuring efficient operations, their responsibilities do not involve high-level strategic decision-making or complex orchestration of multiple agents, which are characteristics of higher tiers.
UPDATE agents SET agent_level = 'WORKER' WHERE name = 'Medical Affairs Operations Manager';

-- Brand Manager (confidence: 0.85)
-- Reasoning: The Brand Manager primarily executes operational tasks related to marketing plans and brand performance without making high-level strategic decisions or coordinating multiple agents. Their role focuses on day-to-day management and optimization of promotional activities, which aligns with the characteristics of a task executor.
UPDATE agents SET agent_level = 'WORKER' WHERE name = 'Brand Manager';

-- Project Coordination Agent (confidence: 0.85)
-- Reasoning: The Project Coordination Agent primarily focuses on operational tasks such as managing project activities, stakeholder communications, and tracking deliverables. While it plays a crucial role in project execution, it does not engage in high-level strategic decision-making or complex workflows that would classify it as a higher tier.
UPDATE agents SET agent_level = 'WORKER' WHERE name = 'Project Coordination Agent';


COMMIT;
