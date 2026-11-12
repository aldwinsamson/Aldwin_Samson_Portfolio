variable "aws_site_enabled" {
  type        = bool
  default     = true
}

variable "hosting" {
  type = object({
    target = optional(string, "aws")
    vercel = optional(object({
      ipv4 = optional(list(string), ["76.76.21.21"])
      ttl  = optional(number, 60)
    }), {})
  })
  default = {}

  validation {
    condition     = contains(["aws", "vercel"], var.hosting.target)
    error_message = "hosting.target must be \"aws\" or \"vercel\"."
  }
}

output "hosting_target" {
  description = "Where the domain currently points: aws or vercel."
  value       = var.hosting.target
}

moved {
  from = module.static_site
  to   = module.static_site[0]
}

moved {
  from = module.monitoring
  to   = module.monitoring[0]
}

moved {
  from = module.site_deploy_role
  to   = module.site_deploy_role[0]
}
