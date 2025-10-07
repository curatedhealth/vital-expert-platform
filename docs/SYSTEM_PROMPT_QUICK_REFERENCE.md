# System Prompt Generation - Quick Reference Card

> One-page quick reference for agent creators
> Version 2.0 | October 2025

---

## 🚀 Quick Start (5 Steps)

1. **Fill Agent Form** → Complete all 9 tabs with agent details
2. **Go to Safety Tab** → Scroll to "Template-Based Generation" section
3. **Click Generate** → Wait < 100ms for instant creation
4. **Review in Basic Info** → Auto-switched to show generated prompt
5. **Save Agent** → Click "Create Agent" to save

---

## 📋 16 Sections Generated

### Core Intelligence (Sections 1-10)
1. ✅ Core Identity & Purpose
2. ✅ Behavioral Directives
3. ✅ Reasoning Frameworks (CoT & ReAct)
4. ✅ Execution Methodology
5. ✅ Memory & Context Management
6. ✅ Safety & Compliance Framework
7. ✅ Output Specifications
8. ✅ Multi-Agent Coordination (Tier 3 only)
9. ✅ Performance Monitoring
10. ✅ Continuous Improvement

### Production Operations (Sections 11-16)
11. ✅ Security & Governance
12. ✅ Deployment & Operations
13. ✅ Tool Registry (if tools assigned)
14. ✅ Capabilities Matrix (if capabilities added)
15. ✅ Implementation Checklist
16. ✅ Example Use Cases (if prompt starters added)

---

## 🎯 Tier Selection Guide

| Tier | Use Case | Examples |
|------|----------|----------|
| **Tier 3 (Expert)** | Safety-critical, high-stakes decisions | Clinical trials, regulatory submissions, safety analysis |
| **Tier 2 (Specialist)** | Domain-specific knowledge | Medical literature, clinical data, specialized consultations |
| **Tier 1 (Foundational)** | General purpose, high volume | Patient education, general queries, administrative support |

---

## ⚙️ Tier-Based Configurations

| Setting | Tier 3 (Expert) | Tier 2 (Specialist) | Tier 1 (Foundational) |
|---------|----------------|---------------------|----------------------|
| **Rate Limit** | 100/hour | 200/hour | 500/hour |
| **Data Retention** | 7 years | 3 years | 1 year |
| **Review Schedule** | Weekly | Bi-weekly | Monthly |
| **Backup** | Every 6 hours | Daily | Daily |
| **RPO/RTO** | <1hr/<2hr | <6hr/<4hr | <6hr/<4hr |
| **Deployment** | Blue-Green | Rolling+Canary | Rolling+Canary |
| **Approval** | All recommendations | High-risk ops | High-risk ops |

---

## 📝 Form Completion Checklist

### Required Fields (Minimum)
- [x] Agent Name
- [x] Description
- [x] Tier (1, 2, or 3)
- [x] Status (active, beta, deprecated)
- [x] Architecture Pattern (REACTIVE, DELIBERATIVE, HYBRID)

### Recommended Fields (For Best Results)
- [ ] Business Function
- [ ] Department
- [ ] Role
- [ ] 5-8 Capabilities
- [ ] Reasoning Method (COT, REACT, DIRECT)
- [ ] Communication Tone
- [ ] Communication Style
- [ ] Primary Mission
- [ ] Value Proposition
- [ ] 1-3 Knowledge Domains
- [ ] 1-5 Tools
- [ ] 4-6 Prompt Starters

### Optional (Medical/Regulated)
- [ ] Medical Specialty
- [ ] FDA SaMD Classification
- [ ] HIPAA Compliant
- [ ] PHARMA Protocol
- [ ] VERIFY Protocol
- [ ] Medical Accuracy Threshold
- [ ] Safety Prohibitions
- [ ] Safety Protections
- [ ] Confidence Thresholds

---

## 💡 Pro Tips

### For Maximum Quality
1. **Add 5-8 Capabilities** → First 4 become "expert-level"
2. **Complete Mission & Value** → Appears prominently in prompt
3. **Add Prompt Starters** → Generates detailed use case section
4. **Assign Tools** → Creates comprehensive tool registry
5. **Set Safety Rules** → Domain-specific prohibitions/protections

### For Compliance
1. **Enable HIPAA** → If handling health data
2. **Add FDA Class** → If medical device/software
3. **Set Accuracy Threshold** → 95%+ for clinical agents
4. **Define Escalation Triggers** → When to route to human expert
5. **Document Regulatory Standards** → FDA, ICH-GCP, etc.

