# Optional AWS chat backend (Lambda + API Gateway) for the portfolio assistant.
#
# OFF by default: while the site runs on Vercel, Vercel's own function (api/chat.mjs) answers /api/chat.
# Turn it on only when the site is served from AWS and you want the AI assistant there too:
#   1. aws ssm put-parameter --region ap-southeast-1 --name /aldwinsamson/prod/chat/anthropic-api-key --type SecureString --value "sk-ant-..."
#   2. set  chat = { enabled = true }  in prod.tfvars and apply
#   3. add the origin from `terraform output chat_api_origin` to site.csp.connect_hosts and apply again
#   4. build the AWS site with VITE_CHAT_API_URL=<chat_api_url> (the manual Deploy site workflow reads the repo variable CHAT_API_URL)

variable "chat" {
  description = "Optional AWS chat backend. Off by default."
  type = object({
    enabled              = optional(bool, false)
    model                = optional(string, "claude-haiku-5-5")
    throttle_rate_limit  = optional(number, 2)
    throttle_burst_limit = optional(number, 5)
    alarm_topic_arn      = optional(string) # must be an SNS topic in the SAME region as the Lambda
  })
  default = {}
}

module "chat_api" {
  count  = var.chat.enabled ? 1 : 0
  source = "../../modules/chat-api"

  context         = local.context
  source_dir      = abspath("${path.module}/../../../../server/chat")
  allowed_origins = concat(["https://${var.domain_name}"], var.site.include_www ? ["https://www.${var.domain_name}"] : [])

  model                = var.chat.model
  throttle_rate_limit  = var.chat.throttle_rate_limit
  throttle_burst_limit = var.chat.throttle_burst_limit
  alarm_topic_arn      = var.chat.alarm_topic_arn
}

output "chat_api_url" {
  description = "Value for VITE_CHAT_API_URL in the AWS build (null while chat.enabled = false)."
  value       = var.chat.enabled ? module.chat_api[0].chat_api_url : null
}

output "chat_api_origin" {
  description = "Add to site.csp.connect_hosts when the AWS site calls the chat API cross-origin."
  value       = var.chat.enabled ? module.chat_api[0].chat_api_origin : null
}
