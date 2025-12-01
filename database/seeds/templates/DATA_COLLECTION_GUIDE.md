# Role Enrichment Data Collection Guide

**Purpose:** Help you gather accurate, comprehensive role data from subject matter experts and role incumbents

**Time Required:** 30-45 minutes per role interview

---

## 🎯 Interview Preparation

### Before the Interview

**Select Interview Subjects:**
- [ ] 2-3 current role incumbents (different experience levels)
- [ ] Direct manager of the role
- [ ] 1-2 stakeholders who work closely with the role

**Schedule:**
- 45-60 minute sessions
- Separate individual interviews (not group)
- Record if permitted (with consent)

**Send Pre-Work:**
Share these questions 2-3 days before:
1. What are your top 5 daily activities?
2. What are the 3 most important outcomes you deliver?
3. What skills/knowledge are essential to succeed?
4. What are your biggest challenges?

---

## 📋 Interview Question Guide

### Section 1: Role Overview (5 minutes)

**Opening Questions:**
1. "How would you describe this role to someone outside the company?"
2. "What's the 'elevator pitch' for what you do?"
3. "In your own words, what makes this role unique in pharma/biotech?"

**What You're Capturing:**
- role_name, role_title
- description
- role_type (Field-based, Office-based, Hybrid, Lab-based)

---

### Section 2: Experience & Qualifications (5 minutes)

**Questions:**
1. "What education/degree is required? What's preferred?"
2. "How many years of experience did you have when you started?"
3. "What prior roles typically prepare someone for this position?"
4. "What certifications or licenses are required? Which are nice-to-have?"

**What You're Capturing:**
- years_experience_min, years_experience_max
- required_education
- required_certifications
- preferred_background
- career_path_progression (from roles)

**Probing Questions:**
- "Can someone fresh out of school do this role, or do they need experience?"
- "Are there specific certifications that are deal-breakers?"
- "What's the typical career path to get here?"

---

### Section 3: Skills & Competencies (10 minutes)

**Questions:**
1. "What are the top 5 skills someone MUST have to succeed?"
2. "What technical skills do you use daily?"
3. "What clinical/pharma knowledge is essential?"
4. "What soft skills matter most?"
5. "If you were hiring someone for this role, what would you test them on?"

**What You're Capturing:**
- required_skills
- clinical_competencies
- soft_skills
- technical_skills

**Probing Questions:**
- "Give me an example of how you use [skill] in your work"
- "How long did it take you to develop [competency]?"
- "What happens if someone lacks [skill]?"

**Red Flags to Listen For:**
- Vague answers ("good communication skills")
- Skills that apply to every role (too generic)
- Lists that are too long (prioritize!)

---

### Section 4: Pharmaceutical/Regulatory Context (8 minutes)

**Questions:**
1. "Does this role require GxP training? Which type(s)?"
2. "What regulatory frameworks must you comply with?"
3. "Do you interact with patients? Healthcare providers?"
4. "Which clinical trial phases do you work on?"
5. "What therapeutic areas do you support?"
6. "Are you involved in drug safety/pharmacovigilance?"

**What You're Capturing:**
- gxp_critical (yes/no)
- gxp_types (GCP, GMP, GLP, GVP, GDP)
- regulatory_frameworks
- patient_facing, hcp_facing
- clinical_trial_phases
- therapeutic_areas
- safety_critical

**Probing Questions:**
- "Walk me through what happens if you discover an adverse event"
- "What would happen if you didn't follow [regulatory requirement]?"
- "How often do you get audited or inspected?"

**Critical for Pharma Roles:**
This section is MANDATORY for any role in:
- Clinical Development
- Medical Affairs
- Regulatory Affairs
- Pharmacovigilance
- Quality Assurance/Control
- Manufacturing

---

### Section 5: Responsibilities & Deliverables (10 minutes)

**Questions:**
1. "Walk me through a typical day/week"
2. "What do you spend most of your time doing?"
3. "What are your top 3 key responsibilities?"
4. "What deliverables are you accountable for?"
5. "What meetings do you attend regularly?"

**What You're Capturing:**
- key_responsibilities
- typical_deliverables (with frequency)
- daily_activities (with time allocation)
- meeting_hours_per_week

**Time Allocation Exercise:**
"If we broke down your 40-hour week, what % goes to:"
- Direct role activities (e.g., MSL: KOL meetings)
- Administrative tasks (email, reports)
- Meetings (internal collaboration)
- Travel
- Training/learning

