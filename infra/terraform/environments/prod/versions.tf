terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Partial configuration: the bucket name comes from `-backend-config="bucket=..."` (see infra/README.md).
  # Backend blocks cannot use variables, so `key` and `region` are literals: keep `key = "<environment>/terraform.tfstate"`
  # and keep `region` equal to the state bucket's region (the `region` value in ../../environment.tfvars).
  backend "s3" {
    key          = "prod/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
