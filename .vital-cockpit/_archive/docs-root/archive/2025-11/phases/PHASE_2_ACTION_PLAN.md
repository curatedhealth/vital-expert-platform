# Phase 2: AWS ECS Workers - Action Plan

**Status:** Ready to Begin
**Prerequisite:** Phase 1 Complete ✅
**Date:** January 27, 2025

---

## Executive Summary

Phase 1 (Vercel Layer) is architecturally complete with all security infrastructure, caching, and API endpoints implemented. The build process validated our hybrid architecture: **BullMQ job processing cannot run on Vercel Edge runtime** and must be handled by AWS ECS workers with full Node.js runtime.

This document outlines the complete implementation plan for Phase 2: AWS ECS Workers.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         VERCEL EDGE (Phase 1 ✅)        │
│  ┌────────────────────────────────────┐ │
│  │  Enhanced Middleware               │ │
│  │  - Rate Limiting                   │ │
│  │  - CSRF Protection                 │ │
│  │  - Security Headers                │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  API Endpoints                     │ │
│  │  - POST /api/orchestrate           │ │
│  │  - GET /api/orchestrate/[jobId]    │ │
│  │  - GET /api/.../stream (SSE)       │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ Redis Queue (Upstash)
               │
               ▼
┌─────────────────────────────────────────┐
│      AWS ECS WORKERS (Phase 2 🚀)       │
│  ┌────────────────────────────────────┐ │
│  │  BullMQ Job Processor              │ │
│  │  - Queue consumer                  │ │
│  │  - Job lifecycle management        │ │
│  │  - Progress updates                │ │
│  │  - Error handling & retries        │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  LangGraph Orchestrator            │ │
│  │  - Intent classification           │ │
│  │  - Agent selection                 │ │
│  │  - Multi-agent coordination        │ │
│  │  - Response synthesis              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Infrastructure                    │ │
│  │  - ECS Fargate cluster             │ │
│  │  - Auto-scaling (1-10 tasks)       │ │
│  │  - Health checks                   │ │
│  │  - Monitoring & logging            │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Phase 2: Implementation Steps

### Step 1: Worker Application Structure

**Goal:** Create the Node.js worker application that processes jobs

**Tasks:**
1. Create worker directory structure
2. Implement BullMQ worker
3. Connect to existing LangGraph orchestrator
4. Add health check endpoints
5. Implement graceful shutdown

**Files to Create:**
```
apps/digital-health-startup/
  worker/
    ├── src/
    │   ├── index.ts                    # Worker entry point
    │   ├── processor.ts                # Job processing logic
    │   ├── health.ts                   # Health check server
    │   └── shutdown.ts                 # Graceful shutdown handler
    ├── Dockerfile                       # Container definition
    ├── package.json                     # Worker dependencies
    └── tsconfig.json                    # TypeScript config
```

**Key Implementation:**
```typescript
// worker/src/processor.ts
import { Worker, Job } from 'bullmq';
import { createOrchestrator } from '@/features/chat/services/unified-langgraph-orchestrator';
import type { OrchestrationJobData } from '@/lib/queue/orchestration-queue';

export async function processOrchestrationJob(
  job: Job<OrchestrationJobData>
): Promise<OrchestrationResult> {
  const { input, userId, tenantId } = job.data;

  // Update progress
  await job.updateProgress({
    stage: 'initializing',
    progress: 0,
    message: 'Starting orchestration...'
  });

  // Create orchestrator instance
  const orchestrator = await createOrchestrator(tenantId);

  // Process with progress updates
  const result = await orchestrator.invoke(input, {
    onProgress: async (progress) => {
      await job.updateProgress(progress);
    }
  });

  return result;
}
```

---

### Step 2: Docker Configuration

**Goal:** Containerize the worker application

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/digital-health-startup/worker/package.json ./apps/digital-health-startup/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/digital-health-startup/worker ./apps/digital-health-startup/worker
COPY packages ./packages

# Build worker
WORKDIR /app/apps/digital-health-startup/worker
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=base /app/apps/digital-health-startup/worker/dist ./dist
COPY --from=base /app/node_modules ./node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node dist/health-check.js

# Run worker
CMD ["node", "dist/index.js"]
```

**Docker Compose (Local Testing):**
```yaml
version: '3.8'

services:
  worker:
    build:
      context: .
      dockerfile: apps/digital-health-startup/worker/Dockerfile
    environment:
      - REDIS_URL=${REDIS_URL}
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

### Step 3: AWS Infrastructure (Terraform)

**Goal:** Deploy ECS cluster and workers to AWS

