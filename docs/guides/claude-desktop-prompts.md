# Prompts for Claude Desktop with Notion MCP

Copy these prompts one at a time to Claude Desktop to create the databases.

## Prompt 1: Create Agents Database

```
Using the Notion MCP server, create a new workspace-level database with these specifications:

Database Name: "VITAL Path - Agents Registry"
Type: Table database

Properties:
1. Name (title)
2. Display Name (text)
3. Description (text)
4. Avatar (text)
5. Status (select) - Options: Active, Inactive, Development, Testing, Deprecated, Planned, Pipeline
6. Tier (select) - Options: Core, Tier 1, Tier 2, Tier 3
7. Department (text)
8. Role (text)
9. Business Function (select) - Options: Clinical Development, Regulatory Affairs, Medical Affairs, Commercial, Pharmacovigilance, Operations, Quality Assurance
10. Model (select) - Options: gpt-4, gpt-4-turbo, gpt-3.5-turbo, claude-3-opus, claude-3-sonnet
11. Temperature (number)
12. Max Tokens (number)
13. System Prompt (text)
14. Capabilities (multi_select)
15. Domain Expertise (select) - Options: General, Regulatory, Clinical, Market Access, Quality, Safety, Commercial, Legal, Analytics
16. Medical Specialty (text)
17. HIPAA Compliant (checkbox)
18. GDPR Compliant (checkbox)
19. Pharma Enabled (checkbox)
20. Data Classification (select) - Options: Public, Internal, Confidential, Restricted
21. Accuracy Score (number)
22. Priority (number)
23. Cost per Query (number)
24. Total Interactions (number)
25. Is Public (checkbox)
26. Is Custom (checkbox)
27. Created Date (created_time)
28. Last Edited (last_edited_time)

After creating, please give me:
1. The database page ID
2. The full URL to the database
```

## Prompt 2: Create Capabilities Database

```
Using the Notion MCP server, create a new workspace-level database with these specifications:

Database Name: "VITAL Path - Capabilities Registry"
Type: Table database

Properties:
1. Name (title)
2. Capability Key (text)
3. Description (text)
4. Category (select) - Options: Clinical, Regulatory, Analytics, Research, Compliance, Commercial, Quality, Safety, Education
5. Domain (select) - Options: Healthcare, Medical Devices, Technology, General
6. Stage (select) - Options: Unmet Needs Investigation, Solution Design, Prototyping Development, Clinical Validation, Regulatory Pathway, Reimbursement Strategy, Go To Market, Post Market Optimization
7. VITAL Component (select) - Options: Innovation, Trust, Evidence, Market Access, Lifecycle
8. Priority (select) - Options: Critical, High, Medium, Low
9. Maturity (select) - Options: Concept, Pilot, Production Ready, Mature, Legacy
10. Complexity Level (select) - Options: Basic, Intermediate, Advanced, Expert
11. Is New (checkbox)
12. Panel Recommended (checkbox)
13. Is Premium (checkbox)
14. Competencies (multi_select)
15. Tools (multi_select)
16. Knowledge Base (multi_select)
17. Usage Count (number)
18. Success Rate (number)
19. Average Execution Time (number)
20. Implementation Timeline (number)
21. Icon (text)
22. Color (text)
23. Created Date (created_time)
24. Last Edited (last_edited_time)

After creating, please give me:
1. The database page ID
2. The full URL to the database
```

## Prompt 3: Link the Databases

```
Using the Notion MCP server:

1. Add a relation property to "VITAL Path - Agents Registry" called "Related Capabilities" that links to "VITAL Path - Capabilities Registry"

2. Add a relation property to "VITAL Path - Capabilities Registry" called "Linked Agents" that links to "VITAL Path - Agents Registry"

Please confirm when done.
```

---

## After Creation

Once Claude Desktop creates these and gives you the database IDs, come back here and provide:

1. **Agents Database ID**: (e.g., `abc123...`)
2. **Agents Database URL**: (e.g., `https://notion.so/...`)
3. **Capabilities Database ID**: (e.g., `xyz789...`)
4. **Capabilities Database URL**: (e.g., `https://notion.so/...`)

Then I'll configure the sync scripts to connect them to your Supabase database!
