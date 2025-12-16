# VITAL Platform - Performance Tests

Load and performance testing using k6.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Running Tests

### Basic Load Test

```bash
cd tests/performance

# Against local environment
k6 run api-load-test.js

# Against staging
BASE_URL=https://staging-api.vital.ai AUTH_TOKEN=your-token k6 run api-load-test.js
```

### Custom Scenarios

```bash
# Smoke test (light load)
k6 run --vus 5 --duration 30s api-load-test.js

# Stress test (high load)
k6 run --vus 200 --duration 10m api-load-test.js

# Spike test
k6 run --stage 10s:100,1m:100,10s:0 api-load-test.js
```

### Output Formats

```bash
# JSON output
k6 run --out json=results.json api-load-test.js

# CSV output
k6 run --out csv=results.csv api-load-test.js

# InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 api-load-test.js
```

## Test Scenarios

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 5 | 30s | Basic functionality |
| Load | 50 | 5m | Normal load |
| Stress | 100 | 10m | Peak load |
| Spike | 200 | 2m | Traffic spikes |
| Soak | 30 | 1h | Memory leaks |

## Metrics

### HTTP Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration` | Response time | p95 < 2s |
| `http_req_failed` | Failure rate | < 1% |
| `http_reqs` | Request rate | > 10 rps |

### Custom Metrics

| Metric | Description |
|--------|-------------|
| `health_latency` | Health check response time |
| `ask_expert_latency` | Ask Expert API response time |
| `workflow_latency` | Workflow API response time |

## Thresholds

```javascript
thresholds: {
  http_req_duration: ['p(95)<2000'],  // 95% under 2 seconds
  http_req_failed: ['rate<0.01'],      // Less than 1% failures
  http_reqs: ['rate>10'],              // At least 10 rps
}
```

## CI Integration

Performance tests run nightly in GitHub Actions. See `.github/workflows/performance.yml`.

## Grafana Dashboard

For real-time monitoring:

1. Run InfluxDB and Grafana
2. Configure k6 output to InfluxDB
3. Import dashboard ID: `2587`

```bash
# Run with InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 api-load-test.js
```

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025










