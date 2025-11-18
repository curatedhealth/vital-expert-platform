/**
 * Test Monitoring Integration
 * Verifies that all monitoring components are working correctly
 */

import { ragLatencyTracker } from '../src/lib/services/monitoring/rag-latency-tracker';
import { ragCostTracker } from '../src/lib/services/monitoring/rag-cost-tracker';
import { RAG_CIRCUIT_BREAKERS, circuitBreakerManager } from '../src/lib/services/monitoring/circuit-breaker';
import { ragMetricsDashboard } from '../src/lib/services/monitoring/rag-metrics-dashboard';

async function testMonitoring() {
  console.log('🧪 Testing RAG Monitoring System\n');
  console.log('═'.repeat(60));

  // Test 1: Latency Tracker
  console.log('\n1️⃣  Testing Latency Tracker...');
  try {
    ragLatencyTracker.trackOperation({
      queryId: 'test-query-1',
      timestamp: new Date().toISOString(),
      strategy: 'hybrid',
      cacheHit: false,
      cacheCheckMs: 10,
      queryEmbeddingMs: 120,
      vectorSearchMs: 450,
      rerankingMs: 0,
      totalRetrievalMs: 580,
    });

    ragLatencyTracker.trackOperation({
      queryId: 'test-query-2',
      timestamp: new Date().toISOString(),
      strategy: 'hybrid',
      cacheHit: true,
      cacheCheckMs: 8,
      queryEmbeddingMs: 0,
      vectorSearchMs: 0,
      rerankingMs: 0,
      totalRetrievalMs: 8,
    });

    const breakdown = ragLatencyTracker.getLatencyBreakdown(60);
    console.log('   ✅ Latency tracker working');
    console.log(`   📊 Tracked ${breakdown.total.count} operations`);
    console.log(`   ⚡ P95: ${breakdown.total.p95.toFixed(0)}ms`);
    console.log(`   📦 Cache hit rate: ${(breakdown.cacheStats.hitRate * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('   ❌ Latency tracker failed:', error);
  }

  // Test 2: Cost Tracker
  console.log('\n2️⃣  Testing Cost Tracker...');
  try {
    ragCostTracker.trackEmbedding('test-query-1', 'text-embedding-3-large', 100);
    ragCostTracker.trackVectorSearch('test-query-1', 10, false);
    ragCostTracker.trackReranking('test-query-1', 5);

    const stats = ragCostTracker.getCostStats(60);
    console.log('   ✅ Cost tracker working');
    console.log(`   💰 Total cost: $${stats.totalCostUsd.toFixed(6)}`);
    console.log(`   📊 Tracked ${stats.queryCount} queries`);
    console.log(`   💵 Avg per query: $${stats.avgCostPerQuery.toFixed(6)}`);

    const budget = ragCostTracker.checkBudget();
    console.log(`   📈 Daily budget: ${budget.dailyStatus.percent.toFixed(1)}% used`);
  } catch (error) {
    console.error('   ❌ Cost tracker failed:', error);
  }

  // Test 3: Circuit Breaker
  console.log('\n3️⃣  Testing Circuit Breaker...');
  try {
    const result = await RAG_CIRCUIT_BREAKERS.openai.execute(
      async () => {
        return 'success';
      },
      async () => {
        return 'fallback';
      }
    );

    const stats = RAG_CIRCUIT_BREAKERS.openai.getStats();
    console.log('   ✅ Circuit breaker working');
    console.log(`   🔌 State: ${stats.state}`);
    console.log(`   ✅ Successes: ${stats.successes}`);
    console.log(`   ❌ Failures: ${stats.failures}`);
  } catch (error) {
    console.error('   ❌ Circuit breaker failed:', error);
  }

  // Test 4: Circuit Breaker Manager
  console.log('\n4️⃣  Testing Circuit Breaker Manager...');
  try {
    const allStats = circuitBreakerManager.getAllStats();
    const unhealthy = circuitBreakerManager.getUnhealthyServices();

    console.log('   ✅ Circuit breaker manager working');
    console.log(`   🔌 Monitoring ${Object.keys(allStats).length} services`);
    console.log(`   ⚠️  Unhealthy services: ${unhealthy.length === 0 ? 'None' : unhealthy.join(', ')}`);
  } catch (error) {
    console.error('   ❌ Circuit breaker manager failed:', error);
  }

  // Test 5: Metrics Dashboard
  console.log('\n5️⃣  Testing Metrics Dashboard...');
  try {
    const dashboard = await ragMetricsDashboard.getDashboard(60);

    console.log('   ✅ Metrics dashboard working');
    console.log(`   📊 Latency P95: ${dashboard.latency.overall.total.p95.toFixed(0)}ms`);
    console.log(`   💰 Total cost: $${dashboard.cost.stats.totalCostUsd.toFixed(6)}`);
    console.log(`   📦 Cache hit rate: ${(dashboard.cache.hitRate * 100).toFixed(1)}%`);
    console.log(`   🏥 Health status: ${dashboard.health.overallStatus.toUpperCase()}`);
    console.log(`   💡 Recommendations: ${dashboard.recommendations.length}`);

    if (dashboard.recommendations.length > 0) {
      console.log('\n   Top recommendation:');
      console.log(`   ${dashboard.recommendations[0]}`);
    }
  } catch (error) {
    console.error('   ❌ Metrics dashboard failed:', error);
  }

  // Test 6: Real-time Metrics
  console.log('\n6️⃣  Testing Real-time Metrics...');
  try {
    const realtime = await ragMetricsDashboard.getRealTimeMetrics();

    console.log('   ✅ Real-time metrics working');
    console.log(`   ⚡ P95 latency: ${realtime.latencyP95.toFixed(0)}ms`);
    console.log(`   💰 Cost per query: $${realtime.costPerQuery.toFixed(6)}`);
    console.log(`   📦 Cache hit rate: ${(realtime.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   📊 Query count: ${realtime.queryCount}`);
    console.log(`   ⚠️  Error rate: ${(realtime.errorRate * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('   ❌ Real-time metrics failed:', error);
  }

  // Test 7: SLO Compliance
  console.log('\n7️⃣  Testing SLO Compliance...');
  try {
    const slo = await ragMetricsDashboard.getSLOCompliance(60);

    console.log('   ✅ SLO compliance working');
    console.log(`   ⚡ Latency SLO: ${slo.latencySLO.compliant ? '✅ PASS' : '❌ FAIL'} (${slo.latencySLO.actual.toFixed(0)}ms / ${slo.latencySLO.target}ms)`);
    console.log(`   🔌 Availability SLO: ${slo.availabilitySLO.compliant ? '✅ PASS' : '❌ FAIL'} (${(slo.availabilitySLO.actual * 100).toFixed(2)}% / ${(slo.availabilitySLO.target * 100).toFixed(2)}%)`);
    console.log(`   💰 Cost SLO: ${slo.costSLO.compliant ? '✅ PASS' : '❌ FAIL'} ($${slo.costSLO.actual.toFixed(4)} / $${slo.costSLO.target})`);
  } catch (error) {
    console.error('   ❌ SLO compliance failed:', error);
  }

  // Final Summary
  console.log('\n═'.repeat(60));
  console.log('\n✅ Monitoring System Test Complete!\n');
  console.log('Next Steps:');
  console.log('1. Configure budget limits in .env:');
  console.log('   RAG_DAILY_BUDGET_USD=10');
  console.log('   RAG_MONTHLY_BUDGET_USD=300');
  console.log('   RAG_PER_QUERY_BUDGET_USD=0.10');
  console.log('');
  console.log('2. Start your dev server and access metrics:');
  console.log('   npm run dev');
  console.log('   curl "http://localhost:3000/api/rag-metrics?endpoint=dashboard&format=console"');
  console.log('');
  console.log('3. Monitor in real-time:');
  console.log('   watch -n 5 \'curl -s "http://localhost:3000/api/rag-metrics?endpoint=realtime" | jq\'');
  console.log('');
}

// Run tests
testMonitoring().catch(console.error);
