# Document 3: Digital Health AI Prompt Library
## Comprehensive Prompt Templates for Dynamic Execution

---

## 📚 Prompt Library Structure

### Prompt Definition Template
```json
{
  "prompt_id": "PS-[DOMAIN]-[NUMBER]",
  "prompt_starter": "Brief description shown to user",
  "category": "regulatory | clinical | business | technical",
  "complexity": "simple | moderate | complex",
  "estimated_time": "5-30 minutes",
  "required_capabilities": ["List of capability IDs needed"],
  "detailed_prompt": "Complete prompt template with placeholders",
  "input_requirements": ["Required information from user"],
  "output_specification": "Expected deliverables",
  "success_criteria": "How to measure success"
}
```

---

## 🏛️ FDA REGULATORY PROMPTS

### PS-FDA-001: 510(k) Submission Strategy
```json
{
  "prompt_id": "PS-FDA-001",
  "prompt_starter": "Design comprehensive FDA 510(k) submission strategy",
  "category": "regulatory",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-FDA-001", "CAP-FDA-002"],
  "detailed_prompt": "I need to develop a complete FDA 510(k) submission strategy for a medical device. Please analyze the following device information and provide comprehensive regulatory guidance:\n\n## DEVICE INFORMATION\n- Device Name: {{device_name}}\n- Intended Use: {{intended_use}}\n- Device Description: {{device_description}}\n- Technology Type: {{technology_type}}\n- Target Population: {{target_population}}\n- Clinical Setting: {{clinical_setting}}\n- Current Development Stage: {{development_stage}}\n\n## ANALYSIS REQUIRED\n\n### 1. REGULATORY CLASSIFICATION\nUsing your CAP-FDA-001 capability:\n- Determine precise FDA device classification (Class I, II, or III)\n- Identify applicable regulation number (21 CFR Part XXX)\n- Confirm product code from FDA database\n- Assess if 510(k) is appropriate pathway\n- Identify any special control requirements\n\n### 2. PREDICATE DEVICE STRATEGY\nUsing your CAP-FDA-002 capability:\n- Search for potential predicates (provide 3-5 options)\n- Create detailed comparison table:\n  * Intended use alignment\n  * Technological characteristics comparison\n  * Performance specifications\n  * Materials and design features\n- Recommend primary predicate with justification\n- Identify any gaps requiring additional testing\n\n### 3. SUBSTANTIAL EQUIVALENCE ARGUMENT\nDevelop the SE argument structure:\n- Same intended use confirmation\n- Technological differences assessment\n- Performance data requirements\n- Risk profile comparison\n- FDA decision flowchart position\n\n### 4. TESTING REQUIREMENTS\nDefine comprehensive testing strategy:\n\n#### Bench Testing\n- Mechanical testing (list specific tests)\n- Electrical safety (IEC 60601 series)\n- Electromagnetic compatibility\n- Software validation (if applicable)\n- Biocompatibility (ISO 10993 series)\n\n#### Clinical Testing\n- Determine if clinical data required\n- If yes, specify study design\n- Sample size and endpoints\n- Comparison to predicate performance\n\n### 5. FDA SUBMISSION TIMELINE\nCreate detailed timeline with milestones:\n- Testing completion: {{target_date}}\n- Documentation preparation: X weeks\n- Internal review: X weeks\n- FDA submission: {{target_submission}}\n- FDA review period: 90 days (MDUFA V)\n- Potential AI requests: 30-60 days\n- Target clearance: {{target_clearance}}\n\n### 6. RISK ASSESSMENT\nIdentify and mitigate regulatory risks:\n\n| Risk | Likelihood | Impact | Mitigation Strategy |\n|------|------------|--------|--------------------|\n| Predicate challenge | | | |\n| Additional testing request | | | |\n| Clinical data requirement | | | |\n| Software concerns | | | |\n\n### 7. PRE-SUBMISSION STRATEGY\nRecommend Pre-Sub approach:\n- Key questions for FDA (top 5)\n- Optimal timing for meeting\n- Materials to prepare\n- Success metrics\n\n### 8. COST ESTIMATE\nProvide budget estimate:\n- Testing costs: $XXX\n- Consultant support: $XXX\n- FDA fees: $19,870 (FY2025)\n- Internal resources: XXX hours\n- Total investment: $XXX\n\n### 9. COMPETITIVE INTELLIGENCE\nAnalyze recent clearances:\n- Similar devices cleared in last 12 months\n- Average review times\n- Common FDA feedback themes\n- Successful strategies observed\n\n### 10. RECOMMENDATIONS\nProvide executive summary with:\n- Go/No-go recommendation\n- Critical success factors (top 3)\n- Major risks and mitigation\n- Next steps with owners\n- Success probability: X%\n\n## OUTPUT FORMAT\nProvide response in the following structure:\n1. Executive Summary (1 page)\n2. Detailed Analysis (with all sections above)\n3. Appendices (supporting data)\n4. Action Plan (numbered steps with timeline)",
  "input_requirements": [
    "Device name and description",
    "Intended use statement",
    "Technology details",
    "Target population",
    "Development stage",
    "Target submission date"
  ],
  "output_specification": "Comprehensive 510(k) strategy document with timeline, testing requirements, and risk assessment",
  "success_criteria": "Strategy achieves >85% probability of first-cycle clearance"
}
```

