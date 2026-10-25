terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
      # CloudFront metrics, Route 53 health-check metrics and their alarms only exist in us-east-1.
      configuration_aliases = [aws.use1]
    }
  }
}
