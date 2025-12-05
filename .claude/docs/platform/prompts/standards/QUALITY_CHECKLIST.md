# Prompt Quality Checklist

## Pre-Creation Checklist

Before creating prompt starters for an agent, verify:

- [ ] Agent level is correctly assigned (L1-L5)
- [ ] Agent has a complete system prompt
- [ ] Agent function and department are set
- [ ] Agent capabilities/description are defined

---

## Prompt Starter Quality Checklist

### L2 Expert Starters

| Criteria | Requirement | Check |
|----------|-------------|-------|
| Length | 120-200+ characters | [ ] |
| Scope | Comprehensive, multi-faceted | [ ] |
| Language | Strategic (develop, design, create, build, evaluate) | [ ] |
| Specificity | Names components, stakeholders, outcomes | [ ] |
| Level-appropriate | Leadership-level deliverable | [ ] |
| No placeholders | No "System prompt for..." text | [ ] |

### L3 Specialist Starters

| Criteria | Requirement | Check |
|----------|-------------|-------|
| Length | 80-150+ characters | [ ] |
| Scope | Single task, specific deliverable | [ ] |
| Language | Action-oriented (draft, analyze, prepare, review, create) | [ ] |
| Specificity | Clear expected output | [ ] |
| Domain terms | Uses domain-specific terminology | [ ] |
| No placeholders | No "System prompt for..." text | [ ] |

### L4 Worker Starters

| Criteria | Requirement | Check |
|----------|-------------|-------|
| Length | 60-100 characters | [ ] |
| Scope | Single repetitive operation | [ ] |
| Language | Process-oriented (track, process, generate, validate) | [ ] |
| Cross-functional | Applicable across departments | [ ] |
| Clear I/O | Input → Output is obvious | [ ] |
| No placeholders | No "System prompt for..." text | [ ] |

### L5 Tool Starters

| Criteria | Requirement | Check |
|----------|-------------|-------|
| Length | 50-100 characters | [ ] |
| Scope | Single tool function | [ ] |
| Language | Function verbs (search, calculate, compare, convert) | [ ] |
| Parameters | Clear input parameters | [ ] |
| Output | Expected output defined | [ ] |
| Composable | Can be used in workflows | [ ] |

---

## Common Issues to Avoid

### ❌ Placeholder Text
```
Bad: "System prompt for Medical Writer"
Good: "Draft a clinical study report following ICH E3 guidelines"
```

### ❌ Incomplete Sentences
```
Bad: "Analyze pricing strategies our top"
Good: "Analyze pricing strategies for our top 5 competitors"
```

### ❌ Too Vague
```
Bad: "Help me with planning"
Good: "Help me plan a KOL engagement strategy for our oncology launch"
```

### ❌ Too Short
```
Bad: "Write report" (12 chars)
Good: "Write a quarterly medical affairs activity report with KPIs" (60 chars)
```

### ❌ Wrong Level Complexity
```
Bad (L4 with L2 task): "Develop comprehensive strategy..."
Good (L4): "Track pending approvals and flag overdue items"
```

---

## Rich Prompt Quality Checklist

### Structure Requirements

- [ ] Clear section headers
- [ ] Context required section
- [ ] Deliverables or output defined
- [ ] Step-by-step framework if complex
- [ ] Appropriate length (500-2000 chars)

### Content Requirements

- [ ] Domain-accurate terminology
- [ ] Relevant to agent capabilities
- [ ] Actionable instructions
- [ ] Complete sentences
- [ ] Professional tone

### Technical Requirements

- [ ] Correct `role_type` (user/system)
- [ ] Appropriate `category`
- [ ] Accurate `complexity` level
- [ ] Relevant `tags` array
- [ ] Valid `allowed_tenants` UUIDs

---

## Batch Review Process

When reviewing prompts in bulk:

1. **Export current starters**
   ```sql
   SELECT a.display_name, al.name, aps.text, LENGTH(aps.text)
   FROM agent_prompt_starters aps
   JOIN agents a ON a.id = aps.agent_id
   JOIN agent_levels al ON a.agent_level_id = al.id
   ORDER BY al.level_number, a.display_name;
   ```

2. **Identify quality issues**
   ```sql
   -- Find short starters
   SELECT * FROM agent_prompt_starters WHERE LENGTH(text) < 50;

   -- Find placeholder text
   SELECT * FROM agent_prompt_starters WHERE text LIKE '%System prompt%';
   ```

3. **Verify coverage**
   ```sql
   -- Agents without enough starters
   SELECT a.display_name, COUNT(aps.id)
   FROM agents a
   LEFT JOIN agent_prompt_starters aps ON aps.agent_id = a.id
   GROUP BY a.id
   HAVING COUNT(aps.id) < 4;
   ```

4. **Run quality report**
   ```sql
   SELECT * FROM v_ma_prompt_coverage;
   ```

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Content Owner | | | |
| Quality Reviewer | | | |
| Technical Validator | | | |
