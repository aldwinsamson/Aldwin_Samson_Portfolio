variable "name_prefix" {
  description = "Name used for the Lambda function, API and IAM role."
  type        = string
  default     = "portfolio-chat"
}

variable "source_dir" {
  description = "Path to the server/chat folder of the repo (it must contain lambda.mjs, core.mjs and knowledge.generated.txt)."
  type        = string
}

variable "allowed_origins" {
  description = "Sites allowed to call the API from a browser. Add http://localhost:5173 only while testing locally."
  type        = list(string)
  default     = ["https://aldwinsamson.com", "https://www.aldwinsamson.com"]
}

variable "ssm_parameter_name" {
  description = "Name of the SecureString parameter that holds the Anthropic API key. Create it with the AWS CLI; Terraform never sees the key."
  type        = string
  default     = "/portfolio/chat/anthropic-api-key"
}

variable "model" {
  description = "Claude model id used for answers."
  type        = string
  default     = "claude-haiku-5-5"
}

variable "throttle_rate_limit" {
  description = "Average requests per second the whole API accepts (a cost guard). Extra requests get HTTP 429."
  type        = number
  default     = 2
}

variable "throttle_burst_limit" {
  description = "Short burst allowed above the rate limit."
  type        = number
  default     = 5
}

variable "memory_size" {
  description = "Lambda memory in MB."
  type        = number
  default     = 256
}

variable "timeout" {
  description = "Lambda timeout in seconds (the model call itself times out at 18 s)."
  type        = number
  default     = 25
}

variable "log_retention_days" {
  description = "How long CloudWatch keeps the function logs. The logs hold no message text."
  type        = number
  default     = 14
}

variable "alarm_topic_arn" {
  description = "Optional SNS topic ARN. When set, an alarm sends a message if the function is invoked more than daily_invocation_alarm times in a day."
  type        = string
  default     = null
}

variable "daily_invocation_alarm" {
  description = "Invocations per day that trigger the alarm."
  type        = number
  default     = 500
}

variable "tags" {
  description = "Tags added to every resource."
  type        = map(string)
  default     = {}
}
