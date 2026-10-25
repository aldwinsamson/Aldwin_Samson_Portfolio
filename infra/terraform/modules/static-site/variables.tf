variable "project" {
  type = string
}

variable "domain_name" {
  description = "Apex domain, e.g. aldwinsamson.com"
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
  description = "PriceClass_All guarantees every edge location (incl. Manila) is eligible. At portfolio traffic the cost is covered by the always-free tier."
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "csp_mode" {
  description = "report-only: send Content-Security-Policy-Report-Only (nothing is blocked; check the browser console). enforce: send the blocking Content-Security-Policy header."
  type        = string
  default     = "report-only"

  validation {
    condition     = contains(["report-only", "enforce"], var.csp_mode)
    error_message = "csp_mode must be \"report-only\" or \"enforce\"."
  }
}

variable "csp_img_hosts" {
  description = "Extra https image hosts allowed by the CSP (the project catalogue uses Pexels stock images)."
  type        = list(string)
  default     = ["https://images.pexels.com"]
}

variable "hsts_preload" {
  description = "Add the HSTS `preload` directive. Only enable once you are sure every subdomain will stay HTTPS-only forever."
  type        = bool
  default     = false
}
