locals {
  tags = {
    Project     = var.project
    Environment = "prod"
    ManagedBy   = "terraform"
    Repository  = var.github_repository
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.tags
  }
}

# CloudFront certificates and CloudFront/Route 53 CloudWatch metrics live in us-east-1.
provider "aws" {
  alias  = "use1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}
