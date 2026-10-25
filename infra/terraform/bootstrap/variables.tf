variable "project" {
  description = "Short prefix used in resource names (letters, digits, hyphens)."
  type        = string
  default     = "aldwinsamson"
}

variable "region" {
  description = "Primary AWS region. ap-southeast-1 (Singapore) is the closest full region to the Philippines."
  type        = string
  default     = "ap-southeast-1"
}

variable "domain_name" {
  description = "Apex domain registered at your registrar. A Route 53 hosted zone is created for it."
  type        = string
  default     = "aldwinsamson.com"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the CI roles, as OWNER/REPO (case-sensitive)."
  type        = string
  default     = "aldwinsamson/Aldwin_Samson_Portfolio"
}

variable "alert_email" {
  description = "Email that receives AWS Budgets alerts."
  type        = string
  default     = "aldwinsamsonn@gmail.com"
}

variable "monthly_budget_usd" {
  description = "Monthly gross-usage budget (credits are NOT netted off, so this tracks how fast credit is burned)."
  type        = number
  default     = 30
}
