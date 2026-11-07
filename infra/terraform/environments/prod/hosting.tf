# Where aldwinsamson.com is served from: AWS (this stack) or Vercel. See docs/switch-hosting.md.

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
