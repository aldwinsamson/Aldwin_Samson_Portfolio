variable "aws_site_enabled" {
  description = <<-EOT
    Master switch for the AWS copy of the website: S3 bucket, CloudFront, ACM certificate, the DNS records for them,
    monitoring (health check, alarms, dashboard) and the GitHub deploy role. true = deployed (dormant while hosting.target =
    "vercel"). false = all of it is destroyed and AWS costs nothing for the website. See docs/zero-cost-aws.md.
  EOT
  type        = bool
  default     = true
}

variable "hosting" {
  description = <<-EOT
    Where aldwinsamson.com is served from. target = "aws" (S3 + CloudFront, this stack) or "vercel".
    With "vercel" the AWS website stays deployed but dormant, and Route 53 serves plain A records to Vercel.
    Copy vercel.ipv4 exactly from Vercel > Project > Settings > Domains (it can change).
  EOT
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
