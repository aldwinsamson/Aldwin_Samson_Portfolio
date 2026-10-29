variable "github_oidc_subject_prefix" {
  description = "Prefix of the GitHub OIDC `sub` claim. Leave null for the classic format repo:OWNER/REPO."
  type        = string
  default     = null
}

locals {
  oidc_sub_prefix = coalesce(var.github_oidc_subject_prefix, "repo:${var.github_repository}")
}