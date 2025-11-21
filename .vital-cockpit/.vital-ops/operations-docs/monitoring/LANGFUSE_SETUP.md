# LangFuse Setup Guide

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Production Ready

---

## Overview

LangFuse is the observability platform for the VITAL AI Engine, providing comprehensive monitoring, tracing, and analytics for all LLM operations.

---

## 🚀 Quick Setup

### 1. Create LangFuse Account

```bash
# Visit https://cloud.langfuse.com
# Sign up for free account
# Create new project: "VITAL Platform"
```

### 2. Get API Keys

```bash
# Navigate to Settings > API Keys
# Generate new key pair:
# - Public Key: pk-...
# - Secret Key: sk-...
# - Host: https://cloud.langfuse.com
```

### 3. Configure Environment Variables

```bash
# services/ai-engine/.env
LANGFUSE_PUBLIC_KEY=pk-your-public-key
LANGFUSE_SECRET_KEY=sk-your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com

# Enable LangFuse tracking
ENABLE_LANGFUSE=true
```

---

## 📊 Features

### Automatic Tracking
- **LLM Calls**: All OpenAI/Anthropic API calls
- **Tokens**: Input/output token counts
- **Costs**: Automatic cost calculation
- **Latency**: Response time tracking
- **Errors**: Exception and error tracking

### Agent Tracking
- **Agent Selection**: Track which agents are selected
- **Multi-factor Scoring**: Monitor ranking scores
- **Domain Detection**: Track detected domains
- **Performance**: Agent-specific metrics

### RAG Pipeline
- **Document Retrieval**: Track retrieved documents
- **Embeddings**: Monitor embedding generation
- **Semantic Search**: Track similarity scores
- **Re-ranking**: Monitor MMR performance

---

## 🔍 Monitoring Dashboards

### Main Dashboard
```
https://cloud.langfuse.com/project/[project-id]
```

View:
- Total requests
- Token usage
- Cost breakdown
- Error rates
- Latency percentiles

### Traces View
```
https://cloud.langfuse.com/project/[project-id]/traces
```

Track:
- Individual request flows
- Agent selection process
- Tool executions
- RAG pipeline steps

### Metrics View
```
https://cloud.langfuse.com/project/[project-id]/metrics
```

Monitor:
- Model performance
- Cost per conversation
- Average latency
- Error trends

---

## 🛠️ Implementation

### Python Integration

```python
from langfuse import Langfuse
from langfuse.callback import CallbackHandler

# Initialize LangFuse
langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST")
)

# Create callback handler
langfuse_handler = CallbackHandler(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST")
)

# Use with LangChain
response = llm.invoke(
    prompt,
    callbacks=[langfuse_handler]
)
```

### Tracing Agent Selection

```python
# Start trace
trace = langfuse.trace(
    name="agent_selection",
    user_id=user_id,
    session_id=session_id,
    metadata={
        "query": query,
        "tenant_id": tenant_id
    }
)

# Track domain detection
trace.span(
    name="domain_detection",
    input={"query": query},
    output={"domains": detected_domains},
    metadata={"method": "regex", "confidence": 0.92}
)

# Track agent ranking
trace.span(
    name="agent_ranking",
    input={"candidates": len(candidates)},
    output={"selected": agent.name, "score": 0.91},
    metadata={"scores": ranking_scores}
)
```

---

## 📈 Key Metrics

### Performance Metrics
- **Latency p50**: < 500ms
- **Latency p95**: < 1s
- **Latency p99**: < 2s
- **Error Rate**: < 0.1%

### Cost Metrics
- **Cost per Conversation**: $0.05 avg
- **Cost per Day**: Monitor daily spending
- **Cost per Model**: Track model costs
- **Budget Alerts**: Set spending limits

### Usage Metrics
- **Requests per Hour**: Monitor usage patterns
- **Tokens per Request**: Average token usage
- **Model Distribution**: Which models are used
- **User Activity**: Active users and sessions

---

## 🚨 Alerts

### Configure Alerts

```python
# Set up alerts in LangFuse UI:
# 1. Error Rate > 5%
# 2. Latency p95 > 2s
# 3. Cost per Day > $50
# 4. Token usage spike (> 2x avg)
```

### Alert Channels
- Email notifications
- Slack integration
- Webhook callbacks
- Dashboard notifications

---

## 🔧 Advanced Features

### Custom Metrics

```python
# Track custom metrics
langfuse.score(
    trace_id=trace.id,
    name="user_satisfaction",
    value=4.5,
    comment="User rated response as helpful"
)

# Track business metrics
langfuse.score(
    trace_id=trace.id,
    name="agent_accuracy",
    value=0.92,
    comment="Agent selected correctly for query"
)
```

### User Feedback

```python
# Collect user feedback
langfuse.score(
    trace_id=trace.id,
    name="user_feedback",
    value=feedback_score,
    comment=user_comment
)
```

### A/B Testing

```python
# Track experiment variants
trace = langfuse.trace(
    name="agent_selection",
    metadata={
        "experiment": "ranking_weights_v2",
        "variant": "weights_40_30_20_10"
    }
)
```

---

## 📊 Sample Queries

### Top 10 Most Used Agents
```sql
SELECT agent_name, COUNT(*) as usage_count
FROM traces
WHERE name = 'agent_execution'
GROUP BY agent_name
ORDER BY usage_count DESC
LIMIT 10
```

### Average Latency by Model
```sql
SELECT model, AVG(latency_ms) as avg_latency
FROM traces
WHERE type = 'llm'
GROUP BY model
ORDER BY avg_latency DESC
```

### Cost Analysis
```sql
SELECT 
  DATE(timestamp) as date,
  SUM(cost_usd) as daily_cost,
  COUNT(*) as request_count
FROM traces
WHERE type = 'llm'
GROUP BY date
ORDER BY date DESC
LIMIT 30
```

---

## 🔒 Security

### API Key Management
- Store keys in environment variables
- Rotate keys quarterly
- Use separate keys for dev/staging/prod
- Never commit keys to repository

### Data Privacy
- PII redaction enabled
- Conversation data encrypted
- GDPR compliant
- Data retention: 90 days

---

## 🐛 Troubleshooting

### Issue: No Data Appearing

**Check**:
1. Environment variables set correctly
2. LangFuse callback handler included
3. Network connectivity to cloud.langfuse.com
4. API keys valid and not expired

**Solution**:
```bash
# Test connection
curl -X POST https://cloud.langfuse.com/api/public/ingestion \
  -H "Authorization: Bearer $LANGFUSE_PUBLIC_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Issue: High Latency

**Causes**:
- LangFuse adds ~10-50ms overhead
- Network latency to cloud

**Solutions**:
- Use async ingestion
- Batch requests
- Consider self-hosted LangFuse

---

## 📚 Resources

- **Documentation**: https://langfuse.com/docs
- **API Reference**: https://api.reference.langfuse.com
- **GitHub**: https://github.com/langfuse/langfuse
- **Discord**: https://discord.gg/langfuse

---

## ✅ Verification Checklist

- [ ] LangFuse account created
- [ ] API keys configured
- [ ] Environment variables set
- [ ] Callback handler integrated
- [ ] Dashboard accessible
- [ ] Traces appearing
- [ ] Metrics calculating correctly
- [ ] Alerts configured
- [ ] Team access granted

---

**Next Steps**: Configure alerts and set up custom dashboards for team visibility.

