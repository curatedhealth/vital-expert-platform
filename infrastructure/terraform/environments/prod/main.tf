# =============================================================================
# VITAL Platform - Production Environment
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  # Backend configuration for state storage
  # Uncomment and configure for your setup
  # backend "s3" {
  #   bucket         = "vital-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "vital-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      Project     = "vital-platform"
      ManagedBy   = "terraform"
    }
  }
}

# -----------------------------------------------------------------------------
# Root Module
# -----------------------------------------------------------------------------

module "vital" {
  source = "../../"

  project_name = "vital"
  environment  = "prod"
  aws_region   = var.aws_region

  # Networking
  vpc_cidr = "10.0.0.0/16"

  # EKS - Production scale
  eks_cluster_version = "1.28"
  eks_node_groups = {
    general = {
      instance_types = ["t3.large", "t3.xlarge"]
      min_size       = 3
      max_size       = 20
      desired_size   = 5
      disk_size      = 100
      labels         = { "workload" = "general" }
      taints         = []
    }
    workers = {
      instance_types = ["t3.xlarge", "t3.2xlarge"]
      min_size       = 2
      max_size       = 10
      desired_size   = 3
      disk_size      = 200
      labels         = { "workload" = "ai-workers" }
      taints         = []
    }
  }

  # Redis - Production with replication
  redis_node_type = "cache.r6g.large"
  redis_num_nodes = 3

  # RDS - Disabled, use Supabase
  use_managed_postgres = false

  # Secrets - From environment or tfvars
  openai_api_key       = var.openai_api_key
  anthropic_api_key    = var.anthropic_api_key
  pinecone_api_key     = var.pinecone_api_key
  supabase_url         = var.supabase_url
  supabase_anon_key    = var.supabase_anon_key
  supabase_service_key = var.supabase_service_key
  jwt_secret           = var.jwt_secret

  # Monitoring
  alert_email = var.alert_email
}

# -----------------------------------------------------------------------------
# Variables (Override from tfvars or environment)
# -----------------------------------------------------------------------------

variable "aws_region" {
  default = "us-east-1"
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "anthropic_api_key" {
  type      = string
  sensitive = true
}

variable "pinecone_api_key" {
  type      = string
  sensitive = true
}

variable "supabase_url" {
  type = string
}

variable "supabase_anon_key" {
  type      = string
  sensitive = true
}

variable "supabase_service_key" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "alert_email" {
  type = string
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "vpc_id" {
  value = module.vital.vpc_id
}

output "eks_cluster_name" {
  value = module.vital.eks_cluster_name
}

output "ecr_repository_urls" {
  value = module.vital.ecr_repository_urls
}

output "redis_endpoint" {
  value     = module.vital.redis_endpoint
  sensitive = true
}






