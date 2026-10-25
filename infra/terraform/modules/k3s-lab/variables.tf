variable "project" {
  type = string
}

variable "instance_type" {
  description = <<-EOT
    EC2 size for the single-node lab. Free-plan-eligible types: t3.micro, t3.small, t4g.micro, t4g.small,
    c7i-flex.large, m7i-flex.large. t4g.small (2 GiB, Graviton) is the cheapest that can run k3s + ArgoCD +
    a lean Prometheus/Grafana stack (a 2 GiB swap file is added as a safety net).
  EOT
  type        = string
  default     = "t4g.small"
}

variable "root_volume_gb" {
  type    = number
  default = 30
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "k3s_version" {
  description = "Exact k3s release to install."
  type        = string
  default     = "v1.36.5+k3s1"
}

variable "argocd_version" {
  description = "Argo CD release tag (manifests are applied from this tag)."
  type        = string
  default     = "v3.5.5"
}

variable "gitops_repo_url" {
  description = "HTTPS URL of the Git repo ArgoCD watches (must be public, or add a repo credential later)."
  type        = string
}

variable "gitops_revision" {
  description = "Branch/tag ArgoCD tracks."
  type        = string
  default     = "main"
}

variable "schedule_enabled" {
  description = "Stop the instance every night and start it every morning (saves roughly a third of the EC2 cost)."
  type        = bool
  default     = true
}

variable "schedule_timezone" {
  type    = string
  default = "Asia/Manila"
}

variable "schedule_stop_cron" {
  description = "EventBridge Scheduler cron (evaluated in schedule_timezone)."
  type        = string
  default     = "cron(0 23 * * ? *)"
}

variable "schedule_start_cron" {
  type    = string
  default = "cron(0 7 * * ? *)"
}