### PS-FDA-002: De Novo Classification Request
```json
{
  "prompt_id": "PS-FDA-002",
  "prompt_starter": "Prepare De Novo classification request strategy",
  "category": "regulatory",
  "complexity": "complex",
  "estimated_time": "25 minutes",
  "required_capabilities": ["CAP-FDA-001", "CAP-FDA-003"],
  "detailed_prompt": "Develop a comprehensive De Novo classification request strategy for a novel medical device without valid predicates.\n\n## DEVICE DETAILS\n- Novel Technology: {{technology_description}}\n- Innovation Aspects: {{novel_features}}\n- Intended Use: {{intended_use}}\n- Risk Profile: {{risk_assessment}}\n- Clinical Need: {{unmet_need}}\n\n## REQUIRED ANALYSIS\n\n### 1. DE NOVO ELIGIBILITY\nConfirm De Novo appropriateness:\n- Verify no valid predicate exists (document search)\n- Confirm device is not automatically Class III\n- Assess if general and special controls sufficient\n- Review similar De Novo grants\n\n### 2. CLASSIFICATION RECOMMENDATION\nPropose classification with rationale:\n- Recommended class (I or II)\n- Risk-based justification\n- Comparison to similar classified devices\n- International classification alignment\n\n### 3. SPECIAL CONTROLS DEVELOPMENT\nDefine special controls to mitigate risks:\n\n#### Risk Mitigation Table\n| Identified Risk | Mitigation Measure | Special Control |\n|-----------------|-------------------|------------------|\n| {{risk_1}} | {{mitigation_1}} | {{control_1}} |\n| {{risk_2}} | {{mitigation_2}} | {{control_2}} |\n\n### 4. PERFORMANCE DATA REQUIREMENTS\nSpecify testing needed:\n- Bench performance testing\n- Software validation\n- Clinical performance data\n- Human factors validation\n- Cybersecurity assessment\n\n### 5. CLINICAL EVIDENCE STRATEGY\nDesign clinical study if required:\n- Study design and controls\n- Primary endpoints\n- Sample size justification\n- Success criteria\n- Timeline and sites\n\n### 6. FDA INTERACTION PLAN\n- Pre-Submission meeting agenda\n- Key questions for FDA\n- Materials to provide\n- Timeline optimization\n\n### 7. POST-GRANT CONSIDERATIONS\n- Future 510(k) pathway establishment\n- Competitive advantage period\n- IP protection strategy\n- Market communication plan\n\n### 8. SUCCESS METRICS\n- Probability of grant: X%\n- Review timeline: 150 days\n- Investment required: $XXX\n- ROI projection: XXX%",
  "input_requirements": [
    "Novel technology description",
    "Intended use",
    "Risk assessment",
    "Clinical evidence available",
    "Development timeline"
  ],
  "output_specification": "Complete De Novo strategy with special controls framework and FDA engagement plan",
  "success_criteria": "De Novo grant achieved within 150-day review"
}
```

### PS-FDA-003: FDA Response to Additional Information
```json
{
  "prompt_id": "PS-FDA-003",
  "prompt_starter": "Prepare FDA Additional Information response",
  "category": "regulatory",
  "complexity": "moderate",
  "estimated_time": "20 minutes",
  "required_capabilities": ["CAP-FDA-002"],
  "detailed_prompt": "Develop a comprehensive response to FDA Additional Information (AI) request for a pending submission.\n\n## FDA REQUEST DETAILS\n- Submission Type: {{submission_type}}\n- FDA Questions: {{fda_questions}}\n- Response Deadline: {{deadline}}\n- Key Concerns: {{main_concerns}}\n\n## RESPONSE FRAMEWORK\n\n### 1. QUESTION ANALYSIS\nFor each FDA question:\n- Interpret FDA's underlying concern\n- Identify required evidence\n- Assess response complexity\n- Determine if clarification needed\n\n### 2. RESPONSE STRATEGY\nDevelop approach for each item:\n- Direct answer to question\n- Supporting evidence/data\n- Additional context if helpful\n- Visual aids where appropriate\n\n### 3. EVIDENCE COMPILATION\n- Existing data to reference\n- New analyses required\n- Expert opinions needed\n- Literature support\n\n### 4. RESPONSE ORGANIZATION\n```\nResponse to FDA Additional Information Request\n[Submission Number]\n\n1. Overview of Response\n2. Response to Question 1\n   - FDA Question [verbatim]\n   - Our Response\n   - Supporting Data\n   - Conclusion\n3. Response to Question 2\n   [Continue format]\n```\n\n### 5. QUALITY CHECK\n- All questions addressed\n- Consistent messaging\n- Adequate evidence provided\n- Clear and concise language\n- Regulatory citations accurate\n\n### 6. INTERNAL REVIEW PROCESS\n- Technical review\n- Regulatory review\n- Quality review\n- Management approval\n\n### 7. SUBMISSION PREPARATION\n- Format per FDA requirements\n- eCopy preparation\n- Cover letter drafting\n- Tracking documentation\n\n### 8. FOLLOW-UP STRATEGY\n- Anticipated FDA reaction\n- Potential clarifications\n- Timeline impact\n- Communication plan",
  "input_requirements": [
    "FDA AI letter",
    "Original submission",
    "Available data",
    "Response deadline",
    "Internal resources"
  ],
  "output_specification": "Complete FDA response package ready for submission",
  "success_criteria": "FDA accepts response without further questions"
}
```

