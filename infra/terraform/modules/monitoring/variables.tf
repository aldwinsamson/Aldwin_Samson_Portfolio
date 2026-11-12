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
  type = string
}

variable "distribution_id" {
  description = "CloudFront distribution to watch."
  type        = string
}

variable "alert_email" {
  type        = string
}

variable "health_check" {
  type = object({
    enabled           = optional(bool, true)
    path              = optional(string, "/")
    interval_seconds  = optional(number, 30)
    failure_threshold = optional(number, 3)
    regions           = optional(list(string), ["us-east-1", "us-west-1", "eu-west-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1"])
  })
  default = {}
}

variable "error_rate_5xx_threshold_percent" {
  description = "Alarm when more than this percentage of CloudFront responses are 5xx."
  type        = number
  default     = 5
}
