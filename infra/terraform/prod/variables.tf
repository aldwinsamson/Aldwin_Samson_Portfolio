variable "project" {
  type    = string
  default = "aldwinsamson"
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "domain_name" {
  type    = string
  default = "aldwinsamson.com"
}

variable "github_repository" {
  description = "OWNER/REPO that is allowed to deploy the site (OIDC trust)."
  type        = string
  default     = "aldwinsamson/Aldwin_Samson_Portfolio"
}

variable "alert_email" {
  type    = string
  default = "aldwinsamsonn@gmail.com"
}

variable "csp_mode" {
  description = "\"report-only\" first; switch to \"enforce\" after checking the browser console on every page."
  type        = string
  default     = "report-only"
}

variable "cloudfront_price_class" {
  type    = string
  default = "PriceClass_All"
}

variable "enable_health_check" {
  type    = bool
  default = true
}

# ---- optional DevOps lab (k3s + ArgoCD + Prometheus + Grafana) ---------------------------
variable "enable_lab" {
  description = "Create the single-node k3s lab. The public website never depends on it."
  type        = bool
  default     = false
}

variable "lab_instance_type" {
  type    = string
  default = "t4g.small"
}

variable "gitops_repo_url" {
  description = "Public HTTPS URL of this repository (ArgoCD pulls gitops/ from it)."
  type        = string
  default     = "https://github.com/aldwinsamson/Aldwin_Samson_Portfolio.git"
}

variable "gitops_revision" {
  type    = string
  default = "main"
}

variable "lab_schedule_enabled" {
  type    = bool
  default = true
}
