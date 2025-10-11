# VITAL AI Deployment & Operations Guide

## Overview

This guide provides comprehensive instructions for deploying, operating, and maintaining the VITAL AI chat service in production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Strategies](#deployment-strategies)
4. [Configuration Management](#configuration-management)
5. [Database Setup](#database-setup)
6. [Monitoring Setup](#monitoring-setup)
7. [Security Configuration](#security-configuration)
8. [Scaling and Performance](#scaling-and-performance)
9. [Backup and Recovery](#backup-and-recovery)
10. [Maintenance and Updates](#maintenance-and-updates)
11. [Troubleshooting](#troubleshooting)
12. [Disaster Recovery](#disaster-recovery)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores, 2.4GHz
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps

#### Recommended Requirements
- **CPU**: 8+ cores, 3.0GHz
- **RAM**: 32GB+
- **Storage**: 500GB+ NVMe SSD
- **Network**: 10Gbps

#### Production Requirements
- **CPU**: 16+ cores, 3.5GHz
- **RAM**: 64GB+
- **Storage**: 1TB+ NVMe SSD (RAID 10)
- **Network**: 25Gbps+

### Software Dependencies

- **Node.js**: 18.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 7.x or higher
- **Nginx**: 1.20+ (for load balancing)

### Cloud Provider Support

- **AWS**: EC2, RDS, ElastiCache, S3, CloudFront
- **Azure**: Virtual Machines, Database, Cache, Blob Storage, CDN
- **GCP**: Compute Engine, Cloud SQL, Memorystore, Cloud Storage, CDN
- **Kubernetes**: EKS, AKS, GKE

## Environment Setup

### 1. Development Environment

```bash
# Clone repository
git clone https://github.com/vital-ai/chat-service.git
cd chat-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### 2. Staging Environment

```bash
# Build application
npm run build

# Start production server
npm start

# Or use Docker
docker-compose -f docker-compose.staging.yml up -d
```

### 3. Production Environment

```bash
# Build optimized production image
docker build -t vital-ai:latest .

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## Deployment Strategies

### 1. Blue-Green Deployment

```yaml
# docker-compose.blue-green.yml
version: '3.8'
services:
  app-blue:
    image: vital-ai:blue
    ports:
      - "3001:3001"
    environment:
      - ENVIRONMENT=production
      - VERSION=blue
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  app-green:
    image: vital-ai:green
    ports:
      - "3002:3001"
    environment:
      - ENVIRONMENT=production
      - VERSION=green
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app-blue
      - app-green
```

### 2. Canary Deployment

```yaml
# kubernetes/canary-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vital-ai-canary
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vital-ai
      version: canary
  template:
    metadata:
      labels:
        app: vital-ai
        version: canary
    spec:
      containers:
      - name: vital-ai
        image: vital-ai:canary
        ports:
        - containerPort: 3001
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: VERSION
          value: "canary"
---
apiVersion: v1
kind: Service
metadata:
  name: vital-ai-canary-service
spec:
  selector:
    app: vital-ai
    version: canary
  ports:
  - port: 3001
    targetPort: 3001
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: vital-ai-routing
spec:
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: vital-ai-canary-service
        subset: canary
  - route:
    - destination:
        host: vital-ai-service
        subset: stable
      weight: 90
    - destination:
        host: vital-ai-canary-service
        subset: canary
      weight: 10
```

### 3. Rolling Deployment

```bash
#!/bin/bash
# rolling-deployment.sh

set -e

NEW_VERSION=$1
CURRENT_VERSION=$(kubectl get deployment vital-ai -o jsonpath='{.spec.template.spec.containers[0].image}' | cut -d':' -f2)

echo "Rolling deployment from $CURRENT_VERSION to $NEW_VERSION"

# Update image
kubectl set image deployment/vital-ai vital-ai=vital-ai:$NEW_VERSION

# Wait for rollout to complete
kubectl rollout status deployment/vital-ai

# Verify deployment
kubectl get pods -l app=vital-ai

echo "Rolling deployment completed successfully"
```

## Configuration Management

### 1. Environment Variables

```bash
# .env.production
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vital_ai
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LANGCHAIN_API_KEY=lsv2_sk_...

# Monitoring
PROMETHEUS_ENDPOINT=http://localhost:9090
JAEGER_ENDPOINT=http://localhost:16686

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Compliance
HIPAA_ENABLED=true
GDPR_ENABLED=true
AUDIT_LOGGING=true

# Performance
MAX_CONCURRENT_REQUESTS=100
RATE_LIMIT_PER_MINUTE=1000
CACHE_TTL=3600
```

### 2. Configuration Files

```yaml
# config/production.yml
database:
  host: ${DATABASE_HOST}
  port: ${DATABASE_PORT}
  name: ${DATABASE_NAME}
  username: ${DATABASE_USER}
  password: ${DATABASE_PASSWORD}
  ssl: true
  pool:
    min: 5
    max: 20
    acquireTimeoutMillis: 30000
    idleTimeoutMillis: 30000

redis:
  host: ${REDIS_HOST}
  port: ${REDIS_PORT}
  password: ${REDIS_PASSWORD}
  db: 0
  retryDelayOnFailover: 100
  maxRetriesPerRequest: 3

monitoring:
  prometheus:
    enabled: true
    endpoint: ${PROMETHEUS_ENDPOINT}
  jaeger:
    enabled: true
    endpoint: ${JAEGER_ENDPOINT}
  logging:
    level: info
    format: json

security:
  jwt:
    secret: ${JWT_SECRET}
    expiresIn: 24h
  encryption:
    algorithm: aes-256-gcm
    key: ${ENCRYPTION_KEY}
  rateLimit:
    windowMs: 60000
    max: 1000

compliance:
  hipaa:
    enabled: ${HIPAA_ENABLED}
    auditLogging: true
  gdpr:
    enabled: ${GDPR_ENABLED}
    dataRetention: 7y
  audit:
    enabled: ${AUDIT_LOGGING}
    retention: 7y
```

## Database Setup

### 1. PostgreSQL Configuration

```sql
-- Create database
CREATE DATABASE vital_ai;

-- Create user
CREATE USER vital_ai_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vital_ai TO vital_ai_user;

-- Create extensions
\c vital_ai;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 2. Database Migrations

```bash
# Run migrations
npm run migrate:up

# Or using Docker
docker-compose exec app npm run migrate:up

# Check migration status
npm run migrate:status
```

### 3. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX CONCURRENTLY idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX CONCURRENTLY idx_agent_responses_agent_id ON agent_responses(agent_id);
CREATE INDEX CONCURRENTLY idx_rag_documents_embedding ON rag_documents USING gin(embedding);

-- Analyze tables for query optimization
ANALYZE chat_messages;
ANALYZE agent_responses;
ANALYZE rag_documents;
```

## Monitoring Setup

### 1. Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'vital-ai'
    static_configs:
      - targets: ['app:3001']
    metrics_path: /api/metrics
    scrape_interval: 10s
```

### 2. Grafana Dashboards

```bash
# Import dashboards
curl -X POST \
  http://admin:admin@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @monitoring/grafana/dashboards/vital-overview.json
```

### 3. Alerting Rules

```yaml
# monitoring/prometheus/rules/alerts.yml
groups:
  - name: vital-ai-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
```

## Security Configuration

### 1. SSL/TLS Setup

```nginx
# nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name api.vital-ai.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://app:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Firewall Configuration

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp  # Only for internal access
ufw enable
```

### 3. Security Headers

```typescript
// middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

## Scaling and Performance

### 1. Horizontal Scaling

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vital-ai-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vital-ai
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Load Balancing

```nginx
# nginx/load-balancer.conf
upstream vital_ai_backend {
    least_conn;
    server app1:3001 max_fails=3 fail_timeout=30s;
    server app2:3001 max_fails=3 fail_timeout=30s;
    server app3:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.vital-ai.com;
    
    location / {
        proxy_pass http://vital_ai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
}
```

### 3. Caching Strategy

```typescript
// services/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export class CacheService {
  async get(key: string): Promise<any> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}
```

## Backup and Recovery

### 1. Database Backup

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="vital_ai"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/vital_ai_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/vital_ai_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/vital_ai_$DATE.sql.gz s3://vital-ai-backups/database/

# Clean up old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: vital_ai_$DATE.sql.gz"
```

### 2. Application Data Backup

```bash
#!/bin/bash
# backup-application.sh

BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/vital_ai_app_$DATE.tar.gz \
  /app/data \
  /app/uploads \
  /app/logs

# Upload to S3
aws s3 cp $BACKUP_DIR/vital_ai_app_$DATE.tar.gz s3://vital-ai-backups/application/

# Clean up old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Application backup completed: vital_ai_app_$DATE.tar.gz"
```

### 3. Recovery Procedures

```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1
DB_NAME="vital_ai"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Download backup from S3
aws s3 cp s3://vital-ai-backups/database/$BACKUP_FILE /tmp/

# Decompress backup
gunzip /tmp/$BACKUP_FILE

# Restore database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < /tmp/${BACKUP_FILE%.gz}

echo "Database restored from $BACKUP_FILE"
```

## Maintenance and Updates

### 1. Health Checks

```typescript
// health/health-check.ts
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @HealthCheck()
  check() {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkRedis(),
      () => this.checkExternalAPIs(),
    ]);
  }

  private async checkDatabase() {
    // Database health check logic
  }

  private async checkRedis() {
    // Redis health check logic
  }

  private async checkExternalAPIs() {
    // External API health check logic
  }
}
```

### 2. Rolling Updates

```bash
#!/bin/bash
# rolling-update.sh

NEW_VERSION=$1
NAMESPACE="vital-ai"

if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <new_version>"
    exit 1
fi

echo "Starting rolling update to version $NEW_VERSION"

# Update deployment
kubectl set image deployment/vital-ai vital-ai=vital-ai:$NEW_VERSION -n $NAMESPACE

# Wait for rollout
kubectl rollout status deployment/vital-ai -n $NAMESPACE

# Verify deployment
kubectl get pods -l app=vital-ai -n $NAMESPACE

echo "Rolling update completed successfully"
```

### 3. Database Maintenance

```sql
-- Weekly maintenance script
-- Analyze tables for query optimization
ANALYZE;

-- Update table statistics
UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0;

-- Vacuum tables
VACUUM ANALYZE;

-- Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Troubleshooting

### 1. Common Issues

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check for memory leaks
node --inspect app.js
# Use Chrome DevTools to analyze memory usage
```

#### Database Connection Issues
```bash
# Check database connectivity
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER

# Check connection pool
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT * FROM pg_stat_activity;"
```

#### Slow Query Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Log Analysis

```bash
# Application logs
tail -f /var/log/vital-ai/app.log | grep ERROR

# Database logs
tail -f /var/log/postgresql/postgresql.log | grep ERROR

# Nginx logs
tail -f /var/log/nginx/access.log | grep "5[0-9][0-9]"
```

### 3. Performance Monitoring

```bash
# System resources
htop
iotop
nethogs

# Application metrics
curl http://localhost:3001/api/metrics | grep vital_ai

# Database performance
psql -c "SELECT * FROM pg_stat_database WHERE datname = 'vital_ai';"
```

## Disaster Recovery

### 1. Recovery Time Objectives (RTO)

- **Critical Systems**: < 1 hour
- **Important Systems**: < 4 hours
- **Standard Systems**: < 24 hours

### 2. Recovery Point Objectives (RPO)

- **Database**: < 15 minutes
- **Application Data**: < 1 hour
- **Logs**: < 4 hours

### 3. Disaster Recovery Procedures

```bash
#!/bin/bash
# disaster-recovery.sh

# 1. Assess the situation
echo "Assessing disaster recovery situation..."

# 2. Activate backup systems
echo "Activating backup systems..."
kubectl apply -f kubernetes/disaster-recovery/

# 3. Restore database
echo "Restoring database from latest backup..."
./scripts/restore-database.sh latest_backup.sql.gz

# 4. Restore application data
echo "Restoring application data..."
./scripts/restore-application.sh latest_app_backup.tar.gz

# 5. Verify system health
echo "Verifying system health..."
curl -f http://backup-api.vital-ai.com/health

# 6. Update DNS
echo "Updating DNS to point to backup systems..."
# DNS update commands here

echo "Disaster recovery completed"
```

### 4. Business Continuity

- **Multi-region deployment**: Deploy in multiple AWS/Azure/GCP regions
- **Automated failover**: Use load balancers with health checks
- **Data replication**: Real-time replication to backup regions
- **Regular testing**: Monthly disaster recovery drills

---

This guide provides comprehensive coverage of deployment and operations for the VITAL AI chat service. For additional support or questions, please contact the VITAL AI operations team.
