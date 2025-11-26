# Phase 5: Monitoring & Safety - Deployment Guide

## 🚀 Deployment Steps

### **Step 1: Deploy Database Migration**

Run the monitoring tables migration in Supabase:

**File**: `supabase/migrations/20251123_create_monitoring_tables.sql`

**What it creates**:
- ✅ `agent_interaction_logs` (26 columns, 4 indexes)
- ✅ `agent_diagnostic_metrics` (22 columns, 1 index)
- ✅ `agent_drift_alerts` (18 columns, 2 indexes)
- ✅ `agent_fairness_metrics` (16 columns, 3 indexes)

**How to deploy**:
1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251123_create_monitoring_tables.sql`
3. Paste and execute
4. Verify success (should see "Success. No rows returned")

**Verification query**:
```sql
-- Check tables created
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('agent_interaction_logs', 'agent_diagnostic_metrics', 'agent_drift_alerts', 'agent_fairness_metrics')
ORDER BY table_name;

-- Check indexes created
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agent_interaction_logs', 'agent_diagnostic_metrics', 'agent_drift_alerts', 'agent_fairness_metrics')
ORDER BY tablename, indexname;
```

**Expected output**:
- 4 tables with correct column counts (26, 22, 18, 16)
- 9 indexes total

---

### **Step 2: Install Python Dependencies**

The monitoring system requires these packages:

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine

# Install required packages
pip install scipy prometheus-client structlog
```

**Required packages**:
- `scipy` - For statistical tests (K-S test, t-test, z-test)
- `prometheus-client` - For Prometheus metrics export
- `structlog` - For structured logging (may already be installed)

---

### **Step 3: Update Environment Variables**

No new environment variables needed! The monitoring system uses existing database connections.

---

### **Step 4: Test Clinical Monitor**

Create a test script to verify the Clinical Monitor:

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine

# Create test script
cat > test_clinical_monitor.py << 'PYTEST'
"""
Test script for Clinical AI Monitor
"""
import asyncio
from uuid import uuid4, UUID
from decimal import Decimal
from datetime import date

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.monitoring.clinical_monitor import get_clinical_monitor
from src.monitoring.models import ServiceType, TierType, MetricPeriod


async def test_clinical_monitor():
    """Test Clinical Monitor functionality"""
    
    # Use your Supabase connection string
    # Format: postgresql+asyncpg://user:pass@host:port/database
    DATABASE_URL = "postgresql+asyncpg://..."  # Replace with your connection string
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get monitor instance
        monitor = await get_clinical_monitor(session)
        
        print("🧪 Testing Clinical Monitor...")
        print("=" * 60)
        
        # Test 1: Log an interaction
        print("\n1️⃣  Testing interaction logging...")
        
        # Use a real agent_id from your database
        test_agent_id = UUID("00000000-0000-0000-0000-000000000001")  # Replace with real agent ID
        test_tenant_id = UUID("00000000-0000-0000-0000-000000000001")  # Replace with real tenant ID
        
        try:
            interaction_id = await monitor.log_interaction(
                tenant_id=test_tenant_id,
                session_id=uuid4(),
                agent_id=test_agent_id,
                service_type=ServiceType.ASK_EXPERT,
                query="What are the treatment options for Type 2 diabetes?",
                response="Treatment options include lifestyle modifications, metformin...",
                confidence_score=Decimal("0.92"),
                execution_time_ms=1250,
                tier=TierType.TIER_2,
                was_successful=True,
                tokens_used=450,
                cost_usd=Decimal("0.05"),
                context_chunks_used=5,
                graph_paths_used=2,
                user_age_group="45-60",
                user_gender="female",
                user_region="northeast",
            )
            print(f"   ✅ Interaction logged: {interaction_id}")
        except Exception as e:
            print(f"   ❌ Failed to log interaction: {e}")
            return
        
        # Test 2: Calculate diagnostic metrics
        print("\n2️⃣  Testing diagnostic metrics calculation...")
        try:
            metrics = await monitor.calculate_diagnostic_metrics(
                agent_id=test_agent_id,
                period=MetricPeriod.DAILY,
            )
            print(f"   ✅ Metrics calculated:")
            print(f"      Total interactions: {metrics.total_interactions}")
            if metrics.accuracy:
                print(f"      Accuracy: {float(metrics.accuracy):.2%}")
            if metrics.avg_response_time_ms:
                print(f"      Avg response time: {metrics.avg_response_time_ms}ms")
        except Exception as e:
            print(f"   ❌ Failed to calculate metrics: {e}")
        
        # Test 3: Generate performance report
        print("\n3️⃣  Testing performance report...")
        try:
            report = await monitor.get_performance_report(
                agent_id=test_agent_id,
                days=7,
            )
            print(f"   ✅ Report generated:")
            print(f"      Agent: {report.agent_name}")
            print(f"      Total interactions: {report.total_interactions}")
            print(f"      Success rate: {float(report.success_rate):.2%}")
            print(f"      Avg confidence: {float(report.avg_confidence):.2%}")
        except Exception as e:
            print(f"   ❌ Failed to generate report: {e}")
        
        # Test 4: Check quality thresholds
        print("\n4️⃣  Testing quality threshold checks...")
        try:
            checks = await monitor.check_quality_thresholds(
                agent_id=test_agent_id,
                min_accuracy=Decimal("0.85"),
                min_confidence=Decimal("0.70"),
                max_response_time_ms=5000,
            )
            print(f"   ✅ Quality checks complete:")
            print(f"      Passes all: {checks['passes_all']}")
            print(f"      Total checks: {len(checks['checks'])}")
        except Exception as e:
            print(f"   ❌ Failed quality checks: {e}")
        
        print("\n" + "=" * 60)
        print("✅ Clinical Monitor tests complete!")


