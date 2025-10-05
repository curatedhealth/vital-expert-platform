# VITAL Token Tracking - Quick Start Guide
## LangChain + LangSmith + LangGraph Implementation

**Target:** Production-ready in 3 days  
**Architecture:** LangChain/LangSmith/LangGraph  
**Services:** 1:1 Conversations, Virtual Panels, Workflows, Solution Builder

---

## Day 1: Database & Infrastructure (4 hours)

### Step 1: Supabase Setup (30 min)

```bash
# 1. Go to https://supabase.com
# 2. Create new project (or use existing)
# 3. Go to SQL Editor
# 4. Copy entire contents of: supabase-migration-langchain-updated.sql
# 5. Execute the migration
```

**Verify tables created:**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%token%' OR tablename LIKE '%workflow%';

-- Should see:
-- - token_usage_logs
-- - budget_limits
-- - cost_alerts
-- - service_performance_metrics
-- - workflow_analytics
```

### Step 2: Environment Setup (30 min)

```bash
# Install dependencies
pip install langchain-anthropic langchain-openai langchain-core langgraph supabase python-dotenv langsmith

# Create .env file
cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# LLM Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# LangSmith (Optional but recommended)
LANGCHAIN_API_KEY=lsv2_pt_...
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=vital-mvp
EOF

# Add to .gitignore
echo ".env" >> .gitignore
```

### Step 3: Get Your User ID (15 min)

```sql
-- In Supabase SQL Editor
-- If you have Auth set up:
SELECT id FROM auth.users WHERE email = 'your@email.com';

-- OR create a test user:
INSERT INTO auth.users (id, email)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@vital.ai');

-- Use this ID in all examples below
```

### Step 4: Set Budget Limits (15 min)

```sql
-- Set budget for your test user
INSERT INTO budget_limits (entity_type, entity_id, daily_limit, monthly_limit, action_on_breach)
VALUES 
  ('user', '550e8400-e29b-41d4-a716-446655440000', 5.00, 100.00, 'alert');

-- Verify
SELECT * FROM budget_limits WHERE entity_type = 'user';
```

### Step 5: Test Basic Connection (30 min)

```python
# test_connection.py
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

# Test Supabase connection
supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

# Test query
result = supabase.table('budget_limits').select('*').execute()
print(f"✓ Supabase connected: {len(result.data)} budget limits found")

# Test Anthropic
from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-haiku-4-20250514")
print("✓ Anthropic API working")

# Test OpenAI
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4o-mini")
print("✓ OpenAI API working")

print("\n✅ All connections working!")
```

Run: `python test_connection.py`

---

## Day 2: Implement All 4 Services (6 hours)

### Service 1: 1:1 Conversations (1 hour)

```python
# services/one_to_one.py
from vital_langchain_tracker_complete import OneToOneConversation
import uuid

# Initialize service
user_id = "550e8400-e29b-41d4-a716-446655440000"  # Your user ID
session_id = f"session_{uuid.uuid4().hex[:8]}"

conversation = OneToOneConversation(user_id, session_id)

# Define your agent
regulatory_agent = {
    'id': 'regulatory_strategy_001',
    'name': 'Regulatory Strategy Agent',
    'tier': 1,
    'model': 'claude-sonnet-4-20250514'
}

# Chat
response = conversation.chat(
    agent_config=regulatory_agent,
    message="What's the FDA approval pathway for our biosimilar?"
)

print(response)

# ✅ Check Supabase token_usage_logs table - you should see new entry!
```

**Test:**
```bash
python services/one_to_one.py
```

**Verify in Supabase:**
```sql
SELECT 
    service_type, 
    agent_name, 
    total_tokens, 
    total_cost,
    created_at
FROM token_usage_logs
WHERE service_type = '1:1_conversation'
ORDER BY created_at DESC
LIMIT 5;
```

### Service 2: Virtual Panels (1.5 hours)

```python
# services/virtual_panel.py
from vital_langchain_tracker_complete import VirtualAdvisoryPanel
import uuid

user_id = "550e8400-e29b-41d4-a716-446655440000"
session_id = f"session_{uuid.uuid4().hex[:8]}"

# Create panel
panel = VirtualAdvisoryPanel(
    user_id=user_id,
    session_id=session_id,
    panel_name="Oncology Launch Advisory Board"
)