---

## 🔬 CLINICAL TRIAL PROMPTS

### PS-CT-001: Pivotal Trial Protocol Design
```json
{
  "prompt_id": "PS-CT-001",
  "prompt_starter": "Design pivotal clinical trial protocol",
  "category": "clinical",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-CT-001", "CAP-CT-002", "CAP-CT-003"],
  "detailed_prompt": "Design a comprehensive pivotal clinical trial protocol for regulatory approval of a medical device.\n\n## DEVICE AND INDICATION\n- Device Type: {{device_type}}\n- Indication: {{indication}}\n- Patient Population: {{population}}\n- Current Evidence: {{existing_data}}\n- Regulatory Requirements: {{requirements}}\n\n## PROTOCOL DEVELOPMENT\n\n### 1. STUDY DESIGN SELECTION\nEvaluate and recommend optimal design:\n\n#### Design Options Analysis\n| Design Type | Pros | Cons | Recommendation |\n|-------------|------|------|-----------------|\n| RCT | Gold standard | Cost, time | |\n| Single-arm with OPC | Faster, cheaper | Bias risk | |\n| Adaptive | Efficient | Complex | |\n| Pragmatic | Real-world | Less control | |\n\n### 2. PRIMARY ENDPOINT STRATEGY\nUsing CAP-CT-003 capability:\n- Endpoint selection rationale\n- Clinical relevance justification\n- Regulatory precedent\n- Measurement methodology\n- Success criteria definition\n\n### 3. STATISTICAL PLAN\nUsing CAP-CT-002 capability:\n\n#### Sample Size Calculation\n```\nAssumptions:\n- Type I error (α): 0.05\n- Power (1-β): 0.80\n- Effect size: {{effect_size}}\n- Dropout rate: {{dropout_rate}}\n\nCalculation:\nn = [formula]\nTotal N = {{total_sample}}\n```\n\n#### Analysis Populations\n- ITT: All randomized\n- mITT: All treated\n- PP: Protocol compliant\n- Safety: All exposed\n\n### 4. STUDY POPULATION\n\n#### Inclusion Criteria\n1. {{inclusion_1}}\n2. {{inclusion_2}}\n3. {{inclusion_3}}\n\n#### Exclusion Criteria\n1. {{exclusion_1}}\n2. {{exclusion_2}}\n3. {{exclusion_3}}\n\n### 5. STUDY PROCEDURES\n\n#### Schedule of Activities\n| Procedure | Screening | Baseline | Treatment | Follow-up |\n|-----------|-----------|----------|-----------|------------|\n| Informed consent | X | | | |\n| Medical history | X | | | |\n| Physical exam | X | X | X | X |\n| Device procedure | | | X | |\n| Primary endpoint | | X | | X |\n| Safety assessment | | X | X | X |\n\n### 6. SAFETY MONITORING\n\n#### Data Safety Monitoring Board\n- Composition: {{dsmb_members}}\n- Meeting frequency: {{frequency}}\n- Stopping rules: {{rules}}\n\n#### Adverse Event Management\n- AE definitions and grading\n- Reporting timelines\n- Relationship assessment\n- SAE procedures\n\n### 7. OPERATIONAL CONSIDERATIONS\n\n#### Site Strategy\n- Number of sites: {{n_sites}}\n- Geographic distribution\n- Site selection criteria\n- Training requirements\n\n#### Enrollment Projections\n```\nMonth 1-3: Startup (X patients/month)\nMonth 4-12: Enrollment (Y patients/month)\nMonth 13-18: Follow-up\nTotal duration: {{total_months}} months\n```\n\n### 8. REGULATORY REQUIREMENTS\n- FDA IDE submission\n- IRB approvals\n- International requirements\n- Monitoring plan\n- Audit readiness\n\n### 9. QUALITY CONTROL\n- Risk-based monitoring\n- Central monitoring\n- Source data verification\n- Protocol deviation management\n\n### 10. BUDGET ESTIMATE\n- Per patient cost: ${{per_patient}}\n- Site costs: ${{site_costs}}\n- Total budget: ${{total_budget}}\n\n## DELIVERABLES\n1. Protocol document (50+ pages)\n2. Statistical analysis plan\n3. Case report forms\n4. Investigator brochure\n5. Informed consent template\n6. Budget and timeline",
  "input_requirements": [
    "Device description",
    "Indication and population",
    "Regulatory requirements",
    "Available resources",
    "Timeline constraints"
  ],
  "output_specification": "Complete clinical protocol package ready for FDA IDE submission",
  "success_criteria": "Protocol accepted by FDA and sites without major modifications"
}
```

