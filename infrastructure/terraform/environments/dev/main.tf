# =============================================================================
# VITAL Platform - Development Environment
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  # Backend configuration for state storage
  # Uncomment and configure for your setup
  # backend "s3" {
  #   bucket         = "vital-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "vital-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
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
  environment  = "dev"
  aws_region   = var.aws_region

  # Networking
  vpc_cidr = "10.0.0.0/16"

  # EKS - Minimal for dev
  eks_cluster_version = "1.28"
  eks_node_groups = {
    general = {
      instance_types = ["t3.medium"]
      min_size       = 1
      max_size       = 3
      desired_size   = 2
      disk_size      = 50
      labels         = { "workload" = "general" }
      taints         = []
    }
  }

  # Redis - Small for dev
  redis_node_type = "cache.t3.micro"
  redis_num_nodes = 1

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
  default   = ""
}

variable "anthropic_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "pinecone_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "supabase_url" {
  type    = string
  default = ""
}

variable "supabase_anon_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "supabase_service_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "jwt_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "alert_email" {
  type    = string
  default = ""
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
  value = module.vital.redis_endpoint
}