# Define panel members
panel_members = [
    {
        'id': 'kol_oncology_001',
        'name': 'Dr. Sarah Chen - KOL Oncology',
        'tier': 1,
        'expertise': 'Clinical Oncology & Treatment Protocols'
    },
    {
        'id': 'payer_strategy_001',
        'name': 'John Martinez - Payer Strategy',
        'tier': 1,
        'expertise': 'Market Access & Reimbursement'
    },
    {
        'id': 'patient_advocate_001',
        'name': 'Emily Rodriguez - Patient Advocate',
        'tier': 2,
        'expertise': 'Patient Experience & Outcomes'
    },
    {
        'id': 'pharmacoeconomics_001',
        'name': 'Dr. Michael Lee - Health Economics',
        'tier': 2,
        'expertise': 'Pharmacoeconomics & Value Assessment'
    }
]

# Convene panel
question = """
Our biosimilar oncology drug will launch in Q1 2026 targeting metastatic breast cancer.
What are the top 3 critical success factors we need to address for a successful launch?
"""

insights = panel.convene(
    panel_members=panel_members,
    question=question
)

# Display results
for insight in insights:
    print(f"\n{'='*60}")
    print(f"Expert: {insight['member']}")
    print(f"Expertise: {insight['expertise']}")
    print(f"\nPerspective:")
    print(insight['response'][:200] + "...")
```

**Test:**
```bash
python services/virtual_panel.py
```

**Verify in Supabase:**
```sql
-- See all panel members and their contributions
SELECT 
    panel_name,
    panel_member_position,
    agent_name,
    total_cost,
    total_tokens
FROM token_usage_logs
WHERE service_type = 'virtual_panel'
AND panel_id = (
    SELECT panel_id FROM token_usage_logs 
    WHERE service_type = 'virtual_panel' 
    ORDER BY created_at DESC LIMIT 1
)
ORDER BY panel_member_position;
```

### Service 3: Workflows with LangGraph (2 hours)

```python
# services/workflow_market_research.py
from vital_langchain_tracker_complete import OrchestatedWorkflow
import uuid

user_id = "550e8400-e29b-41d4-a716-446655440000"
session_id = f"session_{uuid.uuid4().hex[:8]}"

# Create workflow
workflow = OrchestatedWorkflow(
    user_id=user_id,
    session_id=session_id,
    workflow_name="Market Research & Strategic Planning - Oncology"
)

# Execute workflow
result = workflow.execute(
    input_prompt="""
    Comprehensive market analysis for biosimilar oncology drug targeting 
    metastatic breast cancer. EU market launch planned for Q1 2026.
    Focus on: competitive landscape, pricing strategies, market access pathways.
    """
)

# Results
print("=== Market Research Results ===")
print(result['market_research'][:300] + "...")

print("\n=== Competitive Analysis ===")
print(result['competitive_analysis'][:300] + "...")

print("\n=== Strategic Imperatives ===")
print(result['strategic_imperatives'][:300] + "...")
```

**Test:**
```bash
python services/workflow_market_research.py
```

**Verify workflow steps:**
```sql
-- See workflow execution breakdown
SELECT 
    workflow_name,
    workflow_step,
    workflow_step_name,
    agent_name,
    total_cost,
    latency_ms,
    success
FROM token_usage_logs
WHERE workflow_id = (
    SELECT workflow_id FROM token_usage_logs 
    WHERE service_type = 'workflow' 
    ORDER BY created_at DESC LIMIT 1
)
ORDER BY workflow_step;
```

### Service 4: Solution Builder (1.5 hours)

```python
# services/solution_builder_brand_plan.py
from vital_langchain_tracker_complete import SolutionBuilder
import uuid

user_id = "550e8400-e29b-41d4-a716-446655440000"
session_id = f"session_{uuid.uuid4().hex[:8]}"

# Create solution builder
builder = SolutionBuilder(
    user_id=user_id,
    session_id=session_id,
    solution_name="Complete Brand Plan - OncoRx Launch"
)

# Build comprehensive brand plan
brand_plan = builder.build_brand_plan(
    product_info={
        'name': 'OncoRx-500',
        'indication': 'Metastatic Breast Cancer',
        'launch_date': '2026-Q1',
        'geography': 'EU-5 Markets',
        'target_population': 'HER2+ Advanced/Metastatic'
    }
)

