variable "context" {
  type = object({
    project     = string
    environment = string
    region      = string
    prefix      = string
    tags        = map(string)
  })
}

variable "instance_type" {
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
  description = "Argo CD release tag."
  type        = string
  default     = "v3.5.5"
}

variable "gitops_repo_url" {
  description = "HTTPS URL of the Git repo ArgoCD watches."
  type        = string
}

variable "gitops_revision" {
  description = "Branch/tag ArgoCD tracks."
  type        = string
  default     = "main"
}

variable "schedule" {
  description = "Stop the instance every night and start it every morning (saves roughly a third of the EC2 cost)."
  type = object({
    enabled    = optional(bool, true)
    timezone   = optional(string, "Asia/Manila")
    stop_cron  = optional(string, "cron(0 23 * * ? *)")
    start_cron = optional(string, "cron(0 7 * * ? *)")
  })
  default = {}
}
