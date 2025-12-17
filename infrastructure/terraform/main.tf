# =============================================================================
# VITAL Platform - Terraform Root Module
# =============================================================================
# 
# This is the entry point for deploying VITAL Platform infrastructure.
# 
# Usage:
#   cd infrastructure/terraform/environments/dev
#   terraform init
#   terraform plan
#   terraform apply
#
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# =============================================================================
# Local Variables
# =============================================================================

locals {
  common_tags = {
    Project     = "vital-platform"
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = "platform"
  }
}

# =============================================================================
# Data Sources
# =============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# =============================================================================
# VPC Module
# =============================================================================

module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 3)
  
  tags = local.common_tags
}

# =============================================================================
# EKS Cluster Module (Kubernetes)
# =============================================================================

module "eks" {
  source = "./modules/eks"

  project_name    = var.project_name
  environment     = var.environment
  cluster_version = var.eks_cluster_version
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  
  node_groups = var.eks_node_groups
  
  tags = local.common_tags
}

# =============================================================================
# RDS Module (PostgreSQL - Optional, can use Supabase instead)
# =============================================================================

module "rds" {
  source = "./modules/rds"
  count  = var.use_managed_postgres ? 1 : 0

  project_name = var.project_name
  environment  = var.environment
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.database_security_group_id]
  
  instance_class    = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
  
  database_name = "vital"
  
  tags = local.common_tags
}

# =============================================================================
# ElastiCache Module (Redis)
# =============================================================================

module "elasticache" {
  source = "./modules/elasticache"

  project_name = var.project_name
  environment  = var.environment
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.redis_security_group_id]
  
  node_type       = var.redis_node_type
  num_cache_nodes = var.redis_num_nodes
  
  tags = local.common_tags
}

# =============================================================================
# ECR Module (Container Registry)
# =============================================================================

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  
  repositories = [
    "vital-api",
    "vital-worker",
    "vital-frontend"
  ]
  
  tags = local.common_tags
}

# =============================================================================
# Secrets Manager Module
# =============================================================================

module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  
  secrets = {
    "openai-api-key"     = var.openai_api_key
    "anthropic-api-key"  = var.anthropic_api_key
    "pinecone-api-key"   = var.pinecone_api_key
    "supabase-url"       = var.supabase_url
    "supabase-anon-key"  = var.supabase_anon_key
    "supabase-service-key" = var.supabase_service_key
    "jwt-secret"         = var.jwt_secret
  }
  
  tags = local.common_tags
}

# =============================================================================
# S3 Module (Document Storage)
# =============================================================================

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
  
  buckets = {
    documents = {
      versioning = true
      encryption = true
    }
    logs = {
      versioning = false
      encryption = true
      lifecycle_days = 90
    }
  }
  
  tags = local.common_tags
}

# =============================================================================
# CloudWatch Module (Monitoring & Logging)
# =============================================================================

module "monitoring" {
  source = "./modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
  
  eks_cluster_name = module.eks.cluster_name
  
  alert_email = var.alert_email
  
  tags = local.common_tags
}

# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.endpoint
}

output "rds_endpoint" {
  description = "RDS endpoint (if enabled)"
  value       = var.use_managed_postgres ? module.rds[0].endpoint : null
}