**Deliverables Deep Dive:**
For each major deliverable, ask:
- How often do you produce this?
- How long does it take?
- Who reviews/approves it?
- What systems do you use?

---

### Section 6: KPIs & Performance Metrics (5 minutes)

**Questions:**
1. "How is your performance measured?"
2. "What metrics or KPIs are you held accountable for?"
3. "What does 'good' look like in this role?"
4. "What numbers do you track on a dashboard?"

**What You're Capturing:**
- role_kpis (name, target, frequency, data source)

**Probing Questions:**
- "What's a realistic target for [KPI]?"
- "What system provides this data?"
- "How often do you review these metrics?"

**Look For:**
- Specific, measurable KPIs
- Realistic targets (not aspirational)
- Clear data sources
- Mix of leading and lagging indicators

---

### Section 7: Work Environment (5 minutes)

**Questions:**
1. "How much do you travel? (% of time)"
2. "Can you work remotely? How often?"
3. "Are you on-call or have emergency responsibilities?"
4. "What's your typical work schedule?"
5. "Where are you based? (Field, office, lab, home)"

**What You're Capturing:**
- travel_requirement_pct
- remote_eligible
- oncall_required
- typical_work_schedule
- work_location_type

**Travel Deep Dive:**
If travel > 25%, ask:
- "What regions do you cover?"
- "Overnight vs. day trips?"
- "International or domestic?"
- "How much advance notice for trips?"

---

### Section 8: Systems & Tools (5 minutes)

**Questions:**
1. "What software/systems do you use daily?"
2. "What tools are you expected to be proficient in?"
3. "What databases do you access?"
4. "Are these systems validated? (21 CFR Part 11)"

**What You're Capturing:**
- required_systems (name, proficiency, frequency)

**Common Pharma Systems to Ask About:**
- CRM (Veeva, IQVIA)
- CTMS (Clinical Trial Management)
- Safety databases
- Electronic data capture (EDC)
- Document management (Veeva Vault)
- LMS (Learning Management)

---

### Section 9: Decision Authority & Approvals (5 minutes)

**Questions:**
1. "What can you approve on your own?"
2. "What requires escalation/manager approval?"
3. "Do you have budget authority? How much?"
4. "What decisions are you accountable for?"

**What You're Capturing:**
- approval_types (with monetary limits)
- decision_authority

**Examples to Probe:**
- "Can you approve travel/expenses? Up to what amount?"
- "Can you approve study protocols?"
- "Can you hire contractors or vendors?"
- "Can you sign off on regulatory submissions?"

---

### Section 10: Challenges & Motivations (5 minutes)

**Questions:**
1. "What are the top 3 challenges in this role?"
2. "What frustrates you most?"
3. "What motivates you to do this work?"
4. "Why did you choose this role?"
5. "What keeps you engaged?"

**What You're Capturing:**
- common_challenges
- key_motivations
- typical_goals

**Listen For:**
- Pain points (systemic vs. individual)
- Career motivations
- Work-life balance issues
- Learning opportunities
- Impact on patients

---

### Section 11: Career Development (3 minutes)

**Questions:**
1. "How long do people typically stay in this role?"
2. "What's the typical next step?"
3. "What role did you have before this?"
4. "Is this an entry point into the company?"

**What You're Capturing:**
- typical_time_in_role_months
- advancement_potential
- is_entry_point
- career_path_progression

---

## 🎤 Interview Tips

### Do's ✅
- **Ask for examples:** "Tell me about a time when..."
- **Use silence:** Let them think and elaborate
- **Confirm understanding:** "So what I'm hearing is..."
- **Ask about variance:** "Does this differ by therapeutic area?"
- **Probe for specifics:** "Can you give me a specific number?"

### Don'ts ❌
- **Don't lead the witness:** Avoid "I assume you do X, right?"
- **Don't skip validation:** Always confirm with multiple people
- **Don't accept jargon:** Ask them to explain acronyms
- **Don't rush:** Let them tell stories
- **Don't go off-topic:** Keep focused on role data

---

## 📊 After the Interview

### Immediate (Same Day)

1. **Transcribe notes** while fresh in memory
2. **Flag inconsistencies** to follow up on
3. **Identify gaps** in data collected
4. **Note surprises** or unexpected insights

### Within 48 Hours

1. **Compare across interviewees**
   - Where do they agree?
   - Where do they differ?
   - What's the "truth"?

2. **Validate outliers**
   - If one person says travel is 80% but others say 20%, dig deeper
   - Check if variance is by region, therapeutic area, or role level

