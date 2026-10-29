data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  # The one object every module receives: names and tags are derived from it, never hard-coded.
  context = {
    project     = var.project
    environment = var.environment
    region      = var.region
    prefix      = "${var.project}-${var.environment}"
    tags = merge({
      Project     = var.project
      Environment = var.environment
      Owner       = var.owner
      Repository  = var.github_repository
      ManagedBy   = "terraform"
    }, var.extra_tags)
  }

  state_bucket = "${var.project}-tfstate-${local.account_id}"
  # State key prefixes the CI roles may touch: one per environment.
  state_prefixes = distinct(concat([var.environment], var.additional_environments))
}
