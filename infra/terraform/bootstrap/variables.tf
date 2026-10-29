# ---- shared identity (values come from ../environment.tfvars) ------------------------------
variable "project" {
  description = "Short prefix used in resource names (lowercase letters, digits, hyphens)."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project))
    error_message = "project must be 2-21 characters: lowercase letters, digits, hyphens, starting with a letter."
  }
}

variable "environment" {
  description = "Environment name, e.g. dev, staging, prod. Used in names, tags and the state key prefix."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]{2,10}$", var.environment))
    error_message = "environment must be 2-10 lowercase letters/digits."
  }
}

variable "region" {
  type = string
}

variable "domain_name" {
  description = "Apex domain registered at your registrar. A Route 53 hosted zone is created for it."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the CI roles, as OWNER/REPO (case-sensitive)."
  type        = string
}

variable "alert_email" {
  type = string
}

variable "owner" {
  type    = string
  default = "unknown"
}

# ---- bootstrap-specific (bootstrap.tfvars) -------------------------------------------------------
variable "github_environments" {
  description = "GitHub Environments (with required reviewers) that are allowed to run terraform apply, e.g. [\"production\"]."
  type        = list(string)
  default     = ["production"]
}

variable "additional_environments" {
  description = "Extra environments (besides var.environment) whose state prefix the CI roles may use, e.g. [\"staging\"]."
  type        = list(string)
  default     = []
}

variable "monthly_budget_usd" {
  description = "Monthly gross-usage budget (credits are NOT netted off, so this tracks how fast credit is burned)."
  type        = number
  default     = 30
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}
