import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { options, BASE_URL, AUTH_TOKEN } from './k6-config.js';

// Custom metrics
const errorRate = new Rate('errors');
const healthLatency = new Trend('health_latency');
const askExpertLatency = new Trend('ask_expert_latency');
const workflowLatency = new Trend('workflow_latency');

export { options };

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`,
};

/**
 * Health Check Test
 */
export function healthCheck() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/health`);
  
  healthLatency.add(Date.now() - start);
  
  const success = check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response has status': (r) => JSON.parse(r.body).status === 'healthy',
  });
  
  errorRate.add(!success);
  sleep(0.5);
}

/**
 * Ask Expert Mode 1 Test
 */
export function askExpertMode1() {
  const payload = JSON.stringify({
    mode: 1,
    question: 'What is clinical trial Phase 3?',
    agent_id: null, // Let system select
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/expert/ask`, payload, { headers });
  
  askExpertLatency.add(Date.now() - start);
  
  const success = check(res, {
    'ask expert status is 200': (r) => r.status === 200,
    'ask expert has response': (r) => JSON.parse(r.body).response !== undefined,
  });
  
  errorRate.add(!success);
  sleep(1);
}

/**
 * Ask Expert Mode 2 Test (Auto-select)
 */
export function askExpertMode2() {
  const payload = JSON.stringify({
    mode: 2,
    question: 'How do I design a regulatory submission strategy?',
    agent_id: null,
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/expert/ask`, payload, { headers });
  
  askExpertLatency.add(Date.now() - start);
  
  const success = check(res, {
    'mode 2 status is 200': (r) => r.status === 200,
    'mode 2 has selected agent': (r) => JSON.parse(r.body).selected_agent !== undefined,
  });
  
  errorRate.add(!success);
  sleep(2);
}

/**
 * Workflow List Test
 */
export function listWorkflows() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/workflows`, { headers });
  
  workflowLatency.add(Date.now() - start);
  
  const success = check(res, {
    'list workflows status is 200': (r) => r.status === 200,
    'workflows is array': (r) => Array.isArray(JSON.parse(r.body).workflows),
  });
  
  errorRate.add(!success);
  sleep(0.5);
}

/**
 * Job Status Check Test
 */
export function checkJobStatus() {
  // Use a mock job ID for testing
  const jobId = 'test-job-id';
  const res = http.get(`${BASE_URL}/api/jobs/${jobId}/status`, { headers });
  
  // Job might not exist, which is fine for load testing
  check(res, {
    'job status returns response': (r) => r.status === 200 || r.status === 404,
  });
  
  sleep(0.3);
}

/**
 * Default scenario - mixed workload
 */
export default function () {
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    healthCheck();
  } else if (scenario < 0.6) {
    askExpertMode1();
  } else if (scenario < 0.8) {
    listWorkflows();
  } else {
    askExpertMode2();
  }
}

/**
 * Handle summary at end of test
 */
export function handleSummary(data) {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const { metrics } = data;
  let summary = '\n=== VITAL Platform Performance Test Results ===\n\n';
  
  summary += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  summary += `Failed Requests: ${metrics.http_req_failed?.values?.rate * 100 || 0}%\n`;
  summary += `Avg Response Time: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 0}ms\n`;
  summary += `P95 Response Time: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms\n`;
  summary += `P99 Response Time: ${metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 0}ms\n\n`;
  
  summary += '--- Custom Metrics ---\n';
  summary += `Health Check Latency (avg): ${metrics.health_latency?.values?.avg?.toFixed(2) || 0}ms\n`;
  summary += `Ask Expert Latency (avg): ${metrics.ask_expert_latency?.values?.avg?.toFixed(2) || 0}ms\n`;
  summary += `Workflow Latency (avg): ${metrics.workflow_latency?.values?.avg?.toFixed(2) || 0}ms\n`;
  
  return summary;
}



















