variable "name" {
  description = "IAM role name."
  type        = string
}

variable "description" {
  type    = string
  default = "Assumed by GitHub Actions through OIDC"
}

variable "oidc_provider_arn" {
  description = "ARN of the token.actions.githubusercontent.com OIDC provider."
  type        = string
}

variable "subjects" {
  type        = list(string)

  validation {
    condition     = length(var.subjects) > 0 && alltrue([for s in var.subjects : startswith(s, "repo:")])
    error_message = "subjects must be a non-empty list of values starting with \"repo:\"."
  }
}

variable "managed_policy_arns" {
  type    = list(string)
  default = []
}

variable "inline_policy_json" {
  type        = string
  default     = null
}

variable "max_session_duration" {
  type    = number
  default = 3600
}
