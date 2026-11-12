variable "context" {
  type = object({
    project     = string
    environment = string
    region      = string
    prefix      = string
    tags        = map(string)
  })
}

variable "source_dir" {
  type        = string
}

variable "allowed_origins" {
  type        = list(string)
}

variable "ssm_parameter_name" {
  type        = string
  default     = null
}

variable "model" {
  type        = string
  default     = "claude-haiku-5-5"
}

variable "throttle_rate_limit" {
  type        = number
  default     = 2
}

variable "throttle_burst_limit" {
  description = "Short burst allowed above the rate limit."
  type        = number
  default     = 5
}

variable "memory_size" {
  type    = number
  default = 256
}

variable "timeout" {
  type        = number
  default     = 25
}

variable "log_retention_days" {
  type        = number
  default     = 14
}

variable "alarm_topic_arn" {
  type        = string
  default     = null
}

variable "daily_invocation_alarm" {
  type    = number
  default = 500
}
