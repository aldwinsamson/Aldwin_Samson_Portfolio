provider "aws" {
  region = var.region

  default_tags {
    tags = local.context.tags
  }
}

# CloudFront certificates and CloudFront/Route 53 CloudWatch metrics live in us-east-1.
provider "aws" {
  alias  = "use1"
  region = "us-east-1"

  default_tags {
    tags = local.context.tags
  }
}
