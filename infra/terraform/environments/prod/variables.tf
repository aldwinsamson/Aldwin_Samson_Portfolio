# ---- shared identity (values come from ../../environment.tfvars) -----------------------------------------
variable "project" {
  type = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project))
    error_message = "project must be 2-21 characters: lowercase letters, digits, hyphens, starting with a letter."
  }
}

variable "environment" {
  type = string

  validation {
    condition     = can(regex("^[a-z0-9]{2,10}$", var.environment))
    error_message = "environment must be 2-10 lowercase letters/digits."
  }
}

variable "region" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "github_repository" {
  description = "OWNER/REPO that is allowed to deploy the site (OIDC trust)."
  type        = string
}

variable "alert_email" {
  type = string
}

variable "owner" {
  type    = string
  default = "unknown"
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}

# ---- environment settings (prod.tfvars) — grouped objects with safe defaults ----------------------------------
variable "site" {
  description = "Public website (S3 + CloudFront)."
  type = object({
    include_www  = optional(bool, true)
    price_class  = optional(string, "PriceClass_All")
    hsts_preload = optional(bool, false)
    csp = optional(object({
      mode          = optional(string, "report-only")
      style_hosts   = optional(list(string), [])
      font_hosts    = optional(list(string), [])
      img_hosts     = optional(list(string), [])
      connect_hosts = optional(list(string), [])
    }), {})
  })
  default = {}
}

variable "monitoring" {
  description = "Alarms, uptime check and dashboard."
  type = object({
    health_check_enabled             = optional(bool, true)
    error_rate_5xx_threshold_percent = optional(number, 5)
  })
  default = {}
}

variable "lab" {
  description = "Optional DevOps lab (single-node k3s + Argo CD + Prometheus + Grafana). The public website never depends on it."
  type = object({
    enabled        = optional(bool, false)
    instance_type  = optional(string, "t4g.small")
    root_volume_gb = optional(number, 30)
    k3s_version    = optional(string, "v1.36.5+k3s1")
    argocd_version = optional(string, "v3.5.5")
    gitops_repo    = optional(string) # defaults to https://github.com/<github_repository>.git
    gitops_branch  = optional(string, "main")
    schedule = optional(object({
      enabled    = optional(bool, true)
      timezone   = optional(string, "Asia/Manila")
      stop_cron  = optional(string, "cron(0 23 * * ? *)")
      start_cron = optional(string, "cron(0 7 * * ? *)")
    }), {})
  })
  default = {}
}
