variable "github_oidc_subject_prefix" {
  type        = string
  default     = null
}

locals {
  oidc_sub_prefix = coalesce(var.github_oidc_subject_prefix, "repo:${var.github_repository}")
}