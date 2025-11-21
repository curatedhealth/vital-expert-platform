# Notion Database Schema - VITAL Path Capabilities

## Database Name: VITAL Path - Capabilities Registry

### Properties (Columns) to Create:

#### Core Information
1. **Name** (Title) - Primary field
2. **Capability Key** (Text) - snake_case identifier
3. **Description** (Text - Long) - Use bullet points with •

#### Classification
4. **Category** (Select)
   - Options: Clinical, Regulatory, Analytics, Research, Compliance, Commercial, Quality, Safety, Education
   - Colors: Clinical=Green, Regulatory=Blue, Analytics=Red, etc.

5. **Domain** (Select)
   - Options: Healthcare, Medical Devices, Technology, General
   - Colors: Healthcare=Green, Medical Devices=Blue, Technology=Purple, General=Gray

6. **Stage** (Select) - Lifecycle stage
   - Options:
     - Unmet Needs Investigation
     - Solution Design
     - Prototyping Development
     - Clinical Validation
     - Regulatory Pathway
     - Reimbursement Strategy
     - Go To Market
     - Post Market Optimization

7. **VITAL Component** (Select)
   - Options: Innovation, Trust, Evidence, Market Access, Lifecycle
   - Colors: Innovation=Orange, Trust=Blue, Evidence=Green, Market Access=Purple, Lifecycle=Teal

#### Priority & Maturity
8. **Priority** (Select)
   - Options: Critical, High, Medium, Low
   - Colors: Critical=Red, High=Orange, Medium=Yellow, Low=Gray

9. **Maturity** (Select)
   - Options: Concept, Pilot, Production Ready, Mature, Legacy
   - Colors: Concept=Purple, Pilot=Blue, Production Ready=Green, Mature=Gray, Legacy=Red

10. **Complexity Level** (Select)
    - Options: Basic, Intermediate, Advanced, Expert
    - Colors: Basic=Green, Intermediate=Blue, Advanced=Orange, Expert=Red

#### Features
11. **Is New** (Checkbox)
12. **Panel Recommended** (Checkbox)
13. **Is Premium** (Checkbox)

#### Configuration
14. **Competencies** (Multi-select) - Add as needed
15. **Tools** (Multi-select) - Add as needed
16. **Knowledge Base** (Multi-select) - Add as needed
17. **Prerequisites** (Text) - JSON array or comma-separated

#### Metrics
18. **Usage Count** (Number)
19. **Success Rate** (Number) - 0.0 to 100.0
20. **Average Execution Time** (Number) - in milliseconds
21. **Implementation Timeline** (Number) - in days

#### Display
22. **Icon** (Text) - Emoji like 🔬
23. **Color** (Select)
    - Options: text-medical-blue, text-clinical-green, text-regulatory-gold, text-innovation-orange, text-market-purple

#### Metadata
24. **Created Date** (Created time)
25. **Last Edited** (Last edited time)

#### Relations
26. **Linked Agents** (Relation to Agents database)
27. **Depends On** (Relation to same database - prerequisites)
28. **Enables** (Relation to same database - what this unlocks)

---

## How to Create in Notion:

1. Create a new database page
2. Name it: "VITAL Path - Capabilities Registry"
3. Add all properties above
4. Configure options for Select fields
5. Link to Agents database for Relations
6. Share with your Notion integration