if __name__ == "__main__":
    asyncio.run(test_clinical_monitor())
PYTEST

echo "✅ Test script created: test_clinical_monitor.py"
echo ""
echo "To run:"
echo "  1. Edit test_clinical_monitor.py and add your DATABASE_URL"
echo "  2. Replace test agent_id and tenant_id with real values"
echo "  3. Run: python3 test_clinical_monitor.py"
```

---

### **Step 5: Test Fairness Monitor**

```bash
cat > test_fairness_monitor.py << 'PYTEST'
"""
Test script for Fairness Monitor
"""
import asyncio
from uuid import UUID

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.monitoring.fairness_monitor import get_fairness_monitor


async def test_fairness_monitor():
    """Test Fairness Monitor functionality"""
    
    DATABASE_URL = "postgresql+asyncpg://..."  # Replace with your connection string
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        fairness = await get_fairness_monitor(session)
        
        print("🧪 Testing Fairness Monitor...")
        print("=" * 60)
        
        test_agent_id = UUID("00000000-0000-0000-0000-000000000001")  # Replace
        
        # Test 1: Calculate fairness metrics
        print("\n1️⃣  Testing fairness metrics calculation...")
        try:
            metrics = await fairness.calculate_fairness_metrics(
                agent_id=test_agent_id
            )
            print(f"   ✅ Calculated {len(metrics)} fairness metrics")
            for metric in metrics[:3]:  # Show first 3
                print(f"      {metric.protected_attribute.value}: {metric.attribute_value}")
                if metric.demographic_parity:
                    print(f"        Parity: {float(metric.demographic_parity):.3f}")
        except Exception as e:
            print(f"   ❌ Failed: {e}")
        
        # Test 2: Detect bias
        print("\n2️⃣  Testing bias detection...")
        try:
            violations = await fairness.detect_bias(agent_id=test_agent_id)
            if violations:
                print(f"   ⚠️  {len(violations)} violation(s) detected:")
                for v in violations:
                    print(f"      {v['protected_attribute']}: {v['attribute_value']}")
                    print(f"        Parity: {v['demographic_parity']:.2%}")
            else:
                print(f"   ✅ No bias violations detected")
        except Exception as e:
            print(f"   ❌ Failed: {e}")
        
        # Test 3: Generate fairness report
        print("\n3️⃣  Testing fairness report...")
        try:
            report = await fairness.generate_fairness_report(
                agent_id=test_agent_id
            )
            print(f"   ✅ Report generated:")
            print(f"      Agent: {report.agent_name}")
            print(f"      Compliance: {'✅ COMPLIANT' if report.is_compliant else '❌ NON-COMPLIANT'}")
            print(f"      Max parity: {float(report.max_demographic_parity):.2%}")
        except Exception as e:
            print(f"   ❌ Failed: {e}")
        
        print("\n" + "=" * 60)
        print("✅ Fairness Monitor tests complete!")


if __name__ == "__main__":
    asyncio.run(test_fairness_monitor())
PYTEST

echo "✅ Test script created: test_fairness_monitor.py"
```

---

### **Step 6: Test Drift Detector**

```bash
cat > test_drift_detector.py << 'PYTEST'
"""
Test script for Drift Detector
"""
import asyncio
from uuid import UUID

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.monitoring.drift_detector import get_drift_detector