### PS-CT-002: Adaptive Trial Design
```json
{
  "prompt_id": "PS-CT-002",
  "prompt_starter": "Create adaptive clinical trial design",
  "category": "clinical",
  "complexity": "complex",
  "estimated_time": "25 minutes",
  "required_capabilities": ["CAP-CT-001", "CAP-CT-002"],
  "detailed_prompt": "Design an adaptive clinical trial with pre-specified modifications based on interim analyses.\n\n## STUDY CONTEXT\n- Clinical Question: {{question}}\n- Key Uncertainties: {{uncertainties}}\n- Resource Constraints: {{constraints}}\n- Regulatory Environment: {{regulatory}}\n\n## ADAPTIVE DESIGN FRAMEWORK\n\n### 1. ADAPTATION OPTIONS\nSelect and justify adaptations:\n- [ ] Sample size re-estimation\n- [ ] Dose/treatment selection\n- [ ] Population enrichment\n- [ ] Endpoint modification\n- [ ] Seamless phase transition\n- [ ] Response-adaptive randomization\n\n### 2. DECISION RULES\nPre-specify adaptation triggers:\n\n#### Interim Analysis Plan\n- Timing: {{timing}}\n- Information fraction: {{fraction}}\n- Decision criteria: {{criteria}}\n- Alpha spending: {{alpha_spending}}\n\n### 3. STATISTICAL CONSIDERATIONS\n- Type I error control\n- Power preservation\n- Bias minimization\n- Estimation procedures\n\n### 4. OPERATIONAL PLANNING\n- IDMC charter\n- Blinding maintenance\n- Supply chain flexibility\n- Site communication\n\n### 5. REGULATORY STRATEGY\n- FDA Type C meeting\n- Simulation report\n- SAP with adaptations\n- Documentation plan",
  "output_specification": "Adaptive trial protocol with simulation results and FDA briefing package"
}
```

---

## 🔒 HIPAA COMPLIANCE PROMPTS

### PS-HIPAA-001: Comprehensive HIPAA Risk Assessment
```json
{
  "prompt_id": "PS-HIPAA-001",
  "prompt_starter": "Conduct HIPAA security risk assessment",
  "category": "regulatory",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-HIPAA-001", "CAP-HIPAA-002"],
  "detailed_prompt": "Perform a comprehensive HIPAA Security Risk Assessment for a healthcare technology platform.\n\n## SYSTEM INFORMATION\n- Platform Type: {{platform_type}}\n- PHI Volume: {{phi_volume}}\n- User Base: {{user_count}}\n- Integration Points: {{integrations}}\n- Current Controls: {{existing_controls}}\n\n## RISK ASSESSMENT FRAMEWORK\n\n### 1. ASSET INVENTORY\nUsing CAP-HIPAA-001:\n\n#### PHI Data Mapping\n| Data Type | Location | Volume | Sensitivity | Current Protection |\n|-----------|----------|---------|-------------|-----------------|\n| {{type_1}} | {{loc_1}} | {{vol_1}} | {{sens_1}} | {{prot_1}} |\n\n### 2. THREAT IDENTIFICATION\n\n#### Threat Landscape Analysis\n| Threat Actor | Motivation | Capability | Likelihood | Impact |\n|--------------|------------|------------|------------|--------|\n| External hackers | Financial | High | Medium | Critical |\n| Insider threat | Various | Medium | Low | High |\n| Ransomware | Financial | High | High | Critical |\n\n### 3. VULNERABILITY ASSESSMENT\n\n#### Technical Vulnerabilities\n- Network security gaps\n- Application vulnerabilities\n- Database security issues\n- Endpoint protection gaps\n- Cloud security concerns\n\n#### Administrative Vulnerabilities\n- Policy gaps\n- Training deficiencies\n- Access control weaknesses\n- Incident response gaps\n\n#### Physical Vulnerabilities\n- Facility access\n- Device security\n- Media disposal\n- Environmental controls\n\n### 4. CONTROL EVALUATION\nUsing CAP-HIPAA-002:\n\n#### Security Rule Requirements Matrix\n| Requirement | 45 CFR Section | Current State | Required State | Gap |\n|------------|----------------|---------------|----------------|-----|\n| Access Control | 164.312(a) | {{current}} | {{required}} | {{gap}} |\n\n### 5. RISK DETERMINATION\n\n#### Risk Scoring Matrix\n```\nRisk Score = Likelihood × Impact\n\nLikelihood Scale:\n1 = Very Low (<10%)\n2 = Low (10-25%)\n3 = Medium (25-50%)\n4 = High (50-75%)\n5 = Very High (>75%)\n\nImpact Scale:\n1 = Minimal\n2 = Minor\n3 = Moderate\n4 = Major\n5 = Catastrophic\n```\n\n### 6. RISK MITIGATION PLAN\n\n#### Prioritized Remediation\n| Risk | Score | Mitigation | Cost | Timeline | Owner |\n|------|-------|-------------|------|----------|-------|\n| {{risk_1}} | {{score_1}} | {{mit_1}} | {{cost_1}} | {{time_1}} | {{owner_1}} |\n\n### 7. IMPLEMENTATION ROADMAP\n\nPhase 1: Critical (0-30 days)\n- {{critical_items}}\n\nPhase 2: High (31-90 days)\n- {{high_items}}\n\nPhase 3: Medium (91-180 days)\n- {{medium_items}}\n\n### 8. MONITORING PLAN\n- Continuous monitoring tools\n- Audit schedule\n- Metrics and KPIs\n- Review frequency\n\n## DELIVERABLES\n1. Risk assessment report (OCR format)\n2. Risk register with scores\n3. Remediation roadmap\n4. Budget requirements\n5. Executive presentation",
  "input_requirements": [
    "System architecture",
    "PHI data flows",
    "Current security controls",
    "Compliance history",
    "Available budget"
  ],
  "output_specification": "Complete HIPAA risk assessment package ready for OCR audit",
  "success_criteria": "All high and critical risks addressed with mitigation plans"
}
```