# Save results
import json
with open('brand_plan_output.json', 'w') as f:
    json.dump({
        'solution_id': brand_plan['solution_id'],
        'market_research': brand_plan['market_research']['strategic_imperatives'][:500],
        'strategy': brand_plan['strategy']['strategic_imperatives'][:500],
        'tactics': brand_plan['tactics']['strategic_imperatives'][:500],
        'final_plan': brand_plan['brand_plan'][:1000]
    }, f, indent=2)

print(f"✅ Brand Plan Created: {brand_plan['solution_id']}")
print(f"📄 Full output saved to: brand_plan_output.json")
```

**Test:**
```bash
python services/solution_builder_brand_plan.py
```

**Verify multi-workflow solution:**
```sql
-- See all workflows in the solution
SELECT 
    workflow_name,
    workflow_step_name,
    COUNT(*) as calls,
    SUM(total_cost) as total_cost
FROM token_usage_logs
WHERE service_id = (
    SELECT service_id FROM token_usage_logs 
    WHERE service_type = 'solution_builder' 
    ORDER BY created_at DESC LIMIT 1
)
GROUP BY workflow_name, workflow_step_name
ORDER BY workflow_name, workflow_step_name;

-- Total cost for entire solution
SELECT 
    service_type,
    service_id,
    SUM(total_cost) as total_solution_cost,
    COUNT(*) as total_llm_calls
FROM token_usage_logs
WHERE service_type = 'solution_builder'
  AND service_id = (
      SELECT service_id FROM token_usage_logs 
      WHERE service_type = 'solution_builder' 
      ORDER BY created_at DESC LIMIT 1
  )
GROUP BY service_type, service_id;
```

---

## Day 3: Analytics & Monitoring (4 hours)

### Setup Cost Dashboard (2 hours)

```python
# dashboard/vital_dashboard_streamlit.py
import streamlit as st
import pandas as pd
from supabase import create_client
import plotly.express as px
import os
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="VITAL Cost Tracker", layout="wide")

# Initialize Supabase
@st.cache_resource
def init_supabase():
    return create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_SERVICE_KEY")
    )

supabase = init_supabase()

st.title("📊 VITAL Platform - Cost & Usage Analytics")

# Filters
st.sidebar.header("Filters")
days = st.sidebar.slider("Days to analyze", 1, 30, 7)

# ====================
# KEY METRICS
# ====================

col1, col2, col3, col4 = st.columns(4)

# Total cost
cost_result = supabase.table('token_usage_logs')\
    .select('total_cost')\
    .gte('created_at', f'now() - interval \'{days} days\'')\
    .execute()

total_cost = sum(row['total_cost'] for row in cost_result.data) if cost_result.data else 0

col1.metric("Total Cost", f"${total_cost:.2f}", f"Last {days} days")

# Total requests
col2.metric("Total Requests", len(cost_result.data) if cost_result.data else 0)

# Avg cost per request
avg_cost = total_cost / len(cost_result.data) if cost_result.data else 0
col3.metric("Avg Cost/Request", f"${avg_cost:.4f}")

# Budget utilization
budget_result = supabase.table('budget_limits')\
    .select('monthly_limit')\
    .eq('entity_type', 'organization')\
    .execute()

budget = budget_result.data[0]['monthly_limit'] if budget_result.data else 500
utilization = (total_cost / budget * 100) if budget > 0 else 0

col4.metric("Budget Used", f"{utilization:.1f}%", f"of ${budget}")

# ====================
# SERVICE BREAKDOWN
# ====================

st.header("💼 Cost by Service Type")

service_result = supabase.table('token_usage_logs')\
    .select('service_type, total_cost')\
    .gte('created_at', f'now() - interval \'{days} days\'')\
    .execute()