async def test_drift_detector():
    """Test Drift Detector functionality"""
    
    DATABASE_URL = "postgresql+asyncpg://..."  # Replace with your connection string
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        detector = await get_drift_detector(session)
        
        print("🧪 Testing Drift Detector...")
        print("=" * 60)
        
        test_agent_id = UUID("00000000-0000-0000-0000-000000000001")  # Replace
        
        # Test: Check all drift types
        print("\n1️⃣  Testing comprehensive drift detection...")
        try:
            alerts = await detector.check_all_drift(
                agent_id=test_agent_id,
                baseline_days=30,
                current_days=7,
            )
            
            if alerts:
                print(f"   ⚠️  {len(alerts)} drift alert(s) detected:")
                for alert in alerts:
                    print(f"\n      Type: {alert.alert_type.value}")
                    print(f"      Severity: {alert.severity.value}")
                    print(f"      Baseline: {alert.baseline_value}")
                    print(f"      Current: {alert.current_value}")
                    if alert.drift_percentage:
                        print(f"      Drift: {float(alert.drift_percentage):.1f}%")
                    if alert.p_value:
                        print(f"      P-value: {float(alert.p_value):.4f}")
            else:
                print(f"   ✅ No drift detected (agent performance stable)")
        except Exception as e:
            print(f"   ❌ Failed: {e}")
        
        print("\n" + "=" * 60)
        print("✅ Drift Detector tests complete!")


if __name__ == "__main__":
    asyncio.run(test_drift_detector())
PYTEST

echo "✅ Test script created: test_drift_detector.py"
```

---

### **Step 7: Enable Prometheus Metrics**

Add Prometheus endpoint to FastAPI:

```python
# Add to services/ai-engine/src/main.py

from prometheus_client import make_asgi_app

# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

logger.info("✅ Prometheus metrics endpoint enabled at /metrics")
```

Then access metrics at: `http://localhost:8000/metrics`

---

### **Step 8: Set Up Grafana Dashboards** (Optional)

1. Install Grafana (if not already installed)
2. Add Prometheus as data source
3. Import AgentOS dashboards:
   - Performance dashboard
   - Quality dashboard
   - Safety dashboard
   - Fairness dashboard

---

### **Step 9: Schedule Drift Detection** (Optional)

Create a cron job to run drift detection daily:

```bash
# Add to crontab
0 2 * * * cd /path/to/services/ai-engine && python3 -c "from monitoring.drift_detector import check_drift_for_all_agents; check_drift_for_all_agents()"
```

---

## 📊 Deployment Checklist

- [ ] Database migration executed successfully
- [ ] 4 monitoring tables created
- [ ] 9 indexes verified
- [ ] Python dependencies installed (scipy, prometheus-client)
- [ ] Clinical Monitor tested
- [ ] Fairness Monitor tested
- [ ] Drift Detector tested
- [ ] Prometheus metrics endpoint enabled
- [ ] Grafana dashboards configured (optional)
- [ ] Drift detection scheduled (optional)

---

## 🎯 Quick Start (Minimal Deployment)

**Minimum viable deployment** (5 minutes):

1. **Deploy database migration** (2 min)
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy/paste: supabase/migrations/20251123_create_monitoring_tables.sql
   ```

2. **Install dependencies** (1 min)
   ```bash
   pip install scipy prometheus-client
   ```

3. **Start logging interactions** (2 min)
   ```python
   from monitoring.clinical_monitor import get_clinical_monitor
   from monitoring.models import ServiceType, TierType
   
   monitor = await get_clinical_monitor(db_session)
   
   await monitor.log_interaction(
       tenant_id=tenant_id,
       session_id=session_id,
       agent_id=agent_id,
       service_type=ServiceType.ASK_EXPERT,
       query=query,
       response=response,
       confidence_score=confidence,
       execution_time_ms=execution_time,
       tier=tier,
       was_successful=success,
   )
   ```

**That's it!** You now have:
- ✅ Complete audit trail
- ✅ Interaction logging
- ✅ Performance tracking
- ✅ Ready for metrics calculation

---

## 🚀 Production Deployment

For full production deployment, also:

1. Enable Prometheus metrics endpoint
2. Set up Grafana dashboards
3. Schedule daily drift detection
4. Configure fairness monitoring checks
5. Set up alerting (PagerDuty, Slack, etc.)
6. Create monitoring runbooks

---

## 📈 What You Get

Once deployed, Phase 5 monitoring provides:

1. **Full Observability** - Every interaction logged (26 fields)
2. **Clinical Metrics** - Sensitivity, specificity, precision, F1, accuracy
3. **Fairness Monitoring** - Demographic parity tracking (10% threshold)
4. **Drift Detection** - Proactive quality degradation alerts
5. **Real-Time Metrics** - 40+ Prometheus metrics
6. **Compliance** - Audit-ready reports

---

## 🆘 Troubleshooting

**Issue**: Tables not created
- Check Supabase SQL Editor for error messages
- Verify schema is `public`
- Check for conflicting table names

**Issue**: Import errors
- Verify Python version >= 3.9
- Install all dependencies: `pip install scipy prometheus-client structlog`
- Check PYTHONPATH includes `src/`

**Issue**: Database connection errors
- Verify connection string format
- Check Supabase credentials
- Ensure database is accessible

**Issue**: No data in metrics
- Log at least one interaction first
- Wait a few seconds for async writes
- Check `agent_interaction_logs` table has data

---

**Phase 5 deployment ready!** 🚀

Follow Step 1 to begin deployment.