### PS-HIPAA-002: Breach Response Plan
```json
{
  "prompt_id": "PS-HIPAA-002",
  "prompt_starter": "Develop HIPAA breach response plan",
  "category": "regulatory",
  "complexity": "moderate",
  "estimated_time": "20 minutes",
  "required_capabilities": ["CAP-HIPAA-003"],
  "detailed_prompt": "Create a comprehensive HIPAA breach response plan for a potential PHI exposure incident.\n\n## INCIDENT DETAILS\n- Incident Type: {{incident_type}}\n- Discovery Date: {{discovery_date}}\n- Affected Records: {{record_count}}\n- Data Types: {{data_types}}\n- Current Status: {{status}}\n\n## BREACH RESPONSE PROTOCOL\n\n### 1. IMMEDIATE RESPONSE (0-24 hours)\n\n#### Containment Actions\n- [ ] Isolate affected systems\n- [ ] Preserve evidence\n- [ ] Stop ongoing breach\n- [ ] Document all actions\n- [ ] Activate incident response team\n\n### 2. BREACH ASSESSMENT (24-48 hours)\n\nUsing CAP-HIPAA-003:\n\n#### Four-Factor Risk Assessment\n1. Nature and extent of PHI\n2. Unauthorized person who accessed\n3. Whether PHI actually acquired/viewed\n4. Mitigation success\n\nRisk Score: {{score}}\nBreach Determination: {{determination}}\n\n### 3. NOTIFICATION REQUIREMENTS\n\n#### Timeline Compliance\n- Individual notice: 60 days\n- Media notice: 60 days (if >500)\n- HHS notice: 60 days\n- Prominent website posting: If >500\n\n#### Notification Content\n- Description of breach\n- Types of information\n- Steps individuals should take\n- Our actions\n- Contact information\n\n### 4. INVESTIGATION PROCESS\n- Root cause analysis\n- Timeline reconstruction\n- Impact assessment\n- Evidence preservation\n- Documentation requirements\n\n### 5. CORRECTIVE ACTIONS\n- Immediate fixes\n- Long-term improvements\n- Policy updates\n- Training requirements\n- Technical controls\n\n### 6. REGULATORY REPORTING\n- OCR breach portal\n- State requirements\n- Business associate notifications\n- Insurance claims\n\n### 7. COMMUNICATION PLAN\n- Internal stakeholders\n- Affected individuals\n- Media (if required)\n- Board notification\n\n## DELIVERABLES\n1. Breach assessment documentation\n2. Notification letters\n3. OCR submission\n4. Corrective action plan\n5. Lessons learned report",
  "output_specification": "Complete breach response package with all required notifications",
  "success_criteria": "100% compliant response within required timelines"
}
```

---

## 💰 REIMBURSEMENT PROMPTS

