variable "context" {
  type = object({
    project     = string
    environment = string
    region      = string
    prefix      = string
    tags        = map(string)
  })
}

variable "domain_name" {
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone ID for domain_name"
  type        = string
}

variable "include_www" {
  type        = bool
  default     = true
}

variable "price_class" {
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "csp" {
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
  default = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), interest-cohort=()"
}

variable "dns_target" {
  type        = string
  default     = "aws"

  validation {
    condition     = contains(["aws", "external"], var.dns_target)
    error_message = "dns_target must be \"aws\" or \"external\"."
  }
}

variable "external_ipv4" {
  type        = list(string)
  default     = ["76.76.21.21"]
}

variable "external_ttl" {
  description = "TTL in seconds for the external A records. Keep it low (60) so switching back is fast."
  type        = number
  default     = 60
}
