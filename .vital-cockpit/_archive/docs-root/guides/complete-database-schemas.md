# Complete VITAL Path Database Schemas for Notion

## Database 1: Organizational Functions (org_functions)

**Name:** VITAL Path - Organizational Functions

**Properties:**
1. **Name** (Title) - e.g., "Clinical Development"
2. **Function Code** (Text) - e.g., "CLIN_DEV"
3. **Description** (Text)
4. **Parent Function** (Relation to same database)
5. **Department Count** (Rollup from departments)
6. **Icon** (Text) - Emoji
7. **Color** (Select) - Options: Blue, Green, Purple, Orange, Red, Teal, Gray
8. **Is Active** (Checkbox)
9. **Sort Order** (Number)
10. **Created Date** (Created time)
11. **Last Edited** (Last edited time)

---

## Database 2: Departments (org_departments)

**Name:** VITAL Path - Departments

**Properties:**
1. **Name** (Title) - e.g., "Clinical Research"
2. **Department Code** (Text) - e.g., "CLIN_RES"
3. **Description** (Text)
4. **Function** (Relation to org_functions)
5. **Head of Department** (Text)
6. **Team Size** (Number)
7. **Budget** (Number)
8. **Location** (Multi-select) - Options: Remote, US, EU, APAC, Global
9. **Is Active** (Checkbox)
10. **Created Date** (Created time)
11. **Last Edited** (Last edited time)

---

## Database 3: Roles (org_roles)

**Name:** VITAL Path - Roles

**Properties:**
1. **Name** (Title) - e.g., "Clinical Research Specialist"
2. **Role Code** (Text) - e.g., "CLIN_SPEC"
3. **Description** (Text)
4. **Function** (Relation to org_functions)
5. **Department** (Relation to org_departments)
6. **Level** (Select) - Options: Entry, Mid, Senior, Lead, Principal, Executive
7. **Required Skills** (Multi-select)
8. **Responsibilities Count** (Rollup)
9. **Salary Range** (Text)
10. **Is Active** (Checkbox)
11. **Created Date** (Created time)
12. **Last Edited** (Last edited time)

---

## Database 4: Responsibilities (org_responsibilities)

**Name:** VITAL Path - Responsibilities

**Properties:**
1. **Name** (Title) - Description of responsibility
2. **Role** (Relation to org_roles)
3. **Category** (Select) - Options: Leadership, Execution, Analysis, Communication, Compliance, Innovation
4. **Priority** (Select) - Options: Critical, High, Medium, Low
5. **Time Allocation** (Number) - Percentage
6. **Required Competencies** (Relation to competencies)
7. **Is Active** (Checkbox)
8. **Created Date** (Created time)
9. **Last Edited** (Last edited time)

---

## Database 5: Agents (agents)

**Name:** VITAL Path - Agents Registry

**Properties:**
1. **Name** (Title)
2. **Display Name** (Text)
3. **Description** (Text)
4. **Avatar** (Text)
5. **Status** (Select) - Options: Active, Inactive, Development, Testing, Deprecated, Planned, Pipeline
6. **Tier** (Select) - Options: Core, Tier 1, Tier 2, Tier 3
7. **Department** (Relation to org_departments)
8. **Role** (Relation to org_roles)
9. **Function** (Relation to org_functions)
10. **Model** (Select) - Options: gpt-4, gpt-4-turbo, claude-3-opus, claude-3-sonnet, gemini-pro
11. **Temperature** (Number)
12. **Max Tokens** (Number)
13. **System Prompt** (Text)
14. **Capabilities** (Relation to capabilities)
15. **Competencies** (Relation to competencies)
16. **Tools** (Relation to tools)
17. **Workflows** (Relation to workflows)
18. **Prompts** (Relation to prompts)
19. **Domain Expertise** (Select) - Options: General, Regulatory, Clinical, Market Access, Quality, Safety, Commercial, Legal, Analytics
20. **Medical Specialty** (Text)
21. **HIPAA Compliant** (Checkbox)
22. **GDPR Compliant** (Checkbox)
23. **Pharma Enabled** (Checkbox)
24. **Data Classification** (Select) - Options: Public, Internal, Confidential, Restricted
25. **Accuracy Score** (Number)
26. **Priority** (Number)
27. **Cost per Query** (Number)
28. **Total Interactions** (Number)
29. **Is Public** (Checkbox)
30. **Is Custom** (Checkbox)
31. **Created Date** (Created time)
32. **Last Edited** (Last edited time)

---

## Database 6: Prompts (prompts)

**Name:** VITAL Path - Prompts Library

**Properties:**
1. **Name** (Title)
2. **Prompt Text** (Text)
3. **Category** (Select) - Options: Medical, Regulatory, Process, Clinical, Commercial, Quality
4. **Type** (Select) - Options: Starter, Template, Example, Guide
5. **Agents** (Relation to agents)
6. **Use Cases** (Multi-select)
7. **Variables** (Multi-select) - Placeholders like {patient_id}
8. **Expected Output** (Text)
9. **Complexity** (Select) - Options: Simple, Moderate, Complex
10. **Usage Count** (Number)
11. **Rating** (Number) - 1-5
12. **Is Active** (Checkbox)
13. **Created Date** (Created time)
14. **Last Edited** (Last edited time)

---

## Database 7: Capabilities (capabilities)

**Name:** VITAL Path - Capabilities Registry

