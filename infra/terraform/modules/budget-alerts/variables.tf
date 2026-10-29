variable "name" {
  type = string
}

variable "limit_usd" {
  type = number
}

variable "emails" {
  type = list(string)
}

variable "notifications" {
  description = "Alert thresholds in percent of the limit. type = ACTUAL (spent so far) or FORECASTED."
  type = list(object({
    threshold = number
    type      = string
  }))
  default = [
    { threshold = 50, type = "ACTUAL" },
    { threshold = 80, type = "ACTUAL" },
    { threshold = 100, type = "FORECASTED" },
  ]
}

variable "include_credit" {
  description = "false = credits are NOT netted off, so the budget tracks real usage (how fast free credit is consumed)."
  type        = bool
  default     = false
}
