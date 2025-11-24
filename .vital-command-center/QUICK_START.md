# VITAL Command Center - Quick Start Guide

**Welcome!** This guide will get you oriented in 5 minutes.

---

## 🎯 What is This?

The **VITAL Command Center** is your single source of truth for all platform knowledge:
- Strategy & Requirements (PRD/ARD)
- Team & Agent Coordination
- Platform Assets (agents, personas, JTBDs)
- Service Documentation
- Technical Implementation
- Operations & DevOps
- Quality & Compliance
- Development Tooling

---

## 🚀 I'm a... (Choose Your Path)

### 👔 Executive / Product Manager
**You need**: Strategy, roadmap, business case
**Go to**: [`00-STRATEGIC/`](00-STRATEGIC/)

**Quick Links**:
- Vision & Strategy
- Product Requirements (PRD)
- Business Case & ROI
- Product Roadmap

---

### 🤖 Development Agent (AI Assistant)
**You need**: Role, coordination rules, guidelines
**Go to**: [`01-TEAM/`](01-TEAM/)

**Quick Links**:
- Your agent specification: `01-TEAM/agents/{your-name}.md`
- Coordination guide: `01-TEAM/coordination/AGENT_COORDINATION_GUIDE.md`
- Rules: `01-TEAM/rules/CLAUDE.md`, `VITAL.md`

**First Steps**:
1. Read your agent specification
2. Review coordination guide
3. Check CATALOGUE.md for documentation you'll need

---

### 💻 Software Developer
**You need**: Architecture, database schema, API docs
**Go to**: [`04-TECHNICAL/`](04-TECHNICAL/)

**Quick Links**:
- Database Schema: `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md` ⭐
- API Documentation: `04-TECHNICAL/api/`
- Frontend Architecture: `04-TECHNICAL/frontend/`
- Backend Architecture: `04-TECHNICAL/backend/`

**First Steps**:
1. Review GOLD_STANDARD_SCHEMA.md (database)
2. Check API documentation for endpoints
3. Browse tooling: `07-TOOLING/`

---

### 🔧 DevOps / Operations
**You need**: Deployment guides, monitoring, runbooks
**Go to**: [`05-OPERATIONS/`](05-OPERATIONS/)

**Quick Links**:
- Deployment: `05-OPERATIONS/deployment/`
- Monitoring: `05-OPERATIONS/monitoring/`
- Scripts: `05-OPERATIONS/scripts/`
- Runbooks: `05-OPERATIONS/runbooks/`

**First Steps**:
1. Review deployment guide
2. Check monitoring setup
3. Browse operational scripts

---

### ✅ QA / Compliance
**You need**: Test strategy, compliance docs, security
**Go to**: [`06-QUALITY/`](06-QUALITY/)

**Quick Links**:
- Testing: `06-QUALITY/testing/`
- Compliance: `06-QUALITY/compliance/` (HIPAA, GDPR, FDA)
- Security: `06-QUALITY/security/`
- Performance: `06-QUALITY/performance/`

**First Steps**:
1. Review test strategy
2. Check compliance requirements
3. Review security policies

---

## 📖 Navigation Tools

### CATALOGUE.md
**Comprehensive navigation system** - Find anything by:
- **What you need** (navigation matrix)
- **Who you are** (audience-based)
- **What you're working on** (topic-based)

**Use when**: "Where is the documentation for X?"

### INDEX.md
**Structured index** - Browse by section

**Use when**: "I want to explore what's available"

### Agent Index Files
**Agent-specific documentation** - Each agent has `index.md` in their folder

**Use when**: "What does this agent own?"

---

## 🔍 Common Searches

| Looking For... | Go To... |
|----------------|----------|
| Database schema | `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md` |
| PRD (Product Requirements) | `00-STRATEGIC/prd/` |
| ARD (Architecture Requirements) | `00-STRATEGIC/ard/` |
| Agent coordination rules | `01-TEAM/coordination/` |
| AI assistant rules | `01-TEAM/rules/CLAUDE.md` |
| Platform standards | `01-TEAM/rules/VITAL.md` |
| API documentation | `04-TECHNICAL/api/` |
| Deployment guide | `05-OPERATIONS/deployment/` |
| Test strategy | `06-QUALITY/testing/` |
| User-facing VITAL agents | `02-PLATFORM-ASSETS/agents/` |
| Ask Expert service docs | `03-SERVICES/ask-expert/` |

---

## 🛠️ Development Workflow

### Starting a New Feature

1. **Strategy** → Read PRD in `00-STRATEGIC/prd/`
2. **Architecture** → Read ARD in `00-STRATEGIC/ard/`
3. **Implementation** → Check `04-TECHNICAL/` for patterns
4. **Testing** → Follow test strategy in `06-QUALITY/testing/`
5. **Deploy** → Use guides in `05-OPERATIONS/deployment/`

### Working on Database

1. **Schema** → `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`
2. **Migrations** → `04-TECHNICAL/data-schema/06-migrations/`
3. **Validation** → `07-TOOLING/validators/`

### Need Help?

1. **Check CATALOGUE.md** first
2. **Ask Implementation Compliance & QA Agent** (the librarian)
3. **Check agent index.md** for agent-specific docs

---

## ✅ Quality Standards

All work must:
- ✅ Reference PRD specifications
- ✅ Follow ARD architecture
- ✅ Follow CLAUDE.md/VITAL.md rules
- ✅ Include test evidence
- ✅ Pass compliance validation

**Enforced by**: Implementation Compliance & QA Agent

---

## 🎓 Learning Path

### Week 1: Foundations
- [ ] Read README.md (this is easy, you're here!)
- [ ] Read QUICK_START.md (you're reading it!)
- [ ] Explore your role's section
- [ ] Review CATALOGUE.md

### Week 2: Deep Dive
- [ ] Review PRD (what we're building)
- [ ] Review ARD (how we're building it)
- [ ] Explore platform assets
- [ ] Check service documentation

### Week 3: Mastery
- [ ] Understand agent coordination
- [ ] Review quality standards
- [ ] Explore tooling
- [ ] Contribute to documentation

---

## 📞 Getting Help

### Can't Find Something?

**Step 1**: Check [`CATALOGUE.md`](CATALOGUE.md)
**Step 2**: Search [`INDEX.md`](INDEX.md)
**Step 3**: Ask Implementation Compliance & QA Agent (the librarian)

### Found a Problem?

- **Broken link**: Report to Implementation Compliance & QA Agent
- **Missing documentation**: Report to Documentation & QA Lead
- **Compliance issue**: Report to Implementation Compliance & QA Agent

---

## 🎉 You're Ready!

You now know:
- ✅ What the Command Center is
- ✅ Where to find your role's documentation
- ✅ How to navigate (CATALOGUE.md, INDEX.md)
- ✅ Quality standards you need to follow
- ✅ How to get help

**Next Steps**:
1. Go to your role's section
2. Explore CATALOGUE.md
3. Start building! 🚀

---

**Need More Help?** → [CATALOGUE.md](CATALOGUE.md) | [INDEX.md](INDEX.md) | [README.md](README.md)
