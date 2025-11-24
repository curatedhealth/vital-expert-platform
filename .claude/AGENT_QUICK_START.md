# Agent Quick Start Guide

**Version**: 1.0.0
**Date**: November 23, 2025
**Status**: Active
**Purpose**: Essential checklist for all agents before starting any task

---

## 📋 Before You Start Any Task

### Step 1: Read Core Rules (5 minutes)
**Location**: `.claude/` root

- [ ] **CLAUDE.md** - How you should operate as Claude Code
- [ ] **VITAL.md** - VITAL Platform standards and conventions
- [ ] **EVIDENCE_BASED_RULES.md** - Evidence requirements (CRITICAL)
- [ ] **NAMING_CONVENTION.md** - File naming and versioning standards

### Step 2: Understand the Structure (2 minutes)
**Location**: `.claude/`

- [ ] **README.md** - Command center overview
- [ ] **STRUCTURE.md** - Where everything is located
- [ ] **docs/INDEX.md** - Navigate by category/role/topic

### Step 3: Check Your Role-Specific Guides (3 minutes)
**Location**: `.claude/docs/coordination/`

**For All Agents**:
- [ ] AGENT_COORDINATION_GUIDE.md - How agents work together

**Role-Specific**:
- [ ] **Data Agents**: SQL_SUPABASE_SPECIALIST_GUIDE.md
- [ ] **Service Agents**: Your service's PRD/ARD
- [ ] **Leadership Agents**: Strategy/vision documents

---

## 🎯 Your Key Resources

### When You Need to Find Something
1. Check **docs/INDEX.md** first
2. Still can't find it? Invoke **Librarian** (implementation-compliance-qa-agent)

### When You Create Documentation
1. Follow **NAMING_CONVENTION.md**
2. Add version header (Version, Last Updated, Status, Purpose)
3. Invoke **Documentation QA Lead** for review
4. Invoke **Librarian** to update navigation

### When You're Unsure
1. Check **CLAUDE.md** for operational guidance
2. Check **VITAL.md** for platform standards
3. Check **AGENT_COORDINATION_GUIDE.md** for collaboration protocols

---

## ✅ Quality Standards You Must Follow

### File Naming
- UPPERCASE for core docs: `README.md`, `INDEX.md`, `STRUCTURE.md`
- lowercase-with-hyphens for topics: `ask-expert-service.md`
- Document type suffixes: `_PRD`, `_ARD`, `_GUIDE`, `_SPEC`

### Version Headers (Required)
```markdown
**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Brief description
```

### Evidence Requirements
- NEVER claim "working", "complete", "implemented" without verification
- ALWAYS provide tool output, test results, or file verification
- Show actual evidence in your responses

---

## 🚫 What NOT to Do

❌ Create files outside `.claude/` structure
❌ Skip version headers on new documentation
❌ Make claims without evidence
❌ Create duplicate documentation (check first!)
❌ Delete documentation (mark as Deprecated instead)
❌ Use spaces or special characters in filenames

---

## 🤝 When to Invoke Other Agents

### Documentation QA Lead
```
When: Creating/updating major documentation
Task: "Review this PRD for quality and consistency"
```

### Librarian (Implementation Compliance & QA)
```
When: Can't find docs, adding new docs, verifying compliance
Task: "Update CATALOGUE.md with new service documentation"
Task: "Help me find documentation about X"
```

### Specialized Agents
```
Data Architecture Expert: Database schema questions
SQL/Supabase Specialist: Database operations
Frontend UI Architect: UI/UX decisions
PRD Architect: Product requirements
System Architecture Architect: Technical architecture
```

---

## 📊 Quick Navigation Map

```
.claude/
├── [CORE RULES]              ← Read these first
│   ├── CLAUDE.md
│   ├── VITAL.md
│   ├── EVIDENCE_BASED_RULES.md
│   └── NAMING_CONVENTION.md
│
├── [NAVIGATION]              ← Find things here
│   ├── README.md
│   ├── STRUCTURE.md
│   └── docs/INDEX.md
│
├── [GOVERNANCE]              ← How we maintain quality
│   ├── DOCUMENTATION_GOVERNANCE_PLAN.md
│   └── AGENT_QUICK_START.md (this file)
│
├── agents/                   ← 14 production agents
│
└── docs/                     ← All documentation (645+ files)
    ├── strategy/             ← Vision, PRD, ARD
    ├── platform/             ← Agents, personas, JTBDs
    ├── services/             ← Service documentation
    ├── architecture/         ← Technical architecture
    ├── workflows/            ← Workflow guides
    ├── operations/           ← DevOps & operations
    ├── testing/              ← Testing documentation
    └── coordination/         ← Agent coordination guides
```

---

## 📖 Documentation Categories Explained

### strategy/
**What**: Vision, product requirements (PRD), architecture requirements (ARD), business requirements
**When to use**: Understanding what we're building and why
**Examples**: VITAL_PLATFORM_VISION.md, ASK_EXPERT_PRD.md

### platform/
**What**: Reusable assets - agents, personas, JTBDs, workflows, prompts
**When to use**: Understanding platform capabilities and user needs
**Examples**: Agent specifications, persona definitions