**Directory Structure:**
```
infrastructure/
  terraform/
    ├── main.tf                          # Main configuration
    ├── variables.tf                     # Input variables
    ├── outputs.tf                       # Output values
    ├── ecs.tf                           # ECS cluster & service
    ├── iam.tf                           # IAM roles & policies
    ├── cloudwatch.tf                    # Logging & monitoring
    └── autoscaling.tf                   # Auto-scaling rules
```

**Key Terraform Resources:**

**ecs.tf:**
```hcl
# ECS Cluster
resource "aws_ecs_cluster" "vital_workers" {
  name = "vital-orchestration-workers"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Task Definition
resource "aws_ecs_task_definition" "orchestration_worker" {
  family                   = "vital-orchestration-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 1024   # 1 vCPU
  memory                  = 2048   # 2 GB

  container_definitions = jsonencode([{
    name  = "worker"
    image = "${aws_ecr_repository.worker.repository_url}:latest"

    environment = [
      { name = "REDIS_URL", value = var.redis_url },
      { name = "DATABASE_URL", value = var.database_url }
    ]

    secrets = [
      {
        name      = "OPENAI_API_KEY"
        valueFrom = aws_secretsmanager_secret.openai_key.arn
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.worker.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "worker"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  execution_role_arn = aws_iam_role.ecs_execution.arn
  task_role_arn      = aws_iam_role.ecs_task.arn
}

# ECS Service
resource "aws_ecs_service" "orchestration_worker" {
  name            = "orchestration-worker"
  cluster         = aws_ecs_cluster.vital_workers.id
  task_definition = aws_ecs_task_definition.orchestration_worker.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.worker.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.worker_health.arn
    container_name   = "worker"
    container_port   = 3001
  }
}
```

**autoscaling.tf:**
```hcl
# Auto-scaling Target
resource "aws_appautoscaling_target" "worker" {
  max_capacity       = 10
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.vital_workers.name}/${aws_ecs_service.orchestration_worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU-based scaling
resource "aws_appautoscaling_policy" "worker_cpu" {
  name               = "worker-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.worker.resource_id
  scalable_dimension = aws_appautoscaling_target.worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.worker.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Queue depth-based scaling
resource "aws_appautoscaling_policy" "worker_queue" {
  name               = "worker-queue-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.worker.resource_id
  scalable_dimension = aws_appautoscaling_target.worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.worker.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 5.0  # 5 jobs per worker

    customized_metric_specification {
      metric_name = "QueueDepth"
      namespace   = "VITAL/Orchestration"
      statistic   = "Average"
    }

    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
```

---

### Step 4: Monitoring & Observability

**Goal:** Complete visibility into worker performance

**CloudWatch Metrics:**
```hcl
# Custom metrics
resource "aws_cloudwatch_log_metric_filter" "job_completed" {
  name           = "OrchestrationJobCompleted"
  log_group_name = aws_cloudwatch_log_group.worker.name
  pattern        = "[timestamp, request_id, level=INFO, msg=\"Job completed\", ...]"

  metric_transformation {
    name      = "JobsCompleted"
    namespace = "VITAL/Orchestration"
    value     = "1"
  }
}

# Dashboard
resource "aws_cloudwatch_dashboard" "workers" {
  dashboard_name = "vital-orchestration-workers"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            [".", "MemoryUtilization", { stat = "Average" }],
            ["VITAL/Orchestration", "JobsCompleted", { stat = "Sum" }],
            [".", "JobsFailed", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Worker Performance"
        }
      }
    ]
  })
}
```

**Alarms:**
```hcl
# High error rate alarm
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "vital-worker-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "JobsFailed"
  namespace           = "VITAL/Orchestration"
  period              = 300
  statistic           = "Sum"
  threshold           = 10

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# Worker scaling alarm
resource "aws_cloudwatch_metric_alarm" "worker_queue_depth" {
  alarm_name          = "vital-worker-queue-depth-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "QueueDepth"
  namespace           = "VITAL/Orchestration"
  period              = 60
  statistic           = "Average"
  threshold           = 50

  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

---

### Step 5: CI/CD Pipeline

**Goal:** Automated worker deployment

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy-worker.yml
name: Deploy Worker

on:
  push:
    branches: [main]
    paths:
      - 'apps/digital-health-startup/worker/**'
      - 'packages/**'

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: vital-orchestration-worker

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            -f apps/digital-health-startup/worker/Dockerfile .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster vital-orchestration-workers \
            --service orchestration-worker \
            --force-new-deployment
```

---

### Step 6: Testing Strategy

**Local Testing:**
```bash
# 1. Start local Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Build worker
cd apps/digital-health-startup/worker
pnpm build

# 3. Run worker locally
REDIS_URL=redis://localhost:6379 \
DATABASE_URL=postgresql://... \
OPENAI_API_KEY=sk-... \
node dist/index.js

# 4. Test job submission (from another terminal)
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "query": "What are diabetes symptoms?",
    "mode": "query_automatic"
  }'

# 5. Monitor job processing
curl http://localhost:3000/api/orchestrate/{jobId}
```

