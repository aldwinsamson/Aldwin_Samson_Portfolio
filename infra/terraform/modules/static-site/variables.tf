variable "context" {
  description = "Shared naming/tagging context built once per environment (see environments/*/locals.tf)."
  type = object({
    project     = string
    environment = string
    region      = string
    prefix      = string
    tags        = map(string)
  })
}

variable "domain_name" {
  description = "Apex domain served by this site, e.g. example.com"
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone ID for domain_name"
  type        = string
}

variable "include_www" {
  description = "Also serve www.<domain> (it 301-redirects to the apex)."
  type        = bool
  default     = true
}

variable "price_class" {
  description = "PriceClass_All makes every edge location eligible (including Manila). At small-site traffic the cost is covered by the always-free allowance."
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "csp" {
  description = <<-EOT
    Content-Security-Policy. mode = "report-only" sends Content-Security-Policy-Report-Only (nothing is blocked;
    check the browser console); "enforce" sends the blocking header. The *_hosts lists are the extra https origins
    the site loads from (the module itself only ever allows 'self').
  EOT
  type = object({
    mode          = optional(string, "report-only")
    style_hosts   = optional(list(string), [])
    font_hosts    = optional(list(string), [])
    img_hosts     = optional(list(string), [])
    connect_hosts = optional(list(string), [])
  })
  default = {}

  validation {
    condition     = contains(["report-only", "enforce"], var.csp.mode)
    error_message = "csp.mode must be \"report-only\" or \"enforce\"."
  }
}

variable "hsts" {
  description = "Strict-Transport-Security. Only enable `preload` once every subdomain will stay HTTPS-only forever."
  type = object({
    max_age_seconds    = optional(number, 63072000)
    include_subdomains = optional(bool, true)
    preload            = optional(bool, false)
  })
  default = {}
}

variable "permissions_policy" {
  type    = string
  default = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()"
}
