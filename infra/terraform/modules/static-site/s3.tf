data "aws_caller_identity" "current" {}

locals {
  bucket_name = "${var.context.prefix}-site-${data.aws_caller_identity.current.account_id}"
  aliases     = var.include_www ? [var.domain_name, "www.${var.domain_name}"] : [var.domain_name]
}

# Private bucket: the ONLY reader is CloudFront (via OAC). No S3 website endpoint.
module "bucket" {
  source = "../secure-s3-bucket"

  bucket_name                        = local.bucket_name
  noncurrent_version_expiration_days = 30
}

data "aws_iam_policy_document" "bucket" {
  source_policy_documents = [module.bucket.tls_only_policy_json]

  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${module.bucket.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = module.bucket.id
  policy = data.aws_iam_policy_document.bucket.json

  depends_on = [module.bucket]
}