**Properties:**
1. **Name** (Title)
2. **Capability Key** (Text)
3. **Description** (Text)
4. **Category** (Select) - Options: Clinical, Regulatory, Analytics, Research, Compliance, Commercial, Quality, Safety, Education
5. **Domain** (Select) - Options: Healthcare, Medical Devices, Technology, General
6. **Stage** (Select) - Options: Unmet Needs Investigation, Solution Design, Prototyping Development, Clinical Validation, Regulatory Pathway, Reimbursement Strategy, Go To Market, Post Market Optimization
7. **VITAL Component** (Select) - Options: Innovation, Trust, Evidence, Market Access, Lifecycle
8. **Priority** (Select) - Options: Critical, High, Medium, Low
9. **Maturity** (Select) - Options: Concept, Pilot, Production Ready, Mature, Legacy
10. **Complexity Level** (Select) - Options: Basic, Intermediate, Advanced, Expert
11. **Required Competencies** (Relation to competencies)
12. **Required Tools** (Relation to tools)
13. **Agents** (Relation to agents)
14. **Is New** (Checkbox)
15. **Panel Recommended** (Checkbox)
16. **Is Premium** (Checkbox)
17. **Usage Count** (Number)
18. **Success Rate** (Number)
19. **Implementation Timeline** (Number)
20. **Icon** (Text)
21. **Color** (Text)
22. **Created Date** (Created time)
23. **Last Edited** (Last edited time)

---

## Database 8: Competencies (competencies)

**Name:** VITAL Path - Competencies

**Properties:**
1. **Name** (Title)
2. **Description** (Text)
3. **Category** (Select) - Options: Technical, Clinical, Regulatory, Leadership, Communication, Analytics
4. **Level Required** (Select) - Options: Beginner, Intermediate, Advanced, Expert
5. **Capabilities** (Relation to capabilities)
6. **Roles** (Relation to org_roles)
7. **Training Resources** (Multi-select)
8. **Assessment Criteria** (Text)
9. **Is Core** (Checkbox)
10. **Created Date** (Created time)
11. **Last Edited** (Last edited time)

---

## Database 9: RAG Documents (rag_documents)

**Name:** VITAL Path - RAG Knowledge Base

**Properties:**
1. **Name** (Title)
2. **Document Type** (Select) - Options: FDA Guidance, Clinical Protocol, Research Paper, SOP, Guideline, Policy
3. **Content** (Text)
4. **Source URL** (URL)
5. **Category** (Select) - Options: Regulatory, Clinical, Quality, Safety, Commercial
6. **Agents** (Relation to agents)
7. **Capabilities** (Relation to capabilities)
8. **Document Date** (Date)
9. **Version** (Text)
10. **Status** (Select) - Options: Active, Archived, Superseded, Draft
11. **Chunk Count** (Number)
12. **Vector Embedded** (Checkbox)
13. **Tags** (Multi-select)
14. **File URL** (URL)
15. **Created Date** (Created time)
16. **Last Edited** (Last edited time)

---

## Database 10: Tools (tools)

**Name:** VITAL Path - Tools Registry

**Properties:**
1. **Name** (Title)
2. **Description** (Text)
3. **Type** (Select) - Options: API, Database, Analysis, Reporting, Integration, Search
4. **Category** (Select) - Options: Clinical, Regulatory, Analytics, Communication, Productivity
5. **API Endpoint** (URL)
6. **Configuration** (Text) - JSON config
7. **Agents** (Relation to agents)
8. **Capabilities** (Relation to capabilities)
9. **Authentication Required** (Checkbox)
10. **Rate Limit** (Text)
11. **Cost Model** (Select) - Options: Free, Per Use, Subscription, Enterprise
12. **Documentation URL** (URL)
13. **Is Active** (Checkbox)
14. **Created Date** (Created time)
15. **Last Edited** (Last edited time)

---

## Database 11: Workflows (workflows)

**Name:** VITAL Path - Workflows

**Properties:**
1. **Name** (Title)
2. **Description** (Text)
3. **Type** (Select) - Options: Clinical, Regulatory, Commercial, Quality, Operations
4. **Agents Involved** (Relation to agents)
5. **Steps** (Text) - JSON array or numbered list
6. **Trigger Conditions** (Text)
7. **Expected Duration** (Number) - in minutes
8. **Success Criteria** (Text)
9. **Capabilities Required** (Relation to capabilities)
10. **Status** (Select) - Options: Active, Testing, Deprecated, Planned
11. **Automation Level** (Select) - Options: Manual, Semi-Automated, Fully Automated
12. **Usage Count** (Number)
13. **Success Rate** (Number)
14. **Created Date** (Created time)
15. **Last Edited** (Last edited time)

---

## Database 12: Jobs to Be Done (jobs_to_be_done)

**Name:** VITAL Path - Jobs to Be Done

**Properties:**
1. **Job Statement** (Title) - "When [situation], I want to [motivation], so I can [outcome]"
2. **Category** (Select) - Options: Clinical Development, Regulatory, Market Access, Quality, Safety, Commercial
3. **User Persona** (Select) - Options: Clinician, Researcher, Regulatory Specialist, Medical Affairs, Commercial
4. **Situation** (Text)
5. **Motivation** (Text)
6. **Expected Outcome** (Text)
7. **Current Solution** (Text)
8. **Pain Points** (Multi-select)
9. **Agents** (Relation to agents)
10. **Workflows** (Relation to workflows)
11. **Capabilities** (Relation to capabilities)
12. **Priority** (Select) - Options: Critical, High, Medium, Low
13. **Frequency** (Select) - Options: Daily, Weekly, Monthly, Quarterly, Annually
14. **Complexity** (Select) - Options: Simple, Moderate, Complex
15. **Success Metrics** (Text)
16. **Is Solved** (Checkbox)
17. **Created Date** (Created time)
18. **Last Edited** (Last edited time)

---

## Database Relations Summary

```
org_functions ← org_departments ← org_roles → org_responsibilities → competencies
                                       ↓
agents ← capabilities ← competencies
  ↓         ↓
tools    workflows
  ↓         ↓
prompts  jobs_to_be_done
  ↓
rag_documents
```
