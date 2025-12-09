# VITAL Platform - Terraform Infrastructure

Infrastructure as Code (IaC) for deploying VITAL Platform to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                              VPC                                    │ │
│  │  ┌─────────────────────┐     ┌─────────────────────────────────┐  │ │
│  │  │    Public Subnets   │     │       Private Subnets           │  │ │
│  │  │  ┌───────────────┐  │     │  ┌─────────────────────────┐   │  │ │
│  │  │  │  Load Balancer│  │     │  │       EKS Cluster       │   │  │ │
│  │  │  └───────┬───────┘  │     │  │  ┌─────────────────────┐│   │  │ │
│  │  │          │          │     │  │  │   API Pods          ││   │  │ │
│  │  │          │          │     │  │  │   Worker Pods       ││   │  │ │
│  │  │          │          │     │  │  │   Frontend Pods     ││   │  │ │
│  │  │  ┌───────┴───────┐  │     │  │  └─────────────────────┘│   │  │ │
│  │  │  │  NAT Gateway  │──┼─────┼──│                         │   │  │ │
│  │  │  └───────────────┘  │     │  └─────────────────────────┘   │  │ │
│  │  └─────────────────────┘     │                                 │  │ │
│  │                               │  ┌──────────┐ ┌──────────────┐ │  │ │
│  │                               │  │  Redis   │ │   RDS        │ │  │ │
│  │                               │  │ (Cache)  │ │ (Optional)   │ │  │ │
│  │                               │  └──────────┘ └──────────────┘ │  │ │
│  │                               └────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │    ECR     │  │  Secrets   │  │     S3     │  │    CloudWatch      │ │
│  │ (Images)   │  │  Manager   │  │ (Storage)  │  │   (Monitoring)     │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.5.0
3. **kubectl** for Kubernetes management
4. **Supabase** account (or enable managed PostgreSQL)

## Quick Start

### 1. Initialize Backend (First Time Only)

```bash
# Create S3 bucket for state
aws s3 mb s3://vital-terraform-state --region us-east-1

# Create DynamoDB table for locks
aws dynamodb create-table \
  --table-name vital-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Deploy Development Environment

```bash
cd infrastructure/terraform/environments/dev

# Create terraform.tfvars
cat > terraform.tfvars << EOF
openai_api_key       = "sk-..."
anthropic_api_key    = "sk-ant-..."
pinecone_api_key     = "..."
supabase_url         = "https://xxx.supabase.co"
supabase_anon_key    = "eyJ..."
supabase_service_key = "eyJ..."
jwt_secret           = "your-32-char-secret-here"
alert_email          = "alerts@yourcompany.com"
EOF

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply
terraform apply
```

### 3. Configure kubectl

```bash
aws eks update-kubeconfig \
  --name vital-dev \
  --region us-east-1
```

### 4. Deploy Application

```bash
# Build and push images
make docker-build
docker push <ecr-url>/vital-api:latest
docker push <ecr-url>/vital-worker:latest

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

## Environments

| Environment | Purpose | Cost | Scaling |
|-------------|---------|------|---------|
| `dev` | Development & testing | ~$150/month | Minimal |
| `staging` | Pre-production testing | ~$400/month | Medium |
| `prod` | Production workloads | ~$2000+/month | Auto-scaling |

## Modules

| Module | Description | Resources |
|--------|-------------|-----------|
| `vpc` | Networking infrastructure | VPC, Subnets, NAT, Security Groups |
| `eks` | Kubernetes cluster | EKS Cluster, Node Groups, IAM Roles |
| `ecr` | Container registry | ECR Repositories |
| `elasticache` | Redis cache | ElastiCache Cluster |
| `rds` | PostgreSQL database | RDS Instance (optional) |
| `s3` | Object storage | S3 Buckets |
| `secrets` | Secrets management | Secrets Manager |
| `monitoring` | Observability | CloudWatch, Alarms, Logs |

## Variables

### Required

| Variable | Description |
|----------|-------------|
| `openai_api_key` | OpenAI API key |
| `supabase_url` | Supabase project URL |
| `supabase_service_key` | Supabase service key |
| `jwt_secret` | JWT signing secret |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `aws_region` | us-east-1 | AWS region |
| `eks_cluster_version` | 1.28 | Kubernetes version |
| `redis_node_type` | cache.t3.small | Redis instance type |
| `use_managed_postgres` | false | Use RDS instead of Supabase |

## Commands

```bash
# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy (DANGER!)
terraform destroy

# Format code
terraform fmt -recursive

# Validate
terraform validate

# Show state
terraform show

# List resources
terraform state list
```

## Cost Estimation

### Development (~$150/month)
- EKS: $73 (control plane)
- EC2: $60 (2x t3.medium)
- Redis: $12 (t3.micro)
- NAT: $32 (1 gateway)

### Production (~$2000+/month)
- EKS: $73 (control plane)
- EC2: $800+ (auto-scaling nodes)
- Redis: $200+ (r6g.large x3)
- NAT: $96 (3 gateways)
- Load Balancer: $50
- S3/CloudWatch: Variable

## Security Best Practices

1. **State Management**: Use S3 backend with encryption
2. **Secrets**: Never commit tfvars with secrets
3. **IAM**: Use least-privilege IAM roles
4. **Network**: Private subnets for workloads
5. **Encryption**: Enable at-rest encryption
6. **Audit**: Enable CloudTrail logging

## Troubleshooting

### Common Issues

**EKS nodes not joining cluster**
```bash
# Check node group status
aws eks describe-nodegroup \
  --cluster-name vital-dev \
  --nodegroup-name general
```

**Terraform state locked**
```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

**ECR push permission denied**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
```

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025


