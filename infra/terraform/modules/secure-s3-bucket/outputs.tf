output "id" {
  value = aws_s3_bucket.this.id
}

output "arn" {
  value = aws_s3_bucket.this.arn
}

output "bucket_regional_domain_name" {
  value = aws_s3_bucket.this.bucket_regional_domain_name
}

output "tls_only_policy_json" {
  description = "Policy document that denies non-HTTPS access. Merge it into the bucket policy you attach."
  value       = data.aws_iam_policy_document.tls_only.json
}

output "public_access_block_id" {
  description = "Depend on this before attaching a bucket policy."
  value       = aws_s3_bucket_public_access_block.this.id
}
