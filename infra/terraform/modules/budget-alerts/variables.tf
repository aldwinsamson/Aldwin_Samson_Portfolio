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
  type        = bool
  default     = false
}
