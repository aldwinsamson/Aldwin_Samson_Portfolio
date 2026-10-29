output "bucket_name" {
  value = module.bucket.id
}

output "bucket_arn" {
  value = module.bucket.arn
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.site.arn
}

output "distribution_domain_name" {
  description = "The *.cloudfront.net hostname (works even before DNS is delegated)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  value = "https://${var.domain_name}"
}
