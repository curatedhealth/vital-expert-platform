# Ask Panel - Quick Reference Guide

**Version**: 3.0 | **Status**: Production Deployed | **Tier**: $10K/month

---

## âš¡ Quick Facts

- **Service**: Virtual Advisory Board Platform
- **Position**: Level 2 of 4-tier VITAL stack
- **Deployment**: Modal.com (Python serverless)
- **Database**: Supabase PostgreSQL + pgvector
- **Experts**: 136+ specialized AI agents
- **Panel Types**: 6 orchestration modes

---

## ðŸ"Š 6 Panel Types at a Glance

| Type | Best For | Duration | Experts | Output |
|------|----------|----------|---------|--------|
| **Structured** | Regulatory strategy | 10-15 min | 3-5 | Consensus + dissent |
| **Open** | Brainstorming | 5-10 min | 5-8 | Multiple perspectives |
| **Socratic** | Complex analysis | 15-20 min | 3-4 | Deep exploration |
| **Adversarial** | Risk assessment | 10-15 min | 4-6 | Pro/con analysis |
| **Delphi** | Consensus building | 15-25 min | 5-12 | Iterative agreement |
| **Hybrid Human-AI** | Critical decisions | 20-30 min | 3-8 | Human + AI synthesis |

---

## ðŸ"Œ Core API Endpoints

```bash
# Create Panel
POST /api/v1/panels
{
  "query": "string",
  "panel_type": "consensus|debate|sequential|parallel",
  "agents": ["agent_id_1", "agent_id_2"],
  "parameters": {}
}

# Stream Panel Execution
POST /api/v1/panels/{panel_id}/stream
# Returns: Server-Sent Events

# Get Panel Results
GET /api/v1/panels/{panel_id}

# List User Panels
GET /api/v1/panels/user/{user_id}?limit=10&offset=0
```

---

## ðŸ› ï¸ Technology Stack

```
Frontend:   Next.js 14 + TypeScript + TailwindCSS
Backend:    Python FastAPI + LangChain + LangGraph
Deploy:     Modal.com (serverless)
Database:   Supabase (PostgreSQL + pgvector)
Cache:      Redis
Streaming:  Server-Sent Events (SSE)
AI:         OpenAI GPT-4 + Claude 3.5 Sonnet
```

---

## ðŸŽ¯ Common Use Cases

### Regulatory Affairs
- FDA submission strategy for Class II device
- 510(k) pathway vs PMA decision
- Clinical trial endpoint selection
- Risk-benefit analysis for safety updates

### Clinical Development
- Phase 2 to Phase 3 go/no-go decision
- Protocol optimization for enrollment
- Adaptive trial design evaluation
- DMC safety signal interpretation

### Market Access
- US pricing strategy for orphan drug
- European HTA submission approach
- Payer negotiation strategy
- Health economics model validation

### Product Development
- Feature prioritization for MVP
- Technical feasibility assessment
- Build vs buy decision
- Partnership evaluation

---

## ðŸ"' Security & Compliance

âœ… **HIPAA** - Protected health information handling  
âœ… **SOC2 Type II** - Security controls certified  
âœ… **FDA 21 CFR Part 11** - Electronic records compliant  
âœ… **GDPR** - Data protection ready  
âœ… **Multi-tenant** - Complete data isolation  
âœ… **Audit Trails** - Full activity logging

---

## ⚡ Performance Specs

- **Streaming Latency**: <100ms
- **Uptime**: 99.95%
- **Panel Completion**: 2-5 minutes (6 experts)
- **Concurrent Panels**: 100+ simultaneous
- **Token Throughput**: 1000/second sustained
- **Cache Hit Rate**: 85%+

---

## ðŸ'° Pricing & Value

**Service Tier**: $10,000/month

**Replaces**:
- Quarterly advisory board meetings ($50K/meeting)
- Multiple consultant engagements ($200-500/hour)
- Market research reports ($5-15K/report)

**ROI**: 10x in first year for typical enterprise

---

## ðŸš€ Getting Started

### 1. Create Your First Panel (2 minutes)