### PS-REIMB-001: Comprehensive Reimbursement Strategy
```json
{
  "prompt_id": "PS-REIMB-001",
  "prompt_starter": "Develop multi-payer reimbursement strategy",
  "category": "business",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-REIMB-001", "CAP-REIMB-002", "CAP-REIMB-003"],
  "detailed_prompt": "Create a comprehensive reimbursement strategy for a medical device across all payer types.\n\n## DEVICE INFORMATION\n- Device Type: {{device_type}}\n- Clinical Application: {{application}}\n- Economic Value: {{value_prop}}\n- Target Price: {{price}}\n- Competition: {{competitors}}\n\n## REIMBURSEMENT STRATEGY DEVELOPMENT\n\n### 1. CODING STRATEGY\nUsing CAP-REIMB-001:\n\n#### Code Mapping Analysis\n| Code Type | Existing Codes | New Code Needed | Timeline | Strategy |\n|-----------|----------------|-----------------|----------|----------|\n| CPT | {{cpt_codes}} | {{cpt_new}} | {{cpt_time}} | {{cpt_strategy}} |\n| HCPCS | {{hcpcs_codes}} | {{hcpcs_new}} | {{hcpcs_time}} | {{hcpcs_strategy}} |\n| ICD-10 | {{icd_codes}} | N/A | N/A | {{icd_strategy}} |\n\n### 2. COVERAGE PATHWAY\nUsing CAP-REIMB-002:\n\n#### Medicare Strategy\n- Benefit category: {{category}}\n- NCD potential: {{ncd_analysis}}\n- LCD approach: {{lcd_strategy}}\n- NTAP eligibility: {{ntap}}\n\n#### Commercial Payer Strategy\n| Payer | Market Share | Current Policy | Engagement Plan | Timeline |\n|-------|--------------|----------------|-----------------|----------|\n| UHC | 30% | {{uhc_policy}} | {{uhc_plan}} | {{uhc_time}} |\n| Anthem | 20% | {{anthem_policy}} | {{anthem_plan}} | {{anthem_time}} |\n\n### 3. ECONOMIC VALUE DEMONSTRATION\nUsing CAP-REIMB-003:\n\n#### Cost-Effectiveness Analysis\n```\nIntervention Cost: ${{intervention_cost}}\nComparator Cost: ${{comparator_cost}}\nQALY Gain: {{qaly_gain}}\nICER: ${{icer}}/QALY\n```\n\n#### Budget Impact Model\n- Year 1: ${{year1_impact}}\n- Year 2: ${{year2_impact}}\n- Year 3: ${{year3_impact}}\n- Break-even: {{breakeven}}\n\n### 4. EVIDENCE GENERATION PLAN\n\n#### Clinical Evidence\n- Efficacy data: {{efficacy}}\n- Safety profile: {{safety}}\n- Comparative effectiveness: {{comparative}}\n- Real-world evidence: {{rwe}}\n\n#### Economic Evidence\n- Direct cost savings: {{direct_savings}}\n- Indirect benefits: {{indirect_benefits}}\n- Productivity gains: {{productivity}}\n- Quality improvements: {{quality}}\n\n### 5. PAYER ENGAGEMENT STRATEGY\n\n#### Engagement Timeline\n1. Pre-launch (Months -12 to -6)\n   - Payer advisory boards\n   - Early scientific exchange\n   - Value proposition testing\n\n2. Launch (Months 0-6)\n   - Formal dossier submission\n   - Medical director meetings\n   - Pilot program proposals\n\n3. Post-launch (Months 6-18)\n   - Coverage determination support\n   - Appeals support\n   - Outcomes data sharing\n\n### 6. PROVIDER ENABLEMENT\n\n#### Education Materials\n- Coding guides\n- Prior auth toolkits\n- Sample documentation\n- Appeal letter templates\n\n#### Support Services\n- Reimbursement hotline\n- Prior auth assistance\n- Appeals support team\n- Billing audits\n\n### 7. PATIENT ACCESS PROGRAMS\n\n#### Financial Assistance\n- Copay assistance: {{copay_program}}\n- Free drug program: {{free_program}}\n- Payment plans: {{payment_options}}\n\n### 8. SUCCESS METRICS\n\n#### KPIs and Targets\n- Coverage achieved: >70% lives (12 months)\n- Average reimbursement: >80% of target\n- Prior auth approval: >85%\n- Time to payment: <45 days\n- Denial rate: <15%\n\n## DELIVERABLES\n1. Reimbursement strategy deck\n2. Payer value dossiers\n3. Economic models\n4. Provider toolkit\n5. Patient assistance program\n6. Implementation roadmap",
  "input_requirements": [
    "Device description",
    "Clinical evidence",
    "Economic data",
    "Competitive landscape",
    "Target pricing"
  ],
  "output_specification": "Complete reimbursement strategy package with tactical execution plan",
  "success_criteria": "Achieve coverage for >70% of target population within 12 months"
}
```

---

## ✅ QUALITY MANAGEMENT PROMPTS

