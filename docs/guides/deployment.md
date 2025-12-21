# Deployment Guide

Guide for deploying VITAL Platform to production.

## Deployment Options

| Option | Complexity | Cost | Best For |
|--------|------------|------|----------|
| **Docker Compose** | Low | $ | Small teams, staging |
| **Kubernetes (EKS)** | High | $$$ | Production, scale |
| **Vercel + Railway** | Medium | $$ | Startups |

## Docker Compose Deployment

### Prerequisites

- Docker & Docker Compose
- Server with 4GB+ RAM
- Domain with SSL

### Steps

1. **Prepare Server**

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

2. **Clone and Configure**

```bash
git clone https://github.com/your-org/vital-path.git
cd vital-path/infrastructure/docker

cp env.example .env
# Edit .env with production values
```

3. **Deploy**

```bash
docker compose -f docker-compose.yml up -d
```

4. **Set Up Reverse Proxy (Nginx)**

```nginx
server {
    listen 443 ssl;
    server_name api.vital.ai;
    
    ssl_certificate /etc/letsencrypt/live/vital.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vital.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # SSE support
        proxy_buffering off;
        proxy_cache off;
    }
}
```

## Kubernetes (AWS EKS) Deployment

### Prerequisites

- AWS account
- Terraform >= 1.5
- kubectl
- AWS CLI configured

### Infrastructure Setup

1. **Initialize Terraform**

```bash
cd infrastructure/terraform/environments/prod

# Create tfvars
cat > terraform.tfvars << EOF
openai_api_key       = "sk-..."
supabase_url         = "https://xxx.supabase.co"
supabase_service_key = "eyJ..."
jwt_secret           = "your-32-char-secret"
alert_email          = "alerts@company.com"
EOF

# Deploy
terraform init
terraform plan
terraform apply
```

2. **Configure kubectl**

```bash
aws eks update-kubeconfig \
  --name vital-prod \
  --region us-east-1
```

3. **Deploy Application**

```bash
# Build and push images
docker build -t vital-api:latest -f infrastructure/docker/Dockerfile services/ai-engine
docker tag vital-api:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/vital-prod/vital-api:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/vital-prod/vital-api:latest

# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/
```

### Kubernetes Manifests

```yaml
# infrastructure/kubernetes/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vital-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vital-api
  template:
    metadata:
      labels:
        app: vital-api
    spec:
      containers:
      - name: api
        image: ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/vital-prod/vital-api:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: vital-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

## Environment Configuration

### Production Secrets

Never commit secrets to Git. Use:

- **AWS**: Secrets Manager
- **Kubernetes**: Secrets + External Secrets Operator
- **Vercel**: Environment Variables

### Required Production Variables

```bash
# Database
SUPABASE_URL=https://prod.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# LLM
OPENAI_API_KEY=sk-...

# Security
JWT_SECRET=<32+ characters>
PLATFORM_ORGANIZATION_ID=<uuid>

# Redis
REDIS_URL=redis://prod-redis:6379/0

# Monitoring
SENTRY_DSN=https://...
```

## Monitoring

### Health Checks

```bash
# Liveness
curl https://api.vital.ai/live

# Readiness
curl https://api.vital.ai/ready

# Detailed health
curl https://api.vital.ai/health/detailed
```

### Metrics

Prometheus metrics available at `/metrics`:

- `http_request_duration_seconds`
- `workflow_executions_total`
- `token_usage_by_organization`
- `async_jobs_total`

### Alerts

Set up alerts for:

- 5XX error rate > 1%
- P95 latency > 2s
- Worker queue depth > 100
- Token budget warnings

## Scaling

### Horizontal Scaling

```bash
# Scale API
kubectl scale deployment vital-api --replicas=5

# Scale workers
kubectl scale deployment vital-worker-execution --replicas=4
```

### Auto-scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vital-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vital-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Security Checklist

- [ ] All secrets in Secrets Manager
- [ ] TLS/HTTPS enabled
- [ ] JWT_SECRET is 32+ chars
- [ ] RLS policies applied
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Sentry monitoring enabled
- [ ] Backup strategy in place

## Rollback

```bash
# Kubernetes
kubectl rollout undo deployment/vital-api

# Docker Compose
docker compose pull
docker compose up -d --force-recreate
```

## Disaster Recovery

1. **Database**: Supabase point-in-time recovery
2. **Redis**: Daily snapshots to S3
3. **Logs**: CloudWatch retention 90 days
4. **Code**: Git history

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025



















