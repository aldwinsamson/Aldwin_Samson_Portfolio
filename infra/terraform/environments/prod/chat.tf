# Chat API for the portfolio assistant. Drop this file next to your other prod *.tf files.
# Before `terraform apply`, create the Anthropic key in SSM (see README-CHANGES.md, step 7).
#
# Check the path below: it must point to the server/chat folder at the repo root.
# From infra/terraform/environments/prod that is four levels up.

module "chat_api" {
  source     = "../../modules/chat-api"
  source_dir = "${path.root}/../../../../server/chat"

  allowed_origins = ["https://aldwinsamson.com", "https://www.aldwinsamson.com"]

  # If you already have an SNS topic for alerts, uncomment this to be warned about unusual traffic:
  # alarm_topic_arn = aws_sns_topic.alerts.arn

  tags = {
    Project   = "portfolio"
    Component = "chat-api"
  }
}

output "chat_api_url" {
  description = "Put this in .env.production as VITE_CHAT_API_URL."
  value       = module.chat_api.chat_api_url
}