3. **Fill the template**
   - Complete JSON fields
   - Add notes on sources
   - Mark low-confidence items

4. **Send for review**
   - Share draft with interviewees
   - "Does this accurately reflect the role?"
   - Incorporate feedback

---

## 🚩 Red Flags & How to Handle

| Red Flag | What It Means | How to Handle |
|----------|---------------|---------------|
| "It varies a lot" | Role is poorly defined or spans multiple levels | Ask: "What's most common? What's the range?" |
| "I don't know" | Not a good interview subject OR data doesn't exist | Find someone more senior or with more tenure |
| Vague answers | Interviewee uncomfortable or disengaged | Build rapport, explain value, offer anonymity |
| Contradictions | Different people have different role experiences | Determine if variance is by region/TA or if role evolved |
| "That's not in my JD" | Role has expanded beyond official description | Capture both formal and actual responsibilities |
| Unrealistic KPIs | Targets are aspirational, not actual | Ask: "What do top performers actually achieve?" |

---

## 📝 Interview Template

Use this template for note-taking:

```
ROLE ENRICHMENT INTERVIEW
========================

Date: ___________
Interviewee: ___________
Role: ___________
Years in Role: ___________

SECTION 1: ROLE OVERVIEW
- Description:
- Unique aspects:
- Role type:

SECTION 2: EXPERIENCE & QUALIFICATIONS
- Education required:
- Years experience:
- Prior roles:
- Certifications:

SECTION 3: SKILLS & COMPETENCIES
- Top 5 must-have skills:
  1.
  2.
  3.
  4.
  5.
- Technical skills:
- Clinical competencies:
- Soft skills:

SECTION 4: PHARMA/REGULATORY CONTEXT
- GxP critical? Y/N
- GxP types:
- Regulatory frameworks:
- Patient/HCP facing:
- Clinical trial phases:
- Therapeutic areas:

SECTION 5: RESPONSIBILITIES & DELIVERABLES
- Top 3 responsibilities:
  1.
  2.
  3.
- Key deliverables:
- Time allocation:
  - Role activities: ___%
  - Admin: ___%
  - Meetings: ___%
  - Travel: ___%

SECTION 6: KPIs
- KPI 1:
  - Target:
  - Frequency:
  - Data source:
- KPI 2:
- KPI 3:

SECTION 7: WORK ENVIRONMENT
- Travel %:
- Remote eligible:
- On-call:
- Work location:

SECTION 8: SYSTEMS & TOOLS
- Daily systems:
- Required proficiency:

SECTION 9: DECISION AUTHORITY
- Can approve:
- Requires escalation:
- Budget authority:

SECTION 10: CHALLENGES & MOTIVATIONS
- Top 3 challenges:
  1.
  2.
  3.
- Motivations:

SECTION 11: CAREER DEVELOPMENT
- Typical time in role:
- Next roles:
- Prior roles:

NOTES/OBSERVATIONS:
-
-
-

FOLLOW-UP NEEDED:
-
-
```

---

## ✅ Data Quality Checklist

After each interview:

**Completeness:**
- [ ] All required sections covered
- [ ] Specific examples provided
- [ ] Numbers/percentages collected
- [ ] Systems/tools identified

**Accuracy:**
- [ ] Validated with 2+ sources
- [ ] Aligns with job description
- [ ] Realistic targets/expectations
- [ ] Current (not outdated)

**Pharma-Specificity:**
- [ ] GxP context captured
- [ ] Regulatory requirements clear
- [ ] Therapeutic areas specified
- [ ] Safety/compliance noted

**Usability:**
- [ ] Jargon explained
- [ ] Acronyms spelled out
- [ ] Examples given
- [ ] Context provided

---

## 🎯 Quick Reference: Essential Questions

**If you only have 15 minutes, ask these 10 questions:**

1. "Describe this role in one sentence"
2. "What are your top 3 responsibilities?"
3. "What skills are absolutely required to succeed?"
4. "Does this role require GxP training? Which type?"
5. "How is your performance measured? Top 2-3 KPIs?"
6. "How much do you travel? (% of time)"
7. "What systems/tools do you use daily?"
8. "What's the biggest challenge in this role?"
9. "How long do people typically stay in this role?"
10. "What role typically comes next?"

These 10 questions will give you 70-80% of the data you need for a basic enrichment.

---

**Ready to conduct interviews?** Print this guide and use the interview template for note-taking.

**Questions?** Review the README_ROLE_ENRICHMENT_TEMPLATES.md for context.
