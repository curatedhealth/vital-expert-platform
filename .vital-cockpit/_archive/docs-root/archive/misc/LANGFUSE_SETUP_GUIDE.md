# 🔍 Langfuse Observability Setup Guide

**Status**: ✅ Code integrated, awaiting configuration  
**Observability Platform**: [Langfuse](https://langfuse.com/) (Open-Source LLM Observability)

---

## 📋 Quick Overview

Langfuse is integrated into your VITAL Path AI Engine to provide:
- **Real-time LLM call tracing**: See every prompt, response, and token
- **Performance metrics**: TTFT, latency, tokens/sec
- **Cost tracking**: Monitor OpenAI API costs per user/session
- **Debugging**: Visual workflow traces for troubleshooting
- **Production monitoring**: Track errors, slow requests, high costs

---

## 🚀 Setup Options

### **Option 1: Langfuse Cloud** (Recommended for Quick Start)

1. **Sign up**: https://cloud.langfuse.com/
2. **Create a project**: "VITAL Path AI"
3. **Get API keys**: Settings → API Keys
   - Public Key: `pk-lf-...`
   - Secret Key: `sk-lf-...`

### **Option 2: Self-Hosted** (For Data Privacy)

```bash
# Docker Compose
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker-compose up -d
```

Default: `http://localhost:3000`

---

## ⚙️ Configuration

### **1. Set Environment Variables**

Add to your `.env` file or export in terminal:

```bash
# Langfuse Configuration
export LANGFUSE_PUBLIC_KEY="pk-lf-your-public-key"
export LANGFUSE_SECRET_KEY="sk-lf-your-secret-key"
export LANGFUSE_HOST="https://cloud.langfuse.com"  # or self-hosted URL
```

### **2. Install Langfuse SDK** (If Not Already Installed)

```bash
cd services/ai-engine
source venv/bin/activate
pip install langfuse
```

### **3. Restart Backend**

```bash
# From project root
lsof -ti:8080 | xargs kill -9 2>/dev/null
cd services/ai-engine && source venv/bin/activate && python start.py
```

### **4. Verify in Logs**

Look for this message at startup:

```
✅ Langfuse observability enabled
```

If you see:

```
ℹ️ Langfuse observability disabled (set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY to enable)
```

→ Your env vars are not set correctly.

---

## 🧪 Test Langfuse Integration

1. **Make a test request** to Mode 1:
   ```bash
   curl -X POST http://localhost:8080/api/v1/ask/stream \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What is hypertension?",
       "mode": 1,
       "agent_id": "your-agent-id",
       "user_id": "test-user"
     }'
   ```

2. **Check Langfuse Dashboard**:
   - Navigate to: https://cloud.langfuse.com/project/your-project
   - You should see a new trace with:
     - Workflow name: "Mode1_Manual_Simple"
     - LLM calls with prompts and responses
     - Token counts and costs
     - Latency metrics

---

## 📊 What Langfuse Tracks

### **Automatic (No Code Changes)**
- ✅ All LangChain LLM calls (OpenAI, Claude, etc.)
- ✅ Token usage (input + output)
- ✅ Latency (total + first token)
- ✅ Costs (calculated automatically)
- ✅ Errors and exceptions
- ✅ Model parameters (temperature, max_tokens)

### **What You'll See in Dashboard**

#### **Trace View** (Workflow Execution)
```
Mode1_Manual_Simple
├── validate_inputs_node (10ms)
├── fetch_agent_node (50ms)
├── rag_retrieval_node (200ms)
├── execute_agent_node (2500ms)
│   └── ChatOpenAI.astream() [gpt-4]
│       ├── Prompt: "You are a medical specialist..."
│       ├── Response: "Hypertension is..."
│       ├── Tokens: 150 input + 300 output
│       └── Cost: $0.015
└── format_output_node (20ms)

Total: 2780ms
Total Cost: $0.015
```

#### **Performance Dashboard**
- TTFT (Time to First Token): 800ms avg
- Tokens/Second: 45 avg
- Error Rate: 0.5%
- Cost per Request: $0.012 avg

---

## 🎛️ Advanced Configuration

### **Custom Metadata**

Add session/user metadata for better filtering:

```python
# In your LLM config (already implemented)
langfuse_callback = CallbackHandler(
    public_key=os.getenv('LANGFUSE_PUBLIC_KEY'),
    secret_key=os.getenv('LANGFUSE_SECRET_KEY'),
    metadata={
        "environment": "production",
        "version": "2.0.0",
        "service": "vital-ai-engine"
    }
)
```

### **Tag by User/Session**

```python
# In your request handler
langfuse_callback.trace(
    name="Mode1_Request",
    user_id=request.user_id,
    session_id=request.session_id,
    metadata={"agent_id": request.agent_id}
)
```

---

## 🔒 Security Best Practices

1. **Never commit keys to git**:
   ```bash
   # Add to .gitignore
   .env
   *.key
   ```

2. **Use different keys per environment**:
   - `pk-lf-dev-...` for development
   - `pk-lf-prod-...` for production

3. **Rotate keys regularly** (every 90 days)

4. **Set IP allowlists** in Langfuse dashboard (if available)

---

## 📈 Cost Tracking

Langfuse automatically calculates costs based on:
- Model pricing (OpenAI, Anthropic, etc.)
- Token usage (input + output)
- Currency: USD

**View costs by**:
- Per user
- Per session
- Per agent
- Per time period

---

## 🐛 Troubleshooting

### **Issue**: "Langfuse not installed"

**Solution**:
```bash
pip install langfuse
```

### **Issue**: "Authentication failed"

**Solution**:
- Verify keys are correct
- Check `LANGFUSE_HOST` is correct
- Test keys in Langfuse UI → Settings → API Keys

### **Issue**: "No traces appearing"

**Solution**:
- Check backend logs for Langfuse errors
- Verify network connectivity to Langfuse host
- Check firewall/proxy settings
- Try a test request and wait 10 seconds

### **Issue**: "Traces incomplete"

**Solution**:
- Ensure `streaming=True` in LLM config
- Check for exceptions in workflow
- Verify callback is attached to LLM instance

---

## 📚 Resources

- **Langfuse Docs**: https://langfuse.com/docs
- **Python SDK**: https://langfuse.com/docs/sdk/python
- **LangChain Integration**: https://langfuse.com/docs/integrations/langchain
- **Self-Hosting**: https://langfuse.com/docs/deployment/self-host

---

## ✅ Checklist

- [ ] Sign up for Langfuse Cloud (or set up self-hosted)
- [ ] Get API keys
- [ ] Set environment variables (LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST)
- [ ] Install `langfuse` package (if needed)
- [ ] Restart backend
- [ ] Verify "Langfuse observability enabled" in logs
- [ ] Make test request
- [ ] Check Langfuse dashboard for traces
- [ ] Set up alerts for errors/high costs (optional)
- [ ] Share dashboard access with team (optional)

---

**Next Steps**: Once configured, Langfuse will automatically track all LLM calls with zero additional code changes! 🎉

