# General Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "vital-path"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.28"
}

variable "cluster_endpoint_public_access_cidrs" {
  description = "List of CIDR blocks that can access the Amazon EKS public API server endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "eks_admin_users" {
  description = "List of IAM users to add to the EKS admin group"
  type = list(object({
    userarn  = string
    username = string
    groups   = list(string)
  }))
  default = []
}

# RDS Configuration
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.4"
}

variable "postgres_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r5.xlarge"
}

variable "postgres_allocated_storage" {
  description = "Allocated storage for RDS instance (GB)"
  type        = number
  default     = 100
}

variable "postgres_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 1000
}

variable "postgres_database_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "vital_path"
}

variable "postgres_username" {
  description = "Username for PostgreSQL database"
  type        = string
  default     = "vital_path"
  sensitive   = true
}

variable "postgres_password" {
  description = "Password for PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "postgres_backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

# Redis Configuration
variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.r6g.xlarge"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

variable "redis_auth_token" {
  description = "Auth token for Redis"
  type        = string
  sensitive   = true
}

# OpenSearch Configuration
variable "opensearch_instance_type" {
  description = "OpenSearch instance type"
  type        = string
  default     = "t3.medium.search"
}

variable "opensearch_instance_count" {
  description = "Number of OpenSearch instances"
  type        = number
  default     = 2
}

variable "opensearch_ebs_volume_size" {
  description = "Size of EBS volumes for OpenSearch instances (GB)"
  type        = number
  default     = 100
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

# Monitoring and Alerting
variable "monitoring_email" {
  description = "Email address for monitoring alerts"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  default     = ""
  sensitive   = true
}

# Security Configuration
variable "enable_waf" {
  description = "Enable AWS WAF for the application"
  type        = bool
  default     = true
}

variable "enable_shield" {
  description = "Enable AWS Shield Advanced"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup replication"
  type        = bool
  default     = true
}

variable "backup_region" {
  description = "Region for backup replication"
  type        = string
  default     = "us-east-1"
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Enable spot instances for worker nodes"
  type        = bool
  default     = true
}

variable "enable_autoscaling" {
  description = "Enable cluster autoscaling"
  type        = bool
  default     = true
}

# Compliance and Security
variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all services"
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit"
  type        = bool
  default     = true
}

variable "compliance_mode" {
  description = "Compliance mode (hipaa, sox, pci)"
  type        = string
  default     = "hipaa"
  validation {
    condition     = contains(["none", "hipaa", "sox", "pci"], var.compliance_mode)
    error_message = "Compliance mode must be one of: none, hipaa, sox, pci."
  }
}

# Feature Flags
variable "enable_ai_workloads" {
  description = "Enable AI/ML workload support"
  type        = bool
  default     = true
}

variable "enable_gpu_nodes" {
  description = "Enable GPU nodes for AI workloads"
  type        = bool
  default     = false
}

variable "enable_medical_data_storage" {
  description = "Enable medical data compliant storage"
  type        = bool
  default     = true
}

# Resource Limits
variable "max_nodes_per_group" {
  description = "Maximum number of nodes per node group"
  type        = number
  default     = 10
}

variable "max_pods_per_node" {
  description = "Maximum number of pods per node"
  type        = number
  default     = 110
}

# Logging Configuration
variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = true
}

variable "enable_container_insights" {
  description = "Enable EKS Container Insights"
  type        = bool
  default     = true
}

# Networking
variable "enable_private_endpoints" {
  description = "Enable VPC endpoints for AWS services"
  type        = bool
  default     = true
}

variable "enable_nat_instance" {
  description = "Use NAT instance instead of NAT gateway for cost savings"
  type        = bool
  default     = false
}

# Development Configuration
variable "enable_development_access" {
  description = "Enable development access (SSH, port forwarding, etc.)"
  type        = bool
  default     = false
}

variable "development_cidrs" {
  description = "CIDR blocks for development access"
  type        = list(string)
  default     = []
}

# External Services
variable "external_secret_store" {
  description = "External secret store (aws-secrets-manager, vault, etc.)"
  type        = string
  default     = "aws-secrets-manager"
}

variable "enable_external_dns" {
  description = "Enable external-dns for automatic DNS management"
  type        = bool
  default     = true
}

variable "enable_cert_manager" {
  description = "Enable cert-manager for automatic TLS certificate management"
  type        = bool
  default     = true
}

# Performance Configuration
variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable Performance Insights for RDS"
  type        = bool
  default     = true
}

# Disaster Recovery
variable "enable_multi_region" {
  description = "Enable multi-region deployment"
  type        = bool
  default     = false
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-east-1"
}

variable "rto_hours" {
  description = "Recovery Time Objective in hours"
  type        = number
  default     = 4
}

variable "rpo_hours" {
  description = "Recovery Point Objective in hours"
  type        = number
  default     = 1
}