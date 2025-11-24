terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    bucket         = "vital-path-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "vital-path-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VITAL Path"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  cluster_name = "${var.project_name}-${var.environment}-eks"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  # EKS-specific tags
  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = "1"
  }

  tags = merge(local.common_tags, {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  })
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = local.cluster_name
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint configuration
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs

  # Cluster encryption
  cluster_encryption_config = [
    {
      provider_key_arn = aws_kms_key.eks.arn
      resources        = ["secrets"]
    }
  ]

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    # General purpose nodes
    general = {
      name = "general-purpose"

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"

      min_size     = 2
      max_size     = 10
      desired_size = 3

      ami_type = "AL2_x86_64"

      disk_size = 100
      disk_type = "gp3"

      labels = {
        role = "general"
      }

      taints = []

      update_config = {
        max_unavailable_percentage = 25
      }
    }

    # High-performance nodes for AI workloads
    ai_compute = {
      name = "ai-compute"

      instance_types = ["c5.4xlarge", "c5.8xlarge"]
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = 5
      desired_size = 1

      ami_type = "AL2_x86_64"

      disk_size = 200
      disk_type = "gp3"

      labels = {
        role = "ai-compute"
        workload = "cpu-intensive"
      }

      taints = [
        {
          key    = "ai-compute"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      update_config = {
        max_unavailable_percentage = 50
      }
    }

    # Memory-optimized nodes for databases
    memory_optimized = {
      name = "memory-optimized"

      instance_types = ["r5.2xlarge", "r5.4xlarge"]
      capacity_type  = "ON_DEMAND"

      min_size     = 1
      max_size     = 3
      desired_size = 1

      ami_type = "AL2_x86_64"

      disk_size = 150
      disk_type = "gp3"

      labels = {
        role = "memory-optimized"
        workload = "database"
      }

      taints = [
        {
          key    = "memory-optimized"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      update_config = {
        max_unavailable_percentage = 25
      }
    }
  }

  # RBAC
  manage_aws_auth_configmap = true

  aws_auth_roles = [
    {
      rolearn  = aws_iam_role.eks_admin.arn
      username = "admin"
      groups   = ["system:masters"]
    }
  ]

  aws_auth_users = var.eks_admin_users

  tags = local.common_tags
}

# KMS key for EKS encryption
resource "aws_kms_key" "eks" {
  description = "EKS cluster encryption key"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-eks-key"
  })
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.project_name}-${var.environment}-eks"
  target_key_id = aws_kms_key.eks.key_id
}

# RDS for PostgreSQL
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-${var.environment}-db-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,pg_stat_kcache"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = local.common_tags
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  engine         = "postgres"
  engine_version = var.postgres_version
  instance_class = var.postgres_instance_class

  allocated_storage     = var.postgres_allocated_storage
  max_allocated_storage = var.postgres_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  db_name  = var.postgres_database_name
  username = var.postgres_username
  password = var.postgres_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.postgres_backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"

  skip_final_snapshot = var.environment == "development"
  final_snapshot_identifier = var.environment != "development" ? "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-postgres"
  })
}

# KMS key for RDS encryption
resource "aws_kms_key" "rds" {
  description = "RDS encryption key"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-rds-key"
  })
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-${var.environment}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# ElastiCache for Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-cache-subnet"
  subnet_ids = module.vpc.private_subnets

  tags = local.common_tags
}

resource "aws_elasticache_parameter_group" "main" {
  family = "redis7.x"
  name   = "${var.project_name}-${var.environment}-cache-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  description                = "Redis cluster for VITAL Path"

  port                = 6379
  parameter_group_name = aws_elasticache_parameter_group.main.name
  engine_version      = var.redis_version

  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_cache_nodes

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  maintenance_window = "sun:05:00-sun:06:00"
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-redis"
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "redis_slow" {
  name              = "/aws/elasticache/redis/${var.project_name}-${var.environment}/slow-log"
  retention_in_days = 14

  tags = local.common_tags
}

# S3 Buckets
resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-${var.environment}-backups-${random_id.bucket_suffix.hex}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-backups"
    Type = "Backups"
  })
}

resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-${var.environment}-logs-${random_id.bucket_suffix.hex}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-logs"
    Type = "Logging"
  })
}

resource "aws_s3_bucket" "artifacts" {
  bucket = "${var.project_name}-${var.environment}-artifacts-${random_id.bucket_suffix.hex}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-artifacts"
    Type = "Artifacts"
  })
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket configurations
resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "backups" {
  bucket = aws_s3_bucket.backups.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.s3.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backup_lifecycle"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 60
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

# KMS key for S3 encryption
resource "aws_kms_key" "s3" {
  description = "S3 bucket encryption key"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-s3-key"
  })
}

resource "aws_kms_alias" "s3" {
  name          = "alias/${var.project_name}-${var.environment}-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = var.environment == "production"

  access_logs {
    bucket  = aws_s3_bucket.logs.bucket
    prefix  = "alb-access-logs"
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-alb"
  })
}

# Route53 Hosted Zone
resource "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-zone"
  })
}

# ACM Certificate
resource "aws_acm_certificate" "main" {
  count           = var.domain_name != "" ? 1 : 0
  domain_name     = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-cert"
  })
}

# Certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main[0].zone_id
}

resource "aws_acm_certificate_validation" "main" {
  count                   = var.domain_name != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# OpenSearch for logging and monitoring
resource "aws_opensearch_domain" "main" {
  domain_name    = "${var.project_name}-${var.environment}-opensearch"
  engine_version = "OpenSearch_2.3"

  cluster_config {
    instance_type            = var.opensearch_instance_type
    instance_count           = var.opensearch_instance_count
    dedicated_master_enabled = var.opensearch_instance_count > 2
    master_instance_type     = var.opensearch_instance_count > 2 ? "t3.small.search" : null
    master_instance_count    = var.opensearch_instance_count > 2 ? 3 : null
    zone_awareness_enabled   = var.opensearch_instance_count > 1

    zone_awareness_config {
      availability_zone_count = var.opensearch_instance_count > 1 ? 2 : 1
    }
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = var.opensearch_ebs_volume_size
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https = true
  }

  vpc_options {
    subnet_ids         = slice(module.vpc.private_subnets, 0, var.opensearch_instance_count > 1 ? 2 : 1)
    security_group_ids = [aws_security_group.opensearch.id]
  }

  access_policies = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "es:*"
        Resource = "arn:aws:es:${var.aws_region}:${data.aws_caller_identity.current.account_id}:domain/${var.project_name}-${var.environment}-opensearch/*"
        Condition = {
          IpAddress = {
            "aws:SourceIp" = module.vpc.private_subnets_cidr_blocks
          }
        }
      }
    ]
  })

  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch.arn
    log_type                 = "INDEX_SLOW_LOGS"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-opensearch"
  })
}

resource "aws_cloudwatch_log_group" "opensearch" {
  name              = "/aws/opensearch/domains/${var.project_name}-${var.environment}/index-slow-logs"
  retention_in_days = 14

  tags = local.common_tags
}