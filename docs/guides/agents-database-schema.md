# Notion Database Schema - VITAL Path Agents

## Database Name: VITAL Path - Agents Registry

### Properties (Columns) to Create:

#### Core Information
1. **Name** (Title) - Primary field
2. **Display Name** (Text)
3. **Description** (Text - Long)
4. **Avatar** (Text) - e.g., "avatar_0001"
5. **Status** (Select)
   - Options: Active, Inactive, Development, Testing, Deprecated, Planned, Pipeline
   - Colors: Active=Green, Inactive=Gray, Development=Blue, Testing=Yellow, Deprecated=Red, Planned=Purple, Pipeline=Indigo

#### Classification
6. **Tier** (Select)
   - Options: Core (0), Tier 1, Tier 2, Tier 3
   - Colors: Core=Purple, Tier 1=Blue, Tier 2=Green, Tier 3=Orange
7. **Department** (Text)
8. **Role** (Text)
9. **Business Function** (Select)
   - Options: Clinical Development, Regulatory Affairs, Medical Affairs, Commercial, Pharmacovigilance, Operations, Quality Assurance

#### Technical Configuration
10. **Model** (Select)
    - Options: gpt-4, gpt-4-turbo, gpt-3.5-turbo, claude-3-opus, claude-3-sonnet
11. **Temperature** (Number) - Range 0.0 to 1.0
12. **Max Tokens** (Number)
13. **System Prompt** (Text - Long)

#### Capabilities & Domain
14. **Capabilities** (Multi-select)
    - Add as needed: Clinical Research, Regulatory Affairs, Data Analysis, etc.
15. **Domain Expertise** (Select)
    - Options: General, Regulatory, Clinical, Market Access, Quality, Safety, Commercial, Legal, Analytics
16. **Medical Specialty** (Text)

#### Compliance & Security
17. **HIPAA Compliant** (Checkbox)
18. **GDPR Compliant** (Checkbox)
19. **Pharma Enabled** (Checkbox)
20. **Data Classification** (Select)
    - Options: Public, Internal, Confidential, Restricted

#### Metrics
21. **Accuracy Score** (Number) - 0.0 to 1.0
22. **Priority** (Number) - 1 to 999
23. **Cost per Query** (Number)
24. **Total Interactions** (Number)

#### Metadata
25. **Created Date** (Created time)
26. **Last Edited** (Last edited time)
27. **Is Public** (Checkbox)
28. **Is Custom** (Checkbox)

#### Relations (Optional - create if you want linked databases)
29. **Related Capabilities** (Relation to Capabilities database)
30. **Parent Agent** (Relation to same database - self-reference)

---

## How to Create in Notion:

1. Go to your Notion workspace
2. Create a new page
3. Add a Database (Table view)
4. Name it: "VITAL Path - Agents Registry"
5. Add each property above using the "+ Add a property" button
6. Set the correct property type for each
7. Configure Select/Multi-select options as listed
8. Share the database with your Notion integration

---

## Export URL Format:
After creating, share the database URL here so I can configure the sync.
