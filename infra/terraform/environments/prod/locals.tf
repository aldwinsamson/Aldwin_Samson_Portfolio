locals {
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

  gitops_repo_url = coalesce(var.lab.gitops_repo, "https://github.com/${var.github_repository}.git")
}
