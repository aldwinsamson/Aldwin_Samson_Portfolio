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

variable "source_dir" {
  description = "Absolute path to the repo's server/chat folder (it must contain lambda.mjs, core.mjs and knowledge.generated.txt)."
  type        = string
}

variable "allowed_origins" {
  description = "Sites allowed to call the API from a browser (CORS)."
  type        = list(string)
}

variable "ssm_parameter_name" {
  description = "SecureString parameter holding the Anthropic API key. null = /<project>/<environment>/chat/anthropic-api-key. Create it with the AWS CLI; Terraform never sees the key."
  type        = string
  default     = null
}

variable "model" {
  description = "Claude model id used for answers."
  type        = string
  default     = "claude-haiku-5-5"
}

variable "throttle_rate_limit" {
  description = "Average requests per second the WHOLE API accepts (a cost guard, not per visitor). Extra requests get HTTP 429."
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
  description = "Lambda timeout in seconds (the model call itself times out at 18 s)."
  type        = number
  default     = 25
}

variable "log_retention_days" {
  description = "How long CloudWatch keeps the function logs. They hold sizes and timings only, never message text."
  type        = number
  default     = 14
}

variable "alarm_topic_arn" {
  description = <<-EOT
    Optional SNS topic ARN for an invocation alarm. It must be in the SAME region as this module (ap-southeast-1).
    The shared alerts topic of this repo is in us-east-1, so do not pass that one unless you have confirmed cross-region alarm actions work.
  EOT
  type        = string
  default     = null
}

variable "daily_invocation_alarm" {
  type    = number
  default = 500
}
