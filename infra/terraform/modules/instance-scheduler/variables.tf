variable "name_prefix" {
  description = "Prefix for the IAM role and schedule names."
  type        = string
}

variable "instance_ids" {
  description = "EC2 instances to stop and start on a schedule."
  type        = list(string)
}

variable "timezone" {
  type    = string
  default = "UTC"
}

variable "stop_cron" {
  description = "EventBridge Scheduler cron expression, evaluated in `timezone`."
  type        = string
  default     = "cron(0 23 * * ? *)"
}

variable "start_cron" {
  type    = string
  default = "cron(0 7 * * ? *)"
}