if service_result.data:
    df_services = pd.DataFrame(service_result.data)
    service_summary = df_services.groupby('service_type')['total_cost'].sum().reset_index()
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        fig = px.bar(
            service_summary,
            x='service_type',
            y='total_cost',
            title='Cost by Service Type',
            labels={'total_cost': 'Cost ($)', 'service_type': 'Service'}
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = px.pie(
            service_summary,
            values='total_cost',
            names='service_type',
            title='Service Distribution'
        )
        st.plotly_chart(fig, use_container_width=True)

# ====================
# WORKFLOW EFFICIENCY
# ====================

st.header("⚡ Workflow Efficiency")

workflow_result = supabase.table('token_usage_logs')\
    .select('workflow_name, workflow_step_name, total_cost')\
    .eq('service_type', 'workflow')\
    .gte('created_at', f'now() - interval \'{days} days\'')\
    .not_.is_('workflow_name', 'null')\
    .execute()

if workflow_result.data:
    df_workflows = pd.DataFrame(workflow_result.data)
    workflow_summary = df_workflows.groupby(['workflow_name', 'workflow_step_name'])['total_cost'].sum().reset_index()
    
    fig = px.bar(
        workflow_summary,
        x='workflow_step_name',
        y='total_cost',
        color='workflow_name',
        title='Workflow Cost by Step',
        labels={'total_cost': 'Cost ($)', 'workflow_step_name': 'Step'}
    )
    st.plotly_chart(fig, use_container_width=True)

# ====================
# RECENT ACTIVITY
# ====================

st.header("🕐 Recent Activity")

recent_result = supabase.table('token_usage_logs')\
    .select('created_at, service_type, agent_name, total_cost, success')\
    .order('created_at', desc=True)\
    .limit(20)\
    .execute()

if recent_result.data:
    df_recent = pd.DataFrame(recent_result.data)
    df_recent['created_at'] = pd.to_datetime(df_recent['created_at'])
    st.dataframe(df_recent, use_container_width=True)
```

**Launch dashboard:**
```bash
pip install streamlit plotly
streamlit run dashboard/vital_dashboard_streamlit.py
```

### Set Up Budget Alerts (1 hour)

```python
# monitoring/budget_alerts.py
from supabase import create_client
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

load_dotenv()

def check_budgets():
    """Check all budget limits and send alerts"""
    supabase = create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_SERVICE_KEY")
    )
    
    # Get all budget limits
    limits = supabase.table('budget_limits').select('*').execute()
    
    alerts = []
    
    for limit in limits.data:
        # Check daily spending
        if limit['daily_limit']:
            result = supabase.table('token_usage_logs')\
                .select('total_cost')\
                .gte('created_at', 'now()::date')\
                .execute()
            
            daily_spent = sum(row['total_cost'] for row in result.data) if result.data else 0
            
            if daily_spent > limit['daily_limit'] * 0.8:  # 80% threshold
                alerts.append({
                    'type': 'daily',
                    'entity': f"{limit['entity_type']}: {limit['entity_id']}",
                    'spent': daily_spent,
                    'limit': limit['daily_limit'],
                    'percent': (daily_spent / limit['daily_limit'] * 100)
                })
    
    # Send alerts
    if alerts:
        send_alert_email(alerts)
    
    return alerts

def send_alert_email(alerts):
    """Send alert email"""
    message = "VITAL Budget Alerts:\n\n"
    for alert in alerts:
        message += f"{alert['entity']}: ${alert['spent']:.2f} / ${alert['limit']:.2f} ({alert['percent']:.1f}%)\n"
    
    # Configure your email settings
    # msg = MIMEText(message)
    # ... send email
    
    print(message)

if __name__ == "__main__":
    alerts = check_budgets()
    print(f"Found {len(alerts)} budget alerts")
```

**Run daily via cron:**
```bash
# Add to crontab
0 9 * * * cd /path/to/vital && python monitoring/budget_alerts.py
```

### Create Cost Report (1 hour)

```python
# reports/weekly_cost_report.py
from supabase import create_client
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def generate_weekly_report():
    """Generate weekly cost report"""
    supabase = create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_SERVICE_KEY")
    )
    
    # Get last 7 days data
    result = supabase.table('token_usage_logs')\
        .select('*')\
        .gte('created_at', (datetime.now() - timedelta(days=7)).isoformat())\
        .execute()
    
    df = pd.DataFrame(result.data)
    
    report = f"""
VITAL Platform - Weekly Cost Report
Week Ending: {datetime.now().strftime('%Y-%m-%d')}
{'='*60}

SUMMARY
-------
Total Cost: ${df['total_cost'].sum():.2f}
Total Requests: {len(df)}
Avg Cost/Request: ${df['total_cost'].mean():.4f}

BY SERVICE TYPE
---------------
{df.groupby('service_type')['total_cost'].sum().to_string()}

TOP 5 MOST EXPENSIVE AGENTS
----------------------------
{df.groupby('agent_name')['total_cost'].sum().nlargest(5).to_string()}

WORKFLOW EFFICIENCY
-------------------
{df[df['service_type']=='workflow'].groupby('workflow_name')['total_cost'].sum().to_string()}

RECOMMENDATIONS
---------------
"""
    
    # Add recommendations
    if df['total_cost'].sum() > 50:
        report += "⚠️ Weekly spending exceeded $50 - consider optimization\n"
    
    top_agent = df.groupby('agent_name')['total_cost'].sum().idxmax()
    report += f"💡 Consider caching for '{top_agent}' (highest cost)\n"
    
    print(report)
    
    # Save to file
    with open(f'reports/weekly_report_{datetime.now().strftime("%Y%m%d")}.txt', 'w') as f:
        f.write(report)