### For Performance
1. **Choose Correct Tier** → Affects rate limits and resources
2. **Select Right Architecture** → REACTIVE (fast), DELIBERATIVE (complex)
3. **Pick Reasoning Method** → COT (complex), DIRECT (simple)
4. **Optimize Capabilities** → Focus on most important 5-8

---

## 🎨 Output Specs

### Prompt Length
- **Tier 3**: 1,800-2,000 lines
- **Tier 2**: 1,400-1,600 lines
- **Tier 1**: 1,200-1,400 lines

### Generation Time
- **Speed**: < 100ms (instant)
- **Cost**: $0.00 (zero API calls)
- **Quality**: Production-ready

---

## 🔍 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Prompt too short | Missing fields | Complete more tabs (tools, capabilities, starters) |
| No multi-agent section | Not Tier 3 | Change to Tier 3 or accept omission |
| No tools section | No tools assigned | Add tools in Tools tab |
| No use cases | No prompt starters | Add 4-6 starters in Prompt Starters tab |
| Wrong tier values | Incorrect tier | Re-evaluate tier based on criticality |

---

## 📊 Quality Checklist

After generation, verify:

- [ ] All sections appear (13-16 depending on config)
- [ ] Tier-specific values correct (rate limits, schedules)
- [ ] Regulatory protocols listed (if enabled)
- [ ] Tools section complete (if tools assigned)
- [ ] Capabilities matrix populated (if capabilities added)
- [ ] Use cases generated (if prompt starters added)
- [ ] Multi-agent section present (Tier 3 only)
- [ ] Metadata complete (agent ID, version, timestamps)

---

## 🚦 Before Saving

### Review Checklist
- [ ] System prompt populated in Basic Info tab
- [ ] Prompt length appropriate for tier (1,200-2,000 lines)
- [ ] All required sections present
- [ ] Compliance requirements met
- [ ] Security specifications appropriate
- [ ] Performance targets realistic
- [ ] Manual edits if needed (optional)

### Deployment Checklist (From Generated Prompt)
Use the 23-item checklist in Section 15 of the generated prompt:
- 9 pre-deployment items
- 8 post-deployment items
- 6 ongoing operations items

---

## 📚 Documentation

### Full Documentation
- **Complete Guide**: `docs/PRODUCTION_GRADE_SYSTEM_PROMPT_GENERATION.md`
- **Implementation Summary**: `docs/SYSTEM_PROMPT_GENERATION_SUMMARY.md`
- **Hybrid Generation**: `docs/SYSTEM_PROMPT_GENERATION.md`
- **Setup Guide**: `docs/SYSTEM_PROMPT_SETUP.md`
- **Persona Designer**: `docs/PERSONA_BASED_AGENT_DESIGNER.md`

### Code Location
- **File**: `src/features/chat/components/agent-creator.tsx`
- **Function**: `generateCompleteSystemPrompt()`
- **Lines**: 1544-2244

---

## 🎯 Templates Applied

When you click "Generate":
✅ Gold Standard Template v5.0 (Sections 1-10)
✅ Comprehensive AI Agent Setup Template v3.0 (Sections 11-16)
✅ Production-Grade Configuration Standards

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| Generation Time | < 100ms |
| API Cost | $0.00 |
| Success Rate | 100% |
| Section Coverage | 16/16 |

---

## 🎓 Example Workflow

```
1. New Agent → "Clinical Trial Protocol Designer"
   ├─ Tier: 3 (Expert)
   ├─ Medical Specialty: Oncology
   ├─ Capabilities: 8 (protocol design, compliance, stats, etc.)
   ├─ Tools: 3 (guidelines DB, calculator, literature)
   ├─ Protocols: HIPAA, PHARMA, VERIFY
   └─ FDA: Class II
        ↓
2. Click Generate (Safety tab)
        ↓
3. Review 1,800-line prompt (Basic Info tab)
   ├─ All 16 sections ✓
   ├─ Multi-agent coordination ✓ (Tier 3)
   ├─ Expert-level language ✓
   ├─ Strict compliance ✓
   └─ Production specs ✓
        ↓
4. Save Agent
        ↓
5. Deploy following checklist
```

---

## 🆘 Quick Help

### Something not working?
1. Check console logs (F12 → Console)
2. Verify all required fields filled
3. Review tier selection
4. Check for form validation errors
5. Try regenerating

### Need help?
- Review full documentation
- Check implementation summary
- Examine code comments
- Test with different configurations

---

**Quick Reference Version**: 2.0
**Template Versions**: Gold Standard v5.0 + Comprehensive Setup v3.0
**Last Updated**: October 2025

---

*Print this card for easy reference while creating agents*
