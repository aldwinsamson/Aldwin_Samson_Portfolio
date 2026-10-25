variable "project" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "distribution_id" {
  description = "CloudFront distribution to watch."
  type        = string
}

variable "alert_email" {
  description = "Receives alarm notifications (you must click the confirmation link AWS emails you)."
  type        = string
}

variable "enable_health_check" {
  description = "Route 53 HTTPS health check from several regions (~US$1.75/month incl. HTTPS option)."
  type        = bool
  default     = true
}
