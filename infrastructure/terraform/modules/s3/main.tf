# =============================================================================
# S3 Module - Object Storage
# =============================================================================

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "buckets" {
  type = map(object({
    versioning     = bool
    encryption     = bool
    lifecycle_days = optional(number)
  }))
}

variable "tags" {
  type    = map(string)
  default = {}
}

# -----------------------------------------------------------------------------
# S3 Buckets
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "main" {
  for_each = var.buckets

  bucket = "${var.project_name}-${var.environment}-${each.key}"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  })
}

resource "aws_s3_bucket_versioning" "main" {
  for_each = { for k, v in var.buckets : k => v if v.versioning }

  bucket = aws_s3_bucket.main[each.key].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  for_each = { for k, v in var.buckets : k => v if v.encryption }

  bucket = aws_s3_bucket.main[each.key].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  for_each = { for k, v in var.buckets : k => v if v.lifecycle_days != null }

  bucket = aws_s3_bucket.main[each.key].id

  rule {
    id     = "expire-old-objects"
    status = "Enabled"

    expiration {
      days = each.value.lifecycle_days
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  for_each = var.buckets

  bucket = aws_s3_bucket.main[each.key].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "bucket_names" {
  value = { for k, v in aws_s3_bucket.main : k => v.id }
}

output "bucket_arns" {
  value = { for k, v in aws_s3_bucket.main : k => v.arn }
}


