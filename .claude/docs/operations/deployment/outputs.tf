# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

# EKS Outputs
output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_arn" {
  description = "EKS cluster IAM role ARN"
  value       = module.eks.cluster_iam_role_arn
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_oidc_provider_arn" {
  description = "EKS cluster OIDC provider ARN"
  value       = module.eks.oidc_provider_arn
}

output "node_groups" {
  description = "EKS node group information"
  value = {
    for k, v in module.eks.eks_managed_node_groups : k => {
      arn           = v.node_group_arn
      status        = v.node_group_status
      capacity_type = v.capacity_type
      instance_types = v.instance_types
    }
  }
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "rds_username" {
  description = "RDS database username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

# Redis Outputs
output "redis_cluster_id" {
  description = "ElastiCache Redis cluster ID"
  value       = aws_elasticache_replication_group.main.replication_group_id
}

output "redis_primary_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# OpenSearch Outputs
output "opensearch_domain_id" {
  description = "OpenSearch domain ID"
  value       = aws_opensearch_domain.main.domain_id
}

output "opensearch_domain_name" {
  description = "OpenSearch domain name"
  value       = aws_opensearch_domain.main.domain_name
}

output "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = aws_opensearch_domain.main.endpoint
}

output "opensearch_kibana_endpoint" {
  description = "OpenSearch Kibana endpoint"
  value       = aws_opensearch_domain.main.kibana_endpoint
}

# Load Balancer Outputs
output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

# S3 Outputs
output "s3_backup_bucket" {
  description = "S3 backup bucket name"
  value       = aws_s3_bucket.backups.bucket
}

output "s3_logs_bucket" {
  description = "S3 logs bucket name"
  value       = aws_s3_bucket.logs.bucket
}

output "s3_artifacts_bucket" {
  description = "S3 artifacts bucket name"
  value       = aws_s3_bucket.artifacts.bucket
}

# DNS Outputs
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : null
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

# KMS Outputs
output "kms_key_ids" {
  description = "KMS key IDs"
  value = {
    eks = aws_kms_key.eks.id
    rds = aws_kms_key.rds.id
    s3  = aws_kms_key.s3.id
  }
}

output "kms_key_arns" {
  description = "KMS key ARNs"
  value = {
    eks = aws_kms_key.eks.arn
    rds = aws_kms_key.rds.arn
    s3  = aws_kms_key.s3.arn
  }
}

# IAM Role Outputs
output "iam_roles" {
  description = "IAM role ARNs for Kubernetes service accounts"
  value = {
    cluster_autoscaler           = aws_iam_role.cluster_autoscaler.arn
    aws_load_balancer_controller = aws_iam_role.aws_load_balancer_controller.arn
    external_dns                 = aws_iam_role.external_dns.arn
    cert_manager                 = aws_iam_role.cert_manager.arn
    ebs_csi_driver              = aws_iam_role.ebs_csi_driver.arn
    vital_path_app              = aws_iam_role.vital_path_app.arn
  }
}

# Secrets Manager Outputs
output "secrets_manager_arn" {
  description = "Secrets Manager secret ARN"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secrets_manager_name" {
  description = "Secrets Manager secret name"
  value       = aws_secretsmanager_secret.app_secrets.name
}

# Connection Information for Applications
output "database_connection_string" {
  description = "Database connection string template"
  value       = "postgresql://${aws_db_instance.main.username}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${aws_elasticache_replication_group.main.configuration_endpoint_address}:${aws_elasticache_replication_group.main.port}"
}

output "opensearch_connection_string" {
  description = "OpenSearch connection string"
  value       = "https://${aws_opensearch_domain.main.endpoint}"
}

# Kubectl Configuration Command
output "kubectl_config_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_id}"
}

# Monitoring URLs
output "monitoring_endpoints" {
  description = "Monitoring service endpoints"
  value = {
    opensearch_kibana = "https://${aws_opensearch_domain.main.kibana_endpoint}"
    grafana          = var.domain_name != "" ? "https://grafana.${var.domain_name}" : null
    prometheus       = var.domain_name != "" ? "https://prometheus.${var.domain_name}" : null
  }
}

# Application URLs
output "application_urls" {
  description = "Application URLs"
  value = {
    main_app     = var.domain_name != "" ? "https://${var.domain_name}" : aws_lb.main.dns_name
    api_gateway  = var.domain_name != "" ? "https://api.${var.domain_name}" : "${aws_lb.main.dns_name}/api"
    monitoring   = var.domain_name != "" ? "https://monitoring.${var.domain_name}" : "${aws_lb.main.dns_name}/monitoring"
  }
}

# Environment Information
output "environment_info" {
  description = "Environment deployment information"
  value = {
    project_name = var.project_name
    environment  = var.environment
    aws_region   = var.aws_region
    deployed_at  = timestamp()
  }
}

# Resource Counts for Cost Estimation
output "resource_summary" {
  description = "Summary of deployed resources"
  value = {
    eks_nodes_min     = sum([for ng in module.eks.eks_managed_node_groups : ng.min_size])
    eks_nodes_max     = sum([for ng in module.eks.eks_managed_node_groups : ng.max_size])
    eks_nodes_desired = sum([for ng in module.eks.eks_managed_node_groups : ng.desired_size])
    rds_instance_type = aws_db_instance.main.instance_class
    redis_node_type   = aws_elasticache_replication_group.main.node_type
    redis_nodes       = aws_elasticache_replication_group.main.num_cache_clusters
    opensearch_nodes  = aws_opensearch_domain.main.cluster_config[0].instance_count
  }
}