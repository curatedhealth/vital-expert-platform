# 🏥 Medical Affairs Persona - Quick Start Guide

**For**: Medical Affairs Data Team
**Time to First Deployment**: 30 minutes
**Pre-filled Template**: ✅ Ready to use

---

## 🚀 3-Minute Setup

### Step 1: Copy the Template (30 seconds)
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/seeds/00_PREPARATION
cp MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json MY_NEW_PERSONA.json
```

### Step 2: Fill in Basic Info (5 minutes)
Only need to replace these placeholders:
- `<<Full Name>>` → Your persona's name
- `<<url-friendly-slug>>` → e.g., dr-john-smith-msl
- `<<Job Title>>` → e.g., Medical Science Liaison, Oncology
- `<<Age range>>` → Select from: 25-35, 35-45, 45-55, 55-65, 65+
- `<<Location>>` → City, State

**Everything else is pre-filled for Medical Affairs!**

### Step 3: Transform & Deploy (2 minutes)
```bash
python3 final_transform.py
psql "$DATABASE_URL" -f DEPLOY_MA_V5.sql
```

**Done!** ✅

---

## 📋 Pre-Filled Medical Affairs Context

These values are already set in the template - **you don't need to change them**:

### Organizational Context
- ✅ **Tenant ID**: `f7aa6fd4-0af9-4706-8b31-034f1f7accda`
- ✅ **Industry**: Pharmaceutical
- ✅ **Function**: Medical Affairs
- ✅ **Department Options**: Pre-defined
- ✅ **Common Tools**: Veeva CRM, PubMed, Teams, etc.

### Role Options (Pick One)
Template includes all common Medical Affairs roles:

**Executive Level**:
- Chief Medical Officer (CMO)
- VP Medical Affairs
- Head of Medical Affairs

**Senior Level**:
- Medical Director (Oncology, Immunology, etc.)
- Regional Medical Director
- MSL Manager/Senior Manager
- Head of Medical Information

**Mid-Level**:
- Medical Science Liaison (MSL)
- Senior MSL
- Medical Affairs Manager
- Clinical Scientist
- Medical Writer
- Medical Information Specialist

**Entry Level**:
- Associate MSL
- Junior MSL
- Medical Information Associate

---

## 🎯 Common Medical Affairs Values

### Therapeutic Areas (Copy-Paste Ready)
```json
"therapeutic_areas": [
  "Oncology - Solid Tumors",
  "Oncology - Hematology",
  "Immunology",
  "Neurology",
  "Rare Diseases",
  "Cardiology",
  "Infectious Diseases"
]
```

### Tools & Systems (Pre-filled)
```json
{
  "tool": "Veeva CRM",
  "category": "crm",
  "usage_frequency": "daily",
  "proficiency": "advanced",
  "satisfaction": "satisfied"
}
```

Common tools already in template:
- Veeva CRM, Veeva Medical, Veeva Engage
- PubMed, Embase, Mendeley
- Teams, Zoom, Slack
- PowerPoint, Tableau

### Internal Stakeholders (Typical)
Pre-filled options:
- Clinical Development
- Regulatory Affairs
- Commercial/Marketing
- Market Access/HEOR
- Publications
- Drug Safety/Pharmacovigilance

### External Stakeholders (Typical)
- Key Opinion Leaders (KOLs)
- Healthcare Providers (HCPs)
- Academic Medical Centers
- Professional Medical Societies
- Patient Advocacy Groups
- Regulatory Agencies

### Annual Conferences
```json
{
  "conference_name": "ASCO Annual Meeting",
  "conference_type": "technical",
  "role": "attendee",
  "importance": "critical",
  "typical_quarter": "Q2"
}
```

Common conferences:
- ASCO (Oncology)
- ASH (Hematology)
- ESMO (European Oncology)
- AAN (Neurology)
- MSLS (MSL Society)
- DIA (Drug Information)

---

## ✅ Required Fields Checklist

Must fill these for every persona:

### Core (3 fields)
- [ ] name
- [ ] slug (must be unique!)
- [ ] title

### Categories (use pre-defined OPTIONS)
- [ ] pain_category for each pain_point (operational, strategic, technology, interpersonal)
- [ ] severity for each pain_point (critical, high, medium, low)
- [ ] challenge_type for each challenge (daily, weekly, strategic, external)
- [ ] impact for each challenge (critical, high, medium, low)

### Evidence (if included)
- [ ] overall_confidence_level (very_high, high, medium, low, very_low)
- [ ] evidence_quality_score (1-10)

---

## 📊 Typical Medical Affairs Persona Profile

**Role Distribution**:
- MSLs: 60% (most common)
- Medical Directors: 20%
- Medical Information: 10%
- Medical Writing/Publications: 5%
- Executive: 5%

**Common Characteristics**:
- **Education**: PharmD (50%), MD (30%), PhD (15%), MS (5%)
- **Experience**: 8-15 years average
- **Travel**: MSLs weekly, Directors monthly, Info Specialists rarely
- **Work Hours**: 45-55 hours/week
- **Team Size**: 0 (MSLs), 3-10 (Managers), 10-50 (Directors), 100+ (Executives)

---

## 🎨 Example Pain Points (Copy-Paste)

### For MSLs:
```json
{
  "pain_point": "Scheduling meetings with busy KOLs requires extensive coordination",
  "category": "operational",
  "severity": "high",
  "frequency": "daily"
}
```

```json
{
  "pain_point": "Keeping current with rapidly evolving literature while in the field",
  "category": "strategic",
  "severity": "high",
  "frequency": "weekly"
}
```

### For Medical Directors:
```json
{
  "pain_point": "Managing multiple concurrent clinical trials across therapeutic areas",
  "category": "operational",
  "severity": "high",
  "frequency": "daily"
}
```

```json
{
  "pain_point": "Balancing strategic planning with operational firefighting",
  "category": "strategic",
  "severity": "high",
  "frequency": "weekly"
}
```

### For Medical Information:
```json
{
  "pain_point": "Responding to complex off-label questions within compliance guardrails",
  "category": "strategic",
  "severity": "high",
  "frequency": "daily"
}
```

---

## 🎯 Example Goals (Copy-Paste)

### For MSLs:
```json
{
  "goal": "Build and maintain relationships with 25 key opinion leaders",
  "type": "primary",
  "priority": 1,
  "timeframe": "ongoing"
}
```

### For Medical Directors:
```json
{
  "goal": "Successfully execute medical strategy for 3 product launches",
  "type": "primary",
  "priority": 1,
  "timeframe": "12_months"
}
```

### For All Roles:
```json
{
  "goal": "Stay current with latest clinical evidence in therapeutic area",
  "type": "secondary",
  "priority": 2,
  "timeframe": "ongoing"
}
```

---

## 🔍 Example Filled Persona

**See**: `MEDICAL_AFFAIRS_EXAMPLE_FILLED.json`

This is a complete MSL persona ready to deploy:
- Dr. Jennifer Martinez
- MSL, Oncology
- San Francisco territory
- All fields properly filled
- Valid enum values
- Ready for transformation

**Use this as reference** when creating new personas!

---

## ⚡ Time-Saving Tips

### 1. Start with Example
```bash
# Copy the example and modify
cp MEDICAL_AFFAIRS_EXAMPLE_FILLED.json MY_NEW_PERSONA.json
# Change name, slug, location, specifics
```

### 2. Reuse Common Elements
For personas in same role type:
- Copy tools section (same for all MSLs)
- Copy stakeholder types (similar across roles)
- Copy work context (similar for same seniority)

### 3. Use Template Comments
Template has `_common_` sections with ready-to-use values:
- `_common_medical_affairs_pain_points`
- `_common_medical_affairs_tools`
- `_common_external_stakeholders`
- `_common_medical_conferences`

Just copy-paste what you need!

### 4. Batch Similar Personas
Create all MSLs together, all Directors together:
- Same tools, stakeholders, work patterns
- Only change: name, location, therapeutic area, specific goals

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This
```json
"pain_category": "general"  // Invalid! Not in database
"severity": "moderate"       // Invalid! Use "medium"
"slug": "Dr. Sarah Chen"     // Invalid! Use: "dr-sarah-chen-msl"
"achievement_rate": 85       // OK but will convert to 0.85
```

### ✅ Do This
```json
"pain_category": "operational"  // Valid
"severity": "medium"            // Valid
"slug": "dr-sarah-chen-msl"     // Valid (lowercase, hyphenated)
"achievement_rate": 0.85        // Preferred format
```

---

## 📞 Quick Reference

### Valid Enum Values

| Field | Valid Values |
|-------|-------------|
| pain_category | operational, strategic, technology, interpersonal |
| severity | critical, high, medium, low |
| challenge_type | daily, weekly, strategic, external |
| impact | critical, high, medium, low |
| goal_type | primary, secondary, long_term, personal |
| meeting_load | heavy, moderate, light |
| energy_pattern | high, medium, low |
| confidence_level | very_high, high, medium, low, very_low |

### Transformation Commands
```bash
# Configure (one time)
nano final_transform.py
# Set: TENANT_ID, JSON_FILE, OUTPUT_SQL

# Transform
python3 final_transform.py

# Deploy
psql "$DATABASE_URL" -f DEPLOY_MA_V5.sql 2>&1 | tee deployment.log

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM personas WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';"
```

---

## ✅ Success Checklist

Before deploying:
- [ ] Unique slug for each persona
- [ ] All pain_points have valid category and severity
- [ ] All challenges have valid type and impact
- [ ] All goals have valid type
- [ ] Evidence summary has confidence_level (if included)
- [ ] Reviewed MEDICAL_AFFAIRS_EXAMPLE_FILLED.json
- [ ] Tested with 1-2 personas first

---

## 🎉 You're Ready!

With these Medical Affairs-specific templates:
- ✅ All boilerplate pre-filled
- ✅ Valid values provided
- ✅ Examples to copy from
- ✅ 30-minute deployment time

**Just fill in the persona details and deploy!**

---

*Quick Start Guide v1.0*
*Medical Affairs Specific*
*Last Updated: 2025-11-17*