```bash
curl -X POST https://api.vital.ai/v1/panels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: YOUR_TENANT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the optimal FDA pathway for our wearable glucose monitor?",
    "panel_type": "consensus",
    "agents": ["fda_expert", "clinical_expert", "regulatory_expert"]
  }'
```

### 2. Stream Real-time Results

```javascript
const eventSource = new EventSource(
  `https://api.vital.ai/v1/panels/${panelId}/stream`
);

eventSource.addEventListener('expert_speaking', (event) => {
  const data = JSON.parse(event.data);
  console.log(`${data.agent_name}: ${data.content}`);
});

eventSource.addEventListener('complete', (event) => {
  const recommendation = JSON.parse(event.data);
  console.log('Final Recommendation:', recommendation);
});
```

### 3. Review Consensus

```bash
curl https://api.vital.ai/v1/panels/{panel_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ðŸ"š Key Features v3.0

### Quantum Consensus
Multi-dimensional agreement analysis across:
- Technical feasibility
- Regulatory viability
- Market potential
- Risk assessment
- Resource requirements

### Swarm Intelligence
Emergent solutions from micro-agent interactions:
- Pattern recognition across domains
- Non-obvious connection discovery
- Creative problem-solving
- Holistic risk assessment

### Predictive Modeling
Success probability calculation:
- FDA approval likelihood
- Market adoption forecast
- Competitive position analysis
- Resource requirement estimation

### FDA-Ready Documentation
Auto-generated regulatory packages:
- Meeting briefing documents
- Risk-benefit assessments
- Safety analysis reports
- Regulatory strategy memos

---

## ðŸ"§ Integration Examples

### React Component

```typescript
import { usePanelStream } from '@vital/sdk';

function PanelDiscussion({ query }) {
  const { panel, experts, consensus, isComplete } = usePanelStream({
    query,
    panelType: 'consensus',
    agents: ['fda_expert', 'clinical_expert']
  });

  return (
    <div>
      <h2>{panel.title}</h2>
      {experts.map(expert => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
      {isComplete && <Consensus data={consensus} />}
    </div>
  );
}
```

### Python Backend

```python
from vital_sdk import VitalPanel

panel = VitalPanel(
    query="Optimal endpoint for Phase 2 trial?",
    panel_type="structured",
    experts=["clinical_expert", "stats_expert", "fda_expert"]
)

async for event in panel.stream():
    if event.type == "expert_speaking":
        print(f"{event.agent}: {event.content}")
    elif event.type == "consensus_update":
        print(f"Consensus: {event.level}%")

recommendation = await panel.get_final_recommendation()
print(recommendation.synthesis)
```

---

## ðŸ›¡ï¸ Best Practices

### Panel Composition
- **3-5 experts**: Optimal for structured panels
- **5-8 experts**: Best for open brainstorming
- **Mix domains**: Combine technical + regulatory + clinical
- **Include contrarian**: Ensure diverse perspectives

### Query Formulation
- **Be specific**: Include context and constraints
- **Define scope**: Set boundaries for discussion
- **Provide data**: Include relevant background info
- **State objective**: Clear decision or output needed

### Results Interpretation
- **Read dissent**: Minority opinions often critical
- **Check evidence**: Verify cited references
- **Consider probability**: Use confidence scores
- **Document rationale**: Capture decision logic

---

## ðŸ"ž Support Resources

- **Documentation**: [View All Artifacts](#)
- **API Reference**: https://api.vital.ai/docs
- **Developer Portal**: https://developers.vital.ai
- **Technical Support**: support@vital.ai
- **Status Page**: https://status.vital.ai
- **Community Forum**: https://community.vital.ai

---

## ðŸ" Troubleshooting

### Common Issues

**Issue**: Panel takes too long  
**Solution**: Reduce expert count or switch to parallel mode

**Issue**: Low consensus level  
**Solution**: Refine query specificity or add domain experts

**Issue**: Missing required expertise  
**Solution**: Check available agents or request custom agent

**Issue**: Streaming connection drops  
**Solution**: Implement retry logic with exponential backoff

---

**ðŸš€ Ready to Transform Your Decision-Making?**

Start your first Virtual Advisory Board panel in under 5 minutes.

---

*Ask Panel v3.0 - Where Expertise Meets Intelligence*