### PS-QMS-001: QMS Implementation Plan
```json
{
  "prompt_id": "PS-QMS-001",
  "prompt_starter": "Design comprehensive QMS implementation",
  "category": "regulatory",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-QMS-001", "CAP-QMS-002", "CAP-QMS-003"],
  "detailed_prompt": "Create a complete Quality Management System implementation plan for a medical device company.\n\n## COMPANY CONTEXT\n- Company Stage: {{stage}}\n- Product Types: {{products}}\n- Team Size: {{team_size}}\n- Target Markets: {{markets}}\n- Current QMS State: {{current_state}}\n\n## QMS IMPLEMENTATION FRAMEWORK\n\n### 1. QMS ARCHITECTURE\nUsing CAP-QMS-001:\n\n#### Quality System Structure\n```\nQuality Manual (Level 1)\n├── Management Processes (Level 2)\n│   ├── Management Review\n│   ├── Quality Planning\n│   └── Resource Management\n├── Core Processes (Level 2)\n│   ├── Design Controls\n│   ├── Production Controls\n│   └── Service Controls\n└── Support Processes (Level 2)\n    ├── Document Control\n    ├── Training\n    └── CAPA\n```\n\n### 2. REGULATORY MAPPING\n\n#### Standards Compliance Matrix\n| Standard | Requirements | Our Approach | Gaps | Timeline |\n|----------|--------------|--------------|------|----------|\n| ISO 13485:2016 | {{iso_reqs}} | {{iso_approach}} | {{iso_gaps}} | {{iso_time}} |\n| FDA QMSR | {{fda_reqs}} | {{fda_approach}} | {{fda_gaps}} | {{fda_time}} |\n| EU MDR | {{mdr_reqs}} | {{mdr_approach}} | {{mdr_gaps}} | {{mdr_time}} |\n\n### 3. PROCESS DEVELOPMENT\n\nFor each core process:\n\n#### Process Definition Template\n- Process Name: {{name}}\n- Purpose: {{purpose}}\n- Scope: {{scope}}\n- Inputs: {{inputs}}\n- Outputs: {{outputs}}\n- Resources: {{resources}}\n- Metrics: {{metrics}}\n- Records: {{records}}\n\n### 4. DESIGN CONTROLS\nUsing CAP-QMS-002:\n\n#### Design Control Implementation\n- Design planning procedures\n- Input/output requirements\n- Verification protocols\n- Validation protocols\n- Design review gates\n- Change control process\n- Design history file\n\n### 5. RISK MANAGEMENT\nUsing CAP-QMS-003:\n\n#### Risk Management Framework\n- Risk management plan\n- Hazard identification\n- Risk assessment matrix\n- Risk control measures\n- Residual risk evaluation\n- Risk management report\n\n### 6. DOCUMENT CONTROL\n\n#### Documentation Hierarchy\n- Naming conventions\n- Version control\n- Review/approval matrix\n- Distribution control\n- Obsolete document control\n\n### 7. TRAINING PROGRAM\n\n#### Training Matrix\n| Role | QMS Overview | Specific Processes | Competency | Frequency |\n|------|--------------|-------------------|------------|-----------||\n| {{role_1}} | {{qms_1}} | {{process_1}} | {{comp_1}} | {{freq_1}} |\n\n### 8. IMPLEMENTATION PHASES\n\nPhase 1: Foundation (Months 1-2)\n- Quality manual\n- Core procedures\n- Document control\n\nPhase 2: Process Implementation (Months 3-4)\n- Design controls\n- Production controls\n- CAPA system\n\nPhase 3: Validation (Months 5-6)\n- Internal audits\n- Management review\n- Certification prep\n\n### 9. METRICS AND MONITORING\n\n#### QMS Performance Metrics\n- On-time delivery: >95%\n- Complaint rate: <2%\n- CAPA closure: <60 days\n- Audit findings: Zero critical\n- Training completion: 100%\n\n### 10. CERTIFICATION STRATEGY\n\n#### ISO 13485 Certification Path\n- Gap assessment: {{gap_date}}\n- Implementation: {{impl_date}}\n- Internal audit: {{audit_date}}\n- Stage 1 audit: {{stage1_date}}\n- Stage 2 audit: {{stage2_date}}\n- Certification: {{cert_date}}\n\n## DELIVERABLES\n1. Quality manual\n2. QMS procedures (25+)\n3. Work instructions\n4. Forms and templates\n5. Training materials\n6. Implementation project plan\n7. Audit checklist\n8. Management review package",
  "input_requirements": [
    "Company information",
    "Product portfolio",
    "Regulatory requirements",
    "Current state assessment",
    "Resource availability"
  ],
  "output_specification": "Complete QMS implementation package with certification roadmap",
  "success_criteria": "Achieve ISO 13485 certification within 6 months"
}
```

---

## 🤖 AI/ML PROMPTS

### PS-AI-001: AI Algorithm Validation Protocol
```json
{
  "prompt_id": "PS-AI-001",
  "prompt_starter": "Create AI/ML validation protocol",
  "category": "technical",
  "complexity": "complex",
  "estimated_time": "30 minutes",
  "required_capabilities": ["CAP-AI-001", "CAP-AI-002"],
  "detailed_prompt": "Develop a comprehensive validation protocol for an AI/ML algorithm in healthcare.\n\n## ALGORITHM INFORMATION\n- Algorithm Type: {{algorithm_type}}\n- Clinical Application: {{application}}\n- Training Data: {{training_data}}\n- Performance Claims: {{claims}}\n- Regulatory Path: {{regulatory}}\n\n## VALIDATION PROTOCOL\n\n### 1. ANALYTICAL VALIDATION\nUsing CAP-AI-001:\n\n#### Standalone Performance Testing\n- Test dataset size: {{test_size}}\n- Performance metrics:\n  * Sensitivity: {{sensitivity}}\n  * Specificity: {{specificity}}\n  * AUC-ROC: {{auc}}\n  * PPV/NPV: {{ppv_npv}}\n\n#### Robustness Testing\n- Input variations\n- Edge cases\n- Failure modes\n- Adversarial testing\n\n### 2. CLINICAL VALIDATION\n\n#### Study Design\n- Type: {{study_type}}\n- Sites: {{n_sites}}\n- Sample size: {{sample_size}}\n- Ground truth: {{ground_truth}}\n- Success criteria: {{criteria}}\n\n### 3. BIAS ASSESSMENT\n\n#### Demographic Analysis\n| Subgroup | N | Performance | 95% CI | Bias Detected |\n|----------|---|-------------|---------|---------------|\n| {{group_1}} | {{n_1}} | {{perf_1}} | {{ci_1}} | {{bias_1}} |\n\n### 4. EXPLAINABILITY\nUsing CAP-AI-002:\n\n#### Interpretability Methods\n- Feature importance\n- SHAP values\n- Attention maps\n- Confidence scores\n\n### 5. CONTINUOUS MONITORING\n\n#### Performance Monitoring Plan\n- Drift detection\n- Performance thresholds\n- Update triggers\n- Retraining protocol\n\n## DELIVERABLES\n1. Validation protocol\n2. Test reports\n3. FDA submission package\n4. Monitoring plan\n5. User documentation",
  "input_requirements": [
    "Algorithm specifications",
    "Training data description",
    "Performance requirements",
    "Regulatory pathway",
    "Clinical use case"
  ],
  "output_specification": "Complete validation package meeting FDA AI/ML guidance",
  "success_criteria": "Algorithm meets all performance targets with no significant bias"
}
```