### services/
**What**: Service-specific documentation (Ask Expert, Ask Panel, etc.)
**When to use**: Implementing or understanding specific services
**Examples**: Ask Expert implementation guide, API specs

### architecture/
**What**: Technical architecture, database schemas, API designs
**When to use**: Technical implementation decisions
**Examples**: Database schema, API reference, RAG pipeline

### workflows/
**What**: Workflow guides and templates
**When to use**: Understanding process flows
**Examples**: Workflow Designer Guide

### operations/
**What**: Deployment, monitoring, maintenance procedures
**When to use**: DevOps and operational tasks
**Examples**: Deployment guides, runbooks

### testing/
**What**: Test strategies, compliance, performance, security
**When to use**: Quality assurance and testing tasks
**Examples**: Test plans, compliance checklists

### coordination/
**What**: Agent collaboration guides and protocols
**When to use**: Understanding how to work with other agents
**Examples**: AGENT_COORDINATION_GUIDE.md, SQL_SUPABASE_SPECIALIST_GUIDE.md

---

## 🎓 Common Scenarios

### Scenario 1: "I need to create a new service"
1. Read: `docs/services/` to see existing patterns
2. Read: Service PRD template
3. Create: Follow NAMING_CONVENTION.md
4. Invoke: Documentation QA Lead for review
5. Invoke: Librarian to update navigation

### Scenario 2: "I need to update the database schema"
1. Read: `CLAUDE.md` (database safety rules)
2. Read: `docs/architecture/data-schema/`
3. Read: `docs/coordination/SQL_SUPABASE_SPECIALIST_GUIDE.md`
4. Create migration following conventions
5. Provide evidence of testing

### Scenario 3: "I can't find documentation about X"
1. Check: `docs/INDEX.md`
2. Search: CATALOGUE.md (if exists)
3. Still not found? Invoke Librarian
4. If truly doesn't exist: Create it!

### Scenario 4: "I need to reorganize documentation"
1. Propose: Draft reorganization plan
2. Invoke: Librarian to review navigation impact
3. Invoke: Documentation QA Lead for quality check
4. Execute: With both approvals
5. Update: All indexes and cross-references

---

## ⚡ Quick Checks Before Submitting Work

### Code Changes
- [ ] Evidence of testing (tool output, screenshots)
- [ ] Follows CLAUDE.md safety rules
- [ ] Matches PRD/ARD specifications
- [ ] No hardcoded credentials or secrets

### Documentation Changes
- [ ] Version header included
- [ ] Follows NAMING_CONVENTION.md
- [ ] Cross-references updated
- [ ] Reviewed by Documentation QA Lead (for major changes)

### New Files
- [ ] Correct location (check STRUCTURE.md)
- [ ] Proper naming (UPPERCASE or lowercase-with-hyphens)
- [ ] Version header included
- [ ] Added to relevant INDEX.md

---

## 💡 Pro Tips

### Efficiency
- **Bookmark** docs/INDEX.md for fast navigation
- **Use Grep** to search across documentation
- **Ask Librarian** before creating new docs (might exist!)

### Quality
- **Read examples** of similar docs before creating new ones
- **Check consistency** with existing documentation
- **Provide evidence** for all claims

### Collaboration
- **Invoke agents early** - don't wait until the end
- **Use Task tool** for complex multi-step work
- **Reference other agents' work** - build on existing foundation

---

## 📞 Getting Help

### Can't Find Documentation?
**Invoke**: Librarian (implementation-compliance-qa-agent)
**Prompt**: "Help me find documentation about [topic]"

### Quality Questions?
**Invoke**: Documentation QA Lead (documentation-qa-lead)
**Prompt**: "Review this documentation for quality"

### Technical Questions?
**Check**: docs/INDEX.md → By Role → Find relevant specialized agent
**Invoke**: Appropriate specialized agent

### Process Questions?
**Read**: AGENT_COORDINATION_GUIDE.md
**Or**: docs/coordination/ guides

---

## 🎯 Success Checklist

Before completing any task, verify:

- [ ] I read the core rules (CLAUDE.md, VITAL.md, etc.)
- [ ] I followed NAMING_CONVENTION.md
- [ ] I provided evidence for my work
- [ ] I updated relevant documentation
- [ ] I invoked QA Lead/Librarian when needed
- [ ] I checked for existing similar work first
- [ ] I cross-referenced related documentation
- [ ] I maintained quality standards

---

## 📚 Next Steps

After reading this guide:

1. **Bookmark** this file for future reference
2. **Read** the Tier 1 core rules (CLAUDE.md, VITAL.md, etc.)
3. **Review** docs/INDEX.md to understand navigation
4. **Check** your role-specific guides
5. **Proceed** with your task following standards

---

**Remember**: Quality over speed. It's better to do it right than to do it fast.

**Questions?** Check DOCUMENTATION_GOVERNANCE_PLAN.md for detailed workflows and protocols.

---

**This guide is your compass. Use it to navigate the VITAL Platform documentation system efficiently and maintain quality standards.**