if __name__ == "__main__":
    generate_weekly_report()
```

---

## Production Checklist

### ✅ Before Going Live

- [ ] Database migration completed
- [ ] All 4 services tested
- [ ] Budget limits configured
- [ ] Budget alerts working
- [ ] Dashboard accessible
- [ ] Team trained on monitoring
- [ ] LangSmith project set up (optional)
- [ ] Cost optimization plan ready

### 📊 Expected Costs (MVP)

Based on typical usage:

| Service | Avg Cost/Use | Uses/User/Month | Monthly Cost/User |
|---------|--------------|------------------|-------------------|
| 1:1 Conversations | $0.036 | 10 | $0.36 |
| Virtual Panels | $0.144 | 5 | $0.72 |
| Workflows | $0.108 | 8 | $0.86 |
| Solution Builder | $0.270 | 2 | $0.54 |
| **TOTAL** | - | - | **$2.48** |

**For 100 users:** ~$248/month  
**With 30% buffer:** ~$322/month  
**Target with optimization:** ~$175/month

### 🎯 Key Metrics to Monitor Daily

1. **Total daily cost** - Should stay under $15/day
2. **Cost per service type** - Identify expensive services
3. **Failed requests** - Track errors
4. **Budget utilization** - Stay under 80%
5. **Top 5 expensive agents** - Optimize these first

### 🚨 Alert Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| Daily cost | > $20 | Email team |
| Single request | > $0.50 | Log for review |
| Monthly projection | > $400 | Review strategy |
| Service failure rate | > 5% | Investigate |

---

## Optimization Strategies (Week 2+)

### 1. Enable Prompt Caching

```python
# Add to your trackers
cache_hit_rate = 0.30  # Target 30% cache hits

# Monitor in SQL:
SELECT 
    cache_hit,
    COUNT(*) as requests,
    AVG(total_cost) as avg_cost
FROM token_usage_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY cache_hit;
```

### 2. Optimize Expensive Agents

```sql
-- Find optimization candidates
SELECT 
    agent_name,
    COUNT(*) as calls,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost,
    AVG(total_tokens) as avg_tokens
FROM token_usage_logs
WHERE created_at >= now() - interval '30 days'
GROUP BY agent_name
HAVING SUM(total_cost) > 10
ORDER BY total_cost DESC;
```

### 3. Workflow Step Optimization

```sql
-- Identify expensive workflow steps
SELECT 
    workflow_name,
    workflow_step_name,
    COUNT(*) as executions,
    AVG(total_cost) as avg_cost,
    SUM(total_cost) as total_cost
FROM token_usage_logs
WHERE service_type = 'workflow'
GROUP BY workflow_name, workflow_step_name
HAVING AVG(total_cost) > 0.10
ORDER BY total_cost DESC;
```

---

## Need Help?

### Common Issues

**"Budget exceeded" error:**
```sql
-- Check current spending
SELECT SUM(total_cost) 
FROM token_usage_logs 
WHERE user_id = 'YOUR_USER_ID' 
AND created_at >= now()::date;

-- Increase limit
UPDATE budget_limits 
SET daily_limit = 10.00 
WHERE entity_type = 'user' 
AND entity_id = 'YOUR_USER_ID';
```

**"No data in dashboard":**
```sql
-- Verify data exists
SELECT COUNT(*) FROM token_usage_logs;

-- Check RLS policies
SELECT * FROM token_usage_logs LIMIT 1;
```

**"Slow queries":**
```sql
-- Refresh materialized views
SELECT refresh_cost_analytics_views();
```

---

## Next Steps

1. **Week 1:** Implement tracking for all services
2. **Week 2:** Monitor and optimize (target 20% cost reduction)
3. **Week 3:** Fine-tune budgets based on actual usage
4. **Week 4:** Achieve 40% cost reduction through optimization

**Target:** Under $2/user/month with optimization

Good luck! 🚀