**Integration Testing:**
```typescript
// worker/tests/integration/processor.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Queue } from 'bullmq';
import { processOrchestrationJob } from '../../src/processor';

describe('Orchestration Worker', () => {
  let queue: Queue;

  beforeAll(async () => {
    queue = new Queue('orchestration', {
      connection: { host: 'localhost', port: 6379 }
    });
  });

  afterAll(async () => {
    await queue.close();
  });

  it('processes query_automatic job successfully', async () => {
    const job = await queue.add('orchestrate', {
      input: {
        query: 'What are diabetes symptoms?',
        mode: 'query_automatic'
      },
      userId: 'test-user',
      tenantId: 'test-tenant',
      requestId: 'test-request',
      timestamp: Date.now()
    });

    const result = await processOrchestrationJob(job);

    expect(result).toHaveProperty('conversationId');
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('selectedAgents');
    expect(result.selectedAgents.length).toBeGreaterThan(0);
  });

  it('handles errors gracefully', async () => {
    const job = await queue.add('orchestrate', {
      input: {
        query: '',  // Invalid query
        mode: 'query_automatic'
      },
      userId: 'test-user',
      tenantId: 'test-tenant',
      requestId: 'test-request',
      timestamp: Date.now()
    });

    await expect(processOrchestrationJob(job)).rejects.toThrow();
  });
});
```

---

## Implementation Timeline

### Week 1: Worker Application
- **Day 1-2:** Worker structure and BullMQ integration
- **Day 3-4:** LangGraph orchestrator integration
- **Day 5:** Health checks and graceful shutdown

### Week 2: Containerization & Local Testing
- **Day 1-2:** Dockerfile and Docker Compose setup
- **Day 3-4:** Local testing with Redis
- **Day 5:** Integration tests

### Week 3: AWS Infrastructure
- **Day 1-2:** Terraform configuration (ECS, IAM, networking)
- **Day 3:** CloudWatch logging and metrics
- **Day 4:** Auto-scaling configuration
- **Day 5:** Security groups and secrets management

### Week 4: Deployment & Validation
- **Day 1-2:** ECR setup and initial deployment
- **Day 3:** CI/CD pipeline configuration
- **Day 4-5:** End-to-end testing and performance validation

---

## Cost Estimation

### AWS ECS Fargate
- **Compute:** 1 vCPU, 2GB RAM per task
- **Average:** 2-5 tasks running
- **Cost:** ~$50-125/month

### CloudWatch
- **Logs:** ~5GB/month
- **Metrics:** Custom metrics
- **Cost:** ~$10-20/month

### Data Transfer
- **Redis:** Upstash (existing)
- **Database:** Supabase (existing)
- **Outbound:** Minimal
- **Cost:** ~$5-10/month

**Total Estimated Cost:** $65-155/month

---

## Success Criteria

### Performance
- [ ] Job enqueueing: < 200ms (Vercel)
- [ ] Job processing: 5-30s (Worker)
- [ ] Auto-scaling: < 2 minutes to scale up
- [ ] Health check response: < 100ms

### Reliability
- [ ] Worker uptime: > 99.9%
- [ ] Job completion rate: > 99%
- [ ] Failed job retry: Automatic (3 attempts)
- [ ] Graceful shutdown: No job loss

### Observability
- [ ] CloudWatch logs: All worker activity
- [ ] Custom metrics: Job throughput, duration, errors
- [ ] Alarms: High error rate, queue depth
- [ ] Dashboard: Real-time worker health

### Security
- [ ] IAM roles: Least privilege
- [ ] Secrets: AWS Secrets Manager
- [ ] Network: Private subnets only
- [ ] Encryption: At rest and in transit

---

## Rollback Plan

### If Worker Deployment Fails
1. Revert ECS service to previous task definition
2. Monitor CloudWatch logs for errors
3. Fix issues in staging environment
4. Redeploy with updated configuration

### If Performance Issues
1. Scale up worker count manually
2. Increase CPU/memory allocation
3. Optimize orchestrator code
4. Add Redis caching for agent metadata

---

## Next Steps

1. **Review this action plan** with stakeholders
2. **Create GitHub project** for Phase 2 tracking
3. **Set up AWS account** and configure IAM
4. **Begin Week 1** worker application development

---

**Phase 2 Status:** Ready to Begin 🚀
**Expected Completion:** 4 weeks
**Confidence Level:** High (Phase 1 validated architecture)

---

*Document Version: 1.0*
*Last Updated: January 27, 2025*