---

## 📋 Prompt Management

### Version Control
```json
{
  "prompt_version": "1.0.0",
  "last_updated": "2025-01-17",
  "update_log": [
    {
      "version": "1.0.0",
      "date": "2025-01-17",
      "changes": "Initial prompt library creation",
      "author": "System"
    }
  ]
}
```

### Prompt Dependencies
```json
{
  "dependencies": {
    "PS-FDA-001": ["CAP-FDA-001", "CAP-FDA-002"],
    "PS-CT-001": ["CAP-CT-001", "CAP-CT-002", "CAP-CT-003"],
    "PS-HIPAA-001": ["CAP-HIPAA-001", "CAP-HIPAA-002"],
    "PS-REIMB-001": ["CAP-REIMB-001", "CAP-REIMB-002", "CAP-REIMB-003"],
    "PS-QMS-001": ["CAP-QMS-001", "CAP-QMS-002", "CAP-QMS-003"]
  }
}
```

---

## 🚦 Prompt Execution Protocol

### Loading Process
```python
def load_prompt(prompt_id):
    """
    Load a specific prompt from the library
    
    Args:
        prompt_id (str): Unique prompt identifier
    
    Returns:
        dict: Complete prompt definition
    """
    prompt = fetch_from_prompt_library(prompt_id)
    validate_prompt(prompt)
    load_required_capabilities(prompt["required_capabilities"])
    return prompt
```

### Variable Substitution
```python
def prepare_prompt(prompt_template, user_inputs):
    """
    Replace placeholders with user-provided values
    
    Args:
        prompt_template (str): Template with {{placeholders}}
        user_inputs (dict): User-provided values
    
    Returns:
        str: Prepared prompt ready for execution
    """
    for key, value in user_inputs.items():
        placeholder = f"{{{{{key}}}}}"
        prompt_template = prompt_template.replace(placeholder, value)
    return prompt_template
```

### Execution and Response
```python
def execute_prompt(agent, prompt_id, user_inputs):
    """
    Execute a prompt with given inputs
    
    Args:
        agent: The agent instance
        prompt_id (str): Prompt to execute
        user_inputs (dict): User-provided information
    
    Returns:
        dict: Execution results
    """
    prompt = load_prompt(prompt_id)
    prepared_prompt = prepare_prompt(prompt["detailed_prompt"], user_inputs)
    
    # Execute with required capabilities loaded
    response = agent.execute(
        prompt=prepared_prompt,
        capabilities=prompt["required_capabilities"],
        max_time=prompt["estimated_time"]
    )
    
    # Validate response meets success criteria
    validate_response(response, prompt["success_criteria"])
    
    return response
```

---

## 📊 Prompt Performance Tracking

### Usage Metrics
```json
{
  "metrics_to_track": {
    "execution_count": "Number of times each prompt is used",
    "success_rate": "Percentage meeting success criteria",
    "average_time": "Mean execution time",
    "user_satisfaction": "Rating after execution",
    "revision_requests": "Number of refinement requests",
    "capability_usage": "Which capabilities were activated"
  }
}
```

### Quality Improvement
```json
{
  "improvement_process": {
    "feedback_collection": "After each execution",
    "review_frequency": "Weekly analysis",
    "update_triggers": [
      "Success rate <80%",
      "User satisfaction <4.0",
      "Execution time >2x estimate",
      "Regulatory changes",
      "New best practices"
    ],
    "testing_protocol": "Test updates with sample data",
    "rollout_strategy": "Gradual deployment with monitoring"
  }
}
```

---

## 🔧 Prompt Customization Guide

### Creating New Prompts
1. Use the template structure
2. Define clear input requirements
3. Specify required capabilities
4. Set realistic time estimates
5. Include success criteria
6. Test with sample data
7. Document limitations

### Modifying Existing Prompts
1. Version the changes
2. Update dependencies if needed
3. Test backward compatibility
4. Update documentation
5. Notify users of changes

### Best Practices
- Use consistent placeholder naming
- Include example inputs
- Provide output templates
- Set measurable success criteria
- Document edge cases
- Include error handling

---

*Document 3 Version: 1.0*
*Last Updated: January 17, 2025*
*Next Review: February 17, 2025*