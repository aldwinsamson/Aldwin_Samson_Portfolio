variable "project" {
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project))
    error_message = "project must be 2-21 characters: lowercase letters, digits, hyphens, starting with a letter."
  }
}

variable "environment" {
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
  type        = string
}

variable "github_repository" {
  type        = string
}

variable "alert_email" {
  type = string
}

variable "owner" {
  type    = string
  default = "unknown"
}

variable "github_environments" {
  type        = list(string)
  default     = ["production"]
}

variable "additional_environments" {
  type        = list(string)
  default     = []
}

variable "monthly_budget_usd" {
  type        = number
  default     = 30
}

variable "dns_zone_enabled" {
  type        = bool
  default     = true
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}
